<script setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

onMounted(() => {
  const token = route.query.token;
  const user = route.query.user;

  if (token && user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', decodeURIComponent(user));
    localStorage.setItem('justLoggedIn', 'true');
    window.location.href = '/';
  } else {
    router.replace('/login');
  }
});
</script>

<template>
  <div class="flex items-center justify-center min-h-[60vh]">
    <div class="text-center space-y-4">
      <div class="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
      <p class="text-slate-500 font-bold uppercase tracking-widest text-xs">Authenticating with Google...</p>
    </div>
  </div>
</template>
