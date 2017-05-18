const chai = require("chai");
const expect = chai.expect;
const handlebars = require("handlebars");

const jsonTemplates = require("../../../src/lib/json-templates");

var partialsTests = [
  require("./card"),
  require("./complement"),
  require("./content"),
  require("./form"),
  require("./group"),
  require("./link"),
  require("./submit"),
  require("./list"),
  require("./header"),
  require("./footer"),
  require("./lynx"),
  require("./text"),
  require("./line")
];

describe("lynx-docs core partials", function () {
  partialsTests.forEach(tests => {
    describe(tests.partial + " partial", function () {
      tests.forEach(test => {
        describe(test.description, function () {
          it("should ".concat(test.should), function () {
            runTest(test, tests.partial);
          });
        });
      });
    });
  });
});

function runTest(test, partialName) {
  var template = {};
  template[">" + partialName] = test.parameters;

  if (test.log) console.log("template", "\n" + JSON.stringify(template, null, 2));

  var expanded = jsonTemplates.partials.expand(template, jsonTemplates.partials.resolve);
  if (test.log) console.log("expanded", "\n" + JSON.stringify(expanded, null, 2));

  let hbContent = jsonTemplates.toHandlebars(expanded);
  if (test.log) console.log("handlebars", "\n" + hbContent);
  if (test.log) console.log("data", "\n" + JSON.stringify(test.data, null, 2));

  let json = handlebars.compile(hbContent)(null);
  if (test.log) console.log("json", "\n" + json);

  let parsed = JSON.parse(json);
  if (test.log) console.log("process template result", "\n" + JSON.stringify(parsed, null, 2));

  expect(parsed).to.deep.equal(test.expected);
}
