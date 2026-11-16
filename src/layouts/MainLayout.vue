<template>
  <q-layout view="lHh Lpr lFf" class="app-layout">
    <!-- =====================================================
         HEADER
    ====================================================== -->
    <q-header class="app-header">
      <q-toolbar class="app-toolbar">
        <!-- Menu -->
        <q-btn
          flat
          round
          dense
          icon="menu"
          class="menu-btn"
          @click="toggleLeftDrawer"
        />

        <!-- Office Name - Full display without ellipsis -->
        <div class="header-office">
          <div class="office-name">
            {{ officeName }}
          </div>
        </div>

        <!-- Notifications -->
        <q-btn
          flat
          round
          dense
          icon="notifications_none"
          class="notification-btn"
        >
          <q-badge
            v-if="notificationCount"
            floating
            rounded
            color="negative"
            :label="notificationCount"
          />

          <q-tooltip> Notifications </q-tooltip>
        </q-btn>

        <!-- User -->
        <q-btn flat no-caps class="header-user q-px-md">
          <q-avatar class="header-avatar">
            {{ userInitials }}
          </q-avatar>

          <div class="header-user-info">
            <div class="header-user-name">
              {{ userName }}
            </div>

            <div class="header-user-role">
              {{ userRole }}
            </div>
          </div>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- =====================================================
         SIDEBAR
    ====================================================== -->
    <q-drawer
      v-model="leftDrawerOpen"
      :width="260"
      :breakpoint="900"
      show-if-above
      bordered
      class="app-drawer"
    >
      <div class="drawer-wrapper">
        <!-- =================================================
             BRAND
        ================================================== -->
        <div class="sidebar-brand">
          <!-- <img
            src="/image/R&R.png"
            alt="Recognition & Reward Logo"
            class="sidebar-logo"
            loading="lazy"
          /> -->

          <div class="sidebar-brand-text">
            <div class="sidebar-title">Rewards & Recognitions</div>
            <div class="sidebar-subtitle">Management System</div>
          </div>
        </div>

        <!-- =================================================
             NAVIGATION (driven by navSections in the script)
        ================================================== -->
        <q-scroll-area class="navigation-scroll">
          <div class="navigation">
            <template v-for="section in navSections" :key="section.label">
              <div class="nav-section">{{ section.label }}</div>

              <q-item
                v-for="item in section.items"
                :key="item.label"
                :clickable="!item.disabled"
                :disable="item.disabled"
                v-ripple="!item.disabled"
                :to="item.disabled ? undefined : { name: item.route }"
                :exact="item.exact"
                class="nav-item"
                active-class="nav-item-active"
              >
                <q-item-section avatar>
                  <q-icon :name="item.icon" />
                </q-item-section>

                <q-item-section>{{ item.label }}</q-item-section>

                <q-item-section v-if="item.soon" side>
                  <q-badge
                    color="grey-3"
                    text-color="grey-8"
                    label="Soon"
                    class="nav-soon"
                  />
                </q-item-section>
              </q-item>
            </template>
          </div>
        </q-scroll-area>

        <!-- =================================================
             USER CARD & FOOTER
        ================================================== -->
        <div class="sidebar-footer">
          <!-- Sign Out -->
          <q-btn
            flat
            no-caps
            align="left"
            class="sidebar-signout"
            @click="logout"
          >
            <q-icon name="logout" size="21px" />

            <span> Sign Out </span>
          </q-btn>

          <div class="sidebar-credit">Developed by CICTMO · SPM Section</div>
        </div>
      </div>
    </q-drawer>

    <!-- =====================================================
         CONTENT
    ====================================================== -->
    <q-page-container class="page-container">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref, computed, onMounted, watch } from "vue";
import { Notify } from "quasar";
import { useRouter } from "vue-router";
import { useAuthStore } from "stores/authStore";

// ============================================================
// NAVIGATION CONFIG
// ------------------------------------------------------------
// Every menu item of the RRMS lives here.
//  - route:       named route. If it is not registered in the
//                 router yet, the item shows as disabled instead
//                 of throwing an error.
//  - permission:  the .view permission required to see the item.
//                 Filtered at runtime by authStore.hasPermission.
//  - soon:        phase 2 item, always disabled with a "Soon" badge.
// ============================================================
const NAV_SECTIONS = [
  {
    label: "OVERVIEW",
    items: [
      {
        label: "Dashboard",
        icon: "dashboard",
        route: "dashboard",
        exact: true,
        permission: "dashboard.view",
      },
    ],
  },
  {
    label: "WORKFLOW",
    items: [
      {
        label: "My Nominations",
        icon: "how_to_vote",
        route: "nominations",
        permission: "nomination.view",
      },
      {
        label: "Review Queue",
        icon: "fact_check",
        route: "review_queue",
        permission: "review.view",
      },
    ],
  },
  {
    label: "RECOGNITION",
    items: [
      {
        label: "Announcements",
        icon: "campaign",
        route: "announcements",
        permission: "announcement.view",
      },
    ],
  },
  {
    label: "CATEGORIES",
    items: [
      {
        label: "National Awards",
        icon: "emoji_events",
        route: "national_awards",
        permission: "national_award.view",
      },
      {
        label: "Local PRAISE Awards",
        icon: "workspace_premium",
        route: "local_praise_awards",
        permission: "praise_award.view",
      },
      {
        label: "Loyalty Awards",
        icon: "card_giftcard",
        route: "customized_rewards",
        permission: "customized_reward.view",
      },
      {
        label: "Retirees Employee",
        icon: "military_tech",
        route: "retirees",
        permission: "loyalty_retiree.view",
      },
    ],
  },
  {
    label: "REWARDS",
    items: [
      {
        label: "Incentives Library",
        icon: "payments", // or "sell" / "price_change"
        route: "incentives",
        permission: "incentive.view",
      },
      {
        label: "Incentives Monitoring",
        icon: "receipt_long", // or "request_quote" / "fact_check"
        route: "incentives_monitoring",
        permission: "incentive.view",
      },
    ],
  },
  // {
  //   label: "SERVICE RECOGNITION",
  //   items: [
  //     {
  //       label: "Loyalty",
  //       icon: "workspace_premium",
  //       route: "loyalty",
  //       soon: true,
  //       permission: "loyalty.view",
  //     },
  //     {
  //       label: "Retirement",
  //       icon: "elderly",
  //       route: "retirement",
  //       soon: true,
  //       permission: "retirement.view",
  //     },
  //   ],
  // },
  {
    label: "MANAGEMENT",
    items: [
      {
        label: "Reports",
        icon: "bar_chart",
        route: "reports",
        permission: "report.view",
      },
      {
        label: "Nomination Types",
        icon: "tune",
        route: "nomination_types",
        permission: "nomination_type.view",
      },
      {
        label: "Agency Directory",
        icon: "corporate_fare",
        route: "agency_info",
        permission: "nomination_type.view",
      },
      {
        label: "Funds Monitoring",
        icon: "account_balance",
        route: "funds_library",
        permission: "nomination_type.view",
      },
      {
        label: "User Management",
        icon: "people",
        route: "user",
        permission: "user.view",
      },
      {
        label: "Role and Permission",
        icon: "admin_panel_settings",
        route: "role",
        permission: "user.view",
      },
    ],
  },
];

export default defineComponent({
  name: "MainLayout",

  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const leftDrawerOpen = ref(false);
    const notificationCount = ref(3);

    // ============================================================
    // COMPUTED - Get user data from auth store
    // ============================================================

    const userName = computed(() => {
      return authStore.user?.name || "Guest User";
    });

    const officeName = computed(() => {
      return authStore.user?.office || "No Office Assigned";
    });

    const userRole = computed(() => {
      const role = authStore.user?.role || authStore.user?.roles?.[0];
      if (!role) return "No Role";
      return role
        .split("_")
        .map((w) =>
          w.length <= 3
            ? w.toUpperCase()
            : w.charAt(0).toUpperCase() + w.slice(1)
        )
        .join(" ");
    });

    const userInitials = computed(() => {
      const name = userName.value;
      if (name === "Guest User") return "GU";
      return name
        .split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .substring(0, 2)
        .toUpperCase();
    });

    // ============================================================
    // COMPUTED - Navigation
    // Items are shown only when the user has the matching .view
    // permission. Sections with no visible items are hidden.
    // ============================================================

    const navSections = computed(() =>
      NAV_SECTIONS
        // 1. Filter items by permission within each section
        .map((section) => ({
          ...section,
          items: section.items
            .filter((item) => authStore.hasPermission(item.permission))
            .map((item) => ({
              ...item,
              disabled: !!item.soon || !router.hasRoute(item.route),
            })),
        }))
        // 2. Drop sections that have no visible items
        .filter((section) => section.items.length > 0)
    );

    // ============================================================
    // METHODS
    // ============================================================

    function toggleLeftDrawer() {
      leftDrawerOpen.value = !leftDrawerOpen.value;
    }

    async function logout() {
      try {
        await authStore.logout();

        Notify.create({
          message: "You have been signed out.",
          type: "info",
          position: "top",
          timeout: 2000,
          icon: "logout",
        });
      } catch (error) {
        console.error("Logout error:", error);
      } finally {
        router.push({ name: "login" });
      }
    }

    // ============================================================
    // LIFECYCLE
    // ============================================================

    onMounted(() => {
      if (!authStore.isAuthenticated) {
        router.push({ name: "login" });
      }
    });

    watch(
      () => authStore.isAuthenticated,
      (isAuthenticated) => {
        if (!isAuthenticated) {
          router.push({ name: "login" });
        }
      }
    );

    return {
      leftDrawerOpen,
      userName,
      userRole,
      userInitials,
      officeName,
      notificationCount,
      navSections,
      toggleLeftDrawer,
      logout,
    };
  },
});
</script>

<style scoped>
/* =========================================================
   MAIN LAYOUT
========================================================= */

.app-layout {
  background: #f3f9f4;
}

/* =========================================================
   HEADER
========================================================= */

.app-header {
  background: #ffffff;
  color: #172b3a;
  border-bottom: 1px solid #e6eee8;
  box-shadow: 0 2px 12px rgba(24, 67, 40, 0.05);
}

.app-toolbar {
  min-height: 72px;
  padding: 8px 22px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: nowrap;
}

.menu-btn {
  color: #16364a;
  flex-shrink: 0;
}

/* =========================================================
   HEADER OFFICE - Full display without ellipsis
========================================================= */

.header-office {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
}

.office-name {
  font-size: var(--fs-md);
  font-weight: var(--fw-semibold);
  color: #172b3a;
  line-height: var(--lh-normal);
  word-wrap: break-word;
  word-break: break-word;
  width: 100%;
}

/* =========================================================
   NOTIFICATION BUTTON
========================================================= */

.notification-btn {
  color: #61727a;
  flex-shrink: 0;
}

.notification-btn:hover {
  color: #168c45;
  background: #eff9f1;
}

/* =========================================================
   HEADER USER
========================================================= */

.header-user {
  min-height: 48px;
  padding: 4px 6px;
  border-radius: 10px;
  flex-shrink: 0;
}

.header-user:hover {
  background: #f4f9f5;
}

.header-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #f5a623, #e8911a);
  color: #ffffff;
  font-size: var(--fs-md);
  font-weight: var(--fw-bold);
  flex-shrink: 0;
}

.header-user-info {
  margin-left: 10px;
  text-align: left;
}

.header-user-name {
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
  color: #172b3a;
  line-height: var(--lh-tight);
}

.header-user-role {
  margin-top: 2px;
  font-size: var(--fs-xs);
  font-weight: var(--fw-regular);
  color: #7c898f;
  line-height: var(--lh-tight);
}

/* =========================================================
   SIDEBAR
========================================================= */

.app-drawer {
  background: #ffffff;
  color: #33434b;
}

.drawer-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* =========================================================
   SIDEBAR BRAND
========================================================= */

.sidebar-brand {
  display: flex;
  align-items: center;
  padding: 20px 16px 16px;
  border-bottom: 1px solid #e6eee8;
}

.sidebar-logo {
  width: 50px;
  height: 50px;
  object-fit: contain;
  flex-shrink: 0;
}

.sidebar-brand-text {
  margin-left: 10px;
  min-width: 0;
}

.sidebar-title {
  font-size: var(--fs-md);
  font-weight: var(--fw-bold);
  color: #172b3a;
  line-height: var(--lh-tight);
}

.sidebar-subtitle {
  margin-top: 3px;
  font-size: var(--fs-xs);
  font-weight: var(--fw-regular);
  color: #73818a;
}

/* =========================================================
   NAVIGATION
========================================================= */

.navigation-scroll {
  flex: 1;
}

.navigation {
  padding: 5px 13px 20px;
}

.nav-section {
  padding: 17px 12px 8px;
  font-size: var(--fs-xs);
  font-weight: var(--fw-bold);
  letter-spacing: var(--ls-caps);
  text-transform: uppercase;
  color: #6b7a82;
}

.nav-item {
  min-height: 33px;
  margin: 0;
  padding: 0 10px;
  font-size: var(--fs-base);
  font-weight: var(--fw-medium);
  border-radius: 10px;
  color: #282828;
  transition: all 0.18s ease;
}

.nav-item:hover {
  background: #fdf6ee;
  color: #d4880f;
}

.nav-item :deep(.q-item__section--avatar) {
  min-width: 40px;
  color: #668087;
}

.nav-item-active {
  background: linear-gradient(90deg, #f5a623 0%, #e8911a 100%) !important;
  color: #ffffff !important;
  font-weight: var(--fw-semibold);
  box-shadow: 0 5px 12px rgba(232, 145, 26, 0.25);
}

.nav-item-active :deep(.q-item__section--avatar) {
  color: #ffffff !important;
}

/* Disabled items (phase 2 or route not registered yet) */
.nav-item.q-item--disabled:hover,
.nav-item.disabled:hover {
  background: transparent;
  color: #282828;
}

.nav-soon {
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  padding: 2px 8px;
  border-radius: 8px;
}

/* =========================================================
   SIDEBAR FOOTER
========================================================= */

.sidebar-footer {
  padding: 14px 14px 16px;
  background: linear-gradient(180deg, #ffffff 0%, #fdf6ee 100%);
}

.sidebar-signout {
  width: 100%;
  margin-top: 8px;
  font-size: var(--fs-base);
  font-weight: var(--fw-medium);
  min-height: 42px;
  border-radius: 10px;
  color: #65757b;
  justify-content: flex-start;
}

.sidebar-signout:hover {
  background: #f7eeee;
  color: #c62828;
}

.sidebar-signout .q-icon {
  margin-right: 12px;
}

.sidebar-credit {
  padding-top: 12px;
  text-align: center;
  font-size: var(--fs-xs);
  font-weight: var(--fw-regular);
  color: #8a958f;
}

/* =========================================================
   PAGE CONTAINER
========================================================= */

.page-container {
  min-height: calc(100vh - 72px);
  min-height: calc(100dvh - 72px);
  background: #f8f9fa;
}

/* =========================================================
   RESPONSIVE - TABLET
========================================================= */

@media (max-width: 900px) {
  .app-toolbar {
    min-height: 64px;
    padding: 6px 14px;
    gap: 8px;
  }

  .header-user-info {
    display: none;
  }

  .header-avatar {
    width: 36px;
    height: 36px;
    font-size: var(--fs-base);
  }

  .page-container {
    min-height: calc(100vh - 64px);
    min-height: calc(100dvh - 64px);
  }
}

/* =========================================================
   RESPONSIVE - MOBILE
========================================================= */

@media (max-width: 600px) {
  .app-toolbar {
    padding: 4px 8px;
    gap: 6px;
    flex-wrap: wrap;
  }

  .menu-btn {
    margin-right: 0;
  }

  .office-name {
    line-height: var(--lh-tight);
  }

  .header-avatar {
    width: 32px;
    height: 32px;
    font-size: var(--fs-sm);
  }

  .notification-btn {
    margin-right: 0;
  }
}

/* =========================================================
   RESPONSIVE - EXTRA SMALL
========================================================= */

@media (max-width: 400px) {
  .app-toolbar {
    padding: 4px 6px;
    gap: 4px;
  }

  .office-name {
    font-size: var(--fs-sm);
  }

  .header-user {
    padding: 2px 4px;
    min-height: 36px;
  }

  .header-avatar {
    width: 28px;
    height: 28px;
    font-size: var(--fs-xs);
  }
}
</style>
