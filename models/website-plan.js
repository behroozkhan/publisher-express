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
        planTime: {
            type:   DataTypes.ENUM,
            values: ['trial', 'monthly', 'yearly'],
            defaultValue: 'trial'
        },
        totalPayForPlan: {
            type: DataTypes.FLOAT,
        },
        addedProducts: {
            type: DataTypes.JSON,
        },
        addedPrice: {
            type: DataTypes.FLOAT,
        }
    });
     
    WebsitePlan.associate = function(models) {
        models.website.belongsToMany(models.plan, { through: models.website_plan });
        models.plan.belongsToMany(models.website, { as:'plans', through: models.website_plan });

        models.website.hasMany(models.website_plan);
        models.website_plan.belongsTo(models.website);

        models.plan.hasMany(models.website_plan);
        models.website_plan.belongsTo(models.plan);
    };

    return WebsitePlan;
};

module.exports = WebsitePlan;