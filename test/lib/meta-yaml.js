var should = require("chai").should();
var getMeta = require("../../src/lib/meta-yaml");

describe("a bare key", function () {
  it("should return correct meta", function () {
    var meta = getMeta("bareKey");
    meta.key.should.equal("bareKey");
    should.not.exist(meta.template);
  });
});

describe("a key without templates/partials", function () {
  it("should return correct meta", function () {
    var meta = getMeta({ key: "normal" });
    meta.key.should.equal("normal");
    should.not.exist(meta.template);
  });
});

describe("an object template key", function () {
  it("should return correct meta", function () {
    var meta = getMeta({ key: "objectTemplate#dataVariable" });
    meta.key.should.equal("objectTemplate");
    should.exist(meta.template);
    meta.template.section.should.equal("dataVariable");
  });
});

describe("an inverse object template key", function () {
  it("should return correct meta", function () {
    var meta = getMeta({ key: "inverseObjectTemplate^dataVariable" });
    meta.key.should.equal("inverseObjectTemplate");
    should.exist(meta.template);
    meta.template.section.should.equal("dataVariable");
  });
});

describe("an array template key", function () {
  it("should return correct meta", function () {
    var meta = getMeta({ key: "arrayTemplate@dataVariable" });
    meta.key.should.equal("arrayTemplate");
    should.exist(meta.template);
    meta.template.section.should.equal("dataVariable");
  });
});
