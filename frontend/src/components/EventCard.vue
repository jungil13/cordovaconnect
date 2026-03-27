<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

const props = defineProps({
  event: Object
});

const formattedDate = computed(() => {
  if (!props.event.start_datetime) return '';
  const date = new Date(props.event.start_datetime);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
});

const imageUrl = computed(() => {
  if (!props.event.image_url) return null;
  if (props.event.image_url.startsWith('http')) return props.event.image_url;
  return `https://cordovaconnect-api.onrender.com${props.event.image_url}`;
});
</script>

<template>
  <div class="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full border border-slate-100 overflow-hidden slide-up">
    <!-- Image Container -->
    <div class="h-52 bg-slate-100 relative overflow-hidden">
      <img 
        v-if="imageUrl" 
        :src="imageUrl" 
        alt="Event Cover" 
        class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
      />
      <div v-else class="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50">
        <i class="ph-fill ph-image text-4xl opacity-20"></i>
        <span class="text-xs font-medium mt-2">No Image</span>
      </div>
      
      <!-- Category Badge -->
      <div class="absolute top-4 left-4 flex gap-2">
        <span class="bg-white/90 backdrop-blur-md text-primary text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-sm">
          {{ event.category?.name || 'General' }}
        </span>
        <a v-if="event.live_url" :href="event.live_url" target="_blank" class="bg-red-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 animate-pulse">
          <i class="ph-fill ph-broadcast"></i> Live
        </a>
      </div>
    </div>

    <!-- Content -->
    <div class="p-6 flex flex-col flex-grow">
      <div class="flex items-center gap-2 mb-3">
        <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <i class="ph-fill ph-calendar-blank text-primary text-sm"></i>
        </div>
        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {{ formattedDate }}
        </span>
      </div>

      <h4 class="text-xl font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-primary transition-colors">
        {{ event.title }}
      </h4>
      
      <p class="text-slate-500 line-clamp-2 mb-6 text-sm leading-relaxed flex-grow">
        {{ event.description }}
      </p>
      
      <div class="pt-5 border-t border-slate-50 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-1.5 text-slate-400">
            <i class="ph-bold ph-heart text-sm"></i>
            <span class="text-xs font-bold">{{ event.like_count || 0 }}</span>
          </div>
          <div class="flex items-center gap-1.5 text-slate-400">
            <i class="ph-bold ph-chat-circle text-sm"></i>
            <span class="text-xs font-bold">{{ event.comment_count || 0 }}</span>
          </div>
        </div>
        
        <RouterLink 
          :to="`/events/${event.id}`" 
          class="flex items-center gap-1 text-sm font-bold text-primary hover:gap-2 transition-all"
        >
          Details <i class="ph-bold ph-arrow-right"></i>
        </RouterLink>
      </div>
    </div>
  </div>
</template>
