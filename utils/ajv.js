const Ajv = require("ajv");
const ajvFormats = require("ajv-formats");

const ajv = new Ajv();
ajvFormats(ajv);

ajv.addFormat(
  "email",
  /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
);

module.exports = {
  ajv,
};
