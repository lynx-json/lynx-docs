module.exports = exports = function serveStatic(req, res, next) {
  // try to find the static file or call next
  // convert previous impl to serve the static file or call next()
  next();
};
