var tests = [{
  description: "when array value",
  should: "have header hint and array value",
  kvp: {
    key: ">header",
    value: ["one", "two", "three"]
  },
  expected: {
    spec: { hints: ["header"] },
    value: ["one", "two", "three"]
  }
}];

tests.description = "'header' partial";

module.exports = tests;
