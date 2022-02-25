const { ajv } = require("../../utils/ajv");

const schema = {
  properties: {
    first_name: {
      type: "string",
      minLength: 1,
    },
    last_name: {
      type: "string",
      minLength: 1,
    },
    state: {
      type: "string",
      minLength: 1,
    },
    email: {
      type: "string",
      format: "email",
    },
    affiliation: {
      type: "string",
      minLength: 1,
    },
    status: {
      type: "string",
      enum: ["pending", "approved", "rejected"],
    },
    role: {
      type: "string",
      enum: ["user"],
    },
  },
  required: ["first_name", "last_name", "email", "state", "affiliation"],
  additionalProperties: false,
};

module.exports = ajv.compile(schema);
