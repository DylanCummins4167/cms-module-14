const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost/blog_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define MongoDB schemas
const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const PostSchema = new mongoose.Schema({
  title: String,
  content: String,
  creator: mongoose.Schema.Types.ObjectId,
  comments: [
    {
      text: String,
      creator: mongoose.Schema.Types.ObjectId,
    },
  ],
});

const User = mongoose.model('User', UserSchema);
const Post = mongoose.model('Post', PostSchema);

// Middleware for parsing JSON
app.use(express.json());

// Signup route
app.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      password: hashedPassword,
    });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});
  
// Login route
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
 const token = jwt.sign({ userId: user._id }, 'secretkey');
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Protected route (requires token)
app.get('/dashboard', authenticateToken, async (req, res) => {
  try {
// Retrieve and send user's posts
    const userId = req.user.userId;
    const posts = await Post.find({ creator: userId });
    res.json({ posts });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Middleware for verifying JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

 jwt.verify(token, 'secretkey', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    req.user = user;
    next();
  });
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
