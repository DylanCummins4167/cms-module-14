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
