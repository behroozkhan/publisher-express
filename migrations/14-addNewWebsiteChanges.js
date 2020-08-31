'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * changeColumn "addedPrice" on table "website_plans"
 * changeColumn "addedProducts" on table "website_plans"
 *
 **/

var info = {
    "revision": 14,
    "name": "addNewWebsiteChanges",
    "created": "2020-08-31T08:32:04.859Z",
    "comment": ""
};

var migrationCommands = function(transaction) {
    return [{
            fn: "changeColumn",
            params: [
                "website_plans",
                "addedPrice",
                {
                    "type": Sequelize.FLOAT,
                    "field": "addedPrice",
                    "defaultValue": 0
                },
                {
                    transaction: transaction
                }
            ]
        },
        {
            fn: "changeColumn",
            params: [
                "website_plans",
                "addedProducts",
                {
                    "type": Sequelize.JSON,
                    "field": "addedProducts",
                    "defaultValue": Sequelize.Array
                },
                {
                    transaction: transaction
                }
            ]
        }
    ];
};
var rollbackCommands = function(transaction) {
    return [{
            fn: "changeColumn",
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
            fn: "changeColumn",
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
