const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");

const should = chai.should();
chai.use(chaiAsPromised);
const partials = require("../../../src/lib/partials-yaml");

describe("group partial", function () {
  // it("should describe an array value with the 'group' hint", function () {
//   var sourceKVP = {
//     key: ">group",
//     value: [
//       "one",
//       "two",
//       "three"
//     ]
//   };
// 
//   var result = partials.getPartial(sourceKVP, {
//     realm: {
//       folder: process.cwd()
//     }
//   });
// 
//   result.value.spec.hints[0].should.equal("group");
//   result.value.value.should.equal(sourceKVP.value);
// });


  it("should describe an object value with the 'group' hint", function () {
    var sourceKVP = {
      key: ">group",
      value: {
        one: "one",
        two: "two",
        three: "three"
      }
    };

    var result = partials.getPartial(sourceKVP, {
      realm: {
        folder: process.cwd()
      }
    });

    result.value.spec.hints[0].should.equal("group");
    result.value.value.one.should.equal(sourceKVP.value.one);
    result.value.value.two.should.equal(sourceKVP.value.two);
    result.value.value.three.should.equal(sourceKVP.value.three);
  });
});
