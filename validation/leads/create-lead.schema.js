const { ajv } = require("../../utils/ajv");

const schema = {
  properties: {
    first_name: {
      type: "string",
    },
    last_name: {
      type: "string",
    },
    state: {
      type: "string",
    },
    email: {
      type: "string",
      format: "email",
    },
    affiliation: {
      type: "string",
    },
  },
  required: ["first_name", "last_name", "email", "state", "affiliation"],
  additionalProperties: false,
};

module.exports = ajv.compile(schema);
