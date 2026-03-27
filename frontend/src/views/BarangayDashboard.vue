<script setup>
import { ref, onMounted, inject } from 'vue';
import api from '../services/api';

const toast = inject('toast');

const user = JSON.parse(localStorage.getItem('user') || '{}');
const barangay = ref(null);
const events = ref([]);
const loading = ref(true);
const alertForm = ref({ title: '', content: '', type: 'Emergency', urgency: 'High' });
const showAlertForm = ref(false);
const activeTab = ref('announcements');

const postAlert = async () => {
  try {
     await api.post('/announcements', alertForm.value);
     toast.addToast('Alert dispatched successfully!', 'success');
     showAlertForm.value = false;
     alertForm.value = { title: '', content: '', type: 'Emergency', urgency: 'High' };
  } catch (err) {
     toast.addToast('Failed to send alert. Please try again.', 'error');
  }
};

onMounted(async () => {
  try {
    if (user.barangay_id) {
       const res = await api.get(`/barangays/${user.barangay_id}`);
       barangay.value = res.data;
       events.value = res.data.events || [];
    }
  } catch (err) {
    console.error('Failed to load barangay data');
  } finally {
    loading.value = false;
  }
});

const stats = [
  { label: 'Local Events', value: '8', icon: 'ph-fill ph-calendar-star', color: 'text-primary' },
  { label: 'Residents', value: '1.2k', icon: 'ph-fill ph-users', color: 'text-secondary' },
  { label: 'Alerts Sent', value: '4', icon: 'ph-fill ph-megaphone', color: 'text-amber-500' }
];
</script>

<template>
  <div class="barangay-dashboard space-y-10 fade-in pb-20">
    <!-- Header -->
    <div v-if="barangay" class="flex flex-col md:flex-row md:items-center justify-between gap-6">
       <div class="space-y-1">
         <h2 class="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
           <i class="ph-fill ph-house-line text-primary"></i> {{ barangay.name }} Dashboard
         </h2>
         <p class="text-slate-500 font-medium tracking-wide uppercase text-xs">Official Management Portal</p>
       </div>
       <button @click="$router.push('/create-event')" class="bg-primary text-white font-black px-10 py-4 rounded-2xl shadow-xl shadow-primary/20 btn-animate flex items-center gap-2">
         <i class="ph-fill ph-plus-circle text-xl"></i> Create Brgy Event
       </button>
    </div>

    <!-- Alert Dispatcher Tab -->
    <div v-if="activeTab === 'announcements'" class="space-y-8">
       <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-red-50 p-8 rounded-[2rem] border border-red-100">
          <div class="space-y-2">
             <h4 class="text-xl font-black text-secondary flex items-center gap-2">
               <i class="ph-fill ph-lightning"></i> Rapid Emergency Dispatch
             </h4>
             <p class="text-red-900/60 font-medium text-sm">Post critical updates for {{ barangay?.name }} community.</p>
          </div>
          <button @click="showAlertForm = !showAlertForm" :class="['font-black px-10 py-4 rounded-2xl shadow-xl transition-all btn-animate shrink-0', showAlertForm ? 'bg-slate-800 text-white shadow-slate-200' : 'bg-secondary text-white shadow-secondary/20']">
            {{ showAlertForm ? 'Close Form' : 'Dispatch New Alert' }}
          </button>
       </div>

       <div v-if="showAlertForm" class="bg-white border-2 border-red-100 p-8 rounded-[2rem] shadow-xl space-y-6 slide-up">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div class="space-y-1">
                <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Alert Title</label>
                <input v-model="alertForm.title" placeholder="e.g. Extreme Rainfall Warning" class="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-red-100 transition-all font-bold"/>
             </div>
             <div class="space-y-1">
                <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Alert Type</label>
                <select v-model="alertForm.type" class="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-red-100 transition-all font-bold appearance-none">
                   <option>Emergency</option>
                   <option>Weather</option>
                   <option>Utility</option>
                   <option>General</option>
                </select>
             </div>
          </div>
          <div class="space-y-1">
             <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Message Content</label>
             <textarea v-model="alertForm.content" placeholder="Describe the situation and necessary actions..." class="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-secondary/10 transition-all font-medium min-h-[150px]"></textarea>
          </div>
          <button @click="postAlert" class="w-full bg-primary text-white py-5 rounded-2xl font-black shadow-xl hover:bg-dark-blue transition btn-animate">
             Confirm and Broadcast to {{ barangay?.name }}
          </button>
       </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
       <div v-for="s in stats" :key="s.label" class="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-6 slide-up">
          <div :class="['w-16 h-16 rounded-2xl flex items-center justify-center bg-slate-50', s.color]">
            <i :class="[s.icon, 'text-3xl']"></i>
          </div>
          <div>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">{{ s.label }}</p>
            <p class="text-3xl font-black text-slate-900 leading-none mt-1">{{ s.value }}</p>
          </div>
       </div>
    </div>

    <!-- Local Content Tabs -->
    <div class="bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-slate-100 min-h-[400px] slide-up">
       <div class="flex items-center justify-between mb-8 border-b border-slate-50 pb-6">
          <h3 class="text-2xl font-black text-slate-900">Manage Local Events</h3>
          <div class="flex gap-2">
             <button class="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-primary transition"><i class="ph-bold ph-magnifying-glass"></i></button>
             <button class="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-primary transition"><i class="ph-bold ph-funnel"></i></button>
          </div>
       </div>

       <div v-if="loading" class="space-y-4">
          <div v-for="i in 3" :key="i" class="h-20 bg-slate-50 rounded-2xl animate-pulse"></div>
       </div>

       <div v-else-if="events.length === 0" class="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <i class="ph-fill ph-calendar-blank text-5xl text-slate-200"></i>
          <p class="text-slate-500 font-bold italic">No events posted for this barangay yet.</p>
       </div>

       <div v-else class="space-y-4">
          <div v-for="e in events" :key="e.id" class="flex items-center justify-between p-6 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white transition-all shadow-sm hover:shadow-lg">
             <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary">
                   <i class="ph-fill ph-calendar-check text-xl"></i>
                </div>
                <div>
                  <h4 class="font-bold text-slate-800">{{ e.title }}</h4>
                  <p class="text-xs text-slate-400 font-medium uppercase tracking-wider">{{ new Date(e.start_datetime).toLocaleDateString() }}</p>
                </div>
             </div>
             <div class="flex items-center gap-2">
                <button class="w-10 h-10 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-primary transition btn-animate"><i class="ph-bold ph-pencil-simple"></i></button>
                <button class="w-10 h-10 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-red-500 transition btn-animate"><i class="ph-bold ph-trash"></i></button>
             </div>
          </div>
       </div>
    </div>
  </div>
</template>
