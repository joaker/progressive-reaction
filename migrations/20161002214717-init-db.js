"use strict";

console.log("heyHEYheyHEY")

var dbm = global.dbm || require('rethink-migrate');
var type = dbm.dataType;

let envIndex = process.argv.indexOf("--env");
if (envIndex === -1) {
	envIndex = process.argv.indexOf("-e");
}
const env = (envIndex === -1) ? "development" : process.argv[envIndex + 1];

console.log("getting json... 0");
const dbSettings = require("../database.json");
console.log("getting json... 1");
const schema = require("../db/schema.json").tables;
console.log("getting json... 2");


const createIndex = context => tableName => (indexName) => {
	const promiseToIndexTheTable = context.r.table(tableName).indexCreate(indexName).run(context.connection) // build the new index;
		.then(() => context.r.table(tableName).indexWait().run(context.connection)); // wait for that index to finish building before exiting;
	return promiseToIndexTheTable;
};

const createTable = context => (definition) => {

	console.log('creating table for... ' + JSON.stringify(definition));

	const tableName = definition.name;
	if(!tableName){
		throw new Error("ERROR: schema.json contains a table definition without a name.  table names are required.");
	}


	const creationPromise = context.r.tableCreate(tableName).run(context.connection);
	const createIndexForName = createIndex(context)(tableName);
	const createAndIndexPromise = creationPromise.then(() => { // runs after creation succeeds
		const indices = (definition.indices && definition.indices.length) ? definition.indices : ([]);
		const indexPromises = indices.map(createIndexForName);
		const createdAllIndices = Promise.all(indexPromises);
		return createdAllIndices;
	});

	return createAndIndexPromise;
}

const createTables = context => (tables) => {
	const tableCreator = createTable(context);
	const promisesToCreateTables = tables.map(tableCreator);
	const allTablesCreated = Promise.all(promisesToCreateTables);
	return allTablesCreated;
}

exports.up = function (r, connection) {
	const creationComplete = createTables({r, connection,})(schema);
	return creationComplete;
};

exports.down = function (r, connection) {
	return Promise.all(schema.map(table => context.r.tableDrop(table.name).run(connection)));
};
