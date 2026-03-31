<script setup>
import { ref, onMounted, computed, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api';

const toast = inject('toast');

const route = useRoute();
const router = useRouter();
const event = ref(null);
const loading = ref(true);

const comments = ref([]);
const newComment = ref('');
const isSubmittingComment = ref(false);
const currentUser = ref(JSON.parse(localStorage.getItem('user') || 'null'));

const getProfilePic = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}${url}`;
};

const shareEvent = async () => {
  const url = window.location.href;
  if (navigator.share) {
    try { await navigator.share({ title: event.value.title, text: event.value.description, url }); } 
    catch (e) { console.log('Share canceled', e); }
  } else {
    navigator.clipboard.writeText(url);
    toast.addToast('Link copied to clipboard!', 'success');
  }
};

const getDirections = () => {
  if (event.value.lat && event.value.lng) {
    window.open(`https://maps.google.com/?q=${event.value.lat},${event.value.lng}`, '_blank');
  } else {
    window.open(`https://maps.google.com/?q=${encodeURIComponent(event.value.location_name)}`, '_blank');
  }
};

const subscribeToEvent = () => {
  if (!currentUser.value) return router.push('/login');
  toast.addToast('Redirecting to GCash / PayMongo payment gateway...', 'info');
  setTimeout(() => {
    toast.addToast('Subscription Successful! You will receive updates.', 'success');
  }, 2500);
};

const fetchEventDetails = async () => {
  try {
    const res = await api.get(`/events/${route.params.id}`);
    event.value = res.data;
  } catch (error) {
    console.error('Failed to fetch event details', error);
  } finally {
    loading.value = false;
  }
};

const fetchComments = async () => {
  try {
    const res = await api.get(`/events/${route.params.id}/comments`);
    comments.value = res.data;
  } catch (err) { console.error(err); }
};

const toggleLike = async () => {
  try {
    if (event.value.has_liked) {
      await api.delete(`/events/${event.value.id}/like`);
      event.value.like_count--;
    } else {
      await api.post(`/events/${event.value.id}/like`);
      event.value.like_count++;
    }
    event.value.has_liked = !event.value.has_liked;
  } catch (err) { toast.addToast('Could not update like. Please try again.', 'error'); }
};

const postComment = async () => {
  if (!newComment.value.trim()) return;
  isSubmittingComment.value = true;
  try {
    await api.post(`/events/${event.value.id}/comments`, { content: newComment.value });
    newComment.value = '';
    fetchComments();
  } catch (err) { toast.addToast('Failed to post comment. Please try again.', 'error'); }
  finally { isSubmittingComment.value = false; }
};

onMounted(() => {
  fetchEventDetails();
  fetchComments();
});

const goBack = () => {
  router.back();
};

const imageUrl = computed(() => {
  if (!event.value?.image_url) return null;
  if (event.value.image_url.startsWith('http')) return event.value.image_url;
  return `https://cordovaconnect-api.onrender.com${event.value.image_url}`;
});
</script>

<template>
  <div class="event-details max-w-5xl mx-auto space-y-8 pb-20 fade-in">
    <!-- Breadcrumb / Back Navigation -->
    <nav class="flex items-center gap-4 text-sm font-bold uppercase tracking-widest text-slate-400">
      <button @click="goBack" class="flex items-center gap-2 hover:text-primary transition-colors btn-animate">
        <i class="ph-bold ph-caret-left"></i> Back to Explorations
      </button>
      <span class="opacity-30">/</span>
      <span class="text-primary">Event Details</span>
    </nav>
    
    <!-- Loading State -->
    <div v-if="loading" class="animate-pulse space-y-8 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
      <div class="h-96 md:h-[500px] bg-slate-100 rounded-3xl w-full mb-8"></div>
      <div class="space-y-4">
        <div class="h-10 bg-slate-100 w-1/2 rounded-xl"></div>
        <div class="h-6 bg-slate-100 w-full rounded-xl"></div>
        <div class="h-6 bg-slate-100 w-3/4 rounded-xl"></div>
      </div>
    </div>
    
    <!-- Empty State -->
    <div v-else-if="!event" class="text-center py-32 bg-white shadow-sm border border-slate-100 rounded-[2rem]">
      <div class="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <i class="ph-fill ph-file-search text-4xl text-red-400"></i>
      </div>
      <h2 class="text-2xl font-bold text-slate-800">Event Not Found</h2>
      <p class="text-slate-500 mt-2 mb-8">This event might have been removed or moderated.</p>
      <button @click="router.push('/')" class="bg-primary text-white px-8 py-3 rounded-xl font-bold btn-animate shadow-lg shadow-primary/20">
        Return Home
      </button>
    </div>

    <!-- Main Content -->
    <div v-else class="flex flex-col lg:flex-row gap-8 items-start">
      
      <!-- Primary Card -->
      <div class="flex-grow w-full bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden slide-up">
        <!-- Main Image -->
        <div class="h-[400px] md:h-[500px] relative bg-slate-100 group overflow-hidden">
          <img v-if="imageUrl" :src="imageUrl" class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
          <div v-else class="w-full h-full flex flex-col items-center justify-center text-slate-300">
            <i class="ph-fill ph-image text-6xl opacity-20"></i>
            <span class="mt-4 font-semibold uppercase tracking-widest text-sm text-slate-400">No Cover Available</span>
          </div>
          <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          
          <div class="absolute top-6 left-6 flex gap-3">
             <span class="bg-white/95 backdrop-blur-md text-primary px-5 py-2 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">
               {{ event.category?.name || 'General' }}
             </span>
             <span class="bg-white/95 backdrop-blur-md text-slate-800 px-5 py-2 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2">
               <i class="ph-fill ph-check-circle text-tropical-green"></i> Verified
             </span>
          </div>
        </div>
        
        <!-- Header & Info -->
        <div class="p-8 md:p-12 space-y-10">
          <div class="space-y-4">
            <h1 class="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {{ event.title }}
            </h1>
            <div class="flex flex-wrap gap-8 py-6 border-y border-slate-50">
               <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <i class="ph-fill ph-calendar text-2xl text-primary"></i>
                </div>
                <div>
                   <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Date & Time</p>
                   <p class="text-sm font-bold text-slate-700">{{ new Date(event.start_datetime).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) }}</p>
                </div>
              </div>

              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center">
                  <i class="ph-fill ph-map-pin text-2xl text-secondary"></i>
                </div>
                <div>
                   <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Location</p>
                   <p class="text-sm font-bold text-slate-700">{{ event.location_name }}</p>
                </div>
              </div>

              <div v-if="event.author" class="flex items-center gap-4">
                <div class="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center overflow-hidden">
                  <img v-if="event.author.profile_pic" :src="event.author.profile_pic" class="w-full h-full object-cover"/>
                  <i v-else class="ph-fill ph-user text-2xl text-orange-500"></i>
                </div>
                <div>
                   <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Organizer</p>
                   <p class="text-sm font-bold text-slate-700">{{ event.author.name }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Description Section -->
          <div class="space-y-6">
            <h3 class="text-xl font-bold text-slate-900 flex items-center gap-2">
              <i class="ph-bold ph-info text-ocean-blue"></i> Event Description
            </h3>
            <div class="prose prose-slate max-w-none">
              <p class="text-slate-600 text-lg leading-relaxed whitespace-pre-line">
                {{ event.description }}
              </p>
            </div>
          </div>

          <!-- Interaction Buttons -->
          <div class="pt-10 flex flex-wrap gap-4 border-t border-slate-50">
            <button 
              v-if="currentUser"
              @click="toggleLike"
              :class="['flex items-center gap-3 border font-bold px-8 py-4 rounded-2xl transition-all btn-animate shadow-sm', 
                event.has_liked ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-slate-200 hover:border-red-400 text-slate-700 hover:text-red-500']"
            >
              <i :class="[event.has_liked ? 'ph-fill' : 'ph-bold', 'ph-heart text-xl']"></i> 
              {{ event.has_liked ? 'Liked' : 'Interest' }}
              <span v-if="event.like_count > 0" class="ml-1 opacity-60">({{ event.like_count }})</span>
            </button>
            <button @click="shareEvent" class="flex items-center gap-3 bg-white border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-600 font-bold px-8 py-4 rounded-2xl transition-all btn-animate shadow-sm">
              <i class="ph-bold ph-share-network text-xl"></i> Share
            </button>
            <button @click="getDirections" class="bg-primary text-white font-black px-10 py-4 rounded-2xl transition shadow-lg shadow-primary/20 btn-animate grow md:grow-0">
               Get Directions <i class="ph-bold ph-navigation-arrow opacity-60 ml-2"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Side Information -->
      <aside class="w-full lg:w-[350px] space-y-8 slide-up" style="animation-delay: 0.4s">
        <!-- Community Activity -->
        <div class="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
           <h3 class="font-black text-slate-900 mb-6 flex items-center gap-3">
             <i class="ph-fill ph-users text-ocean-blue"></i> Community Activity
           </h3>
           <div class="space-y-4 text-sm font-medium text-slate-500">
              <p class="flex items-center justify-between">
                <span>Total Likes</span>
                <span class="text-slate-900 font-bold">{{ event.like_count }}</span>
              </p>
              <p class="flex items-center justify-between">
                <span>Comments</span>
                <span class="text-slate-900 font-bold">{{ comments.length }}</span>
              </p>
           </div>
        </div>

        <!-- Notification Subscription -->
        <div class="bg-slate-900 p-8 rounded-[2rem] text-white space-y-4">
           <h4 class="font-bold text-lg">Never miss an update</h4>
           <p class="text-slate-400 text-sm leading-relaxed">Subscribe to get notifications about schedule changes or new announcements for this event.</p>
           <button @click="subscribeToEvent" class="w-full bg-ocean-blue text-white py-4 rounded-xl font-bold btn-animate shadow-lg shadow-ocean-blue/30 flex items-center justify-center gap-2">
             <i class="ph-bold ph-credit-card"></i> Subscribe Now
           </button>
        </div>
      </aside>
    </div>
    
    <!-- Comments Section (Upgraded UI) -->
    <div v-if="!loading && event" class="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 md:p-12 slide-up" style="animation-delay: 0.6s">
      <div class="flex items-center justify-between mb-8">
        <h3 class="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <i class="ph-fill ph-chats text-ocean-blue"></i> Community Discussion
        </h3>
        <span class="text-xs font-bold bg-slate-100 text-slate-500 px-4 py-1.5 rounded-full">{{ comments.length }} Comments</span>
      </div>
      
      <!-- Login Prompt for Guests -->
      <div v-if="!currentUser" class="mb-12 bg-slate-50 p-8 rounded-3xl border border-slate-100 text-center space-y-4">
         <i class="ph-fill ph-lock-key text-4xl text-slate-300"></i>
         <p class="text-slate-600 font-medium max-w-sm mx-auto">Please sign in to join the discussion and connect with your community.</p>
         <button @click="$router.push('/login')" class="bg-primary text-white font-black px-8 py-3 rounded-xl transition shadow-lg shadow-primary/20 btn-animate">Sign In to Comment</button>
      </div>

      <!-- Post Comment -->
      <div v-else class="flex gap-6 mb-12">
        <div class="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
           <img v-if="getProfilePic(currentUser.profile_photo)" :src="getProfilePic(currentUser.profile_photo)" class="w-full h-full object-cover"/>
           <i v-else class="ph-fill ph-user text-2xl text-slate-400"></i>
        </div>
        <div class="flex-grow space-y-4">
           <textarea 
             v-model="newComment"
             placeholder="Join the discussion... Be polite and helpful." 
             class="w-full p-6 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-ocean-blue/5 focus:bg-white transition-all text-slate-700 min-h-[120px]"
           ></textarea>
           <div class="flex justify-end">
             <button 
              @click="postComment"
              :disabled="isSubmittingComment"
              class="bg-ocean-blue/10 text-ocean-blue font-bold px-8 py-3 rounded-xl hover:bg-ocean-blue hover:text-white transition-all btn-animate disabled:opacity-50"
             >
               {{ isSubmittingComment ? 'Posting...' : 'Post Comment' }}
             </button>
           </div>
        </div>
      </div>

      <!-- Comments List -->
      <div v-if="comments.length > 0" class="space-y-8">
        <div v-for="c in comments" :key="c.id" class="flex gap-6 slide-up">
           <div class="w-12 h-12 rounded-xl bg-slate-100 shrink-0 overflow-hidden">
              <img v-if="getProfilePic(c.author?.profile_photo)" :src="getProfilePic(c.author?.profile_photo)" class="w-full h-full object-cover"/>
              <i v-else class="ph-fill ph-user text-xl text-slate-400 m-3"></i>
           </div>
           <div class="space-y-1">
              <div class="flex items-center gap-3">
                 <span class="font-bold text-slate-900">{{ c.author?.name }}</span>
                 <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ new Date(c.createdAt).toLocaleDateString() }}</span>
              </div>
              <p class="text-slate-600 leading-relaxed">{{ c.content }}</p>
           </div>
        </div>
      </div>

      <div v-else class="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
        <i class="ph-bold ph-mask-sad text-4xl text-slate-300 mb-4 block"></i>
        <p class="text-slate-500 font-semibold italic">No comments yet. Be the first to start the conversation!</p>
      </div>
    </div>
  </div>
</template>
