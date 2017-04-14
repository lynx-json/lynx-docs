"use strict";

const chai = require("chai");
const should = chai.should();
const expect = chai.expect;
const sinon = require("sinon");
const partials = require("../../src/lib/partials-yaml");
const YAML = require("yamljs");

function runTest(test) {
  var actual = partials.getPartial(test.kvp);
  actual.should.deep.equal(test.expected);
}

var tests = [{
    migrated: "N/A. Keys aren't important in partial processing",
    kvp: {
      key: ">nothing",
      value: null
    },
    partial: {
      key: "",
      value: "Hello, World!"
    },
    expected: {
      value: "Hello, World!"
    },
    description: "a keyless partial",
    should: "should return a KVP with no key"
  },
  {
    migrated: "N/A. Other template tokens are expanded before partials are processed so partials don't need to account for them.",
    kvp: {
      key: "things@>list",
      value: ["One", "Two", "Three"]
    },
    partial: {
      value: {
        "value~": null
      }
    },
    expected: {
      key: "things",
      value: {
        "value@things": ["One", "Two", "Three"]
      }
    },
    description: "a partial with the placeholder value~ and an array template @",
    should: "include the template in the value key"
  },
  {
    migrated: "N/A. Other template tokens are expanded before partials are processed so partials don't need to account for them.",
    kvp: {
      key: "message<>greeting",
      value: null
    },
    partial: {
      value: {
        "value~": null
      }
    },
    expected: {
      key: "message",
      value: {
        "value<message": null
      }
    },
    description: "a partial with the placeholder value~ and a quoted literal template <",
    should: "include the template in the value key"
  },
  {
    migrated: "N/A. Other template tokens are expanded before partials are processed so partials don't need to account for them.",
    kvp: {
      key: "message=>greeting",
      value: null
    },
    partial: {
      value: {
        "value~": null
      }
    },
    expected: {
      key: "message",
      value: {
        "value=message": null
      }
    },
    description: "a partial with the placeholder value~ and a literal template =",
    should: "include the template in the value key"
  },
  {
    migrated: "Don't understand this use case",
    kvp: {
      key: ">em",
      value: {
        "message<": "Hello, World!"
      }
    },
    partial: {
      value: {
        "content~message": null
      }
    },
    expected: {
      value: {
        "content<message": "Hello, World!"
      }
    },
    description: "a partial with the named parameter content~message",
    should: "should return the property 'content' with the parameter's value and template section"
  },
  {
    migrated: "Don't understand this use case",
    kvp: {
      key: ">em",
      value: {
        "message>": null
      }
    },
    partial: {
      value: {
        "content~message": null
      }
    },
    expected: {
      value: {
        "content>message": null
      }
    },
    description: "a partial with the named parameter content~message",
    should: "should return the property 'content' with the parameter's value and partial reference"
  },
  {
    migrated: "Don't currently support replacements within strings",
    kvp: {
      key: ">greeting",
      value: "Universe"
    },
    partial: {
      value: {
        "message": "Hello, ~{{value|World}}!"
      }
    },
    expected: {
      value: {
        message: "Hello, Universe!"
      }
    },
    description: "a partial with an inline placeholder ~{{value}}",
    should: "should replace the placeholder with the parameter value"
  },
  {
    migrated: "Don't currently support replacements within strings",
    kvp: {
      key: ">greeting",
      value: null
    },
    partial: {
      value: {
        "message": "Hello, ~{{value|World}}!"
      }
    },
    expected: {
      value: {
        message: "Hello, World!"
      }
    },
    description: "a partial with an inline placeholder with a default value -- ~{{value|default value}}",
    should: "should replace the placeholder with the default value when a parameter is not provided"
  },
  {
    migrated: "Don't currently support replacements within strings",
    kvp: {
      key: ">greeting",
      value: "World"
    },
    partial: {
      value: {
        "message": "Hello, ~{{value}}! Hello, ~{{value}}!"
      }
    },
    expected: {
      value: {
        message: "Hello, World! Hello, World!"
      }
    },
    description: "a partial with multiple instances of an inline placeholder ~{{value}}",
    should: "should replace all placeholders"
  },
  {
    migrated: "Need to better understand this scenario",
    kvp: {
      key: ">section",
      value: {
        "spec.visibility": "visible",
        one: "One",
        two: "Two",
        three: "Three",
        "symbol<": "1"
      }
    },
    partial: {
      value: {
        spec: {
          hints: ["section"]
        },
        value: {
          "value~symbol": "2",
          "a~one": null,
          "~*": null,
          message: "Hello, World!"
        }
      }
    },
    expected: {
      value: {
        spec: {
          hints: ["section"]
        },
        value: {
          "value<symbol": "1",
          a: "One",
          "spec.visibility": "visible",
          two: "Two",
          three: "Three",
          message: "Hello, World!"
        }
      }
    },
    description: "a partial with a wildcard parameter ~*",
    should: "should add all unknown parameters in place of the wildcard"
  },
  {
    migrated: "Conditional placeholders not implemented",
    kvp: {
      key: "input>",
      value: {
        maxLength: 1,
        textInvalidMessage: "Must have a maximum length of 1"
      }
    },
    partial: {
      value: {
        message: "Text Input",
        "textInvalidMessage~?minLength|maxLength|pattern|format": "Invalid Format"
      }
    },
    expected: {
      key: "input",
      value: {
        message: "Text Input",
        textInvalidMessage: "Must have a maximum length of 1"
      }
    },
    description: "a partial with a conditional placeholder with a regular expression",
    should: "should include the partial value if a parameter name matching the pattern is supplied"
  },
  {
    migrated: "Need to understand this use case",
    kvp: {
      key: "input>",
      value: {
        "label": "replacement string",
        "input": "replacement object",
        "items": "replacement array",
        "literal": "replacement literal",
        "other": "replacement for other partial"
      }
    },
    partial: {
      value: {
        "label<~": "string template",
        "input#~": "object template",
        "items@~": "array template",
        "literal=~": "literal template",
        "other>~": "partial template"
      }
    },
    expected: {
      key: "input",
      value: {
        "label": "replacement string",
        "input": "replacement object",
        "items": "replacement array",
        "literal": "replacement literal",
        "other": "replacement for other partial"
      }
    },
    description: "a partial with data-bound named placeholders",
    should: "should match params with the same names"
  },
  {
    migrated: "Need to understand this use case",
    kvp: {
      key: "input>",
      value: {
        "label<": "string template",
        "input#": "object template",
        "items@": "array template",
        "literal=": "literal template"
      }
    },
    partial: {
      value: {
        "label?": "string template",
        "input?": "object template",
        "items?": "array template",
        "literal?": "literal template"
      }
    },
    expected: {
      key: "input",
      value: {
        "label": "string template",
        "input": "object template",
        "items": "array template",
        "literal": "literal template"
      }
    },
    description: "a partial called with data-bound parameters",
    should: "should match conditional placeholders by name"
  },
  {
    migrated: "Don't bind iterators to the array. Bound to array items",
    kvp: {
      key: "items@results>list",
      value: []
    },
    partial: {
      value: {
        spec: {
          hints: ["list"]
        },
        "value~": null
      }
    },
    expected: {
      key: "items",
      value: {
        spec: {
          hints: ["list"]
        },
        "value@results": []
      }
    },
    description: "a partial called with a data-bound array",
    should: "should bind the array template to the value parameter"
  }
];

describe.skip("when authoring partials", function () {
  var only = tests.find(t => t.only);
  if (only) tests = [only];

  tests.forEach(function (test) {
    describe(test.description, function () {
      beforeEach(function () {
        sinon.stub(partials, "resolvePartial").returns(test.partial);
      });
      afterEach(function () {
        if (partials.resolvePartial.restore) partials.resolvePartial.restore();
      });

      it(test.should, function () {
        runTest(test);
      });
    });
  });

  describe("when referencing another partial at the root", function () {
    var kvp = {
      key: ">outer",
      value: {
        "message": "Hello, World!"
      }
    };

    var outerPartial = {
      value: {
        ">inner": {
          header: "Greetings",
          "~*": null
        }
      }
    };

    var innerPartial = {
      value: {
        spec: {
          hints: ["page", "section"]
        },
        value: {
          "~*": null
        }
      }
    };

    var expected = {
      value: {
        spec: {
          hints: ["page", "section"]
        },
        value: {
          header: "Greetings",
          message: "Hello, World!"
        }
      }
    };

    beforeEach(function () {
      var stub = sinon.stub(partials, "resolvePartial");

      stub.onFirstCall().returns(outerPartial);
      stub.onSecondCall().returns(innerPartial);
    });
    afterEach(function () {
      if (partials.resolvePartial.restore) partials.resolvePartial.restore();
    });

    it("should include the inner partial, including parameters described by the outer partial", function () {
      var actual = partials.getPartial(kvp);
      actual.should.deep.equal(expected);
    });
  });
});
