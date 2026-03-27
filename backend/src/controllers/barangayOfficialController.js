const { BarangayOfficial, Barangay } = require('../models');

const getAllOfficials = async (req, res) => {
  try {
    const officials = await BarangayOfficial.findAll({
      include: [{ model: Barangay, as: 'barangay', attributes: ['name'] }]
    });
    res.json(officials);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching officials' });
  }
};

const createOfficial = async (req, res) => {
  try {
    const { name, position, term_start, barangay_id } = req.body;
    const official = await BarangayOfficial.create({ name, position, term_start, barangay_id });
    res.status(201).json(official);
  } catch (error) {
    res.status(500).json({ message: 'Error creating official' });
  }
};

const updateOfficial = async (req, res) => {
  try {
    const official = await BarangayOfficial.findByPk(req.params.id);
    if (!official) return res.status(404).json({ message: 'Official not found' });
    
    await official.update(req.body);
    res.json(official);
  } catch (error) {
    res.status(500).json({ message: 'Error updating official' });
  }
};

const deleteOfficial = async (req, res) => {
  try {
    const official = await BarangayOfficial.findByPk(req.params.id);
    if (!official) return res.status(404).json({ message: 'Official not found' });
    
    await official.destroy();
    res.json({ message: 'Official removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing official' });
  }
};

module.exports = { getAllOfficials, createOfficial, updateOfficial, deleteOfficial };
