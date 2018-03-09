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
    description: "lynx link",
    should: "add children",
    template: { "foo>link": { "label>": "A link", href: "." } },
    expected: {
      foo: {
        spec: {
          hints: ["link"],
          children: [{ name: "label" }],
          labeledBy: "label"
        },
        value: {
          label: { spec: { hints: ["label", "text"] }, value: "A link" },
          href: ".",
          type: "application/lynx+json"
        }
      }
    }
  },
  {
    description: "lynx link w/data",
    should: "add children",
    template: {
      "foo>link": {
        "label>": "Click Me",
        type: "application/json",
        "data>link": { "label>": "Click Me Too", type: "text/plain", data: "Hello, World!" }
      }
    },
    expected: {
      foo: {
        spec: {
          hints: ["link"],
          children: [{ name: "label" }],
          labeledBy: "label"
        },
        value: {
          label: { spec: { hints: ["label", "text"] }, value: "Click Me" },
          data: {
            spec: {
              hints: ["link"],
              children: [{ name: "label" }],
              labeledBy: "label"
            },
            value: {
              label: { spec: { hints: ["label", "text"] }, value: "Click Me Too" },
              type: "text/plain",
              data: "Hello, World!"
            }
          },
          type: "application/json"
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
    description: "lynx array explicit",
    should: "not add children",
    template: { foo: { spec: { hints: ["container"] }, value: [{ "bar>text": "Bar" }, { "qux>text": "Qux" }] } },
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
    description: "lynx document with nested containers with compatible children",
    should: "add children to container",
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
              value: "One and one"
            },
            oneTwo: {
              spec: { hints: ["text"] },
              value: "One and two"
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
              value: "One and one"
            },
            oneTwo: {
              spec: { hints: ["text"] },
              value: "One and two"
            }
          }
        }
      }
    }
  },
  {
    description: "template for container with null inverse value",
    should: "add children from positive section",
    template: {
      "foo>container": {
        "#foo": { "bar>text": "Bar", "qux>text": "Qux" },
        "^foo": null
      }
    },
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
              value: "Bar"
            },
            qux: {
              spec: { hints: ["text"] },
              value: "Qux"
            }
          },
          "^foo": null
        }
      }
    }
  },
  {
    description: "container with static and templated keys with",
    should: "add children from positive section",
    template: {
      ">container": {
        "message>text": "Static content",
        "foo#>container": { "bar>text": "Bar", "qux>text": "Qux" },
        "foo^": null
      }
    },
    expected: {
      spec: {
        hints: ["container"],
        children: [{ name: "message" }, { name: "foo" }]
      },
      value: {
        message: {
          spec: { hints: ["text"] },
          value: "Static content"
        },
        foo: {
          "#foo": {
            spec: {
              hints: ["container"],
              children: [{ name: "bar" }, { name: "qux" }]
            },
            value: {
              bar: {
                spec: { hints: ["text"] },
                value: "Bar"
              },
              qux: {
                spec: { hints: ["text"] },
                value: "Qux"
              }
            }
          },
          "^foo": null
        }
      }
    }
  },
  {
    description: "template for container with binding and inverse with different children",
    should: "throw error because sections are incompatible",
    template: {
      "foo>container": {
        "#foo": { "bar>text": "Bar", "qux>text": "Qux" },
        "^foo": { "baz>text": "Baz" }
      }
    },
    throws: Error
  },
  {
    description: "nested templates for containers with different children in nested container",
    should: "throw error because sections are incompatible",
    template: {
      "foo#>container": {
        "bar>container": {
          "#bar": {
            "fooBar>text": "Foo and bar"
          },
          "^bar": {
            "fooNoBar>text": "Foo no bar"
          }
        }
      },
      "foo^>container": {
        "bar>container": {
          "#bar": {
            "noFooBar>text": "No foo and bar"
          },
          "^bar": {
            "noFooNoBar>text": "No foo and no bar"
          }
        }
      }
    },
    throws: Error
  },
  {
    description: "nested templates for containers with same children in nested container",
    should: "add children to container",
    template: {
      "foo>container": {
        "#foo": {
          "bar>container": {
            "#bar": {
              "fooBar>text": "Foo and bar"
            },
            "^bar": {
              "fooBar>text": "Foo no bar"
            }
          }
        },
        "^foo": {
          "bar>container": {
            "#bar": {
              "fooBar>text": "No foo and bar"
            },
            "^bar": {
              "fooBar>text": "No foo and no bar"
            }
          }
        }
      }
    },
    expected: {
      foo: {
        spec: { hints: ["container"], children: [{ name: "bar" }] },
        value: {
          "#foo": {
            bar: {
              spec: { hints: ["container"], children: [{ name: "fooBar" }] },
              value: {
                "#bar": {
                  fooBar: {
                    spec: { hints: ["text"] },
                    value: "Foo and bar"
                  }
                },
                "^bar": {
                  fooBar: {
                    spec: { hints: ["text"] },
                    value: "Foo no bar"
                  }
                }
              }
            }
          },
          "^foo": {
            bar: {
              spec: { hints: ["container"], children: [{ name: "fooBar" }] },
              value: {
                "#bar": {
                  fooBar: {
                    spec: { hints: ["text"] },
                    value: "No foo and bar"
                  }
                },
                "^bar": {
                  fooBar: {
                    spec: { hints: ["text"] },
                    value: "No foo and no bar"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  {
    description: "nested templates for containers with same children in nested templates",
    should: "add children to container",
    template: {
      "foo>container": {
        "#foo": {
          "#bar": {
            "fooBar>text": "Foo and bar"
          },
          "^bar": {
            "fooBar>text": "Foo no bar"
          }
        },
        "^foo": {
          "#bar": {
            "fooBar>text": "No foo and bar"
          },
          "^bar": {
            "fooBar>text": "No foo and no bar"
          }
        }
      }
    },
    expected: {
      foo: {
        spec: { hints: ["container"], children: [{ name: "fooBar" }] },
        value: {
          "#foo": {
            "#bar": {
              fooBar: {
                spec: { hints: ["text"] },
                value: "Foo and bar"
              }
            },
            "^bar": {
              fooBar: {
                spec: { hints: ["text"] },
                value: "Foo no bar"
              }
            }
          },
          "^foo": {
            "#bar": {
              fooBar: {
                spec: { hints: ["text"] },
                value: "No foo and bar"
              }
            },
            "^bar": {
              fooBar: {
                spec: { hints: ["text"] },
                value: "No foo and no bar"
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
  if (test.include || test.log) console.log("template", "\n" + JSON.stringify(test.template, null, 2));
  let processed = jsonTemplates.process(test.template, false);
  if (test.include || test.log) console.log("processed", "\n" + JSON.stringify(processed, null, 2));
  if (test.throws) return expect(function () { return calculateChildren(processed); }).to.throw(test.throws);
  let result = calculateChildren(processed);
  if (test.include || test.log) console.log("result", "\n" + JSON.stringify(result, null, 2));
  expect(result).to.deep.equal(test.expected);
}

describe("calculate children for lynx document templates", function () {
  getTests().forEach(function (test) {
    describe("when " + test.description, function () {
      it("should " + test.should, function () {
        runTest(test);
      });
    });
  });
});
