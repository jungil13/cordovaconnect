<script setup>
import { ref, onMounted, inject } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import Breadcrumbs from '../components/Breadcrumbs.vue';

const router = useRouter();
const toast = inject('toast');
const categories = ref([]);
const barangays = ref([]);
const loading = ref(false);
const selectedFile = ref(null);

const form = ref({
  title: '',
  description: '',
  start_datetime: '',
  end_datetime: '',
  location_name: '',
  category_id: '',
  barangay_id: '',
  is_alert: false,
  live_url: ''
});

const fetchData = async () => {
  try {
    const [catRes, barRes] = await Promise.all([
      api.get('/categories'),
      api.get('/barangays')
    ]);
    categories.value = catRes.data;
    barangays.value = barRes.data;
  } catch (err) {
    toast.addToast('Failed to load form data', 'error');
  }
};

const handleFile = (e) => {
  selectedFile.value = e.target.files[0];
};

const handleSubmit = async () => {
  loading.value = true;
  try {
    const formData = new FormData();
    Object.keys(form.value).forEach(key => {
      formData.append(key, form.value[key]);
    });
    if (selectedFile.value) {
      formData.append('image', selectedFile.value);
    }

    await api.post('/events', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    toast.addToast('Content submitted for review!', 'success');
    router.push('/');
  } catch (err) {
    toast.addToast('Error submitting content', 'error');
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);
</script>

<template>
  <div class="create-event max-w-4xl mx-auto space-y-8 pb-20 fade-in px-4">
    <Breadcrumbs />

    <div class="space-y-2">
      <h2 class="text-4xl font-black text-slate-900 tracking-tight">Post Community Content</h2>
      <p class="text-slate-500 font-medium font-bold uppercase tracking-widest text-[10px]">Create an event, announcement, or alert</p>
    </div>

    <form @submit.prevent="handleSubmit" class="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-slate-100 space-y-10 relative overflow-hidden">
      
      <!-- Progress/Loading -->
      <div v-if="loading" class="absolute inset-0 bg-white/80 backdrop-blur-md z-50 flex flex-col items-center justify-center">
         <div class="w-16 h-16 border-4 border-slate-100 border-t-primary rounded-full animate-spin"></div>
         <p class="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Publishing to Cordova...</p>
      </div>

      <!-- Basic Details -->
      <section class="space-y-8">
        <h3 class="text-xl font-black text-slate-800 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm">1</div>
          Primary Information
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div class="space-y-2 md:col-span-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
              <input v-model="form.title" required placeholder="e.g. Barangay Clean-up Drive" class="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:border-primary outline-none font-bold text-slate-800 transition-all"/>
           </div>
           
           <div class="space-y-2 md:col-span-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Detailed Description</label>
              <textarea v-model="form.description" required rows="4" placeholder="Describe the event goals, schedule, and requirements..." class="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:border-primary outline-none font-medium text-slate-700 transition-all resize-none"></textarea>
           </div>
        </div>
      </section>

      <!-- Logistics -->
      <section class="space-y-8">
        <h3 class="text-xl font-black text-slate-800 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary text-sm">2</div>
          Logistics & Location
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div class="space-y-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date & Time</label>
              <input v-model="form.start_datetime" type="datetime-local" required class="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:border-primary outline-none font-bold text-slate-800 transition-all"/>
           </div>

           <div class="space-y-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date & Time</label>
              <input v-model="form.end_datetime" type="datetime-local" class="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:border-primary outline-none font-bold text-slate-800 transition-all"/>
           </div>

           <div class="space-y-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Venue / Location</label>
              <input v-model="form.location_name" required placeholder="e.g. Barangay Hall Grounds" class="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:border-primary outline-none font-bold text-slate-800 transition-all"/>
           </div>

           <div class="space-y-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Barangay Coverage</label>
              <select v-model="form.barangay_id" required class="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:border-primary outline-none font-bold text-slate-800 transition-all appearance-none">
                 <option value="" disabled>Select Barangay</option>
                 <option v-for="b in barangays" :key="b.id" :value="b.id">{{ b.name }}</option>
              </select>
           </div>
        </div>
      </section>

      <!-- Visuals & Category -->
      <section class="space-y-8">
        <h3 class="text-xl font-black text-slate-800 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-slate-900/10 flex items-center justify-center text-slate-900 text-sm">3</div>
          Classification & Media
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div class="space-y-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Category</label>
              <select v-model="form.category_id" required class="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:border-primary outline-none font-bold text-slate-800 transition-all appearance-none">
                 <option value="" disabled>Select Category</option>
                 <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
           </div>

           <div class="space-y-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cover Image</label>
              <input type="file" @change="handleFile" accept="image/*" class="w-full px-6 py-3.5 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:border-primary outline-none font-bold text-slate-400 text-sm file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-primary file:text-white hover:file:bg-dark-blue transition-all cursor-pointer"/>
           </div>

            <div class="space-y-2 md:col-span-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-red-500">
                <i class="ph-bold ph-broadcast"></i> Live Coverage Link (Optional)
              </label>
              <input v-model="form.live_url" placeholder="https://facebook.com/live/..." class="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:border-primary outline-none font-bold text-slate-800 transition-all"/>
           </div>
        </div>

        <!-- Toggle Alert -->
        <div class="flex items-center gap-4 bg-red-50 p-6 rounded-[2rem] border border-red-100">
           <div class="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-white text-xl">
              <i class="ph-bold ph-lightning"></i>
           </div>
           <div class="flex-1">
              <h4 class="font-black text-secondary">Emergency Alert?</h4>
              <p class="text-[10px] font-bold text-red-900/40 uppercase tracking-wide">Marking this will flag it as an urgent priority alert.</p>
           </div>
           <button type="button" @click="form.is_alert = !form.is_alert" :class="['w-14 h-8 rounded-full p-1 transition-colors relative', form.is_alert ? 'bg-secondary' : 'bg-slate-300']">
              <div :class="['w-6 h-6 bg-white rounded-full transition-transform', form.is_alert ? 'translate-x-6' : 'translate-x-0']"></div>
           </button>
        </div>
      </section>

      <div class="pt-6 border-t border-slate-100">
        <button type="submit" class="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 hover:scale-[1.01] active:scale-95 transition-all text-sm flex items-center justify-center gap-4">
           Submit Community Content <i class="ph-bold ph-paper-plane-right"></i>
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.fade-in {
  animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
