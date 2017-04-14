const chai = require("chai");
const expect = chai.expect;

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
      spec: { hints: ["section"], "visibility": "hidden" },
      value: { "header": "Hello, World!" }
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
    description: "a parameter with a null default value",
    should: "should not be included in the partial output",
    partial: { "message~": "Hello, World!", "missing~": null },
    parameters: null,
    expected: { message: "Hello, World!" }
  },
  {
    description: "a parameter with a templated key and a null default value",
    should: "should output the templated key with a null default value",
    partial: { "message~": "Hello, World!", "templated<": null },
    parameters: null,
    expected: { message: "Hello, World!", "templated<": null },
  },
  {
    description: "a parameter with a partial reference key (key>partial) and a null default value",
    should: "should output the partial reference key with a null default value",
    partial: { "message~": "Hello, World!", "other>": null },
    parameters: null,
    expected: { message: "Hello, World!", "other>": null }
  },
  {
    description: "a partial with an array value",
    should: "should process each array item in the partial and apply parameters",
    partial: [{ "~*": null }],
    parameters: { message: "Hello" },
    expected: [{ message: "Hello" }]
  },
  {
    description: "a partial with a namespaced wildcard parameter ~spec.*",
    should: "should add all unknown parameters within the namespace in place of the wildcard",
    partial: {
      spec: { hints: ["section"], "~spec.": null },
      value: { "~*": null, message: "Hello, World!" }
    },
    parameters: { "spec.visibility": "visible", one: "A", two: "B", three: "C" },
    expected: {
      spec: { hints: ["section"], visibility: "visible" },
      value: { one: "A", two: "B", three: "C", message: "Hello, World!" }
    }
  },
  {
    description: "a partial with a namespaced wildcard parameter spec.*~",
    should: "should add all unknown parameters within the namespace in place of the wildcard",
    partial: { "spec.*~": null, "~*": null, message: "Hello, World!" },
    parameters: { "spec.visibility": "visible", one: "A", two: "B", three: "C" },
    expected: { "spec.visibility": "visible", one: "A", two: "B", three: "C", message: "Hello, World!" }
  },
  {
    description: "a partial with data-bound placeholders",
    should: "should include the data templates in the result",
    partial: {
      "label<~": "string template",
      "input#~": "object template",
      "items@~": "array template",
      "literal=~": "literal template"
    },
    parameters: {},
    expected: {
      "label<": "string template",
      "input#": "object template",
      "items@": "array template",
      "literal=": "literal template"
    }
  },
  {
    description: "a partial called with a data-bound string literal",
    should: "should bind the string literal template to the value parameter (because there's no point binding it to a spec/value pair)",
    partial: { spec: { hints: ["header"] }, "value": { "~*": null } },
    parameters: { "<label": "Default Label" },
    expected: { spec: { hints: ["header"] }, "value": { "<label": "Default Label" } }
  },
  {
    description: "a partial called with a data-bound literal",
    should: "should bind the literal template to the value parameter",
    partial: { spec: { hints: ["money"] }, "value~": { "~*": null } },
    parameters: { "=price": 43 },
    expected: { spec: { hints: ["money"] }, value: { "=price": 43 } }
  },
  {
    description: "a partial with a conditional '?param' placeholder",
    should: "should not include the partial value if the named parameter is not supplied",
    partial: {
      message: "Required Input",
      "requiredMessage?required": "The value is required."
    },
    parameters: null,
    expected: { message: "Required Input" }
  },
  {
    description: "a partial with a conditional placeholder with a regular expression",
    should: "should not include the partial value if a parameter matching the pattern is not supplied",
    partial: {
      message: "Text Input",
      "textInvalidMessage~?minLength|maxLength|pattern|format": "Invalid Format"
    },
    parameters: null,
    expected: { message: "Text Input" }
  },
  {
    description: "a partial with a conditional 'key?param' placeholder",
    should: "should include the partial value if the named parameter is supplied",
    partial: {
      message: "Required Input",
      "requiredMessage?required": "The value is required."
    },
    parameters: { required: true },
    expected: {
      message: "Required Input",
      requiredMessage: "The value is required."
    }
  },
  {
    description: "a partial with a conditional 'param?' placeholder",
    should: "should include the partial value if the parameter is supplied",
    partial: {
      message: "Required Input",
      "required?": "The value is required."
    },
    parameters: { required: true },
    expected: {
      message: "Required Input",
      required: "The value is required."
    }
  },
  //divider between migrated and new tests
  {
    description: "partial with replacement placeholders",
    should: "replace placeholders with parameters",
    partial: { "spec": { "~spec.": null } },
    parameters: { "spec.hints": ["text"], "spec.visibility": "hidden" },
    expected: { spec: { hints: ["text"], visibility: "hidden" } }
  },
  {
    description: "a partial with the placeholder value~",
    should: "should return quoted binding key place of the placeholder",
    partial: { value: { "~*": null } },
    parameters: { "message<": "Hello" },
    expected: { value: { "message<": "Hello" } }
  },
  {
    description: "a partial that returns a partial",
    should: "should return ",
    partial: { ">lynx": { "spec.hints": ["container"], "~*": null } },
    parameters: { "spec.visibility": "hidden", one: "one" },
    expected: { ">lynx": { "spec.hints": ["container"], "spec.visibility": "hidden", one: "one" } }
  },
  {
    description: "a lynx partial",
    should: "should return ",
    partial: { "spec~": { "~spec.": null }, "value~": { "~*": null } },
    parameters: { "spec.hints": ["container"], "spec.visibility": "hidden", one: "one" },
    expected: { spec: { hints: ["container"], visibility: "hidden" }, "value": { one: "one" } }
  }
];

function runTest(test) {
  let result = processPartial(test.partial, test.parameters);
  expect(result).to.deep.equal(test.expected);
}

describe("when processing partials", function () {
  tests.forEach(function (test) {
    //if (test.only !== true) return;
    describe("when ".concat(test.description), function () {
      it(test.should, function () {
        runTest(test);
      });
    });
  });
});
