const chai = require("chai");
const expect = chai.expect;
const types = require("../../../../src/types");

const processPartial = require("../../../../src/lib/json-templates/partials/process").process;

let tests = [{
    description: "partial with no placeholders",
    should: "return contents of partial",
    partial: { value: "Hello, World!" },
    parameters: null,
    expected: { value: "Hello, World!" },
  },
  {
    description: "a partial with the placeholder value~",
    should: "should return a text value in place of the placeholder",
    partial: { "value~": null },
    parameters: { value: "Hello, World!" },
    expected: { value: "Hello, World!" }
  },
  {
    description: "a partial with the placeholder value~",
    should: "should return an array value in place of the placeholder",
    partial: { "value~": null },
    parameters: { value: ["One", "Two", "Three"] },
    expected: { value: ["One", "Two", "Three"] }
  },
  {
    description: "partial with exact placeholders",
    should: "replace placeholders with parameters",
    partial: { "spec~": null, "value~": null },
    parameters: { spec: "spec", value: "value" },
    expected: { spec: "spec", value: "value" }
  },
  {
    description: "a partial with a spec and a value parameter",
    should: "should return the value in place along with the spec",
    partial: { spec: { emhasis: 1 }, "value~": null },
    parameters: { value: "Hello, World!" },
    expected: { spec: { emhasis: 1 }, value: "Hello, World!" }
  },
  {
    description: "a partial with a spec and a value with parameters",
    should: "should apply the parameters to the value",
    partial: { spec: { hints: ["section"] }, value: { "header~": null } },
    parameters: { header: "Hello, World!" },
    expected: { spec: { hints: ["section"] }, value: { header: "Hello, World!" } }
  },
  {
    description: "a partial with a spec and value, both with parameters",
    should: "should apply the parameters to the value and the spec",
    partial: {
      spec: { hints: ["section"], "visibility~": "visible" },
      value: { "header~": null }
    },
    parameters: { header: "Hello, World!", visibility: "hidden" },
    expected: {
      spec: { hints: ["section"], visibility: "hidden" },
      value: { header: "Hello, World!" }
    }
  },
  {
    description: "a partial with a default parameter",
    should: "should return the default value when the parameter is not provided",
    partial: { "message~": "Hello, World!" },
    parameters: null,
    expected: { message: "Hello, World!" }
  },
  {
    description: "a partial with a null placeholder value and no matching parameters",
    should: "should be included in the partial output",
    partial: { "message~": "Hello, World!", "missing~": null },
    parameters: null,
    expected: { message: "Hello, World!", missing: null }
  },
  {
    description: "a partial with an array value and wildcard",
    should: "should process each array item in the partial and apply parameters",
    partial: [{ "*~": null }],
    parameters: { message: "Hello" },
    expected: [{ message: "Hello" }]
  },
  {
    description: "a partial called with a data-bound string literal",
    should: "should bind the string literal template to the value parameter (because there's no point binding it to a spec/value pair)",
    partial: { spec: { hints: ["header"] }, value: { "*~": null } },
    parameters: { "<label": "Default Label" },
    expected: { spec: { hints: ["header"] }, value: { "<label": "Default Label" } }
  },
  {
    description: "a partial called with a data-bound literal",
    should: "should bind the literal template to the value parameter",
    partial: { spec: { hints: ["money"] }, "value~": { "*~": null } },
    parameters: { "=price": 43 },
    expected: { spec: { hints: ["money"] }, value: { "=price": 43 } }
  },
  //divider between migrated and new tests
  {
    description: "a partial with named placeholder and wildcard placeholder nested",
    should: "should replace named placeholder at root and only use remaining parameters for wildcard",
    partial: { "value": { "*~": null }, "message~": "Goodbye" },
    parameters: { "message": "Hello", "name<": "Your name" },
    expected: { value: { "name<": "Your name" }, "message": "Hello" }
  },
  {
    description: "a partial with named placeholder referencing another partial called with parameter referencing different partial",
    should: "should replace named placeholder",
    partial: { header: { "message~>label": "Goodbye" } },
    parameters: { message: { ">stylized-text": "Hello" } },
    expected: { header: { message: { ">stylized-text": "Hello" } } }
  },
  {
    description: "a partial with the wildcard placeholder",
    should: "should return all parameter keys and values in place of wildcard",
    partial: { value: { "*~": null } },
    parameters: { "message<": "Hello", "name<": "Your name" },
    expected: { value: { "message<": "Hello", "name<": "Your name" } }
  },
  {
    description: "a partial with the wildcard placeholder and null parameter values",
    should: "should return all parameter keys and values",
    partial: { value: { "*~": null } },
    parameters: { "#foo": null, "^foo": null },
    expected: { value: { "#foo": null, "^foo": null } }
  },
  {
    description: "a partial that returns a partial",
    should: "should return perform replacements and return partial",
    partial: { ">lynx": { "spec.hints": ["container"], "*~": null } },
    parameters: { "spec.visibility": "hidden", one: "one" },
    expected: { ">lynx": { "spec.hints": ["container"], "spec.visibility": "hidden", one: "one" } }
  },
  {
    description: "placeholders that are nested",
    should: "should return perform replacements and return partial",
    partial: {
      ">section": {
        "spec.hints": ["http://uncategorized/listing/item", "card", "section", "container"],
        "symbol>lynx": { "spec.hints": ["http://uncategorized/listing/item/symbol", "container"], "symbol~": "●" },
        "*~": null
      }
    },
    parameters: { "symbol": 1 },
    expected: {
      ">section": {
        "spec.hints": [
          "http://uncategorized/listing/item", "card", "section", "container"
        ],
        "symbol>lynx": {
          "spec.hints": ["http://uncategorized/listing/item/symbol", "container"],
          "symbol": 1
        }
      }
    }
  },
  {
    description: "Issue 108: paramater with partial reference",
    should: "should replace nested placeholders and maintain key ordering",
    partial: {
      ">list": {
        "label>~": "Name",
        "input>line": {
          "spec.input~": "name",
          "value~": ""
        }
      }
    },
    parameters: { "label>": "First Name", "spec.input": "firstName", value: "John" },
    expected: {
      ">list": {
        "label>": "First Name",
        "input>line": {
          "spec.input": "firstName",
          "value": "John"
        }
      }
    }
  },
  {
    description: "Issue 108: paramater with key only",
    should: "should replace nested placeholders and maintain key ordering",
    partial: {
      ">list": {
        "label>~": "Name",
        "input>line": {
          "spec.input~": "name",
          "value~": ""
        }
      }
    },
    parameters: { "label": "First Name", "spec.input": "firstName", value: "John" },
    expected: {
      ">list": {
        "label": "First Name",
        "input>line": {
          "spec.input": "firstName",
          "value": "John"
        }
      }
    }
  },
  {
    description: "Issue 108: paramater with quoted binding",
    should: "should replace nested placeholders and maintain key ordering",
    partial: {
      ">list": {
        "label>~": "Name",
        "input>line": {
          "spec.input~": "name",
          "value~": ""
        }
      }
    },
    parameters: { "label<": "First Name", "spec.input": "firstName", value: "John" },
    expected: {
      ">list": {
        "label<": "First Name",
        "input>line": {
          "spec.input": "firstName",
          "value": "John"
        }
      }
    }
  },
  {
    description: "Issue 108: paramater with literal binding",
    should: "should replace nested placeholders and maintain key ordering",
    partial: {
      ">list": {
        "label>~": "Name",
        "input>line": {
          "spec.input~": "name",
          "value~": ""
        }
      }
    },
    parameters: { "label=": "First Name", "spec.input": "firstName", value: "John" },
    expected: {
      ">list": {
        "label=": "First Name",
        "input>line": {
          "spec.input": "firstName",
          "value": "John"
        }
      }
    }
  },
  {
    description: "Issue 108: paramater with partial reference and placeholder",
    should: "should replace nested placeholders and maintain key ordering",
    partial: {
      ">list": {
        "label>~": "Name",
        "input>line": {
          "spec.input~": "name",
          "value~": ""
        }
      }
    },
    parameters: { "label>~": "First Name", "spec.input": "firstName", value: "John" },
    expected: {
      ">list": {
        "label>~": "First Name",
        "input>line": {
          "spec.input": "firstName",
          "value": "John"
        }
      }
    }
  },
  {
    description: "Issue 108: paramater with partial reference and quoted binding",
    should: "should replace nested placeholders and maintain key ordering",
    partial: {
      ">list": {
        "label>~": "Name",
        "input>line": {
          "spec.input~": "name",
          "value~": ""
        }
      }
    },
    parameters: { "label<title>stylized-text": "First Name", "spec.input": "firstName", value: "John" },
    expected: {
      ">list": {
        "label<title>stylized-text": "First Name",
        "input>line": {
          "spec.input": "firstName",
          "value": "John"
        }
      }
    }
  },
  {
    description: "When same placeholder is referenced in multiple locations",
    should: "should use parameter in all locations",
    partial: {
      "electronicTerms~": true,
      "mobilePhone>mobile-phone-input-data": {
        "enforceRequired~electronicTerms": true
      },

      "emailAddress>email-address-input-data": {
        "enforceRequired~electronicTerms": true
      },
      "*~": null
    },
    parameters: { electronicTerms: false, foo: { bar: "qux" } },
    expected: {
      "electronicTerms": false,
      "mobilePhone>mobile-phone-input-data": {
        "enforceRequired": false
      },

      "emailAddress>email-address-input-data": {
        "enforceRequired": false
      },
      foo: { bar: "qux" }
    }
  },
  {
    description: "When placeholder includes explicit partial reference and no matching parameter",
    should: "should use key name with partial reference in result",
    partial: {
      "optional>foo~bar": "default"
    },
    parameters: {},
    expected: {
      "optional>foo": "default"
    }
  },
  {
    description: "When placeholder includes implicit partial reference and no matching parameter",
    should: "should use key name with partial reference in result",
    partial: {
      "optional>foo~": "default"
    },
    parameters: {},
    expected: {
      "optional>foo": "default"
    }
  },
];

function getTests() {
  let filtered = tests.filter(test => test.include === true);
  return filtered.length > 0 ? filtered : tests;
}

function runTest(test) {
  if (test.include || test.log) console.log("partial", "\n" + JSON.stringify(test.partial, null, 2));
  if (test.include || test.log) console.log("parameters", "\n" + JSON.stringify(test.parameters, null, 2));
  let result = processPartial(test.partial, test.parameters);
  if (test.include || test.log) console.log("result", "\n" + JSON.stringify(result, null, 2));
  expect(result).to.deep.equal(test.expected);
  //assert that the keys are in the same order as expected
  let keys = types.isArray(result) ? result : getDeepKeys(result);
  let compare = types.isArray(test.expected) ? test.expected : getDeepKeys(test.expected);
  expect(keys).to.have.ordered.deep.members(compare);
}

function getDeepKeys(obj) {
  return Object.keys(obj).reduce((acc, key) => {
    acc.push(key);
    if (types.isObject(obj[key])) {
      acc = acc.concat(getDeepKeys(obj[key]).map(sub => `${key}.${sub}`));
    }
    return acc;
  }, []);
}

describe("process partials module", function () {
  getTests().forEach(function (test) {
    describe("when ".concat(test.description), function () {
      it(test.should, function () {
        runTest(test);
      });
    });
  });
});
