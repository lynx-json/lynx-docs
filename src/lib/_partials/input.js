"use strict";

const types = require("../../types");

const base = {
  ">section": {
    "spec.labeledBy": "label",
    "header>": {
      "label>~label": null
    },
    "input>lynx": {
      "spec.input~name": true,
      "spec.hints~": ["line", "text"],
      "spec.labeledBy": "label",
      "value~": "",
      "spec.validation": {}
    }
  }
};

function inputPartial(parameters) {
  if (!types.isObject(parameters)) throw Error("The parameters value to the input function must be an object");
  if (!parameters.name) throw Error("'name' is a required parameter");
  let result = Object.assign({}, base);
  let partial = result[">section"];

  let validation = partial["input>lynx"]["spec.validation"];
  if (parameters.required) {
    validation.required = { "state<requiredState": null, "invalid": "requiredMessage" };
    partial["requiredMessage>text"] = parameters.requiredMessage || "Required";
    delete parameters.required;
    delete parameters.requiredMessage;
  }

  ["minLength", "maxLength", "pattern", "format"].filter(name => !!parameters[name])
    .forEach(name => {
      validation.text = validation.text || { "state<textState": null, "invalid": "textInvalidMessage" };
      validation.text[name] = parameters[name];
      partial["textInvalidMessage>text"] = parameters.textInvalidMessage || "Invalid Format";
      delete parameters[name];
    });

  ["min", "max", "step"].filter(name => !!parameters[name])
    .forEach(name => {
      validation.number = validation.number || { "state<numberState": null, "invalid": "numberInvalidMessage" };
      validation.number[name] = parameters[name];
      partial["numberInvalidMessage>text"] = parameters.numberInvalidMessage || "Invalid Format";
      delete parameters[name];
    });

  return result;
}

module.exports = exports = inputPartial;
