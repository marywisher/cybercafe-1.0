<template>
	<view v-if="visible" class="display-flex menu-container sp-around" :style="{ top: `${position.y}px`, left: `${position.x}px` }">
		<slot></slot>
	</view>
</template>

<script>
	export default {
		name: 'text-menu',
		data() {
			return {
				visible: false,
				position: {
					x: 0,
					y: 0
				},
			};
		},
		methods: {
			showMenu(x, y) {
				this.position = {
					x,
					y
				};
				this.visible = true;
			},
			hideMenu() {
				this.visible = false;
			}
		}
	};
</script>

<style lang="scss">
	.menu-container {
		position: absolute;
		width: 60vw;
		background-color: $uni-bg-color;
		border: $uni-border-base solid $uni-border-color;
		//box-shadow: 0 $uni-spacing-mini $uni-spacing-lg $uni-text-color-grey;
		z-index: 1000;
		font-size: $uni-font-size-base;
		border-radius: $uni-border-radius-lg;
		color: $uni-text-color;
	}
	@media (prefers-color-scheme: dark) {
		.menu-container {
			background-color: $uni-bg-dark-color-gray;
			border-color: $uni-text-color;
			color: $uni-text-color-disable;
		}
	}
</style>