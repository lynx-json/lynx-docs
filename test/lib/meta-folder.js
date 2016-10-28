var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var sinon = require("sinon");
var getFolderMetadata = require("../../src/lib/meta-folder");
var fs = require("fs");
var path = require("path");

function statsStub(isDirectory) {
  return {
    isDirectory: function() { return isDirectory; },
    isFile: function() { return !isDirectory; }
  }
}

describe("when deriving metadata from a folder", function() {

  afterEach(function() {
    fs.readdirSync.restore();
    if (fs.statSync.restore) fs.statSync.restore();
  });

  describe("a folder with name 'x'", function() {
    var realm;

    beforeEach(function() {
      sinon.stub(fs, "readdirSync").returns([]);
      realm = getFolderMetadata("x");
    });

    it("should have a realm name of '/x/'", function() {
      realm.realm.should.equal("/x/");
    });
  });

  describe("a folder with name 'x' and sub folders ['y', 'z']", function() {
    var realm;

    beforeEach(function() {
      var readdirStub = sinon.stub(fs, "readdirSync");
      readdirStub.withArgs("x").returns(['y', 'z']);
      readdirStub.returns([]);

      sinon.stub(fs, "statSync").returns(statsStub(true));
      realm = getFolderMetadata("x");
    });

    it("should have a realm value of '/x/' and name ['x']", function() {
      realm.realm.should.equal("/x/");
      realm.name.should.equal("x");
    });

    it("should have realms with value of ['/x/y/','/x/z/'] and name ['y', 'z']", function() {
      var children = realm.realms;
      children.length.should.equal(2);
      children[0].realm.should.equal("/x/y/");
      children[0].name.should.equal("y");
      children[1].realm.should.equal("/x/z/");
      children[1].name.should.equal("z");
    });
  });

  describe("a folder with template ['one.lynx.yml']", function() {
    var variants;

    beforeEach(function() {
      sinon.stub(fs, "readdirSync").withArgs("x").returns(["one.lynx.yml"]);
      sinon.stub(fs, "statSync").returns(statsStub(false));
      variants = getFolderMetadata("x").variants;
    });

    it("should have a variants ['one']", function() {
      variants.length.should.equal(1);
      variants[0].name.should.equal("one");
    });

    it("should have a value for template only", function() {
      should.exist(variants[0].template);
      should.not.exist(variants[0].data);
    });
  });

  describe("a folder with templates ['default.lynx.yml', 'two.lynx.yml']", function() {
    var variants;

    beforeEach(function() {
      sinon.stub(fs, "readdirSync").withArgs("x").returns(["default.lynx.yml", "two.lynx.yml"]);
      sinon.stub(fs, "statSync").returns(statsStub(false));
      variants = getFolderMetadata("x").variants;
    });

    it("should have variants ['default', 'two']", function() {
      variants.length.should.equal(2);
      variants[0].name.should.equal("default");
      variants[1].name.should.equal("two");
    });

    it("should have a value for template only", function() {
      variants.forEach(function(variant) {
        should.exist(variant.template);
        should.not.exist(variant.data);
      })
    });

  });

  describe("a folder with templates ['default.lynx.yml', 'two.lynx.yml'] and data ['default.data.yml']", function() {
    var variants;

    beforeEach(function() {
      sinon.stub(fs, "readdirSync").withArgs("x").returns(["default.lynx.yml", "two.lynx.yml", "default.data.yml"]);
      sinon.stub(fs, "statSync").returns(statsStub(false));
      variants = getFolderMetadata("x").variants;
    });

    it("should have variants ['default', 'two']", function() {
      variants.length.should.equal(2);
      variants[0].name.should.equal("default");
      variants[1].name.should.equal("two");
    });

    it("'default' should have a value for template and data", function() {
      should.exist(variants[0].template);
      should.exist(variants[0].data);
    });

    it("'two' should have a value for template only", function() {
      should.exist(variants[1].template);
      should.not.exist(variants[1].data);
    });
  });

  describe("a folder with template ['one.lynx.yml'] and data ['one.data.yml']", function() {
    var variants;

    beforeEach(function() {
      sinon.stub(fs, "readdirSync").withArgs("x").returns(["one.lynx.yml", "one.data.yml"]);
      sinon.stub(fs, "statSync").returns(statsStub(false));
      variants = getFolderMetadata("x").variants;
    });

    it("should have variants ['one']", function() {
      variants.length.should.equal(1);
      variants[0].name.should.equal("one");
    });

    it("should have a value for template and data", function() {
      should.exist(variants[0].template);
      should.exist(variants[0].data);
    });
  });

  describe("a folder with template ['one.lynx.yml'] and data ['one.data.variant.yml']", function() {
    var variants;

    beforeEach(function() {
      sinon.stub(fs, "readdirSync").withArgs("x").returns(["one.lynx.yml", "one.data.variant.yml"]);
      sinon.stub(fs, "statSync").returns(statsStub(false));
      variants = getFolderMetadata("x").variants;
    });

    it("should have variants ['variant']", function() {
      variants.length.should.equal(1);
      variants[0].name.should.equal("variant");
    });

    it("should have a value for template and data", function() {
      should.exist(variants[0].template);
      should.exist(variants[0].data);
    });
  });

  describe("a folder with template ['default.lynx.yml'] and data ['default.data'] that contains ['default.yml']", function() {
    var variants;

    beforeEach(function() {
      var readDirStub = sinon.stub(fs, "readdirSync");
      readDirStub.withArgs("x").returns(["default.lynx.yml", "default.data"]);
      readDirStub.withArgs(path.join("x", "default.data")).returns(["default.yml"]);
      var statStub = sinon.stub(fs, "statSync");
      statStub.withArgs(path.join("x", "default.data")).returns(statsStub(true));
      statStub.returns(statsStub(false));
      variants = getFolderMetadata("x").variants;
    });

    it("should have variants ['default']", function() {
      variants.length.should.equal(1);
      variants[0].name.should.equal("default");
    });

    it("should have a value for template and data", function() {
      should.exist(variants[0].template);
      should.exist(variants[0].data);
    });
  });

  describe("a folder with template ['one.lynx.yml'] and data ['one.data'] that contains ['default.yml', 'invalid.yml']", function() {
    var variants;

    beforeEach(function() {
      var readDirStub = sinon.stub(fs, "readdirSync");
      readDirStub.withArgs("x").returns(["one.lynx.yml", "one.data"]);
      readDirStub.withArgs(path.join("x", "one.data")).returns(["default.yml", "invalid.yml"]);
      var statStub = sinon.stub(fs, "statSync");
      statStub.withArgs(path.join("x", "one.data")).returns(statsStub(true));
      statStub.returns(statsStub(false));
      variants = getFolderMetadata("x").variants;
    });

    it("should have variants ['one', 'invalid']", function() {
      variants.length.should.equal(2);
      variants[0].name.should.equal("one");
      variants[1].name.should.equal("invalid");
    });

    it("should have a value for template and data", function() {
      variants.forEach(function(variant) {
        should.exist(variant.template);
        should.exist(variant.data);
      })
    });
  });
});
