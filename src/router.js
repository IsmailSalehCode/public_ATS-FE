import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "./stores/auth";

const routes = [
  {
    path: "/logout",
    component: () => import("./views/LogOut.vue"),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/",
    component: () => import("./views/UserDash.vue"),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/login",
    component: () => import("./views/LogIn.vue"),
  },
  {
    path: "/reset-password/:resetToken",
    component: () => import("./views/ResetPassword.vue"),
  },
];

const router = createRouter({
  history: createWebHistory("/"),
  routes: routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: "smooth",
        top: 30,
      };
    }
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  },
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isLoggedIn = authStore.hasToken;
  if (to.meta.requiresAuth && !isLoggedIn) {
    next("/login");
  } else {
    next();
  }
});

export default router;
