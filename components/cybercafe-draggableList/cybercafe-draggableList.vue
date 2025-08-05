<template>
	<view class="drag-container">
		<template v-if="controlsPositionArray.length !== 0">
			<view v-for="(item, index) in controlsArray" :key="index" class="item" 
			:style="{'transition': (currentControlsIndex === index ? 'initial' : `${animationDuration}s`), 
			'z-index': (currentControlsIndex === index ? 1 : 0),
			'height': controlsSize.height + 'px',
			'top': controlsPositionArray[index].top + 'px',
			'left': controlsPositionArray[index].left + 'px'}">
				<view class="list-item display-flex display-line sp-between"  @touchend="handleTouchend"
				:class="{'dragable-item': item.enable, 'dragging': item.flag }">
					<view>{{item.title}}</view>
					<view v-if="item.enable" class="iconfont icon-paixu-sanheng" @touchstart="handleTouchstart($event, index)" 
					@touchmove="handleTouchmove" @touchend="handleTouchend"></view>
				</view>
			</view>
		</template>
	</view>
</template>

<script>
	export default{
		name: 'cybercafe-draggableList',
		props: {
			controlsSize: {//控件大小
				type: Object,
				default: () => ({
					height: 30
				}),
			},
			list: {//数据列表
				type: Array,
				default: () => [],
			},
			animationDuration: {//动画时长
				type: Number,
				default: 0.3
			},
			moveDirection: {//移动方向
				type: String,
				default: 'all' //all x y
			}
		},
		data() {
			return {
				controlsArray: [],//控件列表
				maxWidthCount: 1,//每行最大存放的个数
				margin: {//控件间距
					x: 0,
					y: 10
				},
				recordInitControlsPositionList: [],//记录所有控件的初始位置
				controlsPositionArray: [],//控件的数据
				recordPosition: {//记录当前手指的位置
					x: 0,
					y: 0
				},
				recordControlsPositionItem: {},//记录当前操作的控件数据
				currentControlsIndex: -1,//当前操作的控件下标
			}
		},
		methods: {
			init(){
				this.systemInfo = uni.getSystemInfoSync();
				this.controlsArray = this.list;
				this.$nextTick(() => {
					this.controlsPositionArray = this.initControlsPosition();
				})
			},
			initControlsPosition(){
				let tempArray = [];
				for(let i = 0, j = 0; i < this.list.length; i ++, j ++){
					tempArray[i] = {
						left: this.margin.x,
						top: j * (this.controlsSize.height + this.margin.y)
					}
					this.controlsArray[i].flag = false;
				}
				this.recordInitControlsPositionList = [...tempArray];//深拷贝
				return tempArray;
			},
			handleTouchmove(event){
				const {
					pageX,
					pageY
				} = event.touches[0];
				this.controlsPositionArray[this.currentControlsIndex] = {
					//left: this.controlsPositionArray[this.currentControlsIndex].left 
						//+ (pageX - this.recordPosition.x),
					top: this.controlsPositionArray[this.currentControlsIndex].top
						+ (pageY - this.recordPosition.y)
				};
				this.recordPosition = {
					x: pageX,
					y: pageY
				};
				//向下移动
				if(this.currentControlsIndex !== this.controlsPositionArray.length - 1 
					&& this.controlsPositionArray[this.currentControlsIndex].top 
					> this.controlsPositionArray[this.currentControlsIndex + 1].top){
					this._handleChangeControlsPosition(0, this.currentControlsIndex + 1);
				}
				//向上移动
				if(this.currentControlsIndex !== 0 
					&& this.controlsPositionArray[this.currentControlsIndex].top 
					< this.controlsPositionArray[this.currentControlsIndex - 1].top){
					 this._handleChangeControlsPosition(0, this.currentControlsIndex - 1);
				}
			},
			handleTouchstart(event, index){
				const {
					pageX,
					pageY
				} = event.touches[0];
				this.currentControlsIndex = index;
				this.recordPosition = {
					x: pageX,
					y: pageY
				};
				this.recordControlsPositionItem = this.controlsPositionArray[index];
				this.controlsArray[this.currentControlsIndex].flag = true;
			},
			handleTouchend(event){
				if(this.currentControlsIndex == -1) return;
				this.controlsPositionArray[this.currentControlsIndex] = this.recordInitControlsPositionList[this.currentControlsIndex];
				this.controlsArray[this.currentControlsIndex].flag = false;
				this.currentControlsIndex = -1;
			},
			_handleChangeControlsPosition(type, index){//处理交换控件
				let tempControls = this.controlsArray[this.currentControlsIndex];
				this.controlsArray[this.currentControlsIndex] = this.controlsArray[index];
				this.controlsArray[index] = tempControls;
				this.controlsPositionArray[index] = this.controlsPositionArray[this.currentControlsIndex];
				this.controlsPositionArray[this.currentControlsIndex] = this.recordControlsPositionItem;
				this.currentControlsIndex = index;
				this.recordControlsPositionItem = this.recordInitControlsPositionList[this.currentControlsIndex];
			}
		}
	}
</script>

<style scoped lang="scss">
	.drag-container{
		position: relative;
		width: 100%;
		height: 100%;
		
		.item{
			width: calc(80vw - $uni-spacing-lg);
			height: 100%;
			position: absolute;
			
			.list-item{
				width: 100%;
				line-height: 30px;
				padding-top: $uni-width-none;
				padding-bottom: $uni-width-none;
				
				.icon-paixu-sanheng{
					color: $uni-color-main;
				}
			}
			.dragable-item{
				border-radius: $uni-border-radius-lg;
				border: $uni-border-base solid $uni-color-main;
				//background-color: $uni-bg-color-grey; 
			}
			
			.dragging{
				opacity: 0.5;
				z-index: 999;
			}
		}
	}
	@media (prefers-color-scheme: dark) {
		.icon-paixu-sanheng{
			color: $uni-color-dark-main;
		}
		.dragable-item{
			border-color: $uni-color-dark-main;
		}
	}
</style>