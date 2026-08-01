import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import { SITE_CONFIG } from '../helper/config'

const baseUrl = SITE_CONFIG.domain
const defaultOgImage = `${baseUrl}/screenshots/desktop.png`
const defaultImageAlt = `${SITE_CONFIG.title} - Markdown 转图片工具界面预览`

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: {
        title: SITE_CONFIG.meta.home.title,
        description: SITE_CONFIG.meta.home.description,
        keywords: SITE_CONFIG.meta.home.keywords,
        canonical: `${baseUrl}/`,
        ogImage: defaultOgImage,
        ogImageAlt: defaultImageAlt,
        ogType: 'website',
        twitterCard: 'summary_large_image'
      }
    },
    {
      path: '/digest',
      name: 'digest',
      component: () => import('../views/Digest.vue'),
      meta: {
        title: SITE_CONFIG.meta.digest.title,
        description: SITE_CONFIG.meta.digest.description,
        keywords: SITE_CONFIG.meta.digest.keywords,
        canonical: `${baseUrl}/digest`,
        ogImage: defaultOgImage,
        ogImageAlt: `${SITE_CONFIG.title}书摘模式 - 精美书摘图片生成器`,
        ogType: 'website',
        twitterCard: 'summary_large_image'
      }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/About.vue'),
      meta: {
        title: SITE_CONFIG.meta.about.title,
        description: SITE_CONFIG.meta.about.description,
        keywords: SITE_CONFIG.meta.about.keywords,
        canonical: `${baseUrl}/about`,
        ogImage: defaultOgImage,
        ogImageAlt: `${SITE_CONFIG.title} - 产品介绍与使用说明`,
        ogType: 'website',
        twitterCard: 'summary_large_image'
      }
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0, behavior: 'smooth' }
    }
  }
})

// 路由守卫：动态更新页面标题和 meta 标签
router.beforeEach((to, from, next) => {
  // 更新页面标题
  if (to.meta.title) {
    document.title = to.meta.title as string
  }
  
  // 更新 meta description
  const descriptionMeta = document.querySelector('meta[name="description"]')
  if (descriptionMeta && to.meta.description) {
    descriptionMeta.setAttribute('content', to.meta.description as string)
  }
  
  // 更新 meta keywords
  const keywordsMeta = document.querySelector('meta[name="keywords"]')
  if (keywordsMeta && to.meta.keywords) {
    keywordsMeta.setAttribute('content', to.meta.keywords as string)
  }

  // 更新 canonical
  const canonicalLink = document.querySelector('link[rel="canonical"]')
  if (canonicalLink && to.meta.canonical) {
    canonicalLink.setAttribute('href', to.meta.canonical as string)
  }
  
  // 更新 Open Graph 标签
  const ogTitle = document.querySelector('meta[property="og:title"]')
  if (ogTitle && to.meta.title) {
    ogTitle.setAttribute('content', to.meta.title as string)
  }
  
  const ogDescription = document.querySelector('meta[property="og:description"]')
  if (ogDescription && to.meta.description) {
    ogDescription.setAttribute('content', to.meta.description as string)
  }

  const ogUrl = document.querySelector('meta[property="og:url"]')
  if (ogUrl && to.meta.canonical) {
    ogUrl.setAttribute('content', to.meta.canonical as string)
  }

  const ogImage = document.querySelector('meta[property="og:image"]')
  if (ogImage) {
    ogImage.setAttribute('content', (to.meta.ogImage as string) || defaultOgImage)
  }

  const ogImageAlt = document.querySelector('meta[property="og:image:alt"]')
  if (ogImageAlt) {
    ogImageAlt.setAttribute('content', (to.meta.ogImageAlt as string) || defaultImageAlt)
  }

  const ogType = document.querySelector('meta[property="og:type"]')
  if (ogType && to.meta.ogType) {
    ogType.setAttribute('content', to.meta.ogType as string)
  }

  // 更新 Twitter 标签
  const twitterTitle = document.querySelector('meta[name="twitter:title"]')
  if (twitterTitle && to.meta.title) {
    twitterTitle.setAttribute('content', to.meta.title as string)
  }

  const twitterDescription = document.querySelector('meta[name="twitter:description"]')
  if (twitterDescription && to.meta.description) {
    twitterDescription.setAttribute('content', to.meta.description as string)
  }

  const twitterImage = document.querySelector('meta[name="twitter:image"]')
  if (twitterImage) {
    twitterImage.setAttribute('content', (to.meta.ogImage as string) || defaultOgImage)
  }

  const twitterImageAlt = document.querySelector('meta[name="twitter:image:alt"]')
  if (twitterImageAlt) {
    twitterImageAlt.setAttribute('content', (to.meta.ogImageAlt as string) || defaultImageAlt)
  }

  const twitterCard = document.querySelector('meta[name="twitter:card"]')
  if (twitterCard && to.meta.twitterCard) {
    twitterCard.setAttribute('content', to.meta.twitterCard as string)
  }
  
  next()
})

export default router
