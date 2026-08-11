<script setup>
import { computed, reactive, ref } from 'vue'
import {
  ArrowLeft, MagicStick, DocumentAdd, Calendar, Location, Search,
  UploadFilled, CircleCheck, Plus, Delete, Lock, UserFilled,
  Picture, Refresh, VideoCamera, Headset, View
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  draft: { type: Object, default: null },
})
const emit = defineEmits(['back', 'saved', 'draft-saved'])
const activeSection = ref('基础信息')
const generating = ref(false)
const aiSuggestionVisible = ref(false)
const selectedSuggestion = ref(0)
const presetTopicDialog = ref(false)
const memberDialog = ref(false)
const pickerMode = ref('members')
const memberKeyword = ref('')
const memberGroup = ref('全部教师')
const pendingTeacherNames = ref([])
const pendingHost = ref('')
const presetTopicDraft = reactive({
  title: '',
  prompt: '',
})
const materialPreviewVisible = ref(false)
const activeMaterial = ref(null)
const uploadedMaterials = ref([
  { id: 1, type: '图片', name: '沙水区沟渠坍塌现场观察.jpg', size: '3.8 MB', cover: `${import.meta.env.BASE_URL}covers/sand-water.svg`, icon: Picture },
  { id: 2, type: '视频', name: '幼儿修复沟渠连续观察.mp4', size: '86.4 MB', cover: `${import.meta.env.BASE_URL}covers/sand-water.svg`, icon: VideoCamera },
  { id: 3, type: '文档', name: '沙水游戏观察记录汇编.pdf', size: '8.4 MB', icon: DocumentAdd },
  { id: 4, type: '音频', name: '前期教师访谈录音.m4a', size: '18.6 MB', icon: Headset },
])
const materialGroups = computed(() => ['图片', '视频', '文档', '音频'].map((type) => ({ type, files: uploadedMaterials.value.filter((file) => file.type === type) })).filter((group) => group.files.length))
const aiSuggestions = [
  { title: '从“告状”到“协商”：支持幼儿在冲突中表达需求与倾听', points: ['以两段典型冲突视频为共同观察材料，先还原幼儿的语言和行为事实。', '围绕“教师何时介入、怎样支持表达”组织线上跟帖与现场共研。', '形成可直接带回班级使用的支持语句和观察记录要点。'] },
  { title: '游戏中的“隐形支架”：教师如何从替幼儿解决转向支持协商', points: ['聚焦教师直接参与、材料投放和提问方式带来的不同结果。', '通过案例回看与教师经验对照，沉淀可验证的支持策略。', '以实践回访记录策略实施后的幼儿变化。'] },
]
const form = reactive({
  title: props.draft?.title || '',
  scope: props.draft?.scope || '园级教研',
  basis: props.draft?.basis || '',
  location: props.draft?.location || '三楼多功能教室',
  date: props.draft?.date || '2026-08-06 14:00',
  arrangement: props.draft?.arrangement || '',
  cover: props.draft?.cover || `${import.meta.env.BASE_URL}covers/sand-water.svg`,
  coverSource: props.draft?.coverSource || '关联案例首图',
  caseCount: props.draft?.caseCount || 2,
  host: props.draft?.host || '王鹏',
  teachers: props.draft?.teachers || ['黄曼丽', '石鸿雁', '赵楠'],
  allowTopic: true,
  allowReply: true,
  anonymous: false,
  preTopics: props.draft?.preTopics || [
    {
      id: 1,
      title: '从案例记录看，幼儿真正遇到的核心困难是什么？',
      scope: '案例一：沙水区沟渠连续坍塌',
      prompt: '请先描述观察事实，再判断困难发生在材料、结构还是同伴协作层面。',
    },
  ],
})

const teacherDirectory = [
  { name: '王鹏', className: '教研管理组', role: '教研主任', color: '#5d86c8' },
  { name: '黄曼丽', className: '小六班', role: '主班教师', color: '#d67c72' },
  { name: '石鸿雁', className: '中三班', role: '主班教师', color: '#6aa69c' },
  { name: '赵楠', className: '大一班', role: '配班教师', color: '#8d79bd' },
  { name: '韩雪媛', className: '大二班', role: '主班教师', color: '#cd9461' },
  { name: '王朝阳', className: '中一班', role: '主班教师', color: '#628db0' },
  { name: '李欣悦', className: '小二班', role: '配班教师', color: '#b27191' },
  { name: '周晓彤', className: '中三班', role: '保教教师', color: '#739e69' },
  { name: '陈思雨', className: '大一班', role: '配班教师', color: '#6277a4' },
  { name: '孙嘉宁', className: '小六班', role: '保教教师', color: '#bd8058' },
]

const teacherGroups = computed(() => ['全部教师', ...new Set(teacherDirectory.map((teacher) => teacher.className))])
const selectedTeachers = computed(() => teacherDirectory.filter((teacher) => form.teachers.includes(teacher.name)))
const pendingTeachers = computed(() => teacherDirectory.filter((teacher) => pendingTeacherNames.value.includes(teacher.name)))
const filteredTeachers = computed(() => teacherDirectory.filter((teacher) => {
  const groupMatched = memberGroup.value === '全部教师' || teacher.className === memberGroup.value
  const keywordMatched = !memberKeyword.value || `${teacher.name}${teacher.className}${teacher.role}`.includes(memberKeyword.value)
  return groupMatched && keywordMatched
}))
const currentHost = computed(() => teacherDirectory.find((teacher) => teacher.name === form.host) || {
  name: form.host,
  className: '教研管理组',
  role: '主持人',
  color: '#5d86c8',
})

const openMemberPicker = (mode) => {
  pickerMode.value = mode
  memberKeyword.value = ''
  memberGroup.value = '全部教师'
  pendingTeacherNames.value = [...form.teachers]
  pendingHost.value = form.host
  memberDialog.value = true
}

const toggleTeacher = (name) => {
  if (pickerMode.value === 'host') {
    pendingHost.value = name
    return
  }
  pendingTeacherNames.value = pendingTeacherNames.value.includes(name)
    ? pendingTeacherNames.value.filter((item) => item !== name)
    : [...pendingTeacherNames.value, name]
}

const removePendingTeacher = (name) => {
  pendingTeacherNames.value = pendingTeacherNames.value.filter((item) => item !== name)
}

const confirmMemberPicker = () => {
  if (pickerMode.value === 'host') {
    form.host = pendingHost.value
    form.teachers = form.teachers.filter((name) => name !== pendingHost.value)
    ElMessage.success('主持人已调整')
  } else {
    form.teachers = pendingTeacherNames.value.filter((name) => name !== form.host)
    ElMessage.success(`已选择 ${form.teachers.length} 位参与教师`)
  }
  memberDialog.value = false
}

const handleCoverChange = (uploadFile) => {
  const file = uploadFile.raw
  if (!file) return
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    ElMessage.warning('请上传 JPG、PNG 或 WebP 格式的图片')
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.warning('封面图片不能超过 5MB')
    return
  }
  form.cover = URL.createObjectURL(file)
  form.coverSource = '手动上传'
  ElMessage.success('教研封面已更新')
}

const restoreCaseCover = () => {
  form.cover = `${import.meta.env.BASE_URL}covers/sand-water.svg`
  form.coverSource = '关联案例首图'
  ElMessage.success('已恢复使用关联案例首图')
}

const sections = [
  { label: '基础信息' },
  { label: '活动方案' },
  { label: '参与设置' },
  { label: '发布预览' },
]

const generateContent = () => {
  generating.value = true
  setTimeout(() => { generating.value = false; aiSuggestionVisible.value = true }, 500)
}
const applySuggestion = (index) => {
  const suggestion = aiSuggestions[index]
  selectedSuggestion.value = index
  form.title = suggestion.title
  form.basis = '基于连续观察中幼儿表达需求、回应同伴与解决冲突的真实片段，聚焦教师支持方式与介入时机。'
  form.arrangement = suggestion.points.map((point, itemIndex) => `${['一', '二', '三'][itemIndex]}、${point}`).join('\n\n')
  aiSuggestionVisible.value = false
  ElMessage.success('已应用 AI 建议，可继续编辑')
}
const openMaterialPreview = (file) => { activeMaterial.value = file; materialPreviewVisible.value = true }

const saveDraft = () => {
  emit('draft-saved', { ...form })
  ElMessage.success('草稿已保存，可在案例教研列表继续编辑')
}

const addPresetTopic = () => {
  if (!presetTopicDraft.title.trim()) return ElMessage.warning('请输入预设话题标题')
  form.preTopics.push({
    id: Date.now(),
    title: presetTopicDraft.title,
    prompt: presetTopicDraft.prompt || '请参与教师结合案例材料发表观点。',
  })
  presetTopicDialog.value = false
  presetTopicDraft.title = ''
  presetTopicDraft.prompt = ''
  ElMessage.success('预设话题已添加，发布后自动进入在线研讨')
}

const removePresetTopic = (id) => {
  form.preTopics = form.preTopics.filter((topic) => topic.id !== id)
}

const publish = () => {
  if (!form.title.trim()) return ElMessage.warning('请先填写教研主题')
  emit('saved', { ...form })
  ElMessage.success('教研主题已发布，教师现在可以参与话题讨论')
}
</script>

<template>
  <section class="page editor-page">
    <header class="editor-header">
        <div class="editor-title">
        <el-button circle :icon="ArrowLeft" @click="emit('back')" aria-label="返回" />
        <div><div class="crumb">案例教研 / {{ props.draft ? '编辑草稿' : '创建教研主题' }}</div><h1>{{ props.draft ? '编辑教研草稿' : '创建教研主题' }}</h1></div>
      </div>
      <div class="editor-actions">
        <span class="autosave"><i></i> 内容已自动保存</span>
        <el-button @click="saveDraft">保存草稿</el-button>
        <el-button type="primary" @click="publish">发布研讨</el-button>
      </div>
    </header>

    <div class="editor-stage editor-parallel-stage" aria-label="教研并行推进流程">
      <svg class="editor-flow-arcs" viewBox="0 0 1000 160" preserveAspectRatio="none" aria-hidden="true">
        <path d="M 205 80 C 285 80, 290 38, 370 38" />
        <path d="M 205 80 C 285 80, 290 122, 370 122" />
        <path d="M 630 38 C 710 38, 715 80, 795 80" />
        <path d="M 630 122 C 710 122, 715 80, 795 80" />
      </svg>
      <div class="editor-flow-node is-current">
        <span class="editor-flow-index">01</span>
        <div><strong>教研准备</strong></div>
      </div>
      <div class="editor-flow-branches">
        <div class="editor-flow-node is-pending is-topic">
          <span class="editor-flow-index">02A</span>
          <div><strong>话题广场</strong></div>
        </div>
        <div class="editor-flow-node is-pending is-onsite">
          <span class="editor-flow-index">02B</span>
          <div><strong>现场记录</strong></div>
        </div>
      </div>
      <div class="editor-flow-node is-pending is-result">
        <span class="editor-flow-index">03</span>
        <div><strong>成果沉淀</strong></div>
      </div>
    </div>

    <div class="editor-layout">
      <aside class="editor-nav">
        <button
          v-for="(section, index) in sections"
          :key="section.label"
          :class="{ active: activeSection === section.label }"
          @click="activeSection = section.label"
        >
          <span>{{ index + 1 }}</span>
          <div><strong>{{ section.label }}</strong></div>
        </button>
      </aside>

      <main class="form-panel">
        <div v-if="activeSection === '基础信息'" class="form-section">
          <div class="section-title"><div><h2>基础信息</h2></div></div>
          <el-form label-position="top">
            <el-form-item label="教研主题" required>
              <div class="field-with-action"><el-input v-model="form.title" maxlength="50" show-word-limit placeholder="输入一个清晰、具体、可研讨的问题" /><el-button type="primary" plain :icon="MagicStick" :loading="generating" @click="generateContent">AI 生成</el-button></div>
            </el-form-item>
            <div class="two-cols">
              <el-form-item label="教研范围" required>
                <el-select v-model="form.scope">
                  <el-option label="园级教研" value="园级教研" />
                  <el-option label="年级组教研" value="年级组教研" />
                  <el-option label="班级教研" value="班级教研" />
                </el-select>
              </el-form-item>
              <el-form-item label="关联案例">
                <el-button class="select-case" :icon="DocumentAdd">选择研讨案例 <span>已选择 2 个</span></el-button>
              </el-form-item>
            </div>
            <div class="research-cover-field">
              <div class="cover-field-label">
                <div><strong>教研封面</strong></div>
              </div>
              <div class="cover-editor">
                <div class="cover-preview">
                  <img :src="form.cover" alt="当前教研封面预览" />
                  <span><el-icon><Picture /></el-icon>{{ form.coverSource }}</span>
                </div>
                <div class="cover-editor-info">
                  <strong>{{ form.coverSource === '手动上传' ? '已使用自定义封面' : '已自动选取案例图片' }}</strong>
                  <div>
                    <el-upload
                      action="#"
                      accept=".jpg,.jpeg,.png,.webp"
                      :auto-upload="false"
                      :show-file-list="false"
                      :on-change="handleCoverChange"
                    >
                      <el-button type="primary" plain :icon="UploadFilled">{{ form.coverSource === '手动上传' ? '重新上传' : '上传封面' }}</el-button>
                    </el-upload>
                    <el-button v-if="form.coverSource === '手动上传'" :icon="Refresh" @click="restoreCaseCover">恢复案例首图</el-button>
                  </div>
                </div>
              </div>
            </div>
            <el-form-item label="教研目标" required>
              <el-input v-model="form.basis" type="textarea" :rows="6" maxlength="1000" show-word-limit placeholder="说明本次教研希望解决的问题、形成的共识与预期成果" />
            </el-form-item>
          </el-form>
        </div>

        <div v-else-if="activeSection === '活动方案'" class="form-section">
          <div class="section-title"><div><h2>活动方案</h2></div></div>
          <el-form label-position="top">
            <div class="two-cols">
              <el-form-item label="研讨日期" required><el-input v-model="form.date" :prefix-icon="Calendar" /></el-form-item>
              <el-form-item label="研讨地点"><el-input v-model="form.location" :prefix-icon="Location" /></el-form-item>
            </div>
            <el-form-item label="研讨安排" required><div class="field-label-action"><span>研讨安排</span><el-button link type="primary" :icon="MagicStick" @click="generateContent">生成活动方案</el-button></div><el-input v-model="form.arrangement" type="textarea" :rows="12" placeholder="输入教研流程、准备材料与时间安排" /></el-form-item>
            <div class="material-upload">
              <div class="upload-label"><div><strong>教研素材</strong></div><el-upload action="#" :auto-upload="false" multiple><el-button type="primary" plain :icon="UploadFilled">上传教研素材</el-button></el-upload></div>
              <div class="material-library"><section v-for="group in materialGroups" :key="group.type"><header><strong>{{ group.type }}</strong><span>{{ group.files.length }} 个</span></header><article v-for="file in group.files" :key="file.id" @click="openMaterialPreview(file)"><span class="editor-material-thumb" :class="file.type"><img v-if="file.cover" :src="file.cover" alt="" /><el-icon v-else><component :is="file.icon" /></el-icon></span><div><b>{{ file.name }}</b><small>{{ file.type }} · {{ file.size }}</small></div><el-button link type="primary" :icon="View">预览</el-button></article></section></div>
            </div>
          </el-form>
        </div>

        <div v-else-if="activeSection === '参与设置'" class="form-section">
          <div class="section-title"><div><h2>参与设置</h2></div></div>
          <el-form label-position="top">
            <div class="scope-selection-note">
              <span><el-icon><Lock /></el-icon>当前教研范围</span>
              <strong>{{ form.scope }}</strong>
            </div>

            <div class="participant-setup-grid">
              <article class="host-selection-card">
                <div class="selection-card-head">
                  <div><span>主持人</span></div>
                  <el-button link type="primary" @click="openMemberPicker('host')">更换</el-button>
                </div>
                <div class="selected-host">
                  <el-avatar :size="48" :style="{ backgroundColor: currentHost.color }">{{ currentHost.name.slice(-1) }}</el-avatar>
                  <div><strong>{{ currentHost.name }} <em>主持人</em></strong><span>{{ currentHost.className }} · {{ currentHost.role }}</span></div>
                </div>
              </article>

              <article class="member-selection-card">
                <div class="selection-card-head">
                  <div><span>参与教师</span><small>已选择 {{ form.teachers.length }} 人</small></div>
                  <el-button type="primary" plain @click="openMemberPicker('members')">选择/调整成员</el-button>
                </div>
                <div v-if="selectedTeachers.length" class="selected-member-summary">
                  <div class="avatar-stack">
                    <el-avatar
                      v-for="teacher in selectedTeachers.slice(0, 5)"
                      :key="teacher.name"
                      :size="34"
                      :style="{ backgroundColor: teacher.color }"
                    >{{ teacher.name.slice(-1) }}</el-avatar>
                    <span v-if="selectedTeachers.length > 5">+{{ selectedTeachers.length - 5 }}</span>
                  </div>
                  <p>{{ selectedTeachers.slice(0, 4).map((teacher) => `${teacher.name}（${teacher.className}）`).join('、') }}<template v-if="selectedTeachers.length > 4"> 等</template></p>
                </div>
                <el-empty v-else :image-size="42" description="尚未选择参与教师" />
              </article>
            </div>

            <div class="permission-list">
              <label><div><strong>允许参与教师发表新话题</strong><span>关闭后仅主持人可创建话题</span></div><el-switch v-model="form.allowTopic" /></label>
              <label><div><strong>允许参与教师回复与互动</strong><span>所有参与者可在话题下回复、引用与点赞</span></div><el-switch v-model="form.allowReply" /></label>
              <label><div><strong>允许匿名参与</strong><span>匿名内容对主持人和管理者仍然可见</span></div><el-switch v-model="form.anonymous" /></label>
            </div>

            <div class="preset-topic-block">
              <div class="preset-topic-head">
                <div><strong>管理员预设话题</strong></div>
                <el-button type="primary" plain :icon="Plus" @click="presetTopicDialog = true">新增话题</el-button>
              </div>
              <div v-if="form.preTopics.length" class="preset-topic-list">
                <article v-for="(topic, index) in form.preTopics" :key="topic.id">
                  <span>{{ String(index + 1).padStart(2, '0') }}</span>
                  <div><strong>{{ topic.title }}</strong><small>{{ topic.prompt }}</small></div>
                  <el-button link type="danger" :icon="Delete" @click="removePresetTopic(topic.id)">删除</el-button>
                </article>
              </div>
              <el-empty v-else :image-size="58" description="还没有预设话题，可由主持人在发布前添加" />
            </div>

            <div class="permission-scope-note">
              <el-icon><Lock /></el-icon>
              <div>
                <strong>权限按教研范围生效</strong>
              </div>
            </div>
          </el-form>
        </div>

        <div v-else class="form-section publish-preview">
          <div class="preview-check"><el-icon><CircleCheck /></el-icon><h2>发布前检查</h2></div>
          <div class="preview-card">
            <span>{{ form.scope }}</span>
            <h3>{{ form.title || '尚未填写教研主题' }}</h3>
            <p>{{ form.basis || '填写教研目标后将在这里显示摘要。' }}</p>
            <dl><div><dt>主持人</dt><dd>{{ form.host }}</dd></div><div><dt>研讨时间</dt><dd>{{ form.date }}</dd></div><div><dt>参与教师</dt><dd>{{ form.teachers.length }} 人</dd></div><div><dt>预设话题</dt><dd>{{ form.preTopics.length }} 个</dd></div></dl>
          </div>
          <el-button type="primary" size="large" @click="publish">确认发布研讨</el-button>
        </div>
      </main>

      <aside class="context-panel">
        <div class="context-card">
          <span class="ai-mark"><el-icon><MagicStick /></el-icon></span>
          <h3>教研助手</h3>
          <el-button type="primary" plain :loading="generating" @click="generateContent">生成完整建议</el-button>
        </div>
      </aside>
    </div>

    <el-dialog v-model="presetTopicDialog" title="新增预设话题" width="560px">
      <el-form label-position="top">
        <el-form-item label="话题标题" required>
          <el-input v-model="presetTopicDraft.title" maxlength="60" show-word-limit placeholder="用一个具体问题引导教师讨论" />
        </el-form-item>
        <el-form-item label="讨论提示">
          <el-input v-model="presetTopicDraft.prompt" type="textarea" :rows="4" placeholder="说明回答角度、需要参考的素材或讨论边界" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="presetTopicDialog = false">取消</el-button>
        <el-button type="primary" @click="addPresetTopic">添加话题</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="aiSuggestionVisible" width="1080px" top="7vh" class="ai-suggestion-dialog">
      <template #header><div class="ai-suggestion-title"><span><el-icon><MagicStick /></el-icon></span><div><h2>AI 教研建议</h2></div></div></template>
      <div class="ai-suggestion-layout"><aside><strong>生成依据</strong><p>2 个关联案例</p><p>3 段观察视频</p><p>12 条关键观察</p></aside><main><article v-for="(suggestion, index) in aiSuggestions" :key="suggestion.title" :class="{ selected: selectedSuggestion === index }"><header><span>方案 {{ String(index + 1).padStart(2, '0') }}</span><el-button type="primary" plain @click="applySuggestion(index)">选用此方案</el-button></header><h3>{{ suggestion.title }}</h3><ol><li v-for="point in suggestion.points" :key="point">{{ point }}</li></ol></article></main></div>
      <template #footer><el-button @click="aiSuggestionVisible = false">暂不使用</el-button></template>
    </el-dialog>

    <el-dialog v-model="materialPreviewVisible" width="720px" class="editor-material-preview">
      <template #header><div class="preview-dialog-title"><span class="preview-file-mark"><el-icon><component :is="activeMaterial?.icon || DocumentAdd" /></el-icon></span><div><small>教研准备素材</small><strong>{{ activeMaterial?.name }}</strong></div></div></template>
      <div class="editor-preview-content" v-if="activeMaterial"><img v-if="activeMaterial.cover" :src="activeMaterial.cover" :alt="activeMaterial.name" /><div v-else><el-icon><component :is="activeMaterial.icon" /></el-icon><strong>{{ activeMaterial.name }}</strong><span>{{ activeMaterial.type }} · {{ activeMaterial.size }}</span></div></div>
      <template #footer><el-button type="primary" @click="materialPreviewVisible = false">关闭预览</el-button></template>
    </el-dialog>

    <el-dialog
      v-model="memberDialog"
      :title="pickerMode === 'host' ? '选择主持人' : '选择参与教师'"
      width="920px"
      class="member-picker-dialog"
    >
      <div class="member-picker">
        <aside class="member-group-filter">
          <strong>教研范围</strong>
          <button
            v-for="group in teacherGroups"
            :key="group"
            :class="{ active: memberGroup === group }"
            @click="memberGroup = group"
          >
            <span>{{ group }}</span>
            <b>{{ group === '全部教师' ? teacherDirectory.length : teacherDirectory.filter((teacher) => teacher.className === group).length }}</b>
          </button>
        </aside>

        <section class="member-candidate-panel">
          <div class="member-search-bar">
            <el-input v-model="memberKeyword" :prefix-icon="Search" clearable placeholder="搜索姓名、班级或岗位" />
            <span>共 {{ filteredTeachers.length }} 人</span>
          </div>
          <div class="member-candidate-list">
            <label
              v-for="teacher in filteredTeachers"
              :key="teacher.name"
              :class="{
                selected: pickerMode === 'host'
                  ? pendingHost === teacher.name
                  : pendingTeacherNames.includes(teacher.name),
                disabled: pickerMode === 'members' && teacher.name === form.host,
              }"
              @click="pickerMode === 'host' && toggleTeacher(teacher.name)"
            >
              <el-checkbox
                v-if="pickerMode === 'members'"
                :model-value="pendingTeacherNames.includes(teacher.name)"
                :disabled="teacher.name === form.host"
                @change="toggleTeacher(teacher.name)"
              />
              <span
                v-else
                class="host-radio"
                :class="{ checked: pendingHost === teacher.name }"
                @click.stop="toggleTeacher(teacher.name)"
              ></span>
              <el-avatar :size="38" :style="{ backgroundColor: teacher.color }">{{ teacher.name.slice(-1) }}</el-avatar>
              <span class="candidate-info">
                <strong>{{ teacher.name }}<em v-if="teacher.name === form.host">当前主持人</em></strong>
                <small>{{ teacher.className }} · {{ teacher.role }}</small>
              </span>
              <el-icon v-if="pickerMode === 'host' && pendingHost === teacher.name"><CircleCheck /></el-icon>
            </label>
          </div>
        </section>

        <aside v-if="pickerMode === 'members'" class="member-selected-panel">
          <div><strong>已选成员</strong><span>{{ pendingTeachers.length }} 人</span></div>
          <p v-if="!pendingTeachers.length">从左侧列表选择参与教师</p>
          <ul v-else>
            <li v-for="teacher in pendingTeachers" :key="teacher.name">
              <el-avatar :size="30" :style="{ backgroundColor: teacher.color }">{{ teacher.name.slice(-1) }}</el-avatar>
              <span><strong>{{ teacher.name }}</strong><small>{{ teacher.className }}</small></span>
              <el-button link :icon="Delete" aria-label="移除成员" @click="removePendingTeacher(teacher.name)" />
            </li>
          </ul>
        </aside>
      </div>
      <template #footer>
        <span class="member-dialog-footer-note">
          <el-icon><UserFilled /></el-icon>
          {{ pickerMode === 'host' ? '请选择 1 位主持人' : `已选择 ${pendingTeachers.length} 位参与教师` }}
        </span>
        <el-button @click="memberDialog = false">取消</el-button>
        <el-button type="primary" :disabled="pickerMode === 'host' && !pendingHost" @click="confirmMemberPicker">确认选择</el-button>
      </template>
    </el-dialog>
  </section>
</template>
