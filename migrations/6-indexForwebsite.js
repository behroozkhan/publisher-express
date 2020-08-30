'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * removeColumn "weblancerPermissionsId" from table "plans"
 * removeColumn "weblancerResourceId" from table "plans"
 * addColumn "productsDetail" to table "plans"
 * addColumn "addedPrice" to table "website_plans"
 * addColumn "addedProducts" to table "website_plans"
 * addIndex "websites_name_user_id" to table "websites"
 *
 **/

var info = {
    "revision": 6,
    "name": "indexForwebsite",
    "created": "2020-08-30T13:28:47.190Z",
    "comment": ""
};

var migrationCommands = function(transaction) {
    return [{
            fn: "removeColumn",
            params: [
                "plans",
                "weblancerPermissionsId",
                {
                    transaction: transaction
                }
            ]
        },
        {
            fn: "removeColumn",
            params: [
                "plans",
                "weblancerResourceId",
                {
                    transaction: transaction
                }
            ]
        },
        {
            fn: "addColumn",
            params: [
                "plans",
                "productsDetail",
                {
                    "type": Sequelize.JSON,
                    "field": "productsDetail"
                },
                {
                    transaction: transaction
                }
            ]
        },
        {
            fn: "addColumn",
            params: [
                "website_plans",
                "addedPrice",
                {
                    "type": Sequelize.FLOAT,
                    "field": "addedPrice"
                },
                {
                    transaction: transaction
                }
            ]
        },
        {
            fn: "addColumn",
            params: [
                "website_plans",
                "addedProducts",
                {
                    "type": Sequelize.JSON,
                    "field": "addedProducts"
                },
                {
                    transaction: transaction
                }
            ]
        },
        {
            fn: "addIndex",
            params: [
                "websites",
                ["name", "userId"],
                {
                    "indexName": "websites_name_user_id",
                    "name": "websites_name_user_id",
                    "indicesType": "UNIQUE",
                    "type": "UNIQUE",
                    "transaction": transaction
                }
            ]
        }
    ];
};
var rollbackCommands = function(transaction) {
    return [{
            fn: "removeIndex",
            params: [
                "websites",
                "websites_name_user_id",
                {
                    transaction: transaction
                }
            ]
        },
        {
            fn: "removeColumn",
            params: [
                "plans",
                "productsDetail",
                {
                    transaction: transaction
                }
            ]
        },
        {
            fn: "removeColumn",
            params: [
                "website_plans",
                "addedPrice",
                {
                    transaction: transaction
                }
            ]
        },
        {
            fn: "removeColumn",
            params: [
                "website_plans",
                "addedProducts",
                {
                    transaction: transaction
                }
            ]
        },
        {
            fn: "addColumn",
            params: [
                "plans",
                "weblancerPermissionsId",
                {
                    "type": Sequelize.ARRAY(Sequelize.INTEGER),
                    "field": "weblancerPermissionsId"
                },
                {
                    transaction: transaction
                }
            ]
        },
        {
            fn: "addColumn",
            params: [
                "plans",
                "weblancerResourceId",
                {
                    "type": Sequelize.INTEGER,
                    "field": "weblancerResourceId"
                },
                {
                    transaction: transaction
                }
            ]
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
