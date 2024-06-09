<script setup>
import MainPostCard from '../components/MainPostCard.vue'
import TopHeader from '../components/TopHeader.vue'
import axios from 'axios'
import { ref, onMounted, computed } from 'vue'
import { ApiGet } from '../utils/req';
import { Token } from '../utils/storage';
import { Edit } from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import { useGlobalStore } from '../stores/global';

const posts = ref([])

const globalStore = useGlobalStore()
const userInfo = computed(() => globalStore.userInfo)

const roles = ['班主任', '教师', '家长', '学生']
const thatUserInfo = ref({
    username: '',
    name: '',
    clazzId: '',
    schoolId: '',
    sex: '',
    role: '',
    avatar: '',
    cover: ''
})

const route = useRoute()
onMounted(async () => {
    const postsResp = await ApiGet('/user/post?username=' + route.query.userId)
    posts.value = postsResp.obj

    if (userInfo.value.username == route.query.userId) {
        thatUserInfo.value = userInfo.value
    } else {
        const thatUserItem = globalStore.userCache[route.query.userId]
        if (!thatUserItem) {
            const thatUserResp = await ApiGet('getUserinfoById?username=' + route.query.userId)
            thatUserInfo.value = thatUserResp.obj
            globalStore.addUserCache(thatUserResp.obj)
        } else {
            thatUserInfo.value = thatUserItem
        }
    }
})

const router = useRouter()
const newPostClick = () => {
    router.push({
        name: 'postedit',
        query: {
            userId: userInfo.value.username
        }
    })
}
</script>

<template>
    <TopHeader :showBackButton="true" />
    <el-container>
        <el-main>
            <div>您正在浏览 {{ thatUserInfo.name }} <el-tag>{{ roles[thatUserInfo.role - 1] }}</el-tag> 的动态</div>
            <div class="main-width" style="margin: 0 auto;">
                <div v-if="posts.length != 0" v-for="post in posts" class="cards-list">
                    <MainPostCard :postID="post.postId" :visitUserId="userInfo.username" class="post-card"></MainPostCard>
                </div>
            </div>
            <div v-if="posts.length == 0" class="no-post">
                当前用户暂无动态
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

.cards-list {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-items: center;
}

.post-card {
    margin: 5px;
    width: 100%
}

.no-post {
    text-align: center;
    margin-top: 20px;
}
</style>
