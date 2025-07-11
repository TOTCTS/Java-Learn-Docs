<template>
  <div class="mermaid-wrapper">
    <div v-if="loading" class="status">🔄 正在加载图表...</div>
    <div v-else-if="error" class="status error">❌ {{ error }}</div>
    <div v-else class="mermaid-content" v-html="svgContent"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

const props = defineProps({
  code: {
    type: String,
    required: true
  }
})

const loading = ref(true)
const error = ref('')
const svgContent = ref('')

onMounted(async () => {
  try {
    console.log('🚀 SimpleMermaidFixed: 开始初始化')
    
    // 确保在客户端环境中运行
    if (typeof window === 'undefined') {
      console.log('⚠️ 服务端环境，跳过渲染')
      return
    }
    
    // 等待多个 tick 确保 DOM 完全准备好
    await nextTick()
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 200))
    
    console.log('📦 开始导入 Mermaid')
    
    // 动态导入 mermaid
    const mermaid = (await import('mermaid')).default
    
    console.log('📦 Mermaid 模块已导入')
    
    // 初始化 mermaid
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'Arial, sans-serif'
    })
    
    console.log('⚙️ Mermaid 已初始化')
    
    // 渲染图表
    const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const result = await mermaid.render(id, props.code)
    
    console.log('✅ 渲染成功!')
    
    // 直接使用 v-html 渲染 SVG
    svgContent.value = result.svg
    loading.value = false
    
  } catch (err) {
    console.error('❌ SimpleMermaidFixed 错误:', err)
    error.value = `渲染失败: ${err.message}`
    loading.value = false
  }
})
</script>

<style scoped>
.mermaid-wrapper {
  margin: 20px 0;
  padding: 20px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  background: #fafbfc;
  text-align: center;
}

.status {
  padding: 40px 20px;
  font-size: 16px;
  color: #666;
}

.status.error {
  color: #d73a49;
  background: #ffeaea;
  border: 1px solid #f97583;
  border-radius: 4px;
}

.mermaid-content {
  overflow-x: auto;
}

.mermaid-content :deep(svg) {
  max-width: 100%;
  height: auto;
}
</style> 