let { getConfig } = require("../model-manager/models");
let {models} = require('../model-manager/models');
const axios = require('axios');

let PublisherUtils = {};

PublisherUtils.getBackMoney = (oldPlan) => {
    if (!oldPlan)
        return 0;
        
    let totalDays =  moment.utc(oldPlan.boughtDate).diff(moment.utc(oldPlan.expireTime), 'days');
    let remainDays = moment.utc().diff(moment.utc(oldPlan.expireTime), 'days');

    if (remainDays < 0) remainDays = 0;
    
    let usingDays = totalDays - remainDays;

    let usingMoney = (usingDays / totalDays) * oldPlan.totalPriceOfPlan;
    let backMoney = oldPlan.totalPayForPlan - usingMoney;

    return Math.max(0, backMoney);
}

PublisherUtils.getSecureUser = (dbUser) => {
    return {
        id: dbUser.id,
        username: dbUser.username,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        role: dbUser.role,
        nationalCode: dbUser.nationalCode,
        mobile: dbUser.mobile,
        email: dbUser.email,
        credit: dbUser.credit,
        minCredit: dbUser.minCredit,
        emailVerify: dbUser.emailVerify,
        mobileVerify: dbUser.mobileVerify
    }
}

PublisherUtils.getCreditForPlan = (user, plan, planTime) => {
    let price = planTime === 'monthly' ? (plan.offPriceMonthly || plan.priceMonthly) :
        (plan.offpriceYearly || plan.priceYearly);

    if (user.credit - user.minCredit <= price)
        return {success: false};

    user.credit -= price;

    return {success: true, price};
}

PublisherUtils.getPlanPriceFromProduct = (productsDetail, planTime) => {
    if (planTime === 'trial')
        return 0;

    let sum = 0;
    (productsDetail || []).forEach(product => {
        sum += (planTime === 'monthly' ?
            product.priceMonthly :
            product.priceYearly);
    });

    return sum;
}

PublisherUtils.isUserNameUnique = async (username) => {
    try {
        let count = await models.User.count({ where: { username: username.toLowerCase() } });
        if (count != 0) {
            return false;
        }
        return true;
    } catch (error) {
        console.log("PublisherUtils.isUserNameUnique", error);
        return false;
    }
}

PublisherUtils.isSiteNameUnique = async (name, userId) => {
    if (!name)
        return false;
    
    try {
        let count = await models.Website.count({ where: { name, userId } })
        if (count != 0) {
            return false;
        }
        return true;
    } catch (error) {
        console.log("PublisherUtils.isSiteNameUnique", error);
        return false;
    }
}

PublisherUtils.createOrUpgradeWebsiteInWeblancer = async (website, plan, websitePlan, type) => {
    let id = process.env.PUBLISHER_ID;
    let password = process.env.PUBLISHER_PASSWORD;
    let url = process.env.WEBLANCER_EXPRESS_URL;
    
    console.log("websitePlan", websitePlan);
    try {
        let response = await axios.post(`${url}/website/createorupdate`, {
            website, plan, websitePlan, type
        }, { headers: {
            'publisher-id': id,
            'publisher-password': password
        }});

        return response.data;
    } catch (error) {
        console.log("PublisherUtils.createOrUpgradeWebsiteInWeblancer", error);
        return error.response.data;
    }
}

PublisherUtils.checkOwnerShip = (req, res, next) => {
    let serviceId = req.param.id;
    // if user has service id => next(), else => reject()
}

PublisherUtils.getWeblancerConfig = async (key) => {
    let id = process.env.PUBLISHER_ID;
    let password = process.env.PUBLISHER_PASSWORD;
    let url = process.env.WEBLANCER_EXPRESS_URL;
    
    try {
        let response = await axios({
            url: `${url}/config/getbykey`,
            method: 'post',
            data: {key},
            headers: {
                'publisher-id': id,
                'publisher-password': password
            }
        })
        
        return response.data;
    } catch (error) {
        console.log("error", error)
        return error.response.data;
    }
}

PublisherUtils.callWeblancer = async (query, data, method) => {
    let id = process.env.PUBLISHER_ID;
    let password = process.env.PUBLISHER_PASSWORD;
    let url = process.env.WEBLANCER_EXPRESS_URL;
    
    try {
        let response = await axios({
            url: `${url}${query}`,
            method: method,
            data: data,
            headers: {
                'publisher-id': id,
                'publisher-password': password
            }
        })
        
        return response.data;
    } catch (error) {
        console.log("callWeblancer error", error)
        return error.response.data;
    }
}

module.exports = PublisherUtils;