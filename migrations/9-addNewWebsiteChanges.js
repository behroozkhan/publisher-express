'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * removeColumn "extended" from table "website_plans"
 * removeColumn "upgradedToUpperPlan" from table "website_plans"
 * addColumn "planTime" to table "website_plans"
 * addColumn "displayName" to table "websites"
 *
 **/

var info = {
    "revision": 9,
    "name": "addNewWebsiteChanges",
    "created": "2020-08-30T15:21:20.473Z",
    "comment": ""
};

var migrationCommands = function(transaction) {
    return [{
            fn: "removeColumn",
            params: [
                "website_plans",
                "extended",
                {
                    transaction: transaction
                }
            ]
        },
        {
            fn: "removeColumn",
            params: [
                "website_plans",
                "upgradedToUpperPlan",
                {
                    transaction: transaction
                }
            ]
        },
        {
            fn: "addColumn",
            params: [
                "website_plans",
                "planTime",
                {
                    "type": Sequelize.ENUM('trial', 'monthly', 'yearly'),
                    "field": "planTime",
                    "defaultValue": "trial"
                },
                {
                    transaction: transaction
                }
            ]
        },
        {
            fn: "addColumn",
            params: [
                "websites",
                "displayName",
                {
                    "type": Sequelize.STRING,
                    "field": "displayName"
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
            fn: "removeColumn",
            params: [
                "website_plans",
                "planTime",
                {
                    transaction: transaction
                }
            ]
        },
        {
            fn: "removeColumn",
            params: [
                "websites",
                "displayName",
                {
                    transaction: transaction
                }
            ]
        },
        {
            fn: "addColumn",
            params: [
                "website_plans",
                "extended",
                {
                    "type": Sequelize.BOOLEAN,
                    "field": "extended"
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
                "upgradedToUpperPlan",
                {
                    "type": Sequelize.BOOLEAN,
                    "field": "upgradedToUpperPlan"
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
