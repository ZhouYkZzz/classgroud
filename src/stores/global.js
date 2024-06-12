import { defineStore } from "pinia";
import { reactive } from "vue";
import { ref } from "vue";

export const useGlobalStore = defineStore("global", () => {
  const userInfo = ref({
    userID: "",
    username: "",
    name: "",
    classID: "",
    schoolID: "",
    sex: "",
    role: "",
    avatar: "",
    cover: "",
  });

  const userCache = reactive({});
  const postCache = reactive({});

  const setUserInfo = (_userInfo) => {
    userInfo.value = { ..._userInfo };
  };

  const addUserCache = (_userInfo) => {
    userCache[_userInfo.username] = _userInfo;
  };
  const addPostCache = (_postInfo) => {
    postCache[_postInfo.postId] = _postInfo;
  };

  return {
    userInfo,
    setUserInfo,
    userCache,
    addUserCache,
    postCache,
    addPostCache,
  };
});
