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
	@import '@/static/iconfont/iconfont.css';
/*每个页面公共css */
	body{
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
		    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
		    sans-serif;
	}
	button {
		color: $uni-color-main;
	}
	button[disabled] {
		color: $uni-text-color-disable;
	}
	button[type="primary"] {
		background-color: $uni-color-main;
	}
	button[type="primary"][disabled] {
		background-color: $uni-text-color-disable;
	}
	.content {
		padding: $uni-width-none $uni-spacing-base;
		margin: $uni-width-none auto;
	}
	.hint{
		font-size: $uni-font-size-sm;
		color: $uni-text-color-placeholder;
	}
	.required{
		color: $uni-color-main;//$uni-color-error;
	}
	.text-center{
		text-align: center;
	}
	.display-flex{
		display: flex;
	}
	.display-line{//配合display-flex一起用，保证一行对齐
		align-items: center;
	}
	.sp-between{
		justify-content: space-between;
	}
	.sp-around{
		justify-content: space-around;
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
	input, textarea{
		padding: $uni-spacing-base $uni-spacing-lg;
		border: $uni-border-base solid $uni-border-color;
		border-radius: $uni-border-radius-base;
		color: $uni-text-color !important;
	}
	.display-hide{
		display: none;
	}
	
	@media (prefers-color-scheme: dark) {
		button {
			color: $uni-color-dark-main;
		}
		button[type="primary"] {
			background-color: $uni-color-dark-main;
		}
		.required{
			color: $uni-color-dark-main;
		}
		.list-item, .group-item{
			box-shadow: $uni-width-none $uni-width-none $uni-spacing-base $uni-spacing-mini $uni-color-subtitle;
			background-color: $uni-bg-dark-color-gray;
		}
		input, textarea{
			color: $uni-text-color-disable !important;
		}
	}
</style>
