const AWS = require("aws-sdk");
const express = require("express");
const serverless = require("serverless-http");
const { v4: uuid } = require("uuid");
const helmet = require("helmet");

const Validator = require("../middlewares/validator");
const GetByIdSchema = require("../validation/common/get-by-id.schema");
const CreateLeadSchema = require("../validation/leads/create-lead.schema");

const app = express();

const LEADS_TABLE = process.env.LEADS_TABLE;
const dynamoDbClient = new AWS.DynamoDB.DocumentClient();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

app.get(
  "/leads/:id",
  [Validator(GetByIdSchema, "params")],
  async (req, res) => {
    const { id } = req.params;
    const params = {
      TableName: LEADS_TABLE,
      Key: {
        id,
      },
    };

    try {
      const { Item } = await dynamoDbClient.get(params).promise();
      if (Item) {
        const {
          id,
          first_name,
          last_name,
          email,
          state_short: state,
          affiliation,
          status = "pending",
          role = "user",
        } = Item;
        return res.status(200).json({
          id,
          first_name,
          last_name,
          email,
          state,
          affiliation,
          role,
          status,
        });
      } else {
        return res
          .status(404)
          .json({ error: "Could not find lead with provided 'id'" });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Could not retreive lead" });
    }
  }
);

app.post("/leads", [Validator(CreateLeadSchema)], async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    state: state_short,
    affiliation,
    role = "user",
    status = "pending",
  } = req.body;

  const params = {
    TableName: LEADS_TABLE,
    Item: {
      id: uuid(),
      first_name,
      last_name,
      email,
      state_short,
      affiliation,
      role,
      status,
    },
  };

  try {
    await dynamoDbClient.put(params).promise();
    return res.status(200).json({
      ...params.Item,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "Could not create lead" });
  }
});

module.exports.handler = serverless(app);
