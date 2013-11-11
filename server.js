#!/bin/env node
//
//  OpenShift sample Node application
var express = require('express');
var fs = require('fs');


/**
 *  Define the sample application.
 */
var SampleApp = function() {

    //  Scope.
    var self = this;
    
    contentType = 'application/xml';
    globalSite='';

    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        }
       self.globalSite = self.ipaddress +":"+self.port;
        
    };


    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        if (typeof self.zcache === "undefined") {
            self.zcache = {'index.html': ''};
        }

        //  Local cache for static content.
        self.zcache['index.html'] = fs.readFileSync('./index.html');
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) {
        return self.zcache[key];
    };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig) {
        if (typeof sig === "string") {
            console.log('%s: Received %s - terminating sample app ...',
                    Date(Date.now()), sig);
            process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()));
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function() {
        //  Process on exit and signals.
        process.on('exit', function() {
            self.terminator();
        });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
            'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() {
                self.terminator(element);
            });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        self.routes = {};

        self.routes['/asciimo'] = function(req, res) {
            var link = "http://i.imgur.com/kmbjB.png";
            res.send("<html><body><img src='" + link + "'></body></html>");
        };

        self.routes['/'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send(self.cache_get('index.html'));
        };
    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();
        self.app = express();

        self.app.configure(function() {
            self.app.set('views', __dirname + '/views');
            self.app.set('view engine', 'ejs');
            self.app.use(express.bodyParser());
            self.app.use(express.methodOverride());
            self.app.use(express.static(__dirname + '/public'));
        });
        // debug mode
        self.app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 

        //  Add handlers for the app (from the routes).
        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                    Date(Date.now()), self.ipaddress, self.port);
        });
    };

};   /*  Sample Application.  */



/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.start();
/*
zapp.app.get('/mazes', function(req, res) {
    console.log("list of available mazes");
});

zapp.app.get('/mazes/:m', function(req, res) {
    var maze = req.params.m;
    console.log("get single maze %s", maze);
});
zapp.app.get('/mazes/:m/:c', function(req, res) {
    var maze = req.params.m;
    var cell = req.params.c;
    console.log("get single room (%s) maze %s", cell, maze);
}); 
*/
// handle collection 
zapp.app.get('/maze/', function(req, res){
  res.header('content-type',this.contentType);
  res.render('collection', {
    title : 'Maze+XML Hypermedia Example',
    site  : 'http://'+ this.ipaddress + ":" + this.port
  });
});

// handle item
zapp.app.get('/maze/:m', function (req, res) {
  var mz;
  
  mz = (req.params.m || 'none');
  
  var cType = req.get("content-type");
  console.log("%s", cType);
      
  //db.get(mz, function (err, doc) {
  fs.readFile(mz+".json", function(err, data){
    var doc = JSON.parse(data);
    
    res.header('content-type',this.contentType);
    res.render('item', {
      site  : this.globalSite + '/maze',
      maze  : mz,
      debug : doc
    });
  });
  
});

// handle exit 
zapp.app.get('/maze/:m/999', function (req, res) {
  var mz, cz;
  
  mz = (req.params.m || 'none');
  cz = (req.params.c || '0');

  res.header('content-type', this.contentType);
  res.render('exit', {
    site  : this.globalSite + '/maze',
    maze  : mz,
    cell  : cz,
    total : 0,
    side  : 0,
    debug : '999',
    exit  : '0'
  });
});

// handle cell
zapp.app.get('/maze/:m/:c', function (req, res) {
  var mz, cz, x, ex, i, tot, sq;
  
  mz = (req.params.m || 'none');
  cz = (req.params.c || '0');

  //db.get(mz, function (err, doc) {
  fs.readFile(mz+".json", function(err, data){
    var doc = JSON.parse(data);
    
    i = parseInt(cz.split(':')[0], 10);
    x = 'cell' + i;
    console.log(doc.cells);
    tot = Object.keys(doc.cells).length;
    ex = (i === tot-1 ? '1' : '0');
    sq = Math.sqrt(tot);
    
    res.header('content-type', this.contentType);
    res.render('cell', {
      site  : this.globalSite + '/maze',
      maze  : mz,
      cell  : cz,
      total : tot,
      side  : sq,
      ix    : [i-1, i + (sq*-1), i+1, i+sq],
      debug : doc.cells[x],
      exit  : ex
    });
  });
});