var vfs = require("vinyl-fs");
var vss = require("vinyl-source-stream");
var vbuffer = require("vinyl-buffer");
var through2 = require("through2");
var isStream = require("isstream");

function createSourceStream(input) {
  if (isStream(input)) return input.pipe(vss(input.path || "unknown")).pipe(vbuffer()); //convert stream to vinyl stream
  return vfs.src(input);
}

function createDestStream(output) {
  if (isStream(output)) return vinylToWritable(output); //convert from vinyl stream to regular stream
  return vfs.dest(output);
}

function vinylToWritable(writeable) {
  return through2.obj(function(file, enc, cb) {
    writeable.write(file.contents.toString(), enc, cb);
    writeable.end();
  });
};

module.exports = { createSourceStream: createSourceStream, createDestinationStream: createDestStream }
