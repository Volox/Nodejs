// Required libs
var mongo = require('../mongo-wrap').instance
  , mongolia = require('mongolia')
  , config = require( '../config' )[ "task" ]
  , log = require( '../config' ).logger;

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
      log.debug( f( 'beforeRemove %s', query ) );
    };
    this.tasks.afterRemove = function(query, callback) {
      log.debug( f( 'afterRemove %s', query ) );
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
      this.tasks.mongo( 'findArray', {}, function( i, array ) {
        
        res.render( 'task/list', {
          title: 'Task list',
          data: array
        } );

      } );
    },

    // POST /tasks
    create: function(req, res) {
      var testObj = JSON.parse( JSON.stringify( config.testObject ) );
      
      log.debug( testObj );

      this.tasks.mongo( 'insert', testObj, function( err, docs ) {
        log.debug( 'Insert Errors -> '+err );
        res.send( 'task created' );
      } );
    },
    // DELETE /tasks/:task
    delete: function(req, res) {
      var taskId = req.params.task;
      res.send( f( 'task #%s deleted', taskId ) );
    },

    // GET  /tasks/:task | /tasks/:task/details
    details: function(req, res){
      res.send( 'show task details' );
    },

    //  GET /tasks/:task/code
    code: function(req, res){
      res.send( 'task code' );
    },

    // GET  /tasks/:task/resource | /tasks/:task/res
    resources: function(req, res){
      res.send( 'task resources' );
    },
    
    // PUT  /tasks/:task | /tasks/:task/result
    update: function(req, res){
      res.send( 'update task/add results' );
    },
  }

};


module.exports = exports = Task;