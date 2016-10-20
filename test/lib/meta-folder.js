var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var sinon = require("sinon");
var getFolderMetadata = require("../../src/lib/meta-folder");
var fs = require("fs");

describe.only("when getting metadata for a folder", function () {
  var meta;
  
  afterEach(function () {
    fs.readdirSync.restore();
  });
  
  describe("a folder with a lone document, 'default.yml'", function () {
    beforeEach(function () {
      sinon.stub(fs, "readdirSync").withArgs("/x").returns(["default.yml"]);
      meta = getFolderMetadata("/x");
    });
    
    it("should have single state, 'default'", function () {
      meta.states.list.length.should.equal(1);
      meta.states.list[0].should.equal("default");
    });
    
    it("should have a default state, 'default'", function () {
      meta.states.default.should.equal("default");
    });
  });

  describe("a folder with a lone document, 'one.yml'", function () {
    beforeEach(function () {
      sinon.stub(fs, "readdirSync").withArgs("/x").returns(["one.yml"]);
      meta = getFolderMetadata("/x");
    });
    
    it("should have a single state, 'one'", function () {
      meta.states.list.length.should.equal(1);
      meta.states.list[0].should.equal("one");
    });
    
    it("should have a default state, 'one'", function () {
      meta.states.default.should.equal("one");
    });
  });

  describe("a folder with two documents, 'default.yml' and 'two.yml'", function () {
    beforeEach(function () {
      sinon.stub(fs, "readdirSync").withArgs("/x").returns(["default.yml", "two.yml"]);
      meta = getFolderMetadata("/x");
    });
    
    it("should have two states, 'default' and 'two'", function () {
      meta.states.list.length.should.equal(2);
      meta.states.list[0].should.equal("default");
      meta.states.list[1].should.equal("two");
    });
    
    it("should have a default state, 'default'", function () {
      meta.states.default.should.equal("default");
    });
  });

  describe("a folder with two documents, 'one.yml' and 'two.yml'", function () {
    beforeEach(function () {
      sinon.stub(fs, "readdirSync").withArgs("/x").returns(["one.yml", "two.yml"]);
      meta = getFolderMetadata("/x");
    });
    
    it("should have two states, 'one' and 'two'", function () {
      meta.states.list.length.should.equal(2);
      meta.states.list[0].should.equal("one");
      meta.states.list[1].should.equal("two");
    });
    
    it("should not have a default state", function () {
      should.not.exist(meta.states.default);
    });
  });
  
  describe("a folder with a template, 'default.yml' and one data file, 'default.yml'", function () {
    
    beforeEach(function () {
      var stub = sinon.stub(fs, "readdirSync");
      stub.withArgs("/x").returns(["default.yml"]);
      stub.withArgs("/x/default.data").returns(["default.yml"]);
      meta = getFolderMetadata("/x");
    });
    
    it("should have one state, 'default'", function () {
      meta.states.list.length.should.equal(1);
      meta.states.list[0].should.equal("default");
    });
    
    it("should have a default state, 'default'", function () {
      meta.states.default.should.equal("default");
    });
  });
  
  describe("a folder with a template, 'default.yml' and one data file, 'one.yml'", function () {
    
    beforeEach(function () {
      var stub = sinon.stub(fs, "readdirSync");
      stub.withArgs("/x").returns(["default.yml"]);
      stub.withArgs("/x/default.data").returns(["one.yml"]);
      meta = getFolderMetadata("/x");
    });
    
    it("should have one state, 'one'", function () {
      meta.states.list.length.should.equal(1);
      meta.states.list[0].should.equal("one");
    });
    
    it("should have a default state, 'one'");
  });
  
  describe("a folder with a template, 'one.yml' and one data file, 'default.yml'", function () {
    it("should have one state, 'one'");
    it("should have a default state, 'one'");
  });
  
  describe("a folder with a template, 'one.yml' and one data file, 'two.yml'", function () {
    it("should have one state, 'one two'");
    it("should have a default state, 'one'");
  });
});
