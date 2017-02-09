"use strict";

var chai = require("chai");
var expect = chai.expect;
var should = chai.should();
var getMetadata = require("../../src/lib/metadata-yaml");

function runTest(test) {
  var actual = getMetadata(test.actual);
  if (typeof test.expected === "function") {
    test.expected(actual);
  } else {
    test.expected.src = actual.src;
    actual.should.deep.equal(test.expected);  
  }
}

function ot(variable, inverse) {
  var tag = inverse ? "^" : "#";
  return {
    section: tag + variable,
    symbol: tag,
    type: "object",
    variable: variable
  };
}

function at(variable) {
  return {
    section: "@" + variable,
    symbol: "@",
    type: "array",
    variable: variable
  };
}

function lt(variable, quoted) {
  var tag = quoted ? "<" : "=";
  var lt = {
    section: tag + variable,
    symbol: tag,
    type: "literal",
    variable: variable
  };
  if(tag === "<") lt.quoted = true;
  return lt;
}

var tests = [{
    actual: "bareKey",
    expected: { key: "bareKey" },
    description: "a bare key",
    should: "should return correct metadata"
  },
  {
    actual: { key: "normal" },
    expected: { key: "normal" },
    description: "a key without templates/partials",
    should: "should return correct metadata"
  }, {
    actual: { key: "spec.hints" },
    expected: { key: "spec.hints" },
    description: "a namespaced key (for partials)",
    should: "should return correct metadata"
  },
  {
    actual: { key: "objectTemplate#" },
    expected: { key: "objectTemplate", template: ot("objectTemplate") },
    description: "an object template key without a name",
    should: "should return correct metadata"
  },
  {
    actual: { key: "inverseObjectTemplate^" },
    expected: { key: "inverseObjectTemplate", template: ot("inverseObjectTemplate", true) },
    description: "an inverse object template key without a name",
    should: "should return correct metadata"
  },
  {
    actual: { key: "arrayTemplate@" },
    expected: { key: "arrayTemplate", template: at("arrayTemplate") },
    description: "an array template key without a name",
    should: "should return correct metadata"
  },
  {
    actual: { key: "literalTemplate<" },
    expected: { key: "literalTemplate", template: lt("literalTemplate", true) },
    description: "a quoted literal value template key without a name",
    should: "should return correct metadata"
  },
  {
    actual: { key: "objectTemplate#dataVariable" },
    expected: { key: "objectTemplate", template: ot("dataVariable") },
    description: "an object template key with a name",
    should: "should return correct metadata"
  },
  {
    actual: { key: "inverseObjectTemplate^dataVariable" },
    expected: { key: "inverseObjectTemplate", template: ot("dataVariable", true) },
    description: "an inverse object template key with a name",
    should: "should return correct metadata"
  },
  {
    actual: { key: "arrayTemplate@dataVariable" },
    expected: { key: "arrayTemplate", template: at("dataVariable") },
    description: "an array template key with a name",
    should: "should return correct metadata"
  },
  {
    actual: { key: "simpleTemplate<dataVariable" },
    expected: { key: "simpleTemplate", template: lt("dataVariable", true) },
    description: "a quoted literal value template key with a name",
    should: "should return correct metadata"
  },
  {
    actual: { key: ">partial" },
    expected: { partial: "partial" },
    description: "a partial key without a key name",
    should: "should return correct metadata"
  },
  {
    actual: { key: "<dataVariable" },
    expected: { template: lt("dataVariable", true) },
    description: "a quoted literal key without a key name",
    should: "should return correct metadata"
  },
  {
    actual: { key: "=dataVariable" },
    expected: { template: lt("dataVariable", false) },
    description: "a literal key without a key name",
    should: "should return correct metadata"
  },
  {
    actual: { key: "#dataVariable" },
    expected: { template: ot("dataVariable", false) },
    description: "an object template key key without a key name",
    should: "should return correct metadata"
  },
  {
    actual: { key: "^dataVariable" },
    expected: { template: ot("dataVariable", true) },
    description: "an inverse object template key key without a key name",
    should: "should return correct metadata"
  },
  {
    actual: { key: "@dataVariable" },
    expected: { template: at("dataVariable") },
    description: "an array template key key without a key name",
    should: "should return correct metadata"
  },
  {
    actual: {
      key: undefined,
      value: {
        "#a": {},
        "#b": {}
      }
    },
    expected: function (actual) {
      actual.templates.length.should.equal(2);
      actual.templates[0].template.should.deep.equal(ot("a"));
      actual.templates[1].template.should.deep.equal(ot("b"));
    },
    description: "a template container of two templates",
    should: "should return correct metadata"
  },
  {
    actual: {
      key: undefined,
      value: {
        "a#a": {},
        "a#b": {}
      }
    },
    expected: function (actual) {
      expect(actual.children.a).to.not.be.null;
      actual.children.a.templates.length.should.equal(2);
      actual.children.a.templates[0].template.should.deep.equal(ot("a"));
      actual.children.a.templates[1].template.should.deep.equal(ot("b"));
    },
    description: "a key with two templates",
    should: "should return correct metadata"
  },
  {
    actual: {
      key: undefined,
      value: {
        a: {
          "#a": {},
          "#b": {}  
        }
      }
    },
    expected: function (actual) {
      expect(actual.children.a).to.not.be.null;
      let meta = actual.children.a.more();
      meta.templates.length.should.equal(2);
      meta.templates[0].template.should.deep.equal(ot("a"));
      meta.templates[1].template.should.deep.equal(ot("b"));
    },
    description: "a key with a template container with two templates",
    should: "should return correct metadata"
  },
  {
    actual: {
      key: undefined,
      value: {
        "a<a": "a",
        "a=b": "b"
      }
    },
    expected: function (actual) {
      expect(actual.children.a).to.not.be.null;
      actual.children.a.templates.length.should.equal(2);
      actual.children.a.templates[0].template.should.deep.equal(lt("a", true));
      actual.children.a.templates[1].template.should.deep.equal(lt("b"));
    },
    description: "a key with two literal templates",
    should: "should return correct metadata"
  },
  {
    actual: {
      key: undefined,
      value: {
        a: {
          "<a": "a",
          "=b": "b"
        }
      }
    },
    expected: function (actual) {
      expect(actual.children.a).to.not.be.null;
      let meta = actual.children.a.more();
      meta.templates.length.should.equal(2);
      meta.templates[0].template.should.deep.equal(lt("a", true));
      meta.templates[1].template.should.deep.equal(lt("b"));
    },
    description: "a key with a template container with two literal templates",
    should: "should return correct metadata"
  }
];

describe("when getting metadata for a key/value pair", function () {
  tests.forEach(function (test) {
    it(test.description, function () {
      runTest(test);
    });
  });

  describe("child key without templates/partials", function () {
    it("should return correct metadata", function () {
      var meta = getMetadata({ key: undefined, value: { greeting: "Hi" } });
      should.exist(meta.children);
      should.exist(meta.children.greeting);
      meta.children.greeting.src.key.should.equal("greeting");
      meta.children.greeting.key.should.equal("greeting");
    });
  });

  describe("child object template key without a name", function () {
    it("should return correct metadata", function () {
      var meta = getMetadata({ key: undefined, value: { "greeting#": { message: "{{{message}}}" } } });
      should.exist(meta.children);
      should.exist(meta.children.greeting);
      meta.children.greeting.templates[0].src.key.should.equal("greeting#");
      meta.children.greeting.templates[0].key.should.equal("greeting");
      meta.children.greeting.templates[0].template.type.should.equal("object");
      meta.children.greeting.templates[0].template.section.should.equal("#greeting");
    });
  });

  describe("child inverse object template key without a name", function () {
    it("should return correct metadata", function () {
      var meta = getMetadata({ key: undefined, value: { "greeting^": { message: "{{{message}}}" } } });
      should.exist(meta.children);
      should.exist(meta.children.greeting);
      meta.children.greeting.templates.length.should.equal(1);
      meta.children.greeting.templates[0].src.key.should.equal("greeting^");
      meta.children.greeting.templates[0].key.should.equal("greeting");
      meta.children.greeting.templates[0].template.type.should.equal("object");
      meta.children.greeting.templates[0].template.section.should.equal("^greeting");
    });
  });

  describe("child array template key without a name", function () {
    it("should return correct metadata", function () {
      var meta = getMetadata({ key: undefined, value: { "greetings@": "{{{message}}}" } });
      should.exist(meta.children);
      should.exist(meta.children.greetings);
      meta.children.greetings.templates[0].src.key.should.equal("greetings@");
      meta.children.greetings.templates[0].key.should.equal("greetings");
      meta.children.greetings.templates[0].template.type.should.equal("array");
      meta.children.greetings.templates[0].template.section.should.equal("@greetings");
    });
  });

  describe("child object template key with a name", function () {
    it("should return correct metadata", function () {
      var meta = getMetadata({ key: undefined, value: { "greeting#dataVariable": { message: "{{{message}}}" } } });
      should.exist(meta.children);
      should.exist(meta.children.greeting);
      meta.children.greeting.templates.length.should.equal(1);
      meta.children.greeting.templates[0].src.key.should.equal("greeting#dataVariable");
      meta.children.greeting.templates[0].key.should.equal("greeting");
      meta.children.greeting.templates[0].template.type.should.equal("object");
      meta.children.greeting.templates[0].template.section.should.equal("#dataVariable");
    });
  });

  describe("child inverse object template key with a name", function () {
    it("should return correct metadata", function () {
      var meta = getMetadata({ key: undefined, value: { "greeting^dataVariable": { message: "{{{message}}}" } } });
      should.exist(meta.children);
      should.exist(meta.children.greeting);
      meta.children.greeting.templates.length.should.equal(1);
      meta.children.greeting.templates[0].src.key.should.equal("greeting^dataVariable");
      meta.children.greeting.templates[0].key.should.equal("greeting");
      meta.children.greeting.templates[0].template.type.should.equal("object");
      meta.children.greeting.templates[0].template.section.should.equal("^dataVariable");
    });
  });

  describe("child with two object templates", function () {
    it("should return correct metadata", function () {
      var meta = getMetadata({ key: undefined, value: { "greeting#dataVariable": { message: "{{{message}}}" }, "greeting^dataVariable": { message: "{{{message}}}" } } });
      should.exist(meta.children);
      should.exist(meta.children.greeting);
      meta.children.greeting.templates.length.should.equal(2);
      meta.children.greeting.templates[0].src.key.should.equal("greeting#dataVariable");
      meta.children.greeting.templates[0].key.should.equal("greeting");
      meta.children.greeting.templates[0].template.type.should.equal("object");
      meta.children.greeting.templates[0].template.section.should.equal("#dataVariable");
      meta.children.greeting.templates[1].src.key.should.equal("greeting^dataVariable");
      meta.children.greeting.templates[1].key.should.equal("greeting");
      meta.children.greeting.templates[1].template.type.should.equal("object");
      meta.children.greeting.templates[1].template.section.should.equal("^dataVariable");
    });
  });

  describe("child array template key with a name", function () {
    it("should return correct metadata", function () {
      var meta = getMetadata({ key: undefined, value: { "greetings@dataVariable": "{{{message}}}" } });
      should.exist(meta.children);
      should.exist(meta.children.greetings);
      meta.children.greetings.templates[0].src.key.should.equal("greetings@dataVariable");
      meta.children.greetings.templates[0].key.should.equal("greetings");
      meta.children.greetings.templates[0].template.type.should.equal("array");
      meta.children.greetings.templates[0].template.section.should.equal("@dataVariable");
    });
  });
});
