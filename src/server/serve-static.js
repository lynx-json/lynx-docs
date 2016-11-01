module.exports = exports = function createStaticHandler(options) {
  // try to find the static file or call next
  return function (req, res, next) {
    next();
  };
};
