const fs = require('fs');

const files = [
  'frontend/src/views/Register.vue',
  'frontend/src/views/Profile.vue',
  'frontend/src/views/Login.vue',
  'frontend/src/views/EventDetails.vue',
  'frontend/src/views/AdminDashboard.vue',
  'frontend/src/services/api.js',
  'frontend/src/components/EventCard.vue',
  'frontend/src/App.vue'
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/http:\/\/localhost:5000/g, 'https://cordovaconnect-api.onrender.com');
  fs.writeFileSync(f, content);
});

console.log('URLs Replaced Successfully!');
