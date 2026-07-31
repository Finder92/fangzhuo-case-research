<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { Bell, ArrowDown, ArrowLeft, UserFilled, House, ChatDotRound, Notebook, User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import AppSidebar from './components/AppSidebar.vue'
import ResearchList from './components/ResearchList.vue'
import ResearchEditor from './components/ResearchEditor.vue'
import ResearchDetail from './components/ResearchDetail.vue'
import ObservationList from './components/ObservationList.vue'
import ActivityAdvice from './components/ActivityAdvice.vue'
import LessonPlanWorkspace from './components/LessonPlanWorkspace.vue'
import GrowthArchiveDetail from './components/GrowthArchiveDetail.vue'
import { researchItems } from './data/research'
import { activityAdvice } from './data/observations'

const page = ref('list')
const role = ref('管理视角')
const selectedItem = ref(researchItems[0])
const items = ref(researchItems.map((item) => ({ ...item })))
const editingDraft = ref(null)
const selectedObservations = ref([])
const generatedAdvice = ref({ ...activityAdvice })
const syncedArchives = ref([])

const profile = computed(() => role.value === '管理视角'
  ? { name: '小方桌管理员', description: '管理视角' }
  : { name: '林芳老师', description: '小五班' })
const activeKey = computed(() => {
  if (['observations', 'activity-advice'].includes(page.value)) return 'observation-records'
  if (page.value === 'lesson-workspace') return 'my-lessons'
  return 'case-research'
})
const mobileTitle = computed(() => ({
  observations: '观察记录',
  'activity-advice': '活动建议',
  'lesson-workspace': '我的教案',
  'growth-archive': '成长档案',
}[page.value] || '案例教研'))
const scrollPageTop = () => nextTick(() => window.scrollTo({ top: 0 }))

watch(role, (currentRole) => {
  if (currentRole === '教师视角' && (page.value === 'editor' || (page.value === 'detail' && selectedItem.value?.status === '草稿'))) {
    page.value = 'list'
    scrollPageTop()
  }
})

const openItem = (item) => { selectedItem.value = item; page.value = 'detail'; scrollPageTop() }
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
    items.value[index] = { ...items.value[index], ...form, title: form.title.trim() || '未命名教研主题', status: '草稿', stage: 1, progress: 25, updated: '刚刚' }
  } else {
    items.value.unshift({ id: Date.now(), ...form, title: form.title.trim() || '未命名教研主题', status: '草稿', stage: 1, participants: form.teachers.length, topics: 0, replies: 0, progress: 25, updated: '刚刚' })
  }
  editingDraft.value = null
  page.value = 'list'
  scrollPageTop()
}
const publishCreated = (form) => {
  const publishedItem = { ...researchItems[0], ...form, id: Date.now(), title: form.title.trim(), status: '研讨中', stage: 2, participants: form.teachers.length, topics: form.preTopics.length, replies: 0, progress: 45, updated: '刚刚' }
  items.value.unshift(publishedItem)
  selectedItem.value = publishedItem
  page.value = 'detail'
  scrollPageTop()
}
const updateResearchStatus = ({ id, status, stage, progress }) => {
  const index = items.value.findIndex((item) => item.id === id)
  if (index < 0) return
  items.value[index] = { ...items.value[index], status, stage, progress, updated: '刚刚' }
  selectedItem.value = items.value[index]
}
const navigate = (key) => {
  if (key === 'observation-records') page.value = 'observations'
  else if (key === 'case-research') page.value = 'list'
  else if (key === 'my-lessons') { generatedAdvice.value = { ...activityAdvice }; page.value = 'lesson-workspace' }
  else ElMessage.info('此导航项为演示占位')
  scrollPageTop()
}
const generateAdvice = (records) => {
  const validRecords = Array.isArray(records)
    ? records.filter((record, index, list) => record?.id && record?.child && list.findIndex((item) => item?.id === record.id) === index)
    : []
  if (!validRecords.length) return ElMessage.warning('请先选择观察记录')
  selectedObservations.value = validRecords
  generatedAdvice.value = { ...activityAdvice }
  page.value = 'activity-advice'
  scrollPageTop()
}
const useInLesson = (advice) => {
  generatedAdvice.value = { ...advice }
  page.value = 'lesson-workspace'
  scrollPageTop()
}
const openSyncedArchives = (archives) => {
  syncedArchives.value = archives
  page.value = 'growth-archive'
  scrollPageTop()
}
const mobileBack = () => {
  if (page.value === 'activity-advice') page.value = 'observations'
  else if (page.value === 'lesson-workspace') page.value = selectedObservations.value.length ? 'activity-advice' : 'observations'
  else if (page.value === 'growth-archive') page.value = 'observations'
  else if (page.value !== 'list' && page.value !== 'observations') page.value = 'list'
  else return ElMessage.info('返回手机端功能首页（演示）')
  scrollPageTop()
}
</script>

<template>
  <div class="app-shell">
    <AppSidebar :active-key="activeKey" @navigate="navigate" />
    <div class="workspace">
      <header class="topbar">
        <div class="mobile-brand"><button aria-label="返回" @click="mobileBack"><el-icon><ArrowLeft /></el-icon></button><strong>{{ mobileTitle }}</strong></div>
        <div class="welcome"><span class="collapse-lines">☰</span><span>欢迎进入</span><strong>北京市怀柔区第三幼儿园</strong></div>
        <div class="top-actions">
          <div class="role-switch" aria-label="切换使用视角"><button :class="{ active: role === '管理视角' }" @click="role = '管理视角'">管理视角</button><button :class="{ active: role === '教师视角' }" @click="role = '教师视角'">教师视角</button></div>
          <el-button circle :icon="Bell" aria-label="通知" />
          <div class="profile"><span class="profile-avatar"><el-icon><UserFilled /></el-icon></span><div><strong>{{ profile.name }}</strong><small>{{ profile.description }}</small></div><el-icon><ArrowDown /></el-icon></div>
        </div>
      </header>
      <main class="content">
        <ResearchList v-if="page === 'list'" :items="items" :role="role" @create="createDraft" @edit="editDraft" @open="openItem" @update-role="role = $event" />
        <ResearchEditor v-else-if="page === 'editor'" :draft="editingDraft" @back="page = 'list'" @draft-saved="saveDraft" @saved="publishCreated" />
        <ResearchDetail v-else-if="page === 'detail'" :item="selectedItem" :role="role" @back="page = 'list'" @status-change="updateResearchStatus" />
        <ObservationList v-else-if="page === 'observations'" @generate-advice="generateAdvice" @story-synced="openSyncedArchives" />
        <ActivityAdvice v-else-if="page === 'activity-advice'" :records="selectedObservations" @back="page = 'observations'" @use-in-lesson="useInLesson" />
        <LessonPlanWorkspace v-else-if="page === 'lesson-workspace'" :advice="generatedAdvice" @back="page = selectedObservations.length ? 'activity-advice' : 'observations'" />
        <GrowthArchiveDetail v-else :archives="syncedArchives" @back="page = 'observations'" />
      </main>
      <nav class="mobile-bottom-nav" aria-label="手机端主导航">
        <button><el-icon><House /></el-icon><span>首页</span></button>
        <button class="active"><el-icon><Notebook /></el-icon><span>{{ activeKey === 'case-research' ? '案例教研' : '观察记录' }}</span></button>
        <button><el-icon><ChatDotRound /></el-icon><span>消息</span></button>
        <button><el-icon><User /></el-icon><span>我的</span></button>
      </nav>
    </div>
  </div>
</template>
