const chai = require("chai");
const expect = chai.expect;
const handlebars = require("handlebars");

const processTemplates = require("../../src/lib/export/process-template");
const jsonTemplates = require("../../src/lib/json-templates");

var suites = [
  require("./static-content")
];

describe("lynx-docs authoring scenarios", function () {
  suites.forEach(tests => {
    describe(tests.suite + " scenarios", function () {
      tests.forEach(test => {
        describe(test.description, function () {
          var should = test.should || "result in expected result";
          it("should " + should, function () {
            runTest(test);
          });
        });
      });
    });
  });
});

function runTest(test) {
  test.options = test.options || {}; //default options to empty if not provided
  if (test.log) console.log("template", "\n" + JSON.stringify(test.template, null, 2));
  if (test.log) console.log("options", "\n" + JSON.stringify(test.options, null, 2));

  var result = processTemplates(test.template, test.options, test.onFile);
  if (test.log) console.log("process template result", "\n" + JSON.stringify(result, null, 2));

  let hbContent = jsonTemplates.toHandlebars(result);
  if (test.log) console.log("handlebars content", "\n" + hbContent);

  var hbTemplate = handlebars.compile(hbContent);
  let json = hbTemplate(test.data);
  if (test.log) console.log("data", "\n" + JSON.stringify(test.data, null, 2));
  if (test.log) console.log("json", "\n" + json);

  let parsed = JSON.parse(json);
  if (test.log) console.log("parsed", "\n" + JSON.stringify(parsed, null, 2));

  expect(parsed).to.deep.equal(test.expected);
}
