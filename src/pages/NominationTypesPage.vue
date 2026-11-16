<template>
  <q-page class="module-page">
    <!-- =====================================================
         PAGE HEADER
    ====================================================== -->
    <section class="page-header">
      <div class="page-header-text">
        <h6 class="page-title">Nomination Types</h6>
        <p class="page-subtitle">
          Open or close each nomination type. Only open types appear in the
          Create Nomination form.
        </p>
      </div>

      <div class="page-header-actions">
        <q-btn
          flat
          no-caps
          icon="refresh"
          label="Refresh"
          class="clear-btn"
          :loading="store.loading"
          @click="reload"
        />
      </div>
    </section>

    <!-- =====================================================
         MAIN CARD
    ====================================================== -->
    <q-card flat class="types-card">
      <!-- Loading -->
      <div v-if="store.loading && !store.all.length" class="state-box">
        <q-spinner-dots color="primary" size="42px" />
        <div class="state-text">Loading nomination types…</div>
      </div>

      <!-- Empty -->
      <div v-else-if="!store.all.length" class="table-empty">
        <q-icon name="inbox" size="34px" />
        <div>No nomination types found.</div>
        <div class="table-empty-hint">
          Run
          <code>php artisan db:seed --class=NominationTypeSeeder</code>
          to populate them.
        </div>
      </div>

      <!-- Panel -->
      <div v-else class="permission-panel">
        <!-- Table head -->
        <div class="permission-table-head">
          <div>Type</div>
          <div>Status</div>
          <div>Availability</div>
        </div>

        <!-- One section per category -->
        <template v-for="group in store.allGrouped" :key="group.key">
          <!-- Category header -->
          <div class="category-header">
            <div class="category-title">{{ group.label }}</div>
            <div class="category-count">
              {{ openCount(group) }} / {{ group.items.length }} open
            </div>
          </div>

          <!-- Type rows -->
          <div
            v-for="t in group.items"
            :key="t.id"
            class="permission-row"
            :class="{ 'permission-row--off': !t.is_active }"
          >
            <!-- Type name + meta -->
            <div class="type-cell">
              <div class="type-name">
                {{ t.label }}
                <!-- <span v-if="t.old_name" class="type-old">
                  ({{ t.old_name }})
                </span> -->
              </div>
              <!-- <div class="type-meta">
                <code class="type-code">{{ t.code }}</code>
                <span v-if="t.form" class="type-form">Form {{ t.form }}</span>
              </div> -->
            </div>

            <!-- Status pill -->
            <div class="permission-action">
              <span
                class="status-pill"
                :class="t.is_active ? 'status-pill--on' : 'status-pill--off'"
              >
                {{ t.is_active ? "Open" : "Closed" }}
              </span>
            </div>

            <!-- Toggle -->
            <div class="permission-action">
              <q-toggle
                :model-value="t.is_active"
                color="positive"
                :disable="savingId === t.id"
                @update:model-value="(val) => confirmToggle(t, val)"
              />
            </div>
          </div>
        </template>
      </div>
    </q-card>

    <!-- =====================================================
         CONFIRMATION DIALOG
    ====================================================== -->
    <q-dialog v-model="confirmDialog" persistent>
      <q-card class="confirmation-dialog">
        <div
          class="confirmation-icon"
          :class="pendingToggle?.next ? 'is-open' : 'is-close'"
        >
          <q-icon
            :name="pendingToggle?.next ? 'lock_open' : 'lock'"
            size="25px"
          />
        </div>

        <div class="confirmation-title">
          {{ pendingToggle?.next ? "Open this type?" : "Close this type?" }}
        </div>

        <div class="confirmation-message">
          <template v-if="pendingToggle?.next">
            <strong>{{ pendingToggle?.type?.label }}</strong>
            will become available in the Create Nomination form.
          </template>
          <template v-else>
            <strong>{{ pendingToggle?.type?.label }}</strong>
            will be hidden from the Create Nomination form.
            <span class="confirmation-warning">
              Existing nominations are not affected.
            </span>
          </template>
        </div>

        <div class="confirmation-actions">
          <q-btn
            flat
            no-caps
            label="Cancel"
            class="dialog-cancel-btn"
            :disable="savingId !== null"
            @click="cancelToggle"
          />
          <q-btn
            unelevated
            no-caps
            :label="pendingToggle?.next ? 'Open Type' : 'Close Type'"
            :class="
              pendingToggle?.next
                ? 'dialog-confirm-btn is-primary'
                : 'dialog-confirm-btn is-danger'
            "
            :loading="savingId !== null"
            @click="applyToggle"
          />
        </div>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from "vue";
import { Notify } from "quasar";
import { useNominationTypeStore } from "src/stores/nominationTypeStore";

export default defineComponent({
  name: "NominationTypesPage",

  setup() {
    const store = useNominationTypeStore();

    // id of the type currently being saved (blocks other toggles)
    const savingId = ref(null);

    // confirmation dialog state
    const confirmDialog = ref(false);
    const pendingToggle = ref(null); // { type, next }

    // ---------- lifecycle ----------
    async function reload() {
      await store.fetchAll();
    }

    onMounted(reload);

    // ---------- helpers ----------
    function openCount(group) {
      return group.items.filter((t) => t.is_active).length;
    }

    // ---------- toggle flow ----------
    // Step 1: user flips the switch → open the confirmation dialog
    function confirmToggle(type, next) {
      pendingToggle.value = { type, next };
      confirmDialog.value = true;
    }

    function cancelToggle() {
      if (savingId.value !== null) return;
      confirmDialog.value = false;
      pendingToggle.value = null;
    }

    // Step 2: user confirms → actually call the API
    async function applyToggle() {
      if (!pendingToggle.value) return;

      const { type, next } = pendingToggle.value;
      savingId.value = type.id;

      try {
        const result = await store.setActive(type.id, next);

        Notify.create({
          type: result.success ? "positive" : "negative",
          message: result.message,
          position: "top",
          timeout: 2200,
          icon: result.success
            ? next
              ? "lock_open"
              : "lock"
            : "error_outline",
        });

        if (result.success) {
          confirmDialog.value = false;
          pendingToggle.value = null;
        }
      } finally {
        savingId.value = null;
      }
    }

    return {
      store,

      // saving / dialog
      savingId,
      confirmDialog,
      pendingToggle,

      // actions
      reload,
      openCount,
      confirmToggle,
      cancelToggle,
      applyToggle,
    };
  },
});
</script>

<style scoped>
/* =========================================================
   PAGE
========================================================= */
.module-page {
  min-height: 100%;
  padding: clamp(12px, 2.5vw, 20px);
  color: #19354a;
}

/* =========================================================
   HEADER
   Mobile: stacked (title on top, Refresh below, full-width).
   >= 800px: title on the left, Refresh pinned to the top-right.
========================================================= */
.page-header {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
  margin-bottom: 18px;
}

.page-header-text {
  min-width: 0;
}

.page-header-actions {
  display: flex;
  align-items: stretch;
  gap: 8px;
}

.page-header-actions .clear-btn {
  flex: 1;
  justify-content: center;
}

.page-title {
  margin: 5px 0 4px;
  color: #19354a;
  font-size: var(--fs-xl);
  font-weight: var(--fw-bold);
  line-height: var(--lh-tight);
}

.page-subtitle {
  margin: 0;
  max-width: 60ch;
  color: #718089;
  font-size: var(--fs-base);
  line-height: var(--lh-normal);
}

.clear-btn {
  min-height: 44px;
  padding: 0 16px;
  border-radius: 8px;
  color: #708088;
  font-size: var(--fs-base);
  font-weight: var(--fw-medium);
}

/* =========================================================
   CARD + STATE
========================================================= */
.types-card {
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 3px 12px rgba(30, 70, 42, 0.055);
}

.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 20px;
  color: #7d8c93;
  font-size: var(--fs-base);
}

.state-text {
  color: #7d8c93;
  font-size: var(--fs-base);
}

.table-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 50px 20px;
  color: #7d8c93;
  font-size: var(--fs-base);
  text-align: center;
}

.table-empty-hint {
  margin-top: 4px;
  font-size: var(--fs-sm);
  color: #97a1a9;
}

.table-empty-hint code {
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 12px;
  padding: 1px 6px;
  border-radius: 4px;
  background: #f3f6f5;
  color: #52646f;
}

/* =========================================================
   PERMISSION PANEL — same structure as RolePage
========================================================= */
.permission-panel {
  overflow: hidden;
  border: 1px solid #edf1ef;
  background: #ffffff;
}

.permission-table-head,
.permission-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 110px 110px;
}

.permission-table-head {
  min-height: 42px;
  align-items: center;
  border-bottom: 1px solid #edf1ef;
  background: #fcfdfc;
  color: #6f8087;
  font-size: var(--fs-xs);
  font-weight: var(--fw-bold);
  letter-spacing: var(--ls-caps);
  text-transform: uppercase;
}

.permission-table-head > div {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
}

.permission-table-head > div:first-child {
  justify-content: flex-start;
  padding-left: 16px;
}

/* =========================================================
   CATEGORY HEADER
========================================================= */
.category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px 8px;
  background: #f5f8f6;
  border-bottom: 1px solid #e6eee8;
}

.category-title {
  color: #405967;
  font-size: var(--fs-xs);
  font-weight: var(--fw-bold);
  letter-spacing: var(--ls-caps);
  text-transform: uppercase;
}

.category-count {
  color: #7d8c93;
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  font-variant-numeric: tabular-nums;
}

/* =========================================================
   TYPE ROW
========================================================= */
.permission-row {
  min-height: 56px;
  align-items: stretch;
  border-bottom: 1px solid #f3f5f4;
  transition: background 0.12s ease;
}

.permission-row:last-child {
  border-bottom: 0;
}

.permission-row--off {
  background: #fdfdfd;
}

.permission-row--off .type-name {
  color: #8a958f;
}

.type-cell {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 10px 16px;
  min-width: 0;
}

.type-name {
  color: #19354a;
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
  line-height: var(--lh-tight);
  overflow-wrap: anywhere;
}

.type-old {
  color: #8a958f;
  font-size: var(--fs-xs);
  font-weight: var(--fw-regular);
}

.type-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-top: 3px;
}

.type-code {
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  font-size: 11px;
  color: #52646f;
  background: #f3f6f5;
  padding: 1px 6px;
  border-radius: 4px;
}

.type-form {
  font-size: 10.5px;
  font-weight: var(--fw-semibold);
  color: #8a958f;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

/* =========================================================
   ACTION CELLS
========================================================= */
.permission-action {
  display: flex;
  align-items: center;
  justify-content: center;
  border-left: 1px solid #f3f5f4;
}

/* =========================================================
   STATUS PILL
========================================================= */
.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  line-height: var(--lh-tight);
  letter-spacing: 0.3px;
  text-transform: uppercase;
  white-space: nowrap;
}

.status-pill--on {
  color: #47734f;
  background: #e9f5eb;
}

.status-pill--off {
  color: #8a6a6a;
  background: #fbe9e9;
}

/* =========================================================
   CONFIRMATION DIALOG
========================================================= */
.confirmation-dialog {
  width: 400px;
  max-width: 92vw;
  padding: 28px 25px 22px;
  text-align: center;
}

.confirmation-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  margin: 0 auto 15px;
  border-radius: 50%;
}

.confirmation-icon.is-open {
  color: #0c9145;
  background: #e1f7e6;
}

.confirmation-icon.is-close {
  color: #c73f3f;
  background: #fbe9e9;
}

.confirmation-title {
  color: #19354a;
  font-size: var(--fs-xl);
  font-weight: var(--fw-bold);
  line-height: var(--lh-tight);
}

.confirmation-message {
  margin-top: 9px;
  color: #718089;
  font-size: var(--fs-base);
  line-height: var(--lh-relaxed);
  overflow-wrap: anywhere;
}

.confirmation-message strong {
  color: #405967;
  font-weight: var(--fw-semibold);
}

.confirmation-warning {
  display: block;
  margin-top: 4px;
  color: #8a6a6a;
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
}

.confirmation-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 22px;
}

.dialog-cancel-btn {
  min-height: 36px;
  color: #708088;
  font-size: var(--fs-base);
  font-weight: var(--fw-medium);
}

.dialog-confirm-btn {
  min-height: 36px;
  padding: 0 18px;
  color: #ffffff;
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
}

.dialog-confirm-btn.is-primary {
  background: linear-gradient(135deg, #f5a623, #e8911a);
}

.dialog-confirm-btn.is-danger {
  background: #d64545;
}

/* =========================================================
   >= 800px  (tablet landscape and up)
   Header becomes a row with the title on the left and the
   Refresh button pinned to the top-right.
========================================================= */
@media (min-width: 800px) {
  .page-header {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
  }

  .page-header-actions {
    flex-shrink: 0;
    align-items: center;
  }

  .page-header-actions .clear-btn {
    flex: 0 0 auto;
    justify-content: flex-start;
    min-height: 40px;
  }
}

/* =========================================================
   RESPONSIVE — mobile tweaks
========================================================= */
@media (max-width: 650px) {
  .module-page {
    padding: 14px;
  }

  .permission-table-head,
  .permission-row {
    grid-template-columns: minmax(0, 1fr) 90px 70px;
  }

  .permission-table-head > div {
    font-size: 10px;
  }

  .type-cell {
    padding: 10px 12px;
  }

  .type-name {
    font-size: var(--fs-sm);
  }

  .confirmation-dialog {
    padding: 24px 20px 18px;
  }

  .confirmation-actions {
    flex-direction: column-reverse;
  }

  .confirmation-actions .q-btn {
    width: 100%;
  }
}

/* =========================================================
   Hover only on real pointers
========================================================= */
@media (hover: hover) and (pointer: fine) {
  .permission-row:hover {
    background: #fefaf5;
  }

  .permission-row--off:hover {
    background: #fdf8f2;
  }

  .clear-btn:hover {
    background: #f7f8f9;
  }
}
</style>
