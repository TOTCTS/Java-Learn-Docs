import DefaultTheme from 'vitepress/theme'
import Markmap from '../components/Markmap.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // 注册全局组件
    app.component('Markmap', Markmap)
  }
} 