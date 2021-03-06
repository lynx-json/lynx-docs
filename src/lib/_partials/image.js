const types = require("../../types");

const defaultImage = {
  type: "image/svg+xml",
  src: "data:image/svg+xml;charset=utf-8,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22utf-8%22%3F%3E%0D%0A%3Csvg%20version%3D%221.1%22%20baseProfile%3D%22tiny%22%20id%3D%22Logo_and_Name%22%0D%0A%09%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20x%3D%220px%22%20y%3D%220px%22%20%0D%0A%09%20xml%3Aspace%3D%22preserve%22%3E%0D%0A%20%20%20%3Crect%20fill%3D%22%23ccc%22%20width%3D%22100%25%22%20height%3D%22100%25%22%20%2F%3E%0D%0A%3C%2Fsvg%3E",
  width: 50,
  height: 50
};

function imagePartial(parameters) {
  let result = { ">lynx": { "spec.hints": ["image", "content"], "*~": null } };
  let partial = result[">lynx"];

  if (types.isObject(parameters)) {
    if (!parameters.src && !parameters.data) {
      Object.assign(partial, defaultImage);
      return result;
    }
  }

  return result;
}

imagePartial.defaultImage = defaultImage; //exposed for image partial tests
module.exports = exports = imagePartial;
