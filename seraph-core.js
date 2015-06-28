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
