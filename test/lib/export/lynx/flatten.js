const chai = require("chai");
const expect = chai.expect;

const calculateChildren = require("../../../../src/lib/export/lynx/calculate-children");
const flatten = require("../../../../src/lib/export/lynx/flatten");
const jsonTemplates = require("../../../../src/lib/json-templates");

var tests = [{
    description: "text value only",
    should: "not flatten template",
    template: { "message>text": "Hello" },
    expected: {
      message: {
        spec: { hints: ["text"] },
        value: { "": "Hello" }
      }
    }
  },
  {
    description: "object container with text values",
    should: "flatten template",
    template: { ">container": { "message>text": "Hello" } },
    expected: {
      spec: {
        hints: ["container"],
        children: [{ name: "message", hints: ["text"] }]
      },
      message: { "": "Hello" }
    }
  },
  {
    description: "nested object containers",
    should: "flatten template",
    template: { ">container": { "c1>container": { "message>text": "Hello" } } },
    expected: {
      spec: {
        hints: ["container"],
        children: [{
          name: "c1",
          hints: ["container"],
          children: [{ name: "message", hints: ["text"] }]
        }]
      },
      c1: { message: { "": "Hello" } }
    }
  },
  {
    description: "array container with text values",
    should: "not flatten template",
    template: { ">container": [{ ">text": "Hello" }] },
    expected: {
      spec: { hints: ["container"] },
      value: { "": [{ spec: { hints: ["text"] }, value: { "": "Hello" } }] }
    }
  },
  {
    description: "dynamic spec in child",
    should: "not flatten template",
    template: {
      ">list": {
        "spec.labeledBy": "label",
        "#firstName": {
          "label>": "First Name",
          "firstName>line": {
            "value<value": "",
            "spec.input": true,
            "spec.validation": {
              required: {
                "state<requiredConstraintState": "",
                invalid: "requiredError"
              }
            }
          },
          "requiredError>text": "Required"
        },
        "^firstName": null
      }
    },
    expected: {
      spec: {
        hints: ["list", "container"],
        labeledBy: "label",
        children: [
          { name: "label", hints: ["label", "text"] },
          { name: "firstName" },
          { name: "requiredError", hints: ["text"] }
        ]
      },
      value: {
        "#firstName": {
          label: { "": "First Name" },
          firstName: {
            spec: {
              hints: ["line", "text"],
              input: true,
              validation: {
                required: {
                  state: { "<requiredConstraintState": "" },
                  invalid: "requiredError"
                }
              }
            },
            value: { "<value": "" }
          },
          requiredError: { "": "Required" }
        },
        "^firstName": null
      }
    }
  },
  {
    description: "array container with object containers values",
    should: "not flatten template",
    template: { ">container": [{ ">container": { "message>text": "Hello" } }] },
    expected: {
      spec: { hints: ["container"] },
      value: {
        "": [{
          spec: {
            hints: ["container"],
            children: [{ name: "message", hints: ["text"] }]
          },
          "message": { "": "Hello" }
        }]
      }
    }
  },
  {
    description: "object container with keys and dynamic container sections",
    should: "flatten template",
    template: { ">container": { "message>text": "Hello", "foo#>container": { "name>text": "Foo" }, "foo^>container": { "name>text": "No foo" } } },
    expected: {
      spec: {
        hints: ["container"],
        children: [
          { name: "message", hints: ["text"] },
          { name: "foo" }
        ]
      },
      message: { "": "Hello" },
      foo: {
        "#foo": {
          spec: {
            hints: ["container"],
            children: [{ name: "name", hints: ["text"] }]
          },
          "name": { "": "Foo" }
        },
        "^foo": {
          spec: {
            hints: ["container"],
            children: [{ name: "name", hints: ["text"] }]
          },
          "name": { "": "No foo" }
        }
      }
    }
  },
  {
    description: "object container with keys and dynamic sections",
    should: "flatten template",
    template: { ">container": { "message>lynx": "Hello", "foo>container": { "#foo": { "name>lynx": "Foo" }, "^foo": { "name>lynx": "No foo" } } } },
    expected: {
      spec: {
        hints: ["container"],
        children: [
          { name: "message", hints: ["text"] },
          {
            name: "foo",
            hints: ["container"],
            children: [{ name: "name", hints: ["text"] }]
          }
        ]
      },
      message: "Hello",
      foo: {
        value: {
          "#foo": {
            "name": "Foo"
          },
          "^foo": {
            "name": "No foo"
          }
        }
      }
    }
  }
];

function getTests() {
  let filtered = tests.filter(test => test.include === true);
  return filtered.length > 0 ? filtered : tests;
}

function runTest(test) {
  if (test.include || test.log) console.log("template", "\n" + JSON.stringify(test.template, null, 2));
  let processed = jsonTemplates.process(test.template, false);
  if (test.include || test.log) console.log("processed", "\n" + JSON.stringify(processed, null, 2));
  let childrenAdded = calculateChildren(processed);
  if (test.include || test.log) console.log("children added", "\n" + JSON.stringify(childrenAdded, null, 2));
  let result = flatten(processed);
  if (test.include || test.log) console.log("result", "\n" + JSON.stringify(result, null, 2));
  expect(result).to.deep.equal(test.expected);
}

describe("flatten lynx document templates", function () {
  getTests().forEach(function (test) {
    describe("when " + test.description, function () {
      it("should " + test.should, function () {
        runTest(test);
      });
    });
  });
});
