<script setup>
import { ref } from 'vue'

const groups = [
  { label: '观察与反思', children: ['观察记录', '我的案例'] },
  { label: '成长档案', children: ['成长册', '成长轶事'] },
  { label: '园本教研', children: ['已提交案例', '典型案例', '案例教研', '案例诊断'] },
  { label: '备课本', children: ['周计划', '我的教案'] },
  { label: '其他功能', children: ['设置', '统计'] },
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
            :key="item"
            :class="{ active: item === '案例教研' }"
          >
            <span class="nav-child-line"></span>
            <span>{{ item }}</span>
          </button>
        </div>
      </div>
    </nav>
  </aside>
</template>
