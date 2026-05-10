const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { env } = require('../config/env');

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      name: user.name,
    },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

router.post('/register', async (req, res) => {
  const { name, email, password, gym_name: gymName } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const cleanEmail = String(email).trim().toLowerCase();

  try {
    const existing = await User.findOne({ email: cleanEmail });

    if (existing) {
      return res.status(409).json({ error: 'Email is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: cleanEmail,
      password_hash: passwordHash,
      gym_name: gymName || null,
    });

    const token = signToken(user);
    return res.status(201).json({
      token,
      coach: {
        id: user._id,
        name: user.name,
        email: user.email,
        gym_name: user.gym_name,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Unexpected server error during registration.' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const cleanEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken(user);
    const coach = {
      id: user._id,
      name: user.name,
      email: user.email,
      gym_name: user.gym_name,
    };

    return res.json({ token, coach });
  } catch (error) {
    return res.status(500).json({ error: 'Unexpected server error during login.' });
  }
});

module.exports = router;
