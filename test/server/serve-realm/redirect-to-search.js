var chai = require("chai");
var should = chai.should();
var expect = chai.expect;
var sut = require("../../../src/server/serve-realm/redirect-to-search");

let tests = [{
  description: "when called",
  should: "redirect to search",
  req: { url: "/not-found/" },
  res: {
    writeHead: function (status, headers) {
      expect(status).to.equal(301);
      expect(headers["Content-Type"]).to.equal("text/plain");
      expect(headers.Location).to.equal("/meta/search/?q=/not-found/");
      expect(headers["Cache-Control"]).to.equal("no-cache");
    },
    end: function (message) {
      expect(message).to.equal("Redirecting to search")
    }
  }
}];

describe("serve realm (redirect to search)", function () {
  tests.forEach(test => {
    describe(test.description, function () {
      let handler = sut(test.options);
      it(test.should, function () {
        handler(test.req, test.res, function () {
          throw new Error("next shouldn't be called");
        });
      });
    });
  });
});
