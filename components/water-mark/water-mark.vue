<template>
	<view>
		<canvas canvas-id="mainCanvas" class="watermark-canvas"></canvas>
	</view>
</template>

<script>
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default{
		name: 'water-mark',
		data() {
			return {
			}
		},
		props: {
			text1:{
				type: String,
				required: true
			},
			text2:{
				type: String,
			},
			darkMode:{
				type: String,
				default: 'light'
			}
		},
		watch:{
			darkMode(newValue){
				if(!this.text2) this.text1;
				this.addWatermark(this.text1, this.text2);
			}
		},
		mounted(){
			this.addWatermark(this.text1, this.text2);
		},
		methods:{
			addWatermark(text1, text2 = this.text1){
				const ctx = uni.createCanvasContext('mainCanvas');
				
				ctx.rotate(-20 * Math.PI / 180);
				ctx.font = '16px Arial';
				
				if(this.darkMode == 'light') ctx.fillStyle = 'rgba(230, 230, 230, 0.3)';
				else ctx.fillStyle = 'rgba(25, 25, 25, 0.3)';
				ctx.textAlign = 'left';
				ctx.textBaseline = 'middle';
				
				let systemInfo = uni.getSystemInfoSync();
				let w_num = systemInfo.windowWidth / 120; // 屏幕宽度
				let h_num = systemInfo.windowHeight / 120; // 屏幕高度
				//console.log(w_num, h_num);
				for(let j = 0; j < h_num; j ++){
					if(j % 2 == 0){
						for(let i = 0; i < w_num; i ++){
							ctx.fillText(text1, 50 + 150 * (i - 0.36 * j), 80 + 150 * j);
						}
					}else{
						for(let i = 0; i < w_num; i ++){
							ctx.fillText(text2, 50 + 150 * (i - 0.36 * j), 80 + 150 * j);
						}
					}
				}
				
				ctx.draw();
			}
		}
	}
</script>

<style>
	.watermark-canvas{
		width: 100vw;
		height: 100vh;
	}
</style>