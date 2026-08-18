<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { MagicStick, Search, Connection, RefreshRight, VideoPlay, Check, CircleCheck, DocumentAdd } from '@element-plus/icons-vue'
import { observations } from '../data/observations'

const emit = defineEmits(['generate-advice'])
const selected = ref([])
const activeRecordTab = ref('original')
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
const mergeVisible = ref(false)
const mergeRecords = ref([])
const combinedDetailVisible = ref(false)
const activeCombinedRecord = ref(null)
const mergeForm = reactive({ title: '', content: '' })
const combinedRecords = ref([
  {
    id: 'combined-1',
    title: '从独立搭建到共同规划：幼儿协商与材料替代的连续观察',
    content: '连续三次观察显示，幼儿从各自搭建逐步形成共同目标，并能在材料不足时提出替代方案。教师主要通过回看照片、追问计划和保留调整痕迹支持幼儿持续协商。',
    sourceIds: [1, 4, 6],
    sourceCount: 3,
    dateRange: '2026-07-20 — 2026-07-28',
    children: ['乐乐', '米米', '安安'],
    teacher: '李老师',
    updated: '今天 10:26',
    caseStatus: '已生成案例',
  },
  {
    id: 'combined-2',
    title: '角色游戏中的主动协商：从轮换角色到共同解决问题',
    content: '幼儿在邮局和小医院两次角色游戏中，都尝试用轮换、说明理由和重新分工的方式解决冲突。组合观察保留了两次现场记录的时间顺序和关键对话。',
    sourceIds: [3, 8],
    sourceCount: 2,
    dateRange: '2026-07-18 — 2026-07-25',
    children: ['轩轩', '珺珺'],
    teacher: '王老师',
    updated: '昨天 16:40',
    caseStatus: '未生成案例',
  },
  {
    id: 'combined-3',
    title: '持续探究中的预测与验证：水流、植物与动物观察',
    content: '把三类自然观察按“提出问题—持续记录—调整判断”的线索重新组织，便于教师后续形成跨活动场景的学习品质案例。',
    sourceIds: [5, 6, 9],
    sourceCount: 3,
    dateRange: '2026-07-17 — 2026-07-21',
    children: ['安安', '森森'],
    teacher: '韩老师',
    updated: '08月15日',
    caseStatus: '未生成案例',
  },
])

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

const buildMergedObservation = (records) => records
  .map((record, index) => `### ${index + 1}. ${record.date}｜${record.title}\n\n${record.record}\n\n教师分析：${record.analysis}`)
  .join('\n\n')

const openMerge = () => {
  if (selected.value.length < 2) return ElMessage.warning('请至少选择 2 篇观察记录')
  mergeRecords.value = [...selected.value].sort((a, b) => a.date.localeCompare(b.date))
  const children = [...new Set(mergeRecords.value.flatMap((record) => record.children))]
  mergeForm.title = `${children.slice(0, 2).join('、')}的连续观察｜${mergeRecords.value[0].title}`
  mergeForm.content = buildMergedObservation(mergeRecords.value)
  mergeVisible.value = true
}

const saveCombinedObservation = (generateCase) => {
  if (!mergeForm.title.trim() || !mergeForm.content.trim()) return ElMessage.warning('请完善组合观察标题和内容')
  const orderedDates = mergeRecords.value.map((record) => record.date).sort()
  combinedRecords.value.unshift({
    id: `combined-${Date.now()}`,
    title: mergeForm.title.trim(),
    content: mergeForm.content.trim(),
    sourceIds: mergeRecords.value.map((record) => record.id),
    sourceCount: mergeRecords.value.length,
    dateRange: `${orderedDates[0]} — ${orderedDates.at(-1)}`,
    children: [...new Set(mergeRecords.value.flatMap((record) => record.children))],
    teacher: [...new Set(mergeRecords.value.map((record) => record.teacher))].join('、'),
    updated: '刚刚',
    caseStatus: generateCase ? '已生成案例' : '未生成案例',
  })
  mergeVisible.value = false
  selected.value = []
  activeRecordTab.value = 'combined'
  ElMessage.success(generateCase ? '组合观察已保存，并已进入案例生成' : '组合观察已保存，可稍后继续生成案例')
}

const openCombinedDetail = (record) => {
  activeCombinedRecord.value = record
  combinedDetailVisible.value = true
}

const continueCase = (record) => {
  record.caseStatus = '已生成案例'
  record.updated = '刚刚'
  ElMessage.success('已从该组合观察继续生成案例')
}

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
      <el-button v-if="activeRecordTab === 'original'" type="primary">新建观察记录</el-button>
    </div>

    <div class="observation-view-tabs" role="tablist" aria-label="观察记录类型">
      <button :class="{ active: activeRecordTab === 'original' }" role="tab" :aria-selected="activeRecordTab === 'original'" @click="activeRecordTab = 'original'">原始观察 <span>573</span></button>
      <button :class="{ active: activeRecordTab === 'combined' }" role="tab" :aria-selected="activeRecordTab === 'combined'" @click="activeRecordTab = 'combined'">组合观察 <span>12</span></button>
    </div>

    <div v-if="activeRecordTab === 'original'" class="observation-gallery-panel">
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
          <el-button class="merge-case-button" type="primary" :disabled="selected.length < 2" @click="openMerge"><el-icon><DocumentAdd /></el-icon> 合并生成案例</el-button>
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

    <div v-else class="combined-observation-panel">
      <header class="combined-panel-head">
        <div><h2>组合观察</h2><p>多篇原始观察按时间线整理后保存；原始记录不会被修改。</p></div>
        <el-input v-model="keyword" clearable :prefix-icon="Search" placeholder="搜索组合观察标题或幼儿" />
      </header>
      <div class="combined-record-list">
        <article v-for="record in combinedRecords.filter((item) => !keyword || `${item.title}${item.children.join('')}${item.teacher}`.includes(keyword))" :key="record.id" class="combined-record-card">
          <div class="combined-record-mark"><el-icon><Connection /></el-icon><span>{{ record.sourceCount }} 篇来源</span></div>
          <div class="combined-record-main">
            <div class="combined-record-title"><h3>{{ record.title }}</h3><el-tag :type="record.caseStatus === '已生成案例' ? 'success' : 'info'" effect="plain">{{ record.caseStatus }}</el-tag></div>
            <p>{{ record.content }}</p>
            <div class="combined-record-meta"><span>{{ record.dateRange }}</span><span>{{ record.children.join('、') }}</span><span>{{ record.teacher }}</span><span>{{ record.updated }}</span></div>
          </div>
          <div class="combined-record-actions">
            <el-button plain @click="openCombinedDetail(record)">查看组合观察</el-button>
            <el-button v-if="record.caseStatus !== '已生成案例'" type="primary" @click="continueCase(record)">继续生成案例</el-button>
            <el-button v-else type="primary" plain @click="ElMessage.success('已打开关联案例')">查看案例</el-button>
          </div>
        </article>
      </div>
      <div class="gallery-pagination"><el-pagination background layout="prev, pager, next" :total="12" :page-size="5" /></div>
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

    <el-dialog v-model="mergeVisible" width="1120" class="merge-observation-dialog" :close-on-click-modal="false">
      <template #header><div class="story-dialog-title"><span class="ai-orb"><el-icon><Connection /></el-icon></span><div><h3>合并观察并生成案例</h3><p>先确认组合内容；保存后可在“组合观察”页签中继续查看和使用</p></div></div></template>
      <div class="merge-observation-layout">
        <aside>
          <div class="merge-source-head"><strong>原始观察来源</strong><em>{{ mergeRecords.length }} 篇</em></div>
          <article v-for="record in mergeRecords" :key="record.id">
            <span>{{ record.date }}</span><strong>{{ record.title }}</strong><small>{{ record.children.join('、') }} · {{ record.teacher }}</small>
          </article>
          <p class="merge-source-tip">组合观察只保存整理后的副本，原始观察记录和媒体保持不变。</p>
        </aside>
        <main>
          <label>组合观察标题</label>
          <el-input v-model="mergeForm.title" maxlength="80" show-word-limit />
          <label>合并后的观察记录 <span>可编辑</span></label>
          <el-input v-model="mergeForm.content" type="textarea" :rows="18" resize="none" />
        </main>
      </div>
      <template #footer><span class="merge-footer-note">保存时同步记录 {{ mergeRecords.length }} 篇原始来源</span><el-button @click="mergeVisible = false">取消</el-button><el-button @click="saveCombinedObservation(false)">仅保存组合观察</el-button><el-button type="primary" @click="saveCombinedObservation(true)">保存并生成案例</el-button></template>
    </el-dialog>

    <el-dialog v-model="combinedDetailVisible" width="820" class="combined-detail-dialog">
      <template #header><div class="detail-dialog-title"><h3>组合观察详情</h3><span>{{ activeCombinedRecord?.sourceCount }} 篇原始来源</span></div></template>
      <div v-if="activeCombinedRecord" class="combined-detail-content">
        <h2>{{ activeCombinedRecord.title }}</h2>
        <div class="combined-record-meta"><span>{{ activeCombinedRecord.dateRange }}</span><span>{{ activeCombinedRecord.children.join('、') }}</span><span>{{ activeCombinedRecord.teacher }}</span></div>
        <pre>{{ activeCombinedRecord.content }}</pre>
        <div class="source-trace"><strong>来源追溯</strong><span v-for="sourceId in activeCombinedRecord.sourceIds" :key="sourceId">原始观察 #{{ sourceId }}</span></div>
      </div>
      <template #footer><el-button @click="combinedDetailVisible = false">关闭</el-button><el-button v-if="activeCombinedRecord?.caseStatus !== '已生成案例'" type="primary" @click="continueCase(activeCombinedRecord); combinedDetailVisible = false">继续生成案例</el-button></template>
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
