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
            type: DataTypes.INTEGER,
        },
        emailVerify: {
            type: DataTypes.BOOLEAN,
        },
        mobileVerify: {
            type: DataTypes.BOOLEAN,
        }
    });
     
    User.associate = function(models) {
        User.hasMany(models.website);
        models.website.belongsTo(models.user);
        User.hasMany(models.app);
        models.app.belongsTo(models.user);
        User.hasMany(models.service);
        models.service.belongsTo(models.user);
        User.hasMany(models.component);
        models.component.belongsTo(models.user);
        User.hasMany(models.credit_transaction);
        models.credit_transaction.belongsTo(models.user);
    };

    return User;
};

module.exports = User;