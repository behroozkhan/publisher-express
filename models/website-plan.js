const WebsitePlan = (sequelize, DataTypes) => {
    const WebsitePlan = sequelize.define('website_plan', {
        boughtDate: {
            type: DataTypes.DATE,
        },
        expireTime: {
            type: DataTypes.DATE,
        },
        totalPriceOfPlan: {
            type: DataTypes.FLOAT,
        },
        totalPayForPlan: {
            type: DataTypes.FLOAT,
        },
        upgradedToUpperPlan: {
            type: DataTypes.BOOLEAN,
        },
        extended: {
            type: DataTypes.BOOLEAN,
        },
    });
     
    WebsitePlan.associate = function(models) {
        models.website.belongsToMany(models.plan, { as:'plans', through: models.website_plan });
        models.plan.belongsToMany(models.website, { through: models.website_plan });
    };

    return WebsitePlan;
};

module.exports = WebsitePlan;