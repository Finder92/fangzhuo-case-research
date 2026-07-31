<script setup>
import { computed } from 'vue'
import { Check } from '@element-plus/icons-vue'
import { stages } from '../data/research'

const props = defineProps({
  current: { type: Number, default: 1 },
  compact: { type: Boolean, default: false },
  completed: { type: Boolean, default: false },
  items: { type: Array, default: null },
})

const displayStages = computed(() => props.items || stages)
</script>

<template>
  <div class="stage-track" :class="{ compact }">
    <div
      v-for="(stage, index) in displayStages"
      :key="stage"
      class="stage-node"
      :class="{ done: completed || index + 1 < current, current: !completed && index + 1 === current }"
    >
      <span class="stage-line" v-if="index"></span>
      <span class="stage-dot">
        <el-icon v-if="completed || index + 1 < current"><Check /></el-icon>
        <template v-else>{{ index + 1 }}</template>
      </span>
      <span class="stage-label">{{ stage }}</span>
    </div>
  </div>
</template>
