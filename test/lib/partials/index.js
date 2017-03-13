const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");

const should = chai.should();
chai.use(chaiAsPromised);
const partials = require("../../../src/lib/partials-yaml");

var partialsTests = [
  require("./card"),
  require("./complement"),
  require("./form"),
  require("./group"),
  require("./link"),
  require("./submit"),
  require("./list"),
  require("./header")
];

describe("partials", function () {
  partialsTests.forEach(tests => {
    describe(tests.description, function () {
      tests.forEach(test => {
        describe(test.description, function () {
          it("should ".concat(test.should), function () {
            runTest(test);
          });
        });
      });
    });
  });
});

function runTest(test) {
  var actual = partials.getPartial(test.kvp, { realm: { folder: process.cwd() } });
  actual.value.spec.should.deep.equal(test.expected.spec);
  actual.value.value.should.deep.equal(test.expected.value);
}
