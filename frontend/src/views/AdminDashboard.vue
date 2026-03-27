<script setup>
import { ref, onMounted, inject } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

const toast = inject('toast');
const selectedUser = ref(null);
const showUserModal = ref(false);
const showConfirmModal = ref(false);
const confirmAction = ref(null);

const router = useRouter();
const activeTab = ref('events');
const isEditingUser = ref(false);
const editUserForm = ref({ name: '', birthdate: '', address: '', emergency_contact: '', id_number: '', role: '', barangay_id: '' });
const tabs = [
  { id: 'events', label: 'Moderation', icon: 'ph-fill ph-check-square' },
  { id: 'announcements', label: 'Alerts', icon: 'ph-fill ph-lightning' },
  { id: 'users', label: 'Directory', icon: 'ph-fill ph-users' },
  { id: 'officials', label: 'Officials', icon: 'ph-fill ph-identification-badge' },
  { id: 'analytics', label: 'Reports', icon: 'ph-fill ph-chart-line-up' },
  { id: 'system', label: 'Settings', icon: 'ph-fill ph-gear-six' }
];

const stats = ref([
  { label: 'Pending Events', value: '0', icon: 'ph-fill ph-calendar-star', color: 'text-primary', bg: 'bg-primary/10' },
  { label: 'Active Users', value: '0', icon: 'ph-fill ph-users-three', color: 'text-secondary', bg: 'bg-secondary/10' },
]);

const pendingEvents = ref([]);
const users = ref([]);
const officials = ref([]);
const barangays = ref([]);
const loading = ref({ events: true, users: true, officials: true, barangays: true });

const fetchBarangays = async () => {
  loading.value.barangays = true;
  try {
    const res = await api.get('/barangays');
    barangays.value = res.data;
  } catch (err) { console.error(err); }
  finally { loading.value.barangays = false; }
};

const fetchPending = async () => {
  loading.value.events = true;
  try {
    const res = await api.get('/events?status=pending');
    pendingEvents.value = res.data;
    stats.value[0].value = res.data.length.toString();
  } catch (err) { console.error(err); }
  finally { loading.value.events = false; }
};

const fetchUsers = async () => {
  loading.value.users = true;
  try {
    const res = await api.get('/users');
    users.value = res.data;
    stats.value[1].value = res.data.length.toString();
  } catch (err) { console.error(err); }
  finally { loading.value.users = false; }
};

const fetchOfficials = async () => {
  loading.value.officials = true;
  try {
    const res = await api.get('/barangay-officials');
    officials.value = res.data;
  } catch (err) { console.error(err); }
  finally { loading.value.officials = false; }
};

const toggleBan = async (id) => {
  try {
    await api.patch(`/users/${id}/ban`);
    toast.addToast('User status updated', 'success');
    fetchUsers();
  } catch (err) { toast.addToast('Failed to update ban status', 'error'); }
};

const generateID = async (id) => {
  try {
    await api.post(`/users/${id}/generate-id`);
    toast.addToast('Digital ID generated successfully!', 'success');
    fetchUsers();
  } catch (err) { toast.addToast('ID generation failed', 'error'); }
};

const approveEvent = async (id) => {
  try {
     await api.patch(`/events/${id}/approve`, { status: 'approved' });
     toast.addToast('Event approved!', 'success');
     fetchPending();
  } catch (err) { toast.addToast('Approval failed', 'error'); }
};

const rejectEvent = async (id) => {
  try {
     await api.delete(`/events/${id}`);
     toast.addToast('Event rejected and removed.', 'info');
     fetchPending();
  } catch (err) { toast.addToast('Rejection failed', 'error'); }
};

const openConfirm = (action) => {
  confirmAction.value = action;
  showConfirmModal.value = true;
};

const executeConfirm = async () => {
  if (confirmAction.value) {
    await confirmAction.value();
    showConfirmModal.value = false;
    confirmAction.value = null;
  }
};

const deleteOfficial = async (id) => {
  openConfirm(async () => {
    try {
      await api.delete(`/barangay-officials/${id}`);
      toast.addToast('Official removed', 'success');
      fetchOfficials();
    } catch (err) { toast.addToast('Deletion failed', 'error'); }
  });
};

onMounted(() => {
  fetchPending();
  fetchUsers();
  fetchOfficials();
  fetchBarangays();
});

const alertForm = ref({ title: '', content: '', type: 'Emergency', urgency: 'High', barangay_id: '' });
const showAlertForm = ref(false);

const officialForm = ref({ name: '', position: '', term_start: '', barangay_id: '' });
const showOfficialForm = ref(false);

const postAlert = async () => {
  try {
     await api.post('/announcements', alertForm.value);
     toast.addToast('Mayor Alert dispatched successfully!', 'success');
     showAlertForm.value = false;
     alertForm.value = { title: '', content: '', type: 'Emergency', urgency: 'High', barangay_id: '' };
  } catch (err) {
     toast.addToast('Failed to send Mayor alert', 'error');
  }
};

const addOfficial = async () => {
  try {
    await api.post('/barangay-officials', officialForm.value);
    toast.addToast('Official added successfully!', 'success');
    showOfficialForm.value = false;
    officialForm.value = { name: '', position: '', term_start: '', barangay_id: '' };
    fetchOfficials();
  } catch (err) {
    toast.addToast('Failed to add official', 'error');
  }
};

const viewUser = (user) => {
  selectedUser.value = user;
  isEditingUser.value = false;
  editUserForm.value = {
    name: user.name,
    birthdate: user.birthdate || '',
    address: user.address || '',
    emergency_contact: user.emergency_contact || '',
    id_number: user.id_number || '',
    role: user.role,
    barangay_id: user.barangay_id || ''
  };
  showUserModal.value = true;
};

const saveUserEdit = async () => {
  try {
    await api.put(`/users/${selectedUser.value.id}`, editUserForm.value);
    toast.addToast('User record updated', 'success');
    isEditingUser.value = false;
    showUserModal.value = false;
    fetchUsers();
  } catch (err) {
    toast.addToast('Failed to update user', 'error');
  }
};

const newBrgy = ref('');
const newCat = ref('');
const categories = ref([]);

const fetchCategories = async () => {
  try {
    const res = await api.get('/categories');
    categories.value = res.data;
  } catch (err) { console.error(err); }
};

const addBrgy = async () => {
  if (!newBrgy.value) return;
  try {
    await api.post('/barangays', { name: newBrgy.value });
    toast.addToast('Barangay added!', 'success');
    newBrgy.value = '';
    fetchBarangays();
  } catch (err) { toast.addToast('Failed to add barangay', 'error'); }
};

const addCategory = async () => {
  if (!newCat.value) return;
  try {
    await api.post('/categories', { name: newCat.value });
    toast.addToast('Category added!', 'success');
    newCat.value = '';
    fetchCategories();
  } catch (err) { toast.addToast('Failed to add category', 'error'); }
};

onMounted(() => {
  fetchPending();
  fetchUsers();
  fetchOfficials();
  fetchBarangays();
  fetchCategories();
});
</script>

<template>
  <div class="admin-dashboard space-y-10 fade-in pb-20">
    <!-- Page Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-slate-100">
      <div class="space-y-1">
        <h2 class="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <i class="ph-fill ph-crown text-primary"></i> Platform Control
        </h2>
        <p class="text-slate-500 font-medium tracking-wide uppercase text-xs">Administrative Dashboard & Analytics</p>
      </div>
      
      <button @click="router.push('/create-event')" class="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-slate-900/20 hover:scale-105 transition-all flex items-center gap-3 group">
        <i class="ph-bold ph-plus-circle text-lg group-hover:rotate-90 transition-transform"></i> 
        Post Community Content
      </button>
    </div>

    <!-- Quick Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="s in stats" :key="s.label" class="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 slide-up group hover:shadow-xl transition-all duration-500">
         <div class="flex items-center gap-4">
            <div :class="[s.bg, 'w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110']">
              <i :class="[s.icon, s.color, 'text-2xl']"></i>
            </div>
            <div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">{{ s.label }}</p>
              <p class="text-2xl font-black text-slate-900 leading-none mt-1">{{ s.value }}</p>
            </div>
         </div>
      </div>
    </div>

    <!-- Tabbed Interface -->
    <div class="space-y-6">
      <div class="flex gap-4 p-2 bg-slate-100/50 rounded-[2rem] w-max max-w-full overflow-x-auto hide-scrollbar border border-slate-100">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="['flex items-center gap-2 px-8 py-3.5 font-bold text-sm rounded-2xl transition-all btn-animate whitespace-nowrap', 
            activeTab === tab.id ? 'bg-primary text-white shadow-lg border border-primary/10' : 'text-slate-500 hover:text-primary']"
        >
          <i :class="tab.icon"></i> {{ tab.label }}
        </button>
      </div>

      <!-- Content Area -->
      <div class="bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-slate-100 min-h-[500px] slide-up relative">
        
        <!-- Loading Overlay -->
        <div v-if="Object.values(loading).some(v => v)" class="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-[3rem]">
           <div class="w-16 h-16 border-4 border-slate-100 border-t-primary rounded-full animate-spin"></div>
           <p class="mt-4 text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Synchronizing Data...</p>
        </div>

        <!-- Moderation Tab -->
        <div v-if="activeTab === 'events'" class="space-y-8">
          <div class="flex items-center justify-between">
            <h3 class="text-2xl font-black text-slate-900 flex items-center gap-3">
               <i class="ph-fill ph-check-square text-primary"></i> Content Review
            </h3>
            <span class="text-xs font-bold text-slate-500 bg-slate-50 px-4 py-2 rounded-full">{{ pendingEvents.length }} Pending Items</span>
          </div>

          <div class="overflow-x-auto -mx-4 px-4" v-if="pendingEvents.length > 0">
            <table class="w-full min-w-[640px] text-left border-separate border-spacing-y-4">
              <thead>
                <tr class="text-xs font-black text-slate-400 uppercase tracking-widest px-4">
                  <th class="pb-4 pl-6">Event Title</th>
                  <th class="pb-4">Author</th>
                  <th class="pb-4">Date</th>
                  <th class="pb-4">Category</th>
                  <th class="pb-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in pendingEvents" :key="item.id" class="group bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                  <td class="py-6 pl-6 rounded-l-3xl">
                    <div class="flex items-center gap-3">
                       <span class="font-bold text-slate-800">{{ item.title }}</span>
                       <span v-if="item.live_url" class="bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full animate-pulse border border-red-400">LIVE</span>
                    </div>
                  </td>
                  <td class="text-sm font-medium text-slate-600">{{ item.user?.name || 'Unknown' }}</td>
                  <td class="text-sm font-bold text-slate-400">
                    <span class="flex items-center gap-2">
                       <i class="ph-bold ph-calendar"></i> {{ new Date(item.start_datetime).toLocaleDateString() }}
                    </span>
                  </td>
                  <td>
                    <span class="bg-white border border-slate-200 px-3 py-1 rounded-lg text-xs font-bold text-slate-500 uppercase tracking-wide">
                      {{ item.category?.name || 'General' }}
                    </span>
                  </td>
                  <td class="text-right pr-6 rounded-r-3xl">
                    <div class="flex justify-end gap-2">
                       <button @click="approveEvent(item.id)" class="w-10 h-10 rounded-xl bg-white border border-slate-200 text-emerald-500 hover:bg-emerald-500 hover:text-white transition shadow-sm btn-animate">
                         <i class="ph-bold ph-check"></i>
                       </button>
                       <button @click="rejectEvent(item.id)" class="w-10 h-10 rounded-xl bg-white border border-slate-200 text-red-500 hover:bg-red-500 hover:text-white transition shadow-sm btn-animate">
                         <i class="ph-bold ph-trash"></i>
                       </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="text-center py-20 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
             <i class="ph-bold ph-ghost text-4xl text-slate-300 mb-2 block"></i>
             <p class="text-slate-400 font-bold">No pending events found.</p>
          </div>
        </div>

        <!-- Alert Dispatcher Tab -->
        <div v-if="activeTab === 'announcements'" class="space-y-8">
           <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-red-50 p-8 rounded-[2rem] border border-red-100">
              <div class="space-y-2">
                 <h4 class="text-xl font-black text-secondary flex items-center gap-2">
                   <i class="ph-fill ph-lightning"></i> Executive Alert Dispatch
                 </h4>
                 <p class="text-red-900/60 font-medium text-sm">Post town-wide or barangay-specific emergency updates.</p>
              </div>
               <button @click="showAlertForm = !showAlertForm" :class="['font-black px-10 py-4 rounded-2xl shadow-xl transition-all btn-animate shrink-0', showAlertForm ? 'bg-slate-800 text-white shadow-slate-200' : 'bg-secondary text-white shadow-secondary/20']">
                {{ showAlertForm ? 'Close Dispatcher' : 'Dispatch New Alert' }}
              </button>
           </div>
           
           <div v-if="showAlertForm" class="bg-white border-2 border-red-100 p-8 rounded-[3rem] shadow-2xl space-y-6 slide-up">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div class="space-y-1">
                    <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Global/Local Title</label>
                    <input v-model="alertForm.title" placeholder="e.g. Town-wide Water Interruption" class="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-red-100 transition-all font-bold"/>
                 </div>
                 <div class="space-y-1">
                    <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Target Scope</label>
                    <select v-model="alertForm.barangay_id" class="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-red-100 transition-all font-bold appearance-none">
                       <option value="">All Barangays (Global)</option>
                       <option v-for="b in barangays" :key="b.id" :value="b.id">{{ b.name }}</option>
                    </select>
                 </div>
              </div>
              <div class="space-y-1">
                 <label class="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Executive Message</label>
                 <textarea v-model="alertForm.content" placeholder="Enter the official announcement..." class="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-red-100 transition-all font-medium min-h-[150px]"></textarea>
              </div>
               <button @click="postAlert" class="w-full bg-secondary text-white py-5 rounded-2xl font-black shadow-xl shadow-secondary/20 hover:bg-dark-blue transition btn-animate">
                 Authorize and Broadcast Town-wide
              </button>
           </div>

           <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-white border border-slate-100 p-8 rounded-[2rem] shadow-sm space-y-4">
                  <div class="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <i class="ph-fill ph-bell"></i>
                  </div>
                  <h5 class="font-bold text-slate-800">System Broadcast</h5>
                  <p class="text-sm text-slate-500">Normal announcements for barangay updates or general news.</p>
              </div>
              <div class="bg-white border border-slate-100 p-8 rounded-[2rem] shadow-sm space-y-4">
                 <div class="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500">
                   <i class="ph-fill ph-thermometer-hot"></i>
                 </div>
                 <h5 class="font-bold text-slate-800">Weather/Utility</h5>
                 <p class="text-sm text-slate-500">Service interruptions, weather warnings, or maintenance.</p>
              </div>
           </div>
        </div>

        <!-- Officials Tab -->
        <div v-if="activeTab === 'officials'" class="space-y-8">
           <div class="flex items-center justify-between">
              <h3 class="text-2xl font-black text-slate-900 flex items-center gap-3">
                 <i class="ph-fill ph-identification-badge text-primary"></i> Local Government Units
              </h3>
              <button @click="showOfficialForm = !showOfficialForm" class="bg-primary text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2">
                 <i :class="showOfficialForm ? 'ph-bold ph-x' : 'ph-bold ph-plus'"></i>
                 {{ showOfficialForm ? 'Cancel' : 'Add Official' }}
              </button>
           </div>

           <div v-if="showOfficialForm" class="bg-slate-50/50 p-8 rounded-[2rem] border-2 border-slate-100 space-y-6 slide-up">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <div class="space-y-1">
                    <label class="text-[10px] font-black text-slate-400 uppercase ml-1">Name</label>
                    <input v-model="officialForm.name" class="w-full px-5 py-3 rounded-xl bg-white border border-slate-200 font-bold" />
                 </div>
                 <div class="space-y-1">
                    <label class="text-[10px] font-black text-slate-400 uppercase ml-1">Position</label>
                    <input v-model="officialForm.position" placeholder="e.g. Captain" class="w-full px-5 py-3 rounded-xl bg-white border border-slate-200 font-bold" />
                 </div>
                 <div class="space-y-1">
                    <label class="text-[10px] font-black text-slate-400 uppercase ml-1">Barangay</label>
                    <select v-model="officialForm.barangay_id" class="w-full px-5 py-3 rounded-xl bg-white border border-slate-200 font-bold">
                       <option v-for="b in barangays" :key="b.id" :value="b.id">{{ b.name }}</option>
                    </select>
                 </div>
                 <div class="space-y-1">
                    <label class="text-[10px] font-black text-slate-400 uppercase ml-1">Term Start</label>
                    <input v-model="officialForm.term_start" type="date" class="w-full px-5 py-3 rounded-xl bg-white border border-slate-200 font-bold" />
                 </div>
              </div>
              <button @click="addOfficial" class="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs">Save Official Record</button>
           </div>

           <div class="overflow-x-auto">
              <table class="w-full text-left border-separate border-spacing-y-4">
                 <thead>
                    <tr class="text-xs font-black text-slate-400 uppercase px-4">
                       <th class="pb-4 pl-6">Official Name</th>
                       <th class="pb-4">Position</th>
                       <th class="pb-4">Barangay</th>
                       <th class="pb-4">Term Start</th>
                       <th class="pb-4 text-right pr-6">Management</th>
                    </tr>
                 </thead>
                 <tbody>
                    <tr v-for="off in officials" :key="off.id" class="group bg-slate-50/50 hover:bg-white hover:shadow-xl transition-all duration-300">
                       <td class="py-6 pl-6 rounded-l-3xl">
                          <span class="font-black text-slate-800">{{ off.name }}</span>
                       </td>
                       <td>
                          <span class="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-500">{{ off.position }}</span>
                       </td>
                       <td class="font-bold text-slate-400">{{ off.barangay?.name }}</td>
                       <td class="text-sm font-medium text-slate-500">{{ off.term_start }}</td>
                       <td class="text-right pr-6 rounded-r-3xl">
                          <button @click="deleteOfficial(off.id)" class="w-10 h-10 rounded-xl bg-white border border-slate-200 text-red-500 hover:bg-red-500 hover:text-white transition shadow-sm btn-animate">
                             <i class="ph-bold ph-trash"></i>
                          </button>
                       </td>
                    </tr>
                 </tbody>
              </table>
           </div>
        </div>

        <!-- Directory Tab -->
        <div v-if="activeTab === 'users'" class="space-y-8">
          <div class="flex items-center justify-between">
            <h3 class="text-2xl font-black text-slate-900 flex items-center gap-3">
               <i class="ph-fill ph-users text-primary"></i> Citizen Directory
            </h3>
            <div class="flex gap-4">
              <button @click="router.push('/register')" class="px-6 py-2 rounded-xl bg-primary text-white font-bold text-xs shadow-lg shadow-primary/20 hover:scale-105 transition btn-animate flex items-center gap-2">
                 <i class="ph-bold ph-plus"></i> Add Resident
              </button>
              <span class="text-xs font-bold text-slate-500 bg-slate-50 px-4 py-2 rounded-full">{{ users.length }} Residents</span>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-separate border-spacing-y-4">
              <thead>
                <tr class="text-xs font-black text-slate-400 uppercase tracking-widest px-4">
                  <th class="pb-4 pl-6">Name</th>
                  <th class="pb-4">Role</th>
                  <th class="pb-4">Barangay</th>
                  <th class="pb-4">Status</th>
                  <th class="pb-4 text-right pr-6">Management</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in users" :key="user.id" class="group bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                  <td class="py-6 pl-6 rounded-l-3xl">
                    <div class="flex items-center gap-3">
                      <img :src="user.profile_photo ? `https://cordovaconnect-api.onrender.com${user.profile_photo}` : 'https://ui-avatars.com/api/?name=' + user.name" class="w-10 h-10 rounded-xl object-cover border border-slate-200" />
                      <span class="font-bold text-slate-800">{{ user.name }}</span>
                    </div>
                  </td>
                  <td>
                    <span :class="['px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide', 
                      user.role === 'SuperAdmin' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500']">
                      {{ user.role }}
                    </span>
                  </td>
                  <td class="text-sm font-bold text-slate-400">{{ user.barangay?.name || 'N/A' }}</td>
                  <td>
                    <span :class="['px-3 py-1 rounded-lg text-xs font-bold', user.is_banned ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600']">
                      {{ user.is_banned ? 'Banned' : 'Active' }}
                    </span>
                  </td>
                  <td class="text-right pr-6 rounded-r-3xl">
                    <div class="flex justify-end gap-2 text-[10px]">
                        <button @click="viewUser(user)" class="w-10 h-10 rounded-xl bg-white border border-slate-200 text-primary hover:bg-primary hover:text-white transition shadow-sm btn-animate">
                          <i class="ph-bold ph-eye"></i>
                        </button>
                        <button @click="generateID(user.id)" v-if="user.digital_id_status !== 'Generated'" class="px-4 py-2 rounded-xl bg-white border border-slate-200 text-secondary hover:bg-secondary hover:text-white transition shadow-sm font-bold btn-animate">
                          Generate ID
                        </button>
                        <button @click="toggleBan(user.id)" :class="['w-10 h-10 rounded-xl bg-white border border-slate-200 transition shadow-sm btn-animate', user.is_banned ? 'text-green-500 hover:bg-green-500 hover:text-white' : 'text-red-500 hover:bg-red-500 hover:text-white']">
                          <i :class="['ph-bold', user.is_banned ? 'ph-user-plus' : 'ph-user-minus']"></i>
                        </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- System Settings Tab -->
        <div v-if="activeTab === 'system'" class="space-y-10">
           <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div class="space-y-6">
                 <h4 class="font-black text-slate-900 flex items-center gap-2 uppercase tracking-widest text-sm text-primary">
                    <i class="ph-fill ph-map-pin"></i> Manage Barangays
                 </h4>
                 <div class="flex gap-2">
                    <input v-model="newBrgy" placeholder="New Barangay Name" class="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold outline-none"/>
                    <button @click="addBrgy" class="px-6 rounded-xl bg-primary text-white font-black uppercase text-[10px]">Add</button>
                 </div>
                 <div class="grid grid-cols-2 gap-2">
                    <div v-for="b in barangays" :key="b.id" class="px-4 py-2 bg-slate-50 rounded-lg text-xs font-bold text-slate-500">
                       {{ b.name }}
                    </div>
                 </div>
              </div>

              <div class="space-y-6">
                 <h4 class="font-black text-slate-900 flex items-center gap-2 uppercase tracking-widest text-sm text-secondary">
                    <i class="ph-fill ph-tag"></i> Content Categories
                 </h4>
                 <div class="flex gap-2">
                    <input v-model="newCat" placeholder="New Category" class="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold outline-none"/>
                    <button @click="addCategory" class="px-6 rounded-xl bg-secondary text-white font-black uppercase text-[10px]">Add</button>
                 </div>
                 <div class="flex flex-wrap gap-2">
                    <div v-for="c in categories" :key="c.id" class="px-4 py-2 bg-slate-50 rounded-lg text-xs font-bold text-slate-500 flex items-center gap-2">
                       <div class="w-1.5 h-1.5 rounded-full bg-secondary"></div>
                       {{ c.name }}
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <!-- Analytics Placeholder -->
        <div v-if="activeTab === 'analytics'" class="flex flex-col items-center justify-center py-20 text-center space-y-6">
            <div class="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
               <i class="ph-fill ph-chart-pie text-5xl"></i>
            </div>
            <div class="space-y-2">
              <h4 class="text-xl font-bold text-slate-800">Analytics Dashboard</h4>
              <p class="text-slate-500 max-w-sm">Detailed reports on platform engagement coming soon.</p>
            </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
     <div v-if="showUserModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-md" @click="showUserModal = false"></div>
        <div class="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden slide-up max-h-[90vh] overflow-y-auto hide-scrollbar">
           <div class="h-32 bg-primary flex items-center justify-end px-8">
              <button @click="isEditingUser = !isEditingUser" class="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest backdrop-blur-md transition-all">
                {{ isEditingUser ? 'Cancel' : 'Edit Profile' }}
              </button>
           </div>
           <div class="px-8 pb-10">
              <div class="flex items-end justify-between -mt-16 mb-8">
                 <img :src="selectedUser?.profile_photo ? `https://cordovaconnect-api.onrender.com${selectedUser.profile_photo}` : 'https://ui-avatars.com/api/?name=' + selectedUser?.name" class="w-32 h-32 rounded-[2rem] object-cover border-8 border-white shadow-xl" />
                 <div class="flex gap-2">
                    <button v-if="isEditingUser" @click="saveUserEdit" class="bg-emerald-500 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-500/20">Save All</button>
                    <button @click="showUserModal = false" class="bg-slate-100 p-2 rounded-xl text-slate-400 hover:text-slate-600"><i class="ph-bold ph-x"></i></button>
                 </div>
              </div>

              <!-- View Mode -->
              <div v-if="!isEditingUser" class="space-y-6">
                 <div class="space-y-1">
                    <h3 class="text-3xl font-black text-slate-900">{{ selectedUser?.name }}</h3>
                    <p class="text-primary font-black uppercase tracking-widest text-[10px]">{{ selectedUser?.role }} • {{ selectedUser?.barangay?.name || 'Town Hall' }}</p>
                 </div>
                 <div class="grid grid-cols-2 gap-4">
                    <div class="p-6 bg-slate-50 rounded-3xl space-y-2">
                       <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital ID Status</p>
                       <p class="font-black text-slate-800">{{ selectedUser?.digital_id_status || 'Not Generated' }}</p>
                    </div>
                    <div class="p-6 bg-slate-50 rounded-3xl space-y-2">
                       <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Status</p>
                       <p :class="['font-black', selectedUser?.is_banned ? 'text-red-500' : 'text-emerald-500']">{{ selectedUser?.is_banned ? 'Restricted' : 'Verified Active' }}</p>
                    </div>
                    
                    <div class="p-6 bg-slate-50 rounded-3xl space-y-2">
                       <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Personal Info</p>
                       <p class="font-black text-slate-800 text-sm">Age: {{ selectedUser?.age || 'N/A' }}</p>
                       <p class="text-[10px] text-slate-400 font-bold uppercase">{{ selectedUser?.birthdate || 'No Date' }}</p>
                    </div>
                    <div class="p-6 bg-slate-50 rounded-3xl space-y-2">
                       <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID Number</p>
                       <p class="font-black text-slate-800">{{ selectedUser?.id_number || 'Unlinked' }}</p>
                    </div>
                    <div class="p-6 bg-slate-50 rounded-3xl space-y-2 col-span-2">
                       <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Emergency Contact</p>
                       <p class="font-black text-slate-800">{{ selectedUser?.emergency_contact || 'None Provided' }}</p>
                    </div>
                    <div class="p-6 bg-slate-50 rounded-3xl space-y-2 col-span-2">
                       <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Address</p>
                       <p class="font-black text-slate-800 text-sm leading-relaxed">{{ selectedUser?.address || 'No address data on record' }}</p>
                    </div>
                 </div>
              </div>

              <!-- Edit Mode -->
              <div v-else class="space-y-6 slide-up">
                 <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1 col-span-2">
                       <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                       <input v-model="editUserForm.name" class="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold" />
                    </div>
                     <div class="space-y-1">
                       <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</label>
                       <select v-model="editUserForm.role" class="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold">
                          <option value="Resident">Resident</option>
                          <option value="BarangayAdmin">Barangay Admin</option>
                          <option value="SuperAdmin">Super Admin</option>
                          <option value="Visitor">Visitor</option>
                       </select>
                    </div>
                    <div class="space-y-1">
                       <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Barangay</label>
                       <select v-model="editUserForm.barangay_id" class="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold">
                          <option value="">None</option>
                          <option v-for="b in barangays" :key="b.id" :value="b.id">{{ b.name }}</option>
                       </select>
                    </div>
                    <div class="space-y-1">
                       <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Birthdate</label>
                       <input v-model="editUserForm.birthdate" type="date" class="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold" />
                    </div>
                    <div class="space-y-1">
                       <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID Number</label>
                       <input v-model="editUserForm.id_number" class="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold" />
                    </div>
                    <div class="space-y-1 col-span-2">
                       <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Emergency Contact</label>
                       <input v-model="editUserForm.emergency_contact" class="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold" />
                    </div>
                    <div class="space-y-1 col-span-2">
                       <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Address</label>
                       <textarea v-model="editUserForm.address" rows="3" class="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold resize-none"></textarea>
                    </div>
                 </div>
              </div>

              <div v-if="!isEditingUser && selectedUser?.digital_id_photo" class="mt-8 space-y-3">
                 <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Digital ID Card</p>
                 <img :src="`https://cordovaconnect-api.onrender.com${selectedUser.digital_id_photo}`" class="w-full rounded-2xl border-2 border-slate-100" />
              </div>
           </div>
        </div>
     </div>

     <div v-if="showConfirmModal" class="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="showConfirmModal = false"></div>
        <div class="bg-white p-8 rounded-[2.5rem] shadow-2xl relative z-10 w-full max-w-sm text-center space-y-6 slide-up">
           <div class="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <i class="ph-fill ph-warning text-4xl"></i>
           </div>
           <div class="space-y-2 text-center">
              <h4 class="text-xl font-black text-slate-900">Are you sure?</h4>
              <p class="text-sm text-slate-500 font-medium">This action cannot be undone.</p>
           </div>
           <div class="flex gap-4">
              <button @click="showConfirmModal = false" class="flex-1 py-4 rounded-2xl bg-slate-100 font-black text-slate-400 uppercase text-xs">Cancel</button>
              <button @click="executeConfirm" class="flex-1 py-4 rounded-2xl bg-red-500 font-black text-white uppercase text-xs">Confirm</button>
           </div>
        </div>
     </div>
  </div>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
