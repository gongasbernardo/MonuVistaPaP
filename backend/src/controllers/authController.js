const User = require('../models/User');
const jwt = require('jsonwebtoken');
const fileStorage = require('../utils/fileStorage');
const mongoose = require('mongoose');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Check if MongoDB is connected
const isMongoConnected = () => {
  return mongoose.connection.readyState === 1;
};

// Register new user
exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, and name'
      });
    }

    if (isMongoConnected()) {
      // Use MongoDB
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      const user = await User.create({
        email,
        password,
        name
      });

      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name
        }
      });
    } else {
      // Use file storage
      const existingUser = fileStorage.findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      const user = await fileStorage.createUser({ email, password, name });
      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    if (isMongoConnected()) {
      // Use MongoDB
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const token = generateToken(user._id);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name
        }
      });
    } else {
      // Use file storage
      const user = fileStorage.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const isPasswordValid = await fileStorage.comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const token = generateToken(user._id);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

// Update profile (protected route)
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, password, currentPassword, avatar } = req.body;

    if (isMongoConnected()) {
      const user = await User.findById(req.user.id).select('+password');

      if (!user) {
        return res.status(404).json({ success: false, message: 'Utilizador não encontrado' });
      }

      if (name) user.name = name;
      if (avatar !== undefined) user.avatar = avatar;

      if (email && email !== user.email) {
        const existing = await User.findOne({ email });
        if (existing) {
          return res.status(400).json({ success: false, message: 'Este email já está em uso' });
        }
        user.email = email;
      }

      if (password) {
        if (!currentPassword) {
          return res.status(400).json({ success: false, message: 'Introduz a palavra-passe atual' });
        }
        const bcrypt = require('bcryptjs');
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return res.status(400).json({ success: false, message: 'Palavra-passe atual incorreta' });
        }
        if (password.length < 6) {
          return res.status(400).json({ success: false, message: 'A palavra-passe deve ter pelo menos 6 caracteres' });
        }
        user.password = password;
      }

      await user.save();

      res.status(200).json({
        success: true,
        message: 'Perfil atualizado com sucesso',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          avatar: user.avatar || ''
        }
      });
    } else {
      // File storage fallback
      const users = fileStorage.readUsers();
      const userIndex = users.findIndex(u => u._id === req.user.id);
      if (userIndex === -1) {
        return res.status(404).json({ success: false, message: 'Utilizador não encontrado' });
      }

      const user = users[userIndex];
      if (name) user.name = name;
      if (avatar !== undefined) user.avatar = avatar;

      if (email && email !== user.email) {
        const existing = users.find(u => u.email === email && u._id !== user._id);
        if (existing) {
          return res.status(400).json({ success: false, message: 'Este email já está em uso' });
        }
        user.email = email;
      }

      if (password) {
        if (!currentPassword) {
          return res.status(400).json({ success: false, message: 'Introduz a palavra-passe atual' });
        }
        const bcrypt = require('bcryptjs');
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return res.status(400).json({ success: false, message: 'Palavra-passe atual incorreta' });
        }
        if (password.length < 6) {
          return res.status(400).json({ success: false, message: 'A palavra-passe deve ter pelo menos 6 caracteres' });
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
      }

      users[userIndex] = user;
      fileStorage.saveUsers(users);

      res.status(200).json({
        success: true,
        message: 'Perfil atualizado com sucesso',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          avatar: user.avatar || ''
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar perfil',
      error: error.message
    });
  }
};

// Get current user (protected route)
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

// Get notifications (protected route)
exports.getNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('notifications');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      notifications: user.notifications || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
};

// Mark all notifications as read
exports.markNotificationsRead = async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.user.id },
      { $set: { 'notifications.$[].read': true } }
    );

    res.status(200).json({
      success: true,
      message: 'Notifications marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating notifications',
      error: error.message
    });
  }
};
