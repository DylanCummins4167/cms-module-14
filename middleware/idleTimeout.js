const jwt = require('jsonwebtoken');

const idleTimeout = (timeoutDuration) => {
  return (req, res, next) => {
    // Get the token from the request header
    const token = req.header('x-auth-token');
