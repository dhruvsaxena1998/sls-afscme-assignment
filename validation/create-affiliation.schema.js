const { ajv } = require("../utils/ajv");

const schema = {
  properties: {
    state: {
      type: "string",
    },
    affiliation: {
      type: "string",
    }
  },
  required: ["state", "affiliation"],
  additionalProperties: false,
};

module.exports = ajv.compile(schema);
