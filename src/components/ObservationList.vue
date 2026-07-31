<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { MagicStick, Search, Connection, RefreshRight, VideoPlay, Check, CircleCheck } from '@element-plus/icons-vue'
import { observations } from '../data/observations'

const emit = defineEmits(['generate-advice'])
const selected = ref([])
const keyword = ref('')
const activeType = ref('全部')
const activeScene = ref('全部')
const storyVisible = ref(false)
const storyLoading = ref(false)
const storyRecords = ref([])
const activeStoryChild = ref('')
const storyEntries = ref({})
const storyForm = reactive({ semester: '2026年春季学期', section: '幼儿故事', children: [] })
const detailVisible = ref(false)
const detailRecord = ref(null)
const storyPublished = ref(false)

const filtered = computed(() => observations.filter((item) => (
  !keyword.value || `${item.title}${item.child}${item.teacher}`.includes(keyword.value)
)))
const storyChildren = computed(() => [...new Set(storyRecords.value.flatMap((record) => record.children))])
const recordsForChild = computed(() => storyRecords.value.filter((record) => record.children.includes(activeStoryChild.value)))
const observationDateText = computed(() => [...new Set(storyRecords.value.map((record) => record.date))]
  .map((date) => date.replace(/(\d{4})-(\d{2})-(\d{2})/, '$1年$2月$3日'))
  .join('、'))
const activityTypes = ['全部', '游戏活动', '生活活动', '阅读活动', '天气观察', '动植物观察', '艺术活动', '表征/倾听活动', '回顾/分享活动', '其它活动', '小车区']
const activityScenes = ['全部', '入园', '离园', '进餐', '盥洗/过渡环节', '户外活动', '午睡环节', '回溯性活动/教育活动', '自主游戏']

const toggleSelection = (record) => {
  const exists = selected.value.some((item) => item.id === record.id)
  selected.value = exists ? selected.value.filter((item) => item.id !== record.id) : [...selected.value, record]
}
const isSelected = (record) => selected.value.some((item) => item.id === record.id)
const openDetail = (record) => {
  detailRecord.value = record
  detailVisible.value = true
}

const buildStoryEntry = (child) => {
  const sources = storyRecords.value.filter((record) => record.children.includes(child))
  const primary = sources[0]
  const facts = sources.map((record) => record.record).join('\n\n')
  const analyses = sources.map((record) => record.analysis.replace('幼儿', '').replace(/[。.]+$/, '')).join('；')
  return {
    title: `${child}的成长时刻｜${primary.title}`,
    content: `最近，${child}在幼儿园里留下了${sources.length > 1 ? `${sources.length}个值得记录的成长片段` : '一个温暖的成长瞬间'}。\n\n${facts}\n\n从这些专注的探索中，我们看见${child}${analyses}。这份主动思考、愿意尝试的力量，正在一点点长成宝贵的学习品质。\n\n期待家长也和孩子聊一聊这些经历，听听孩子眼中的发现与办法。`,
  }
}

const openStory = (input) => {
  const records = (Array.isArray(input) ? input : [input])
    .filter((record, index, list) => record?.id && list.findIndex((item) => item.id === record.id) === index)
  if (!records.length) return ElMessage.warning('请先选择观察记录')

  storyRecords.value = records
  const children = [...new Set(records.flatMap((record) => record.children))]
  activeStoryChild.value = children[0]
  storyForm.children = [...children]
  storyEntries.value = Object.fromEntries(children.map((child) => [child, { title: '', content: '' }]))
  storyVisible.value = true
  storyLoading.value = true
  window.setTimeout(() => {
    storyEntries.value = Object.fromEntries(children.map((child) => [child, buildStoryEntry(child)]))
    storyLoading.value = false
  }, 700)
}

const regenerate = () => {
  storyLoading.value = true
  window.setTimeout(() => {
    const child = activeStoryChild.value
    const entry = buildStoryEntry(child)
    storyEntries.value[child] = {
      ...entry,
      content: entry.content.replace('温暖的成长瞬间', '值得珍藏的成长片段'),
    }
    storyLoading.value = false
    ElMessage.success(`已重新生成${child}的成长档案内容，原始观察事实保持不变`)
  }, 600)
}

const syncStory = () => {
  if (!storyForm.children.length) return ElMessage.warning('请至少选择一名幼儿')
  storyVisible.value = false
  selected.value = []
  storyPublished.value = true
}
</script>

<template>
  <section class="page observation-page">
    <div class="crumb">观察与反思 / 观察记录</div>
    <div class="page-heading observation-heading new-observation-heading">
      <div><h1>观察记录</h1></div>
      <el-button type="primary">新建观察记录</el-button>
    </div>

    <div class="observation-gallery-panel">
      <div class="observation-filters new-observation-filters">
        <el-select model-value="2026年春季学期" class="filter-semester"><el-option label="2026年春季学期" value="2026年春季学期" /></el-select>
        <el-select model-value="全部班级"><el-option label="全部班级" value="全部班级" /><el-option label="中一班" value="中一班" /></el-select>
        <el-select model-value="全部幼儿"><el-option label="全部幼儿" value="全部幼儿" /></el-select>
        <el-select model-value="全部教师"><el-option label="全部教师" value="全部教师" /></el-select>
        <el-input v-model="keyword" clearable placeholder="请输入搜索内容" :prefix-icon="Search" />
        <el-button type="primary">搜索</el-button>
      </div>
      <div class="observation-chip-row">
        <strong><i></i>活动类型：</strong>
        <button v-for="item in activityTypes" :key="item" :class="{ active: activeType === item }" @click="activeType = item">{{ item }}</button>
      </div>
      <div class="observation-chip-row">
        <strong><i></i>活动环节：</strong>
        <button v-for="item in activityScenes" :key="item" :class="{ active: activeScene === item }" @click="activeScene = item">{{ item }}</button>
      </div>

      <div class="ai-selection-bar" :class="{ empty: !selected.length }">
        <div><el-icon><MagicStick /></el-icon><strong>{{ selected.length ? `已选择 ${selected.length} 篇观察记录` : '先勾选观察记录，再使用 AI' }}</strong><span>{{ selected.length ? '可生成活动建议，也可按幼儿分别生成成长档案' : '支持单选或多选；点击卡片仍然查看详情' }}</span></div>
        <div>
          <button v-if="selected.length" class="clear-selection" @click="selected = []">清空选择</button>
          <el-button class="batch-story-button" :disabled="!selected.length" @click="openStory(selected)"><el-icon><Connection /></el-icon> AI 生成成长档案</el-button>
          <el-button type="primary" :disabled="!selected.length" @click="emit('generate-advice', selected)"><el-icon><MagicStick /></el-icon> AI 生成活动建议</el-button>
        </div>
      </div>

      <div class="gallery-count">数量：573</div>
      <div class="observation-gallery">
        <article v-for="record in filtered" :key="record.id" class="observation-card" :class="{ selected: isSelected(record) }" @click="openDetail(record)">
          <div class="observation-card-media">
            <img :src="record.cover" :alt="record.title" />
            <span v-if="record.mediaType === '视频'" class="card-play"><el-icon><VideoPlay /></el-icon></span>
            <button class="card-select" :class="{ checked: isSelected(record) }" :aria-label="isSelected(record) ? '取消选择' : '选择记录'" @click.stop="toggleSelection(record)"><el-icon v-if="isSelected(record)"><Check /></el-icon></button>
            <span v-if="record.children.length > 1" class="card-child-overlay">相关幼儿：{{ record.child }} 等{{ record.children.length }}人</span>
          </div>
          <div class="observation-card-body">
            <h3>{{ record.title }}</h3>
            <p>{{ record.date }}</p>
            <div v-if="record.children.length > 1 || record.teacher" class="card-people">
              <span class="child-avatar">{{ record.teacher.slice(0, 1) }}</span>
              <div><small>相关教师</small><b>{{ record.teacher }}</b></div>
              <em>{{ record.className.split(' · ')[1] }}</em>
            </div>
            <button class="card-detail-link" @click.stop="openDetail(record)">查看详情</button>
          </div>
        </article>
      </div>
      <div class="gallery-pagination"><el-pagination background layout="prev, pager, next" :total="573" :page-size="20" /></div>
    </div>

    <el-dialog v-model="detailVisible" width="760" class="observation-detail-dialog">
      <template #header><div class="detail-dialog-title"><h3>观察记录详情</h3><span>原始记录</span></div></template>
      <div v-if="detailRecord" class="observation-detail">
        <img :src="detailRecord.cover" :alt="detailRecord.title" />
        <div class="observation-detail-main">
          <h2>{{ detailRecord.title }}</h2>
          <div class="detail-meta"><span>{{ detailRecord.className }}</span><span>{{ detailRecord.children.join('、') }}</span><span>{{ detailRecord.teacher }}</span><span>{{ detailRecord.date }}</span></div>
          <dl><dt>观察目的</dt><dd>{{ detailRecord.purpose }}</dd><dt>观察实录</dt><dd>{{ detailRecord.record }}</dd><dt>分析与支持</dt><dd>{{ detailRecord.analysis }}</dd></dl>
        </div>
      </div>
      <template #footer><el-button @click="detailVisible = false">关闭</el-button><el-button type="primary" @click="detailVisible = false; toggleSelection(detailRecord)">选择此记录</el-button></template>
    </el-dialog>

    <el-dialog v-model="storyVisible" width="1180" class="growth-story-dialog" :close-on-click-modal="false">
      <template #header>
        <div class="story-dialog-title">
          <span class="ai-orb"><el-icon><MagicStick /></el-icon></span>
          <div><h3>{{ storyRecords.length > 1 ? 'AI 批量生成成长档案' : 'AI 生成成长档案' }}</h3><p>已选 {{ storyRecords.length }} 篇观察，涉及 {{ storyChildren.length }} 名幼儿；每名幼儿分别生成独立内容</p></div>
        </div>
      </template>
      <div class="story-safety"><el-icon><Connection /></el-icon>仅基于原始观察事实生成；不同幼儿的事实分别归组，不会混写成同一篇轶事</div>
      <div class="story-compose" v-loading="storyLoading" element-loading-text="AI 正在按幼儿归组事实并生成成长档案内容…">
        <aside>
          <h4>已选观察依据 <em>{{ storyRecords.length }}</em></h4>
          <div class="story-source-records">
            <article v-for="record in storyRecords" :key="record.id" :class="{ active: recordsForChild.some((item) => item.id === record.id) }">
              <div><span class="child-avatar">{{ record.child.slice(0, 1) }}</span><div><b>{{ record.title }}</b><small>{{ record.children.join('、') }} · {{ record.date }}</small></div></div>
              <p>{{ record.excerpt }}</p>
            </article>
          </div>
        </aside>
        <main>
          <div class="story-child-tabs">
            <span>查看幼儿档案</span>
            <button v-for="child in storyChildren" :key="child" :class="{ active: activeStoryChild === child }" @click="activeStoryChild = child"><i>{{ child.slice(0, 1) }}</i>{{ child }}<em v-if="storyForm.children.includes(child)">待同步</em></button>
          </div>
          <section class="archive-editor">
              <div class="ai-draft-head">
                <div><span>AI 生成内容</span><em>可编辑</em><small>引用 {{ recordsForChild.length }} 篇观察</small></div>
                <el-button link :icon="RefreshRight" @click="regenerate">重新生成本篇</el-button>
              </div>
              <el-input v-if="storyEntries[activeStoryChild]" v-model="storyEntries[activeStoryChild].title" placeholder="成长档案标题" />
              <el-input v-if="storyEntries[activeStoryChild]" v-model="storyEntries[activeStoryChild].content" type="textarea" :rows="13" resize="none" />
              <div class="sync-settings">
                <label>同步至</label>
                <el-select v-model="storyForm.semester"><el-option label="2026年春季学期" value="2026年春季学期" /></el-select>
                <el-select v-model="storyForm.section"><el-option label="幼儿故事" value="幼儿故事" /><el-option label="活动剪影" value="活动剪影" /></el-select>
                <label>观察日期</label>
                <el-input class="observation-date-input" :model-value="observationDateText" readonly aria-label="观察日期" />
              </div>
              <div class="child-checkboxes"><label>同步对象</label><el-checkbox-group v-model="storyForm.children"><el-checkbox v-for="child in storyChildren" :key="child" :value="child">{{ child }}（1篇）</el-checkbox></el-checkbox-group></div>
          </section>
        </main>
      </div>
      <template #footer><span class="story-footer-summary">将同步 {{ storyForm.children.length }} 篇成长档案内容</span><el-button @click="storyVisible = false">取消</el-button><el-button type="primary" :disabled="storyLoading" @click="syncStory">确认同步至成长档案</el-button></template>
    </el-dialog>

    <el-dialog v-model="storyPublished" width="420px" class="story-published-dialog" :show-close="false" align-center>
      <div class="story-published-content">
        <span><el-icon><CircleCheck /></el-icon></span>
        <h3>已发布至成长档案</h3>
      </div>
      <template #footer><el-button type="primary" @click="storyPublished = false">知道了</el-button></template>
    </el-dialog>
  </section>
</template>
