import * as VueRouter from "vue-router";
import MainPage from "./pages/MainPage.vue";
import LoginPage from "./pages/LoginPage.vue";
import PostInfoPage from "./pages/PostInfoPage.vue";
import PostEditPage from "./pages/PostEditPage.vue";
import PersonPostsPage from "./pages/PersonPostsPage.vue";
import UserinfoEditPage from "./pages/UserinfoEditPage.vue";

const router = VueRouter.createRouter({
  history: VueRouter.createWebHistory(),
  routes: [
    {
      name: "login",
      path: "/login",
      component: LoginPage,
    },
    {
      name: "mainpage",
      path: "/clientmain",
      component: MainPage,
    },
    {
      name: "postinfo",
      path: "/postinfo",
      component: PostInfoPage,
    },
    {
      name: "postedit",
      path: "/postedit",
      component: PostEditPage,
    },
    {
      name: "personposts",
      path: "/personposts",
      component: PersonPostsPage,
    },
    {
      name: "edituserinfo",
      path: "/edituserinfo",
      component: UserinfoEditPage,
    },
  ],
});

export default router;
