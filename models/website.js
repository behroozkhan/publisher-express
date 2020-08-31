const Website = (sequelize, DataTypes) => {
    const Website = sequelize.define('website', {
        id: {
            type: DataTypes.BIGINT,
            unique: true,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING
        },
        displayName: {
            type: DataTypes.STRING
        },
        description: {
            type: DataTypes.STRING
        },
        serverIpAddress: {
            type: DataTypes.STRING
        },
        url: {
            type: DataTypes.STRING
        },
        metadata: {
            type: DataTypes.JSON
        },
        totalPrice: {
            type: DataTypes.FLOAT,
        },
        totalPayment: {
            type: DataTypes.FLOAT,
        }
    }, {
        indexes: [
            {
                unique: true,
                fields: ['name', 'userId']
            }
        ]
    });
    
    return Website;
};

module.exports = Website;