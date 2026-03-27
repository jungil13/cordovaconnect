<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '../services/api';
import EventCard from '../components/EventCard.vue';

const events = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const selectedCategory = ref('');
const activeSection = ref('events'); // 'events', 'heritage', 'landmarks'
const user = ref(JSON.parse(localStorage.getItem('user') || 'null'));

const canPost = computed(() => {
  if (!user.value) return false;
  return ['SuperAdmin', 'BarangayOfficial', 'BarangayWorker'].includes(user.value.role);
});

const categories = [
  { name: 'Festivals', icon: 'ph-fill ph-mask-happy' },
  { name: 'Sports', icon: 'ph-fill ph-basketball' },
  { name: 'School', icon: 'ph-fill ph-student' },
  { name: 'Church', icon: 'ph-fill ph-hands-praying' },
  { name: 'Tourism', icon: 'ph-fill ph-island' }
];

const announcements = ref([]);

const fetchEvents = async () => {
  try {
    loading.value = true;
    const [eventRes, announceRes] = await Promise.all([
      api.get('/events'),
      api.get('/announcements')
    ]);
    events.value = eventRes.data;
    announcements.value = announceRes.data;
  } catch (error) {
    console.error('Failed to fetch data');
  } finally {
    loading.value = false;
  }
};

const activeAlerts = computed(() => {
  return announcements.value.filter(a => a.urgency === 'High').slice(0, 3);
});

onMounted(() => {
  fetchEvents();
});

const filteredEvents = computed(() => {
  return events.value.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesCategory = selectedCategory.value ? event.category?.name === selectedCategory.value : true;
    return matchesSearch && matchesCategory;
  });
});

const hymns = {
  cordova: {
    title: 'Cordova Hymn',
    lyrics: `Kabilin sa among katigulangan\nMahal ka nga yuta, Cordova\nAng imong katahum nagasidlak\nSa matag suok sa imong kaumahan\n\nCordova, Cordova\nGarbo ka ning kasingkasing\nAng imong kabilin amumahon\nAlang sa ugma nga madan-agon.`
  },
  sugbo: {
    title: 'Sugbo Hymn',
    lyrics: `Sugbo, mahal namong Sugbo\nAng imong ngalan amumahon\nKabilin sa kaisug ug pagtuo\nSa matag anak mo nga matinud-anon\n\nO Sugbo, yuta nga gipangga\nSa amihanang dapit sa Habagatan\nAng imong sidlak dili mapalong\nSa kasingkasing sa mga sugboanon.`
  }
};
</script>

<template>
  <div class="home space-y-16">
    <!-- Hero Section with Background -->
    <section class="relative overflow-hidden rounded-[3rem] text-white group shadow-2xl">
      <!-- Professional Background Image (Placeholder path) -->
      <div class="absolute inset-0 bg-slate-900">
         <img src="../assets/images/background.png" class="w-full h-full object-cover opacity-50 transition-transform duration-10000 group-hover:scale-110" />
      </div>
      <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
            <div class="max-w-6xl mx-auto px-4 sm:px-8 py-12 md:py-24 flex items-center justify-center min-h-[500px] md:min-h-[700px]">
        <div class="text-center space-y-8 md:space-y-12 max-w-4xl slide-up">
           <div class="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] md:text-xs font-black uppercase tracking-[0.3em] shadow-2xl">
              <i class="ph-fill ph-pin text-amber-300"></i> The Heart of Cordova, Cebu
           </div>
           
           <h1 class="text-6xl md:text-9xl font-black text-white leading-[0.85] tracking-tighter drop-shadow-2xl">
              Discover Our <br/> <span class="text-secondary drop-shadow-lg">Heritage</span>
           </h1>
           <p class="text-lg md:text-xl text-slate-200 max-w-2xl mx-auto leading-relaxed font-medium opacity-90">
              Stay connected with 13 vibrant barangays. From high-tech CCLEX views to the soulful Cordova Hymn.
           </p>
           
           <div class="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 pt-8">
              <button @click="activeSection = 'events'" class="w-full sm:w-auto bg-white text-primary px-10 py-5 rounded-2xl font-black shadow-2xl hover:bg-secondary hover:text-white transition-all btn-animate flex items-center justify-center gap-3 group">
                 <i class="ph-fill ph-calendar text-xl group-hover:rotate-12 transition-transform"></i> Events
              </button>
              <button @click="activeSection = 'heritage'" class="w-full sm:w-auto bg-primary text-white border-2 border-white/20 px-10 py-5 rounded-2xl font-black shadow-2xl hover:bg-white hover:text-primary transition-all btn-animate flex items-center justify-center gap-3 group">
                 <i class="ph-fill ph-book-open text-xl group-hover:scale-110 transition-transform"></i> Heritage
              </button>
              <button @click="activeSection = 'landmarks'" class="w-full sm:w-auto bg-white/10 backdrop-blur-md border-2 border-white/20 text-white px-10 py-5 rounded-2xl font-black hover:bg-white/20 transition-all btn-animate flex items-center justify-center gap-3 group">
                 <i class="ph-fill ph-map-trifold text-xl group-hover:-translate-y-1 transition-transform"></i> Landmarks
              </button>
           </div>
        </div>
      </div>
    </section>



    <!-- Main Content Grid -->
    <section v-if="activeSection === 'events'" class="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20 lg:py-24">
       <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          <!-- Left Sidebar: Community Alerts & Announcements -->
          <aside class="lg:col-span-4 space-y-10 order-2 lg:order-1">
             <div class="space-y-6">
                <div class="flex items-center gap-3 border-b-4 border-secondary pb-4">
                   <i class="ph-fill ph-megaphone text-3xl text-secondary"></i>
                   <h3 class="text-2xl font-black text-slate-900 tracking-tight uppercase">Community Alerts</h3>
                </div>
                
                <div v-if="announcements.length === 0" class="p-8 bg-white rounded-3xl border border-slate-100 text-center text-slate-400">
                   <i class="ph-fill ph-empty text-3xl opacity-20 mb-2 block"></i>
                   <p class="text-xs font-bold uppercase">No active alerts</p>
                </div>
                
                <div v-else class="space-y-4">
                   <div 
                     v-for="announce in announcements" 
                     :key="announce.id" 
                     class="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
                     :class="{'border-secondary/20 bg-red-50/10': announce.urgency === 'High'}"
                   >
                      <div class="flex justify-between items-start mb-3">
                         <span :class="['px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest', announce.urgency === 'High' ? 'bg-secondary text-white' : 'bg-primary/10 text-primary']">
                            {{ announce.urgency }} Urgency
                         </span>
                         <span class="text-[9px] font-black text-slate-300 uppercase tracking-widest">{{ new Date(announce.createdAt).toLocaleDateString() }}</span>
                      </div>
                      <h4 class="text-lg font-black text-slate-900 leading-tight group-hover:text-primary transition-colors">{{ announce.title }}</h4>
                      <p class="mt-2 text-sm text-slate-500 font-medium leading-relaxed line-clamp-3">{{ announce.content }}</p>
                      <RouterLink :to="`/announcements/${announce.id}`" class="mt-4 text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2 hover:gap-4 transition-all">
                         Read More <i class="ph-bold ph-arrow-right"></i>
                      </RouterLink>
                   </div>
                </div>
             </div>

             <!-- Mini Heritage Card in Sidebar -->
             <div @click="activeSection = 'heritage'" class="p-8 bg-slate-900 rounded-[2.5rem] text-white space-y-4 cursor-pointer hover:scale-[1.02] transition-transform overflow-hidden relative group">
                <div class="absolute -right-4 -bottom-4 opacity-10 transition-transform group-hover:scale-150"><i class="ph-fill ph-book-open text-8xl"></i></div>
                <h4 class="text-xl font-black">Our Heritage</h4>
                <p class="text-xs text-slate-400 font-bold leading-relaxed">Learn about Cordova's rich history and hymns.</p>
             </div>
          </aside>

          <!-- Right Content: Recent Events Feed -->
          <div class="lg:col-span-8 space-y-12 order-1 lg:order-2">
             <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div class="space-y-3">
                   <h2 class="text-4xl md:text-6xl font-black text-dark-blue tracking-tighter leading-none">News & <span class="text-primary italic">Events</span></h2>
                   <p class="text-slate-500 font-medium md:text-lg">Discover the latest happenings in Cordova.</p>
                </div>
                <div class="relative w-full md:w-80">
                   <i class="ph-bold ph-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                   <input v-model="searchQuery" type="text" placeholder="Search feed..." class="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-slate-100 focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium shadow-sm ring-1 ring-slate-100"/>
                </div>
             </div>

             <div class="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
               <button 
                 @click="selectedCategory = ''"
                 :class="['px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap btn-animate border', !selectedCategory ? 'bg-primary text-white border-primary shadow-lg' : 'bg-white text-slate-600 border-slate-100']"
               >
                 All Feed
               </button>
               <button v-for="cat in categories" :key="cat.name" @click="selectedCategory = cat.name" :class="['px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap btn-animate flex items-center gap-2 border', selectedCategory === cat.name ? 'bg-primary text-white border-primary shadow-lg' : 'bg-white text-slate-600 border-slate-100']">
                 <i :class="cat.icon"></i> {{ cat.name }}
               </button>
             </div>

             <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div v-for="i in 4" :key="i" class="h-[350px] bg-white rounded-[2.5rem] animate-pulse"></div>
             </div>
             <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <EventCard v-for="event in filteredEvents" :key="event.id" :event="event" />
                <div v-if="filteredEvents.length === 0" class="col-span-full py-20 text-center space-y-4">
                   <i class="ph-fill ph-calendar-blank text-6xl text-slate-200"></i>
                   <p class="text-slate-400 font-black uppercase tracking-widest">No events found matching your search</p>
                </div>
             </div>
          </div>

       </div>
    </section>

    <!-- Heritage & Hymns Section -->
    <template v-else-if="activeSection === 'heritage'">
      <section class="grid grid-cols-1 lg:grid-cols-2 gap-12 slide-up">
         <!-- History -->
         <div class="bg-white p-12 rounded-[3rem] shadow-sm border border-slate-100 space-y-8">
            <h3 class="text-4xl font-black text-slate-900 tracking-tight">Cordova <span class="text-primary">History</span></h3>
            <div class="prose prose-slate max-w-none space-y-4 text-slate-600 font-medium leading-relaxed">
               <p>Established on May 22, 1863, by Spanish Governor General Rafael Echague, Cordova (originally Cordoba) was once a bario of Opon. It regained municipal status on Jan 1, 1913.</p>
               <p>Our town is home to the hero Juan Nuñez, who fought for our independence during the 1898 revolution. Today, we stand as a gateway to Cebu via the CCLEX.</p>
            </div>
            <div class="pt-6 border-t border-slate-50 flex items-center gap-4">
               <div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><i class="ph-fill ph-book"></i></div>
               <p class="text-xs font-bold text-slate-400 uppercase tracking-widest leading-normal">Founded 1863 • 13 Barangays • Proud Heritage</p>
            </div>
         </div>

         <!-- Hymns -->
         <div class="space-y-6">
            <div v-for="(hymn, key) in hymns" :key="key" class="bg-slate-900 p-10 rounded-[2.5rem] text-white space-y-6 shadow-xl relative overflow-hidden group">
               <div class="absolute top-0 right-0 p-8 opacity-10 transition-transform group-hover:scale-125"><i class="ph-fill ph-music-notes text-6xl"></i></div>
               <h4 class="text-2xl font-black tracking-tight">{{ hymn.title }}</h4>
               <p class="whitespace-pre-line text-sm text-slate-400 font-bold leading-relaxed italic border-l-2 border-primary pl-6 italic">
                 {{ hymn.lyrics }}
               </p>
            </div>
         </div>
      </section>
    </template>

    <!-- Landmarks Section -->
    <template v-else-if="activeSection === 'landmarks'">
      <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 slide-up">
         <div v-for="place in [
           { name: 'CCLEX Bridge', desc: 'Longest bridge in the PH connecting Cebu City & Cordova.', img: 'https://dissingweitling.com/assets/upload/_landscape1800/130958/DJI_0738.jpg' },
           { name: '10,000 Roses', desc: 'A white rose field that glows magic at night.', img: 'https://i.ytimg.com/vi/qF80fZgug7U/maxresdefault.jpg' },
           { name: 'San Roque Parish', desc: 'Our historical religious center established 1864.', img: 'https://www.mycebu.ph/wp-content/uploads/2022/08/cordova-church.jpg' }
         ]" :key="place.name" class="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 group">
            <div class="h-64 overflow-hidden"><img :src="place.img" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/></div>
            <div class="p-8 space-y-3">
               <h4 class="text-xl font-bold text-slate-900">{{ place.name }}</h4>
               <p class="text-sm text-slate-500 font-medium leading-relaxed">{{ place.desc }}</p>
            </div>
         </div>
      </section>
    </template>

    <!-- Footer CTA -->
    <section class="bg-primary rounded-[3rem] p-16 text-center text-white relative overflow-hidden shadow-2xl">
      <div class="relative z-10 space-y-8">
        <h3 class="text-4xl md:text-5xl font-black tracking-tight">Proudly Cordovanhon</h3>
        <p class="text-blue-100 max-w-md mx-auto font-medium opacity-80 leading-relaxed">Join thousands of residents in the digital heart of our town. Download the app today.</p>
        <button class="bg-white text-primary px-12 py-5 rounded-[2rem] font-black hover:bg-slate-50 transition shadow-2xl btn-animate flex items-center gap-3 mx-auto">
          Get Started Now <i class="ph-bold ph-rocket-launch text-xl"></i>
        </button>
      </div>
    </section>

    <!-- Floating Action Button for Content Creation -->
    <RouterLink 
      v-if="canPost"
      to="/create-event" 
      class="fixed bottom-24 right-8 w-16 h-16 bg-secondary text-white rounded-2xl shadow-2xl shadow-secondary/40 hidden lg:flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-[60] group border-4 border-white"
    >
      <i class="ph-bold ph-plus text-2xl transition-transform group-hover:rotate-90"></i>
      
      <!-- Tooltip -->
      <span class="absolute right-full mr-4 px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Post New Content
      </span>
    </RouterLink>
  </div>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
