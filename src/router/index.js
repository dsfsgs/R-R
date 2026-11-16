import { route } from "quasar/wrappers";
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from "vue-router";
import routes from "./routes";
import { useAuthStore } from "stores/authStore";

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === "history"
    ? createWebHistory
    : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  // ============================================================
  // NAVIGATION GUARD
  // ------------------------------------------------------------
  // 1. Public routes (login) → allow; skip if already logged in
  // 2. Not logged in → redirect to /login with a "from" hint
  // 3. Missing required permission → /admin/forbidden
  // ============================================================
  Router.beforeEach((to) => {
    const auth = useAuthStore();

    // Public routes — login page and anything marked meta.public
    if (to.meta.public) {
      if (to.name === "login" && auth.isAuthenticated) {
        // Already logged in, don't show login again
        return { name: "dashboard" };
      }
      return true;
    }

    // Must be logged in for everything else
    if (!auth.isAuthenticated) {
      return {
        name: "login",
        query: { redirect: to.fullPath },
      };
    }

    // Must have the required permission (if the route defines one)
    const required = to.meta.permission;
    if (required && !auth.hasPermission(required)) {
      return { name: "forbidden" };
    }

    return true;
  });

  return Router;
});
