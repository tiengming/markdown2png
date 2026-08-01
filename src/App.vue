<template>
	<Toast />
	
	<div class="min-h-screen flex bg-white text-gray-800 antialiased font-sans">
		<!-- Sidebar Desktop: Collapsible Notion-Style left sidebar -->
		<aside 
			:class="[
				'fixed inset-y-0 left-0 z-40 flex flex-col justify-between border-r border-gray-100 bg-[#f7f7f5] transition-all duration-300 ease-in-out md:hidden',
				isSidebarCollapsed ? 'w-0 overflow-hidden border-r-0' : 'w-60'
			]"
		>
			<div class="flex flex-col flex-1 overflow-y-auto pt-5 pb-4 px-4">
				<!-- Header Logo + Title -->
				<div class="flex items-center space-x-2 px-2 pb-6 border-b border-gray-200/50">
					<img :src="SITE_CONFIG.logo" :alt="`${SITE_CONFIG.title} Logo`" class="w-7 h-7 rounded shadow-sm" />
					<span class="text-sm font-bold tracking-tight text-gray-800">{{ SITE_CONFIG.title }}</span>
				</div>

				<!-- Workspace Tree-style Navigation Items -->
				<nav class="mt-6 flex-1 space-y-1">
					<RouterLink 
						to="/" 
						class="flex items-center px-2 py-1.5 text-xs font-medium rounded-md transition-colors group"
						:class="[
							$route.path === '/' 
								? 'bg-gray-200/60 text-gray-900 font-semibold' 
								: 'text-gray-600 hover:bg-gray-200/30 hover:text-gray-900'
						]"
					>
						<span class="mr-2 text-base">📝</span>
						<span>文本转图片</span>
					</RouterLink>

					<RouterLink 
						to="/digest" 
						class="flex items-center px-2 py-1.5 text-xs font-medium rounded-md transition-colors group"
						:class="[
							$route.path === '/digest' 
								? 'bg-gray-200/60 text-gray-900 font-semibold' 
								: 'text-gray-600 hover:bg-gray-200/30 hover:text-gray-900'
						]"
					>
						<span class="mr-2 text-base">🍑</span>
						<span>书摘模式</span>
					</RouterLink>

					<RouterLink 
						to="/about" 
						class="flex items-center px-2 py-1.5 text-xs font-medium rounded-md transition-colors group"
						:class="[
							$route.path === '/about' 
								? 'bg-gray-200/60 text-gray-900 font-semibold' 
								: 'text-gray-600 hover:bg-gray-200/30 hover:text-gray-900'
						]"
					>
						<span class="mr-2 text-base">ℹ️</span>
						<span>关于我们</span>
					</RouterLink>
				</nav>

				<!-- Collapsible Friends and External Links -->
				<div class="mt-auto pt-4 border-t border-gray-200/50">
					<div class="flex items-center justify-between px-2 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
						<span>友情链接</span>
					</div>
					<div class="mt-1 space-y-1">
						<a 
							v-for="friend in SITE_CONFIG.friends" 
							:key="friend.name" 
							target="_blank" 
							:href="`${friend.url}?ref=md2png.buxiantang.top`"
							class="flex items-center px-2 py-1 text-xs text-gray-600 rounded-md hover:bg-gray-200/30 hover:text-gray-900 transition-colors"
						>
							<span class="mr-2 text-[10px]">🔗</span>
							<span class="truncate">{{ friend.name }}</span>
						</a>
					</div>
				</div>
			</div>

			<!-- Sidebar Footer Details -->
			<div class="p-4 border-t border-gray-200/50 bg-[#f1f1ef]/40 text-[10px] text-gray-400 space-y-1.5">
				<div class="flex items-center justify-between">
					<span>{{ SITE_CONFIG.copyright }}</span>
					<span class="px-1.5 py-0.5 bg-gray-200/60 text-gray-600 rounded font-medium text-[9px]">v{{ version }}</span>
				</div>
				<p class="truncate">{{ SITE_CONFIG.title }} 出品</p>
				<p class="truncate">
					<a :href="SITE_CONFIG.icpLink" target="_blank" class="hover:underline">{{ SITE_CONFIG.icp }}</a>
				</p>
			</div>
		</aside>

		<!-- Mobile Side Drawer -->
		<div v-if="isMobileDrawerOpen" class="fixed inset-0 z-50 flex md:block hidden">
			<div class="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity" @click="isMobileDrawerOpen = false"></div>

			<div class="relative flex-1 flex flex-col max-w-xs w-full bg-[#f7f7f5] transition-transform duration-300 ease-in-out transform">
				<div class="absolute top-0 right-0 -mr-12 pt-2">
					<button type="button" class="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" @click="isMobileDrawerOpen = false">
						<span class="sr-only">Close sidebar</span>
						<svg class="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<div class="flex-1 h-0 pt-5 pb-4 px-4 overflow-y-auto flex flex-col justify-between">
					<div>
						<div class="flex items-center space-x-2 px-2 pb-6 border-b border-gray-200/50">
							<img :src="SITE_CONFIG.logo" :alt="`${SITE_CONFIG.title} Logo`" class="w-7 h-7 rounded shadow-sm" />
							<span class="text-sm font-bold tracking-tight text-gray-800">{{ SITE_CONFIG.title }}</span>
						</div>
						<nav class="mt-6 space-y-1">
							<RouterLink 
								to="/" 
								class="flex items-center px-2 py-1.5 text-xs font-medium rounded-md transition-colors"
								:class="[
									$route.path === '/' 
										? 'bg-gray-200/60 text-gray-900 font-semibold' 
										: 'text-gray-600 hover:bg-gray-200/30 hover:text-gray-900'
								]"
								@click="isMobileDrawerOpen = false"
							>
								<span class="mr-2 text-base">📝</span>
								<span>文本转图片</span>
							</RouterLink>

							<RouterLink 
								to="/digest" 
								class="flex items-center px-2 py-1.5 text-xs font-medium rounded-md transition-colors"
								:class="[
									$route.path === '/digest' 
										? 'bg-gray-200/60 text-gray-900 font-semibold' 
										: 'text-gray-600 hover:bg-gray-200/30 hover:text-gray-900'
								]"
								@click="isMobileDrawerOpen = false"
							>
								<span class="mr-2 text-base">🍑</span>
								<span>书摘模式</span>
							</RouterLink>

							<RouterLink 
								to="/about" 
								class="flex items-center px-2 py-1.5 text-xs font-medium rounded-md transition-colors"
								:class="[
									$route.path === '/about' 
										? 'bg-gray-200/60 text-gray-900 font-semibold' 
										: 'text-gray-600 hover:bg-gray-200/30 hover:text-gray-900'
								]"
								@click="isMobileDrawerOpen = false"
							>
								<span class="mr-2 text-base">ℹ️</span>
								<span>关于我们</span>
							</RouterLink>
						</nav>

						<div class="mt-8 pt-4 border-t border-gray-200/50">
							<div class="px-2 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
								友情链接
							</div>
							<div class="mt-1 space-y-1">
								<a 
									v-for="friend in SITE_CONFIG.friends" 
									:key="friend.name" 
									target="_blank" 
									:href="`${friend.url}?ref=md2png.buxiantang.top`"
									class="flex items-center px-2 py-1 text-xs text-gray-600 rounded-md hover:bg-gray-200/30 hover:text-gray-900 transition-colors"
								>
									<span class="mr-2 text-[10px]">🔗</span>
									<span class="truncate">{{ friend.name }}</span>
								</a>
							</div>
						</div>
					</div>

					<div class="mt-auto p-4 border-t border-gray-200/50 text-[10px] text-gray-400 space-y-1.5">
						<div class="flex items-center justify-between">
							<span>{{ SITE_CONFIG.copyright }}</span>
							<span class="px-1.5 py-0.5 bg-gray-200/60 text-gray-600 rounded font-medium text-[9px]">v{{ version }}</span>
						</div>
						<p class="truncate">{{ SITE_CONFIG.title }} 出品</p>
						<p class="truncate">
							<a :href="SITE_CONFIG.icpLink" target="_blank" class="hover:underline">{{ SITE_CONFIG.icp }}</a>
						</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Main Workspace Area -->
		<div 
			:class="[
				'flex-1 flex flex-col min-h-screen bg-white transition-all duration-300 ease-in-out',
				isSidebarCollapsed ? 'pl-0' : 'pl-60 md:pl-0'
			]"
		>
			<!-- Workspace Topbar Header / Breadcrumb -->
			<header class="h-11 border-b border-gray-100 flex items-center justify-between px-6 bg-[#f7f7f5]/40 select-none">
				<div class="flex items-center space-x-4">
					<!-- Collapse sidebar button (Desktop) -->
					<button 
						type="button" 
						class="text-gray-400 hover:text-gray-600 focus:outline-none md:hidden p-1 rounded hover:bg-gray-200/50"
						@click="isSidebarCollapsed = !isSidebarCollapsed"
						:aria-label="isSidebarCollapsed ? '展开侧边栏' : '折叠侧边栏'"
						title="折叠/展开侧边栏"
					>
						<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
						</svg>
					</button>

					<!-- Mobile toggle side drawer button -->
					<button 
						type="button" 
						class="text-gray-400 hover:text-gray-600 focus:outline-none md:block hidden p-1 rounded hover:bg-gray-200/50"
						@click="isMobileDrawerOpen = true"
						aria-label="打开侧边栏"
					>
						<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
						</svg>
					</button>

					<!-- Notion Breadcrumbs -->
					<div class="flex items-center space-x-1 text-xs text-gray-500 font-medium">
						<span class="hover:text-gray-800 cursor-pointer">{{ SITE_CONFIG.title }}</span>
						<span class="text-gray-300 font-normal">/</span>
						<span class="text-gray-800 font-semibold">{{ currentBreadcrumb }}</span>
					</div>
				</div>

				<div class="flex items-center space-x-3 text-xs text-gray-400 font-medium">
					<a :href="SITE_CONFIG.author.githubRepo" target="_blank" class="hover:text-gray-600 flex items-center">
						<span class="mr-1">⭐</span> GitHub
					</a>
				</div>
			</header>

			<!-- Router main view -->
			<main class="flex-1 flex flex-col items-center py-8 px-8 md:px-4 max-w-5xl w-full mx-auto">
				<RouterView />
			</main>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import Toast from './components/Toast.vue'
import { RouterView } from 'vue-router'
import { SITE_CONFIG } from './helper/config'
import { version } from '../package.json'

const route = useRoute()

// Layout State
const isSidebarCollapsed = ref(false)
const isMobileDrawerOpen = ref(false)

const currentBreadcrumb = computed(() => {
	switch (route.path) {
		case '/':
			return '🏠 文本转图片'
		case '/digest':
			return '🍑 书摘模式'
		case '/about':
			return 'ℹ️ 关于我们'
		default:
			return '🏠 首页'
	}
})
</script>

<style lang="scss">
@import './assets/styles/main.css';

/* Custom scrollbars inspired by Notion */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(15, 15, 15, 0.1);
  border-radius: 20px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(15, 15, 15, 0.2);
}
</style>
