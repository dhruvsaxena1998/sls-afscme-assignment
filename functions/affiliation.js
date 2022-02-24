const AWS = require("aws-sdk");
const express = require("express");
const serverless = require("serverless-http");
const { v4: uuid } = require("uuid");
const helmet = require("helmet");

const Validator = require("../middlewares/validator");
const GetAllAffiliationsSchema = require("../validation/get-all-affiliations.schema");
const GetAffiliationSchema = require("../validation/get-affiliation.schema");
const CreateAffiliationSchema = require("../validation/create-affiliation.schema");

const app = express();

const AFFILIATIONS_TABLE = process.env.AFFILIATIONS_TABLE;
const dynamoDbClient = new AWS.DynamoDB.DocumentClient();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

app.get(
  "/affiliations",
  [Validator(GetAllAffiliationsSchema, "query")],
  async (req, res) => {
    const { state = "NY" } = req.query;
    const params = {
      TableName: AFFILIATIONS_TABLE,
      IndexName: "state_short-index",
      KeyConditionExpression: "state_short = :state_short",
      ExpressionAttributeValues: {
        ":state_short": state,
      },
      ReturnConsumedCapacity: "TOTAL",
    };
    try {
      const { Items, Count, ScannedCount } = await dynamoDbClient
        .query(params)
        .promise();

      return res.status(200).json({
        data: Items.map(({ affiliation, id, state_short: state }) => ({
          id,
          state,
          affiliation,
        })),
        meta_data: {
          count: Count,
          scanned_count: ScannedCount,
        },
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ error: "Could not retreive affiliations" });
    }
  }
);

app.get(
  "/affiliations/:id",
  [Validator(GetAffiliationSchema, "params")],
  async function (req, res) {
    const params = {
      TableName: AFFILIATIONS_TABLE,
      Key: {
        id: req.params.id,
      },
    };

    try {
      const { Item } = await dynamoDbClient.get(params).promise();
      if (Item) {
        const { id, state_short: state, affiliation } = Item;
        return res.status(200).json({ id, state, affiliation });
      } else {
        return res
          .status(404)
          .json({ error: 'Could not find affiliation with provided "id"' });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Could not retreive affiliation" });
    }
  }
);

app.post(
  "/affiliations",
  [Validator(CreateAffiliationSchema)],
  async function (req, res) {
    const { state, affiliation } = req.body;

    const params = {
      TableName: AFFILIATIONS_TABLE,
      Item: {
        id: uuid(),
        state_short: state,
        affiliation,
      },
    };

    try {
      await dynamoDbClient.put(params).promise();
      return res.status(201).json({ ...params.Item });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Could not create user" });
    }
  }
);

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

module.exports.handler = serverless(app);
