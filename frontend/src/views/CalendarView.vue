<script setup>
import { ref, onMounted, computed, inject } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

const router = useRouter();
const toast = inject('toast');
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const currentDate = ref(new Date());
const currentMonth = computed(() => currentDate.value.getMonth());
const currentYear = computed(() => currentDate.value.getFullYear());

const events = ref([]);
const loading = ref(true);

const fetchEvents = async () => {
  loading.value = true;
  try {
    const res = await api.get('/events');
    events.value = res.data.filter(e => e.status === 'approved');
  } catch (err) {
    toast.addToast('Failed to load events', 'error');
  } finally {
    loading.value = false;
  }
};

const daysInMonth = computed(() => {
  const year = currentYear.value;
  const month = currentMonth.value;
  const date = new Date(year, month, 1);
  const days = [];
  
  // Fill leading empty days
  const firstDayIndex = date.getDay();
  for (let i = 0; i < firstDayIndex; i++) {
    days.push({ day: null, fullDate: null });
  }

  // Fill actual days
  const lastDay = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= lastDay; i++) {
    const fullDate = new Date(year, month, i);
    days.push({ 
      day: i, 
      fullDate,
      events: events.value.filter(e => {
        const eventDate = new Date(e.start_datetime);
        return eventDate.getDate() === i && 
               eventDate.getMonth() === month && 
               eventDate.getFullYear() === year;
      })
    });
  }
  return days;
});

const changeMonth = (delta) => {
  const newDate = new Date(currentDate.value);
  newDate.setMonth(newDate.getMonth() + delta);
  currentDate.value = newDate;
};

onMounted(fetchEvents);
</script>

<template>
  <div class="calendar-view space-y-10 fade-in pb-20">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div class="space-y-1">
        <h2 class="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <i class="ph-fill ph-calendar-blank text-primary"></i> Event Schedule
        </h2>
        <p class="text-slate-500 font-medium">Digital roadmap of Cordova's community celebrations.</p>
      </div>
      
      <div class="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
        <button @click="changeMonth(-1)" class="p-3 hover:bg-slate-50 text-slate-400 hover:text-primary rounded-xl transition btn-animate">
          <i class="ph-bold ph-caret-left"></i>
        </button>
        <div class="px-6 py-2 text-center min-w-[160px]">
          <span class="text-lg font-black text-slate-800 uppercase tracking-widest">{{ monthNames[currentMonth] }}</span>
          <span class="block text-[10px] font-black text-primary mt-1 tracking-[0.2em]">{{ currentYear }}</span>
        </div>
        <button @click="changeMonth(1)" class="p-3 hover:bg-slate-50 text-slate-400 hover:text-primary rounded-xl transition btn-animate">
          <i class="ph-bold ph-caret-right"></i>
        </button>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden slide-up relative">
      
      <!-- Loading Overlay -->
      <div v-if="loading" class="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center">
         <div class="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>

      <!-- Weekdays Header -->
      <div class="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
        <div 
          v-for="day in weekDays" 
          :key="day" 
          class="py-6 text-center text-[11px] font-black text-slate-400 tracking-[0.2em]"
        >
          {{ day }}
        </div>
      </div>
      
      <!-- Date Grid -->
      <div class="grid grid-cols-7 divide-x divide-y divide-slate-100">
        <div 
          v-for="(dateObj, idx) in daysInMonth" 
          :key="idx" 
          class="min-h-[160px] p-4 group transition-all duration-300 hover:bg-slate-50 relative overflow-hidden"
          :class="{'bg-slate-50/30': !dateObj.day}"
        >
          <div v-if="dateObj.day" class="flex justify-between items-start mb-4">
             <span 
               class="text-sm font-black transition-all group-hover:scale-125"
               :class="[
                 new Date().toDateString() === dateObj.fullDate.toDateString() 
                 ? 'bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg shadow-primary/30' 
                 : 'text-slate-400 group-hover:text-primary'
               ]"
             >
               {{ dateObj.day }}
             </span>
          </div>

          <!-- Event List -->
          <div v-if="dateObj.events?.length" class="space-y-1.5 relative z-10">
             <div 
               v-for="event in dateObj.events.slice(0, 3)" 
               :key="event.id"
               class="px-2.5 py-1.5 rounded-lg text-[10px] font-black truncate border transition-all cursor-pointer hover:translate-x-1"
               :class="[
                 event.category?.name === 'Health' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                 event.category?.name === 'Emergency' ? 'bg-red-50 text-red-600 border-red-100' :
                 'bg-primary/5 text-primary border-primary/10'
               ]"
               @click="router.push(`/events/${event.id}`)"
             >
               {{ event.title }}
             </div>
             <div v-if="dateObj.events.length > 3" class="text-[9px] font-black text-slate-400 pl-2">
               + {{ dateObj.events.length - 3 }} more
             </div>
          </div>

          <!-- Subtle Background Icon for empty days -->
          <i v-if="!dateObj.events?.length && dateObj.day" class="ph-bold ph-calendar-plus absolute -right-2 -bottom-2 text-4xl text-slate-50 opacity-0 group-hover:opacity-100 transition-opacity"></i>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="flex flex-wrap gap-8 justify-center py-8 slide-up bg-slate-100/50 rounded-[2rem] border border-slate-100">
      <div class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
         <div class="w-3 h-3 rounded-md bg-primary shadow-sm"></div> General
      </div>
      <div class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
         <div class="w-3 h-3 rounded-md bg-emerald-500 shadow-sm"></div> Health
      </div>
      <div class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
         <div class="w-3 h-3 rounded-md bg-red-500 shadow-sm"></div> Emergency
      </div>
      <div class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
         <div class="w-3 h-3 rounded-md bg-secondary shadow-sm"></div> Tourism
      </div>
    </div>
  </div>
</template>
