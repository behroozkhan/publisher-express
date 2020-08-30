'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "configs", deps: []
 * createTable "users", deps: []
 * createTable "apps", deps: [users]
 * createTable "components", deps: [users]
 * createTable "credit_transactions", deps: [users]
 * createTable "websites", deps: [users]
 * createTable "services", deps: [users]
 * createTable "website_plans", deps: [websites]
 * createTable "plans", deps: [website_plans]
 *
 **/

var info = {
    "revision": 1,
    "name": "init",
    "created": "2020-08-28T17:02:07.287Z",
    "comment": ""
};

var migrationCommands = function(transaction) {
    return [{
            fn: "createTable",
            params: [
                "configs",
                {
                    "id": {
                        "type": Sequelize.INTEGER,
                        "field": "id",
                        "primaryKey": true,
                        "autoIncrement": true,
                        "unique": true
                    },
                    "key": {
                        "type": Sequelize.STRING,
                        "field": "key",
                        "unique": true
                    },
                    "value": {
                        "type": Sequelize.JSON,
                        "field": "value"
                    },
                    "createdAt": {
                        "type": Sequelize.DATE,
                        "field": "createdAt",
                        "allowNull": false
                    },
                    "updatedAt": {
                        "type": Sequelize.DATE,
                        "field": "updatedAt",
                        "allowNull": false
                    }
                },
                {
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "createTable",
            params: [
                "users",
                {
                    "id": {
                        "type": Sequelize.BIGINT,
                        "field": "id",
                        "primaryKey": true,
                        "autoIncrement": true,
                        "unique": true
                    },
                    "username": {
                        "type": Sequelize.STRING,
                        "field": "username",
                        "unique": true
                    },
                    "firstName": {
                        "type": Sequelize.STRING,
                        "field": "firstName"
                    },
                    "lastName": {
                        "type": Sequelize.STRING,
                        "field": "lastName"
                    },
                    "role": {
                        "type": Sequelize.ENUM('weblancer', 'publisher', 'admin', 'user'),
                        "field": "role",
                        "defaultValue": "user"
                    },
                    "nationalCode": {
                        "type": Sequelize.STRING,
                        "field": "nationalCode"
                    },
                    "mobile": {
                        "type": Sequelize.STRING,
                        "field": "mobile"
                    },
                    "email": {
                        "type": Sequelize.STRING,
                        "field": "email"
                    },
                    "password": {
                        "type": Sequelize.STRING,
                        "field": "password"
                    },
                    "credit": {
                        "type": Sequelize.INTEGER,
                        "field": "credit"
                    },
                    "emailVerify": {
                        "type": Sequelize.BOOLEAN,
                        "field": "emailVerify"
                    },
                    "mobileVerify": {
                        "type": Sequelize.BOOLEAN,
                        "field": "mobileVerify"
                    },
                    "createdAt": {
                        "type": Sequelize.DATE,
                        "field": "createdAt",
                        "allowNull": false
                    },
                    "updatedAt": {
                        "type": Sequelize.DATE,
                        "field": "updatedAt",
                        "allowNull": false
                    }
                },
                {
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "createTable",
            params: [
                "apps",
                {
                    "id": {
                        "type": Sequelize.BIGINT,
                        "field": "id",
                        "primaryKey": true,
                        "autoIncrement": true,
                        "unique": true
                    },
                    "name": {
                        "type": Sequelize.STRING,
                        "field": "name"
                    },
                    "serverIpAddress": {
                        "type": Sequelize.STRING,
                        "field": "serverIpAddress"
                    },
                    "url": {
                        "type": Sequelize.STRING,
                        "field": "url"
                    },
                    "metadata": {
                        "type": Sequelize.JSON,
                        "field": "metadata"
                    },
                    "mode": {
                        "type": Sequelize.ENUM('private', 'public'),
                        "field": "mode"
                    },
                    "createdAt": {
                        "type": Sequelize.DATE,
                        "field": "createdAt",
                        "allowNull": false
                    },
                    "updatedAt": {
                        "type": Sequelize.DATE,
                        "field": "updatedAt",
                        "allowNull": false
                    },
                    "userId": {
                        "type": Sequelize.BIGINT,
                        "field": "userId",
                        "onUpdate": "CASCADE",
                        "onDelete": "SET NULL",
                        "references": {
                            "model": "users",
                            "key": "id"
                        },
                        "allowNull": true
                    }
                },
                {
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "createTable",
            params: [
                "components",
                {
                    "id": {
                        "type": Sequelize.BIGINT,
                        "field": "id",
                        "primaryKey": true,
                        "autoIncrement": true,
                        "unique": true
                    },
                    "name": {
                        "type": Sequelize.STRING,
                        "field": "name"
                    },
                    "url": {
                        "type": Sequelize.STRING,
                        "field": "url"
                    },
                    "metadata": {
                        "type": Sequelize.JSON,
                        "field": "metadata"
                    },
                    "mode": {
                        "type": Sequelize.ENUM('private', 'public'),
                        "field": "mode"
                    },
                    "createdAt": {
                        "type": Sequelize.DATE,
                        "field": "createdAt",
                        "allowNull": false
                    },
                    "updatedAt": {
                        "type": Sequelize.DATE,
                        "field": "updatedAt",
                        "allowNull": false
                    },
                    "userId": {
                        "type": Sequelize.BIGINT,
                        "field": "userId",
                        "onUpdate": "CASCADE",
                        "onDelete": "SET NULL",
                        "references": {
                            "model": "users",
                            "key": "id"
                        },
                        "allowNull": true
                    }
                },
                {
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "createTable",
            params: [
                "credit_transactions",
                {
                    "id": {
                        "type": Sequelize.BIGINT,
                        "field": "id",
                        "primaryKey": true,
                        "autoIncrement": true,
                        "unique": true
                    },
                    "amount": {
                        "type": Sequelize.FLOAT,
                        "field": "amount"
                    },
                    "useType": {
                        "type": Sequelize.ENUM('plan', 'payment', 'other'),
                        "field": "useType"
                    },
                    "resNum": {
                        "type": Sequelize.STRING,
                        "field": "resNum"
                    },
                    "description": {
                        "type": Sequelize.JSON,
                        "field": "description"
                    },
                    "createdAt": {
                        "type": Sequelize.DATE,
                        "field": "createdAt",
                        "allowNull": false
                    },
                    "updatedAt": {
                        "type": Sequelize.DATE,
                        "field": "updatedAt",
                        "allowNull": false
                    },
                    "userId": {
                        "type": Sequelize.BIGINT,
                        "field": "userId",
                        "onUpdate": "CASCADE",
                        "onDelete": "SET NULL",
                        "references": {
                            "model": "users",
                            "key": "id"
                        },
                        "allowNull": true
                    }
                },
                {
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "createTable",
            params: [
                "websites",
                {
                    "id": {
                        "type": Sequelize.BIGINT,
                        "field": "id",
                        "primaryKey": true,
                        "autoIncrement": true,
                        "unique": true
                    },
                    "name": {
                        "type": Sequelize.STRING,
                        "field": "name"
                    },
                    "description": {
                        "type": Sequelize.STRING,
                        "field": "description"
                    },
                    "subDomain": {
                        "type": Sequelize.STRING,
                        "field": "subDomain",
                        "unique": true
                    },
                    "serverIpAddress": {
                        "type": Sequelize.STRING,
                        "field": "serverIpAddress"
                    },
                    "url": {
                        "type": Sequelize.STRING,
                        "field": "url"
                    },
                    "metadata": {
                        "type": Sequelize.JSON,
                        "field": "metadata"
                    },
                    "createdAt": {
                        "type": Sequelize.DATE,
                        "field": "createdAt",
                        "allowNull": false
                    },
                    "updatedAt": {
                        "type": Sequelize.DATE,
                        "field": "updatedAt",
                        "allowNull": false
                    },
                    "userId": {
                        "type": Sequelize.BIGINT,
                        "field": "userId",
                        "onUpdate": "CASCADE",
                        "onDelete": "SET NULL",
                        "references": {
                            "model": "users",
                            "key": "id"
                        },
                        "allowNull": true
                    }
                },
                {
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "createTable",
            params: [
                "services",
                {
                    "id": {
                        "type": Sequelize.BIGINT,
                        "field": "id",
                        "primaryKey": true,
                        "autoIncrement": true,
                        "unique": true
                    },
                    "name": {
                        "type": Sequelize.STRING,
                        "field": "name"
                    },
                    "serverIpAddress": {
                        "type": Sequelize.STRING,
                        "field": "serverIpAddress"
                    },
                    "url": {
                        "type": Sequelize.STRING,
                        "field": "url"
                    },
                    "metadata": {
                        "type": Sequelize.JSON,
                        "field": "metadata"
                    },
                    "mode": {
                        "type": Sequelize.ENUM('private', 'public'),
                        "field": "mode"
                    },
                    "createdAt": {
                        "type": Sequelize.DATE,
                        "field": "createdAt",
                        "allowNull": false
                    },
                    "updatedAt": {
                        "type": Sequelize.DATE,
                        "field": "updatedAt",
                        "allowNull": false
                    },
                    "userId": {
                        "type": Sequelize.BIGINT,
                        "field": "userId",
                        "onUpdate": "CASCADE",
                        "onDelete": "SET NULL",
                        "references": {
                            "model": "users",
                            "key": "id"
                        },
                        "allowNull": true
                    }
                },
                {
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "createTable",
            params: [
                "website_plans",
                {
                    "id": {
                        "type": Sequelize.BIGINT,
                        "field": "id",
                        "primaryKey": true,
                        "autoIncrement": true,
                        "unique": true
                    },
                    "boughtDate": {
                        "type": Sequelize.DATE,
                        "field": "boughtDate"
                    },
                    "expireTime": {
                        "type": Sequelize.DATE,
                        "field": "expireTime"
                    },
                    "totalPriceOfPlan": {
                        "type": Sequelize.FLOAT,
                        "field": "totalPriceOfPlan"
                    },
                    "totalPayForPlan": {
                        "type": Sequelize.FLOAT,
                        "field": "totalPayForPlan"
                    },
                    "upgradedToUpperPlan": {
                        "type": Sequelize.BOOLEAN,
                        "field": "upgradedToUpperPlan"
                    },
                    "extended": {
                        "type": Sequelize.BOOLEAN,
                        "field": "extended"
                    },
                    "createdAt": {
                        "type": Sequelize.DATE,
                        "field": "createdAt",
                        "allowNull": false
                    },
                    "updatedAt": {
                        "type": Sequelize.DATE,
                        "field": "updatedAt",
                        "allowNull": false
                    },
                    "websiteId": {
                        "type": Sequelize.BIGINT,
                        "field": "websiteId",
                        "onUpdate": "CASCADE",
                        "onDelete": "SET NULL",
                        "references": {
                            "model": "websites",
                            "key": "id"
                        },
                        "allowNull": true
                    }
                },
                {
                    "transaction": transaction
                }
            ]
        },
        {
            fn: "createTable",
            params: [
                "plans",
                {
                    "id": {
                        "type": Sequelize.INTEGER,
                        "field": "id",
                        "primaryKey": true,
                        "autoIncrement": true,
                        "unique": true
                    },
                    "name": {
                        "type": Sequelize.STRING,
                        "field": "name",
                        "unique": true
                    },
                    "isTrial": {
                        "type": Sequelize.BOOLEAN,
                        "field": "isTrial"
                    },
                    "trialDuration": {
                        "type": Sequelize.INTEGER,
                        "field": "trialDuration"
                    },
                    "order": {
                        "type": Sequelize.INTEGER,
                        "field": "order"
                    },
                    "priceMonthly": {
                        "type": Sequelize.FLOAT,
                        "field": "priceMonthly"
                    },
                    "priceYearly": {
                        "type": Sequelize.FLOAT,
                        "field": "priceYearly"
                    },
                    "offPriceMonthly": {
                        "type": Sequelize.FLOAT,
                        "field": "offPriceMonthly"
                    },
                    "offpriceYearly": {
                        "type": Sequelize.FLOAT,
                        "field": "offpriceYearly"
                    },
                    "description": {
                        "type": Sequelize.JSON,
                        "field": "description"
                    },
                    "summery": {
                        "type": Sequelize.STRING,
                        "field": "summery"
                    },
                    "weblancerResourceId": {
                        "type": Sequelize.INTEGER,
                        "field": "weblancerResourceId"
                    },
                    "weblancerPermissionsId": {
                        "type": Sequelize.ARRAY(Sequelize.INTEGER),
                        "field": "weblancerPermissionsId"
                    },
                    "createdAt": {
                        "type": Sequelize.DATE,
                        "field": "createdAt",
                        "allowNull": false
                    },
                    "updatedAt": {
                        "type": Sequelize.DATE,
                        "field": "updatedAt",
                        "allowNull": false
                    },
                    "websitePlanId": {
                        "type": Sequelize.BIGINT,
                        "field": "websitePlanId",
                        "onUpdate": "CASCADE",
                        "onDelete": "SET NULL",
                        "references": {
                            "model": "website_plans",
                            "key": "id"
                        },
                        "allowNull": true
                    }
                },
                {
                    "transaction": transaction
                }
            ]
        }
    ];
};
var rollbackCommands = function(transaction) {
    return [{
            fn: "dropTable",
            params: ["apps", {
                transaction: transaction
            }]
        },
        {
            fn: "dropTable",
            params: ["components", {
                transaction: transaction
            }]
        },
        {
            fn: "dropTable",
            params: ["configs", {
                transaction: transaction
            }]
        },
        {
            fn: "dropTable",
            params: ["credit_transactions", {
                transaction: transaction
            }]
        },
        {
            fn: "dropTable",
            params: ["plans", {
                transaction: transaction
            }]
        },
        {
            fn: "dropTable",
            params: ["services", {
                transaction: transaction
            }]
        },
        {
            fn: "dropTable",
            params: ["users", {
                transaction: transaction
            }]
        },
        {
            fn: "dropTable",
            params: ["website_plans", {
                transaction: transaction
            }]
        },
        {
            fn: "dropTable",
            params: ["websites", {
                transaction: transaction
            }]
        }
    ];
};

module.exports = {
    pos: 0,
    useTransaction: true,
    execute: function(queryInterface, Sequelize, _commands)
    {
        var index = this.pos;
        function run(transaction) {
            const commands = _commands(transaction);
            return new Promise(function(resolve, reject) {
                function next() {
                    if (index < commands.length)
                    {
                        let command = commands[index];
                        console.log("[#"+index+"] execute: " + command.fn);
                        index++;
                        queryInterface[command.fn].apply(queryInterface, command.params).then(next, reject);
                    }
                    else
                        resolve();
                }
                next();
            });
        }
        if (this.useTransaction) {
            return queryInterface.sequelize.transaction(run);
        } else {
            return run(null);
        }
    },
    up: function(queryInterface, Sequelize)
    {
        return this.execute(queryInterface, Sequelize, migrationCommands);
    },
    down: function(queryInterface, Sequelize)
    {
        return this.execute(queryInterface, Sequelize, rollbackCommands);
    },
    info: info
};
