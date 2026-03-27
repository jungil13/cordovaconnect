<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import Logo from '../components/Logo.vue';

const router = useRouter();
const form = ref({
  name: '',
  email: '',
  password: '',
  barangay_id: ''
});
const photo = ref(null);
const photoPreview = ref(null);
const barangays = ref([]);
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  try {
    const res = await api.get('/barangays');
    barangays.value = res.data;
  } catch (err) {
    console.error('Failed to load barangays');
  } finally {
    loading.value = false;
  }
});

const handlePhotoChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    photo.value = file;
    photoPreview.value = URL.createObjectURL(file);
  }
};

const handleGoogleLogin = () => {
  window.location.href = 'http://localhost:5000/api/auth/google';
};

const handleRegister = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    const formData = new FormData();
    formData.append('name', form.value.name);
    formData.append('email', form.value.email);
    formData.append('password', form.value.password);
    formData.append('barangay_id', form.value.barangay_id);
    if (photo.value) {
      formData.append('profile_photo', photo.value);
    }

    const res = await api.post('/auth/register', formData);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    router.push('/');
  } catch (err) {
    error.value = err.response?.data?.message || 'Registration failed';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center p-4 fade-in">
    <div class="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden slide-up">
      <div class="p-8 md:p-12 space-y-8">
        <div class="text-center space-y-4">
          <RouterLink to="/" class="flex justify-center mb-6">
            <Logo />
          </RouterLink>
          <h2 class="text-3xl font-black text-dark-blue tracking-tight">Join the Hub</h2>
          <p class="text-slate-500 font-medium">Create your CordovaConnect account.</p>
        </div>

        <div v-if="error" class="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100 flex items-center gap-3">
          <i class="ph-bold ph-warning-circle"></i> {{ error }}
        </div>

        <form @submit.prevent="handleRegister" class="space-y-5">
          <!-- Profile Photo Upload -->
          <div class="flex flex-col items-center gap-4 mb-2">
            <div class="w-24 h-24 rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative group cursor-pointer hover:border-primary transition-colors">
              <img v-if="photoPreview" :src="photoPreview" class="w-full h-full object-cover" />
              <i v-else class="ph-bold ph-user text-3xl text-slate-300"></i>
              <input type="file" @change="handlePhotoChange" class="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
            </div>
            <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Profile Photo</span>
          </div>
          <div class="space-y-1">
            <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 text-left block">Full Name</label>
            <input 
              v-model="form.name"
              type="text" 
              required
              placeholder="e.g. Juan De La Cruz"
              class="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all text-slate-700 font-medium"
            />
          </div>

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
            <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 text-left block">Password</label>
            <input 
              v-model="form.password"
              type="password" 
              required
              placeholder="••••••••"
              class="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all text-slate-700 font-medium"
            />
          </div>

          <div class="space-y-1">
            <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 text-left block">Your Barangay</label>
            <select 
              v-model="form.barangay_id"
              class="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all text-slate-700 font-medium appearance-none"
            >
              <option value="">Select Barangay (Optional for Visitors)</option>
              <option v-for="brgy in barangays" :key="brgy.id" :value="brgy.id">{{ brgy.name }}</option>
            </select>
          </div>

          <button 
            type="submit" 
            :disabled="loading"
            class="w-full bg-primary text-white py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:bg-dark-blue transition btn-animate mt-4"
          >
            <span v-if="loading">Processing...</span>
            <span v-else>Create Account <i class="ph-bold ph-arrow-right ml-1"></i></span>
          </button>
        </form>

        <div class="relative py-4">
          <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-slate-100"></div></div>
          <div class="relative flex justify-center text-xs uppercase"><span class="bg-white px-4 text-slate-400 font-bold tracking-widest">Or social login</span></div>
        </div>

        <button @click="handleGoogleLogin" class="w-full bg-white border border-slate-200 text-slate-700 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-50 transition btn-animate">
          <i class="ph-bold ph-google-logo text-xl text-red-500"></i> Continue with Google
        </button>

        <p class="text-center text-sm font-medium text-slate-500 pt-4">
          Already have an account? 
          <RouterLink to="/login" class="text-secondary font-bold hover:underline">Sign In</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>
