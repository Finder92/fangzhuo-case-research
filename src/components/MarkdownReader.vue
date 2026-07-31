<script setup>
import { computed } from 'vue'

const props = defineProps({
  content: { type: String, default: '' },
})

const blocks = computed(() => {
  const result = []
  let paragraph = []
  let list = null

  const flushParagraph = () => {
    if (!paragraph.length) return
    result.push({ type: 'text', tag: 'p', content: paragraph.join(' ') })
    paragraph = []
  }

  const flushList = () => {
    if (!list) return
    result.push(list)
    list = null
  }

  props.content.split(/\r?\n/).forEach((rawLine) => {
    const line = rawLine.trim()
    if (!line) {
      flushParagraph()
      flushList()
      return
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/)
    if (heading) {
      flushParagraph()
      flushList()
      result.push({ type: 'text', tag: `h${heading[1].length + 1}`, content: heading[2] })
      return
    }

    const ordered = line.match(/^\d+\.\s+(.+)$/)
    const unordered = line.match(/^[-*]\s+(.+)$/)
    if (ordered || unordered) {
      flushParagraph()
      const type = ordered ? 'ol' : 'ul'
      if (!list || list.tag !== type) {
        flushList()
        list = { type: 'list', tag: type, items: [] }
      }
      list.items.push((ordered || unordered)[1])
      return
    }

    flushList()
    paragraph.push(line)
  })

  flushParagraph()
  flushList()
  return result
})
</script>

<template>
  <div class="markdown-reader">
    <template v-for="(block, index) in blocks" :key="index">
      <component :is="block.tag" v-if="block.type === 'text'">{{ block.content }}</component>
      <component :is="block.tag" v-else>
        <li v-for="(item, itemIndex) in block.items" :key="itemIndex">{{ item }}</li>
      </component>
    </template>
  </div>
</template>
