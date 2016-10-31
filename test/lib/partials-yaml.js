const chai = require("chai");
const should = chai.should();
var sinon = require("sinon");
const partials = require("../../src/lib/partials-yaml");
const YAML = require("yamljs");

describe("when including partials", function () {
  afterEach(function () { 
    if (partials.resolvePartial.restore) partials.resolvePartial.restore();
  });
  
  describe("key>", function () {
    var isPartial, partial;
    beforeEach(function () {
      sinon.stub(partials, "resolvePartial").withArgs({ partial: "key"}, "key").returns({
        key: "key",
        value: YAML.parse("")
      });
      isPartial = partials.isPartial(null, "key>");
      partial = partials.getPartial(null, "key>");
    });
    
    it("should include a partial named 'key'", function () {
      isPartial.should.equal(true);
      should.exist(partial);
    });
  });
  
  describe("key>partial", function () {
    var isPartial, partial;
    beforeEach(function () {
      sinon.stub(partials, "resolvePartial").withArgs({ partial: "partial"}, "key").returns({
        key: "key",
        value: YAML.parse("")
      });
      isPartial = partials.isPartial(null, "key>partial");
      partial = partials.getPartial(null, "key>partial");
    });
    
    it("should include a partial named 'partial'", function () {
      isPartial.should.equal(true);
      should.exist(partial);
    });
  });
  
  describe("key>partial: {}", function () {
    var partial;
    beforeEach(function () {
      sinon.stub(partials, "resolvePartial").withArgs({ partial: "partial", foo: "bar" }, "key").returns({
        key: "key",
        value: YAML.parse("")
      });
      partial = partials.getPartial({ foo: "bar" }, "key>partial");
    });
    
    it("should pass the object value to the partial", function () {
      should.exist(partial);
    });
  });
  
  describe("key>partial: text", function () {
    var partial;
    beforeEach(function () {
      sinon.stub(partials, "resolvePartial").withArgs({ partial: "partial", value: "text"}, "key").returns({
        key: "key",
        value: YAML.parse("")
      });
      partial = partials.getPartial("text", "key>partial");
    });
    
    it("should pass the text value to the partial as value.value", function () {
      should.exist(partial);
    });
  });
  
  describe("key>partial: []", function () {
    var partial;
    beforeEach(function () {
      sinon.stub(partials, "resolvePartial").withArgs({ partial: "partial", value: []}, "key").returns({
        key: "key",
        value: YAML.parse("")
      });
      partial = partials.getPartial([], "key>partial");
    });
    
    it("should pass the array value to the partial as value.value", function () {
      should.exist(partial);
    });
  });
  
  describe("a partial with a simple parameter '{{{name}}}'", function () {
    var partial;
    beforeEach(function () {
      sinon.stub(partials, "resolvePartial").withArgs({ partial: "partial", name: "My Name"}, "key").returns({
        key: "key",
        value: YAML.parse("'{{{name}}}'")
      });
      
      partial = partials.getPartial({ name: "My Name" }, "key>partial");
    });
    
    it("should replace the templated value with the parameter value", function () {
      partial.value.should.equal("My Name");
    });
  });
  
  describe("a partial with a simple parameter 'name<:'", function () {
    var partial;
    beforeEach(function () {
      sinon.stub(partials, "resolvePartial").withArgs({ partial: "partial", name: "My Name"}, "key").returns({
        key: "key",
        value: YAML.parse("name<:")
      });
      
      partial = partials.getPartial({ name: "My Name" }, "key>partial");
    });
    
    it("should replace the templated value with the parameter value", function () {
      partial.value.name.should.equal("My Name");
    });
  });
  
  describe("a javascript partial", function () {
    
  });
  
  describe("a partial with a key parameter", function () {
    
  });
  
  describe("a partial with a value parameter", function () {
    
  });
});
