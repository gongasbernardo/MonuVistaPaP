const Group = require('../models/Group');
const User = require('../models/User');

// Create a new group
exports.createGroup = async (req, res) => {
  try {
    const { name, description, image, isPrivate, password, tags } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Group name is required'
      });
    }

    // Validate private group requirements
    if (isPrivate && !password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required for private groups'
      });
    }

    if (isPrivate && password.length < 4) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 4 characters'
      });
    }

    const group = await Group.create({
      name,
      description: description || '',
      image: image || null,
      isPrivate: isPrivate || false,
      password: isPrivate ? password : null,
      tags: tags && Array.isArray(tags) ? tags.filter(t => t.trim()) : [],
      owner: userId,
      members: [userId]
    });

    await group.populate('owner members', 'email name');

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating group',
      error: error.message
    });
  }
};

// Get all groups
exports.getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find()
      .populate('owner', 'email name')
      .populate('members', 'email name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: groups.length,
      groups
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching groups',
      error: error.message
    });
  }
};

// Get group by ID
exports.getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('owner', 'email name')
      .populate('members', 'email name');

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    res.status(200).json({
      success: true,
      group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching group',
      error: error.message
    });
  }
};

// Get user's groups
exports.getUserGroups = async (req, res) => {
  try {
    const userId = req.user.id;

    const groups = await Group.find({
      members: userId
    })
      .populate('owner', 'email name')
      .populate('members', 'email name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: groups.length,
      groups
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user groups',
      error: error.message
    });
  }
};

// Join a group
exports.joinGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { password } = req.body;
    const userId = req.user.id;

    let group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if group is private and password is required
    if (group.isPrivate) {
      if (!password) {
        return res.status(403).json({
          success: false,
          message: 'This group is private. Password required.'
        });
      }

      const isPasswordCorrect = await group.comparePassword(password);
      if (!isPasswordCorrect) {
        return res.status(403).json({
          success: false,
          message: 'Incorrect password'
        });
      }
    }

    if (group.members.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this group'
      });
    }

    group.members.push(userId);
    await group.save();

    await group.populate('owner members', 'email name');

    res.status(200).json({
      success: true,
      message: 'Joined group successfully',
      group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error joining group',
      error: error.message
    });
  }
};

// Leave a group
exports.leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    let group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    if (group.owner.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Group owner cannot leave the group'
      });
    }

    group.members = group.members.filter(member => member.toString() !== userId);
    await group.save();

    res.status(200).json({
      success: true,
      message: 'Left group successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error leaving group',
      error: error.message
    });
  }
};

// Kick member from group (only owner)
exports.kickMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { memberId, reason } = req.body;
    const userId = req.user.id;

    if (!memberId) {
      return res.status(400).json({
        success: false,
        message: 'Member id is required'
      });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Reason is required'
      });
    }

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    if (group.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only group owner can manage members'
      });
    }

    if (group.owner.toString() === memberId) {
      return res.status(400).json({
        success: false,
        message: 'Group owner cannot be removed'
      });
    }

    const isMember = group.members.some(m => m.toString() === memberId);
    if (!isMember) {
      return res.status(404).json({
        success: false,
        message: 'Member not found in group'
      });
    }

    group.members = group.members.filter(m => m.toString() !== memberId);
    await group.save();

    await User.findByIdAndUpdate(memberId, {
      $push: {
        notifications: {
          type: 'kicked',
          message: `Foi expulso do grupo ${group.name} por motivo: ${reason.trim()}`,
          groupId: group._id,
          groupName: group.name,
          reason: reason.trim(),
          kickedBy: userId,
          read: false,
          createdAt: new Date()
        }
      }
    });

    await group.populate('owner members', 'email name');

    res.status(200).json({
      success: true,
      message: 'Member removed successfully',
      group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing member',
      error: error.message
    });
  }
};

// Add message to group
exports.addMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    const user = await User.findById(userId);
    let group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    if (!group.members.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this group'
      });
    }

    group.messages.push({
      user: userId,
      username: user.name,
      content,
      timestamp: new Date()
    });

    await group.save();
    await group.populate('owner members', 'email name');

    res.status(201).json({
      success: true,
      message: 'Message added successfully',
      group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding message',
      error: error.message
    });
  }
};

// Share content in group
exports.shareContent = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { title, description, image } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    let group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    if (!group.members.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this group'
      });
    }

    group.sharedContent.push({
      user: userId,
      username: user.name,
      title: title || 'Shared Content',
      description: description || '',
      image: image || null,
      timestamp: new Date()
    });

    await group.save();
    await group.populate('owner members', 'email name');

    res.status(201).json({
      success: true,
      message: 'Content shared successfully',
      group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sharing content',
      error: error.message
    });
  }
};

// Delete a group (only owner)
exports.deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    if (group.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only group owner can delete the group'
      });
    }

    await Group.findByIdAndDelete(groupId);

    res.status(200).json({
      success: true,
      message: 'Group deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting group',
      error: error.message
    });
  }
};

// Update group
exports.updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, description, image, tags, isPrivate, password } = req.body;
    const userId = req.user.id;

    let group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    if (group.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only group owner can update the group'
      });
    }

    if (name !== undefined) group.name = name;
    if (description !== undefined) group.description = description;
    if (image !== undefined) group.image = image;
    if (Array.isArray(tags)) group.tags = tags;

    if (typeof isPrivate === 'boolean') {
      group.isPrivate = isPrivate;
      if (!isPrivate) {
        group.password = null;
      }
    }

    if (password) {
      group.password = password;
    }

    if (group.isPrivate && !group.password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required for private groups'
      });
    }

    await group.save();
    await group.populate('owner members', 'email name');

    res.status(200).json({
      success: true,
      message: 'Group updated successfully',
      group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating group',
      error: error.message
    });
  }
};
