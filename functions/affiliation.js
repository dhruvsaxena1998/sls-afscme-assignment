const AWS = require("aws-sdk");
const express = require("express");
const serverless = require("serverless-http");
const { v4: uuid } = require("uuid");
const helmet = require("helmet");

const Validator = require("../middlewares/validator");
const GetAffiliationSchema = require("../validation/get-affiliation.schema");
const CreateAffiliationSchema = require("../validation/create-affiliation.schema");

const app = express();

const AFFILIATIONS_TABLE = process.env.AFFILIATIONS_TABLE;
const dynamoDbClient = new AWS.DynamoDB.DocumentClient();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

app.get("/affiliations", async (req, res) => {
  const { state = "NY" } = req.query;
  // get all the affiliations from dynamoDB
  const params = {
    TableName: AFFILIATIONS_TABLE,
    FilterExpression: "state = :state",
    ExpressionAttributeValues: {
      ":state": {
        S: state,
      },
    },
  };

  try {
    const { Items } = await dynamoDbClient.scan(params).promise();
    if (Items) {
      res.status(200).json({
        success: true,
        data: Items,
      });
    } else {
      res.status(404).json({ error: "Could not find any affiliations" });
    }
  } catch (e) {
    res.status(500).json({ error: "Could not retreive affiliations" });
  }
});

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
        const { id, state, affiliation } = Item;
        res.status(200).json({ id, state, affiliation });
      } else {
        res
          .status(404)
          .json({ error: 'Could not find affiliation with provided "id"' });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Could not retreive affiliation" });
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
        state,
        affiliation,
      },
    };

    try {
      await dynamoDbClient.put(params).promise();
      res.status(201).json({ ...params.Item });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Could not create user" });
    }
  }
);

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

module.exports.handler = serverless(app);
