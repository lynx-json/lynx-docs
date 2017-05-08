module.exports = exports = function createCorsHandler(options) {
  return function (req, res, next) {
    if (req.method === "OPTIONS") {
      if (req.headers["access-control-request-method"]) {
        res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");

        if (req.headers["access-control-request-headers"]) {
          res.setHeader("Access-Control-Allow-Headers", req.headers["access-control-request-headers"]);
        }

        res.setHeader("Access-Control-Max-Age", "86400");
      }
    }

    res.setHeader("Access-Control-Allow-Origin", "http://localhost:" + options.port);
    res.setHeader("Access-Control-Allow-Credentials", "true");

    if (req.method !== "OPTIONS") return next();
    res.statusCode = 200;
    res.end();
  };
};
