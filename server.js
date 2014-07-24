"use strict";

// Configuration
global.config = require("./config");

global.db = require("./databases/"+config.db_driver); // This is a bit of a hack and outdated way of doing things...

// Required node modules
var restify = require("restify");
var restifyOAuth2 = require("restify-oauth2");
var cluster = require('cluster');
var hooks = require("./hooks");

// Process variables

var server = restify.createServer({
	name: "Very Simple Application Analytics Server",
	version: "0.0.3",
	formatters: {
		"application/hal+json": function (req, res, body) {
			return res.formatters["application/json"](req, res, body);
		}
	}
});

var port = config.listen; // Default port to listen

if (process.argc >= 2) {
	port = parseInt(process.argv[2]); // Port can be also passed as an argument, this overrides config...
}

var RESOURCES = Object.freeze({
	INITIAL: "/",
	TOKEN: "/login",
	EVENT: "/event",
    TEST: "/test"
});

server.use(restify.authorizationParser());
server.use(restify.bodyParser({ mapParams: false }));
	restifyOAuth2.cc(server, { tokenEndpoint: RESOURCES.TOKEN, hooks: hooks });
server.get(RESOURCES.INITIAL, function (req, res) {
	var response = {
		_links: {
			self: { href: RESOURCES.INITIAL }
		}
	};

	if (req.clientId) {
		response._links["http://rel.example.com/event"] = { href: RESOURCES.EVENT };
	} else {
		response._links["oauth2-token"] = {
			href: RESOURCES.TOKEN,
			"grant-types": "client_credentials",
			"token-types": "bearer"
		};
	}

	res.contentType = "application/hal+json";
	res.send(response);
});

server.post(RESOURCES.EVENT, function (req, res) {
	if (!req.clientId) {
		return res.sendUnauthenticated();
	}
	var fields = [
		req.body.DeviceId,
		req.body.Description,
		req.body.ApiKey
	];
	var response = {
		"success": "event recorded successfully",
		_links: {
			self: { href: RESOURCES.EVENT },
			parent: { href: RESOURCES.INITIAL }
		}
	}
	db.createEvent(fields, function (err, result) {
		if (err) {
			response = {
				"error": "err",
				_links: {
					self: { href: RESOURCES.EVENT },
					parent: { href: RESOURCES.INITIAL }
				}
			}
		}
	});
	if (req.body.message_type === 'APPLICATION_EVENT_QUIT')
		hooks.invalidateClientToken(req.authorization.credentials);
	res.contentType = "application/hal+json";
	res.send(response);
});

server.get(RESOURCES.TEST, function (req, res) {
    var response = Math.floor((Math.random() * 100) + 1);
    console.log(response);
    if (response >= 50) {
        db.createLog(function (err, result) {
            if (err) {
                response = {
                    "error": "err",
                    _links: {
                        self: { href: RESOURCES.EVENT },
                        parent: { href: RESOURCES.INITIAL }
                    }
                }
            }
        });
    }
    else {
        db.getLog(function (err, result) {
            if (err) {
                response = {
                    "error": "err",
                    _links: {
                        self: { href: RESOURCES.EVENT },
                        parent: { href: RESOURCES.INITIAL }
                    }
                }
            }
        });
    }
    res.contentType = "application/hal+json";
    res.send(response);
});

// Adding error information...
process.on('uncaughtException', function (err) {
	console.log("UNCAUGHT EXCEPTION ");
	console.log("[Inside 'uncaughtException' event] " + err.stack || err.message);
});

// Clustering to utilize all CPU cores
if (cluster.isMaster) {

    // Fork workers
    for (var i = 0; i < config.workers; i++) {
        cluster.fork();
    }

    cluster.on('exit', function (worker, code, signal) {
    	console.log('worker ' + worker.process.pid + ' died');
    	cluster.fork();
    });
} 
else {
    server.listen(port);
}