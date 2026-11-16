<template>
  <q-page class="module-page">
    <!-- =====================================================
         PAGE HEADER
    ====================================================== -->
    <section class="page-header">
      <div>
        <h6>User Management</h6>
        <p>Manage system users and their access roles.</p>
      </div>

      <div class="header-actions">
        <q-btn
          unelevated
          no-caps
          icon="person_add"
          label="Add User"
          class="add-user-btn"
          @click="openCreateUser"
        />
      </div>
    </section>

    <!-- =====================================================
         USERS CARD
    ====================================================== -->
    <q-card flat class="users-card">
      <!-- FILTERS -->
      <div class="filter-section">
        <q-input
          v-model="search"
          outlined
          dense
          clearable
          placeholder="Search by name, username, office..."
          class="search-input"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-select
          v-model="statusFilter"
          outlined
          dense
          emit-value
          map-options
          :options="statusOptions"
          label="Status"
          class="status-filter"
          clearable
        />

        <q-btn
          flat
          no-caps
          icon="filter_alt_off"
          label="Clear"
          class="clear-btn"
          @click="clearFilters"
        />
      </div>

      <!-- TABLE -->
      <div class="table-wrapper">
        <q-table
          flat
          :rows="filteredUsers"
          :columns="columns"
          row-key="id"
          :rows-per-page-options="[5, 10, 20, 50]"
          :pagination="{ rowsPerPage: 5 }"
          class="users-table"
          :loading="store.loading"
        >
          <template #body-cell-no="props">
            <q-td :props="props">{{ props.rowIndex + 1 }}</q-td>
          </template>

          <template #body-cell-user="props">
            <q-td :props="props">
              <div class="user-name">{{ props.row.name }}</div>
              <div class="user-meta">{{ props.row.username }}</div>
            </q-td>
          </template>

          <template #body-cell-office="props">
            <q-td :props="props">
              <div class="office-name">
                {{ props.row.office || "No Office Assigned" }}
              </div>
            </q-td>
          </template>

          <template #body-cell-role="props">
            <q-td :props="props">
              <span class="role-badge" :class="roleClass(props.row.role)">
                {{ formatRole(props.row.role) || "No Role" }}
              </span>
            </q-td>
          </template>

          <template #body-cell-status="props">
            <q-td :props="props">
              <span class="status-badge" :class="statusClass(props.row.status)">
                <span class="status-dot"></span>
                {{ props.row.status }}
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
                @click="viewUser(props.row)"
              >
                <q-tooltip>View User</q-tooltip>
              </q-btn>

              <q-btn
                flat
                round
                dense
                icon="edit"
                color="primary"
                size="sm"
                @click="editUser(props.row)"
              >
                <q-tooltip>Edit User</q-tooltip>
              </q-btn>

              <q-btn
                flat
                round
                dense
                icon="lock_reset"
                color="orange"
                size="sm"
                @click="openResetPassword(props.row)"
              >
                <q-tooltip>Reset Password</q-tooltip>
              </q-btn>

              <q-btn
                flat
                round
                dense
                :icon="props.row.is_active ? 'person_off' : 'person'"
                :color="props.row.is_active ? 'negative' : 'positive'"
                size="sm"
                @click="confirmToggleStatus(props.row)"
              >
                <q-tooltip>{{
                  props.row.is_active ? "Deactivate User" : "Activate User"
                }}</q-tooltip>
              </q-btn>

              <q-btn
                flat
                round
                dense
                icon="delete"
                color="negative"
                size="sm"
                @click="confirmDelete(props.row)"
              >
                <q-tooltip>Delete User</q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <template #no-data>
            <div class="table-empty">
              <q-icon name="group" size="34px" />
              <div>No users found.</div>
            </div>
          </template>
        </q-table>
      </div>
    </q-card>

    <!-- =====================================================
         CREATE USER DIALOG
    ====================================================== -->
    <q-dialog v-model="createDialog" persistent>
      <q-card class="user-dialog create-dialog">
        <div class="dialog-header">
          <div>
            <div class="dialog-title">Add User</div>
            <div class="dialog-subtitle">Create a new RRS user account</div>
          </div>

          <q-btn
            flat
            round
            dense
            icon="close"
            :disable="createLoading"
            @click="closeCreateDialog"
          />
        </div>

        <!-- STEPPER -->
        <div class="create-stepper">
          <div
            class="step-item"
            :class="{
              active: createTab === 'employee',
              done: !!createForm.employee,
            }"
            @click="createTab = 'employee'"
          >
            <div class="step-circle">
              <q-icon v-if="createForm.employee" name="check" size="14px" />
              <span v-else>1</span>
            </div>
            <div class="step-text">
              <div class="step-title">Employee</div>
              <div class="step-sub">Select office &amp; employee</div>
            </div>
          </div>

          <div class="step-divider" />

          <div
            class="step-item"
            :class="{ active: createTab === 'account' }"
            @click="createForm.employee && (createTab = 'account')"
          >
            <div class="step-circle">2</div>
            <div class="step-text">
              <div class="step-title">Account &amp; Role</div>
              <div class="step-sub">Credentials &amp; role</div>
            </div>
          </div>
        </div>

        <q-separator />

        <q-form ref="createFormRef" @submit.prevent="createUser">
          <q-tab-panels
            v-model="createTab"
            animated
            swipeable
            class="create-tab-panels"
          >
            <!-- ══════════ TAB 1: EMPLOYEE SELECTION ══════════ -->
            <q-tab-panel name="employee" class="create-tab-panel">
              <div class="create-info-box">
                <q-icon name="info" size="18px" />
                <span>
                  Select the employee from PMIS. The employee's Control No.,
                  name, position, and office are retrieved automatically.
                </span>
              </div>

              <q-select
                v-model="createForm.office"
                outlined
                dense
                clearable
                use-input
                input-debounce="300"
                label="Office"
                class="form-field"
                :options="officeOptions"
                option-label="office_name"
                option-value="office_name"
                emit-value
                map-options
                :loading="store.officesLoading"
                :disable="createLoading"
                @update:model-value="onOfficeChange"
              >
                <template #prepend><q-icon name="business" /></template>
                <template #no-option>
                  <q-item>
                    <q-item-section class="text-grey"
                      >No offices found</q-item-section
                    >
                  </q-item>
                </template>
              </q-select>

              <q-input
                v-model="employeeSearch"
                outlined
                dense
                clearable
                placeholder="Search employee by name, position, control no..."
                class="form-field"
                :disable="!createForm.office"
              >
                <template #prepend><q-icon name="search" /></template>
              </q-input>

              <div class="employee-table-wrapper">
                <div class="employee-table-header">
                  <span>Employees</span>
                  <span class="employee-count"
                    >{{ filteredEmployees.length }} found</span
                  >
                </div>

                <q-table
                  flat
                  dense
                  :rows="filteredEmployees"
                  :columns="employeeColumns"
                  row-key="ControlNo"
                  :rows-per-page-options="[5, 10, 20]"
                  :pagination="{ rowsPerPage: 5 }"
                  :loading="store.employeesLoading"
                  class="employee-table"
                  :selected="createForm.employee ? [createForm.employee] : []"
                  selection="single"
                  @update:selected="
                    (val) => onEmployeeChange(val.length ? val[0] : null)
                  "
                >
                  <template #no-data>
                    <div class="table-empty small">
                      <q-icon name="group" size="28px" />
                      <div>
                        {{
                          createForm.office
                            ? employeeSearch
                              ? "No employees match your search."
                              : "No employees found for this office."
                            : "Select an office to load employees."
                        }}
                      </div>
                    </div>
                  </template>
                </q-table>
              </div>
            </q-tab-panel>

            <!-- ══════════ TAB 2: ACCOUNT & ROLE (2-COLUMN) ══════════ -->
            <q-tab-panel name="account" class="create-tab-panel">
              <div v-if="createForm.employee" class="tab2-employee-banner">
                <q-icon name="badge" size="18px" />
                <div class="tab2-employee-text">
                  <div class="tab2-employee-name">
                    {{ createForm.employee.full_name }}
                  </div>
                  <div class="tab2-employee-meta">
                    {{ createForm.employee.Office }}
                  </div>
                </div>
              </div>

              <div class="step2-grid">
                <!-- ══════ LEFT: LOGIN CREDENTIALS ══════ -->
                <div class="step2-column">
                  <div class="form-section-title">
                    <q-icon name="key" size="12px" />
                    <span>Login Credentials</span>
                  </div>

                  <q-input
                    v-model="createForm.username"
                    outlined
                    dense
                    label="Username"
                    placeholder="Enter username"
                    class="form-field"
                    :disable="createLoading"
                    hint="Auto-filled from Control No. You may change it."
                    :rules="[
                      (val) => !!val || 'Username is required',
                      (val) =>
                        (val && val.length >= 3) ||
                        'Username must be at least 3 characters',
                      (val) =>
                        (val && val.length <= 50) ||
                        'Username must not exceed 50 characters',
                    ]"
                  >
                    <template #prepend
                      ><q-icon name="person_outline"
                    /></template>
                  </q-input>

                  <q-input
                    v-model="createForm.password"
                    outlined
                    dense
                    :type="showCreatePassword ? 'text' : 'password'"
                    label="Password"
                    placeholder="Enter password"
                    class="form-field"
                    :disable="createLoading"
                    :rules="[
                      (val) => !!val || 'Password is required',
                      (val) =>
                        (val && val.length >= 8) ||
                        'Password must be at least 8 characters',
                    ]"
                  >
                    <template #prepend><q-icon name="lock" /></template>
                    <template #append>
                      <q-btn
                        flat
                        round
                        dense
                        :icon="
                          showCreatePassword ? 'visibility_off' : 'visibility'
                        "
                        @click="showCreatePassword = !showCreatePassword"
                      />
                    </template>
                  </q-input>

                  <q-input
                    v-model="createForm.password_confirmation"
                    outlined
                    dense
                    :type="showCreateConfirmPassword ? 'text' : 'password'"
                    label="Confirm Password"
                    placeholder="Confirm password"
                    class="form-field"
                    :disable="createLoading"
                    :rules="[
                      (val) => !!val || 'Please confirm the password',
                      (val) =>
                        val === createForm.password || 'Passwords do not match',
                    ]"
                  >
                    <template #prepend><q-icon name="lock_outline" /></template>
                    <template #append>
                      <q-btn
                        flat
                        round
                        dense
                        :icon="
                          showCreateConfirmPassword
                            ? 'visibility_off'
                            : 'visibility'
                        "
                        @click="
                          showCreateConfirmPassword = !showCreateConfirmPassword
                        "
                      />
                    </template>
                  </q-input>

                  <div class="create-info-box create-info-box--soft">
                    <q-icon name="info" size="16px" />
                    <span>
                      Default password is <strong>{{ DEFAULT_PASSWORD }}</strong
                      >. The user should change it after their first login.
                    </span>
                  </div>
                </div>

                <!-- ══════ RIGHT: ROLE ══════ -->
                <div class="step2-column">
                  <div class="form-section-title">
                    <q-icon name="admin_panel_settings" size="12px" />
                    <span>Role</span>
                  </div>

                  <q-select
                    v-model="createForm.role"
                    outlined
                    dense
                    emit-value
                    map-options
                    clearable
                    label="Select a role *"
                    class="form-field"
                    :options="roleOptions"
                    :disable="createLoading"
                    :rules="[(val) => !!val || 'Role is required']"
                  >
                    <template #prepend><q-icon name="badge" /></template>
                    <template #no-option>
                      <q-item>
                        <q-item-section class="text-grey"
                          >No roles available</q-item-section
                        >
                      </q-item>
                    </template>
                  </q-select>
                </div>
              </div>
            </q-tab-panel>
          </q-tab-panels>

          <q-separator />

          <q-card-actions align="right" class="create-actions">
            <q-btn
              flat
              no-caps
              label="Cancel"
              class="dialog-cancel-btn"
              :disable="createLoading"
              @click="closeCreateDialog"
            />

            <q-btn
              v-if="createTab === 'employee'"
              unelevated
              no-caps
              label="Next"
              icon-right="arrow_forward"
              class="save-btn"
              :disable="!createForm.employee"
              @click="goToAccountTab"
            />

            <q-btn
              v-else
              unelevated
              no-caps
              label="Create User"
              icon="person_add"
              type="submit"
              class="save-btn"
              :loading="createLoading"
              :disable="!createForm.employee"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- =====================================================
         VIEW USER DIALOG
    ====================================================== -->
    <q-dialog v-model="viewDialog">
      <q-card class="user-dialog view-dialog">
        <div class="dialog-header">
          <div>
            <div class="dialog-title">User Details</div>
            <div class="dialog-subtitle">View account information</div>
          </div>

          <q-btn flat round dense icon="close" @click="viewDialog = false" />
        </div>

        <q-separator />

        <q-card-section>
          <div v-if="selectedUser" class="details-container">
            <!-- PROFILE HEADER -->
            <div class="profile-section">
              <div class="profile-main">
                <div class="profile-avatar">
                  <q-icon name="person" size="25px" />
                </div>
                <div class="profile-text">
                  <div class="profile-name">{{ selectedUser.name }}</div>
                  <div class="profile-username">
                    @{{ selectedUser.username }}
                  </div>
                </div>
              </div>

              <span
                class="status-badge"
                :class="statusClass(selectedUser.status)"
              >
                <span class="status-dot"></span>
                {{ selectedUser.status }}
              </span>
            </div>

            <!-- EMPLOYEE INFORMATION -->
            <div class="detail-group">
              <div class="form-section-title">
                <q-icon name="badge" size="12px" />
                <span>Employee Information</span>
              </div>

              <div class="details-grid">
                <div class="detail-item">
                  <div class="detail-label">Control No.</div>
                  <div class="detail-value">
                    {{ selectedUser.ControlNo || "—" }}
                  </div>
                </div>

                <div class="detail-item">
                  <div class="detail-label">Position</div>
                  <div class="detail-value">
                    {{ selectedUser.position || "—" }}
                  </div>
                </div>

                <div class="detail-item full">
                  <div class="detail-label">Office</div>
                  <div class="detail-value">
                    {{ selectedUser.office || "No Office Assigned" }}
                  </div>
                </div>
              </div>
            </div>

            <!-- ACCOUNT -->
            <div class="detail-group">
              <div class="form-section-title">
                <q-icon name="key" size="12px" />
                <span>Account</span>
              </div>

              <div class="details-grid">
                <div class="detail-item">
                  <div class="detail-label">Username</div>
                  <div class="detail-value">{{ selectedUser.username }}</div>
                </div>

                <div class="detail-item">
                  <div class="detail-label">Role</div>
                  <div class="detail-value">
                    <span
                      class="role-badge"
                      :class="roleClass(selectedUser.role)"
                    >
                      {{ formatRole(selectedUser.role) || "No Role" }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- RECORD -->
            <div class="detail-group detail-group--last">
              <div class="form-section-title">
                <q-icon name="history" size="12px" />
                <span>Record</span>
              </div>

              <div class="details-grid">
                <div class="detail-item">
                  <div class="detail-label">Created</div>
                  <div class="detail-value">
                    {{ formatDate(selectedUser.created_at) }}
                  </div>
                </div>

                <div class="detail-item">
                  <div class="detail-label">Last Updated</div>
                  <div class="detail-value">
                    {{ formatDate(selectedUser.updated_at) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
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

    <!-- =====================================================
         EDIT USER DIALOG
    ====================================================== -->
    <q-dialog v-model="editDialog">
      <q-card class="user-dialog create-dialog">
        <div class="dialog-header">
          <div>
            <div class="dialog-title">Edit User</div>
            <div class="dialog-subtitle">Update account and role</div>
          </div>

          <q-btn flat round dense icon="close" @click="closeEditDialog" />
        </div>

        <q-separator />

        <q-form @submit.prevent="saveUser">
          <q-card-section>
            <div v-if="selectedUser" class="edit-user-info">
              <div class="edit-avatar">
                <q-icon name="person" size="22px" />
              </div>
              <div>
                <div class="edit-name">{{ selectedUser.name }}</div>
                <div class="edit-office">{{ selectedUser.office }}</div>
              </div>
            </div>

            <div class="step2-grid">
              <!-- LEFT: username -->
              <div class="step2-column">
                <div class="form-section-title">
                  <q-icon name="key" size="12px" />
                  <span>Login Credentials</span>
                </div>

                <q-input
                  v-model="editForm.username"
                  outlined
                  dense
                  label="Username"
                  class="form-field"
                  :rules="[
                    (val) => !!val || 'Username is required',
                    (val) =>
                      (val && val.length >= 3) ||
                      'Username must be at least 3 characters',
                  ]"
                >
                  <template #prepend><q-icon name="person_outline" /></template>
                </q-input>

                <div class="create-info-box create-info-box--soft">
                  <q-icon name="info" size="16px" />
                  <span>
                    To reset this user's password, use the
                    <strong>Reset Password</strong> action from the user list.
                  </span>
                </div>
              </div>

              <!-- RIGHT: role -->
              <div class="step2-column">
                <div class="form-section-title">
                  <q-icon name="admin_panel_settings" size="12px" />
                  <span>Role</span>
                </div>

                <q-select
                  v-model="editForm.role"
                  outlined
                  dense
                  emit-value
                  map-options
                  clearable
                  label="Select a role *"
                  class="form-field"
                  :options="roleOptions"
                  :rules="[(val) => !!val || 'Role is required']"
                >
                  <template #prepend><q-icon name="badge" /></template>
                  <template #no-option>
                    <q-item>
                      <q-item-section class="text-grey"
                        >No roles available</q-item-section
                      >
                    </q-item>
                  </template>
                </q-select>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right">
            <q-btn
              flat
              no-caps
              label="Cancel"
              class="dialog-cancel-btn"
              @click="closeEditDialog"
            />

            <q-btn
              unelevated
              no-caps
              label="Save Changes"
              type="submit"
              class="save-btn"
              :loading="actionLoading"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- =====================================================
         RESET PASSWORD DIALOG
    ====================================================== -->
    <q-dialog v-model="resetPasswordDialog">
      <q-card class="user-dialog">
        <div class="dialog-header">
          <div>
            <div class="dialog-title">Reset Password</div>
            <div class="dialog-subtitle">Set a new password for this user</div>
          </div>

          <q-btn
            flat
            round
            dense
            icon="close"
            @click="closeResetPasswordDialog"
          />
        </div>

        <q-separator />

        <q-form @submit.prevent="resetPassword">
          <q-card-section>
            <div v-if="selectedUser" class="reset-user">
              <div class="reset-avatar">
                <q-icon name="lock" size="21px" />
              </div>
              <div>
                <div class="reset-name">{{ selectedUser.name }}</div>
                <div class="reset-username">@{{ selectedUser.username }}</div>
              </div>
            </div>

            <q-input
              v-model="passwordForm.password"
              outlined
              dense
              :type="showPassword ? 'text' : 'password'"
              label="New Password"
              class="form-field"
              :rules="[
                (val) => !!val || 'Password is required',
                (val) =>
                  (val && val.length >= 8) ||
                  'Password must be at least 8 characters',
              ]"
            >
              <template #prepend><q-icon name="lock" /></template>
              <template #append>
                <q-btn
                  flat
                  round
                  dense
                  :icon="showPassword ? 'visibility_off' : 'visibility'"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>

            <q-input
              v-model="passwordForm.password_confirmation"
              outlined
              dense
              :type="showConfirmPassword ? 'text' : 'password'"
              label="Confirm Password"
              class="form-field"
              :rules="[
                (val) => !!val || 'Please confirm the password',
                (val) =>
                  val === passwordForm.password || 'Passwords do not match',
              ]"
            >
              <template #prepend><q-icon name="lock_outline" /></template>
              <template #append>
                <q-btn
                  flat
                  round
                  dense
                  :icon="showConfirmPassword ? 'visibility_off' : 'visibility'"
                  @click="showConfirmPassword = !showConfirmPassword"
                />
              </template>
            </q-input>

            <div class="warning-box">
              <q-icon name="warning" size="18px" />
              <span>
                Default reset password is <strong>{{ DEFAULT_PASSWORD }}</strong
                >. The user will be logged out of all sessions and must change
                this on next login.
              </span>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right">
            <q-btn
              flat
              no-caps
              label="Cancel"
              class="dialog-cancel-btn"
              @click="closeResetPasswordDialog"
            />

            <q-btn
              unelevated
              no-caps
              label="Reset Password"
              type="submit"
              class="reset-btn"
              :loading="actionLoading"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- =====================================================
         STATUS CONFIRMATION
    ====================================================== -->
    <q-dialog v-model="statusDialog">
      <q-card class="confirmation-dialog">
        <div class="confirmation-icon status-confirm-icon">
          <q-icon
            :name="selectedUser?.is_active ? 'person_off' : 'person'"
            size="25px"
          />
        </div>

        <div class="confirmation-title">
          {{ selectedUser?.is_active ? "Deactivate User?" : "Activate User?" }}
        </div>

        <div class="confirmation-message">
          Are you sure you want to
          <strong>{{
            selectedUser?.is_active ? "deactivate" : "activate"
          }}</strong>
          <strong>{{ selectedUser?.name }}</strong
          >?
          <template v-if="selectedUser?.is_active">
            <br />
            This user will no longer be able to log in to the system.
          </template>
        </div>

        <div class="confirmation-actions">
          <q-btn
            flat
            no-caps
            label="Cancel"
            class="dialog-cancel-btn"
            @click="statusDialog = false"
          />

          <q-btn
            unelevated
            no-caps
            :label="selectedUser?.is_active ? 'Deactivate' : 'Activate'"
            :class="selectedUser?.is_active ? 'danger-btn' : 'activate-btn'"
            :loading="actionLoading"
            @click="toggleStatus"
          />
        </div>
      </q-card>
    </q-dialog>

    <!-- =====================================================
         DELETE CONFIRMATION
    ====================================================== -->
    <q-dialog v-model="deleteDialog">
      <q-card class="confirmation-dialog">
        <div class="confirmation-icon delete-confirm-icon">
          <q-icon name="delete_forever" size="25px" />
        </div>

        <div class="confirmation-title">Delete User?</div>

        <div class="confirmation-message">
          Are you sure you want to permanently delete
          <strong>{{ selectedUser?.name }}</strong
          >?
          <br />
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
            label="Delete User"
            class="danger-btn"
            :loading="actionLoading"
            @click="deleteUser"
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

// ============================================================
// CONSTANTS
// ============================================================
const DEFAULT_PASSWORD = "password123";

export default defineComponent({
  name: "UserPage",

  setup() {
    const store = useUserStore();

    // ---------- FILTERS ----------
    const search = ref("");
    const statusFilter = ref(null);
    const statusOptions = [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
    ];

    // ---------- DIALOGS ----------
    const createDialog = ref(false);
    const viewDialog = ref(false);
    const editDialog = ref(false);
    const resetPasswordDialog = ref(false);
    const statusDialog = ref(false);
    const deleteDialog = ref(false);

    // ---------- CREATE USER STATE ----------
    const createTab = ref("employee");
    const employeeSearch = ref("");
    const selectedUser = ref(null);
    const actionLoading = ref(false);
    const createLoading = ref(false);
    const createFormRef = ref(null);

    const createForm = ref({
      office: "",
      employee: null,
      ControlNo: "",
      username: "",
      password: DEFAULT_PASSWORD,
      password_confirmation: DEFAULT_PASSWORD,
      role: null,
    });

    const showCreatePassword = ref(false);
    const showCreateConfirmPassword = ref(false);

    // ---------- PASSWORD ----------
    const showPassword = ref(false);
    const showConfirmPassword = ref(false);

    // ---------- EDIT FORM ----------
    const editForm = ref({
      username: "",
      role: null,
    });

    // ---------- RESET PASSWORD FORM ----------
    const passwordForm = ref({
      password: DEFAULT_PASSWORD,
      password_confirmation: DEFAULT_PASSWORD,
    });

    // ---------- TABLE COLUMNS ----------
    const columns = [
      { name: "no", label: "NO.", field: "id", align: "left", sortable: true },
      {
        name: "user",
        label: "USER",
        field: "name",
        align: "left",
        sortable: true,
      },
      { name: "office", label: "OFFICE", field: "office", align: "left" },
      { name: "role", label: "ROLE", field: "role", align: "left" },
      { name: "status", label: "STATUS", field: "status", align: "left" },
      { name: "actions", label: "ACTIONS", field: "actions", align: "right" },
    ];

    const employeeColumns = [
      {
        name: "full_name",
        label: "EMPLOYEE",
        field: "full_name",
        align: "left",
        sortable: true,
      },
      {
        name: "Designation",
        label: "POSITION",
        field: "Designation",
        align: "left",
      },
      {
        name: "ControlNo",
        label: "CONTROL NO.",
        field: "ControlNo",
        align: "left",
      },
    ];

    // ---------- OPTIONS ----------
    const roleOptions = computed(() =>
      store.roles.map((role) => ({
        label: formatRole(role.name),
        value: role.name,
      }))
    );

    const officeOptions = computed(() => store.offices || []);
    const employeeOptions = computed(() => store.employees || []);

    // ---------- FILTERS ----------
    const filteredEmployees = computed(() => {
      const keyword = employeeSearch.value.toLowerCase().trim();
      if (!keyword) return employeeOptions.value;

      return employeeOptions.value.filter((emp) => {
        return (
          emp.full_name?.toLowerCase().includes(keyword) ||
          emp.Designation?.toLowerCase().includes(keyword) ||
          emp.ControlNo?.toLowerCase().includes(keyword) ||
          emp.Office?.toLowerCase().includes(keyword)
        );
      });
    });

    const filteredUsers = computed(() => {
      let result = [...store.users];
      const keyword = search.value.toLowerCase().trim();

      if (keyword) {
        result = result.filter((user) => {
          return (
            user.name?.toLowerCase().includes(keyword) ||
            user.username?.toLowerCase().includes(keyword) ||
            user.office?.toLowerCase().includes(keyword) ||
            user.role?.toLowerCase().includes(keyword) ||
            user.ControlNo?.toLowerCase().includes(keyword)
          );
        });
      }

      if (statusFilter.value) {
        result = result.filter((user) => {
          if (statusFilter.value === "active") return user.is_active === true;
          if (statusFilter.value === "inactive")
            return user.is_active === false;
          return true;
        });
      }

      return result;
    });

    // ---------- OPEN CREATE USER ----------
    async function openCreateUser() {
      createForm.value = {
        office: "",
        employee: null,
        ControlNo: "",
        username: "",
        password: DEFAULT_PASSWORD,
        password_confirmation: DEFAULT_PASSWORD,
        role: null,
      };

      showCreatePassword.value = false;
      showCreateConfirmPassword.value = false;

      createTab.value = "employee";
      employeeSearch.value = "";

      store.clearEmployees();

      createDialog.value = true;

      await Promise.all([
        !store.offices.length ? store.fetchOffices() : Promise.resolve(),
        !store.roles.length ? store.fetchRoles() : Promise.resolve(),
      ]);
    }

    // ---------- OFFICE / EMPLOYEE CHANGE ----------
    async function onOfficeChange(officeName) {
      createForm.value.employee = null;
      createForm.value.ControlNo = "";
      createForm.value.username = "";
      store.clearEmployees();
      employeeSearch.value = "";

      if (!officeName) return;

      const result = await store.fetchEmployeesByOffice(officeName);

      if (!result.success) {
        Notify.create({
          type: "negative",
          message: result.message || "Unable to load employees.",
        });
      }
    }

    function onEmployeeChange(employee) {
      if (!employee) {
        createForm.value.employee = null;
        createForm.value.ControlNo = "";
        return;
      }

      createForm.value.employee = employee;
      createForm.value.ControlNo = employee.ControlNo || "";

      // Auto-fill username from Control No (still editable)
      if (employee.ControlNo) {
        createForm.value.username = employee.ControlNo;
      }
    }

    function goToAccountTab() {
      if (!createForm.value.employee) {
        Notify.create({
          type: "negative",
          message: "Please select an employee first.",
        });
        return;
      }

      createTab.value = "account";
    }

    // ---------- CREATE USER ----------
    async function createUser() {
      if (!createFormRef.value) return;

      const isValid = await createFormRef.value.validate();
      if (!isValid) return;

      if (!createForm.value.employee) {
        Notify.create({
          type: "negative",
          message: "Please select an employee.",
        });
        return;
      }

      if (!createForm.value.ControlNo) {
        Notify.create({
          type: "negative",
          message: "Employee Control No. is missing.",
        });
        return;
      }

      if (!createForm.value.role) {
        Notify.create({ type: "negative", message: "Please select a role." });
        return;
      }

      createLoading.value = true;
      try {
        const result = await store.createUser({
          ControlNo: createForm.value.ControlNo.trim(),
          username: createForm.value.username.trim(),
          password: createForm.value.password,
          password_confirmation: createForm.value.password_confirmation,
          role: createForm.value.role,
        });

        if (!result.success) {
          Notify.create({
            type: "negative",
            message: result.message || "Unable to create user.",
          });
          return;
        }

        Notify.create({
          type: "positive",
          message: result.message || "User created successfully.",
        });

        closeCreateDialog();
        // Store already refetched users.
      } finally {
        createLoading.value = false;
      }
    }

    // ---------- CLOSE CREATE ----------
    function closeCreateDialog() {
      if (createLoading.value) return;

      createDialog.value = false;

      createForm.value = {
        office: "",
        employee: null,
        ControlNo: "",
        username: "",
        password: DEFAULT_PASSWORD,
        password_confirmation: DEFAULT_PASSWORD,
        role: null,
      };

      showCreatePassword.value = false;
      showCreateConfirmPassword.value = false;

      createTab.value = "employee";
      employeeSearch.value = "";

      store.clearEmployees();
    }

    // ---------- FORMAT HELPERS ----------
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

    function roleClass(role) {
      if (role === "hr_admin" || role === "HR Admin") return "role-hr";
      if (role === "office_admin" || role === "Office Admin")
        return "role-office";
      return "role-employee";
    }

    function statusClass(status) {
      if (status?.toLowerCase() === "active") return "status-active";
      return "status-inactive";
    }

    function formatDate(date) {
      if (!date) return "—";
      const parsed = new Date(date);
      if (Number.isNaN(parsed.getTime())) return "—";
      return parsed.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }

    // ---------- FILTERS / REFRESH ----------
    function clearFilters() {
      search.value = "";
      statusFilter.value = null;
    }

    // ---------- VIEW ----------
    async function viewUser(user) {
      selectedUser.value = user;
      viewDialog.value = true;

      const result = await store.getUser(user.id);
      if (result.success) {
        selectedUser.value = result.data;
      }
    }

    // ---------- EDIT ----------
    async function editUser(user) {
      if (!store.roles.length) {
        await store.fetchRoles();
      }

      selectedUser.value = user;

      editForm.value = {
        username: user.username || "",
        role: user.role || null,
      };

      editDialog.value = true;
    }

    async function saveUser() {
      if (!selectedUser.value) return;

      if (!editForm.value.role) {
        Notify.create({ type: "negative", message: "Please select a role." });
        return;
      }

      actionLoading.value = true;
      try {
        const result = await store.updateUser(selectedUser.value.id, {
          username: editForm.value.username,
          role: editForm.value.role,
        });

        if (!result.success) {
          Notify.create({
            type: "negative",
            message: result.message || "Unable to update user.",
          });
          return;
        }

        Notify.create({
          type: "positive",
          message: result.message || "User updated successfully.",
        });

        editDialog.value = false;
        selectedUser.value = null;
        // Store already refetched users.
      } finally {
        actionLoading.value = false;
      }
    }

    function closeEditDialog() {
      editDialog.value = false;
      selectedUser.value = null;

      editForm.value = {
        username: "",
        role: null,
      };
    }

    // ---------- RESET PASSWORD ----------
    function openResetPassword(user) {
      selectedUser.value = user;

      // Prefill with the default password
      passwordForm.value = {
        password: DEFAULT_PASSWORD,
        password_confirmation: DEFAULT_PASSWORD,
      };

      showPassword.value = false;
      showConfirmPassword.value = false;

      resetPasswordDialog.value = true;
    }

    async function resetPassword() {
      if (!selectedUser.value) return;

      if (passwordForm.value.password.length < 8) {
        Notify.create({
          type: "negative",
          message: "Password must be at least 8 characters.",
        });
        return;
      }

      if (
        passwordForm.value.password !== passwordForm.value.password_confirmation
      ) {
        Notify.create({ type: "negative", message: "Passwords do not match." });
        return;
      }

      actionLoading.value = true;
      try {
        const result = await store.resetPassword(selectedUser.value.id, {
          password: passwordForm.value.password,
          password_confirmation: passwordForm.value.password_confirmation,
        });

        if (!result.success) {
          Notify.create({
            type: "negative",
            message: result.message || "Unable to reset password.",
          });
          return;
        }

        Notify.create({
          type: "positive",
          message: result.message || "Password reset successfully.",
        });

        closeResetPasswordDialog();
      } finally {
        actionLoading.value = false;
      }
    }

    function closeResetPasswordDialog() {
      resetPasswordDialog.value = false;
      selectedUser.value = null;

      passwordForm.value = {
        password: DEFAULT_PASSWORD,
        password_confirmation: DEFAULT_PASSWORD,
      };

      showPassword.value = false;
      showConfirmPassword.value = false;
    }

    // ---------- TOGGLE STATUS ----------
    function confirmToggleStatus(user) {
      selectedUser.value = user;
      statusDialog.value = true;
    }

    async function toggleStatus() {
      if (!selectedUser.value) return;

      actionLoading.value = true;
      try {
        const result = await store.toggleStatus(selectedUser.value.id);

        if (!result.success) {
          Notify.create({
            type: "negative",
            message: result.message || "Unable to update user status.",
          });
          return;
        }

        Notify.create({
          type: "positive",
          message: result.message || "User status updated.",
        });

        statusDialog.value = false;
        selectedUser.value = null;
        // Store already refetched users.
      } finally {
        actionLoading.value = false;
      }
    }

    // ---------- DELETE ----------
    function confirmDelete(user) {
      selectedUser.value = user;
      deleteDialog.value = true;
    }

    async function deleteUser() {
      if (!selectedUser.value) return;

      actionLoading.value = true;
      try {
        const result = await store.deleteUser(selectedUser.value.id);

        if (!result.success) {
          Notify.create({
            type: "negative",
            message: result.message || "Unable to delete user.",
          });
          return;
        }

        Notify.create({
          type: "positive",
          message: result.message || "User deleted successfully.",
        });

        deleteDialog.value = false;
        selectedUser.value = null;
        // Store already refetched users.
      } finally {
        actionLoading.value = false;
      }
    }

    // ---------- LIFECYCLE ----------
    onMounted(async () => {
      await Promise.all([store.init(), store.fetchRoles()]);
    });

    // ---------- RETURN ----------
    return {
      store,
      DEFAULT_PASSWORD,

      // Filters
      search,
      statusFilter,
      statusOptions,

      // Table
      columns,
      filteredUsers,
      employeeColumns,

      // Options
      roleOptions,
      officeOptions,
      employeeOptions,

      // Employees
      filteredEmployees,
      employeeSearch,
      onOfficeChange,
      onEmployeeChange,

      // Create
      createDialog,
      createFormRef,
      createForm,
      createLoading,
      showCreatePassword,
      showCreateConfirmPassword,
      openCreateUser,
      createUser,
      closeCreateDialog,

      // Create tab
      createTab,
      goToAccountTab,

      // Dialogs
      viewDialog,
      editDialog,
      resetPasswordDialog,
      statusDialog,
      deleteDialog,

      // Selected
      selectedUser,
      actionLoading,

      // Forms
      editForm,
      passwordForm,

      // Password
      showPassword,
      showConfirmPassword,

      // Helpers
      formatRole,
      roleClass,
      statusClass,
      formatDate,

      clearFilters,

      viewUser,
      editUser,
      saveUser,
      closeEditDialog,

      openResetPassword,
      resetPassword,
      closeResetPasswordDialog,

      confirmToggleStatus,
      toggleStatus,

      confirmDelete,
      deleteUser,
    };
  },
});
</script>

<style scoped>
/* =========================================================
   TYPOGRAPHY NOTE
   All font-size / weight / line-height values come from the
   tokens defined in MainLayout.vue (:root). Do not hard-code
   px sizes here — use var(--fs-*), var(--fw-*), var(--lh-*).
========================================================= */

/* =========================================================
   PAGE
========================================================= */
.module-page {
  min-height: 100%;
  padding: 20px;
  color: #19354a;
}

/* =========================================================
   HEADER
========================================================= */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.page-header h6 {
  margin: 5px 0 4px;
  color: #19354a;
  font-size: var(--fs-xl);
  font-weight: var(--fw-bold);
  line-height: var(--lh-tight);
}

.page-header p {
  margin: 0;
  color: #718089;
  font-size: var(--fs-base);
  line-height: var(--lh-normal);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.add-user-btn {
  min-height: 34px;
  padding: 0 14px;
  color: #ffffff;
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
}

.add-user-btn {
  background: #e8911a;
}

/* =========================================================
   CARD
========================================================= */
.users-card {
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 3px 12px rgba(30, 70, 42, 0.055);
}

/* =========================================================
   FILTER
========================================================= */
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
.status-filter {
  width: 140px;
}

.search-input :deep(.q-field__control),
.status-filter :deep(.q-field__control) {
  min-height: 38px;
}

.clear-btn {
  color: #6f8087;
  font-size: var(--fs-base);
  font-weight: var(--fw-medium);
}

/* =========================================================
   TABLE
========================================================= */
.table-wrapper {
  padding: 0 12px;
  overflow-x: auto; /* scroll sideways on tablets / small screens */
}
.users-table {
  box-shadow: none;
  min-width: 760px;
}

.users-table :deep(th) {
  height: 48px;
  color: #6f8087;
  background: #ffffff;
  font-size: var(--fs-xs);
  font-weight: var(--fw-bold);
  letter-spacing: var(--ls-caps);
}

.users-table :deep(td) {
  height: 68px;
  color: #425b68;
  border-color: #edf1ef;
  font-size: var(--fs-base);
}

.users-table :deep(tbody tr:hover) {
  background: #fefaf5;
}

.users-table :deep(.q-table__bottom) {
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
   USER / OFFICE
========================================================= */
.user-name {
  color: #19354a;
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
  line-height: var(--lh-tight);
}

.user-meta {
  margin-top: 3px;
  color: #7d8c93;
  font-size: var(--fs-sm);
  font-weight: var(--fw-regular);
}

.office-name {
  color: #536b76;
  font-size: var(--fs-base);
  line-height: var(--lh-normal);
}

/* =========================================================
   BADGES
========================================================= */
.role-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  line-height: var(--lh-tight);
}

.role-hr {
  color: #9b6200;
  background: #fff3d9;
}
.role-office {
  color: #356c82;
  background: #e8f4f8;
}
.role-employee {
  color: #47734f;
  background: #e9f5eb;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  line-height: var(--lh-tight);
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
}

.status-active {
  color: #0c9145;
  background: #e1f7e6;
}
.status-inactive {
  color: #c73f3f;
  background: #fbe9e9;
}

/* =========================================================
   EMPTY
========================================================= */
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

.table-empty.small {
  padding: 22px 0;
  font-size: var(--fs-sm);
}

/* =========================================================
   DIALOG BASE
========================================================= */
.user-dialog {
  width: 520px;
  max-width: 94vw;
}

.create-dialog {
  width: 720px;
}
.view-dialog {
  width: 620px;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
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

/* =========================================================
   STEPPER
========================================================= */
.create-stepper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px 14px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 9px;
  flex: 1;
  cursor: pointer;
  opacity: 0.55;
  transition: opacity 0.2s ease;
}

.step-item.active,
.step-item.done {
  opacity: 1;
}

.step-item.active .step-circle {
  background: #f5a623;
  color: #ffffff;
}
.step-item.done .step-circle {
  background: #159447;
  color: #ffffff;
}

.step-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #eef2f0;
  color: #6f8087;
  font-size: var(--fs-sm);
  font-weight: var(--fw-bold);
}

.step-title {
  color: #19354a;
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
  line-height: var(--lh-tight);
}

.step-sub {
  margin-top: 2px;
  color: #7d8c93;
  font-size: var(--fs-sm);
}

.step-divider {
  width: 22px;
  height: 1px;
  background: #dfe6e3;
}

/* =========================================================
   TAB PANELS
========================================================= */
.create-tab-panels {
  background: transparent;
}
.create-tab-panel {
  padding: 18px 20px 6px;
}

.create-info-box {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 16px;
  padding: 11px 12px;
  color: #356c82;
  background: #edf7fa;
  font-size: var(--fs-sm);
  line-height: var(--lh-relaxed);
}

.create-info-box--soft {
  margin-top: 4px;
  margin-bottom: 0;
  background: #f8faf9;
  color: #6f8087;
}

/* =========================================================
   STEP 2 — 2-COLUMN GRID
========================================================= */
.step2-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px;
  align-items: start;
}

.step2-column {
  min-width: 0;
}

/* =========================================================
   FORM SECTION TITLE  (overline style)
========================================================= */
.form-section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid #edf1ef;
  color: #405967;
  font-size: var(--fs-xs);
  font-weight: var(--fw-bold);
  letter-spacing: var(--ls-caps);
  text-transform: uppercase;
}

/* =========================================================
   EMPLOYEE TABLE (STEP 1)
========================================================= */
.employee-table-wrapper {
  margin-top: 4px;
  margin-bottom: 15px;
  border: 1px solid #edf1ef;
  overflow: hidden;
}

.employee-table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 12px;
  border-bottom: 1px solid #edf1ef;
  background: #fcfdfc;
  color: #405967;
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
}

.employee-count {
  color: #7d8c93;
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
}

.employee-table {
  box-shadow: none;
}

.employee-table :deep(th) {
  height: 34px;
  color: #6f8087;
  background: #ffffff;
  font-size: var(--fs-xs);
  font-weight: var(--fw-bold);
  letter-spacing: var(--ls-caps);
}

.employee-table :deep(td) {
  height: 42px;
  color: #425b68;
  border-color: #edf1ef;
  font-size: var(--fs-sm);
}

.employee-table :deep(tbody tr) {
  cursor: pointer;
}
.employee-table :deep(tbody tr:hover) {
  background: #fefaf5;
}

.employee-table :deep(.q-table__bottom) {
  border-top: 1px solid #edf1ef;
  padding: 6px 12px;
  color: #6f8087;
  font-size: var(--fs-sm);
}

/* =========================================================
   STEP 2 BANNER
========================================================= */
.tab2-employee-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding: 11px 12px;
  background: #fcf8f2;
  border: 1px solid #f4eadb;
  color: #b76f00;
}

.tab2-employee-name {
  color: #19354a;
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
  line-height: var(--lh-tight);
}

.tab2-employee-meta {
  margin-top: 3px;
  color: #7d8c93;
  font-size: var(--fs-sm);
}

/* =========================================================
   PROFILE / DETAILS
========================================================= */
.profile-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  padding: 14px 16px;
  background: #fcf8f2;
  border: 1px solid #f4eadb;
  border-radius: 8px;
}

.profile-main {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.profile-text {
  min-width: 0;
}

.profile-name {
  word-break: break-word;
}

/* Grouped detail sections */
.detail-group {
  margin-bottom: 14px;
  padding: 14px 16px 16px;
  border: 1px solid #edf1ef;
  border-radius: 8px;
  background: #ffffff;
}

.detail-group--last {
  margin-bottom: 0;
}

.detail-group .form-section-title {
  margin-bottom: 12px;
}

.profile-avatar,
.edit-avatar,
.reset-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  color: #b76f00;
  background: #fff0d0;
}

.profile-name {
  color: #19354a;
  font-size: var(--fs-lg);
  font-weight: var(--fw-bold);
  line-height: var(--lh-tight);
}

.profile-username {
  margin-top: 3px;
  color: #7d8c93;
  font-size: var(--fs-sm);
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.detail-item.full {
  grid-column: span 2;
}

.detail-label {
  margin-bottom: 5px;
  color: #7d8c93;
  font-size: var(--fs-xs);
  font-weight: var(--fw-bold);
  letter-spacing: var(--ls-caps);
  text-transform: uppercase;
}

.detail-value {
  color: #405967;
  font-size: var(--fs-base);
  font-weight: var(--fw-medium);
  line-height: var(--lh-normal);
  word-break: break-word;
}

/* =========================================================
   EDIT / RESET
========================================================= */
.edit-user-info {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-bottom: 18px;
  padding: 12px;
  background: #f8faf9;
}

.edit-avatar {
  width: 40px;
  height: 40px;
}

.edit-name {
  color: #19354a;
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
  line-height: var(--lh-tight);
}

.edit-office {
  margin-top: 3px;
  color: #7d8c93;
  font-size: var(--fs-sm);
}

.form-field {
  margin-bottom: 12px;
}

.form-field :deep(.q-field__control) {
  min-height: 42px;
}

.reset-user {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-bottom: 20px;
  padding: 12px;
  background: #fff8ed;
}

.reset-avatar {
  width: 40px;
  height: 40px;
  color: #b76f00;
  background: #ffedca;
}

.reset-name {
  color: #19354a;
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
  line-height: var(--lh-tight);
}

.reset-username {
  margin-top: 3px;
  color: #7d8c93;
  font-size: var(--fs-sm);
}

.warning-box {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 11px 12px;
  color: #956100;
  background: #fff7df;
  font-size: var(--fs-sm);
  line-height: var(--lh-relaxed);
}

.warning-box strong {
  color: #6f4a00;
  font-weight: var(--fw-bold);
}

/* =========================================================
   BUTTONS
========================================================= */
.dialog-cancel-btn {
  color: #708088;
  font-size: var(--fs-base);
  font-weight: var(--fw-medium);
}

.save-btn,
.reset-btn,
.activate-btn,
.danger-btn {
  min-height: 34px;
  padding: 0 16px;
  color: #ffffff;
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
}

.save-btn {
  background: #f5a623;
}
.reset-btn {
  background: #e8911a;
}
.activate-btn {
  background: #159447;
}
.danger-btn {
  background: #d64545;
}

.create-actions {
  padding: 12px 18px;
}

/* =========================================================
   CONFIRMATION
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

.status-confirm-icon {
  color: #a96c00;
  background: #fff0d0;
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

/* Tablet → stack columns */
@media (max-width: 800px) {
  .create-dialog {
    width: 94vw;
  }

  .step2-grid {
    grid-template-columns: 1fr;
    gap: 18px;
  }

  .filter-section {
    flex-wrap: wrap;
  }
  .search-input {
    max-width: none;
    width: 100%;
  }
  .status-filter {
    width: 150px;
  }
}

/* Mobile adjustments */
@media (max-width: 650px) {
  .module-page {
    padding: 14px;
  }

  .page-header {
    align-items: flex-start;
    gap: 12px;
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
  }
  .add-user-btn {
    flex: 1;
  }

  .users-table {
    min-width: 720px;
  }

  /* Bigger tap targets for the action icons */
  .actions-cell .q-btn {
    width: 36px;
    height: 36px;
  }

  /* Prevent iOS Safari auto-zoom when focusing an input */
  .form-field :deep(.q-field__native),
  .search-input :deep(.q-field__native),
  .status-filter :deep(.q-field__native) {
    font-size: 16px;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }
  .detail-item.full {
    grid-column: span 1;
  }

  .create-stepper {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 14px 18px;
  }

  .step-item {
    gap: 10px;
  }

  .step-divider {
    display: none;
  }

  /* Larger tap targets on mobile */
  .form-field :deep(.q-field__control) {
    min-height: 46px;
  }

  .save-btn,
  .reset-btn,
  .activate-btn,
  .danger-btn {
    min-height: 40px;
  }
}

/* Very small phones */
@media (max-width: 400px) {
  .dialog-header {
    padding: 14px 16px;
  }

  .create-tab-panel {
    padding: 14px 16px 4px;
  }
}
</style>
