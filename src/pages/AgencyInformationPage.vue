<template>
  <q-page class="module-page">
    <!-- =====================================================
         PAGE HEADER
    ====================================================== -->
    <section class="page-header">
      <div>
        <h6>Agency Information</h6>
        <p>Manage agency officials and their contact information.</p>
      </div>

      <div class="header-actions">
        <q-btn
          flat
          no-caps
          icon="refresh"
          label="Refresh"
          class="refresh-btn"
          :loading="agencyStore.loading"
          @click="agencyStore.fetch()"
        />
      </div>
    </section>

    <!-- =====================================================
         LOADING
    ====================================================== -->
    <div v-if="agencyStore.loading && !agencyStore.loaded" class="loading-wrap">
      <q-spinner color="primary" size="32px" />
      <div class="loading-text">Loading agency information…</div>
    </div>

    <!-- =====================================================
         OFFICIALS GRID
    ====================================================== -->
    <div v-else class="officials-grid">
      <q-card
        v-for="section in sections"
        :key="section.key"
        flat
        class="official-card"
      >
        <div class="official-header">
          <div class="official-icon-wrap" :class="section.iconClass">
            <q-icon :name="section.icon" size="18px" />
          </div>

          <div class="official-role-title">{{ section.label }}</div>

          <q-btn
            flat
            round
            dense
            :icon="hasOfficial(section.key) ? 'edit' : 'add'"
            class="edit-icon-btn"
            @click="openEdit(section.key)"
          >
            <q-tooltip>
              {{
                hasOfficial(section.key)
                  ? `Edit ${section.label}`
                  : `Add ${section.label}`
              }}
            </q-tooltip>
          </q-btn>
        </div>

        <q-separator />

        <div class="official-body">
          <template v-if="hasOfficial(section.key)">
            <div class="official-name">
              {{ fullName(getOfficial(section.key)) }}
            </div>

            <div class="official-position">
              {{ getOfficial(section.key).positionTitle || "—" }}
            </div>

            <div class="official-contacts">
              <div
                class="contact-row"
                :class="{ 'contact-empty': !getOfficial(section.key).landline }"
              >
                <q-icon name="call" size="14px" />
                <span>{{
                  getOfficial(section.key).landline || "No landline"
                }}</span>
              </div>

              <div
                class="contact-row"
                :class="{ 'contact-empty': !getOfficial(section.key).mobile }"
              >
                <q-icon name="smartphone" size="14px" />
                <span>{{
                  getOfficial(section.key).mobile || "No mobile"
                }}</span>
              </div>

              <div
                class="contact-row"
                :class="{ 'contact-empty': !getOfficial(section.key).email }"
              >
                <q-icon name="mail_outline" size="14px" />
                <span>{{ getOfficial(section.key).email || "No email" }}</span>
              </div>
            </div>
          </template>

          <div v-else class="official-empty">
            <q-icon name="person_add" size="28px" />
            <div class="official-empty-text">No information yet</div>
            <q-btn
              flat
              no-caps
              dense
              label="Add details"
              class="official-empty-btn"
              @click="openEdit(section.key)"
            />
          </div>
        </div>
      </q-card>
    </div>

    <!-- =====================================================
         EDIT / ADD DIALOG
    ====================================================== -->
    <q-dialog v-model="editDialog" persistent>
      <q-card class="user-dialog edit-dialog">
        <div class="dialog-header">
          <div>
            <div class="dialog-title">{{ dialogTitle }}</div>
            <div class="dialog-subtitle">
              Pick an employee from the directory, then set contact details
            </div>
          </div>

          <q-btn
            flat
            round
            dense
            icon="close"
            :disable="agencyStore.saving"
            @click="closeEdit"
          />
        </div>

        <q-separator />

        <q-form ref="editFormRef" @submit.prevent="saveOfficial">
          <q-card-section class="edit-section">
            <!-- ══════════════════════════════════════════
                 SECTION A — SELECT OFFICIAL
            ══════════════════════════════════════════ -->
            <div class="form-section-title">
              <q-icon name="badge" size="12px" />
              <span>Select Official</span>
            </div>

            <div v-if="editForm.employee" class="selected-employee-banner">
              <div class="selected-avatar">
                {{ getInitials(editForm.employee.full_name) }}
              </div>

              <div class="selected-employee-text">
                <div class="selected-employee-name">
                  {{ editForm.employee.full_name }}
                </div>
                <div class="selected-employee-meta">
                  {{ editForm.employee.Designation || "No designation" }}
                  <template v-if="editForm.employee.Office">
                    · {{ editForm.employee.Office }}
                  </template>
                </div>
              </div>

              <div class="selected-employee-actions">
                <q-btn
                  flat
                  dense
                  no-caps
                  size="sm"
                  icon="sync"
                  label="Change"
                  class="banner-action"
                  :disable="agencyStore.saving"
                  @click="openDirectory"
                />
                <q-btn
                  flat
                  dense
                  round
                  size="sm"
                  icon="close"
                  class="banner-action banner-action--icon"
                  aria-label="Clear selection"
                  :disable="agencyStore.saving"
                  @click="clearSelectedEmployee"
                >
                  <q-tooltip>Clear selection</q-tooltip>
                </q-btn>
              </div>
            </div>

            <div v-else class="directory-empty">
              <div class="directory-empty-icon">
                <q-icon name="person_search" size="26px" />
              </div>
              <div class="directory-empty-title">No employee selected</div>
              <div class="directory-empty-text">
                Choose an employee from the directory to populate the fields
                below.
              </div>
              <q-btn
                unelevated
                no-caps
                icon="person_search"
                label="Select from Directory"
                class="btn-select-directory"
                :disable="agencyStore.saving"
                @click="openDirectory"
              />
            </div>

            <!-- ══════════════════════════════════════════
                 SECTION B — OFFICIAL DETAILS
            ══════════════════════════════════════════ -->
            <div class="form-section-title form-section-title--spaced">
              <q-icon name="work_outline" size="12px" />
              <span>Official Details</span>
            </div>

            <div class="form-grid">
              <q-input
                v-model="editForm.firstName"
                outlined
                dense
                readonly
                label="First name"
                class="form-field readonly-input"
              >
                <template #append>
                  <q-icon name="lock" size="13px" class="lock-icon" />
                </template>
              </q-input>

              <q-input
                v-model="editForm.middleName"
                outlined
                dense
                readonly
                label="Middle name"
                class="form-field readonly-input"
              >
                <template #append>
                  <q-icon name="lock" size="13px" class="lock-icon" />
                </template>
              </q-input>

              <q-input
                v-model="editForm.lastName"
                outlined
                dense
                readonly
                label="Last name"
                class="form-field readonly-input"
              >
                <template #append>
                  <q-icon name="lock" size="13px" class="lock-icon" />
                </template>
              </q-input>

              <q-input
                v-model="editForm.extensionName"
                outlined
                dense
                readonly
                label="Extension (Jr., Sr., III…)"
                class="form-field readonly-input"
              >
                <template #append>
                  <q-icon name="lock" size="13px" class="lock-icon" />
                </template>
              </q-input>
            </div>

            <q-input
              v-model="editForm.positionTitle"
              outlined
              dense
              readonly
              label="Position title"
              class="form-field readonly-input"
            >
              <template #prepend><q-icon name="work_outline" /></template>
              <template #append>
                <q-icon name="lock" size="13px" class="lock-icon" />
              </template>
            </q-input>

            <!-- ══════════════════════════════════════════
                 SECTION C — CONTACT INFORMATION
            ══════════════════════════════════════════ -->
            <div class="form-section-title form-section-title--spaced">
              <q-icon name="contact_phone" size="12px" />
              <span>Contact Information</span>
            </div>

            <div class="form-grid">
              <q-input
                v-model="editForm.landline"
                outlined
                dense
                label="Phone / Landline"
                placeholder="(02) 123-45678"
                class="form-field"
                :disable="agencyStore.saving"
                :rules="[landlineRule]"
              >
                <template #prepend><q-icon name="call" /></template>
              </q-input>

              <q-input
                v-model="editForm.mobile"
                outlined
                dense
                label="Mobile"
                placeholder="(0912) 345-6789"
                class="form-field"
                :disable="agencyStore.saving"
                :rules="[mobileRule]"
              >
                <template #prepend><q-icon name="smartphone" /></template>
              </q-input>
            </div>

            <q-input
              v-model="editForm.email"
              outlined
              dense
              type="email"
              label="Email address"
              placeholder="name@example.gov.ph"
              class="form-field"
              :disable="agencyStore.saving"
              :rules="[emailRule]"
            >
              <template #prepend><q-icon name="mail_outline" /></template>
            </q-input>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right" class="edit-actions">
            <q-btn
              flat
              no-caps
              label="Cancel"
              class="dialog-cancel-btn"
              :disable="agencyStore.saving"
              @click="closeEdit"
            />

            <q-btn
              unelevated
              no-caps
              :label="isEditing ? 'Save Changes' : 'Add Official'"
              :icon="isEditing ? 'save' : 'person_add'"
              type="submit"
              class="save-btn"
              :loading="agencyStore.saving"
              :disable="!editForm.employee"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- =====================================================
         DIRECTORY PICKER DIALOG
    ====================================================== -->
    <q-dialog v-model="pickerDialog" persistent :maximized="$q.screen.lt.sm">
      <q-card class="picker-dialog">
        <!-- HEADER -->
        <q-card-section class="picker-header">
          <div>
            <div class="picker-title">Select Employee</div>
            <div class="picker-subtitle">
              Choose an office, then pick the employee.
            </div>
          </div>

          <q-btn
            flat
            round
            dense
            icon="close"
            class="picker-close"
            aria-label="Close"
            @click="closeDirectory"
          />
        </q-card-section>

        <q-separator />

        <!-- TOOLBAR -->
        <q-card-section class="picker-toolbar picker-toolbar--stack">
          <q-select
            v-model="pickerOffice"
            outlined
            dense
            clearable
            use-input
            hide-selected
            fill-input
            input-debounce="0"
            :options="filteredPickerOfficeOptions"
            option-label="office_name"
            option-value="office_name"
            emit-value
            map-options
            placeholder="Search or select office"
            class="picker-office-select"
            :loading="userStore.officesLoading"
            @filter="onOfficeFilter"
            @update:model-value="onPickerOfficeChange"
          >
            <template #prepend>
              <q-icon name="business" size="18px" />
            </template>
            <template #no-option>
              <q-item>
                <q-item-section class="text-grey">
                  {{
                    pickerOfficeFilter
                      ? "No offices match your search."
                      : "No offices found."
                  }}
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <q-input
            v-model="pickerSearch"
            outlined
            dense
            clearable
            :disable="!pickerOffice"
            placeholder="Search by name, position or control no."
            class="picker-search"
          >
            <template #prepend>
              <q-icon name="search" size="18px" />
            </template>
          </q-input>
        </q-card-section>

        <q-separator />

        <!-- LIST -->
        <q-card-section class="picker-list">
          <div v-if="!pickerOffice" class="picker-center">
            <q-icon name="arrow_upward" size="28px" />
            <div>Select an office above to see its employees.</div>
          </div>

          <div v-else-if="userStore.employeesLoading" class="picker-center">
            <q-spinner-dots color="primary" size="34px" />
          </div>

          <div
            v-else-if="!filteredPickerEmployees.length"
            class="picker-center"
          >
            <q-icon name="search_off" size="28px" />
            <div>
              {{
                pickerSearch
                  ? "No employees match your search."
                  : "No employees found for this office."
              }}
            </div>
          </div>

          <div v-else class="picker-items">
            <div
              v-for="emp in filteredPickerEmployees"
              :key="emp.ControlNo"
              class="picker-item"
              :class="{
                'is-selected': isPickerSelected(emp.ControlNo),
              }"
              role="button"
              tabindex="0"
              @click="selectEmployee(emp)"
              @keydown.enter.self="selectEmployee(emp)"
              @keydown.space.self.prevent="selectEmployee(emp)"
            >
              <q-spinner
                v-if="hydratingControlNo === emp.ControlNo"
                size="16px"
                color="primary"
                class="picker-lead-icon"
              />
              <q-icon
                v-else
                :name="
                  isPickerSelected(emp.ControlNo)
                    ? 'radio_button_checked'
                    : 'radio_button_unchecked'
                "
                size="18px"
                class="picker-lead-icon"
                :class="{
                  'is-selected': isPickerSelected(emp.ControlNo),
                }"
              />

              <div class="picker-avatar">
                {{ getInitials(emp.full_name) }}
              </div>

              <div class="picker-info">
                <div class="picker-name">
                  {{ emp.full_name || "Unnamed Employee" }}
                </div>
                <div class="picker-meta">
                  {{ emp.Designation || "No designation" }}
                </div>
              </div>

              <q-badge
                v-if="emp.Status"
                outline
                color="grey-7"
                :label="emp.Status"
                class="picker-badge"
              />
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <!-- FOOTER -->
        <q-card-actions class="picker-footer">
          <div class="picker-count">
            <q-icon name="info" size="16px" />
            <span>
              {{
                pickerSelected
                  ? pickerSelected.full_name
                  : "No employee selected"
              }}
            </span>
          </div>

          <q-btn
            unelevated
            no-caps
            label="Done"
            class="btn-primary btn-primary--sm"
            :disable="!!hydratingControlNo"
            @click="closeDirectory"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, computed, ref, onMounted } from "vue";
import { Notify } from "quasar";
import { useAgencyInformationStore } from "src/stores/agencyInformationStore";
import { useUserStore } from "src/stores/userStore";

// ============================================================
// SECTION DEFINITIONS
// ============================================================
const SECTIONS = [
  {
    key: "agencyHead",
    label: "Agency Head",
    icon: "person_pin",
    iconClass: "icon-amber",
  },
  {
    key: "regionalOfficeHead",
    label: "Regional Office Head",
    icon: "location_city",
    iconClass: "icon-blue",
  },
  {
    key: "praiseChairperson",
    label: "PRAISE Chairperson",
    icon: "workspace_premium",
    iconClass: "icon-green",
  },
  {
    key: "highestHrmo",
    label: "Highest HRMO",
    icon: "supervisor_account",
    iconClass: "icon-purple",
  },
];

const EMPTY_FORM = {
  employee: null,
  firstName: "",
  middleName: "",
  lastName: "",
  extensionName: "",
  positionTitle: "",
  landline: "",
  mobile: "",
  email: "",
};

// ============================================================
// HELPERS
// ============================================================

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0))
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

function splitNameAndExtension(raw) {
  const str = String(raw || "").trim();
  if (!str) return { name: "", extension: "" };

  const commaIdx = str.indexOf(",");
  if (commaIdx === -1) return { name: str, extension: "" };

  return {
    name: str.slice(0, commaIdx).trim(),
    extension: str.slice(commaIdx + 1).trim(),
  };
}

function splitFullName(employee) {
  const surnameRaw =
    employee.Surname || employee.surname || employee.last_name || "";
  const firstRaw =
    employee.Firstname || employee.first_name || employee.firstname || "";
  const middleRaw =
    employee.MIddlename ||
    employee.Middlename ||
    employee.middle_name ||
    employee.middlename ||
    "";

  if (surnameRaw || firstRaw) {
    const surname = splitNameAndExtension(surnameRaw);
    const first = splitNameAndExtension(firstRaw);
    const extension = first.extension || surname.extension || "";

    return {
      firstName: first.name,
      middleName: String(middleRaw || "").trim(),
      lastName: surname.name,
      extensionName: extension,
    };
  }

  const full = String(employee.full_name || employee.FullName || "").trim();

  if (!full) {
    return { firstName: "", middleName: "", lastName: "", extensionName: "" };
  }

  if (full.includes(",")) {
    const [lastPart, restPart] = full.split(",").map((s) => s.trim());
    const rest = (restPart || "").split(/\s+/).filter(Boolean);
    const surname = splitNameAndExtension(lastPart);
    return {
      firstName: rest[0] || "",
      middleName: rest.slice(1).join(" "),
      lastName: surname.name,
      extensionName: surname.extension,
    };
  }

  const parts = full.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return {
      firstName: parts[0],
      middleName: "",
      lastName: "",
      extensionName: "",
    };
  }
  if (parts.length === 2) {
    return {
      firstName: parts[0],
      middleName: "",
      lastName: parts[1],
      extensionName: "",
    };
  }
  return {
    firstName: parts[0],
    middleName: parts.slice(1, -1).join(" "),
    lastName: parts[parts.length - 1],
    extensionName: "",
  };
}

/**
 * Normalise a mobile number to `(XXXX) XXX-XXXX`.
 *
 * Accepts:
 *   `(975) 547-4981`  → `(0975) 547-4981`
 *   `09177190326`     → `(0917) 719-0326`
 *   `639171234567`    → `(0917) 123-4567`
 *   `9171234567`      → `(0917) 123-4567`
 */
function normalizeMobile(raw) {
  if (!raw) return "";

  const digits = String(raw).replace(/\D/g, "");
  if (!digits) return String(raw).trim();

  let d = digits;

  // Strip leading 63 (country code)
  if (d.startsWith("63") && d.length >= 12) d = d.slice(2);

  // 10 digits without leading 0 → add it back
  if (d.length === 10 && !d.startsWith("0")) d = "0" + d;

  // Format as (XXXX) XXX-XXXX
  if (d.length === 11 && d.startsWith("0")) {
    return `(${d.slice(0, 4)}) ${d.slice(4, 7)}-${d.slice(7)}`;
  }

  // Fallback — return trimmed original
  return String(raw).trim();
}

function normalizeLandline(raw) {
  if (!raw) return "";
  const str = String(raw).trim();

  if (/^\(0\d{1,2}\)\s?\d{3,4}-\d{4}$/.test(str)) return str;

  const digits = str.replace(/\D/g, "");
  if (!digits) return "";

  if (digits.length === 7) {
    return `(02) ${digits.slice(0, 3)}-${digits.slice(3)}`;
  }
  if (digits.length === 8) {
    return `(02) ${digits.slice(0, 4)}-${digits.slice(4)}`;
  }
  if (digits.length === 9 && digits.startsWith("0")) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 10 && digits.startsWith("0")) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  return str;
}

export default defineComponent({
  name: "AgencyInformationPage",

  setup() {
    const agencyStore = useAgencyInformationStore();
    const userStore = useUserStore();

    // ---------- EDIT STATE ----------
    const editDialog = ref(false);
    const editFormRef = ref(null);
    const editingRole = ref(null);
    const editForm = ref({ ...EMPTY_FORM });

    // ---------- PICKER STATE ----------
    const pickerDialog = ref(false);
    const pickerOffice = ref("");
    const pickerOfficeFilter = ref("");
    const pickerSearch = ref("");
    const pickerSelected = ref(null);
    const hydratingControlNo = ref(null);

    // ---------- SECTIONS ----------
    const sections = SECTIONS;

    const currentSection = computed(() =>
      sections.find((s) => s.key === editingRole.value)
    );

    const isEditing = computed(() => hasOfficial(editingRole.value));

    const dialogTitle = computed(() => {
      const label = currentSection.value?.label || "Official";
      return isEditing.value ? `Edit ${label}` : `Add ${label}`;
    });

    const filteredPickerOfficeOptions = computed(() => {
      const list = userStore.offices || [];
      const q = pickerOfficeFilter.value.trim().toLowerCase();
      if (!q) return list;

      return list.filter((o) => {
        const name = o?.office_name || o?.Office || o?.name || "";
        return String(name).toLowerCase().includes(q);
      });
    });

    const filteredPickerEmployees = computed(() => {
      const list = userStore.employees || [];
      const q = pickerSearch.value.trim().toLowerCase();
      if (!q) return list;

      return list.filter((emp) => {
        return (
          (emp.full_name || "").toLowerCase().includes(q) ||
          (emp.Designation || "").toLowerCase().includes(q) ||
          (emp.ControlNo || "").toLowerCase().includes(q) ||
          (emp.Surname || "").toLowerCase().includes(q) ||
          (emp.Firstname || "").toLowerCase().includes(q)
        );
      });
    });

    // ---------- HELPERS ----------
    function getOfficial(key) {
      return agencyStore.officials[key];
    }

    function hasOfficial(key) {
      const o = agencyStore.officials[key];
      return !!(o && (o.firstName || o.lastName));
    }

    function fullName(official) {
      if (!official) return "—";
      const parts = [
        official.firstName,
        official.middleName,
        official.lastName,
        official.extensionName,
      ].filter(Boolean);
      return parts.length ? parts.join(" ") : "—";
    }

    // ---------- VALIDATION ----------
    const LANDLINE_REGEX = /^\(0\d{1,2}\)\s?\d{3,4}-\d{4}$/;

    // Accepts BOTH:
    //   (0917) 719-0326   — formatted
    //   09177190326       — plain 11 digits
    const MOBILE_REGEX = /^(\(0\d{3}\)\s?\d{3}-\d{4}|09\d{9})$/;

    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function landlineRule(val) {
      if (!val) return true;
      return LANDLINE_REGEX.test(val) || "Format must be (02) 123-45678";
    }

    function mobileRule(val) {
      if (!val) return true;
      // Tolerate spaces so pasted numbers with stray whitespace still pass
      const cleaned = String(val).replace(/\s/g, "");
      return (
        MOBILE_REGEX.test(cleaned) ||
        "Format must be (0912) 345-6789 or 09123456789"
      );
    }

    function emailRule(val) {
      if (!val) return true;
      return EMAIL_REGEX.test(val) || "Please enter a valid email address";
    }

    // ---------- EDIT OPEN / CLOSE ----------
    async function openEdit(roleKey) {
      editingRole.value = roleKey;

      const existing = agencyStore.officials[roleKey];

      editForm.value = existing
        ? {
            employee: null,
            firstName: existing.firstName || "",
            middleName: existing.middleName || "",
            lastName: existing.lastName || "",
            extensionName: existing.extensionName || "",
            positionTitle: existing.positionTitle || "",
            landline: existing.landline || "",
            mobile: existing.mobile || "",
            email: existing.email || "",
          }
        : { ...EMPTY_FORM };

      editDialog.value = true;

      if (!userStore.offices.length) {
        await userStore.fetchOffices();
      }
    }

    function closeEdit() {
      if (agencyStore.saving) return;

      editDialog.value = false;
      editingRole.value = null;
      editForm.value = { ...EMPTY_FORM };
      userStore.clearEmployees();
    }

    // ---------- PICKER OPEN / CLOSE ----------
    async function openDirectory() {
      pickerOffice.value = "";
      pickerOfficeFilter.value = "";
      pickerSearch.value = "";
      pickerSelected.value = null;
      hydratingControlNo.value = null;

      userStore.clearEmployees();

      pickerDialog.value = true;

      if (!userStore.offices.length) {
        await userStore.fetchOffices();
      }
    }

    function closeDirectory() {
      pickerDialog.value = false;
      pickerOffice.value = "";
      pickerOfficeFilter.value = "";
      pickerSearch.value = "";
      pickerSelected.value = null;
      hydratingControlNo.value = null;
    }

    function onOfficeFilter(val, update) {
      pickerOfficeFilter.value = val || "";
      update(() => {});
    }

    async function onPickerOfficeChange(officeName) {
      pickerSelected.value = null;
      pickerSearch.value = "";
      hydratingControlNo.value = null;
      userStore.clearEmployees();

      if (!officeName) return;

      const result = await userStore.fetchEmployeesByOffice(officeName);
      if (!result.success) {
        Notify.create({
          type: "negative",
          message: result.message || "Unable to load employees.",
        });
      }
    }

    function isPickerSelected(controlNo) {
      if (!controlNo || !pickerSelected.value) return false;
      return pickerSelected.value.ControlNo === controlNo;
    }

    async function selectEmployee(emp) {
      if (isPickerSelected(emp.ControlNo) && !hydratingControlNo.value) {
        pickerSelected.value = null;
        return;
      }

      pickerSelected.value = emp;
      hydratingControlNo.value = emp.ControlNo || null;

      const split = splitFullName(emp);

      editForm.value.employee = emp;
      editForm.value.firstName = split.firstName;
      editForm.value.middleName = split.middleName;
      editForm.value.lastName = split.lastName;
      editForm.value.extensionName = split.extensionName;
      editForm.value.positionTitle = emp.Designation || "";

      const initialMobile = normalizeMobile(emp.TelNo);
      if (initialMobile) editForm.value.mobile = initialMobile;

      if (!emp.ControlNo) {
        hydratingControlNo.value = null;
        return;
      }

      try {
        const res = await userStore.fetchEmployeeByControlNo(emp.ControlNo);

        if (
          pickerSelected.value?.ControlNo &&
          pickerSelected.value.ControlNo !== emp.ControlNo
        ) {
          return;
        }

        if (res?.success && res.data) {
          const d = res.data;

          const detailedSplit = splitFullName(d);
          if (detailedSplit.firstName)
            editForm.value.firstName = detailedSplit.firstName;
          if (detailedSplit.middleName)
            editForm.value.middleName = detailedSplit.middleName;
          if (detailedSplit.lastName)
            editForm.value.lastName = detailedSplit.lastName;
          if (detailedSplit.extensionName)
            editForm.value.extensionName = detailedSplit.extensionName;

          if (d.Designation) editForm.value.positionTitle = d.Designation;

          const mobileRaw = d.CellphoneNo || d.CellPhoneNo || d.TelNo || "";
          const mobile = normalizeMobile(mobileRaw);
          if (mobile) editForm.value.mobile = mobile;

          const landlineRaw =
            d.PhoneNo || d.Phone || d.Landline || d.Telephone || "";
          const landline = normalizeLandline(landlineRaw);
          if (landline) editForm.value.landline = landline;

          const email = (d.Email || d.email || "").trim();
          if (email) editForm.value.email = email;

          pickerSelected.value = { ...emp, ...d };
          editForm.value.employee = pickerSelected.value;
        }
      } catch (err) {
        console.error("Hydrate employee failed:", err);
      } finally {
        if (hydratingControlNo.value === emp.ControlNo) {
          hydratingControlNo.value = null;
        }
      }
    }

    function clearSelectedEmployee() {
      editForm.value.employee = null;
      editForm.value.firstName = "";
      editForm.value.middleName = "";
      editForm.value.lastName = "";
      editForm.value.extensionName = "";
      editForm.value.positionTitle = "";
    }

    // ---------- SAVE ----------
    async function saveOfficial() {
      if (!editFormRef.value) return;

      const isValid = await editFormRef.value.validate();
      if (!isValid) return;

      if (!editForm.value.employee) {
        Notify.create({
          type: "negative",
          message: "Please select an employee from the directory.",
        });
        return;
      }

      // Auto-format a plain 11-digit mobile on save so the DB is consistent
      const rawMobile = editForm.value.mobile.trim();
      const formattedMobile = /^09\d{9}$/.test(rawMobile)
        ? normalizeMobile(rawMobile)
        : rawMobile;

      const payload = {
        firstName: editForm.value.firstName.trim(),
        middleName: editForm.value.middleName.trim(),
        lastName: editForm.value.lastName.trim(),
        extensionName: editForm.value.extensionName.trim(),
        positionTitle: editForm.value.positionTitle.trim(),
        landline: editForm.value.landline.trim(),
        mobile: formattedMobile,
        email: editForm.value.email.trim(),
      };

      const result = await agencyStore.updateOfficial(
        editingRole.value,
        payload
      );

      if (!result.success) {
        Notify.create({
          type: "negative",
          message: result.message || "Unable to save agency information.",
        });
        return;
      }

      Notify.create({
        type: "positive",
        message: isEditing.value
          ? `${currentSection.value.label} updated successfully.`
          : `${currentSection.value.label} added successfully.`,
      });

      closeEdit();
    }

    // ---------- LIFECYCLE ----------
    onMounted(() => {
      if (!agencyStore.loaded) agencyStore.fetch();
      if (!userStore.offices.length) userStore.fetchOffices();
    });

    // ---------- RETURN ----------
    return {
      agencyStore,
      userStore,
      sections,

      getOfficial,
      hasOfficial,
      fullName,
      getInitials,

      editDialog,
      editFormRef,
      editForm,
      currentSection,
      isEditing,
      dialogTitle,
      openEdit,
      closeEdit,
      saveOfficial,

      pickerDialog,
      pickerOffice,
      pickerOfficeFilter,
      pickerSearch,
      pickerSelected,
      filteredPickerOfficeOptions,
      filteredPickerEmployees,
      openDirectory,
      closeDirectory,
      onOfficeFilter,
      onPickerOfficeChange,
      isPickerSelected,
      selectEmployee,
      clearSelectedEmployee,
      hydratingControlNo,

      landlineRule,
      mobileRule,
      emailRule,
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
  padding: 16px;
  color: #19354a;
}

/* =========================================================
   HEADER
========================================================= */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.page-header h6 {
  margin: 3px 0 2px;
  color: #19354a;
  font-size: var(--fs-lg);
  font-weight: var(--fw-bold);
  line-height: var(--lh-tight);
}

.page-header p {
  margin: 0;
  color: #718089;
  font-size: var(--fs-sm);
  line-height: var(--lh-normal);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.refresh-btn {
  color: #6f8087;
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
}

/* =========================================================
   LOADING
========================================================= */
.loading-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px 0;
  color: #7d8c93;
}

.loading-text {
  font-size: var(--fs-sm);
}

/* =========================================================
   GRID
========================================================= */
.officials-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

/* =========================================================
   OFFICIAL CARD
========================================================= */
.official-card {
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #edf1ef;
  box-shadow: 0 2px 8px rgba(30, 70, 42, 0.04);
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.official-card:hover {
  border-color: #e3e9e5;
  box-shadow: 0 4px 14px rgba(30, 70, 42, 0.07);
}

.official-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  background: #fcfdfc;
}

.official-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  border-radius: 6px;
}
.official-icon-wrap .q-icon {
  font-size: 15px;
}

.icon-amber {
  color: #b76f00;
  background: #fff0d0;
}
.icon-blue {
  color: #356c82;
  background: #e8f4f8;
}
.icon-green {
  color: #47734f;
  background: #e9f5eb;
}
.icon-purple {
  color: #6a4a9c;
  background: #efe8fa;
}

.official-role-title {
  flex: 1;
  color: #19354a;
  font-size: var(--fs-sm);
  font-weight: var(--fw-bold);
  letter-spacing: 0.2px;
}

.edit-icon-btn {
  color: #6f8087;
  min-width: 28px;
  min-height: 28px;
}
.edit-icon-btn:hover {
  color: #e8911a;
}

/* =========================================================
   OFFICIAL BODY
========================================================= */
.official-body {
  padding: 12px;
}

.official-name {
  color: #19354a;
  font-size: var(--fs-base);
  font-weight: var(--fw-bold);
  line-height: var(--lh-tight);
  word-break: break-word;
}

.official-position {
  margin-top: 2px;
  color: #536b76;
  font-size: var(--fs-xs);
  line-height: var(--lh-normal);
}

.official-contacts {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #edf1ef;
}

.contact-row {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #405967;
  font-size: var(--fs-xs);
  line-height: var(--lh-normal);
  word-break: break-word;
}

.contact-row .q-icon {
  color: #a4b1b8;
  flex-shrink: 0;
  font-size: 13px;
}

.contact-row.contact-empty {
  color: #a4b1b8;
  font-style: italic;
}

.contact-row.contact-empty .q-icon {
  color: #d4dcd9;
}

/* =========================================================
   EMPTY STATE
========================================================= */
.official-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 10px;
  color: #a4b1b8;
  text-align: center;
}

.official-empty-text {
  color: #7d8c93;
  font-size: var(--fs-sm);
}

.official-empty-btn {
  color: #e8911a;
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
}

/* =========================================================
   EDIT DIALOG
========================================================= */
.user-dialog {
  width: 480px;
  max-width: 94vw;
}

.edit-dialog {
  width: 580px;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
}

.dialog-title {
  color: #19354a;
  font-size: var(--fs-lg);
  font-weight: var(--fw-bold);
  line-height: var(--lh-tight);
}

.dialog-subtitle {
  margin-top: 2px;
  color: #7d8c93;
  font-size: var(--fs-xs);
  line-height: var(--lh-normal);
}

.edit-section {
  padding: 12px 16px 2px;
}

/* =========================================================
   FORM SECTION TITLE
========================================================= */
.form-section-title {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 0 0 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid #edf1ef;
  color: #405967;
  font-size: 10.5px;
  font-weight: var(--fw-bold);
  letter-spacing: var(--ls-caps);
  text-transform: uppercase;
}

.form-section-title--spaced {
  margin-top: 14px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.form-field {
  margin-bottom: 8px;
}

.form-field :deep(.q-field__control) {
  min-height: 34px;
}

.form-field :deep(.q-field__native),
.form-field :deep(.q-field__input) {
  font-size: 13px;
}

/* Readonly input look */
.readonly-input :deep(.q-field__control) {
  background: #f2f4f6;
}
.readonly-input :deep(.q-field__native),
.readonly-input :deep(.q-field__input) {
  color: #5c6b78;
  font-weight: 500;
  cursor: default;
}
.readonly-input :deep(.q-field__control:before) {
  border-color: #e6e8eb;
}
.lock-icon {
  color: #b3bcc4;
  font-size: 12px;
}

/* =========================================================
   SELECTED EMPLOYEE BANNER
========================================================= */
.selected-employee-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  padding: 8px 12px;
  background: #ecf8ee;
  border: 1px solid #d3ecd8;
  border-radius: 6px;
}

.selected-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #159447;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.4px;
}

.selected-employee-text {
  flex: 1;
  min-width: 0;
}

.selected-employee-name {
  color: #19354a;
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  line-height: var(--lh-tight);
  overflow-wrap: anywhere;
}

.selected-employee-meta {
  margin-top: 1px;
  color: #6b7680;
  font-size: var(--fs-xs);
  overflow-wrap: anywhere;
}

.selected-employee-actions {
  display: flex;
  align-items: center;
  gap: 0;
  flex-shrink: 0;
}

.banner-action {
  color: #159447;
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  min-height: 28px;
  padding: 0 8px;
}
.banner-action:hover {
  background: #d3ecd8;
}
.banner-action--icon {
  color: #5c6b78;
  min-width: 28px;
  padding: 0;
}
.banner-action--icon:hover {
  color: #c0392b;
  background: #fbe9e9;
}

/* =========================================================
   DIRECTORY EMPTY STATE
========================================================= */
.directory-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 12px;
  margin-bottom: 10px;
  background: #fafbfc;
  border: 1px dashed #dde1e5;
  border-radius: 6px;
  text-align: center;
}

.directory-empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #eef1f4;
  color: #8a95a0;
}

.directory-empty-title {
  color: #405967;
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
}

.directory-empty-text {
  color: #8a95a0;
  font-size: var(--fs-xs);
  line-height: var(--lh-relaxed);
  max-width: 300px;
}

.btn-select-directory {
  min-height: 32px;
  padding: 0 14px;
  margin-top: 4px;
  color: #ffffff;
  background: #f5a623;
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(232, 145, 26, 0.2);
}
.btn-select-directory:hover {
  background: #e8911a;
}

/* =========================================================
   PICKER DIALOG
========================================================= */
.picker-dialog {
  width: min(520px, 92vw);
  max-width: 92vw;
  display: flex;
  flex-direction: column;
  border-radius: 10px;
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
}

.picker-title {
  font-size: var(--fs-base);
  font-weight: var(--fw-bold);
  color: #19354a;
}

.picker-subtitle {
  margin-top: 2px;
  font-size: var(--fs-xs);
  color: #8a95a0;
}

.picker-close {
  color: #8a95a0;
  min-width: 30px;
  min-height: 30px;
}

.picker-toolbar {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 14px;
}

.picker-toolbar--stack {
  gap: 6px;
}

.picker-office-select,
.picker-search {
  width: 100%;
}

.picker-office-select :deep(.q-field__control),
.picker-search :deep(.q-field__control) {
  min-height: 34px;
}

.picker-list {
  padding: 0;
  min-height: 180px;
  max-height: 40vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.picker-items {
  display: flex;
  flex-direction: column;
}

.picker-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  cursor: pointer;
  border-bottom: 1px solid #f2f4f6;
  transition: background 0.12s ease;
  -webkit-tap-highlight-color: transparent;
}

.picker-item:last-child {
  border-bottom: none;
}

.picker-item:hover {
  background: #f7f8f9;
}

.picker-item.is-selected {
  background: #eef4fb;
}

.picker-lead-icon {
  color: #b3bcc4;
  flex-shrink: 0;
  font-size: 16px;
}
.picker-lead-icon.is-selected {
  color: #159447;
}

.picker-avatar {
  width: 28px;
  height: 28px;
  min-width: 28px;
  border-radius: 50%;
  background: #e2e7ec;
  color: #4a5763;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10.5px;
  font-weight: 700;
}

.picker-item.is-selected .picker-avatar {
  background: #2b3a4a;
  color: #ffffff;
}

.picker-info {
  flex: 1;
  min-width: 0;
}

.picker-name {
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  color: #1a2332;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.picker-meta {
  margin-top: 1px;
  font-size: var(--fs-xs);
  color: #97a1a9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.picker-badge {
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.3px;
  flex-shrink: 0;
}

.picker-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 32px 16px;
  color: #b3bcc4;
  font-size: var(--fs-sm);
  text-align: center;
}

.picker-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 14px;
}

.picker-count {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  color: #5c6b78;
  min-width: 0;
}

.picker-count span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* =========================================================
   ACTIONS
========================================================= */
.edit-actions {
  padding: 8px 14px;
}

.dialog-cancel-btn {
  color: #708088;
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
}

.save-btn {
  min-height: 30px;
  padding: 0 14px;
  color: #ffffff;
  background: #f5a623;
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
}

.btn-primary {
  min-height: 30px;
  padding: 0 14px;
  color: #ffffff;
  background: linear-gradient(135deg, #f5a623, #e8911a);
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  box-shadow: 0 2px 6px rgba(232, 145, 26, 0.2);
}
.btn-primary--sm {
  min-height: 30px;
  padding: 0 14px;
  font-size: var(--fs-xs);
}

/* =========================================================
   RESPONSIVE
========================================================= */
@media (max-width: 800px) {
  .officials-grid {
    grid-template-columns: 1fr;
  }

  .edit-dialog {
    width: 94vw;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }
}

@media (max-width: 650px) {
  .module-page {
    padding: 12px;
  }

  .page-header {
    align-items: flex-start;
    gap: 8px;
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
  }

  .refresh-btn {
    width: 100%;
  }

  .form-field :deep(.q-field__native),
  .form-field :deep(.q-field__input) {
    font-size: 16px;
  }

  .form-field :deep(.q-field__control) {
    min-height: 40px;
  }

  .save-btn {
    min-height: 38px;
  }

  .selected-employee-banner {
    flex-wrap: wrap;
  }

  .selected-employee-actions {
    width: 100%;
    justify-content: flex-end;
  }
}

@media (max-width: 599px) {
  .picker-dialog {
    width: 100%;
    max-width: 100%;
    height: 100%;
    border-radius: 0;
  }

  .picker-list {
    flex: 1;
    max-height: none;
  }
}

@media (max-width: 400px) {
  .dialog-header {
    padding: 10px 14px;
  }

  .edit-section {
    padding: 10px 14px 2px;
  }
}
</style>
