<script setup>
import { ref, onMounted, computed } from 'vue'
import PostInfoCard from '../components/PostInfoCard.vue'
import TopHeader from '../components/TopHeader.vue'
import { useRoute, useRouter } from 'vue-router'
import { Token } from '../utils/storage';
import { ApiGet, ApiPost } from '../utils/req'
import { useGlobalStore } from '../stores/global';
import { ChatDotSquare } from '@element-plus/icons-vue'

const route = useRoute()
const postID = route.query.postId
const comments = ref([])
const commentSenders = ref([])

const globalStore = useGlobalStore()

const userInfo = computed(() => globalStore.userInfo)
const commentToSend = ref({
    commentId: '',
    postId: '',
    username: '',
    detail: '',
    postTime: ''
})
const roles = ['班主任', '老师', '家长', '学生']
const commentText = ref('')
const commentToId = ref('')  // empty: to post
const placeholderText = ref('写评论…')

onMounted(async () => {
    try {
        const commsResp = await ApiGet('comment/get?postId=' + postID)
        comments.value = commsResp.obj

        for (let i = 0; i < comments.value.length; i++) {
            const comment = comments.value[i]
            const commentSenderItem = globalStore.userCache[comment.username]
            if (!commentSenderItem) {
                const commUserResp = await ApiGet('getUserinfoById?username=' + comment.username)
                commentSenders.value.push(commUserResp.obj)
                globalStore.addUserCache(commUserResp.obj)
            } else {
                commentSenders.value.push(commentSenderItem)
            }
        }
    } catch (error) {
        console.error(error);
    }
})

const replyClick = (index) => {
    placeholderText.value = '回复 @' + commentSenders.value[index].name + '：'
    commentToId.value = comments.value[index].commentId
}

const postCardClick = () => {
    placeholderText.value = '写评论…'
}

const sendComment = async () => {
    commentToSend.value.detail = commentText.value
    commentToSend.value.postId = postID
    commentToSend.value.username = userInfo.value.username
    commentToSend.value.commentId = commentToId.value
    commentToSend.value.postTime = getTimestamp()

    await ApiPost('comment/save', commentToSend.value)

    commentToId.value = ''
    placeholderText.value = '写评论…'
    router.go(0)
}

const getReplyInfo = (replyId) => {
    for (let i = 0; i < comments.value.length; i++) {
        if (comments.value[i].commentId === replyId) {
            return comments.value[i]
        }
    }
}

const router = useRouter()
const commentAvatarClick = (index) => {
    router.push({
        name: "personposts",
        query: {
            userId: commentSenders.value[index].name
        }
    })
}

const getTimestamp = () => {
    const today = new Date();
    const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    const time = today.getHours() + ":" +
        (today.getMinutes() < 10 ? "0" + today.getMinutes() : today.getMinutes() + ":")
        + (today.getSeconds() < 10 ? "0" + today.getSeconds() : today.getSeconds());
    const timestamp = date + ' ' + time;
    return timestamp;
}
</script>

<template>
    <TopHeader :showBackButton="true" />
    <el-row>
        <el-col :span="12">
            <PostInfoCard :postId="postID" @click="postCardClick" />
        </el-col>
        <el-col :span="12" class="comments-area">
            <el-scrollbar style="padding-right: 15px;" height="95vh">
                <!-- comments list -->
                <div v-for="(comment, index) in comments" style="list-style-type: none;">
                    <el-row class="comment-block">
                        <el-col :span="5">
                            <div class="comment-block-left">
                                <el-avatar v-if="commentSenders[index]" @click="commentAvatarClick(index)" size="large"
                                    :src="commentSenders[index].avatar" />
                            </div>
                        </el-col>
                        <el-col :span="19" style="comment-block-right" @click="replyClick(index)">
                            <div>
                                <div style="comment-right-header">
                                    <div style="display: flex; flex-direction: row;">
                                        <div v-if="commentSenders[index]" style="font-weight: bold;">{{
                                            commentSenders[index].name }}</div>
                                        <el-tag v-if="commentSenders[index]" style="margin-left: 5px;">{{
                                            roles[commentSenders[index].role - 1]
                                        }}</el-tag>
                                    </div>
                                    <div class="post-time-text">{{
                                        comment.postTime
                                    }}</div>
                                </div>
                                <div style="text-align: left;">{{ comment.detail }}</div>
                                <div v-if="commentSenders[index] && comment.reply && comment.reply !== ''"
                                    class="reply-block">
                                    {{ globalStore.userCache[getReplyInfo(comment.reply).username].name }}：{{
                                        getReplyInfo(comment.reply).detail }}
                                </div>
                            </div>
                        </el-col>
                    </el-row>
                </div>
                <div style="height: 15.5vh;"></div>
            </el-scrollbar>
            <div class="bottom-input-container">
                <el-input :placeholder="placeholderText" v-model="commentText" class="bottom-input"
                    @keyup.enter.native="sendComment">
                    <template #append>
                        <el-button @click="sendComment">发送</el-button>
                    </template>
                </el-input>
            </div>
        </el-col>
    </el-row>
</template>

<style>
.main-width {
    width: 50%;
    min-width: 300px;
}

.comments-area {
    height: 85vh;
    padding: 2vh;
}

.bottom-input-container {
    height: 9vh;
    padding-top: 2vh;
}

.bottom-input {
    height: 100%;
    width: 100%;
}

.bottom-block {
    width: 100%;
    padding: 5px;
}

.comment-block {
    display: flex;
    flex-direction: row;
    margin-bottom: 2vh;
}

.comment-block-left {
    padding-right: 10px;
    display: flex;
    justify-items: right;
    justify-content: right;
}

.comment-block-right {
    display: flex;
    flex-direction: row;
    align-content: flex-start;
}

.comment-right-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-content: left;
    text-align: left;
}

.post-time-text {
    font-size: small;
    color: darkgray;
    margin-left: 5px;
    text-align: left;
    width: 100%;
}

.reply-block {
    padding: 5px 5px 5px 7px;
    font-size: 12px;
    color: #555555;
    font-style: italic;
    text-align: left;
    align-items: left;
    align-content: left;
    margin-top: 5px;
    background-color: #F0F0F0;
    border-radius: 7px;
    line-height: 15px;
    max-height: 66px;
    overflow: hidden;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    text-overflow: ellipsis;
}
</style>
