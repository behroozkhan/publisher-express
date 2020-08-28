const { Pool } = require('pg');
const pgtools = require('pgtools');
let {models} = require('./model-manager/models');

module.exports.createDB = (dbName, config) => {
    return new Promise((resolve, reject) => {
        const pool = new Pool({...config});

        pool.query(`SELECT FROM pg_database WHERE datname = '${dbName}'`, (err, res) => {
            pool.end();
            if (res.rows.length > 0) {
                resolve({success: true});
            } else {
                pgtools.createdb(config, dbName, function(error, res) {
                    if (error) {
                        resolve({success: true, error});
                        return;
                    }
                    resolve({success: true});
                });
            }
        });
    });
}

module.exports.initDB = async () => {
}