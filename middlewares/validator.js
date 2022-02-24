const validator = (validationSchema, type = "body") => {
  return (req, res, next) => {
    const isValid = validationSchema(req[type]);
    if (!isValid) {
      return res.status(400).json({
        error: "Bad Request",
        message: validationSchema.errors,
      });
    }

    return next();
  };
};

module.exports = validator;
