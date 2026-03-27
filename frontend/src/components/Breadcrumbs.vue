<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const breadcrumbs = computed(() => {
  const pathArray = route.path.split('/').filter((p) => p);
  const crumbs = pathArray.map((path, index) => {
    const to = '/' + pathArray.slice(0, index + 1).join('/');
    return {
      name: path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' '),
      to: to
    };
  });
  return [{ name: 'Home', to: '/' }, ...crumbs];
});
</script>

<template>
  <nav class="flex mb-6" aria-label="Breadcrumb">
    <ol class="inline-flex items-center space-x-1 md:space-x-3">
      <li v-for="(crumb, index) in breadcrumbs" :key="index" class="inline-flex items-center">
        <div class="flex items-center">
          <i v-if="index > 0" class="ph-bold ph-caret-right text-slate-400 text-xs mx-2"></i>
          <RouterLink 
            :to="crumb.to" 
            class="text-[10px] font-black uppercase tracking-widest transition-colors hover:text-primary"
            :class="index === breadcrumbs.length - 1 ? 'text-slate-900 pointer-events-none' : 'text-slate-400'"
          >
            {{ crumb.name }}
          </RouterLink>
        </div>
      </li>
    </ol>
  </nav>
</template>
