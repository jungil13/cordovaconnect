<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import Logo from '../components/Logo.vue';

const router = useRouter();
const form = ref({
  email: '',
  password: ''
});
const loading = ref(false);
const error = ref('');

const handleLogin = async () => {
  try {
    loading.value = true;
    error.value = '';
    const res = await api.post('/auth/login', form.value);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    localStorage.setItem('justLoggedIn', 'true');
    window.location.href = '/';
  } catch (err) {
    error.value = err.response?.data?.message || 'Invalid email or password';
  } finally {
    loading.value = false;
  }
};

const handleGoogleLogin = () => {
  window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`;
};
</script>

<template>
  <div class="min-h-[70vh] flex items-center justify-center p-4 fade-in relative">
    <!-- Login Loading Overlay -->
    <div v-if="loading" class="fixed inset-0 z-[100] bg-primary/90 backdrop-blur-xl flex flex-col items-center justify-center text-white fade-in">
       <div class="w-20 h-20 border-4 border-white/20 border-t-white rounded-full animate-spin mb-6"></div>
       <h2 class="text-2xl font-black tracking-tight">Signing You In...</h2>
       <p class="text-white/60 font-medium">Connecting to CordovaConnect</p>
    </div>

    <div class="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden slide-up">
      <div class="p-8 md:p-12 space-y-8">
        <div class="text-center space-y-4">
          <RouterLink to="/" class="flex justify-center mb-6">
            <Logo />
          </RouterLink>
          <h2 class="text-3xl font-black text-dark-blue tracking-tight">Welcome Back</h2>
          <p class="text-slate-500 font-medium tracking-wide">Sign in to CordovaConnect.</p>
        </div>

        <div v-if="error" class="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100 flex items-center gap-3">
          <i class="ph-bold ph-warning-circle"></i> {{ error }}
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div class="space-y-1">
            <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 text-left block">Email Address</label>
            <input 
              v-model="form.email"
              type="email" 
              required
              placeholder="name@example.com"
              class="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all text-slate-700 font-medium"
            />
          </div>

          <div class="space-y-1">
            <div class="flex justify-between items-center mb-1">
               <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
               <a href="#" class="text-[10px] font-bold text-secondary hover:underline uppercase tracking-wide">Forgot?</a>
            </div>
            <input 
              v-model="form.password"
              type="password" 
              required
              placeholder="••••••••"
              class="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all text-slate-700 font-medium"
            />
          </div>

          <button 
            type="submit" 
            :disabled="loading"
            class="w-full bg-primary text-white py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:bg-dark-blue transition btn-animate mt-2"
          >
            <span v-if="loading">Signing In...</span>
            <span v-else>Sign In <i class="ph-bold ph-sign-in ml-1"></i></span>
          </button>
        </form>

        <div class="relative py-4">
          <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-slate-100"></div></div>
          <div class="relative flex justify-center text-xs uppercase"><span class="bg-white px-4 text-slate-400 font-bold tracking-widest">Digital ID</span></div>
        </div>

        <button @click="handleGoogleLogin" class="w-full bg-white border border-slate-200 text-slate-700 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-50 transition btn-animate">
          <i class="ph-bold ph-google-logo text-xl text-red-500"></i> Sign in with Google
        </button>

        <p class="text-center text-sm font-medium text-slate-500 pt-4">
          New to CordovaConnect? 
          <RouterLink to="/register" class="text-secondary font-bold hover:underline">Create Account</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>
