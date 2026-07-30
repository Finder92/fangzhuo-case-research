<script setup>
import { computed, nextTick, reactive, ref } from 'vue'
import {
  ArrowLeft, Plus, ChatDotRound, User, Calendar, Location, Bell,
  MoreFilled, Top, Star, Document, Promotion, CircleCheck, Clock,
  Headset, PictureFilled, UploadFilled, Tickets
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
const activeTab = ref(
  currentStage.value >= 5 ? '成果文件' : currentStage.value === 4 ? '现场记录' : '研讨话题',
)
const topicDialog = ref(false)
const replyDrawer = ref(false)
const selectedTopic = ref(null)
const topicTitle = ref('')
const topicContent = ref('')
const topicScope = ref('整场教研')
const replyText = ref('')
const topics = ref(structuredClone(seedTopics).map((topic, index) => ({
  ...topic,
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
])
const recordingStatus = ref(currentStage.value >= 5 ? '转写完成' : '待上传')
const recordingFileName = ref(
  currentStage.value >= 5 ? '沙水游戏专题教研现场录音.m4a' : '',
)
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
const reportStatus = ref(props.item.status === '已完成' ? '已完成' : '待生成')
const generatingResult = ref('')
const resultDialog = ref(false)
const resultDialogTitle = ref('')
const resultDraft = ref('')
const scrollPageTop = () => nextTick(() => window.scrollTo({ top: 0 }))

const meeting = reactive({
  actualTime: '2026-08-06 14:05',
  attendance: 16,
  absent: 2,
  note: '围绕幼儿在沟渠坍塌问题中的连续尝试，重点讨论了教师介入时机、同伴协商以及记录工具的使用。',
})

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
  2: ['在线研讨正在进行', '建议主持人及时回应话题，并在现场召开前整理关键观点。'],
  3: ['等待现场教研召开', '在线研讨已完成，请按计划召开教研会并做好现场记录。'],
  4: ['请完善现场记录', '补充出勤、现场纪要、照片和录音；录音可自动转写。'],
  5: ['进入成果沉淀', '现场资料已归档，可以逐个生成案例小结，再形成整次教研总结与归档报告。'],
}[currentStage.value]))

const statusType = computed(() => ({
  草稿: 'info',
  研讨中: 'success',
  待召开: 'warning',
  现场记录: 'warning',
  待总结: 'danger',
  已完成: 'info',
}[currentStatus.value]))

const recordingType = computed(() => ({
  待上传: 'info',
  转写中: 'warning',
  转写完成: 'success',
}[recordingStatus.value]))

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
  if (currentStage.value >= 5) {
    activeTab.value = '成果文件'
    return
  }
  if (teacherStatus.value === '未加入') return joinResearch()
  if (currentStage.value <= 2) {
    activeTab.value = '研讨话题'
    if (teacherStatus.value === '已加入') topicDialog.value = true
    return
  }
  if (currentStage.value <= 4 && teacherStatus.value !== '已出席') return checkIn()
}

const teacherActionLabel = computed(() => {
  if (currentStage.value >= 5) return '查看成果'
  if (teacherStatus.value === '未加入') return '加入本次教研'
  if (currentStage.value <= 2) return teacherStatus.value === '已加入' ? '发表观点' : '继续研讨'
  if (currentStage.value <= 4) return teacherStatus.value === '已出席' ? '已出席' : '现场签到'
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

const generateReport = () => {
  if (overallSummaryStatus.value !== '已完成') return
  generatingResult.value = 'report'
  reportStatus.value = '生成中'
  setTimeout(() => {
    reportStatus.value = '已完成'
    generatingResult.value = ''
    updateStatus('已完成', 5, 100)
    ElMessage.success('教研报告已生成，本次教研已完成')
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
    '结束研讨后将进入“现场记录”。请补充出勤、照片、现场纪要，并按需上传录音进行转写。',
    '结束研讨并归档现场？',
    {
      confirmButtonText: '进入现场记录',
      cancelButtonText: '暂不结束',
      type: 'warning',
    },
  ).then(() => {
    updateStatus('现场记录', 4, 78)
    activeTab.value = '现场记录'
    scrollPageTop()
    ElMessage.success('已进入现场记录，请完善本次教研资料')
  }).catch(() => {})
}

const openPrimaryAction = () => {
  if (currentStage.value < 4) return enterRecordStage()
  if (currentStage.value === 4) {
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
  setTimeout(() => {
    recordingStatus.value = '转写完成'
    ElMessage.success('录音转写完成，已生成可编辑的文字稿')
  }, 900)
}

const handleRecording = (file) => startTranscription(file.name)

const confirmRecord = () => {
  updateStatus('待总结', 5, 90)
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
        <el-button v-if="role === '管理视角'" :icon="Bell">通知参与人</el-button>
        <el-button
          v-if="role === '管理视角' && currentStatus !== '已完成'"
          type="primary"
          :icon="CircleCheck"
          @click="openPrimaryAction"
        >
          {{ currentStage < 4 ? '结束教研' : currentStage === 4 ? '完善现场记录' : '整理教研成果' }}
        </el-button>
        <el-button
          v-if="role === '教师视角'"
          type="primary"
          :icon="teacherStatus === '已出席' ? CircleCheck : User"
          :disabled="currentStage <= 4 && teacherStatus === '已出席'"
          @click="openTeacherAction"
        >
          {{ teacherActionLabel }}
        </el-button>
        <el-button v-if="role === '管理视角'" :icon="MoreFilled" circle aria-label="更多操作" />
      </div>
    </header>

    <div class="detail-stage-card">
      <StageTrack :current="currentStage" :completed="currentStatus === '已完成'" />
      <div class="stage-hint">
        <el-icon><Clock /></el-icon>
        <div><strong>{{ stageHint[0] }}</strong><span>{{ stageHint[1] }}</span></div>
      </div>
    </div>

    <div class="detail-meta-bar">
      <span><el-icon><User /></el-icon>主持人 {{ item.host }}</span>
      <span><el-icon><Calendar /></el-icon>{{ item.date }}</span>
      <span><el-icon><Location /></el-icon>三楼多功能教室</span>
      <span><el-icon><User /></el-icon>{{ item.participants }} 位参与教师</span>
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
        v-for="tab in ['教研概览', '研讨话题', '参与成员', '现场记录', '成果文件']"
        :key="tab"
        :class="{ active: activeTab === tab }"
        @click="activeTab = tab"
      >
        {{ tab }}
        <span v-if="tab === '研讨话题'">{{ topics.length }}</span>
        <span v-else-if="tab === '参与成员'">{{ joinedCount }}</span>
      </button>
    </div>

    <div v-if="activeTab === '研讨话题'" class="discussion-layout">
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

    <div v-else-if="activeTab === '教研概览'" class="overview-grid">
      <div class="overview-main">
        <h2>主题依据</h2>
        <p>基于小六班连续三周的沙水游戏观察，幼儿多次尝试修复沟渠坍塌，但在结构加固、材料选择与同伴协作方面仍存在持续探究空间。</p>
        <h2>研讨安排</h2>
        <ol>
          <li>案例回看：聚焦关键片段，描述幼儿行为事实。</li>
          <li>在线研讨：围绕介入时机与支持方式发表话题。</li>
          <li>现场共研：形成可验证的支持策略。</li>
          <li>实践回访：记录策略实施效果并完成小结。</li>
        </ol>
      </div>
      <div class="overview-side">
        <h3>关联案例</h3>
        <div class="case-file"><el-icon><Document /></el-icon><div><strong>沙水区连续观察记录</strong><span>包含 3 段视频、12 张图片</span></div></div>
        <div class="case-file"><el-icon><Document /></el-icon><div><strong>幼儿对话与作品记录</strong><span>PDF · 8.4 MB</span></div></div>
      </div>
    </div>

    <div v-else-if="activeTab === '参与成员'" class="members-panel">
      <div class="members-head">
        <div>
          <h2>教研参与成员</h2>
          <p>查看参与教师的姓名、所在班级及当前参与状态。</p>
        </div>
        <el-button
          v-if="role === '管理视角'"
          :icon="Bell"
          plain
          @click="ElMessage.success(`已提醒 ${absentParticipationCount} 位未加入教师`)"
        >
          提醒未加入教师
        </el-button>
      </div>

      <div class="member-summary">
        <div><strong>{{ participants.length }}</strong><span>应参与教师</span></div>
        <div><strong>{{ joinedCount }}</strong><span>已加入教研</span></div>
        <div><strong>{{ participatedCount }}</strong><span>已参与研讨</span></div>
        <div><strong>{{ absentParticipationCount }}</strong><span>尚未加入</span></div>
      </div>

      <div class="member-grid">
        <article
          v-for="member in participants"
          :key="member.name"
          class="member-card"
          :class="{ current: member.current && role === '教师视角' }"
        >
          <div class="member-avatar" :style="{ background: member.color }">
            {{ member.name.slice(-1) }}
          </div>
          <div class="member-info">
            <div>
              <strong>{{ member.name }}</strong>
              <span v-if="member.current && role === '教师视角'" class="member-self">我</span>
              <span v-if="member.role !== '教师'" class="member-role">{{ member.role }}</span>
            </div>
            <span>{{ member.className }}</span>
          </div>
          <el-tag
            size="small"
            effect="plain"
            :type="memberStatusType(member.status)"
          >
            {{ member.status }}
          </el-tag>
        </article>
      </div>
    </div>

    <div v-else-if="activeTab === '现场记录'" class="record-layout">
      <main class="record-main">
        <div class="section-title">
          <div><h2>现场记录</h2><p>归档实际召开情况，录音上传后可自动生成转写稿。</p></div>
          <el-tag :type="currentStage >= 5 ? 'success' : 'warning'">{{ currentStage >= 5 ? '已归档' : '待完善' }}</el-tag>
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
                <div><strong>现场录音</strong><el-tag :type="recordingType" size="small">{{ recordingStatus }}</el-tag></div>
                <p v-if="recordingFileName">{{ recordingFileName }} · 46:28</p>
                <p v-else>支持 MP3、WAV、M4A，单个文件不超过 500MB</p>
                <div class="record-file-actions">
                  <el-upload action="#" :auto-upload="false" :show-file-list="false" accept="audio/*,.mp3,.wav,.m4a" :on-change="handleRecording">
                    <el-button :icon="UploadFilled">选择录音文件</el-button>
                  </el-upload>
                  <el-button plain @click="startTranscription()">使用演示录音</el-button>
                </div>
              </div>
            </article>

            <article class="record-file-card">
              <span class="record-file-icon photo"><el-icon><PictureFilled /></el-icon></span>
              <div class="record-file-main">
                <div><strong>现场照片与附件</strong><el-tag type="info" size="small">已上传 6 项</el-tag></div>
                <p>用于补充空间布置、教师分组、观点板书等现场证据。</p>
                <el-upload action="#" :auto-upload="false" multiple><el-button :icon="UploadFilled">继续上传</el-button></el-upload>
              </div>
            </article>
          </div>

          <el-form-item label="主持人现场纪要">
            <el-input v-model="meeting.note" type="textarea" :rows="7" maxlength="3000" show-word-limit placeholder="记录现场形成的关键观点、共识、分歧和后续行动" />
          </el-form-item>
        </el-form>

        <div class="record-footer">
          <span>录音为可选项；没有录音时，可直接使用主持人纪要生成成果。</span>
          <el-button
            v-if="role === '管理视角' && currentStage < 5"
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
            <li :class="{ done: recordingStatus === '转写完成' }"><el-icon><CircleCheck /></el-icon><span>录音与转写稿（可选）</span></li>
            <li class="done"><el-icon><CircleCheck /></el-icon><span>现场照片与附件</span></li>
            <li class="done"><el-icon><CircleCheck /></el-icon><span>主持人现场纪要</span></li>
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
      <template v-if="currentStage >= 5 && (role === '管理视角' || currentStatus === '已完成')">
        <div class="result-page-head">
          <div>
            <h2>{{ role === '管理视角' ? '成果沉淀' : '教研成果' }}</h2>
            <p>先完成每个案例的小结，再汇总整次教研结论，最终形成可归档的教研报告。</p>
          </div>
          <el-tag :type="currentStatus === '已完成' ? 'success' : 'warning'" effect="light">
            {{ currentStatus === '已完成' ? '全部成果已完成' : '成果整理中' }}
          </el-tag>
        </div>

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
          <div class="result-progress-step" :class="{ done: reportStatus === '已完成' }">
            <span><el-icon><Tickets /></el-icon></span>
            <div><strong>归档报告</strong><small>{{ reportStatus }}</small></div>
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
              <span><el-icon><CircleCheck /></el-icon>现场纪要与录音转写</span>
              <span><el-icon><CircleCheck /></el-icon>{{ item.participants }} 位教师参与记录</span>
            </div>
            <div class="overall-action">
              <p v-if="!allCasesCompleted">完成全部案例小结后即可生成教研总结。</p>
              <p v-else-if="overallSummaryStatus !== '已完成'">资料已齐备，可生成整次教研总结。</p>
              <p v-else>教研总结已完成，可继续生成归档报告。</p>
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

        <section class="report-result-section" :class="{ locked: overallSummaryStatus !== '已完成' }">
          <div class="report-icon"><el-icon><Tickets /></el-icon></div>
          <div>
            <h3>教研归档报告</h3>
            <p>整合案例小结、教研总结、成员参与和现场资料，形成一份完整归档文件。</p>
          </div>
          <el-tag :type="resultStatusType(reportStatus)" effect="plain">{{ reportStatus }}</el-tag>
          <el-button
            v-if="reportStatus === '已完成'"
            type="primary"
            plain
            @click="openResult('教研归档报告', '报告已整合本次教研的主题方案、两份案例小结、整次教研总结、参与记录、现场纪要与录音转写，可用于园本教研归档与成果分享。')"
          >
            {{ role === '管理视角' ? '预览报告' : '查看报告' }}
          </el-button>
          <el-button
            v-else-if="role === '管理视角'"
            type="primary"
            :disabled="overallSummaryStatus !== '已完成'"
            :loading="generatingResult === 'report'"
            @click="generateReport"
          >
            生成并完成教研
          </el-button>
        </section>
      </template>
      <el-empty
        v-else-if="role === '教师视角' && currentStage >= 5"
        description="教研成果正在整理，发布后即可查看"
      />
      <el-empty v-else description="完成现场记录后，才能生成小结、总结与分析报告" />
    </div>

    <el-empty v-else description="18 位教师已加入本次教研" />

    <el-dialog v-model="resultDialog" :title="resultDialogTitle" width="680px">
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
