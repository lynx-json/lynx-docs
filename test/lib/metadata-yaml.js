"use strict";

var should = require("chai").should();
var getMetadata = require("../../src/lib/metadata-yaml");

describe("when getting metadata for a key/value pair", function () {
  describe("a bare key", function () {
    it("should return correct metadata", function () {
      var meta = getMetadata("bareKey");
      meta.key.should.equal("bareKey");
      should.not.exist(meta.template);
    });
  });

  describe("a key without templates/partials", function () {
    it("should return correct metadata", function () {
      var meta = getMetadata({ key: "normal" });
      meta.key.should.equal("normal");
      should.not.exist(meta.template);
    });
  });

  describe("an object template key without a name", function () {
    it("should return correct metadata", function () {
      var meta = getMetadata({ key: "objectTemplate#" });
      meta.key.should.equal("objectTemplate");
      should.exist(meta.template);
      meta.template.type.should.equal("object");
      meta.template.section.should.equal("#objectTemplate");
    });
  });

  describe("an inverse object template key without a name", function () {
    it("should return correct metadata", function () {
      var meta = getMetadata({ key: "inverseObjectTemplate^" });
      meta.key.should.equal("inverseObjectTemplate");
      should.exist(meta.template);
      meta.template.type.should.equal("object");
      meta.template.section.should.equal("^inverseObjectTemplate");
    });
  });

  describe("an array template key without a name", function () {
    it("should return correct metadata", function () {
      var meta = getMetadata({ key: "arrayTemplate@" });
      meta.key.should.equal("arrayTemplate");
      should.exist(meta.template);
      meta.template.type.should.equal("array");
      meta.template.section.should.equal("@arrayTemplate");
    });
  });
  
  describe("a simple value template key without a name", function () {
    it("should return correct metadata", function () {
      var meta = getMetadata({ key: "simpleTemplate<" });
      meta.key.should.equal("simpleTemplate");
      should.exist(meta.template);
      meta.template.type.should.equal("simple");
      meta.template.section.should.equal("<simpleTemplate");
    });
  });

  describe("an object template key with a name", function () {
    it("should return correct metadata", function () {
      var meta = getMetadata({ key: "objectTemplate#dataVariable" });
      meta.key.should.equal("objectTemplate");
      should.exist(meta.template);
      meta.template.type.should.equal("object");
      meta.template.section.should.equal("#dataVariable");
    });
  });

  describe("an inverse object template key with a name", function () {
    it("should return correct metadata", function () {
      var meta = getMetadata({ key: "inverseObjectTemplate^dataVariable" });
      meta.key.should.equal("inverseObjectTemplate");
      should.exist(meta.template);
      meta.template.type.should.equal("object");
      meta.template.section.should.equal("^dataVariable");
    });
  });

  describe("an array template key with a name", function () {
    it("should return correct metadata", function () {
      var meta = getMetadata({ key: "arrayTemplate@dataVariable" });
      meta.key.should.equal("arrayTemplate");
      should.exist(meta.template);
      meta.template.type.should.equal("array");
      meta.template.section.should.equal("@dataVariable");
    });
  });
  
  describe("a simple value template key with a name", function () {
    it("should return correct metadata", function () {
      var meta = getMetadata({ key: "simpleTemplate<dataVariable" });
      meta.key.should.equal("simpleTemplate");
      should.exist(meta.template);
      meta.template.type.should.equal("simple");
      meta.template.section.should.equal("<dataVariable");
    });
  });

  describe("child key without templates/partials", function () {
    it("should return correct metadata", function () {
      var meta = getMetadata({ key: undefined, value: { greeting: "Hi" } });
      should.exist(meta.children);
      should.exist(meta.children.greeting);
      meta.children.greeting.length.should.equal(1);
      meta.children.greeting[0].src.key.should.equal("greeting");
      meta.children.greeting[0].key.should.equal("greeting");
    });
  });

  describe("child object template key without a name", function () {
    it("should return correct metadata", function () {
      var meta = getMetadata({ key: undefined, value: { "greeting#": { message: "{{{message}}}" } } });
      should.exist(meta.children);
      should.exist(meta.children.greeting);
      meta.children.greeting.length.should.equal(1);
      meta.children.greeting[0].src.key.should.equal("greeting#");
      meta.children.greeting[0].key.should.equal("greeting");
      meta.children.greeting[0].template.type.should.equal("object");
      meta.children.greeting[0].template.section.should.equal("#greeting");
    });
  });

  describe("child inverse object template key without a name", function () {
    it("should return correct metadata", function () {
      var meta = getMetadata({ key: undefined, value: { "greeting^": { message: "{{{message}}}" } } });
      should.exist(meta.children);
      should.exist(meta.children.greeting);
      meta.children.greeting.length.should.equal(1);
      meta.children.greeting[0].src.key.should.equal("greeting^");
      meta.children.greeting[0].key.should.equal("greeting");
      meta.children.greeting[0].template.type.should.equal("object");
      meta.children.greeting[0].template.section.should.equal("^greeting");
    });
  });

  describe("child array template key without a name", function () {
    it("should return correct metadata", function () {
      var meta = getMetadata({ key: undefined, value: { "greetings@": "{{{message}}}" } });
      should.exist(meta.children);
      should.exist(meta.children.greetings);
      meta.children.greetings[0].src.key.should.equal("greetings@");
      meta.children.greetings[0].key.should.equal("greetings");
      meta.children.greetings[0].template.type.should.equal("array");
      meta.children.greetings[0].template.section.should.equal("@greetings");
    });
  });

  describe("child object template key with a name", function () {
    it("should return correct metadata", function () {
      var meta = getMetadata({ key: undefined, value: { "greeting#dataVariable": { message: "{{{message}}}" } } });
      should.exist(meta.children);
      should.exist(meta.children.greeting);
      meta.children.greeting.length.should.equal(1);
      meta.children.greeting[0].src.key.should.equal("greeting#dataVariable");
      meta.children.greeting[0].key.should.equal("greeting");
      meta.children.greeting[0].template.type.should.equal("object");
      meta.children.greeting[0].template.section.should.equal("#dataVariable");
    });
  });

  describe("child inverse object template key with a name", function () {
    it("should return correct metadata", function () {
      var meta = getMetadata({ key: undefined, value: { "greeting^dataVariable": { message: "{{{message}}}" } } });
      should.exist(meta.children);
      should.exist(meta.children.greeting);
      meta.children.greeting.length.should.equal(1);
      meta.children.greeting[0].src.key.should.equal("greeting^dataVariable");
      meta.children.greeting[0].key.should.equal("greeting");
      meta.children.greeting[0].template.type.should.equal("object");
      meta.children.greeting[0].template.section.should.equal("^dataVariable");
    });
  });
  
  describe("child with two object templates", function () {
    it("should return correct metadata", function () {
      var meta = getMetadata({ key: undefined, value: { "greeting#dataVariable": { message: "{{{message}}}" }, "greeting^dataVariable": { message: "{{{message}}}" } } });
      should.exist(meta.children);
      should.exist(meta.children.greeting);
      meta.children.greeting.length.should.equal(2);
      meta.children.greeting[0].src.key.should.equal("greeting#dataVariable");
      meta.children.greeting[0].key.should.equal("greeting");
      meta.children.greeting[0].template.type.should.equal("object");
      meta.children.greeting[0].template.section.should.equal("#dataVariable");
      meta.children.greeting[1].src.key.should.equal("greeting^dataVariable");
      meta.children.greeting[1].key.should.equal("greeting");
      meta.children.greeting[1].template.type.should.equal("object");
      meta.children.greeting[1].template.section.should.equal("^dataVariable");
    });
  });

  describe("child array template key with a name", function () {
    it("should return correct metadata", function () {
      var meta = getMetadata({ key: undefined, value: { "greetings@dataVariable": "{{{message}}}" } });
      should.exist(meta.children);
      should.exist(meta.children.greetings);
      meta.children.greetings[0].src.key.should.equal("greetings@dataVariable");
      meta.children.greetings[0].key.should.equal("greetings");
      meta.children.greetings[0].template.type.should.equal("array");
      meta.children.greetings[0].template.section.should.equal("@dataVariable");
    });
  });
});
