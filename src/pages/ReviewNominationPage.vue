<template>
  <q-page class="review-page" :style-fn="pageStyleFn">
    <!-- =====================================================
         PAGE HEADER
    ====================================================== -->
    <section class="page-header">
      <div class="page-header-text">
        <div class="page-eyebrow">
          Review
          <span v-if="record?.reference_no" class="eyebrow-sep">·</span>
          <span v-if="record?.reference_no" class="eyebrow-ref">
            {{ record.reference_no }}
          </span>
        </div>
        <h5>{{ headerTitle }}</h5>
        <p>{{ headerSubtitle }}</p>
      </div>

      <div class="page-header-actions">
        <q-btn flat no-caps label="Back" class="btn-ghost" @click="goBack" />
      </div>
    </section>

    <!-- LOADING / NOT FOUND -->
    <div v-if="isLoading" class="state-box">
      <q-spinner-dots color="primary" size="42px" />
      <div class="state-text">Loading nomination…</div>
    </div>

    <div v-else-if="!record" class="state-box state-box--error">
      <q-icon name="search_off" size="42px" />
      <div class="state-title">Nomination not found</div>
      <div class="state-text">
        This nomination either doesn’t exist or has been removed.
      </div>
      <q-btn
        unelevated
        no-caps
        label="Back to queue"
        class="btn-primary btn-primary--sm"
        @click="goBack"
      />
    </div>

    <!-- TWO-COLUMN LAYOUT -->
    <TwoColumnLayout v-else class="layout-fill">
      <!-- LEFT — SUMMARY -->
      <template #left>
        <div class="left-panel">
          <!-- Nominee -->
          <div class="panel-step">
            <div class="step-index">1</div>
            <div class="step-body">
              <div class="step-label">Nominee</div>
              <div class="nominee-chip">
                <div class="nominee-avatar">
                  <q-icon v-if="isOffice" name="business" size="18px" />
                  <template v-else>{{ nomineeInitials }}</template>
                </div>
                <div class="nominee-info">
                  <div class="nominee-name">{{ record.employee || "—" }}</div>
                  <div class="nominee-meta">
                    {{
                      isOffice
                        ? "Office nomination"
                        : record.position || "No position set"
                    }}
                  </div>
                </div>
                <q-badge v-if="isOffice" class="office-tag">Office</q-badge>
              </div>
            </div>
          </div>

          <!-- Office -->
          <div class="panel-step">
            <div class="step-index">2</div>
            <div class="step-body">
              <div class="step-label">Nominating Office</div>
              <div class="office-chip">
                <q-icon name="business" size="16px" />
                <span>{{ record.office || "—" }}</span>
              </div>
            </div>
          </div>

          <!-- Type & Status -->
          <div class="panel-step">
            <div class="step-index">3</div>
            <div class="step-body">
              <div class="step-label">Type & Status</div>
              <div class="meta-stack">
                <div class="meta-row">
                  <span class="type-badge" :class="TYPE_CLASSES[record.type]">
                    {{ TYPE_LABELS[record.type] || record.type }}
                  </span>
                </div>
                <div class="meta-row">
                  <span
                    class="status-badge"
                    :class="STATUS_CLASSES[record.status]"
                  >
                    {{ STATUS_LABELS[record.status] || record.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Reference -->
          <div class="panel-step panel-step--last">
            <div class="step-index">4</div>
            <div class="step-body">
              <div class="step-label">Reference</div>
              <div class="ref-list">
                <div class="ref-line">
                  <q-icon name="tag" size="14px" />
                  <span class="ref-value">{{
                    record.reference_no || "—"
                  }}</span>
                </div>
                <div class="ref-line">
                  <q-icon name="event" size="14px" />
                  <span class="ref-value">
                    Created {{ formatDate(record.created_at) }}
                  </span>
                </div>
                <div v-if="record.submitted_at" class="ref-line">
                  <q-icon name="send" size="14px" />
                  <span class="ref-value">
                    Submitted {{ formatDate(record.submitted_at) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- RIGHT — DETAILS + ACTION PANEL -->
      <template #right>
        <div class="form-section">
          <!-- =============================================
               ACTION PANEL — review
          ============================================== -->
          <div
            v-if="record.status === 'review'"
            class="action-panel action-panel--active"
          >
            <div class="action-panel-head">
              <q-icon name="fact_check" size="20px" />
              <div class="action-panel-text">
                <div class="action-title">Review Actions</div>
                <div class="action-sub">
                  Choose what happens to this nomination.
                </div>
              </div>
            </div>

            <div class="action-buttons">
              <q-btn
                unelevated
                no-caps
                icon="history_edu"
                label="Awaiting Signed Form"
                class="action-btn action-btn--primary"
                :loading="busy"
                @click="openDialog('await')"
              />
              <q-btn
                unelevated
                no-caps
                icon="undo"
                label="Return"
                class="action-btn action-btn--warning"
                :loading="busy"
                @click="openDialog('return')"
              />
              <q-btn
                unelevated
                no-caps
                icon="cancel"
                label="Reject"
                class="action-btn action-btn--danger"
                :loading="busy"
                @click="openDialog('reject')"
              />
            </div>
          </div>

          <!-- =============================================
               ACTION PANEL — hardcopy_submitted
               The office uploaded the signed form; HR can
               approve or return it.
          ============================================== -->
          <div
            v-else-if="record.status === 'hardcopy_submitted'"
            class="action-panel action-panel--hardcopy"
          >
            <div class="action-panel-head">
              <q-icon name="verified" size="20px" />
              <div class="action-panel-text">
                <div class="action-title">Signed form received</div>
                <div class="action-sub">
                  The office has submitted the signed hardcopy. Review the
                  document below, then approve to finalize or return it if
                  anything is wrong.
                </div>
              </div>
            </div>

            <div class="action-buttons">
              <q-btn
                unelevated
                no-caps
                icon="check_circle"
                label="Approve"
                class="action-btn action-btn--success"
                :loading="busy"
                @click="openDialog('approve')"
              />
              <q-btn
                unelevated
                no-caps
                icon="undo"
                label="Return"
                class="action-btn action-btn--warning"
                :loading="busy"
                @click="openDialog('return')"
              />
            </div>
          </div>

          <!-- =============================================
               ACTION PANEL — submitted (info)
          ============================================== -->
          <div
            v-else-if="record.status === 'submitted'"
            class="action-panel action-panel--info"
          >
            <div class="action-panel-head">
              <q-icon name="info" size="20px" />
              <div class="action-panel-text">
                <div class="action-title">Not yet in review</div>
                <div class="action-sub">
                  Return to the Review Queue and click Review to start.
                </div>
              </div>
            </div>
          </div>

          <!-- =============================================
               ACTION PANEL — awaiting_hardcopy
          ============================================== -->
          <div
            v-else-if="record.status === 'awaiting_hardcopy'"
            class="action-panel action-panel--awaiting"
          >
            <div class="action-panel-head">
              <q-icon name="schedule" size="20px" />
              <div class="action-panel-text">
                <div class="action-title">Awaiting Signed Form</div>
                <div class="action-sub">
                  Waiting for the employee to submit the signed hardcopy to HR.
                </div>
                <div v-if="record.remarks" class="action-remarks">
                  Remarks: {{ record.remarks }}
                </div>
              </div>
            </div>
          </div>

          <!-- =============================================
               ACTION PANEL — returned
          ============================================== -->
          <div
            v-else-if="record.status === 'returned'"
            class="action-panel action-panel--returned"
          >
            <div class="action-panel-head">
              <q-icon name="undo" size="20px" />
              <div class="action-panel-text">
                <div class="action-title">Returned for revision</div>
                <div v-if="record.remarks" class="action-remarks">
                  {{ record.remarks }}
                </div>
              </div>
            </div>
          </div>

          <!-- =============================================
               ACTION PANEL — rejected
          ============================================== -->
          <div
            v-else-if="record.status === 'rejected'"
            class="action-panel action-panel--rejected"
          >
            <div class="action-panel-head">
              <q-icon name="cancel" size="20px" />
              <div class="action-panel-text">
                <div class="action-title">Rejected</div>
                <div v-if="record.remarks" class="action-remarks">
                  {{ record.remarks }}
                </div>
              </div>
            </div>
          </div>

          <!-- =============================================
               ACTION PANEL — approved (with announcement)
               HR can still edit the schedule, then announce.
          ============================================== -->
          <div
            v-else-if="record.status === 'approved'"
            class="action-panel action-panel--approved"
          >
            <div class="action-panel-head">
              <q-icon name="check_circle" size="20px" />
              <div class="action-panel-text">
                <div class="action-title">Approved</div>
                <div class="action-sub">
                  This nomination has been finalized and is scheduled for
                  recognition.
                </div>

                <div
                  v-if="record.announcement_datetime"
                  class="announcement-block"
                >
                  <div class="announcement-row">
                    <q-icon name="event" size="14px" />
                    <span>
                      <strong>Date &amp; Time:</strong>
                      {{ formatDateTime(record.announcement_datetime) }}
                    </span>
                  </div>
                  <div
                    v-if="record.announcement_venue"
                    class="announcement-row"
                  >
                    <q-icon name="place" size="14px" />
                    <span>
                      <strong>Venue:</strong> {{ record.announcement_venue }}
                    </span>
                  </div>
                </div>

                <div v-else class="action-hint">
                  <q-icon name="info" size="13px" />
                  Set the schedule before announcing this nomination.
                </div>
              </div>
            </div>

            <div v-if="canEditSchedule || canAnnounce" class="action-buttons">
              <q-btn
                v-if="canAnnounce"
                unelevated
                no-caps
                icon="campaign"
                label="Announce"
                class="action-btn action-btn--announce"
                :loading="busy"
                @click="openDialog('announce')"
              />
              <q-btn
                v-if="canEditSchedule"
                unelevated
                no-caps
                icon="edit_calendar"
                :label="
                  record.announcement_datetime
                    ? 'Edit schedule'
                    : 'Set schedule'
                "
                class="action-btn action-btn--neutral"
                :loading="busy"
                @click="openDialog('schedule')"
              />
            </div>
          </div>

          <!-- =============================================
               ACTION PANEL — announced
               Final state. The schedule is locked.
          ============================================== -->
          <div
            v-else-if="record.status === 'announced'"
            class="action-panel action-panel--announced"
          >
            <div class="action-panel-head">
              <q-icon name="campaign" size="20px" />
              <div class="action-panel-text">
                <div class="action-title">Announced</div>
                <div class="action-sub">
                  This nomination has been officially announced.
                </div>

                <div
                  v-if="record.announcement_datetime"
                  class="announcement-block announcement-block--announced"
                >
                  <div class="announcement-row">
                    <q-icon name="event" size="14px" />
                    <span>
                      <strong>Date &amp; Time:</strong>
                      {{ formatDateTime(record.announcement_datetime) }}
                    </span>
                  </div>
                  <div
                    v-if="record.announcement_venue"
                    class="announcement-row"
                  >
                    <q-icon name="place" size="14px" />
                    <span>
                      <strong>Venue:</strong> {{ record.announcement_venue }}
                    </span>
                  </div>
                </div>

                <div v-if="record.remarks" class="action-remarks">
                  {{ record.remarks }}
                </div>
              </div>
            </div>
          </div>

          <!-- =============================================
               EMPLOYEE / OFFICE INFO
          ============================================== -->
          <template v-if="!isOffice">
            <div class="form-section-title">Employee Information</div>
            <div class="form-grid">
              <LabeledField
                v-for="info in INFO_FIELDS"
                :key="info.key"
                :label="info.label"
                :class="{ 'col-span-2': info.span === 2 }"
              >
                <q-input
                  :model-value="record[info.key] || '—'"
                  outlined
                  dense
                  readonly
                  class="readonly-input"
                >
                  <template #append>
                    <q-icon name="lock" size="13px" class="lock-icon" />
                  </template>
                </q-input>
              </LabeledField>
            </div>

            <div class="form-section-title">Contact Information</div>
            <div class="form-grid">
              <LabeledField label="Mobile No." class="col-span-2">
                <q-input
                  :model-value="record.mobile_no || '—'"
                  outlined
                  dense
                  readonly
                  class="readonly-input"
                >
                  <template #append>
                    <q-icon name="lock" size="13px" class="lock-icon" />
                  </template>
                </q-input>
              </LabeledField>
            </div>
          </template>

          <template v-else>
            <div class="form-section-title">Office Information</div>
            <div class="form-grid">
              <LabeledField label="Office" class="col-span-2">
                <q-input
                  :model-value="record.employee || '—'"
                  outlined
                  dense
                  readonly
                  class="readonly-input"
                >
                  <template #append>
                    <q-icon name="lock" size="13px" class="lock-icon" />
                  </template>
                </q-input>
              </LabeledField>
            </div>
          </template>

          <!-- =============================================
               DYNAMIC SECTIONS
          ============================================== -->
          <div
            v-for="section in sections"
            :key="section.title"
            class="form-block"
          >
            <div class="form-block-head">
              <div class="form-section-title flush">{{ section.title }}</div>
            </div>

            <div class="form-grid">
              <LabeledField
                v-for="field in section.fields"
                :key="field.key"
                :label="field.label"
                :class="{ 'col-span-2': field.span === 2 }"
              >
                <q-input
                  :model-value="displayValue(field)"
                  outlined
                  dense
                  readonly
                  class="readonly-input"
                >
                  <template #append>
                    <q-icon name="lock" size="13px" class="lock-icon" />
                  </template>
                </q-input>
              </LabeledField>
            </div>
          </div>

          <!-- =============================================
               SUPPORTING DOCUMENTS
          ============================================== -->
          <div class="form-block form-block--docs">
            <div class="form-block-head">
              <div class="form-section-title flush">Supporting Documents</div>
              <div class="form-block-hint">
                <q-icon name="description" size="12px" />
                {{ uploadedCount }} of {{ totalDocsCount }} uploaded
              </div>
            </div>

            <div class="doc-list">
              <!-- SIGNED FORM (shown first when present) -->
              <div v-if="signedFormMeta" class="doc-row doc-row--signed">
                <div class="doc-icon doc-icon--signed">
                  <q-icon name="verified" size="18px" />
                </div>
                <div class="doc-info">
                  <div class="doc-label">
                    Signed Form
                    <span class="doc-signed">Signed</span>
                  </div>
                  <div class="doc-file">
                    <q-icon name="attach_file" size="12px" />
                    <span>{{ signedFormMeta.name }}</span>
                  </div>
                  <div
                    v-if="signedFormMeta.uploaded_at"
                    class="doc-uploaded-at"
                  >
                    Uploaded {{ formatDateTime(signedFormMeta.uploaded_at) }}
                  </div>
                </div>

                <div class="doc-actions">
                  <q-btn
                    flat
                    dense
                    no-caps
                    icon="visibility"
                    label="View"
                    class="doc-action"
                    :loading="viewingKey === 'signed_form'"
                    @click="viewSignedForm"
                  />
                  <q-btn
                    flat
                    dense
                    no-caps
                    icon="download"
                    label="Download"
                    class="doc-action"
                    :loading="downloadingKey === 'signed_form'"
                    @click="downloadSignedForm"
                  />
                </div>
              </div>

              <!-- REGULAR DOCS -->
              <div
                v-for="doc in docsList"
                :key="doc.key"
                class="doc-row"
                :class="{ 'is-empty': !docFileName(doc) }"
              >
                <div class="doc-icon">
                  <q-icon :name="doc.icon" size="18px" />
                </div>
                <div class="doc-info">
                  <div class="doc-label">
                    {{ doc.label }}
                    <span v-if="!doc.optional" class="doc-req">Required</span>
                    <span v-else class="doc-opt">Optional</span>
                  </div>
                  <div class="doc-file">
                    <template v-if="docFileName(doc)">
                      <q-icon name="attach_file" size="12px" />
                      <span>{{ docFileName(doc) }}</span>
                    </template>
                    <template v-else>
                      <q-icon name="block" size="12px" />
                      <span class="doc-missing">No file uploaded</span>
                    </template>
                  </div>
                </div>
                <div v-if="docFileName(doc)" class="doc-actions">
                  <q-btn
                    flat
                    dense
                    no-caps
                    icon="visibility"
                    label="View"
                    class="doc-action"
                    :loading="viewingKey === doc.key"
                    @click="viewDoc(doc)"
                  />
                  <q-btn
                    flat
                    dense
                    no-caps
                    icon="download"
                    label="Download"
                    class="doc-action"
                    :loading="downloadingKey === doc.key"
                    @click="downloadDoc(doc)"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- =============================================
               STATUS HISTORY
          ============================================== -->
          <div class="form-block">
            <div class="form-block-head">
              <div class="form-section-title flush">Status History</div>
            </div>

            <div v-if="statusHistory.length === 0" class="timeline-empty">
              No status changes recorded yet.
            </div>

            <div v-else class="timeline">
              <div
                v-for="(event, index) in statusHistory"
                :key="index"
                class="timeline-item"
                :class="{ 'is-last': index === statusHistory.length - 1 }"
              >
                <div class="timeline-rail">
                  <div
                    class="timeline-dot"
                    :class="STATUS_CLASSES[event.to]"
                  ></div>
                  <div
                    v-if="index !== statusHistory.length - 1"
                    class="timeline-line"
                  ></div>
                </div>

                <div class="timeline-body">
                  <div class="timeline-head">
                    <span class="timeline-transition">
                      <template v-if="event.from">
                        {{ STATUS_LABELS[event.from] || event.from }}
                        <q-icon name="arrow_forward" size="12px" />
                      </template>
                      {{ STATUS_LABELS[event.to] || event.to }}
                    </span>
                    <span class="timeline-time">
                      {{ formatDateTime(event.at) }}
                    </span>
                  </div>

                  <div v-if="event.actor" class="timeline-actor">
                    <q-icon name="person" size="12px" />
                    {{ event.actor }}
                  </div>

                  <div v-if="event.remarks" class="timeline-remarks">
                    {{ event.remarks }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </TwoColumnLayout>

    <!-- =====================================================
         ACTION DIALOG (await / return / reject / approve /
         schedule / announce)
         Same look as the confirmation dialogs on the list pages:
         centered icon, title, message, then the form and actions.
    ====================================================== -->
    <q-dialog v-model="showDialog" persistent>
      <q-card class="confirmation-dialog confirmation-dialog--form">
        <div class="confirmation-icon" :class="`is-${dialogConfig.tone}`">
          <q-icon :name="dialogConfig.icon" size="25px" />
        </div>

        <div class="confirmation-title">{{ dialogConfig.title }}</div>
        <div class="confirmation-subject">{{ headerTitle }}</div>
        <p class="confirmation-message">{{ dialogConfig.description }}</p>

        <div class="confirmation-form">
          <!-- Announce only: read-only summary of the saved schedule -->
          <div
            v-if="dialogMode === 'announce' && record?.announcement_datetime"
            class="announcement-block announcement-block--dialog"
          >
            <div class="announcement-row">
              <q-icon name="event" size="14px" />
              <span>
                <strong>Date &amp; Time:</strong>
                {{ formatDateTime(record.announcement_datetime) }}
              </span>
            </div>
            <div v-if="record.announcement_venue" class="announcement-row">
              <q-icon name="place" size="14px" />
              <span>
                <strong>Venue:</strong> {{ record.announcement_venue }}
              </span>
            </div>
          </div>

          <!-- Approve / edit schedule: schedule + venue -->
          <template v-if="dialogHasSchedule">
            <LabeledField label="Date and time">
              <q-input
                v-model="dialogScheduledAt"
                outlined
                dense
                type="datetime-local"
                :error="!!dialogScheduledAtError"
                :error-message="dialogScheduledAtError"
              />
            </LabeledField>

            <LabeledField label="Venue">
              <q-input
                v-model="dialogVenue"
                outlined
                dense
                maxlength="255"
                placeholder="e.g. City Hall Flagpole Area"
                :error="!!dialogVenueError"
                :error-message="dialogVenueError"
              />
            </LabeledField>
          </template>

          <LabeledField :label="dialogRemarksLabel">
            <q-input
              v-model="dialogRemarks"
              type="textarea"
              outlined
              autogrow
              counter
              :rows="dialogHasSchedule ? 2 : 3"
              :maxlength="1000"
              :placeholder="
                dialogConfig.remarksRequired
                  ? 'Type your reason here...'
                  : 'Add a note (optional)...'
              "
              :error="!!dialogError"
              :error-message="dialogError"
            />
          </LabeledField>
        </div>

        <div class="confirmation-actions">
          <q-btn
            flat
            no-caps
            label="Cancel"
            class="dialog-cancel-btn"
            :disable="busy"
            v-close-popup
          />
          <q-btn
            unelevated
            no-caps
            :label="dialogConfig.confirmLabel"
            :class="`dialog-confirm-btn is-${dialogConfig.tone}`"
            :loading="busy"
            @click="confirmDialog"
          />
        </div>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { useNominationStore } from "src/stores/nominationStore";
import { api } from "boot/axios";
import TwoColumnLayout from "src/components/TwoColumnLayout.vue";
import LabeledField from "src/components/LabeledField.vue";
import {
  TYPE_SECTIONS,
  TYPE_DOCS,
  TYPE_LABELS,
  TYPE_CLASSES,
  STATUS_LABELS,
  STATUS_CLASSES,
} from "src/constants/NominationConfig";

const INFO_FIELDS = [
  { key: "employee", label: "Employee Name", span: 2 },
  { key: "position", label: "Position" },
  { key: "employment_status", label: "Status of Employment" },
  { key: "department", label: "Department / Office", span: 2 },
];

// One entry per dialog.
// Tones: primary · success · warning · danger · announce.
const DIALOGS = {
  await: {
    title: "Awaiting signed form",
    description:
      "The employee will be notified to submit the signed hardcopy to HR.",
    icon: "history_edu",
    tone: "primary",
    confirmLabel: "Confirm",
    remarksRequired: false,
  },
  return: {
    title: "Return for revision",
    description: "The nomination will be sent back to the office for revision.",
    icon: "undo",
    tone: "warning",
    confirmLabel: "Return",
    remarksRequired: true,
  },
  reject: {
    title: "Reject nomination",
    description: "The nomination will be rejected. This is a final decision.",
    icon: "cancel",
    tone: "danger",
    confirmLabel: "Reject",
    remarksRequired: true,
  },
  schedule: {
    title: "Edit schedule",
    description:
      "Update the announcement date, time and venue. The nomination stays approved.",
    icon: "edit_calendar",
    tone: "primary",
    confirmLabel: "Save changes",
    remarksRequired: false,
  },
  approve: {
    title: "Approve nomination",
    description:
      "Set the announcement date, time and venue. The nomination will then be finalized as approved.",
    icon: "check_circle",
    tone: "success",
    confirmLabel: "Approve",
    remarksRequired: false,
  },
  announce: {
    title: "Announce nomination",
    description:
      "The nomination will be officially announced. The schedule can no longer be changed afterwards.",
    icon: "campaign",
    tone: "announce",
    confirmLabel: "Announce",
    remarksRequired: false,
  },
};

export default defineComponent({
  name: "ReviewNominationPage",
  components: { TwoColumnLayout, LabeledField },

  setup() {
    const $q = useQuasar();
    const route = useRoute();
    const router = useRouter();
    const nominationStore = useNominationStore();

    // ---------- State ----------
    const record = ref(null);
    // Local page-level loading flag. Only this page controls it, so a
    // slow mutation elsewhere can't leave it stuck on.
    const isLoading = ref(true);
    const busy = ref(false);

    // Which document button is currently fetching
    const viewingKey = ref(null);
    const downloadingKey = ref(null);

    // Action dialog
    const showDialog = ref(false);
    const dialogMode = ref("await");
    const dialogRemarks = ref("");
    const dialogError = ref("");
    const dialogScheduledAt = ref("");
    const dialogVenue = ref("");
    const dialogScheduledAtError = ref("");
    const dialogVenueError = ref("");

    // Desktop: exact viewport height so the page itself never scrolls.
    // Phones/tablets: normal min-height, page scrolls naturally.
    function pageStyleFn(offset) {
      const h = offset ? `calc(100dvh - ${offset}px)` : "100dvh";
      return $q.screen.gt.sm ? { height: h } : { minHeight: h };
    }

    // ---------- Derived data ----------
    const isOffice = computed(() => !!record.value?.is_office);

    const sections = computed(() => TYPE_SECTIONS[record.value?.type] || []);
    const docsList = computed(() => TYPE_DOCS[record.value?.type] || []);

    const nomineeInitials = computed(() => getInitials(record.value?.employee));

    const headerTitle = computed(() => record.value?.employee || "Nomination");

    const headerSubtitle = computed(() => {
      if (!record.value) return "";
      const label = TYPE_LABELS[record.value.type] || record.value.type;
      const status = STATUS_LABELS[record.value.status] || record.value.status;
      return `${label} · ${status}`;
    });

    const statusHistory = computed(() => {
      const list = record.value?.status_history || [];
      return list.map((e) => ({
        from: e.from || null,
        to: e.to || "draft",
        actor: e.actor || "",
        at: e.at || record.value?.created_at,
        remarks: e.remarks || "",
      }));
    });

    // Signed form metadata (from the backend's signed_docs block).
    const signedFormMeta = computed(
      () => record.value?.signed_docs?.signed_form || null
    );

    // Regular docs + the signed form slot.
    const totalDocsCount = computed(() => docsList.value.length + 1);

    const uploadedCount = computed(() => {
      const regular = docsList.value.filter((d) => !!docFileName(d)).length;
      return regular + (signedFormMeta.value ? 1 : 0);
    });

    // The schedule can be changed while approved, but not once announced.
    const canEditSchedule = computed(() => record.value?.status === "approved");

    // Announcing needs an approved nomination with a saved schedule.
    const canAnnounce = computed(
      () =>
        record.value?.status === "approved" &&
        !!record.value?.announcement_datetime
    );

    // ---------- Dialog (derived) ----------
    const dialogConfig = computed(() => DIALOGS[dialogMode.value]);
    // Approve and edit-schedule both show the date / venue fields
    const dialogHasSchedule = computed(() =>
      ["approve", "schedule"].includes(dialogMode.value)
    );
    const dialogRemarksLabel = computed(() =>
      dialogConfig.value.remarksRequired ? "Reason" : "Note (optional)"
    );

    // ---------- Lifecycle ----------
    onMounted(loadRecord);

    async function loadRecord() {
      isLoading.value = true;
      try {
        const result = await nominationStore.fetchOne(route.params.id, {
          cache: false,
        });
        if (!result.success || !result.data) {
          notify(result.message || "Nomination not found.", "negative");
          record.value = null;
          return;
        }
        record.value = result.data;
      } finally {
        isLoading.value = false;
      }
    }

    // ---------- Helpers ----------
    function notify(message, type = "positive") {
      $q.notify({ type, message, position: "top" });
    }

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

    function formatDateTime(iso) {
      if (!iso) return "—";
      const d = new Date(iso);
      if (isNaN(d)) return iso;
      return d.toLocaleString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    function displayValue(field) {
      const raw = record.value?.details?.[field.key];

      if (raw === null || raw === undefined || raw === "") return "—";

      if (field.kind === "select") {
        const opt = (field.options || []).find((o) => o.value === raw);
        return opt?.label || raw;
      }

      if (field.kind === "date") return formatDate(raw);
      if (field.kind === "datetime") return formatDateTime(raw);
      if (field.kind === "rating") return `${raw}%`;

      return String(raw);
    }

    // ---------- Documents ----------
    function docFileName(doc) {
      const raw = record.value?.docs?.[doc.key];
      if (!raw) return null;
      if (typeof raw === "string") return raw;
      return raw.name || null;
    }

    function docUrl(doc) {
      const raw = record.value?.docs?.[doc.key];
      return raw && typeof raw !== "string" ? raw.url || null : null;
    }

    function docDownloadUrl(doc) {
      const raw = record.value?.docs?.[doc.key];
      return raw && typeof raw !== "string"
        ? raw.download_url || raw.url || null
        : null;
    }

    /**
     * Fetch a protected file as a blob (the auth header is required, so
     * window.open on the raw URL would 401), then open or save it.
     */
    async function openBlob({ url, key, errorMessage }) {
      viewingKey.value = key;
      try {
        const res = await api.get(url, { responseType: "blob" });
        const blobUrl = URL.createObjectURL(res.data);
        window.open(blobUrl, "_blank", "noopener,noreferrer");
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
      } catch (err) {
        notify(err?.response?.data?.message || errorMessage, "negative");
      } finally {
        viewingKey.value = null;
      }
    }

    async function saveBlob({ url, key, filename, errorMessage }) {
      downloadingKey.value = key;
      try {
        const res = await api.get(url, { responseType: "blob" });
        const blobUrl = URL.createObjectURL(res.data);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = filename;
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10_000);
      } catch (err) {
        notify(err?.response?.data?.message || errorMessage, "negative");
      } finally {
        downloadingKey.value = null;
      }
    }

    function viewDoc(doc) {
      if (!record.value?.docs?.[doc.key]) return;
      const url = docUrl(doc);
      if (!url) return notify("No preview URL for this file.", "warning");

      openBlob({
        url,
        key: doc.key,
        errorMessage: "Unable to open the document.",
      });
    }

    function downloadDoc(doc) {
      if (!record.value?.docs?.[doc.key]) return;
      const url = docDownloadUrl(doc);
      if (!url) return notify("No download URL for this file.", "warning");

      saveBlob({
        url,
        key: doc.key,
        filename: docFileName(doc) || doc.key,
        errorMessage: "Unable to download the document.",
      });
    }

    function viewSignedForm() {
      const meta = signedFormMeta.value;
      if (!meta?.url) {
        return notify("No preview URL for the signed form.", "warning");
      }

      openBlob({
        url: meta.url,
        key: "signed_form",
        errorMessage: "Unable to open the signed form.",
      });
    }

    function downloadSignedForm() {
      const meta = signedFormMeta.value;
      if (!meta) return;
      const url = meta.download_url || meta.url;
      if (!url) {
        return notify("No download URL for the signed form.", "warning");
      }

      saveBlob({
        url,
        key: "signed_form",
        filename: meta.name || "signed_form",
        errorMessage: "Unable to download the signed form.",
      });
    }

    // ---------- Action dialog ----------
    // ISO string -> "YYYY-MM-DDTHH:mm" in local time, for datetime-local inputs
    function toLocalInput(iso) {
      if (!iso) return "";
      const d = new Date(iso);
      if (isNaN(d)) return "";
      const pad = (n) => String(n).padStart(2, "0");
      return (
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
        `T${pad(d.getHours())}:${pad(d.getMinutes())}`
      );
    }

    function openDialog(mode) {
      dialogMode.value = mode;
      dialogRemarks.value = "";
      dialogError.value = "";

      // Editing starts from the saved schedule; approving starts empty
      const editing = mode === "schedule";
      dialogScheduledAt.value = editing
        ? toLocalInput(record.value?.announcement_datetime)
        : "";
      dialogVenue.value = editing ? record.value?.announcement_venue || "" : "";
      dialogScheduledAtError.value = "";
      dialogVenueError.value = "";
      showDialog.value = true;
    }

    // Returns true when the form is valid; sets inline errors otherwise.
    function validateDialog(remarks) {
      if (dialogConfig.value.remarksRequired && !remarks) {
        dialogError.value = "Please provide a reason.";
        return false;
      }

      if (dialogHasSchedule.value) {
        let valid = true;

        if (!dialogScheduledAt.value) {
          dialogScheduledAtError.value = "Date and time is required.";
          valid = false;
        }
        if (!dialogVenue.value?.trim()) {
          dialogVenueError.value = "Venue is required.";
          valid = false;
        }
        return valid;
      }

      return true;
    }

    function submitDialog(remarks) {
      const id = record.value.id;

      switch (dialogMode.value) {
        case "await":
          return nominationStore.awaitHardcopy(id, remarks || null);
        case "return":
          return nominationStore.returnNomination(id, remarks);
        case "reject":
          return nominationStore.reject(id, remarks);
        case "schedule":
          return nominationStore.updateSchedule(id, {
            scheduled_at: new Date(dialogScheduledAt.value).toISOString(),
            venue: dialogVenue.value.trim(),
            remarks: remarks || null,
          });
        case "approve":
          // datetime-local gives "YYYY-MM-DDTHH:mm" — convert to ISO so the
          // backend receives an unambiguous UTC value.
          return nominationStore.approve(id, {
            scheduled_at: new Date(dialogScheduledAt.value).toISOString(),
            venue: dialogVenue.value.trim(),
            remarks: remarks || null,
          });
        case "announce":
          return nominationStore.announce(id, remarks || null);
        default:
          return null;
      }
    }

    // Map backend validation errors onto the matching inline fields.
    // Returns true if at least one inline error was set.
    function showBackendErrors(errors = {}) {
      if (errors.scheduled_at?.length) {
        dialogScheduledAtError.value = errors.scheduled_at[0];
      }
      if (errors.venue?.length) dialogVenueError.value = errors.venue[0];
      if (errors.remarks?.length) dialogError.value = errors.remarks[0];

      return !!(
        dialogScheduledAtError.value ||
        dialogVenueError.value ||
        dialogError.value
      );
    }

    async function confirmDialog() {
      dialogError.value = "";
      dialogScheduledAtError.value = "";
      dialogVenueError.value = "";

      const remarks = (dialogRemarks.value || "").trim();
      if (!validateDialog(remarks)) return;

      busy.value = true;
      const result = await submitDialog(remarks);
      busy.value = false;

      if (!result?.success) {
        if (!showBackendErrors(result?.errors)) {
          notify(result?.message || "Action failed.", "negative");
        }
        return;
      }

      notify(result.message, "positive");
      record.value = result.data;
      showDialog.value = false;
    }

    // ---------- Navigation ----------
    function goBack() {
      router.push({ name: "review_queue" });
    }

    return {
      // stores / config
      nominationStore,
      INFO_FIELDS,
      TYPE_LABELS,
      TYPE_CLASSES,
      STATUS_LABELS,
      STATUS_CLASSES,

      // page state
      pageStyleFn,
      record,
      isLoading,
      busy,
      isOffice,
      sections,
      docsList,
      nomineeInitials,
      headerTitle,
      headerSubtitle,
      statusHistory,
      signedFormMeta,
      uploadedCount,
      totalDocsCount,
      canEditSchedule,
      canAnnounce,

      // documents
      viewingKey,
      downloadingKey,
      docFileName,
      viewDoc,
      downloadDoc,
      viewSignedForm,
      downloadSignedForm,

      // helpers
      displayValue,
      formatDate,
      formatDateTime,

      // action dialog
      showDialog,
      dialogMode,
      dialogConfig,
      dialogHasSchedule,
      dialogRemarksLabel,
      dialogRemarks,
      dialogError,
      dialogScheduledAt,
      dialogVenue,
      dialogScheduledAtError,
      dialogVenueError,
      openDialog,
      confirmDialog,

      // navigation
      goBack,
    };
  },
});
</script>

<style scoped>
/* =========================================================
   RESPONSIVE STRATEGY (shared across the nomination pages)
   - Mobile-first: base = phone, min-width queries enhance.
   - < 1024px: columns stack and the page scrolls normally.
   - >= 1024px: page fills the window; only the cards scroll.
   - 16px inputs + 40–44px tap targets on phones; hover only
     on hover-capable devices.

   COLOR TONES (used by buttons, dialog icons and panels)
   primary #e8911a · success #0c9145 · warning #d4880f
   danger #c73f3f · announce #0f766e
========================================================= */

/* =========================================================
   PAGE
========================================================= */
.review-page {
  min-height: 100%;
  padding: clamp(12px, 2.5vw, 24px);
  padding-left: max(clamp(12px, 2.5vw, 24px), env(safe-area-inset-left));
  padding-right: max(clamp(12px, 2.5vw, 24px), env(safe-area-inset-right));
  padding-bottom: max(clamp(12px, 2.5vw, 24px), env(safe-area-inset-bottom));
  background: #f5f6f7;
  overflow-x: clip;
}

/* ---------- Header (mobile: stacked) ---------- */
.page-header {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 14px;
  margin-bottom: 18px;
  padding: clamp(14px, 2.5vw, 20px) clamp(14px, 3vw, 24px);
  border: 1px solid #e6e8eb;
  border-radius: 10px;
  background: #ffffff;
}

.page-header-text {
  min-width: 0;
}

.page-eyebrow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
  color: #8a95a0;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  overflow-wrap: anywhere;
}

.eyebrow-sep {
  color: #c8cfd5;
}

.eyebrow-ref {
  color: #5c6b78;
  letter-spacing: 0.3px;
}

.page-header h5 {
  margin: 0 0 4px;
  color: #19354a;
  font-size: var(--fs-xl);
  font-weight: var(--fw-bold);
  line-height: var(--lh-tight);
  overflow-wrap: anywhere;
}

.page-header p {
  max-width: 560px;
  margin: 0;
  color: #7a8792;
  font-size: 13.5px;
}

.page-header-actions {
  display: flex;
  align-items: stretch;
  gap: 8px;
}

.page-header-actions .btn-ghost {
  flex: 1;
}

.btn-ghost {
  min-height: 44px;
  padding: 0 16px;
  color: #5c6b78;
  font-size: 13px;
  font-weight: 600;
}

.btn-primary {
  min-height: 44px;
  padding: 0 22px;
  border-radius: 9px;
  color: #ffffff;
  background: linear-gradient(135deg, #f5a623, #e8911a);
  font-size: 13px;
  font-weight: 650;
}

.btn-primary--sm {
  min-height: 40px;
  padding: 0 20px;
  font-size: 12.5px;
}

/* ---------- State boxes ---------- */
.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 300px;
  padding: 40px 20px;
  border: 1px solid #e6e8eb;
  border-radius: 10px;
  color: #7a8792;
  background: #ffffff;
  text-align: center;
}

.state-box--error .q-icon {
  color: #c8cfd5;
}

.state-title {
  color: #19354a;
  font-size: 16px;
  font-weight: 650;
}

.state-text {
  max-width: 380px;
  color: #7a8792;
  font-size: 13px;
  line-height: 1.55;
}

/* =========================================================
   ACTION PANEL
   Mobile: full-width stacked buttons. >= 600px: a row.
   Filled = the main outcome (primary / success / announce).
   Soft   = the alternatives (warning / danger).
========================================================= */
.action-panel {
  margin-bottom: 18px;
  padding: 14px;
  border: 1px solid transparent;
  border-radius: 10px;
}

.action-panel--active,
.action-panel--awaiting {
  border-color: #f4dcb4;
  background: #fff8ec;
}

.action-panel--info,
.action-panel--hardcopy {
  border-color: #c9e2f2;
  background: #eef6fc;
}

.action-panel--approved {
  border-color: #bfe6cb;
  background: #e8f7ec;
}

.action-panel--announced {
  border-color: #b4ddd7;
  background: #e3f5f2;
}

.action-panel--returned {
  border-color: #f3c8c8;
  background: #fdecec;
}

.action-panel--rejected {
  border-color: #efb5b5;
  background: #fbe0e0;
}

.action-panel-head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  color: #5c6b78;
}

.action-panel-text {
  flex: 1;
  min-width: 0;
}

.action-panel-head .q-icon {
  flex-shrink: 0;
  margin-top: 2px;
  color: #d4880f;
}

.action-panel--info .q-icon,
.action-panel--hardcopy .q-icon {
  color: #1c6ea4;
}
.action-panel--approved .q-icon {
  color: #0c9145;
}
.action-panel--announced .q-icon {
  color: #0f766e;
}
.action-panel--returned .q-icon {
  color: #c73f3f;
}
.action-panel--rejected .q-icon {
  color: #8b2c2c;
}
.action-panel--awaiting .q-icon {
  color: #8a5a1a;
}

.action-title {
  color: #19354a;
  font-size: 15px;
  font-weight: 650;
  line-height: 1.3;
}

.action-sub {
  margin-top: 2px;
  color: #7a8792;
  font-size: 12.5px;
  line-height: 1.5;
}

.action-remarks {
  margin-top: 8px;
  padding: 8px 10px;
  border-left: 3px solid #d4880f;
  border-radius: 4px;
  color: #5c6b78;
  background: #ffffff;
  font-size: 12.5px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.action-panel--announced .action-remarks {
  border-left-color: #0f766e;
}

/* Small inline nudge, e.g. "Set the schedule before announcing" */
.action-hint {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-top: 10px;
  color: #8a5a1a;
  font-size: 12px;
  font-style: italic;
  line-height: 1.5;
}

.action-hint .q-icon {
  margin-top: 2px;
  color: #d4880f;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 14px;
}

.action-btn {
  flex-shrink: 0;
  width: 100%;
  min-height: 44px;
  padding: 0 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 650;
  text-transform: none;
  white-space: nowrap;
  transition: background 0.12s ease;
}

/* Quasar lets icon + label wrap onto two lines; keep them side by side */
.action-btn :deep(.q-btn__content),
.doc-action :deep(.q-btn__content) {
  flex-wrap: nowrap;
  white-space: nowrap;
}

.action-btn--primary {
  color: #ffffff;
  background: linear-gradient(135deg, #f5a623, #e8911a);
}

.action-btn--success {
  color: #ffffff;
  background: #0c9145;
}

.action-btn--announce {
  color: #ffffff;
  background: #0f766e;
}

.action-btn--neutral {
  border: 1px solid #d6dce1;
  color: #2b3a4a;
  background: #ffffff;
}

.action-btn--warning {
  color: #b46e0a;
  background: #fef0d8;
}

.action-btn--danger {
  color: #c73f3f;
  background: #fbe3e3;
}

/* ---------- Approved / Announced — announcement block ---------- */
.announcement-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 12px;
  padding: 10px 12px;
  border-left: 3px solid #0c9145;
  border-radius: 4px;
  background: #ffffff;
}

.announcement-block--announced {
  border-left-color: #0f766e;
}

/* Read-only schedule summary inside the announce dialog */
.announcement-block--dialog {
  margin-top: 0;
  margin-bottom: 10px;
  border-left-color: #0f766e;
  background: #f3f6f5;
}

.announcement-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: #5c6b78;
  font-size: 12.5px;
  line-height: 1.5;
}

.announcement-row .q-icon {
  flex-shrink: 0;
  margin-top: 2px;
  color: #0c9145;
}

.announcement-block--announced .announcement-row .q-icon,
.announcement-block--dialog .announcement-row .q-icon {
  color: #0f766e;
}

.announcement-row strong {
  color: #19354a;
  font-weight: 650;
}

/* =========================================================
   LEFT PANEL
========================================================= */
.left-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.panel-step {
  display: flex;
  gap: 14px;
}

.step-index {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  min-width: 26px;
  margin-top: 1px;
  border-radius: 50%;
  color: #ffffff;
  background: #2b3a4a;
  font-size: 12px;
  font-weight: 700;
}

.step-body {
  flex: 1;
  min-width: 0;
}

.step-label {
  margin-bottom: 10px;
  color: #6b7680;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.nominee-chip {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid #e6e8eb;
  border-radius: 10px;
  background: #fafbfc;
}

.nominee-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 50%;
  color: #ffffff;
  background: #2b3a4a;
  font-size: 13px;
  font-weight: 700;
}

.nominee-info {
  flex: 1;
  min-width: 0;
}

/* Wrap on stacked layouts so long names are fully readable */
.nominee-name {
  color: #19354a;
  font-size: 14px;
  font-weight: 650;
  overflow-wrap: anywhere;
}

.nominee-meta {
  margin-top: 2px;
  color: #7a8792;
  font-size: 12px;
  overflow-wrap: anywhere;
}

.office-tag {
  padding: 3px 8px;
  border-radius: 10px;
  color: #0f766e;
  background: #d7f0ed;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.office-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border: 1px solid #e6e8eb;
  border-radius: 8px;
  color: #2b3a4a;
  background: #f7f8f9;
  font-size: 13px;
  font-weight: 600;
}

.office-chip span {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
}

.meta-stack {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

/* ---------- Badges ---------- */
.type-badge,
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.type-exam {
  color: #0c7cb5;
  background: #e6f3fb;
}
.type-award {
  color: #7a4fb8;
  background: #f1eafa;
}
.type-graduate {
  color: #d4880f;
  background: #fef6ea;
}
.type-gawad {
  color: #b0446b;
  background: #fbeaf1;
}

.status-draft {
  color: #6b7680;
  background: #eef1f4;
}
.status-submitted,
.status-hardcopy {
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
.status-awaiting {
  color: #8a5a1a;
  background: #fff2dc;
}
.status-approved {
  color: #0c9145;
  background: #e1f7e6;
}
.status-rejected {
  color: #8b2c2c;
  background: #f6d5d5;
}
.status-announced {
  color: #0f766e;
  background: #d7f0ed;
}

.ref-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ref-line {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: #5c6b78;
  font-size: 12.5px;
}

.ref-line .q-icon {
  flex-shrink: 0;
  margin-top: 2px;
  color: #b3bcc4;
}

.ref-value {
  min-width: 0;
  font-weight: 550;
  overflow-wrap: anywhere;
}

/* =========================================================
   RIGHT PANEL
========================================================= */
.form-section {
  display: flex;
  flex-direction: column;
}

.form-section-title {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin: 18px 0 8px;
  color: #6b7680;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.form-section-title:first-child {
  margin-top: 0;
}

.form-section-title.flush {
  margin: 0;
}

/* Grid (mobile: 1 column). Label styling lives in LabeledField.vue. */
.form-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: start;
  column-gap: 16px;
  row-gap: 14px;
}

.form-grid .col-span-2 {
  grid-column: 1 / -1;
}

.form-grid > * {
  display: block;
  min-width: 0;
  margin: 0;
  padding: 0;
}

.form-grid > * :deep(.q-field) {
  margin-bottom: 0;
}

.form-grid > * :deep(.q-field__bottom) {
  padding-top: 4px;
}

/* 16px avoids iOS zoom if a user taps a read-only field */
.form-grid :deep(.q-field__native),
.form-grid :deep(.q-field__input) {
  font-size: 16px;
}

.readonly-input :deep(.q-field__control) {
  background: #f7f8f9;
}

.readonly-input :deep(.q-field__native),
.readonly-input :deep(.q-field__input) {
  color: #2b3a4a;
  font-weight: 500;
  cursor: default;
}

.readonly-input :deep(.q-field__control:before) {
  border-color: #e6e8eb;
}

.lock-icon {
  color: #b3bcc4;
}

.form-block {
  margin-top: 8px;
  padding: 12px;
  border: 1px solid #edeff1;
  border-radius: 10px;
  background: #fafbfc;
}

.form-block-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.form-block-hint {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #8a95a0;
  font-size: 11px;
  font-style: italic;
}

.form-block-hint .q-icon {
  color: #b3bcc4;
}

/* =========================================================
   SUPPORTING DOCUMENTS
   Mobile: info on top, actions on their own row.
========================================================= */
.form-block--docs {
  margin-top: 16px;
  padding: 16px 12px 20px;
}

.doc-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 6px;
}

.doc-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 12px;
  padding: 10px 12px;
  border: 1px solid #e6e8eb;
  border-radius: 8px;
  background: #ffffff;
}

.doc-row.is-empty {
  border-style: dashed;
  background: #fbfbfc;
}

.doc-row--signed {
  border-color: #f4e2c8;
  background: #fff8f0;
}

.doc-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  min-width: 36px;
  border-radius: 8px;
  color: #5c6b78;
  background: #eef1f4;
}

.doc-icon--signed {
  color: #d4880f;
  background: #fdeccd;
}

.doc-row.is-empty .doc-icon {
  color: #c8cfd5;
  background: #f5f6f7;
}

.doc-info {
  flex: 1;
  min-width: 0;
}

.doc-label {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 8px;
  color: #19354a;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.3;
}

.doc-row--signed .doc-label {
  color: #6b4a1a;
}

.doc-req,
.doc-opt,
.doc-signed {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.doc-req {
  color: #b04a3b;
  background: #fbeeeb;
}

.doc-opt {
  color: #5c6b78;
  background: #eef1f4;
}

.doc-signed {
  color: #ffffff;
  background: #d4880f;
}

.doc-file {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  margin-top: 3px;
  color: #5c6b78;
  font-size: 11.5px;
}

.doc-file span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.doc-file .q-icon {
  flex-shrink: 0;
  color: #97a1a9;
}

.doc-missing {
  color: #b3bcc4;
  font-style: italic;
}

.doc-uploaded-at {
  margin-top: 2px;
  color: #8a5a1a;
  font-size: 10.5px;
  font-style: italic;
}

.doc-actions {
  display: flex;
  flex: 1 1 100%;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}

/* Same soft neutral button as the "act-btn" on the list pages */
.doc-action {
  flex-shrink: 0;
  min-height: 40px;
  padding: 0 12px;
  border-radius: 6px;
  color: #52646f;
  background: #f3f6f5;
  font-size: 12px;
  font-weight: 600;
  text-transform: none;
  white-space: nowrap;
  transition: background 0.12s ease;
}

/* =========================================================
   TIMELINE
========================================================= */
.timeline {
  display: flex;
  flex-direction: column;
  margin-top: 6px;
}

.timeline-item {
  display: flex;
  gap: 14px;
}

.timeline-rail {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 12px;
}

.timeline-dot {
  flex-shrink: 0;
  width: 12px;
  height: 12px;
  margin-top: 6px;
  border-radius: 50%;
  background: #c8cfd5;
}

.timeline-dot.status-draft {
  background: #b3bcc4;
}
.timeline-dot.status-submitted,
.timeline-dot.status-hardcopy {
  background: #4a90d9;
}
.timeline-dot.status-review {
  background: #e8911a;
}
.timeline-dot.status-returned {
  background: #c73f3f;
}
.timeline-dot.status-awaiting {
  background: #d4880f;
}
.timeline-dot.status-approved {
  background: #2f9e5c;
}
.timeline-dot.status-rejected {
  background: #8b2c2c;
}
.timeline-dot.status-announced {
  background: #0f766e;
}

.timeline-line {
  flex: 1;
  width: 2px;
  min-height: 12px;
  margin: 4px 0;
  background: #e6e8eb;
}

.timeline-body {
  flex: 1;
  min-width: 0;
  padding-bottom: 14px;
}

.timeline-item.is-last .timeline-body {
  padding-bottom: 0;
}

.timeline-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 4px 10px;
}

.timeline-transition {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
  color: #19354a;
  font-size: 13px;
  font-weight: 650;
}

.timeline-transition .q-icon {
  color: #97a1a9;
}

.timeline-time {
  color: #97a1a9;
  font-size: 11.5px;
}

.timeline-actor {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 3px;
  color: #7a8792;
  font-size: 11.5px;
}

.timeline-actor .q-icon {
  color: #b3bcc4;
}

.timeline-remarks {
  margin-top: 6px;
  padding: 8px 10px;
  border-left: 3px solid #e8911a;
  border-radius: 4px;
  color: #5c6b78;
  background: #ffffff;
  font-size: 12px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.timeline-empty {
  padding: 12px 0;
  color: #97a1a9;
  font-size: 12.5px;
  font-style: italic;
}

/* =========================================================
   ACTION DIALOG — same system as the list-page dialogs
   (centered icon · title · message · actions).
   Mobile: stacked full-width buttons, confirm on top.
========================================================= */
.confirmation-dialog {
  width: min(390px, 92vw);
  max-width: 92vw;
  padding: 24px 20px 18px;
  text-align: center;
}

/* Taller dialog with fields: scroll inside on short screens */
.confirmation-dialog--form {
  width: min(440px, 92vw);
  max-height: 92vh;
  overflow-y: auto;
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

.confirmation-icon.is-primary {
  color: #e8911a;
  background: #fef3e2;
}
.confirmation-icon.is-success {
  color: #0c9145;
  background: #e1f7e6;
}
.confirmation-icon.is-warning {
  color: #d4880f;
  background: #fff3d6;
}
.confirmation-icon.is-danger {
  color: #c73f3f;
  background: #fbe9e9;
}
.confirmation-icon.is-announce {
  color: #0f766e;
  background: #d7f0ed;
}

.confirmation-title {
  color: #19354a;
  font-size: var(--fs-xl);
  font-weight: var(--fw-bold);
  line-height: var(--lh-tight);
}

/* Who the action applies to */
.confirmation-subject {
  display: inline-block;
  max-width: 100%;
  margin-top: 8px;
  padding: 3px 12px;
  border-radius: 12px;
  color: #405967;
  background: #f3f6f5;
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  overflow-wrap: anywhere;
}

.confirmation-message {
  margin: 10px 0 0;
  color: #718089;
  font-size: var(--fs-base);
  line-height: var(--lh-relaxed);
}

/* Fields stay left-aligned inside the centered dialog */
.confirmation-form {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 18px;
  text-align: left;
}

/* 16px stops iOS Safari from zooming when a field is focused */
.confirmation-form :deep(.q-field__native),
.confirmation-form :deep(textarea) {
  font-size: 16px;
}

.confirmation-actions {
  display: flex;
  flex-direction: column-reverse;
  gap: 8px;
  margin-top: 22px;
}

.confirmation-actions .q-btn {
  width: 100%;
}

.dialog-cancel-btn {
  min-height: 44px;
  color: #708088;
  font-size: var(--fs-base);
  font-weight: var(--fw-medium);
}

.dialog-confirm-btn {
  min-height: 44px;
  padding: 0 18px;
  color: #ffffff;
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
}

.dialog-confirm-btn.is-primary {
  background: linear-gradient(135deg, #f5a623, #e8911a);
}
.dialog-confirm-btn.is-success {
  background: #0c9145;
}
.dialog-confirm-btn.is-warning {
  background: #d4880f;
}
.dialog-confirm-btn.is-danger {
  background: #d64545;
}
.dialog-confirm-btn.is-announce {
  background: #0f766e;
}

/* =========================================================
   >= 600px  (large phones / small tablets)
========================================================= */
@media (min-width: 600px) {
  .form-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .form-grid :deep(.q-field__native),
  .form-grid :deep(.q-field__input),
  .confirmation-form :deep(.q-field__native),
  .confirmation-form :deep(textarea) {
    font-size: inherit;
  }

  .form-block {
    padding: 12px 16px 14px;
  }

  .form-block--docs {
    padding: 16px 16px 20px;
  }

  /* Documents: actions sit on the same row as the file info */
  .doc-row {
    flex-wrap: nowrap;
  }

  .doc-actions {
    flex: 0 0 auto;
  }

  .doc-action {
    min-height: 32px;
  }

  .action-panel {
    padding: 16px 20px;
  }

  .action-buttons {
    flex-flow: row wrap;
  }

  .action-btn {
    width: auto;
    min-height: 40px;
  }

  .state-box {
    min-height: 360px;
    padding: 40px 24px;
  }

  .confirmation-dialog {
    padding: 28px 25px 22px;
  }

  .confirmation-actions {
    flex-direction: row;
    justify-content: flex-end;
  }

  .confirmation-actions .q-btn {
    width: auto;
  }

  .dialog-cancel-btn,
  .dialog-confirm-btn {
    min-height: 36px;
  }
}

/* =========================================================
   >= 900px  (header goes horizontal)
========================================================= */
@media (min-width: 900px) {
  .page-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
  }

  .page-header-actions {
    flex-shrink: 0;
  }

  .page-header-actions .btn-ghost {
    flex: 0 0 auto;
  }

  .btn-ghost,
  .btn-primary {
    min-height: 42px;
  }

  .btn-primary--sm {
    min-height: 34px;
  }
}

/* =========================================================
   >= 1024px  (desktop: page fills the window, cards scroll)
   Card heights are handled by TwoColumnLayout.
========================================================= */
@media (min-width: 1024px) {
  .review-page {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .review-page > * {
    flex-shrink: 0;
  }

  .review-page > .layout-fill {
    flex: 1 1 0;
    min-height: 0;
  }

  .nominee-name,
  .nominee-meta {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

/* =========================================================
   Hover only where a real pointer exists
========================================================= */
@media (hover: hover) and (pointer: fine) {
  .action-btn--neutral:hover {
    background: #f7f8f9;
  }

  .action-btn--warning:hover {
    background: #fde6bd;
  }

  .action-btn--danger:hover {
    background: #f8d3d3;
  }

  .action-btn--announce:hover {
    background: #0b5f58;
  }

  .doc-action:hover {
    background: #e6ecea;
  }
}

/* =========================================================
   Accessibility
========================================================= */
@media (prefers-reduced-motion: reduce) {
  .action-btn,
  .doc-action {
    transition: none;
  }
}
</style>
