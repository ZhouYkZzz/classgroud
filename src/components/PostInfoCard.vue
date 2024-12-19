<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useGlobalStore } from '../stores/global'
import { ElMessage } from 'element-plus'

// 定义 props
const props = defineProps({
    momentID: String
})

// 使用全局存储
const globalStore = useGlobalStore()
const router = useRouter()

// 定义响应式数据
const postInfo = ref({
    username: '',
    userID: '',
    momentID: '',
    content: '',
    classID: '',
    likeCount: 0,
    image: '',
    createTime: ''
})

// 定义用户信息，从全局存储中获取
const userInfo = globalStore.userInfo

// 封装获取帖子数据的函数
const fetchPostData = async () => {
    try {
        const postResp = await axios.get('/api/v1/moment/detail', {
            params: { momentID: props.momentID },
            headers: { 'ngrok-skip-browser-warning': 'true' }
        })
        console.log('Post data response:', postResp.data) // 调试日志

        // 将 code 转换为数字
        const code = Number(postResp.data.code)
        console.log('Post response code:', code, typeof code)
        console.log('Post response data:', postResp.data.data, typeof postResp.data.data)

        if (code === 200 && postResp.data.data) { // 使用严格等于
            globalStore.addPostCache(postResp.data.data)
            postInfo.value = postResp.data.data
            // 如果需要其他用户信息，可以从 postInfo.value 中提取
        } else {
            ElMessage.warning("获取帖子数据失败！")
        }
    } catch (error) {
        ElMessage.error("获取帖子数据失败！")
        console.error(error)
    }
}

// 组件挂载时获取数据
onMounted(async () => {
    if (props.momentID && props.momentID !== '') {
        const postItem = globalStore.postCache[props.momentID]
        if (postItem) {
            postInfo.value = postItem
            // 如果需要其他用户信息，可以从 postInfo.value 中提取
        } else {
            await fetchPostData()
        }
    }
})

// 点赞功能
const likeClick = async () => {
    const data = {
        momentID: Number(postInfo.value.momentID), // 确保为数字
        likerID: userInfo.userID, // 点赞人的id
        likeeID: postInfo.value.userID // 被点赞人的id
    }
    console.log('Like data:', data) // 调试日志

    const headers = {
        'ngrok-skip-browser-warning': 'true'
        // 如果后端需要认证，添加 'Authorization' 头部
    }
    try {
        const likeResp = await axios.post('/api/v1/like', data, { headers })
        console.log('Like response:', likeResp.data) // 调试日志

        // 将 code 转换为数字
        const code = Number(likeResp.data.code)
        console.log('Like response code:', code, typeof code)
        console.log('Like response data:', likeResp.data.data, typeof likeResp.data.data)

        if (code === 200) { // 使用严格等于
            ElMessage.success("点赞成功！")
            // 直接更新 likeCount
            if (likeResp.data.data && typeof likeResp.data.data.likeCount === 'number') {
                postInfo.value.likeCount = likeResp.data.data.likeCount
            } else {
                ElMessage.warning("点赞成功，但无法获取最新的点赞数量。")
            }
        } else {
            ElMessage.error(likeResp.data.message || "点赞失败！")
        }
    } catch (error) {
        ElMessage.error("点赞失败，请重试！")
        console.error(error)
    }
}

// 图片点击事件
const imageClick = () => {
    if (postInfo.value.image) {
        window.open(postInfo.value.image, "_blank", "noreferrer")
    }
}

// 用户头像点击事件
const posterClick = () => {
    router.push({
        name: 'personposts',
        query: {
            userId: postInfo.value.userID // 或根据需要使用 username
        }
    })
}
</script>

<template>
    <el-card class="post-info-card">
        <div class="card-header">
            <div class="card-header-left" @click="posterClick">
                <el-avatar size="small" :src="userInfo.avatar" style="margin: 5px;">
                    <img v-if="!userInfo.avatar" src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png" />
                </el-avatar>
                <div style="padding-top: 9px; margin-left: 5px; font-size: 13px;">{{ postInfo.username }}</div>
            </div>
            <el-button style="margin-right: 7px; font-size: 10px;" type="primary" plain @click="likeClick">
                点赞：{{ postInfo.likeCount }}
            </el-button>
        </div>
        <el-scrollbar class="body-title" height="84vh">
            <div>
                <div class="info-title">{{ postInfo.content }}</div>
                <div class="info-time">{{ postInfo.createTime }}</div>
            </div>
            <el-image v-if="postInfo.image && postInfo.image !== ''" :src="postInfo.image" class="body-image" @click="imageClick" />
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
    align-items: center;
}

.card-header-left {
    display: flex;
    flex-direction: row;
    align-items: center;
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
    cursor: pointer;
}

.body-detail {
    text-align: left;
    font-size: 15px;
    position: relative;
    margin-top: 1vh;
}
</style>
