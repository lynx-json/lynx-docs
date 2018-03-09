const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");

const expandPartials = require("../../../../src/lib/json-templates/partials/expand");
const resolvePartial = require("../../../../src/lib/json-templates/partials/resolve");

describe("expand partials module", function () {
  describe("when calculating partial urls", function () {
    //TODO: Tests for calculating partial urls
  });
  describe("when expanding partials", function () {
    let tests = [{
        description: "no partial",
        template: { foo: "Foo" },
        expected: { foo: "Foo" }
      },
      {
        description: "verifying resolve called with url calculated from template path",
        template: { foo: { ">p": "Foo" } },
        expected: { foo: "Foo" },
        templatePath: "a/b/",
        resolvePartial: function (partialUrl) {
          expect(partialUrl).to.equal("a/b/?partial=p");
          return (value) => value;
        }
      },
      {
        description: "verifying partial overriding partial can call overridden partial",
        template: { ">p": { ">p": { ">p": "A value" } } },
        expected: "A value created by calling overridden partials",
        templatePath: "a/b/c/",
        resolvePartial: function (partialUrl) {
          return (value) => {
            if (partialUrl === "a/b/c/?partial=p") return value;
            if (partialUrl === "a/b/?partial=p") {
              value[">p"] += " created by calling";
              return value;
            }
            if (partialUrl === "a/?partial=p") return value += " overridden partials";
            throw "Unexpected partial url " + partialUrl;
          };
        }
      },
      {
        description: "partial with simple value - string",
        template: { foo: { ">bar": "Bar" } },
        expected: { foo: "Bar" },
        resolvePartial: () => (value) => value
      },
      {
        description: "partial with simple value - number",
        template: { foo: { ">bar": 10 } },
        expected: { foo: 10 },
        resolvePartial: () => (value) => value
      },
      {
        description: "partial with simple value - boolean",
        template: { foo: { ">bar": true } },
        expected: { foo: true },
        resolvePartial: () => (value) => value
      },
      {
        description: "partial with array value",
        template: { foo: { ">bar": ["One", "Two"] } },
        expected: { foo: ["One", "Two"] },
        resolvePartial: () => (value) => value
      },
      {
        description: "partial and bindings. Bindings expanded",
        template: { foo: { ">bar": { "#foo": "Bar", "^foo": null } } },
        expected: { foo: { "#foo": "Bar", "^foo": null } },
        resolvePartial: () => (value) => value
      },
      {
        description: "partial only keys as array items",
        template: { foo: [{ ">bar": { qux: "Qux" } }] },
        expected: { foo: [{ qux: "Qux" }] },
        resolvePartial: () => (value) => value
      },
      {
        description: "nested lynx partials",
        template: { foo: { ">container": { "spec.visibility": "hidden", one: "one" } } },
        expected: { foo: { spec: { hints: ["container"], visibility: "hidden" }, value: { one: "one" } } },
      },
      {
        description: "nested lynx partials at root",
        template: { ">container": { "spec.visibility": "hidden", one: "one" } },
        expected: { spec: { hints: ["container"], visibility: "hidden" }, value: { one: "one" } },
      },
      {
        description: "lynx text partial with string parameter",
        template: { foo: { ">text": "Foo" } },
        expected: { foo: { spec: { hints: ["text"] }, value: "Foo" } },
      },
      {
        description: "container partial with array parameter",
        template: { foo: { ">container": ["Foo", "Bar"] } },
        expected: { foo: { spec: { hints: ["container"] }, value: ["Foo", "Bar"] } },
      },
      {
        description: "container partial with positive and negative sections for value",
        template: { foo: { ">container": { "#foo": { message: "Yes foo" }, "^foo": null } } },
        expected: { foo: { spec: { hints: ["container"] }, value: { "#foo": { message: "Yes foo" }, "^foo": null } } },
      },
      {
        description: "partial with null parameter",
        template: { foo: { ">text": null } },
        expected: { foo: { spec: { hints: ["text"] }, value: null } },
      },
      {
        description: "deeply nested partials at root",
        template: {
          foo: {
            ">container": {
              "#foo": {
                bar: {
                  ">container": {
                    "#bar": {
                      fooBar: {
                        ">text": "Foo and bar"
                      }
                    },
                    "^bar": {
                      fooNoBar: {
                        ">text": "Foo no bar"
                      }
                    }
                  }
                }
              },
              "^foo": {
                bar: {
                  ">container": {
                    "#bar": {
                      noFooBar: {
                        ">text": "No foo and bar"
                      }
                    },
                    "^bar": {
                      noFooNoBar: {
                        ">text": "No foo and no bar"
                      }
                    }
                  }
                }
              }
            }
          }
        },
        expected: {
          foo: {
            spec: { hints: ["container"] },
            value: {
              "#foo": {
                bar: {
                  spec: { hints: ["container"] },
                  value: {
                    "#bar": {
                      fooBar: {
                        spec: { hints: ["text"] },
                        value: "Foo and bar"
                      }
                    },
                    "^bar": {
                      fooNoBar: {
                        spec: { hints: ["text"] },
                        value: "Foo no bar"
                      }
                    }
                  }
                }
              },
              "^foo": {
                bar: {
                  spec: { hints: ["container"] },
                  value: {
                    "#bar": {
                      noFooBar: {
                        spec: { hints: ["text"] },
                        value: "No foo and bar"
                      }
                    },
                    "^bar": {
                      noFooNoBar: {
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
      }
    ];

    function getTests() {
      let filtered = tests.filter(test => test.include === true);
      return filtered.length > 0 ? filtered : tests;
    }

    function runTest(test) {
      if (test.include || test.log) console.log("partial", "\n" + JSON.stringify(test.template, null, 2));
      test.resolvePartial = test.resolvePartial || resolvePartial.resolve;
      let result = expandPartials.expand(test.template, test.resolvePartial, test.templatePath);
      if (test.include || test.log) console.log("result", "\n" + JSON.stringify(result, null, 2));
      expect(result).to.deep.equal(test.expected);
    }

    getTests().forEach(function (test) {
      describe("when ".concat(test.description), function () {
        it("should produce expected outcome", function () {
          runTest(test);
        });
      });
    });
  });
});
