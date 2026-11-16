<template>
  <div class="login-page">
    <div class="login-overlay" role="presentation" aria-hidden="true"></div>

    <q-card class="login-card" flat>
      <!-- =========================================================
           DESKTOP LAYOUT
      ========================================================== -->
      <div class="desktop-layout row no-wrap">
        <!-- Left Panel - Branding -->
        <div class="col-7 desktop-branding">
          <div class="branding-content">
            <h1 class="brand-title">
              Rewards and Recognitions Management System
            </h1>

            <img
              src="/image/CityHallAnimated.png"
              alt="City Hall Animated"
              class="brand-image"
              loading="lazy"
              width="600"
              height="400"
            />
          </div>
        </div>

        <!-- Right Panel - Login Form -->
        <div class="col-5 login-panel">
          <div class="login-form-container">
            <h2 class="login-title">Login to your account</h2>

            <!-- Error Message -->
            <q-banner
              v-if="errorMessage"
              dense
              rounded
              class="bg-red-2 text-red-9 q-mb-md"
            >
              <template v-slot:avatar>
                <q-icon name="error" />
              </template>

              {{ errorMessage }}
            </q-banner>

            <q-form
              ref="loginFormRef"
              @submit.prevent="handleLogin"
              class="login-form"
              autocomplete="on"
            >
              <!-- Username -->
              <q-input
                v-model.trim="credentials.username"
                dense
                outlined
                label="Username"
                type="text"
                lazy-rules
                :rules="usernameRules"
                class="q-mb-md"
                autocomplete="username"
                name="username"
                :disable="isLoading"
              >
                <template v-slot:prepend>
                  <q-icon name="person" size="20px" />
                </template>
              </q-input>

              <!-- Password -->
              <q-input
                v-model="credentials.password"
                dense
                outlined
                label="Password"
                :type="passwordFieldType"
                lazy-rules
                :rules="passwordRules"
                class="q-mb-lg"
                autocomplete="current-password"
                name="password"
                :disable="isLoading"
              >
                <template v-slot:prepend>
                  <q-icon name="lock" size="20px" />
                </template>

                <template v-slot:append>
                  <q-icon
                    :name="passwordVisibilityIcon"
                    class="cursor-pointer"
                    @click="togglePasswordVisibility"
                    size="20px"
                    role="button"
                    tabindex="0"
                    :aria-label="
                      isPasswordVisible ? 'Hide password' : 'Show password'
                    "
                    @keydown.enter="togglePasswordVisibility"
                    @keydown.space.prevent="togglePasswordVisibility"
                  />
                </template>
              </q-input>

              <!-- Login Button -->
              <q-btn
                type="submit"
                color="orange-9"
                label="Sign In"
                icon="login"
                class="full-width"
                :loading="isLoading"
                :disable="isLoading"
                rounded
                unelevated
                size="md"
              />

              <!-- Footer -->
              <div class="footer-text">
                <span class="text-caption">
                  Developed by CICTMO - SPM Section
                </span>

                <span class="text-caption q-mt-sm">
                  <q-icon name="info" size="14px" class="q-mr-xs" />
                  v{{ appVersion }}
                </span>
              </div>
            </q-form>
          </div>
        </div>
      </div>

      <!-- =========================================================
           MOBILE LAYOUT
      ========================================================== -->
      <div class="mobile-layout">
        <!-- Mobile Header -->
        <div class="mobile-header">
          <img
            src="/image/CityHallAnimated.png"
            alt="City Hall Animated"
            class="mobile-brand-image"
            loading="lazy"
            width="300"
            height="200"
          />
        </div>

        <!-- Mobile Login Panel -->
        <div class="mobile-login-panel">
          <h2 class="mobile-login-title">
            Recognition and Reward<br />
            Management System
          </h2>

          <p class="mobile-login-subtitle">Login to your account</p>

          <!-- Error Message -->
          <q-banner
            v-if="errorMessage"
            dense
            rounded
            class="bg-red-2 text-red-9 q-mb-md"
          >
            <template v-slot:avatar>
              <q-icon name="error" />
            </template>

            {{ errorMessage }}
          </q-banner>

          <q-form
            ref="mobileLoginFormRef"
            @submit.prevent="handleLogin"
            class="login-form"
            autocomplete="on"
          >
            <!-- Username -->
            <q-input
              v-model.trim="credentials.username"
              dense
              outlined
              label="Username"
              type="text"
              lazy-rules
              :rules="usernameRules"
              class="q-mb-md"
              autocomplete="username"
              name="username"
              :disable="isLoading"
            >
              <template v-slot:prepend>
                <q-icon name="person" size="20px" />
              </template>
            </q-input>

            <!-- Password -->
            <q-input
              v-model="credentials.password"
              dense
              outlined
              label="Password"
              :type="passwordFieldType"
              lazy-rules
              :rules="passwordRules"
              class="q-mb-lg"
              autocomplete="current-password"
              name="password"
              :disable="isLoading"
            >
              <template v-slot:prepend>
                <q-icon name="lock" size="20px" />
              </template>

              <template v-slot:append>
                <q-icon
                  :name="passwordVisibilityIcon"
                  class="cursor-pointer"
                  @click="togglePasswordVisibility"
                  size="20px"
                  role="button"
                  tabindex="0"
                  :aria-label="
                    isPasswordVisible ? 'Hide password' : 'Show password'
                  "
                  @keydown.enter="togglePasswordVisibility"
                  @keydown.space.prevent="togglePasswordVisibility"
                />
              </template>
            </q-input>

            <!-- Login Button -->
            <q-btn
              type="submit"
              color="orange-9"
              label="Sign In"
              icon="login"
              class="full-width"
              :loading="isLoading"
              :disable="isLoading"
              rounded
              unelevated
              size="md"
            />

            <!-- Footer -->
            <div class="footer-text">
              <span class="text-caption">
                Developed by CICTMO - SPM Division
              </span>

              <span class="text-caption q-mt-sm">
                <q-icon name="info" size="14px" class="q-mr-xs" />
                v{{ appVersion }}
              </span>
            </div>
          </q-form>
        </div>
      </div>
    </q-card>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "stores/authStore";
import { Notify } from "quasar";

export default {
  name: "LoginPage",

  setup() {
    const router = useRouter();
    const route = useRoute();
    const authStore = useAuthStore();

    // ============================================================
    // STATE
    // ============================================================

    const credentials = ref({
      username: "",
      password: "",
    });

    const isPasswordVisible = ref(false);
    const errorMessage = ref("");
    const loginFormRef = ref(null);
    const mobileLoginFormRef = ref(null);
    const redirecting = ref(false);

    // ============================================================
    // CONSTANTS
    // ============================================================

    const appVersion = "1.0.0.1";

    // ============================================================
    // COMPUTED
    // ============================================================

    const isLoading = computed(() => authStore.isLoading);

    const passwordFieldType = computed(() =>
      isPasswordVisible.value ? "text" : "password"
    );

    const passwordVisibilityIcon = computed(() =>
      isPasswordVisible.value ? "visibility_off" : "visibility"
    );

    // ============================================================
    // VALIDATION RULES
    // ============================================================

    const usernameRules = [
      (val) => (val && val.length > 0) || "Username is required",
      (val) =>
        (val && val.length >= 3) || "Username must be at least 3 characters",
    ];

    const passwordRules = [
      (val) => (val && val.length > 0) || "Password is required",
      (val) =>
        (val && val.length >= 8) || "Password must be at least 8 characters",
    ];

    // ============================================================
    // PASSWORD VISIBILITY
    // ============================================================

    const togglePasswordVisibility = () => {
      isPasswordVisible.value = !isPasswordVisible.value;
    };

    // ============================================================
    // FORM VALIDATION
    // ============================================================

    const validateForms = async () => {
      const isMobile = window.innerWidth <= 768;

      if (isMobile) {
        if (!mobileLoginFormRef.value) return true;
        return await mobileLoginFormRef.value.validate();
      }

      if (!loginFormRef.value) return true;
      return await loginFormRef.value.validate();
    };

    // ============================================================
    // NAVIGATION
    // ============================================================

    const navigateToDashboard = async () => {
      try {
        await router.push({ name: "dashboard" });
        return true;
      } catch {
        try {
          await router.push("/admin/dashboard");
          return true;
        } catch {
          window.location.href = "/admin/dashboard";
          return true;
        }
      }
    };

    // ============================================================
    // LOGIN
    // ============================================================

    const handleLogin = async () => {
      if (isLoading.value || redirecting.value) return;

      errorMessage.value = "";

      const isValid = await validateForms();
      if (!isValid) return;

      try {
        const result = await authStore.login({
          username: credentials.value.username,
          password: credentials.value.password,
        });

        if (result.success) {
          const hasUser = localStorage.getItem("authUser");
          const hasToken = localStorage.getItem("authToken");

          if (!hasUser || !hasToken) {
            errorMessage.value =
              "Login successful but user data is missing. Please try again.";
            return;
          }

          Notify.create({
            message: `Login successful`,
            type: "positive",
            position: "top",
            timeout: 2000,
            icon: "check_circle",
          });

          redirecting.value = true;
          await navigateToDashboard();
          return;
        }

        errorMessage.value = result.message || "Invalid username or password.";

        Notify.create({
          message: errorMessage.value,
          type: "negative",
          position: "top",
          timeout: 3000,
        });
      } catch {
        errorMessage.value = "An unexpected error occurred. Please try again.";

        Notify.create({
          message: errorMessage.value,
          type: "negative",
          position: "top",
          timeout: 3000,
        });
      }
    };

    // ============================================================
    // LIFECYCLE
    // ============================================================

    onMounted(() => {
      if (route.query.session === "expired") {
        errorMessage.value =
          route.query.message ||
          "Your session has expired. Please log in again.";
      }

      // If already authenticated, go straight to dashboard.
      // (The router guard also handles this — this is a safety net.)
      if (authStore.isAuthenticated) {
        navigateToDashboard();
        return;
      }

      if (authStore.hasStoredUserData && !authStore.isAuthenticated) {
        authStore.initialize();

        if (authStore.isAuthenticated) {
          navigateToDashboard();
        }
      }
    });

    // ============================================================
    // RETURN
    // ============================================================

    return {
      // State
      credentials,
      errorMessage,
      isLoading,
      loginFormRef,
      mobileLoginFormRef,
      redirecting,
      isPasswordVisible,

      // Computed
      passwordFieldType,
      passwordVisibilityIcon,

      // Constants
      appVersion,

      // Validation
      usernameRules,
      passwordRules,

      // Methods
      togglePasswordVisibility,
      handleLogin,
    };
  },
};
</script>

<style scoped>
/* ============================================================
   BASE STYLES
============================================================ */

.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  position: relative;
  padding: 20px;
}

/* ============================================================
   BACKGROUND
============================================================ */

.login-overlay {
  position: fixed;
  inset: 0;

  background-image: url("/image/Bg.png");
  background-size: cover;
  background-position: center;
  background-attachment: fixed;

  z-index: 0;
  will-change: transform;
}

/* ============================================================
   LOGIN CARD
============================================================ */

.login-card {
  position: relative;
  z-index: 1;

  max-width: 900px;
  width: 100%;

  border-radius: 24px;
  overflow: hidden;

  background: white;

  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

/* ============================================================
   DESKTOP LAYOUT
============================================================ */

.desktop-layout {
  display: flex;
  justify-content: space-between;
  min-height: 500px;
}

/* ============================================================
   BRANDING PANEL
============================================================ */

.desktop-branding {
  display: flex;
  align-items: center;
  justify-content: center;

  background: white;
  padding: 24px;

  border-top-left-radius: 24px;
  border-bottom-left-radius: 24px;
}

.branding-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: 100%;
  min-height: 400px;
}

.brand-title {
  font-size: 1.5rem;
  font-weight: 700;

  text-align: center;
  color: #6c757d;

  margin: 16px 0;
  width: 60%;
  line-height: 1.3;
}

.brand-image {
  width: 100%;
  height: 100%;
  max-height: 600px;

  object-fit: contain;
  display: block;
}

/* ============================================================
   LOGIN PANEL
============================================================ */

.login-panel {
  display: flex;
  align-items: center;
  justify-content: center;

  background: linear-gradient(135deg, #f4c16e 25%, #f5a623 75%);

  border-radius: 0 24px 24px 0;
  padding: 40px;
}

.login-form-container {
  width: 100%;
  max-width: 350px;
}

.login-title {
  font-weight: 700;
  color: #495057;

  text-align: center;
  margin-bottom: 24px;

  font-size: 1.25rem;
}

.login-form {
  width: 100%;
}

/* ============================================================
   FOOTER
============================================================ */

.footer-text {
  display: flex;
  flex-direction: column;
  align-items: center;

  gap: 4px;
  margin-top: 16px;

  color: white;
}

.footer-text .text-caption {
  opacity: 0.9;
  font-size: 0.75rem;
}

/* ============================================================
   MOBILE LAYOUT
============================================================ */

.mobile-layout {
  display: none;
}

.mobile-header {
  background: white;
  padding: 16px;

  border-top-left-radius: 24px;
  border-top-right-radius: 24px;

  display: flex;
  align-items: center;
  justify-content: center;

  min-height: 200px;
}

.mobile-brand-image {
  width: 100%;
  max-height: 200px;

  object-fit: contain;
  display: block;
}

.mobile-login-panel {
  background: linear-gradient(135deg, #f4c16e 25%, #f5a623 75%);

  padding: 32px 24px;

  border-bottom-left-radius: 24px;
  border-bottom-right-radius: 24px;

  min-height: 400px;
}

.mobile-login-title {
  font-weight: 700;
  text-align: center;
  color: #495057;

  font-size: 1.25rem;

  margin: 0 0 8px 0;
  line-height: 1.3;
}

.mobile-login-subtitle {
  font-weight: 600;
  text-align: center;
  color: #495057;

  margin: 0 0 20px 0;
  font-size: 1rem;
}

/* ============================================================
   RESPONSIVE DESIGN
============================================================ */

@media (max-width: 768px) {
  .desktop-layout {
    display: none;
  }

  .mobile-layout {
    display: block;
  }

  .login-card {
    max-width: 100%;
    width: 95%;
  }

  .brand-title {
    width: 80%;
    font-size: 1.25rem;
  }

  .login-form-container {
    padding: 0;
  }
}

/* ============================================================
   SMALL MOBILE
============================================================ */

@media (max-width: 480px) {
  .login-page {
    padding: 10px;
  }

  .login-card {
    width: 100%;
    border-radius: 24px;
  }

  .mobile-header {
    min-height: 150px;
    padding: 12px;
  }

  .mobile-brand-image {
    max-height: 150px;
  }

  .mobile-login-panel {
    padding: 24px;
    min-height: 300px;
  }

  .mobile-login-title {
    font-size: 1.1rem;
  }

  .mobile-login-subtitle {
    font-size: 0.9rem;
  }
}

/* ============================================================
   ACCESSIBILITY
============================================================ */

@media (prefers-reduced-motion: reduce) {
  .login-overlay {
    background-attachment: scroll;
  }
}

/* ============================================================
   HIGH CONTRAST
============================================================ */

@media (prefers-contrast: high) {
  .login-panel,
  .mobile-login-panel {
    background: #2d8f3e;
  }
}

/* ============================================================
   PRINT
============================================================ */

@media print {
  .login-overlay {
    display: none;
  }

  .login-card {
    box-shadow: none;
    border: 1px solid #ddd;
  }
}
</style>
