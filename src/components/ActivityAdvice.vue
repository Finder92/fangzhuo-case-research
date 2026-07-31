<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowLeft, MagicStick, CopyDocument, RefreshRight, DocumentAdd, Check } from '@element-plus/icons-vue'
import { activityAdvice } from '../data/observations'
import MarkdownReader from './MarkdownReader.vue'

const props = defineProps({ records: { type: Array, default: () => [] } })
const emit = defineEmits(['back', 'use-in-lesson'])
const loading = ref(true)
const advice = ref({ ...activityAdvice })
const contentMode = ref('read')
const evidenceCount = computed(() => props.records.length || 1)

onMounted(() => window.setTimeout(() => { loading.value = false }, 850))

const copyAdvice = async () => {
  try { await navigator.clipboard.writeText(advice.value.content) } catch {}
  ElMessage.success('活动建议已复制')
}

const regenerate = () => {
  loading.value = true
  window.setTimeout(() => { loading.value = false; ElMessage.success('已结合所选观察重新生成') }, 700)
}
</script>

<template>
  <section class="page advice-page">
    <div class="advice-header">
      <div class="editor-title"><el-button circle :icon="ArrowLeft" @click="emit('back')" /><div><h1>活动建议</h1><p>基于 {{ evidenceCount }} 篇真实观察记录综合生成</p></div></div>
      <div class="heading-actions"><el-button :icon="RefreshRight" @click="regenerate">重新生成</el-button><el-button :icon="CopyDocument" @click="copyAdvice">复制建议</el-button><el-button type="primary" :icon="DocumentAdd" :disabled="loading" @click="emit('use-in-lesson', advice)">用于教案编写</el-button></div>
    </div>
    <div class="advice-safety"><el-icon><Check /></el-icon><span>仅基于所选观察事实归纳</span><i></i><span>以一个完整建议字段输出，不绑定任何教案模板</span></div>
    <div class="advice-layout" v-loading="loading" element-loading-text="AI 正在梳理共同经验、学习品质与可支持方向…">
      <aside class="evidence-panel">
        <div class="panel-heading"><span>观察依据</span><em>{{ evidenceCount }} 篇</em></div>
        <article v-for="record in records.filter((item) => item?.id && item?.child)" :key="record.id">
          <div class="evidence-child"><span class="child-avatar">{{ record.child?.slice(0, 1) }}</span><div><b>{{ record.child }}</b><small>{{ record.className }}</small></div></div>
          <p>{{ record.excerpt }}</p>
          <button>查看原始记录</button>
        </article>
        <div class="evidence-note"><el-icon><MagicStick /></el-icon><p>AI 提取共性，不会把不同幼儿的个体表现混写成同一事实。</p></div>
      </aside>
      <main class="advice-result">
        <div class="result-hero"><span class="ai-orb"><el-icon><MagicStick /></el-icon></span><div><small>AI 综合生成</small><h2>活动建议</h2><p>一个完整内容字段，可直接编辑、复制或带入任意教案模板旁参考。</p></div></div>
        <div class="advice-single-field">
          <div class="single-field-head">
            <div><h3>活动建议正文</h3><span>Markdown · {{ advice.content.length }} 字</span></div>
            <div class="markdown-actions">
              <div class="markdown-mode-switch" aria-label="切换活动建议显示模式">
                <button :class="{ active: contentMode === 'read' }" @click="contentMode = 'read'">阅读模式</button>
                <button :class="{ active: contentMode === 'edit' }" @click="contentMode = 'edit'">编辑 Markdown</button>
              </div>
              <el-button link :icon="CopyDocument" @click="copyAdvice">复制 Markdown</el-button>
            </div>
          </div>
          <div v-if="contentMode === 'read'" class="markdown-preview"><MarkdownReader :content="advice.content" /></div>
          <div v-else class="markdown-editor">
            <div class="markdown-editor-tip"><span>Markdown 源码</span><small>支持标题、段落、有序列表和无序列表</small></div>
            <el-input v-model="advice.content" type="textarea" :rows="24" resize="none" />
          </div>
        </div>
        <div class="advice-next"><div><strong>建议已经准备好</strong><span>下一步可带着这份建议编写教案，原观察依据会一并保留。</span></div><el-button type="primary" :icon="DocumentAdd" @click="emit('use-in-lesson', advice)">进入我的教案</el-button></div>
      </main>
    </div>
  </section>
</template>
