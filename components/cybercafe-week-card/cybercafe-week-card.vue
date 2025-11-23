<template>
	<view>
		<view class="display-flex sp-between">
			<cybercafe-card2 cardTitle="1签" :cardType="crt_index > 1 ? 'past': (finish_count == 1 ? 'done' : 'wait')" 
				@clickBtn="doneFun" :id="1"></cybercafe-card2>
			<cybercafe-card2 cardTitle="2签"  @clickBtn="doneFun" :id="2"
				:cardType="crt_index < 2 ? 'future': (crt_index > 2 ? 'past' : (finish_count == 2 ? 'done' : 'wait'))" ></cybercafe-card2>
			<cybercafe-card2 cardTitle="3签"  @clickBtn="doneFun" :id="3"
				:cardType="crt_index < 3 ? 'future': (crt_index > 3 ? 'past' : (finish_count == 3 ? 'done' : 'wait'))"></cybercafe-card2>
			<cybercafe-card2 cardTitle="4签"  @clickBtn="doneFun" :id="4"
				:cardType="crt_index < 4 ? 'future': (crt_index > 4 ? 'past' : (finish_count == 4 ? 'done' : 'wait'))"></cybercafe-card2>
			<cybercafe-card2 cardTitle="5签"  @clickBtn="doneFun" :id="5"
				:cardType="crt_index < 5 ? 'future': (crt_index > 5 ? 'past' : (finish_count == 5 ? 'done' : 'wait'))"></cybercafe-card2>
			<cybercafe-card2 cardTitle="6签"  @clickBtn="doneFun" :id="6"
				:cardType="crt_index < 6 ? 'future': (crt_index > 6 ? 'past' : (finish_count == 6 ? 'done' : 'wait'))"></cybercafe-card2>
		</view>
		<cybercafe-card2 class="seventh-btn" :cardTitle="card_title"  @clickBtn="doneFun" :id="7"
			:cardType="crt_index < 7 ? 'future': (finish_count == 7 ? 'done' : 'wait')"></cybercafe-card2>
	</view>
</template>

<script>
	import cybercafeCard2 from '../cybercafe-card/cybercafe-card2';
	import request from '@/func/common/request';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default{
		name: 'cybercafe-week-card',
		data(){
			return {
				crt_index: 3,//1-7
				finish_count: 0,
				card_title: ''
			}
		},
		components:{
			cybercafeCard2
		},
		computed:{
			...mapState('user', ['checkinCount', 'hasChecked', 'userGroup']),
		},
		methods: {
			...mapMutations('user', ['getUserData', 'setUserData']),
			init(){
				this.finish_count = this.checkinCount % 7 == 0 ? 7 : this.checkinCount % 7;
				this.crt_index = this.hasChecked == 1 ? this.finish_count : (this.finish_count == 7 ? 1 : (this.finish_count + 1));
				this.card_title = '7签得 100 米粒';
				if(this.userGroup == 2)	this.card_title = '7签得 100,000 米粒';		
			},
			doneFun(e){
				//console.log(e);
				if(e.currentTarget.id != this.crt_index) return;
				this.finish_count = this.crt_index;
				this.setUserData({
					'hasChecked': 1,
					'checkinCount': this.checkinCount + 1
				});
				let _self = this;
				request.post("userController/setCheckin", 'globalSetting').then(res => {
					if (res.code == 200) {
						store.commit('user/setUserData', {
							'modalData': {
								content: res.result.message,
								confirmText: '',
								cancelText: 'OK',
								success: function (res) {
								}
							},
							'modalShow': true,
							'modalPageId': 'globalSetting'
						});
						if(_self.finish_count == 7){
							_self.$emit('afterCheckin');
						}
					} else {
						uni.showToast({
							title: res.msg,
							icon: "none"
						});
					}
				});
			}
		}
	}
</script>

<style>
</style>