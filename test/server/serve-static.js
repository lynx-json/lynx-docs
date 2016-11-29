"use strict";

var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var sinon = require("sinon");
var fs = require("fs");
var url = require("url");
var path = require("path");
var mime = require("mime");

var serveStatic = require("../../src/server/serve-static");

describe.only("serve static module", function () {
  describe("handler creation", function () {
    var handler = serveStatic({});

    it("should return a function", function () {
      expect(handler).to.be.a.Function;
    });

    it("should accept three arguments", function () {
      expect(handler.length).to.equal(3);
    });
  });

  describe("when filename exists on request", function () {
    var handler = serveStatic({});
    it("should not resolve file name", function () {
      var req = { filename: "test.bin" };
      var parseSpy = sinon.spy(url, "parse");

      handler(req, {}, function () {});
      expect(parseSpy.called).to.be.false;
    })
  });

  describe("when path is resolved from url", function () {
    var handler = serveStatic({ root: ["a", "b"] });

    afterEach(function () {
      if(fs.existsSync.restore) fs.existsSync.restore();
      if(path.extname.restore) path.extname.restore();
      if(fs.stat.restore) fs.stat.restore();
    })

    it("should call next if path has no extension", function () {
      var req = { url: "test" };
      var stub = sinon.stub(path, "extname").returns("");
      var spy = sinon.spy();

      handler(req, {}, spy);
      expect(stub.called).to.be.true;
      expect(spy.called).to.be.true;
    });

    it("should call next if file doesn't exist", function () {
      var req = { url: "test.txt" };
      var stub = sinon.stub(fs, "existsSync").returns(false);
      var spy = sinon.spy();

      handler(req, {}, spy);
      expect(stub.called).to.be.true;
      expect(spy.called).to.be.true;
    });

    it("should attach filename to request when file exists", function () {
      var req = { url: "test.txt" };
      sinon.stub(fs, "existsSync").returns(true);
      var statSpy = sinon.spy(fs, "stat");
      var spy = sinon.spy();

      handler(req, {}, spy);
      expect(statSpy.called).to.be.true;
    });
  });

  describe("serve file", function () {
    var handler = serveStatic({});

    afterEach(function () {
      fs.stat.restore();
      if(fs.readFile.restore) fs.readFile.restore();
    })

    it("should check file system stats", function () {
      var spy = sinon.spy(fs, "stat");
      var req = { filename: "test.bin" };
      handler(req, {}, function () {});
      expect(spy.called).to.be.true;
    });

    it("should call next on stat error", function () {
      var req = { filename: "test.bin" };
      sinon.stub(fs, "stat", function (path, callback) {
        callback({}, null);
      });
      var spy = sinon.spy();

      handler(req, {}, spy);
      expect(spy.called).to.be.true;
    });

    it("should call next when path is directory", function () {
      var req = { filename: "test" };
      sinon.stub(fs, "stat", function (path, callback) {
        callback(null, { isDirectory: function () { return true; } });
      });
      var spy = sinon.spy();

      handler(req, {}, spy);
      expect(spy.called).to.be.true;
    });

    it("should call next on readFile error", function () {
      var req = { filename: "test.txt" };
      sinon.stub(fs, "stat", function (path, callback) {
        callback(null, { isDirectory: function () { return false; } });
      });
      sinon.stub(fs, "readFile", function (path, encoding, callback) {
        callback({}, null);
      });
      var spy = sinon.spy();

      handler(req, {}, spy);
      expect(spy.called).to.be.true;
    });

    it("should write contents on successful file read", function () {
      var req = { filename: "test.txt" };
      var contents = "Test data";

      var res = { end: function () {}, write: function () {}, writeHead: function () {} }
      var endSpy = sinon.spy(res, "end");
      var writeSpy = sinon.spy(res, "write");
      var writeHeadSpy = sinon.spy(res, "writeHead");

      sinon.stub(fs, "stat", function (path, callback) {
        callback(null, { isDirectory: function () { return false; } });
      });
      sinon.stub(fs, "readFile", function (path, encoding, callback) {
        callback(null, contents);
      });

      handler(req, res, null);
      expect(writeHeadSpy.called).to.be.true;
      expect(writeHeadSpy.calledWith(200, { "Content-Type": "text/plain" })).to.be.true;
      expect(writeSpy.called).to.be.true;
      expect(writeSpy.calledWith(contents, "binary")).to.be.true;
      expect(endSpy.called).to.be.true;
    });

  });
});
