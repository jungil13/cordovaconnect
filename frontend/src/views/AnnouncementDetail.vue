<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api';
import Breadcrumbs from '../components/Breadcrumbs.vue';

const route = useRoute();
const router = useRouter();
const announcement = ref(null);
const loading = ref(true);

const fetchAnnouncement = async () => {
  try {
    const res = await api.get(`/announcements/${route.params.id}`);
    announcement.value = res.data;
  } catch (err) {
    console.error('Failed to fetch announcement');
  } finally {
    loading.value = false;
  }
};

onMounted(fetchAnnouncement);
</script>

<template>
  <div class="announcement-detail max-w-4xl mx-auto space-y-8 pb-20 fade-in px-4">
    <Breadcrumbs />

    <div v-if="loading" class="flex flex-col items-center justify-center py-20">
       <div class="w-16 h-16 border-4 border-slate-100 border-t-primary rounded-full animate-spin"></div>
       <p class="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading details...</p>
    </div>

    <article v-else-if="announcement" class="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 slide-up">
      <!-- Urgency Header -->
      <div :class="['p-8 text-white flex items-center justify-between', announcement.urgency === 'High' ? 'bg-secondary' : 'bg-primary']">
         <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">
               <i :class="announcement.urgency === 'High' ? 'ph-fill ph-warning-diamond' : 'ph-fill ph-megaphone'"></i>
            </div>
            <div>
               <h2 class="text-2xl font-black tracking-tight leading-none">{{ announcement.urgency }} Priority</h2>
               <p class="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 mt-1">Community Announcement</p>
            </div>
         </div>
         <span class="text-[10px] font-black uppercase tracking-widest bg-black/10 px-4 py-2 rounded-full">{{ new Date(announcement.createdAt).toLocaleDateString() }}</span>
      </div>

      <div class="p-8 md:p-12 space-y-10">
         <div class="space-y-4">
            <h1 class="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">{{ announcement.title }}</h1>
            <div class="flex flex-wrap gap-3">
               <span class="px-4 py-1.5 rounded-full bg-slate-100 text-slate-500 font-black uppercase tracking-widest text-[10px]">{{ announcement.type || 'General' }}</span>
               <span class="px-4 py-1.5 rounded-full bg-slate-900 text-white font-black uppercase tracking-widest text-[10px]" v-if="announcement.barangay_id">Specific to Barangay</span>
            </div>
         </div>

         <div class="prose prose-slate max-w-none">
            <p class="text-xl text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">{{ announcement.content }}</p>
         </div>

         <div class="pt-10 border-t border-slate-50 flex items-center justify-between">
            <div class="flex items-center gap-4">
               <div class="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <i class="ph-bold ph-user"></i>
               </div>
               <div>
                  <p class="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Published By</p>
                  <p class="font-black text-slate-800 tracking-tight">Cordova Official</p>
               </div>
            </div>
            
            <button @click="router.back()" class="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl hover:scale-105 transition-transform">
               Go Back
            </button>
         </div>
      </div>
    </article>

    <div v-else class="text-center py-20 space-y-4">
       <i class="ph-fill ph-warning text-6xl text-slate-200"></i>
       <h2 class="text-2xl font-black text-slate-900 uppercase">Announcement Not Found</h2>
       <button @click="router.push('/')" class="text-primary font-black uppercase tracking-widest text-xs hover:underline">Return Home</button>
    </div>
  </div>
</template>

<style scoped>
.fade-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-up { animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
</style>
