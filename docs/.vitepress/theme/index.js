import DefaultTheme from 'vitepress/theme'
import SimpleMermaidFixed from '../components/SimpleMermaidFixed.vue'
import JavaOverviewDiagramFixed from '../components/JavaOverviewDiagramFixed.vue'
import Markmap from '../components/Markmap.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // 注册全局组件
    app.component('SimpleMermaidFixed', SimpleMermaidFixed)
    app.component('JavaOverviewDiagramFixed', JavaOverviewDiagramFixed)
    app.component('Markmap', Markmap)
  }
} 