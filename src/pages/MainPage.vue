<script setup>
import MainPostCard from '../components/MainPostCard.vue'
import TopHeader from '../components/TopHeader.vue'
import axios from 'axios'
import { ref, onMounted, computed } from 'vue'
import { ApiGet } from '../utils/req';
import { Token } from '../utils/storage';
import { Edit } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useGlobalStore } from '../stores/global';

const posts = ref([])

const globalStore = useGlobalStore()
const userInfo =  globalStore.userInfo

onMounted(async () => {
	const classID=userInfo.classID; // 请根据实际情况设置classID
	try {
		const postsResp = await axios.get('/api/v1/moment', {
			params: {
				classID: classID
			},
			headers: {
				'ngrok-skip-browser-warning': 'true'
			}
		});

		posts.value = postsResp.data.data.momentList; // 修改为data.obj
		console.log(posts.value);
	} catch (error) {
		console.error('Error fetching posts:', error);
	}
});

const router = useRouter()
const newPostClick = () => {
	router.push({
		name: 'postedit',
		query: {
			userID: userInfo.userID,
		}
	})
}
</script>

<template>
	<TopHeader />
	<el-container>
		<el-main class="cards-list">
			<el-button class="main-width" type="primary" :icon="Edit" plain @click="newPostClick">写一条动态…</el-button>
			<div class="main-width" style="margin: 0 auto;">
				<div v-if="posts.length != 0">
					<div class="card-item" v-for="post in posts" :key="post.momentID">
						<MainPostCard :momentID="post.momentID" class="post-card"></MainPostCard>
					</div>
				</div>
			</div>
			<div v-if="posts.length == 0" class="no-post">
				当前班级暂无动态
			</div>
		</el-main>
		<el-backtop :right="50" :bottom="50" />
	</el-container>
</template>

<style scoped>
.main-width {
	width: 50%;
	min-width: 300px;
}

.card-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-items: center;
}

.post-card {
	margin: 5px;
	width: 100%;
}

.no-post {
	text-align: center;
	margin-top: 20px;
}
</style>
