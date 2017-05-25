module.exports = exports = function createCorsHandler(options) {
  return function (req, res, next) {
    let origin = req.headers.origin || "http://localhost:" + options.port;
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Expose-Headers", "X-Variant-Index");

    if (req.method !== "OPTIONS") return next();

    if (req.headers["access-control-request-method"]) {
      res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");

      if (req.headers["access-control-request-headers"]) {
        res.setHeader("Access-Control-Allow-Headers", req.headers["access-control-request-headers"]);
      }

      res.setHeader("Access-Control-Max-Age", "600"); //Chromium cap for caching access control response
    }

    res.statusCode = 200;
    res.end();
  };
};
