// Database related
'use strict';

var mongojs = require("mongojs");

var dbconnection = mongojs.connect(config.mongodb_uri, ["Applications","Events"]);

var storeEvent = function (data, appid, callback)
{
	dbconnection.Events.insert({ DeviceId: data[0],
								 Description: data[1],
								 Logged: Date.now(),
								 Applications_Id: appid},callback);
}

exports.createEvent = function (data, callback) {
	dbconnection.Applications.find({ApiKey:data[2]}, function(err,res)
	{
		storeEvent(data,res[0]._id,callback);
	});
}

exports.getApps = function (callback) {
	dbconnection.Applications.find({},{ "_id": 0, "ApiKey": 1 , "ApiSecret": 1 },callback);
}

exports.createLog = function (callback) {
    var randomID = Math.floor((Math.random() * 100) + 1);
    dbconnection.Events.insert({ nro:randomID});
};

exports.getLog = function (callback) {

    dbconnection.Applications.find({},{ "_id": 0, callback);
}
