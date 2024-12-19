<script setup>
import { ref, onMounted, computed } from 'vue';
import PostInfoCard from '../components/PostInfoCard.vue';
import TopHeader from '../components/TopHeader.vue';
import { useRoute, useRouter } from 'vue-router';
import { useGlobalStore } from '../stores/global';
import axios from 'axios';
import { ElMessage } from 'element-plus'; // 确保已导入 ElMessage

const route = useRoute();
const router = useRouter();
const momentID = route.query.momentID;
const comments = ref([]);
const commentSenders = ref([]);

const globalStore = useGlobalStore();
const postInfo = ref();
const userInfo = computed(() => globalStore.userInfo);
const commentToSend = ref({
    commentID: '',
    momentID: '',
    userID: '',
    detail: '',
});
const roles = ['班主任', '老师', '家长', '学生'];
const commentText = ref('');
const commentToId = ref('');  // empty: to post
const placeholderText = ref('写评论…');

onMounted(async () => {
    if (momentID && momentID !== '') {
        const postItem = globalStore.postCache[momentID];
        if (postItem) {
            postInfo.value = postItem;
            comments.value = postInfo.value.commentList;
            // 填充 commentSenders
            commentSenders.value = comments.value.map(comment => {
                return globalStore.userCache[comment.userID] || {};
            });
            console.log("Comments from cache:", JSON.stringify(comments.value));
            console.log("Comment Senders from cache:", JSON.stringify(commentSenders.value));
        } else {
            await fetchPostData();
        }
    }
});

const fetchPostData = async () => {
    try {
        const postResp = await axios.get('/api/v1/moment/detail', {
            params: { momentID: momentID },
            headers: { 'ngrok-skip-browser-warning': 'true' },
        });
        console.log('Post data response:', postResp.data); // 调试日志

        // 将 code 转换为数字
        const code = Number(postResp.data.code);
        console.log('Post response code:', code, typeof code);
        console.log('Post response data:', postResp.data.data, typeof postResp.data.data);

        if (code === 200 && postResp.data.data) { // 使用严格等于
            globalStore.addPostCache(postResp.data.data);
            postInfo.value = postResp.data.data;
            comments.value = postInfo.value.commentList;

            // 填充 commentSenders
            commentSenders.value = comments.value.map(comment => {
                return globalStore.userCache[comment.userID] || {};
            });

            console.log("Comments:", JSON.stringify(comments.value));
            console.log("Comment Senders:", JSON.stringify(commentSenders.value));
        } else {
            ElMessage.warning("获取帖子数据失败！");
        }
    } catch (error) {
        ElMessage.error("获取帖子数据失败！");
        console.error(error);
    }
};

const replyClick = (index) => {
    placeholderText.value = '回复 @' + (commentSenders.value[index]?.name || '未知用户') + '：';
    commentToId.value = comments.value[index].commentID;
};

const postCardClick = () => {
    placeholderText.value = '写评论…';
    commentToId.value = ''; // 重置 commentToId
};

const sendComment = async () => {
    // 验证评论内容是否为空
    if (!commentText.value.trim()) {
        ElMessage.error("评论内容不能为空");
        return;
    }

    // 设置要发送的评论数据
    commentToSend.value.detail = commentText.value.trim();
    commentToSend.value.momentID = Number(momentID);
    commentToSend.value.userID = Number(userInfo.value.userID);

    // 仅在回复时设置 commentID
    if (commentToId.value) {
        commentToSend.value.commentID = Number(commentToId.value);
    } else {
        delete commentToSend.value.commentID; // 删除 commentID 字段
    }

    try {
        const response = await axios.post('/api/v1/comment/save', commentToSend.value, {
            headers: { 'ngrok-skip-browser-warning': 'true' },
        });
        console.log("Comment save response:", response.data); // 调试日志

        // 将 code 转换为数字
        const code = Number(response.data.code);
        console.log('Comment response code:', code, typeof code);
        console.log('Comment response data:', response.data.data, typeof response.data.data);

        if (code === 200) { // 使用严格等于
            ElMessage.success("评论发送成功！");
            commentText.value = '';
            placeholderText.value = '写评论…';
            commentToId.value = '';

            // 如果后端返回了新评论的数据，需要将其映射到前端期望的字段
            if (response.data.data) {
                const newComment = {
                    commentID: Number(response.data.data.commentID),
                    userID: Number(response.data.data.userID),
                    content: response.data.data.detail, // 映射 detail 到 content
                    createdAt: response.data.data.momentTime, // 映射 momentTime 到 createdAt
                    reply: '', // 根据需要设置 reply 字段
                };
                comments.value.push(newComment);
                commentSenders.value.push(globalStore.userCache[newComment.userID] || {});
            } else {
                // 如果后端没有返回新评论数据，可以选择重新获取评论列表
                await fetchPostData();
            }
        } else {
            ElMessage.error(response.data.message || "评论发送失败！");
        }
    } catch (error) {
        ElMessage.error("评论发送失败，请重试！");
        console.error(error);
    }
};

const getReplyInfo = (replyId) => {
    return comments.value.find(comment => comment.commentID === replyId) || {};
};

const commentAvatarClick = (index) => {
    router.push({
        name: "personposts",
        query: {
            userId: commentSenders.value[index]?.userID || ''
        }
    });
};

const getTimestamp = () => {
    const today = new Date();
    const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    const time = today.getHours() + ":" +
        (today.getMinutes() < 10 ? "0" + today.getMinutes() : today.getMinutes()) + ":" +
        (today.getSeconds() < 10 ? "0" + today.getSeconds() : today.getSeconds());
    return `${date} ${time}`;
};
</script>

<template>
    <TopHeader :showBackButton="true" />
    <el-row>
        <el-col :span="12">
            <PostInfoCard :momentID="momentID" @click="postCardClick" />
        </el-col>
        <el-col :span="12" class="comments-area">
            <el-scrollbar style="padding-right: 15px;" height="95vh">
                <!-- comments list -->
                <div v-for="(comment, index) in comments" :key="comment.commentID" style="list-style-type: none;">
                    <el-row class="comment-block">
                        <el-col :span="5">
                            <div class="comment-block-left">
                                <el-avatar 
                                    v-if="commentSenders[index]" 
                                    @click="commentAvatarClick(index)" 
                                    size="large"
                                    :src="commentSenders[index].avatar" 
                                />
                            </div>
                        </el-col>
                        <el-col :span="19" class="comment-block-right" @click="replyClick(index)">
                            <div>
                                <div class="comment-right-header" style="display: flex; flex-direction: row;">
                                    <div v-if="commentSenders[index]" style="font-weight: bold;">
                                        {{ commentSenders[index].name }}
                                    </div>
                                    <el-tag v-if="commentSenders[index]" style="margin-left: 5px;">
                                        {{ roles[commentSenders[index].role - 1] }}
                                    </el-tag>
                                </div>
                                <div class="post-time-text">
                                    {{ new Date(comment.createdAt).toLocaleString() }}
                                </div>

                                <div class="commentSty">
                                    ID: {{ comment.userID }}
                                    <!-- 时间显示已移除 -->
                                    <p class="commentFont">{{ comment.content }}</p>
                                </div>
                                
                                <div 
                                    v-if="commentSenders[index] && comment.reply && comment.reply !== ''" 
                                    class="reply-block"
                                >
                                    {{ globalStore.userCache[getReplyInfo(comment.reply).userID]?.name }}：{{ getReplyInfo(comment.reply).detail }}
                                </div>
                            </div>
                        </el-col>
                    </el-row>
                </div>
                <div style="height: 15.5vh;"></div>
            </el-scrollbar>
            <div class="bottom-input-container">
                <el-input 
                    :placeholder="placeholderText" 
                    v-model="commentText" 
                    class="bottom-input"
                    @keyup.enter.native="sendComment"
                    show-word-limit
                    :maxlength="200"
                >
                    <template #append>
                        <el-button :disabled="!commentText.trim()" @click="sendComment">发送</el-button>
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
.commentSty{
    font-size: 15px;
    color: #555555;
    font-style: italic;
    text-align: left;
    align-items: left;
    align-content: left;
    margin-top: 5px;
    background-color: #F0F0F0;
    border-radius: 7px;
    line-height: 15px;
    max-height: 150px;
    overflow: hidden;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    text-overflow: ellipsis;
}
.commentFont{
    font-size: 30px;
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
