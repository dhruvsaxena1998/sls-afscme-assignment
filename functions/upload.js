const AWS = require("aws-sdk");
const express = require("express");
const serverless = require("serverless-http");
const { v4: uuid } = require("uuid");
const helmet = require("helmet");
const multer = require("multer");

const app = express();

const IMAGEUPLOAD_BUCKET = process.env.IMAGEUPLOAD_BUCKET;
const s3 = new AWS.S3();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

const upload = multer();

app.post("/upload-files", upload.single("files"), async (req, res) => {
  const file = req.file;
  const params = {
    Bucket: IMAGEUPLOAD_BUCKET,
    Body: file.buffer,
    Key: `${uuid()}-${file.originalname}`,
    ACL: "public-read",
    ContentType: file.mimetype,
  };

  try {
    const data = await s3.upload(params).promise();
    return res.status(200).json({
      url: data.Location,
      etag: data.ETag,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "Could not upload file", e });
  }
});

module.exports.handler = serverless(app);
