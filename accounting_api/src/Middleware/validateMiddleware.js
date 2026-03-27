// validateMiddleware.js

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    const customError = new Error(errorMessage);
    customError.statusCode = 400;
    return next(customError);
  }

  // Doğrulanmış veriyi req.body'ye geri eşitle (Joi casting yapmış olabilir)
  req.body = value;
  next();
};

export default validate;
