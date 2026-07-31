<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowLeft, CopyDocument, MagicStick, Fold, Expand, VideoPlay, Picture, Document, Headset, Search, Plus, Check } from '@element-plus/icons-vue'
import MarkdownReader from './MarkdownReader.vue'

const props = defineProps({ advice: { type: Object, required: true } })
const emit = defineEmits(['back'])
const referenceOpen = ref(true)
const referenceTab = ref('ai')
const materialSearch = ref('')
const materialType = ref('全部')
const selectedMaterialIds = ref([1, 3])
const materials = [
  { id: 1, name: '城市建构活动导入视频.mp4', type: '视频', size: '18.6 MB', source: '我的素材', icon: VideoPlay, tone: 'blue' },
  { id: 2, name: '不同道路与桥梁参考图集', type: '图片', size: '12 张', source: '园本资源', icon: Picture, tone: 'green' },
  { id: 3, name: '城市环境音效.mp3', type: '音频', size: '3分24秒', source: '我的素材', icon: Headset, tone: 'purple' },
  { id: 4, name: '幼儿合作建构观察要点.pdf', type: '文档', size: '2.1 MB', source: '园本资源', icon: Document, tone: 'orange' },
  { id: 5, name: '道路标识打印素材.zip', type: '文档', size: '8.4 MB', source: '我的素材', icon: Document, tone: 'cyan' },
]
const filteredMaterials = computed(() => materials.filter((item) => {
  const matchesType = materialType.value === '全部' || item.type === materialType.value
  const matchesKeyword = !materialSearch.value || item.name.includes(materialSearch.value)
  return matchesType && matchesKeyword
}))
const selectedMaterials = computed(() => materials.filter((item) => selectedMaterialIds.value.includes(item.id)))
const form = reactive({
  name: '',
  className: '中班',
  type: '集体活动',
  domain: '综合（社会、科学、艺术）',
  author: '李老师',
  goals: '',
  difficulty: '',
  preparation: '',
  collection: '主题活动',
  intention: '',
  process: '',
  duration: '40分钟',
  materials: [],
})

const copy = async (value) => {
  try { await navigator.clipboard.writeText(value) } catch {}
  ElMessage.success('已复制')
}
const save = () => ElMessage.success('教案草稿已保存')
const openMaterials = () => {
  referenceOpen.value = true
  referenceTab.value = 'materials'
}
const toggleMaterial = (id) => {
  selectedMaterialIds.value = selectedMaterialIds.value.includes(id)
    ? selectedMaterialIds.value.filter((item) => item !== id)
    : [...selectedMaterialIds.value, id]
}
</script>

<template>
  <section class="lesson-workspace">
    <header class="lesson-toolbar">
      <div class="editor-title"><el-button circle :icon="ArrowLeft" @click="emit('back')" /><div><h1>我的教案</h1><p>根据观察事实编写 · 草稿自动保存</p></div></div>
      <div><el-button>预览</el-button><el-button @click="save">保存草稿</el-button><el-button type="primary" @click="save">完成教案</el-button></div>
    </header>
    <div class="lesson-panes" :class="{ collapsed: !referenceOpen }">
      <main class="lesson-editor-pane">
        <div class="lesson-section-title"><span>基础信息</span><small>带 * 为必填项</small></div>
        <el-form label-position="top">
          <div class="lesson-two-cols">
            <el-form-item label="活动名称 *"><el-input v-model="form.name" /></el-form-item>
            <el-form-item label="年龄班 *"><el-select v-model="form.className"><el-option label="中班" value="中班" /><el-option label="大班" value="大班" /></el-select></el-form-item>
            <el-form-item label="活动类型 *"><el-select v-model="form.type"><el-option label="集体活动" value="集体活动" /><el-option label="区域活动" value="区域活动" /></el-select></el-form-item>
            <el-form-item label="领域 / 主题"><el-input v-model="form.domain" /></el-form-item>
            <el-form-item label="作者"><el-input v-model="form.author" /></el-form-item>
            <el-form-item label="时间预设"><el-select v-model="form.duration"><el-option label="40分钟" value="40分钟" /><el-option label="30分钟" value="30分钟" /></el-select></el-form-item>
          </div>
          <div class="lesson-section-title"><span>活动设计</span><small>右侧活动建议用于参考，不与当前模板字段绑定</small></div>
          <el-form-item label="活动目标 *"><el-input v-model="form.goals" type="textarea" :rows="5" placeholder="填写本次活动目标" /></el-form-item>
          <el-form-item label="活动重难点"><el-input v-model="form.difficulty" type="textarea" :rows="3" /></el-form-item>
          <el-form-item label="活动准备"><el-input v-model="form.preparation" type="textarea" :rows="4" /></el-form-item>
          <el-form-item label="设计意图"><el-input v-model="form.intention" type="textarea" :rows="5" /></el-form-item>
          <el-form-item label="活动过程 *"><el-input v-model="form.process" type="textarea" :rows="12" placeholder="按活动环节编写详细过程" /></el-form-item>
          <el-form-item label="所属活动集"><el-select v-model="form.collection"><el-option label="主题活动" value="主题活动" /></el-select></el-form-item>
          <div class="lesson-material-field">
            <div class="lesson-material-title">
              <div><strong>活动素材</strong><span>支持视频、文档、音频、图片等素材</span></div>
              <el-button type="primary" plain @click="openMaterials">选择素材</el-button>
            </div>
            <div v-if="selectedMaterials.length" class="selected-material-strip">
              <article v-for="item in selectedMaterials" :key="item.id">
                <span :class="['material-type-icon', item.tone]"><el-icon><component :is="item.icon" /></el-icon></span>
                <div><b>{{ item.name }}</b><small>{{ item.type }} · {{ item.size }}</small></div>
                <button aria-label="移除素材" @click="toggleMaterial(item.id)">×</button>
              </article>
            </div>
            <div v-else class="lesson-material-empty">暂未选择素材，点击“选择素材”从右侧素材库添加</div>
          </div>
        </el-form>
      </main>

      <button v-if="!referenceOpen" class="reference-reopen" @click="referenceOpen = true"><el-icon><MagicStick /></el-icon><span>教案参考区</span><el-icon><Expand /></el-icon></button>
      <aside v-else class="lesson-reference-pane">
        <header class="reference-tabs-head">
          <div class="reference-tabs">
            <button :class="{ active: referenceTab === 'ai' }" @click="referenceTab = 'ai'"><el-icon><MagicStick /></el-icon>AI 活动建议</button>
            <button :class="{ active: referenceTab === 'materials' }" @click="referenceTab = 'materials'"><el-icon><Document /></el-icon>活动素材 <em>{{ selectedMaterials.length }}</em></button>
          </div>
          <el-button circle text :icon="Fold" aria-label="收起参考区" @click="referenceOpen = false" />
        </header>
        <div v-if="referenceTab === 'ai'" class="reference-body">
          <div class="reference-source"><b>基于观察记录生成</b><span>完整建议</span><span>模板无关</span></div>
          <article class="reference-advice-document">
            <div><h3>活动建议全文</h3><el-button link :icon="CopyDocument" @click="copy(advice.content)">复制全文</el-button></div>
            <MarkdownReader :content="advice.content" />
          </article>
          <div class="reference-template-note"><el-icon><MagicStick /></el-icon><span>建议作为独立参考内容展示。无论左侧切换哪种教案模板，都不需要配置字段映射。</span></div>
        </div>
        <div v-else class="material-library">
          <div class="material-library-head">
            <div><h3>活动素材库</h3><span>选择后将关联到当前教案</span></div>
            <el-button type="primary" plain :icon="Plus">添加素材</el-button>
          </div>
          <el-input v-model="materialSearch" clearable placeholder="搜索素材名称" :prefix-icon="Search" />
          <div class="material-type-tabs">
            <button v-for="type in ['全部', '视频', '图片', '音频', '文档']" :key="type" :class="{ active: materialType === type }" @click="materialType = type">{{ type }}</button>
          </div>
          <div class="selected-material-summary"><span>已选素材</span><b>{{ selectedMaterials.length }}</b><small>个</small><button v-if="selectedMaterials.length" @click="selectedMaterialIds = []">清空</button></div>
          <div class="material-list">
            <article v-for="item in filteredMaterials" :key="item.id" :class="{ selected: selectedMaterialIds.includes(item.id) }" @click="toggleMaterial(item.id)">
              <span :class="['material-type-icon', item.tone]"><el-icon><component :is="item.icon" /></el-icon></span>
              <div><b>{{ item.name }}</b><small>{{ item.source }} · {{ item.type }} · {{ item.size }}</small></div>
              <span class="material-check"><el-icon v-if="selectedMaterialIds.includes(item.id)"><Check /></el-icon></span>
            </article>
          </div>
          <div v-if="!filteredMaterials.length" class="material-empty">没有找到匹配的素材</div>
          <div class="material-library-tip">素材选择会随教案草稿一起保存，不影响 AI 建议内容。</div>
        </div>
      </aside>
    </div>
  </section>
</template>
