var proxyquire = require("proxyquire");
var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var sutPath = '../../../../src/server/serve-realm/serve-variant/template-content';

let tests = [{
  description: "when called",
  should: "write template content to response",
  stubs: {
    '../../../lib/export/to-handlebars': {
      one: function (path, options) {
        expect(path).to.equal("./template-path");
        expect(options.realm.url).to.equal("/realm-url/");
        return "template content";
      }
    }
  },
  options: {},
  realm: { url: "/realm-url/" },
  template: "./template-path",
  res: {
    writeHead: function (status, headers) {
      expect(status).to.equal(200);
      expect(headers["Content-Type"]).to.equal("text/x-handlebars-template");
      expect(headers["Cache-Control"]).to.equal("no-cache");
    },
    end: function (content) {
      expect(content).to.equal("template content");
    }
  }
}];

describe("serve variant (template content)", function () {
  tests.forEach(test => {
    describe(test.description, function () {
      let sut = proxyquire(sutPath, test.stubs);
      let handler = sut(test.options)(test.template, test.realm);
      it(test.should, function () {
        handler(test.req, test.res, function () {
          throw new Error("next shouldn't be called");
        });
      });
    });
  });
});
