var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var sinon = require("sinon");
var finishYaml = require("../../src/lib/finish-yaml");

function assertDataProperty(kvp, property, value) {
  should.not.exist(kvp.value.value[property].value);
  should.not.exist(kvp.value.value[property].spec);
  kvp.value.value[property].should.equal(value);
}

function vsp(value) {
  return {
    spec: { hints: [] },
    value: value
  };
}

describe("when using additional finishing functions", function () {
  describe("for labels", function () {
    describe("for containers with 'title' property", function () {
      it("should add a 'labeledBy' property", function () {
        var kvp = { 
          key: undefined, 
          value: vsp({ title: vsp("This is a Title") })
        };
        
        finishYaml.labels(kvp);
        should.exist(kvp.value.spec.labeledBy);
        kvp.value.spec.labeledBy.should.equal("title");
      });
    });
    
    describe("for containers with 'header' property", function () {
      it("should add a 'labeledBy' property", function () {
        var kvp = { 
          key: undefined, 
          value: vsp({ header: vsp("This is a Heading") })
        };
        
        finishYaml.labels(kvp);
        should.exist(kvp.value.spec.labeledBy);
        kvp.value.spec.labeledBy.should.equal("header");
      });
    });
    
    describe("for 'title' key", function () {
      it("should add 'label' hint", function () {
        var kvp = {
          key: "title",
          value: vsp("This is a Title")
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
          value: vsp("This is a Label")
        };
        
        finishYaml.labels(kvp);
        kvp.value.spec.hints.should.contain("label");
      });
    });
  });
  
  describe("for links", function () {
    var kvp;
    beforeEach(function () {
      kvp = {
        key: "hyperlink",
        value: vsp({ href: vsp("."), type: vsp("application/lynx+json") })
      };
    });
    
    it("should add a 'link' hint", function () {
      finishYaml.links(kvp);
      kvp.value.spec.hints.should.contain("link");
    });
    
    it("should throw if 'type' property is undefined", function () {
      delete kvp.value.value.type;
      var fn = function () { finishYaml.links(kvp); };
      should.throw(fn);
    });
    
    it("should convert 'href' and 'type' to data properties", function () {
      finishYaml.dataProperties(kvp);
      assertDataProperty(kvp, "href", ".");
      assertDataProperty(kvp, "type", "application/lynx+json");
    });
  });
  
  describe("for text", function () {
    describe("for string values", function () {
      it("should add a 'text' hint", function () {
        var kvp = {
          key: "text",
          value: vsp("This is some text.")
        };
        
        finishYaml.text(kvp);
        kvp.value.spec.hints.should.contain("text");
      });
    });
  });
  
  describe("for content", function () {
    var kvp;
    beforeEach(function () {
      kvp = {
        key: "content",
        value: vsp({ 
          src: vsp("."), 
          type: vsp("image/png")
        })
      };
    });
    
    it("should add an 'content' hint", function () {
      finishYaml.content(kvp);
      kvp.value.spec.hints.should.contain("content");
    });
    
    it("should throw if 'type' property is undefined", function () {
      delete kvp.value.value.type;
      var fn = function () { finishYaml.content(kvp); };
      should.throw(fn);
    });
    
    it("should convert 'src' and 'type' to data properties", function () {
      finishYaml.dataProperties(kvp);
      assertDataProperty(kvp, "src", ".");
      assertDataProperty(kvp, "type", "image/png");
    });
  });
  
  describe("for images", function () {
    var kvp;
    beforeEach(function () {
      kvp = {
        key: "image",
        value: vsp({ 
          src: vsp("."), 
          type: vsp("image/png"), 
          height: vsp(40), 
          width: vsp(40)
        })
      };
    });
    
    it("should add an 'image' hint", function () {
      finishYaml.images(kvp);
      kvp.value.spec.hints.should.contain("image");
    });
    
    it("should throw if 'type' property is undefined", function () {
      delete kvp.value.value.type;
      var fn = function () { finishYaml.images(kvp); };
      should.throw(fn);
    });
    
    it("should convert 'src', 'height', 'width', and 'type' to data properties", function () {
      finishYaml.dataProperties(kvp);
      assertDataProperty(kvp, "src", ".");
      assertDataProperty(kvp, "type", "image/png");
      assertDataProperty(kvp, "height", 40);
      assertDataProperty(kvp, "width", 40);
    });
  });
  
  describe("for submits", function () {
    var kvp;
    beforeEach(function () {
      kvp = {
        key: "submit",
        value: vsp({ 
          action: vsp("."), 
          method: vsp("GET"), 
          enctype: vsp("multipart/form-data") 
        })
      };
    });
    
    it("should add a 'submit' hint", function () {
      finishYaml.submits(kvp);
      kvp.value.spec.hints.should.contain("submit");
    });
    
    it("should convert 'action', 'method', and 'enctype' to data properties", function () {
      finishYaml.dataProperties(kvp);
      assertDataProperty(kvp, "action", ".");
      assertDataProperty(kvp, "method", "GET");
      assertDataProperty(kvp, "enctype", "multipart/form-data");
    });
  });
  
  describe("for containers", function () {
    describe("for object templates", function () {
      var kvp = {
        key: "greeting#",
        value: vsp({})
      };
      
      it("should add a 'container' hint", function () {
        finishYaml.containers(kvp);
        kvp.value.spec.hints.should.contain("container");
      });
    });
    
    describe("for array templates", function () {
      var kvp = {
        key: "greeting@",
        value: vsp({})
      };
      
      it("should add a 'container' hint", function () {
        finishYaml.containers(kvp);
        kvp.value.spec.hints.should.contain("container");
      });
    });
    
    describe("for object values", function () {
      it("should add a 'container' hint", function () {
        var kvp = {
          key: "foo",
          value: vsp({})  
        };
        
        finishYaml.containers(kvp);
        kvp.value.spec.hints.should.contain("container");
      });
      
      it("should convert 'reaml' to a data property", function () {
        var kvp = {
          value: vsp({
            realm: vsp("http://example.com/app-realm/doc-realm/")
          })
        };
        
        finishYaml.dataProperties(kvp);
        assertDataProperty(kvp, "realm", "http://example.com/app-realm/doc-realm/");
      });
    });
    
    describe("for array values", function () {
      it("should add a 'container' hint", function () {
        var kvp = {
          key: "foo",
          value: vsp([])  
        };
        
        finishYaml.containers(kvp);
        kvp.value.spec.hints.should.contain("container");
      });
    });
    
    describe("for string values", function () {
      it("should not add a 'container' hint", function () {
        var kvp = {
          key: "foo",
          value: vsp("This is not a container.")
        };
        
        finishYaml.containers(kvp);
        kvp.value.spec.hints.should.not.contain("container");
      });
    });
  });
  
  describe("for forms", function () {
    describe("for keys that end with 'form'", function () {
      it("should add a 'form' hint", function () {
        var kvp = {
          key: "testForm",
          value: vsp(null)
        };
        
        finishYaml.forms(kvp);
        kvp.value.spec.hints.should.contain("form");
      });
    });
  });
  
  describe("for sections", function () {
    var kvp;
    beforeEach(function () {
      kvp = {
        key: "testSection",
        value: vsp(null)
      };
    });
    
    describe("for containers with a 'header' property", function () {
      it("should add a 'section' hint", function () {
        kvp.value.value = {
          header: vsp("This is the Heading")
        };
        
        finishYaml.sections(kvp);
        kvp.value.spec.hints.should.contain("section");
      });
    });
    
    describe("for keys that end with 'section'", function () {
      it("should add a 'section' hint", function () {
        finishYaml.sections(kvp);
        kvp.value.spec.hints.should.contain("section");
      });
    });
  });
});
