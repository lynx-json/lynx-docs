const clone = require("clone");
let base = {
  spec: {
    hints: ["section", "container"],
    labeledBy: "label"
  },
  value: {
    header: {
      spec: { hints: ["header", "container"] },
      value: {
        label: {
          spec: { hints: ["label", "text"] },
          value: null
        }
      }
    },
    input: {
      spec: {
        hints: ["line", "text"],
        input: true,
        labeledBy: "label",
        validation: {}
      },
      value: ""
    }
  }
};

const textKeys = ["minLength", "maxLength", "pattern", "format"];
const numKeys = ["min", "max", "step"];

function createMessageVsp(message) {
  return {
    spec: { hints: ["text"] },
    value: message
  };
}

function applyRequiredValidation(result, parameters, data) {
  let inputSpec = result.value.input.spec;
  inputSpec.validation = inputSpec.validation || {};
  inputSpec.validation.required = {
    state: data && data.requiredState || null,
    invalid: "requiredMessage"
  };
  result.value.requiredMessage = createMessageVsp(parameters.requiredMessage || "Required");
}

function applyTextValdiation(result, parameters, data) {
  let inputSpec = result.value.input.spec;
  inputSpec.validation = inputSpec.validation || {};
  let textValidation = {
    state: data && data.textState || null,
    invalid: "textInvalidMessage"
  };
  textKeys.forEach(key => {
    if (!Object.keys(parameters).includes(key)) return;
    textValidation[key] = parameters[key];
  });

  inputSpec.validation.text = textValidation;
  result.value.textInvalidMessage = createMessageVsp(parameters.textInvalidMessage || "Invalid Format");
}

function applyNumberValdiation(result, parameters, data) {
  let inputSpec = result.value.input.spec;
  inputSpec.validation = inputSpec.validation || {};
  let numberValidation = {
    state: data && data.numberState || null,
    invalid: "numberInvalidMessage"
  };
  numKeys.forEach(key => {
    if (!Object.keys(parameters).includes(key)) return;
    numberValidation[key] = parameters[key];
  });

  inputSpec.validation.number = numberValidation;
  result.value.numberInvalidMessage = createMessageVsp(parameters.numberInvalidMessage || "Invalid Format");
}

function getExpected(parameters, data) {
  let result = clone(base);
  if (parameters.name) result.value.input.spec.input = parameters.name;
  if (parameters.label) result.value.header.value.label.value = parameters.label;
  if (parameters["spec.hints"]) result.value.input.spec.hints = parameters["spec.hints"];
  if (parameters.value) result.value.input.value = parameters.value;
  if (parameters.required) applyRequiredValidation(result, parameters, data);
  if (Object.keys(parameters).some(key => textKeys.includes(key))) {
    applyTextValdiation(result, parameters, data);
  }
  if (Object.keys(parameters).some(key => numKeys.includes(key))) {
    applyNumberValdiation(result, parameters, data);
  }
  return result;
}

let tests = [{
    description: "when null parameters",
    should: "throw error",
    parameters: null,
    throws: Error
  },
  {
    description: "when [] parameters",
    should: "throw error",
    parameters: [],
    throws: Error
  },
  {
    description: "when string parameters",
    should: "throw error",
    parameters: "Hello",
    throws: Error
  },
  {
    description: "when empty parameters",
    should: "throw error",
    parameters: {},
    throws: Error
  },
  {
    description: "when name only",
    should: "have name on input spec.input",
    parameters: { name: "foo" }
  },
  {
    description: "when name and label",
    should: "have name on input and use label value",
    parameters: { name: "foo", label: "bar" }
  },
  {
    description: "when name and hints",
    should: "have name on input and use spec.hints",
    parameters: { name: "name", "spec.hints": ["text"] }
  },
  {
    description: "when name and value",
    should: "have name on input and use value",
    parameters: { name: "name", value: "bar" }
  },
  {
    description: "when name and required",
    should: "have name on input and required validation",
    parameters: { name: "name", required: true }
  },
  {
    description: "when name, required and message",
    should: "have name on input, required validation, and message",
    parameters: { name: "name", required: true, requiredMessage: "Name is required" }
  },
  {
    description: "when name, required, message and state from data",
    should: "have name on input, required validation, message, and state",
    parameters: { name: "name", required: true, requiredMessage: "Name is required" },
    data: { requiredState: "invalid" }
  },
  {
    description: "when name and minLength",
    should: "have name on input and text validation",
    parameters: { name: "name", minLength: true }
  },
  {
    description: "when name, minLength and message",
    should: "have name on input, text validation, and message",
    parameters: { name: "name", minLength: true, textInvalidMessage: "It's messed up" }
  },
  {
    description: "when name, minLength, message and state from data",
    should: "have name on input, text validation, message, and state",
    parameters: { name: "name", minLength: true, textInvalidMessage: "It's messed up" },
    data: { textState: "invalid" }
  },
  {
    description: "when name and maxLength",
    should: "have name on input and text validation",
    parameters: { name: "name", maxLength: true }
  },
  {
    description: "when name, maxLength and message",
    should: "have name on input, text validation, and message",
    parameters: { name: "name", maxLength: true, textInvalidMessage: "Word chars only" }
  },
  {
    description: "when name, maxLength, message and state from data",
    should: "have name on input, text validation, message, and state",
    parameters: { name: "name", maxLength: true, textInvalidMessage: "It's messed up" },
    data: { textState: "invalid" }
  },
  {
    description: "when name and pattern",
    should: "have name on input and text validation",
    parameters: { name: "name", pattern: "\\w" }
  },
  {
    description: "when name, pattern and message",
    should: "have name on input, text validation, and message",
    parameters: { name: "name", pattern: "\\w", textInvalidMessage: "Word chars only" }
  },
  {
    description: "when name, pattern, message and state from data",
    should: "have name on input, text validation, message, and state",
    parameters: { name: "name", pattern: "\\w", textInvalidMessage: "Word chars only" },
    data: { textState: "invalid" }
  },
  {
    description: "when name and min",
    should: "have name on input and number validation",
    parameters: { name: "name", min: true }
  },
  {
    description: "when name, min and message",
    should: "have name on input, number validation, and message",
    parameters: { name: "name", min: true, numberInvalidMessage: "It's messed up" }
  },
  {
    description: "when name, min, message and state from data",
    should: "have name on input, number validation, message, and state",
    parameters: { name: "name", min: true, numberInvalidMessage: "It's messed up" },
    data: { numberState: "invalid" }
  },
  {
    description: "when name and max",
    should: "have name on input and number validation",
    parameters: { name: "name", max: true }
  },
  {
    description: "when name, max and message",
    should: "have name on input, number validation, and message",
    parameters: { name: "name", max: true, numberInvalidMessage: "It's messed up" }
  },
  {
    description: "when name, max, message and state from data",
    should: "have name on input, number validation, message, and state",
    parameters: { name: "name", max: true, numberInvalidMessage: "It's messed up" },
    data: { numberState: "invalid" }
  },
  {
    description: "when name and step",
    should: "have name on input and number validation",
    parameters: { name: "name", step: 2 }
  },
  {
    description: "when name, step and message",
    should: "have name on input, number validation, and message",
    parameters: { name: "name", step: 2, numberInvalidMessage: "It's messed up" }
  },
  {
    description: "when name, step, message and state from data",
    should: "have name on input, number validation, message, and state",
    parameters: { name: "name", step: 2, numberInvalidMessage: "It's messed up" },
    data: { numberState: "invalid" }
  }
];

tests.forEach(test => {
  if (test.throws) return;
  test.expected = getExpected(test.parameters, test.data);
});

tests.partial = "input";

module.exports = tests;
