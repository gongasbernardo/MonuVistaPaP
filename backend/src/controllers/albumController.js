const Folder = require('../models/Folder');
const AlbumMonument = require('../models/AlbumMonument');

// ========== FOLDERS ==========

// @desc    Get user folders (create defaults if none)
// @route   GET /api/album/folders
// @access  Private
exports.getFolders = async (req, res) => {
  try {
    const userId = req.user.id;
    let folders = await Folder.find({ userId }).sort({ isDefault: -1, createdAt: 1 });

    if (folders.length === 0) {
      const defaults = [
        { name: 'Sem Categoria', color: '#6B7280', userId, isDefault: true },
        { name: 'Medieval', color: '#8B5CF6', userId, isDefault: false },
        { name: 'Renascença', color: '#F59E0B', userId, isDefault: false },
        { name: 'Barroco', color: '#EC4899', userId, isDefault: false },
      ];
      folders = await Folder.insertMany(defaults);
    }

    res.status(200).json({ success: true, data: folders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a folder
// @route   POST /api/album/folders
// @access  Private
exports.createFolder = async (req, res) => {
  try {
    const { name, color } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Nome é obrigatório' });

    const folder = await Folder.create({ name, color: color || '#6B7280', userId: req.user.id });
    res.status(201).json({ success: true, data: folder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a folder
// @route   PUT /api/album/folders/:id
// @access  Private
exports.updateFolder = async (req, res) => {
  try {
    const { name, color } = req.body;
    const folder = await Folder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { name, color },
      { new: true }
    );
    if (!folder) return res.status(404).json({ success: false, message: 'Pasta não encontrada' });
    res.status(200).json({ success: true, data: folder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a folder (move monuments to default)
// @route   DELETE /api/album/folders/:id
// @access  Private
exports.deleteFolder = async (req, res) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, userId: req.user.id });
    if (!folder) return res.status(404).json({ success: false, message: 'Pasta não encontrada' });
    if (folder.isDefault) return res.status(400).json({ success: false, message: 'Não pode eliminar a pasta padrão' });

    // Find default folder
    const defaultFolder = await Folder.findOne({ userId: req.user.id, isDefault: true });

    // Move monuments to default
    if (defaultFolder) {
      await AlbumMonument.updateMany(
        { folderId: folder._id, userId: req.user.id },
        { folderId: defaultFolder._id }
      );
    }

    await Folder.findByIdAndDelete(folder._id);
    res.status(200).json({ success: true, message: 'Pasta eliminada' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== MONUMENTS ==========

// @desc    Get all user monuments
// @route   GET /api/album/monuments
// @access  Private
exports.getMonuments = async (req, res) => {
  try {
    const { folderId, visited } = req.query;
    const filter = { userId: req.user.id };
    if (folderId) filter.folderId = folderId;
    if (visited !== undefined) filter.visited = visited === 'true';

    const monuments = await AlbumMonument.find(filter).populate('folderId', 'name color').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: monuments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get monument by id
// @route   GET /api/album/monuments/:id
// @access  Private
exports.getMonument = async (req, res) => {
  try {
    const monument = await AlbumMonument.findOne({ _id: req.params.id, userId: req.user.id }).populate('folderId', 'name color');
    if (!monument) return res.status(404).json({ success: false, message: 'Monumento não encontrado' });
    res.status(200).json({ success: true, data: monument });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a monument
// @route   POST /api/album/monuments
// @access  Private
exports.addMonument = async (req, res) => {
  try {
    const { name, location, country, region, century, style, description, history, funFacts, image, folderId, visited } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Nome é obrigatório' });

    const monument = await AlbumMonument.create({
      name, location, country, region, century, style, description, history,
      funFacts: funFacts || [],
      image: image || '',
      folderId: folderId || null,
      userId: req.user.id,
      visited: visited || false,
      visitDate: visited ? new Date() : null
    });

    res.status(201).json({ success: true, data: monument });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update monument (mark visited, move folder, etc.)
// @route   PUT /api/album/monuments/:id
// @access  Private
exports.updateMonument = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.visited === true && !updates.visitDate) {
      updates.visitDate = new Date();
    }
    if (updates.visited === false) {
      updates.visitDate = null;
    }

    const monument = await AlbumMonument.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updates,
      { new: true }
    ).populate('folderId', 'name color');

    if (!monument) return res.status(404).json({ success: false, message: 'Monumento não encontrado' });
    res.status(200).json({ success: true, data: monument });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete monument
// @route   DELETE /api/album/monuments/:id
// @access  Private
exports.deleteMonument = async (req, res) => {
  try {
    const monument = await AlbumMonument.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!monument) return res.status(404).json({ success: false, message: 'Monumento não encontrado' });
    res.status(200).json({ success: true, message: 'Monumento eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get album stats
// @route   GET /api/album/stats
// @access  Private
exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const total = await AlbumMonument.countDocuments({ userId });
    const visited = await AlbumMonument.countDocuments({ userId, visited: true });
    const toVisit = await AlbumMonument.countDocuments({ userId, visited: false });
    const countries = await AlbumMonument.distinct('country', { userId, country: { $ne: '' } });

    res.status(200).json({
      success: true,
      data: { total, visited, toVisit, countries: countries.length }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check if monument is in album
// @route   GET /api/album/check/:name
// @access  Private
exports.checkInAlbum = async (req, res) => {
  try {
    const exists = await AlbumMonument.findOne({ userId: req.user.id, name: req.params.name });
    res.status(200).json({ success: true, inAlbum: !!exists });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
