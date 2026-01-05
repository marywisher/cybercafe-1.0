<template>
	<cybercafe-view class="character-container" popViewStyle="box-shadow:none;">
		<view class="display-flex character-line display-line">
			<view class="character-title">{{character_name}}</view>
			<view v-if="character_gender == 1" class="iconfont icon-xingbienan"></view>
			<view v-if="character_gender == 2" class="iconfont icon-xingbienv"></view>
			<view v-if="character_gender == 0" class="iconfont icon-WuXingBie2"></view>
		</view>
		<view class="character-line"></view>
		
		<view class="display-flex display-line sp-between hint">
			<view>By: {{user_nickname}}</view>
			<view class="display-flex display-line sp-between num-part">
				<view class="iconfont icon-kanguo hint">{{character_view_count}}</view>
				<view class="iconfont icon-chatou hint">{{character_link_count}}</view>
			</view>
		</view>
		<view class="character-line"></view>
		
		<view class="flag-tag base-tag">基础信息</view>
		<view class="character-line after-tag"></view>
		
		<view class="character-line">
			<view class="hint">简介</view>
			<cybercafe-view>
				<view class="long-text" v-html="short_description"></view>
			</cybercafe-view>
		</view>
		<view class="character-line"></view>
		
		<view class="display-flex display-line tag-part">
			<view v-for="(item, index) in character_tag" :key="index" 
			class="tag-item" v-if="item.length > 0">{{item}}</view>
		</view>
		<view class="character-line"></view>
		
		<view v-if="Object.keys(basic_description).length > 0" class="hint">补充说明</view>
		<cybercafe-view v-if="Object.keys(basic_description).length > 0">
			<view v-for="(item, basic_index) in basic_description" :key="basic_index" class="character-line">
				<view class="hint">{{basic_index}}</view>
				<view class="character-line" v-html="basic_description[basic_index]"></view>
			</view>
		</cybercafe-view>
		<view v-if="Object.keys(basic_description).length > 0" class="character-line"></view>
		
		<view class="flag-tag world-tag">世界观</view>
		<view class="character-line after-tag">
			<view class="hint">故事背景</view>
			<cybercafe-view>
				<view class="long-text" v-html="full_description"></view>
			</cybercafe-view>
		</view>
		<view class="character-line"></view>
		
		<view v-if="Object.keys(extend_description).length > 0" class="hint">其它设定</view>
		<cybercafe-view v-if="Object.keys(extend_description).length > 0">
			<view v-for="(item2, extend_index) in extend_description" :key="extend_index" class="character-line">
				<view class="hint">{{extend_index}}</view>
				<view class="character-line" v-html="extend_description[extend_index]"></view>
			</view>
		</cybercafe-view>
		<view class="character-line"></view>
		
		<view class="flag-tag branch-story-tag">副本剧情</view>
		<view class="character-line after-tag"></view>
		
		<view v-if="character_story.length > 0" class="character-line after-tag">
			<view class="hint">前情提要</view>
			<cybercafe-view>
				<view class="long-text" v-html="character_story"></view>
			</cybercafe-view>
		</view>
		<view class="character-line"></view>
		
		<view v-if="character_prologue.length > 0" class="character-line after-tag">
			<view class="hint">开场白</view>
			<cybercafe-view>
				<view class="long-text" v-html="character_prologue"></view>
			</cybercafe-view>
		</view>
		<view class="character-line"></view>
		
		<view class="flag-tag branch-memo-tag">其它内容</view>
		<view class="character-line after-tag"></view>
		
		<view v-if="character_memo.length > 0" class="character-line after-tag">
			<view class="hint">碎碎念</view>
			<cybercafe-view>
				<view class="long-text" v-html="character_memo"></view>
			</cybercafe-view>
		</view>
		<view class="character-line"></view>
	</cybercafe-view>
</template>

<script>
	import common from '@/func/common/common';
	import request from '@/func/common/request';
	import characterFun from '@/func/character/characterFun';
	import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
	export default{
		name: 'previewDescriptionPart',
		data(){
			return{
				character_id: 0,
				
				character_name: '',
				character_gender: 0,
				character_story: '',
				character_prologue: '',
				character_tag: [],
				character_key: '',
				character_memo: '',
				
				short_description: '',
				full_description: '',
				basic_description: {},
				extend_description: {},
				
				character_view_count: 0,
				character_link_count: 0,
				user_nickname: '未知'
			}
		},
		computed: {
			...mapState('user', ['modalData', 'modalPageId', 'modalShow']),
			...mapState('setting', ['darkMode']),
			placeholderStyle(){
				return this.darkMode == 'light' ? 'color: #c0c0c0;' : 'color: #808080;';
			}
		},
		methods: {
			...mapMutations('user', ['getUserData', 'setUserData']),
			...mapMutations('setting', ['getSettingData']),
			async init(character_id){
				//console.log(character_id);
				let _self = this;
				request.post("characterController/getCharacterDetail", 'characterPreview',
					{'character_id': character_id}).then(res => {
					if (res.code == 200) {
						//console.log(res.result);
						let character_data = characterFun.parseData(res.result);
						//console.log(character_data);
						_self.character_name = character_data.character_name;
						_self.character_gender = character_data.character_gender;
						_self.short_description = common.textToHtml(character_data.short_description);
						_self.full_description = common.textToHtml(character_data.full_description);
						_self.character_story = common.textToHtml(character_data.character_story);
						_self.character_prologue = common.textToHtml(character_data.character_prologue);
						_self.character_memo = common.textToHtml(character_data.character_memo);
						_self.character_tag = character_data.character_tag;
						_self.character_key = character_data.character_key;
						_self.character_view_count = character_data.character_view_count;
						_self.character_link_count = character_data.character_link_count;
						_self.user_nickname = character_data.user_nickname;
						if(character_data.hasOwnProperty('basic_description'))
							_self.basic_description = character_data.basic_description;
						if(character_data.hasOwnProperty('extend_description')) 
							_self.extend_description = character_data.extend_description;
						_self.$emit('afterLoad',
							{'image': res.result.img[0].img_url});
						_self.$forceUpdate();
					} else {
						uni.showToast({
							title: res.msg,
							icon: "none"
						});
					}
				});
			},
		}
	}
</script>

<style lang="scss">
	.bg-color{
		backgroundColor: $uni-bg-color;
		color: $uni-text-color;
	}
	.character-container{
		position: relative;
		margin-top: 90vw;
	}
	.character-line{
		margin-bottom: calc(2 * $uni-spacing-lg);
	}
	.flag-tag{
		left: $uni-spacing-lg;
	}
	.character-title{
		font-size: calc(2 * $uni-font-size-lg);
	}
	.display-line{
		margin-bottom: $uni-spacing-base;
	}
	.base-tag{
		top: 15vh;
	}
	.long-text{
		font-size: $uni-font-size-lg;
		line-height: calc(2 * $uni-font-size-sm);
	}
	.tag-part{
		flex-wrap: wrap;
	}
	.num-part{
		width: 20vw;
	}
	@media (prefers-color-scheme: dark) {
		.bg-color{
			backgroundColor: $uni-bg-dark-color-gray;
			color: $uni-text-color-grey;
		}
	}
</style>