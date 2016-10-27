var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var sinon = require("sinon");
var finishYaml = require("../../src/lib/finish-yaml");

describe("additional finishing functions", function () {
  describe("for titles", function () {
    describe("for containers with 'title' property", function () {
      it("should add labeledBy property to spec", function () {
        var kvp = { 
          key: undefined, 
          value: {
            spec: { hints: [] },
            value: {
              title: {
                spec: { hints: [] },
                value: "title"
              }
            }
          }
        };
        
        finishYaml.titles(kvp);
        should.exist(kvp.value.spec.labeledBy);
        kvp.value.spec.labeledBy.should.equal("title");
      });
    });
    
    describe("for 'title' kvp", function () {
      it("should add 'label' hint", function () {
        var kvp = {
          key: "title",
          value: {
            spec: { hints: [] },
            value: "This is a Title"
          }
        };
        
        finishYaml.titles(kvp);
        kvp.value.spec.hints.should.contain("label");
      });
    });
  });
  
  describe("for labels", function () {
    describe("for 'label' key and string value", function () {
      it("should add 'label' hint", function () {
        var kvp = {
          key: "label",
          value: {
            spec: { hints: [] },
            value: "This is a Label"
          }
        };
        
        finishYaml.labels(kvp);
        kvp.value.spec.hints.should.contain("label");
      });
    });
  });
});
