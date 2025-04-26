import { SENSITIVEWORDS } from '@/func/common/constants.js';
import store from '@/store';
// 配置markdown插件
//import MarkdownIt from "markdown-it";

export default {
	getCurrentTimeStampStr() {
		const now = new Date();

		const year = now.getFullYear();
		// getMonth() 返回的月份从0开始，所以需要+1
		const month = String(now.getMonth() + 1).padStart(2, '0');
		const day = String(now.getDate()).padStart(2, '0');
		const hours = String(now.getHours()).padStart(2, '0');
		const minutes = String(now.getMinutes()).padStart(2, '0');
		const second = String(now.getSeconds()).padStart(2, '0');
		
		return `${year}-${month}-${day} ${hours}:${minutes}:${second}`;
	},
	
};