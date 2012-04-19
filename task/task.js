// Required libs
var mongo = require('../mongo-wrap').instance
  , mongolia = require('mongolia')
  , ObjectID = require('mongodb').ObjectID
  , config = require( '../config' )[ "task" ]
  , log = require( '../config' ).logger;

var fs = require( 'fs' );
log.debug( 'Task class loaded' );

var Task = function( db ) {
  log.debug( 'Task instance created' );
  
  // Properties
  this.db = db || null;
  this.tasks = null;
  this.name = "Task";


  this.init();
}

// Methods
Task.prototype = {

  init: function() {
    this.tasks = mongolia.model( this.db, config.collection );

    this.tasks.beforeInsert = function(documents, callback) {
      documents.forEach( function ( document ) {
        var now = new Date();
        document.creationDate = now.format( 'yyyy-mm-dd HH:MM:ss' )
      });

      callback( null,  documents );
    };
    this.tasks.afterInsert = function(documents, callback) {
      callback( null,  documents );
    };
    this.tasks.beforeUpdate = function(query, update, callback) {
      
    };
    this.tasks.afterUpdate = function(query, update, callback) {
      
    };
    this.tasks.beforeRemove = function(query, callback) {
      //log.debug( f( 'Removing from task with query: %j', query ) );
      callback( null,  query );
    };
    this.tasks.afterRemove = function(query, callback) {
      //log.debug( f( 'Removed from task with query: %j', query ) );
      callback( null,  query );
    };

  },

  do: function( action ) {
    if( this.actions[ action ] ) {
      
      // Wrap to preserve the context
      var self = this;
      return function() {
        return self.actions[ action ].apply( self, arguments );
      };
    }
  },

  // Resource methods
  actions: {
    
    // GET /tasks | /tasks/list
    list: function(req, res) {
      // Find only the active tasks
      this.tasks.mongo( 'findArray', { active: true }, function( i, array ) {
        
        res.render( 'task/list', {
          title: 'Task list',
          data: array
        } );

      } );
    },

    // GET /tasks/new
    new: function (req, res ) {
      res.render( 'task/new', {
        title: 'Task Creation'
      } );
    },

    // POST /tasks
    create: function(req, res) {
      var taskObj = JSON.parse( JSON.stringify( config.testObject ) );

      taskObj.name = req.body.name;
      taskObj.description = req.body.description;
      
      // Read the file contents
      var file = req.files.code.path;
      taskObj.code = fs.readFileSync( file, 'utf8');

      taskObj.requirements.minInstance = req.body.minInstances;
      taskObj.requirements.maxInstance = req.body.maxInstances;
      taskObj.requirements.endDate = req.body.endDate;

      /*
      "resources": {
        "resourceID": "path/to/the/resource",
        "resourceID1": "../path/to/the/resource1",
        "resourceID2": "path/to/the/resource2",
        "resourceID3": "/path/to/the/resource3"
      },
      */

      this.tasks.mongo( 'insert', taskObj, function( err, docs ) {
        log.debug( 'Insert Errors -> '+err );
        res.redirect( '/tasks/list' );
      } );
    },

    // DELETE /tasks/:task
    delete: function(req, res) {
      var taskId = req.params.task;
      var taskObj = {
        _id: new ObjectID( taskId )
      };

      this.tasks.mongo( 'remove', taskObj, function( err, docs ) {
        log.debug( 'remove Errors -> '+docs );
        res.send( f( 'task #%s removed', taskId ) );
      } );
    },

    // GET  /tasks/:task/:format? | /tasks/:task/details/:format?
    details: function(req, res) {
      var taskId = req.params.task;
      var format = req.params.format || 'html';
      
      if( format.toLowerCase()==='html' ) {
        res.render( 'task/detail', {
          title: 'Task details'
        } );
      } else {
        var findObj = {
          _id: new ObjectID( taskId )
        }
        this.tasks.mongo( 'findOne', findObj, function( err, docs ) {
          log.debug( f( 'Task %s details', taskId ) );
          res.json( docs );
        } );
      }
    },

    //  GET /tasks/:task/code
    code: function(req, res) {
      var taskId = req.params.task;
      var findObj = {
        _id: new ObjectID( taskId )
      };
      this.tasks.mongo( 'findOne', findObj, function( err, docs ) {
        log.debug( f( 'Task %s code', taskId ) );
        res.send( docs.code );
      } );
    },

    // GET  /tasks/:task/resource | /tasks/:task/res
    resources: function(req, res) {
      var taskId = req.params.task;
      res.send( 'task resources' );
    },
    
    // PUT  /tasks/:task | /tasks/:task/result
    result: function(req, res){
      res.send( 'update task/add results' );
    },
  }

};


module.exports = exports = Task;