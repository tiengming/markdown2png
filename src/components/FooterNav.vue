<template>
	<footer class="z-0 my-4 text-center text-gray-400">
		<div class="flex flex-row flex-wrap items-center justify-center mt-2 mb-2 text-xs friends">
			<a v-for="friend in SITE_CONFIG.friends" :key="friend.name" target="_blank" class="mx-3 text-gray-400 cursor-pointer hover:text-amber-500 transition-colors"
				:href="assembleExternalLink(friend.url)"
				@click="$reortGaEvent(friend.ga, 'footer')">{{ friend.name }}</a>
		</div>
		<div class="flex flex-row flex-wrap items-center justify-center w-full text-xs">
			<span class="mx-3 text-gray-400">{{ SITE_CONFIG.copyright }}</span>
			<span class="px-2 py-0.5 text-[10px] bg-gray-100 rounded text-gray-500 font-medium me-2">{{ version }}</span>
			<a target="_blank" class="text-gray-400 cursor-pointer hover:text-amber-500 transition-colors"
				@click="$reortGaEvent('jeffjade', 'footer')" rel="external noopener"
				:href="assembleExternalLink(SITE_CONFIG.author.link)">{{ SITE_CONFIG.title }}</a>出品<br class="show-on-mobile" />
			<a target="_blank" class="mx-3 text-gray-400 cursor-pointer hover:text-amber-500 transition-colors" rel="external noopener"
				@click="$reortGaEvent('beian', 'footer')"
				:href="SITE_CONFIG.icpLink">{{ SITE_CONFIG.icp }}</a>
			<img class="zero" src="./../assets/images/zero.gif" alt="深圳市市场监督管理局企业主体身份公示" width="18" height="24"
				loading="lazy" decoding="async" />
		</div>
	</footer>
</template>

<script setup lang="ts">
import { SITE_CONFIG } from '../../src/helper/config'
import { version } from '../../package.json'

const assembleExternalLink = (url: string) => {
	return `${url}?ref=md2png.buxiantang.top`
}
</script>

<style lang="scss">
.show-on-mobile {
	display: none;
}

@media (max-width: 960px) {
	.show-on-big-screen {
		display: none;
	}

	.show-on-mobile {
		display: block;
	}
}

.zero {
	display: inline-block;
	width: 18px;
	height: 24px;
}
</style>
