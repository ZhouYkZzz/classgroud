<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ApiGet } from '../utils/req'
import { useRouter } from 'vue-router'
import { Edit, Delete, User } from '@element-plus/icons-vue'
import { Token } from '../utils/storage'
import { useGlobalStore } from '../stores/global'

const globalStore = useGlobalStore()

const props = defineProps({
	momentID: String,
	visitUserId: String
})
const showDelete = ref(false)
const showEdit = ref(false)

const postInfo = ref({
	username: '',
	momentID: '',
	//title: '',
	content: '',
	classID: '',
	likes: '',
	image: '',
	createTime: ''
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
const roles = ['班主任', '老师', '家长', '学生']

onMounted(async () => {
	try {
		const postItem = globalStore.postCache[props.momentID]
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
			postInfo.value = postItem
		}


		showDelete.value = (globalStore.userInfo.username === userInfo.value.username) || globalStore.userInfo.role === '1'
		showEdit.value = globalStore.userInfo.username === userInfo.value.username
	} catch (error) {
		console.error(error);
	}
})

const router = useRouter()
const editClick = () => {
	router.push({
		name: "postedit",
		query: {
			momentID: props.momentID
		}
	})
}
const delClick = async () => {
	const headers = {
		'Content-Type': 'application/json',
		//Authorization: Token.getToken()
	}
	console.log('props.momentID = ' + props.momentID)
	const delResp = await axios.delete('/api/post/delete?postId=' + props.postID, { headers })
	console.log(delResp)
	router.go(0)
}
const userClick = () => {
	router.push({
		name: "personposts",
		query: {
			userId: postInfo.value.username
		}
	})
}

const cardClick = () => {
	router.push({
		name: 'postinfo',
		query: {
			momentID: postInfo.value.momentID
		}
	})
}
</script>

<template>
	<div style="display: flex; flex-direction: row;">
		<div style="width: 30px;"></div>
		<el-card class="main-width" @click="cardClick" shadow="hover" :body-style="{ padding: '10px' }">
			<div class="card-header">
				<div class="card-header-left">
					<el-avatar size="small" :src="userInfo.avatar" style="margin: 5px;"> <img
							src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png" /></el-avatar>
					<div style="padding-top: 9px; margin-left: 5px; font-size: 10px;">
						{{ userInfo.name }}
						<el-tag style="margin-left: 5px;">{{ roles[userInfo.role - 1] }}</el-tag>
					</div>
				</div>
				<div style="margin-top: 9px; margin-right: 7px; font-size: 10px;">点赞：{{ postInfo.likeCount }}</div>
			</div>
			<div class="body-title">
				<div class="info-title">{{ postInfo.content }}</div>
				<div class="info-time">{{ postInfo.createTime }}</div>
				<div class="separator"></div>
			</div>
			<!-- <div class="detail-block"></div> -->
			<!-- https://avatars.githubusercontent.com/u/67905897?v=4 -->
			<el-image v-if="postInfo.image && postInfo.image != ''" :src="postInfo.image" class="body-image" />
			<!-- <div class="body-detail">{{ postInfo.content }}</div> -->
		</el-card>
		<div style="display: flex; flex-direction: column; margin-left: 10px;">
			<el-icon @click="userClick" style="margin-top: 10px;">
				<User />
			</el-icon>
			<el-icon v-if="showEdit" @click="editClick" style="margin-top: 10px;">
				<Edit />
			</el-icon>
			<el-icon v-if="showDelete" @click="delClick" style="margin-top: 10px;">
				<Delete />
			</el-icon>
		</div>
	</div>
</template>

<style scoped>
.main-width {
	width: 100%;
	min-width: 300px;
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

.post-card {
	display: flex;
	flex-direction: column;
}

.body-title {
	margin-top: 4vh;
}

.info-title {
	font-weight: bold;
	font-size: 20px;
	width: 98%;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
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
	border-radius: 20px;
}

.body-detail {
	text-align: left;
	font-size: 15px;
	position: relative;
	margin-top: 1vh;
	line-height: 20px;
	max-height: 60px;
	overflow: hidden;
	-webkit-line-clamp: 3;
	-webkit-box-orient: vertical;
	text-overflow: ellipsis;
}
</style>
