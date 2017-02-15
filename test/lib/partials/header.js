var tests = [
//   {
//   description: "when array value",
//   should: "have header hint and array value",
//   kvp: {
//     key: ">header",
//     value: ["one", "two", "three"]
//   },
//   expected: {
//     spec: { hints: ["header", "container"] },
//     value: ["one", "two", "three"]
//   },
//   only: true
// },
{
  description: "when text value",
  should: "have header hint and a label with a text value",
  kvp: {
    key: ">header",
    value: "Label"
  },
  expected: {
    spec: { hints: ["header", "container"] },
    value: {
      "label": "Label"
    }
  }
}];

tests.description = "'header' partial";

module.exports = tests;
