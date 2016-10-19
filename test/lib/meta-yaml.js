var should = require("chai").should();
var getMetadata = require("../../src/lib/metadata-yaml");

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

describe("child key without templates/partials", function () {
  it("should return correct metadata", function () {
    var meta = getMetadata({ key: undefined, value: { "greeting": "Hi" } });
    should.exist(meta.children);
    meta.children.should.deep.equal([ { src: { key: "greeting" }, key: "greeting" } ]);
  });
});

describe("child object template key without a name", function () {
  it("should return correct metadata", function () {
    var meta = getMetadata({ key: undefined, value: { "greeting#": { message: "{{{message}}}" } } });
    should.exist(meta.children);
    meta.children.should.deep.equal([ { src: { key: "greeting#" }, key: "greeting", template: { type: "object", section: "#greeting" } } ]);
  });
});

describe("child inverse object template key without a name", function () {
  it("should return correct metadata", function () {
    var meta = getMetadata({ key: undefined, value: { "greeting^": { message: "{{{message}}}" } } });
    should.exist(meta.children);
    meta.children.should.deep.equal([ { src: { key: "greeting^" }, key: "greeting", template: { type: "object", section: "^greeting" } } ]);
  });
});

describe("child array template key without a name", function () {
  it("should return correct metadata", function () {
    var meta = getMetadata({ key: undefined, value: { "greetings@": "{{{message}}}" } });
    should.exist(meta.children);
    meta.children.should.deep.equal([ { src: { key: "greetings@" }, key: "greetings", template: { type: "array", section: "@greetings" } } ]);
  });
});

describe("child object template key with a name", function () {
  it("should return correct metadata", function () {
    var meta = getMetadata({ key: undefined, value: { "greeting#dataVariable": { message: "{{{message}}}" } } });
    should.exist(meta.children);
    meta.children.should.deep.equal([ { src: { key: "greeting#dataVariable" }, key: "greeting", template: { type: "object", section: "#dataVariable" } } ]);
  });
});

describe("child inverse object template key with a name", function () {
  it("should return correct metadata", function () {
    var meta = getMetadata({ key: undefined, value: { "greeting^dataVariable": { message: "{{{message}}}" } } });
    should.exist(meta.children);
    meta.children.should.deep.equal([ { src: { key: "greeting^dataVariable" }, key: "greeting", template: { type: "object", section: "^dataVariable" } } ]);
  });
});

describe("child array template key with a name", function () {
  it("should return correct metadata", function () {
    var meta = getMetadata({ key: undefined, value: { "greetings@dataVariable": "{{{message}}}" } });
    should.exist(meta.children);
    meta.children.should.deep.equal([ { src: { key: "greetings@dataVariable" }, key: "greetings", template: { type: "array", section: "@dataVariable" } } ]);
  });
});
