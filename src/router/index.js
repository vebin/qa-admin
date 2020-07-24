import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

/* Layout */
import Layout from "@/layout";

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: "/login",
    component: () => import("@/views/login/index"),
    hidden: true,
  },

  {
    path: "/404",
    component: () => import("@/views/404"),
    hidden: true,
  },

  {
    path: "/",
    component: Layout,
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        name: "dashboard",
        component: () => import("@/views/dashboard/index"),
        meta: { title: "控制台", icon: "dashboard" },
      },
    ],
  },

  {
    path: "/paper",
    component: Layout,
    redirect: "/paper/list",
    name: "paper",
    meta: { title: "试卷管理", icon: "el-icon-document" },
    children: [
      {
        path: "list",
        name: "paper-list",
        component: () => import("@/views/paper/list"),
        meta: { title: "试卷列表" },
      },
      {
        path: "create",
        name: "paper-create",
        component: () => import("@/views/paper/create"),
        meta: { title: "新增试卷" },
      },
    ],
  },

  {
    path: "/teacher",
    component: Layout,
    redirect: "/teacher/list",
    name: "teacher",
    meta: { title: "教师管理", icon: "el-icon-medal" },
    children: [
      {
        path: "list",
        name: "teacher-list",
        component: () => import("@/views/teacher/list"),
        meta: { title: "教师列表" },
      },
      {
        path: "create",
        name: "teacher-create",
        component: () => import("@/views/teacher/create"),
        meta: { title: "新增教师" },
      },
    ],
  },

  {
    path: "/student",
    component: Layout,
    redirect: "/student/list",
    name: "student",
    meta: { title: "学员管理", icon: "el-icon-user" },
    children: [
      {
        path: "list",
        name: "student-list",
        component: () => import("@/views/student/list"),
        meta: { title: "学员列表" },
      },
      {
        path: "create",
        name: "student-create",
        component: () => import("@/views/student/create"),
        meta: { title: "新增学员" },
      },
    ],
  },

  {
    path: "/system",
    component: Layout,
    redirect: "/system/list",
    name: "system",
    meta: { title: "系统配置", icon: "el-icon-setting" },
    children: [
      {
        path: "ui",
        name: "system-ui",
        component: () => import("@/views/system/ui"),
        meta: { title: "外观" },
      },
      {
        path: "log",
        name: "system-log",
        component: () => import("@/views/system/log"),
        meta: { title: "登录日志" },
      },
    ],
  },

  // 404 page must be placed at the end !!!
  { path: "*", redirect: "/404", hidden: true },
];

const createRouter = () =>
  new Router({
    // mode: 'history', // require service support
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRoutes,
  });

const router = createRouter();

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter();
  router.matcher = newRouter.matcher; // reset router
}

export default router;
