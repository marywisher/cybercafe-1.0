<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
			//获取APP网络信息，不含H5
			uni.getNetworkType({
				success: res => {
					if (res.networkType === 'none') {
						// 没有网络连接
						console.log('当前无网络连接');
					} else {
						// 有网络连接
						console.log('wdebug--res', res.networkType);
					}
				}
			})
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
/*每个页面公共css */
	.content {
		padding: $uni-spacing-base;
		margin: $uni-width-none auto;
	}
	.hint{
		font-size: $uni-font-size-sm;
		color: gray;
	}
	.required{
		color: red;
	}
	.text-center{
		text-align: center;
	}
	.display-flex{
		display: flex;
	}
	.sp-between{
		justify-content: space-between;
	}
	.list-item, .group-item{
		border-radius: $uni-border-radius-lg;
		margin: $uni-spacing-sm auto $uni-spacing-sm;
		padding: $uni-spacing-lg $uni-spacing-base $uni-spacing-base;
		box-shadow: $uni-width-none $uni-width-none $uni-spacing-base $uni-spacing-mini $uni-box-shadow-color;
		background-color: $uni-bg-color-grey;
	}
	.group-item{
		margin: $uni-spacing-lg;
		padding: $uni-spacing-lg;
	}
	.tag-item{
		font-size: $uni-font-size-mini;
		border:$uni-border-base solid $uni-text-color-grey;
		color:$uni-text-color-grey;
		border-radius: $uni-border-radius-huge;
		padding: $uni-spacing-sm $uni-spacing-base;
		margin-right: $uni-spacing-base;
	}
	input{
		padding: $uni-spacing-sm $uni-spacing-base;
		border: $uni-border-base solid $uni-text-color-grey;
	}
	@media (prefers-color-scheme: dark) {
		.list-item, .group-item{
			box-shadow: $uni-width-none $uni-width-none $uni-spacing-base $uni-spacing-mini $uni-color-subtitle;
			background-color: $uni-bg-dark-color-gray;
		}
	}
</style>
