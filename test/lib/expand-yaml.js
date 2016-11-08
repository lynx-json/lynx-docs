"use strict";

var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var expandYaml = require("../../src/lib/expand-yaml");

describe("when expanding YAML", function () {
  describe("an expanded string value", function () {
    var kvp = expandYaml({ value: "Hi" });
    
    it("should have the correct value", function () {
      should.exist(kvp.value.value);
      kvp.value.value.should.equal("Hi");
    });
    
    it("should have a spec and hints", function() {
      should.exist(kvp.value.spec);
      should.not.exist(kvp.value.spec.name);
      should.exist(kvp.value.spec.hints);
    });
  });

  describe("an expanded number value", function () {
    var kvp = expandYaml({ value: 42 });
    
    it("should have the correct value", function () {
      should.exist(kvp.value.value);
      kvp.value.value.should.equal(42);
    });
    
    it("should have a spec and hints", function() {
      should.exist(kvp.value.spec);
      should.not.exist(kvp.value.spec.name);
      should.exist(kvp.value.spec.hints);
    });
  });

  describe("an expanded boolean value", function () {
    var kvp = expandYaml({ value: true });
    
    it("should have the correct value", function () {
      should.exist(kvp.value.value);
      kvp.value.value.should.be.true;
    });
    
    it("should have a spec and hints", function() {
      should.exist(kvp.value.spec);
      should.not.exist(kvp.value.spec.name);
      should.exist(kvp.value.spec.hints);
    });
  });

  describe("an expanded object value", function () {
    var kvp = expandYaml({ value: { greeting: "Hi" } });
    
    it("should have the correct value", function () {
      should.exist(kvp.value.value);
      should.exist(kvp.value.value.greeting);
      should.exist(kvp.value.value.greeting.value);
      kvp.value.value.greeting.value.should.equal("Hi");
    });
    
    it("should have a spec and hints", function() {
      should.exist(kvp.value.spec);
      should.not.exist(kvp.value.spec.name);
      should.exist(kvp.value.spec.hints);
      should.exist(kvp.value.value.greeting.spec);
      kvp.value.value.greeting.spec.name.should.equal("greeting");
      should.exist(kvp.value.value.greeting.spec.hints);
    });
  });

  describe("an expanded array value", function () {
    var kvp = expandYaml({ value: [ "Hi", "Hello" ] });
    
    it("should have the correct value", function () {
      should.exist(kvp.value.value);
      kvp.value.value[0].value.should.equal("Hi");
      kvp.value.value[1].value.should.equal("Hello");
    });
    
    it("should have a spec and hints", function() {
      should.exist(kvp.value.spec);
      should.not.exist(kvp.value.spec.name);
      should.exist(kvp.value.spec.hints);
    });
  });

  describe("an expanded partial node (value)", function () {
    var kvp = expandYaml({ value: { value: "Hi" } });
    
    it("should have the correct value", function () {
      should.exist(kvp.value.value);
      kvp.value.value.should.equal("Hi");
    });
    
    it("should have a spec and hints", function() {
      should.exist(kvp.value.spec);
      should.not.exist(kvp.value.spec.name);
      should.exist(kvp.value.spec.hints);
    });
  });

  describe("an expanded partial node (spec)", function () {
    describe("with a hints array", function () {
      var kvp = expandYaml({ value: { spec: { hints: [ "text" ] } } });
      
      it("should have the correct value", function () {
        kvp.value.should.have.property("value");
        expect(kvp.value.value).to.be.null;
      });
      
      it("should have a spec and hints", function() {
        should.exist(kvp.value.spec);
        should.not.exist(kvp.value.spec.name);
        should.exist(kvp.value.spec.hints);
      });
      
      it("should contain the predefined hint", function () {
        kvp.value.spec.hints[0].should.equal("text");
      });
    });
    
    describe("with a hints string", function () {
      var kvp = expandYaml({ value: { spec: { hints: "text" } } });
      
      it("should have the correct value", function () {
        kvp.value.should.have.property("value");
        expect(kvp.value.value).to.be.null;
      });
      
      it("should have a spec and hints", function() {
        should.exist(kvp.value.spec);
        should.not.exist(kvp.value.spec.name);
        should.exist(kvp.value.spec.hints);
      });
      
      it("should contain the predefined hint", function () {
        kvp.value.spec.hints[0].should.equal("text");
      });
    });
  });

  describe("an expanded array template value without section", function () {
    var kvp = expandYaml({ value: { "value@": { greeting: "Hi" } } });
    
    it("should have the correct value", function () {
      should.exist(kvp.value["value@"]);
      kvp.value["value@"].length.should.equal(1);
      should.exist(kvp.value["value@"][0].value);
      should.exist(kvp.value["value@"][0].value.greeting);
      should.exist(kvp.value["value@"][0].value.greeting.value);
      kvp.value["value@"][0].value.greeting.value.should.equal("Hi");
    });
    
    it("should have a spec and hints", function() {
      should.exist(kvp.value.spec);
      should.not.exist(kvp.value.spec.name);
      should.exist(kvp.value.spec.hints);
      should.exist(kvp.value["value@"][0].spec);
      should.exist(kvp.value["value@"][0].value.greeting.spec);
      kvp.value["value@"][0].value.greeting.spec.name.should.equal("greeting");
      should.exist(kvp.value["value@"][0].value.greeting.spec.hints);
    });
  });

  describe("an expanded object template value without section", function () {
    var kvp = expandYaml({ value: { "value#": { greeting: "Hi" } } });
    
    it("should have the correct value", function () {
      should.exist(kvp.value["value#"]);
      should.exist(kvp.value["value#"].greeting);
      should.exist(kvp.value["value#"].greeting.value);
      kvp.value["value#"].greeting.value.should.equal("Hi");
    });
    
    it("should have a spec and hints", function() {
      should.exist(kvp.value.spec);
      should.not.exist(kvp.value.spec.name);
      should.exist(kvp.value.spec.hints);
      should.exist(kvp.value["value#"].greeting.spec);
      kvp.value["value#"].greeting.spec.name.should.equal("greeting");
      should.exist(kvp.value["value#"].greeting.spec.hints);
    });
  });
  
  describe("an expanded simple template value without section", function () {
    var kvp = expandYaml({ value: { "value<": null } });
    
    it("should have the correct value", function () {
      kvp.value.should.have.property("value<");
      expect(kvp.value["value<"]).to.be.null;
    });
    
    it("should have a spec and hints", function() {
      should.exist(kvp.value.spec);
      should.not.exist(kvp.value.spec.name);
      should.exist(kvp.value.spec.hints);
    });
  });

  describe("an expanded array template value with section", function () {
    var kvp = expandYaml({ value: { "value@dataVariable": { greeting: "Hi" } } });
    
    it("should have the correct value", function () {
      should.exist(kvp.value["value@dataVariable"]);
      kvp.value["value@dataVariable"].length.should.equal(1);
      should.exist(kvp.value["value@dataVariable"][0].value);
      should.exist(kvp.value["value@dataVariable"][0].value.greeting);
      should.exist(kvp.value["value@dataVariable"][0].value.greeting.value);
      kvp.value["value@dataVariable"][0].value.greeting.value.should.equal("Hi");
    });
    
    it("should have a spec and hints", function() {
      should.exist(kvp.value.spec);
      should.not.exist(kvp.value.spec.name);
      should.exist(kvp.value.spec.hints);
      should.exist(kvp.value["value@dataVariable"][0].spec);
      should.exist(kvp.value["value@dataVariable"][0].value.greeting.spec);
      kvp.value["value@dataVariable"][0].value.greeting.spec.name.should.equal("greeting");
      should.exist(kvp.value["value@dataVariable"][0].value.greeting.spec.hints);
    });
  });

  describe("an expanded object template value with section", function () {
    var kvp = expandYaml({ value: { "value#dataVariable": { greeting: "Hi" } } });
    
    it("should have the correct value", function () {
      should.exist(kvp.value["value#dataVariable"]);
      should.exist(kvp.value["value#dataVariable"].greeting);
      should.exist(kvp.value["value#dataVariable"].greeting.value);
      kvp.value["value#dataVariable"].greeting.value.should.equal("Hi");
    });
    
    it("should have a spec and hints", function() {
      should.exist(kvp.value.spec);
      should.not.exist(kvp.value.spec.name);
      should.exist(kvp.value.spec.hints);
      should.exist(kvp.value["value#dataVariable"].greeting.spec);
      kvp.value["value#dataVariable"].greeting.spec.name.should.equal("greeting");
      should.exist(kvp.value["value#dataVariable"].greeting.spec.hints);
    });
  });
  
  describe("an expanded simple template value with section", function () {
    var kvp = expandYaml({ value: { "value<dataVariable": null } });
    
    it("should have the correct value", function () {
      kvp.value.should.have.property("value<dataVariable");
      expect(kvp.value["value<dataVariable"]).to.be.null;
    });
    
    it("should have a spec and hints", function() {
      should.exist(kvp.value.spec);
      should.not.exist(kvp.value.spec.name);
      should.exist(kvp.value.spec.hints);
    });
  });

  describe("an expanded array template kvp", function () {
    var kvp = expandYaml({ value: { "array@": "Hi" } });
    
    it("should have the correct value", function () {
      should.exist(kvp.value.value["array@"]);
      should.exist(kvp.value.value["array@"].value[0]);
      should.exist(kvp.value.value["array@"].value[0].value);
      kvp.value.value["array@"].value[0].value.should.equal("Hi");
    });
    
    it("should have a spec and hints", function() {
      should.exist(kvp.value.spec);
      should.not.exist(kvp.value.spec.name);
      should.exist(kvp.value.spec.hints);
      should.exist(kvp.value.value["array@"].spec);
      should.exist(kvp.value.value["array@"].spec.hints);
      should.exist(kvp.value.value["array@"].value[0].spec);
      should.not.exist(kvp.value.value["array@"].value[0].spec.name);
      should.exist(kvp.value.value["array@"].value[0].spec.hints);
    });
  });

  describe("an expanded object template kvp", function () {
    var kvp = expandYaml({ value: { "object#": { greeting: "Hi" } } });
    
    it("should have the correct value", function () {
      should.exist(kvp.value.value["object#"]);
      should.exist(kvp.value.value["object#"].value);
      should.exist(kvp.value.value["object#"].value.greeting);
      should.exist(kvp.value.value["object#"].value.greeting.value);
      kvp.value.value["object#"].value.greeting.value.should.equal("Hi");
    });
    
    it("should have a spec and hints", function() {
      should.exist(kvp.value.spec);
      should.not.exist(kvp.value.spec.name);
      should.exist(kvp.value.spec.hints);
      should.exist(kvp.value.value["object#"].spec);
      kvp.value.value["object#"].spec.name.should.equal("object");
      should.exist(kvp.value.value["object#"].spec.hints);
      should.exist(kvp.value.value["object#"].value.greeting.spec);
      kvp.value.value["object#"].value.greeting.spec.name.should.equal("greeting");
      should.exist(kvp.value.value["object#"].value.greeting.spec.hints);
    });
  });
  
  describe("an expanded simple template kvp", function () {
    var kvp = expandYaml({ value: { "foo<": null } });
    
    it("should have the correct value", function () {
      should.exist(kvp.value.value["foo<"]);
      expect(kvp.value.value["foo<"].value).to.be.null;
    });
    
    it("should have a spec and hints", function() {
      should.exist(kvp.value.spec);
      should.not.exist(kvp.value.spec.name);
      should.exist(kvp.value.spec.hints);
      should.exist(kvp.value.value["foo<"].spec);
      kvp.value.value["foo<"].spec.name.should.equal("foo");
      should.exist(kvp.value.value["foo<"].spec.hints);
    });
  });
});
