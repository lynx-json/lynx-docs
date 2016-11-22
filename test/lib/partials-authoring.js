"use strict";

const chai = require("chai");
const should = chai.should();
const expect = chai.expect;
const sinon = require("sinon");
const partials = require("../../src/lib/partials-yaml");

function runTest(test) {
  var actual = partials.getPartial(test.kvp);
  actual.should.deep.equal(test.expected);
  // console.log(JSON.stringify(actual, null, 2));
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
  description: "a partial with the parameter value~",
  should: "should return the value in place"
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
      "partial>~": null
    }
  },
  expected: {
    value: {
      message: "Hello, World!",
      "partial>": null
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
      visibility: "visible",
      one: "One",
      two: "Two",
      three: "Three"
    }
  },
  partial: {
    value: {
      spec: {
        hints: ["section"],
        "visibility~": "hidden"
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
        one: "One",
        two: "Two",
        three: "Three",
        message: "Hello, World!"
      }
    }
  },
  description: "a partial with a wildcard parameter ~*",
  should: "should add all unknown parameters in place of the wildcard"
}];

describe.only("when authoring partials", function () {
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
});
