const chai = require("chai");
const expect = chai.expect;
const handlebars = require("handlebars");

const resolvePartials = require("../../../src/lib/json-templates/partials/resolve");
const expandPartials = require("../../../src/lib/json-templates/partials/expand");
const toHandlebars = require("../../../src/lib/json-templates/to-handlebars");

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
  require("./document")
];

describe("partials", function () {
  partialsTests.forEach(tests => {
    describe(tests.partial + " partials", function () {
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

  var expanded = expandPartials.expand(template, resolvePartials.resolve);
  let hbContent = toHandlebars(expanded);
  let json = handlebars.compile(hbContent)(null);
  let parsed = JSON.parse(json);
  expect(parsed).to.deep.equal(test.expected);
}
