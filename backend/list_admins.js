const { User } = require('./src/models');
const { sequelize } = require('./src/config/db');

async function listAdmins() {
  try {
    await sequelize.authenticate();
    const admins = await User.findAll({ where: { role: 'SuperAdmin' } });
    console.log('Admins:', admins.map(u => ({ email: u.email, role: u.role })));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

listAdmins();
