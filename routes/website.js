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

router.get('/:id', async (req, res) => {
    // return website by id
    let id = req.params.id;
    models.Website.find({
        where: {
           id: id
        }
    }).then(function(website) {
        if (!website) {
            res.status(404).json(
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
            console.log("plan", plan);
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
    
        let website = await models.Website.create({
            name,
            metadata,
            description
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
        
        let totalPriceOfPlan = PublisherUtils.getPlanPriceFromProduct(plan.productsDetail, planTime);
        let totalPayForPlan = planPrice;

        await website.addPlan(plan, {through: {
            boughtDate, expireDate, totalPriceOfPlan, totalPayForPlan
        }, transaction});

        let websitePlan = await website.getWebsite_plans({
            where: {
                planId: plan.id
            },
            transaction
        });

        let weblancerResponse = await PublisherUtils.createOrUpgradeWebsiteInWeblancer(
            website.toJSON(), plan.toJSON(), websitePlan[0].toJSON(), "website"
        );

        if (weblancerResponse.success) {
            await transaction.commit();

            res.json(
                new Response(true, {}).json()
            );
        } else {
            throw Error (`Can't add website to weblancer server`);
        }
    } catch (error) {
        console.log("/website/ error 3", error);
        // Rollback transaction only if the transaction object is defined
        if (transaction) await transaction.rollback();
        
        if(error instanceof UniqueConstraintError){
            res.status(201).json(
                new Response(true, {}).json()
            );
        }
        else{
            res.status(500).json(
                new Response(false, {error}, error.message).json()
            );
        }
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
})

module.exports = router;