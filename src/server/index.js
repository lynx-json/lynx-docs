const http = require("http");
const url = require("url");
const path = require("path");
const fs = require("fs");
const mime = require("mime");
const exportYaml = require("../cli/export");
const parseYaml = require("../lib/parse-yaml");
const YAML = require("yamljs");

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

function getRealmMetadata(folderPath) {
  return parseYaml(fs.readFileSync(path.join(folderPath, ".meta.yml")));
}

function serveRealm(ctx) {
  var metadata = getRealmMetadata(ctx.req.foldername);
  var variantName = ctx.req.query.variant || metadata.default || "default";
  
  var variant = metadata.variants.find(v => v.name === variantName);
  
  if (!variant) return notFound(ctx);
  
  // [later] If there is a variant, display it along with alternates.
  // [later] Use query string param to just display the variant (without alternates)
  // [now] If no variant selected, but variants exist display list of variants.
  // [now] If no variant selected, but child realms exist, display list of realms.

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

var port = process.argv[2] || 0;

var server = http.createServer((req, res) => {
  var ctx = { req: req, res: res };
  var parsedURL = url.parse(req.url, true);
  ctx.req.pathname = parsedURL.pathname;
  ctx.req.query = parsedURL.query;
  
  ctx.req.filename = path.join(process.cwd(), ctx.req.pathname);

  fs.exists(ctx.req.filename, exists => {
    if (!exists) return notFound(ctx);

    if (fs.statSync(ctx.req.filename).isDirectory()) {
      ctx.req.foldername = ctx.req.filename;
      delete ctx.req.filename;
      return serveRealm(ctx);
    } else {
      serveFile(ctx);
    }
  })
}).listen(port);

var address = server.address();

if (address) console.log("Lynx Docs server is running at http://localhost:" + address.port);
