const localDomain = "[本地后端测试地址]";
const backendDomain = "[线上后端地址]";
const domain = process.env.NODE_ENV === "development" ? localDomain : backendDomain; 

export default {
	config: {
		domain: domain,
		voiceOver: domain + "static/voice-over.jpg",
		defaultImg: domain + "static/default.png",
	},
}
