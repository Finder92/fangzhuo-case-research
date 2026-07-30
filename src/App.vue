<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import {
  Bell, ArrowDown, UserFilled, House, ChatDotRound, Notebook, User,
} from '@element-plus/icons-vue'
import AppSidebar from './components/AppSidebar.vue'
import ResearchList from './components/ResearchList.vue'
import ResearchEditor from './components/ResearchEditor.vue'
import ResearchDetail from './components/ResearchDetail.vue'
import { researchItems } from './data/research'

const page = ref('list')
const role = ref('管理视角')
const selectedItem = ref(researchItems[0])
const items = ref(researchItems.map((item) => ({ ...item })))
const editingDraft = ref(null)
const profile = computed(() => (
  role.value === '管理视角'
    ? { name: '小方桌管理员', description: '管理视角' }
    : { name: '林芳老师', description: '小五班' }
))

const scrollPageTop = () => nextTick(() => window.scrollTo({ top: 0 }))

watch(role, (currentRole) => {
  if (
    currentRole === '教师视角'
    && (page.value === 'editor' || (page.value === 'detail' && selectedItem.value?.status === '草稿'))
  ) {
    page.value = 'list'
    scrollPageTop()
  }
})

const openItem = (item) => {
  selectedItem.value = item
  page.value = 'detail'
  scrollPageTop()
}

const createDraft = () => {
  if (role.value !== '管理视角') return
  editingDraft.value = null
  page.value = 'editor'
  scrollPageTop()
}

const editDraft = (item) => {
  if (role.value !== '管理视角') return
  editingDraft.value = item
  page.value = 'editor'
  scrollPageTop()
}

const saveDraft = (form) => {
  if (editingDraft.value) {
    const index = items.value.findIndex((item) => item.id === editingDraft.value.id)
    items.value[index] = {
      ...items.value[index],
      ...form,
      title: form.title.trim() || '未命名教研主题',
      status: '草稿',
      stage: 1,
      progress: 25,
      updated: '刚刚',
    }
  } else {
    items.value.unshift({
      id: Date.now(),
      ...form,
      title: form.title.trim() || '未命名教研主题',
      status: '草稿',
      stage: 1,
      participants: form.teachers.length,
      topics: 0,
      replies: 0,
      progress: 25,
      updated: '刚刚',
    })
  }
  editingDraft.value = null
  page.value = 'list'
  scrollPageTop()
}

const publishCreated = () => {
  selectedItem.value = { ...researchItems[0], title: '如何支持幼儿在沙水游戏中持续、深入地解决工程问题？' }
  page.value = 'detail'
  scrollPageTop()
}

const updateResearchStatus = ({ id, status, stage, progress }) => {
  const index = items.value.findIndex((item) => item.id === id)
  if (index < 0) return
  items.value[index] = { ...items.value[index], status, stage, progress, updated: '刚刚' }
  selectedItem.value = items.value[index]
}
</script>

<template>
  <div class="app-shell">
    <AppSidebar />
    <div class="workspace">
      <header class="topbar">
        <div class="mobile-brand">
          <span class="brand-mark"><i></i><i></i><i></i><i></i></span>
          <strong>方桌云</strong>
        </div>
        <div class="welcome"><span class="collapse-lines">☰</span><span>欢迎进入</span><strong>北京市怀柔区第三幼儿园</strong></div>
        <div class="top-actions">
          <div class="role-switch" aria-label="切换使用视角">
            <button :class="{ active: role === '管理视角' }" @click="role = '管理视角'">管理视角</button>
            <button :class="{ active: role === '教师视角' }" @click="role = '教师视角'">教师视角</button>
          </div>
          <el-button circle :icon="Bell" aria-label="通知" />
          <div class="profile"><span class="profile-avatar"><el-icon><UserFilled /></el-icon></span><div><strong>{{ profile.name }}</strong><small>{{ profile.description }}</small></div><el-icon><ArrowDown /></el-icon></div>
        </div>
      </header>
      <main class="content">
        <ResearchList v-if="page === 'list'" :items="items" :role="role" @create="createDraft" @edit="editDraft" @open="openItem" />
        <ResearchEditor v-else-if="page === 'editor'" :draft="editingDraft" @back="page = 'list'" @draft-saved="saveDraft" @saved="publishCreated" />
        <ResearchDetail v-else :item="selectedItem" :role="role" @back="page = 'list'" @status-change="updateResearchStatus" />
      </main>
      <nav class="mobile-bottom-nav" aria-label="手机端主导航">
        <button><el-icon><House /></el-icon><span>首页</span></button>
        <button class="active"><el-icon><Notebook /></el-icon><span>案例教研</span></button>
        <button><el-icon><ChatDotRound /></el-icon><span>消息</span></button>
        <button><el-icon><User /></el-icon><span>我的</span></button>
      </nav>
    </div>
  </div>
</template>
