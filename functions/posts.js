const AWS = require("aws-sdk");
const express = require("express");
const serverless = require("serverless-http");
const { v4: uuid } = require("uuid");
const helmet = require("helmet");

const Validator = require("../middlewares/validator");
const GetByIdSchema = require("../validation/common/get-by-id.schema");
const CreatePostSchema = require("../validation/posts/create-post.schema");

const app = express();

const POSTS_TABLE = process.env.POSTS_TABLE;
const dynamoDbClient = new AWS.DynamoDB.DocumentClient();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

app.get("/posts/:id", [Validator(GetByIdSchema, "params")], (req, res) => {});

app.post("/posts", [Validator(CreatePostSchema)], async (req, res) => {
  const { category, summary, description, attachment, user } = req.body;

  const params = {
    TableName: POSTS_TABLE,
    Item: {
      id: uuid(),
      category,
      summary,
      description,
      attachment,
      user,
      createdAt: new Date().toISOString(),
    },
  };

  try {
    await dynamoDbClient.put(params).promise();
    return res.status(201).json({ ...params.Item });
  } catch (error) {
    return res.status(400).json({ error: "Could not create post" });
  }
});

module.exports.handler = serverless(app);
