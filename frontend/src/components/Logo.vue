<script setup>
defineProps({
  light: {
    type: Boolean,
    default: false
  }
});
</script>

<template>
  <div class="flex items-center gap-3 select-none group transition-transform hover:scale-105 active:scale-95 duration-500">
    <!-- Philippine Flag Inspired Container -->
    <div class="w-10 h-10 rounded-full flex items-center justify-center shadow-lg shadow-primary/20 relative overflow-hidden transition-transform">
      <img src="../assets/images/logo.png" alt="CordovaConnect" class="w-7 h-7 object-contain relative z-10 rounded-full" />
      <div class="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5"></div>
    </div>
    <div class="flex flex-col">
       <span :class="['text-xl font-black tracking-tighter leading-none drop-shadow-sm transition-colors', light ? 'text-white group-hover:text-amber-200' : 'text-dark-blue group-hover:text-secondary']">
         Cordova<span :class="[light ? 'text-amber-200 group-hover:text-white' : 'text-secondary group-hover:text-primary']">Connect</span>
       </span>
       <span :class="['text-[8px] font-black uppercase tracking-[0.3em] -mt-0.5', light ? 'text-white/50' : 'text-slate-400']">LGU Digital Hub</span>
    </div>
  </div>
</template>
