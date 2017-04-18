const chai = require("chai");
const expect = chai.expect;

const calculateChildren = require("../../../../src/lib/export/lynx/calculate-children");
const jsonTemplates = require("../../../../src/lib/json-templates");

var tests = [{
    description: "lynx text",
    should: "do not add children",
    template: { "bar>text": "Bar" },
    expected: {
      bar: {
        spec: { hints: ["text"] },
        value: { "": "Bar" }
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
          bar: { spec: { hints: ["text"] }, value: { "": "Bar" } },
          qux: { spec: { hints: ["text"] }, value: { "": "Qux" } }
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
        value: {
          "": [{
              bar: {
                spec: { hints: ["text"] },
                value: { "": "Bar" }
              }
            },
            {
              qux: {
                spec: { hints: ["text"] },
                value: { "": "Qux" }
              }
            }
          ]
        }
      }
    }
  },
  {
    description: "lynx document with nested containers",
    should: "add children to top level and nested containers",
    template: {
      realm: "http://foo",
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
            oneOne: {
              spec: { hints: ["text"] },
              value: { "": "One and one" }
            },
            oneTwo: {
              spec: { hints: ["text"] },
              value: { "": "One and two" }
            }
          }
        },
        two: {
          spec: {
            hints: ["container"],
            children: [{ name: "oneOne" }, { name: "oneTwo" }]
          },
          value: {
            oneOne: {
              spec: { hints: ["text"] },
              value: { "": "One and one" }
            },
            oneTwo: {
              spec: { hints: ["text"] },
              value: { "": "One and two" }
            }
          }
        }
      }
    }
  },
  {
    description: "template for container with null inverse",
    should: "add children from positive section",
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
          hints: ["container"],
          children: [{ name: "bar" }, { name: "qux" }]
        },
        value: {
          "#foo": {
            bar: {
              spec: { hints: ["text"] },
              value: { "": "Bar" }
            },
            qux: {
              spec: { hints: ["text"] },
              value: { "": "Qux" }
            }
          }
        }
      }
    }
  },
  {
    description: "template for container with binding and inverse with different children",
    should: "add children from both sections",
    template: {
      foo: {
        "#foo>container": { "bar>text": "Bar", "qux>text": "Qux" },
        "^foo>container": { "baz>text": "Baz" }
      }
    },
    expected: {
      foo: {
        spec: {
          hints: ["container"],
          children: [{ name: "bar" }, { name: "qux" }, { name: "baz" }]
        },
        value: {
          "#foo": {
            bar: {
              spec: { hints: ["text"] },
              value: { "": "Bar" }
            },
            qux: {
              spec: { hints: ["text"] },
              value: { "": "Qux" }
            }
          },
          "^foo": {
            baz: {
              spec: { hints: ["text"] },
              value: { "": "Baz" }
            }
          }
        }
      }
    }
  },
  {
    description: "nested templates for containers with different children in nested container",
    should: "add children to top level and nested containers",
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
    expected: {
      foo: {
        spec: {
          hints: ["container"],
          children: [{ name: "bar" }]
        },
        value: {
          "#foo": {
            bar: {
              spec: {
                hints: ["container"],
                children: [{ name: "fooBar" }, { name: "fooNoBar" }]
              },
              value: {
                "#bar": {
                  fooBar: {
                    spec: { hints: ["text"] },
                    value: { "": "Foo and bar" }
                  }
                },
                "^bar": {
                  fooNoBar: {
                    spec: { hints: ["text"] },
                    value: { "": "Foo no bar" }
                  }
                }
              }
            }
          },
          "^foo": {
            bar: {
              spec: {
                hints: ["container"],
                children: [{ name: "noFooBar" }, { name: "noFooNoBar" }]
              },
              value: {
                "#bar": {
                  noFooBar: {
                    spec: { hints: ["text"] },
                    value: { "": "No foo and bar" }
                  }
                },
                "^bar": {
                  noFooNoBar: {
                    spec: { hints: ["text"] },
                    value: { "": "No foo and no bar" }
                  }
                }
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
  processed = jsonTemplates.process(test.template, false);
  result = calculateChildren(processed);
  if (test.include) {
    console.log("processed", "\n" + JSON.stringify(processed, null, 2));
    console.log("result", "\n" + JSON.stringify(result, null, 2));
  }
  expect(result).to.deep.equal(test.expected);
}

describe("calculate-children for lynx document templates", function () {
  getTests().forEach(function (test) {
    describe("when " + test.description, function () {
      it("should " + test.should, function () {
        runTest(test);
      });
    });
  });
});
