const Ajv = require("ajv");
const ajvFormats = require("ajv-formats");

const ajv = new Ajv();
ajvFormats(ajv);

module.exports = {
  ajv,
};
