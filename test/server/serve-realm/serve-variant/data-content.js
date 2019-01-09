var proxyquire = require("proxyquire");
var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var sutPath = '../../../../src/server/serve-realm/serve-variant/data-content';

let tests = [{
  description: "when called",
  should: "write data content to response",
  stubs: {
    '../../../lib/export/template-data': function (dataOrFile, options) {
      expect(dataOrFile).to.equal("./data-path.yml");
      expect(options.realm.url).to.equal("/realm-url/");
      return { foo: "bar" };
    }
  },
  options: {},
  realm: { url: "/realm-url/" },
  data: "./data-path.yml",
  res: {
    writeHead: function (status, headers) {
      expect(status).to.equal(200);
      expect(headers["Content-Type"]).to.equal("text/x-yaml");
      expect(headers["Cache-Control"]).to.equal("no-cache");
    },
    end: function (content) {
      expect(content).to.equal("foo: bar\n");
    }
  }
}];

describe("serve variant (data content)", function () {
  tests.forEach(test => {
    describe(test.description, function () {
      let sut = proxyquire(sutPath, test.stubs);
      let handler = sut(test.options)(test.data, test.realm);
      it(test.should, function () {
        handler(test.req, test.res, function () {
          throw new Error("next shouldn't be called");
        });
      });
    });
  });
});
