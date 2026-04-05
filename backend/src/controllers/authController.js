const User = require('../models/User');
const jwt = require('jsonwebtoken');
const fileStorage = require('../utils/fileStorage');
const emailService = require('../utils/emailService');
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

      // Send welcome email (don't block registration if email fails)
      try {
        await emailService.sendWelcomeEmail(email, name);
      } catch (emailError) {
        console.error('Welcome email failed:', emailError);
        // Continue with registration even if email fails
      }

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

      // Send welcome email (don't block registration if email fails)
      try {
        await emailService.sendWelcomeEmail(email, name);
      } catch (emailError) {
        console.error('Welcome email failed:', emailError);
        // Continue with registration even if email fails
      }

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
// Request password reset
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address'
      });
    }

    if (isMongoConnected()) {
      // Use MongoDB
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found with this email'
        });
      }

      const resetToken = user.generateResetToken();
      await user.save();

      // Send password reset email
      try {
        await emailService.sendPasswordResetEmail(email, resetToken);
        res.status(200).json({
          success: true,
          message: 'Password reset email sent successfully'
        });
      } catch (emailError) {
        // If email fails, still save the token but inform the user
        console.error('Email sending failed:', emailError);
        res.status(200).json({
          success: true,
          message: 'Password reset token generated (email sending failed)'
        });
      }
    } else {
      // Use file storage
      const user = fileStorage.findUserByEmail(email);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found with this email'
        });
      }

      const crypto = require('crypto');
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      fileStorage.updateResetToken(email, hashedToken, Date.now() + (30 * 60 * 1000));

      // Send password reset email
      try {
        await emailService.sendPasswordResetEmail(email, resetToken);
        res.status(200).json({
          success: true,
          message: 'Password reset email sent successfully'
        });
      } catch (emailError) {
        // If email fails, still save the token but inform the user
        console.error('Email sending failed:', emailError);
        res.status(200).json({
          success: true,
          message: 'Password reset token generated (email sending failed)'
        });
      }
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing password reset request',
      error: error.message
    });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide reset token and new password'
      });
    }

    const crypto = require('crypto');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    if (isMongoConnected()) {
      // Use MongoDB
      const user = await User.findOne({
        resetToken: hashedToken,
        resetTokenExpire: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token'
        });
      }

      user.password = newPassword;
      user.resetToken = null;
      user.resetTokenExpire = null;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Password reset successfully'
      });
    } else {
      // Use file storage
      const user = fileStorage.findUserByResetToken(hashedToken);
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token'
        });
      }

      await fileStorage.updatePassword(user.email, newPassword);
      fileStorage.clearResetToken(user.email);

      res.status(200).json({
        success: true,
        message: 'Password reset successfully'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: error.message
    });
  }
};

// Add monument to favorites
exports.addFavorite = async (req, res) => {
  try {
    const { name, location } = req.body;

    if (!name || !location) {
      return res.status(400).json({
        success: false,
        message: 'Monument name and location are required'
      });
    }

    if (isMongoConnected()) {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if already in favorites
      const exists = user.favoriteMonuments.some(fav => fav.name === name);
      if (exists) {
        return res.status(400).json({
          success: false,
          message: 'Monument already in favorites'
        });
      }

      user.favoriteMonuments.push({ name, location });
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Monument added to favorites',
        favorites: user.favoriteMonuments
      });
    } else {
      // File storage implementation
      const user = fileStorage.findUserById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!user.favoriteMonuments) user.favoriteMonuments = [];
      
      const exists = user.favoriteMonuments.some(fav => fav.name === name);
      if (exists) {
        return res.status(400).json({
          success: false,
          message: 'Monument already in favorites'
        });
      }

      user.favoriteMonuments.push({ name, location, addedAt: new Date() });
      fileStorage.updateUser(user);

      res.status(200).json({
        success: true,
        message: 'Monument added to favorites',
        favorites: user.favoriteMonuments
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding favorite',
      error: error.message
    });
  }
};

// Remove monument from favorites
exports.removeFavorite = async (req, res) => {
  try {
    const { name } = req.params;

    if (isMongoConnected()) {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      user.favoriteMonuments = user.favoriteMonuments.filter(fav => fav.name !== name);
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Monument removed from favorites',
        favorites: user.favoriteMonuments
      });
    } else {
      const user = fileStorage.findUserById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      user.favoriteMonuments = user.favoriteMonuments.filter(fav => fav.name !== name);
      fileStorage.updateUser(user);

      res.status(200).json({
        success: true,
        message: 'Monument removed from favorites',
        favorites: user.favoriteMonuments
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing favorite',
      error: error.message
    });
  }
};

// Mark monument as visited
exports.markVisited = async (req, res) => {
  try {
    const { name, location } = req.body;

    if (!name || !location) {
      return res.status(400).json({
        success: false,
        message: 'Monument name and location are required'
      });
    }

    if (isMongoConnected()) {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if already visited
      const exists = user.visitedMonuments.some(vis => vis.name === name);
      if (exists) {
        return res.status(400).json({
          success: false,
          message: 'Monument already marked as visited'
        });
      }

      user.visitedMonuments.push({ name, location });
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Monument marked as visited',
        visited: user.visitedMonuments
      });
    } else {
      const user = fileStorage.findUserById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!user.visitedMonuments) user.visitedMonuments = [];
      
      const exists = user.visitedMonuments.some(vis => vis.name === name);
      if (exists) {
        return res.status(400).json({
          success: false,
          message: 'Monument already marked as visited'
        });
      }

      user.visitedMonuments.push({ name, location, visitedAt: new Date() });
      fileStorage.updateUser(user);

      res.status(200).json({
        success: true,
        message: 'Monument marked as visited',
        visited: user.visitedMonuments
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking as visited',
      error: error.message
    });
  }
};

// Get user's favorites and visited monuments
exports.getUserMonuments = async (req, res) => {
  try {
    if (isMongoConnected()) {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          favorites: user.favoriteMonuments,
          visited: user.visitedMonuments
        }
      });
    } else {
      const user = fileStorage.findUserById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          favorites: user.favoriteMonuments || [],
          visited: user.visitedMonuments || []
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting monuments',
      error: error.message
    });
  }
};