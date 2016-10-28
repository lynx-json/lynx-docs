const chai = require("chai");
const should = chai.should();
const partials = require("../../src/lib/partials-yaml");

describe("when including partials", function () {
  var partial;
  
  
  
  describe("a reference to a partial with key partial-name>", function () {
    it("should include the partial 'partial-name'", function () {
      // var isPartial = partials.isPartial(null, "partial-name>");
      // isPartial.should.equal(true);
      // 
      // var p = partials.getPartial(null, "partial-name>")
    });
  });
  
  describe("an inline reference to >partial-name", function () {
    it("should include the partial 'partial-name'", function () {
      // var isPartial = partials.isPartial(null, "foo>partial-name");
      // isPartial.should.equal(true);
      // 
      // var p = partials.getPartial(null, "foo>partial-name");
    });
  });
});
