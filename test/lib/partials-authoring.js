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
  kvp: {
    key: ">nothing",
    value: null
  },
  partial: {
    value: "Hello, World!"
  },
  expected: {
    value: "Hello, World!"
  },
  description: "a partial with no parameters",
  should: "should return the contents of the partial"
}, {
  kvp: {
    key: ">em",
    value: "Hello, World!"
  },
  partial: {
    value: {
      "value~": null
    }
  },
  expected: {
    value: {
      value: "Hello, World!"
    }
  },
  description: "a partial with the placeholder value~",
  should: "should return a text value in place of the placeholder"
}, {
  kvp: {
    key: ">em",
    value: [ "One", "Two", "Three" ]
  },
  partial: {
    value: {
      "value~": null
    }
  },
  expected: {
    value: {
      value: [ "One", "Two", "Three" ]
    }
  },
  description: "a partial with the placeholder value~",
  should: "should return an array value in place of the placeholder"
}, {
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
}, {
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
}, {
  kvp: {
    key: ">em",
    value: "Hello, World!"
  },
  partial: {
    value: {
      spec: {
        emhasis: 1
      },
      "value~": null
    }
  },
  expected: {
    value: {
      spec: {
        emhasis: 1
      },
      value: "Hello, World!"
    }
  },
  description: "a partial with a spec and a value parameter",
  should: "should return the value in place along with the spec"
}, {
  kvp: {
    key: ">section",
    value: {
      header: "Hello, World!"
    }
  },
  partial: {
    value: {
      spec: {
        hints: ["section"]
      },
      value: {
        "header~": null
      }
    }
  },
  expected: {
    value: {
      spec: {
        hints: ["section"]
      },
      value: {
        header: "Hello, World!"
      }
    }
  },
  description: "a partial with a spec and a value with parameters",
  should: "should apply the parameters to the value"
}, {
  kvp: {
    key: ">section",
    value: {
      header: "Hello, World!",
      visibility: "hidden"
    }
  },
  partial: {
    value: {
      spec: {
        hints: ["section"],
        "visibility~": "visible"
      },
      value: {
        "header~": null
      }
    }
  },
  expected: {
    value: {
      spec: {
        hints: ["section"],
        "visibility": "hidden"
      },
      value: {
        "header": "Hello, World!"
      }
    }
  },
  description: "a partial with a spec and value, both with parameters",
  should: "should apply the parameters to the value and the spec"
}, {
  kvp: {
    key: ">em",
    value: null
  },
  partial: {
    value: {
      "message~": "Hello, World!"
    }
  },
  expected: {
    value: {
      message: "Hello, World!"
    }
  },
  description: "a partial with a default parameter",
  should: "should return the default value when the parameter is not provided"
}, {
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
}, {
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
}, {
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
}, {
  kvp: {
    key: "hello>greeting",
    value: "World"
  },
  partial: {
    value: {
      "~{{key}}Greeting": "Hello, ~{{value}}! Hello, ~{{value}}!"
    }
  },
  expected: {
    value: {
      helloGreeting: "Hello, World! Hello, World!"
    }
  },
  description: "a partial with a key with an inline placeholder ~{{key}}",
  should: "should replace all placeholders"
}, {
  kvp: {
    key: ">em",
    value: null
  },
  partial: {
    value: {
      "message~": "Hello, World!",
      "missing~": null
    }
  },
  expected: {
    value: {
      message: "Hello, World!"
    }
  },
  description: "a parameter with a null default value",
  should: "should not be included in the partial output"
}, {
  kvp: {
    key: ">em",
    value: null
  },
  partial: {
    value: {
      "message~": "Hello, World!",
      "templated<~": null
    }
  },
  expected: {
    value: {
      message: "Hello, World!",
      "templated<": null
    }
  },
  description: "a parameter with a templated key and a null default value",
  should: "should output the templated key with a null default value"
}, {
  kvp: {
    key: ">em",
    value: null
  },
  partial: {
    value: {
      "message~": "Hello, World!",
      "other>~": null
    }
  },
  expected: {
    value: {
      message: "Hello, World!",
      "other>": null
    }
  },
  description: "a parameter with a partial reference key (key>partial) and a null default value",
  should: "should output the partial reference key with a null default value"
}, {
  kvp: {
    key: ">list",
    value: {
      message: "Hello"
    }
  },
  partial: {
    value: [{
      "~*": null
    }]
  },
  expected: {
    value: [{
      message: "Hello"
    }]
  },
  description: "a partial with an array value",
  should: "should process each array item in the partial and apply parameters"
}, {
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
}, {
  kvp: {
    key: ">section",
    value: {
      "spec.visibility": "visible",
      one: "A",
      two: "B",
      three: "C"
    }
  },
  partial: {
    value: {
      spec: {
        hints: ["section"],
        "~spec.*": null
      },
      value: {
        "~*": null,
        message: "Hello, World!"
      }
    }
  },
  expected: {
    value: {
      spec: {
        hints: ["section"],
        visibility: "visible"
      },
      value: {
        one: "A",
        two: "B",
        three: "C",
        message: "Hello, World!"
      }
    }
  },
  description: "a partial with a namespaced wildcard parameter ~spec.*",
  should: "should add all unknown parameters within the namespace in place of the wildcard"
}, {
  kvp: {
    key: ">section",
    value: {
      "spec.visibility": "visible",
      one: "A",
      two: "B",
      three: "C"
    }
  },
  partial: {
    value: {
      "spec.*~": null,
      "~*": null,
      message: "Hello, World!"
    }
  },
  expected: {
    value: {
      "spec.visibility": "visible",
      one: "A",
      two: "B",
      three: "C",
      message: "Hello, World!"
    }
  },
  description: "a partial with a namespaced wildcard parameter spec.*~",
  should: "should add all unknown parameters within the namespace in place of the wildcard"
}, {
  kvp: {
    key: "input>",
    value: null
  },
  partial: {
    value: {
      message: "Required Input",
      "requiredMessage?required": "The value is required."
    }
  },
  expected: {
    value: {
      message: "Required Input"
    }
  },
  description: "a partial with a conditional '?param' placeholder",
  should: "should not include the partial value if the named parameter is not supplied"
}, {
  kvp: {
    key: "input>",
    value: null
  },
  partial: {
    value: {
      message: "Text Input",
      "textInvalidMessage~?minLength|maxLength|pattern|format": "Invalid Format"
    }
  },
  expected: {
    value: {
      message: "Text Input"
    }
  },
  description: "a partial with a conditional placeholder with a regular expression",
  should: "should not include the partial value if a parameter matching the pattern is not supplied"
}, {
  kvp: {
    key: "input>",
    value: {
      required: true
    }
  },
  partial: {
    value: {
      message: "Required Input",
      "requiredMessage?required": "The value is required."
    }
  },
  expected: {
    value: {
      message: "Required Input",
      requiredMessage: "The value is required."
    }
  },
  description: "a partial with a conditional 'key?param' placeholder",
  should: "should include the partial value if the named parameter is supplied"
}, {
  kvp: {
    key: "input>",
    value: {
      required: true
    }
  },
  partial: {
    value: {
      message: "Required Input",
      "required?": "The value is required."
    }
  },
  expected: {
    value: {
      message: "Required Input",
      required: "The value is required."
    }
  },
  description: "a partial with a conditional 'param?' placeholder",
  should: "should include the partial value if the parameter is supplied"
}, {
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
    value: {
      message: "Text Input",
      textInvalidMessage: "Must have a maximum length of 1"
    }
  },
  description: "a partial with a conditional placeholder with a regular expression",
  should: "should include the partial value if a parameter name matching the pattern is supplied"
}, {
  kvp: {
    key: "input>",
    value: {
    }
  },
  partial: {
    value: {
      "label<~": "string template",
      "input#~": "object template",
      "items@~": "array template",
      "literal=~": "literal template"
    }
  },
  expected: {
    value: {
      "label<": "string template",
      "input#": "object template",
      "items@": "array template",
      "literal=": "literal template"
    }
  },
  description: "a partial with data-bound placeholders",
  should: "should include the data templates in the result"
}, {
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
}, {
//   kvp: {
//     key: "input>",
//     value: {
//       "label<": "replacement string",
//       "input#": "replacement object",
//       "items@": "replacement array",
//       "literal=": "replacement literal",
//       "other>": "replacement partial"
//     }
//   },
//   partial: {
//     value: {
//       "label~": "string template",
//       "input~": "object template",
//       "items~": "array template",
//       "literal~": "literal template",
//       "other>": "nested partial",
//       "l~label": "string template",
//       "i~input": "object template",
//       "a~items": "array template",
//       "t~literal": "literal template",
//       "o>other": "nested partial"
//     }
//   },
//   expected: {
//     value: {
//       "label<": "replacement string",
//       "input#": "replacement object",
//       "items@": "replacement array",
//       "literal=": "replacement literal",
//       "other>": "replacement partial",
//       "l<label": "replacement string",
//       "i#input": "replacement object",
//       "a@items": "replacement array",
//       "t=literal": "replacement literal",
//       "o>other": "replacement partial"
//     }
//   },
//   description: "a partial called with data-bound parameters",
//   should: "should include the data templates in the result"
// }, {
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
    value: {
      "label": "string template",
      "input": "object template",
      "items": "array template",
      "literal": "literal template"
    }
  },
  description: "a partial called with data-bound parameters",
  should: "should match conditional placeholders by name"
}];

describe("when authoring partials", function () {
  var only = tests.find(t => t.only);
  if(only) tests = [only];

  tests.forEach(function (test) {
    describe(test.description, function () {
      beforeEach(function () {
        sinon.stub(partials, "resolvePartial").returns(test.partial);
      });
      afterEach(function () {
        if(partials.resolvePartial.restore) partials.resolvePartial.restore();
      });

      it(test.should, function () {
        runTest(test);
      });
    });
  });

  describe("referencing another partial at the root", function () {
    var kvp = {
      key: ">outer",
      value: {
        "message": "Hello, World!"
      }
    };

    var outerPartial = {
      key: ">inner",
      value: {
        header: "Greetings",
        "~*": null
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

      stub.withArgs(kvp).returns(outerPartial);
      stub.withArgs(outerPartial).returns(innerPartial);
    });
    afterEach(function () {
      if(partials.resolvePartial.restore) partials.resolvePartial.restore();
    });

    it("should include the inner partial, including parameters described by the outer partial", function () {
      var actual = partials.getPartial(kvp);
      actual.should.deep.equal(expected);
    });
  });

  describe("referencing a root partial from a partial with a key", function () {
    var kvp = {
      key: "greeting>outer",
      value: {
        "message": "Hello, World!"
      }
    };

    var outerPartial = {
      key: "greeting",
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

      stub.withArgs(kvp).returns(outerPartial);
      stub.withArgs(outerPartial).returns(innerPartial);
    });
    afterEach(function () {
      if(partials.resolvePartial.restore) partials.resolvePartial.restore();
    });

    it("should include the inner partial, including parameters described by the outer partial", function () {
      var actual = partials.getPartial(kvp);
      actual.should.deep.equal(expected);
    });
  });
});
