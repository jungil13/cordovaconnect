# CordovaConnect - LGU Digital Hub

![CordovaConnect Banner](https://img.shields.io/badge/CordovaConnect-LGU_Digital_Hub-0f204b?style=for-the-badge)

CordovaConnect is a comprehensive, modern community portal designed for the Municipality of Cordova. It serves as an integrated Local Government Unit (LGU) digital hub, connecting residents, barangay officials, and city administration through real-time alerts, event management, digital IDs, and community engagement features.

## 📸 Previews

### Desktop & Mobile Views
<div align="center">
  <img src="<img width="376" height="824" alt="image" src="https://github.com/user-attachments/assets/2adfeacc-9aee-4561-9a04-4ff9a6b63bc9" />
" alt="Desktop News and Events View" width="700"/>
  <br/><br/>
  <img src="<img width="1680" height="918" alt="image" src="https://github.com/user-attachments/assets/710a7c97-39ea-4b30-b39e-3fbd5b82c554" />
" alt="Mobile Login View" width="300"/>
  <p><i>(Note: Replace docs/desktop-preview.png and docs/mobile-preview.png with your actual image files)</i></p>
</div>

## ✨ Key Features

- **Centralized Dashboard**: Real-time news, announcements, and community events feed.
- **Role-Based Workspaces**: Specialized portals for `SuperAdmin` (Mayor), `BarangayAdmin`, and Residents.
- **Official Digital ID**: Generate, verify, and print official vertical Local Digital IDs with functional QR codes and emergency contacts.
- **Interactive Community Map**: Leaflet-powered maps for local events, geo-tagged alerts, and directions.
- **Emergency Dispatch**: Rapid alert dispatcher for critical updates and weather warnings.
- **Community Engagement**: Event sharing, directions, commenting, liking, and subscription notifications.

## 🛠️ Tech Stack

**Frontend:**
- [Vue.js 3](https://vuejs.org/) (Composition API)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Phosphor Icons](https://phosphoricons.com/)
- [Leaflet](https://leafletjs.com/) (Maps)

**Backend:**
- [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
- [Sequelize ORM](https://sequelize.org/)
- [Socket.io](https://socket.io/) (Real-time notifications)
- JWT Authentication & Google OAuth Integration

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- A running SQL Database (MySQL/PostgreSQL)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on your environment (Database URL, JWT Secret, Google Auth credentials).
4. Run the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License
This project is proprietary and intended for the Municipality of Cordova.
