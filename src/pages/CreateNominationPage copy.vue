<template>
  <q-page class="create-page" :style-fn="pageStyleFn">
    <!-- =====================================================
         PAGE HEADER
    ====================================================== -->
    <section class="page-header">
      <div class="page-header-text">
        <div class="page-eyebrow">
          {{ isAwaitingHardcopy ? "Signed Form" : "Achievements" }}
        </div>
        <h5>{{ headerTitle }}</h5>
        <p>{{ headerSubtitle }}</p>
      </div>

      <div
        v-if="!isEditMode || (!isLoading && !loadError)"
        class="page-header-actions"
      >
        <q-btn flat no-caps label="Cancel" class="btn-ghost" @click="goBack" />

        <template v-if="isAwaitingHardcopy">
          <q-btn
            unelevated
            no-caps
            icon="edit_document"
            label="Submit Signed Form"
            class="btn-primary"
            :loading="signedFormSubmitting"
            :disable="!canSubmitSigned"
            @click="submitSignedForm"
          >
            <q-tooltip v-if="!canSubmitSigned">
              {{ signedFormSubmitHint }}
            </q-tooltip>
          </q-btn>
        </template>

        <template v-else>
          <q-btn
            flat
            no-caps
            label="Save Draft"
            class="btn-secondary"
            :loading="nominationStore.isLoading"
            :disable="!canSaveDraft"
            @click="saveNomination('draft')"
          >
            <q-tooltip v-if="!canSaveDraft">
              Select a type and category, then add at least one nominee
            </q-tooltip>
          </q-btn>
          <q-btn
            unelevated
            no-caps
            :label="submitLabel"
            class="btn-primary"
            :loading="nominationStore.isLoading"
            :disable="!canSubmit"
            @click="saveNomination('submitted')"
          >
            <q-tooltip v-if="!canSubmit">
              Complete all required fields and documents for every nominee
            </q-tooltip>
          </q-btn>
        </template>
      </div>
    </section>

    <!-- =====================================================
         LOADING STATE
    ====================================================== -->
    <div v-if="isEditMode && isLoading" class="state-box">
      <q-spinner-dots color="primary" size="42px" />
      <div class="state-text">Loading nomination…</div>
    </div>

    <!-- =====================================================
         ERROR STATE
    ====================================================== -->
    <div v-else-if="isEditMode && loadError" class="state-box state-box--error">
      <q-icon name="error_outline" size="42px" />
      <div class="state-title">Unable to load nomination</div>
      <div class="state-text">{{ loadError }}</div>
      <q-btn
        unelevated
        no-caps
        label="Back to list"
        class="btn-primary btn-primary--sm"
        @click="goBack"
      />
    </div>

    <!-- =====================================================
         FORM
    ====================================================== -->
    <template v-else>
      <p
        v-if="!isAwaitingHardcopy && !canSubmit && nominationType"
        class="submit-hint"
      >
        <q-icon name="info" size="14px" />
        Complete all required fields and documents for every nominee to submit.
      </p>

      <!-- AWAITING HARDCOPY — banner -->
      <q-banner v-if="isAwaitingHardcopy" dense class="banner banner--info">
        <template #avatar>
          <q-icon :name="isReupload ? 'undo' : 'edit_document'" size="20px" />
        </template>

        <template v-if="isReupload">
          HR returned the previous signed form. Please upload a corrected copy
          below, then click <strong>Submit Signed Form</strong>.
          <div v-if="returnReason" class="banner-reason">
            <q-icon name="chat_bubble_outline" size="13px" />
            <span><strong>Reason:</strong> {{ returnReason }}</span>
          </div>
        </template>

        <template v-else>
          This nomination is awaiting a signed hard copy. Upload the signed form
          below, then click <strong>Submit Signed Form</strong>.
        </template>
      </q-banner>

      <!-- NO-OFFICE BANNER -->
      <q-banner v-if="!officeName" dense class="banner banner--error">
        <template #avatar>
          <q-icon name="error_outline" size="20px" />
        </template>
        No office is assigned to this account, so nominations cannot be created.
        Please contact the system administrator.
      </q-banner>

      <!-- TWO-COLUMN LAYOUT -->
      <TwoColumnLayout class="layout-fill">
        <!-- LEFT — SETUP -->
        <template #left>
          <div class="left-panel">
            <!-- Step 1: Nomination Category (group) -->
            <div class="panel-step">
              <div class="step-index">1</div>
              <div class="step-body">
                <div class="step-label">Nomination Category</div>
                <q-select
                  :model-value="selectedGroup"
                  outlined
                  dense
                  emit-value
                  map-options
                  :options="groupOptions"
                  :disable="isEditMode || isReadOnly"
                  :loading="typeStore.loading"
                  placeholder="Select nomination type"
                  class="step-select"
                  @update:model-value="onGroupChange"
                />
              </div>
            </div>

            <!-- Step 2: Type (specific type inside the group) -->
            <div class="panel-step">
              <div class="step-index">2</div>
              <div class="step-body">
                <div class="step-label">Nomination Type</div>
                <q-select
                  :model-value="nominationType"
                  outlined
                  dense
                  emit-value
                  map-options
                  :options="categoryOptions"
                  option-label="label"
                  option-value="value"
                  :disable="isEditMode || isReadOnly || !selectedGroup"
                  :loading="typeStore.loading"
                  :placeholder="
                    selectedGroup
                      ? 'Select a category'
                      : 'Choose a nomination type first'
                  "
                  class="step-select"
                  @update:model-value="onCategoryChange"
                >
                  <template #option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section>
                        <q-item-label>{{ scope.opt.label }}</q-item-label>
                        <q-item-label v-if="scope.opt.caption" caption>
                          {{ scope.opt.caption }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>

                <div v-if="typeMeta" class="step-hint">
                  <q-icon name="info" size="12px" />
                  <span v-if="nomineeType === 'office'">
                    Form {{ typeMeta.form }} — one record for your office.
                  </span>
                  <span v-else>
                    Form {{ typeMeta.form }} — {{ typeMeta.hint }}.
                  </span>
                </div>

                <div
                  v-else-if="selectedGroup && !categoryOptions.length"
                  class="step-hint"
                >
                  <q-icon name="info" size="12px" />
                  No categories are currently open for this type.
                </div>
              </div>
            </div>

            <!-- Step 3: Nominee type -->
            <div v-if="showNomineeToggle" class="panel-step">
              <div class="step-index">3</div>
              <div class="step-body">
                <div class="step-label">Nominee</div>
                <q-btn-toggle
                  :model-value="nomineeType"
                  no-caps
                  unelevated
                  spread
                  toggle-color="blue-grey-9"
                  color="grey-3"
                  text-color="blue-grey-8"
                  class="step-toggle"
                  :options="nomineeOptions"
                  @update:model-value="onNomineeTypeChange"
                />
              </div>
            </div>

            <!-- Step 4: Nominating office -->
            <div class="panel-step">
              <div class="step-index">{{ showNomineeToggle ? 4 : 3 }}</div>
              <div class="step-body">
                <div class="step-label">Nominating Office</div>
                <div class="office-chip">
                  <q-icon name="business" size="16px" />
                  <span>{{ officeName || "No office assigned" }}</span>
                  <q-icon name="lock" size="13px" class="chip-lock" />
                </div>
              </div>
            </div>

            <!-- Step 5: Nominees -->
            <div class="panel-step panel-step--last">
              <div class="step-index">{{ showNomineeToggle ? 5 : 4 }}</div>
              <div class="step-body step-body--flex">
                <div class="step-header">
                  <div class="step-label step-label--inline">
                    {{
                      nomineeType === "office"
                        ? "Office Nominee"
                        : `Employees (${entries.length})`
                    }}
                  </div>
                  <q-btn
                    v-if="
                      nomineeType === 'employee' && !isEditMode && !isReadOnly
                    "
                    flat
                    dense
                    round
                    icon="add"
                    size="sm"
                    class="add-btn"
                    aria-label="Add employee(s)"
                    :disable="!nominationType || !officeName"
                    @click="openEmployeeDialog"
                  >
                    <q-tooltip>Add employee(s)</q-tooltip>
                  </q-btn>
                </div>

                <div v-if="!nominationType" class="empty-hint">
                  Select a nomination type and category above to start.
                </div>

                <div v-else-if="entries.length === 0" class="empty-hint">
                  No employees added yet. Click
                  <q-icon name="add" size="11px" /> to pick one or more from
                  <strong>{{ officeName }}</strong
                  >.
                </div>

                <div v-else class="roster">
                  <div
                    v-for="(entry, index) in entries"
                    :key="entry.id"
                    class="roster-item"
                    :class="{ 'is-active': activeEntryIndex === index }"
                    role="button"
                    tabindex="0"
                    @click="selectEntry(index)"
                    @keydown.enter.self="selectEntry(index)"
                    @keydown.space.self.prevent="selectEntry(index)"
                  >
                    <div class="roster-avatar">
                      <q-icon
                        v-if="entry.is_office"
                        name="business"
                        size="16px"
                      />
                      <template v-else>{{
                        getInitials(entry.employee)
                      }}</template>
                    </div>
                    <div class="roster-info">
                      <div class="roster-name">
                        {{ entry.employee || `Nominee ${index + 1}` }}
                      </div>
                      <div class="roster-meta">
                        {{
                          entry.is_office
                            ? "Office nomination"
                            : entry.position || "No position set"
                        }}
                      </div>
                    </div>

                    <q-spinner
                      v-if="entry._hydrating"
                      size="14px"
                      color="primary"
                      class="roster-status"
                    />
                    <q-icon
                      v-else
                      :name="
                        isEntryComplete(entry)
                          ? 'check_circle'
                          : 'radio_button_unchecked'
                      "
                      class="roster-status"
                      :class="
                        isEntryComplete(entry) ? 'is-complete' : 'is-incomplete'
                      "
                      size="16px"
                    />

                    <q-btn
                      v-if="!entry.is_office && !isEditMode && !isReadOnly"
                      flat
                      dense
                      round
                      icon="close"
                      size="xs"
                      class="roster-remove"
                      aria-label="Remove employee"
                      @click.stop="removeEntry(index)"
                    >
                      <q-tooltip>Remove employee</q-tooltip>
                    </q-btn>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- RIGHT — FORM -->
        <template #right>
          <div class="form-section">
            <div v-if="!nominationType" class="form-empty">
              <q-icon name="assignment_ind" size="42px" />
              <div class="form-empty-title">No category selected</div>
              <div class="form-empty-sub">
                Choose a nomination type and category from the left panel to get
                started.
              </div>
            </div>

            <div v-else-if="!currentEntry" class="form-empty">
              <q-icon name="group_add" size="42px" />
              <div class="form-empty-title">No employees added</div>
              <div class="form-empty-sub">
                Click <strong>+</strong> on the left panel to pick one or more
                employees from your office.
              </div>
            </div>

            <template v-else>
              <!-- SIGNED FORM -->
              <div
                v-if="isAwaitingHardcopy"
                class="form-block form-block--signed"
                :class="{ 'form-block--reupload': isReupload }"
              >
                <div class="form-block-head">
                  <div class="form-section-title flush">
                    Signed Form
                    <span class="req-badge">Required</span>
                  </div>
                  <div class="form-block-hint">
                    <q-icon
                      :name="isReupload ? 'undo' : 'edit_document'"
                      size="12px"
                    />
                    {{
                      isReupload
                        ? "Re-upload a corrected signed form"
                        : "Signed hard copy of this nomination"
                    }}
                  </div>
                </div>

                <div class="form-grid form-grid--docs">
                  <LabeledField label="Upload Signed Form" class="col-span-2">
                    <q-file
                      v-model="signedFormFile"
                      outlined
                      dense
                      accept=".pdf,.jpg,.jpeg,.png"
                      :max-file-size="MAX_FILE_SIZE"
                      placeholder="Choose a PDF, JPG or PNG"
                      :hint="signedFormHint"
                      :rules="[signedFormRule]"
                      @rejected="onSignedFileRejected"
                    >
                      <template #prepend>
                        <q-icon
                          :name="isReupload ? 'file_upload' : 'edit_document'"
                        />
                      </template>
                    </q-file>

                    <div
                      v-if="signedFormMeta && !signedFormFile"
                      class="existing-doc-actions"
                      :class="{
                        'existing-doc-actions--returned': isReupload,
                      }"
                    >
                      <div class="existing-doc-name">
                        <q-icon
                          :name="isReupload ? 'undo' : 'verified'"
                          size="12px"
                        />
                        <span>{{ signedFormMeta.name }}</span>
                      </div>
                      <div class="existing-doc-buttons">
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

                    <div
                      v-if="isReupload && !signedFormFile && signedFormMeta"
                      class="reupload-notice"
                    >
                      <q-icon name="info" size="14px" />
                      The previous file is only kept for reference — you must
                      select a new file to proceed.
                    </div>
                  </LabeledField>
                </div>
              </div>

              <!-- EMPLOYEE / OFFICE INFO -->
              <template v-if="!isGawad">
                <template v-if="!currentEntry.is_office">
                  <div class="form-section-title">Employee Information</div>
                  <div class="form-grid">
                    <LabeledField
                      v-for="info in INFO_FIELDS"
                      :key="info.key"
                      :label="info.label"
                      :class="{ 'col-span-2': info.span === 2 }"
                    >
                      <q-input
                        :model-value="currentEntry[info.key]"
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

                  <div class="form-section-title">
                    Contact Information
                    <span class="req-badge">Required</span>
                  </div>
                  <div class="form-grid">
                    <LabeledField label="Mobile No." class="col-span-2">
                      <q-input
                        v-model="currentEntry.mobile_no"
                        outlined
                        dense
                        inputmode="numeric"
                        placeholder="09XXXXXXXXX"
                        maxlength="11"
                        :readonly="isReadOnly"
                        :class="{ 'readonly-input': isReadOnly }"
                        :rules="[mobileRule]"
                      />
                    </LabeledField>
                  </div>
                </template>

                <template v-else>
                  <div class="form-section-title">Office Information</div>
                  <div class="form-grid">
                    <LabeledField label="Office" class="col-span-2">
                      <q-input
                        :model-value="currentEntry.employee"
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
              </template>

              <!-- DYNAMIC SECTIONS -->
              <div
                v-for="section in displaySections"
                :key="section.title"
                class="form-block"
              >
                <div class="form-block-head">
                  <div class="form-section-title flush">
                    {{ section.title }}
                  </div>

                  <div v-if="section.hint" class="form-block-hint">
                    <q-icon name="lock" size="12px" />
                    {{ section.hint }}
                  </div>

                  <div
                    v-if="
                      canApplyToAll &&
                      section.fields.some((f) => f.applyAll) &&
                      !isReadOnly
                    "
                    class="form-block-hint"
                  >
                    <q-icon name="content_copy" size="12px" />
                    Copy a value to all {{ entries.length }}
                  </div>

                  <q-btn
                    v-if="section.action && !isReadOnly"
                    flat
                    dense
                    no-caps
                    size="sm"
                    :icon="section.action.icon"
                    :label="section.action.label"
                    class="section-action"
                    @click="handleSectionAction(section.action.handler)"
                  >
                    <q-tooltip>{{ nominatorLabel() }}</q-tooltip>
                  </q-btn>
                </div>

                <div class="form-grid" :class="{ 'form-grid--auto': isGawad }">
                  <template v-for="field in section.fields" :key="field.key">
                    <!-- ============================================================
                         REPEATABLE PAIR BLOCK
                         One row = one {accomplishment, impact} pair.
                    ============================================================= -->
                    <div
                      v-if="field.kind === 'repeatable'"
                      class="repeatable-block"
                      :class="{ 'col-span-2': field.span === 2 }"
                    >
                      <div class="repeatable-head">
                        <div v-if="field.hint" class="repeatable-hint">
                          <q-icon name="info" size="12px" />
                          {{ field.hint }}
                        </div>
                        <div v-else class="repeatable-hint"></div>

                        <q-btn
                          v-if="!isReadOnly"
                          flat
                          dense
                          no-caps
                          size="sm"
                          icon="add"
                          :label="field.addLabel || 'Add entry'"
                          class="repeatable-add"
                          @click="addRepeatableRow(field)"
                        />
                      </div>

                      <div
                        v-for="(row, rowIdx) in repeatableRows(field)"
                        :key="`${field.key}-${rowIdx}`"
                        class="repeatable-row"
                      >
                        <div class="repeatable-row-head">
                          <span class="repeatable-row-num">
                            <q-icon name="drag_indicator" size="13px" />
                            Entry {{ rowIdx + 1 }}
                          </span>

                          <q-btn
                            v-if="
                              !isReadOnly &&
                              repeatableRows(field).length >
                                (field.minRows || 1)
                            "
                            flat
                            dense
                            round
                            size="sm"
                            icon="delete_outline"
                            class="repeatable-remove"
                            aria-label="Remove entry"
                            @click="removeRepeatableRow(field, rowIdx)"
                          >
                            <q-tooltip>Remove this entry</q-tooltip>
                          </q-btn>
                        </div>

                        <div class="form-grid repeatable-row-grid">
                          <LabeledField
                            v-for="sub in field.rowFields"
                            :key="sub.key"
                            :label="sub.label"
                            :class="{ 'col-span-2': sub.span === 2 }"
                          >
                            <template
                              v-if="
                                sub.kind === 'textarea' || sub.kind === 'essay'
                              "
                            >
                              <q-input
                                v-model="row[sub.key]"
                                outlined
                                dense
                                type="textarea"
                                autogrow
                                :rows="sub.rows || 4"
                                :placeholder="sub.placeholder"
                                :readonly="isReadOnly"
                                :class="{ 'readonly-input': isReadOnly }"
                                :rules="[
                                  (v) =>
                                    isReadOnly ||
                                    !sub.required ||
                                    String(v || '').trim() !== '' ||
                                    `${sub.label} is required`,
                                ]"
                              />

                              <div
                                v-if="sub.kind === 'essay' && sub.maxWords"
                                class="word-counter"
                                :class="{
                                  'is-over':
                                    wordCount(row[sub.key]) > sub.maxWords,
                                }"
                              >
                                <q-icon
                                  name="spellcheck"
                                  size="12px"
                                  class="q-mr-xs"
                                />
                                {{ wordCount(row[sub.key]) }} /
                                {{ sub.maxWords }} words
                              </div>
                            </template>

                            <q-input
                              v-else
                              v-model="row[sub.key]"
                              outlined
                              dense
                              :type="inputType(sub)"
                              :placeholder="sub.placeholder"
                              :readonly="isReadOnly"
                              :class="{ 'readonly-input': isReadOnly }"
                              :rules="[
                                (v) =>
                                  isReadOnly ||
                                  !sub.required ||
                                  String(v || '').trim() !== '' ||
                                  `${sub.label} is required`,
                              ]"
                            />
                          </LabeledField>
                        </div>
                      </div>

                      <div
                        v-if="repeatableRows(field).length === 0"
                        class="repeatable-empty"
                      >
                        <q-icon name="playlist_add" size="20px" />
                        <span>
                          Click
                          <strong>{{ field.addLabel || "Add entry" }}</strong>
                          to start.
                        </span>
                      </div>
                    </div>

                    <!-- ============================================================
                         REGULAR FIELD
                    ============================================================= -->
                    <LabeledField
                      v-else
                      :label="field.label"
                      :class="{ 'col-span-2': field.span === 2 }"
                    >
                      <q-input
                        v-if="field.kind === 'entry'"
                        v-model="currentEntry[field.entryKey]"
                        outlined
                        dense
                        :inputmode="field.inputmode"
                        :maxlength="field.maxlength"
                        :placeholder="field.placeholder"
                        :readonly="field.locked || isReadOnly"
                        :class="{
                          'readonly-input': field.locked || isReadOnly,
                        }"
                        :rules="field.rule ? [field.rule] : []"
                      >
                        <template v-if="field.locked" #append>
                          <q-icon name="lock" size="13px" class="lock-icon" />
                        </template>
                      </q-input>

                      <q-select
                        v-else-if="field.kind === 'select'"
                        v-model="currentEntry.data[field.key]"
                        outlined
                        dense
                        emit-value
                        map-options
                        :use-input="!!field.searchable && !fieldLocked(field)"
                        :hide-selected="!!field.searchable"
                        :fill-input="!!field.searchable"
                        :input-debounce="field.searchable ? 0 : undefined"
                        :options="optionsForField(field)"
                        :placeholder="field.placeholder"
                        :readonly="fieldLocked(field)"
                        :class="{ 'readonly-input': fieldLocked(field) }"
                        :rules="fieldRules(field)"
                        @filter="
                          (val, update) => filterSelect(val, update, field)
                        "
                        @update:model-value="onFieldSelect(field)"
                      >
                        <template
                          v-if="canApplyToAll && field.applyAll && !isReadOnly"
                          #append
                        >
                          <q-btn
                            flat
                            dense
                            round
                            size="sm"
                            icon="content_copy"
                            class="apply-all"
                            aria-label="Apply to all nominees"
                            @click.stop="applyToAll(field.key)"
                          >
                            <q-tooltip>
                              Apply to all {{ entries.length }} nominees
                            </q-tooltip>
                          </q-btn>
                        </template>
                      </q-select>

                      <!-- ============================================================
                           TOGGLE — 2-option binary choice (Yes/No etc.)
                      ============================================================= -->
                      <template v-else-if="field.kind === 'toggle'">
                        <q-btn-toggle
                          v-model="currentEntry.data[field.key]"
                          no-caps
                          unelevated
                          spread
                          toggle-color="blue-grey-9"
                          color="grey-3"
                          text-color="blue-grey-8"
                          class="step-toggle field-toggle"
                          :options="field.options || []"
                          :disable="isReadOnly || fieldLocked(field)"
                          :rules="fieldRules(field)"
                        />
                      </template>

                      <q-input
                        v-else-if="field.kind === 'derived'"
                        :model-value="field.derive(currentEntry.data)"
                        outlined
                        dense
                        readonly
                        class="readonly-input"
                        :placeholder="field.placeholder || 'Auto-computed'"
                      >
                        <template #append>
                          <q-icon name="lock" size="13px" class="lock-icon" />
                        </template>
                      </q-input>

                      <template
                        v-else-if="
                          field.kind === 'textarea' || field.kind === 'essay'
                        "
                      >
                        <q-input
                          v-model="currentEntry.data[field.key]"
                          outlined
                          dense
                          type="textarea"
                          autogrow
                          :rows="field.kind === 'essay' ? 8 : 4"
                          :placeholder="field.placeholder"
                          :readonly="fieldLocked(field)"
                          :class="{ 'readonly-input': fieldLocked(field) }"
                          :rules="fieldRules(field)"
                        >
                          <template
                            v-if="
                              canApplyToAll && field.applyAll && !isReadOnly
                            "
                            #append
                          >
                            <q-btn
                              flat
                              dense
                              round
                              size="sm"
                              icon="content_copy"
                              class="apply-all"
                              aria-label="Apply to all nominees"
                              @click.stop="applyToAll(field.key)"
                            >
                              <q-tooltip>
                                Apply to all {{ entries.length }} nominees
                              </q-tooltip>
                            </q-btn>
                          </template>
                        </q-input>

                        <div
                          v-if="field.kind === 'essay' && field.maxWords"
                          class="word-counter"
                          :class="{
                            'is-over':
                              wordCount(currentEntry.data[field.key]) >
                              field.maxWords,
                          }"
                        >
                          <q-icon
                            name="spellcheck"
                            size="12px"
                            class="q-mr-xs"
                          />
                          {{ wordCount(currentEntry.data[field.key]) }} /
                          {{ field.maxWords }} words
                        </div>
                      </template>

                      <q-input
                        v-else
                        v-model="currentEntry.data[field.key]"
                        outlined
                        dense
                        :type="inputType(field)"
                        :placeholder="field.placeholder"
                        :maxlength="field.kind === 'rating' ? 6 : undefined"
                        :suffix="field.kind === 'rating' ? '%' : undefined"
                        :readonly="fieldLocked(field)"
                        :class="{ 'readonly-input': fieldLocked(field) }"
                        :rules="fieldRules(field)"
                      >
                        <template #prepend>
                          <q-icon
                            v-if="field.kind === 'email'"
                            name="alternate_email"
                            size="16px"
                          />
                        </template>
                        <template
                          v-if="canApplyToAll && field.applyAll && !isReadOnly"
                          #append
                        >
                          <q-btn
                            flat
                            dense
                            round
                            size="sm"
                            icon="content_copy"
                            class="apply-all"
                            aria-label="Apply to all nominees"
                            @click.stop="applyToAll(field.key)"
                          >
                            <q-tooltip>
                              Apply to all {{ entries.length }} nominees
                            </q-tooltip>
                          </q-btn>
                        </template>
                        <template v-else-if="fieldLocked(field)" #append>
                          <q-icon name="lock" size="13px" class="lock-icon" />
                        </template>
                      </q-input>
                    </LabeledField>
                  </template>
                </div>
              </div>

              <!-- SUPPORTING DOCUMENTS -->
              <div v-if="docsList.length" class="form-block form-block--docs">
                <div class="form-block-head">
                  <div class="form-section-title flush">
                    Supporting Documents
                    <span class="req-badge">Required</span>
                  </div>
                </div>
                <div class="form-grid form-grid--docs">
                  <LabeledField
                    v-for="doc in docsList"
                    :key="doc.key"
                    :label="doc.label"
                    class="col-span-2"
                  >
                    <q-file
                      v-model="currentEntry.docs[doc.key]"
                      outlined
                      dense
                      :accept="doc.accept"
                      :max-file-size="MAX_FILE_SIZE"
                      :placeholder="
                        doc.optional ? 'Upload (optional)' : 'Upload file'
                      "
                      :hint="existingDocHint(doc)"
                      :disable="isReadOnly"
                      :rules="[fileRule(doc)]"
                      @rejected="onFileRejected"
                    >
                      <template #prepend>
                        <q-icon :name="doc.icon" />
                      </template>
                    </q-file>

                    <div
                      v-if="
                        isEditMode &&
                        existingDocFor(doc) &&
                        !hasPendingFile(doc)
                      "
                      class="existing-doc-actions"
                    >
                      <div class="existing-doc-name">
                        <q-icon name="attach_file" size="12px" />
                        <span>{{ existingDocFor(doc).name }}</span>
                      </div>
                      <div class="existing-doc-buttons">
                        <q-btn
                          flat
                          dense
                          no-caps
                          size="sm"
                          icon="visibility"
                          label="View"
                          class="doc-action"
                          :loading="viewingKey === doc.key"
                          @click="viewExistingDoc(doc)"
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
                          @click="downloadExistingDoc(doc)"
                        >
                          <q-tooltip>Save to your device</q-tooltip>
                        </q-btn>
                      </div>
                    </div>
                  </LabeledField>
                </div>
              </div>
            </template>
          </div>
        </template>
      </TwoColumnLayout>
    </template>

    <!-- =====================================================
         EMPLOYEE PICKER DIALOG
    ====================================================== -->
    <q-dialog
      v-model="showEmployeeDialog"
      persistent
      :maximized="$q.screen.lt.sm"
    >
      <q-card class="picker-dialog">
        <q-card-section class="picker-header">
          <div>
            <div class="picker-title">Select Employee(s)</div>
            <div class="picker-subtitle">
              Employees of <strong>{{ officeName }}</strong>
            </div>
          </div>
          <q-btn
            flat
            round
            dense
            icon="close"
            class="picker-close"
            aria-label="Close"
            @click="showEmployeeDialog = false"
          />
        </q-card-section>

        <q-separator />

        <q-card-section class="picker-toolbar">
          <q-input
            v-model="employeeSearch"
            outlined
            dense
            clearable
            placeholder="Search by name, position or control no."
            class="picker-search"
          >
            <template #prepend>
              <q-icon name="search" size="18px" />
            </template>
          </q-input>

          <div class="picker-toolbar-actions">
            <q-btn
              flat
              dense
              no-caps
              size="sm"
              label="Select all"
              class="picker-action"
              :disable="!filteredOfficeEmployees.length"
              @click="selectAllFiltered"
            />
            <q-btn
              flat
              dense
              no-caps
              size="sm"
              label="Clear"
              class="picker-action"
              :disable="!entries.length"
              @click="clearSelection"
            />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="picker-list">
          <div v-if="userStore.employeesLoading" class="picker-center">
            <q-spinner-dots color="primary" size="34px" />
          </div>

          <div
            v-else-if="!filteredOfficeEmployees.length"
            class="picker-center"
          >
            <q-icon name="search_off" size="28px" />
            <div>
              {{
                employeeSearch
                  ? "No employees match your search."
                  : "No employees found for this office."
              }}
            </div>
          </div>

          <div v-else class="picker-items">
            <div
              v-for="emp in filteredOfficeEmployees"
              :key="emp.ControlNo"
              class="picker-item"
              :class="{ 'is-selected': isEmployeeSelected(emp.ControlNo) }"
              role="button"
              tabindex="0"
              @click="toggleEmployee(emp)"
              @keydown.enter.self="toggleEmployee(emp)"
              @keydown.space.self.prevent="toggleEmployee(emp)"
            >
              <q-checkbox
                :model-value="isEmployeeSelected(emp.ControlNo)"
                dense
                color="primary"
                @update:model-value="toggleEmployee(emp)"
                @click.stop
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

        <q-card-actions class="picker-footer">
          <div class="picker-count">
            <q-icon name="groups" size="16px" />
            <span>{{ entries.length }} selected</span>
          </div>
          <q-btn
            unelevated
            no-caps
            label="Done"
            class="btn-primary btn-primary--sm"
            @click="showEmployeeDialog = false"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- =====================================================
         NOMINATOR / TECHNICAL WRITER PICKER DIALOG
    ====================================================== -->
    <q-dialog
      v-model="showNominatorDialog"
      persistent
      :maximized="$q.screen.lt.sm"
    >
      <q-card class="picker-dialog">
        <q-card-section class="picker-header">
          <div>
            <div class="picker-title">Select Nominator / Technical Writer</div>
            <div class="picker-subtitle">
              Employees of <strong>{{ officeName }}</strong> — pick one
            </div>
          </div>
          <q-btn
            flat
            round
            dense
            icon="close"
            class="picker-close"
            aria-label="Close"
            @click="showNominatorDialog = false"
          />
        </q-card-section>

        <q-separator />

        <q-card-section class="picker-toolbar">
          <q-input
            v-model="nominatorSearch"
            outlined
            dense
            clearable
            placeholder="Search by name, position or control no."
            class="picker-search"
          >
            <template #prepend>
              <q-icon name="search" size="18px" />
            </template>
          </q-input>

          <div class="picker-toolbar-actions">
            <q-btn
              flat
              dense
              no-caps
              size="sm"
              label="Clear"
              class="picker-action"
              :disable="!nominatorEntry"
              @click="clearNominator"
            />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="picker-list">
          <div v-if="userStore.employeesLoading" class="picker-center">
            <q-spinner-dots color="primary" size="34px" />
          </div>

          <div
            v-else-if="!filteredNominatorEmployees.length"
            class="picker-center"
          >
            <q-icon name="search_off" size="28px" />
            <div>
              {{
                nominatorSearch
                  ? "No employees match your search."
                  : "No eligible employees — nominees cannot be their own nominator."
              }}
            </div>
          </div>

          <div v-else class="picker-items">
            <div
              v-for="emp in filteredNominatorEmployees"
              :key="emp.ControlNo"
              class="picker-item"
              :class="{ 'is-selected': isNominatorSelected(emp.ControlNo) }"
              role="button"
              tabindex="0"
              @click="selectNominator(emp)"
              @keydown.enter.self="selectNominator(emp)"
              @keydown.space.self.prevent="selectNominator(emp)"
            >
              <q-radio
                :model-value="isNominatorSelected(emp.ControlNo)"
                :val="true"
                dense
                color="primary"
                @update:model-value="selectNominator(emp)"
                @click.stop
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

        <q-card-actions class="picker-footer">
          <div class="picker-count">
            <q-icon name="person" size="16px" />
            <span>{{
              nominatorEntry ? nominatorEntry.employee : "None selected"
            }}</span>
          </div>
          <q-btn
            unelevated
            no-caps
            label="Done"
            class="btn-primary btn-primary--sm"
            @click="showNominatorDialog = false"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { useUserStore } from "src/stores/userStore";
import { useNominationStore } from "src/stores/nominationStore";
import { useNominationTypeStore } from "src/stores/nominationTypeStore";
import { api } from "boot/axios";
import TwoColumnLayout from "src/components/TwoColumnLayout.vue";
import LabeledField from "src/components/LabeledField.vue";
import {
  GROUP_ORDER,
  GROUP_LABELS,
  TYPE_FLAGS,
  TYPE_SECTIONS,
  TYPE_DOCS,
  MAX_FILE_SIZE,
  blankData,
  blankDocs,
  fieldError,
  validateEntry,
  normalizePhone,
  getStoredOffice,
} from "src/constants/NominationConfig";

const INFO_FIELDS = [
  { key: "employee", label: "Employee Name", span: 2 },
  { key: "position", label: "Position" },
  { key: "employment_status", label: "Status of Employment" },
  { key: "department", label: "Department / Office", span: 2 },
];

const NOMINEE_OPTIONS = [
  { label: "Employee", value: "employee", icon: "person" },
  { label: "Office", value: "office", icon: "business" },
];

const GAWAD_TYPE = "gawad_parangal_kawani";

/* =========================================================
   GAWAD layout helpers
========================================================= */
const OFFICE_CONTACT_RE =
  /(office.*(email|contact|tel|phone|mobile))|((email|contact|tel|phone|mobile).*office)/i;

const CONTACT_RE = /(contact|mobile|tel|phone)/i;

const LOCKED_HEADNOM_KEY_RE = /^(head|nominator)_(name|position)$/i;

const PERSONAL_ORDER = [
  "birthdate",
  "age",
  "sex",
  "place_of_birth",
  "civil",
  "address",
  "email",
];

const POSITION_ORDER = [
  "level",
  "division",
  "section",
  "years_in_govt_service",
  "office_email",
  "office_contact",
];

function orderIndex(order, key) {
  const i = order.findIndex((o) => String(key).toLowerCase().includes(o));
  return i === -1 ? order.length : i;
}

function sortFields(order, fields) {
  return [...fields].sort(
    (a, b) => orderIndex(order, a.key) - orderIndex(order, b.key)
  );
}

export default defineComponent({
  name: "CreateNominationPage",
  components: { TwoColumnLayout, LabeledField },

  setup() {
    const $q = useQuasar();
    const route = useRoute();
    const router = useRouter();
    const userStore = useUserStore();
    const nominationStore = useNominationStore();
    const typeStore = useNominationTypeStore();

    const officeName = ref(getStoredOffice());

    function pageStyleFn(offset) {
      const h = offset ? `calc(100dvh - ${offset}px)` : "100dvh";
      return $q.screen.gt.sm ? { height: h } : { minHeight: h };
    }

    // ---------- Core state ----------
    const selectedGroup = ref(null);
    const nominationType = ref(null);
    const nomineeType = ref("employee");
    const entries = ref([]);
    const activeEntryIndex = ref(0);
    const editingStatus = ref(null);

    const record = ref(null);

    const isLoading = ref(false);
    const loadError = ref(null);

    const signedFormFile = ref(null);
    const signedFormSubmitting = ref(false);
    const existingSignedForm = ref(null);

    const employeeSearch = ref("");
    const showEmployeeDialog = ref(false);
    const employeesLoaded = ref(false);

    const showNominatorDialog = ref(false);
    const nominatorSearch = ref("");
    const nominatorEntry = ref(null);
    const hydratingNominator = ref(false);

    const viewingKey = ref(null);
    const downloadingKey = ref(null);

    const searchFilters = ref({});

    // ---------- Computed ----------
    const isEditMode = computed(() => !!route.params.id);

    const isAwaitingHardcopy = computed(
      () => editingStatus.value === "awaiting_hardcopy"
    );

    const isReadOnly = computed(() => isAwaitingHardcopy.value);

    const isGawad = computed(() => nominationType.value === GAWAD_TYPE);

    const isReupload = computed(() => {
      const history = record.value?.status_history || [];
      return history.some((h) => h.from === "hardcopy_submitted");
    });

    const returnReason = computed(() => record.value?.remarks || "");

    const headerTitle = computed(() => {
      if (isAwaitingHardcopy.value) {
        return isReupload.value
          ? "Re-upload Signed Form"
          : "Upload Signed Form";
      }
      return isEditMode.value ? "Edit Nomination" : "New Nomination";
    });

    const headerSubtitle = computed(() => {
      if (isAwaitingHardcopy.value) {
        return isReupload.value
          ? "HR returned the previous signed form. Please upload a corrected copy."
          : "Upload the signed hard copy of this nomination, then submit it back to HR.";
      }
      return "Nominate employees or offices for an exam pass, an award, or completed graduate studies.";
    });

    // ---------- Group + Category options (backend-driven) ----------
    const groupOptions = computed(() => {
      const groups = new Set(typeStore.active.map((t) => t.group));
      return [...groups]
        .sort((a, b) => (GROUP_ORDER[a] ?? 99) - (GROUP_ORDER[b] ?? 99))
        .map((key) => ({ label: GROUP_LABELS[key] ?? key, value: key }));
    });

    const categoryOptions = computed(() => {
      if (!selectedGroup.value) return [];
      return typeStore.active
        .filter((t) => t.group === selectedGroup.value)
        .map((t) => ({
          label: t.label,
          value: t.code,
          caption: t.old_name ? `(${t.old_name})` : "",
        }));
    });

    // Merge DB entry (store) with code flags (config)
    const typeMeta = computed(() => {
      const code = nominationType.value;
      if (!code) return null;

      const dbType = typeStore.active.find((t) => t.code === code);
      const flags = TYPE_FLAGS[code] || {};

      return {
        value: code,
        label: dbType?.label || code,
        short: dbType?.short || code,
        form: dbType?.form || "",
        group: dbType?.group || selectedGroup.value,
        group_label: dbType?.group_label || "",
        old_name: dbType?.old_name || "",
        batch: flags.batch ?? false,
        officeNominee: flags.officeNominee ?? false,
        applyToAll: flags.applyToAll ?? false,
        hint: flags.hint ?? "",
      };
    });

    const showNomineeToggle = computed(
      () => !!typeMeta.value?.officeNominee && !isEditMode.value
    );

    const sections = computed(() => TYPE_SECTIONS[nominationType.value] || []);
    const docsList = computed(() => TYPE_DOCS[nominationType.value] || []);

    /* =========================================================
       Sections actually rendered (Gawad regroup)
    ========================================================= */
    const displaySections = computed(() => {
      if (!isGawad.value) return sections.value;

      const personal = [];
      const position = [];
      const otherSections = [];

      sections.value.forEach((section) => {
        const title = String(section.title || "")
          .trim()
          .toLowerCase();

        if (title === "personal information") {
          section.fields.forEach((field) => {
            const editable =
              /email/i.test(field.key) || CONTACT_RE.test(field.key);
            personal.push({ ...field, locked: !editable });
          });
          return;
        }

        if (title === "position information") {
          section.fields.forEach((field) => {
            position.push({
              ...field,
              locked: !OFFICE_CONTACT_RE.test(field.key),
            });
          });
          return;
        }

        if (title.startsWith("nominees reference") && title.includes("head")) {
          otherSections.push({
            ...section,
            fields: section.fields.map((f) => ({
              ...f,
              locked: LOCKED_HEADNOM_KEY_RE.test(f.key),
            })),
          });
          return;
        }

        if (
          title.startsWith("nominees reference") &&
          (title.includes("nominator") || title.includes("technical writer"))
        ) {
          otherSections.push({
            ...section,
            action: {
              label: nominatorEntry.value
                ? "Change Nominator"
                : "Select Nominator",
              icon: "person_search",
              handler: "openNominatorDialog",
            },
            fields: section.fields.map((f) => ({
              ...f,
              locked: LOCKED_HEADNOM_KEY_RE.test(f.key),
            })),
          });
          return;
        }

        otherSections.push(section);
      });

      const entryField = (key, label, extra = {}) => ({
        key: `__${key}`,
        kind: "entry",
        entryKey: key,
        label,
        locked: true,
        ...extra,
      });

      const hasOwnContact = personal.some((f) => CONTACT_RE.test(f.key));
      const contactField = hasOwnContact
        ? []
        : [
            entryField("mobile_no", "Contact No.", {
              locked: false,
              inputmode: "numeric",
              maxlength: 11,
              placeholder: "09XXXXXXXXX",
              rule: mobileRule,
            }),
          ];

      return [
        {
          title: "Personal Information",
          hint: "Only Email and Contact No. can be edited.",
          fields: [
            entryField("employee", "Employee Name"),
            ...sortFields(PERSONAL_ORDER, personal),
            ...contactField,
          ],
        },
        {
          title: "Position Information",
          hint: "Only Office Email and Office Contact No. can be edited.",
          fields: [
            entryField("position", "Position"),
            entryField("employment_status", "Status of Employment"),
            entryField("department", "Office"),
            ...sortFields(POSITION_ORDER, position),
          ],
        },
        ...otherSections,
      ];
    });

    const currentEntry = computed(
      () => entries.value[activeEntryIndex.value] || null
    );

    const canApplyToAll = computed(
      () => !!typeMeta.value?.applyToAll && entries.value.length > 1
    );

    const submitLabel = computed(() =>
      editingStatus.value === "returned" ? "Resubmit" : "Submit for Review"
    );

    const officeEmployees = computed(() => userStore.employees || []);

    const filteredOfficeEmployees = computed(() => {
      const q = (employeeSearch.value || "").trim().toLowerCase();
      if (!q) return officeEmployees.value;

      return officeEmployees.value.filter((e) => {
        const name = (e.full_name || "").toLowerCase();
        const pos = (e.Designation || "").toLowerCase();
        const ctrl = (e.ControlNo || "").toLowerCase();
        return name.includes(q) || pos.includes(q) || ctrl.includes(q);
      });
    });

    const filteredNominatorEmployees = computed(() => {
      const selectedControlNos = new Set(
        entries.value
          .filter((e) => !e.is_office && e.control_no)
          .map((e) => String(e.control_no))
      );

      let list = officeEmployees.value.filter(
        (e) => !selectedControlNos.has(String(e.ControlNo || ""))
      );

      const q = (nominatorSearch.value || "").trim().toLowerCase();
      if (!q) return list;

      return list.filter((e) => {
        const name = (e.full_name || "").toLowerCase();
        const pos = (e.Designation || "").toLowerCase();
        const ctrl = (e.ControlNo || "").toLowerCase();
        return name.includes(q) || pos.includes(q) || ctrl.includes(q);
      });
    });

    const canSaveDraft = computed(() => {
      if (isAwaitingHardcopy.value) return false;
      return (
        !!officeName.value &&
        !!nominationType.value &&
        entries.value.length > 0 &&
        !nominationStore.isLoading
      );
    });

    const canSubmit = computed(() => {
      if (isAwaitingHardcopy.value) return false;
      if (!canSaveDraft.value) return false;
      return entries.value.every(
        (entry) => validateEntry(nominationType.value, entry) === null
      );
    });

    const signedFormMeta = computed(() => existingSignedForm.value);

    const signedFormHint = computed(() => {
      if (signedFormFile.value) {
        return "New file selected — will replace the current one on submit.";
      }
      if (isReupload.value) {
        return "A new signed form is required. The previous copy was returned by HR.";
      }
      if (existingSignedForm.value) {
        return "A signed form is already on file. Upload a new one to replace it.";
      }
      return "Attach the signed form. PDF, JPG or PNG up to 5 MB.";
    });

    const signedFormSubmitHint = computed(() => {
      if (isReupload.value && !signedFormFile.value) {
        return "Upload a new signed form to replace the returned copy.";
      }
      return "Upload the signed form first.";
    });

    const canSubmitSigned = computed(() => {
      if (!isAwaitingHardcopy.value) return false;
      if (signedFormSubmitting.value) return false;
      if (isReupload.value && !signedFormFile.value) return false;
      return !!(signedFormFile.value || existingSignedForm.value);
    });

    // ---------- Lifecycle ----------
    onMounted(async () => {
      await typeStore.fetchActive();

      if (isEditMode.value) {
        await loadForEdit();
        return;
      }

      const presetType = route.query.type;
      if (presetType && typeStore.activeCodes.has(presetType)) {
        nominationType.value = presetType;
        const found = typeStore.active.find((t) => t.code === presetType);
        if (found) selectedGroup.value = found.group;
      }
    });

    // ---------- Helpers ----------
    function notify(message, type = "negative") {
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

    function inputType(field) {
      if (field.kind === "date") return "date";
      if (field.kind === "datetime") return "datetime-local";
      if (field.kind === "email") return "email";
      return "text";
    }

    function wordCount(value) {
      const filled = String(value ?? "").trim();
      if (!filled) return 0;
      return filled.split(/\s+/).filter(Boolean).length;
    }

    function toDateInput(value) {
      if (!value) return null;
      const s = String(value);
      const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
      return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
    }

    function normalizeSex(value) {
      if (!value) return null;
      const v = String(value).trim().toLowerCase();
      if (v.startsWith("m")) return "male";
      if (v.startsWith("f")) return "female";
      return null;
    }

    function newEntry(base) {
      return {
        ...base,
        data: blankData(nominationType.value),
        docs: blankDocs(nominationType.value),
        existing_docs: {},
      };
    }

    function createEmployeeEntry(emp) {
      return newEntry({
        id: `emp-${emp.ControlNo || Date.now()}`,
        control_no: emp.ControlNo || "",
        employee: emp.full_name || "",
        position: emp.Designation || "",
        mobile_no: normalizePhone(emp.TelNo),
        department: emp.Office || officeName.value,
        employment_status: emp.Status || "",
        is_office: false,
      });
    }

    function createOfficeEntry() {
      return newEntry({
        id: `office-${officeName.value}`,
        control_no: "",
        employee: officeName.value,
        position: "",
        mobile_no: "",
        department: officeName.value,
        employment_status: "",
        is_office: true,
      });
    }

    // ---------- Gawad hydration ----------
    async function hydrateGawadEntry(entry) {
      if (!entry) return;
      if (nominationType.value !== GAWAD_TYPE) return;
      if (entry.is_office) return;
      if (!entry.control_no) return;
      if (entry._hydrated || entry._hydrating) return;

      entry._hydrating = true;

      try {
        const result = await userStore.fetchEmployeeByControlNo(
          entry.control_no
        );

        if (!result.success || !result.data) return;

        const d = result.data;

        entry.position = d.Designation || entry.position || "";
        entry.employment_status = d.Status || entry.employment_status || "";
        entry.department = d.Office || entry.department || officeName.value;

        entry.data.birthdate = toDateInput(d.BirthDate);
        entry.data.sex = normalizeSex(d.Sexx);
        entry.data.place_of_birth = d.BirthPlace || "";
        entry.data.address = d.Address || "";
        entry.data.email = d.Email || "";

        entry.data.level = d.Grades != null ? String(d.Grades) : "";
        entry.data.division_section = [d.Division, d.Section]
          .filter(Boolean)
          .join(" / ");
        entry.data.years_in_govt_service = d.YearsInServiceText || "";

        const head = d.OfficeHead;
        if (head) {
          if (!entry.data.head_name) {
            entry.data.head_name = head.employee_name || "";
          }
          if (!entry.data.head_position) {
            entry.data.head_position = head.position || "";
          }
          if (!entry.data.head_contact) {
            entry.data.head_contact = head.contact_no || "";
          }
          if (!entry.data.head_email) {
            entry.data.head_email = head.email || "";
          }
        }

        if (!entry.mobile_no && d.TelNo) {
          entry.mobile_no = normalizePhone(d.TelNo);
        }

        entry._hydrated = true;
      } catch (err) {
        console.error("Hydrate Gawad entry failed:", err);
      } finally {
        entry._hydrating = false;
      }
    }

    function hydrateAllGawadEntries() {
      if (nominationType.value !== GAWAD_TYPE) return;
      entries.value.forEach((e) => {
        hydrateGawadEntry(e);
      });
    }

    function isEntryComplete(entry) {
      return validateEntry(nominationType.value, entry) === null;
    }

    function hasEnteredData() {
      return entries.value.some(
        (e) =>
          Object.values(e.data || {}).some((v) => String(v || "").trim()) ||
          Object.values(e.docs || {}).some(Boolean)
      );
    }

    // ---------- Config-driven select options ----------
    function optionsForField(field) {
      let list = [];

      if (typeof field.optionsFor === "function") {
        const data = currentEntry.value?.data || {};
        list = field.optionsFor(data) || [];
      } else {
        list = field.options || [];
      }

      if (field.searchable) {
        const needle = (searchFilters.value[field.key] || "")
          .trim()
          .toLowerCase();
        if (needle) {
          list = list.filter((opt) =>
            String(opt.label || "")
              .toLowerCase()
              .includes(needle)
          );
        }
      }

      return list;
    }

    function filterSelect(val, update, field) {
      searchFilters.value[field.key] = val || "";
      update(() => {});
    }

    function onFieldSelect(changedField) {
      if (isReadOnly.value) return;
      const allFields = sections.value.flatMap((s) => s.fields);
      const dependents = allFields.filter(
        (f) => f.dependsOn === changedField.key
      );
      if (dependents.length === 0) return;

      dependents.forEach((dep) => {
        const newOptions = optionsForField(dep);
        const current = currentEntry.value?.data?.[dep.key];
        if (current && !newOptions.some((o) => o.value === current)) {
          currentEntry.value.data[dep.key] = null;
        }
      });
    }

    function fieldLocked(field) {
      if (isReadOnly.value) return true;
      if (!field.locked) return false;

      if (isGawad.value && LOCKED_HEADNOM_KEY_RE.test(field.key)) {
        return true;
      }

      const entry = currentEntry.value;
      if (!entry) return false;
      if (entry._hydrating) return true;
      if (!entry._hydrated) return false;

      return String(entry.data?.[field.key] ?? "").trim() !== "";
    }

    // ---------- Validation ----------
    const mobileRule = (v) => {
      if (isReadOnly.value) return true;
      if (!v) return "Mobile number is required";
      return (
        /^09\d{9}$/.test(v) ||
        "Enter 11 digits starting with 09 (e.g. 09171234567)"
      );
    };

    function fieldRules(field) {
      return [
        (v) => {
          if (isReadOnly.value) return true;
          if (fieldLocked(field)) return true;
          return fieldError(field, v) || true;
        },
      ];
    }

    function fileRule(doc) {
      return (v) => {
        if (isReadOnly.value) return true;
        return (
          doc.optional ||
          !!v ||
          !!currentEntry.value?.existing_docs?.[doc.key] ||
          `${doc.label} is required`
        );
      };
    }

    function signedFormRule(v) {
      if (isReupload.value && !v) {
        return "A new signed form is required after HR returned the previous copy.";
      }
      return (
        !!v || !!existingSignedForm.value || "Please attach the signed form."
      );
    }

    function existingDocHint(doc) {
      const meta = existingDocFor(doc);
      if (!meta) return "";
      return `Current file: ${meta.name}. Upload a new one to replace it.`;
    }

    function existingDocFor(doc) {
      const raw = currentEntry.value?.existing_docs?.[doc.key];
      if (!raw) return null;
      if (typeof raw === "string") return { name: raw };
      return raw;
    }

    function hasPendingFile(doc) {
      const picked = currentEntry.value?.docs?.[doc.key];
      return picked instanceof File;
    }

    function onFileRejected() {
      notify("File rejected. Use a PDF, JPG or PNG that is 5 MB or smaller.");
    }

    function onSignedFileRejected() {
      notify("File rejected. Use a PDF, JPG or PNG that is 5 MB or smaller.");
    }

    // ---------- Existing-doc view / download ----------
    async function viewExistingDoc(doc) {
      const meta = existingDocFor(doc);
      if (!meta) return;
      if (!meta.url) {
        notify("No preview URL for this file.", "warning");
        return;
      }

      viewingKey.value = doc.key;
      try {
        const res = await api.get(meta.url, { responseType: "blob" });
        const blobUrl = URL.createObjectURL(res.data);
        window.open(blobUrl, "_blank", "noopener,noreferrer");
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
      } catch (err) {
        notify(
          err?.response?.data?.message ||
            "Unable to open the document. Please try again.",
          "negative"
        );
      } finally {
        viewingKey.value = null;
      }
    }

    async function downloadExistingDoc(doc) {
      const meta = existingDocFor(doc);
      if (!meta) return;
      const url = meta.download_url || meta.url;
      if (!url) {
        notify("No download URL for this file.", "warning");
        return;
      }

      downloadingKey.value = doc.key;
      try {
        const res = await api.get(url, { responseType: "blob" });
        const blobUrl = URL.createObjectURL(res.data);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = meta.name || doc.key;
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10_000);
      } catch (err) {
        notify(
          err?.response?.data?.message ||
            "Unable to download the document. Please try again.",
          "negative"
        );
      } finally {
        downloadingKey.value = null;
      }
    }

    // ---------- Signed form view / download ----------
    async function viewSignedForm() {
      const meta = existingSignedForm.value;
      if (!meta?.url) {
        notify("No preview URL for the signed form.", "warning");
        return;
      }

      viewingKey.value = "signed_form";
      try {
        const res = await api.get(meta.url, { responseType: "blob" });
        const blobUrl = URL.createObjectURL(res.data);
        window.open(blobUrl, "_blank", "noopener,noreferrer");
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
      } catch (err) {
        notify(
          err?.response?.data?.message ||
            "Unable to open the signed form. Please try again.",
          "negative"
        );
      } finally {
        viewingKey.value = null;
      }
    }

    async function downloadSignedForm() {
      const meta = existingSignedForm.value;
      if (!meta) return;
      const url = meta.download_url || meta.url;
      if (!url) {
        notify("No download URL for the signed form.", "warning");
        return;
      }

      downloadingKey.value = "signed_form";
      try {
        const res = await api.get(url, { responseType: "blob" });
        const blobUrl = URL.createObjectURL(res.data);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = meta.name || "signed_form";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10_000);
      } catch (err) {
        notify(
          err?.response?.data?.message ||
            "Unable to download the signed form. Please try again.",
          "negative"
        );
      } finally {
        downloadingKey.value = null;
      }
    }

    // ---------- Signed form submission ----------
    async function submitSignedForm() {
      if (!isAwaitingHardcopy.value) return;

      if (isReupload.value && !signedFormFile.value) {
        notify(
          "Please upload a new signed form. The previous copy was returned by HR."
        );
        return;
      }

      if (!signedFormFile.value && !existingSignedForm.value) {
        notify("Please attach the signed form before submitting.");
        return;
      }

      const id = route.params.id;
      signedFormSubmitting.value = true;

      try {
        if (signedFormFile.value) {
          const uploadRes = await nominationStore.uploadSignedForm(
            id,
            "signed_form",
            signedFormFile.value
          );
          if (!uploadRes.success) {
            notify(uploadRes.message || "Unable to upload the signed form.");
            return;
          }
          signedFormFile.value = null;
        }

        const submitRes = await nominationStore.submitSigned(id);
        if (!submitRes.success) {
          notify(submitRes.message || "Unable to submit the signed form.");
          return;
        }

        notify(
          submitRes.message || "Signed form submitted. HR will review it.",
          "positive"
        );
        router.back();
      } catch (err) {
        notify(err?.message || "Something went wrong. Please try again.");
      } finally {
        signedFormSubmitting.value = false;
      }
    }

    // ---------- Employee selection ----------
    function isEmployeeSelected(controlNo) {
      if (!controlNo) return false;
      return entries.value.some((e) => e.control_no === controlNo);
    }

    function dropNominatorIfSamePerson(controlNo) {
      if (!controlNo) return;
      if (
        nominatorEntry.value &&
        String(nominatorEntry.value.control_no || "") === String(controlNo)
      ) {
        clearNominator();
      }
    }

    function toggleEmployee(pmisEmp) {
      if (isReadOnly.value) return;
      const idx = entries.value.findIndex(
        (e) => e.control_no === pmisEmp.ControlNo
      );

      if (idx >= 0) {
        removeEntry(idx);
        return;
      }

      const entry = createEmployeeEntry(pmisEmp);
      entries.value.push(entry);
      activeEntryIndex.value = entries.value.length - 1;

      dropNominatorIfSamePerson(pmisEmp.ControlNo);

      if (isGawad.value) {
        hydrateGawadEntry(entry);
      }
    }

    function selectAllFiltered() {
      const added = [];
      filteredOfficeEmployees.value.forEach((emp) => {
        if (!isEmployeeSelected(emp.ControlNo)) {
          const entry = createEmployeeEntry(emp);
          entries.value.push(entry);
          added.push(entry);
        }
      });

      activeEntryIndex.value = Math.min(
        activeEntryIndex.value,
        Math.max(0, entries.value.length - 1)
      );

      added.forEach((e) => dropNominatorIfSamePerson(e.control_no));

      if (isGawad.value) {
        added.forEach((e) => hydrateGawadEntry(e));
      }
    }

    function clearSelection() {
      entries.value = [];
      activeEntryIndex.value = 0;
    }

    function removeEntry(index) {
      if (isReadOnly.value) return;
      entries.value.splice(index, 1);
      activeEntryIndex.value = Math.max(
        0,
        Math.min(activeEntryIndex.value, entries.value.length - 1)
      );
    }

    function selectEntry(index) {
      activeEntryIndex.value = index;
      if (isGawad.value) {
        hydrateGawadEntry(entries.value[index]);
      }
    }

    async function openEmployeeDialog() {
      if (isReadOnly.value) return;
      if (!nominationType.value) {
        notify("Please select a nomination type and category first.");
        return;
      }
      if (!officeName.value) {
        notify("No office is assigned to this account.");
        return;
      }

      showEmployeeDialog.value = true;

      if (!employeesLoaded.value) {
        try {
          const result = await userStore.fetchEmployeesByOffice(
            officeName.value
          );
          if (!result || result.success === false) {
            notify(
              result?.message || "Unable to load employees for your office."
            );
          } else {
            employeesLoaded.value = true;
          }
        } catch (err) {
          console.error("Load employees failed:", err);
          notify("Unable to load employees for your office.");
        }
      }
    }

    // ---------- Nominator picker ----------
    async function openNominatorDialog() {
      if (isReadOnly.value) return;
      if (!nominationType.value) {
        notify("Please select a nomination type and category first.");
        return;
      }
      if (!officeName.value) {
        notify("No office is assigned to this account.");
        return;
      }

      showNominatorDialog.value = true;

      if (!employeesLoaded.value) {
        try {
          const result = await userStore.fetchEmployeesByOffice(
            officeName.value
          );
          if (!result || result.success === false) {
            notify(
              result?.message || "Unable to load employees for your office."
            );
          } else {
            employeesLoaded.value = true;
          }
        } catch (err) {
          console.error("Load employees failed:", err);
          notify("Unable to load employees for your office.");
        }
      }
    }

    function isNominatorSelected(controlNo) {
      if (!controlNo) return false;
      return nominatorEntry.value?.control_no === controlNo;
    }

    function nominatorLabel() {
      if (hydratingNominator.value) return "Loading nominator details…";
      if (!nominatorEntry.value) return "No nominator selected";
      return nominatorEntry.value.employee || "Unnamed Employee";
    }

    async function selectNominator(pmisEmp) {
      if (isReadOnly.value) return;

      const isNominee = entries.value.some(
        (e) =>
          !e.is_office &&
          String(e.control_no || "") === String(pmisEmp.ControlNo || "")
      );
      if (isNominee) {
        notify("A nominee cannot be their own nominator / technical writer.");
        return;
      }

      if (isNominatorSelected(pmisEmp.ControlNo)) {
        clearNominator();
        return;
      }

      nominatorEntry.value = {
        control_no: pmisEmp.ControlNo || "",
        employee: pmisEmp.full_name || "",
        position: pmisEmp.Designation || "",
        employment_status: pmisEmp.Status || "",
        department: pmisEmp.Office || officeName.value,
        mobile_no: normalizePhone(pmisEmp.TelNo),
        email: "",
      };

      applyNominatorToCurrentEntry();

      hydratingNominator.value = true;
      try {
        const result = await userStore.fetchEmployeeByControlNo(
          nominatorEntry.value.control_no
        );
        if (result.success && result.data) {
          const d = result.data;
          nominatorEntry.value.position =
            d.Designation || nominatorEntry.value.position;
          nominatorEntry.value.employment_status =
            d.Status || nominatorEntry.value.employment_status;
          nominatorEntry.value.department =
            d.Office || nominatorEntry.value.department;
          nominatorEntry.value.mobile_no = normalizePhone(
            d.CellphoneNo || d.TelNo || nominatorEntry.value.mobile_no
          );
          nominatorEntry.value.email = d.Email || "";
          applyNominatorToCurrentEntry();
        }
      } catch (err) {
        console.error("Fetch nominator details failed:", err);
      } finally {
        hydratingNominator.value = false;
      }
    }

    function applyNominatorToCurrentEntry() {
      const entry = currentEntry.value;
      const nom = nominatorEntry.value;
      if (!entry || !nom) return;

      entry.data.nominator_name = nom.employee || "";
      entry.data.nominator_position = nom.position || "";
      entry.data.nominator_contact = nom.mobile_no || "";
      entry.data.nominator_email = nom.email || "";
    }

    function clearNominator() {
      if (isReadOnly.value) return;
      nominatorEntry.value = null;

      const entry = currentEntry.value;
      if (!entry) return;

      entry.data.nominator_name = "";
      entry.data.nominator_position = "";
      entry.data.nominator_contact = "";
      entry.data.nominator_email = "";
    }

    function handleSectionAction(handlerName) {
      if (handlerName === "openNominatorDialog") openNominatorDialog();
    }

    // ---------- Apply to all ----------
    function applyToAll(fieldKey) {
      if (isReadOnly.value) return;
      const source = currentEntry.value;
      if (!source || !canApplyToAll.value) return;

      entries.value.forEach((e) => {
        if (e.id !== source.id) e.data[fieldKey] = source.data[fieldKey];
      });

      $q.notify({
        type: "positive",
        message: `Applied to all ${entries.value.length} nominees.`,
        position: "top",
        timeout: 1200,
      });
    }

    // ---------- Repeatable pair block ----------
    function repeatableRows(field) {
      const entry = currentEntry.value;
      if (!entry) return [];
      const value = entry.data?.[field.key];
      return Array.isArray(value) ? value : [];
    }

    function addRepeatableRow(field) {
      if (isReadOnly.value) return;
      const entry = currentEntry.value;
      if (!entry) return;

      if (!Array.isArray(entry.data[field.key])) {
        entry.data[field.key] = [];
      }

      const row = {};
      (field.rowFields || []).forEach((f) => {
        row[f.key] = "";
      });
      entry.data[field.key].push(row);
    }

    function removeRepeatableRow(field, index) {
      if (isReadOnly.value) return;
      const entry = currentEntry.value;
      if (!entry) return;

      const arr = entry.data?.[field.key];
      if (!Array.isArray(arr)) return;

      const min = field.minRows ?? 1;
      if (arr.length <= min) {
        notify(
          `At least ${min} ${min === 1 ? "entry is" : "entries are"} required.`,
          "warning"
        );
        return;
      }

      arr.splice(index, 1);
    }

    // =====================================================
    // TYPE / CATEGORY CHANGES
    // =====================================================

    function onGroupChange(newGroup) {
      if (isReadOnly.value) return;
      if (newGroup === selectedGroup.value) return;

      const willReset = !!nominationType.value;

      const apply = () => {
        selectedGroup.value = newGroup;

        if (nominationType.value) {
          nominationType.value = null;
          entries.value.forEach((e) => {
            e.data = blankData(null);
            e.docs = blankDocs(null);
            e.existing_docs = {};
            e._hydrated = false;
            e._hydrating = false;
          });
        }

        // Auto-select if only one active category in this group
        if (categoryOptions.value.length === 1) {
          applyCategoryChange(categoryOptions.value[0].value);
        }
      };

      if (willReset && hasEnteredData()) {
        $q.dialog({
          title: "Change Nomination Type?",
          message:
            "Switching the nomination type will clear the details and documents already entered. Continue?",
          cancel: true,
          persistent: true,
        }).onOk(apply);
      } else {
        apply();
      }
    }

    function onCategoryChange(newCode) {
      if (isReadOnly.value) return;
      if (newCode === nominationType.value) return;

      if (hasEnteredData()) {
        $q.dialog({
          title: "Change Category?",
          message:
            "Switching the category will clear the details and documents already entered. Continue?",
          cancel: true,
          persistent: true,
        }).onOk(() => applyCategoryChange(newCode));
      } else {
        applyCategoryChange(newCode);
      }
    }

    function applyCategoryChange(newCode) {
      applyTypeChange(newCode);
    }

    function applyTypeChange(newType) {
      if (isReadOnly.value) return;

      const flags = TYPE_FLAGS[newType] || {};
      nominationType.value = newType;

      if (!flags.officeNominee && nomineeType.value === "office") {
        nomineeType.value = "employee";
        entries.value = [];
        activeEntryIndex.value = 0;
        return;
      }

      entries.value.forEach((e) => {
        e.data = blankData(newType);
        e.docs = blankDocs(newType);
        e.existing_docs = {};
        e._hydrated = false;
        e._hydrating = false;
      });

      if (newType === GAWAD_TYPE) {
        hydrateAllGawadEntries();
      }
    }

    function applyNomineeChange(newValue) {
      nomineeType.value = newValue;
      entries.value = newValue === "office" ? [createOfficeEntry()] : [];
      activeEntryIndex.value = 0;

      if (newValue === "employee" && isGawad.value) {
        hydrateAllGawadEntries();
      }
    }

    function onNomineeTypeChange(newValue) {
      if (isReadOnly.value) return;
      if (newValue === nomineeType.value) return;

      if (hasEnteredData()) {
        $q.dialog({
          title: "Change Nominee?",
          message:
            "Switching between employee and office will clear what you have entered. Continue?",
          cancel: true,
          persistent: true,
        }).onOk(() => applyNomineeChange(newValue));
      } else {
        applyNomineeChange(newValue);
      }
    }

    // ---------- Edit ----------
    async function loadForEdit() {
      if (!officeName.value) {
        loadError.value = "No office is assigned to this account.";
        return;
      }

      isLoading.value = true;
      loadError.value = null;

      try {
        const result = await nominationStore.fetchOne(route.params.id);

        if (!result.success || !result.data) {
          loadError.value = result.message || "Nomination not found.";
          return;
        }

        const rec = result.data;

        if (rec.office !== officeName.value) {
          loadError.value = "Nomination not found.";
          return;
        }

        if (!["draft", "returned", "awaiting_hardcopy"].includes(rec.status)) {
          loadError.value =
            "This nomination cannot be edited in its current status.";
          return;
        }

        record.value = rec;

        nominationType.value = rec.type;
        nomineeType.value = rec.nominee_type || "employee";
        editingStatus.value = rec.status;

        // Restore the group from either active or all types
        const found =
          typeStore.active.find((t) => t.code === rec.type) ||
          typeStore.all.find((t) => t.code === rec.type);
        if (found) selectedGroup.value = found.group;

        existingSignedForm.value = rec.signed_docs?.signed_form || null;

        const existing = {};
        Object.entries(rec.docs || {}).forEach(([k, v]) => {
          existing[k] = typeof v === "string" ? { name: v } : { ...v };
        });

        entries.value = [
          {
            id: rec.id,
            control_no: rec.control_no || "",
            employee: rec.employee,
            position: rec.position || "",
            mobile_no: rec.mobile_no || "",
            department: rec.department || officeName.value,
            employment_status: rec.employment_status || "",
            is_office: !!rec.is_office,
            data: { ...blankData(rec.type), ...(rec.details || {}) },
            docs: blankDocs(rec.type),
            existing_docs: existing,
            _hydrated: true,
            _hydrating: false,
          },
        ];
        activeEntryIndex.value = 0;

        const saved = entries.value[0]?.data;
        if (saved?.nominator_name) {
          nominatorEntry.value = {
            control_no: "",
            employee: saved.nominator_name || "",
            position: saved.nominator_position || "",
            employment_status: "",
            department: officeName.value,
            mobile_no: saved.nominator_contact || "",
            email: saved.nominator_email || "",
          };
        }
      } catch (err) {
        loadError.value = err?.message || "Unable to load nomination.";
      } finally {
        isLoading.value = false;
      }
    }

    // ---------- Navigation ----------
    function goBack() {
      router.back();
    }

    // ---------- Save ----------
    function validateBeforeSave(targetStatus) {
      if (!officeName.value) {
        notify("No office is assigned to this account.");
        return false;
      }
      if (!nominationType.value) {
        notify("Please select a nomination type and category.");
        return false;
      }
      if (entries.value.length === 0) {
        notify(
          nomineeType.value === "office"
            ? "Please select the office nominee."
            : "Please add at least one employee."
        );
        return false;
      }
      if (targetStatus === "draft") return true;

      for (let i = 0; i < entries.value.length; i += 1) {
        const entry = entries.value[i];
        const failure = validateEntry(nominationType.value, entry);

        if (failure) {
          activeEntryIndex.value = i;
          const label = entry.employee || `Nominee ${i + 1}`;
          notify(`${label}: ${failure.message}`);
          return false;
        }
      }
      return true;
    }

    function buildEntryPayload(entry) {
      const details = { ...entry.data };

      sections.value.forEach((s) =>
        s.fields.forEach((f) => {
          if (f.kind === "derived") details[f.key] = f.derive(entry.data);
        })
      );

      const docs = {};
      docsList.value.forEach((d) => {
        const picked = entry.docs[d.key];
        if (picked instanceof File) {
          docs[d.key] = picked;
        }
      });

      return {
        control_no: entry.control_no,
        employee: entry.employee,
        position: entry.position,
        mobile_no: entry.mobile_no || "",
        department: entry.department,
        employment_status: entry.employment_status,
        is_office: entry.is_office,
        is_complete: validateEntry(nominationType.value, entry) === null,
        details,
        docs,
      };
    }

    async function saveNomination(targetStatus) {
      if (isAwaitingHardcopy.value) return;
      if (!validateBeforeSave(targetStatus)) return;

      // Re-verify the category is still open before sending
      await typeStore.fetchActive();
      if (!typeStore.activeCodes.has(nominationType.value)) {
        notify(
          "This category is no longer open. Please choose another.",
          "negative"
        );
        return;
      }

      const payloadEntries = entries.value.map(buildEntryPayload);
      let result;

      if (isEditMode.value) {
        result = await nominationStore.updateNomination(route.params.id, {
          ...payloadEntries[0],
          status: targetStatus,
        });
      } else {
        result = await nominationStore.createBatch({
          type: nominationType.value,
          nominee_type: nomineeType.value,
          office: officeName.value,
          status: targetStatus,
          entries: payloadEntries,
        });
      }

      if (result.success) {
        notify(result.message, "positive");
        router.back();
      } else {
        notify(result.message);
      }
    }

    return {
      userStore,
      nominationStore,
      typeStore,
      officeName,
      pageStyleFn,
      isEditMode,
      isLoading,
      loadError,
      isAwaitingHardcopy,
      isReadOnly,
      isGawad,
      isReupload,
      returnReason,
      headerTitle,
      headerSubtitle,
      submitLabel,
      canSaveDraft,
      canSubmit,
      canSubmitSigned,
      signedFormSubmitHint,
      signedFormFile,
      signedFormSubmitting,
      signedFormMeta,
      signedFormHint,
      employeeSearch,
      showEmployeeDialog,

      // Type / Category
      selectedGroup,
      nominationType,
      groupOptions,
      categoryOptions,
      onGroupChange,
      onCategoryChange,
      typeMeta,

      nomineeType,
      entries,
      activeEntryIndex,
      showNomineeToggle,
      sections,
      displaySections,
      docsList,
      currentEntry,
      canApplyToAll,
      filteredOfficeEmployees,

      // Nominator picker
      showNominatorDialog,
      nominatorSearch,
      nominatorEntry,
      hydratingNominator,
      filteredNominatorEmployees,
      isNominatorSelected,
      nominatorLabel,
      openNominatorDialog,
      selectNominator,
      clearNominator,
      applyNominatorToCurrentEntry,
      handleSectionAction,

      viewingKey,
      downloadingKey,

      INFO_FIELDS,
      MAX_FILE_SIZE,
      nomineeOptions: NOMINEE_OPTIONS,

      optionsForField,
      filterSelect,
      onFieldSelect,
      fieldLocked,

      mobileRule,
      fieldRules,
      fileRule,
      signedFormRule,
      existingDocHint,
      existingDocFor,
      hasPendingFile,
      onFileRejected,
      onSignedFileRejected,
      inputType,
      wordCount,
      toDateInput,
      normalizeSex,
      getInitials,
      isEntryComplete,
      isEmployeeSelected,

      hydrateGawadEntry,
      hydrateAllGawadEntries,

      viewExistingDoc,
      downloadExistingDoc,
      viewSignedForm,
      downloadSignedForm,
      submitSignedForm,

      openEmployeeDialog,
      toggleEmployee,
      selectAllFiltered,
      clearSelection,
      removeEntry,
      selectEntry,
      applyToAll,
      onNomineeTypeChange,
      goBack,
      saveNomination,

      // Repeatable pair block
      repeatableRows,
      addRepeatableRow,
      removeRepeatableRow,
    };
  },
});
</script>

<style scoped>
/* =========================================================
   RESPONSIVE STRATEGY
   - Mobile-first: base = phone, min-width queries enhance.
   - Breakpoints match Quasar: 600 / 1024.
   - Fluid padding with clamp(); 16px inputs + 44px targets on
     phones; hover only on hover-capable devices.
========================================================= */

/* =========================================================
   PAGE
========================================================= */
.create-page {
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
  background: #ffffff;
  border: 1px solid #e6e8eb;
  border-radius: 10px;
}

.page-header-text {
  min-width: 0;
}

.page-eyebrow {
  margin-bottom: 4px;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #8a95a0;
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
  margin: 0;
  color: #7a8792;
  font-size: 13.5px;
  max-width: 560px;
}

/* Mobile: primary button on top, Cancel + Save Draft below */
.page-header-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.page-header-actions .btn-primary {
  grid-column: 1 / -1;
  order: -1;
}

.btn-ghost {
  min-height: 44px;
  padding: 0 16px;
  color: #5c6b78;
  font-size: 13px;
  font-weight: 600;
}

.btn-secondary {
  min-height: 44px;
  padding: 0 18px;
  border-radius: 9px;
  color: #2b3a4a;
  background: #ffffff;
  border: 1px solid #d6dce1;
  font-size: 13px;
  font-weight: 650;
}

.btn-primary {
  min-height: 44px;
  padding: 0 22px;
  border-radius: 9px;
  color: #ffffff;
  background: linear-gradient(135deg, #f5a623, #e8911a);
  font-size: 13px;
  font-weight: 650;
  box-shadow: 0 4px 10px rgba(232, 145, 26, 0.25);
}

.btn-primary--sm {
  min-height: 40px;
  padding: 0 20px;
  font-size: 12.5px;
  box-shadow: none;
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.5;
  box-shadow: none;
}

/* Visible replacement for the disabled-button tooltip (touch has no hover) */
.submit-hint {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin: -6px 0 14px;
  font-size: 12px;
  line-height: 1.5;
  color: #8a95a0;
}

.submit-hint .q-icon {
  margin-top: 2px;
  flex-shrink: 0;
}

/* ---------- Banner ---------- */
.banner {
  margin-bottom: 16px;
  padding: 12px 18px;
  border-radius: 10px;
  font-size: 13px;
  border-left: 4px solid transparent;
}

.banner--error {
  background: #fbe9e9;
  color: #8b2c2c;
  border-left-color: #c73f3f;
}

.banner--info {
  background: #fff8f0;
  color: #6b4a1a;
  border-left-color: #e8911a;
}

/* Reviewer's reason shown inside the info banner */
.banner-reason {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-top: 8px;
  padding: 8px 10px;
  background: #ffffff;
  border-left: 3px solid #e8911a;
  border-radius: 4px;
  font-size: 12.5px;
  color: #5c6b78;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.banner-reason .q-icon {
  color: #d4880f;
  flex-shrink: 0;
  margin-top: 2px;
}

.banner-reason strong {
  color: #8a5a1a;
  font-weight: 650;
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
  font-size: 16px;
  font-weight: 650;
  color: #19354a;
}

.state-text {
  font-size: 13px;
  color: #7a8792;
  max-width: 380px;
  line-height: 1.55;
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
  width: 26px;
  height: 26px;
  min-width: 26px;
  border-radius: 50%;
  background: #2b3a4a;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  margin-top: 1px;
}

.step-body {
  flex: 1;
  min-width: 0;
}

.step-body--flex {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.step-label {
  font-size: 11.5px;
  font-weight: 700;
  color: #6b7680;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.step-label--inline {
  margin-bottom: 0;
}

.step-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}

.step-hint {
  display: inline-flex;
  align-items: flex-start;
  gap: 5px;
  margin-top: 8px;
  font-size: 11.5px;
  color: #97a1a9;
  line-height: 1.5;
}

.step-hint .q-icon {
  color: #b3bcc4;
  flex-shrink: 0;
  margin-top: 3px;
}

.step-select :deep(.q-field__control) {
  border-radius: 8px;
}

.step-toggle {
  border: 1px solid #dde3e8;
  border-radius: 8px;
  overflow: hidden;
}

.add-btn {
  min-width: 40px;
  min-height: 40px;
  color: #5c6b78;
  flex-shrink: 0;
  background: #f7f8f9;
  border: 1px solid #e6e8eb;
}

.office-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
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

.empty-hint {
  padding: 18px 16px;
  background: #fafbfc;
  border: 1px dashed #dde1e5;
  border-radius: 8px;
  color: #97a1a9;
  font-size: 12px;
  line-height: 1.6;
  text-align: center;
}

.empty-hint strong {
  color: #5c6b78;
}

.roster {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 320px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.roster-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: background 0.12s ease, border-color 0.12s ease;
  -webkit-tap-highlight-color: transparent;
}

.roster-item.is-active {
  background: #eef1f4;
  border-color: #dde3e8;
}

.roster-avatar {
  width: 32px;
  height: 32px;
  min-width: 32px;
  border-radius: 50%;
  background: #dde3e8;
  color: #4a5763;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
}

.roster-item.is-active .roster-avatar {
  background: #2b3a4a;
  color: #ffffff;
}

.roster-info {
  flex: 1;
  min-width: 0;
}

.roster-name {
  font-size: 13px;
  font-weight: 600;
  color: #1a2332;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.roster-meta {
  margin-top: 2px;
  font-size: 11.5px;
  color: #97a1a9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.roster-status.is-complete {
  color: #2f9e5c;
}

.roster-status.is-incomplete {
  color: #d3d8dc;
}

.roster-remove {
  min-width: 40px;
  min-height: 40px;
  color: #c2c9ce;
}

/* =========================================================
   RIGHT PANEL
========================================================= */
.form-section {
  display: flex;
  flex-direction: column;
}

.form-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 260px;
  padding: 32px 16px;
  color: #b3bcc4;
  text-align: center;
}

.form-empty .q-icon {
  color: #c8cfd5;
  margin-bottom: 4px;
}

.form-empty-title {
  font-size: 15px;
  font-weight: 650;
  color: #5c6b78;
}

.form-empty-sub {
  font-size: 13px;
  color: #97a1a9;
  line-height: 1.55;
  max-width: 320px;
}

.form-empty-sub strong {
  color: #5c6b78;
}

.form-section-title {
  margin: 18px 0 8px;
  font-size: 11.5px;
  font-weight: 700;
  color: #6b7680;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.form-section-title:first-child {
  margin-top: 0;
}

.form-section-title.flush {
  margin: 0;
}

.req-badge {
  display: inline-block;
  padding: 2px 7px;
  font-size: 10.5px;
  font-weight: 700;
  color: #b04a3b;
  background: #fbeeeb;
  border-radius: 4px;
  letter-spacing: 0.3px;
  text-transform: none;
}

.form-block {
  margin-top: 8px;
  padding: 12px;
  background: #fafbfc;
  border: 1px solid #edeff1;
  border-radius: 10px;
}

/* Signed form block — stand out with an orange accent */
.form-block--signed {
  background: #fff8f0;
  border-color: #f4e2c8;
}

.form-block--signed .form-section-title {
  color: #8a5a1a;
}

.form-block--signed .req-badge {
  color: #ffffff;
  background: #d4880f;
}

/* Re-upload variant — subtle amber tint to signal "attention needed" */
.form-block--reupload {
  background: #fff4e0;
  border-color: #f0c98f;
}

.form-block-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px 12px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.form-block-hint {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #8a95a0;
  font-style: italic;
}

.form-block-hint .q-icon {
  color: #b3bcc4;
}

/* Section-level action button (e.g. Select Nominator) */
.section-action {
  min-height: 32px;
  color: #2b3a4a;
  font-size: 12px;
  font-weight: 600;
  background: #eef1f4;
  border-radius: 6px;
}

/* =========================================================
   REPEATABLE PAIR BLOCK
========================================================= */
.repeatable-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  min-width: 0;
}

.repeatable-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.repeatable-hint {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11.5px;
  color: #8a95a0;
  font-style: italic;
  line-height: 1.4;
}

.repeatable-hint .q-icon {
  color: #b3bcc4;
  flex-shrink: 0;
}

.repeatable-add {
  min-height: 36px;
  color: #2b3a4a;
  background: #eef1f4;
  border-radius: 6px;
  font-size: 12.5px;
  font-weight: 600;
}

.repeatable-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  background: #ffffff;
  border: 1px solid #e6e8eb;
  border-radius: 10px;
}

.repeatable-row-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.repeatable-row-num {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  font-size: 10.5px;
  font-weight: 700;
  color: #5c6b78;
  background: #f2f4f6;
  border-radius: 4px;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.repeatable-row-num .q-icon {
  color: #b3bcc4;
}

.repeatable-remove {
  min-width: 36px;
  min-height: 36px;
  color: #c2c9ce;
}

.repeatable-row-grid {
  margin-top: 0;
  row-gap: 10px;
}

.repeatable-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 24px 16px;
  background: #fafbfc;
  border: 1px dashed #dde1e5;
  border-radius: 8px;
  color: #97a1a9;
  font-size: 12.5px;
  text-align: center;
}

.repeatable-empty .q-icon {
  color: #b3bcc4;
}

/* =========================================================
   FIELD GRID
========================================================= */
.form-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  column-gap: 16px;
  row-gap: 14px;
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
  padding-top: 4px;
}

.form-grid :deep(.q-field__native),
.form-grid :deep(.q-field__input),
.picker-search :deep(.q-field__native) {
  font-size: 16px;
}

.form-grid :deep(.q-field__control) {
  min-height: 44px;
}

/* Textareas grow with content; don't force them to 44px */
.form-grid :deep(textarea.q-field__native) {
  min-height: 88px;
  line-height: 1.55;
  padding-top: 8px;
  padding-bottom: 8px;
  font-family: inherit;
}

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
}

.apply-all {
  min-width: 40px;
  min-height: 40px;
  color: #8a95a0;
}

/* Live word counter under essay textareas */
.word-counter {
  display: inline-flex;
  align-items: center;
  margin-top: 4px;
  font-size: 11.5px;
  color: #8a95a0;
}

.word-counter.is-over {
  color: #c0392b;
  font-weight: 600;
}

/* =========================================================
   TOGGLE FIELD (inline inside form grid)
   Reuses the .step-toggle look so it matches the Nominee
   toggle at the top of the page.
========================================================= */
.field-toggle {
  min-height: 44px;
  width: 100%;
}

.field-toggle :deep(.q-btn) {
  font-weight: 600;
  font-size: 13px;
}

.field-toggle :deep(.q-btn__content) {
  flex-wrap: nowrap;
  white-space: nowrap;
}

/* Supporting documents block */
.form-block--docs {
  margin-top: 16px;
  padding: 16px 12px 20px;
}

/* The signed-form block reuses the docs grid but with less padding */
.form-block--signed .form-grid--docs {
  margin-top: 8px;
  row-gap: 12px;
}

.form-grid--docs {
  margin-top: 14px;
  row-gap: 18px;
}

.form-grid--docs :deep(.q-field__bottom) {
  padding-top: 6px;
  line-height: 1.45;
}

/* Existing-doc actions under file input */
.existing-doc-actions {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  margin-top: 6px;
  padding: 8px 10px;
  background: #f7f8f9;
  border: 1px solid #e6e8eb;
  border-radius: 6px;
}

.form-block--signed .existing-doc-actions {
  background: #ffffff;
  border-color: #f4e2c8;
}

/* When the previous signed form was returned, tint the panel as a
   reminder that it's only a reference — a new file is required. */
.existing-doc-actions--returned {
  background: #fff8ec;
  border-color: #f0c98f;
  border-style: dashed;
}

.existing-doc-name {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  color: #5c6b78;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.existing-doc-name .q-icon {
  color: #97a1a9;
  flex-shrink: 0;
}

.form-block--signed .existing-doc-name .q-icon {
  color: #d4880f;
}

.existing-doc-buttons {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 2px;
  flex-shrink: 0;
}

.doc-action {
  min-height: 40px;
  color: #5c6b78;
  font-size: 12px;
  font-weight: 600;
}

/* Quasar lets icon + label wrap onto two lines; keep them side by side */
.doc-action :deep(.q-btn__content) {
  flex-wrap: nowrap;
  white-space: nowrap;
}

/* Red-flag hint shown below the existing signed form when the last
   attempt was returned by HR. */
.reupload-notice {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-top: 6px;
  padding: 8px 10px;
  background: #fff8ec;
  border-left: 3px solid #e8911a;
  border-radius: 4px;
  font-size: 11.5px;
  color: #8a5a1a;
  line-height: 1.5;
}

.reupload-notice .q-icon {
  color: #d4880f;
  flex-shrink: 0;
  margin-top: 2px;
}

/* =========================================================
   EMPLOYEE PICKER DIALOG
========================================================= */
.picker-dialog {
  width: min(600px, 92vw);
  max-width: 92vw;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px;
}

.picker-title {
  font-size: 16px;
  font-weight: 750;
  color: #1a2332;
}

.picker-subtitle {
  margin-top: 3px;
  font-size: 12.5px;
  color: #8a95a0;
}

.picker-subtitle strong {
  color: #5c6b78;
  font-weight: 650;
}

.picker-close {
  min-width: 40px;
  min-height: 40px;
  color: #8a95a0;
}

.picker-toolbar {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
  padding: 12px 14px;
}

.picker-search {
  flex: 1;
}

.picker-toolbar-actions {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
  flex-shrink: 0;
}

.picker-action {
  min-height: 36px;
  color: #5c6b78;
  font-size: 12.5px;
  font-weight: 600;
}

.picker-list {
  padding: 0;
  min-height: 260px;
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
  gap: 12px;
  padding: 12px 14px;
  cursor: pointer;
  transition: background 0.12s ease;
  border-bottom: 1px solid #f2f4f6;
  -webkit-tap-highlight-color: transparent;
}

.picker-item:last-child {
  border-bottom: none;
}

.picker-item.is-selected {
  background: #eef4fb;
}

.picker-avatar {
  width: 34px;
  height: 34px;
  min-width: 34px;
  border-radius: 50%;
  background: #e2e7ec;
  color: #4a5763;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11.5px;
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
  font-size: 13px;
  font-weight: 600;
  color: #1a2332;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.picker-meta {
  margin-top: 2px;
  font-size: 11.5px;
  color: #97a1a9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.picker-badge {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.3px;
  flex-shrink: 0;
}

.picker-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 60px 20px;
  color: #b3bcc4;
  font-size: 13px;
  text-align: center;
}

.picker-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  padding-bottom: max(12px, env(safe-area-inset-bottom));
}

.picker-count {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 600;
  color: #5c6b78;
  min-width: 0;
}

.picker-count span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

/* =========================================================
   >= 600px
========================================================= */
@media (min-width: 600px) {
  .form-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .form-block {
    padding: 12px 16px 14px;
  }

  .form-block--docs {
    padding: 16px 16px 20px;
  }

  .form-empty {
    min-height: 360px;
    padding: 32px 24px;
  }

  .existing-doc-actions {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .picker-header,
  .picker-footer {
    padding: 18px 22px;
  }

  .picker-toolbar {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 14px 22px;
  }

  .picker-item {
    padding: 12px 22px;
  }

  .picker-list {
    max-height: 45vh;
  }

  .state-box {
    min-height: 360px;
    padding: 40px 24px;
  }
}

/* =========================================================
   >= 900px
========================================================= */
@media (min-width: 900px) {
  .page-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
  }

  .page-header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .page-header-actions .btn-primary {
    grid-column: auto;
    order: 0;
  }

  .btn-ghost,
  .btn-secondary,
  .btn-primary {
    min-height: 42px;
  }

  .btn-primary--sm {
    min-height: 34px;
  }
}

/* =========================================================
   >= 1024px
========================================================= */
@media (min-width: 1024px) {
  .roster {
    max-height: none;
  }

  .form-grid :deep(.q-field__control) {
    min-height: 40px;
  }

  .form-grid :deep(.q-field__native),
  .form-grid :deep(.q-field__input),
  .picker-search :deep(.q-field__native) {
    font-size: inherit;
  }

  .add-btn,
  .roster-remove,
  .apply-all,
  .picker-close,
  .doc-action {
    min-width: 0;
    min-height: 0;
  }

  /* Match the rest of the desktop form density */
  .field-toggle {
    min-height: 40px;
  }
}

/* =========================================================
   GAWAD — auto-fitting field grid
   Fields flow into as many columns as fit, each between 260px
   (never too narrow) and an equal share of the row (never too
   wide): 1 column on phones, 2 on tablets, 3 on wide screens.
   Long fields (span 2) still take a full row.
========================================================= */
.form-grid.form-grid--auto {
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr));
}

/* =========================================================
   Hover only where a real pointer exists
========================================================= */
@media (hover: hover) and (pointer: fine) {
  .btn-secondary:hover {
    background: #f7f8f9;
    border-color: #c2cad0;
  }

  .add-btn:hover {
    color: #1a2332;
    background: #eef1f4;
  }

  .roster-item:hover {
    background: #f5f6f7;
  }

  .roster-item.is-active:hover {
    background: #eef1f4;
  }

  .roster-remove:hover {
    color: #c0392b;
  }

  .apply-all:hover {
    color: #2b3a4a;
  }

  .doc-action:hover {
    color: #2b3a4a;
    background: #eef1f4;
  }

  .picker-item:hover {
    background: #f7f8f9;
  }

  .picker-item.is-selected:hover {
    background: #eef4fb;
  }

  .section-action:hover {
    background: #dde3e8;
  }

  .repeatable-add:hover {
    background: #dde3e8;
  }

  .repeatable-remove:hover {
    color: #c0392b;
    background: #fbe9e9;
  }
}

/* =========================================================
   Accessibility
========================================================= */
.roster-item:focus-visible,
.picker-item:focus-visible {
  outline: 2px solid #e8911a;
  outline-offset: -2px;
}

@media (prefers-reduced-motion: reduce) {
  .roster-item,
  .picker-item {
    transition: none;
  }
}

/* =========================================================
   Desktop: page fills the window
========================================================= */
@media (min-width: 1024px) {
  .create-page {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .create-page > * {
    flex-shrink: 0;
  }

  .create-page > .layout-fill {
    flex: 1 1 0;
    min-height: 0;
  }
}
</style>
