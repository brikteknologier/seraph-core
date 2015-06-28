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
