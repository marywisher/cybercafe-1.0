<template>
    <view class="content">
        <cybercafe-header :bgOpacity="1">
            <view class="iconfont icon-xiayibu iconback menu-icon-left" @tap="back"></view>
            <view class="header-right display-flex display-line">
                <view class="iconfont icon-guanbi" @tap="stop"></view>
                <label class="hint" @tap="stop">重新开局</label>
            </view>
        </cybercafe-header>
        <view class="chat-top">
            <view class="display-flex chat-line left">
                <view class="chat-img-box">
                    <image :src="character_image" class="chat-img character-img"></image>
                </view>
                <view class="chat-box">
                    <view class="chat-item">
                        <view v-html="character_html" :showline="false"></view>
                    </view>
                </view>
            </view>
        </view>
        <view class="game-board">
            <view class="game-board-line has-border">
                <view class="game-board-item has-border" @tap="placePiece('A1')">
                    <view v-if="board_data.A1 === 'X'" class="iconfont icon-guanbi"></view>
                    <view v-else-if="board_data.A1 === 'O'" class="iconfont icon-quan"></view>
                    <view v-if="pre_place == 'A1' && first_player === 'me'" class="iconfont icon-guanbi pre-place"></view>
                    <view v-else-if="pre_place == 'A1' && first_player === 'character'" class="iconfont icon-quan pre-place"></view>
                </view>
                <view class="game-board-item has-border" @tap="placePiece('A2')">
                    <view v-if="board_data.A2 === 'X'" class="iconfont icon-guanbi"></view>
                    <view v-else-if="board_data.A2 === 'O'" class="iconfont icon-quan"></view>
                    <view v-if="pre_place == 'A2' && first_player === 'me'" class="iconfont icon-guanbi pre-place"></view>
                    <view v-else-if="pre_place == 'A2' && first_player === 'character'" class="iconfont icon-quan pre-place"></view>
                </view>
                <view class="game-board-item" @tap="placePiece('A3')">
                    <view v-if="board_data.A3 === 'X'" class="iconfont icon-guanbi"></view>
                    <view v-else-if="board_data.A3 === 'O'" class="iconfont icon-quan"></view>
                    <view v-if="pre_place == 'A3' && first_player === 'me'" class="iconfont icon-guanbi pre-place"></view>
                    <view v-else-if="pre_place == 'A3' && first_player === 'character'" class="iconfont icon-quan pre-place"></view>
                </view>
            </view>
            <view class="game-board-line has-border">
                <view class="game-board-item has-border" @tap="placePiece('B1')">
                    <view v-if="board_data.B1 === 'X'" class="iconfont icon-guanbi"></view>
                    <view v-else-if="board_data.B1 === 'O'" class="iconfont icon-quan"></view>
                    <view v-if="pre_place == 'B1' && first_player === 'me'" class="iconfont icon-guanbi pre-place"></view>
                    <view v-else-if="pre_place == 'B1' && first_player === 'character'" class="iconfont icon-quan pre-place"></view>
                </view>
                <view class="game-board-item has-border" @tap="placePiece('B2')">
                    <view v-if="board_data.B2 === 'X'" class="iconfont icon-guanbi"></view>
                    <view v-else-if="board_data.B2 === 'O'" class="iconfont icon-quan"></view>
                    <view v-if="pre_place == 'B2' && first_player === 'me'" class="iconfont icon-guanbi pre-place"></view>
                    <view v-else-if="pre_place == 'B2' && first_player === 'character'" class="iconfont icon-quan pre-place"></view>
                </view>
                <view class="game-board-item" @tap="placePiece('B3')">
                    <view v-if="board_data.B3 === 'X'" class="iconfont icon-guanbi"></view>
                    <view v-else-if="board_data.B3 === 'O'" class="iconfont icon-quan"></view>
                    <view v-if="pre_place == 'B3' && first_player === 'me'" class="iconfont icon-guanbi pre-place"></view>
                    <view v-else-if="pre_place == 'B3' && first_player === 'character'" class="iconfont icon-quan pre-place"></view>
                </view>
            </view>
            <view class="game-board-line">
                <view class="game-board-item has-border" @tap="placePiece('C1')">
                    <view v-if="board_data.C1 === 'X'" class="iconfont icon-guanbi"></view>
                    <view v-else-if="board_data.C1 === 'O'" class="iconfont icon-quan"></view>
                    <view v-if="pre_place == 'C1' && first_player === 'me'" class="iconfont icon-guanbi pre-place"></view>
                    <view v-else-if="pre_place == 'C1' && first_player === 'character'" class="iconfont icon-quan pre-place"></view>
                </view>
                <view class="game-board-item has-border" @tap="placePiece('C2')">
                    <view v-if="board_data.C2 === 'X'" class="iconfont icon-guanbi"></view>
                    <view v-else-if="board_data.C2 === 'O'" class="iconfont icon-quan"></view>
                    <view v-if="pre_place == 'C2' && first_player === 'me'" class="iconfont icon-guanbi pre-place"></view>
                    <view v-else-if="pre_place == 'C2' && first_player === 'character'" class="iconfont icon-quan pre-place"></view>
                </view>
                <view class="game-board-item" @tap="placePiece('C3')">
                    <view v-if="board_data.C3 === 'X'" class="iconfont icon-guanbi"></view>
                    <view v-else-if="board_data.C3 === 'O'" class="iconfont icon-quan"></view>
                    <view v-if="pre_place == 'C3' && first_player === 'me'" class="iconfont icon-guanbi pre-place"></view>
                    <view v-else-if="pre_place == 'C3' && first_player === 'character'" class="iconfont icon-quan pre-place"></view>
                </view>
            </view>
        </view>
        <view></view>
        <view class="chat-bottom display-flex display-line sp-around">
            <view class="chat-input">
                <input v-model="chat_input" :maxlength="-1" :placeholder="input_placeholder"
                    @input="inputChange"/>
            </view>
            <cybercafe-button btnClass="btn-primary" :btnDisable="pre_place == '' && chat_input == ''" :btnName="btn_name" 
                @tapBtn="judgeResult(pre_place)"></cybercafe-button>
        </view>
        <view v-html="entity_css"></view>
        <cybercafe-modal class="modal-view" ref="cModal"></cybercafe-modal>
    </view>
</template>

<script>
    import config from '@/config.json';
	const configData = process.env.NODE_ENV === "development" ? config.dev : config.product;
    import common from '@/func/common/common';
    import baseQuery from '@/func/dbManager/baseQuery';
    import request from  '@/func/common/request';
    import characterFun from '@/func/character/characterFun';
    import {
		mapMutations,
		mapState,
		mapActions
	} from 'vuex';
    export default{
        data() {
			return {
				character_image: configData.avatarImg,
                character_name: '对方',
				character_id: 0,
                crt_status: '确定先手', //确定先手，AI落子，玩家落子，胜负已决
                character_html: '',
                board_data: {
                    A1: '',
                    A2: '',
                    A3: '',
                    B1: '',
                    B2: '',
                    B3: '',
                    C1: '',
                    C2: '',
                    C3: ''
                },
                first_player: '', // 本局先手的人 'character' 或 'me'
                entity_css: '',
                pre_place: '', // 记录上一步落子的位置，格式如 'A1'、'B2' 等
                chat_input: '',
                chat_history: [], // 聊天记录
                btn_name: '发送', // 落子，发送并落子，发送
                input_placeholder: '吐槽对方（选填）', // 输入框占位文本
                character_description: '' // 角色简介
            }
        },
        watch:{
			modalShow: {
				handler(newValue, oldValue) {
				    //console.log(newValue);
				    if(newValue && this.modalPageId == 'characterGames'){
				    	this.$nextTick(() => {
				    		this.$refs.cModal.show(this.modalData);
						});
				    	this.setUserData({
				    		'modalShow': false,
				    		'modalPageId': ''
				    	})
				    }
				},
				immediate: true, // 立即执行一次
				deep: true // 深度监听（可选）
			}
		},
        computed: {
			...mapState('user', ['modalData', 'modalPageId', 'modalShow', 'userKey']),
            ...mapState('setting', ['bubbleColor', 'chatCss', 'chatPattern', 'darkMode',
				'fontColor', 'fontSize', 'temperature', 'topP', 'tokenSetting']),
            ...mapState('dialogue', ['ai', 'aiRange'])
        },
        methods: {
            ...mapMutations('user', ['getUserData', 'setUserData']),
            ...mapMutations('setting', ['getSettingData']),
            ...mapMutations('dialogue', ['getDiaData']),
            placePiece(position) {
                // 在这里处理放置棋子的逻辑
                console.log(`放置棋子在位置: ${position}`);
                if(this.board_data[position] != ''){
                    uni.showToast({
                        title: '该格已被占用',
                        icon: 'none'
                    });
                    return;
                }

                if (this.crt_status == 'AI落子'){
                    // this.crt_status = '玩家落子';
                    // this.board_data[position] = this.first_player === 'character' ? 'X' : 'O';
                    return; // AI落子状态下玩家无法点击落子
                }else if (this.crt_status == '玩家落子') {
                    if(this.pre_place == position){
                        this.pre_place = ''; // 清空记录的上一步落子位置
                        uni.showToast({
                            title: '预选已取消，点击位置可重新预选，再点击“落子”按钮确认落子',
                            icon: 'none'
                        });
                        this.btn_name = '发送';
                    }else if (this.pre_place != '' && this.pre_place != position){
                        uni.showToast({
                            title: '点击“落子”按钮确认落子，或点击同一位置取消预选',
                            icon: 'none'
                        });
                        return; // 已经有一个预选位置且点击的不是同一个位置，禁止落子
                    }else{
                        this.pre_place = position; // 记录玩家落子的位置
                        if(Object.values(this.board_data).every(value => value === '')){
                            uni.showToast({
                                title: '点击“落子”按钮确认落子',
                                icon: 'none'
                            });
                        }
                        if(this.chat_input != ''){
                            this.btn_name = '发送并落子';
                        }else{
                            this.btn_name = '落子';
                        }
                    }                    
                    // this.crt_status = 'AI落子';
                    // this.board_data[position] = this.first_player === 'me' ? 'X' : 'O';
                }
            },
            judgeResult(position){
                console.log(this.crt_status);
                if(this.crt_status == '玩家落子' && position != ''){
                    this.chat_history.push({'role': 'user',
                        'content': this.chat_input.trim() + '|' + position});
                    this.chat_input = '';
                    this.pre_place = '';
                    this.btn_name = '发送';
                    this.crt_status = 'AI落子';
                    this.board_data[position] = this.first_player === 'me' ? 'X' : 'O';
                }else{
                    this.crt_status = '玩家落子';
                    this.board_data[position] = this.first_player === 'character' ? 'X' : 'O';
                }
                console.log(this.board_data);
                setTimeout(() => {
                    // 胜负逻辑判断
                    if(this.board_data['A1'] != '' && (this.board_data['A1'] === this.board_data['A2'] && this.board_data['A2'] === this.board_data['A3']
                        || this.board_data['A1'] === this.board_data['B1'] && this.board_data['B1'] === this.board_data['C1']
                        || this.board_data['A1'] === this.board_data['B2'] && this.board_data['B2'] === this.board_data['C3']
                    )
                    || this.board_data['B2'] != '' && (this.board_data['B2'] === this.board_data['A2'] && this.board_data['A2'] === this.board_data['C2']
                        || this.board_data['B2'] === this.board_data['B1'] && this.board_data['B1'] === this.board_data['B3']
                        || this.board_data['B2'] === this.board_data['A3'] && this.board_data['A3'] === this.board_data['C1']
                    )
                    || this.board_data['C3'] != '' && (this.board_data['C3'] === this.board_data['A3'] && this.board_data['A3'] === this.board_data['B3']
                        || this.board_data['C3'] === this.board_data['C1'] && this.board_data['C1'] === this.board_data['C2']
                    )){
                        this.crt_status = '胜负已决';
                        let _self = this;
                        this.setUserData({
                            'modalData': {
                                title: this.crt_status,
                                content: `${this.board_data[position]}获胜！`,
                                confirmText: '再来一局',
                                cancelText: '下次吧',
                                success: (res) => {
                                    if (res.confirm) {
                                        _self.resetBoard();
                                    }
                                },
                            },
                            'modalPageId': 'characterGames',
                            'modalShow': true
                        });
                    }else if(Object.values(this.board_data).every(value => value !== '')){
                        this.crt_status = '胜负已决';
                        let _self = this;
                        this.setUserData({
                            'modalData': {
                                title: this.crt_status,
                                content: '平局！',
                                confirmText: '再来一局',
                                cancelText: '下次吧',
                                success: (res) => {
                                    if (res.confirm) {
                                        _self.resetBoard();
                                    }
                                },
                            },
                            'modalPageId': 'characterGames',
                            'modalShow': true
                        });
                    }else if(this.crt_status == 'AI落子') {
                        this.responseCharacter();
                    }
                    console.log(this.crt_status);
                }, 500);
            },
            resetBoard(){
                this.btn_name = '发送';
                this.pre_place = '';
                if(this.first_player == 'character'){
                    this.first_player = 'me';
                    this.crt_status = '玩家落子';
                }else{
                    this.first_player = 'character';
                    this.crt_status = 'AI落子';
                }

                this.board_data = {
                    A1: '',
                    A2: '',
                    A3: '',
                    B1: '',
                    B2: '',
                    B3: '',
                    C1: '',
                    C2: '',
                    C3: ''
                };
                this.chat_history = [{'role': 'user',
                        'content': '新一局'}];
                if(this.crt_status == 'AI落子'){
                    this.chat_history.push({'role': 'user',
                        'content': '本局' + this.character_name + '执X。'});
                    this.responseCharacter();
                }else{
                    this.chat_history.push({'role': 'user',
                        'content': '本局用户执X。'});
                }
            },
            replaceParam(){
				this.entity_css = this.chatCss.replace(new RegExp('{{bg-color1}}', 'g'), this.bubbleColor[0])
					.replace(new RegExp('{{bg-color2}}', 'g'), this.bubbleColor[1])
					.replace(new RegExp('{{color1}}', 'g'), this.fontColor[0])
					.replace(new RegExp('{{color2}}', 'g'), this.fontColor[1])
                    .replace(new RegExp('{{bubbleOpacity}}', 'g'), 1);
			},
            back(){
                if(this.crt_status == 'AI落子' || this.crt_status == '玩家落子'){
                    this.setUserData({
                        'modalData': {
                            title: "放弃游戏",
                            content: "你确定要放弃并退出游戏吗？",
                            confirmText: '放弃',
                            cancelText: '继续游戏',
                            success: (res) => {
                                if (res.confirm) {
                                    uni.navigateBack();
                                }
                            },
                        },
                        'modalPageId': 'characterGames',
                        'modalShow': true
                    })
                }else{
                    uni.navigateBack();
                }
            },
            stop(){
                let _self = this;
                this.setUserData({
                    'modalData': {
                        title: "温馨提示",
                        content: "正在游戏中，确定要重开一局吗？",
                        confirmText: '重开',
                        cancelText: '再想想',
                        success: (res) => {
                            if (res.confirm) {
                                _self.crt_status = '胜负已决';
                                _self.character_html = common.textToHtml('好吧，重新开始', 'left', true);
                                _self.chat_history.push({'role': 'user',
                                    'content': '我认输了，' + _self.character_name + '获胜！'});
                                _self.resetBoard();
                            }
                        },
                    },
                    'modalPageId': 'characterGames',
                    'modalShow': true
                })
            },
            inputChange(){
                if(this.pre_place != ''){
                    if(this.chat_input.trim() != ''){
                        this.btn_name = '发送并落子';
                    }else{
                        this.btn_name = '落子';
                    }
                }else{
                    this.btn_name = '发送';
                }
            },
            async characterLoad(){
                let character_data = await baseQuery.getDataByKey('cybercafe_character', {character_id: this.character_id});
                //console.log(character_data);
                if(!character_data) return;
                this.character_name = character_data[0].character_name ? character_data[0].character_name : '对方';
                this.input_placeholder = '吐槽' + this.character_name + '（选填）';
                if(character_data[0].character_img) this.character_image = character_data[0].character_img;
                let return_data = characterFun.parseData(character_data[0], true);
                this.character_description = {'昵称': this.character_name,
                    '性别': return_data.gender_cn,
                    '基础信息': {
                        '简介': return_data.short_description,
                    },
                    '扩展信息': {
                        '故事背景': return_data.full_description,
                    }
                };
                if(return_data.hasOwnProperty('basic_description')){
                    for(let key in return_data.basic_description){
                        this.character_description.基础信息[key] = return_data.basic_description[key];
                    }
                }

                let _self = this;
                this.setUserData({
                    'modalData': {
                        title: "游戏规则",
                        content: "双方轮流标记\"X\"或\"O\"（通常先手为X），\r\n先在横、竖或对角线连成三子者获胜，\r\n无胜负时以平局告终。\r\n\r\n接下来选择谁先下？",
                        confirmText: this.character_name + '先',
                        cancelText: '我先',
                        success: (res) => {
                            if (res.confirm) {
                                _self.crt_status = 'AI落子';
                                _self.first_player = 'character';
                                _self.character_html = common.textToHtml(_self.character_name + '先手，正在思考中...', 'left', true);
                                _self.chat_history.push({'role': 'user',
                                    'content': '本局' + _self.character_name + '执X。'});
                                request.post()
                            } else {
                                _self.crt_status = '玩家落子';
                                _self.first_player = 'me';
                                _self.character_html = common.textToHtml('你先手，请选择一个位置落子', 'left', true);
                                _self.chat_history.push({'role': 'user',
                                    'content': '本局用户执X。'});
                            }
                        },
                    },
                    'modalPageId': 'characterGames',
                    'modalShow': true
                })
            },
            async responseCharacter(){
                let _self = this;
                let data = {
                    'messages': JSON.stringify(this.chat_history),
                };
                data.type = this.ai;
                data.key = this.userKey;
                data.model = this.aiRange[this.ai].model;
                data.temperature = this.temperature;
                data.top_p = this.topP;
                data.max_token = this.tokenSetting;
                data.des = JSON.stringify(this.character_description) + '\r\n当前盘面状况：' + JSON.stringify(this.board_data) 
                    + '\r\n根据当前盘面状况和对弈历史对话进行你的下一步落子选择，并在回复中以“AI回复|落子位置”的格式告诉玩家你的落子位置和符合身份的对话内容，'
                    + '例如“妙手|A1”。如果要直接发言而不落子，可以回复“妙手”。';
                //console.log(data);
                let response = await request.post('newAiController/games', 'games', data);
                if(response && response.code == 200){
                    console.log(response.result);
                    if(!response.result.hasOwnProperty('choices') || 
                        response.result.choices.length == 0 ||
                        !response.result.choices[0].hasOwnProperty('message')){
                        _self.setUserData({
                            'modalData': {
                                title: "温馨提示",
                                content: '返回值结构不支持，请联系管理员',
                                confirmText: '',
                                cancelText: 'OK'
                            },
                            'modalPageId': 'characterGames',
                            'modalShow': true
                        })
                    }
                    let ai_message = response.result.choices[0].message.content;
                    console.log(ai_message);
                    _self.chat_history.push({'role': 'assistant',
                        'content': ai_message});
                    let ai_result = ai_message.split('|');
                    
                    _self.character_html = common.textToHtml(ai_result[0], 'left', true);
                    // AI落子逻辑
                    if (ai_result.length > 1) {
                        _self.judgeResult(ai_result[1]);
                    }
                } else {
                    _self.setUserData({
                        'modalData': {
                            title: "温馨提示",
                            content: this.character_name + '卡壳了，你可以尽情嘲讽一下',
                            confirmText: '',
                            cancelText: 'OK'
                        },
                        'modalPageId': 'characterGames',
                        'modalShow': true
                    })
                }
            }
        },
        onLoad(option) {//切片
            this.replaceParam();
			// console.log(this.entity_css);

			this.character_id = parseInt(option.id);
            this.characterLoad();
		},
    }
</script>

<style lang="scss">
    .chat-top{
        margin-top: calc($uni-spacing-lg + $page-header-height);
        margin-bottom: $uni-spacing-lg;
    }
    .chat-top, .chat-bottom{
        min-height: calc(100vh - 90vw - 2 * $uni-border-base - $page-header-height - 3 * $uni-spacing-lg) / 2;
    }
    .chat-bottom{
        margin-top: $uni-spacing-lg;
    }
    .game-board{
        width: calc(90vw + 2 * $uni-border-base);
        height: calc(90vw + 2 * $uni-border-base);
        border: calc(4 * $uni-border-base) solid $uni-text-color;
        margin: 0 auto;
    }
    .game-board-line{
        height: 30vw;
        display: flex;
    }
    .game-board-line.has-border{
        border-bottom: $uni-border-base solid $uni-text-color;
    }
    .game-board-item{
        width: 30vw;
        height: 30vw;
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .game-board-item.has-border{
        border-right: $uni-border-base solid $uni-text-color;
    }
    .game-board-line .icon-guanbi, .game-board-line .icon-quan{
        font-size: 20vw;
    }
    .game-board-line .icon-guanbi{
        color: $uni-color-main;
    }
    .game-board-line .icon-quan{
        color: $uni-color-secondary;
    }
    .game-board-line .pre-place{
        opacity: 0.1;
    }
    .chat-line{
		padding: $uni-spacing-lg $uni-width-none;
		flex-direction: row;
	}
    .chat-line.left .chat-img-box{
		margin-right: $uni-spacing-lg;
	}
	.character-img{
        width: $uni-img-size-lg;
        height: $uni-img-size-lg;
        border-radius: 50%;
    }
    .chat-input{
        width: 80vw;
    }
    @media (prefers-color-scheme: dark) {
		.game-board{
            border-color: $uni-text-color-grey;
        }
        .game-board-line .icon-guanbi{
            color: $uni-color-dark-main;
        }
        .game-board-line .icon-quan{
            color: $uni-color-dark-secondary;
        }
	}
</style>