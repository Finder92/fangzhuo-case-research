<script setup>
import { computed, ref } from 'vue'
import {
  Search, Plus, Download, MoreFilled, ChatDotRound, User, Clock,
  ArrowRight, DocumentChecked, EditPen, VideoPlay, CircleCheck
} from '@element-plus/icons-vue'
import StageTrack from './StageTrack.vue'

const props = defineProps({
  items: { type: Array, required: true },
  role: { type: String, default: '管理视角' },
})
const emit = defineEmits(['create', 'open', 'edit'])
const search = ref('')
const status = ref('全部状态')
const semester = ref('2025-2026学年度下学期')

const visibleItems = computed(() => (
  props.role === '管理视角'
    ? props.items
    : props.items.filter((item) => item.status !== '草稿')
))

const filteredItems = computed(() => visibleItems.value.filter((item) => {
  const keywordMatch = !search.value || item.title.includes(search.value) || item.host.includes(search.value)
  const statusMatch = status.value === '全部状态' || item.status === status.value
  return keywordMatch && statusMatch
}))

const allSummaries = [
  { label: '草稿主题', value: 6, note: '仅创建人和管理者可见', icon: EditPen, tone: 'blue' },
  { label: '正在研讨', value: 3, note: '今天新增 12 条回复', icon: ChatDotRound, tone: 'teal' },
  { label: '待召开 / 现场记录', value: 5, note: '本周有 2 场教研', icon: VideoPlay, tone: 'amber' },
  { label: '本学期已完成', value: 24, note: '已形成 18 份报告', icon: CircleCheck, tone: 'green' },
]
const summaries = computed(() => (
  props.role === '管理视角'
    ? allSummaries
    : allSummaries.filter((item) => item.label !== '草稿主题')
))
const statusOptions = computed(() => (
  props.role === '管理视角'
    ? ['全部状态', '草稿', '研讨中', '待召开', '现场记录', '待总结', '已完成']
    : ['全部状态', '研讨中', '待召开', '现场记录', '待总结', '已完成']
))

const tagType = (itemStatus) => ({
  '研讨中': 'success',
  '草稿': undefined,
  '待召开': 'warning',
  '现场记录': 'warning',
  '待总结': 'danger',
  '已完成': 'info',
}[itemStatus])
</script>

<template>
  <section class="page">
    <header class="page-heading">
      <div>
        <div class="crumb">园本教研 / 案例教研</div>
        <h1>案例教研</h1>
        <p>围绕真实案例，完成准备、在线研讨、现场教研与成果沉淀。</p>
      </div>
      <div v-if="role === '管理视角'" class="heading-actions">
        <el-button :icon="Download">批量下载</el-button>
        <el-button
          v-if="role === '管理视角'"
          type="primary"
          :icon="Plus"
          @click="emit('create')"
        >
          创建教研主题
        </el-button>
      </div>
    </header>

    <div class="summary-strip" :class="{ 'teacher-summary': role === '教师视角' }">
      <article v-for="item in summaries" :key="item.label" class="summary-item">
        <div class="summary-icon" :class="item.tone"><el-icon><component :is="item.icon" /></el-icon></div>
        <div><span>{{ item.label }}</span><strong>{{ item.value }}</strong><small>{{ item.note }}</small></div>
      </article>
    </div>

    <div class="list-panel">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-select v-model="semester" class="semester-select">
            <el-option label="2025-2026学年度下学期" value="2025-2026学年度下学期" />
            <el-option label="2025-2026学年度上学期" value="2025-2026学年度上学期" />
          </el-select>
          <el-select v-model="status" class="status-select">
            <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" />
          </el-select>
          <el-input v-model="search" :prefix-icon="Search" clearable placeholder="搜索教研主题或主持人" class="search-input" />
        </div>
        <span class="result-count">共 {{ filteredItems.length }} 个主题</span>
      </div>

      <div class="research-table">
        <div class="table-head">
          <span>教研主题</span><span>当前阶段</span><span>参与情况</span><span>计划时间</span><span>最近更新</span><span>操作</span>
        </div>
        <article
          v-for="item in filteredItems"
          :key="item.id"
          class="research-row"
          @click="item.status === '草稿' ? emit('edit', item) : emit('open', item)"
        >
          <div class="topic-cell">
            <div class="topic-icon"><el-icon><DocumentChecked /></el-icon></div>
            <div>
              <div class="topic-title">{{ item.title }}</div>
              <div class="topic-meta">
                <el-tag size="small" effect="plain">{{ item.scope }}</el-tag>
                <span>主持人：{{ item.host }}</span>
              </div>
            </div>
          </div>
          <div class="stage-cell">
            <div class="status-line"><el-tag :type="tagType(item.status)" effect="light">{{ item.status }}</el-tag><b>{{ item.progress }}%</b></div>
            <StageTrack :current="item.stage" :completed="item.status === '已完成'" compact />
          </div>
          <div class="activity-cell">
            <span><el-icon><User /></el-icon>{{ item.participants }} 人</span>
            <span><el-icon><ChatDotRound /></el-icon>{{ item.topics }} 话题 · {{ item.replies }} 回复</span>
          </div>
          <div class="date-cell"><el-icon><Clock /></el-icon>{{ item.date }}</div>
          <div class="update-cell">{{ item.updated }}</div>
          <div class="action-cell" @click.stop>
            <el-button v-if="item.status === '草稿' && role === '管理视角'" link type="primary" @click="emit('edit', item)">继续编辑 <el-icon><ArrowRight /></el-icon></el-button>
            <el-button v-else link type="primary" @click="emit('open', item)">进入教研 <el-icon><ArrowRight /></el-icon></el-button>
            <el-button v-if="role === '管理视角'" link :icon="MoreFilled" aria-label="更多操作" />
          </div>
        </article>
        <el-empty v-if="!filteredItems.length" description="没有找到匹配的教研主题" />
      </div>

      <div class="pagination">
        <el-pagination background layout="prev, pager, next" :total="38" :page-size="5" />
      </div>
    </div>
  </section>
</template>
