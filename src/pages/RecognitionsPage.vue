<template>
  <q-page class="module-page">
    <!-- PAGE HEADER -->
    <section class="page-header">
      <div class="page-header-text">
        <div class="page-eyebrow">Employee Achievement</div>
        <h5>My Office Nominations</h5>
        <p v-if="currentUser.office">
          Submissions from <strong>{{ currentUser.office }}</strong>
        </p>
        <p v-else>Manage licensure and graduate studies nominations.</p>
      </div>

      <q-btn
        unelevated
        no-caps
        icon="add"
        label="New Nomination"
        class="primary-btn"
        @click="openAddRecognition"
      />
    </section>

    <!-- RETURNED BANNER -->
    <q-banner v-if="returnedCount > 0" dense class="returned-banner">
      <template #avatar>
        <q-icon name="priority_high" size="20px" />
      </template>
      <span>
        <strong>{{ returnedCount }}</strong>
        nomination{{ returnedCount > 1 ? "s" : "" }} returned for revision —
        review and resubmit.
      </span>
      <template #action>
        <q-btn
          flat
          no-caps
          dense
          label="Show returned"
          @click="filterStatus = 'returned'"
        />
      </template>
    </q-banner>

    <!-- TABLE CARD -->
    <q-card flat class="events-card">
      <div class="filter-section">
        <q-input
          v-model="search"
          outlined
          dense
          clearable
          placeholder="Search by employee, reference no., or details..."
          class="search-input"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-select
          v-model="filterType"
          outlined
          dense
          clearable
          label="Type"
          :options="typeFilterOptions"
          class="filter-select"
        />

        <q-select
          v-model="filterStatus"
          outlined
          dense
          clearable
          label="Status"
          :options="statusFilterOptions"
          class="filter-select"
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

      <div class="table-wrapper">
        <q-table
          flat
          :rows="filteredRows"
          :columns="columns"
          row-key="id"
          :loading="loading"
          class="events-table"
          v-model:pagination="pagination"
          :rows-per-page-options="[10, 25, 50, 0]"
          @request="onRequest"
        >
          <template #body-cell-no="props">
            <q-td :props="props" class="cell-no">
              {{ rowNumber(props.rowIndex) }}
            </q-td>
          </template>

          <template #body-cell-employee="props">
            <q-td :props="props">
              <div class="event-name">{{ props.row.employee }}</div>
              <div class="event-meta">{{ props.row.reference_no }}</div>
            </q-td>
          </template>

          <template #body-cell-type="props">
            <q-td :props="props">
              <span class="type-badge" :class="getTypeClass(props.row.type)">
                {{ getTypeLabel(props.row.type) }}
              </span>
            </q-td>
          </template>

          <template #body-cell-details="props">
            <q-td :props="props">
              <div class="details-text">{{ props.row.details_summary }}</div>
            </q-td>
          </template>

          <template #body-cell-date="props">
            <q-td :props="props">
              <div class="date-text">
                {{ formatDate(props.row.event_date) }}
              </div>
            </q-td>
          </template>

          <template #body-cell-status="props">
            <q-td :props="props">
              <span class="status-badge" :class="statusClass(props.row.status)">
                {{ statusLabel(props.row.status) }}
              </span>
            </q-td>
          </template>

          <template #body-cell-actions="props">
            <q-td :props="props">
              <div class="action-buttons">
                <q-btn
                  flat
                  round
                  dense
                  icon="visibility"
                  class="action-view"
                  @click="viewRecognition(props.row.id)"
                >
                  <q-tooltip>View details</q-tooltip>
                </q-btn>

                <q-btn
                  v-if="canEditRow(props.row)"
                  flat
                  round
                  dense
                  icon="edit"
                  class="action-edit"
                  @click="editRecognition(props.row)"
                >
                  <q-tooltip>Edit</q-tooltip>
                </q-btn>

                <q-btn
                  v-for="t in allowedTransitions(props.row)"
                  :key="t.to"
                  flat
                  round
                  dense
                  :icon="iconForTransition(t.to)"
                  class="action-transition"
                  @click="transitionRow(props.row, t.to)"
                >
                  <q-tooltip>{{ t.label }}</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>

          <template #no-data>
            <div class="table-empty">
              <q-icon name="inbox" size="36px" class="table-empty-icon" />
              <div class="table-empty-title">No nominations yet</div>
              <div class="table-empty-sub">
                Click <strong>New Nomination</strong> to submit your first one.
              </div>
            </div>
          </template>

          <template #bottom="scope">
            <div class="pagination-bar">
              <div class="pagination-summary">
                Showing
                <strong
                  >{{ scope.pagination.rowsNumber === 0 ? 0 : rangeStart }}–{{
                    rangeEnd
                  }}</strong
                >
                of
                <strong>{{ scope.pagination.rowsNumber }}</strong>
                nominations
              </div>

              <div class="pagination-controls">
                <div class="pagination-rpp">
                  <span class="rpp-label">Rows per page:</span>
                  <q-select
                    v-model="pagination.rowsPerPage"
                    :options="rowsPerPageOptions"
                    dense
                    borderless
                    emit-value
                    map-options
                    options-dense
                    class="rpp-select"
                  />
                </div>

                <div class="pagination-buttons">
                  <q-btn
                    flat
                    round
                    dense
                    icon="first_page"
                    :disable="scope.pagesNumber <= 1 || scope.isFirstPage"
                    @click="goToPage(1)"
                  />
                  <q-btn
                    flat
                    round
                    dense
                    icon="chevron_left"
                    :disable="scope.isFirstPage"
                    @click="goToPage(scope.pagination.page - 1)"
                  />
                  <div class="page-indicator">
                    Page
                    <strong>{{ scope.pagination.page }}</strong>
                    of
                    <strong>{{ Math.max(scope.pagesNumber, 1) }}</strong>
                  </div>
                  <q-btn
                    flat
                    round
                    dense
                    icon="chevron_right"
                    :disable="scope.isLastPage"
                    @click="goToPage(scope.pagination.page + 1)"
                  />
                  <q-btn
                    flat
                    round
                    dense
                    icon="last_page"
                    :disable="scope.pagesNumber <= 1 || scope.isLastPage"
                    @click="goToPage(scope.pagesNumber)"
                  />
                </div>
              </div>
            </div>
          </template>
        </q-table>
      </div>
    </q-card>

    <!-- EDIT DIALOG -->
    <q-dialog v-model="showFormDialog" persistent>
      <q-card class="event-dialog" style="width: 780px; max-width: 95vw">
        <q-card-section class="dialog-header">
          <div>
            <div class="dialog-title">Edit Nomination</div>
            <div class="dialog-subtitle">
              Update the details, then save as draft or submit for review.
            </div>
          </div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="dialog-body">
          <div class="section-label">Nomination Type</div>
          <q-select
            v-model="form.type"
            outlined
            dense
            emit-value
            map-options
            :options="recognitionTypeOptions"
            label="Select type"
            @update:model-value="onTypeChange"
          />

          <div v-if="form.type === 'exam'" class="dynamic-section">
            <div class="section-label">Examination Details</div>
            <div class="form-grid">
              <q-input
                v-model="form.employee"
                outlined
                dense
                label="Employee Name"
                class="col-span-2"
                hint="If multiple employees, use comma separated"
              />
              <q-input
                v-model="form.position"
                outlined
                dense
                label="Position"
              />
              <q-input
                v-model="form.employment_status"
                outlined
                dense
                label="Status of Employment"
              />
              <q-input
                v-model="form.mobile_no"
                outlined
                dense
                label="Mobile No."
              />
              <q-select
                v-model="form.department"
                outlined
                dense
                emit-value
                map-options
                :options="departmentOptions"
                label="Department / Office"
                class="col-span-2"
              />
              <q-select
                v-model="form.exam_type"
                outlined
                dense
                emit-value
                map-options
                :options="examTypeOptions"
                label="Type of Examination Passed"
                class="col-span-2"
              />
              <q-select
                v-model="form.administering_agency"
                outlined
                dense
                emit-value
                map-options
                :options="agencyOptions"
                label="Administering Agency"
              />
              <q-input
                v-model="form.exam_rating"
                outlined
                dense
                label="Examination Rating"
              />
              <q-input
                v-model="form.testing_center"
                outlined
                dense
                label="Testing Center"
              />
              <q-input
                v-model="form.exam_date"
                outlined
                dense
                label="Date of Examination"
                type="date"
              />
            </div>

            <div class="section-label">Supporting Documents (Required)</div>
            <div class="form-grid">
              <q-file
                v-model="form.doc_rating"
                outlined
                dense
                label="Report of Rating"
                accept=".pdf,.jpg,.png"
                class="col-span-2"
              >
                <template #prepend><q-icon name="attach_file" /></template>
              </q-file>
              <q-file
                v-model="form.doc_photo"
                outlined
                dense
                label="Recent Photo"
                accept=".jpg,.png"
                class="col-span-2"
              >
                <template #prepend><q-icon name="photo" /></template>
              </q-file>
              <q-file
                v-model="form.doc_screenshot"
                outlined
                dense
                label="Screenshot from CSC/PRC Website"
                accept=".jpg,.png,.pdf"
                class="col-span-2"
              >
                <template #prepend><q-icon name="screenshot" /></template>
              </q-file>
            </div>
          </div>

          <div v-if="form.type === 'graduate_studies'" class="dynamic-section">
            <div class="section-label">Graduate Studies Details</div>
            <div class="form-grid">
              <q-input
                v-model="form.employee"
                outlined
                dense
                label="Employee Name"
                class="col-span-2"
              />
              <q-input
                v-model="form.position"
                outlined
                dense
                label="Position"
              />
              <q-input
                v-model="form.mobile_no"
                outlined
                dense
                label="Mobile No."
              />
              <q-select
                v-model="form.department"
                outlined
                dense
                emit-value
                map-options
                :options="departmentOptions"
                label="Department / Office"
                class="col-span-2"
              />
              <q-input
                v-model="form.degree_completed"
                outlined
                dense
                label="Degree Completed"
                class="col-span-2"
                hint="e.g. Master of Public Administration"
              />
              <q-input
                v-model="form.major_specialization"
                outlined
                dense
                label="Major / Specialization"
                class="col-span-2"
              />
              <q-input
                v-model="form.university"
                outlined
                dense
                label="Name of College / University"
                class="col-span-2"
              />
              <q-input
                v-model="form.graduation_date"
                outlined
                dense
                label="Date of Completion / Graduation"
                type="date"
              />
              <q-select
                v-model="form.learning_mode"
                outlined
                dense
                emit-value
                map-options
                :options="learningModeOptions"
                label="Mode of Learning"
              />
            </div>

            <div class="section-label">Supporting Documents</div>
            <div class="form-grid">
              <q-file
                v-model="form.doc_certificate"
                outlined
                dense
                label="Certificate of Graduation/Completion"
                accept=".pdf,.jpg,.png"
                class="col-span-2"
              >
                <template #prepend><q-icon name="description" /></template>
              </q-file>
              <q-file
                v-model="form.doc_yearbook"
                outlined
                dense
                label="Graduation/Yearbook Photo (optional)"
                accept=".jpg,.png"
                class="col-span-2"
              >
                <template #prepend><q-icon name="photo_library" /></template>
              </q-file>
              <q-file
                v-model="form.doc_diploma"
                outlined
                dense
                label="Diploma and/or TOR"
                accept=".pdf,.jpg,.png"
                class="col-span-2"
              >
                <template #prepend><q-icon name="school" /></template>
              </q-file>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat no-caps label="Cancel" class="cancel-btn" v-close-popup />
          <q-btn
            flat
            no-caps
            label="Save Draft"
            class="draft-btn"
            :loading="loading"
            @click="saveRecognition('draft')"
          />
          <q-btn
            unelevated
            no-caps
            label="Save & Submit"
            class="primary-btn-sm"
            :loading="loading"
            @click="saveRecognition('nominated')"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- WITHDRAW CONFIRMATION -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card class="delete-dialog">
        <q-card-section class="dialog-body">
          <div class="delete-title">Withdraw Nomination</div>
          <div class="delete-message">
            This will permanently remove the nomination and its attachments.
            This cannot be undone.
          </div>
        </q-card-section>
        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat no-caps label="Cancel" class="cancel-btn" v-close-popup />
          <q-btn
            unelevated
            no-caps
            label="Withdraw"
            class="delete-btn"
            :loading="loading"
            @click="deleteRecognition"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";

/* =========================================================
   INLINE WORKFLOW CONSTANTS
========================================================= */
const STATE_LABELS = {
  draft: "Draft",
  nominated: "Nominated",
  under_review: "Under Review",
  returned: "Returned",
  rejected: "Rejected",
  approved: "Approved",
  announced: "Announced",
};

const STATE_CLASSES = {
  draft: "status-draft",
  nominated: "status-nominated",
  under_review: "status-review",
  returned: "status-returned",
  rejected: "status-rejected",
  approved: "status-approved",
  announced: "status-announced",
};

const TRANSITIONS = {
  draft: ["nominated"],
  nominated: ["under_review"],
  under_review: ["returned", "rejected", "approved"],
  returned: ["nominated"],
  rejected: [],
  approved: ["announced"],
  announced: [],
};

const TRANSITION_ACTORS = {
  "draft→nominated": ["office_admin", "hr_admin", "hr_supervisor"],
  "nominated→under_review": ["hr_admin", "hr_supervisor"],
  "under_review→returned": ["hr_admin", "hr_supervisor"],
  "under_review→rejected": ["hr_admin", "hr_supervisor"],
  "under_review→approved": ["hr_admin", "hr_supervisor"],
  "returned→nominated": ["office_admin"],
  "approved→announced": ["hr_supervisor"],
};

const TRANSITION_LABELS = {
  nominated: "Submit Nomination",
  under_review: "Start Review",
  returned: "Return",
  rejected: "Reject",
  approved: "Approve",
  announced: "Announce",
};

export default defineComponent({
  name: "OfficeAchievementsPage",

  setup() {
    const $q = useQuasar();
    const router = useRouter();

    // ---------- MOCK USER (replace with real auth store) ----------
    const currentUser = ref({
      id: "u-1",
      name: "Rosa Dela Cruz",
      role: "office_admin",
      office: "Human Resource Department",
    });

    const search = ref("");
    const filterType = ref(null);
    const filterStatus = ref(null);
    const loading = ref(false);
    const showFormDialog = ref(false);
    const showDeleteDialog = ref(false);
    const isEditMode = ref(false);
    const editingId = ref(null);

    // ---------- Pagination ----------
    const pagination = ref({
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0,
      sortBy: null,
      descending: false,
    });

    const rowsPerPageOptions = [
      { label: "10", value: 10 },
      { label: "25", value: 25 },
      { label: "50", value: 50 },
      { label: "All", value: 0 },
    ];

    // ---------- Options ----------
    const recognitionTypeOptions = [
      { label: "Licensure / CSC Exam Passer", value: "exam" },
      { label: "Completion of Graduate Studies", value: "graduate_studies" },
    ];
    const typeFilterOptions = [
      { label: "Licensure Exam", value: "exam" },
      { label: "Graduate Studies", value: "graduate_studies" },
    ];
    const statusFilterOptions = [
      { label: "Draft", value: "draft" },
      { label: "Nominated", value: "nominated" },
      { label: "Under Review", value: "under_review" },
      { label: "Returned", value: "returned" },
      { label: "Rejected", value: "rejected" },
      { label: "Approved", value: "approved" },
      { label: "Announced", value: "announced" },
    ];
    const departmentOptions = [
      { label: "Human Resource Department", value: "hr" },
      { label: "Information Technology", value: "it" },
      { label: "Finance", value: "finance" },
      { label: "Operations", value: "operations" },
      { label: "Administration", value: "admin" },
      { label: "Office of the Mayor", value: "mayor" },
      { label: "City Planning", value: "planning" },
      { label: "Social Welfare", value: "sw" },
      { label: "Engineering", value: "engineering" },
    ];
    const examTypeOptions = [
      { label: "Civil Service Examination - Professional", value: "csc_prof" },
      {
        label: "Civil Service Examination - Subprofessional",
        value: "csc_subprof",
      },
      { label: "Civil Service Examination - Barangay", value: "csc_barangay" },
      { label: "PRC - Licensure Exam for Teachers (LET)", value: "prc_let" },
      { label: "PRC - Nurse Licensure Exam (NLE)", value: "prc_nle" },
      { label: "PRC - Civil Engineer Licensure Exam", value: "prc_ce" },
      { label: "PRC - Accountancy Licensure Exam", value: "prc_cpa" },
      { label: "PRC - Architect Licensure Exam", value: "prc_arch" },
      { label: "PRC - Other Professional Exam", value: "prc_other" },
    ];
    const agencyOptions = [
      { label: "Civil Service Commission (CSC)", value: "csc" },
      { label: "Professional Regulation Commission (PRC)", value: "prc" },
    ];
    const learningModeOptions = [
      { label: "Face-to-Face (F2F)", value: "f2f" },
      { label: "Online", value: "online" },
      { label: "Distance Learning", value: "distance" },
      { label: "Hybrid", value: "hybrid" },
    ];

    // ---------- Columns ----------
    const columns = [
      {
        name: "no",
        label: "NO.",
        field: "no",
        align: "left",
        style: "width: 56px",
      },
      {
        name: "employee",
        label: "EMPLOYEE",
        field: "employee",
        align: "left",
        sortable: true,
      },
      { name: "type", label: "TYPE", field: "type", align: "left" },
      {
        name: "details",
        label: "DETAILS",
        field: "details_summary",
        align: "left",
      },
      { name: "date", label: "DATE", field: "event_date", align: "left" },
      { name: "status", label: "STATUS", field: "status", align: "left" },
      { name: "actions", label: "", field: "actions", align: "right" },
    ];

    // ---------- Sample data ----------
    const recognitions = ref([
      {
        id: "rec-1",
        reference_no: "REC-2026-000123",
        employee: "Maria Santos, John Doe",
        office: "Human Resource Department",
        department: "hr",
        department_label: "Human Resource Department",
        position: "HR Specialist",
        type: "exam",
        exam_type: "csc_prof",
        exam_type_label: "CSC - Professional",
        administering_agency: "csc",
        exam_rating: "92.5%",
        testing_center: "Manila",
        exam_date: "2026-06-15",
        employment_status: "Permanent",
        mobile_no: "09171234567",
        status: "approved",
        remarks: "",
        details_summary: "CSC Professional (92.5%)",
        event_date: "2026-06-15",
      },
      {
        id: "rec-2",
        reference_no: "REC-2026-000124",
        employee: "Ana Reyes",
        office: "Human Resource Department",
        department: "hr",
        department_label: "Human Resource Department",
        position: "HR Assistant",
        type: "graduate_studies",
        degree_completed: "Master of Public Administration",
        major_specialization: "Public Policy",
        university: "University of the Philippines Diliman",
        graduation_date: "2026-05-30",
        learning_mode: "f2f",
        learning_mode_label: "Face-to-Face",
        mobile_no: "09179876543",
        status: "returned",
        remarks: "Please attach updated Diploma/TOR.",
        details_summary: "MPA — UP Diliman",
        event_date: "2026-05-30",
      },
      {
        id: "rec-3",
        reference_no: "REC-2026-000125",
        employee: "Carlo Mendoza",
        office: "Human Resource Department",
        department: "hr",
        department_label: "Human Resource Department",
        position: "Administrative Officer",
        type: "exam",
        exam_type: "prc_ce",
        exam_type_label: "PRC - Civil Engineer",
        administering_agency: "prc",
        exam_rating: "85.0%",
        testing_center: "Davao",
        exam_date: "2026-04-10",
        employment_status: "Permanent",
        mobile_no: "09181234567",
        status: "under_review",
        remarks: "",
        details_summary: "PRC Civil Engineer (85.0%)",
        event_date: "2026-04-10",
      },
      {
        id: "rec-4",
        reference_no: "REC-2026-000126",
        employee: "Liza Fernandez",
        office: "Human Resource Department",
        department: "hr",
        department_label: "Human Resource Department",
        position: "HR Officer",
        type: "exam",
        exam_type: "csc_subprof",
        exam_type_label: "CSC - Subprofessional",
        administering_agency: "csc",
        exam_rating: "88.0%",
        testing_center: "Tagum",
        exam_date: "2026-03-22",
        employment_status: "Permanent",
        mobile_no: "09192223344",
        status: "nominated",
        remarks: "",
        details_summary: "CSC Subprofessional (88.0%)",
        event_date: "2026-03-22",
      },
      {
        id: "rec-5",
        reference_no: "REC-2026-000127",
        employee: "Mark Villanueva",
        office: "Human Resource Department",
        department: "hr",
        department_label: "Human Resource Department",
        position: "HR Clerk",
        type: "graduate_studies",
        degree_completed: "Master in Business Administration",
        major_specialization: "Human Resources",
        university: "University of Mindanao",
        graduation_date: "2026-02-18",
        learning_mode: "online",
        learning_mode_label: "Online",
        mobile_no: "09193334455",
        status: "approved",
        remarks: "",
        details_summary: "MBA — UM",
        event_date: "2026-02-18",
      },
      {
        id: "rec-6",
        reference_no: "REC-2026-000128",
        employee: "Rachel Domingo",
        office: "Human Resource Department",
        department: "hr",
        department_label: "Human Resource Department",
        position: "Records Officer",
        type: "exam",
        exam_type: "prc_let",
        exam_type_label: "PRC - LET (Teachers)",
        administering_agency: "prc",
        exam_rating: "90.0%",
        testing_center: "Davao",
        exam_date: "2026-01-25",
        employment_status: "Permanent",
        mobile_no: "09194445566",
        status: "announced",
        remarks: "",
        details_summary: "PRC LET (90.0%)",
        event_date: "2026-01-25",
      },
      {
        id: "rec-7",
        reference_no: "REC-2026-000129",
        employee: "Paolo Rivera",
        office: "Human Resource Department",
        department: "hr",
        department_label: "Human Resource Department",
        position: "Admin Aide",
        type: "exam",
        exam_type: "csc_prof",
        exam_type_label: "CSC - Professional",
        administering_agency: "csc",
        exam_rating: "84.5%",
        testing_center: "Tagum",
        exam_date: "2025-12-10",
        employment_status: "Permanent",
        mobile_no: "09195556677",
        status: "nominated",
        remarks: "",
        details_summary: "CSC Professional (84.5%)",
        event_date: "2025-12-10",
      },
      {
        id: "rec-8",
        reference_no: "REC-2026-000130",
        employee: "Nadia Lim",
        office: "Human Resource Department",
        department: "hr",
        department_label: "Human Resource Department",
        position: "HR Assistant",
        type: "graduate_studies",
        degree_completed: "Master of Public Administration",
        major_specialization: "Local Governance",
        university: "Ateneo de Davao University",
        graduation_date: "2025-11-05",
        learning_mode: "f2f",
        learning_mode_label: "Face-to-Face",
        mobile_no: "09196667788",
        status: "approved",
        remarks: "",
        details_summary: "MPA — AdDU",
        event_date: "2025-11-05",
      },
      {
        id: "rec-9",
        reference_no: "REC-2026-000131",
        employee: "Ethan Cruz",
        office: "Human Resource Department",
        department: "hr",
        department_label: "Human Resource Department",
        position: "HR Clerk",
        type: "exam",
        exam_type: "prc_nle",
        exam_type_label: "PRC - Nurse Licensure Exam (NLE)",
        administering_agency: "prc",
        exam_rating: "86.25%",
        testing_center: "Davao",
        exam_date: "2025-10-15",
        employment_status: "Permanent",
        mobile_no: "09197778899",
        status: "draft",
        remarks: "",
        details_summary: "PRC NLE (86.25%)",
        event_date: "2025-10-15",
      },
      {
        id: "rec-10",
        reference_no: "REC-2026-000132",
        employee: "Sophia Tan",
        office: "Human Resource Department",
        department: "hr",
        department_label: "Human Resource Department",
        position: "HR Specialist",
        type: "graduate_studies",
        degree_completed: "Doctor of Public Administration",
        major_specialization: "Governance",
        university: "University of the Philippines",
        graduation_date: "2025-09-20",
        learning_mode: "hybrid",
        learning_mode_label: "Hybrid",
        mobile_no: "09198889900",
        status: "announced",
        remarks: "",
        details_summary: "DPA — UP",
        event_date: "2025-09-20",
      },
      {
        id: "rec-11",
        reference_no: "REC-2026-000133",
        employee: "Diego Santos",
        office: "Human Resource Department",
        department: "hr",
        department_label: "Human Resource Department",
        position: "Admin Aide",
        type: "exam",
        exam_type: "csc_barangay",
        exam_type_label: "CSC - Barangay",
        administering_agency: "csc",
        exam_rating: "82.0%",
        testing_center: "Tagum",
        exam_date: "2025-08-14",
        employment_status: "Permanent",
        mobile_no: "09199990011",
        status: "rejected",
        remarks: "Insufficient supporting documents.",
        details_summary: "CSC Barangay (82.0%)",
        event_date: "2025-08-14",
      },
      {
        id: "rec-12",
        reference_no: "REC-2026-000134",
        employee: "Hannah Reyes",
        office: "Human Resource Department",
        department: "hr",
        department_label: "Human Resource Department",
        position: "Records Officer",
        type: "exam",
        exam_type: "prc_cpa",
        exam_type_label: "PRC - Accountancy (CPA)",
        administering_agency: "prc",
        exam_rating: "89.75%",
        testing_center: "Manila",
        exam_date: "2025-07-02",
        employment_status: "Permanent",
        mobile_no: "09201112233",
        status: "nominated",
        remarks: "",
        details_summary: "PRC CPA (89.75%)",
        event_date: "2025-07-02",
      },
    ]);

    const form = ref(blankForm());
    function blankForm() {
      return {
        type: null,
        employee: "",
        position: "",
        mobile_no: "",
        department: "",
        remarks: "",
        employment_status: "",
        exam_type: "",
        administering_agency: "",
        exam_rating: "",
        testing_center: "",
        exam_date: "",
        doc_rating: null,
        doc_photo: null,
        doc_screenshot: null,
        degree_completed: "",
        major_specialization: "",
        university: "",
        graduation_date: "",
        learning_mode: "",
        doc_certificate: null,
        doc_yearbook: null,
        doc_diploma: null,
      };
    }

    // ---------- Computed ----------
    const officeRecognitions = computed(() => {
      const office = currentUser.value?.office;
      if (!office) return recognitions.value;
      return recognitions.value.filter((r) => r.office === office);
    });

    const returnedCount = computed(
      () =>
        officeRecognitions.value.filter((r) => r.status === "returned").length
    );

    const filteredRows = computed(() => {
      let result = officeRecognitions.value;
      const keyword = search.value.toLowerCase().trim();
      if (keyword) {
        result = result.filter(
          (r) =>
            r.employee?.toLowerCase().includes(keyword) ||
            r.reference_no?.toLowerCase().includes(keyword) ||
            r.details_summary?.toLowerCase().includes(keyword)
        );
      }
      if (filterType.value)
        result = result.filter((r) => r.type === filterType.value);
      if (filterStatus.value)
        result = result.filter((r) => r.status === filterStatus.value);
      return result;
    });

    const rangeStart = computed(() => {
      if (filteredRows.value.length === 0) return 0;
      if (pagination.value.rowsPerPage === 0) return 1;
      return (pagination.value.page - 1) * pagination.value.rowsPerPage + 1;
    });

    const rangeEnd = computed(() => {
      if (pagination.value.rowsPerPage === 0) return filteredRows.value.length;
      return Math.min(
        pagination.value.page * pagination.value.rowsPerPage,
        filteredRows.value.length
      );
    });

    // ---------- Watchers ----------
    watch(
      () => [search.value, filterType.value, filterStatus.value],
      () => {
        pagination.value.page = 1;
      }
    );

    watch(
      () => filteredRows.value.length,
      (total) => {
        pagination.value.rowsNumber = total;
        const perPage = pagination.value.rowsPerPage;
        const maxPage =
          perPage === 0 ? 1 : Math.max(1, Math.ceil(total / perPage));
        if (pagination.value.page > maxPage) {
          pagination.value.page = maxPage;
        }
      },
      { immediate: true }
    );

    onMounted(() => {
      // TODO: replace with recognitionStore.fetchForOffice(currentUser.value.office)
    });

    // ---------- Helpers ----------
    function rowNumber(indexInPage) {
      if (pagination.value.rowsPerPage === 0) return indexInPage + 1;
      return (
        (pagination.value.page - 1) * pagination.value.rowsPerPage +
        indexInPage +
        1
      );
    }

    function goToPage(page) {
      pagination.value.page = page;
    }

    function onRequest(request) {
      pagination.value = {
        ...pagination.value,
        page: request.pagination.page,
        rowsPerPage: request.pagination.rowsPerPage,
      };
    }

    function getTypeLabel(t) {
      return (
        { exam: "Licensure Exam", graduate_studies: "Graduate Studies" }[t] || t
      );
    }
    function getTypeClass(t) {
      return { exam: "type-exam", graduate_studies: "type-graduate" }[t] || "";
    }
    function statusClass(s) {
      return STATE_CLASSES[s] || "";
    }
    function statusLabel(s) {
      return STATE_LABELS[s] || s;
    }
    function formatDate(iso) {
      if (!iso) return "—";
      const d = new Date(iso);
      if (isNaN(d)) return iso;
      return d.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
    function iconForTransition(to) {
      return (
        {
          nominated: "send",
          under_review: "visibility",
          returned: "undo",
          rejected: "block",
          approved: "check_circle",
          announced: "campaign",
        }[to] || "arrow_forward"
      );
    }
    function clearFilters() {
      search.value = "";
      filterType.value = null;
      filterStatus.value = null;
    }

    // ---------- Inline role + workflow ----------
    function canEditRow(row) {
      if (!row) return false;
      const role = currentUser.value.role;
      if (role === "office_admin") {
        return ["draft", "returned"].includes(row.status);
      }
      if (role === "hr_admin") {
        return row.status === "under_review";
      }
      return false;
    }

    function allowedTransitions(row) {
      const role = currentUser.value.role;
      const from = row.status;
      const nexts = TRANSITIONS[from] || [];
      return nexts
        .filter((to) => {
          const actors = TRANSITION_ACTORS[`${from}→${to}`] || [];
          return actors.includes(role);
        })
        .map((to) => ({ to, label: TRANSITION_LABELS[to] || to }));
    }

    // ---------- Navigation ----------
    function openAddRecognition() {
      router.push({ name: "create_recognition" });
    }
    function viewRecognition(id) {
      router.push({ name: "recognition_detail", params: { id } });
    }

    // ---------- Edit ----------
    function editRecognition(row) {
      isEditMode.value = true;
      editingId.value = row.id;
      form.value = {
        type: row.type,
        employee: row.employee || "",
        position: row.position || "",
        mobile_no: row.mobile_no || "",
        department: row.department || "",
        remarks: row.remarks || "",
        employment_status: row.employment_status || "",
        exam_type: row.exam_type || "",
        administering_agency: row.administering_agency || "",
        exam_rating: row.exam_rating || "",
        testing_center: row.testing_center || "",
        exam_date: row.exam_date || "",
        doc_rating: null,
        doc_photo: null,
        doc_screenshot: null,
        degree_completed: row.degree_completed || "",
        major_specialization: row.major_specialization || "",
        university: row.university || "",
        graduation_date: row.graduation_date || "",
        learning_mode: row.learning_mode || "",
        doc_certificate: null,
        doc_yearbook: null,
        doc_diploma: null,
      };
      showFormDialog.value = true;
    }

    function onTypeChange() {
      form.value = { ...blankForm(), type: form.value.type };
    }

    // ---------- Save ----------
    async function saveRecognition(targetState = "nominated") {
      loading.value = true;
      await new Promise((r) => setTimeout(r, 600));
      const now = new Date().toISOString();

      const updated = {
        employee: form.value.employee,
        department: form.value.department,
        department_label:
          departmentOptions.find((d) => d.value === form.value.department)
            ?.label || "",
        position: form.value.position,
        mobile_no: form.value.mobile_no,
        type: form.value.type,
        remarks: form.value.remarks,
        employment_status: form.value.employment_status,
        exam_type: form.value.exam_type,
        exam_type_label:
          examTypeOptions.find((e) => e.value === form.value.exam_type)
            ?.label || "",
        administering_agency: form.value.administering_agency,
        exam_rating: form.value.exam_rating,
        testing_center: form.value.testing_center,
        exam_date: form.value.exam_date,
        degree_completed: form.value.degree_completed,
        major_specialization: form.value.major_specialization,
        university: form.value.university,
        graduation_date: form.value.graduation_date,
        learning_mode: form.value.learning_mode,
        learning_mode_label:
          learningModeOptions.find((l) => l.value === form.value.learning_mode)
            ?.label || "",
        details_summary:
          form.value.type === "exam"
            ? `${form.value.exam_type_label || form.value.exam_type} (${
                form.value.exam_rating
              })`
            : `${form.value.degree_completed} — ${form.value.university}`,
        event_date:
          form.value.type === "exam"
            ? form.value.exam_date
            : form.value.graduation_date,
        status: targetState,
        doc_rating: form.value.doc_rating?.name || null,
        doc_photo: form.value.doc_photo?.name || null,
        doc_screenshot: form.value.doc_screenshot?.name || null,
        doc_certificate: form.value.doc_certificate?.name || null,
        doc_yearbook: form.value.doc_yearbook?.name || null,
        doc_diploma: form.value.doc_diploma?.name || null,
      };

      if (isEditMode.value) {
        const idx = recognitions.value.findIndex(
          (r) => r.id === editingId.value
        );
        if (idx !== -1) {
          const previousStatus = recognitions.value[idx].status;
          recognitions.value[idx] = {
            ...recognitions.value[idx],
            ...updated,
            workflow_events: [
              ...(recognitions.value[idx].workflow_events || []),
              {
                from: previousStatus,
                to: targetState,
                actor: currentUser.value.name,
                actor_role: currentUser.value.role,
                at: now,
              },
            ],
          };
        }
      }

      $q.notify({
        type: "positive",
        message:
          targetState === "draft" ? "Draft saved." : "Submitted for review.",
        position: "top",
      });
      loading.value = false;
      showFormDialog.value = false;
    }

    // ---------- Transition ----------
    async function transitionRow(row, to) {
      loading.value = true;
      try {
        const idx = recognitions.value.findIndex((r) => r.id === row.id);
        if (idx !== -1) {
          recognitions.value[idx] = {
            ...recognitions.value[idx],
            status: to,
            workflow_events: [
              ...(recognitions.value[idx].workflow_events || []),
              {
                from: row.status,
                to,
                actor: currentUser.value.name,
                actor_role: currentUser.value.role,
                at: new Date().toISOString(),
              },
            ],
          };
        }
        $q.notify({
          type: "positive",
          message: `Moved to ${STATE_LABELS[to]}.`,
          position: "top",
        });
      } finally {
        loading.value = false;
      }
    }

    // ---------- Delete ----------
    function confirmDeleteRecognition(row) {
      editingId.value = row.id;
      showDeleteDialog.value = true;
    }
    async function deleteRecognition() {
      loading.value = true;
      await new Promise((r) => setTimeout(r, 500));
      const idx = recognitions.value.findIndex((r) => r.id === editingId.value);
      if (idx !== -1) recognitions.value.splice(idx, 1);
      $q.notify({
        type: "positive",
        message: "Nomination withdrawn.",
        position: "top",
      });
      loading.value = false;
      showDeleteDialog.value = false;
      editingId.value = null;
    }

    return {
      currentUser,
      search,
      filterType,
      filterStatus,
      loading,
      columns,
      filteredRows,
      officeRecognitions,
      returnedCount,
      recognitions,
      form,
      showFormDialog,
      showDeleteDialog,
      isEditMode,
      pagination,
      rowsPerPageOptions,
      rangeStart,
      rangeEnd,
      recognitionTypeOptions,
      typeFilterOptions,
      statusFilterOptions,
      departmentOptions,
      examTypeOptions,
      agencyOptions,
      learningModeOptions,
      getTypeLabel,
      getTypeClass,
      statusClass,
      statusLabel,
      formatDate,
      iconForTransition,
      onTypeChange,
      clearFilters,
      openAddRecognition,
      editRecognition,
      viewRecognition,
      confirmDeleteRecognition,
      saveRecognition,
      deleteRecognition,
      transitionRow,
      canEditRow,
      allowedTransitions,
      rowNumber,
      goToPage,
      onRequest,
    };
  },
});
</script>

<style scoped>
.module-page {
  min-height: 100%;
  padding: 24px;
  color: #19354a;
  background: #f5f6f7;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 18px;
  padding: 18px 24px;
  background: #ffffff;
  border: 1px solid #e6e8eb;
  border-radius: 10px;
}

.page-header-text {
  min-width: 0;
}

.page-eyebrow {
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #8a95a0;
  margin-bottom: 4px;
}

.page-header h5 {
  margin: 0 0 4px;
  color: #1a2332;
  font-size: 22px;
  font-weight: 750;
  letter-spacing: -0.3px;
}

.page-header p {
  margin: 0;
  color: #7a8792;
  font-size: 13.5px;
}

.page-header p strong {
  color: #2b3a4a;
  font-weight: 650;
}

.primary-btn {
  min-height: 42px;
  padding: 0 20px;
  border-radius: 9px;
  color: #ffffff;
  background: linear-gradient(135deg, #f5a623, #e8911a);
  font-size: 13px;
  font-weight: 650;
  box-shadow: 0 4px 10px rgba(232, 145, 26, 0.25);
  flex-shrink: 0;
}

.returned-banner {
  margin-bottom: 16px;
  background: #fff4ed;
  color: #8a3a1a;
  border-radius: 10px;
  border-left: 4px solid #e8911a;
  font-size: 13px;
  padding: 10px 16px;
}
.returned-banner strong {
  color: #c73f3f;
  font-weight: 750;
}

.events-card {
  overflow: hidden;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid #eef1f4;
  box-shadow: 0 3px 12px rgba(30, 70, 42, 0.055);
}

.filter-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 22px;
  border-bottom: 1px solid #edf1ef;
  background: #fcfdfc;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  max-width: 380px;
}
.filter-select {
  min-width: 180px;
}

.search-input :deep(.q-field__control),
.filter-select :deep(.q-field__control) {
  min-height: 40px;
  border-radius: 8px;
}

.search-input :deep(.q-field__native),
.filter-select :deep(.q-field__native) {
  font-size: 13px;
}

.clear-btn {
  color: #6f8087;
  font-size: 13px;
}

.table-wrapper {
  padding: 0 14px;
}
.events-table {
  box-shadow: none;
}

.events-table :deep(th) {
  height: 52px;
  color: #6b7680;
  background: #ffffff;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  border-bottom: 1px solid #e8ecef;
}

.events-table :deep(td) {
  height: 72px;
  color: #425b68;
  border-color: #edf1ef;
  font-size: 13px;
}

.events-table :deep(tbody tr:hover) {
  background: #fefaf5;
}

.cell-no {
  color: #97a1a9;
  font-weight: 600;
  font-size: 12px;
}

.event-name {
  color: #19354a;
  font-size: 13px;
  font-weight: 700;
}

.event-meta {
  margin-top: 4px;
  color: #97a1a9;
  font-size: 11.5px;
  font-family: ui-monospace, "SF Mono", Menlo, monospace;
  letter-spacing: -0.1px;
}

.details-text {
  font-size: 13px;
  color: #425b68;
}
.date-text {
  font-size: 13px;
  color: #5c6b78;
}

.type-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 11px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}
.type-exam {
  color: #0c7cb5;
  background: #e6f3fb;
}
.type-graduate {
  color: #d4880f;
  background: #fef6ea;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 5px 11px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}
.status-draft {
  color: #6b7680;
  background: #eef1f4;
}
.status-nominated {
  color: #1c6ea4;
  background: #e6f0fa;
}
.status-review {
  color: #d4880f;
  background: #fef6ea;
}
.status-returned {
  color: #c73f3f;
  background: #fbe9e9;
}
.status-rejected {
  color: #8b2c2c;
  background: #f6d5d5;
}
.status-approved {
  color: #0c9145;
  background: #e1f7e6;
}
.status-announced {
  color: #0f766e;
  background: #d7f0ed;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
}

.action-view {
  color: #4b7c94;
}
.action-edit {
  color: #d4880f;
}
.action-transition {
  color: #2b3a4a;
}

.table-empty {
  padding: 56px 24px;
  text-align: center;
  color: #8a989e;
}
.table-empty-icon {
  color: #c8cfd5;
  margin-bottom: 12px;
}
.table-empty-title {
  color: #5c6b78;
  font-size: 15px;
  font-weight: 650;
  margin-bottom: 6px;
}
.table-empty-sub {
  font-size: 13px;
  color: #97a1a9;
}
.table-empty-sub strong {
  color: #5c6b78;
}

.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  padding: 14px 22px;
  border-top: 1px solid #edf1ef;
  background: #fcfdfc;
  flex-wrap: wrap;
}
.pagination-summary {
  color: #87949a;
  font-size: 12.5px;
}
.pagination-summary strong {
  color: #405967;
  font-weight: 700;
}
.pagination-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.pagination-rpp {
  display: flex;
  align-items: center;
  gap: 6px;
}
.rpp-label {
  color: #6f8087;
  font-size: 12.5px;
}
.rpp-select {
  min-width: 76px;
  font-size: 12.5px;
}
.rpp-select :deep(.q-field__native) {
  font-size: 12.5px;
  color: #405967;
  font-weight: 600;
}
.pagination-buttons {
  display: flex;
  align-items: center;
  gap: 2px;
  color: #5c6b78;
}
.pagination-buttons .q-btn {
  color: #5c6b78;
}
.pagination-buttons .q-btn:disabled {
  color: #c8cfd5;
}
.page-indicator {
  padding: 0 10px;
  font-size: 12.5px;
  color: #6f8087;
  white-space: nowrap;
}
.page-indicator strong {
  color: #2b3a4a;
  font-weight: 700;
}

.event-dialog {
  border-radius: 14px;
}
.dialog-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 18px 22px;
}
.dialog-title {
  color: #19354a;
  font-size: 18px;
  font-weight: 750;
}
.dialog-subtitle {
  margin-top: 3px;
  color: #839097;
  font-size: 13px;
}
.dialog-body {
  padding: 18px 22px;
  max-height: 70vh;
  overflow-y: auto;
}
.dialog-actions {
  padding: 12px 22px;
  background: #fcfdfc;
  gap: 8px;
}
.cancel-btn {
  color: #718089;
  font-size: 13px;
}
.draft-btn {
  color: #2b3a4a;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid #d6dce1;
  border-radius: 8px;
  min-height: 38px;
  padding: 0 18px;
}
.primary-btn-sm {
  min-height: 38px;
  padding: 0 20px;
  border-radius: 8px;
  color: #ffffff;
  background: linear-gradient(135deg, #f5a623, #e8911a);
  font-size: 13px;
  font-weight: 650;
}
.delete-btn {
  min-height: 38px;
  padding: 0 18px;
  border-radius: 8px;
  color: #ffffff;
  background: linear-gradient(135deg, #e05353, #c73f3f);
  font-size: 13px;
  font-weight: 650;
}

.section-label {
  margin: 18px 0 10px;
  color: #6b7680;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.section-label:first-of-type {
  margin-top: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.form-grid .col-span-2 {
  grid-column: 1 / -1;
}
.form-grid :deep(.q-field__control) {
  border-radius: 8px;
}
.form-grid :deep(.q-field__native),
.form-grid :deep(.q-field__label) {
  font-size: 13px;
}

.dynamic-section {
  margin-top: 10px;
  padding: 14px;
  background: #fafcfa;
  border-radius: 10px;
  border-left: 3px solid #f5a623;
}

.delete-dialog {
  width: 440px;
  max-width: 92vw;
  border-radius: 14px;
}
.delete-title {
  color: #19354a;
  font-size: 17px;
  font-weight: 750;
}
.delete-message {
  margin-top: 8px;
  color: #5c6b73;
  font-size: 13.5px;
  line-height: 1.55;
}

@media (max-width: 900px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 14px;
  }
  .search-input {
    max-width: none;
    width: 100%;
    flex-basis: 100%;
  }
  .filter-select {
    flex: 1;
    min-width: 150px;
  }
}

@media (max-width: 650px) {
  .module-page {
    padding: 14px;
  }
  .table-wrapper {
    overflow-x: auto;
  }
  .events-table {
    min-width: 820px;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
  .pagination-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  .pagination-controls {
    justify-content: space-between;
  }
}
</style>
