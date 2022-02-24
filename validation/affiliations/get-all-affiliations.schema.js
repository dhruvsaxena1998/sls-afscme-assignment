const { ajv } = require("../../utils/ajv");

const schema = {
  properties: {
    state: {
      type: "string",
    }
  },
  required: ["state"],
  additionalProperties: false,
};

module.exports = ajv.compile(schema);
