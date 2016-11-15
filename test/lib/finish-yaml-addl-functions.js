"use strict";

var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var sinon = require("sinon");
var finishYaml = require("../../src/lib/finish-yaml");

function vsp(value) {
  return {
    spec: { hints: [] },
    value: value
  };
}

describe("when using additional finishing functions", function() {
  describe("for labels", function() {
    describe("for containers with 'title' property", function() {
      it("should add a 'labeledBy' property", function() {
        var kvp = {
          key: undefined,
          value: vsp({ title: vsp("This is a Title") })
        };

        finishYaml.labels(kvp);
        should.exist(kvp.value.spec.labeledBy);
        kvp.value.spec.labeledBy.should.equal("title");
      });
    });

    describe("for containers with 'header' property", function() {
      it("should add a 'labeledBy' property", function() {
        var kvp = {
          key: undefined,
          value: vsp({ header: vsp("This is a Heading") })
        };

        finishYaml.labels(kvp);
        should.exist(kvp.value.spec.labeledBy);
        kvp.value.spec.labeledBy.should.equal("header");
      });
    });

    describe("for 'title' key", function() {
      it("should add 'label' hint", function() {
        var kvp = {
          key: "title",
          value: vsp("This is a Title")
        };

        finishYaml.titles(kvp);
        kvp.value.spec.hints.should.contain("label");
      });
    });
  });

  describe("for labels", function() {
    describe("for 'label' key and string value", function() {
      it("should add 'label' hint", function() {
        var kvp = {
          key: "label",
          value: vsp("This is a Label")
        };

        finishYaml.labels(kvp);
        kvp.value.spec.hints.should.contain("label");
      });
    });
  });

  describe("for links", function() {
    var kvp;
    beforeEach(function() {
      kvp = {
        key: "hyperlink",
        value: vsp({ href: ".", type: "application/lynx+json" })
      };
    });

    it("should add a 'link' hint", function() {
      finishYaml.links(kvp);
      kvp.value.spec.hints.should.contain("link");
    });
    
    it("should throw if 'href' property is null", function() {
      kvp.value.value.href = null;
      var fn = function() { finishYaml.links(kvp); };
      should.throw(fn);
    });
    
    it("should throw if 'href' property is empty", function() {
      kvp.value.value.href = "";
      var fn = function() { finishYaml.links(kvp); };
      should.throw(fn);
    });

    it("should throw if 'type' property is undefined", function() {
      delete kvp.value.value.type;
      var fn = function() { finishYaml.links(kvp); };
      should.throw(fn);
    });
    
    it("should throw if 'type' property is null", function() {
      kvp.value.value.type = null;
      var fn = function() { finishYaml.links(kvp); };
      should.throw(fn);
    });
    
    it("should throw if 'type' property is empty", function() {
      kvp.value.value.type = "";
      var fn = function() { finishYaml.links(kvp); };
      should.throw(fn);
    });
  });

  describe("for text", function() {
    describe("for string values", function() {
      it("should add a 'text' hint", function() {
        var kvp = {
          key: "text",
          value: vsp("This is some text.")
        };

        finishYaml.text(kvp);
        kvp.value.spec.hints.should.contain("text");
      });
    });
    
    describe("for quoted literal templates", function() {
      it("should add a 'text' hint", function() {
        var kvp = {
          key: "text",
          value: {
            spec: { hints: [] },
            "value<": null
          }
        };

        finishYaml.text(kvp);
        kvp.value.spec.hints.should.contain("text");
      });
    });
    
    describe("for object templates containing a literal 'value' template", function () {
      var kvp;
      
      beforeEach(function () {
        kvp = {
          key: "greeting#",
          value: {
            "value<": "Hello",
            "spec": {
              "visibility<": "visible",
              hints: []
            }
          }
        };
        finishYaml.text(kvp);
      });
      
      it("should add a 'text' hint", function () {
        kvp.value.spec.hints.should.contain("text");
      });
      
      it("should not add a 'container' hint", function () {
        kvp.value.spec.hints.should.not.contain("container");
      });
    });
  });

  describe("for content", function() {
    var kvp;
    beforeEach(function() {
      kvp = {
        key: "content",
        value: vsp({
          src: ".",
          type: "image/png"
        })
      };
    });

    it("should add an 'content' hint", function() {
      finishYaml.content(kvp);
      kvp.value.spec.hints.should.contain("content");
    });
    
    it("should throw if 'src' property is null", function() {
      kvp.value.value.src = null;
      var fn = function() { finishYaml.content(kvp); };
      should.throw(fn);
    });
    
    it("should throw if 'src' property is empty", function() {
      kvp.value.value.src = "";
      var fn = function() { finishYaml.content(kvp); };
      should.throw(fn);
    });

    it("should throw if 'type' property is undefined", function() {
      delete kvp.value.value.type;
      var fn = function() { finishYaml.content(kvp); };
      should.throw(fn);
    });
  });

  describe("for images", function() {
    var kvp;
    beforeEach(function() {
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

    it("should add an 'image' hint", function() {
      finishYaml.images(kvp);
      kvp.value.spec.hints.should.contain("image");
    });

    it("should throw if 'type' property is undefined", function() {
      delete kvp.value.value.type;
      var fn = function() { finishYaml.images(kvp); };
      should.throw(fn);
    });
  });

  describe("for submits", function() {
    var kvp;
    beforeEach(function() {
      kvp = {
        key: "submit",
        value: vsp({
          action: ".",
          method: "GET",
          enctype: "multipart/form-data"
        })
      };
    });

    it("should add a 'submit' hint", function() {
      finishYaml.submits(kvp);
      kvp.value.spec.hints.should.contain("submit");
    });
    
    it("should throw if 'action' property is null", function() {
      kvp.value.value.action = null;
      var fn = function() { finishYaml.submits(kvp); };
      should.throw(fn);
    });
    
    it("should throw if 'action' property is empty", function() {
      kvp.value.value.action = "";
      var fn = function() { finishYaml.submits(kvp); };
      should.throw(fn);
    });
  });

  describe("for containers", function() {
    describe("for object templates", function() {
      var kvp = {
        key: "greeting#",
        value: vsp({})
      };

      it("should add a 'container' hint", function() {
        finishYaml.containers(kvp);
        kvp.value.spec.hints.should.contain("container");
      });
    });

    describe("for array templates", function() {
      var kvp = {
        key: "greeting@",
        value: vsp({})
      };

      it("should add a 'container' hint", function() {
        finishYaml.containers(kvp);
        kvp.value.spec.hints.should.contain("container");
      });
    });

    describe("for object values", function() {
      it("should add a 'container' hint", function() {
        var kvp = {
          key: "foo",
          value: vsp({})
        };

        finishYaml.containers(kvp);
        kvp.value.spec.hints.should.contain("container");
      });
    });

    describe("for array values", function() {
      it("should add a 'container' hint", function() {
        var kvp = {
          key: "foo",
          value: vsp([])
        };

        finishYaml.containers(kvp);
        kvp.value.spec.hints.should.contain("container");
      });
    });

    describe("for string values", function() {
      it("should not add a 'container' hint", function() {
        var kvp = {
          key: "foo",
          value: vsp("This is not a container.")
        };

        finishYaml.containers(kvp);
        kvp.value.spec.hints.should.not.contain("container");
      });
    });
  });

  describe("for forms", function() {
    describe("for keys that end with 'form'", function() {
      it("should add a 'form' hint", function() {
        var kvp = {
          key: "testForm",
          value: vsp(null)
        };

        finishYaml.forms(kvp);
        kvp.value.spec.hints.should.contain("form");
      });
    });
    describe("for keys that are undefined", function() {
      it("should not fail", function() {
        var kvp = {
          key: undefined,
          value: vsp(null)
        };

        finishYaml.forms(kvp);
      });
    });
  });

  describe("for sections", function() {
    var kvp;
    beforeEach(function() {
      kvp = {
        key: "testSection",
        value: vsp(null)
      };
    });

    describe("for containers with a 'header' property", function() {
      it("should add a 'section' hint", function() {
        kvp.value.value = {
          header: vsp("This is the Heading")
        };

        finishYaml.sections(kvp);
        kvp.value.spec.hints.should.contain("section");
      });
    });

    describe("for keys that end with 'section'", function() {
      it("should add a 'section' hint", function() {
        finishYaml.sections(kvp);
        kvp.value.spec.hints.should.contain("section");
      });
    });
    
    describe("for keys that are undefined", function() {
      it("should not fail", function() {
        var kvp = {
          key: undefined,
          value: vsp(null)
        };

        finishYaml.sections(kvp);
      });
    });
  });
  
  describe("for data properties", function() {
    var kvp;
    beforeEach(function() {
      kvp = {
        key: "href",
        value: vsp("Some text")
      };
    });

    it("should ignore values that are not objects", function() {
      kvp.value.value.should.equal("Some text");
    });
  });
  
  describe("for markers", function() {
    var kvp;
    beforeEach(function() {
      kvp = {
        key: "marker",
        value: vsp({ header: vsp("Marker"), for: "/foo/bar/" })
      };
    });

    it("should add a 'marker' hint", function() {
      finishYaml.markers(kvp);
      kvp.value.spec.hints.should.contain("marker");
    });
    
    it("should resolve a relative 'for' property to an absolute URI", function() {
      finishYaml.markers(kvp, { realm: "http://example.com"});
      kvp.value.value.for.should.equal("http://example.com/foo/bar/");
    });
    
    it("should not resolve an absolute 'for' property to an absolute URI", function() {
      kvp.value.value.for = "http://other.com/a/b/";
      finishYaml.markers(kvp, { realm: "http://example.com"});
      kvp.value.value.for.should.equal("http://other.com/a/b/");
    });
  });
});
