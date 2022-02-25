const { ajv } = require("../../utils/ajv");

const schema = {
  properties: {
    category: {
      type: "string",
    },
    summary: {
      type: "string",
      minLength: 1,
    },
    description: {
      type: "string",
      minLength: 1,
    },
    attachment: {
      type: "string",
    },
    user: {
      type: "string",
    },
  },
  required: ["category", "summary", "description", "user"],
  additionalProperties: false,
};

module.exports = ajv.compile(schema);
