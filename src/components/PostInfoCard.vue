<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ApiGet, ApiPost } from '../utils/req'
import { useRouter } from 'vue-router'
import { Token } from '../utils/storage';
import { useGlobalStore } from '../stores/global';

const props = defineProps({
	momentID: String
})

const globalStore = useGlobalStore()

const postInfo = ref({
	username: '',
	userID: '',
	momentID: '',
	//title: '',
	content: '',
	classID: '',
	likeCount: '',
	image: '',
	createTime: ''
})
const userInfo = ref({
	username: '',
	name: '',
	classID: '',
	schoolID: '',
	sex: '',
	role: '',
	avatar: '',
	cover: ''
})



onMounted(async () => {
	try {
		const postItem = globalStore.postCache[postInfo.value.momentID]
		if (!postItem) {
			const postResp = await axios.get('/api/v1/moment/detail' ,{
				params: {
					momentID: props.momentID
				},
			    headers: {
				'ngrok-skip-browser-warning': 'true'
				}
			});
			globalStore.addPostCache(postResp.data.data)
			postInfo.value = postResp.data.data
		} else {
			const postResp = await axios.get('/api/v1/moment/detail' ,{
				params: {
					momentID: props.momentID
				},
			    headers: {
				'ngrok-skip-browser-warning': 'true'
				}
			});
			globalStore.addPostCache(postResp.data.data)
			postInfo.value = postResp.data.data
		}

		
	} catch (error) {
		console.error(error); 
	}
})

const likeClick = async () => {
	const data = {
		momentID: postInfo.value.momentID,
		likerID: globalStore.userInfo.userID,//喜欢人的id
		likeeID: postInfo.userID//被喜欢人的id
	}
	const headers = {
				'ngrok-skip-browser-warning': 'true'
	//	Authorization: Token.getToken()
	}
	const likeResp = await axios.post('/api/v1/like', data)
	postInfo.value.likeCount = likeResp.data.likeCount
}

const imageClick = () => {
	window.open(postInfo.value.image, "_blank", "noreferrer")
}

const router = useRouter()
const posterClick = () => {
	router.push({
		name: 'personposts',
		query: {
			userId: userInfo.value.username
		}
	})
}
</script>

<template>
	<el-card class="post-info-card">
		<div class="card-header">
			<div class="card-header-left" @click="posterClick">
				<el-avatar size="small" :src="userInfo.avatar" style="margin: 5px;"> <img
						src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png" /></el-avatar>
				<div style="padding-top: 9px; margin-left: 5px; font-size: 13px;">{{ userInfo.name }}</div>
			</div>
			<el-button style="margin-right: 7px; font-size: 10px;" type="primary" plain @click="likeClick">点赞：{{
				postInfo.likeCount }}</el-button>
		</div>
		<el-scrollbar class="body-title" height="84vh">
			<div>
				<div class="info-title">{{ postInfo.content }}</div>
				<div class="info-time">{{ postInfo.createTime }}</div>
				<!-- <div class="separator"></div> -->
			</div>
			<!-- https://avatars.githubusercontent.com/u/67905897?v=4 -->
			<el-image v-if="postInfo.image && postInfo.image != ''" :src="postInfo.image" class="body-image"
				@click="imageClick" />
			<!-- <div class="body-detail">{{ postInfo.content }}</div> -->
			<div style="height: 5vh;"></div>
		</el-scrollbar>
	</el-card>
</template>

<style scoped>
.post-info-card {
	width: 94%;
	height: 90.5vh;
	margin-left: 3%;
	margin-top: 3%;
}

.card-header {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	max-height: 10px;
}

.card-header-left {
	display: flex;
	flex-direction: row;
	align-content: flex-start;
}

.text {
	font-size: 14px;
}

.item {
	margin-bottom: 18px;
}

.post-card {
	display: flex;
	flex-direction: column;
}

.body-title {
	margin-top: 6vh;
}

.info-title {
	font-weight: bold;
	font-size: 20px;
	width: 98%;
	margin-left: 6px;
}

.info-time {
	font-size: 8px;
	width: 98%;
	color: #555;
	margin-left: 6px;
}

.separator {
	border-top: 1px solid #ddd;
	margin: 10px 0;
}

.detail-block {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-content: center;
}

.body-image {
	width: 80%;
	max-width: 30vh;
	max-height: 30vh;
	border-radius: 10%;
}

.body-detail {
	text-align: left;
	font-size: 15px;
	position: relative;
	margin-top: 1vh;
}
</style>
