const User = (sequelize, DataTypes) => {
    const User = sequelize.define('user', {
        id: {
            type: DataTypes.BIGINT,
            unique: true,
            autoIncrement: true,
            primaryKey: true
        },
        username: {
            type: DataTypes.STRING,
            unique: true,
        },
        firstName: {
            type: DataTypes.STRING,
        },
        lastName: {
            type: DataTypes.STRING,
        },
        role: {
            type:   DataTypes.ENUM,
            values: ['weblancer', 'publisher', 'admin', 'user'],
            defaultValue: 'user'
        },
        nationalCode: {
            type: DataTypes.STRING,
        },
        mobile: {
            type: DataTypes.STRING,
        },
        email: {
            type: DataTypes.STRING,
        },
        password: {
            type: DataTypes.STRING,
        },
        credit: {
            type: DataTypes.FLOAT,
        },
        minCredit: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        emailVerify: {
            type: DataTypes.BOOLEAN,
        },
        mobileVerify: {
            type: DataTypes.BOOLEAN,
        }
    });
     
    User.associate = function(models) {
        models.user.hasMany(models.website);
        models.website.belongsTo(models.user);
        models.user.hasMany(models.app);
        models.app.belongsTo(models.user);
        models.user.hasMany(models.service);
        models.service.belongsTo(models.user);
        models.user.hasMany(models.component);
        models.component.belongsTo(models.user);
        models.user.hasMany(models.credit_transaction);
        models.credit_transaction.belongsTo(models.user);
    };

    return User;
};

module.exports = User;