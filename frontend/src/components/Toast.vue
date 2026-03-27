<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  message: String,
  type: { type: String, default: 'info' }, // 'info', 'success', 'warning', 'error'
  duration: { type: Number, default: 3000 }
});

const emit = defineEmits(['close']);
const isVisible = ref(true);

onMounted(() => {
  setTimeout(() => {
    isVisible.value = false;
    setTimeout(() => emit('close'), 300);
  }, props.duration);
});
</script>

<template>
  <Transition name="toast">
    <div v-if="isVisible" :class="[
      'fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md transition-all duration-300',
      type === 'success' ? 'bg-emerald-500/90 border-emerald-400 text-white' :
      type === 'error' ? 'bg-red-500/90 border-red-400 text-white' :
      type === 'warning' ? 'bg-amber-500/90 border-amber-400 text-white' :
      'bg-primary/90 border-primary/40 text-white'
    ]">
      <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
        <i :class="[
          'ph-bold text-lg',
          type === 'success' ? 'ph-check' :
          type === 'error' ? 'ph-x' :
          type === 'warning' ? 'ph-warning' :
          'ph-info'
        ]"></i>
      </div>
      <p class="font-bold text-sm tracking-tight">{{ message }}</p>
      <button @click="isVisible = false" class="ml-4 opacity-50 hover:opacity-100 transition-opacity">
        <i class="ph-bold ph-x"></i>
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.toast-enter-from {
  transform: translateY(20px) scale(0.9);
  opacity: 0;
}
.toast-leave-to {
  transform: translateX(100px);
  opacity: 0;
}
</style>
