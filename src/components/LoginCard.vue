<script setup >
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { ApiGet } from '../utils/req'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { Token } from '../utils/storage'
import { useGlobalStore } from '../stores/global'

const globalStore = useGlobalStore()

const imageUrl = ref('')
const urlResp = ref('')
const tempAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
const dialogTitle = ref('注册账号')

const handleAvatarSuccess = (
	response,
	uploadFile
) => {
	imageUrl.value = URL.createObjectURL(uploadFile.raw)
	urlResp.value = response.obj
	ElMessage.info("请勿继续上传头像，谢谢配合！")
}
const beforeAvatarUpload = (rawFile) => {
	if (rawFile.type !== 'image/jpeg') {
		ElMessage.error('用户头像需为jpg格式')
		return false
	} else if (rawFile.size / 1024 / 1024 > 2) {
		ElMessage.error('用户头像不可超过 2MB')
		return false
	}
	return true
}

const router = useRouter()
const userInfo=ref({
	userID:"",
	username:"",
	calssID:"",
	schoolID:"",
	sex:"",
	role:"",
	name:"",
})
const step = ref(1)
const regShow = ref(false)
const pwd = ref('')
const newUsername = ref('')
const newPhone = ref('')
const newPwd = ref('')
const newSchool = ref('')
const newClazz = ref('')
const newSubj = ref('')
const newChildID = ref('')
const roles = [
	{ id: 1, label: '班主任', desc: '班主任可查看并删除本班级的任意动态，并拥有教师的所有权限' },
	{ id: 2, label: '教师', desc: '教师可查看本班级动态，并可设置教学课程' },
	{ id: 3, label: '家长', desc: '家长可查看本班级动态，并可设置对应子女的绑定信息' },
	{ id: 4, label: '学生', desc: '学生可查看本班级动态，并编辑、删除自己发送的动态' },]
const sexes = [
	{ id: 1, label: "男" },
	{ id: 2, label: "女" },]
const role = ref(roles[0])
const sex = ref(sexes[0])

const forgotPwd = () => {
	ElMessageBox.alert('请联系管理员找回')
}

const handleDialogClose = () => {
	regShow.value = false
	newUsername.value = ''
	step.value = 1
	dialogTitle.value = '注册账号'
}

const login = async () => {
	try {
		const data = {
			username: newPhone.value,
			password: pwd.value
		}

		const response = await axios.post('/api/v1/user/login', data)
		const _data = response.data

		if (_data.code == 200) {
			globalStore.setUserInfo(_data.data)
			router.push({
				name: 'mainpage'
			})
		} else {
			ElMessage.error(_data.message)
		}
	} catch (resp) {
		ElMessage.error(resp.message || resp.data.message)
	}
}

const register = async () => {
	try {
		const regData = {
			username: newPhone.value,
			name: newUsername.value,
			classID: Number(newClazz.value),
			sex: sex.value.id,
			role: role.value.id,
			//schoolID: Number(newSchool.value),
			password: newPwd.value,
			//avatar: tempAvatar,
			//cover: ref('bbb').value,
			//code: ref('000000').value
		}

		const response = await axios.post('/api/v1/user/register', regData)
		const _data = response.data

		ElMessage.success(_data.message)
		dialogTitle.value = '上传头像'
		step.value++
	} catch (error) {
		console.error(error)
		ElMessage.error(error.message || error.data.message)
	}
}

const upload = async (e) => {
	var files = document.getElementById('uFile').value;
	if (!/\.(jpg|jpeg|png)$/i.test(files)) {
		ElMessage.warning("图片类型必须是jpeg,jpg,png中的一种,请重新上传")
		return false;
	}
	let file = e.target.files[0]
	let param = new FormData()
	param.append('username', newPhone.value)
	param.append('file', file)
	let config = {
		headers: { 'Content-Type': 'multipart/form-data' }
	}
	await axios.post("/api/v1/upload", param, config).then((res) => {
		if (res.data.code = 200) {
			ElMessage.success("上传成功，请勿继续上传，谢谢配合！")
		} else {
			ElMessage.warning("添加失败")
		}
	}).catch((err) => {
		ElMessage.warning("图片上传失败，请重新上传!")
	})
}
</script>

<template>
	<el-card class="login-card">
		<el-form-item prop="account">
			<el-input v-model="newPhone" type="username" placeholder="用户名" @keyup.enter.native="login" />
		</el-form-item>
		<el-form-item prop="password">
			<el-input v-model="pwd" type="password" placeholder="密码" @keyup.enter.native="login" />
		</el-form-item>
		<el-row style="display: flex; justify-content: center;">
			<el-col :span="6"><el-button @click="regShow = true" type="primary" plain>注册</el-button></el-col>
			<el-col :span="6"><el-button @click="login" type="primary">登录</el-button></el-col>
		</el-row>
	</el-card>
	<el-dialog v-model="regShow" :before-close="handleDialogClose" :title="dialogTitle" width="400px"
		style="max-height: 800px;">
		<div v-if="step == 1">
			<el-row>
				<el-col :span="1">
					<div style="color: red">*</div>
				</el-col>
				<el-col :span="23"><el-input v-model="newUsername" placeholder="姓名"></el-input></el-col>
			</el-row>
			<div style="height: 10px;" />
			<el-row>
				<el-col :span="1">
					<div style="color: red">*</div>
				</el-col>
				<el-col :span="23"><el-input v-model="newPhone" placeholder="用户名"></el-input></el-col>
			</el-row>
			<div style="height: 10px;" />
			<el-row>
				<el-col :span="1">
					<div style="color: red">*</div>
				</el-col>
				<el-col :span="23"><el-input v-model="newPwd" placeholder="密码"></el-input></el-col>
			</el-row>
			<div style="height: 10px;" />
			<el-row>
				<el-col :span="1"></el-col>
				<el-col :span="11">
					<el-select v-model="role" value-key="id" placeholder="请选择身份">
						<el-option v-for="item in roles" :value="item" :key="item.id" :label="item.label" />
					</el-select>
				</el-col>
				<el-col :span="1"></el-col>
				<el-col :span="11">
					<el-select v-model="sex" value-key="id" placeholder="请选择性别">
						<el-option v-for="item in sexes" :value="item" :key="item.id" :label="item.label" />
					</el-select>
				</el-col>
			</el-row>
			<div style="height: 10px;" />
			<div>{{ role.desc }}</div>
			<div style="height: 30px;" />
		</div>

		<div v-if="step == 2">
			<el-row>
				<el-col :span="1">
					<div style="color: red">*</div>
				</el-col>
				<el-col :span="23"><el-input v-model="newSchool" placeholder="学校"></el-input></el-col>
			</el-row>
			<div style="height: 10px;" />
			<el-row>
				<el-col :span="1">
					<div style="color: red">*</div>
				</el-col>
				<el-col :span="23"><el-input v-model="newClazz" placeholder="班级"></el-input></el-col>
			</el-row>
			<div v-if="role.id == 1 || role.id == 2">
				<div style="height: 10px;" />
				<el-row>
					<el-col :span="1">
						<div style="color: red">*</div>
					</el-col>
					<el-col :span="23"><el-input v-model="newSubj" placeholder="任教学科"></el-input></el-col>
				</el-row>
			</div>
			<div v-if="role.id == 3">
				<div style="height: 10px;" />
				<el-row>
					<el-col :span="1">
						<div style="color: red">*</div>
					</el-col>
					<el-col :span="23"><el-input v-model="newChildID" placeholder="学生学号"></el-input></el-col>
				</el-row>
			</div>
			<div style="height: 30px;" />
		</div>

		<div v-if="step == 3">
			<input style="width: 100%;" type="file" id="uFile" name="uFile" @change="upload($event)" />
			<div style="height: 30px;" />
		</div>

		<el-row style="display: flex; justify-content: center;">
			<el-col v-if="step == 1 || step == 3" :span="6"><el-button @click="handleDialogClose"
					plain>取消</el-button></el-col>
			<el-col v-if="step > 1 && step < 3" :span="6"><el-button @click="step--" plain>上一步</el-button></el-col>
			<el-col v-if="step < 2" :span="6"><el-button @click="step++" type="primary">下一步</el-button></el-col>
			<el-col v-if="step == 2" :span="6"><el-button @click="register" type="primary">确认信息</el-button></el-col>
			<el-col v-if="step == 3" :span="6"><el-button @click="handleDialogClose" type="primary">完成</el-button></el-col>
		</el-row>
	</el-dialog>
</template>

<style scoped>
.avatar-uploader .avatar {
	width: 178px;
	height: 178px;
	display: block;
}
</style>

<style>
.login-card {
	width: 80%;
	min-width: 300px;
	max-width: 400px;
	height: 175px;
}

.line {
	width: 100%;
	height: 0;
	border-top: 1px solid lightgray;
}

.avatar-uploader .el-upload {
	border: 1px dashed var(--el-border-color);
	border-radius: 6px;
	cursor: pointer;
	position: relative;
	overflow: hidden;
	transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
	border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
	font-size: 28px;
	color: #8c939d;
	width: 178px;
	height: 178px;
	text-align: center;
}
</style>
