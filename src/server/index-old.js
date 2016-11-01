"use strict";

const http = require("http");
const url = require("url");
const path = require("path");
const fs = require("fs");
const mime = require("mime");
const exportYaml = require("../cli/export");
const parseYaml = require("../lib/parse-yaml");
const YAML = require("yamljs");
const getRealmMetadata = require("../lib/metadata-realm");

function notFound(ctx) {
  ctx.res.writeHead(404, { "Content-Type": "text/plain" });
  ctx.res.write("404 Not Found");
  ctx.res.end();
}

function serverError(ctx) {
  ctx.res.writeHead(500, { "Content-Type": "text/plain" });
  ctx.res.write("500 Server Error");
  ctx.res.end();
}

function serveRealm(ctx) {
  var metadata = getRealmMetadata(ctx.req.foldername);
  var variants = metadata.variants;
  var realms = metadata.realms;
  
  function serveRealmIndex(ctx) {
    ctx.res.setHeader("Content-Type", "application/lynx+json");
    
    var data = {};
    data.realm = metadata.realm;
    if (variants.length > 0) data.variants = variants;
    else data.realms = realms;
    
    exportYaml.handler({
      format: "lynx",
      input: path.join(__dirname, "realm-index.lynx.yml"),
      output: ctx.res,
      data: data
    });
  }
  
  var variantName = ctx.req.query.variant || metadata.getDefaultVariant() || "default";
  var variant = variants.find(v => v.name === variantName);
  
  // if (!variant ) return notFound(ctx);
  // 
  // // [later] If there is a variant, display it along with alternates.
  // // [later] Use query string param to just display the variant (without alternates)
  // // [now] If no variant selected, but variants exist display list of variants.
  // // [now] If no variant selected, but child realms exist, display list of realms.
  
  if (ctx.req.query.variant && !variant) return notFound(ctx);
  
  if (!variant && (variants.length > 0 || realms.length > 0))  {
    return serveRealmIndex(ctx);
  }
  
  if (!variant) return notFound(ctx);
  
  ctx.res.setHeader("Content-Type", "application/lynx+json");
  exportYaml.handler({
    format: "lynx",
    input: variant.template,
    output: ctx.res,
    data: variant.data
  });
}

function serveFile(ctx) {
  fs.readFile(ctx.req.filename, "binary", function(err, file) {
    if (err) return serverError(ctx);

    ctx.res.writeHead(200, { "Content-Type": mime.lookup(ctx.req.filename) });
    ctx.res.write(file, "binary");
    ctx.res.end();
  });
}

module.exports = exports = function startServer(options) {
  var port = options.port || 0;

  var server = http.createServer((req, res) => {
    var ctx = { req: req, res: res };
    var parsedURL = url.parse(req.url, true);
    ctx.req.pathname = parsedURL.pathname;
    ctx.req.query = parsedURL.query;
    
    ctx.req.filename = ctx.req.pathname.replace(/^\//, "");

    fs.exists(ctx.req.filename, exists => {
      if (!exists) return notFound(ctx);

      if (fs.statSync(ctx.req.filename).isDirectory()) {
        ctx.req.foldername = ctx.req.filename;
        delete ctx.req.filename;
        return serveRealm(ctx);
      } else {
        serveFile(ctx);
      }
    });
  }).listen(port);

  var address = server.address();
  if (address) console.log("Lynx Docs server is running at http://localhost:" + address.port);
  
  return server;
};
