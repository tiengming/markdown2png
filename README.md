<div align="center">
  <a href="https://md2png.buxiantang.top/?utm_source=github.com&pid=share"><img src="https://pick.buxiantang.top/rest/plane-solid-full.svg" width="120" alt="墨韵飞鸢"></a>
</div>

<h1 align="center">墨韵飞鸢 🪁</h1>

<div align="center">
  <strong><a target="_blank" href="https://md2png.buxiantang.top/?utm_source=github.com&pid=share">墨韵飞鸢 🪁</a>，用指尖纸鸢，绘纸上墨韵。专业的文本转图片与精美卡片生成工具。
  </strong>基于 <a target="_blank" href="https://vuejs.org/">Vue3</a>、<a href="https://vite.dev/">Vite</a>、<a target="_blank" href="https://pinia.vuejs.org/">Pinia</a>、<a target="_blank" href="https://tailwindcss.com/">TailwindCSS</a>、<a target="_blank" href="https://www.typescriptlang.org/">TypeScript</a> 等现代化前端技术栈构建。
</div>

<br />

<div align="center">
  <a href="https://nodejs.org/en/">
    <img src="https://img.shields.io/badge/node->=18.0.0-green.svg" alt="Node Version">
  </a>
  <a href="https://github.com/tiengming/markdown2png">
    <img src="https://img.shields.io/github/package-json/v/tiengming/markdown2png" alt="Version">
  </a>
  <a href="https://github.com/tiengming/markdown2png">
    <img src="https://img.shields.io/github/license/tiengming/markdown2png" alt="LICENSE">
  </a>
  <a href="https://prettier.io/">
    <img src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat" alt="Prettier">
  </a>
  <a href="https://gitmoji.dev">
    <img src="https://img.shields.io/badge/gitmoji-%20😜%20😍-FFDD67.svg?style=flat-square" alt="Gitmoji" />
  </a>
</div>

## 🌐 访问地址

- **在线访问**：[https://md2png.buxiantang.top/](https://md2png.buxiantang.top/ '墨韵飞鸢')
- **书摘模式**：[https://md2png.buxiantang.top/digest](https://md2png.buxiantang.top/digest '书摘模式')

## ✨ 核心特色与功能

- **🎨 全新 Notion 风格工作区**：
  采用桌面分栏（Split Workspace）式的 Notion 视觉排版，左侧提供可收纳的交互式侧边栏（Sidebar），右侧作为大画布工作区。在移动端支持弹性抽屉（Off-Canvas Drawer）导航。
- **🚀 零卡顿编辑与渲染**：
  对选项切换和文本输入渲染流水线进行了深度解耦，不再在参数改动时同步阻塞触发快照预生成。仅在点击复制或保存时生成，极大地优化了配置面板的切换速度和操作流畅度。
- **📸 2x 视网膜高清导出 (Retina Display)**：
  升级底层 SnapDOM 快照机制，强制使用 2 倍 Device Pixel Ratio (Scale: 2) 导出超清晰的图片卡片，绝无边缘模糊或排版错位。
- **🏷️ 自定义品牌水印前缀**：
  提供可实时自定义的品牌前缀输入框（如 `[我的品牌] via tiengming`），支持个人与机构进行专属内容传播时的版权保护。
- **📖 真实质感书摘模式**：
  [特色书摘生成器](https://md2png.buxiantang.top/digest)全新重构，为预览画布增加了拟真优雅的多彩圆点窗口框架 and 交互动画，支持拖拽和自选各种极富质感的渐变背景，让读书笔记分享极具高级感。
- **🔒 本地离线运行，保障隐私**：
  所有 Markdown 渲染及图片渲染均在用户浏览器中进行，无需任何服务端 API 或图片上传，彻底杜绝数据泄露。

## 🛠️ 本地开发指南

```bash
# 1. 安装依赖
pnpm install

# 2. 启动本地开发服务器
pnpm dev

# 3. 执行 TypeScript 类型检查
pnpm type-check

# 4. 构建生产环境发布包
pnpm build

# 5. 本地预览构建产物
pnpm preview
```

## 🔗 友情链接

- [MD2View](https://md2view.buxiantang.top/?ref=md2png.buxiantang.top)
- [Markdown 编辑器](https://markdown.buxiantang.top/?ref=md2png.buxiantang.top)
- [tiengming 博客](https://blog.buxiantang.top/?ref=md2png.buxiantang.top)
- [X (Twitter)](https://x.com/intent/user?screen_name=MarshalXuan)

## 📄 开源许可证

本项目基于 [MIT](http://opensource.org/licenses/MIT) 许可证开源。

Copyright (c) 2022-present, [tiengming](https://blog.buxiantang.top/)
