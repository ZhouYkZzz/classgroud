<script setup>
import { useRouter } from 'vue-router'
import { ArrowLeftBold, House, ArrowDown } from '@element-plus/icons-vue'
import { ApiGet } from '../utils/req'
import { ref, onMounted, watch } from 'vue'
import { Token } from '../utils/storage'
import { useGlobalStore } from '../stores/global'
const props = defineProps({
    showBackButton: Boolean,
})

const router = useRouter()
const globalStore = useGlobalStore()

const roles = ['班主任', '老师', '家长', '学生']

const backClick = () => {
    router.go(-1)
}
const homeClick = () => {
    router.push({
        name: "mainpage"
    })
}
const logoutClick = () => {
    router.push({
        name: "login"
    })
}
const uinfoEditClick = () => {
    router.push({
        name: "edituserinfo"
    })
}

onMounted(async () => {
    if (globalStore.userInfo.username === '') {
        const userResp = await ApiGet('getUserinfoByToken?token=' + Token.getToken())
        globalStore.setUserInfo(userResp.obj);
    }
})
</script>

<template>
    <div class="navbar">
        <el-row v-if="globalStore.userInfo != null">
            <el-col :span="12">
                <div class="navbar-left">
                    <button class="navbar-item navbar-button" v-if="showBackButton" @click="backClick">
                        <el-icon>
                            <ArrowLeftBold />
                        </el-icon>
                    </button>
                    <button class="navbar-item navbar-button" v-if="showBackButton" @click="homeClick">
                        <el-icon>
                            <House />
                        </el-icon>
                    </button>
                    <div class="navbar-item">{{ globalStore.userInfo.schoolId }}</div>
                    <div class="navbar-item">{{ globalStore.userInfo.clazzId }}</div>
                    <el-tag class="navbar-item">{{ roles[globalStore.userInfo.role - 1] }}</el-tag>
                </div>
            </el-col>
            <el-col :span="12">
                <div class="navbar-right">
                    <el-dropdown class="navbar-item" style="height: 100%;">
                        <span>
                            {{ globalStore.userInfo.name }}
                            <el-icon class="el-icon--right">
                                <ArrowDown />
                            </el-icon>
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item @click="logoutClick">登出</el-dropdown-item>
                                <el-dropdown-item @click="uinfoEditClick">编辑</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                    <!-- https://avatars.githubusercontent.com/u/67905897?v=4 -->
                    <el-avatar :src="globalStore.userInfo.avatar" size="small" class="navbar-item">
                        <img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png" /></el-avatar>
                </div>
            </el-col>
        </el-row>
        <div v-else style="font-family: 'Courier New', Courier, monospace; font-weight: bold; color: red;">
            No userInfo passed
        </div>
    </div>
</template>

<style scoped>
.navbar {
    position: sticky;
    padding: 10px;
    z-index: 2001;
    top: 0px;
    width: 100%;
    left: 0px;
    background-color: white;
    /* 阴影  水平阴影距离，垂直阴影距离， 模糊尺寸， 阴影尺寸 颜色*/
    box-shadow: 0 2px 4px 0 rgb(0, 0, 0, 10%);
}

.navbar-item {
    margin: 0 5px 0 5px;
}

.navbar-button {
    border-color: #409eff;
    background-color: aliceblue;
    border-radius: 10%;
}

.navbar-left {
    display: flex;
    flex-direction: row;
    height: 100%;
}

.navbar-right {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
}
</style>
