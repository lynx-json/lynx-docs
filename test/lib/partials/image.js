const defaultImage = require("../../../src/lib/_partials/image").defaultImage;

var tests = [{
    description: "when spec.* properties and no 'src' or 'data' property",
    should: "have specified spec.* properties in result with default image",
    parameters: {
      "spec.hints": ["whatever", "image", "content"],
    },
    expected: {
      spec: {
        hints: ["whatever", "image", "content"],
      },
      value: defaultImage
    }
  },
  {
    description: "when spec.hints and no 'src' or 'data' property",
    should: "override default hints and use default image",
    parameters: {
      "spec.hints": ["whatever"]
    },
    expected: {
      spec: {
        hints: ["whatever"],
      },
      value: defaultImage
    }
  },
  {
    description: "when using default image with custom height and width",
    should: "override default image height and width values",
    parameters: {
      "spec.hints": ["whatever"],
      height: 70,
      width: 70
    },
    expected: {
      spec: {
        hints: ["whatever"],
      },
      value: {
        src: defaultImage.src,
        type: defaultImage.type,
        height: 70,
        width: 70
      }
    }
  },
  {
    description: "when fully specified spec object",
    should: "use provided spec object. Don't default hints",
    parameters: {
      spec: {
        hints: ["whatever"],
      },
      value: {
        src: "whatever.jpg",
        type: "image/jpeg",
        height: 50,
        width: 50
      }
    },
    expected: {
      spec: {
        hints: ["whatever"]
      },
      value: {
        src: "whatever.jpg",
        type: "image/jpeg",
        height: 50,
        width: 50
      }
    }
  },
  {
    description: "when flattened value",
    should: "provide default hits and copy paramaters to 'value' key",
    parameters: {
      src: "whatever.jpg",
      type: "image/jpeg",
      height: 50,
      width: 50
    },
    expected: {
      spec: { hints: ["image", "content"] },
      value: {
        src: "whatever.jpg",
        type: "image/jpeg",
        height: 50,
        width: 50
      }
    }
  },
  {
    description: "when expanded value",
    should: "copy input 'value' to 'value' key",
    parameters: {
      value: {
        src: "whatever.jpg",
        type: "image/jpeg",
        height: 50,
        width: 50
      }
    },
    expected: {
      spec: { hints: ["image", "content"] },
      value: {
        src: "whatever.jpg",
        type: "image/jpeg",
        height: 50,
        width: 50
      }
    }
  },
  {
    description: "when 'data' present",
    should: "provide default hits and copy paramaters to 'value' key",
    parameters: {
      data: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
      encoding: "base64",
      type: "image/gif",
      height: 50,
      width: 50
    },
    expected: {
      spec: { hints: ["image", "content"] },
      value: {
        data: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
        encoding: "base64",
        type: "image/gif",
        height: 50,
        width: 50
      }
    }
  },
];

tests.partial = "image";

module.exports = tests;
