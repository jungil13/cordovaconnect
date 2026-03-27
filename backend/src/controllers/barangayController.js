const { Barangay } = require('../models');

exports.getAllBarangays = async (req, res) => {
  try {
    const barangays = await Barangay.findAll({
      order: [['name', 'ASC']]
    });
    res.json(barangays);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.getBarangayDetails = async (req, res) => {
  try {
    const barangay = await Barangay.findByPk(req.params.id, {
      include: ['officials', 'events', 'announcements']
    });
    if (!barangay) return res.status(404).json({ message: 'Barangay not found' });
    res.json(barangay);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.createBarangay = async (req, res) => {
  try {
    const { name } = req.body;
    const barangay = await Barangay.create({ name });
    res.status(201).json(barangay);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
