<script setup>
import { computed, ref } from 'vue'
import { ArrowLeft, CircleCheck } from '@element-plus/icons-vue'

const props = defineProps({ archives: { type: Array, default: () => [] } })
const emit = defineEmits(['back'])
const activeChild = ref(props.archives[0]?.child || '')
const activeArchive = computed(() => props.archives.find((item) => item.child === activeChild.value) || props.archives[0])
</script>

<template>
  <section class="page growth-archive-detail-page">
    <div class="crumb">成长档案 / 幼儿故事 / 档案详情</div>
    <div class="page-heading growth-archive-heading">
      <div class="heading-with-back">
        <el-button circle :icon="ArrowLeft" aria-label="返回观察记录" @click="emit('back')" />
        <div><h1>幼儿成长档案</h1><p>已同步至真实成长档案，可继续在此维护</p></div>
      </div>
      <el-button type="primary">编辑档案</el-button>
    </div>

    <div class="archive-success-banner"><el-icon><CircleCheck /></el-icon><div><strong>已成功同步 {{ archives.length }} 篇成长档案</strong><span>内容已按幼儿分别归档，不会混写；以下为成长档案中的正式详情。</span></div></div>

    <div class="growth-archive-layout">
      <aside class="growth-archive-sidebar">
        <div class="archive-side-title"><span>本次生成</span><em>{{ archives.length }}</em></div>
        <button v-for="archive in archives" :key="archive.child" :class="{ active: activeChild === archive.child }" @click="activeChild = archive.child">
          <i>{{ archive.child.slice(0, 1) }}</i><div><b>{{ archive.child }}</b><small>{{ archive.section }}</small></div><span>已同步</span>
        </button>
      </aside>
      <main v-if="activeArchive" class="growth-archive-real-page">
        <div class="real-page-header"><div class="archive-child-avatar">{{ activeArchive.child.slice(0, 1) }}</div><div><span>{{ activeArchive.semester }} · {{ activeArchive.section }}</span><h2>{{ activeArchive.child }}的成长档案</h2><small>观察日期：{{ activeArchive.observationDate }}</small></div></div>
        <div class="real-page-images" :class="{ single: activeArchive.images.length === 1 }"><img v-for="(image, index) in activeArchive.images.slice(0, 3)" :key="`${image}-${index}`" :src="image" alt="观察现场图片" /></div>
        <article class="real-story-content"><h3>{{ activeArchive.title }}</h3><p>{{ activeArchive.content }}</p></article>
        <footer><span>记录教师：{{ activeArchive.teacher }}</span><span>来源：AI 基于观察记录生成</span></footer>
      </main>
    </div>
  </section>
</template>
