<template>
  <q-page class="forbidden-page">
    <div class="forbidden-card">
      <q-icon name="block" size="64px" color="negative" />
      <h1>403 — Access Denied</h1>
      <p>You don't have permission to view this page.</p>
      <q-btn
        unelevated
        no-caps
        color="primary"
        label="Back to Dashboard"
        @click="goHome"
      />
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "stores/authStore";

export default defineComponent({
  name: "ForbiddenPage",

  setup() {
    const router = useRouter();
    const auth = useAuthStore();

    function goHome() {
      if (auth.isAuthenticated) {
        router.push({ name: "dashboard" });
      } else {
        router.push({ name: "login" });
      }
    }

    return { goHome };
  },
});
</script>

<style scoped>
.forbidden-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 40px 20px;
}

.forbidden-card {
  text-align: center;
  max-width: 420px;
}

.forbidden-card h1 {
  margin: 16px 0 8px;
  font-size: 22px;
  color: #19354a;
}

.forbidden-card p {
  margin: 0 0 24px;
  color: #718089;
  font-size: 14px;
}
</style>
