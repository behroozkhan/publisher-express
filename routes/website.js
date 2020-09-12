let Response = require('../utils/response');
let {sequelize, findAndCountAll, models} = require('../model-manager/models');
let PublisherUtils = require('../utils/publisherUtils');

let express = require('express');
let router = express.Router();
let moment = require('moment');

router.get('/', async (req, res) => {
    // return all user websites
    findAndCountAll(req, res, models.Website);
})

router.post('/longprocess', async (req, res) => {
    // user request editor for an app, service, component or website
    // create an editor in editor server and return url to user
    let {id} = req.body;

    let result = await PublisherUtils.callWeblancer(`/long-process/${id}`, undefined, 'get');

    if (!result.success){
        res.status(500).json(
            result
        );
        return;
    }

    res.json(
        result
    );
})

router.get('/:id', async (req, res) => {
    // return website by id
    let id = req.params.id;
    models.Website.findOne({
        where: {
           id: id
        }
    }).then(function(website) {
        if (!website) {
            res.status(410).json(
                new Response(false, {}, 
                    "Website not found"
                ).json()
            );
            return;
        }

        res.json(
            new Response(true, {
                website
            }).json()
        );
    }).catch(error => {
        res.status(500).json(
            new Response(false, {}, error.message).json()
        );
    });
})

router.post('/', async (req, res) => {
    // create new website
    let name = req.body.name;
    let metadata = req.body.metadata || {};
    let description = req.body.description || "";
    let planId = req.body.planId;
    let planTime = req.body.planTime || 'monthly';
    let userId = req.user.id;

    if (!await PublisherUtils.isSiteNameUnique(name, userId)) {
        res.status(409).json(
            new Response(false, {}, "Name is in use").json()
        );
    }

    let plan;
    try {
        if (planId) {
            plan = await models.Plan.findOne({
                where: {
                    id: planId
                }
            });
        } else {
            plan = (await models.Plan.findAll({
                where: {
                    hasTrial: true,
                },
                order: [
                    ['priceMonthly', 'ASC']
                ],
                limit: 1
            }))[0];
        }

        if (!plan) {
            let configResult = await PublisherUtils.getWeblancerConfig("TrialPlan");
            if (!configResult || !configResult.success) {
                throw new Error("Can't fetch trial plan");
            }

            plan = configResult.data.configValue;
            plan = await models.Plan.create(plan);
        }
    } catch (error) {
        console.log("/website/ error 1", error);
        res.status(500).json(
            new Response(false, {error}, "Server error").json()
        );
        return;
    }

    let user;
    try {
        user = await models.User.findOne({
            where: {
                id: userId
            }
        });

        if (!user) {
            res.status(404).json(
                new Response(false, {}, "User not found").json()
            );
            return;
        }
    } catch (error) {
        console.log("/website/ error 2", error);
        res.status(500).json(
            new Response(false, {error}, "Server error").json()
        );
        return;
    }

    let planPrice = 0;
    if (!plan.hasTrial) {
        // user must have credit for geting this website plan
        let {success, price} = PublisherUtils.getCreditForPlan(user, plan, planTime);
        if (!success) {
            res.status(402).json(
                new Response(false, {}, "Not enough credit").json()
            );
            return;
        }

        planPrice = price;
    }

    let transaction;
    try {
        // get transaction
        transaction = await sequelize.transaction();
        
        let totalPriceOfPlan = plan.hasTrial ? 0 :
            PublisherUtils.getPlanPriceFromProduct(plan.productsDetail, planTime);
        let totalPayForPlan = planPrice;
    
        let website = await models.Website.create({
            name,
            displayName: name,
            metadata,
            description,
            totalPayment: totalPayForPlan,
            totalPrice: totalPriceOfPlan
        }, {
            transaction
        });

        await user.addWebsite(website, {transaction});
        await user.save({ fields: ['credit'], transaction });

        let boughtDate = moment.utc();
        let expireDate;
        if (plan.hasTrial)
            expireDate = moment.utc().add(plan.trialDuration, 'd');
        else if (planTime === 'monthly')
            expireDate = moment.utc().add(1, 'M');
        else
            expireDate = moment.utc().add(1, 'y');

        console.log("plan.trialDuration", plan.trialDuration, expireDate);

        await website.addPlan(plan, {through: {
            boughtDate ,startDate: boughtDate , expireDate, totalPriceOfPlan, totalPayForPlan
        }, transaction});

        let websitePlan = await website.getWebsite_plans({
            where: {
                planId: plan.id
            },
            transaction
        });

        let weblancerResponse = await PublisherUtils.createOrUpgradeWebsiteInWeblancer(
            {...website.toJSON(), userId: user.id}, 
            plan.toJSON(), 
            {...websitePlan[0].toJSON()}, 
            "website"
        );

        if (weblancerResponse.success) {
            await transaction.commit();

            res.json(
                new Response(true, {}).json()
            );
        } else {
            throw Error (`Can't commit transaction`);
        }
    } catch (error) {
        console.log("/website/ error 3", error);
        // Rollback transaction only if the transaction object is defined
        if (transaction) await transaction.rollback();
        
        // if(error instanceof UniqueConstraintError){
        //     res.status(201).json(
        //         new Response(true, {}).json()
        //     );
        // }
        // else{
            res.status(500).json(
                new Response(false, {error}, error.message).json()
            );
        // }
    }
})

router.put('/', async (req, res) => {
    // update website
    let id = req.params.id;

    let website;
    try {
        website = await models.Website.find({
            where: {
                id: id
            }
        });
    } catch {
        res.status(404).json(
            new Response(false, {}, "User not found").json()
        );
        return;
    }

    let name = req.body.name || website.name;
    let description = req.body.description || website.description;

    website.update({
        name,
        description
    })
    .success(result => {
        res.json(
            new Response(true, website).json()
        );
    })
})

router.delete('/', async (req, res) => {
    // delete website
    // TODO comming soon
})

router.post('/plan/:id', async (req, res) => {
    // user whant to buy a plan
    let websiteId = req.body.websiteId;
    let planId = req.params.id;

    let user;
    try {
        user = await models.User.find({
            where: {
                id: req.user.id
            },
            include: [models.CreditTransaction]
        });
    } catch {
        res.status(404).json(
            new Response(false, {}, "User not found").json()
        );
        return;
    }

    let website;
    try {
        website = await models.Website.find({
            where: {
                id: websiteId
            },
            include: [{model: models.WebsitePlan, include: [models.Plan] }]
        });
    } catch {
        res.status(404).json(
            new Response(false, {}, "Website not found").json()
        );
        return;
    }

    let plan;
    try {
        plan = await models.Plan.find({
            where: {
                id: planId
            }
        });
    } catch {
        res.status(404).json(
            new Response(false, {}, "Plan not found").json()
        );
        return;
    }

    if (website.websitePlan.plan.order > plan.order) {
        res.status(403).json(
            new Response(false, {}, "Can't downgrade plan").json()
        );
        return;
    }

    let backMoney = PublisherUtils.getBackMoney(website.websitePlan);

    let planType = req.body.planType;

    let totalPriceOfPlan = (planType === 'monthly' ? 
                        plan.priceMonthly :
                        plan.priceMonthly * 12);

    let creditNeed = (planType === 'monthly' ? 
                        plan.offPriceMonthly || plan.priceMonthly :
                        plan.offpriceYearly || plan.priceYearly) - backMoney;

    // TODO Apply copouns

    if (user.credit - creditNeed < 0) {
        res.status(402).json(
            new Response(false, {
                creditNeed: creditNeed - user.credit
            }, "Not enough credit").json()
        );
        return;
    }

    user.credit -= creditNeed;

    let boughtDate = moment.utc();
    let expireDate = planType === 'monthly' ?
                        moment.utc().add(1, 'M') :
                        moment.utc().add(1, 'y') ;
    let totalPayForPlan = creditNeed + backMoney;

    let transaction;

    try {
        // get transaction
        transaction = await sequelize.transaction();

        let websitePlan = await models.WebsitePlan.create({
            boughtDate, expireDate, totalPriceOfPlan, totalPayForPlan, plan
        },{
            include: [models.Plan],
            transaction
        });

        let creditTransaction = await models.CreditTransaction.create({
            amount: creditNeed,
            useType: 'plan',
            description: {planName: plan.name, websiteId: websiteId}
        }, {transaction});

        user.creditTransactions.push(creditTransaction);

        if (website.websitePlan && website.websitePlan.expireTime > moment.utc()) 
        {
            website.websitePlan.upgradedToUpperPlan = true;
            website.websitePlan.expireTime = moment.utc();
            await website.websitePlan.save({ fields: ['upgradedToUpperPlan', 'expireTime'], transaction});
        }

        website.websitePlan = websitePlan;
        await website.save({ fields: ['websitePlan'], transaction});
        await user.save({ fields: ['credit', 'creditTransaction'], transaction});

        await transaction.commit();

        let weblancerResponse = await PublisherUtils.createOrUpgradeWebsiteInWeblancer(
            user.id, website.id, plan.weblancerResourceId, plan.weblancerPermissionsId,
            planType, plan.order, null
        );

        if (weblancerResponse.success) {
            res.json(
                new Response(true, {
                    newCredit: user.credit,
                    newWebsitePlan: websitePlan
                }).json()
            );
        } else {
            throw Error (`Can't upgrade website for weblancer server`);
        }
    } catch (error) {
        // Rollback transaction only if the transaction object is defined
        if (transaction) await transaction.rollback();
        
        res.status(500).json(
            new Response(false, {}, error.message).json()
        );
    }
})

router.post('/publish', async (req, res) => {
    // publish request for a website
})

router.put('/acl/:id', async (req, res) => {
    // change access controll of website
})

router.post('/editor', async (req, res) => {
    // user request editor for an app, service, component or website
    // create an editor in editor server and return url to user

    // TODO 1. request weblancer express for an editor for a website with this inputs:ww
    // TODO    {websiteMetaData, planProductDetails & planAddedProductDetails, }
    // TODO 2. weblancer express request an editor to editor server
    // TODO 3. editor server prepare an editor react client, npm install & build it for requested 
    // TODO    products like additional apps and components.
    // TODO 4. finaly editor server create an access token for publisher and one for user & create end
    // TODO    url & send it to weblancer express to update long-process metadata
    // TODO 5. user frequently check for long=process and when access token be ready, show editor url
    // TODO 6. publisher express save long-process as an cached editor in database to use later when
    // TODO    user request it in another session
    // TODO 7. editors remain for some minutes or hours and publisher express should check it when
    // TODO    user requet the editor

    let {websiteId} = req.body;

    let result = await PublisherUtils.callWeblancer('/editor/request', {websiteId}, 'post');

    if (!result.success){
        res.status(500).json(
            result
        );
        return;
    }

    res.json(
        result
    );
})

router.post('/delete-editor', async (req, res) => {
    let {longProcessId} = req.body;

    let result = await PublisherUtils.callWeblancer(`/long-process/delete`, {longProcessId}, 'post');

    if (!result.success){
        res.status(500).json(
            result
        );
        return;
    }

    res.json(
        result
    );
})

module.exports = router;