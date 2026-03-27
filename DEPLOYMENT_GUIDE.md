# CordovaConnect Deployment Guide

This guide will help you seamlessly deploy your CordovaConnect platform across **Vercel** (for the sleek Vue 3 Frontend) and **Render** (for the Node.js Backend & Database).

---

## 🚀 Part 1: Deploying the Backend on Render.com

Render is perfect for Node.js apps and SQL databases because of their generous free tiers.

### 1. Database Setup
1. Log into your Render dashboard.
2. Click **New +** -> **PostgreSQL** (or MySQL if you choose an external provider like PlanetScale/Aiven).
3. Name it `cordovaconnect-db`.
4. Once spun up, copy the **Internal Database URL** (or External if deploying outside Render).

### 2. Backend API Setup
Notice that we have already included a `render.yaml` file in this repository. This allows for a one-click **Blueprint** deployment!
1. Go to your Render Dashboard -> **Blueprints** -> **New Blueprint Instance**.
2. Connect your GitHub repository (`jungil13/cordovaconnect`).
3. Render will automatically detect the `render.yaml` and set up the `cordovaconnect-api` Web Service.
4. Go into your newly created Web Service -> **Environment**.
5. Fill in your `DB_HOST`, `DB_USER`, `DB_PASS`, and the randomly generated `JWT_SECRET`.
6. Grab the generated Web Service URL (e.g., `https://cordovaconnect-api.onrender.com`). You will need this for the frontend!

---

## ⚡ Part 2: Deploying the Frontend on Vercel

Vercel is the premier platform for Vue/Vite static apps. We have already included a `vercel.json` file inside the `frontend/` folder so router history modes work identically to local development!

### 1. Updating Hardcoded URLs for Production
Before you deploy the frontend to Vercel, you need to point your frontend to the new Render Backend URL! 
You can do a global project string search/replace across your `frontend/src` directory:

**Replace this:** 
`http://localhost:5000` 
**With your new Render URL:** 
`https://cordovaconnect-api.onrender.com`

> *Tip: You will mostly find these in `frontend/src/services/api.js`, `App.vue`, `EventDetails.vue`, `Profile.vue`, `AdminDashboard.vue`, and the auth flow pages (`Login.vue`/`Register.vue`).*

After making these changes, `git add .`, `git commit -m "chore: point api to render"`, and `git push` again.

### 2. Vercel Steps
1. Log into [Vercel](https://vercel.com/) with GitHub.
2. Click **Add New Project** and select your `jungil13/cordovaconnect` repo.
3. In the Configuration page, ensure your **Root Directory** is explicitly set to `frontend`!
4. The Framework Preset should auto-detect as **Vite**.
5. Click **Deploy**.

🎉 **Congratulations!** Your entire CordovaConnect structure is deployed. You can now configure your DNS domains and share the community portal with Cordova!
