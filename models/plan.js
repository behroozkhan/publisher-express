const Plan = (sequelize, DataTypes) => {
    const Plan = sequelize.define('plan', {
        id: {
            type: DataTypes.INTEGER,
            unique: true,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            unique: true,
        },
        group: {
            type: DataTypes.STRING,
        },
        hasTrial: {
            type: DataTypes.BOOLEAN,
        },
        trialDuration: {
            type: DataTypes.INTEGER,
        },
        order: {
            type: DataTypes.INTEGER,
        },
        priceMonthly: {
            type: DataTypes.FLOAT,
        },
        priceYearly: {
            type: DataTypes.FLOAT,
        },
        offPriceMonthly: {
            type: DataTypes.FLOAT,
        },
        offpriceYearly: {
            type: DataTypes.FLOAT,
        },
        description: {
            type: DataTypes.JSON,
        },
        summery: {
            type: DataTypes.STRING,
        },
        productsDetail: {
            type: DataTypes.JSON,
        }
    });
     
    return Plan;
};

module.exports = Plan;