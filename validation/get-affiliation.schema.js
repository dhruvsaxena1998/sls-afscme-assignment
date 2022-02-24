const { ajv } = require("../utils/ajv");

const schema = {
  properties: {
    id: {
      type: "string",
      format: "uuid",
    },
  },
  required: ["id"],
  additionalProperties: false,
};

module.exports = ajv.compile(schema);
