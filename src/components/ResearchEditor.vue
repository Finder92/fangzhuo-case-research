<script setup>
import { reactive, ref } from 'vue'
import {
  ArrowLeft, MagicStick, DocumentAdd, User, Calendar, Location,
  UploadFilled, CircleCheck, InfoFilled
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import StageTrack from './StageTrack.vue'

const props = defineProps({
  draft: { type: Object, default: null },
})
const emit = defineEmits(['back', 'saved', 'draft-saved'])
const activeSection = ref('基础信息')
const generating = ref(false)
const form = reactive({
  title: props.draft?.title || '',
  scope: props.draft?.scope || '园级教研',
  basis: props.draft?.basis || '',
  location: props.draft?.location || '三楼多功能教室',
  date: props.draft?.date || '2026-08-06 14:00',
  arrangement: props.draft?.arrangement || '',
  host: props.draft?.host || '王鹏',
  teachers: props.draft?.teachers || ['黄曼丽', '石鸿雁', '赵楠'],
  allowTopic: true,
  allowReply: true,
  anonymous: false,
})

const sections = [
  { label: '基础信息', desc: '主题、依据与关联案例' },
  { label: '活动方案', desc: '安排、时间与地点' },
  { label: '参与设置', desc: '主持人、成员与权限' },
  { label: '发布预览', desc: '检查并发布研讨' },
]

const generateContent = () => {
  generating.value = true
  setTimeout(() => {
    form.title = '如何支持幼儿在沙水游戏中持续、深入地解决工程问题？'
    form.basis = '基于小六班连续三周的沙水游戏观察，幼儿多次尝试修复沟渠坍塌，但在结构加固、材料选择与同伴协作方面仍存在持续探究空间。'
    form.arrangement = '一、案例回看：聚焦关键片段，描述幼儿行为事实。\n二、在线研讨：围绕介入时机与支持方式发表话题。\n三、现场共研：形成可验证的支持策略。\n四、实践回访：记录策略实施效果并完成小结。'
    generating.value = false
    ElMessage.success('已生成主题建议与活动方案')
  }, 700)
}

const saveDraft = () => {
  emit('draft-saved', { ...form })
  ElMessage.success('草稿已保存，可在案例教研列表继续编辑')
}
const publish = () => {
  if (!form.title.trim()) return ElMessage.warning('请先填写教研主题')
  emit('saved')
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

    <div class="editor-stage"><StageTrack :current="1" /></div>

    <div class="editor-layout">
      <aside class="editor-nav">
        <button
          v-for="(section, index) in sections"
          :key="section.label"
          :class="{ active: activeSection === section.label }"
          @click="activeSection = section.label"
        >
          <span>{{ index + 1 }}</span>
          <div><strong>{{ section.label }}</strong><small>{{ section.desc }}</small></div>
        </button>
        <div class="editor-tip">
          <el-icon><InfoFilled /></el-icon>
          <p>发布后将进入“在线研讨”阶段。教师可以发表话题并参与回复。</p>
        </div>
      </aside>

      <main class="form-panel">
        <div v-if="activeSection === '基础信息'" class="form-section">
          <div class="section-title">
            <div><h2>基础信息</h2><p>明确本次教研要解决的真实问题。</p></div>
            <el-button type="primary" plain :icon="MagicStick" :loading="generating" @click="generateContent">AI 智能生成</el-button>
          </div>
          <el-form label-position="top">
            <el-form-item label="教研主题" required>
              <el-input v-model="form.title" maxlength="50" show-word-limit placeholder="输入一个清晰、具体、可研讨的问题" />
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
            <el-form-item label="主题依据" required>
              <el-input v-model="form.basis" type="textarea" :rows="6" maxlength="1000" show-word-limit placeholder="说明问题来源、案例背景与研讨价值" />
            </el-form-item>
          </el-form>
        </div>

        <div v-else-if="activeSection === '活动方案'" class="form-section">
          <div class="section-title"><div><h2>活动方案</h2><p>安排研讨节奏，帮助参与者提前准备。</p></div><el-button plain :icon="MagicStick" @click="generateContent">生成活动方案</el-button></div>
          <el-form label-position="top">
            <div class="two-cols">
              <el-form-item label="研讨日期" required><el-input v-model="form.date" :prefix-icon="Calendar" /></el-form-item>
              <el-form-item label="研讨地点"><el-input v-model="form.location" :prefix-icon="Location" /></el-form-item>
            </div>
            <el-form-item label="研讨安排" required><el-input v-model="form.arrangement" type="textarea" :rows="12" placeholder="输入教研流程、准备材料与时间安排" /></el-form-item>
            <el-upload drag action="#" :auto-upload="false"><el-icon class="el-icon--upload"><UploadFilled /></el-icon><div>拖拽或点击上传现场图片、录音与附件</div><small>最多 16 张图片，单个附件不超过 100MB</small></el-upload>
          </el-form>
        </div>

        <div v-else-if="activeSection === '参与设置'" class="form-section">
          <div class="section-title"><div><h2>参与设置</h2><p>确定主持人与参与教师的研讨权限。</p></div></div>
          <el-form label-position="top">
            <div class="two-cols">
              <el-form-item label="主持人"><el-input v-model="form.host" :prefix-icon="User" /></el-form-item>
              <el-form-item label="参与教师"><el-select v-model="form.teachers" multiple><el-option v-for="n in ['黄曼丽','石鸿雁','赵楠','韩雪媛','王朝阳']" :key="n" :label="n" :value="n" /></el-select></el-form-item>
            </div>
            <div class="permission-list">
              <label><div><strong>允许参与教师发表新话题</strong><span>关闭后仅主持人可创建话题</span></div><el-switch v-model="form.allowTopic" /></label>
              <label><div><strong>允许参与教师回复与互动</strong><span>所有参与者可在话题下回复、引用与点赞</span></div><el-switch v-model="form.allowReply" /></label>
              <label><div><strong>允许匿名参与</strong><span>匿名内容对主持人和管理者仍然可见</span></div><el-switch v-model="form.anonymous" /></label>
            </div>
          </el-form>
        </div>

        <div v-else class="form-section publish-preview">
          <div class="preview-check"><el-icon><CircleCheck /></el-icon><h2>发布前检查</h2><p>基础信息、活动方案和参与设置已准备完成。</p></div>
          <div class="preview-card">
            <span>{{ form.scope }}</span>
            <h3>{{ form.title || '尚未填写教研主题' }}</h3>
            <p>{{ form.basis || '填写主题依据后将在这里显示摘要。' }}</p>
            <dl><div><dt>主持人</dt><dd>{{ form.host }}</dd></div><div><dt>研讨时间</dt><dd>{{ form.date }}</dd></div><div><dt>参与教师</dt><dd>{{ form.teachers.length }} 人</dd></div></dl>
          </div>
          <el-alert title="发布后，系统将通知参与教师并开放话题与回复功能。" type="info" show-icon :closable="false" />
          <el-button type="primary" size="large" @click="publish">确认发布研讨</el-button>
        </div>
      </main>

      <aside class="context-panel">
        <div class="context-card">
          <span class="ai-mark"><el-icon><MagicStick /></el-icon></span>
          <h3>教研助手</h3>
          <p>从已选案例中提炼真问题，生成主题依据与可执行的活动方案。</p>
          <el-button type="primary" plain :loading="generating" @click="generateContent">生成完整建议</el-button>
        </div>
        <div class="context-card subtle">
          <h3>发布后会发生什么？</h3>
          <ol><li>参与教师收到研讨通知</li><li>教师发表话题或参与回复</li><li>主持人置顶关键观点</li><li>教研召开后生成小结与报告</li></ol>
        </div>
      </aside>
    </div>
  </section>
</template>
