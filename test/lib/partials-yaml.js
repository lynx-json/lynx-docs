const chai = require("chai");
const should = chai.should();
var sinon = require("sinon");
const partials = require("../../src/lib/partials-yaml");
const meta = require("../../src/lib/metadata-yaml");
const YAML = require("yamljs");

describe("when including partials", function () {
  afterEach(function () { 
    if (partials.resolvePartial.restore) partials.resolvePartial.restore();
  });
  
  describe("key>", function () {
    var isPartial, partial;
    beforeEach(function () {
      sinon.stub(partials, "resolvePartial").withArgs({ value: { partial: "key"}, key: "key"}).returns({
        key: "key",
        value: ""
      });
      isPartial = partials.isPartial({ value: null, key: "key>" });
      partial = partials.getPartial({ value: null, key: "key>" });
    });
    
    it("should include a partial named 'key'", function () {
      isPartial.should.equal(true);
      should.exist(partial);
    });
  });
  
  describe("key>partial", function () {
    var isPartial, partial;
    beforeEach(function () {
      sinon.stub(partials, "resolvePartial").withArgs({ value: { partial: "partial"}, key: "key"}).returns({
        key: "key",
        value: ""
      });
      isPartial = partials.isPartial({ value: null, key: "key>partial" });
      partial = partials.getPartial({ value: null, key: "key>partial" });
    });
    
    it("should include a partial named 'partial'", function () {
      isPartial.should.equal(true);
      should.exist(partial);
    });
  });
  
  describe("key>partial: {}", function () {
    var partial;
    beforeEach(function () {
      sinon.stub(partials, "resolvePartial").withArgs({ value: { partial: "partial", foo: "bar" }, key: "key"}).returns({
        key: "key",
        value: ""
      });
      partial = partials.getPartial({value: { foo: "bar" }, key: "key>partial"});
    });
    
    it("should pass the object value to the partial", function () {
      should.exist(partial);
    });
  });
  
  describe("key>partial: text", function () {
    var partial;
    beforeEach(function () {
      sinon.stub(partials, "resolvePartial").withArgs({ value: { partial: "partial", value: "text"}, key: "key"}).returns({
        key: "key",
        value: ""
      });
      partial = partials.getPartial({ value: "text", key: "key>partial"});
    });
    
    it("should pass the text value to the partial as value.value", function () {
      should.exist(partial);
    });
  });
  
  describe("key>partial: []", function () {
    var partial;
    beforeEach(function () {
      sinon.stub(partials, "resolvePartial").withArgs({ value: { partial: "partial", value: []}, key: "key"}).returns({
        key: "key",
        value: YAML.parse("")
      });
      partial = partials.getPartial({ value: [], key: "key>partial"});
    });
    
    it("should pass the array value to the partial as value.value", function () {
      should.exist(partial);
    });
  });
  
  describe("a partial with a simple parameter '{{{param}}}'", function () {
    var partial;
    beforeEach(function () {
      sinon.stub(partials, "resolvePartial").withArgs({ value: { partial: "partial", param: "abc"}, key: "key"}).returns({
        key: "key",
        value: YAML.parse("'{{{param}}}'")
      });
      
      partial = partials.getPartial({ value: { param: "abc" }, key: "key>partial"});
    });
    
    it("should replace the templated value with the parameter value", function () {
      partial.value.should.equal("abc");
    });
  });
  
  describe("a partial with a literal parameter 'param<:'", function () {
    var partial;
    beforeEach(function () {
      sinon.stub(partials, "resolvePartial").withArgs({ value: { partial: "partial", param: "abc"}, key: "key"}).returns({
        key: "key",
        value: YAML.parse("param<:")
      });
      
      partial = partials.getPartial({ value: { param: "abc" }, key: "key>partial"});
    });
    
    it("should replace the templated value with the parameter value", function () {
      partial.value.param.should.equal("abc");
    });
  });
  
  describe("a partial with a literal parameter 'key<param:'", function () {
    var partial;
    beforeEach(function () {
      sinon.stub(partials, "resolvePartial").withArgs({ value: { partial: "partial", param: "abc"}, key: "key"}).returns({
        key: "key",
        value: YAML.parse("key<param:")
      });
      
      partial = partials.getPartial({ value: { param: "abc" }, key: "key>partial"});
    });
    
    it("should replace the templated value with the parameter value", function () {
      partial.value.param.should.equal("abc");
    });
  });
  
  describe("a partial with a key parameter", function () {
    var partial, name;
    beforeEach(function () {
      name = "foo";
      sinon.stub(partials, "resolvePartial").withArgs({ value: { partial: "partial", name: name } }).returns({
        value: YAML.parse("'{{{name}}}'")
      });
      
      partial = partials.getPartial({ value: { name: name }, key: ">partial"});
    });
    
    it("should replace the templated value with the parameter value", function () {
      partial.value.should.equal(name);
    });
  });
});
