"use strict";

var util = require("util");
var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var flattenYaml = require("../../src/lib/export/flatten-yaml");

var textNode = {
  expanded: {
    spec: { hints: [ "text" ] },
    value: "Hi"
  },
  flattened: {
    spec: { hints: [ "text" ] },
    value: "Hi"
  }
};

var objectNode = {
  expanded: {
    spec: { hints: [ "container" ], children: [ { name: "message" } ] },
    value: {
      message: textNode.expanded
    }
  },
  flattened: {
    spec: { hints: [ "container" ], children: [ { name: "message", hints: [ "text" ] } ] },
    value: {
      message: "Hi"
    }
  }
};

var childWithDynamicValue = {
  expanded: {
    spec: {
      hints: [ "container" ],
      children: [ { name: "message" } ]
    },
    value: {
      message: {
        spec: { hints: [ "text" ] },
        "value<message": "Hi" 
      }
    }
  },
  flattened: {
    spec: {
      hints: [ "container" ],
      children: [ { name: "message", hints: [ "text" ] } ]
    },
    value: {
      "message<": "Hi"
    }
  }
};

var childWithDynamicValueSpec = {
  expanded: {
    spec: {
      hints: [ "container" ],
      children: [ { name: "message" } ]
    },
    value: {
      "message#": {
        spec: { "visibility<": "hidden", hints: [ "text" ] },
        "value<": "Hi"
      }
    }
  },
  flattened: {
    spec: {
      hints: [ "container" ],
      children: [ { name: "message" } ]
    },
    value: {
      "message#": {
        spec: { "visibility<": "hidden", hints: [ "text" ] },
        "value<": "Hi"
      }
    }
  }
};

var tests = [
  {
    description: "a non-container value",
    should: "should not flatten specs",
    case: textNode
  },
  {
    description: "an object value",
    should: "should flatten specs",
    case: objectNode
  },
  {
    description: "a child with a dynamic value",
    should: "should flatten specs",
    case: childWithDynamicValue
  },
  {
    description: "a child with a dynamic value/spec",
    should: "should not flatten specs",
    case: childWithDynamicValueSpec
  }
];

function runTest(test) {
  var kvp = { value: test.case.expanded };
  var actual = flattenYaml(kvp);
  actual.value.should.deep.equal(test.case.flattened);
}

describe("when flattening YAML", function () {
  tests.forEach(function (test) {
    describe(test.description, function () {
      it(test.should, function () {
        runTest(test);
      });
    });
  });
});
