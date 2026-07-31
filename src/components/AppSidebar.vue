<script setup>
import { ref } from 'vue'

defineProps({
  activeKey: { type: String, default: 'case-research' },
})
const emit = defineEmits(['navigate'])

const groups = [
  { label: '观察与反思', children: [{ label: '观察记录', key: 'observation-records' }, { label: '我的案例', key: 'my-cases' }] },
  { label: '成长档案', children: [{ label: '成长册', key: 'growth-book' }, { label: '成长轶事', key: 'growth-stories' }] },
  { label: '园本教研', children: [{ label: '已提交案例', key: 'submitted-cases' }, { label: '典型案例', key: 'typical-cases' }, { label: '案例教研', key: 'case-research' }, { label: '案例诊断', key: 'case-diagnosis' }] },
  { label: '备课本', children: [{ label: '周计划', key: 'weekly-plan' }, { label: '我的教案', key: 'my-lessons' }] },
  { label: '其他功能', children: [{ label: '设置', key: 'settings' }, { label: '统计', key: 'statistics' }] },
]

const openedGroups = ref(new Set(groups.map((group) => group.label)))

const toggleGroup = (label) => {
  const next = new Set(openedGroups.value)
  next.has(label) ? next.delete(label) : next.add(label)
  openedGroups.value = next
}
</script>

<template>
  <aside class="sidebar">
    <div class="brand">
      <span class="brand-mark"><i></i><i></i><i></i><i></i></span>
      <strong>方桌云</strong>
    </div>

    <nav class="side-nav" aria-label="系统导航">
      <div class="nav-caption">系统导航</div>
      <div v-for="group in groups" :key="group.label" class="nav-group">
        <button
          class="nav-main"
          :class="{ open: openedGroups.has(group.label), featured: group.label === '观察与反思' }"
          :aria-expanded="openedGroups.has(group.label)"
          @click="toggleGroup(group.label)"
        >
          <span class="nav-group-icon"><i></i></span>
          <span class="nav-group-label">{{ group.label }}</span>
          <span class="nav-arrow">⌄</span>
        </button>

        <div v-show="openedGroups.has(group.label)" class="nav-children">
          <button
            v-for="item in group.children"
            :key="item.key"
            :class="{ active: activeKey === item.key }"
            @click="emit('navigate', item.key)"
          >
            <span class="nav-child-line"></span>
            <span>{{ item.label }}</span>
          </button>
        </div>
      </div>
    </nav>
  </aside>
</template>
