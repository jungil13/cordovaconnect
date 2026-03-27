import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Home', component: () => import('../views/Home.vue') },
  { path: '/map', name: 'Map', component: () => import('../views/MapView.vue') },
  { path: '/calendar', name: 'Calendar', component: () => import('../views/CalendarView.vue') },
  { path: '/admin', name: 'Admin', component: () => import('../views/AdminDashboard.vue') },
  { path: '/barangay-admin', name: 'BarangayDashboard', component: () => import('../views/BarangayDashboard.vue') },
  { path: '/login', name: 'Login', component: () => import('../views/Login.vue') },
  { path: '/register', name: 'Register', component: () => import('../views/Register.vue') },
  { path: '/events/:id', name: 'EventDetails', component: () => import('../views/EventDetails.vue') },
  { path: '/announcements/:id', name: 'AnnouncementDetail', component: () => import('../views/AnnouncementDetail.vue') },
  { path: '/create-event', name: 'CreateEvent', component: () => import('../views/CreateEvent.vue') },
  { path: '/profile', name: 'Profile', component: () => import('../views/Profile.vue') },
  { path: '/auth-success', name: 'AuthSuccess', component: () => import('../views/AuthSuccess.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
