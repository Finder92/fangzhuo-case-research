<script setup>
import { computed, nextTick, reactive, ref } from 'vue'
import {
  ArrowLeft, Plus, ChatDotRound, User, Calendar, Location, Bell,
  MoreFilled, Top, Star, Document, Promotion, CircleCheck, Clock,
  Headset, PictureFilled, UploadFilled, Tickets, MagicStick,
  FolderOpened, Download, VideoCamera, View
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import StageTrack from './StageTrack.vue'
import { seedTopics } from '../data/research'

const props = defineProps({
  item: { type: Object, required: true },
  role: { type: String, default: '管理视角' },
})
const emit = defineEmits(['back', 'status-change'])

const currentStage = ref(props.item.stage)
const currentStatus = ref(props.item.status)
const initialTab = () => {
  if (currentStage.value >= 4) return '成果文件'
  if (props.role === '管理视角' && currentStage.value === 3) return '现场记录'
  if (currentStage.value >= 2) return '教研记录'
  return '教研主题'
}
const activeTab = ref(initialTab())
const topicDialog = ref(false)
const replyDrawer = ref(false)
const memberDrawer = ref(false)
const selectedTopic = ref(null)
const topicTitle = ref('')
const topicContent = ref('')
const topicScope = ref('整场教研')
const replyText = ref('')
const topics = ref(structuredClone(seedTopics).map((topic, index) => ({
  ...topic,
  preset: index === 0,
  scope: index === 0
    ? '案例一：沙水区沟渠连续坍塌'
    : index === 1
      ? '案例二：同伴协作中的材料争议'
      : '整场教研',
})))
const participants = reactive([
  { name: '王鹏', className: '教研室', role: '主持人', status: '已参与', color: '#6f82d9' },
  { name: '黄曼丽', className: '小一班', role: '教师', status: '已参与', color: '#e59a73' },
  { name: '石鸿雁', className: '小二班', role: '教师', status: '已参与', color: '#64b6a4' },
  { name: '韩雪媛', className: '小三班', role: '教师', status: '已参与', color: '#8c75c9' },
  { name: '王朝阳', className: '小四班', role: '教师', status: '已参与', color: '#5c9bd6' },
  { name: '张晓琳', className: '中一班', role: '教师', status: '已参与', color: '#d784a5' },
  { name: '刘佳', className: '中二班', role: '教师', status: '已参与', color: '#6db18d' },
  { name: '周敏', className: '中三班', role: '教师', status: '已参与', color: '#cc9a55' },
  { name: '赵云霞', className: '中四班', role: '教师', status: '已参与', color: '#708fcb' },
  { name: '孙悦', className: '大一班', role: '教师', status: '已参与', color: '#b176a8' },
  { name: '陈思', className: '大二班', role: '教师', status: '已参与', color: '#5ea5a3' },
  { name: '李静', className: '大三班', role: '教师', status: '已参与', color: '#d38a68' },
  { name: '吴倩', className: '大四班', role: '教师', status: '已参与', color: '#7786ba' },
  { name: '徐露', className: '保教部', role: '观察员', status: '已参与', color: '#69a77d' },
  { name: '林芳', className: '小五班', role: '教师', status: '未加入', color: '#a7afbf', current: true },
  { name: '许晨', className: '中五班', role: '教师', status: '未加入', color: '#a7afbf' },
  { name: '郭婷', className: '大五班', role: '教师', status: '未加入', color: '#a7afbf' },
  { name: '何雨', className: '课程部', role: '观察员', status: '未加入', color: '#a7afbf' },
].map((member, index) => ({
  ...member,
  topicCount: index === 0 ? 3 : index < 6 ? (index % 3) + 1 : index < 14 ? index % 2 : 0,
  replyCount: index === 0 ? 11 : index < 6 ? 8 + (index % 4) : index < 14 ? 2 + (index % 5) : 0,
})))
const recordingStatus = ref(currentStage.value >= 4 ? '转写完成' : '待上传')
const recordingFileName = ref(
  currentStage.value >= 4 ? '沙水游戏专题教研现场录音.m4a' : '',
)
const meetingDocumentName = ref('会议讨论要点与分组记录.docx')
const minutesStatus = ref(currentStage.value >= 4 ? '已生成' : '待生成')
const meetingEvaluationStatus = ref('待生成')
const filePreviewVisible = ref(false)
const previewFile = ref(null)
const previewCover = `${import.meta.env.BASE_URL}covers/sand-water.svg`
const preparationFiles = [
  { id: 'prepare-video', category: 'video', name: '沙水游戏连续观察片段.mp4', extension: 'MP4', size: '86.4 MB', source: '观察案例', icon: VideoCamera },
  { id: 'prepare-document-1', category: 'document', name: '沙水游戏观察记录汇编.pdf', extension: 'PDF', size: '8.4 MB', source: '观察记录', icon: Document },
  { id: 'prepare-document-2', category: 'document', name: '教研活动方案与提问单.docx', extension: 'DOCX', size: '1.2 MB', source: '活动方案', icon: Document },
  { id: 'prepare-audio', category: 'audio', name: '前期教师访谈录音.m4a', extension: 'M4A', size: '18.6 MB', source: '访谈素材', icon: Headset },
  { id: 'prepare-image', category: 'image', name: '沙水区沟渠现场照片.jpg', extension: 'JPG', size: '3.8 MB', source: '观察案例', icon: PictureFilled },
]
const preparationFileGroups = computed(() => ([
  { key: 'video', label: '视频', icon: VideoCamera },
  { key: 'document', label: '文档', icon: Document },
  { key: 'audio', label: '音频', icon: Headset },
  { key: 'image', label: '图片', icon: PictureFilled },
].map((group) => ({
  ...group,
  files: preparationFiles.filter((file) => file.category === group.key),
})).filter((group) => group.files.length)))
const audioWave = [20, 34, 25, 48, 30, 58, 38, 24, 46, 68, 40, 30, 54, 37, 62, 28, 44, 34, 56, 42, 24, 50, 32, 45, 25, 38, 56, 30, 43, 22, 36, 51]
const caseResults = reactive([
  {
    id: 1,
    title: '沙水区沟渠连续坍塌：幼儿如何发现并修复结构问题',
    className: '小六班',
    teacher: '黄曼丽',
    topics: 2,
    replies: 18,
    evidence: '3段视频 · 12张图片 · 1段录音',
    status: '已完成',
    summary: '幼儿已经能够通过观察水流方向发现坍塌位置，但在材料选择和结构加固方面仍依赖同伴经验。教师可通过对比材料、记录验证结果等方式提供最小支持。',
  },
  {
    id: 2,
    title: '同伴协作中的材料争议：从各自尝试走向共同解决',
    className: '小五班',
    teacher: '林芳',
    topics: 3,
    replies: 14,
    evidence: '2段视频 · 8张图片 · 4条现场纪要',
    status: props.item.status === '已完成' ? '已完成' : '待生成',
    summary: '幼儿的争议主要集中在材料归属和方案选择上。通过共同预测、轮流验证和结果记录，幼儿逐步形成了基于证据进行协商的合作方式。',
  },
])
const overallSummaryStatus = ref(props.item.status === '已完成' ? '已完成' : '待生成')
const archiveStatus = ref(props.item.status === '已完成' ? '已完成' : '待生成')
const generatingResult = ref('')
const resultDialog = ref(false)
const resultDialogTitle = ref('')
const resultDraft = ref('')
const scrollPageTop = () => nextTick(() => window.scrollTo({ top: 0 }))

const meeting = reactive({
  actualTime: '2026-08-06 14:05',
  attendance: 16,
  absent: 2,
  note: currentStage.value >= 4
    ? '## 会议结论\n\n- 先描述幼儿行为事实，再判断教师介入时机。\n- 使用“预测—验证—调整”记录表支持幼儿持续探究。\n\n## 主要分歧\n\n教师是否应在第一次坍塌后立即提供材料建议，后续通过实践回访验证。\n\n## 后续行动\n\n1. 黄曼丽老师负责一周实践记录。\n2. 林芳老师整理同伴协作案例。\n3. 主持人于 8 月 13 日组织线上回访。'
    : '',
})

const tabs = computed(() => (
  props.role === '教师视角'
    ? [
        { label: '教研主题', minStage: 1 },
        { label: '教研记录', minStage: 1 },
        { label: '成果文件', minStage: 2 },
      ]
    : [
        { label: '教研主题', minStage: 1 },
        { label: '教研记录', minStage: 1 },
        { label: '现场记录', minStage: 1 },
        { label: '成果文件', minStage: 2 },
      ]
))
const stageTrackItems = computed(() => (
  props.role === '教师视角'
    ? ['教研主题', '教研记录', '成果文件']
    : ['教研主题', '教研记录', '现场记录', '成果文件']
))
const stageTrackCurrent = computed(() => (
  props.role === '教师视角'
    ? currentStage.value >= 4 ? 3 : currentStage.value >= 2 ? 2 : 1
    : currentStage.value
))

const totalReplies = computed(() => topics.value.reduce((sum, topic) => sum + topic.replies.length, 0))
const caseCompletedCount = computed(() => caseResults.filter((item) => item.status === '已完成').length)
const allCasesCompleted = computed(() => caseCompletedCount.value === caseResults.length)
const currentTeacher = computed(() => participants.find((member) => member.current))
const teacherStatus = computed(() => currentTeacher.value?.status || '未加入')
const joinedCount = computed(() => participants.filter((member) => member.status !== '未加入').length)
const participatedCount = computed(() => participants.filter(
  (member) => ['已参与', '已出席'].includes(member.status),
).length)
const absentParticipationCount = computed(() => participants.length - joinedCount.value)
const teacherStatusText = computed(() => ({
  未加入: '加入后可发表话题、回复观点，并接收教研通知。',
  已加入: '你已加入本次教研，发表话题或回复后将计为已参与。',
  已参与: '你已完成线上参与，可以继续发表观点或等待现场教研。',
  已出席: '你已完成现场签到，本次教研参与记录完整。',
  请假: '你已提交请假，本次教研将记录为请假。',
}[teacherStatus.value]))

const memberActivity = (member) => {
  const score = member.topicCount * 3 + member.replyCount
  if (score >= 15) return { label: '高活跃', type: 'success' }
  if (score >= 6) return { label: '已参与', type: 'warning' }
  return { label: '待参与', type: 'info' }
}

const switchTab = (tab) => {
  if (currentStage.value < tab.minStage) return
  activeTab.value = tab.label
}
const switchStageModule = (label) => {
  const tab = tabs.value.find((item) => item.label === label)
  if (tab) switchTab(tab)
}

const memberStatusType = (status) => ({
  已参与: 'success',
  已出席: 'success',
  已加入: 'warning',
  请假: 'danger',
  未加入: 'info',
}[status] || 'info')
const resultStatusType = (status) => ({
  已完成: 'success',
  生成中: 'warning',
  待生成: 'info',
}[status] || 'info')

const stageHint = computed(() => ({
  1: ['教研主题尚未发布', '完善主题、活动方案与参与设置后，即可发布在线研讨。'],
  2: ['在线研讨正在进行', '线上讨论与线下会议均归在本阶段；会议结束后进入现场记录。'],
  3: ['请完善现场记录', '上传录音、会议文档、现场照片与视频；录音转写完成后可由 AI 生成可编辑的 Markdown 会议纪要。'],
  4: ['进入成果沉淀', '先形成案例小结和整次教研总结，最后生成本次会议资料归档包。'],
}[currentStage.value]))

const statusType = computed(() => ({
  草稿: 'info',
  研讨中: 'success',
  现场记录: 'warning',
  待总结: 'danger',
  已完成: 'info',
}[currentStatus.value]))

const recordingType = computed(() => ({
  待上传: 'info',
  转写中: 'warning',
  转写完成: 'success',
}[recordingStatus.value]))

const minutesType = computed(() => ({
  待生成: 'info',
  生成中: 'warning',
  已生成: 'success',
}[minutesStatus.value]))

const updateStatus = (status, stage, progress) => {
  currentStatus.value = status
  currentStage.value = stage
  emit('status-change', { id: props.item.id, status, stage, progress })
}

const joinResearch = () => {
  currentTeacher.value.status = '已加入'
  ElMessage.success('已加入本次教研，可以发表话题或回复观点')
}

const markTeacherParticipated = () => {
  if (props.role === '教师视角' && currentTeacher.value.status !== '已出席') {
    currentTeacher.value.status = '已参与'
  }
}

const checkIn = () => {
  currentTeacher.value.status = '已出席'
  ElMessage.success('现场签到成功，已记录你的出席情况')
}

const openTeacherAction = () => {
  if (currentStage.value >= 4) {
    activeTab.value = '成果文件'
    return
  }
  if (teacherStatus.value === '未加入') return joinResearch()
  if (currentStage.value <= 2) {
    activeTab.value = '教研记录'
    if (teacherStatus.value === '已加入') topicDialog.value = true
    return
  }
  ElMessage.info('线下会议结束后，由主持人整理现场资料并发布成果')
}

const teacherActionLabel = computed(() => {
  if (currentStage.value >= 4) return '查看成果'
  if (teacherStatus.value === '未加入') return '加入本次教研'
  if (currentStage.value <= 2) return teacherStatus.value === '已加入' ? '发表观点' : '继续研讨'
  if (currentStage.value === 3) return '等待成果整理'
  return '查看成果'
})

const openResult = (title, content) => {
  resultDialogTitle.value = title
  resultDraft.value = content
  resultDialog.value = true
}

const generateCaseSummary = (caseItem) => {
  generatingResult.value = `case-${caseItem.id}`
  caseItem.status = '生成中'
  setTimeout(() => {
    caseItem.status = '已完成'
    generatingResult.value = ''
    ElMessage.success(`《${caseItem.title}》案例小结已生成`)
  }, 800)
}

const generateOverallSummary = () => {
  if (!allCasesCompleted.value) return
  generatingResult.value = 'overall'
  overallSummaryStatus.value = '生成中'
  setTimeout(() => {
    overallSummaryStatus.value = '已完成'
    generatingResult.value = ''
    ElMessage.success('整次教研总结已生成')
  }, 900)
}

const generateArchive = () => {
  if (overallSummaryStatus.value !== '已完成') return
  generatingResult.value = 'archive'
  archiveStatus.value = '生成中'
  setTimeout(() => {
    archiveStatus.value = '已完成'
    generatingResult.value = ''
    updateStatus('已完成', 4, 100)
    ElMessage.success('本次会议资料已打包归档，教研已完成')
  }, 900)
}

const openTopic = (topic) => {
  selectedTopic.value = topic
  replyDrawer.value = true
}

const addTopic = () => {
  if (props.role === '教师视角' && teacherStatus.value === '未加入') {
    return ElMessage.warning('请先加入本次教研')
  }
  if (!topicTitle.value.trim()) return ElMessage.warning('请输入话题标题')
  topics.value.unshift({
    id: Date.now(),
    pinned: false,
    author: props.role === '管理视角' ? '小方桌管理员' : currentTeacher.value.name,
    role: props.role === '管理视角' ? '教研管理者' : '参与教师',
    time: '刚刚',
    title: topicTitle.value,
    content: topicContent.value || '欢迎大家围绕这个问题发表看法。',
    scope: topicScope.value,
    replies: [],
  })
  topicDialog.value = false
  topicTitle.value = ''
  topicContent.value = ''
  topicScope.value = '整场教研'
  markTeacherParticipated()
  ElMessage.success('话题已发布')
}

const addReply = () => {
  if (props.role === '教师视角' && teacherStatus.value === '未加入') {
    return ElMessage.warning('请先加入本次教研')
  }
  if (!replyText.value.trim()) return
  selectedTopic.value.replies.push({
    id: Date.now(),
    author: props.role === '管理视角' ? '小方桌管理员' : currentTeacher.value.name,
    time: '刚刚',
    content: replyText.value,
  })
  replyText.value = ''
  markTeacherParticipated()
  ElMessage.success('回复已发表')
}

const enterRecordStage = () => {
  ElMessageBox.confirm(
    '线下会议结束后将进入“现场记录”。请补充出勤、录音或会议文档，以及现场照片与视频；录音转写后可生成 AI 会议纪要。',
    '结束教研并整理现场资料？',
    {
      confirmButtonText: '进入现场记录',
      cancelButtonText: '暂不结束',
      type: 'warning',
    },
  ).then(() => {
    updateStatus('现场记录', 3, 78)
    activeTab.value = '现场记录'
    scrollPageTop()
    ElMessage.success('已进入现场记录，请完善本次教研资料')
  }).catch(() => {})
}

const openPrimaryAction = () => {
  if (currentStage.value < 3) return enterRecordStage()
  if (currentStage.value === 3) {
    activeTab.value = '现场记录'
    scrollPageTop()
    return
  }
  activeTab.value = '成果文件'
  scrollPageTop()
}

const startTranscription = (fileName = '沙水游戏专题教研现场录音.m4a') => {
  recordingFileName.value = fileName
  recordingStatus.value = '转写中'
  minutesStatus.value = '待生成'
  meeting.note = ''
  setTimeout(() => {
    recordingStatus.value = '转写完成'
    ElMessage.success('录音转写完成，已生成可编辑的文字稿')
  }, 900)
}

const handleMeetingFile = (file) => {
  const isAudio = /\.(mp3|wav|m4a|aac|ogg)$/i.test(file.name)
  if (isAudio) return startTranscription(file.name)
  meetingDocumentName.value = file.name
  ElMessage.success('会议文档已添加，可与录音一并归档')
}

const openPreparationPreview = (file) => {
  previewFile.value = file
  filePreviewVisible.value = true
}

const generateMinutes = () => {
  if (recordingStatus.value !== '转写完成') {
    return ElMessage.warning('请先完成录音转写')
  }
  minutesStatus.value = '生成中'
  setTimeout(() => {
    meeting.note = '## 会议结论\n\n- 先描述幼儿行为事实，再判断教师介入时机。\n- 使用“预测—验证—调整”记录表支持幼儿持续探究。\n\n## 主要分歧\n\n教师是否应在第一次坍塌后立即提供材料建议，后续通过实践回访验证。\n\n## 后续行动\n\n1. 黄曼丽老师负责一周实践记录。\n2. 林芳老师整理同伴协作案例。\n3. 主持人于 8 月 13 日组织线上回访。'
    minutesStatus.value = '已生成'
    ElMessage.success('AI 会议纪要已生成，可继续编辑 Markdown 内容')
  }, 900)
}

const generateMeetingEvaluation = () => {
  if (minutesStatus.value !== '已生成' || overallSummaryStatus.value !== '已完成') return
  meetingEvaluationStatus.value = '生成中'
  setTimeout(() => { meetingEvaluationStatus.value = '已生成'; ElMessage.success('AI 会议评价已生成') }, 800)
}

const confirmRecord = () => {
  updateStatus('待总结', 4, 90)
  activeTab.value = '成果文件'
  scrollPageTop()
  ElMessage.success('现场记录已归档，现在可以生成教研成果')
}
</script>

<template>
  <section class="page detail-page">
    <header class="detail-header">
      <div class="detail-title">
        <el-button circle :icon="ArrowLeft" aria-label="返回" @click="emit('back')" />
        <div>
          <div class="detail-badges">
            <el-tag :type="statusType">{{ currentStatus }}</el-tag>
            <span>{{ item.scope }}</span>
          </div>
          <h1>{{ item.title }}</h1>
        </div>
      </div>
      <div class="detail-actions">
        <el-button :icon="User" @click="memberDrawer = true">
          参与成员 {{ joinedCount }}/{{ participants.length }}
        </el-button>
        <el-button v-if="role === '管理视角'" :icon="Bell">通知参与人</el-button>
        <el-button
          v-if="role === '管理视角' && currentStatus !== '已完成'"
          type="primary"
          :icon="CircleCheck"
          @click="openPrimaryAction"
        >
          {{ currentStage < 3 ? '结束教研' : currentStage === 3 ? '完善现场记录' : '整理教研成果' }}
        </el-button>
        <el-button
          v-if="role === '教师视角'"
          type="primary"
          :icon="teacherStatus === '已出席' ? CircleCheck : User"
          :disabled="currentStage === 3 || (currentStage <= 2 && teacherStatus === '已出席')"
          @click="openTeacherAction"
        >
          {{ teacherActionLabel }}
        </el-button>
        <el-button v-if="role === '管理视角'" :icon="MoreFilled" circle aria-label="更多操作" />
      </div>
    </header>

    <div class="detail-stage-card">
      <StageTrack
        :current="stageTrackCurrent"
        :items="stageTrackItems"
        :completed="currentStatus === '已完成'"
        @select="switchStageModule"
      />
      <div class="stage-hint">
        <el-icon><Clock /></el-icon>
        <div><strong>{{ stageHint[0] }}</strong><span>{{ stageHint[1] }}</span></div>
      </div>
    </div>

    <div class="detail-meta-bar">
      <span><el-icon><User /></el-icon>主持人 {{ item.host }}</span>
      <span><el-icon><Calendar /></el-icon>{{ item.date }}</span>
      <span><el-icon><Location /></el-icon>三楼多功能教室</span>
      <button class="meta-member-entry" @click="memberDrawer = true"><el-icon><User /></el-icon>{{ item.participants }} 位参与教师 · 查看活跃度</button>
    </div>

    <div v-if="role === '教师视角'" class="teacher-participation-bar">
      <div class="member-avatar" :style="{ background: currentTeacher.color }">
        {{ currentTeacher.name.slice(-1) }}
      </div>
      <div>
        <span>我的参与状态</span>
        <strong>{{ currentTeacher.name }} · {{ currentTeacher.className }}</strong>
      </div>
      <el-tag :type="memberStatusType(teacherStatus)" effect="plain">{{ teacherStatus }}</el-tag>
      <p>{{ teacherStatusText }}</p>
    </div>

    <div class="detail-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.label"
        :class="{ active: activeTab === tab.label, disabled: currentStage < tab.minStage }"
        :disabled="currentStage < tab.minStage"
        :title="currentStage < tab.minStage ? '尚未进入此流程节点' : ''"
        @click="switchTab(tab)"
      >
        {{ tab.label }}
        <span v-if="tab.label === '教研记录'">{{ topics.length }}</span>
      </button>
    </div>

    <div v-if="activeTab === '教研记录'" class="discussion-layout">
      <main class="topics-panel">
        <div class="topics-head">
          <div><h2>研讨话题</h2><p>共 {{ topics.length }} 个话题、{{ totalReplies }} 条回复</p></div>
          <el-button
            type="primary"
            :icon="Plus"
            :disabled="role === '教师视角' && teacherStatus === '未加入'"
            @click="topicDialog = true"
          >
            {{ role === '教师视角' && teacherStatus === '未加入' ? '加入后发表' : '发表话题' }}
          </el-button>
        </div>
        <article v-for="topic in topics" :key="topic.id" class="topic-post" @click="openTopic(topic)">
          <div class="avatar">{{ topic.author.slice(0, 1) }}</div>
          <div class="post-main">
            <div class="post-top">
              <span v-if="topic.pinned" class="pin"><el-icon><Top /></el-icon>置顶</span>
              <span v-if="topic.preset" class="preset-mark">管理员预设</span>
              <span class="topic-scope">{{ topic.scope || '整场教研' }}</span>
              <h3>{{ topic.title }}</h3>
              <el-button v-if="role === '管理视角'" link :icon="MoreFilled" @click.stop />
            </div>
            <p>{{ topic.content }}</p>
            <div class="post-footer">
              <span>{{ topic.author }} · {{ topic.role }} · {{ topic.time }}</span>
              <span><el-icon><ChatDotRound /></el-icon>{{ topic.replies.length }} 条回复</span>
            </div>
          </div>
        </article>
      </main>

      <aside class="discussion-side">
        <div class="side-card progress-card">
          <div class="card-head"><h3>研讨活跃度</h3><span>良好</span></div>
          <div class="ring"><strong>78</strong><span>活跃指数</span></div>
          <dl>
            <div><dt>已参与</dt><dd>{{ participatedCount }} / {{ item.participants }} 人</dd></div>
            <div><dt>话题</dt><dd>{{ topics.length }}</dd></div>
            <div><dt>回复</dt><dd>{{ totalReplies }}</dd></div>
          </dl>
        </div>
        <div class="side-card">
          <h3>研讨引导建议</h3>
          <ul class="guide-list">
            <li><el-icon><Star /></el-icon><span>已有多个观点涉及“介入时机”，可置顶形成焦点。</span></li>
            <li><el-icon><Promotion /></el-icon><span>还有 {{ absentParticipationCount }} 位教师尚未加入，可定向提醒。</span></li>
            <li><el-icon><Document /></el-icon><span>现场召开前可先生成观点摘要。</span></li>
          </ul>
          <el-button v-if="role === '管理视角'" plain class="full-button">生成研讨摘要</el-button>
        </div>
      </aside>
    </div>

    <div v-else-if="activeTab === '教研主题'" class="overview-grid">
      <div class="overview-main">
        <h2>教研目标</h2>
        <p>基于小六班连续三周的沙水游戏观察，幼儿多次尝试修复沟渠坍塌，但在结构加固、材料选择与同伴协作方面仍存在持续探究空间。</p>
        <h2>研讨安排</h2>
        <ol>
          <li>案例回看：聚焦关键片段，描述幼儿行为事实。</li>
          <li>教研记录：围绕介入时机与支持方式发表话题。</li>
          <li>现场共研：形成可验证的支持策略。</li>
          <li>实践回访：记录策略实施效果并完成小结。</li>
        </ol>
        <section class="preparation-files">
          <div class="preparation-files-head">
            <div>
              <h2>准备阶段上传的文件</h2>
              <p>发布教研主题前上传的素材已按文件格式归类，支持前端预览。</p>
            </div>
            <el-tag type="info" effect="plain">{{ preparationFiles.length }} 个文件</el-tag>
          </div>
          <div class="preparation-file-groups">
            <section v-for="group in preparationFileGroups" :key="group.key" class="preparation-file-group" :class="group.key">
              <header>
                <span><el-icon><component :is="group.icon" /></el-icon></span>
                <div><strong>{{ group.label }}</strong><small>{{ group.files.length }} 个文件</small></div>
              </header>
              <button
                v-for="file in group.files"
                :key="file.id"
                type="button"
                class="preparation-file-row"
                @click="openPreparationPreview(file)"
              >
                <span class="preparation-file-cover" :class="file.category">
                  <img v-if="file.category === 'video' || file.category === 'image'" :src="previewCover" alt="" />
                  <el-icon v-else><component :is="file.icon" /></el-icon>
                  <em>{{ file.extension }}</em>
                </span>
                <span class="preparation-file-meta">
                  <b>{{ file.name }}</b>
                  <small>{{ file.extension }} · {{ file.size }} · {{ file.source }}</small>
                </span>
                <span class="preparation-preview-action"><el-icon><View /></el-icon>预览</span>
              </button>
            </section>
          </div>
        </section>
      </div>
      <div class="overview-side">
        <h3>关联案例</h3>
        <div class="case-file"><el-icon><Document /></el-icon><div><strong>沙水区连续观察记录</strong><span>包含 3 段视频、12 张图片</span></div></div>
        <div class="case-file"><el-icon><Document /></el-icon><div><strong>幼儿对话与作品记录</strong><span>PDF · 8.4 MB</span></div></div>
      </div>
    </div>

    <div v-else-if="activeTab === '现场记录'" class="record-layout">
      <main class="record-main">
        <div class="section-title">
          <div><h2>现场记录</h2><p>归档线下会议资料，录音转写后由 AI 生成可编辑会议纪要。</p></div>
          <el-tag :type="currentStage >= 4 ? 'success' : 'warning'">{{ currentStage >= 4 ? '已归档' : '待完善' }}</el-tag>
        </div>

        <el-form label-position="top" :disabled="role === '教师视角'">
          <div class="two-cols">
            <el-form-item label="实际召开时间" required><el-input v-model="meeting.actualTime" :prefix-icon="Calendar" /></el-form-item>
            <el-form-item label="实际出勤"><el-input-number v-model="meeting.attendance" :min="0" :max="item.participants" /> <span class="attendance-note">人出勤，{{ meeting.absent }} 人缺席</span></el-form-item>
          </div>

          <div class="record-files">
            <article class="record-file-card">
              <span class="record-file-icon audio"><el-icon><Headset /></el-icon></span>
              <div class="record-file-main">
                <div><strong>上传录音及文档</strong><el-tag :type="recordingType" size="small">{{ recordingStatus }}</el-tag></div>
                <p v-if="recordingFileName">{{ recordingFileName }} · 46:28</p>
                <p v-else>支持 MP3、WAV、M4A 及 PDF、Word 等会议文档，单个文件不超过 500MB</p>
                <p v-if="meetingDocumentName" class="meeting-document-name">已添加文档：{{ meetingDocumentName }}</p>
                <div class="record-file-actions">
                  <el-upload action="#" :auto-upload="false" :show-file-list="false" accept="audio/*,.mp3,.wav,.m4a,.pdf,.doc,.docx" :on-change="handleMeetingFile">
                    <el-button :icon="UploadFilled">选择录音或文档</el-button>
                  </el-upload>
                  <el-button plain @click="startTranscription()">使用演示录音</el-button>
                </div>
              </div>
            </article>

            <article class="record-file-card">
              <span class="record-file-icon photo"><el-icon><PictureFilled /></el-icon></span>
              <div class="record-file-main">
                <div><strong>现场照片与视频</strong><el-tag type="info" size="small">已上传 6 项</el-tag></div>
                <p>用于补充空间布置、教师分组、观点板书等现场影像证据。</p>
                <el-upload action="#" :auto-upload="false" multiple><el-button :icon="UploadFilled">继续上传</el-button></el-upload>
              </div>
            </article>
          </div>

          <section v-if="false" class="ai-minutes-block">
            <div class="ai-minutes-head">
              <div>
                <span class="ai-mark"><el-icon><MagicStick /></el-icon></span>
                <div><strong>AI 会议纪要</strong><small>根据完整录音转写稿生成 Markdown 初稿，生成后主持人可编辑。</small></div>
              </div>
              <div>
                <el-tag :type="minutesType" size="small">{{ minutesStatus }}</el-tag>
                <el-button
                  type="primary"
                  plain
                  :icon="MagicStick"
                  :loading="minutesStatus === '生成中'"
                  :disabled="recordingStatus !== '转写完成'"
                  @click="generateMinutes"
                >
                  {{ minutesStatus === '已生成' ? '重新生成' : 'AI 生成纪要' }}
                </el-button>
              </div>
            </div>
            <el-input
              v-if="minutesStatus === '已生成'"
              v-model="meeting.note"
              type="textarea"
              :rows="12"
              maxlength="6000"
              show-word-limit
              placeholder="AI 生成后可在这里编辑 Markdown 会议纪要"
            />
            <el-alert
              v-else
              title="会议纪要不能从空白手工新建。请先上传录音并完成转写，再由 AI 生成初稿。"
              type="info"
              show-icon
              :closable="false"
            />
            <p v-if="minutesStatus === '已生成'" class="markdown-tip">Markdown 格式 · 支持标题、列表、行动项等结构，保存时保留编辑版本。</p>
          </section>
        </el-form>

        <div class="record-footer">
          <span>现场资料保存后，可在“成果文件”中生成 AI 会议纪要与后续成果。</span>
          <el-button
            v-if="role === '管理视角' && currentStage < 4"
            type="primary"
            :icon="CircleCheck"
            @click="confirmRecord"
          >
            确认记录并进入总结
          </el-button>
        </div>
      </main>

      <aside class="record-side">
        <div class="side-card">
          <h3>归档检查</h3>
          <ul class="record-checks">
            <li class="done"><el-icon><CircleCheck /></el-icon><span>实际时间与出勤</span></li>
            <li :class="{ done: recordingStatus === '转写完成' || meetingDocumentName }"><el-icon><CircleCheck /></el-icon><span>录音、文档与转写稿（可选）</span></li>
            <li class="done"><el-icon><CircleCheck /></el-icon><span>现场照片与视频</span></li>
            <li :class="{ done: minutesStatus === '已生成' }"><el-icon><CircleCheck /></el-icon><span>AI 会议纪要（Markdown）</span></li>
          </ul>
        </div>
        <div class="side-card transcript-card">
          <div class="card-head"><h3>录音转写</h3><el-tag :type="recordingType" size="small">{{ recordingStatus }}</el-tag></div>
          <template v-if="recordingStatus === '转写完成'">
            <p><b>14:08 王鹏：</b>我们先不讨论教师该怎么做，先回到视频里看看幼儿是在哪里发现沟渠开始坍塌的。</p>
            <p><b>14:11 黄曼丽：</b>第二次尝试时，幼儿已经开始比较水流方向，但还没有形成稳定的记录方式。</p>
            <el-button link type="primary">查看完整转写稿</el-button>
          </template>
          <el-empty v-else :image-size="64" description="上传录音后生成转写稿" />
        </div>
      </aside>
    </div>

    <div v-else-if="activeTab === '成果文件'" class="result-panel">
      <template v-if="currentStage >= 2 && (role === '管理视角' || currentStatus === '已完成')">
        <div class="result-page-head">
          <div>
            <h2>{{ role === '管理视角' ? '成果沉淀' : '教研成果' }}</h2>
            <p>先完成每个案例的小结，再汇总整次教研结论，最终打包本次会议的全部归档资料。</p>
          </div>
          <el-tag :type="currentStatus === '已完成' ? 'success' : 'warning'" effect="light">
            {{ currentStatus === '已完成' ? '全部成果已完成' : '成果整理中' }}
          </el-tag>
        </div>

        <section class="meeting-output-section">
          <div class="result-section-head"><div><span>01</span><div><h3>AI 会议纪要</h3><p>录音转写完成后生成 Markdown 初稿，主持人可继续编辑。</p></div></div><el-tag :type="minutesType" effect="plain">{{ minutesStatus }}</el-tag></div>
          <div class="meeting-output-body"><el-input v-if="minutesStatus === '已生成'" v-model="meeting.note" type="textarea" :rows="8" placeholder="AI 生成后可编辑会议纪要" /><el-alert v-else title="先在“现场记录”上传录音并完成转写，即可生成会议纪要。" type="info" :closable="false" show-icon /><el-button v-if="role === '管理视角'" type="primary" plain :disabled="recordingStatus !== '转写完成'" :loading="minutesStatus === '生成中'" @click="generateMinutes">{{ minutesStatus === '已生成' ? '重新生成纪要' : 'AI 生成纪要' }}</el-button></div>
        </section>

        <div class="result-progress">
          <div class="result-progress-step" :class="{ done: allCasesCompleted }">
            <span><el-icon><Document /></el-icon></span>
            <div><strong>案例小结 {{ caseCompletedCount }}/{{ caseResults.length }}</strong><small>每个案例独立形成小结</small></div>
          </div>
          <i></i>
          <div class="result-progress-step" :class="{ done: overallSummaryStatus === '已完成' }">
            <span><el-icon><CircleCheck /></el-icon></span>
            <div><strong>教研总结</strong><small>{{ overallSummaryStatus }}</small></div>
          </div>
          <i></i>
          <div class="result-progress-step" :class="{ done: archiveStatus === '已完成' }">
            <span><el-icon><FolderOpened /></el-icon></span>
            <div><strong>会议归档包</strong><small>{{ archiveStatus }}</small></div>
          </div>
        </div>

        <section class="case-summary-section">
          <div class="result-section-head">
            <div><span>01</span><div><h3>案例小结</h3><p>每个关联案例分别总结，保留问题、证据、观点与支持策略。</p></div></div>
            <strong>{{ caseCompletedCount }}/{{ caseResults.length }} 已完成</strong>
          </div>

          <div class="case-result-list">
            <article v-for="caseItem in caseResults" :key="caseItem.id" class="case-result-row">
              <div class="case-order">案例 {{ caseItem.id }}</div>
              <div class="case-result-main">
                <div class="case-result-title">
                  <strong>{{ caseItem.title }}</strong>
                  <el-tag :type="resultStatusType(caseItem.status)" size="small" effect="plain">{{ caseItem.status }}</el-tag>
                </div>
                <p>{{ caseItem.className }} · 提交教师 {{ caseItem.teacher }}</p>
                <div class="case-evidence">
                  <span>{{ caseItem.topics }} 个关联话题 · {{ caseItem.replies }} 条回复</span>
                  <span>{{ caseItem.evidence }}</span>
                </div>
              </div>
              <div class="case-result-action">
                <el-button
                  v-if="caseItem.status === '已完成'"
                  plain
                  @click="openResult(`${caseItem.title}｜案例小结`, caseItem.summary)"
                >
                  {{ role === '管理视角' ? '查看编辑' : '查看小结' }}
                </el-button>
                <el-button
                  v-else-if="role === '管理视角'"
                  type="primary"
                  :loading="generatingResult === `case-${caseItem.id}`"
                  @click="generateCaseSummary(caseItem)"
                >
                  生成案例小结
                </el-button>
              </div>
            </article>
          </div>
        </section>

        <section class="overall-result-section" :class="{ locked: !allCasesCompleted }">
          <div class="result-section-head">
            <div><span>02</span><div><h3>整次教研总结</h3><p>汇总全部案例结论、在线讨论、现场纪要与后续行动。</p></div></div>
            <el-tag :type="resultStatusType(overallSummaryStatus)" effect="plain">{{ overallSummaryStatus }}</el-tag>
          </div>
          <div class="overall-result-body">
            <div class="result-source-list">
              <span><el-icon><CircleCheck /></el-icon>{{ caseResults.length }} 份案例小结</span>
              <span><el-icon><CircleCheck /></el-icon>{{ topics.length }} 个研讨话题</span>
              <span><el-icon><CircleCheck /></el-icon>录音转写与 AI 会议纪要</span>
              <span><el-icon><CircleCheck /></el-icon>{{ item.participants }} 位教师参与记录</span>
            </div>
            <div class="overall-action">
              <p v-if="!allCasesCompleted">完成全部案例小结后即可生成教研总结。</p>
              <p v-else-if="overallSummaryStatus !== '已完成'">资料已齐备，可生成整次教研总结。</p>
              <p v-else>教研总结已完成，可继续打包本次会议归档资料。</p>
              <el-button
                v-if="overallSummaryStatus === '已完成'"
                plain
                @click="openResult('整次教研总结', '本次教研围绕幼儿在沙水游戏中的工程问题与协作过程展开。教师形成了先观察、再提问、以证据支持协商的共同策略，并明确了后续实践回访安排。')"
              >
                {{ role === '管理视角' ? '查看编辑' : '查看总结' }}
              </el-button>
              <el-button
                v-else-if="role === '管理视角'"
                type="primary"
                :disabled="!allCasesCompleted"
                :loading="generatingResult === 'overall'"
                @click="generateOverallSummary"
              >
                生成教研总结
              </el-button>
            </div>
          </div>
        </section>

        <section class="meeting-output-section evaluation-output">
          <div class="result-section-head"><div><span>04</span><div><h3>AI 会议评价</h3><p>综合会议纪要、教研总结和参与记录，形成可执行的改进建议。</p></div></div><el-tag :type="meetingEvaluationStatus === '已生成' ? 'success' : meetingEvaluationStatus === '生成中' ? 'warning' : 'info'" effect="plain">{{ meetingEvaluationStatus }}</el-tag></div>
          <div class="meeting-output-body"><p v-if="meetingEvaluationStatus === '已生成'" class="evaluation-copy">本次教研聚焦明确，教师围绕观察事实展开讨论；建议下一轮增加实践回访的证据对照，持续追踪支持策略的有效性。</p><p v-else>完成会议纪要与教研总结后，即可由 AI 生成会议评价。</p><el-button v-if="role === '管理视角'" type="primary" plain :disabled="minutesStatus !== '已生成' || overallSummaryStatus !== '已完成'" :loading="meetingEvaluationStatus === '生成中'" @click="generateMeetingEvaluation">AI 生成会议评价</el-button></div>
        </section>

        <section class="report-result-section archive-result-section" :class="{ locked: overallSummaryStatus !== '已完成' }">
          <div class="report-icon"><el-icon><FolderOpened /></el-icon></div>
          <div>
            <h3>本次会议归档</h3>
            <p>将文字、图片、视频、录音、转写稿、AI 会议纪要、案例小结和教研总结压缩为 ZIP 包。</p>
            <div class="archive-file-types">
              <span><el-icon><Document /></el-icon>文字与文档</span>
              <span><el-icon><PictureFilled /></el-icon>图片</span>
              <span><el-icon><VideoCamera /></el-icon>视频</span>
              <span><el-icon><Headset /></el-icon>录音</span>
            </div>
          </div>
          <el-tag :type="resultStatusType(archiveStatus)" effect="plain">{{ archiveStatus }}</el-tag>
          <el-button
            v-if="archiveStatus === '已完成'"
            type="primary"
            plain
            :icon="Download"
            @click="ElMessage.success('归档包下载任务已创建：沙水游戏专题教研_20260806.zip')"
          >
            下载归档包
          </el-button>
          <el-button
            v-else-if="role === '管理视角'"
            type="primary"
            :disabled="overallSummaryStatus !== '已完成'"
            :loading="generatingResult === 'archive'"
            @click="generateArchive"
          >
            打包归档并完成教研
          </el-button>
        </section>
      </template>
      <el-empty
        v-else-if="role === '教师视角' && currentStage >= 4"
        description="教研成果正在整理，发布后即可查看"
      />
      <el-empty v-else description="完成现场记录后，才能生成案例小结、教研总结与会议归档包" />
    </div>

    <el-empty v-else description="18 位教师已加入本次教研" />

    <el-dialog v-model="filePreviewVisible" width="920px" top="5vh" class="preparation-preview-dialog">
      <template #header>
        <div class="preview-dialog-title">
          <span class="preview-file-mark"><el-icon><component :is="previewFile?.icon || Document" /></el-icon></span>
          <div><small>教研准备 / {{ previewFile?.source }}</small><strong>{{ previewFile?.name }}</strong></div>
          <el-tag effect="plain">{{ previewFile?.extension }}</el-tag>
        </div>
      </template>
      <div v-if="previewFile" class="preparation-preview-body">
        <div class="preview-toolbar">
          <span>{{ previewFile.size }} · 上传于 2026-08-02</span>
          <span>准备素材 · 仅供本次教研参与人查看</span>
        </div>
        <div v-if="previewFile.category === 'video'" class="media-preview video-preview">
          <img :src="previewCover" alt="沙水游戏观察视频封面" />
          <div class="video-center-control"><span class="preview-play">▶</span><strong>沙水游戏连续观察</strong><small>关键片段 · 03:42</small></div>
          <div class="video-control-bar"><span>00:00</span><i><b></b></i><span>03:42</span><el-icon><VideoCamera /></el-icon><el-icon><MoreFilled /></el-icon></div>
        </div>
        <div v-else-if="previewFile.category === 'image'" class="media-preview image-preview">
          <img :src="previewCover" alt="沙水区沟渠现场照片" />
          <div class="image-caption"><strong>沙水区沟渠现场照片</strong><span>观察区域 · 小六班 · 2026-07-28</span></div>
        </div>
        <div v-else-if="previewFile.category === 'audio'" class="audio-preview">
          <div class="audio-cover"><el-icon><Headset /></el-icon><span>访谈</span></div>
          <div class="audio-content"><span class="audio-kicker">教师访谈录音</span><strong>前期教师访谈：幼儿如何理解沟渠坍塌</strong><div class="audio-wave"><i v-for="(height, index) in audioWave" :key="index" :style="{ height: `${height}px` }" :class="{ active: index < 12 }"></i></div><div class="audio-time"><span>00:36</span><span>08:17</span></div></div>
          <button type="button" class="audio-play"><span>▶</span></button>
        </div>
        <article v-else class="document-preview">
          <aside class="document-thumbnails"><span>1 / 3</span><div class="document-thumb active"><i></i><i></i><i></i><i></i></div><div class="document-thumb"><i></i><i></i><i></i></div><div class="document-thumb"><i></i><i></i></div></aside>
          <div class="document-preview-paper"><span class="document-format">{{ previewFile.extension }}</span><p class="document-eyebrow">案例教研 · 准备材料</p><h2>{{ previewFile.name.replace(/\.[^.]+$/, '') }}</h2><p>本文件为教研准备阶段上传的资料，供参与教师在进入研讨前回看观察事实、活动方案与引导问题。</p><h3>内容摘要</h3><ul><li>聚焦幼儿在沙水游戏中的连续探究行为。</li><li>整理关键观察片段与教师提问方向。</li><li>为在线研讨提供共同的事实依据。</li></ul><footer>第 1 页</footer></div>
        </article>
      </div>
      <template #footer><span class="preview-footer-tip">在线预览模式</span><el-button @click="filePreviewVisible = false">关闭</el-button><el-button type="primary" plain :icon="Download">下载原文件</el-button></template>
    </el-dialog>

    <el-dialog v-model="resultDialog" :title="resultDialogTitle" width="680px">
      <div class="markdown-editor-label"><span>Markdown 内容</span><small>{{ role === '教师视角' ? '只读查看' : '支持编辑后保存' }}</small></div>
      <el-input
        v-model="resultDraft"
        type="textarea"
        :rows="12"
        :readonly="role === '教师视角'"
      />
      <template #footer>
        <el-button @click="resultDialog = false">关闭</el-button>
        <el-button v-if="role === '管理视角'" type="primary" @click="resultDialog = false; ElMessage.success('成果内容已保存')">保存修改</el-button>
      </template>
    </el-dialog>

    <el-drawer v-model="memberDrawer" size="440px" direction="rtl" class="member-drawer">
      <template #header>
        <div class="drawer-title">
          <span>参与成员</span>
          <small>{{ joinedCount }}/{{ participants.length }} 已加入 · {{ participatedCount }} 人已参与讨论</small>
        </div>
      </template>
      <div class="member-drawer-body">
        <div class="member-drawer-summary">
          <div><strong>{{ topics.length }}</strong><span>话题</span></div>
          <div><strong>{{ totalReplies }}</strong><span>回复</span></div>
          <div><strong>{{ participatedCount }}</strong><span>活跃成员</span></div>
        </div>
        <div class="member-drawer-tools">
          <span>活跃度根据成员发表话题和回复数量计算</span>
          <el-button
            v-if="role === '管理视角'"
            size="small"
            plain
            :icon="Bell"
            @click="ElMessage.success(`已提醒 ${absentParticipationCount} 位待参与教师`)"
          >
            提醒待参与
          </el-button>
        </div>
        <div class="member-drawer-list">
          <article
            v-for="member in participants"
            :key="member.name"
            class="member-drawer-row"
            :class="{ current: member.current && role === '教师视角' }"
          >
            <div class="member-avatar" :style="{ background: member.color }">{{ member.name.slice(-1) }}</div>
            <div class="member-info">
              <div>
                <strong>{{ member.name }}</strong>
                <span v-if="member.current && role === '教师视角'" class="member-self">我</span>
                <span v-if="member.role !== '教师'" class="member-role">{{ member.role }}</span>
              </div>
              <span>{{ member.className }} · {{ member.topicCount }} 个话题 · {{ member.replyCount }} 条回复</span>
            </div>
            <el-tag size="small" effect="plain" :type="memberActivity(member).type">
              {{ memberActivity(member).label }}
            </el-tag>
          </article>
        </div>
      </div>
    </el-drawer>

    <el-dialog v-model="topicDialog" title="发表研讨话题" width="560px">
      <el-form label-position="top">
        <el-form-item label="关联范围" required>
          <el-select v-model="topicScope" style="width: 100%">
            <el-option label="整场教研" value="整场教研" />
            <el-option
              v-for="caseItem in caseResults"
              :key="caseItem.id"
              :label="`案例${caseItem.id}：${caseItem.title}`"
              :value="`案例${caseItem.id}：${caseItem.title}`"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="话题标题" required><el-input v-model="topicTitle" maxlength="60" show-word-limit placeholder="用一个具体问题开启讨论" /></el-form-item>
        <el-form-item label="观点说明"><el-input v-model="topicContent" type="textarea" :rows="6" placeholder="补充你的观察、判断或希望大家回应的内容" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="topicDialog = false">取消</el-button><el-button type="primary" @click="addTopic">发布话题</el-button></template>
    </el-dialog>

    <el-drawer v-model="replyDrawer" size="520px" direction="rtl">
      <template #header><div class="drawer-title"><span>话题讨论</span><small>{{ selectedTopic?.replies.length || 0 }} 条回复</small></div></template>
      <div v-if="selectedTopic" class="reply-drawer">
        <article class="original-post"><span>{{ selectedTopic.author }} · {{ selectedTopic.time }}</span><h2>{{ selectedTopic.title }}</h2><p>{{ selectedTopic.content }}</p></article>
        <div class="reply-list">
          <article v-for="reply in selectedTopic.replies" :key="reply.id"><div class="avatar small">{{ reply.author.slice(0, 1) }}</div><div><strong>{{ reply.author }} <small>{{ reply.time }}</small></strong><p>{{ reply.content }}</p></div></article>
          <el-empty v-if="!selectedTopic.replies.length" description="还没有回复，来发表第一个观点吧" :image-size="72" />
        </div>
        <div class="reply-box"><el-input v-model="replyText" type="textarea" :rows="4" placeholder="回应观点，支持 @ 提及参与教师" /><div><span>Ctrl + Enter 快捷发送</span><el-button type="primary" @click="addReply">发表回复</el-button></div></div>
      </div>
    </el-drawer>
  </section>
</template>
