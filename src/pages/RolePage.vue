<template>
  <q-page class="module-page">
    <!-- PAGE HEADER -->
    <section class="page-header">
      <div>
        <h6 class="page-title">Role Management</h6>
        <p class="page-subtitle">Manage roles and their permission sets.</p>
      </div>

      <q-btn
        unelevated
        no-caps
        icon="add"
        label="Add Role"
        class="add-role-btn"
        @click="openCreateDialog"
      />
    </section>

    <!-- ROLE TABLE -->
    <q-card flat class="roles-card">
      <div class="filter-section">
        <q-input
          v-model="search"
          outlined
          dense
          clearable
          placeholder="Search by role name..."
          class="search-input"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-btn
          flat
          no-caps
          icon="filter_alt_off"
          label="Clear"
          class="clear-btn"
          :disable="!search"
          @click="search = ''"
        />
      </div>

      <div class="table-wrapper">
        <q-table
          flat
          :rows="filteredRoles"
          :columns="columns"
          row-key="id"
          :rows-per-page-options="[5, 10, 20]"
          :pagination="{ rowsPerPage: 10 }"
          class="roles-table"
          :loading="store.rolesLoading"
        >
          <template #body-cell-role="props">
            <q-td :props="props">
              <div class="role-name">{{ formatRole(props.row.name) }}</div>
            </q-td>
          </template>

          <template #body-cell-users="props">
            <q-td :props="props">
              <span class="user-count">
                <q-icon name="people" size="16px" />
                {{ props.row.user_count ?? 0 }}
              </span>
            </q-td>
          </template>

          <template #body-cell-permissions="props">
            <q-td :props="props">
              <span class="perm-count">
                {{ getPermissionNames(props.row).length }} granted
              </span>
            </q-td>
          </template>

          <template #body-cell-actions="props">
            <q-td :props="props" class="actions-cell">
              <q-btn
                flat
                round
                dense
                icon="visibility"
                color="grey-7"
                size="sm"
                @click="viewRole(props.row)"
              >
                <q-tooltip>View</q-tooltip>
              </q-btn>

              <q-btn
                flat
                round
                dense
                icon="edit"
                color="primary"
                size="sm"
                @click="openEditDialog(props.row)"
              >
                <q-tooltip>Edit Permissions</q-tooltip>
              </q-btn>

              <q-btn
                v-if="!isSystemRole(props.row.name)"
                flat
                round
                dense
                icon="delete"
                color="negative"
                size="sm"
                :disable="(props.row.user_count ?? 0) > 0"
                @click="confirmDelete(props.row)"
              >
                <q-tooltip>
                  {{
                    (props.row.user_count ?? 0) > 0
                      ? "Cannot delete — role is in use"
                      : "Delete Role"
                  }}
                </q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <template #no-data>
            <div class="table-empty">
              <q-icon name="badge" size="34px" />
              <div>No roles found.</div>
            </div>
          </template>
        </q-table>
      </div>
    </q-card>

    <!-- CREATE ROLE -->
    <q-dialog v-model="createDialog" persistent>
      <q-card class="role-dialog">
        <div class="dialog-header">
          <div>
            <div class="dialog-title">New Role</div>
            <div class="dialog-subtitle">
              Give the role a name and configure its permissions.
            </div>
          </div>

          <q-btn
            flat
            round
            dense
            icon="close"
            :disable="saving"
            @click="closeCreateDialog"
          />
        </div>

        <q-separator />

        <q-form @submit.prevent="submitCreate">
          <q-card-section class="dialog-content">
            <q-input
              v-model="form.name"
              outlined
              dense
              label="Role name *"
              placeholder="e.g. Awards Officer"
              class="form-field"
              :disable="saving"
              :rules="[
                (val) => !!val || 'Role name is required',
                (val) => (val && val.length <= 100) || 'Name is too long',
                (val) =>
                  /^[a-zA-Z0-9_ ]+$/.test(val) ||
                  'Only letters, numbers, spaces, and underscore',
              ]"
            >
              <template #prepend>
                <q-icon name="badge" />
              </template>
            </q-input>

            <div class="permission-heading">
              <div class="permission-title">Permissions</div>
              <div class="permission-subtitle">
                Enable only the actions this role should have access to.
              </div>
            </div>

            <div class="permission-panel">
              <div class="permission-table-head">
                <div>Module</div>
                <div>View</div>
                <div>Modify</div>
                <div>Print</div>
              </div>

              <div
                v-for="group in PERMISSION_GROUPS"
                :key="group.prefix"
                class="permission-row"
              >
                <div class="permission-module">{{ group.label }}</div>

                <template v-for="action in PERMISSION_ACTIONS" :key="action">
                  <div class="permission-action">
                    <button
                      v-if="group.actions.includes(action)"
                      type="button"
                      class="toggle"
                      :class="{
                        'toggle--on': form.permissions.includes(
                          `${group.prefix}.${action}`
                        ),
                      }"
                      :aria-label="`${action} ${group.label}`"
                      :aria-pressed="
                        form.permissions.includes(`${group.prefix}.${action}`)
                      "
                      @click="
                        toggleCreatePermission(`${group.prefix}.${action}`)
                      "
                    >
                      <span class="toggle-knob" />
                    </button>
                    <span v-else class="not-applicable">—</span>
                  </div>
                </template>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right" class="dialog-actions">
            <q-btn
              flat
              no-caps
              label="Cancel"
              class="dialog-cancel-btn"
              :disable="saving"
              @click="closeCreateDialog"
            />
            <q-btn
              unelevated
              no-caps
              label="Create Role"
              icon="add"
              type="submit"
              class="save-btn"
              :loading="saving"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- EDIT ROLE -->
    <q-dialog v-model="editDialog" persistent>
      <q-card class="role-dialog">
        <div class="dialog-header">
          <div>
            <div class="dialog-title">
              Edit Permissions — {{ formatRole(editRole?.name) }}
            </div>
            <div class="dialog-subtitle">
              Changes affect every user assigned to this role.
            </div>
          </div>

          <q-btn
            flat
            round
            dense
            icon="close"
            :disable="saving"
            @click="closeEditDialog"
          />
        </div>

        <q-separator />

        <q-form @submit.prevent="submitEdit">
          <q-card-section class="dialog-content">
            <div class="role-info">
              <div class="role-info-main">
                <q-icon name="groups" size="18px" />
                <span>
                  <strong>{{ editUserCount }}</strong>
                  user{{ editUserCount === 1 ? "" : "s" }} assigned
                </span>
              </div>
              <span class="role-info-note"
                >Changes apply immediately after saving.</span
              >
            </div>

            <div class="permission-heading">
              <div class="permission-title">Permissions</div>
              <div class="permission-subtitle">
                Toggle the actions available to this role.
              </div>
            </div>

            <div class="permission-panel">
              <div class="permission-table-head">
                <div>Module</div>
                <div>View</div>
                <div>Modify</div>
                <div>Print</div>
              </div>

              <div
                v-for="group in PERMISSION_GROUPS"
                :key="group.prefix"
                class="permission-row"
              >
                <div class="permission-module">{{ group.label }}</div>

                <template v-for="action in PERMISSION_ACTIONS" :key="action">
                  <div class="permission-action">
                    <button
                      v-if="group.actions.includes(action)"
                      type="button"
                      class="toggle"
                      :class="{
                        'toggle--on': editPermissions.includes(
                          `${group.prefix}.${action}`
                        ),
                      }"
                      :aria-label="`${action} ${group.label}`"
                      :aria-pressed="
                        editPermissions.includes(`${group.prefix}.${action}`)
                      "
                      @click="toggleEditPermission(`${group.prefix}.${action}`)"
                    >
                      <span class="toggle-knob" />
                    </button>
                    <span v-else class="not-applicable">—</span>
                  </div>
                </template>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right" class="dialog-actions">
            <q-btn
              flat
              no-caps
              label="Cancel"
              class="dialog-cancel-btn"
              :disable="saving"
              @click="closeEditDialog"
            />
            <q-btn
              unelevated
              no-caps
              label="Save Permissions"
              icon="save"
              type="submit"
              class="save-btn"
              :loading="saving"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- VIEW ROLE -->
    <q-dialog v-model="viewDialog">
      <q-card class="role-dialog">
        <div class="dialog-header">
          <div>
            <div class="dialog-title">{{ formatRole(viewRoleName) }}</div>
            <div class="dialog-subtitle">
              {{ viewUserCount }} user{{ viewUserCount === 1 ? "" : "s" }} ·
              {{ viewPermissions.length }} permission{{
                viewPermissions.length === 1 ? "" : "s"
              }}
              granted
            </div>
          </div>

          <q-btn flat round dense icon="close" @click="viewDialog = false" />
        </div>

        <q-separator />

        <q-card-section class="dialog-content">
          <div class="view-summary">
            <div>
              <span class="summary-label">Role</span>
              <strong>{{ formatRole(viewRoleName) }}</strong>
            </div>
            <div>
              <span class="summary-label">Assigned users</span>
              <strong>{{ viewUserCount }}</strong>
            </div>
            <div>
              <span class="summary-label">Permissions</span>
              <strong>{{ viewPermissions.length }}</strong>
            </div>
          </div>

          <div class="permission-heading">
            <div class="permission-title">Permissions</div>
            <div class="permission-subtitle">
              Current permissions for this role.
            </div>
          </div>

          <div class="permission-panel permission-panel--readonly">
            <div class="permission-table-head">
              <div>Module</div>
              <div>View</div>
              <div>Modify</div>
              <div>Print</div>
            </div>

            <div
              v-for="group in PERMISSION_GROUPS"
              :key="group.prefix"
              class="permission-row"
            >
              <div class="permission-module">{{ group.label }}</div>

              <template v-for="action in PERMISSION_ACTIONS" :key="action">
                <div class="permission-action">
                  <button
                    v-if="group.actions.includes(action)"
                    type="button"
                    class="toggle toggle--readonly"
                    :class="{
                      'toggle--on': viewPermissions.includes(
                        `${group.prefix}.${action}`
                      ),
                    }"
                    :aria-pressed="
                      viewPermissions.includes(`${group.prefix}.${action}`)
                    "
                    disabled
                  >
                    <span class="toggle-knob" />
                  </button>
                  <span v-else class="not-applicable">—</span>
                </div>
              </template>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="dialog-actions">
          <q-btn
            flat
            no-caps
            label="Close"
            class="dialog-cancel-btn"
            @click="viewDialog = false"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- DELETE -->
    <q-dialog v-model="deleteDialog">
      <q-card class="confirmation-dialog">
        <div class="confirmation-icon delete-confirm-icon">
          <q-icon name="delete_forever" size="26px" />
        </div>

        <div class="confirmation-title">Delete Role?</div>

        <div class="confirmation-message">
          Are you sure you want to permanently delete
          <strong>{{ formatRole(deleteRole?.name) }}</strong
          >?
          <span class="delete-warning">This action cannot be undone.</span>
        </div>

        <div class="confirmation-actions">
          <q-btn
            flat
            no-caps
            label="Cancel"
            class="dialog-cancel-btn"
            @click="deleteDialog = false"
          />
          <q-btn
            unelevated
            no-caps
            label="Delete Role"
            class="danger-btn"
            :loading="saving"
            @click="submitDelete"
          />
        </div>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, computed, ref, onMounted } from "vue";
import { Notify } from "quasar";
import { useUserStore } from "src/stores/userStore";

const PERMISSION_ACTIONS = ["view", "modify", "print"];

// ─────────────────────────────────────────────────────────────
// MUST match the permission prefixes seeded in
// database/seeders/RoleAndUserSeeder.php
//
// Removed (obsolete):
//   award.*        → replaced by national_award.* and praise_award.*
//   loyalty.*      → replaced by loyalty_retiree.*
//   retirement.*   → folded into loyalty_retiree.*
//
// Added:
//   national_award.*, praise_award.*, customized_reward.*,
//   loyalty_retiree.*, role.*
// ─────────────────────────────────────────────────────────────
const PERMISSION_GROUPS = [
  { label: "Dashboard", prefix: "dashboard", actions: ["view"] },
  {
    label: "My Nominations",
    prefix: "nomination",
    actions: ["view", "modify", "print"],
  },
  {
    label: "Review Queue",
    prefix: "review",
    actions: ["view", "modify", "print"],
  },
  {
    label: "Announcements",
    prefix: "announcement",
    actions: ["view", "modify", "print"],
  },
  {
    label: "Exam Passers",
    prefix: "exam",
    actions: ["view", "modify", "print"],
  },
  {
    label: "Graduate Studies",
    prefix: "graduate",
    actions: ["view", "modify", "print"],
  },
  {
    label: "National Awards",
    prefix: "national_award",
    actions: ["view", "modify", "print"],
  },
  {
    label: "Local PRAISE Awards",
    prefix: "praise_award",
    actions: ["view", "modify", "print"],
  },
  {
    label: "Customized Rewards and Incentives",
    prefix: "customized_reward",
    actions: ["view", "modify", "print"],
  },
  {
    label: "Loyalty and Retirees",
    prefix: "loyalty_retiree",
    actions: ["view", "modify", "print"],
  },
  {
    label: "Incentives",
    prefix: "incentive",
    actions: ["view", "modify", "print"],
  },
  {
    label: "Reports",
    prefix: "report",
    actions: ["view", "modify", "print"],
  },
  {
    label: "User Management",
    prefix: "user",
    actions: ["view", "modify", "print"],
  },
  {
    label: "Role Management",
    prefix: "role",
    actions: ["view", "modify", "print"],
  },
];

const SYSTEM_ROLES = ["hr_admin", "office_admin"];

export default defineComponent({
  name: "RolesPage",

  setup() {
    const store = useUserStore();

    const search = ref("");

    const createDialog = ref(false);
    const editDialog = ref(false);
    const viewDialog = ref(false);
    const deleteDialog = ref(false);

    const saving = ref(false);

    const form = ref({
      name: "",
      permissions: [],
    });

    // ── EDIT state — whole role object so we can send its .id
    const editRole = ref(null);
    const editUserCount = ref(0);
    const editPermissions = ref([]);

    // ── VIEW state
    const viewRoleName = ref("");
    const viewUserCount = ref(0);
    const viewPermissions = ref([]);

    // ── DELETE state — whole role object so we can send its .id
    const deleteRole = ref(null);

    const columns = [
      {
        name: "role",
        label: "Role",
        field: "name",
        align: "left",
        sortable: true,
      },
      {
        name: "users",
        label: "Users",
        field: "user_count",
        align: "left",
        sortable: true,
      },
      {
        name: "permissions",
        label: "Permissions",
        field: "permissions",
        align: "left",
      },
      {
        name: "actions",
        label: "Actions",
        field: "actions",
        align: "right",
      },
    ];

    const filteredRoles = computed(() => {
      const keyword = search.value.toLowerCase().trim();
      const list = store.roles || [];

      if (!keyword) return list;

      return list.filter((role) => role.name?.toLowerCase().includes(keyword));
    });

    function formatRole(role) {
      if (!role) return "";

      return role
        .split("_")
        .map((word) =>
          word.length <= 3
            ? word.toUpperCase()
            : word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join(" ");
    }

    function isSystemRole(name) {
      return SYSTEM_ROLES.includes(name);
    }

    function getPermissionNames(role) {
      return (role?.permissions || [])
        .map((permission) =>
          typeof permission === "string" ? permission : permission.name
        )
        .filter(Boolean);
    }

    function applyToggleRule(list, permission) {
      const [prefix, action] = permission.split(".");
      const has = list.includes(permission);

      // Turning View off removes all actions for that module.
      if (action === "view") {
        if (has) {
          return list.filter((item) => !item.startsWith(`${prefix}.`));
        }

        return [...list, permission];
      }

      // Turning Modify/Print off only removes that action.
      if (has) {
        return list.filter((item) => item !== permission);
      }

      // Modify/Print require View.
      const viewPermission = `${prefix}.view`;

      return list.includes(viewPermission)
        ? [...list, permission]
        : [...list, viewPermission, permission];
    }

    function toggleCreatePermission(permission) {
      form.value.permissions = applyToggleRule(
        form.value.permissions,
        permission
      );
    }

    function toggleEditPermission(permission) {
      editPermissions.value = applyToggleRule(
        editPermissions.value,
        permission
      );
    }

    // ─────────────────────────────────────────────
    // CREATE
    // ─────────────────────────────────────────────
    function openCreateDialog() {
      form.value = {
        name: "",
        permissions: [],
      };
      createDialog.value = true;
    }

    function closeCreateDialog() {
      if (saving.value) return;
      createDialog.value = false;
    }

    async function submitCreate() {
      const name = form.value.name.trim();

      if (!name) {
        Notify.create({
          type: "negative",
          message: "Role name is required.",
        });
        return;
      }

      if (!form.value.permissions.length) {
        Notify.create({
          type: "negative",
          message: "Select at least one permission.",
        });
        return;
      }

      saving.value = true;

      try {
        const result = await store.createRole({
          name,
          permissions: form.value.permissions,
        });

        if (!result.success) {
          Notify.create({
            type: "negative",
            message: result.message,
          });
          return;
        }

        Notify.create({
          type: "positive",
          message: `Role "${name}" created.`,
        });

        closeCreateDialog();
        // Store already refetched roles.
      } finally {
        saving.value = false;
      }
    }

    // ─────────────────────────────────────────────
    // EDIT
    // ─────────────────────────────────────────────
    function openEditDialog(role) {
      editRole.value = role;
      editUserCount.value = role.user_count ?? 0;
      editPermissions.value = getPermissionNames(role);
      editDialog.value = true;
    }

    function closeEditDialog() {
      if (saving.value) return;
      editDialog.value = false;
    }

    async function submitEdit() {
      if (!editRole.value) return;

      if (!editPermissions.value.length) {
        Notify.create({
          type: "negative",
          message: "Select at least one permission.",
        });
        return;
      }

      saving.value = true;

      try {
        const result = await store.updateRolePermissions(
          editRole.value.id,
          editPermissions.value
        );

        if (!result.success) {
          Notify.create({
            type: "negative",
            message: result.message,
          });
          return;
        }

        Notify.create({
          type: "positive",
          message: `Permissions updated for "${formatRole(
            editRole.value.name
          )}".`,
        });

        closeEditDialog();
        editRole.value = null;
        // Store already refetched roles.
      } finally {
        saving.value = false;
      }
    }

    // ─────────────────────────────────────────────
    // VIEW
    // ─────────────────────────────────────────────
    function viewRole(role) {
      viewRoleName.value = role.name;
      viewUserCount.value = role.user_count ?? 0;
      viewPermissions.value = getPermissionNames(role);
      viewDialog.value = true;
    }

    // ─────────────────────────────────────────────
    // DELETE
    // ─────────────────────────────────────────────
    function confirmDelete(role) {
      if (isSystemRole(role.name)) return;
      if ((role.user_count ?? 0) > 0) return;

      deleteRole.value = role;
      deleteDialog.value = true;
    }

    async function submitDelete() {
      if (!deleteRole.value) return;

      saving.value = true;

      try {
        const result = await store.deleteRole(deleteRole.value.id);

        if (!result.success) {
          Notify.create({
            type: "negative",
            message: result.message,
          });
          return;
        }

        Notify.create({
          type: "positive",
          message: `Role "${formatRole(deleteRole.value.name)}" deleted.`,
        });

        deleteDialog.value = false;
        deleteRole.value = null;
        // Store already refetched roles.
      } finally {
        saving.value = false;
      }
    }

    onMounted(async () => {
      await store.fetchRoles();
    });

    return {
      store,
      PERMISSION_GROUPS,
      PERMISSION_ACTIONS,
      columns,
      search,
      filteredRoles,
      createDialog,
      editDialog,
      viewDialog,
      deleteDialog,
      saving,
      form,

      // Edit
      editRole,
      editUserCount,
      editPermissions,

      // View
      viewRoleName,
      viewUserCount,
      viewPermissions,

      // Delete
      deleteRole,

      formatRole,
      isSystemRole,
      getPermissionNames,
      openCreateDialog,
      closeCreateDialog,
      submitCreate,
      openEditDialog,
      closeEditDialog,
      submitEdit,
      viewRole,
      confirmDelete,
      submitDelete,
      toggleCreatePermission,
      toggleEditPermission,
    };
  },
});
</script>

<style scoped>
.module-page {
  min-height: 100%;
  padding: 20px;
  color: #19354a;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
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
  color: #718089;
  font-size: var(--fs-base);
  line-height: var(--lh-normal);
}

/* =========================================================
   BUTTONS
========================================================= */
.add-role-btn,
.save-btn,
.danger-btn {
  min-height: 34px;
  padding: 0 16px;
  color: #ffffff;
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
}

.add-role-btn {
  background: #e8911a;
}

.save-btn {
  background: #f5a623;
}

.danger-btn {
  background: #d64545;
}

.dialog-cancel-btn,
.clear-btn {
  color: #708088;
  font-size: var(--fs-base);
  font-weight: var(--fw-medium);
}

/* =========================================================
   CARD + FILTER
========================================================= */
.roles-card {
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 3px 12px rgba(30, 70, 42, 0.055);
}

.filter-section {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 20px;
  border-top: 1px solid #edf1ef;
  border-bottom: 1px solid #edf1ef;
  background: #fcfdfc;
}

.search-input {
  flex: 1;
  max-width: 380px;
}

.search-input :deep(.q-field__control) {
  min-height: 38px;
}

/* =========================================================
   TABLE
========================================================= */
.table-wrapper {
  padding: 0 12px;
  overflow-x: auto;
}

.roles-table {
  box-shadow: none;
  min-width: 620px;
}

.roles-table :deep(th) {
  height: 48px;
  color: #6f8087;
  background: #ffffff;
  font-size: var(--fs-xs);
  font-weight: var(--fw-bold);
  letter-spacing: var(--ls-caps);
}

.roles-table :deep(td) {
  height: 64px;
  color: #425b68;
  border-color: #edf1ef;
  font-size: var(--fs-base);
}

.roles-table :deep(tbody tr:hover) {
  background: #fefaf5;
}

.roles-table :deep(.q-table__bottom) {
  border-top: 1px solid #edf1ef;
  padding: 8px 12px;
  color: #6f8087;
  font-size: var(--fs-sm);
}

.actions-cell {
  white-space: nowrap;
}
.actions-cell .q-btn {
  margin-left: 1px;
}

/* =========================================================
   ROW CONTENT
========================================================= */
.role-name {
  color: #19354a;
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
  line-height: var(--lh-tight);
}

.user-count {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #425b68;
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
  font-variant-numeric: tabular-nums;
}

.perm-count {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 20px;
  color: #47734f;
  background: #e9f5eb;
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  line-height: var(--lh-tight);
  font-variant-numeric: tabular-nums;
}

.table-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 35px 0;
  color: #7d8c93;
  font-size: var(--fs-base);
}

/* =========================================================
   DIALOG SHELL
========================================================= */
.role-dialog {
  width: 720px;
  max-width: 94vw;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 17px 20px;
}

.dialog-title {
  color: #19354a;
  font-size: var(--fs-xl);
  font-weight: var(--fw-bold);
  line-height: var(--lh-tight);
}

.dialog-subtitle {
  margin-top: 4px;
  color: #7d8c93;
  font-size: var(--fs-sm);
  line-height: var(--lh-normal);
}

.dialog-content {
  max-height: 72vh;
  overflow-y: auto;
  padding: 20px;
}

.dialog-actions {
  gap: 8px;
  padding: 12px 18px;
}

/* =========================================================
   FORM
========================================================= */
.form-field {
  margin-bottom: 12px;
}

.form-field :deep(.q-field__control) {
  min-height: 42px;
}

/* =========================================================
   PERMISSIONS
========================================================= */
.permission-heading {
  margin: 4px 0 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid #edf1ef;
}

.permission-title {
  color: #405967;
  font-size: var(--fs-xs);
  font-weight: var(--fw-bold);
  letter-spacing: var(--ls-caps);
  text-transform: uppercase;
}

.permission-subtitle {
  margin-top: 3px;
  color: #7d8c93;
  font-size: var(--fs-sm);
  line-height: var(--lh-normal);
}

.role-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  padding: 11px 12px;
  background: #edf7fa;
}

.role-info-main {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #356c82;
  font-size: var(--fs-base);
  line-height: var(--lh-normal);
}

.role-info-main strong {
  font-weight: var(--fw-bold);
}

.role-info-note {
  color: #6f8087;
  font-size: var(--fs-sm);
  line-height: var(--lh-normal);
}

.permission-panel {
  overflow: hidden;
  border: 1px solid #edf1ef;
  background: #ffffff;
}

.permission-panel--readonly {
  background: #fcfdfc;
  border-color: #e6eee8;
}

.permission-table-head,
.permission-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 90px 90px 90px;
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
  padding-left: 14px;
}

.permission-row {
  min-height: 48px;
  align-items: stretch;
  border-bottom: 1px solid #f3f5f4;
}

.permission-row:last-child {
  border-bottom: 0;
}

.permission-module {
  display: flex;
  align-items: center;
  padding: 0 14px;
  color: #405967;
  font-size: var(--fs-base);
  font-weight: var(--fw-medium);
  line-height: var(--lh-normal);
}

.permission-action {
  display: flex;
  align-items: center;
  justify-content: center;
  border-left: 1px solid #f3f5f4;
}

/* =========================================================
   TOGGLE
========================================================= */
.toggle {
  position: relative;
  width: 40px;
  height: 22px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: #c9d1ce;
  cursor: pointer;
  transition: background 0.15s ease;
}

.toggle:hover {
  background: #bcc5c1;
}

.toggle--on,
.toggle--on:hover {
  background: #f5a623;
}

.toggle:focus-visible {
  outline: 2px solid #e8911a;
  outline-offset: 2px;
}

.toggle:disabled {
  cursor: default;
  opacity: 1;
}

.toggle-knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.14);
  transition: transform 0.15s ease;
}

.toggle--on .toggle-knob {
  transform: translateX(18px);
}

.toggle--readonly {
  cursor: default;
}

.not-applicable {
  color: #b7c0bb;
  font-size: var(--fs-base);
}

/* =========================================================
   VIEW SUMMARY
========================================================= */
.view-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 16px;
  padding: 14px 16px;
  background: #fcf8f2;
  border: 1px solid #f4eadb;
  border-radius: 8px;
}

.summary-label {
  display: block;
  margin-bottom: 5px;
  color: #7d8c93;
  font-size: var(--fs-xs);
  font-weight: var(--fw-bold);
  letter-spacing: var(--ls-caps);
  text-transform: uppercase;
}

.view-summary strong {
  display: block;
  color: #19354a;
  font-size: var(--fs-lg);
  font-weight: var(--fw-bold);
  line-height: var(--lh-tight);
  font-variant-numeric: tabular-nums;
  word-break: break-word;
}

/* =========================================================
   DELETE CONFIRMATION
========================================================= */
.confirmation-dialog {
  width: 390px;
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

.delete-confirm-icon {
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
}

.confirmation-message strong {
  color: #405967;
  font-weight: var(--fw-semibold);
}

.delete-warning {
  display: block;
  margin-top: 2px;
  color: #c73f3f;
  font-weight: var(--fw-semibold);
}

.confirmation-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 22px;
}

/* =========================================================
   RESPONSIVE
========================================================= */
@media (max-width: 800px) {
  .filter-section {
    flex-wrap: wrap;
  }

  .search-input {
    max-width: none;
    width: 100%;
  }
}

@media (max-width: 650px) {
  .module-page {
    padding: 14px;
  }

  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .add-role-btn {
    width: 100%;
  }

  .roles-table {
    min-width: 560px;
  }

  .actions-cell .q-btn {
    width: 36px;
    height: 36px;
  }

  .form-field :deep(.q-field__native),
  .search-input :deep(.q-field__native) {
    font-size: 16px;
  }

  .form-field :deep(.q-field__control) {
    min-height: 46px;
  }

  .save-btn,
  .danger-btn {
    min-height: 40px;
  }

  .role-dialog {
    width: 96vw;
  }

  .dialog-header {
    padding: 14px 16px;
  }

  .dialog-content {
    padding: 16px;
  }

  .view-summary {
    grid-template-columns: 1fr;
  }

  .permission-panel {
    overflow-x: auto;
  }

  .permission-table-head,
  .permission-row {
    min-width: 520px;
  }

  .role-info {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
