const chai = require("chai");
const expect = chai.expect;
const handlebars = require("handlebars");

const flatten = require("../../../src/lib/export/flatten");
const processTemplate = require("../../../src/lib/export/process-template");
const toHandlebars = require("../../../src/lib/json-templates/to-handlebars");

var tests = [{
  description: "Should add children to object values with children",
  should: "create children array on object and add children",
  template: { "foo>container": { "bar>text": "Bar", "qux>text": "Qux" } },
  expected: {
    foo: {
      spec: {
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
}]

function runTest(test) {
  var processed = processTemplate(test.template, {});
  var result = flatten(processed);
  let content = toHandlebars(test.template);
  let json = handlebars.compile(content)(test.data);
  let parsed = JSON.parse(json);

  expect(result).to.deep.equal(test.expected);
}

describe.skip("when flattening templates for lynx documents", function () {
  tests.forEach(function (test) {
    describe(test.description, function () {
      it(test.should, function () {
        runTest(test);
      });
    });
  });
});
