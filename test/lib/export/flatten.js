const chai = require("chai");
const expect = chai.expect;
const handlebars = require("handlebars");

const flatten = require("../../../src/lib/export/flatten");
const processTemplate = require("../../../src/lib/export/process-template");
const toHandlebars = require("../../../src/lib/json-templates/to-handlebars");

var tests = [{
    description: "lynx text",
    should: "do not add children",
    template: { "bar>text": "Bar" },
    expected: {
      bar: {
        spec: {
          name: "bar",
          hints: ["text"]
        },
        value: "Bar"
      }
    }
  },
  {
    description: "lynx object",
    should: "add children",
    template: { "foo>container": { "bar>text": "Bar", "qux>text": "Qux" } },
    expected: {
      foo: {
        spec: {
          name: "foo",
          hints: ["container"],
          children: [
            { name: "bar", hints: ["text"] },
            { name: "qux", hints: ["text"] }
          ]
        },
        value: {
          bar: "Bar",
          qux: "Qux"
        }
      }
    }
  },
  {
    description: "lynx array",
    should: "not add children",
    template: { "foo>container": [{ "bar>text": "Bar" }, { "qux>text": "Qux" }] },
    expected: {
      foo: {
        spec: {
          name: "foo",
          hints: ["container"]
        },
        value: [{
            bar: {
              spec: { hints: ["text"], name: "bar" },
              value: "Bar"
            }
          },
          {
            qux: {
              spec: { hints: ["text"], name: "qux" },
              value: "Qux"
            }
          }
        ]
      }
    }
  },
  {
    description: "lynx object template and null inverse",
    should: "add children",
    template: {
      "foo>container": {
        "#foo": { "bar>text": "Bar", "qux>text": "Qux" },
        "^foo": null
      }
    },
    data: { foo: {} },
    expected: {
      foo: {
        spec: {
          name: "foo",
          hints: ["container"],
          children: [
            { name: "bar", hints: ["text"] },
            { name: "qux", hints: ["text"] }
          ]
        },
        value: {
          bar: "Bar",
          qux: "Qux"
        }
      }
    }
  },
  {
    description: "lynx object with template and non null inverse - truthy",
    should: "add children",
    template: {
      "foo": {
        "#foo>container": { "bar>text": "Bar", "qux>text": "Qux" },
        "^foo>container": { "baz>text": "Baz" }
      }
    },
    data: { foo: {} },
    expected: {
      foo: {
        spec: {
          name: "foo",
          hints: ["container"],
          children: [
            { name: "bar", hints: ["text"] },
            { name: "qux", hints: ["text"] }
          ]
        },
        value: {
          bar: "Bar",
          qux: "Qux"
        }
      }
    }
  },
  {
    description: "lynx object with template and non null inverse - falsey",
    should: "add children",
    template: {
      "foo": {
        "#foo>container": { "bar>text": "Bar", "qux>text": "Qux" },
        "^foo>container": { "baz>text": "Baz" }
      }
    },
    data: { noFoo: {} },
    expected: {
      foo: {
        spec: {
          name: "foo",
          hints: ["container"],
          children: [
            { name: "baz", hints: ["text"] }
          ]
        },
        value: {
          baz: "Baz"
        }
      }
    }
  },
  {
    skip: true,
    description: "lynx object with nested templates and non null inverse - truthy",
    should: "add children to lowest nested level",
    template: {
      "foo#>container": {
        "bar#>container": {
          "message>text": "Foo and bar"
        },
        "bar^>container": {
          "message>text": "Foo and bar"
        }
      },
      "foo^>container": {
        "bar#>container": {
          "message>text": "No foo and bar"
        },
        "bar^>container": {
          "message>text": "No foo and no bar"
        }
      }
    },
    data: { foo: { bar: {} } },
    expected: {
      foo: {
        spec: {
          name: "foo",
          hints: ["container"],
          children: [
            { name: "bar", hints: ["text"] },
            { name: "qux", hints: ["text"] }
          ]
        },
        value: {
          bar: "Bar",
          qux: "Qux"
        }
      }
    }
  }
];

function runTest(test) {
  var processed = processTemplate(test.template, {});
  var result = flatten(processed);
  let content = toHandlebars(result);
  let json = handlebars.compile(content)(test.data);
  let parsed = JSON.parse(json);

  expect(parsed).to.deep.equal(test.expected);
}

describe("when flattening templates for lynx documents", function () {
  tests.forEach(function (test) {
    if (test.skip) return;
    describe("when " + test.description, function () {
      it("should " + test.should, function () {
        runTest(test);
      });
    });
  });
});
