<template>
	<view>
		<view class="character-tag" @tap="speakFun" @longpress="openFun">
			<image :src="crt_character_img" mode="aspectFit" ></image>
		</view>
		<view class="character-pop">
			<cybercafe-view ref="popCharView" isAbsolute isScrollable closeAble viewTitle="角色设置">
				<view class="character-line display-flex sp-between display-line part-first">
					<view>回复方式</view>
					<view>
						<switch :checked="replyMode == 'auto'" style="transform:scale(0.6)" color="#E94E46"
							@change="changeReplyMode"/>
						<label>{{replyMode == 'auto' ? '自动' : '点击'}}</label>
					</view>
				</view>
				<view class="hint character-line">至少确保一位角色在场上</view>
				<view v-for="(item, index) in character_list" :key="item.character_id"
					class="character-line display-flex sp-between display-line">
					<view class="display-flex character-tag display-line">
						<image mode="aspectFit" :src="tagImg(item.character_id)"></image>
						<view class="character-name">{{ item.character_name }}</view>
						<span v-if="item.character_name != '旁白'" class="iconfont icon-shezhi" @tap="gotoDetail(item.character_id)"></span>
					</view>
					<view class="character-right">
						<switch :checked="item.detail_status == 1" style="transform:scale(0.6)" color="#E94E46"
							 :disabled="item.detail_status == 1 && on_stage_num == 1"
							@change="characterChange(item.character_id)"/>
						<label :class="{'on-stage': item.detail_status == 1}">{{item.detail_status == 1 ? '已登场' : '已离场'}}</label>
					</view>
				</view>
			</cybercafe-view>
		</view>
	</view>
</template>

<script>
	import config from "@/config.json";
	const configData = process.env.NODE_ENV === "development" ? config.dev : config.product;
	import baseQuery from "@/func/dbManager/baseQuery";
	import responseFun from "@/func/entity/responseFun";
	import common from "@/func/common/common";
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default{
		name: 'avatarBtn',
		data(){
			return{
				default_character_img: configData.voiceOver,
				character_list: {},
				show_pop: false,
				on_stage_num: 0,
				crt_character_img: configData.voiceOver,
				crt_character_id: 0,
			}
		},
		computed:{
			...mapState('dialogue', ['characterlist', 'crtCharacterId', 'messageTime', 'optionFlag',
				'options', 'prevMessageTime']),
			...mapState('setting', ['entityId', 'replyMode']),
			tagImg(){
				return function(index){
					if(this.character_list[index]) return this.character_list[index].character_img;
					else return this.default_character_img;
				}
			}
		},
		methods:{
			...mapMutations('dialogue', ['getDiaData', 'setDiaData']),
			...mapMutations('setting', ['getSettingData', 'setSettingData']),
			init(){
				this.$refs.popCharView.closeView();
				//console.log(this.characterlist);
				for(let i in this.characterlist){
					if(i == 0) continue;
					this.crt_character_img = this.characterlist[i].character_img;
					this.crt_character_id = i;
					break;
				}
			},
			openFun(){
				//console.log(this.characterlist)
				this.on_stage_num = 0;
				for(let i in this.characterlist){
					if(i == 0) continue;
					this.character_list[i] = this.characterlist[i];
					if(this.character_list[i].detail_status == 1) this.on_stage_num ++;
				}
				this.$forceUpdate();
				this.$refs.popCharView.openView();
			},
			gotoDetail(character_id){
				uni.navigateTo({
					url: '/pages/chat/character?id=' + character_id
				})
			},
			changeReplyMode(e){
				this.setSettingData({'replyMode': (e.detail.value ? 'auto' : 'click')});
			},
			characterChange(character_id){
				if(this.character_list[character_id].detail_status){
					this.character_list[character_id].detail_status = 0;
					this.on_stage_num --;
				}else{
					this.character_list[character_id].detail_status = 1;
					this.on_stage_num ++;
				}
				baseQuery.updateDataByKey('cybercafe_entity_detail', 
					{'detail_status': this.character_list[character_id].detail_status},
					{'entity_id': this.entityId,
					'character_id': character_id});
				let cl = this.characterlist;
				cl[character_id] = this.character_list[character_id];
				this.setDiaData({'characterlist': cl});
				//舞台数据更新
				this.$forceUpdate();
			},
			speakFun(){
				console.log('speaking');
				this.setDiaData({
					'crtCharacterId': this.crt_character_id,
					'prevMessageTime': this.messageTime,
					'messageTime': common.getCurrentTimeStampStr(),
					'optionFlag': true,
					'options': []
				});
				responseFun.chat();
			}
		},
	}
</script>

<style lang="scss">
	.character-tag image{
		width: $uni-img-size-base;
		height: $uni-img-size-base;
		border-radius: $uni-border-radius-circle;
		border: $uni-border-base solid $uni-border-color;
		margin-top: calc(4 * $uni-spacing-mini);
		margin-bottom: $uni-width-none;
	}
	.character-pop{
		position: fixed;
		top: 0;
		left: 0;
	}
	.character-line{
		margin-bottom: $uni-spacing-lg;
	}
	.character-line .character-tag image{
		width: calc(2 * $uni-img-size-base);
		height: calc(2 * $uni-img-size-base);
	}
	.character-right, .character-name{
		font-size: $uni-font-size-huge;
		line-height: calc($uni-img-size-base * 2 + $uni-border-base * 2);
	}
	.character-name, .character-line .icon-shezhi{
		margin-left: calc(2 * $uni-spacing-lg);
	}
	.on-stage{
		color: $uni-color-main;
	}
	.part-first{
		margin-top: $uni-spacing-lg;
	}
	@media (prefers-color-scheme: dark) {
		/* .character-tag{
			background-color: $uni-bg-dark-color-gray;
		} */
		.on-stage{
			color: $uni-color-dark-main;
		}
	}
</style>