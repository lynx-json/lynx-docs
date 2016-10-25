var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var sinon = require("sinon");
var states = require("../../src/lib/states");
var fs = require("fs");

describe.only("when getting states for a template", function () {
  var result;

  afterEach(function () {
    fs.readdirSync.restore();
  });

  describe("'a.yml' with a lone state, 'default.yml'", function () {
    beforeEach(function () {
      sinon.stub(fs, "readdirSync").withArgs("/a.data").returns(["default.yml"]);
      result = states.getStates("/a.yml");
    });

    console.log(result);

    it("should have single state, 'default'", function () {
      result.list.length.should.equal(1);
      result.list[0].name.should.equal("default");
    });

    it("should have a default state, 'default'", function () {
      result.default.name.should.equal("default");
    });
  });

  describe("'a.yml' with a lone state, 'one.yml'", function () {
    beforeEach(function () {
      sinon.stub(fs, "readdirSync").withArgs("/a.data").returns(["one.yml"]);
      result = states.getStates("/a.yml");
    });

    it("should have a single state, 'one'", function () {
      result.list.length.should.equal(1);
      result.list[0].name.should.equal("one");
    });

    it("should have a default state, 'one'", function () {
      result.default.name.should.equal("one");
    });
  });

  describe("'a.yml' with two state documents, 'default.yml' and 'two.yml'", function () {
    beforeEach(function () {
      sinon.stub(fs, "readdirSync").withArgs("/a.data").returns(["default.yml", "two.yml"]);
      result = states.getStates("/a.yml");
    });

    it("should have two states, 'default' and 'two'", function () {
      result.list.length.should.equal(2);
      result.list[0].name.should.equal("default");
      result.list[1].name.should.equal("two");
    });

    it("should have default state 'default'", function () {
      result.default.name.should.equal("default");
    });
  });

  describe("'a.yml' with two state documents, 'one.yml' and 'two.yml'", function () {
    beforeEach(function () {
      sinon.stub(fs, "readdirSync").withArgs("/a.data").returns(["one.yml", "two.yml"]);
      result = states.getStates("/a.yml");
    });

    it("should have two states, 'one' and 'two'", function () {
      result.list.length.should.equal(2);
      result.list[0].name.should.equal("one");
      result.list[1].name.should.equal("two");
    });

    it("should not have a default state", function () {
      should.not.exist(result.default);
    });
  });


});
