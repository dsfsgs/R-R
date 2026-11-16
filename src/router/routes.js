const routes = [
  // ============================================================
  // PUBLIC — no layout wrapper
  // ============================================================
  {
    path: "/",
    component: () => import("layouts/AuthLayout.vue"),
    children: [
      {
        path: "",
        name: "login",
        component: () => import("pages/LoginPage.vue"),
        meta: { public: true },
      },
    ],
  },

  // ============================================================
  // PROTECTED — MainLayout wrapper
  //
  // Every route name below matches a `route:` value inside
  // NAV_SECTIONS in MainLayout.vue, so `router.hasRoute(item.route)`
  // resolves correctly and no sidebar item is greyed out.
  //
  // meta.permission matches the sidebar item's `permission:` value.
  // ============================================================
  {
    path: "/admin",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      // ── OVERVIEW ─────────────────────────────────────────
      {
        path: "dashboard",
        name: "dashboard",
        component: () => import("pages/DashboardPage.vue"),
        meta: { permission: "dashboard.view" },
      },

      // ── WORKFLOW ─────────────────────────────────────────
      {
        path: "nominations",
        name: "nominations",
        component: () => import("pages/NominationsPage.vue"),
        meta: { permission: "nomination.view" },
      },
      {
        path: "create_nomination",
        name: "create_nomination",
        component: () => import("pages/CreateNominationPage.vue"),
        meta: { permission: "nomination.view" },
      },
      {
        path: "/nominations/:id/edit",
        name: "edit_nomination",
        component: () => import("pages/CreateNominationPage.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "nominations/:id",
        name: "view_nomination",
        component: () => import("pages/ViewNominationPage.vue"),
      },
      {
        path: "review_queue",
        name: "review_queue",
        component: () => import("pages/ReviewQueuePage.vue"),
        meta: { permission: "review.view" },
      },
      {
        path: "/hr/nominations/:id",
        name: "review_nomination",
        component: () => import("pages/ReviewNominationPage.vue"),
        meta: { requiresAuth: true },
      },

      // ── RECOGNITION ──────────────────────────────────────
      {
        path: "announcements",
        name: "announcements",
        component: () => import("pages/AnnouncementsPage.vue"),
        meta: { permission: "announcement.view" },
      },

      // ── CATEGORIES ───────────────────────────────────────
      {
        path: "national_awards",
        name: "national_awards",
        component: () => import("pages/HRNationalAwardsPage.vue"),
        meta: { permission: "national_award.view" },
      },
      {
        path: "local_praise_awards",
        name: "local_praise_awards",
        component: () => import("pages/HRLocalAwardsPage.vue"),
        meta: { permission: "praise_award.view" },
      },
      {
        path: "customized_rewards",
        name: "customized_rewards",
        component: () => import("pages/RewardIncentive.vue"),
        meta: { permission: "customized_reward.view" },
      },
      {
        path: "retirees",
        name: "retirees",
        component: () => import("pages/RetireesPage.vue"),
        meta: { permission: "loyalty_retiree.view" },
      },

      // ── REWARDS ──────────────────────────────────────────
      {
        path: "incentives",
        name: "incentives",
        component: () => import("pages/IncentivesPage.vue"),
        meta: { permission: "incentive.view" },
      },
      {
        path: "incentives_monitoring",
        name: "incentives_monitoring",
        component: () => import("pages/IncentivesMonitoringPage.vue"),
        meta: { permission: "incentive.view" },
      },

      // ── MANAGEMENT ───────────────────────────────────────
      {
        path: "reports",
        name: "reports",
        component: () => import("pages/management/ReportsPage.vue"),
        meta: { permission: "report.view" },
      },
      {
        path: "nomination_types",
        name: "nomination_types",
        component: () => import("pages/NominationTypesPage.vue"),
        meta: { permission: "nomination_type.view" },
      },
      {
        path: "agency_info",
        name: "agency_info",
        component: () => import("pages/AgencyInformationPage.vue"),
        meta: { permission: "nomination_type.view" },
      },
      {
        path: "funds_library",
        name: "funds_library",
        component: () => import("pages/FundsLibraryPage.vue"),
        meta: { permission: "nomination_type.view" },
      },

      {
        path: "user",
        name: "user",
        component: () => import("pages/UserPage.vue"),
        meta: { permission: "user.view" },
      },
      {
        path: "role",
        name: "role",
        component: () => import("pages/RolePage.vue"),
        meta: { permission: "user.view" },
      },

      // ── FORBIDDEN (target for permission-denied redirects) ─
      {
        path: "forbidden",
        name: "forbidden",
        component: () => import("pages/ForbiddenPage.vue"),
      },
    ],
  },

  // ============================================================
  // 404
  // ============================================================
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
