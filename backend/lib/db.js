'use strict';
let db;
module.exports = { getDb: () => db, setDb: (database) => { db = database; } };
