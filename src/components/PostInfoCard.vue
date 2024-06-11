<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ApiGet, ApiPost } from '../utils/req'
import { useRouter } from 'vue-router'
import { Token } from '../utils/storage';
import { useGlobalStore } from '../stores/global';

const props = defineProps({
	postId: String
})

const globalStore = useGlobalStore()

const postInfo = ref({
	username: '',
	postId: '',
	title: '',
	detail: '',
	clazzId: '',
	likes: '',
	image: '',
	postTime: ''
})
const userInfo = ref({
	username: '',
	name: '',
	clazzId: '',
	schoolId: '',
	sex: '',
	role: '',
	avatar: '',
	cover: ''
})

onMounted(async () => {
	try {
		const postItem = globalStore.postCache[postInfo.value.postId]
		if (!postItem) {
			const postResp = await ApiGet('post/get?postId=' + props.postId)
			globalStore.addPostCache(postResp.obj)
			postInfo.value = postResp.obj
		} else {
			postInfo.value = postItem
		}

		const userItem = globalStore.userCache[postInfo.value.username]
		if (!userItem) {
			const userResp = await ApiGet('getUserinfoById?username=' + postInfo.value.username)
			globalStore.addUserCache(userResp.obj)
			userInfo.value = userResp.obj
		} else {
			userInfo.value = userItem
		}
	} catch (error) {
		console.error(error);
	}
})

const likeClick = async () => {
	const data = {
		postId: postInfo.value.postId,
		likes: postInfo.value.likes * 1 + 1
	}
	const headers = {
		'Content-Type': 'application/json',
	//	Authorization: Token.getToken()
	}
	const likeResp = await axios.put('/api/post/likes/update', data)
	postInfo.value.likes = likeResp.data.toString()
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
				postInfo.likes }}</el-button>
		</div>
		<el-scrollbar class="body-title" height="84vh">
			<div>
				<div class="info-title">{{ postInfo.title }}</div>
				<div class="info-time">{{ postInfo.postTime }}</div>
				<div class="separator"></div>
			</div>
			<!-- https://avatars.githubusercontent.com/u/67905897?v=4 -->
			<el-image v-if="postInfo.image && postInfo.image != ''" :src="postInfo.image" class="body-image"
				@click="imageClick" />
			<div class="body-detail">{{ postInfo.detail }}</div>
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
