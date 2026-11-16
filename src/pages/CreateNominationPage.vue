<template>
  <q-page class="create-page" :style-fn="pageStyleFn">
    <!-- PAGE HEADER -->
    <section class="page-header">
      <div class="page-header-text">
        <div class="page-eyebrow">Achievements</div>
        <h5>{{ headerTitle }}</h5>
        <p>{{ headerSubtitle }}</p>
      </div>

      <div
        v-if="!isEditMode || (!isLoading && !loadError)"
        class="page-header-actions"
      >
        <q-btn flat no-caps label="Cancel" class="btn-ghost" @click="goBack" />

        <q-btn
          flat
          no-caps
          label="Save Draft"
          class="btn-secondary"
          :loading="nominationStore.isLoading"
          :disable="!canSaveDraft"
          @click="saveNomination('draft')"
        >
          <q-tooltip v-if="!canSaveDraft"
            >Select a type and category, then add at least one
            nominee</q-tooltip
          >
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
          <q-tooltip v-if="!canSubmit"
            >Complete all required fields, supporting documents, and the signed
            form for every nominee</q-tooltip
          >
        </q-btn>
      </div>
    </section>

    <!-- LOADING -->
    <div v-if="isEditMode && isLoading" class="state-box">
      <q-spinner-dots color="primary" size="42px" />
      <div class="state-text">Loading nomination…</div>
    </div>

    <!-- ERROR -->
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

    <!-- FORM -->
    <template v-else>
      <p v-if="!canSubmit && nominationType" class="submit-hint">
        <q-icon name="info" size="14px" />
        Complete all required fields, supporting documents, and the signed form
        for every nominee to submit.
      </p>

      <q-banner v-if="!officeName" dense class="banner banner--error">
        <template #avatar>
          <q-icon name="error_outline" size="20px" />
        </template>
        No office is assigned to this account, so nominations cannot be created.
        Please contact the system administrator.
      </q-banner>

      <!-- AGENCY INFO MISSING (only blocks national awards) -->
      <q-banner
        v-if="isNationalAward && agencyStore.loaded && !agencyStore.hasAnyData"
        dense
        class="banner banner--error"
      >
        <template #avatar>
          <q-icon name="error_outline" size="20px" />
        </template>
        Agency officials (Agency Head, PRAISE Chairperson, HRMO, Regional Office
        Head) are not configured. Please complete the
        <strong>Agency Information</strong> page before creating national award
        nominations.
      </q-banner>

      <TwoColumnLayout class="layout-fill">
        <!-- LEFT — SETUP -->
        <template #left>
          <div class="left-panel">
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
                  class="step-select"
                  @update:model-value="onGroupChange"
                />
              </div>
            </div>

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
                  class="step-select"
                  @update:model-value="onCategoryChange"
                >
                  <template #option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section>
                        <q-item-label>{{ scope.opt.label }}</q-item-label>
                        <q-item-label v-if="scope.opt.caption" caption>{{
                          scope.opt.caption
                        }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
                <div v-if="typeMeta" class="step-hint">
                  <q-icon name="info" size="12px" />
                  <span v-if="nomineeType === 'office'"
                    >Form {{ typeMeta.form }} — one record for your
                    office.</span
                  >
                  <span v-else
                    >Form {{ typeMeta.form }} — {{ typeMeta.hint }}.</span
                  >
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

            <div v-if="showModeToggle" class="panel-step">
              <div class="step-index">3</div>
              <div class="step-body">
                <div class="step-label">Nomination Mode</div>
                <q-btn-toggle
                  :model-value="nominationMode"
                  no-caps
                  unelevated
                  spread
                  toggle-color="blue-grey-9"
                  color="grey-3"
                  text-color="blue-grey-8"
                  class="step-toggle"
                  :options="modeOptions"
                  :disable="isReadOnly"
                  @update:model-value="onModeChange"
                />
                <div class="step-hint">
                  <q-icon name="info" size="12px" />
                  <span v-if="nominationMode === 'group'"
                    >A Team Leader plus up to four (4) Team Members.</span
                  >
                  <span v-else>A single individual nominee.</span>
                </div>
              </div>
            </div>

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

            <div class="panel-step">
              <div class="step-index">{{ officeStepNum }}</div>
              <div class="step-body">
                <div class="step-label">Nominating Office</div>
                <div class="office-chip">
                  <q-icon name="business" size="16px" />
                  <span>{{ officeName || "No office assigned" }}</span>
                  <q-icon name="lock" size="13px" class="chip-lock" />
                </div>
              </div>
            </div>

            <div class="panel-step panel-step--last">
              <div class="step-index">{{ nomineeStepNum }}</div>
              <div class="step-body step-body--flex">
                <div class="step-header">
                  <div class="step-label step-label--inline">
                    <template v-if="isNationalAward">
                      {{
                        isGroupNomination
                          ? `Team Members (${nationalAwardNominees.length}/${NOMINEES_MAX_ROWS})`
                          : "Nominee"
                      }}
                    </template>
                    <template v-else-if="nomineeType === 'office'"
                      >Office Nominee</template
                    >
                    <template v-else>Employees ({{ entries.length }})</template>
                  </div>
                  <q-btn
                    v-if="canAddNomineeFromPanel"
                    flat
                    dense
                    round
                    icon="add"
                    size="sm"
                    class="add-btn"
                    aria-label="Add nominee"
                    @click="openAddNomineeFlow"
                  >
                    <q-tooltip>{{ addNomineeTooltip }}</q-tooltip>
                  </q-btn>
                </div>

                <!-- NATIONAL AWARDS -->
                <template v-if="isNationalAward">
                  <div v-if="!nominationType" class="empty-hint">
                    Select a nomination type and category above to start.
                  </div>
                  <div
                    v-else-if="nationalAwardNominees.length === 0"
                    class="empty-hint"
                  >
                    <template v-if="isGroupNomination">
                      No team yet. Click <q-icon name="add" size="11px" /> to
                      add the <strong>Team Leader</strong> first.
                    </template>
                    <template v-else>
                      No nominee yet. Click <q-icon name="add" size="11px" /> to
                      pick a nominee from <strong>{{ officeName }}</strong
                      >.
                    </template>
                  </div>
                  <div v-else class="roster roster--team">
                    <div
                      v-for="(nom, idx) in nationalAwardNominees"
                      :key="`na-${idx}`"
                      class="roster-item"
                      :class="{
                        'is-active': activeNomineeRowIndex === idx,
                        'is-leader': isGroupNomination && idx === 0,
                      }"
                      role="button"
                      tabindex="0"
                      @click="selectNomineeRow(idx)"
                      @keydown.enter.self="selectNomineeRow(idx)"
                      @keydown.space.self.prevent="selectNomineeRow(idx)"
                    >
                      <div class="roster-avatar">
                        <template v-if="nom.full_name">{{
                          getInitials(nom.full_name)
                        }}</template>
                        <q-icon
                          v-else
                          :name="
                            isGroupNomination && idx === 0
                              ? 'star'
                              : 'person_outline'
                          "
                          size="16px"
                        />
                      </div>
                      <div class="roster-info">
                        <div class="roster-name">
                          <span
                            v-if="isGroupNomination && idx === 0"
                            class="roster-badge roster-badge--leader"
                            >Leader</span
                          >
                          <span
                            v-else-if="isGroupNomination"
                            class="roster-badge roster-badge--member"
                            >#{{ idx }}</span
                          >
                          <span class="roster-name-text">{{
                            nomineeRosterName(nom, idx)
                          }}</span>
                        </div>
                        <div class="roster-meta">
                          {{ nom.position || "No position set" }}
                        </div>
                      </div>
                      <q-icon
                        :name="
                          isNomineeRowComplete(nom)
                            ? 'check_circle'
                            : 'radio_button_unchecked'
                        "
                        class="roster-status"
                        :class="
                          isNomineeRowComplete(nom)
                            ? 'is-complete'
                            : 'is-incomplete'
                        "
                        size="16px"
                      />
                      <q-btn
                        v-if="canRemoveNomineeRow(idx)"
                        flat
                        dense
                        round
                        icon="close"
                        size="xs"
                        class="roster-remove"
                        aria-label="Remove"
                        @click.stop="removeNomineeRow(idx)"
                      >
                        <q-tooltip>Remove</q-tooltip>
                      </q-btn>
                    </div>
                    <div
                      v-if="
                        isGroupNomination &&
                        nationalAwardNominees.length < NOMINEES_MAX_ROWS
                      "
                      class="roster-add-slot"
                      role="button"
                      tabindex="0"
                      @click="openAddNomineeFlow"
                      @keydown.enter.self="openAddNomineeFlow"
                      @keydown.space.self.prevent="openAddNomineeFlow"
                    >
                      <q-icon name="add" size="16px" />
                      <span>Add Team Member</span>
                    </div>
                  </div>
                </template>

                <!-- LEGACY TYPES -->
                <template v-else>
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
                          {{ entryDisplayName(entry, index) }}
                        </div>
                        <div class="roster-meta">
                          {{ entryDisplayMeta(entry) }}
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
                          isEntryComplete(entry)
                            ? 'is-complete'
                            : 'is-incomplete'
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
                </template>
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
              <!-- SECTION NAVIGATOR -->
              <div v-if="navSections.length >= 3" class="section-nav-sticky">
                <nav class="section-nav" aria-label="Form sections">
                  <div class="section-nav-title">
                    <span class="section-nav-label">Sections</span>
                    <span class="section-nav-count"
                      >{{ navSections.filter((s) => s.complete).length }} of
                      {{ navSections.filter((s) => s.total > 0).length }}
                      complete</span
                    >
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

              <!-- AGENCY OFFICIALS PANEL (read-only, national awards only) -->
              <div
                v-if="isNationalAward && agencyStore.loaded"
                class="form-block form-block--agency"
              >
                <div class="form-block-head">
                  <span class="section-badge">
                    <q-icon name="account_balance" size="12px" />
                  </span>
                  <div class="form-section-title flush">Agency Officials</div>
                  <div class="form-block-hint">
                    <q-icon name="lock" size="12px" />
                    Pulled from Agency Information. Update them there to change.
                  </div>
                </div>
                <div class="form-grid">
                  <LabeledField
                    v-for="official in agencyOfficialsList"
                    :key="official.key"
                    :label="official.label"
                    class="col-span-2"
                  >
                    <q-input
                      :model-value="official.display"
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

              <!-- EMPLOYEE / OFFICE INFO (legacy) -->
              <template v-if="!isGawad && !isNationalAward">
                <template v-if="!currentEntry.is_office">
                  <div class="form-block" id="sec-employee">
                    <div class="form-block-head">
                      <span
                        class="section-badge"
                        :class="{
                          'is-complete': isSectionComplete('sec-employee'),
                        }"
                      >
                        <q-icon
                          v-if="isSectionComplete('sec-employee')"
                          name="check"
                          size="13px"
                        />
                        <template v-else>{{
                          sectionNumber("sec-employee")
                        }}</template>
                      </span>
                      <span
                        v-if="sectionProgressLabel('sec-employee')"
                        class="section-progress"
                        :class="{
                          'is-complete': isSectionComplete('sec-employee'),
                        }"
                        >{{ sectionProgressLabel("sec-employee") }}</span
                      >
                      <div class="form-section-title flush">
                        Employee Information
                      </div>
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
                  </div>

                  <div
                    class="form-block"
                    id="sec-contact"
                    :class="{ 'is-complete': isSectionComplete('sec-contact') }"
                  >
                    <div class="form-block-head">
                      <span
                        class="section-badge"
                        :class="{
                          'is-complete': isSectionComplete('sec-contact'),
                        }"
                      >
                        <q-icon
                          v-if="isSectionComplete('sec-contact')"
                          name="check"
                          size="13px"
                        />
                        <template v-else>{{
                          sectionNumber("sec-contact")
                        }}</template>
                      </span>
                      <span
                        v-if="sectionProgressLabel('sec-contact')"
                        class="section-progress"
                        :class="{
                          'is-complete': isSectionComplete('sec-contact'),
                        }"
                        >{{ sectionProgressLabel("sec-contact") }}</span
                      >
                      <div class="form-section-title flush">
                        Contact Information
                        <span class="req-badge">Required</span>
                      </div>
                    </div>
                    <div class="form-grid">
                      <LabeledField
                        label="Mobile No. (e.g. 09171234567)"
                        class="col-span-2"
                      >
                        <q-input
                          v-model="currentEntry.mobile_no"
                          outlined
                          dense
                          inputmode="numeric"
                          maxlength="11"
                          :readonly="isReadOnly"
                          :class="{ 'readonly-input': isReadOnly }"
                          :rules="[mobileRule]"
                        />
                      </LabeledField>
                    </div>
                  </div>
                </template>
                <div v-else class="form-block" id="sec-office">
                  <div class="form-block-head">
                    <span
                      class="section-badge"
                      :class="{
                        'is-complete': isSectionComplete('sec-office'),
                      }"
                    >
                      <q-icon
                        v-if="isSectionComplete('sec-office')"
                        name="check"
                        size="13px"
                      />
                      <template v-else>{{
                        sectionNumber("sec-office")
                      }}</template>
                    </span>
                    <span
                      v-if="sectionProgressLabel('sec-office')"
                      class="section-progress"
                      :class="{
                        'is-complete': isSectionComplete('sec-office'),
                      }"
                      >{{ sectionProgressLabel("sec-office") }}</span
                    >
                    <div class="form-section-title flush">
                      Office Information
                    </div>
                  </div>
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
                </div>
              </template>

              <!-- DYNAMIC SECTIONS -->
              <div
                v-for="(section, sIdx) in displaySections"
                :key="section.title"
                :id="'sec-' + sIdx"
                class="form-block"
                :class="{ 'is-complete': isSectionComplete('sec-' + sIdx) }"
              >
                <div class="form-block-head">
                  <span
                    class="section-badge"
                    :class="{ 'is-complete': isSectionComplete('sec-' + sIdx) }"
                  >
                    <q-icon
                      v-if="isSectionComplete('sec-' + sIdx)"
                      name="check"
                      size="13px"
                    />
                    <template v-else>{{
                      sectionNumber("sec-" + sIdx)
                    }}</template>
                  </span>
                  <span
                    v-if="sectionProgressLabel('sec-' + sIdx)"
                    class="section-progress"
                    :class="{ 'is-complete': isSectionComplete('sec-' + sIdx) }"
                    >{{ sectionProgressLabel("sec-" + sIdx) }}</span
                  >
                  <div class="form-section-title flush">
                    {{ section.title }}
                  </div>
                  <div
                    v-if="
                      (section.action && !isReadOnly) ||
                      sectionHasApplyAll(section)
                    "
                    class="form-block-actions"
                  >
                    <div
                      v-if="sectionHasApplyAll(section)"
                      class="form-block-hint form-block-hint--inline"
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
                  <div v-if="section.hint" class="form-block-hint">
                    <q-icon name="info" size="12px" />
                    {{ section.hint }}
                  </div>
                </div>

                <div class="form-grid" :class="{ 'form-grid--auto': isGawad }">
                  <template v-for="field in section.fields" :key="field.key">
                    <!-- REPEATABLE BLOCK -->
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
                        <div class="repeatable-head-actions">
                          <q-btn
                            v-if="
                              canAddRepeatableRow(field) &&
                              fieldSupportsDirectory(field)
                            "
                            flat
                            dense
                            no-caps
                            size="sm"
                            icon="person_search"
                            label="Add from Directory"
                            class="repeatable-add"
                            @click="openNomineePicker(field.key, -1)"
                          >
                            <q-tooltip>{{
                              isGroupNomination
                                ? "Pick an employee from any office to add a new row"
                                : "Pick an employee from your office"
                            }}</q-tooltip>
                          </q-btn>
                          <q-btn
                            v-if="canAddRepeatableRow(field)"
                            flat
                            dense
                            no-caps
                            size="sm"
                            icon="add"
                            :label="addRowLabel(field)"
                            class="repeatable-add"
                            @click="addRepeatableRow(field)"
                          />
                        </div>
                      </div>

                      <div
                        v-for="(row, rowIdx) in repeatableRows(field)"
                        :key="`${field.key}-${rowIdx}`"
                        class="repeatable-row"
                        :class="{
                          'is-focused':
                            field.key === 'nominees' &&
                            isNationalAward &&
                            activeNomineeRowIndex === rowIdx,
                        }"
                        :data-nominee-row="
                          field.key === 'nominees' && isNationalAward
                            ? rowIdx
                            : undefined
                        "
                        @click="onRepeatableRowClick(field, rowIdx)"
                      >
                        <div class="repeatable-row-head">
                          <span class="repeatable-row-num">
                            <q-icon name="drag_indicator" size="13px" />
                            {{ nomineeRowTitle(field, rowIdx) }}
                          </span>
                          <div class="repeatable-row-actions">
                            <q-btn
                              v-if="
                                !isReadOnly && fieldSupportsDirectory(field)
                              "
                              flat
                              dense
                              no-caps
                              size="sm"
                              icon="person_search"
                              label="Select from Directory"
                              class="repeatable-row-action"
                              @click.stop="openNomineePicker(field.key, rowIdx)"
                            >
                              <q-tooltip
                                >Fill this row from the employee
                                directory</q-tooltip
                              >
                            </q-btn>
                            <q-btn
                              v-if="
                                !isReadOnly && canRemoveRepeatableRow(field)
                              "
                              flat
                              dense
                              round
                              size="sm"
                              icon="delete_outline"
                              class="repeatable-remove"
                              aria-label="Remove entry"
                              @click.stop="removeRepeatableRow(field, rowIdx)"
                            >
                              <q-tooltip>Remove this entry</q-tooltip>
                            </q-btn>
                          </div>
                        </div>

                        <!-- Row fields -->
                        <div
                          class="form-grid repeatable-row-grid"
                          :class="rowGridClass(field)"
                        >
                          <LabeledField
                            v-for="sub in visibleRowFields(field, row)"
                            :key="sub.key"
                            :label="sub.label"
                            :class="{ 'col-span-2': sub.span === 2 }"
                          >
                            <!-- TEXTAREA / ESSAY -->
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
                                :readonly="rowFieldLocked(field, sub, row)"
                                :class="{
                                  'readonly-input': rowFieldLocked(
                                    field,
                                    sub,
                                    row
                                  ),
                                }"
                                :rules="[requiredRule(sub)]"
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

                            <!-- SELECT -->
                            <q-select
                              v-else-if="sub.kind === 'select'"
                              v-model="row[sub.key]"
                              outlined
                              dense
                              emit-value
                              map-options
                              :options="sub.options || []"
                              :readonly="rowFieldLocked(field, sub, row)"
                              :class="{
                                'readonly-input': rowFieldLocked(
                                  field,
                                  sub,
                                  row
                                ),
                              }"
                              :rules="[requiredRule(sub)]"
                            />

                            <!-- TOGGLE -->
                            <q-btn-toggle
                              v-else-if="sub.kind === 'toggle'"
                              v-model="row[sub.key]"
                              no-caps
                              unelevated
                              spread
                              toggle-color="blue-grey-9"
                              color="grey-3"
                              text-color="blue-grey-8"
                              class="step-toggle field-toggle"
                              :options="sub.options || []"
                              :disable="isReadOnly"
                            />

                            <!-- DERIVED -->
                            <q-input
                              v-else-if="sub.kind === 'derived'"
                              :model-value="sub.derive(row)"
                              outlined
                              dense
                              readonly
                              class="readonly-input"
                            >
                              <template #append>
                                <q-icon
                                  name="lock"
                                  size="13px"
                                  class="lock-icon"
                                />
                              </template>
                            </q-input>

                            <!-- DEFAULT -->
                            <q-input
                              v-else
                              v-model="row[sub.key]"
                              outlined
                              dense
                              :type="inputType(sub)"
                              :inputmode="sub.inputmode"
                              :maxlength="sub.maxlength"
                              :readonly="rowFieldLocked(field, sub, row)"
                              :class="{
                                'readonly-input': rowFieldLocked(
                                  field,
                                  sub,
                                  row
                                ),
                              }"
                              :rules="[requiredRule(sub)]"
                            >
                              <template
                                v-if="
                                  rowFieldLocked(field, sub, row) && !isReadOnly
                                "
                                #append
                              >
                                <q-icon
                                  name="lock"
                                  size="13px"
                                  class="lock-icon"
                                />
                              </template>
                            </q-input>
                          </LabeledField>
                        </div>

                        <!-- PER-NOMINEE SUPPORTING DOCUMENTS -->
                        <q-expansion-item
                          v-if="field.rowDocs && field.rowDocs.length"
                          dense
                          class="row-docs"
                        >
                          <template #header>
                            <q-item-section avatar>
                              <q-icon name="folder_open" size="16px" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label class="row-docs-title">{{
                                rowDocsTitle(field, rowIdx)
                              }}</q-item-label>
                            </q-item-section>
                            <q-item-section side>
                              <q-badge
                                class="row-docs-badge"
                                :color="
                                  rowDocsCount(field, row).done ===
                                  rowDocsCount(field, row).total
                                    ? 'positive'
                                    : 'orange-8'
                                "
                                :label="`${rowDocsCount(field, row).done}/${
                                  rowDocsCount(field, row).total
                                } attached`"
                              />
                            </q-item-section>
                          </template>
                          <div class="row-docs-body">
                            <div
                              class="form-grid form-grid--docs form-grid--rowdocs"
                            >
                              <LabeledField
                                v-for="doc in field.rowDocs"
                                :key="doc.key"
                                :label="doc.label"
                                class="col-span-2"
                              >
                                <q-file
                                  :model-value="getRowDoc(row, doc.key)"
                                  outlined
                                  dense
                                  :accept="doc.accept"
                                  :max-file-size="MAX_FILE_SIZE"
                                  :disable="isReadOnly"
                                  @update:model-value="
                                    (file) => setRowDoc(row, doc.key, file)
                                  "
                                  @rejected="onFileRejected"
                                >
                                  <template #prepend>
                                    <q-icon :name="doc.icon" />
                                  </template>
                                </q-file>
                                <div
                                  v-if="getExistingRowDoc(row, doc.key)"
                                  class="existing-doc-actions"
                                >
                                  <div class="existing-doc-name">
                                    <q-icon name="attach_file" size="12px" />
                                    <span>{{
                                      getExistingRowDoc(row, doc.key).name
                                    }}</span>
                                  </div>
                                </div>
                              </LabeledField>
                            </div>
                          </div>
                        </q-expansion-item>
                      </div>

                      <div
                        v-if="repeatableRows(field).length === 0"
                        class="repeatable-empty"
                      >
                        <q-icon name="playlist_add" size="20px" />
                        <span
                          >Click <strong>{{ addRowLabel(field) }}</strong> to
                          start.</span
                        >
                      </div>
                    </div>

                    <!-- REGULAR FIELD -->
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
                        :readonly="fieldLocked(field)"
                        :class="{ 'readonly-input': fieldLocked(field) }"
                        :rules="fieldRules(field)"
                        @filter="
                          (val, update) => filterSelect(val, update, field)
                        "
                        @update:model-value="onFieldSelect(field)"
                      >
                        <template v-if="showApplyAll(field)" #append>
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
                            <q-tooltip
                              >Apply to all
                              {{ entries.length }} nominees</q-tooltip
                            >
                          </q-btn>
                        </template>
                      </q-select>

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
                        />
                      </template>

                      <q-input
                        v-else-if="field.kind === 'derived'"
                        :model-value="field.derive(currentEntry.data)"
                        outlined
                        dense
                        readonly
                        class="readonly-input"
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
                          :readonly="fieldLocked(field)"
                          :class="{ 'readonly-input': fieldLocked(field) }"
                          :rules="fieldRules(field)"
                        >
                          <template v-if="showApplyAll(field)" #append>
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
                              <q-tooltip
                                >Apply to all
                                {{ entries.length }} nominees</q-tooltip
                              >
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
                        <template v-if="showApplyAll(field)" #append>
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
                            <q-tooltip
                              >Apply to all
                              {{ entries.length }} nominees</q-tooltip
                            >
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

              <!-- SIGNED FORM (NEW — required before submit) -->
              <div
                v-if="requiresSignedForm"
                id="sec-signed"
                class="form-block form-block--signed"
                :class="{ 'is-complete': isSectionComplete('sec-signed') }"
              >
                <div class="form-block-head">
                  <span
                    class="section-badge"
                    :class="{ 'is-complete': isSectionComplete('sec-signed') }"
                  >
                    <q-icon
                      v-if="isSectionComplete('sec-signed')"
                      name="check"
                      size="13px"
                    />
                    <template v-else>{{
                      sectionNumber("sec-signed")
                    }}</template>
                  </span>
                  <span
                    v-if="sectionProgressLabel('sec-signed')"
                    class="section-progress"
                    :class="{ 'is-complete': isSectionComplete('sec-signed') }"
                    >{{ sectionProgressLabel("sec-signed") }}</span
                  >
                  <div class="form-section-title flush">
                    Signed Form <span class="req-badge">Required</span>
                  </div>
                  <div class="form-block-hint">
                    <q-icon name="edit_document" size="12px" />
                    Signed hard copy of this nomination. Required before
                    submitting.
                  </div>
                </div>
                <div class="form-grid form-grid--docs">
                  <LabeledField
                    v-for="key in signedFormKeys"
                    :key="key"
                    :label="signedFormLabel(key)"
                    class="col-span-2"
                  >
                    <q-file
                      :model-value="signedForms[key]"
                      outlined
                      dense
                      accept=".pdf,.jpg,.jpeg,.png"
                      :max-file-size="MAX_FILE_SIZE"
                      :hint="signedFormHintFor(key)"
                      :disable="isReadOnly"
                      @update:model-value="(f) => setSignedForm(key, f)"
                      @rejected="onFileRejected"
                    >
                      <template #prepend>
                        <q-icon name="edit_document" />
                      </template>
                    </q-file>

                    <div
                      v-if="existingSignedDocs[key] && !signedForms[key]"
                      class="existing-doc-actions"
                    >
                      <div class="existing-doc-name">
                        <q-icon name="verified" size="12px" />
                        <span>{{ existingSignedDocs[key].name }}</span>
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
                          :loading="viewingKey === key"
                          @click="viewSignedForm(key)"
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
                          :loading="downloadingKey === key"
                          @click="downloadSignedForm(key)"
                        >
                          <q-tooltip>Save to your device</q-tooltip>
                        </q-btn>
                      </div>
                    </div>
                  </LabeledField>
                </div>
              </div>

              <!-- WHOLE-NOMINATION SUPPORTING DOCUMENTS -->
              <div
                v-if="visibleEntryDocs.length"
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
                  <span
                    v-if="sectionProgressLabel('sec-docs')"
                    class="section-progress"
                    :class="{ 'is-complete': isSectionComplete('sec-docs') }"
                    >{{ sectionProgressLabel("sec-docs") }}</span
                  >
                  <div class="form-section-title flush">
                    Supporting Documents
                    <span class="req-badge">Required</span>
                  </div>
                  <div class="form-block-hint">
                    <q-icon name="groups" size="12px" />
                    Whole-nomination documents — one per nomination.
                  </div>
                </div>
                <div class="form-grid form-grid--docs">
                  <LabeledField
                    v-for="doc in visibleEntryDocs"
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

    <!-- EMPLOYEE PICKER (legacy) -->
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
              <div class="picker-avatar">{{ getInitials(emp.full_name) }}</div>
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

    <!-- NOMINATOR PICKER -->
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
              <div class="picker-avatar">{{ getInitials(emp.full_name) }}</div>
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

    <!-- NOMINEE PICKER -->
    <q-dialog
      v-model="showNomineePickerDialog"
      persistent
      :maximized="$q.screen.lt.sm"
    >
      <q-card class="picker-dialog">
        <q-card-section class="picker-header">
          <div>
            <div class="picker-title">{{ nomineePickerTitle }}</div>
            <div class="picker-subtitle">
              <template v-if="isGroupNomination"
                >Pick an employee from any office to fill the row</template
              >
              <template v-else
                >Employees of <strong>{{ officeName }}</strong></template
              >
            </div>
          </div>
          <q-btn
            flat
            round
            dense
            icon="close"
            class="picker-close"
            aria-label="Close"
            @click="closeNomineePicker"
          />
        </q-card-section>
        <q-separator />
        <q-card-section class="picker-toolbar picker-toolbar--stack">
          <q-select
            v-if="isGroupNomination"
            :model-value="nomineePickerOffice"
            outlined
            dense
            emit-value
            map-options
            clearable
            :options="officeOptions"
            :loading="!nomineePickerOfficesLoaded"
            placeholder="Select office"
            class="picker-office-select"
            @update:model-value="onNomineePickerOfficeChange"
          >
            <template #prepend>
              <q-icon name="business" size="18px" />
            </template>
          </q-select>
          <q-input
            v-model="nomineePickerSearch"
            outlined
            dense
            clearable
            :disable="!nomineePickerOffice"
            placeholder="Search by name, position or control no."
            class="picker-search"
          >
            <template #prepend>
              <q-icon name="search" size="18px" />
            </template>
          </q-input>
        </q-card-section>
        <q-separator />
        <q-card-section class="picker-list">
          <div v-if="!nomineePickerOffice" class="picker-center">
            <q-icon name="arrow_upward" size="28px" />
            <div>Select an office above to see its employees.</div>
          </div>
          <div v-else-if="nomineePickerLoading" class="picker-center">
            <q-spinner-dots color="primary" size="34px" />
          </div>
          <div
            v-else-if="!filteredNomineePickerEmployees.length"
            class="picker-center"
          >
            <q-icon name="search_off" size="28px" />
            <div>
              {{
                nomineePickerSearch
                  ? "No employees match your search."
                  : "No employees found for this office."
              }}
            </div>
          </div>
          <div v-else class="picker-items">
            <div
              v-for="emp in filteredNomineePickerEmployees"
              :key="emp.ControlNo"
              class="picker-item"
              role="button"
              tabindex="0"
              @click="selectNomineeFromPicker(emp)"
              @keydown.enter.self="selectNomineeFromPicker(emp)"
              @keydown.space.self.prevent="selectNomineeFromPicker(emp)"
            >
              <q-icon name="person_add" size="18px" class="picker-lead-icon" />
              <div class="picker-avatar">{{ getInitials(emp.full_name) }}</div>
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
            <q-icon name="info" size="16px" />
            <span>Employee details are filled in from the directory.</span>
          </div>
          <q-btn
            unelevated
            no-caps
            label="Close"
            class="btn-primary btn-primary--sm"
            @click="closeNomineePicker"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, nextTick, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { useUserStore } from "src/stores/userStore";
import { useNominationStore } from "src/stores/nominationStore";
import { useNominationTypeStore } from "src/stores/nominationTypeStore";
import { useAgencyInformationStore } from "src/stores/agencyInformationStore";
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

/* =========================================================
   CONSTANTS
========================================================= */
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

const MODE_OPTIONS = [
  { label: "Individual", value: "individual", icon: "person" },
  { label: "Group", value: "group", icon: "groups" },
];

const GAWAD_TYPE = "gawad_parangal_kawani";

const NATIONAL_AWARD_TYPES = new Set([
  "gawad_lingkod_bayan",
  "gawad_dangal_ng_bayan",
  "gawad_pagasa",
]);

const NOMINEES_MAX_ROWS = 5;

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

/* =========================================================
   PURE HELPERS
========================================================= */
function orderIndex(order, key) {
  const i = order.findIndex((o) => String(key).toLowerCase().includes(o));
  return i === -1 ? order.length : i;
}

function sortFields(order, fields) {
  return [...fields].sort(
    (a, b) => orderIndex(order, a.key) - orderIndex(order, b.key)
  );
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
  const m = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}

function normalizeSex(value) {
  if (!value) return null;
  const v = String(value).trim().toLowerCase();
  if (v.startsWith("m")) return "male";
  if (v.startsWith("f")) return "female";
  return null;
}

function filterEmployees(list, search) {
  const q = (search || "").trim().toLowerCase();
  if (!q) return list;
  return list.filter(
    (e) =>
      (e.full_name || "").toLowerCase().includes(q) ||
      (e.Designation || "").toLowerCase().includes(q) ||
      (e.ControlNo || "").toLowerCase().includes(q)
  );
}

function ensureRowDocs(row, field) {
  if (Array.isArray(field.rowDocs) && field.rowDocs.length && !row.__docs) {
    row.__docs = {};
    field.rowDocs.forEach((d) => {
      row.__docs[d.key] = null;
    });
  }
  return row;
}

function formatOfficialName(official) {
  if (!official) return "";
  const parts = [
    official.firstName,
    official.middleName
      ? `${official.middleName.charAt(0).toUpperCase()}.`
      : "",
    official.lastName,
    official.extensionName || "",
  ].filter(Boolean);
  return parts.join(" ").trim();
}

function isFile(v) {
  if (!v) return false;
  if (typeof File !== "undefined" && v instanceof File) return true;
  return (
    typeof v === "object" &&
    Object.prototype.toString.call(v) === "[object File]"
  );
}

const NOMINEE_LOCKED_KEYS = new Set([
  "full_name",
  "sex",
  "date_of_birth",
  "age",
  "place_of_birth",
  "residential_address",
  "position",
]);

function buildEmptyRow(field) {
  const row = {};
  (field.rowFields || []).forEach((f) => {
    row[f.key] = "";
  });
  return ensureRowDocs(row, field);
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
    const agencyStore = useAgencyInformationStore();

    const officeName = ref(getStoredOffice());

    const modeOptions = MODE_OPTIONS;
    const nomineeOptions = NOMINEE_OPTIONS;

    function pageStyleFn(offset) {
      const h = offset ? `calc(100dvh - ${offset}px)` : "100dvh";
      return $q.screen.gt.sm ? { height: h } : { minHeight: h };
    }

    function notify(message, type = "negative") {
      $q.notify({ type, message, position: "top" });
    }

    function goBack() {
      router.back();
    }

    /* =========================================================
       STATE
    ========================================================= */
    const selectedGroup = ref(null);
    const nominationType = ref(null);
    const nomineeType = ref("employee");
    const nominationMode = ref("individual");
    const entries = ref([]);
    const activeEntryIndex = ref(0);
    const activeNomineeRowIndex = ref(0);
    const editingStatus = ref(null);

    const record = ref(null);
    const isLoading = ref(false);
    const loadError = ref(null);

    // ★ Signed forms — keyed by signedFormKeysFor(type)
    const signedForms = ref({});
    const existingSignedDocs = ref({});

    // Employee picker
    const employeeSearch = ref("");
    const showEmployeeDialog = ref(false);
    const employeesLoaded = ref(false);

    // Nominator picker
    const showNominatorDialog = ref(false);
    const nominatorSearch = ref("");
    const nominatorEntry = ref(null);
    const hydratingNominator = ref(false);

    // Nominee picker
    const showNomineePickerDialog = ref(false);
    const nomineePickerFieldKey = ref(null);
    const nomineePickerRowIndex = ref(-1);
    const nomineePickerOffice = ref("");
    const nomineePickerSearch = ref("");
    const nomineePickerEmployees = ref([]);
    const nomineePickerLoading = ref(false);
    const nomineePickerOfficesLoaded = ref(false);

    const viewingKey = ref(null);
    const downloadingKey = ref(null);
    const searchFilters = ref({});

    /* =========================================================
       COMPUTED — agency officials
    ========================================================= */
    const agencyOfficialsList = computed(() => {
      const o = agencyStore.officials || {};
      return [
        {
          key: "agencyHead",
          label: "Agency Head",
          display: formatOfficialName(o.agencyHead) || "—",
        },
        {
          key: "regionalOfficeHead",
          label: "Regional Office Head",
          display: formatOfficialName(o.regionalOfficeHead) || "—",
        },
        {
          key: "praiseChairperson",
          label: "PRAISE Chairperson",
          display: formatOfficialName(o.praiseChairperson) || "—",
        },
        {
          key: "highestHrmo",
          label: "Highest HRMO",
          display: formatOfficialName(o.highestHrmo) || "—",
        },
      ];
    });

    /* =========================================================
       COMPUTED — mode / status
    ========================================================= */
    const isEditMode = computed(() => !!route.params.id);
    // ★ Was: computed(() => isAwaitingHardcopy.value)
    const isReadOnly = computed(() => false);
    const isGawad = computed(() => nominationType.value === GAWAD_TYPE);
    const isNationalAward = computed(() =>
      NATIONAL_AWARD_TYPES.has(nominationType.value)
    );

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
        groupNominee: flags.groupNominee ?? false,
        applyToAll: flags.applyToAll ?? false,
        hint: flags.hint ?? "",
      };
    });

    const isGroupNomination = computed(
      () => !!typeMeta.value?.groupNominee && nominationMode.value === "group"
    );

    /* =========================================================
       COMPUTED — header
    ========================================================= */
    // ★ Simplified — removed awaiting-hardcopy branches
    const headerTitle = computed(() =>
      isEditMode.value ? "Edit Nomination" : "New Nomination"
    );

    const headerSubtitle = computed(
      () =>
        "Nominate employees or offices for an exam pass, an award, or completed graduate studies."
    );

    const submitLabel = computed(() =>
      editingStatus.value === "returned" ? "Resubmit" : "Submit for Review"
    );

    /* =========================================================
       COMPUTED — type / category options
    ========================================================= */
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

    const showNomineeToggle = computed(
      () => !!typeMeta.value?.officeNominee && !isEditMode.value
    );
    const showModeToggle = computed(
      () => !!typeMeta.value?.groupNominee && !isEditMode.value
    );
    const showAnyToggle = computed(
      () => showNomineeToggle.value || showModeToggle.value
    );
    const officeStepNum = computed(() => (showAnyToggle.value ? 4 : 3));
    const nomineeStepNum = computed(() => (showAnyToggle.value ? 5 : 4));

    /* =========================================================
       COMPUTED — form sections / docs
    ========================================================= */
    const sections = computed(() => TYPE_SECTIONS[nominationType.value] || []);
    const docsList = computed(() => TYPE_DOCS[nominationType.value] || []);

    const visibleEntryDocs = computed(() =>
      isGroupNomination.value
        ? docsList.value
        : docsList.value.filter((d) => !d.groupOnly)
    );

    const mobileRule = (v) => {
      if (isReadOnly.value) return true;
      if (!v) return "Mobile number is required";
      return (
        /^09\d{9}$/.test(v) ||
        "Enter 11 digits starting with 09 (e.g. 09171234567)"
      );
    };

    const displaySections = computed(() => {
      if (!isGawad.value) return sections.value;

      const personal = [];
      const position = [];
      const otherSections = [];

      const lockHeadNominator = (section) =>
        section.fields.map((f) => ({
          ...f,
          locked: LOCKED_HEADNOM_KEY_RE.test(f.key),
        }));

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
            fields: lockHeadNominator(section),
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
            fields: lockHeadNominator(section),
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
            entryField("mobile_no", "Contact No. (e.g. 09171234567)", {
              locked: false,
              inputmode: "numeric",
              maxlength: 11,
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

    /* =========================================================
       COMPUTED — entries / nominees
    ========================================================= */
    const currentEntry = computed(
      () => entries.value[activeEntryIndex.value] || null
    );

    const canApplyToAll = computed(
      () => !!typeMeta.value?.applyToAll && entries.value.length > 1
    );

    const nationalAwardNominees = computed(() => {
      if (!isNationalAward.value) return [];
      const list = entries.value[0]?.data?.nominees;
      return Array.isArray(list) ? list : [];
    });

    const officeEmployees = computed(() => userStore.employees || []);

    const officeOptions = computed(() =>
      (userStore.offices || [])
        .map((o) => {
          if (typeof o === "string") return { label: o, value: o };
          const name =
            o.Office || o.name || o.office_name || o.OfficeName || "";
          return { label: name, value: name };
        })
        .filter((o) => o.value)
    );

    const filteredOfficeEmployees = computed(() =>
      filterEmployees(officeEmployees.value, employeeSearch.value)
    );

    const filteredNominatorEmployees = computed(() => {
      const selectedControlNos = new Set(
        entries.value
          .filter((e) => !e.is_office && e.control_no)
          .map((e) => String(e.control_no))
      );
      const eligible = officeEmployees.value.filter(
        (e) => !selectedControlNos.has(String(e.ControlNo || ""))
      );
      return filterEmployees(eligible, nominatorSearch.value);
    });

    const filteredNomineePickerEmployees = computed(() =>
      filterEmployees(nomineePickerEmployees.value, nomineePickerSearch.value)
    );

    const nomineePickerTitle = computed(() => {
      if (!isGroupNomination.value) return "Select Nominee";
      const rowIdx = nomineePickerRowIndex.value;
      if (rowIdx === -1) {
        return nationalAwardNominees.value.length === 0
          ? "Select Team Leader"
          : "Select Team Member";
      }
      return rowIdx === 0
        ? "Change Team Leader"
        : `Change Team Member #${rowIdx}`;
    });

    /* =========================================================
       COMPUTED — section navigator / progress
    ========================================================= */
    function sectionProgress(section) {
      const data = currentEntry.value?.data || {};
      let done = 0;
      let total = 0;
      section.fields.forEach((field) => {
        if (!field.required) return;
        if (field.static || field.kind === "derived" || field.kind === "entry")
          return;
        total += 1;
        const probe =
          field.kind === "repeatable"
            ? { ...field, _isGroupMode: isGroupNomination.value }
            : field;
        if (!fieldError(probe, data[field.key])) done += 1;
      });
      return { done, total };
    }

    function docsProgress() {
      const entry = currentEntry.value;
      const required = visibleEntryDocs.value.filter((d) => !d.optional);
      const done = required.filter(
        (d) => !!entry?.docs?.[d.key] || !!entry?.existing_docs?.[d.key]
      ).length;
      return { done, total: required.length };
    }

    // ★ NEW — signed-form progress
    const signedFormKeys = computed(() =>
      nominationStore.signedFormKeysFor(nominationType.value)
    );
    const requiresSignedForm = computed(() => signedFormKeys.value.length > 0);
    const signedFormProgress = computed(() => {
      if (!requiresSignedForm.value) return { done: 0, total: 0 };
      const uploaded = signedForms.value || {};
      const existing = existingSignedDocs.value || {};
      const total = signedFormKeys.value.length;
      const done = signedFormKeys.value.filter(
        (key) => isFile(uploaded[key]) || !!existing[key]
      ).length;
      return { done, total };
    });
    const hasSignedForm = computed(() => {
      if (!requiresSignedForm.value) return true;
      return signedFormProgress.value.done === signedFormProgress.value.total;
    });

    const navSections = computed(() => {
      const entry = currentEntry.value;
      if (!entry) return [];
      const list = [];

      if (!isGawad.value && !isNationalAward.value) {
        if (entry.is_office) {
          list.push({ id: "sec-office", title: "Office", done: 0, total: 0 });
        } else {
          const phoneOk = /^09\d{9}$/.test(
            String(entry.mobile_no || "").trim()
          );
          list.push({
            id: "sec-employee",
            title: "Employee",
            done: 0,
            total: 0,
          });
          list.push({
            id: "sec-contact",
            title: "Contact",
            done: phoneOk ? 1 : 0,
            total: 1,
          });
        }
      }

      displaySections.value.forEach((section, i) => {
        list.push({
          id: `sec-${i}`,
          title: section.title,
          ...sectionProgress(section),
        });
      });

      // ★ NEW — signed-form section in the navigator
      if (requiresSignedForm.value) {
        const p = signedFormProgress.value;
        list.push({
          id: "sec-signed",
          title: "Signed Form",
          done: p.done,
          total: p.total,
        });
      }

      if (visibleEntryDocs.value.length) {
        list.push({ id: "sec-docs", title: "Documents", ...docsProgress() });
      }

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
      return sec.complete ? "Complete" : `${sec.done}/${sec.total} required`;
    };

    function scrollToSection(id) {
      nextTick(() => {
        document
          .getElementById(id)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    /* =========================================================
       COMPUTED — save / submit gating
    ========================================================= */
    const canSaveDraft = computed(() => {
      if (!officeName.value || !nominationType.value) return false;
      if (nominationStore.isLoading) return false;
      if (isNationalAward.value) {
        if (entries.value.length === 0) return false;
        return nationalAwardNominees.value.some((n) =>
          String(n?.full_name || "").trim()
        );
      }
      return entries.value.length > 0;
    });

    // ★ Added signed-form gate
    const canSubmit = computed(() => {
      if (!canSaveDraft.value) return false;
      if (!hasSignedForm.value) return false;
      return entries.value.every(
        (entry) => validateEntry(nominationType.value, entry) === null
      );
    });

    const canAddNomineeFromPanel = computed(() => {
      if (isReadOnly.value || isEditMode.value) return false;
      if (!nominationType.value) return false;
      if (isNationalAward.value) {
        return isGroupNomination.value
          ? nationalAwardNominees.value.length < NOMINEES_MAX_ROWS
          : nationalAwardNominees.value.length === 0;
      }
      if (nomineeType.value === "office") return false;
      return !!officeName.value;
    });

    const addNomineeTooltip = computed(() => {
      if (!isNationalAward.value) {
        return nomineeType.value === "office"
          ? "Office nominee is set automatically"
          : "Add employee(s)";
      }
      const count = nationalAwardNominees.value.length;
      if (!isGroupNomination.value) {
        return count >= 1
          ? "Individual nomination allows only one nominee"
          : "Add nominee";
      }
      if (count === 0) return "Add Team Leader";
      if (count >= NOMINEES_MAX_ROWS)
        return `Maximum of ${NOMINEES_MAX_ROWS} members (1 Leader + 4 Members)`;
      return "Add Team Member";
    });

    /* =========================================================
       ENTRY FACTORIES
    ========================================================= */
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

    function createNationalAwardEntry(type) {
      return {
        id: `na-${Date.now()}`,
        control_no: "",
        employee: "",
        position: "",
        mobile_no: "",
        department: officeName.value,
        employment_status: "",
        is_office: false,
        data: blankData(type),
        docs: blankDocs(type),
        existing_docs: {},
        _hydrated: true,
        _hydrating: false,
      };
    }

    function resetEntriesData(type) {
      entries.value.forEach((e) => {
        e.data = blankData(type);
        e.docs = blankDocs(type);
        e.existing_docs = {};
        e._hydrated = false;
        e._hydrating = false;
      });
    }

    function hasEnteredData() {
      return entries.value.some((e) => {
        const dataHasValue = Object.values(e.data || {}).some((v) => {
          if (Array.isArray(v)) {
            return v.some((row) =>
              Object.values(row || {}).some((rv) => String(rv || "").trim())
            );
          }
          return String(v || "").trim();
        });
        const docsHaveValue = Object.values(e.docs || {}).some(Boolean);
        const rowDocsHaveValue = Object.values(e.data || {}).some(
          (v) =>
            Array.isArray(v) &&
            v.some(
              (row) => row.__docs && Object.values(row.__docs).some(Boolean)
            )
        );
        return dataHasValue || docsHaveValue || rowDocsHaveValue;
      });
    }

    function confirmReset(title, message, apply) {
      if (!hasEnteredData()) {
        apply();
        return;
      }
      $q.dialog({ title, message, cancel: true, persistent: true }).onOk(apply);
    }

    /* =========================================================
       GROUP / TYPE / MODE HANDLERS
    ========================================================= */
    function onGroupChange(group) {
      if (isEditMode.value || isReadOnly.value) return;
      if (group === selectedGroup.value) return;
      confirmReset(
        "Change category?",
        "This will clear the current nominee data.",
        () => {
          selectedGroup.value = group;
          nominationType.value = null;
          entries.value = [];
          activeEntryIndex.value = 0;
        }
      );
    }

    function onCategoryChange(type) {
      if (isEditMode.value || isReadOnly.value) return;
      if (type === nominationType.value) return;
      confirmReset(
        "Change type?",
        "This will clear the current nominee data.",
        () => {
          nominationType.value = type;
          entries.value = [];
          activeEntryIndex.value = 0;
          signedForms.value = {};
          existingSignedDocs.value = {};
          if (NATIONAL_AWARD_TYPES.has(type)) {
            entries.value = [createNationalAwardEntry(type)];
          }
        }
      );
    }

    function onModeChange(mode) {
      if (isReadOnly.value) return;
      nominationMode.value = mode;
      if (isNationalAward.value) {
        entries.value = [createNationalAwardEntry(nominationType.value)];
        activeNomineeRowIndex.value = 0;
      }
    }

    function onNomineeTypeChange(type) {
      if (isReadOnly.value) return;
      nomineeType.value = type;
      entries.value = [];
      activeEntryIndex.value = 0;
      if (type === "office") {
        entries.value = [createOfficeEntry()];
      }
    }

    /* =========================================================
       ROW-DOC HELPERS
    ========================================================= */
    function getRowDoc(row, key) {
      return row?.__docs?.[key] || null;
    }

    function setRowDoc(row, key, file) {
      if (!row.__docs) row.__docs = {};
      row.__docs[key] = file;
    }

    function getExistingRowDoc(row, key) {
      const raw = row?.__existing_docs?.[key];
      if (!raw) return null;
      return typeof raw === "string" ? { name: raw } : raw;
    }

    /* =========================================================
       ROSTER HELPERS
    ========================================================= */
    function entryDisplayName(entry, index) {
      if (isNationalAward.value) {
        const first = entry.data?.nominees?.[0];
        if (first?.full_name) return first.full_name;
        return isGroupNomination.value
          ? "Group Nomination"
          : "Individual Nomination";
      }
      return entry.employee || `Nominee ${index + 1}`;
    }

    function entryDisplayMeta(entry) {
      if (isNationalAward.value) {
        const count = Array.isArray(entry.data?.nominees)
          ? entry.data.nominees.length
          : 0;
        return isGroupNomination.value
          ? `Group — ${count} member${count === 1 ? "" : "s"}`
          : "Individual nomination";
      }
      return entry.is_office
        ? "Office nomination"
        : entry.position || "No position set";
    }

    function nomineeRosterName(nom, idx) {
      if (nom.full_name) return nom.full_name;
      if (!isGroupNomination.value) return "Unnamed nominee";
      return idx === 0 ? "Team Leader" : `Team Member #${idx}`;
    }

    function nomineeRowTitle(field, rowIdx) {
      if (field.key !== "nominees") return `Entry ${rowIdx + 1}`;
      if (!isGroupNomination.value) return "Nominee";
      return rowIdx === 0 ? "Team Leader" : `Team Member #${rowIdx}`;
    }

    function rowDocsTitle(field, rowIdx) {
      if (field.key === "nominees" && isGroupNomination.value)
        return `${nomineeRowTitle(field, rowIdx)} — Supporting Documents`;
      return "Supporting Documents";
    }

    function isEntryComplete(entry) {
      return validateEntry(nominationType.value, entry) === null;
    }

    function isNomineeRowComplete(nom) {
      if (!nom) return false;
      const field = findRepeatableField("nominees");
      if (!field) return false;
      for (const sub of visibleRowFields(field, nom)) {
        if (sub.kind === "derived") continue;
        if (fieldError(sub, nom[sub.key])) return false;
      }
      for (const doc of field.rowDocs || []) {
        if (doc.optional) continue;
        if (doc.groupOnly && !isGroupNomination.value) continue;
        const hasNew = !!nom.__docs?.[doc.key];
        const hasExisting = !!nom.__existing_docs?.[doc.key];
        if (!hasNew && !hasExisting) return false;
      }
      return true;
    }

    function findRepeatableField(key) {
      for (const section of sections.value) {
        for (const field of section.fields) {
          if (field.kind === "repeatable" && field.key === key) return field;
        }
      }
      return null;
    }

    function canRemoveNomineeRow(idx) {
      if (isReadOnly.value || isEditMode.value) return false;
      if (!isGroupNomination.value) return false;
      return idx !== 0;
    }

    function removeNomineeRow(idx) {
      if (!canRemoveNomineeRow(idx)) {
        if (idx === 0 && isGroupNomination.value)
          notify("The Team Leader row cannot be removed.", "warning");
        return;
      }
      const arr = currentEntry.value?.data?.nominees;
      if (!Array.isArray(arr)) return;
      arr.splice(idx, 1);
      if (activeNomineeRowIndex.value >= arr.length) {
        activeNomineeRowIndex.value = Math.max(0, arr.length - 1);
      }
    }

    function selectNomineeRow(idx) {
      activeNomineeRowIndex.value = idx;
      nextTick(() => {
        const el = document.querySelector(`[data-nominee-row="${idx}"]`);
        if (el && typeof el.scrollIntoView === "function") {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    }

    function onRepeatableRowClick(field, rowIdx) {
      if (field.key !== "nominees" || !isNationalAward.value) return;
      activeNomineeRowIndex.value = rowIdx;
    }

    function openAddNomineeFlow() {
      if (!canAddNomineeFromPanel.value) return;
      if (isNationalAward.value) openNomineePicker("nominees", -1);
      else openEmployeeDialog();
    }

    /* =========================================================
       GAWAD HYDRATION
    ========================================================= */
    async function hydrateGawadEntry(entry) {
      if (!entry || !isGawad.value) return;
      if (entry.is_office || !entry.control_no) return;
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

        Object.assign(entry.data, {
          birthdate: toDateInput(d.BirthDate),
          sex: normalizeSex(d.Sexx),
          place_of_birth: d.BirthPlace || "",
          address: d.Address || "",
          email: d.Email || "",
          level: d.Grades != null ? String(d.Grades) : "",
          division_section: [d.Division, d.Section].filter(Boolean).join(" / "),
          years_in_govt_service: d.YearsInServiceText || "",
        });

        const head = d.OfficeHead;
        if (head) {
          if (!entry.data.head_name)
            entry.data.head_name = head.employee_name || "";
          if (!entry.data.head_position)
            entry.data.head_position = head.position || "";
          if (!entry.data.head_contact)
            entry.data.head_contact = head.contact_no || "";
          if (!entry.data.head_email) entry.data.head_email = head.email || "";
        }

        if (!entry.mobile_no && d.TelNo)
          entry.mobile_no = normalizePhone(d.TelNo);
        entry._hydrated = true;
      } catch (err) {
        console.error("Hydrate Gawad entry failed:", err);
      } finally {
        entry._hydrating = false;
      }
    }

    function hydrateAllGawadEntries() {
      if (!isGawad.value) return;
      entries.value.forEach((e) => hydrateGawadEntry(e));
    }

    /* =========================================================
       FIELD HELPERS / RULES
    ========================================================= */
    function optionsForField(field) {
      let list;
      if (typeof field.optionsFor === "function") {
        list = field.optionsFor(currentEntry.value?.data || {}) || [];
      } else {
        list = field.options || [];
      }
      if (field.searchable) {
        const needle = (searchFilters.value[field.key] || "")
          .trim()
          .toLowerCase();
        if (needle)
          list = list.filter((opt) =>
            String(opt.label || "")
              .toLowerCase()
              .includes(needle)
          );
      }
      return list;
    }

    function filterSelect(val, update, field) {
      searchFilters.value[field.key] = val || "";
      update(() => {});
    }

    function onFieldSelect(changedField) {
      if (isReadOnly.value) return;
      const dependents = sections.value
        .flatMap((s) => s.fields)
        .filter((f) => f.dependsOn === changedField.key);
      dependents.forEach((dep) => {
        const newOptions = optionsForField(dep);
        const current = currentEntry.value?.data?.[dep.key];
        if (current && !newOptions.some((o) => o.value === current))
          currentEntry.value.data[dep.key] = null;
      });
    }

    function fieldLocked(field) {
      if (isReadOnly.value) return true;
      if (field.static) return true;
      return !!field.locked;
    }

    function fieldRules(field) {
      return [
        (v) => {
          if (isReadOnly.value || fieldLocked(field)) return true;
          return fieldError(field, v) || true;
        },
      ];
    }

    function requiredRule(sub) {
      return (v) =>
        isReadOnly.value ||
        !sub.required ||
        String(v || "").trim() !== "" ||
        `${sub.label} is required`;
    }

    function showApplyAll(field) {
      return canApplyToAll.value && !!field.applyAll && !isReadOnly.value;
    }

    function sectionHasApplyAll(section) {
      return (
        canApplyToAll.value &&
        !isReadOnly.value &&
        section.fields.some((f) => f.applyAll)
      );
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

    function existingDocFor(doc) {
      const raw = currentEntry.value?.existing_docs?.[doc.key];
      if (!raw) return null;
      return typeof raw === "string" ? { name: raw } : raw;
    }

    function existingDocHint(doc) {
      const meta = existingDocFor(doc);
      return meta
        ? `Current file: ${meta.name}. Upload a new one to replace it.`
        : "";
    }

    function hasPendingFile(doc) {
      return isFile(currentEntry.value?.docs?.[doc.key]);
    }

    function onFileRejected() {
      notify("File rejected. Use a PDF, JPG or PNG that is 5 MB or smaller.");
    }

    /* =========================================================
       FILE VIEW / DOWNLOAD
    ========================================================= */
    async function viewFile(meta, key, label) {
      if (!meta) return;
      if (!meta.url) {
        notify(`No preview URL for ${label}.`, "warning");
        return;
      }
      viewingKey.value = key;
      try {
        const res = await api.get(meta.url, { responseType: "blob" });
        const blobUrl = URL.createObjectURL(res.data);
        window.open(blobUrl, "_blank", "noopener,noreferrer");
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
      } catch (err) {
        notify(
          err?.response?.data?.message ||
            `Unable to open ${label}. Please try again.`
        );
      } finally {
        viewingKey.value = null;
      }
    }

    async function downloadFile(meta, key, label) {
      if (!meta) return;
      const url = meta.download_url || meta.url;
      if (!url) {
        notify(`No download URL for ${label}.`, "warning");
        return;
      }
      downloadingKey.value = key;
      try {
        const res = await api.get(url, { responseType: "blob" });
        const blobUrl = URL.createObjectURL(res.data);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = meta.name || key;
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10_000);
      } catch (err) {
        notify(
          err?.response?.data?.message ||
            `Unable to download ${label}. Please try again.`
        );
      } finally {
        downloadingKey.value = null;
      }
    }

    const viewExistingDoc = (doc) =>
      viewFile(existingDocFor(doc), doc.key, "this file");
    const downloadExistingDoc = (doc) =>
      downloadFile(existingDocFor(doc), doc.key, "this file");

    // ★ Updated to accept the signed-form key
    function viewSignedForm(key = "signed_form") {
      const meta = existingSignedDocs.value[key];
      return viewFile(meta, key, "the signed form");
    }

    function downloadSignedForm(key = "signed_form") {
      const meta = existingSignedDocs.value[key];
      return downloadFile(meta, key, "the signed form");
    }

    /* =========================================================
       SIGNED FORMS (NEW)
    ========================================================= */
    function setSignedForm(key, file) {
      signedForms.value = { ...signedForms.value, [key]: file };
    }

    function signedFormLabel(key) {
      return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    }

    function signedFormHintFor(key) {
      if (signedForms.value[key])
        return "New file selected — will replace the current one on save.";
      if (existingSignedDocs.value[key])
        return "A signed form is already on file. Upload a new one to replace it.";
      return "Attach the signed form. PDF, JPG or PNG up to 5 MB.";
    }

    /* =========================================================
       EMPLOYEE PICKER (legacy, own office)
    ========================================================= */
    function isEmployeeSelected(controlNo) {
      if (!controlNo) return false;
      return entries.value.some((e) => e.control_no === controlNo);
    }

    function toggleEmployee(emp) {
      if (isReadOnly.value) return;
      const idx = entries.value.findIndex(
        (e) => e.control_no === emp.ControlNo
      );
      if (idx >= 0) {
        removeEntry(idx);
        return;
      }
      const entry = createEmployeeEntry(emp);
      entries.value.push(entry);
      activeEntryIndex.value = entries.value.length - 1;
      dropNominatorIfSamePerson(emp.ControlNo);
      hydrateGawadEntry(entry);
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
      added.forEach((e) => {
        dropNominatorIfSamePerson(e.control_no);
        hydrateGawadEntry(e);
      });
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
      hydrateGawadEntry(entries.value[index]);
    }

    async function ensureOfficeEmployees() {
      if (employeesLoaded.value) return;
      try {
        const result = await userStore.fetchEmployeesByOffice(officeName.value);
        if (!result || result.success === false)
          notify(
            result?.message || "Unable to load employees for your office."
          );
        else employeesLoaded.value = true;
      } catch (err) {
        console.error("Load employees failed:", err);
        notify("Unable to load employees for your office.");
      }
    }

    async function openOfficeDialog(dialogRef) {
      if (isReadOnly.value) return;
      if (!nominationType.value) {
        notify("Please select a nomination type and category first.");
        return;
      }
      if (!officeName.value) {
        notify("No office is assigned to this account.");
        return;
      }
      dialogRef.value = true;
      await ensureOfficeEmployees();
    }

    const openEmployeeDialog = () => openOfficeDialog(showEmployeeDialog);
    const openNominatorDialog = () => openOfficeDialog(showNominatorDialog);

    /* =========================================================
       NOMINATOR PICKER
    ========================================================= */
    function isNominatorSelected(controlNo) {
      if (!controlNo) return false;
      return nominatorEntry.value?.control_no === controlNo;
    }

    function nominatorLabel() {
      if (hydratingNominator.value) return "Loading nominator details…";
      if (!nominatorEntry.value) return "No nominator selected";
      return nominatorEntry.value.employee || "Unnamed Employee";
    }

    function writeNominatorToEntry(entry, nom) {
      entry.data.nominator_name = nom?.employee || "";
      entry.data.nominator_position = nom?.position || "";
      entry.data.nominator_phone_landline = nom?.phone_landline || "";
      entry.data.nominator_contact = nom?.mobile_no || "";
      entry.data.nominator_email = nom?.email || "";
    }

    function applyNominatorToCurrentEntry() {
      if (!currentEntry.value || !nominatorEntry.value) return;
      writeNominatorToEntry(currentEntry.value, nominatorEntry.value);
    }

    function clearNominator() {
      if (isReadOnly.value) return;
      nominatorEntry.value = null;
      if (currentEntry.value) writeNominatorToEntry(currentEntry.value, null);
    }

    function dropNominatorIfSamePerson(controlNo) {
      if (!controlNo || !nominatorEntry.value) return;
      if (String(nominatorEntry.value.control_no || "") === String(controlNo))
        clearNominator();
    }

    async function selectNominator(emp) {
      if (isReadOnly.value) return;
      const isNominee = entries.value.some(
        (e) =>
          !e.is_office &&
          String(e.control_no || "") === String(emp.ControlNo || "")
      );
      if (isNominee) {
        notify("A nominee cannot be their own nominator / technical writer.");
        return;
      }
      if (isNominatorSelected(emp.ControlNo)) {
        clearNominator();
        return;
      }

      nominatorEntry.value = {
        control_no: emp.ControlNo || "",
        employee: emp.full_name || "",
        position: emp.Designation || "",
        employment_status: emp.Status || "",
        department: emp.Office || officeName.value,
        mobile_no: normalizePhone(emp.TelNo),
        phone_landline: "",
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
          const nom = nominatorEntry.value;
          nom.position = d.Designation || nom.position;
          nom.employment_status = d.Status || nom.employment_status;
          nom.department = d.Office || nom.department;
          nom.mobile_no = normalizePhone(
            d.CellphoneNo || d.TelNo || nom.mobile_no
          );
          nom.phone_landline = d.PhoneNo || d.Phone || "";
          nom.email = d.Email || "";
          applyNominatorToCurrentEntry();
        }
      } catch (err) {
        console.error("Fetch nominator details failed:", err);
      } finally {
        hydratingNominator.value = false;
      }
    }

    function handleSectionAction(handlerName) {
      if (handlerName === "openNominatorDialog") openNominatorDialog();
    }

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

    /* =========================================================
       REPEATABLE ROWS
    ========================================================= */
    function repeatableRows(field) {
      const value = currentEntry.value?.data?.[field.key];
      return Array.isArray(value) ? value : [];
    }

    function visibleRowFields(field, row) {
      const all = field.rowFields || [];
      return all.filter((sub) => {
        if (sub.groupOnly && !isGroupNomination.value) return false;
        if (row && sub.key.endsWith("_details")) {
          const parentKey = sub.key.replace(/_details$/, "");
          if (all.some((f) => f.key === parentKey))
            return row[parentKey] === "yes";
        }
        return true;
      });
    }

    function rowDocsCount(field, row) {
      const required = (field.rowDocs || []).filter(
        (d) => !d.optional && (!d.groupOnly || isGroupNomination.value)
      );
      const done = required.filter(
        (d) => !!row?.__docs?.[d.key] || !!row?.__existing_docs?.[d.key]
      ).length;
      return { done, total: required.length };
    }

    function rowFieldLocked(field, sub, row) {
      if (isReadOnly.value) return true;
      return field.key === "nominees" && NOMINEE_LOCKED_KEYS.has(sub.key);
    }

    function rowGridClass(field) {
      if (field.key !== "accomplishments") return "";
      return isGroupNomination.value
        ? "repeatable-row-grid--three"
        : "repeatable-row-grid--two";
    }

    function fieldSupportsDirectory(field) {
      return field.key === "nominees";
    }

    function addRowLabel(field) {
      if (field.key === "nominees") {
        if (!isGroupNomination.value) return "Nominee";
        return repeatableRows(field).length === 0
          ? "Add Team Leader"
          : "Add Team Member";
      }
      return field.addLabel || "Add entry";
    }

    function canAddRepeatableRow(field) {
      if (isReadOnly.value) return false;
      if (field.key === "nominees" && !isGroupNomination.value) return false;
      const max = field.maxRows ?? Infinity;
      const effectiveMax =
        field.key === "nominees" ? Math.min(max, NOMINEES_MAX_ROWS) : max;
      return repeatableRows(field).length < effectiveMax;
    }

    function canRemoveRepeatableRow(field) {
      if (isReadOnly.value) return false;
      if (field.key === "nominees" && !isGroupNomination.value) return false;
      const rows = repeatableRows(field);
      const min = field.minRows ?? 1;
      if (field.key === "nominees" && isGroupNomination.value)
        return rows.length > min && rows.length > 1;
      return rows.length > min;
    }

    function addRepeatableRow(field) {
      if (isReadOnly.value) return;
      if (!canAddRepeatableRow(field)) {
        if (field.key === "nominees" && !isGroupNomination.value)
          notify("Switch to Group mode to add team members.", "warning");
        return;
      }
      const entry = currentEntry.value;
      if (!entry) return;
      if (!Array.isArray(entry.data[field.key])) entry.data[field.key] = [];

      entry.data[field.key].push(buildEmptyRow(field));

      if (field.key === "nominees") {
        activeNomineeRowIndex.value = entry.data[field.key].length - 1;
      }
    }

    function removeRepeatableRow(field, idx) {
      if (isReadOnly.value) return;
      if (!canRemoveRepeatableRow(field)) return;
      const arr = currentEntry.value?.data?.[field.key];
      if (!Array.isArray(arr)) return;
      arr.splice(idx, 1);
      if (
        field.key === "nominees" &&
        activeNomineeRowIndex.value >= arr.length
      ) {
        activeNomineeRowIndex.value = Math.max(0, arr.length - 1);
      }
    }

    /* =========================================================
       NOMINEE PICKER
    ========================================================= */
    async function openNomineePicker(fieldKey, rowIdx) {
      nomineePickerFieldKey.value = fieldKey;
      nomineePickerRowIndex.value = rowIdx;
      nomineePickerSearch.value = "";
      nomineePickerOffice.value = officeName.value || "";
      showNomineePickerDialog.value = true;
      if (nomineePickerOffice.value) {
        await loadNomineePickerEmployees(nomineePickerOffice.value);
      } else {
        nomineePickerEmployees.value = [];
      }
    }

    async function onNomineePickerOfficeChange(office) {
      nomineePickerOffice.value = office || "";
      nomineePickerSearch.value = "";
      if (office) await loadNomineePickerEmployees(office);
      else nomineePickerEmployees.value = [];
    }

    async function loadNomineePickerEmployees(office) {
      nomineePickerLoading.value = true;
      try {
        const { data } = await api.get(
          `/offices/${encodeURIComponent(office)}/employees`
        );
        nomineePickerEmployees.value = Array.isArray(data) ? data : [];
      } catch (err) {
        nomineePickerEmployees.value = [];
        notify("Unable to load employees for that office.");
      } finally {
        nomineePickerLoading.value = false;
        nomineePickerOfficesLoaded.value = true;
      }
    }

    function closeNomineePicker() {
      showNomineePickerDialog.value = false;
      nomineePickerFieldKey.value = null;
      nomineePickerRowIndex.value = -1;
    }

    function selectNomineeFromPicker(emp) {
      const fieldKey = nomineePickerFieldKey.value;
      const rowIdx = nomineePickerRowIndex.value;
      if (fieldKey !== "nominees") return;

      const entry = currentEntry.value;
      if (!entry) return;
      const rows = Array.isArray(entry.data.nominees)
        ? entry.data.nominees
        : (entry.data.nominees = []);
      const field = findRepeatableField("nominees");

      const rowData = buildEmptyRow(field || { rowFields: [] });
      rowData.full_name = emp.full_name || "";
      rowData.position = emp.Designation || "";
      rowData.sex = normalizeSex(emp.Sex);
      rowData.date_of_birth = toDateInput(emp.BirthDate);
      rowData.place_of_birth = emp.BirthPlace || "";
      rowData.residential_address = emp.Address || "";
      rowData.phone_landline = "";
      rowData.mobile_no = normalizePhone(emp.TelNo);
      rowData.email = emp.Email || "";
      rowData.employment_status = emp.Status || "";

      if (rowIdx === -1) {
        rows.push(rowData);
        activeNomineeRowIndex.value = rows.length - 1;
      } else {
        rows.splice(rowIdx, 1, rowData);
      }
      closeNomineePicker();
    }

    /* =========================================================
       SAVE / SUBMIT
    ========================================================= */
    function collectNomineeDocs(entry) {
      const out = {};
      const list = entry.data?.nominees;
      if (!Array.isArray(list)) return out;
      list.forEach((row, idx) => {
        if (row.__docs) {
          Object.entries(row.__docs).forEach(([key, file]) => {
            if (isFile(file)) out[`${idx}_${key}`] = file;
          });
        }
      });
      return out;
    }

    async function saveNomination(targetStatus) {
      if (!canSaveDraft.value) return;

      // ★ Collect pending signed-form uploads
      const signedForRequest = {};
      Object.entries(signedForms.value || {}).forEach(([key, file]) => {
        if (isFile(file)) signedForRequest[key] = file;
      });

      const payloadEntries = entries.value.map((e) => ({
        control_no: e.control_no,
        employee: e.employee,
        position: e.position,
        mobile_no: normalizePhone(e.mobile_no),
        department: e.department,
        employment_status: e.employment_status,
        is_office: e.is_office,
        is_complete: true,
        details: e.data,
        docs: e.docs,
        nominee_docs: collectNomineeDocs(e),
        signedForms: signedForRequest,
      }));

      const payload = {
        type: nominationType.value,
        nominee_type: nomineeType.value,
        nomination_mode: nominationMode.value,
        office: officeName.value,
        status: targetStatus,
        entries: payloadEntries,
      };

      let result;

      if (!isEditMode.value) {
        result = await nominationStore.createBatch(payload);
      } else {
        // ★ For existing records, always go through updateNomination — the
        //   controller handles the draft→submitted transition (including the
        //   signed-form completeness check) via the `status` field.
        const first = payloadEntries[0];
        result = await nominationStore.updateNomination(route.params.id, {
          ...first,
          status: targetStatus,
          signedForms: signedForRequest,
        });
      }

      if (!result.success) {
        notify(result.message || "Unable to save nomination.");
        // Surface per-field errors if the backend returned them
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, msgs]) => {
            const msg = Array.isArray(msgs) ? msgs[0] : msgs;
            if (msg) notify(`${field}: ${msg}`);
          });
        }
        return;
      }

      notify(result.message || "Saved successfully.", "positive");

      if (targetStatus === "submitted") {
        router.push({ name: "nominations" });
      } else if (!isEditMode.value) {
        const created = result.data?.[0];
        if (created?.id) {
          router.replace({
            name: "edit-nomination",
            params: { id: created.id },
          });
        }
      } else {
        await reloadRecord();
      }
    }

    /* =========================================================
       LOAD RECORD (EDIT MODE)
    ========================================================= */
    async function reloadRecord() {
      if (!isEditMode.value) return;

      isLoading.value = true;
      loadError.value = null;

      try {
        const result = await nominationStore.fetchOne(route.params.id, {
          cache: false,
        });

        if (!result.success) {
          loadError.value = result.message || "Unable to load nomination.";
          return;
        }

        const r = result.data;
        record.value = r;
        editingStatus.value = r.status;
        nominationType.value = r.type;
        nomineeType.value = r.nominee_type || "employee";
        nominationMode.value = r.nomination_mode || "individual";

        // Restore group from the type list
        const dbType = typeStore.active.find((t) => t.code === r.type);
        selectedGroup.value = dbType?.group || null;

        // Single-entry model in edit mode
        entries.value = [
          {
            id: `edit-${r.id}`,
            control_no: r.control_no || "",
            employee: r.employee || "",
            position: r.position || "",
            mobile_no: r.mobile_no || "",
            department: r.department || "",
            employment_status: r.employment_status || "",
            is_office: !!r.is_office,
            data: r.details || blankData(r.type),
            docs: blankDocs(r.type),
            existing_docs: r.docs || {},
            _hydrated: true,
            _hydrating: false,
          },
        ];
        activeEntryIndex.value = 0;

        // ★ Restore signed docs from the record; clear pending uploads
        signedForms.value = {};
        existingSignedDocs.value = r.signed_docs || {};

        // Restore nominator if present
        if (r.details?.nominator_name) {
          nominatorEntry.value = {
            control_no: "",
            employee: r.details.nominator_name || "",
            position: r.details.nominator_position || "",
            mobile_no: r.details.nominator_contact || "",
            phone_landline: r.details.nominator_phone_landline || "",
            email: r.details.nominator_email || "",
          };
        }
      } catch (err) {
        loadError.value = err?.message || "Unable to load nomination.";
      } finally {
        isLoading.value = false;
      }
    }

    /* =========================================================
       LIFECYCLE
    ========================================================= */
    onMounted(async () => {
      try {
        if (typeof typeStore.fetchActive === "function") {
          await typeStore.fetchActive();
        }
      } catch (err) {
        console.error("Failed to load nomination types:", err);
      }

      try {
        if (!agencyStore.loaded && typeof agencyStore.fetch === "function") {
          await agencyStore.fetch();
        }
      } catch (err) {
        console.error("Failed to load agency information:", err);
      }

      if (isEditMode.value) {
        await reloadRecord();
      }
    });

    /* =========================================================
       RETURN
    ========================================================= */
    return {
      // stores
      userStore,
      nominationStore,
      typeStore,
      agencyStore,

      // state
      officeName,
      selectedGroup,
      nominationType,
      nomineeType,
      nominationMode,
      entries,
      activeEntryIndex,
      activeNomineeRowIndex,
      isLoading,
      loadError,
      signedForms, // ★
      existingSignedDocs, // ★
      employeeSearch,
      showEmployeeDialog,
      showNominatorDialog,
      nominatorSearch,
      nominatorEntry,
      showNomineePickerDialog,
      nomineePickerOffice,
      nomineePickerSearch,
      nomineePickerLoading,
      nomineePickerOfficesLoaded,
      viewingKey,
      downloadingKey,

      // constants for template
      INFO_FIELDS,
      MAX_FILE_SIZE,
      NOMINEES_MAX_ROWS,
      modeOptions,
      nomineeOptions,

      // computeds
      isEditMode,
      isReadOnly,
      isGawad,
      isNationalAward,
      isGroupNomination,
      typeMeta,
      headerTitle,
      headerSubtitle,
      submitLabel,
      groupOptions,
      categoryOptions,
      showNomineeToggle,
      showModeToggle,
      officeStepNum,
      nomineeStepNum,
      displaySections,
      currentEntry,
      canApplyToAll,
      nationalAwardNominees,
      officeOptions,
      filteredOfficeEmployees,
      filteredNominatorEmployees,
      filteredNomineePickerEmployees,
      nomineePickerTitle,
      navSections,
      canSaveDraft,
      canSubmit,
      canAddNomineeFromPanel,
      addNomineeTooltip,
      agencyOfficialsList,
      visibleEntryDocs,
      signedFormKeys, // ★
      requiresSignedForm, // ★
      hasSignedForm, // ★
      signedFormProgress, // ★

      // top-level helpers
      pageStyleFn,
      notify,
      goBack,
      onGroupChange,
      onCategoryChange,
      onModeChange,
      onNomineeTypeChange,

      // navigation
      sectionNumber,
      isSectionComplete,
      sectionProgressLabel,
      scrollToSection,

      // signed forms
      setSignedForm, // ★
      signedFormLabel, // ★
      signedFormHintFor, // ★
      viewSignedForm, // ★
      downloadSignedForm, // ★

      // roster
      entryDisplayName,
      entryDisplayMeta,
      isEntryComplete,
      nomineeRosterName,
      isNomineeRowComplete,
      canRemoveNomineeRow,
      removeNomineeRow,
      selectNomineeRow,
      selectEntry,
      removeEntry,
      openAddNomineeFlow,

      // repeatables
      repeatableRows,
      visibleRowFields,
      canAddRepeatableRow,
      canRemoveRepeatableRow,
      addRepeatableRow,
      removeRepeatableRow,
      addRowLabel,
      fieldSupportsDirectory,
      nomineeRowTitle,
      rowGridClass,
      rowFieldLocked,
      onRepeatableRowClick,
      rowDocsTitle,
      rowDocsCount,
      getRowDoc,
      setRowDoc,
      getExistingRowDoc,

      // field helpers
      optionsForField,
      filterSelect,
      onFieldSelect,
      fieldLocked,
      fieldRules,
      requiredRule,
      showApplyAll,
      sectionHasApplyAll,
      applyToAll,
      handleSectionAction,
      mobileRule,

      // existing docs
      existingDocFor,
      existingDocHint,
      hasPendingFile,
      fileRule,
      onFileRejected,
      viewExistingDoc,
      downloadExistingDoc,

      // pickers
      isEmployeeSelected,
      toggleEmployee,
      selectAllFiltered,
      clearSelection,
      isNominatorSelected,
      selectNominator,
      clearNominator,
      nominatorLabel,
      openNominatorDialog,
      openNomineePicker,
      onNomineePickerOfficeChange,
      closeNomineePicker,
      selectNomineeFromPicker,

      // save
      saveNomination,
      reloadRecord,

      // pure helpers exposed to template
      getInitials,
      inputType,
      wordCount,
    };
  },
});
</script>

<style scoped>
/* =========================================================
   PAGE SHELL
========================================================= */
.create-page {
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
  margin-bottom: 2px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #8a95a0;
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
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.page-header-actions .btn-primary {
  grid-column: 1 / -1;
  order: -1;
}

/* Buttons */
.btn-ghost {
  min-height: 40px;
  padding: 0 14px;
  color: #5c6b78;
  font-size: 13px;
  font-weight: 600;
}
.btn-secondary {
  min-height: 40px;
  padding: 0 16px;
  border-radius: 8px;
  color: #2b3a4a;
  background: #ffffff;
  border: 1px solid #d6dce1;
  font-size: 13px;
  font-weight: 650;
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
.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.5;
  box-shadow: none;
}

.submit-hint {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin: -4px 0 10px;
  font-size: 12px;
  line-height: 1.45;
  color: #8a95a0;
}
.submit-hint .q-icon {
  margin-top: 2px;
  flex-shrink: 0;
}

/* Banners & states */
.banner {
  margin-bottom: 10px;
  padding: 8px 14px;
  border-radius: 8px;
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
.banner-reason {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-top: 6px;
  padding: 6px 10px;
  background: #ffffff;
  border-left: 3px solid #e8911a;
  border-radius: 4px;
  font-size: 12.5px;
  color: #5c6b78;
  line-height: 1.45;
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
   LEFT PANEL — setup steps
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
.step-body--flex {
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.step-label {
  margin: 2px 0 6px;
  font-size: 11px;
  font-weight: 700;
  color: #6b7680;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}
.step-label--inline {
  margin: 0;
}
.step-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
  min-height: 28px;
}
.step-hint {
  display: flex;
  align-items: flex-start;
  gap: 5px;
  margin-top: 6px;
  font-size: 11.5px;
  color: #97a1a9;
  line-height: 1.45;
}
.step-hint .q-icon {
  color: #b3bcc4;
  flex-shrink: 0;
  margin-top: 2px;
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
  min-width: 36px;
  min-height: 36px;
  color: #5c6b78;
  flex-shrink: 0;
  background: #f7f8f9;
  border: 1px solid #e6e8eb;
}
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
.empty-hint {
  padding: 12px;
  background: #fafbfc;
  border: 1px dashed #dde1e5;
  border-radius: 8px;
  color: #97a1a9;
  font-size: 12px;
  line-height: 1.55;
  text-align: center;
}
.empty-hint strong {
  color: #5c6b78;
}

/* Roster */
.roster {
  display: flex;
  flex-direction: column;
  gap: 3px;
  max-height: 320px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
.roster-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
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
.roster-item.is-leader {
  border-left: 3px solid #e8911a;
}
.roster-avatar {
  width: 28px;
  height: 28px;
  min-width: 28px;
  border-radius: 50%;
  background: #dde3e8;
  color: #4a5763;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10.5px;
  font-weight: 700;
}
.roster-item.is-active .roster-avatar {
  background: #2b3a4a;
  color: #ffffff;
}
.roster-item.is-leader.is-active .roster-avatar {
  background: #e8911a;
}
.roster-info {
  flex: 1;
  min-width: 0;
}
.roster-name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #1a2332;
  min-width: 0;
}
.roster-name-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.roster-badge {
  display: inline-flex;
  align-items: center;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  flex-shrink: 0;
}
.roster-badge--leader {
  color: #ffffff;
  background: #e8911a;
}
.roster-badge--member {
  color: #5c6b78;
  background: #eef1f4;
}
.roster-meta {
  margin-top: 1px;
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
  min-width: 36px;
  min-height: 36px;
  color: #c2c9ce;
}
.roster-add-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 2px;
  padding: 8px 10px;
  border: 1px dashed #dde1e5;
  border-radius: 8px;
  color: #8a95a0;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s ease, border-color 0.12s ease, color 0.12s ease;
  -webkit-tap-highlight-color: transparent;
}
.roster-add-slot:focus-visible {
  outline: 2px solid #e8911a;
  outline-offset: -2px;
}

/* =========================================================
   RIGHT PANEL — form
========================================================= */
.form-section {
  --panel-bg: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.form-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-height: 220px;
  padding: 24px 16px;
  color: #b3bcc4;
  text-align: center;
}
.form-empty .q-icon {
  color: #c8cfd5;
  margin-bottom: 2px;
}
.form-empty-title {
  font-size: 15px;
  font-weight: 650;
  color: #5c6b78;
}
.form-empty-sub {
  font-size: 13px;
  color: #97a1a9;
  line-height: 1.5;
  max-width: 320px;
}
.form-empty-sub strong {
  color: #5c6b78;
}

/* Section navigator — sticky header. The wrapper paints an opaque cover over
   the panel's top/side padding and the gap below, so scrolled content never
   shows around the bar. Set --panel-bg to match the right panel background. */
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
  /* shadows paint the side cover without adding scrollable width */
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

/* Section card */
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
.form-block--signed {
  background: #fff8f0;
  border-color: #e8b36a;
}
.form-block--reupload {
  background: #fff4e0;
  border-color: #e8b36a;
}
.form-block--docs {
  padding-bottom: 14px;
}

/* Header band: [number] Title ........ [progress] [action]
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
.form-block--signed .form-block-head {
  background: #fdf0dc;
  border-bottom-color: #f4e2c8;
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
.form-block--signed .form-section-title {
  color: #8a5a1a;
}
.section-progress {
  order: 1;
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
.form-block-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px 10px;
  margin-left: auto;
  order: 2;
}
.section-progress + .form-block-actions {
  margin-left: 0;
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
.form-block--signed .form-block-hint {
  padding-left: 0;
}
.form-block-hint .q-icon {
  color: #aab4bc;
  margin-top: 2px;
  flex-shrink: 0;
}
.form-block-hint--inline {
  flex: 0 0 auto;
  order: 0;
  padding-left: 0;
}
.req-badge {
  display: inline-block;
  padding: 1px 6px;
  font-size: 10px;
  font-weight: 700;
  color: #b04a3b;
  background: #fbeeeb;
  border-radius: 4px;
  letter-spacing: 0.3px;
  text-transform: none;
}
.form-block--signed .req-badge {
  color: #ffffff;
  background: #d4880f;
}
.section-action {
  min-height: 30px;
  color: #2b3a4a;
  font-size: 12px;
  font-weight: 600;
  background: #ffffff;
  border: 1px solid #d6dce1;
  border-radius: 6px;
}

/* Grid */
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
.form-grid :deep(.q-field__native),
.form-grid :deep(.q-field__input),
.picker-search :deep(.q-field__native) {
  font-size: 16px;
}
.form-grid :deep(.q-field__control) {
  min-height: 44px;
}
.form-grid :deep(textarea.q-field__native) {
  min-height: 80px;
  line-height: 1.5;
  padding-top: 6px;
  padding-bottom: 6px;
  font-family: inherit;
}
.form-grid.form-grid--auto {
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 240px), 1fr));
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
  min-width: 36px;
  min-height: 36px;
  color: #8a95a0;
}
.word-counter {
  display: inline-flex;
  align-items: center;
  margin-top: 2px;
  font-size: 11.5px;
  color: #8a95a0;
}
.word-counter.is-over {
  color: #c0392b;
  font-weight: 600;
}
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

/* Repeatable rows (nominees / accomplishments) */
.repeatable-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  min-width: 0;
}
.repeatable-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}
.repeatable-head-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.repeatable-hint {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11.5px;
  color: #8a95a0;
  line-height: 1.4;
}
.repeatable-hint .q-icon {
  color: #b3bcc4;
  flex-shrink: 0;
}
.repeatable-add {
  min-height: 32px;
  color: #2b3a4a;
  background: #eef1f4;
  border-radius: 6px;
  font-size: 12.5px;
  font-weight: 600;
}
.repeatable-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  background: #fafbfc;
  border: 1px solid #e6e8eb;
  border-radius: 8px;
  transition: border-color 0.12s ease, box-shadow 0.12s ease;
}
.repeatable-row.is-focused {
  border-color: #e8911a;
  box-shadow: 0 0 0 3px rgba(232, 145, 26, 0.14);
}
.repeatable-row-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  flex-wrap: wrap;
}
.repeatable-row-num {
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
.repeatable-row-num .q-icon {
  color: #b3bcc4;
}
.repeatable-row-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}
.repeatable-row-action {
  min-height: 30px;
  color: #2b3a4a;
  font-size: 12px;
  font-weight: 600;
  background: #eef1f4;
  border-radius: 6px;
}
.repeatable-remove {
  min-width: 32px;
  min-height: 32px;
  color: #c2c9ce;
}
.repeatable-row-grid {
  margin-top: 0;
  row-gap: 8px;
}
.repeatable-row-grid.repeatable-row-grid--two {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.repeatable-row-grid.repeatable-row-grid--three {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.repeatable-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 16px 12px;
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

/* Per-nominee documents (collapsible) */
.row-docs {
  background: #ffffff;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  overflow: hidden;
}
.row-docs :deep(.q-item) {
  min-height: 38px;
  padding: 4px 10px;
}
.row-docs :deep(.q-item__section--avatar) {
  min-width: 0;
  padding-right: 8px;
  color: #8a95a0;
}
.row-docs-title {
  font-size: 11.5px;
  font-weight: 700;
  color: #5c6b78;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}
.row-docs-badge {
  font-size: 10.5px;
  font-weight: 700;
}
.row-docs-body {
  padding: 4px 10px 12px;
  border-top: 1px solid #eef0f2;
}
.form-grid--docs {
  margin-top: 0;
  row-gap: 12px;
}
.form-block--signed .form-grid--docs {
  margin-top: 0;
}
.form-grid--docs :deep(.q-field__bottom) {
  padding-top: 4px;
  line-height: 1.4;
}
.form-grid--rowdocs {
  margin-top: 8px;
}

/* Existing document row */
.existing-doc-actions {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 6px;
  margin-top: 4px;
  padding: 6px 10px;
  background: #f7f8f9;
  border: 1px solid #e6e8eb;
  border-radius: 6px;
}
.form-block--signed .existing-doc-actions {
  background: #ffffff;
  border-color: #f4e2c8;
}
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
  min-height: 36px;
  color: #5c6b78;
  font-size: 12px;
  font-weight: 600;
}
.doc-action :deep(.q-btn__content) {
  flex-wrap: nowrap;
  white-space: nowrap;
}
.reupload-notice {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-top: 4px;
  padding: 6px 10px;
  background: #fff8ec;
  border-left: 3px solid #e8911a;
  border-radius: 4px;
  font-size: 11.5px;
  color: #8a5a1a;
  line-height: 1.45;
}
.reupload-notice .q-icon {
  color: #d4880f;
  flex-shrink: 0;
  margin-top: 2px;
}

/* =========================================================
   PICKER DIALOGS
========================================================= */
.picker-dialog {
  width: min(560px, 92vw);
  max-width: 92vw;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
}
.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
}
.picker-title {
  font-size: 15px;
  font-weight: 750;
  color: #1a2332;
}
.picker-subtitle {
  margin-top: 2px;
  font-size: 12px;
  color: #8a95a0;
}
.picker-subtitle strong {
  color: #5c6b78;
  font-weight: 650;
}
.picker-close {
  min-width: 36px;
  min-height: 36px;
  color: #8a95a0;
}
.picker-toolbar {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  padding: 10px 14px;
}
.picker-toolbar--stack {
  gap: 8px;
}
.picker-search {
  flex: 1;
}
.picker-office-select {
  width: 100%;
}
.picker-toolbar-actions {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
  flex-shrink: 0;
}
.picker-action {
  min-height: 32px;
  color: #5c6b78;
  font-size: 12.5px;
  font-weight: 600;
}
.picker-list {
  padding: 0;
  min-height: 240px;
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
  gap: 10px;
  padding: 8px 14px;
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
.picker-lead-icon {
  color: #b3bcc4;
  flex-shrink: 0;
}
.picker-avatar {
  width: 30px;
  height: 30px;
  min-width: 30px;
  border-radius: 50%;
  background: #e2e7ec;
  color: #4a5763;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
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
  margin-top: 1px;
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
  gap: 6px;
  padding: 44px 20px;
  color: #b3bcc4;
  font-size: 13px;
  text-align: center;
}
.picker-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  padding-bottom: max(10px, env(safe-area-inset-bottom));
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
  .form-empty {
    min-height: 300px;
  }
  .existing-doc-actions {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
  }
  .picker-header,
  .picker-footer {
    padding: 14px 18px;
  }
  .picker-toolbar {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 10px 18px;
  }
  .picker-toolbar--stack {
    flex-direction: column;
    align-items: stretch;
  }
  .picker-item {
    padding: 8px 18px;
  }
  .picker-list {
    max-height: 45vh;
  }
  .state-box {
    min-height: 300px;
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
  .repeatable-row-grid.repeatable-row-grid--two,
  .repeatable-row-grid.repeatable-row-grid--three {
    grid-template-columns: minmax(0, 1fr);
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
    min-height: 36px;
  }
  .btn-primary--sm {
    min-height: 32px;
  }
}

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
  .field-toggle {
    min-height: 40px;
  }
}

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
  .roster-add-slot:hover {
    color: #2b3a4a;
    background: #f7f8f9;
    border-color: #c2cad0;
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
  .section-chip:hover {
    background: #e9edf1;
  }
  .section-chip.is-complete:hover {
    background: #dcf1e6;
  }
  .section-action:hover,
  .repeatable-add:hover,
  .repeatable-row-action:hover {
    background: #dde3e8;
  }
  .repeatable-remove:hover {
    color: #c0392b;
    background: #fbe9e9;
  }
}

.roster-item:focus-visible,
.picker-item:focus-visible {
  outline: 2px solid #e8911a;
  outline-offset: -2px;
}

@media (prefers-reduced-motion: reduce) {
  .roster-item,
  .picker-item,
  .repeatable-row,
  .roster-add-slot {
    transition: none;
  }
}

/* Desktop: page fills the viewport and the two columns scroll internally */
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
