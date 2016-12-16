"use strict";

var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var sinon = require("sinon");
var finishYaml = require("../../src/lib/finish-yaml");

describe("when finishing YAML", function () {
  describe("finishing without added functions", function () {
    describe("with a string value", function () {
      it("should return an equivalent kvp", function () {
        var kvp = { value: "Hi" };
        var finished = finishYaml(kvp);
        kvp.should.deep.equal(finished);
      });
    });

    describe("with a boolean value", function () {
      it("should return an equivalent kvp", function () {
        var kvp = { value: true };
        var finished = finishYaml(kvp);
        kvp.should.deep.equal(finished);
      });
    });

    describe("with a number value", function () {
      it("should return an equivalent kvp", function () {
        var kvp = { value: 42 };
        var finished = finishYaml(kvp);
        kvp.should.deep.equal(finished);
      });
    });

    describe("with a null value", function () {
      it("should return an equivalent kvp", function () {
        var kvp = { value: null };
        var finished = finishYaml(kvp);
        kvp.should.deep.equal(finished);
      });
    });

    describe("with an object value", function () {
      it("should return an equivalent kvp", function () {
        var kvp = { value: { greeting: "Hi" } };
        var finished = finishYaml(kvp);
        kvp.should.deep.equal(finished);
      });
    });

    describe("with an array value", function () {
      it("should return an equivalent kvp", function () {
        var kvp = { value: ["Hi", "Hello"] };
        var finished = finishYaml(kvp);
        kvp.should.deep.equal(finished);
      });
    });
  });

  describe("finishing with added functions", function () {
    beforeEach(function () {
      finishYaml.clear();
    });

    it("should call each function", function () {
      var first = sinon.spy();
      var second = sinon.spy();

      finishYaml.add(first);
      finishYaml.add(second);
      var finished = finishYaml({ key: "greeting", value: "Hi" });

      expect(first.calledOnce).to.be.true;
      expect(second.calledOnce).to.be.true;
    });

    it("should call each function once for each kvp", function () {
      var finishingFn = sinon.spy();

      finishYaml.add(finishingFn);
      var finished = finishYaml({ value: { child: { grandchild: { greeting: "Hi" } } } });

      expect(finishingFn.callCount).to.equal(4);
    });

    it("should support modification of values", function () {
      function modifyKey(kvp) {
        kvp.value += " there!";
        return kvp;
      }

      finishYaml.add(modifyKey);
      var finished = finishYaml({ key: "greeting", value: "Hi" });

      finished.value.should.equal("Hi there!");
    });

    it("should support modification of keys", function () {
      function modifyKey(kvp) {
        kvp.key += "-modified";
        return kvp;
      }

      finishYaml.add(modifyKey);
      var finished = finishYaml({ key: "greeting", value: "Hi" });

      finished.key.should.equal("greeting-modified");
    });

    it("subsequent finishing functions should receive modified kvp", function () {
      function modifyKey(kvp) {
        kvp.key += "-modified";
        kvp.value += "-modified";
        return kvp;
      }

      finishYaml.add(modifyKey);
      finishYaml.add(function (kvp) {
        kvp.key.should.equal("greeting-modified");
        kvp.value.should.equal("Hi-modified");
      });

      var finished = finishYaml({ key: "greeting", value: "Hi" });

      finished.key.should.equal("greeting-modified");
    });
  });
});
