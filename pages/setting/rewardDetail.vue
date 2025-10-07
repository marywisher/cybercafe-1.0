<template>
	<view>
		<view class="content">
			<view class="hint text-center">--仅显示最近300条，更多记录请联系管理员查询--</view>
			<table class="reward-table">
				<tr>
					<th class="th1" align="center">序号</th>
					<th class="th2" align="center">项目</th>
					<th class="th1" align="center">内容</th>
					<th class="th1" align="center">时间</th>
				</tr>
				<tr v-for="(item, index) in detail_list" :key="index">
					<td align="center">{{ index + 1 }}</td>
					<td align="center">{{ item.reward_detail_title }}</td>
					<td align="center">{{ item.reward_prefix == '+' ? '获得' : '消耗' }}{{ item.reward_point }}米粒</td>
					<td align="center">{{ item.reward_created_at }}</td>
				</tr>
			</table>
		</view>
	</view>
</template>

<script>
	import request from '@/func/common/request';
	export default {
		data() {
			return {
				detail_list: [],
				next_page: 1,
			}
		},
		methods: {
			init(){
				let _self = this;
				request.post("userController/getRewardDetail", 'rewardDetail', {
					page: this.next_page
				}).then(res => {
					if (res.code == 200) {
						_self.next_page = res.result.current_page + 1;
						for(let i in res.result.data){
							let tmpData = {
								'reward_detail_title': res.result.data[i].reward_detail_title,
								'reward_prefix': res.result.data[i].reward_prefix,
								'reward_point': res.result.data[i].reward_point.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
								'reward_created_at': res.result.data[i].reward_created_at,
							};
							_self.detail_list.push(tmpData);
						}
					} else {
						uni.showToast({
							title: res.msg,
							icon: "none"
						});
					}
				});
			},
		},
		onLoad() {
			this.detail_list = [];
			this.next_page = 1;
			this.init();
		},
		onReachBottom() {
			this.init();
		}
	}
</script>

<style lang="scss">
	.reward-table{
		overflow-x: scroll;
	}
	.reward-table th, .reward-table td{
		border: $uni-border-base solid $uni-text-color-placeholder;
		border-spacing: $uni-width-none;
		color: $uni-text-color;
	}
	@media (prefers-color-scheme: dark) {
		.reward-table th, .reward-table td{
			border: $uni-border-base solid $uni-text-color;
			color: $uni-text-color-grey;
		}
	}
</style>