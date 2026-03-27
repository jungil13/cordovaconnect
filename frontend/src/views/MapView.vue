<script setup>
import { ref, onMounted, inject } from 'vue';
import { useRouter } from 'vue-router';
import L from 'leaflet';
import api from '../services/api';

const mapContainer = ref(null);
const loading = ref(true);
const router = useRouter();

const brgyCoords = {
  'Poblacion': [10.2526, 123.9463],
  'Alegria': [10.2600, 123.9400],
  'Bangbang': [10.2450, 123.9500],
  'Buagsong': [10.2550, 123.9350],
  'Catarman': [10.2400, 123.9600],
  'Cogon': [10.2650, 123.9450],
  'Dapitan': [10.2700, 123.9300],
  'Day-as': [10.2350, 123.9550],
  'Gabi': [10.2580, 123.9520],
  'Gilutongan': [10.2000, 123.9800],
  'Ibabao': [10.2480, 123.9420],
  'Pilipog': [10.2620, 123.9320],
  'San Miguel': [10.2500, 123.9380]
};

const initMap = async () => {
  try {
    const res = await api.get('/events?status=approved');
    const events = res.data;
    loading.value = false;

    if (mapContainer.value) {
      const map = L.map(mapContainer.value).setView([10.2526, 123.9463], 14);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      setTimeout(() => map.invalidateSize(), 600); // Wait for CSS transition to complete

      events.forEach(event => {
        const brgyName = event.barangay?.name || 'Poblacion';
        const coords = brgyCoords[brgyName] || [10.2526, 123.9463];
        
        const jittered = [
          coords[0] + (Math.random() - 0.5) * 0.002,
          coords[1] + (Math.random() - 0.5) * 0.002
        ];

        const customIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="background-color: #0ea5e9; width: 15px; height: 15px; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(14, 165, 233, 0.5);"></div>`,
          iconSize: [15, 15],
          iconAnchor: [7, 7]
        });

        const popupContent = `
          <div class="p-3 space-y-2 min-w-[200px]">
            <p class="text-[10px] font-black text-primary uppercase tracking-widest">${event.category?.name || 'Community'}</p>
            <h4 class="font-black text-slate-800 text-sm leading-tight">${event.title}</h4>
            <div class="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span class="text-[10px] font-bold text-slate-400">${brgyName}</span>
              <button onclick="window.location.href='/events/${event.id}'" class="text-primary font-black text-[10px] uppercase tracking-widest">Details →</button>
            </div>
          </div>
        `;

        L.marker(jittered, { icon: customIcon }).addTo(map).bindPopup(popupContent);
      });
    }
  } catch (err) {
    console.error('Map Init Error:', err);
    loading.value = false;
  }
};

onMounted(() => {
  setTimeout(initMap, 500);
});
</script>

<template>
  <div class="map-view space-y-8 fade-in">
    <div class="space-y-1">
      <h2 class="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
        <i class="ph-fill ph-map-pin-line text-primary"></i> Interactive Map
      </h2>
      <p class="text-slate-500 font-medium">Visualize local events and tourism spots across Cordova.</p>
    </div>

    <div class="h-[650px] bg-white rounded-[2.5rem] shadow-2xl border-4 border-white overflow-hidden relative slide-up">
      <!-- Loading Overlay -->
      <div v-if="loading" class="absolute inset-0 z-50 bg-slate-50 flex flex-col items-center justify-center">
         <div class="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
         <p class="text-slate-400 font-bold uppercase tracking-widest text-xs">Initializing Satellite Data...</p>
      </div>

      <div ref="mapContainer" class="w-full h-full z-10"></div>
      
      <!-- Side legend overlay -->
      <div class="absolute bottom-8 left-8 z-[1000] bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-slate-100 max-w-xs md:block hidden">
         <h4 class="font-black text-slate-800 mb-4 flex items-center gap-2">
           <i class="ph-fill ph-info text-primary"></i> Navigation Legend
         </h4>
         <div class="space-y-4">
           <div class="flex items-center gap-3">
             <div class="w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/30"></div>
             <span class="text-xs font-bold text-slate-600">Active Community Events</span>
           </div>
           <p class="text-[11px] text-slate-400 leading-relaxed italic">Click on markers to see event details, directions, and real-time attendance.</p>
         </div>
      </div>
    </div>
  </div>
</template>

<style>
/* Leaflet attribution hide (optional, for cleaner look in presentation) */
.leaflet-control-attribution {
  font-size: 8px !important;
  opacity: 0.5;
}
.leaflet-container {
  font-family: 'Poppins', sans-serif !important;
}
.custom-div-icon {
  background: none !important;
  border: none !important;
}
</style>
