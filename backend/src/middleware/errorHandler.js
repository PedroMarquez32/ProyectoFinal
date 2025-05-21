const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      errors: Object.values(err.errors).map(error => error.message)
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }

  if (err.code === 11000) {
    return res.status(400).json({ message: 'Duplicate key error' });
  }

  res.status(500).json({ message: 'Internal server error' });
};

module.exports = errorHandler; 