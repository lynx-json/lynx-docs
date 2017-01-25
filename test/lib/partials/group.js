const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");

const should = chai.should();
chai.use(chaiAsPromised);
const partials = require("../../../src/lib/partials-yaml");

var tests = [{
    description: "array value",
    should: "have group hint and array value",
    kvp: {
      key: ">group",
      value: ["one", "two", "three"]
    },
    expected: {
      key: "",
      value: {
        spec: { hints: ["group"] },
        value: ["one", "two", "three"]
      }
    }
  },
  {
    description: "object value",
    should: "have group hint and object value",
    kvp: {
      key: ">group",
      value: { one: "one", two: "two", three: "three" }
    },
    expected: {
      key: "",
      value: {
        spec: { hints: ["group"] },
        value: { one: "one", two: "two", three: "three" }
      }
    }
  },
  {
    description: "with spec.* properties",
    should: "have specified spec properties in result",
    kvp: {
      key: ">group",
      value: {
        "spec.hints": ["whatever", "group"],
        "spec.visibility": "visible",
        "spec.input": true,
        value: ["one", "two"]
      }
    },
    expected: {
      key: "",
      value: {
        spec: {
          hints: ["whatever", "group"],
          visibility: "visible",
          "input": true
        },
        value: ["one", "two"]
      }
    }
  },
  {
    description: "with spec object",
    should: "have specified spec properties in result",
    kvp: {
      key: ">group",
      value: {
        spec: {
          hints: ["group"],
          visibility: "visible",
          "input": true
        },
        value: ["one", "two"]
      }
    },
    expected: {
      key: "",
      value: {
        spec: {
          hints: ["group"],
          visibility: "visible",
          "input": true
        },
        value: ["one", "two"]
      }
    }
  }
];

describe.only("group partials", function () {
  tests.forEach(test => {
    describe(test.description, function () {
      it("should ".concat(test.should), function () {
        runTest(test);
      });
    });
  });
});

function runTest(test) {
  var actual = partials.getPartial(test.kvp, { realm: { folder: process.cwd() } });
  delete actual.location; //TODO: Understand why this is returned
  actual.should.deep.equal(test.expected);
}
