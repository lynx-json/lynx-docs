var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var sinon = require("sinon");
var getFolderMetadata = require("../../src/lib/meta-folder");
var fs = require("fs");

function statsStub(isDirectory) {
  return {
    isDirectory: function() { return isDirectory; },
    isFile: function() { return !isDirectory; }
  }
}

describe.only("when getting metadata for a folder", function () {
  var meta;

  afterEach(function () {
    fs.readdirSync.restore();
    fs.statSync.restore();
  });

  describe("a folder with template ['one.lynx.yml']", function () {
    beforeEach(function () {
      sinon.stub(fs, "readdirSync").withArgs("/x").returns(["one.lynx.yml"]);
      sinon.stub(fs, "statSync").withArgs("/x/one.lynx.yml").returns(statsStub(false));
      meta = getFolderMetadata("/x");
    });

    it("should have a single state, 'one'", function () {
      meta.variants.length.should.equal(1);
      meta.variants[0].name.should.equal("one");
    });

    it("should have a value for template only", function () {
      should.exist(meta.variants[0].template);
      should.not.exist(meta.variants[0].data);
    });
  });

  describe("a folder with templates ['default.lynx.yml', 'two.lynx.yml']", function () {
    beforeEach(function () {
      sinon.stub(fs, "readdirSync").withArgs("/x").returns(["default.lynx.yml", "two.lynx.yml"]);
      sinon.stub(fs, "statSync").returns(statsStub(false));
      meta = getFolderMetadata("/x");
    });

    it("should have two states, 'default' and 'two'", function () {
      meta.variants.length.should.equal(2);
      meta.variants[0].name.should.equal("default");
      meta.variants[1].name.should.equal("two");
    });

    it("should have a value for template only", function () {
      meta.variants.forEach(function(variant){
        should.exist(variant.template);
        should.not.exist(variant.data);
      })
    });

  });

  describe("a folder with template ['one.lynx.yml'] and data ['one.data.yml']", function () {
    beforeEach(function () {
      sinon.stub(fs, "readdirSync").withArgs("/x").returns(["one.lynx.yml", "one.data.yml"]);
      sinon.stub(fs, "statSync").returns(statsStub(false));
      meta = getFolderMetadata("/x");
    });

    it("should have one variant, 'one'", function () {
      meta.variants.length.should.equal(1);
      meta.variants[0].name.should.equal("one");
    });

    it("should have a value for template and data", function () {
      should.exist(meta.variants[0].template);
      should.exist(meta.variants[0].data);
    });
  });

  describe("a folder with template ['one.lynx.yml'] and data ['one.data.variant.yml']", function () {
    beforeEach(function () {
      sinon.stub(fs, "readdirSync").withArgs("/x").returns(["one.lynx.yml", "one.data.variant.yml"]);
      sinon.stub(fs, "statSync").returns(statsStub(false));
      meta = getFolderMetadata("/x");
    });

    it("should have one variant, 'variant'", function () {
      meta.variants.length.should.equal(1);
      meta.variants[0].name.should.equal("variant");
    });

    it("should have a value for template and data", function () {
      should.exist(meta.variants[0].template);
      should.exist(meta.variants[0].data);
    });
  });

  describe("a folder with template ['default.lynx.yml'] and data ['default.data'] that contains ['default.yml']", function () {

    beforeEach(function () {
      var readDirStuf = sinon.stub(fs, "readdirSync");
      readDirStuf.withArgs("/x").returns(["default.lynx.yml", "default.data"]);
      readDirStuf.withArgs("/x/default.data").returns(["default.yml"]);
      var statStub = sinon.stub(fs, "statSync");
      statStub.withArgs("/x/default.data").returns(statsStub(true));
      statStub.returns(statsStub(false));
      meta = getFolderMetadata("/x");
    });

    it("should have one state, 'default'", function () {
      meta.variants.length.should.equal(1);
      meta.variants[0].name.should.equal("default");
    });

    it("should have a value for template and data", function () {
      should.exist(meta.variants[0].template);
      should.exist(meta.variants[0].data);
    });
  });

  describe("a folder with template ['one.lynx.yml'] and data ['one.data'] that contains ['default.yml', 'invalid.yml']", function () {

    beforeEach(function () {
      var readDirStuf = sinon.stub(fs, "readdirSync");
      readDirStuf.withArgs("/x").returns(["one.lynx.yml", "one.data"]);
      readDirStuf.withArgs("/x/one.data").returns(["default.yml", "invalid.yml"]);
      var statStub = sinon.stub(fs, "statSync");
      statStub.withArgs("/x/one.data").returns(statsStub(true));
      statStub.returns(statsStub(false));
      meta = getFolderMetadata("/x");
    });

    it("should have two states, 'one-default' and 'one-invalid'", function () {
      meta.variants.length.should.equal(2);
      meta.variants[0].name.should.equal("one-default");
      meta.variants[1].name.should.equal("one-invalid");
    });

    it("should have a value for template and data", function () {
      meta.variants.forEach(function(variant){
        should.exist(variant.template);
        should.exist(variant.data);
      })
    });
  });
});
