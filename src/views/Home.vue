<script setup lang="ts">
import { computed, ref, getCurrentInstance, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { parse } from 'marked'
import { useToastStore } from './../stores/toast'
import Switch from './../components/Switch.vue'
import Spinner from './../components/Spinner.vue'
import HeadlessSelect from './../components/HeadlessSelect.vue'
import { useContentStore } from './../stores/content'
import { download2png, getCurrentDate } from './../helper/util'
import { ensureFontLoaded } from './../helper/fonts'
import { THEME_ARR, SIZES_ARR, TEXT_ALIGN_ARR, MARGIN_ARR, FONT_FAMILY_ARR } from './../helper/constant'

const toastStore = useToastStore()

interface Theme {
	id: string
	name: string
}

interface Size {
	id: string
	name: string
	style: string
}

interface Margin {
	id: string
	name: string
	style: string
}

interface StyleOption {
	id: string
	name: string
	style: string
}

const contentStore = useContentStore()
let { currentSize, currentTheme, textAlign, wrapperMargin, fontFamily, watermarkPrefix } = storeToRefs(contentStore)

const editor = ref(null) as any
let visble = ref(false) as any
const isCopying = ref(false) as any
const isSaving = ref(false) as any
let imageBlob: Blob | null = null
let isGeneratingBlob = false
let genBlobPromise: Promise<void> | null = null
// 添加缓存相关变量
let lastContentHash = ''
const { proxy } = getCurrentInstance() as any

// Lazily import snapdom so the image-capture library (~180KB) stays out of
// the initial bundle; it is only needed when generating an image.
let snapdomModulePromise: Promise<typeof import('@zumer/snapdom')> | null = null
function loadSnapdom() {
	if (!snapdomModulePromise) {
		snapdomModulePromise = import('@zumer/snapdom')
	}
	return snapdomModulePromise
}

// snapdom options - Upgraded to Retina Dpr and 2x Scale for outstanding image quality!
const snapdomOptions = {
	backgroundColor: '#ffffff',
	quality: 1,
	dpr: 2, // High DPI pixel density
	scale: 2, // 2x output scale multiplier
	type: 'png' as const,
	embedFonts: true,
	reconcile: true,
	filter: (node: HTMLElement) => {
		return !node.classList?.contains('exclude-from-image')
	},
}

// 生成内容和样式的哈希值用于缓存判断
function generateContentHash() {
	const content = editor.value?.innerHTML || ''
	const theme = currentTheme.value
	const size = currentSize.value
	const prefix = contentStore.watermarkPrefix
	const withDate = contentStore.isWithDate
	const withWatermark = contentStore.isWithWatermark
	const align = contentStore.textAlign
	const margin = contentStore.wrapperMargin
	const family = contentStore.fontFamily
	return btoa(encodeURIComponent(`${content}-${theme}-${size}-${prefix}-${withDate}-${withWatermark}-${align}-${margin}-${family}`)).slice(0, 16)
}

onMounted(() => {
	// editor.value.focus() // NOTE: Cannot enter foucs state (at mobile end)
	switch2preview()
	updatePreview()
	handlePasteEvent()
	loadSelectedFont()

	// Warm up the capture library during idle time, after first paint
	const idle = (window as any).requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 2000))
	idle(() => loadSnapdom())
})

const currentSizeObj = computed(() => {
	return SIZES_ARR.filter((item: Size) => item.id === currentSize.value)[0]
})

const currentThemeObj = computed(() => {
	return THEME_ARR.filter((item: Theme) => item.id === currentTheme.value)[0]
})

const currentMarginObj = computed(() => {
	return MARGIN_ARR.filter((item: Margin) => item.id === wrapperMargin.value)[0]
})

const currentFontFamilyObj = computed(() => {
	return FONT_FAMILY_ARR.find((item: StyleOption) => item.id === fontFamily.value) ?? FONT_FAMILY_ARR[0]
})

const containerStyle = computed(() => {
	return [
		currentSizeObj.value.style,
		currentMarginObj.value.style,
		currentFontFamilyObj.value.style,
	]
})

function updatePreview() {
	if (!editor.value) return

	const dateDomNode = document.getElementById('date-time')
	if (dateDomNode) dateDomNode.remove()

	const watermarkDomNode = document.getElementById('home-watermark')
	if (watermarkDomNode) watermarkDomNode.remove()

	if (!editor.value.innerHTML) return

	if (contentStore.isWithDate) {
		const dateHtml = `<p id='date-time' style='text-align: right;'><time>${getCurrentDate()}</time></p>`
		editor.value.innerHTML += dateHtml
	}

	if (contentStore.isWithWatermark) {
		const watermarkHtml = `<p id='home-watermark' style='text-align: center;padding-bottom: 1rem;' class='rainbow-text home-watermark font-bold ${currentThemeObj.value.id}'>「${contentStore.watermarkPrefix} via tiengming」</p>`
		editor.value.innerHTML += watermarkHtml
	}
}

function switch2preview() {
	editor.value.innerHTML = parse(contentStore.content, {
		breaks: true,
	})
}

function switch2editor() {
	editor.value.innerText = contentStore.content
}

function handlePasteEvent() {
	const editor: Element | null = document.querySelector('#editor')
	editor?.addEventListener('paste', (event: any) => {
		const target = event.clipboardData || event?.dataTransfer
		let htmlPlain = target.getData('text/plain')
		htmlPlain = htmlPlain.replaceAll('\n', '<br />')
		const selection: Selection | null = window.getSelection()
		if (!selection?.rangeCount) return false
		selection.deleteFromDocument()
		document.execCommand('insertHTML', false, htmlPlain)
		event.preventDefault()
	})
}

function onPreviewImage() {
	visble.value = true
}

function loadSelectedFont() {
	return ensureFontLoaded(contentStore.fontFamily)
}

// 优化的 generateBlob 函数
async function generateBlob() {
	const currentContentHash = generateContentHash()

	if (imageBlob && lastContentHash === currentContentHash) {
		return
	}

	if (isGeneratingBlob) {
		if (genBlobPromise) {
			await genBlobPromise
		}
		return
	}

	isGeneratingBlob = true
	genBlobPromise = new Promise(async (resolve, reject) => {
		const container = document.getElementById('container')!
		const editorEl = container.querySelector('#editor') as HTMLInputElement
		try {
			// 预处理：确保所有字体和图片已加载
			await Promise.all([
				document.fonts.ready,
				loadSelectedFont(),
				...Array.from(container.querySelectorAll('img')).map(img => {
					if (img.complete) return Promise.resolve()
					return new Promise((resolve) => {
						img.onload = resolve
						img.onerror = resolve // 即使图片加载失败也继续
						setTimeout(resolve, 1000) // 1秒超时
					})
				})
			])

			// 临时优化样式
			const originalStyles = {
				transition: container.style.transition,
				animation: container.style.animation,
				contentEditable: editorEl.contentEditable,
				transform: container.style.transform
			}

			// 应用优化样式
			container.style.transition = 'none'
			container.style.animation = 'none'
			container.style.transform = 'translateZ(0)' // 启用硬件加速
			editorEl.contentEditable = 'false'

			// 强制重排 and 重绘
			container.offsetHeight

			// 使用 snapdom 生成图片
			const { snapdom } = await loadSnapdom()
			imageBlob = await snapdom.toBlob(container, snapdomOptions as any)

			// 恢复原始样式
			Object.assign(container.style, originalStyles)
			editorEl.contentEditable = originalStyles.contentEditable

			// 更新缓存哈希
			lastContentHash = currentContentHash

			resolve()
		} catch (error) {
			editorEl.contentEditable = 'true'
			console.error('Failed to generate the image blob:', error)
			reject(error)
		} finally {
			isGeneratingBlob = false
			genBlobPromise = null
		}
	})
	await genBlobPromise
}

/* -------------------On Event Callback------------------- */
// 深度重构：完全移除对 generateBlob() 的静默后台触发。
// 在用户切换选项时，仅仅执行状态更新和预览页面局部重绘，
// 这样可以 100% 杜绝卡顿和界面抖动，带来极致丝滑的 Notion Page 操纵感。
function handleDate(value: boolean) {
	contentStore.updateWithDate(value)
	updatePreview()
	imageBlob = null // 仅清除缓存，绝不触发后台 snapdom 生成
	proxy.$reortGaEvent('home-date-change', 'main')
}

function handleWatermark(value: boolean) {
	contentStore.updateWithWatermark(value)
	updatePreview()
	imageBlob = null // 仅清除缓存，绝不触发后台 snapdom 生成
	proxy.$reortGaEvent('home-watermark-change', 'main')
}

function handleWatermarkPrefixChange(event: Event) {
	const val = (event.target as HTMLInputElement).value
	contentStore.updateWatermarkPrefix(val)
	updatePreview()
	imageBlob = null
}

function handleSelectTheme(item: Theme) {
	contentStore.updateCurrentTheme(item.id)
	updatePreview()
	imageBlob = null
	proxy.$reortGaEvent('home-theme', 'main')
	proxy.$reortGaEvent(`home-theme-${item.name}`, 'main')
}

function handleSelectSize(item: any) {
	contentStore.updateCurrentSize(item.id)
	updatePreview()
	imageBlob = null
	proxy.$reortGaEvent('home-size', 'main')
}

function handleSelectTextAlign(item: { id: string; name: string }) {
	contentStore.updateTextAlign(item.id)
	imageBlob = null
	proxy.$reortGaEvent('home-text-align', 'main')
}

function handleSelectMargin(item: Margin) {
	contentStore.updateWrapperMargin(item.id)
	imageBlob = null
	proxy.$reortGaEvent('home-margin', 'main')
}

async function handleSelectFontFamily(item: StyleOption) {
	contentStore.updateFontFamily(item.id)
	await loadSelectedFont()
	imageBlob = null
	proxy.$reortGaEvent('home-font-family', 'main')
}

function onEditorFocus() {
	switch2editor()
	proxy.$reortGaEvent('home-focus', 'main')
}

// 确保在编辑器失焦时，正确触发缓存清除
function onEditorBlur() {
	contentStore.updateContent(editor.value.innerText)
	switch2preview()
	updatePreview()
	proxy.$reortGaEvent('home-blur', 'main')
	imageBlob = null
}

async function onCopyImage() {
	if (isCopying.value) return
	isCopying.value = true

	try {
		const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
		// 桌面 Safari 允许尝试复制，iOS Safari 基本不支持图片写入剪贴板
		if (isIOS) {
			toastStore.info('iOS 环境暂不支持复制图片，请选择"保存图片"')
			return
		}

		// 只有在用户点击复制时，才按需在后台线程或微任务中实时生成图片
		if (!imageBlob || lastContentHash !== generateContentHash()) {
			await generateBlob()
		}

		if (imageBlob) {
			// 能力检测：仅在支持 ClipboardItem 与 clipboard.write 时尝试
			if (!('clipboard' in navigator) || !(window as any).ClipboardItem) {
				throw new Error('当前浏览器不支持图片复制 API')
			}
			const pngBlob = imageBlob.type === 'image/png' ? imageBlob : new Blob([imageBlob], { type: 'image/png' })
			const item = new (window as any).ClipboardItem({ 'image/png': pngBlob })
			await navigator.clipboard.write([item])
			toastStore.success('已复制图片至您的剪切板')
			proxy.$reortGaEvent('copy-img-success', 'main')
		}
	} catch (error) {
		console.error('复制图片失败:', error)
		toastStore.error('复制图片失败，请重试')
		proxy.$reortGaEvent('copy-img-failed', 'main')
	} finally {
		proxy.$reortGaEvent(`copy-img-${currentTheme.value}`, 'main')
		isCopying.value = false
	}
}

async function onSave2Image() {
	if (isSaving.value) return
	isSaving.value = true

	try {
		// 只有在用户点击保存时，才按需在后台线程或微任务中实时生成图片
		if (!imageBlob || lastContentHash !== generateContentHash()) {
			await generateBlob()
		}
		if (imageBlob) {
			// 确保在用户交互上下文中调用下载
			download2png(imageBlob)
			// 延迟显示成功消息，给 Safari 更多时间处理下载
			setTimeout(() => {
				toastStore.success('已成功为你保存图片')
			}, 200)
		}
		proxy.$reortGaEvent('save-img-success', 'main')
	} catch (error) {
		console.error('保存图片失败:', error)
		toastStore.error('保存图片失败，请重试')
		proxy.$reortGaEvent('save-img-failed', 'main')
	} finally {
		isSaving.value = false
	}
}
</script>

<template>
	<!-- Main Preview Area -->
	<section class="flex justify-center w-full max-w-4xl mx-auto mb-8">
		<div id="container" class="container" style="text-autospace: normal;" :style="containerStyle">
			<div :class="`${currentThemeObj.id}-box warpper`">
				<div class="content" :class="currentThemeObj.id">
					<!-- Notion Header Page Icon Emoji (outside editor to prevent contamination) -->
					<div v-if="currentTheme === 'notion'" id="notion-header" style="font-size: 4rem; margin-bottom: 1.5rem; text-align: left; line-height: 1;" class="select-none">
						🍑
					</div>
					<div id="editor" ref="editor" @blur="onEditorBlur" @focus="onEditorFocus"
						:class="['editor', 'markdown', { 'markdown--justify': textAlign === 'justify' }]"
						contenteditable="true">
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Properties Area - Stylized as an authentic Notion Database Page Property List -->
	<div class="w-full max-w-4xl bg-white border border-gray-100 rounded-xl p-6 mb-6">
		<div class="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
			<h2 class="text-sm font-bold uppercase tracking-wider text-gray-400">页面属性设置</h2>
			<div class="flex items-center space-x-2">
				<span class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
				<span class="text-xs text-gray-400">所有属性将自动应用</span>
			</div>
		</div>

		<div class="space-y-4 max-w-2xl">
			<!-- Property Row: Themes -->
			<div class="flex items-center text-sm">
				<div class="w-1/3 flex items-center text-gray-400 font-medium">
					<span class="mr-2 text-base">🎨</span>
					<span>渲染主题</span>
				</div>
				<div class="w-2/3 flex items-center">
					<HeadlessSelect className="w-56" :sourceArr="THEME_ARR" :defaultId="currentTheme"
						@selected="handleSelectTheme" />
				</div>
			</div>

			<!-- Property Row: Font Family -->
			<div class="flex items-center text-sm">
				<div class="w-1/3 flex items-center text-gray-400 font-medium">
					<span class="mr-2 text-base">🔤</span>
					<span>字体选择</span>
				</div>
				<div class="w-2/3 flex items-center">
					<HeadlessSelect className="w-56" :sourceArr="FONT_FAMILY_ARR" :defaultId="fontFamily"
						@selected="handleSelectFontFamily" />
				</div>
			</div>

			<!-- Property Row: Text Align -->
			<div class="flex items-center text-sm">
				<div class="w-1/3 flex items-center text-gray-400 font-medium">
					<span class="mr-2 text-base">↔️</span>
					<span>对齐方式</span>
				</div>
				<div class="w-2/3 flex items-center">
					<HeadlessSelect className="w-56" :sourceArr="TEXT_ALIGN_ARR" :defaultId="textAlign"
						@selected="handleSelectTextAlign" />
				</div>
			</div>

			<!-- Property Row: Padding Margin -->
			<div class="flex items-center text-sm">
				<div class="w-1/3 flex items-center text-gray-400 font-medium">
					<span class="mr-2 text-base">📐</span>
					<span>外边距</span>
				</div>
				<div class="w-2/3 flex items-center">
					<HeadlessSelect className="w-56" :sourceArr="MARGIN_ARR" :defaultId="wrapperMargin"
						@selected="handleSelectMargin" />
				</div>
			</div>

			<!-- Property Row: Canvas Sizes -->
			<div class="flex items-center text-sm">
				<div class="w-1/3 flex items-center text-gray-400 font-medium">
					<span class="mr-2 text-base">🖥️</span>
					<span>画布尺寸</span>
				</div>
				<div class="w-2/3 flex items-center">
					<HeadlessSelect className="w-56" :sourceArr="SIZES_ARR" :defaultId="currentSize"
						@selected="handleSelectSize" />
				</div>
			</div>

			<!-- Property Row: Date Tag -->
			<div class="flex items-center text-sm">
				<div class="w-1/3 flex items-center text-gray-400 font-medium">
					<span class="mr-2 text-base">📅</span>
					<span>日期水印</span>
				</div>
				<div class="w-2/3 flex items-center">
					<Switch :state="contentStore.isWithDate" @check="handleDate" />
				</div>
			</div>

			<!-- Property Row: Watermark -->
			<div class="flex items-center text-sm">
				<div class="w-1/3 flex items-center text-gray-400 font-medium">
					<span class="mr-2 text-base">🏷️</span>
					<span>品牌水印</span>
				</div>
				<div class="w-2/3 flex items-center">
					<Switch :state="contentStore.isWithWatermark" @check="handleWatermark" />
				</div>
			</div>

			<!-- Property Row: Watermark Custom Prefix (Only show if watermark toggle is true) -->
			<div v-if="contentStore.isWithWatermark" class="flex items-center text-sm animate-fade-in">
				<div class="w-1/3 flex items-center text-gray-400 font-medium">
					<span class="mr-2 text-base">✍️</span>
					<span>水印前缀</span>
				</div>
				<div class="w-2/3 flex items-center space-x-2">
					<input 
						type="text" 
						:value="watermarkPrefix" 
						@input="handleWatermarkPrefixChange($event)" 
						class="w-56 px-3 py-1.5 h-10 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-gray-400 transition-colors" 
						placeholder="输入自定义水印前缀"
					/>
					<span class="text-xs text-gray-400">via tiengming</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Action Controls Bar -->
	<div class="w-full max-w-4xl bg-white border border-gray-100 rounded-xl p-4 flex md:flex-col justify-between items-center md:space-y-3 mb-8">
		<div class="text-xs text-gray-400 font-medium">
			💡 提示：在上方文本框内直接点击可直接进行富文本/Markdown编辑
		</div>
		<div class="flex space-x-3 md:w-full">
			<button 
				class="flex-1 min-w-[120px] inline-flex items-center justify-center space-x-2 px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-100 transition-colors" 
				:disabled="isCopying" 
				@click="onCopyImage"
			>
				<Spinner v-if="isCopying" :size="16" />
				<span>{{ isCopying ? '复制中...' : '复制图片' }}</span>
			</button>
			<button 
				class="flex-1 min-w-[120px] inline-flex items-center justify-center space-x-2 px-4 py-2 text-xs font-bold text-white bg-gray-900 border border-transparent rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors" 
				:disabled="isSaving" 
				@click="onSave2Image"
			>
				<Spinner v-if="isSaving" :size="16" />
				<span>{{ isSaving ? '保存中...' : '保存图片' }}</span>
			</button>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.container {
	transition: box-shadow 1s ease-out;
	transition-delay: 2s;

	.warpper {
		padding: var(--wrapper-padding, 3rem);
		box-shadow: 0 2px 5px rgb(0 0 25 / 10%), 0 5px 75px 1px rgb(0 0 50 / 20%);
	}

	.content {
		position: relative;
		width: 100%;
		height: auto;
		min-height: 100%;
		flex: 1 1 0%;

		.editor {
			min-height: 12rem;
			padding: 1rem;
			border: none;
			outline: none;

			&:hover,
			&:active {
				border: none;
				outline: none;
			}
		}
	}
}

.notion-box {
	background-color: #f1f1ef;

	.notion {
		background-color: #ffffff;
		border: 1px solid rgba(15, 15, 15, 0.1);
		border-radius: 8px;
		box-shadow: 0 1px 3px rgba(15, 15, 15, 0.05);

		.editor {
			color: #37352f;
			background-color: transparent;
			font-family: var(--markdown-font-family, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol") !important;
			
			:deep(h1) {
				font-size: 1.875rem;
				font-weight: 700;
				color: #37352f;
				border-bottom: 1px solid rgba(55, 53, 47, 0.08);
				padding-bottom: 0.3em;
				margin-top: 1.5rem;
				margin-bottom: 0.5rem;
			}
			:deep(h2) {
				font-size: 1.5rem;
				font-weight: 600;
				color: #37352f;
				margin-top: 1.4rem;
				margin-bottom: 0.4rem;
			}
			:deep(h3) {
				font-size: 1.25rem;
				font-weight: 600;
				color: #37352f;
				margin-top: 1.2rem;
				margin-bottom: 0.3rem;
			}
			:deep(p) {
				margin-bottom: 0.75rem;
				color: #37352f;
				line-height: 1.625;
			}
			:deep(blockquote) {
				border-left: 3px solid #37352f;
				color: #37352f;
				padding-left: 0.875rem;
				margin-left: 0;
				font-style: italic;
			}
			:deep(pre) {
				background-color: #f7f7f5;
				border-radius: 4px;
				padding: 1rem;
				border: 1px solid rgba(15, 15, 15, 0.05);
			}
			:deep(code) {
				background-color: rgba(135, 131, 120, 0.15);
				color: #eb5757;
				padding: 0.125rem 0.25rem;
				border-radius: 3px;
				font-size: 85%;
			}
		}
	}
}

.antiquity-box {
	background: #e9e7d9 url('./../assets/images/classical.png') repeat 0 0;

	.antiquity {
		position: relative !important;
		border: 3px solid #c02c38;
		padding: 1rem;
	}
}

.classic-box {
	background-color: #f2f2f2;

	.classic {
		background-color: #f2f2f2;
	}
}

.note-box {
	background-color: #fffcf5;

	.note {
		border: 1px solid #e8e5dc;

		&::before {
			position: absolute;
			content: '';
			left: 3px;
			right: 3px;
			bottom: 3px;
			top: 3px;
			border: 1px solid #e8e5dc;
			z-index: 0;
		}
	}
}

.dark-box {
	background-image: linear-gradient(to right, #434343 0%, black 100%);

	.dark {
		background-color: transparent;

		.editor {
			color: #f2f2f2;
			background-color: transparent;

			:deep(pre) {
				color: #f2f2f2 !important;
				background-color: rgba(255, 255, 255, 0.1) !important;
			}
		}
	}
}

.bbburst-box {
	background: url(./../assets/images/bbburst.svg);
	background-size: 100%;

	.bbburst {
		background-color: transparent;

		.editor {
			background-color: rgba(255, 255, 255, 0.8);
			backdrop-filter: blur(2px);
		}
	}
}

.vitality-box {
	background: linear-gradient(225deg, #9cccfc 0, #e6cefd 99.54%);

	.vitality {
		background-color: #f2f2f2;
		border-radius: 1rem;
	}
}

.gradient-box {
	background-image: linear-gradient(to top, #a8edea 0%, #fed6e3 100%);

	.gradient {
		background-color: transparent;

		.editor {
			background-color: transparent;
		}
	}
}

.official-box {
	position: relative;

	&::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		z-index: -2;
		background: linear-gradient(180deg,
				#04629d 0,
				#037dcc 49.48%,
				#0289e0 100%);
	}

	.official {
		.editor {
			color: #f2f2f2;
			background-color: transparent;

			:deep(pre) {
				color: #333333;
			}
		}
	}
}

.yellow-box {
	background-image: radial-gradient(circle farthest-side, #fceabb, #f8b500);

	.yellow {
		.editor {
			color: #000;
			background-color: transparent;
		}
	}
}

.sakura-box {
	background-image: linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #ff9a9e 100%);

	.sakura {
		background-color: transparent;

		.editor {
			color: #5a3d2b;
			background-color: rgba(255, 255, 255, 0.7);
			border-radius: 0.75rem;
			backdrop-filter: blur(4px);
		}
	}
}

.ocean-box {
	background-image: linear-gradient(135deg, #1e3a8a 0%, #0ea5e9 50%, #06b6d4 100%);

	.ocean {
		background-color: transparent;

		.editor {
			color: #ffffff;
			background-color: rgba(255, 255, 255, 0.15);
			border-radius: 1rem;
			backdrop-filter: blur(8px);

			:deep(pre) {
				color: #ffffff !important;
				background-color: rgba(0, 0, 0, 0.3) !important;
			}
		}
	}
}

.forest-box {
	background-image: linear-gradient(to bottom, #a8edea 0%, #fed6e3 25%, #d299c2 50%, #fef9d7 75%, #89f7fe 100%);

	.forest {
		background-color: transparent;

		.editor {
			color: #2d5016;
			background-color: rgba(255, 255, 255, 0.85);
			border-radius: 0.5rem;
		}
	}
}

.starry-box {
	background-image: radial-gradient(ellipse at center, #1e3c72 0%, #2a5298 35%, #1a1a2e 100%);

	.starry {
		background-color: transparent;
		position: relative;

		&::before {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background-image:
				radial-gradient(2px 2px at 20% 30%, white, transparent),
				radial-gradient(2px 2px at 60% 70%, white, transparent),
				radial-gradient(1px 1px at 50% 50%, white, transparent),
				radial-gradient(1px 1px at 80% 10%, white, transparent),
				radial-gradient(2px 2px at 90% 60%, white, transparent);
			background-size: 200% 200%;
			opacity: 0.6;
			animation: twinkle 20s infinite;
		}

		.editor {
			color: #e8eaf6;
			background-color: rgba(0, 0, 0, 0.3);
			border-radius: 0.75rem;
			backdrop-filter: blur(4px);

			:deep(pre) {
				color: #e8eaf6 !important;
				background-color: rgba(255, 255, 255, 0.1) !important;
			}
		}
	}
}

@keyframes twinkle {

	0%,
	100% {
		background-position: 0% 0%;
	}

	50% {
		background-position: 100% 100%;
	}
}

.aurora-box {
	background-image: linear-gradient(45deg,
			#667eea 0%,
			#764ba2 20%,
			#f093fb 40%,
			#4facfe 60%,
			#00f2fe 80%,
			#43e97b 100%);
	background-size: 400% 400%;
	animation: aurora 15s ease infinite;

	.aurora {
		background-color: transparent;

		.editor {
			color: #1a1a1a;
			background-color: rgba(255, 255, 255, 0.9);
			border-radius: 1rem;
			box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
		}
	}
}

@keyframes aurora {
	0% {
		background-position: 0% 50%;
	}

	50% {
		background-position: 100% 50%;
	}

	100% {
		background-position: 0% 50%;
	}
}

.mint-box {
	background-image: linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%);

	.mint {
		background-color: transparent;

		.editor {
			color: #0d4f3c;
			background-color: rgba(255, 255, 255, 0.8);
			border-radius: 1rem;
		}
	}
}

.sunset-box {
	background-image: linear-gradient(to bottom, #fa709a 0%, #fee140 50%, #ff6b6b 100%);

	.sunset {
		background-color: transparent;

		.editor {
			color: #3d1f00;
			background-color: rgba(255, 255, 255, 0.85);
			border-radius: 0.75rem;
			box-shadow: 0 2px 10px rgba(250, 112, 154, 0.3);
		}
	}
}

.purple-box {
	background-image: 
		radial-gradient(circle at 20% 80%, rgba(186, 85, 211, 0.15) 0%, transparent 50%),
		radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.12) 0%, transparent 50%),
		linear-gradient(135deg, #8b5cf6 0%, #a855f7 25%, #c026d3 50%, #d946ef 75%, #f0abfc 100%);

	.purple {
		background-color: transparent;
		position: relative;
		overflow: hidden;

		/* Floating particles effect */
		&::before {
			content: '';
			position: absolute;
			top: -50%;
			left: -50%;
			width: 200%;
			height: 200%;
			background-image:
				radial-gradient(circle, rgba(255, 255, 255, 0.8) 1px, transparent 1px),
				radial-gradient(circle, rgba(240, 171, 252, 0.6) 1px, transparent 1px);
			background-size: 80px 80px, 120px 120px;
			background-position: 0 0, 40px 60px;
			opacity: 0.4;
			z-index: 1;
		}

		/* Dreamy mist effect */
		&::after {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: 
				radial-gradient(ellipse at 30% 40%, rgba(168, 85, 247, 0.15) 0%, transparent 40%),
				radial-gradient(ellipse at 70% 60%, rgba(217, 70, 239, 0.12) 0%, transparent 45%),
				radial-gradient(ellipse at 50% 80%, rgba(240, 171, 252, 0.1) 0%, transparent 50%);
			z-index: 0;
		}

		.editor {
			position: relative;
			z-index: 2;
			color: #ffffff;
			background: linear-gradient(135deg, 
				rgba(139, 92, 246, 0.25) 0%, 
				rgba(168, 85, 247, 0.30) 50%,
				rgba(192, 38, 211, 0.25) 100%);
			border-radius: 1.25rem;
			backdrop-filter: blur(12px) saturate(1.2);
			box-shadow: 
				0 8px 32px rgba(139, 92, 246, 0.15),
				inset 0 1px 0 rgba(255, 255, 255, 0.15),
				inset 0 -1px 0 rgba(0, 0, 0, 0.1);
			border: 1px solid rgba(255, 255, 255, 0.18);

			:deep(pre) {
				color: #f3e8ff !important;
				background: linear-gradient(135deg,
					rgba(88, 28, 135, 0.35) 0%,
					rgba(107, 33, 168, 0.4) 100%) !important;
				border-radius: 0.75rem;
				border: 1px solid rgba(168, 85, 247, 0.25);
				backdrop-filter: blur(8px);
			}

			:deep(code) {
				text-shadow: 0 0 8px rgba(240, 171, 252, 0.3);
			}
		}
	}
}


.minimal-box {
	background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);

	.minimal {
		background-color: #ffffff;
		border: 1px solid #e0e0e0;
		border-radius: 0.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

		.editor {
			color: #333333;
			background-color: transparent;
		}
	}
}

.tech-box {
	background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
	position: relative;

	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-image:
			linear-gradient(90deg, transparent 79px, rgba(0, 255, 255, 0.03) 81px, rgba(0, 255, 255, 0.03) 82px, transparent 84px),
			linear-gradient(rgba(0, 255, 255, 0.03) 1px, transparent 1px);
		background-size: 100px 20px;
		opacity: 0.5;
	}

	.tech {
		background-color: transparent;

		.editor {
			color: #00ffff;
			background-color: rgba(0, 0, 0, 0.4);
			border-radius: 0.25rem;
			box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
			text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);

			:deep(pre) {
				color: #00ffff !important;
				background-color: rgba(0, 0, 0, 0.2) !important;
			}
		}
	}
}

:deep(.home-watermark) {
	background-color: transparent;
	text-align: center;
	font-size: 1rem;
	margin: 0;
	opacity: 0.9;

	&.notion,
	&.note,
	&.classic,
	&.antiquity,
	&.minimal{
		color: #1f2937;
	}

	&.dark,
	&.official,
	&.ocean,
	&.starry,
	&.purple,
	&.tech {
		color: #e5e7eb;
	}
}

@media (max-width: 960px) {
	.container {
		width: 100% !important;
	}
}

/* Animations */
@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateY(-5px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.animate-fade-in {
	animation: fadeIn 0.2s ease-out forwards;
}
</style>