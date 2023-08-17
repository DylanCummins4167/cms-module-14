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

                  if (currentTime - tokenIssuedTime > timeoutDuration) {
          // Token has expired due to idle timeout
          return res.status(403).json({ error: 'Session expired due to inactivity. Please log in again.' });
        }

           // Token is valid, continue
        next();
      });
    } else {
      // No token found, user not authenticated
      return res.status(401).json({ error: 'Unauthorized' });
    }
  };
};

module.exports = idleTimeout;        
