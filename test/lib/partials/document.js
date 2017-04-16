var tests = [{
    description: "when realm and content as array",
    should: "have realm and value/spec pair",
    parameters: { realm: "http://foo", ">container": ["one", "two", "three"] },
    expected: {
      realm: "http://foo",
      spec: { hints: ["container"] },
      value: ["one", "two", "three"]
    }
  },
  {
    description: "when object value",
    should: "have form hint and object value",
    parameters: { realm: "http://foo", ">container": { one: "one", two: "two", three: "three" } },
    expected: {
      realm: "http://foo",
      spec: { hints: ["container"] },
      value: { one: "one", two: "two", three: "three" }
    }
  },
  {
    description: "when spec.* properties",
    should: "have specified spec.* properties in result",
    parameters: {
      realm: "http://foo",
      ">container": {
        "spec.hints": ["whatever", "container"],
        "spec.visibility": "visible",
        value: ["one", "two"]
      }
    },
    expected: {
      realm: "http://foo",
      spec: {
        hints: ["whatever", "container"],
        visibility: "visible"
      },
      value: ["one", "two"]
    }
  }
];

tests.partial = "document";

module.exports = tests;
