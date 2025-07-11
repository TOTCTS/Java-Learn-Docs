<template>
  <div ref="markmapContainer" class="markmap-container">
    <div v-if="loading" class="loading">正在加载思维导图...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <svg v-else ref="markmapSvg" class="markmap-svg"></svg>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

const props = defineProps({
  markdown: {
    type: String,
    required: true
  }
})

const markmapContainer = ref(null)
const markmapSvg = ref(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    console.log('Markmap: Starting...')
    
    // 动态导入 markmap 模块
    const { Markmap } = await import('markmap-view')
    const { Transformer } = await import('markmap-lib')
    
    await nextTick()
    
    console.log('Markmap: Creating transformer...')
    
    const transformer = new Transformer()
    const { root } = transformer.transform(props.markdown)
    
    console.log('Markmap: Rendering...')
    
    if (markmapSvg.value) {
      const mm = Markmap.create(markmapSvg.value, {
        autoFit: true,
        color: (node) => {
          const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd']
          return colors[node.depth % colors.length]
        }
      })
      
      mm.setData(root)
      loading.value = false
      console.log('Markmap: Success!')
    }
  } catch (err) {
    console.error('Markmap error:', err)
    error.value = `思维导图渲染失败: ${err.message}`
    loading.value = false
  }
})
</script>

<style scoped>
.markmap-container {
  margin: 20px 0;
  text-align: center;
}

.loading {
  color: #666;
  font-style: italic;
  padding: 40px;
}

.error {
  color: #ff6b6b;
  background: #ffe0e0;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #ffcccb;
}

.markmap-svg {
  width: 100%;
  height: 500px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}
</style> 