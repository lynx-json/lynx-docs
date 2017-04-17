const chai = require("chai");
const expect = chai.expect;
const handlebars = require("handlebars");

const addChildren = require("../../../../src/lib/export/lynx/add-children");
const processTemplate = require("../../../../src/lib/export/process-template");
const toHandlebars = require("../../../../src/lib/json-templates/to-handlebars");

var tests = [{
    description: "lynx text",
    should: "do not add children",
    template: { "bar>text": "Bar" },
    expected: {
      bar: {
        spec: { hints: ["text"] },
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
          hints: ["container"],
          children: [
            { name: "bar" },
            { name: "qux" }
          ]
        },
        value: {
          bar: { spec: { hints: ["text"] }, value: "Bar" },
          qux: { spec: { hints: ["text"] }, value: "Qux" }
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
          hints: ["container"]
        },
        value: [{
            bar: {
              spec: { hints: ["text"] },
              value: "Bar"
            }
          },
          {
            qux: {
              spec: { hints: ["text"] },
              value: "Qux"
            }
          }
        ]
      }
    }
  },
  {
    description: "lynx document",
    should: "add children",
    template: {
      "realm": "http://foo",
      ">container": {
        "one>container": {
          "oneOne>text": "One and one",
          "oneTwo>text": "One and two"
        },
        "two>container": {
          "oneOne>text": "One and one",
          "oneTwo>text": "One and two"
        }
      }
    },
    expected: {
      realm: "http://foo",
      spec: {
        hints: ["container"],
        children: [{ name: "one" }, { name: "two" }]
      },
      value: {
        one: {
          spec: {
            hints: ["container"],
            children: [{ name: "oneOne" }, { name: "oneTwo" }]
          },
          value: {
            oneOne: { spec: { hints: ["text"] }, value: "One and one" },
            oneTwo: { spec: { hints: ["text"] }, value: "One and two" }
          }
        },
        two: {
          spec: {
            hints: ["container"],
            children: [{ name: "oneOne" }, { name: "oneTwo" }]
          },
          value: {
            oneOne: { spec: { hints: ["text"] }, value: "One and one" },
            oneTwo: { spec: { hints: ["text"] }, value: "One and two" }
          }
        }
      }
    }
  },
  {
    description: "lynx object template and null inverse",
    should: "not add children",
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
          hints: ["container"]
        },
        value: {
          bar: { spec: { hints: ["text"] }, value: "Bar" },
          qux: { spec: { hints: ["text"] }, value: "Qux" }
        }
      }
    }
  },
  {
    description: "lynx object with template and non null inverse - truthy",
    should: "not add children",
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
          hints: ["container"]
        },
        value: {
          bar: { spec: { hints: ["text"] }, value: "Bar" },
          qux: { spec: { hints: ["text"] }, value: "Qux" }
        }
      }
    }
  },
  {
    description: "lynx object with template and non null inverse - falsey",
    should: "not add children",
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
          hints: ["container"]
        },
        value: {
          baz: { spec: { hints: ["text"] }, value: "Baz" }
        }
      }
    }
  },
  {
    description: "lynx object with nested templates and non null inverse - truthy",
    should: "add children to lowest nested level",
    template: {
      "foo#>container": {
        "bar#>container": {
          "fooBar>text": "Foo and bar"
        },
        "bar^>container": {
          "fooNoBar>text": "Foo no bar"
        }
      },
      "foo^>container": {
        "bar#>container": {
          "noFooBar>text": "No foo and bar"
        },
        "bar^>container": {
          "noFooNoBar>text": "No foo and no bar"
        }
      }
    },
    data: { foo: { bar: {} } },
    expected: {
      foo: {
        spec: {
          hints: ["container"]
        },
        value: {
          bar: {
            spec: {
              hints: ["container"]
            },
            value: {
              fooBar: {
                spec: {
                  hints: ["text"]
                },
                value: "Foo and bar"
              }
            }
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
  let processed, result, content, json, parsed;
  processed = processTemplate(test.template, { flatten: false });
  result = addChildren(processed);
  content = toHandlebars(result);
  json = handlebars.compile(content)(test.data);
  parsed = JSON.parse(json);
  if (test.include) {
    console.log("processed", "\n" + JSON.stringify(processed, null, 2));
    console.log("flattened", "\n" + JSON.stringify(result, null, 2));
    console.log("handlebars", "\n" + content);
    console.log("json", "\n" + json);
  }
  expect(parsed).to.deep.equal(test.expected);
}

describe("add-children to lynx document templates", function () {
  getTests().forEach(function (test) {
    describe("when " + test.description, function () {
      it("should " + test.should, function () {
        runTest(test);
      });
    });
  });
});
