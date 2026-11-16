<template>
  <q-page class="view-page" :style-fn="pageStyleFn">
    <!-- PAGE HEADER -->
    <section class="page-header">
      <div class="page-header-text">
        <div class="page-eyebrow">
          Nomination
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
        <q-btn
          v-if="canEdit"
          unelevated
          no-caps
          :icon="isAwaitingHardcopy ? 'edit_document' : 'edit'"
          :label="isAwaitingHardcopy ? 'Upload Signed Form' : 'Edit'"
          class="btn-primary"
          @click="goEdit"
        />
      </div>
    </section>

    <!-- LOADING -->
    <div v-if="isLoading" class="state-box">
      <q-spinner-dots color="primary" size="42px" />
      <div class="state-text">Loading nomination…</div>
    </div>

    <!-- NOT FOUND -->
    <div v-else-if="!record" class="state-box state-box--error">
      <q-icon name="search_off" size="42px" />
      <div class="state-title">Nomination not found</div>
      <div class="state-text">
        This nomination either doesn’t exist or isn’t part of your office.
      </div>
      <q-btn
        unelevated
        no-caps
        label="Back to list"
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

          <!-- Nominating office -->
          <div class="panel-step">
            <div class="step-index">2</div>
            <div class="step-body">
              <div class="step-label">Nominating Office</div>
              <div class="office-chip">
                <q-icon name="business" size="16px" />
                <span>{{ record.office || "—" }}</span>
                <q-icon name="lock" size="13px" class="chip-lock" />
              </div>
            </div>
          </div>

          <!-- Type & Status -->
          <div class="panel-step">
            <div class="step-index">3</div>
            <div class="step-body">
              <div class="step-label">Type &amp; Status</div>
              <div class="meta-stack">
                <div class="meta-row">
                  <span class="type-badge" :class="TYPE_CLASSES[record.type]">
                    {{ TYPE_LABELS[record.type] || record.type }}
                  </span>
                  <span v-if="typeMeta?.form" class="form-tag">
                    Form {{ typeMeta.form }}
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
          <div
            class="panel-step"
            :class="{ 'panel-step--last': !record.remarks }"
          >
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

          <!-- Remarks -->
          <div v-if="record.remarks" class="form-block form-block--remark">
            <div class="form-block-head">
              <q-icon name="chat_bubble_outline" size="15px" />
              <div class="form-section-title flush">Remarks from Reviewer</div>
            </div>
            <div class="remark-body">{{ record.remarks }}</div>
          </div>
        </div>
      </template>

      <!-- RIGHT — DETAILS -->
      <template #right>
        <div class="form-section">
          <!-- SECTION NAVIGATOR -->
          <div v-if="navSections.length >= 3" class="section-nav-sticky">
            <nav class="section-nav" aria-label="Nomination sections">
              <div class="section-nav-title">
                <span class="section-nav-label">Jump to</span>
                <span class="section-nav-count">
                  {{ navSections.length }} sections
                </span>
              </div>
              <div class="section-nav-chips">
                <q-chip
                  v-for="sec in navSections"
                  :key="sec.id"
                  clickable
                  dense
                  :icon="sec.complete ? 'check_circle' : undefined"
                  :label="`${sec.number}. ${sec.title}`"
                  class="section-chip"
                  :class="{ 'is-complete': sec.complete }"
                  @click="scrollToSection(sec.id)"
                />
              </div>
            </nav>
          </div>

          <!-- SCHEDULED ANNOUNCEMENT (approved only) -->
          <div
            v-if="record.status === 'approved' && record.announcement_datetime"
            class="scheduled-block"
          >
            <div class="scheduled-head">
              <q-icon name="campaign" size="20px" />
              <div class="scheduled-title">Scheduled for Recognition</div>
            </div>
            <div class="scheduled-body">
              <div class="scheduled-row">
                <q-icon name="event" size="14px" />
                <span>
                  <strong>Date &amp; Time:</strong>
                  {{ formatDateTime(record.announcement_datetime) }}
                </span>
              </div>
              <div v-if="record.announcement_venue" class="scheduled-row">
                <q-icon name="place" size="14px" />
                <span>
                  <strong>Venue:</strong> {{ record.announcement_venue }}
                </span>
              </div>
            </div>
          </div>

          <!-- EMPLOYEE + CONTACT INFO -->
          <template v-if="!isOffice">
            <div id="sec-employee" class="form-block">
              <div class="form-block-head">
                <span class="section-badge">{{
                  sectionNumber("sec-employee")
                }}</span>
                <div class="form-section-title flush">Employee Information</div>
                <div class="form-block-hint">
                  <q-icon name="lock" size="12px" />
                  Taken from the employee record.
                </div>
              </div>
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
            </div>

            <div id="sec-contact" class="form-block">
              <div class="form-block-head">
                <span class="section-badge">{{
                  sectionNumber("sec-contact")
                }}</span>
                <div class="form-section-title flush">Contact Information</div>
              </div>
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
            </div>
          </template>

          <div v-else id="sec-office" class="form-block">
            <div class="form-block-head">
              <span class="section-badge">{{
                sectionNumber("sec-office")
              }}</span>
              <div class="form-section-title flush">Office Information</div>
            </div>
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
          </div>

          <!-- DYNAMIC SECTIONS -->
          <div
            v-for="(section, sIdx) in sections"
            :id="`sec-${sIdx}`"
            :key="section.title"
            class="form-block"
            :class="{ 'is-complete': isSectionComplete(`sec-${sIdx}`) }"
          >
            <div class="form-block-head">
              <span
                class="section-badge"
                :class="{ 'is-complete': isSectionComplete(`sec-${sIdx}`) }"
              >
                <q-icon
                  v-if="isSectionComplete(`sec-${sIdx}`)"
                  name="check"
                  size="13px"
                />
                <template v-else>{{ sectionNumber(`sec-${sIdx}`) }}</template>
              </span>
              <div class="form-section-title flush">{{ section.title }}</div>
              <span
                v-if="sectionProgressLabel(`sec-${sIdx}`)"
                class="section-progress"
                :class="{ 'is-complete': isSectionComplete(`sec-${sIdx}`) }"
              >
                {{ sectionProgressLabel(`sec-${sIdx}`) }}
              </span>
              <div v-if="section.hint" class="form-block-hint">
                <q-icon name="info" size="12px" />
                {{ section.hint }}
              </div>
            </div>

            <div class="form-grid">
              <template v-for="field in section.fields" :key="field.key">
                <!-- REPEATABLE (read-only) -->
                <div
                  v-if="field.kind === 'repeatable'"
                  class="repeatable-view"
                  :class="{ 'col-span-2': field.span === 2 }"
                >
                  <div
                    v-for="(row, rowIdx) in repeatableRows(field.key)"
                    :key="`${field.key}-${rowIdx}`"
                    class="repeatable-view-row"
                  >
                    <div class="repeatable-view-head">
                      <span class="repeatable-view-num">
                        <q-icon name="drag_indicator" size="13px" />
                        Entry {{ rowIdx + 1 }}
                      </span>
                    </div>

                    <div class="form-grid repeatable-view-grid">
                      <LabeledField
                        v-for="sub in field.rowFields"
                        :key="sub.key"
                        :label="sub.label"
                        :class="{ 'col-span-2': sub.span === 2 }"
                      >
                        <q-input
                          :model-value="row[sub.key] || '—'"
                          outlined
                          dense
                          readonly
                          type="textarea"
                          autogrow
                          :rows="sub.rows || 3"
                          class="readonly-input"
                        >
                          <template #append>
                            <q-icon name="lock" size="13px" class="lock-icon" />
                          </template>
                        </q-input>
                      </LabeledField>
                    </div>
                  </div>

                  <div
                    v-if="repeatableRows(field.key).length === 0"
                    class="repeatable-view-empty"
                  >
                    No entries recorded.
                  </div>
                </div>

                <!-- REGULAR FIELD -->
                <LabeledField
                  v-else
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
              </template>
            </div>
          </div>

          <!-- SUPPORTING DOCUMENTS -->
          <div
            id="sec-docs"
            class="form-block form-block--docs"
            :class="{ 'is-complete': isSectionComplete('sec-docs') }"
          >
            <div class="form-block-head">
              <span
                class="section-badge"
                :class="{ 'is-complete': isSectionComplete('sec-docs') }"
              >
                <q-icon
                  v-if="isSectionComplete('sec-docs')"
                  name="check"
                  size="13px"
                />
                <template v-else>{{ sectionNumber("sec-docs") }}</template>
              </span>
              <div class="form-section-title flush">Supporting Documents</div>
              <span
                v-if="sectionProgressLabel('sec-docs')"
                class="section-progress"
                :class="{ 'is-complete': isSectionComplete('sec-docs') }"
              >
                {{ sectionProgressLabel("sec-docs") }}
              </span>
              <div class="form-block-hint">
                <q-icon name="description" size="12px" />
                {{ uploadedCount }} of {{ totalDocsCount }} uploaded
              </div>
            </div>

            <div class="doc-list">
              <!-- SIGNED FORM -->
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
                    size="sm"
                    icon="visibility"
                    label="View"
                    class="doc-action"
                    :loading="viewingKey === 'signed_form'"
                    @click="viewSignedForm"
                  >
                    <q-tooltip>Open in a new tab</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    dense
                    no-caps
                    size="sm"
                    icon="download"
                    label="Download"
                    class="doc-action"
                    :loading="downloadingKey === 'signed_form'"
                    @click="downloadSignedForm"
                  >
                    <q-tooltip>Save to your device</q-tooltip>
                  </q-btn>
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
                    size="sm"
                    icon="visibility"
                    label="View"
                    class="doc-action"
                    :loading="viewingKey === doc.key"
                    @click="viewDoc(doc)"
                  >
                    <q-tooltip>Open in a new tab</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    dense
                    no-caps
                    size="sm"
                    icon="download"
                    label="Download"
                    class="doc-action"
                    :loading="downloadingKey === doc.key"
                    @click="downloadDoc(doc)"
                  >
                    <q-tooltip>Save to your device</q-tooltip>
                  </q-btn>
                </div>
              </div>
            </div>
          </div>

          <!-- STATUS HISTORY -->
          <div id="sec-history" class="form-block">
            <div class="form-block-head">
              <span class="section-badge">{{
                sectionNumber("sec-history")
              }}</span>
              <div class="form-section-title flush">Status History</div>
              <span
                v-if="statusHistory.length"
                class="section-progress is-complete"
              >
                {{ statusHistory.length }}
                {{ statusHistory.length === 1 ? "event" : "events" }}
              </span>
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
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, nextTick, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { useNominationStore } from "src/stores/nominationStore";
import { api } from "boot/axios";
import TwoColumnLayout from "src/components/TwoColumnLayout.vue";
import LabeledField from "src/components/LabeledField.vue";
import {
  NOMINATION_TYPES,
  TYPE_SECTIONS,
  TYPE_DOCS,
  TYPE_LABELS,
  TYPE_CLASSES,
  STATUS_LABELS,
  STATUS_CLASSES,
  getStoredOffice,
} from "src/constants/NominationConfig";

/* =========================================================
   CONSTANTS
========================================================= */
const INFO_FIELDS = [
  { key: "employee", label: "Employee Name", span: 2 },
  { key: "position", label: "Position" },
  { key: "employment_status", label: "Status of Employment" },
  { key: "department", label: "Department / Office", span: 2 },
];

/* =========================================================
   PURE HELPERS
========================================================= */
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

function isFilled(value) {
  return !(value === null || value === undefined || value === "");
}

export default defineComponent({
  name: "ViewNominationPage",
  components: { TwoColumnLayout, LabeledField },

  setup() {
    const $q = useQuasar();
    const route = useRoute();
    const router = useRouter();
    const nominationStore = useNominationStore();

    const officeName = ref(getStoredOffice());

    // Desktop: exact viewport height so the page itself never scrolls.
    // Phones/tablets: normal min-height, page scrolls naturally.
    function pageStyleFn(offset) {
      const h = offset ? `calc(100dvh - ${offset}px)` : "100dvh";
      return $q.screen.gt.sm ? { height: h } : { minHeight: h };
    }

    function notify(message, type = "positive") {
      $q.notify({ type, message, position: "top" });
    }

    /* =========================================================
       STATE
    ========================================================= */
    const record = ref(null);

    // Local loading flag — nominationStore.isLoading is used by the
    // list/mutation flows and isn't toggled by fetchOne.
    const isLoading = ref(true);

    const viewingKey = ref(null);
    const downloadingKey = ref(null);

    /* =========================================================
       COMPUTED — record
    ========================================================= */
    const isOffice = computed(() => !!record.value?.is_office);

    const isAwaitingHardcopy = computed(
      () => record.value?.status === "awaiting_hardcopy"
    );

    const typeMeta = computed(
      () => NOMINATION_TYPES.find((t) => t.value === record.value?.type) || null
    );

    const sections = computed(() => TYPE_SECTIONS[record.value?.type] || []);
    const docsList = computed(() => TYPE_DOCS[record.value?.type] || []);

    const nomineeInitials = computed(() => getInitials(record.value?.employee));

    const headerTitle = computed(() => {
      if (!record.value) return "Nomination";
      return (
        record.value.employee ||
        (isOffice.value ? "Office Nomination" : "Nomination")
      );
    });

    const headerSubtitle = computed(() => {
      if (!record.value) return "";
      const label = TYPE_LABELS[record.value.type] || record.value.type;
      const status = STATUS_LABELS[record.value.status] || record.value.status;
      return `${label} · ${status}`;
    });

    // Drafts, returned, and awaiting_hardcopy are all editable from
    // the office's perspective (the last one is signed-form-only).
    const canEdit = computed(() =>
      ["draft", "returned", "awaiting_hardcopy"].includes(record.value?.status)
    );

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

    const signedFormMeta = computed(
      () => record.value?.signed_docs?.signed_form || null
    );

    /* =========================================================
       DOC / FIELD HELPERS
    ========================================================= */
    function docFileName(doc) {
      const raw = record.value?.docs?.[doc.key];
      if (!raw) return null;
      if (typeof raw === "string") return raw;
      return raw.name || null;
    }

    function docViewUrl(doc) {
      const raw = record.value?.docs?.[doc.key];
      if (!raw || typeof raw === "string") return null;
      return raw.url || null;
    }

    function docDownloadUrl(doc) {
      const raw = record.value?.docs?.[doc.key];
      if (!raw || typeof raw === "string") return null;
      return raw.download_url || raw.url || null;
    }

    const totalDocsCount = computed(() => docsList.value.length + 1);

    const uploadedCount = computed(() => {
      const regular = docsList.value.filter((d) => !!docFileName(d)).length;
      return regular + (signedFormMeta.value ? 1 : 0);
    });

    function displayValue(field) {
      const raw = record.value?.details?.[field.key];
      if (!isFilled(raw)) return "—";

      if (field.kind === "select") {
        const opt = (field.options || []).find((o) => o.value === raw);
        return opt?.label || raw;
      }
      if (field.kind === "date") return formatDate(raw);
      if (field.kind === "datetime") return formatDateTime(raw);
      if (field.kind === "rating") return `${raw}%`;
      return String(raw);
    }

    /** Always a safe array, even if the backend omits the key. */
    function repeatableRows(key) {
      const raw = record.value?.details?.[key];
      return Array.isArray(raw) ? raw : [];
    }

    /* =========================================================
       SECTION NAVIGATOR / PROGRESS
    ========================================================= */
    function sectionProgress(section) {
      let done = 0;
      let total = 0;
      section.fields.forEach((field) => {
        if (field.kind === "derived") return;
        total += 1;
        if (field.kind === "repeatable") {
          if (repeatableRows(field.key).length > 0) done += 1;
        } else if (isFilled(record.value?.details?.[field.key])) {
          done += 1;
        }
      });
      return { done, total };
    }

    function docsProgress() {
      const required = docsList.value.filter((d) => !d.optional);
      const done = required.filter((d) => !!docFileName(d)).length;
      return { done, total: required.length };
    }

    const navSections = computed(() => {
      if (!record.value) return [];
      const list = [];

      if (isOffice.value) {
        list.push({ id: "sec-office", title: "Office", done: 0, total: 0 });
      } else {
        list.push({ id: "sec-employee", title: "Employee", done: 0, total: 0 });
        list.push({ id: "sec-contact", title: "Contact", done: 0, total: 0 });
      }

      sections.value.forEach((section, i) => {
        list.push({
          id: `sec-${i}`,
          title: section.title,
          ...sectionProgress(section),
        });
      });

      list.push({ id: "sec-docs", title: "Documents", ...docsProgress() });
      list.push({ id: "sec-history", title: "History", done: 0, total: 0 });

      return list.map((sec, i) => ({
        ...sec,
        number: i + 1,
        complete: sec.total > 0 && sec.done === sec.total,
      }));
    });

    const navById = computed(() =>
      Object.fromEntries(navSections.value.map((sec) => [sec.id, sec]))
    );

    const sectionNumber = (id) => navById.value[id]?.number ?? "";
    const isSectionComplete = (id) => !!navById.value[id]?.complete;
    const sectionProgressLabel = (id) => {
      const sec = navById.value[id];
      if (!sec || !sec.total) return "";
      if (sec.complete) return "Complete";
      return id === "sec-docs"
        ? `${sec.done}/${sec.total} required`
        : `${sec.done}/${sec.total} filled`;
    };

    function scrollToSection(id) {
      nextTick(() => {
        document
          .getElementById(id)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    /* =========================================================
       FILE VIEW / DOWNLOAD
       Fetch as blob with the auth header (window.open alone
       would send no auth header).
    ========================================================= */
    async function openBlob(url, key, failMessage) {
      viewingKey.value = key;
      try {
        const res = await api.get(url, { responseType: "blob" });
        const blobUrl = URL.createObjectURL(res.data);
        window.open(blobUrl, "_blank", "noopener,noreferrer");
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
      } catch (err) {
        notify(err?.response?.data?.message || failMessage, "negative");
      } finally {
        viewingKey.value = null;
      }
    }

    async function saveBlob(url, key, filename, failMessage) {
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
        notify(err?.response?.data?.message || failMessage, "negative");
      } finally {
        downloadingKey.value = null;
      }
    }

    async function viewDoc(doc) {
      if (!docFileName(doc)) return;
      const url = docViewUrl(doc);
      if (!url) {
        notify("Document URL is not available.", "negative");
        return;
      }
      await openBlob(
        url,
        doc.key,
        "Unable to open the document. Please try again."
      );
    }

    async function downloadDoc(doc) {
      const name = docFileName(doc);
      if (!name) return;
      const url = docDownloadUrl(doc);
      if (!url) {
        notify("Document URL is not available.", "negative");
        return;
      }
      await saveBlob(
        url,
        doc.key,
        name,
        "Unable to download the document. Please try again."
      );
    }

    async function viewSignedForm() {
      const meta = signedFormMeta.value;
      if (!meta?.url) {
        notify("Signed form URL is not available.", "negative");
        return;
      }
      await openBlob(
        meta.url,
        "signed_form",
        "Unable to open the signed form. Please try again."
      );
    }

    async function downloadSignedForm() {
      const meta = signedFormMeta.value;
      if (!meta) return;
      const url = meta.download_url || meta.url;
      if (!url) {
        notify("Signed form URL is not available.", "negative");
        return;
      }
      await saveBlob(
        url,
        "signed_form",
        meta.name || "signed_form",
        "Unable to download the signed form. Please try again."
      );
    }

    /* =========================================================
       NAVIGATION
    ========================================================= */
    function goBack() {
      router.back();
    }

    function goEdit() {
      if (!record.value) return;
      router.push({
        name: "edit_nomination",
        params: { id: record.value.id },
      });
    }

    /* =========================================================
       INIT
       Always fetch via nominationStore.fetchOne(id). The list
       endpoint returns COMPACT rows (no docs / status_history),
       so getById would give an incomplete record.
    ========================================================= */
    onMounted(async () => {
      if (!officeName.value) {
        notify("No office is assigned to this account.", "negative");
        isLoading.value = false;
        return;
      }

      try {
        const result = await nominationStore.fetchOne(route.params.id);

        if (!result.success || !result.data) {
          record.value = null;
          return;
        }

        // Scope guard — callers can only view their own office's nominations.
        if (result.data.office !== officeName.value) {
          record.value = null;
          return;
        }

        record.value = result.data;
      } finally {
        isLoading.value = false;
      }
    });

    return {
      nominationStore,
      pageStyleFn,
      record,
      isLoading,
      isOffice,
      isAwaitingHardcopy,
      typeMeta,
      sections,
      docsList,
      nomineeInitials,
      headerTitle,
      headerSubtitle,
      canEdit,
      statusHistory,
      uploadedCount,
      totalDocsCount,
      signedFormMeta,

      // navigator
      navSections,
      sectionNumber,
      isSectionComplete,
      sectionProgressLabel,
      scrollToSection,

      viewingKey,
      downloadingKey,

      INFO_FIELDS,
      TYPE_LABELS,
      TYPE_CLASSES,
      STATUS_LABELS,
      STATUS_CLASSES,

      displayValue,
      repeatableRows,
      docFileName,
      viewDoc,
      downloadDoc,
      viewSignedForm,
      downloadSignedForm,
      formatDate,
      formatDateTime,

      goBack,
      goEdit,
    };
  },
});
</script>

<style scoped>
/* =========================================================
   PAGE SHELL
========================================================= */
.view-page {
  min-height: 100%;
  padding: clamp(10px, 2vw, 16px);
  padding-left: max(clamp(10px, 2vw, 16px), env(safe-area-inset-left));
  padding-right: max(clamp(10px, 2vw, 16px), env(safe-area-inset-right));
  padding-bottom: max(clamp(10px, 2vw, 16px), env(safe-area-inset-bottom));
  background: #f5f6f7;
  overflow-x: clip;
}

.page-header {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
  margin-bottom: 12px;
  padding: 12px 14px;
  background: #ffffff;
  border: 1px solid #e6e8eb;
  border-radius: 10px;
}
.page-header-text {
  min-width: 0;
}
.page-eyebrow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #8a95a0;
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
  margin: 0 0 2px;
  color: #19354a;
  font-size: var(--fs-xl);
  font-weight: var(--fw-bold);
  line-height: var(--lh-tight);
  overflow-wrap: anywhere;
}
.page-header p {
  margin: 0;
  color: #7a8792;
  font-size: 12.5px;
  line-height: 1.45;
  max-width: 560px;
}
.page-header-actions {
  display: flex;
  align-items: stretch;
  gap: 8px;
}
.page-header-actions .btn-ghost {
  flex: 1;
}
.page-header-actions .btn-primary {
  flex: 2;
}

/* Buttons */
.btn-ghost {
  min-height: 40px;
  padding: 0 14px;
  color: #5c6b78;
  font-size: 13px;
  font-weight: 600;
}
.btn-primary {
  min-height: 40px;
  padding: 0 18px;
  border-radius: 8px;
  color: #ffffff;
  background: linear-gradient(135deg, #f5a623, #e8911a);
  font-size: 13px;
  font-weight: 650;
  box-shadow: 0 3px 8px rgba(232, 145, 26, 0.22);
}
.btn-primary--sm {
  min-height: 36px;
  padding: 0 16px;
  font-size: 12.5px;
  box-shadow: none;
}

/* State boxes */
.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 240px;
  padding: 28px 16px;
  background: #ffffff;
  border: 1px solid #e6e8eb;
  border-radius: 10px;
  color: #7a8792;
  text-align: center;
}
.state-box--error .q-icon {
  color: #c8cfd5;
}
.state-title {
  font-size: 15px;
  font-weight: 650;
  color: #19354a;
}
.state-text {
  font-size: 13px;
  color: #7a8792;
  max-width: 380px;
  line-height: 1.5;
}

/* =========================================================
   LEFT PANEL — summary steps
========================================================= */
.left-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.panel-step {
  position: relative;
  display: flex;
  gap: 10px;
}
/* connector line between steps */
.panel-step:not(.panel-step--last)::before {
  content: "";
  position: absolute;
  left: 10px;
  top: 25px;
  bottom: -12px;
  width: 1px;
  background: #dde3e8;
}
.step-index {
  position: relative;
  z-index: 1;
  width: 22px;
  height: 22px;
  min-width: 22px;
  border-radius: 50%;
  background: #2b3a4a;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
}
.step-body {
  flex: 1;
  min-width: 0;
}
.step-label {
  margin: 2px 0 6px;
  font-size: 11px;
  font-weight: 700;
  color: #6b7680;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

/* Nominee chip */
.nominee-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #f7f8f9;
  border: 1px solid #e6e8eb;
  border-radius: 8px;
}
.nominee-avatar {
  width: 34px;
  height: 34px;
  min-width: 34px;
  border-radius: 50%;
  background: #2b3a4a;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}
.nominee-info {
  flex: 1;
  min-width: 0;
}
.nominee-name {
  font-size: 13.5px;
  font-weight: 650;
  color: #19354a;
  overflow-wrap: anywhere;
}
.nominee-meta {
  margin-top: 1px;
  font-size: 11.5px;
  color: #7a8792;
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

/* Office chip */
.office-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f7f8f9;
  border: 1px solid #e6e8eb;
  border-radius: 8px;
  color: #2b3a4a;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.35;
}
.office-chip span {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
}
.chip-lock {
  color: #b3bcc4;
}

/* Type + status */
.meta-stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
}
.meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.type-badge,
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
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
.type-graduate,
.type-gawad {
  color: #d4880f;
  background: #fef6ea;
}
.form-tag {
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 4px;
  color: #5c6b78;
  background: #eef1f4;
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.3px;
}
.status-draft {
  color: #6b7680;
  background: #eef1f4;
}
.status-submitted {
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
.status-hardcopy {
  color: #1c6ea4;
  background: #e6f0fa;
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

/* Reference */
.ref-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ref-line {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12.5px;
  color: #5c6b78;
}
.ref-line .q-icon {
  color: #b3bcc4;
  flex-shrink: 0;
  margin-top: 2px;
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
  --panel-bg: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Section navigator — sticky. The wrapper paints an opaque cover over
   the panel's top/side padding and the gap below, so scrolled content
   never shows around the bar. Set --panel-bg to the panel background. */
.section-nav-sticky {
  position: sticky;
  top: 0;
  z-index: 3;
  padding-bottom: 12px;
  margin-bottom: -12px;
}
.section-nav-sticky::before {
  content: "";
  position: absolute;
  z-index: -1;
  top: -40px;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--panel-bg, #ffffff);
  box-shadow: -24px 0 0 var(--panel-bg, #ffffff),
    24px 0 0 var(--panel-bg, #ffffff);
}
.section-nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 12px 10px;
  background: #ffffff;
  border: 1px solid #dfe3e7;
  border-radius: 10px;
}
.section-nav-title {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}
.section-nav-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #6b7680;
}
.section-nav-count {
  font-size: 11.5px;
  font-weight: 600;
  color: #7a8792;
}
.section-nav-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 6px;
}
.section-chip {
  max-width: 100%;
  margin: 0;
  color: #4a5763;
  background: #f4f6f8;
  border: 1px solid #e3e7eb;
  font-size: 12px;
  font-weight: 600;
}
.section-chip :deep(.q-chip__content) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.section-chip.is-complete {
  color: #1f7a45;
  background: #eaf7f0;
  border-color: #bfe3cd;
}

/* Scheduled announcement */
.scheduled-block {
  padding: 12px 14px;
  background: #e1f7e6;
  border: 1px solid #bfe6cb;
  border-left: 4px solid #0c9145;
  border-radius: 10px;
}
.scheduled-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.scheduled-head .q-icon {
  color: #0c9145;
  flex-shrink: 0;
}
.scheduled-title {
  font-size: 12px;
  font-weight: 700;
  color: #0c5b2c;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.scheduled-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-left: 8px;
}
.scheduled-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: #19354a;
  line-height: 1.5;
  overflow-wrap: anywhere;
}
.scheduled-row .q-icon {
  color: #0c9145;
  flex-shrink: 0;
  margin-top: 2px;
}
.scheduled-row strong {
  color: #0c5b2c;
  font-weight: 650;
}

/* =========================================================
   SECTION CARD
========================================================= */
.form-block {
  --blk-px: 12px;
  position: relative;
  padding: 0 var(--blk-px) 12px;
  background: #ffffff;
  border: 1.5px solid #9fb1c1;
  border-radius: 10px;
  overflow: hidden;
  scroll-margin-top: 130px; /* clears the sticky navigator */
}
.form-block.is-complete {
  border-color: #5cb985;
}
.form-block--docs {
  padding-bottom: 14px;
}

/* Header band: [number] Title ........ [progress]
   hint sits on its own line underneath */
.form-block-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px 10px;
  margin: 0 calc(-1 * var(--blk-px)) 12px;
  padding: 9px var(--blk-px);
  background: #f4f6f8;
  border-bottom: 1px solid #dfe5ea;
}
.form-block.is-complete .form-block-head {
  background: #f1faf5;
  border-bottom-color: #d3ecdd;
}
.section-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  min-width: 22px;
  border-radius: 50%;
  background: #2b3a4a;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
}
.section-badge.is-complete {
  background: #2f9e5c;
}
.form-section-title {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: #19354a;
  line-height: 1.3;
}
.form-section-title.flush {
  margin: 0;
}
.section-progress {
  margin-left: auto;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 650;
  white-space: nowrap;
  color: #7a5a1a;
  background: #fdf1dc;
}
.section-progress.is-complete {
  color: #1f7a45;
  background: #e1f4ea;
}
.form-block-hint {
  display: inline-flex;
  align-items: flex-start;
  gap: 4px;
  flex: 1 1 100%;
  order: 3;
  padding-left: 32px;
  font-size: 11.5px;
  line-height: 1.45;
  color: #7a8792;
}
.form-block-hint .q-icon {
  color: #aab4bc;
  margin-top: 2px;
  flex-shrink: 0;
}

/* Remarks (left panel) */
.form-block--remark {
  background: #fff8f0;
  border-color: #e8b36a;
}
.form-block--remark .form-block-head {
  background: #fdf0dc;
  border-bottom-color: #f4e2c8;
  margin-bottom: 8px;
}
.form-block--remark .form-block-head .q-icon {
  color: #d4880f;
}
.form-block--remark .form-section-title {
  color: #8a5a1a;
}
.remark-body {
  font-size: 13px;
  color: #6b4a1a;
  line-height: 1.55;
  overflow-wrap: anywhere;
}

/* =========================================================
   GRID + READ-ONLY INPUTS
========================================================= */
.form-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  column-gap: 12px;
  row-gap: 10px;
  align-items: start;
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
  padding-top: 3px;
}
.form-grid :deep(.q-field__control) {
  min-height: 44px;
}
.readonly-input :deep(.q-field__control) {
  background: #f2f4f6;
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

/* =========================================================
   REPEATABLE (read-only)
========================================================= */
.repeatable-view {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  min-width: 0;
}
.repeatable-view-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  background: #fafbfc;
  border: 1px solid #e6e8eb;
  border-radius: 8px;
}
.repeatable-view-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.repeatable-view-num {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  font-size: 10.5px;
  font-weight: 700;
  color: #5c6b78;
  background: #eceff2;
  border-radius: 4px;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}
.repeatable-view-num .q-icon {
  color: #b3bcc4;
}
.repeatable-view-grid {
  margin-top: 0;
  row-gap: 8px;
}
.repeatable-view-empty {
  padding: 16px 12px;
  background: #fafbfc;
  border: 1px dashed #dde1e5;
  border-radius: 8px;
  color: #97a1a9;
  font-size: 12.5px;
  text-align: center;
  font-style: italic;
}
.repeatable-view :deep(textarea.q-field__native) {
  color: #2b3a4a;
  font-family: inherit;
  cursor: default;
  resize: none;
}

/* =========================================================
   DOCUMENTS
========================================================= */
.doc-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.doc-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 12px;
  padding: 10px 12px;
  background: #fafbfc;
  border: 1px solid #e6e8eb;
  border-radius: 8px;
}
.doc-row.is-empty {
  background: #fbfbfc;
  border-style: dashed;
}
.doc-row--signed {
  background: #fff8f0;
  border-color: #f4e2c8;
}
.doc-icon {
  width: 36px;
  height: 36px;
  min-width: 36px;
  border-radius: 8px;
  background: #eef1f4;
  color: #5c6b78;
  display: flex;
  align-items: center;
  justify-content: center;
}
.doc-icon--signed {
  background: #fdeccd;
  color: #d4880f;
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
  font-size: 13px;
  font-weight: 600;
  color: #19354a;
  line-height: 1.3;
}
.doc-row--signed .doc-label {
  color: #6b4a1a;
}
.doc-req,
.doc-opt,
.doc-signed {
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;
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
  margin-top: 3px;
  font-size: 11.5px;
  color: #5c6b78;
  min-width: 0;
}
.doc-file span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.doc-file .q-icon {
  color: #97a1a9;
  flex-shrink: 0;
}
.doc-missing {
  color: #b3bcc4;
  font-style: italic;
}
.doc-uploaded-at {
  margin-top: 2px;
  font-size: 10.5px;
  color: #8a5a1a;
  font-style: italic;
}
.doc-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  flex: 1 1 100%;
}
.doc-action {
  min-height: 40px;
  color: #5c6b78;
  font-size: 12px;
  font-weight: 600;
}
.doc-action :deep(.q-btn__content) {
  flex-wrap: nowrap;
  white-space: nowrap;
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
  width: 12px;
  flex-shrink: 0;
}
.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
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
  background: #e6e8eb;
  margin: 4px 0;
  min-height: 12px;
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
  align-items: baseline;
  justify-content: space-between;
  gap: 4px 10px;
  flex-wrap: wrap;
}
.timeline-transition {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  font-weight: 650;
  color: #19354a;
}
.timeline-transition .q-icon {
  color: #97a1a9;
}
.timeline-time {
  font-size: 11.5px;
  color: #97a1a9;
}
.timeline-actor {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 3px;
  font-size: 11.5px;
  color: #7a8792;
}
.timeline-actor .q-icon {
  color: #b3bcc4;
}
.timeline-remarks {
  margin-top: 6px;
  padding: 8px 10px;
  background: #fafbfc;
  border-left: 3px solid #e8911a;
  border-radius: 4px;
  font-size: 12px;
  color: #5c6b78;
  line-height: 1.5;
  overflow-wrap: anywhere;
}
.timeline-empty {
  padding: 4px 0 2px;
  font-size: 12.5px;
  color: #97a1a9;
  font-style: italic;
}

/* =========================================================
   RESPONSIVE
========================================================= */
@media (min-width: 600px) {
  .form-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .form-block {
    --blk-px: 14px;
    padding-bottom: 14px;
  }
  .doc-row {
    flex-wrap: nowrap;
  }
  .doc-actions {
    flex: 0 0 auto;
  }
  .state-box {
    min-height: 300px;
  }
}

@media (max-width: 599px) {
  .scheduled-body {
    padding-left: 0;
  }
}

@media (min-width: 900px) {
  .page-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
  .page-header-actions {
    flex-shrink: 0;
  }
  .page-header-actions .btn-ghost,
  .page-header-actions .btn-primary {
    flex: 0 0 auto;
  }
  .btn-ghost,
  .btn-primary {
    min-height: 36px;
  }
  .btn-primary--sm {
    min-height: 32px;
  }
}

@media (min-width: 1024px) {
  .form-grid :deep(.q-field__control) {
    min-height: 40px;
  }
  .nominee-name,
  .nominee-meta {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .doc-action {
    min-height: 0;
  }
}

@media (hover: hover) and (pointer: fine) {
  .doc-action:hover {
    color: #2b3a4a;
    background: #eef1f4;
  }
  .section-chip:hover {
    background: #e9edf1;
  }
  .section-chip.is-complete:hover {
    background: #dcf1e6;
  }
}

/* Desktop: page fills the viewport; only the columns scroll */
@media (min-width: 1024px) {
  .view-page {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .view-page > * {
    flex-shrink: 0;
  }
  .view-page > .layout-fill {
    flex: 1 1 0;
    min-height: 0;
  }
}
</style>
