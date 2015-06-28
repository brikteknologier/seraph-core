var request = require('request');
var _ = require('underscore');

function SeraphCore(config) {
  if (typeof options === 'string') {
    options = { server: options };
  };
  options = _.extend({}, defaultOptions, options);
  options.server = options.server
    .replace(/\/$/, '');        // remove trailing /
  options.endpoint = options.endpoint
    .replace(/\/$/, '')         // remove trailing /
    .replace(/^([^\/])/, '/$1'); // add leading /

  this.options = options;
}

var defaultOptions = {
  // Location of the server
  server: 'http://localhost:7474',

  // datbase endpoint
  endpoint: '/db/data',

  // The key to use when inserting an id into objects. 
  id: 'id',

  // default username and password for authentication
  user: 'neo4j',
  pass: 'neo4j'
}, optionKeys = Object.keys(defaultOptions);

/**
 * Create an operation that can later be passed to call().
 *
 * Path is relative to the service endpoint - `node` gets
 * transformed to `<options.server><options.endpoint>/node`.
 * 
 * If `method` is not supplied, it will default GET, unless `data`
 * is supplied, in which case it will default to 'POST'.
 *
 * seraph#operation(opts, path, [method='get'], [data]);
 */
SeraphCore.prototype.operation = function(path, method, data) {
  // Get args in the right order
  if (typeof data === 'undefined') {
    data = null;
  }
  if (typeof method === 'object') {
    data = method;
    method = 'POST';
  }
  if (typeof method === 'undefined') {
    method = 'GET';
  }

  // Ensure we have a usable HTTP verb.
  if (typeof method !== 'string') {
    throw new Error('Invalid HTTP Verb - ' + method);
  } else {
    method = method.toUpperCase();
  }

  return {
    'method': method,
    'endpoint': this.options.endpoint,
    'to'    : path,
    'body'  : data
  };
};

/**
 * Function to call an HTTP request to the rest service.
 * 
 * Requires an operation object of form:
 *   { method: 'PUT'|'POST'|'GET'|'DELETE'
 *   , to    : path,
 *   , body  : object }
 *
 * Operation objects are easily created by seraph#operation.
 *
 * seraph#call(operation, callback);
 */
SeraphCore.prototype.call = function(operation, callback) {
  // Ensure callback is callable. Throw instead of calling back if none.
  if (typeof callback !== 'function') {
    callback = function(err) {
      if (err) throw err;
    }
  }
  var authString = new Buffer(this.options.user + ':' + this.options.pass).toString('base64');
  var endpoint = operation.endpoint || this.options.endpoint;
  var requestOpts = {
    uri: this.options.server + endpoint + '/' + operation.to,
    method: operation.method,
    headers: { 
      Accept: 'application/json',
      Authorization: 'Basic ' + authString
    }
  };
  

  if (operation.body) requestOpts.json = operation.body;
  callback = _.bind(callback, this);
  
  // allow mocking of "request". you can mock it by reassigning this._request to
  // something with the same API as the "request" module.
  var createRequest = this._request || request;

  createRequest(requestOpts, function(err, response, body) {
    if (err) {
      callback(err);
    } else if (response.statusCode < 200 || response.statusCode >= 300) {
      if (typeof body == 'string') {
        try {
          body = JSON.parse(body);
        } catch (error) {}
      }
      // Pass on neo4j error
      var error;
      if (typeof body == "object" && body.exception) {
        error = new Error(body.message);
        error.neo4jError = body;
        error.neo4jException = body.exception;
        error.neo4jStacktrace = body.stacktrace;
        if (body.cause) error.neo4jCause = body.cause;
      } else {
        if (typeof body == 'object' && body.errors) {
          error = new Error(body.errors[0].message);
        } else {
          error = new Error(body || response.statusCode);
        }
        error.code = response.statusCode;
        error.response = response;
      }
      error.statusCode = response.statusCode;
      callback(error);
    } else {
      if (operation.method === 'GET' && response.statusCode === 204) {
        var error = new Error("no content");
        error.statusCode = response.statusCode;
        return callback(error);
      }

      _.defer(function() {
        if (body === '') body = null;
        else if (typeof body === 'string') {
          try {
            body = JSON.parse(body);
          } catch (e) {
            return callback(e);
          }
        }

        callback(null, body, response.headers.location);
      });
    }
  });
};

