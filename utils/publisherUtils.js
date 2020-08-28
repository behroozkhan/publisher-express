let { getConfig } = require("../models/config");
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

PublisherUtils.isSubDomainUnique = async (subDomain) => {
    if (!subDomain)
        return true;
    
    try {
        let count = await models.Website.count({ where: { subDomain: subDomain.toLowerCase() } })
        if (count != 0) {
            return false;
        }
        return true;
    } catch (error) {
        console.log("PublisherUtils.isUserNameUnique", error);
        return false;
    }
}

PublisherUtils.createOrUpgradeWebsiteInWeblancer = async (endUserId, endWebsiteId,
    resourcePlanId, permissionPlansId, planType, planOrder, metaData) => {

    let weblancerWebsiteCreateUrl = (await getConfig("WeblancerWebsiteCreateUrl")).value;

    return axios.post(`${weblancerWebsiteCreateUrl}`, {
        endUserId, endWebsiteId, resourcePlanId, permissionPlansId, planType, planOrder, metaData
    })
    .then(function (response) {
        res.json(
            response.data
        );
    })
    .catch(function (error) {
        res.status(500).json(
            error.response.data
        );
    });
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
        let response = await axios.post(`${url}/config/getbykey`, {key}, {
            headers: {
                "publisher_id": id,
                "publisher_password": password,
            }
        });

        return response.data;
    } catch (error) {
        return error.response.data;
    }
}

module.exports = PublisherUtils;