/**
 * Maze+XML server.
 * Designing Hypermedia APIs by Mike Amundsen (2011)
*/

// for express
var express = require('express');
var app = module.exports = express();

// for couch
//var cradle = require('cradle');
//var db = new(cradle.Connection)().database('maze-data');

// for filesystem access
var fs = require('fs');

// global data
var contentType = 'application/xml';
var globalSite = 'http://localhost:3000'

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// handle collection 
app.get('/maze/', function(req, res){
  res.header('content-type',contentType);
  res.render('collection', {
    title : 'Maze+XML Hypermedia Example',
    site  : globalSite
  });
});

// handle item
app.get('/maze/:m', function (req, res) {
  var mz;
  
  mz = (req.params.m || 'none');
  
  var cType = req.get("content-type");
  console.log("%s", cType);
      
  //db.get(mz, function (err, doc) {
  fs.readFile(mz+".json", function(err, data){
    var doc = JSON.parse(data);
    
    res.header('content-type',contentType);
    res.render('item', {
      site  : globalSite + '/maze',
      maze  : mz,
      debug : doc
    });
  });
  
});

// handle exit 
app.get('/maze/:m/999', function (req, res) {
  var mz, cz;
  
  mz = (req.params.m || 'none');
  cz = (req.params.c || '0');

  res.header('content-type', contentType);
  res.render('exit', {
    site  : globalSite + '/maze',
    maze  : mz,
    cell  : cz,
    total : 0,
    side  : 0,
    debug : '999',
    exit  : '0'
  });
});

// handle cell
app.get('/maze/:m/:c', function (req, res) {
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
    
    res.header('content-type', contentType);
    res.render('cell', {
      site  : globalSite + '/maze',
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

// Only listen on $ node app.js
if (!module.parent) {
  app.listen(3000);
  app.set("env","development");
  console.log("Express server listening on port %d", 3000);
}