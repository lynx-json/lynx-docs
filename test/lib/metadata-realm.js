var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var sinon = require("sinon");
var getFolderMetadata = require("../../src/lib/metadata-realm");
var fs = require("fs");
var path = require("path");
var YAML = require("yamljs");

function statsFake(isDirectory) {
  return {
    isDirectory: function() { return isDirectory; },
    isFile: function() { return !isDirectory; }
  };
}

function toYamlBuffer(value) {
  return new Buffer(YAML.stringify(value, null));
}

describe("when finding a realm", function() {
  var realm;
  var meta = {
    realm: "/",
    name: "Root",
    variants: [{ name: "default", template: "default.lynx.yml" }],
    realms: [{
      realm: "/y/",
      name: "child"
    }]
  };

  beforeEach(function() {
    sinon.stub(fs, "readdirSync").returns([".meta.yml"]);
    sinon.stub(fs, "readFileSync").returns(toYamlBuffer(meta));
    sinon.stub(fs, "statSync").returns(statsFake(false));
    realm = getFolderMetadata("x");
  });

  afterEach(function() {
    fs.readdirSync.restore();
    fs.readFileSync.restore();
    if (fs.statSync.restore) fs.statSync.restore();
  });

  describe("having no matching items", function() {
    var predicate = sinon.spy(function(item) { return false; });

    it("should call predicate for all items", function() {
      var result = realm.find(predicate);
      expect(predicate.callCount).equals(3);
    });

    it("should have a falsey result", function() {
      var result = realm.find(predicate);
      should.not.exist(result);
    });

  });
  describe("having matching variant", function() {
    var predicate = sinon.spy(function(item) { return item.type === "variant"; });

    it("should result in variant", function() {
      var result = realm.find(predicate);
      expect(result).equal(realm.variants[0]);
    });
  });
  describe("having matching realm", function() {
    var predicate = sinon.spy(function(item) { return item.type === "realm" && item.realm !== "/"; });

    it("should result in realm", function() {
      var result = realm.find(predicate);
      expect(result.realm).to.equal(realm.realms[0].realm);
    });
  });
  describe("having matching variant and matching realm", function() {
    var predicate = sinon.spy(function(item) { return item.parent !== undefined; });

    it("should result in variant", function() {
      var result = realm.find(predicate);
      expect(result).eql(realm.variants[0]);
    });
  });
});

describe("when applying custom metadata", function() {
  afterEach(function() {
    fs.readdirSync.restore();
    fs.readFileSync.restore();
    if (fs.statSync.restore) fs.statSync.restore();
  });

  describe("a folder with .meta.yml with standard and custom keys", function() {
    var realm;
    var meta = { realm: "/desktop/", name: "Desktop", custom: "My Value", arr: ['One', 'Tow'], obj: { one: "One" } };

    beforeEach(function() {
      sinon.stub(fs, "readdirSync").returns([".meta.yml"]);
      sinon.stub(fs, "readFileSync").returns(toYamlBuffer(meta));
      sinon.stub(fs, "statSync").returns(statsFake(false));
      realm = getFolderMetadata("x");
    });

    it("should have copied meta properties to realm", function() {
      realm.realm.should.equal(meta.realm);
      realm.name.should.equal(meta.name);
      realm.custom.should.equal(meta.custom);
      expect(meta.arr).to.eql(realm.arr);
      expect(meta.obj).to.eql(realm.obj);
    });

    it("should have removed meta key", function() {
      should.not.exist(realm.meta);
    });
  });

  describe("a folder with variants ['default'] and .meta.yml with variants ['y','z'].", function() {
    var realm;
    var meta = { variants: [{ name: "y", template: "t-y" }, { name: "z", template: "t-z" }] };

    beforeEach(function() {
      sinon.stub(fs, "readdirSync").returns([".meta.yml", "default.lynx.yml"]);
      sinon.stub(fs, "readFileSync").returns(toYamlBuffer(meta));
      sinon.stub(fs, "statSync").returns(statsFake(false));
      realm = getFolderMetadata("x");
    });

    it("should have variants ['default', 'y', 'z']", function() {
      realm.variants.length.should.equal(3);
      realm.variants[0].name.should.equal("default");
      realm.variants[1].name.should.equal("y");
      realm.variants[2].name.should.equal("z");
    });
  });
  describe("a folder with variants ['default'] and .meta.yml with variants ['default'].", function() {
    var realm;
    var meta = { variants: [{ name: "default", template: "default.lynx.yml", custom: "One" }] };

    beforeEach(function() {
      sinon.stub(fs, "readdirSync").returns([".meta.yml", "default.lynx.yml"]);
      sinon.stub(fs, "readFileSync").returns(toYamlBuffer(meta));
      sinon.stub(fs, "statSync").returns(statsFake(false));
      realm = getFolderMetadata("x");
    });

    it("should have variants ['default']", function() {
      realm.variants.length.should.equal(1);
      realm.variants[0].name.should.equal("default");
    });

    it("should use variant from .meta.yml", function() {
      should.exist(realm.variants[0].custom);
      realm.variants[0].custom.should.equal(meta.variants[0].custom);
    });
  });
  describe("a folder with .meta.yml with realms ['/y/']", function() {
    var realm;
    var meta = { realms: [{ name: "The Y Realm", realm: "/y/" }] };

    beforeEach(function() {
      sinon.stub(fs, "readdirSync").returns([".meta.yml"]);
      sinon.stub(fs, "readFileSync").returns(toYamlBuffer(meta));
      sinon.stub(fs, "statSync").returns(statsFake(false));
      realm = getFolderMetadata("x");
    });

    it("should have realm ['/y/']", function() {
      realm.realms.length.should.equal(1);
      realm.realms[0].name.should.equal(meta.realms[0].name);
      realm.realms[0].realm.should.equal("/y/");
    });
  });
  describe("a folder with child folders ['y'] and .meta.yml with realms ['y']", function() {
    var realm;
    var meta = { realms: [{ name: "The Y Realm", realm: "./y/" }] };

    beforeEach(function() {
      sinon.stub(fs, "readdirSync").returns([".meta.yml", "y"]);
      sinon.stub(fs, "readFileSync").returns(toYamlBuffer(meta));
      var statStub = sinon.stub(fs, "statSync");
      statStub.withArgs(path.join("x", "y")).returns(statsFake(true));
      statStub.returns(statsFake(false));
      realm = getFolderMetadata("x");
    });

    it("should use realm from filesystem and not .meta.yml", function() {
      realm.realms.length.should.equal(1);
      realm.realms[0].name.should.not.equal(meta.realms[0].name);
      realm.realms[0].name.should.equal('y');
      realm.realms[0].realm.should.equal("/y/");
    });
  });
  describe("a folder with .meta.yml with variants ['y'].", function() {
    var realm;
    var meta = { variants: [{ name: "y", template: "t-y" }] };

    beforeEach(function() {
      sinon.stub(fs, "readdirSync").returns([".meta.yml"]);
      sinon.stub(fs, "readFileSync").returns(toYamlBuffer(meta));
      sinon.stub(fs, "statSync").returns(statsFake(false));
      realm = getFolderMetadata("x");
    });

    it("should have default 'y'", function() {
      realm.variants.length.should.equal(1);
      var variant = realm.getDefaultVariant();
      should.exist(variant);
      variant.name.should.equal("y");
    });
  });
  describe("a folder with .meta.yml with variants ['y', 'z'] and no default.", function() {
    var realm;
    var meta = { variants: [{ name: "y", template: "t-y" }, { name: "z", template: "t-z" }] };

    beforeEach(function() {
      sinon.stub(fs, "readdirSync").returns([".meta.yml"]);
      sinon.stub(fs, "readFileSync").returns(toYamlBuffer(meta));
      sinon.stub(fs, "statSync").returns(statsFake(false));
      realm = getFolderMetadata("x");
    });

    it("should not have default", function() {
      realm.variants.length.should.equal(2);
      var variant = realm.getDefaultVariant();
      should.not.exist(variant);
    });
  });
  describe("a folder with .meta.yml with variants ['y', 'z'] and default 'z'", function() {
    var realm;
    var meta = { "default": "z", variants: [{ name: "y", template: "t-y" }, { name: "z", template: "t-z" }] };

    beforeEach(function() {
      sinon.stub(fs, "readdirSync").returns([".meta.yml"]);
      sinon.stub(fs, "readFileSync").returns(toYamlBuffer(meta));
      sinon.stub(fs, "statSync").returns(statsFake(false));
      realm = getFolderMetadata("x");
    });

    it("should have default 'z'", function() {
      realm.variants.length.should.equal(2);
      var variant = realm.getDefaultVariant();
      should.exist(variant);
      variant.name.should.equal("z");
    });
  });
  describe("a folder with .meta.yml with variants ['default', 'z'] and no default.", function() {
    var realm;
    var meta = { variants: [{ name: "default", template: "t-default" }, { name: "z", template: "t-z" }] };

    beforeEach(function() {
      sinon.stub(fs, "readdirSync").returns([".meta.yml"]);
      sinon.stub(fs, "readFileSync").returns(toYamlBuffer(meta));
      sinon.stub(fs, "statSync").returns(statsFake(false));
      realm = getFolderMetadata("x");
    });

    it("should have default 'default'", function() {
      realm.variants.length.should.equal(2);
      var variant = realm.getDefaultVariant();
      should.exist(variant);
      variant.name.should.equal("default");
    });
  });
});

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

    it("should have a realm value of '/'", function() {
      realm.realm.should.equal("/");
    });
  });

  describe("a folder with name 'x' and sub folders ['y', 'z']", function() {
    var realm;

    beforeEach(function() {
      var readdirStub = sinon.stub(fs, "readdirSync");
      readdirStub.withArgs("x").returns(['y', 'z']);
      readdirStub.returns([]);

      sinon.stub(fs, "statSync").returns(statsFake(true));
      realm = getFolderMetadata("x");
    });

    it("should have a realm value of '/' and name ['x']", function() {
      realm.realm.should.equal("/");
      realm.name.should.equal("x");
    });

    it("should have realms with value of ['/y/','/z/'] and name ['y', 'z']", function() {
      var children = realm.realms;
      children.length.should.equal(2);
      children[0].realm.should.equal("/y/");
      children[0].name.should.equal("y");
      children[1].realm.should.equal("/z/");
      children[1].name.should.equal("z");
    });
  });

  describe("a folder with template ['one.lynx.yml']", function() {
    var variants;

    beforeEach(function() {
      sinon.stub(fs, "readdirSync").withArgs("x").returns(["one.lynx.yml"]);
      sinon.stub(fs, "statSync").returns(statsFake(false));
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
      sinon.stub(fs, "statSync").returns(statsFake(false));
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
      });
    });

  });

  describe("a folder with templates ['default.lynx.yml', 'two.lynx.yml'] and data ['default.data.yml']", function() {
    var variants;

    beforeEach(function() {
      sinon.stub(fs, "readdirSync").withArgs("x").returns(["default.lynx.yml", "two.lynx.yml", "default.data.yml"]);
      sinon.stub(fs, "statSync").returns(statsFake(false));
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
      sinon.stub(fs, "statSync").returns(statsFake(false));
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

  describe("a folder with template ['one.lynx.yml'] and data ['one.variant.data.yml']", function() {
    var variants;

    beforeEach(function() {
      sinon.stub(fs, "readdirSync").withArgs("x").returns(["one.lynx.yml", "one.variant.data.yml"]);
      sinon.stub(fs, "statSync").returns(statsFake(false));
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
      statStub.withArgs(path.join("x", "default.data")).returns(statsFake(true));
      statStub.returns(statsFake(false));
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
      statStub.withArgs(path.join("x", "one.data")).returns(statsFake(true));
      statStub.returns(statsFake(false));
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
      });
    });
  });
});
