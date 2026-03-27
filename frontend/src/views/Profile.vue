<script setup>
import { ref, onMounted, inject } from 'vue';
import api from '../services/api';
import Breadcrumbs from '../components/Breadcrumbs.vue';

const toast = inject('toast');
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'));
const barangay = ref(null);
const loading = ref(true);
const isEditing = ref(false);
const selectedFile = ref(null);
const editData = ref({
  name: '',
  birthdate: '',
  address: '',
  emergency_contact: '',
  id_number: ''
});

const fetchProfile = async () => {
  try {
    const res = await api.get('/auth/me');
    user.value = res.data;
    localStorage.setItem('user', JSON.stringify(res.data));
    
    // Sync edit data
    editData.value = {
      name: user.value.name,
      birthdate: user.value.birthdate || '',
      address: user.value.address || '',
      emergency_contact: user.value.emergency_contact || '',
      id_number: user.value.id_number || ''
    };

    if (user.value.barangay_id) {
       const bRes = await api.get(`/barangays/${user.value.barangay_id}`);
       barangay.value = bRes.data;
    }
  } catch (err) {
    console.error('Failed to load profile details');
  } finally {
    loading.value = false;
  }
};

const handleFileChange = (e) => {
  selectedFile.value = e.target.files[0];
};

const saveProfile = async () => {
  try {
    const formData = new FormData();
    formData.append('name', editData.value.name);
    formData.append('birthdate', editData.value.birthdate);
    formData.append('address', editData.value.address);
    formData.append('emergency_contact', editData.value.emergency_contact);
    formData.append('id_number', editData.value.id_number);
    
    if (selectedFile.value) {
      formData.append('profile_photo', selectedFile.value);
    }

    const res = await api.put('/users/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    user.value = res.data;
    localStorage.setItem('user', JSON.stringify(res.data));
    isEditing.value = false;
    toast.addToast('Profile updated successfully!', 'success');
    fetchProfile();
  } catch (err) {
    toast.addToast('Error saving profile', 'error');
  }
};

const requestID = async () => {
  try {
    await api.post('/users/request-id');
    toast.addToast('Digital ID request submitted to the Mayor!', 'success');
    fetchProfile();
  } catch (err) {
    toast.addToast('Failed to request ID', 'error');
  }
};

const downloadID = () => {
  window.print();
};

onMounted(fetchProfile);
</script>

<template>
  <div class="profile-view max-w-5xl mx-auto space-y-8 pb-20 fade-in px-4 print:space-y-0 print:pb-0 print:px-0">
    <Breadcrumbs class="print:hidden" />

    <!-- Profile Header -->
    <div class="relative rounded-[3rem] overflow-hidden shadow-2xl bg-slate-900 min-h-[400px] md:h-80 flex items-center justify-center print:hidden">
      <img src="https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&q=80&w=2000" class="absolute inset-0 w-full h-full object-cover opacity-60"/>
      <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent"></div>
      
      <!-- Content Overlay -->
      <div class="relative z-10 w-full px-8 pt-12 pb-8 flex flex-col items-center gap-6 text-center">
        <!-- Avatar Wrapper -->
        <div class="relative group">
          <div class="w-32 h-32 md:w-36 md:h-36 rounded-[2.5rem] bg-white p-2 shadow-2xl">
            <div class="w-full h-full rounded-[2rem] bg-primary flex items-center justify-center text-white text-5xl font-black overflow-hidden relative">
               <img v-if="user.profile_photo" :src="`https://cordovaconnect-api.onrender.com${user.profile_photo}`" class="w-full h-full object-cover" />
               <span v-else>{{ user.name?.charAt(0) }}</span>
               
               <div v-if="isEditing" @click="$refs.fileInput.click()" class="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <i class="ph-bold ph-camera text-2xl"></i>
                  <span class="text-[8px] uppercase font-black mt-1">Change</span>
               </div>
            </div>
          </div>
          <input type="file" ref="fileInput" @change="handleFileChange" class="hidden" accept="image/*" />
        </div>

        <div class="space-y-2">
           <h2 class="text-3xl md:text-4xl font-black text-white tracking-tight">{{ user.name }}</h2>
           <div class="flex flex-wrap items-center justify-center gap-3">
             <span class="px-4 py-1.5 rounded-full bg-secondary text-white font-black uppercase tracking-widest text-[9px] flex items-center gap-2">
               <i class="ph-fill ph-crown" v-if="user.role === 'SuperAdmin'"></i>
               <i class="ph-fill ph-shield-check" v-else></i>
               {{ user.role }}
             </span>
             <span class="px-4 py-1.5 rounded-full bg-white/10 text-white/80 font-bold uppercase tracking-widest text-[9px]">
               Member Since March 2026
             </span>
           </div>
        </div>

        <div class="flex flex-wrap items-center justify-center gap-4">
          <button @click="isEditing = !isEditing" class="px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2 shadow-xl"
            :class="isEditing ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-white text-slate-900 hover:bg-slate-100 shadow-white/10'">
            <i :class="isEditing ? 'ph-bold ph-x' : 'ph-bold ph-note-pencil'"></i>
            {{ isEditing ? 'Cancel Edit' : 'Edit Profile' }}
          </button>
          
          <button v-if="user.role === 'SuperAdmin'" @click="$router.push('/admin')" class="px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-amber-400 text-slate-900 hover:bg-amber-500 transition-all flex items-center gap-2 shadow-xl shadow-amber-400/20">
            <i class="ph-bold ph-layout"></i>
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start print:block print:m-0">
       <div class="lg:col-span-2 space-y-8 print:hidden">
          <!-- Basic Info Section -->
          <section class="bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-slate-100 space-y-8 slide-up">
             <div class="flex items-center justify-between">
                <h3 class="text-2xl font-black text-slate-900 flex items-center gap-4">
                  <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <i class="ph-bold ph-user-circle text-primary"></i>
                  </div>
                  Account Information
                </h3>
                <button v-if="isEditing" @click="saveProfile" class="bg-emerald-500 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform flex items-center gap-2">
                  <i class="ph-bold ph-check"></i> Save Changes
                </button>
             </div>

             <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <!-- Name (Edit) -->
                <div class="space-y-3">
                   <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</p>
                   <input v-if="isEditing" v-model="editData.name" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-primary outline-none font-bold text-slate-800 transition-all" />
                   <p v-else class="font-black text-slate-800 text-lg px-1">{{ user.name }}</p>
                </div>

                <!-- Email (Read Only) -->
                <div class="space-y-3">
                   <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</p>
                   <p class="font-black text-slate-500 text-lg px-1">{{ user.email }}</p>
                </div>

                <!-- Birthdate -->
                <div class="space-y-3">
                   <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date of Birth</p>
                   <input v-if="isEditing" type="date" v-model="editData.birthdate" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-primary outline-none font-bold text-slate-800 transition-all" />
                   <div v-else class="flex items-center gap-4">
                      <p class="font-black text-slate-800 text-lg px-1">{{ user.birthdate || 'Not Set' }}</p>
                      <span v-if="user.age" class="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black rounded-lg uppercase">Age: {{ user.age }}</span>
                   </div>
                </div>

                <!-- ID Number -->
                <div class="space-y-3">
                   <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">National/Voter ID</p>
                   <input v-if="isEditing" v-model="editData.id_number" placeholder="Enter ID number" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-primary outline-none font-bold text-slate-800 transition-all" />
                   <p v-else class="font-black text-slate-800 text-lg px-1">{{ user.id_number || 'Pending Entry' }}</p>
                </div>

                <!-- Emergency Contact -->
                <div class="space-y-3 md:col-span-2">
                   <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Emergency Contact Number</p>
                   <input v-if="isEditing" v-model="editData.emergency_contact" placeholder="+63 9XX XXX XXXX" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-primary outline-none font-bold text-slate-800 transition-all" />
                   <p v-else class="font-black text-slate-800 text-lg px-1">{{ user.emergency_contact || 'None Listed' }}</p>
                </div>

                <!-- Address -->
                <div class="space-y-3 md:col-span-2">
                   <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Residential Address</p>
                   <textarea v-if="isEditing" v-model="editData.address" rows="3" class="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-primary outline-none font-bold text-slate-800 transition-all resize-none"></textarea>
                   <p v-else class="font-black text-slate-800 text-lg px-1 leading-relaxed">{{ user.address || 'Address information not provided' }}</p>
                </div>
             </div>
          </section>

          <!-- Contribution Stats -->
          <section class="bg-slate-950 p-10 rounded-[3rem] text-white flex items-center justify-between slide-up relative overflow-hidden group shadow-2xl" style="animation-delay: 0.2s">
             <div class="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <div class="relative z-10 space-y-3">
                <span class="px-4 py-1.5 rounded-full bg-white/10 text-secondary text-[10px] font-black uppercase tracking-widest border border-white/5">Verified Citizen</span>
                <h4 class="text-2xl font-black tracking-tight">Community Impact</h4>
                <p class="text-sm text-slate-400 font-medium">Contribute to Cordova by reporting issues or organizing events.</p>
             </div>
             <div class="relative z-10 flex flex-col items-center">
                <div class="w-20 h-20 rounded-full border-4 border-slate-800 flex items-center justify-center bg-slate-900 group-hover:scale-110 transition-transform">
                   <i class="ph-fill ph-hands-clapping text-4xl text-secondary"></i>
                </div>
             </div>
          </section>
       </div>

        <!-- Sidebar: Digital ID -->
        <aside class="space-y-8 slide-up lg:sticky lg:top-8 no-print-wrapper" style="animation-delay: 0.3s">
           <div class="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 text-center space-y-8 print:!bg-transparent print:!border-none print:!shadow-none print:!p-0">
              <div class="space-y-1 print:hidden">
                <h4 class="font-black text-slate-900 text-xl">Official Digital ID</h4>
                <p class="text-slate-400 text-xs font-bold uppercase tracking-widest">Municipality of Cordova, Cebu</p>
              </div>
              
               <!-- ID Card Print Wrapper -->
               <div id="digital-id-container" class="flex flex-col items-center gap-6">
                 <!-- Both faces container -->
                 <div class="flex flex-col md:flex-row items-center gap-6 flex-wrap justify-center">
                   <!-- FRONT FACE -->
                   <div class="id-card-face w-[280px] aspect-[2.125/3.375] relative overflow-hidden flex flex-col rounded-3xl shrink-0" 
                      :class="user.digital_id_status === 'Generated' ? 'bg-gradient-to-br from-[#0f204b] via-[#1a1c3d] to-[#ad0b2a] text-white shadow-2xl' : 'bg-slate-100 border-2 border-dashed border-slate-300'">
                   
                   <!-- Header -->
                   <div class="flex items-center gap-3 px-5 pt-6 pb-4 border-b border-white/10 shrink-0">
                      <img src="/src/assets/images/logo.png" class="w-10 h-10 object-contain" />
                      <div class="text-left font-black tracking-widest leading-tight">
                         <p class="text-[7.5px] text-white/80 uppercase">Republic of the Philippines</p>
                         <p class="text-[10px] text-white uppercase mt-0.5">Municipality of<br/>Cordova, Cebu</p>
                      </div>
                   </div>

                   <!-- Main Content -->
                   <div class="flex px-5 py-6 gap-4 shrink-0">
                      <!-- Photo -->
                      <div class="w-[84px] h-[100px] rounded-2xl overflow-hidden border border-white/20 shrink-0 bg-slate-800 shadow-xl">
                         <img :src="user.profile_photo ? `https://cordovaconnect-api.onrender.com${user.profile_photo}` : '/src/assets/images/default-avatar.png'" class="w-full h-full object-cover" />
                      </div>
                      
                      <!-- Info -->
                      <div class="flex-1 space-y-3 pt-1 text-left">
                         <div>
                            <p class="text-[6.5px] font-black uppercase text-white/50 tracking-widest leading-none mb-1">Full Name</p>
                            <p class="text-[13px] font-black leading-tight tracking-tight">{{ user.name }}</p>
                         </div>
                         <div>
                            <p class="text-[6.5px] font-black uppercase text-white/50 tracking-widest leading-none mb-1">Barangay</p>
                            <p class="text-[11px] font-black text-[#ff3344] uppercase tracking-wide">{{ barangay?.name || 'N/A' }}</p>
                         </div>
                         <div>
                            <p class="text-[6.5px] font-black uppercase text-white/50 tracking-widest leading-none mb-1">Date of Birth</p>
                            <p class="text-[10px] font-bold tracking-wide">{{ user.birthdate || 'N/A' }}</p>
                         </div>
                         <div v-if="user.id_number">
                            <p class="text-[6.5px] font-black uppercase text-white/50 tracking-widest leading-none mb-1">ID Number</p>
                            <p class="text-[10px] font-black text-amber-400 font-mono tracking-wider">{{ user.id_number }}</p>
                         </div>
                      </div>
                   </div>

                   <!-- Address Bar -->
                   <div class="px-5 text-center mt-auto pb-4 shrink-0">
                      <p class="text-[6.5px] font-black uppercase text-white/50 tracking-widest mb-1.5">Address</p>
                      <p class="text-[10px] font-bold text-white/90 leading-snug px-2">{{ user.address || 'Not specified' }}</p>
                   </div>

                   <!-- Footer Bar -->
                   <div class="bg-black/20 px-5 pt-3 pb-4 flex items-center justify-between shrink-0">
                      <i class="ph-bold ph-squares-four text-white/30 text-2xl"></i>
                      <div class="text-right flex items-center gap-2">
                         <div class="text-left">
                            <p class="text-[6px] font-black uppercase text-white/50 tracking-widest leading-none mb-0.5">Status</p>
                            <p class="text-[10px] font-black text-emerald-400 tracking-wider">
                               {{ user.digital_id_status === 'Generated' ? '✓ VERIFIED' : user.digital_id_status === 'Pending' ? '⏳ PENDING' : 'NOT ISSUED' }}
                            </p>
                         </div>
                         <div class="w-8 h-8 rounded-full bg-red-600/40 flex items-center justify-center ml-2 border border-red-500/30">
                           <i class="ph-bold ph-check text-red-900 text-lg"></i>
                         </div>
                      </div>
                   </div>
                 </div>

                 <!-- BACK FACE -->
                 <div v-if="user.digital_id_status === 'Generated'" class="id-card-face w-[280px] aspect-[2.125/3.375] relative overflow-hidden flex flex-col rounded-3xl shrink-0 bg-gradient-to-br from-[#0f204b] via-[#1a1c3d] to-[#ad0b2a] text-white shadow-2xl">
                    <div class="px-6 py-8 flex-1 flex flex-col items-center">
                       <div class="text-center mb-6 w-full">
                         <p class="text-[11px] font-black uppercase tracking-[0.2em] text-[#ff3344] border-b border-white/10 pb-3">In Case of Emergency</p>
                         <p class="text-[7.5px] font-bold text-white/50 mt-3 uppercase tracking-widest">Please notify</p>
                       </div>
                       
                       <div class="w-full space-y-5 mb-auto text-left">
                          <div>
                             <p class="text-[6.5px] font-black uppercase text-white/40 tracking-widest mb-1">Contact Name</p>
                             <p class="text-[12px] font-bold border-b border-white/20 pb-1.5">{{ user.emergency_contact_name || 'Relative / Guardian' }}</p>
                          </div>
                          <div class="grid grid-cols-2 gap-4">
                             <div>
                                <p class="text-[6.5px] font-black uppercase text-white/40 tracking-widest mb-1">Contact No.</p>
                                <p class="text-[11px] font-bold border-b border-white/20 pb-1.5">{{ user.emergency_contact_number || '09XX-XXX-XXXX' }}</p>
                             </div>
                             <div>
                                <p class="text-[6.5px] font-black uppercase text-white/40 tracking-widest mb-1">Blood Type</p>
                                <p class="text-[11px] font-black text-[#ff3344] border-b border-white/20 pb-1.5">{{ user.blood_type || 'Unknown' }}</p>
                             </div>
                          </div>
                       </div>
                       
                       <div class="mt-8 bg-white p-2.5 rounded-2xl shadow-xl shrink-0">
                          <!-- Working QR Code using qrserver API -->
                          <img :src="`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=CordovaConnect_ID_${user.id_number || user.id}`" class="w-20 h-20" crossorigin="anonymous" />
                       </div>
                       <p class="text-[6px] text-center text-white/30 font-bold uppercase tracking-widest leading-relaxed mt-6 px-2">
                         This ID is non-transferable & remains property of the Municipality of Cordova. If found, return to the nearest Barangay Hall.
                       </p>
                    </div>
                 </div>
                 
                 </div> <!-- End faces container -->
                 
                 <p class="hidden print:block text-slate-500 font-bold uppercase tracking-widest text-[9px] mt-4 text-center w-full">
                    Note: This is a local digital ID issued by the Municipality of Cordova.
                 </p>
               </div>

               <!-- Actions -->
               <div class="space-y-4 print:hidden">
                  <button 
                    v-if="user.digital_id_status === 'None' || !user.digital_id_status" 
                    @click="requestID"
                    class="w-full bg-primary text-white py-5 rounded-2xl font-black shadow-2xl shadow-primary/20 hover:scale-[1.02] transform transition-all active:scale-95 btn-animate flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                  >
                    <i class="ph-bold ph-plus-circle"></i> Request Digital ID
                  </button>
                  <button 
                    v-if="user.digital_id_status === 'Generated'" 
                    @click="downloadID"
                    class="w-full bg-slate-900 text-white py-5 rounded-2xl font-black shadow-2xl shadow-slate-900/20 hover:scale-[1.02] transform transition-all active:scale-95 btn-animate flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                  >
                    <i class="ph-bold ph-printer"></i> Print / Save ID
                  </button>
                  
                  <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p class="text-[10px] font-bold text-slate-400 uppercase leading-relaxed tracking-wider">
                      {{ user.digital_id_status === 'Generated' ? 'This ID is verified by CordovaConnect' : 'Verify your residency to unlock local benefits' }}
                    </p>
                  </div>
               </div>
            </div>
         </aside>
    </div>
  </div>
</template>

<style scoped>
.fade-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-up { animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
.btn-animate { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }

@media print {
  @page { margin: 0; size: auto; }
  
  html, body {
    margin: 0 !important; padding: 0 !important;
    width: 100vw !important; height: 100vh !important;
    overflow: hidden !important; /* Force 1 page */
  }

  /* Hide absolutely everything first */
  body > * { display: none !important; }

  /* Ensure the App shell and nav are gone */
  header, footer, nav { display: none !important; }

  /* Re-display #digital-id-container elements directly to root for clean printing */
  #digital-id-container {
    display: flex !important;
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    flex-direction: column !important; /* Stack horizontally via inner div, text below */
    align-items: center !important;
    justify-content: center !important;
    gap: 0 !important;
    background: transparent !important;
    z-index: 9999 !important;
    margin: 0 !important;
  }

  .id-card-face {
    display: flex !important;
    flex-direction: column !important;
    width: 2.125in !important; /* CR80 actual width */
    height: 3.375in !important; /* CR80 actual height */
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    box-shadow: none !important;
    border: 1px dashed #ccc !important; /* cut lines */
    page-break-inside: avoid;
    margin: 0 !important;
  }

  /* Scale inner elements of the card proportionally via zoom or transform if needed, 
     but our w-[280px] vs 2.125in (~204px) means we need to slightly scale it. */
  .id-card-face > * {
    /* To fit elements inside 2.125in, we apply a zoom */
    zoom: 0.72;
  }
}
</style>

