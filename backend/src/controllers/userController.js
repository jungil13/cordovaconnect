const { User, Barangay } = require('../models');

const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      include: [{ model: Barangay, as: 'barangay', attributes: ['name'] }]
    });
    
    // Explicitly add age to each user object for frontend consumption
    const usersWithAge = users.map(u => {
      const uJson = u.toJSON();
      uJson.age = u.age;
      return uJson;
    });

    res.json(usersWithAge);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

const toggleBan = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.is_banned = !user.is_banned;
    await user.save();
    
    res.json({ message: `User ${user.is_banned ? 'banned' : 'unbanned'} successfully`, is_banned: user.is_banned });
  } catch (error) {
    res.status(500).json({ message: 'Error toggling ban status' });
  }
};

const generateDigitalID = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.digital_id_status = 'Generated';
    await user.save();
    
    res.json({ message: 'Digital ID generated successfully', status: user.digital_id_status });
  } catch (error) {
    res.status(500).json({ message: 'Error generating Digital ID' });
  }
};

const requestDigitalID = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    user.digital_id_status = 'Pending';
    await user.save();
    res.json({ message: 'Digital ID request submitted' });
  } catch (error) {
    res.status(500).json({ message: 'Error requesting Digital ID' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, birthdate, address, emergency_contact, id_number } = req.body;
    
    if (name) user.name = name;
    if (birthdate) user.birthdate = birthdate;
    if (address) user.address = address;
    if (emergency_contact) user.emergency_contact = emergency_contact;
    if (id_number) user.id_number = id_number;
    
    if (req.file) {
      user.profile_photo = req.file.path; // Cloudinary secure URL
    }

    await user.save();
    
    // Return updated user (excluding password)
    const updatedUser = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] }
    });
    
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating profile' });
  }
};

const adminUpdateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, birthdate, address, emergency_contact, id_number, role, barangay_id } = req.body;
    
    if (name) user.name = name;
    if (birthdate) user.birthdate = birthdate;
    if (address) user.address = address;
    if (emergency_contact) user.emergency_contact = emergency_contact;
    if (id_number) user.id_number = id_number;
    if (role) user.role = role;
    if (barangay_id) user.barangay_id = barangay_id;
    
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user record' });
  }
};

module.exports = { getUsers, toggleBan, generateDigitalID, requestDigitalID, updateProfile, adminUpdateUser };
