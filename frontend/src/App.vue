<script setup>
import { ref, onMounted, provide, computed } from 'vue';
import { RouterView, RouterLink, useRoute, useRouter } from 'vue-router';
import Logo from './components/Logo.vue'; 
import Toast from './components/Toast.vue';
import { io } from 'socket.io-client';
import api from './services/api';

const toasts = ref([]);
const addToast = (message, type = 'info', duration = 3000) => {
  const id = Date.now();
  toasts.value.push({ id, message, type, duration });
};

provide('toast', { addToast });

const notifications = ref([]);
const persistentNotifications = ref([]);
const showNotificationDropdown = ref(false);
const isMobileMenuOpen = ref(false);
const route = useRoute();
const router = useRouter();
const user = ref(JSON.parse(localStorage.getItem('user') || 'null'));

const fetchPersistentNotifications = async () => {
  if (!user.value) return;
  try {
    const res = await api.get('/notifications');
    persistentNotifications.value = res.data;
  } catch (err) { console.error(err); }
};

const markAsRead = async (id) => {
  try {
    await api.patch(`/notifications/${id}/read`);
    fetchPersistentNotifications();
  } catch (err) { console.error(err); }
};

onMounted(() => {
  fetchPersistentNotifications();
  
  const socket = io('http://localhost:5000');
  
  socket.on('event:approved', (event) => {
    notifications.value.push(`New event approved: ${event.title}`);
    fetchPersistentNotifications();
    setTimeout(() => notifications.value.shift(), 5000);
  });

  socket.on('announcement:new', (data) => {
    notifications.value.push(`🚨 ALERT: ${data.title}`);
    fetchPersistentNotifications();
    setTimeout(() => notifications.value.shift(), 8000);
  });

  window.addEventListener('storage', () => {
    const newUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (newUser?.id !== user.value?.id) {
       user.value = newUser;
       fetchPersistentNotifications();
    }
  });
});

const isLoggingOut = ref(false);

const pageTitle = computed(() => {
  if (route.path.startsWith('/admin')) return 'Mayor Dashboard';
  if (route.path.startsWith('/profile')) return 'My Profile';
  if (route.path.startsWith('/map')) return 'Community Map';
  if (route.path.startsWith('/calendar')) return 'Events Calendar';
  if (route.path.startsWith('/create-event')) return 'Post Content';
  if (route.path.startsWith('/announcements')) return 'Alert Details';
  return '';
});

const canPost = computed(() => {
  if (!user.value) return false;
  return ['SuperAdmin', 'BarangayOfficial', 'BarangayWorker'].includes(user.value.role);
});

const showLogoutModal = ref(false);

const handleLogout = () => {
  showLogoutModal.value = true;
};

const confirmLogout = () => {
  showLogoutModal.value = false;
  isLoggingOut.value = true;
  setTimeout(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    user.value = null;
    isLoggingOut.value = false;
    addToast('Signed out successfully', 'info');
    window.location.href = '/login';
  }, 1000);
};

const dismissNotification = (index) => {
  notifications.value.splice(index, 1);
};

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

onMounted(() => {
  fetchPersistentNotifications();
  
  // Check for successful login flag
  if (localStorage.getItem('justLoggedIn')) {
    addToast('Welcome back to CordovaConnect!', 'success');
    localStorage.removeItem('justLoggedIn');
  }

  const socket = io('http://localhost:5000');
  
  socket.on('event:approved', (event) => {
    notifications.value.push(`New event approved: ${event.title}`);
    fetchPersistentNotifications();
    setTimeout(() => notifications.value.shift(), 5000);
  });

  socket.on('announcement:new', (data) => {
    notifications.value.push(`🚨 ALERT: ${data.title}`);
    fetchPersistentNotifications();
    setTimeout(() => notifications.value.shift(), 8000);
  });

  window.addEventListener('storage', () => {
    const newUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (newUser?.id !== user.value?.id) {
       user.value = newUser;
       fetchPersistentNotifications();
    }
  });
});
</script>
<template>
  <div class="min-h-screen flex flex-col font-sans relative bg-slate-50 pb-20 lg:pb-0">
    
    <!-- Logout / Loading Overlay -->
    <div v-if="isLoggingOut" class="fixed inset-0 z-[100] bg-primary/90 backdrop-blur-xl flex flex-col items-center justify-center text-white fade-in">
       <div class="w-20 h-20 border-4 border-white/20 border-t-white rounded-full animate-spin mb-6"></div>
       <h2 class="text-2xl font-black tracking-tight">Signing Out...</h2>
       <p class="text-white/60 font-medium">Securing your session</p>
    </div>

    <!-- Custom Logout Confirmation Modal -->
    <div v-if="showLogoutModal" class="fixed inset-0 z-[110] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 fade-in">
       <div class="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-[320px] w-full slide-up border border-slate-100">
           <div class="p-8 text-center space-y-4">
              <div class="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto shadow-inner border border-red-100 mb-2">
                 <i class="ph-fill ph-sign-out text-3xl"></i>
              </div>
              <h3 class="text-xl font-black text-slate-900 tracking-tight">Confirm Sign Out</h3>
              <p class="text-[13px] font-medium text-slate-500 leading-relaxed">Are you sure you want to securely end your CordovaConnect session?</p>
              
              <div class="pt-5 grid grid-cols-2 gap-3">
                 <button @click="showLogoutModal = false" class="py-3 px-2 text-[13px] font-black uppercase tracking-widest rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 transition active:scale-95">Cancel</button>
                 <button @click="confirmLogout" class="py-3 px-2 text-[13px] font-black uppercase tracking-widest rounded-xl bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20 transition active:scale-95">Sign Out</button>
              </div>
           </div>
       </div>
    </div>

    <!-- Toast Notifications -->
    <div class="fixed top-24 right-4 z-50 flex flex-col gap-2">
      <div v-for="(note, index) in notifications" :key="index" class="bg-white border-l-4 border-secondary shadow-lg p-4 rounded-lg flex items-start gap-4 transform transition-all fade-in">
        <i class="ph-fill ph-bell-ringing text-xl text-secondary"></i>
        <span class="font-bold text-gray-800">{{ note }}</span>
        <button @click="dismissNotification(index)" class="text-gray-400 hover:text-gray-600 transition">
          <i class="ph-bold ph-x"></i>
        </button>
      </div>
    </div>
    
        <!-- Header (Desktop/Tablet) -->
    <header class="bg-primary text-white shadow-xl sticky top-0 z-40 transition-all border-b border-white/5 backdrop-blur-lg hidden lg:block print:hidden">
      <div class="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        <!-- Logo -->
        <RouterLink to="/" class="hover:opacity-90 transition transform active:scale-95 duration-300 shrink-0">
          <Logo light />
        </RouterLink>

        <!-- Desktop Navigation -->
        <nav class="flex items-center space-x-6">
          <RouterLink to="/" class="text-white/80 hover:text-white font-semibold transition flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5" active-class="text-white bg-white/10">
            <i class="ph-fill ph-house"></i> Home
          </RouterLink>
          <RouterLink to="/map" class="text-white/80 hover:text-white font-semibold transition flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5" active-class="text-white bg-white/10">
            <i class="ph-fill ph-map-pin"></i> Map
          </RouterLink>
          <RouterLink to="/calendar" class="text-white/80 hover:text-white font-semibold transition flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5" active-class="text-white bg-white/10">
            <i class="ph-fill ph-calendar-blank"></i> Calendar
          </RouterLink>
          <RouterLink v-if="user?.role === 'SuperAdmin'" to="/admin" class="text-white/80 hover:text-white font-semibold transition flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5" active-class="text-white bg-white/10">
            <i class="ph-fill ph-shield-check"></i> Mayor Dashboard
          </RouterLink>
          <RouterLink v-if="user?.role === 'BarangayAdmin'" to="/barangay-admin" class="text-white/80 hover:text-white font-semibold transition flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5" active-class="text-white bg-white/10">
            <i class="ph-fill ph-house-line"></i> Brgy Dashboard
          </RouterLink>
          
          <div v-if="user" class="flex items-center gap-4 ml-4 pl-4 border-l border-white/10">
             <!-- Notification Bell -->
             <div class="relative">
                <button 
                  @click="showNotificationDropdown = !showNotificationDropdown"
                  class="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center transition-all hover:bg-white/20 relative"
                >
                   <i class="ph-fill ph-bell text-xl text-white"></i>
                   <span v-if="persistentNotifications.filter(n => !n.is_read).length > 0" class="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-primary">
                      {{ persistentNotifications.filter(n => !n.is_read).length }}
                   </span>
                </button>

                <!-- Notification Dropdown -->
                <div v-if="showNotificationDropdown" class="absolute right-0 lg:right-0 mt-4 w-[calc(100vw-2rem)] md:w-80 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden slide-up z-50 max-w-sm">
                   <div class="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                      <h4 class="font-black text-slate-900 text-sm uppercase tracking-widest">Notifications</h4>
                      <button @click="showNotificationDropdown = false" class="text-slate-400 hover:text-slate-600 transition-transform active:scale-75"><i class="ph-bold ph-x text-lg"></i></button>
                   </div>
                   <div class="max-h-[60vh] md:max-h-[30rem] overflow-y-auto hide-scrollbar">
                      <div v-if="persistentNotifications.length === 0" class="p-16 text-center space-y-4">
                         <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto opacity-40">
                            <i class="ph-fill ph-bell-slash text-4xl text-slate-400"></i>
                         </div>
                         <p class="text-xs font-black text-slate-400 uppercase tracking-widest leading-relaxed">No new <br/> notifications</p>
                      </div>
                      <div v-else class="divide-y divide-slate-50">
                         <div 
                           v-for="n in persistentNotifications" 
                           :key="n.id" 
                           @click="n.link ? router.push(n.link) : null; showNotificationDropdown = false"
                           class="p-5 hover:bg-slate-50 transition-colors flex gap-4 items-start relative group cursor-pointer"
                           :class="{'bg-blue-50/20': !n.is_read}"
                         >
                            <div v-if="!n.is_read" class="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                            <div :class="['w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm', n.type === 'Emergency' ? 'bg-red-500 text-white' : 'bg-primary/10 text-primary']">
                               <i :class="[n.type === 'Emergency' ? 'ph-fill ph-warning-diamond' : 'ph-fill ph-info', 'text-xl']"></i>
                            </div>
                            <div class="space-y-1 flex-grow">
                               <p class="text-[13px] font-black text-slate-900 leading-tight">{{ n.title }}</p>
                               <p class="text-[11px] text-slate-500 font-medium line-clamp-2 leading-relaxed">{{ n.message }}</p>
                               <div class="flex items-center justify-between pt-2">
                                  <span class="text-[9px] font-black text-slate-300 uppercase tracking-[0.1em]">{{ new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}</span>
                                  <button v-if="!n.is_read" @click.stop="markAsRead(n.id)" class="text-[9px] font-black text-primary uppercase tracking-widest hover:underline active:opacity-50 transition-opacity">Mark read</button>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                   <!-- View All Link (Optional but keeps it app-like) -->
                   <div class="p-4 bg-slate-50/50 border-t border-slate-50 text-center">
                      <button class="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors">Clear all notifications</button>
                   </div>
                </div>
             </div>

             <div class="flex flex-col items-end shrink-0 hidden md:flex">
                <span class="text-[9px] font-black uppercase tracking-widest text-white/40 leading-none">{{ user.role }}</span>
                <span class="text-sm font-black text-white leading-tight">{{ user.name }}</span>
             </div>
             <RouterLink to="/profile" class="relative group">
                <div class="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden transition-all group-hover:border-amber-200">
                   <img v-if="user.profile_photo" :src="`http://localhost:5000${user.profile_photo}`" class="w-full h-full object-cover" />
                   <i v-else class="ph-bold ph-user-circle text-xl text-white"></i>
                </div>
             </RouterLink>
             <button @click="handleLogout" class="bg-secondary/20 hover:bg-secondary text-white w-10 h-10 rounded-xl transition-all btn-animate flex items-center justify-center">
                <i class="ph-bold ph-power"></i>
             </button>
          </div>
          <RouterLink v-else to="/login" class="bg-secondary text-white px-8 py-3 rounded-xl font-black hover:shadow-2xl hover:shadow-secondary/30 transition-all btn-animate ml-4 flex items-center gap-2">
            <i class="ph-bold ph-sign-in"></i> Login
          </RouterLink>
        </nav>
      </div>

      <!-- Mobile Navigation Drawer -->
      <Transition name="fade">
        <div v-if="isMobileMenuOpen" class="lg:hidden fixed inset-0 z-[60] pt-16">
          <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="toggleMobileMenu"></div>
          <nav class="relative bg-primary w-[280px] h-full shadow-2xl flex flex-col p-8 space-y-8 animate-slide-right">
             <div class="border-b border-white/10 pb-6 mb-2">
                <Logo light />
                <p v-if="user" class="text-[10px] font-black text-white/40 uppercase tracking-widest mt-4">Logged in as</p>
                <p v-if="user" class="text-white font-black truncate">{{ user.name }}</p>
             </div>
             
             <RouterLink @click="toggleMobileMenu" to="/" class="text-white hover:text-secondary font-black text-lg flex items-center gap-4 transition-colors">
                <i class="ph-bold ph-house text-2xl"></i> Home
             </RouterLink>
             
             <RouterLink v-if="user?.role === 'SuperAdmin'" @click="toggleMobileMenu" to="/admin" class="text-white hover:text-secondary font-black text-lg flex items-center gap-4 transition-colors">
                <i class="ph-bold ph-crown text-2xl text-amber-300"></i> Mayor Dashboard
             </RouterLink>

             <RouterLink v-if="canPost" @click="toggleMobileMenu" to="/create-event" class="text-white hover:text-secondary font-black text-lg flex items-center gap-4 transition-colors">
                <i class="ph-bold ph-plus-circle text-2xl text-emerald-300"></i> Post Content
             </RouterLink>

             <RouterLink @click="toggleMobileMenu" to="/map" class="text-white hover:text-secondary font-black text-lg flex items-center gap-4 transition-colors">
                <i class="ph-bold ph-map-trifold text-2xl"></i> Community Map
             </RouterLink>

             <RouterLink @click="toggleMobileMenu" to="/calendar" class="text-white hover:text-secondary font-black text-lg flex items-center gap-4 transition-colors">
                <i class="ph-bold ph-calendar-blank text-2xl"></i> Events Calendar
             </RouterLink>

             <div class="mt-auto pt-8 border-t border-white/10 flex flex-col gap-4">
                <RouterLink @click="toggleMobileMenu" to="/profile" class="text-white/80 font-bold flex items-center gap-4"><i class="ph-bold ph-user-circle text-xl"></i> My Profile</RouterLink>
                <button @click="handleLogout(); toggleMobileMenu()" class="text-red-400 font-bold flex items-center gap-4 text-left"><i class="ph-bold ph-power text-xl"></i> Sign Out</button>
             </div>
          </nav>
        </div>
      </Transition>
    </header>

    <!-- Mobile Top Bar -->
    <header class="lg:hidden bg-primary text-white p-4 flex justify-between items-center sticky top-0 z-40 shadow-lg print:hidden">
       <div class="flex items-center gap-3">
          <button @click="toggleMobileMenu" class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
             <i class="ph-bold ph-list text-xl"></i>
          </button>
          <Logo light @click="router.push('/')" class="cursor-pointer" />
          <h2 v-if="pageTitle" class="text-[10px] font-black uppercase tracking-widest border-l border-white/20 pl-3 py-1 truncate max-w-[120px]">{{ pageTitle }}</h2>
       </div>
       <div v-if="user" class="flex items-center gap-3">
          <button @click="showNotificationDropdown = !showNotificationDropdown" class="relative w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
             <i class="ph-fill ph-bell text-xl"></i>
             <span v-if="persistentNotifications.filter(n => !n.is_read).length > 0" class="absolute -top-1 -right-1 w-4 h-4 bg-secondary text-[8px] font-black rounded-full flex items-center justify-center">
                {{ persistentNotifications.filter(n => !n.is_read).length }}
             </span>
          </button>
       </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-grow container mx-auto px-4 md:px-8 py-8 fade-in">
      <RouterView />
    </main>

    <!-- Mobile Bottom Navigation -->
    <nav class="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex justify-around items-center px-4 py-3 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-[2rem] print:hidden">
       <RouterLink to="/" class="flex flex-col items-center gap-1 text-slate-400" active-class="text-primary scale-110">
          <i class="ph-fill ph-house text-2xl"></i>
          <span class="text-[10px] font-black uppercase tracking-widest">Home</span>
       </RouterLink>
       <RouterLink to="/map" class="flex flex-col items-center gap-1 text-slate-400" active-class="text-primary scale-110">
          <i class="ph-fill ph-map-pin text-2xl"></i>
          <span class="text-[10px] font-black uppercase tracking-widest">Map</span>
       </RouterLink>
       <RouterLink to="/calendar" class="flex flex-col items-center gap-1 text-slate-400" active-class="text-primary scale-110">
          <i class="ph-fill ph-calendar-blank text-2xl"></i>
          <span class="text-[10px] font-black uppercase tracking-widest">Events</span>
       </RouterLink>
       <RouterLink v-if="user" to="/profile" class="flex flex-col items-center gap-1 text-slate-400" active-class="text-primary scale-110">
          <div class="w-7 h-7 rounded-lg overflow-hidden border-2 border-transparent" :class="{'border-primary': $route.path === '/profile'}">
             <img v-if="user.profile_photo" :src="`http://localhost:5000${user.profile_photo}`" class="w-full h-full object-cover" />
             <i v-else class="ph-fill ph-user-circle text-2xl"></i>
          </div>
          <span class="text-[10px] font-black uppercase tracking-widest">Profile</span>
       </RouterLink>
       <RouterLink v-else to="/login" class="flex flex-col items-center gap-1 text-slate-400" active-class="text-primary scale-110">
          <i class="ph-fill ph-sign-in text-2xl"></i>
          <span class="text-[10px] font-black uppercase tracking-widest">Login</span>
       </RouterLink>
       <button v-if="user" @click="handleLogout" class="flex flex-col items-center gap-1 text-slate-400">
          <i class="ph-fill ph-power text-2xl"></i>
          <span class="text-[10px] font-black uppercase tracking-widest">Exit</span>
       </button>
    </nav>

    <!-- Footer -->
    <footer class="bg-[#1e293b] text-white py-10 mt-auto border-t-4 border-primary hidden lg:block print:hidden">
      <div class="container mx-auto px-4 text-center flex flex-col items-center gap-6">
        <div class="opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition duration-500 scale-90">
          <Logo />
        </div>
        <p class="text-sm text-gray-400 font-medium tracking-wide">&copy; 2026 CordovaConnect. Built with ❤️ and 🍌 by Nano Banana.</p>
      </div>
    </footer>
    <!-- Toast Notifications Component -->
    <Toast 
      v-for="(toast, index) in toasts" 
      :key="toast.id"
      :message="toast.message"
      :type="toast.type"
      :duration="toast.duration"
      @close="toasts.splice(index, 1)"
    />
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.animate-slide-right {
  animation: slideRight 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideRight {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

.slide-up {
  animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fadeIn 0.5s ease both;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.btn-animate {
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.btn-animate:active {
  transform: scale(0.95);
}

.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
