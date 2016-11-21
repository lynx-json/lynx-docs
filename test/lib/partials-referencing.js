"use strict";

const chai = require("chai");
const should = chai.should();
const expect = chai.expect;
const sinon = require("sinon");
const partials = require("../../src/lib/partials-yaml");

function runTest(test) {
  var actual = partials.getPartial(test.kvp);
  actual.should.deep.equal(test.expected);
  // console.log(JSON.stringify(actual, null, 2));
}

var tests = [];

describe("when referencing partials", function () {
  tests.forEach(function (test) {
    describe(test.description, function () {
      beforeEach(function () {
        sinon.stub(partials, "resolvePartial").withArgs(test.kvp).returns(test.partial);
      });
      afterEach(function () { 
        if (partials.resolvePartial.restore) partials.resolvePartial.restore();
      });
      
      it(test.should, function () {
        runTest(test);
      });
    });  
  });
});
