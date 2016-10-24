const http = require("http");
const url = require("url");
const path = require("path");
const fs = require("fs");
const mime = require("mime");
const getFolderMetadata = require("../lib/meta-folder");
const exportYaml = require("../lib/export-yaml");
const finish = require("../lib/finish-yaml");
const expand = require("../lib/expand-yaml");
const handlebars = require("handlebars");
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

function readData(filePath) {
  var content = fs.readFileSync(filePath);
  var parsedFilePath = path.parse(filePath);
  
  if (parsedFilePath.ext === ".json") {
    return JSON.parse(content.toString());
  } else if (parsedFilePath.ext === ".yml" || parsedFilePath.ext === ".yaml") {
    return YAML.parse(content.toString());
  }
  
  throw new Error("Failed to read data from " + filePath);
}

function writeStateDocument(ctx) {
  var state = ctx.res.state;
  //TODO: use parse yaml module...
  var yaml = YAML.parse(fs.readFileSync(state.template).toString());
  yaml = expand({ value: yaml });
  yaml = finish(yaml);

  var output = [];
  exportYaml("handlebars", yaml, c => output.push(c));
  
  var data = state.dataFile ? readData(state.dataFile) : {};
  var content = handlebars.compile(output.join(""))(data);
  
  ctx.res.writeHead(200, { "Content-Type": "application/lynx+json" });
  ctx.res.write(content);
  ctx.res.end();
}

function handleDirectory(ctx) {
  var metadata = getFolderMetadata(ctx.req.foldername);
  
  if (metadata.states.default) {
    ctx.res.state = metadata.states.default;
  } 
  
  writeStateDocument(ctx);
}

function handleFile(ctx) {
  fs.readFile(ctx.req.filename, "binary", function(err, file) {
    if (err) return serverError(ctx);
    
    ctx.res.writeHead(200, { "Content-Type": mime.lookup(ctx.req.filename)});
    ctx.res.write(file, "binary");
    ctx.res.end();
  });
}

var port = process.argv[2] || 0;

var server = http.createServer((req, res) => {
  var ctx = { req: req, res: res };
  ctx.req.pathname = url.parse(req.url).pathname;
  ctx.req.filename = path.join(process.cwd(), ctx.req.pathname);
  
  fs.exists(ctx.req.filename, exists => {
    if (!exists) return notFound(ctx);
    
    if (fs.statSync(ctx.req.filename).isDirectory()) {
      ctx.req.foldername = ctx.req.filename;
      delete ctx.req.filename;
      return handleDirectory(ctx);
    } else {
      handleFile(ctx);
    }
  })
}).listen(port);

var address = server.address();

if (address) console.log("Lynx Docs server is running at http://localhost:" + address.port);
