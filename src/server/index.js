const http = require("http");
const url = require("url");
const path = require("path");
const fs = require("fs");
const mime = require("mime");
const getFolderMetadata = require("../lib/meta-folder");

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

function handleDirectory(ctx) {
  // if (err) return serverError(ctx);
  // If there is a default file (static or dynamic), return it.
    // If there are alternates, return a document that allows selection of an alternate representation.
  // 
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
      return handleDirectory(ctx)
    } else {
      handleFile(ctx);
    }
  })
}).listen(port);

var address = server.address();

if (address) console.log("Lynx Docs server is running at http://localhost:" + address.port);
