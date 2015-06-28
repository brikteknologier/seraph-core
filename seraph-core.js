function SeraphCore(config) {
  if (typeof options === 'string') {
    options = { server: options };
  };
  this.options = _.extend({}, defaultOptions, options);
  this.options.server = this.options.server
    .replace(/\/$/, '');        // remove trailing /
  this.options.endpoint = this.options.endpoint
    .replace(/\/$/, '')         // remove trailing /
    .replace(/^([^\/])/, '/$1'); // add leading /
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
