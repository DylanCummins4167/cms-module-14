const jwt = require('jsonwebtoken');

const idleTimeout = (timeoutDuration) => {
  return (req, res, next) => {
    // Get the token from the request header
    const token = req.header('x-auth-token');

     if (token) {
      // Verify the token
      jwt.verify(token, 'secretkey', (err, decoded) => {
        if (err) {
          // Token is invalid or expired
          return res.status(403).json({ error: 'Session expired. Please log in again.' });
        }

        // Calculate the time elapsed since the token was issued
        const currentTime = Date.now();
        const tokenIssuedTime = decoded.iat * 1000; // Convert seconds to milliseconds           
