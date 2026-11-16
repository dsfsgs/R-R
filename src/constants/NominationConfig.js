// src/constants/NominationConfig.js

export const NOMINATION_TYPES = [
  {
    value: "exam_passer",
    label: "Examination Passer",
    short: "Exam Passer",
    form: "A",
    batch: true,
    officeNominee: false,
    applyToAll: true,
    hint: "batch entry; shared fields can be copied to all",
  },
  {
    value: "award_recognition",
    label: "Award & Recognition",
    short: "Award",
    form: "B",
    batch: true,
    officeNominee: true,
    applyToAll: true,
    hint: "batch entry; shared fields can be copied to all",
  },
  {
    value: "graduate_studies",
    label: "Graduate Studies",
    short: "Graduate",
    form: "C",
    batch: false,
    officeNominee: false,
    applyToAll: false,
    hint: "each employee has unique graduate details",
  },
  {
    value: "gawad_parangal_kawani",
    label: "Gawad Parangal Kawani",
    short: "Gawad",
    form: "D",
    batch: false,
    officeNominee: false,
    applyToAll: false,
    hint: "each employee has unique personal and accomplishment details",
  },
];

export const GROUP_ORDER = {
  national_awards: 1,
  local_praise_awards: 2,
  customized_rewards: 3,
};
export const GROUP_LABELS = {
  national_awards: "National Awards",
  local_praise_awards: "Local PRAISE Awards",
  customized_rewards: "Customized Rewards and Incentives",
};

export const TYPE_FLAGS = {
  exam_passer: {
    batch: true,
    officeNominee: false,
    groupNominee: false,
    applyToAll: true,
    hint: "batch entry; shared fields can be copied to all",
  },
  graduate_studies: {
    batch: false,
    officeNominee: false,
    groupNominee: false,
    applyToAll: false,
    hint: "each employee has unique graduate details",
  },
  gawad_parangal_kawani: {
    batch: false,
    officeNominee: false,
    groupNominee: false,
    applyToAll: false,
    hint: "each employee has unique personal and accomplishment details",
  },
  form_b: {
    batch: true,
    officeNominee: true,
    groupNominee: false,
    applyToAll: true,
    hint: "batch entry; shared fields can be copied to all",
  },
  gawad_lingkod_bayan: {
    batch: false,
    officeNominee: false,
    groupNominee: true,
    applyToAll: false,
    hint: "individual or group (Team Leader + up to 4 members)",
  },
  gawad_dangal_ng_bayan: {
    batch: false,
    officeNominee: false,
    groupNominee: false,
    applyToAll: false,
    hint: "individual national award nomination",
  },
  gawad_pagasa: {
    batch: false,
    officeNominee: false,
    groupNominee: true,
    applyToAll: false,
    hint: "individual or group (Team Leader + up to 4 members)",
  },
  customized_most_outstanding_head: {
    batch: false,
    officeNominee: false,
    groupNominee: false,
    applyToAll: false,
    hint: "individual award nomination",
  },
  customized_most_productive_unit: {
    batch: false,
    officeNominee: true,
    groupNominee: false,
    applyToAll: false,
    hint: "office-level award nomination",
  },
  customized_best_attendance: {
    batch: false,
    officeNominee: false,
    groupNominee: false,
    applyToAll: false,
    hint: "individual award nomination",
  },
  customized_top_performing_employee: {
    batch: false,
    officeNominee: false,
    groupNominee: false,
    applyToAll: false,
    hint: "individual award nomination",
  },
  customized_service_award: {
    batch: false,
    officeNominee: false,
    groupNominee: false,
    applyToAll: false,
    hint: "individual award nomination",
  },
  customized_exemplary_behavior: {
    batch: false,
    officeNominee: false,
    groupNominee: false,
    applyToAll: false,
    hint: "individual award nomination",
  },
};

export const TYPE_LABELS = {
  exam_passer: "Examination Passer",
  award_recognition: "Award & Recognition",
  graduate_studies: "Graduate Studies",
  gawad_parangal_kawani: "Gawad Parangal Kawani",
  form_b: "Gawad Parangal - Bukod-Tanging Opisina",
  gawad_lingkod_bayan: "Gawad Lingkod Bayan ng Pangulo",
  gawad_dangal_ng_bayan: "Gawad Dangal ng Bayan",
  gawad_pagasa: "Gawad Pagasa",
  customized_most_outstanding_head:
    "Most Outstanding Department/Office Head Award",
  customized_most_productive_unit: "Most Productive Organizational Unit",
  customized_best_attendance: "Best in Attendance Award",
  customized_top_performing_employee:
    "Top Performing Employee/s Based on Performance Rating",
  customized_service_award: "Service Award/Incentive",
  customized_exemplary_behavior: "Exemplary Behavior Award",
};

export const TYPE_CLASSES = {
  exam_passer: "type-exam",
  award_recognition: "type-award",
  graduate_studies: "type-graduate",
  gawad_parangal_kawani: "type-gawad",
  form_b: "type-award",
  gawad_lingkod_bayan: "type-award",
  gawad_dangal_ng_bayan: "type-award",
  gawad_pagasa: "type-award",
  customized_most_outstanding_head: "type-award",
  customized_most_productive_unit: "type-award",
  customized_best_attendance: "type-award",
  customized_top_performing_employee: "type-award",
  customized_service_award: "type-award",
  customized_exemplary_behavior: "type-award",
};

/* =========================================================
   EXAMINATION REFERENCE DATA
========================================================= */
const makeOptions = (arr) => arr.map((s) => ({ label: s, value: s }));

export const EXAM_AGENCIES = makeOptions([
  "Civil Service Commission (CSC)",
  "Professional Regulation Commission (PRC)",
]);

export const EXAM_TYPES_BY_AGENCY = {
  "Civil Service Commission (CSC)": makeOptions([
    "Career Service Examination – Professional Level",
    "Career Service Examination – Subprofessional Level",
    "Career Service Examination for Foreign Service Officer (CSE-FSO)",
    "Fire Officer Examination (FOE)",
    "Penology Officer Examination (POE)",
    "Basic Competency on Local Treasury Examination (BCLTE)",
    "Intermediate Competency on Local Treasury Examination (ICLTE)",
    "Other CSC Examination",
  ]),
  "Professional Regulation Commission (PRC)": makeOptions([
    "Architect Licensure Examination",
    "Agricultural and Biosystems Engineers Licensure Examination",
    "Agriculturists Licensure Examination",
    "Aeronautical Engineers Licensure Examination",
    "Certified Public Accountants Licensure Examination",
    "Chemical Engineers Licensure Examination",
    "Chemical Technicians Licensure Examination",
    "Civil Engineers Licensure Examination",
    "Criminologists Licensure Examination",
    "Customs Brokers Licensure Examination",
    "Dentists Licensure Examination",
    "Electronics Engineers Licensure Examination",
    "Electronics Technicians Licensure Examination",
    "Environmental Planners Licensure Examination",
    "Fisheries Professionals Licensure Examination",
    "Food Technologists Licensure Examination",
    "Geodetic Engineers Licensure Examination",
    "Geologists Licensure Examination",
    "Guidance and Counseling Licensure Examination",
    "Interior Designers Licensure Examination",
    "Landscape Architects Licensure Examination",
    "Librarians Licensure Examination",
    "Master Plumbers Licensure Examination",
    "Mechanical Engineers Licensure Examination",
    "Medical Technologists Licensure Examination",
    "Metallurgical Engineers Licensure Examination",
    "Midwives Licensure Examination",
    "Mining Engineers Licensure Examination",
    "Naval Architects Licensure Examination",
    "Nurse Licensure Examination",
    "Nutritionist-Dietitians Licensure Examination",
    "Occupational Therapists Licensure Examination",
    "Optometrists Licensure Examination",
    "Pharmacists Licensure Examination",
    "Physical Therapists Licensure Examination",
    "Physicians Licensure Examination",
    "Professional Teachers Licensure Examination",
    "Psychologists Licensure Examination",
    "Psychometricians Licensure Examination",
    "Radiologic Technologists Licensure Examination",
    "Real Estate Appraisers Licensure Examination",
    "Real Estate Brokers Licensure Examination",
    "Real Estate Consultants Licensure Examination",
    "Respiratory Therapists Licensure Examination",
    "Sanitary Engineers Licensure Examination",
    "Social Workers Licensure Examination",
    "Speech-Language Pathologists Licensure Examination",
    "Veterinarians Licensure Examination",
  ]),
};

/* =========================================================
   NATIONAL AWARDS — SHARED OPTIONS
========================================================= */
export const YES_NO_OPTIONS = [
  { label: "No", value: "no" },
  { label: "Yes", value: "yes" },
];

export const SECTOR_OPTIONS = [
  { label: "NGA", value: "NGA" },
  { label: "LGU", value: "LGU" },
  { label: "SUC", value: "SUC" },
  { label: "GOCC (including GICP/GCE/LWD)", value: "GOCC" },
  { label: "Military (AFP Uniformed Personnel Only)", value: "MILITARY" },
];

export const EMPLOYMENT_STATUS_OPTIONS = [
  { label: "Permanent", value: "permanent" },
  { label: "Casual", value: "casual" },
  { label: "Contractual", value: "contractual" },
  { label: "Co-terminus", value: "co_terminus" },
  { label: "Elective", value: "elective" },
];

export const POSITION_LEVEL_OPTIONS = [
  { label: "First Level", value: "first_level" },
  { label: "Second Level", value: "second_level" },
  { label: "Third Level", value: "third_level" },
];

export const AWARD_CATEGORY_OPTIONS = [
  { label: "Gawad Lingkod Bayan ng Pangulo", value: "gawad_lingkod_bayan" },
  { label: "Gawad Dangal ng Bayan", value: "gawad_dangal_ng_bayan" },
  { label: "Gawad Pagasa", value: "gawad_pagasa" },
];

/* =========================================================
   NATIONAL AWARDS — PER-NOMINEE SUPPORTING DOCUMENTS
========================================================= */
export const NOMINEE_ROW_DOCS = [
  {
    key: "pds",
    label:
      "Completely filled-out CS Form 212 or Personal Data Sheet (PDS) dated as of end of December of the year preceding the nomination",
    icon: "description",
    accept: ".pdf,.jpg,.jpeg,.png",
    optional: false,
  },
  {
    key: "appointment_proof",
    label:
      "Proof of Appointment / Proclamation (Appointment Paper for permanent, casual, contractual, or co-terminous employees; DILG masterlist or Oath of Office for elective officials)",
    icon: "badge",
    accept: ".pdf,.jpg,.jpeg,.png",
    optional: false,
  },
  {
    key: "service_record",
    label:
      "Updated Service Record duly certified by the HRMO — continuous government service for at least three (3) years as of 31 December of the year preceding the nomination deadline",
    icon: "history_edu",
    accept: ".pdf,.jpg,.jpeg,.png",
    optional: false,
  },
  {
    key: "performance_rating",
    label:
      "Performance rating of at least Very Satisfactory for the past three (3) years, certified by the highest HRMO",
    icon: "trending_up",
    accept: ".pdf,.jpg,.jpeg,.png",
    optional: false,
  },
  {
    key: "pendency_declaration",
    label:
      "Nominee's declaration of pendency or non-pendency of administrative or criminal offense / case involving moral turpitude",
    icon: "gavel",
    accept: ".pdf,.jpg,.jpeg,.png",
    optional: false,
  },
  {
    key: "portrait_photo",
    label:
      "Individual portrait photo — chest-up, facing camera at eye level, no obstructions, at least 4×6 in, ≥1600×1200 (2–3 MP / 300 DPI), plain white / beige / neutral background, Filipiniana attire or gala uniform",
    icon: "photo_camera",
    accept: ".jpg,.jpeg,.png",
    optional: false,
  },
];

/* =========================================================
   NATIONAL AWARDS — WHOLE-NOMINATION SUPPORTING DOCUMENTS
========================================================= */
const NATIONAL_AWARDS_ENTRY_DOCS = [
  {
    key: "praise_certification",
    label:
      "Certification from the Chairperson of the Agency's Local, Provincial, Regional or National PRAISE Committee confirming that the nominee has undergone deliberation",
    icon: "verified",
    accept: ".pdf,.jpg,.jpeg,.png",
    optional: false,
  },
  {
    key: "endorsement_letter",
    label:
      "Endorsement letter from the Agency Head (group nominations with members from different agencies must be endorsed separately by their respective agency heads)",
    icon: "mail",
    accept: ".pdf,.jpg,.jpeg,.png",
    optional: false,
  },
  {
    key: "group_photo",
    label:
      "Group photo — landscape orientation, at least 6×4 inches (Group nominations only)",
    icon: "groups",
    accept: ".jpg,.jpeg,.png",
    optional: true,
    groupOnly: true,
  },
  {
    key: "intro_video",
    label:
      "Three (3) minute video introducing the nominee/group and summarizing accomplishments — plain neutral background, well-lit, high-quality audio, in English, Filipino, or a mix (local dialects require English or Filipino subtitles)",
    icon: "videocam",
    maxSize: 100 * 1024 * 1024,
    accept: ".mp4,.mov,.avi,.mkv,.webm",
    optional: false,
  },
];

/* ---------------------------------------------------------
   Individual / group nominee row (repeatable)
--------------------------------------------------------- */
const NOMINEE_ROW_FIELDS = [
  {
    key: "full_name",
    label: "Full Name (First, Middle, Last, Extension Name if any)",
    kind: "text",
    required: true,
    span: 2,
    placeholder: "Juan Dela Cruz Santos Jr.",
  },
  {
    key: "sex",
    label: "Sex",
    kind: "select",
    required: true,
    options: [
      { label: "Male", value: "male" },
      { label: "Female", value: "female" },
    ],
  },
  {
    key: "date_of_birth",
    label: "Date of Birth",
    kind: "date",
    required: true,
  },
  {
    key: "age",
    label: "Age",
    kind: "text",
    required: true,
    inputmode: "numeric",
    maxlength: 3,
  },
  {
    key: "place_of_birth",
    label: "Place of Birth",
    kind: "text",
    required: true,
    span: 2,
  },
  {
    key: "residential_address",
    label: "Residential Address",
    kind: "text",
    required: true,
    span: 2,
  },
  {
    key: "phone_landline",
    label: "Phone / Landline (e.g. (02) 123-45678)",
    kind: "text",
    required: false,
    placeholder: "(02) 123-45678",
  },
  {
    key: "mobile_no",
    label: "Mobile No. (e.g. 0912 345 6789)",
    kind: "phone",
    required: true,
    placeholder: "09171234567",
  },
  {
    key: "email",
    label: "Email Address",
    kind: "email",
    required: true,
    span: 2,
    placeholder: "name@example.com",
  },
  {
    key: "position",
    label: "Position Title (with Parenthetical Title/Rank, if applicable)",
    kind: "text",
    required: true,
    span: 2,
  },
  {
    key: "employment_status",
    label: "Employment Status",
    kind: "select",
    required: true,
    options: EMPLOYMENT_STATUS_OPTIONS,
  },
  {
    key: "position_level",
    label: "Position Level",
    kind: "select",
    required: true,
    options: POSITION_LEVEL_OPTIONS,
  },
  {
    key: "sector",
    label: "Sector",
    kind: "select",
    required: true,
    span: 2,
    options: SECTOR_OPTIONS,
  },
  {
    key: "indigenous_group",
    label: "Member of an Indigenous Group?",
    kind: "toggle",
    required: true,
    span: 2,
    options: YES_NO_OPTIONS,
  },
  {
    key: "indigenous_group_details",
    label: "If yes, specify",
    kind: "text",
    required: false,
    span: 2,
    placeholder: "Name of indigenous group",
  },
  {
    key: "previous_nominee",
    label: "Previous Nominee?",
    kind: "toggle",
    required: true,
    span: 2,
    options: YES_NO_OPTIONS,
  },
  {
    key: "previous_nominee_details",
    label: "If yes, indicate Year and Category",
    kind: "text",
    required: false,
    span: 2,
    placeholder: "e.g. 2022 — Gawad Pagasa",
  },
  {
    key: "previous_semifinalist",
    label: "Previous National Semi-Finalist?",
    kind: "toggle",
    required: true,
    span: 2,
    options: YES_NO_OPTIONS,
  },
  {
    key: "previous_semifinalist_details",
    label: "If yes, indicate Year and Category",
    kind: "text",
    required: false,
    span: 2,
    placeholder: "e.g. 2023 — Gawad Dangal ng Bayan",
  },
  {
    key: "previous_awardee",
    label: "Previous National Awardee?",
    kind: "toggle",
    required: true,
    span: 2,
    options: YES_NO_OPTIONS,
  },
  {
    key: "previous_awardee_details",
    label: "If yes, indicate Year and Category",
    kind: "text",
    required: false,
    span: 2,
    placeholder: "e.g. 2021 — Gawad Lingkod Bayan ng Pangulo",
  },
];

/* ---------------------------------------------------------
   Accomplishment row (repeatable)
--------------------------------------------------------- */
const ACCOMPLISHMENT_ROW_FIELDS = [
  {
    key: "accomplishment",
    label: "Significant Accomplishment",
    kind: "essay",
    required: true,
    maxWords: 300,
    rows: 6,
    placeholder:
      "Describe the project/work, strategies/activities done, and problems/challenges encountered.",
  },
  {
    key: "impact",
    label: "Impact / Results",
    kind: "essay",
    required: true,
    maxWords: 300,
    rows: 6,
    placeholder:
      "Indicate results/impact, problems addressed, savings generated, people/offices/communities benefited, or transactions facilitated.",
  },
  {
    key: "team_contribution",
    label: "Contribution of Team Member/s",
    kind: "textarea",
    required: false,
    groupOnly: true,
    rows: 4,
    placeholder:
      "For group nominations — list the team member/s with the most contribution (leave blank for individual).",
  },
];

/* ---------------------------------------------------------
   NATIONAL AWARDS — shared section layout
--------------------------------------------------------- */
const NATIONAL_AWARDS_SECTIONS = [
  {
    title: "Nominee Information",
    hint: "Individual nominations — fill out one row. Group nominations — row #1 is the Team Leader, then add up to four (4) Team Members. Each nominee must also submit their own supporting documents below.",
    fields: [
      {
        key: "nominees",
        label: "Nominee / Team Members",
        kind: "repeatable",
        required: true,
        span: 2,
        minRows: 1,
        maxRows: 5,
        addLabel: "Add Team Member",
        hint: "Row #1 is the Team Leader. Add up to four (4) additional members for group nominations.",
        rowFields: NOMINEE_ROW_FIELDS,
        rowDocs: NOMINEE_ROW_DOCS,
      },
    ],
  },
  {
    title: "Nominator Information",
    hint: "Click Select Nominator to pick an employee from your office. Use 'Change Nominator' to replace.",
    action: {
      label: "Select Nominator",
      icon: "person_search",
      handler: "openNominatorDialog",
    },
    fields: [
      {
        key: "nominator_name",
        label: "Full Name (First, Middle, Last, Extension Name if any)",
        kind: "text",
        required: true,
        span: 2,
        locked: true,
      },
      {
        key: "nominator_position",
        label: "Position Title (with Parenthetical Title/Rank, if applicable)",
        kind: "text",
        required: true,
        span: 2,
        locked: true,
      },
      {
        key: "nominator_phone_landline",
        label: "Phone / Landline",
        kind: "text",
        required: false,
        locked: true,
      },
      {
        key: "nominator_contact",
        label: "Mobile No.",
        kind: "phone",
        required: true,
        locked: true,
      },
      {
        key: "nominator_email",
        label: "Email Address",
        kind: "email",
        required: true,
        span: 2,
        locked: true,
      },
    ],
  },
  {
    title: "Executive Summary",
    hint: "Maximum of 350 words. May be used as the citation if the nominee becomes an awardee.",
    fields: [
      {
        key: "executive_summary_title",
        label: "Essay Title",
        kind: "text",
        required: true,
        span: 2,
      },
      {
        key: "executive_summary",
        label: "Essay Description (350 words max)",
        kind: "essay",
        required: true,
        maxWords: 350,
        span: 2,
        placeholder:
          "Write a concise summary of why this nominee/group deserves the award.",
      },
    ],
  },
  {
    title: "Accomplishments and Impact / Results",
    hint: "Three (3) top significant accomplishments within the last three (3) years. Each accomplishment and impact is limited to 300 words.",
    fields: [
      {
        key: "accomplishments",
        label: "Accomplishments",
        kind: "repeatable",
        required: true,
        span: 2,
        minRows: 1,
        addLabel: "Add Accomplishment",
        hint: "For group nominations, also fill the Contribution of Team Member/s column.",
        rowFields: ACCOMPLISHMENT_ROW_FIELDS,
      },
    ],
  },
  {
    title: "Additional Information",
    fields: [
      {
        key: "additional_info",
        label:
          "List major awards and/or citations received, membership in other organizations, and other relevant information on the individual/group nominee",
        kind: "textarea",
        required: false,
        span: 2,
        rows: 4,
        placeholder: "Optional — any other relevant details.",
      },
    ],
  },
];

/* =========================================================
   FORM SECTIONS PER TYPE
========================================================= */
export const TYPE_SECTIONS = {
  exam_passer: [
    {
      title: "Examination Details",
      fields: [
        {
          key: "administering_agency",
          label: "Administering Agency",
          kind: "select",
          required: true,
          placeholder: "Select administering agency",
          options: EXAM_AGENCIES,
        },
        {
          key: "exam_type",
          label: "Type of Examination Passed",
          kind: "select",
          required: true,
          searchable: true,
          dependsOn: "administering_agency",
          placeholder: "Select an agency first, then search",
          optionsFor: (data) =>
            EXAM_TYPES_BY_AGENCY[data?.administering_agency] || [],
        },
        {
          key: "exam_date",
          label: "Date of Examination",
          kind: "date",
          required: true,
        },
        {
          key: "testing_center",
          label: "Testing Center",
          kind: "text",
          required: true,
        },
        {
          key: "rating",
          label: "Examination Rating",
          kind: "rating",
          required: false,
          placeholder: "e.g. 87.40",
        },
      ],
    },
  ],

  award_recognition: [
    {
      title: "Award Information",
      fields: [
        {
          key: "award_title",
          label: "Title of Award",
          kind: "text",
          required: true,
          applyAll: true,
        },
        {
          key: "award_body",
          label: "Award Giving Body",
          kind: "text",
          required: true,
          applyAll: true,
        },
        {
          key: "event_name",
          label: "Name of Event or Activity",
          kind: "text",
          required: true,
          applyAll: true,
        },
        {
          key: "event_datetime",
          label: "Date and Time",
          kind: "datetime",
          required: true,
          applyAll: true,
        },
        {
          key: "venue",
          label: "Venue",
          kind: "text",
          required: true,
          applyAll: true,
        },
        {
          key: "award_type",
          label: "Type of Award",
          kind: "select",
          required: true,
          options: [
            { label: "Trophy", value: "Trophy" },
            { label: "Certificate", value: "Certificate" },
            { label: "Plaque of Recognition", value: "Plaque of Recognition" },
            { label: "Token of Appreciation", value: "Appreciation" },
          ],
        },
        {
          key: "recognition_level",
          label: "Level of Recognition",
          kind: "select",
          required: true,
          options: [
            { label: "Provincial", value: "provincial" },
            { label: "Regional", value: "regional" },
            { label: "National", value: "national" },
            { label: "International", value: "international" },
          ],
        },
      ],
    },
  ],

  form_b: [
    {
      title: "Award Information",
      fields: [
        {
          key: "award_basis",
          label: "Award Basis",
          kind: "select",
          required: true,
          applyAll: true,
          options: [
            { label: "Competition-based Award", value: "competition" },
            { label: "Citation-based Award", value: "citation" },
          ],
        },
        {
          key: "award_title",
          label: "Title of Award",
          kind: "text",
          required: true,
          applyAll: true,
        },
        {
          key: "award_body",
          label: "Award Giving Body",
          kind: "text",
          required: true,
          applyAll: true,
        },
        {
          key: "event_name",
          label: "Name of Event or Activity",
          kind: "text",
          required: true,
          applyAll: true,
        },
        {
          key: "event_datetime",
          label: "Date and Time",
          kind: "datetime",
          required: true,
          applyAll: true,
        },
        {
          key: "venue",
          label: "Venue",
          kind: "text",
          required: true,
          applyAll: true,
        },
        {
          key: "award_type",
          label: "Type of Award",
          kind: "select",
          required: true,
          options: [
            { label: "Trophy", value: "Trophy" },
            { label: "Certificate", value: "Certificate" },
            { label: "Plaque of Recognition", value: "Plaque of Recognition" },
            { label: "Token of Appreciation", value: "Appreciation" },
          ],
        },
        {
          key: "recognition_level",
          label: "Level of Recognition",
          kind: "select",
          required: true,
          dependsOn: "award_basis",
          placeholder:
            "Select an award basis first, then pick a recognition level",
          optionsFor: (data) => {
            if (data?.award_basis === "competition") {
              return [
                {
                  label: "International Level Awardee",
                  value: "International Level Awardee",
                },
                {
                  label: "National Level Top Awardee",
                  value: "National Level Top Awardee",
                },
                {
                  label: "National Level Runner-up",
                  value: "National Level Runner-up",
                },
                {
                  label: "Regional Level Awardee",
                  value: "Regional Level Awardee",
                },
                {
                  label: "Provincial Level Awardee",
                  value: "Provincial Level Awardee",
                },
              ];
            }
            if (data?.award_basis === "citation") {
              return [
                {
                  label: "International - Special Citation",
                  value: "International - Special Citation",
                },
                {
                  label: "National - Special Citation",
                  value: "National - Special Citation",
                },
                {
                  label: "Regional - Special Citation",
                  value: "Regional - Special Citation",
                },
                {
                  label: "Provincial - Special Citation",
                  value: "Provincial - Special Citation",
                },
              ];
            }
            return [];
          },
        },
      ],
    },
  ],

  graduate_studies: [
    {
      title: "Graduate Studies Details",
      fields: [
        {
          key: "degree_completed",
          label: "Degree Completed",
          kind: "text",
          required: true,
          placeholder: "e.g. Master of Arts in Education",
        },
        {
          key: "major_specialization",
          label: "Major / Specialization",
          kind: "text",
          required: false,
          placeholder: "Optional — leave blank if none",
        },
        {
          key: "mode_of_learning",
          label: "Mode of Learning",
          kind: "select",
          required: true,
          options: [
            { label: "Face-to-Face", value: "face_to_face" },
            { label: "Distance Learning", value: "distance_learning" },
            { label: "Online Learning", value: "online_learning" },
            { label: "Blended Learning", value: "blended_learning" },
          ],
        },
        {
          key: "university",
          label: "Name of College / University",
          kind: "text",
          required: true,
        },
        {
          key: "date_completed",
          label: "Date of Completion / Graduation",
          kind: "date",
          required: true,
        },
      ],
    },
  ],

  gawad_parangal_kawani: [
    {
      title: "Award Category",
      fields: [
        {
          key: "award_category",
          label: "Award Being Applied For",
          kind: "toggle",
          required: true,
          span: 2,
          options: [
            { label: "Dangal ng Lungsod Award", value: "dangal_ng_lungsod" },
            { label: "CG Tagum Pagasa Award", value: "cg_tagum_pagasa" },
          ],
        },
      ],
    },
    {
      title: "Personal Information",
      fields: [
        {
          key: "birthdate",
          label: "Birthdate",
          kind: "date",
          required: true,
          locked: true,
        },
        {
          key: "age",
          label: "Age",
          kind: "derived",
          derive: (data) => {
            if (!data?.birthdate) return "";
            const dob = new Date(data.birthdate);
            if (Number.isNaN(dob.getTime())) return "";
            const now = new Date();
            let age = now.getFullYear() - dob.getFullYear();
            const m = now.getMonth() - dob.getMonth();
            if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age -= 1;
            return age >= 0 && age < 150 ? String(age) : "";
          },
        },
        {
          key: "sex",
          label: "Sex",
          kind: "select",
          required: true,
          locked: true,
          options: [
            { label: "Male", value: "male" },
            { label: "Female", value: "female" },
          ],
        },
        {
          key: "place_of_birth",
          label: "Place of Birth",
          kind: "text",
          required: true,
          locked: true,
        },
        {
          key: "address",
          label: "Address",
          kind: "text",
          required: true,
          locked: true,
          span: 2,
        },
        {
          key: "email",
          label: "Email Address",
          kind: "email",
          required: true,
          placeholder: "name@example.com",
        },
      ],
    },
    {
      title: "Position Information",
      fields: [
        {
          key: "level",
          label: "Level",
          kind: "text",
          required: true,
          locked: true,
          placeholder: "e.g. 1st Level / 2nd Level",
        },
        {
          key: "division_section",
          label: "Division / Section",
          kind: "text",
          required: true,
          locked: true,
        },
        {
          key: "years_in_govt_service",
          label: "Years in Govt. Service",
          kind: "text",
          required: true,
          locked: true,
          placeholder: "e.g. 8 years 3 months",
        },
        {
          key: "office_email",
          label: "Office Email Address",
          kind: "email",
          required: true,
          placeholder: "office@example.com",
        },
        {
          key: "office_contact",
          label: "Office Contact No.",
          kind: "phone",
          required: true,
          placeholder: "09XXXXXXXXX",
        },
      ],
    },
    {
      title: "Previous Award",
      fields: [
        {
          key: "awarded_last_year",
          label: "Were you awarded under this program last year?",
          kind: "toggle",
          required: true,
          span: 2,
          options: [
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ],
        },
      ],
    },
    {
      title: "Nominees Reference — Head of Office / Department",
      fields: [
        {
          key: "head_name",
          label: "Name of Head of Office / Department",
          kind: "text",
          required: true,
          span: 2,
        },
        {
          key: "head_position",
          label: "Position",
          kind: "text",
          required: true,
        },
        {
          key: "head_contact",
          label: "Contact No.",
          kind: "text",
          required: true,
          placeholder: "09XXXXXXXXX",
        },
        {
          key: "head_email",
          label: "Email Address",
          kind: "email",
          required: true,
        },
      ],
    },
    {
      title: "Nominees Reference — Nominator / Technical Writer",
      fields: [
        {
          key: "nominator_name",
          label: "Name of Nominator / Technical Writer",
          kind: "text",
          required: true,
          span: 2,
        },
        {
          key: "nominator_position",
          label: "Position",
          kind: "text",
          required: true,
        },
        {
          key: "nominator_contact",
          label: "Contact No.",
          kind: "text",
          required: true,
          placeholder: "09XXXXXXXXX",
        },
        {
          key: "nominator_email",
          label: "Email Address",
          kind: "email",
          required: true,
        },
      ],
    },
    {
      title: "Executive Summary",
      fields: [
        {
          key: "essay_title",
          label: "Essay Title",
          kind: "text",
          required: true,
          span: 2,
          placeholder: "e.g. A Legacy of Service Beyond Duty",
        },
        {
          key: "essay_description",
          label: "Essay Description (350 words max)",
          kind: "essay",
          required: true,
          maxWords: 350,
          span: 2,
          placeholder:
            "Write a concise essay summarizing why this nominee deserves the Gawad Parangal Kawani (maximum of 350 words).",
        },
      ],
    },
    {
      title: "Accomplishments and Impact / Result",
      fields: [
        {
          key: "accomplishments",
          label: "Accomplishments and Impact",
          kind: "repeatable",
          required: true,
          span: 2,
          minRows: 1,
          addLabel: "Add Accomplishment",
          hint: "Add one or more accomplishment–impact pairs.",
          rowFields: [
            {
              key: "accomplishment",
              label: "Significant Accomplishment",
              kind: "textarea",
              required: true,
              rows: 4,
              placeholder:
                "Describe a key accomplishment, project, innovation, or service delivered.",
            },
            {
              key: "impact",
              label: "Impact / Result",
              kind: "textarea",
              required: true,
              rows: 4,
              placeholder:
                "Describe the measurable impact or result of this accomplishment.",
            },
          ],
        },
      ],
    },
    {
      title: "Additional Information",
      fields: [
        {
          key: "additional_info",
          label: "Additional Information",
          kind: "textarea",
          required: false,
          span: 2,
          placeholder: "Optional — any other relevant details.",
        },
      ],
    },
  ],

  gawad_lingkod_bayan: NATIONAL_AWARDS_SECTIONS,
  gawad_dangal_ng_bayan: NATIONAL_AWARDS_SECTIONS,
  gawad_pagasa: NATIONAL_AWARDS_SECTIONS,
};

/* =========================================================
   SUPPORTING DOCUMENTS PER TYPE
========================================================= */
export const TYPE_DOCS = {
  exam_passer: [
    {
      key: "report_of_rating",
      label: "Report of Rating",
      icon: "description",
      accept: ".pdf,.jpg,.jpeg,.png",
      optional: false,
    },
    {
      key: "recent_photo",
      label: "Recent Photo",
      icon: "photo_camera",
      accept: ".jpg,.jpeg,.png",
      optional: false,
    },
    {
      key: "csc_prc_screenshot",
      label: "Screenshot from CSC/PRC Website",
      icon: "screenshot",
      accept: ".jpg,.jpeg,.png,.pdf",
      optional: false,
    },
  ],
  award_recognition: [
    {
      key: "plaque_photo",
      label: "Photo of Plaque / Certificate / Trophy",
      icon: "emoji_events",
      accept: ".jpg,.jpeg,.png",
      optional: false,
    },
    {
      key: "awarding_photo",
      label: "Photo During Awarding",
      icon: "photo_library",
      accept: ".jpg,.jpeg,.png",
      optional: false,
    },
    {
      key: "invitation_copy",
      label: "Copy of Invitations",
      icon: "mail",
      accept: ".pdf,.jpg,.jpeg,.png",
      optional: false,
    },
  ],
  form_b: [
    {
      key: "plaque_photo",
      label: "Photo of Plaque / Certificate / Trophy",
      icon: "emoji_events",
      accept: ".jpg,.jpeg,.png",
      optional: false,
    },
    {
      key: "awarding_photo",
      label: "Photo During Awarding",
      icon: "photo_library",
      accept: ".jpg,.jpeg,.png",
      optional: false,
    },
    {
      key: "invitation_copy",
      label: "Copy of Invitations",
      icon: "mail",
      accept: ".pdf,.jpg,.jpeg,.png",
      optional: false,
    },
  ],
  graduate_studies: [
    {
      key: "graduation_certificate",
      label: "Certificate of Graduation / Completion",
      icon: "school",
      accept: ".pdf,.jpg,.jpeg,.png",
      optional: false,
    },
    {
      key: "yearbook_photo",
      label: "Graduation / Yearbook Photo",
      icon: "photo_camera",
      accept: ".jpg,.jpeg,.png",
      optional: true,
    },
    {
      key: "diploma_tor",
      label: "Diploma and/or TOR",
      icon: "description",
      accept: ".pdf,.jpg,.jpeg,.png",
      optional: false,
    },
  ],
  gawad_parangal_kawani: [],
  gawad_lingkod_bayan: NATIONAL_AWARDS_ENTRY_DOCS,
  gawad_dangal_ng_bayan: NATIONAL_AWARDS_ENTRY_DOCS,
  gawad_pagasa: NATIONAL_AWARDS_ENTRY_DOCS,
};

/* =========================================================
   STATUS METADATA
========================================================= */
export const STATUS_LABELS = {
  draft: "Draft",
  submitted: "Submitted",
  review: "Under Review",
  returned: "Returned",
  awaiting_hardcopy: "Awaiting Signed Form",
  hardcopy_submitted: "Signed Form Submitted",
  approved: "Approved",
  rejected: "Rejected",
  announced: "Announced",
};

export const STATUS_CLASSES = {
  draft: "status-draft",
  submitted: "status-submitted",
  review: "status-review",
  returned: "status-returned",
  awaiting_hardcopy: "status-awaiting",
  hardcopy_submitted: "status-hardcopy",
  approved: "status-approved",
  rejected: "status-rejected",
  announced: "status-announced",
};

export const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(
  ([value, label]) => ({ label, value })
);

export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/* =========================================================
   HELPERS — blank shapes
========================================================= */
function makeEmptyRow(field) {
  const row = {};
  (field.rowFields || []).forEach((f) => {
    row[f.key] = "";
  });
  if (Array.isArray(field.rowDocs) && field.rowDocs.length) {
    row.__docs = {};
    field.rowDocs.forEach((d) => {
      row.__docs[d.key] = null;
    });
  }
  return row;
}

export function blankData(type) {
  const data = {};
  (TYPE_SECTIONS[type] || []).forEach((section) => {
    section.fields.forEach((field) => {
      if (field.kind === "repeatable") {
        data[field.key] = [makeEmptyRow(field)];
      } else {
        data[field.key] = null;
      }
    });
  });
  return data;
}

/**
 * Kept for backwards compatibility — no-op.
 */
export function applyStaticDefaults(_type, data) {
  return data;
}

export function blankDocs(type) {
  const docs = {};
  (TYPE_DOCS[type] || []).forEach((doc) => {
    docs[doc.key] = null;
  });
  return docs;
}

/* =========================================================
   HELPERS — validation
========================================================= */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^09\d{9}$/;

export function fieldError(field, value) {
  if (field.kind === "repeatable") {
    const rows = Array.isArray(value) ? value : [];
    const min = field.minRows ?? 1;

    if (field.required && rows.length < min) {
      return `Add at least ${min} ${min === 1 ? "entry" : "entries"} to ${
        field.label || "this section"
      }`;
    }

    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i] || {};

      for (const sub of field.rowFields || []) {
        if (sub.groupOnly && !field._isGroupMode) continue;
        const err = fieldError(sub, row[sub.key]);
        if (err) {
          return `${field.label || "Entry"} #${i + 1}: ${err}`;
        }
      }

      for (const doc of field.rowDocs || []) {
        if (doc.optional) continue;
        if (doc.groupOnly && !field._isGroupMode) continue;
        const hasNew = !!(row.__docs && row.__docs[doc.key]);
        const hasExisting = !!(
          row.__existing_docs && row.__existing_docs[doc.key]
        );
        if (!hasNew && !hasExisting) {
          return `${field.label || "Entry"} #${i + 1}: ${
            doc.label
          } is required`;
        }
      }
    }
    return null;
  }

  const filled = String(value ?? "").trim();

  if (field.required && !filled) {
    return `${field.label} is required`;
  }

  if (field.kind === "rating" && filled) {
    const n = Number(filled);
    if (Number.isNaN(n)) return "Rating must be a number";
    if (n < 0 || n > 100) return "Rating must be between 0 and 100";
  }

  if (field.kind === "email" && filled) {
    if (!EMAIL_RE.test(filled)) return "Please enter a valid email address";
  }

  if (field.kind === "phone" && filled) {
    if (!PHONE_RE.test(filled)) {
      return "Enter 11 digits starting with 09 (e.g. 09171234567)";
    }
  }

  if ((field.kind === "essay" || field.kind === "textarea") && filled) {
    if (field.maxWords) {
      const words = filled.split(/\s+/).filter(Boolean).length;
      if (words > field.maxWords) {
        return `${field.label} must be ${field.maxWords} words or fewer (currently ${words})`;
      }
    }
  }

  return null;
}

export function validateEntry(type, entry) {
  if (!entry) return { message: "Entry is missing" };

  if (!entry.is_office) {
    const phone = String(entry.mobile_no || "").trim();
    if (
      type !== "gawad_lingkod_bayan" &&
      type !== "gawad_dangal_ng_bayan" &&
      type !== "gawad_pagasa"
    ) {
      if (!PHONE_RE.test(phone)) {
        return { message: "Mobile number must be 11 digits starting with 09" };
      }
    }
  }

  const isGroupMode =
    entry?.data?.__nomination_mode === "group" ||
    entry?.nomination_mode === "group";

  const sections = TYPE_SECTIONS[type] || [];
  for (const section of sections) {
    for (const field of section.fields) {
      if (field.kind === "derived") continue;

      const fieldWithMode =
        field.kind === "repeatable"
          ? { ...field, _isGroupMode: isGroupMode }
          : field;

      const err = fieldError(fieldWithMode, entry.data?.[field.key]);
      if (err) return { message: err };
    }
  }

  const docs = TYPE_DOCS[type] || [];
  for (const doc of docs) {
    if (doc.optional) continue;
    if (doc.groupOnly && !isGroupMode) continue;
    const hasNew = !!entry.docs?.[doc.key];
    const hasExisting = !!entry.existing_docs?.[doc.key];
    if (!hasNew && !hasExisting) {
      return { message: `${doc.label} is required` };
    }
  }

  return null;
}

/* =========================================================
   HELPERS — formatting
========================================================= */
export function detailsSummary(row) {
  const d = row?.details || {};

  if (row?.type === "exam_passer") {
    return [d.exam_type, d.administering_agency].filter(Boolean).join(" • ");
  }
  if (row?.type === "award_recognition" || row?.type === "form_b") {
    return [d.award_title, d.award_body].filter(Boolean).join(" • ");
  }
  if (row?.type === "graduate_studies") {
    return [d.degree_completed, d.university].filter(Boolean).join(" • ");
  }
  if (row?.type === "gawad_parangal_kawani") {
    return [d.years_in_govt_service].filter(Boolean).join("");
  }
  if (
    row?.type === "gawad_lingkod_bayan" ||
    row?.type === "gawad_dangal_ng_bayan" ||
    row?.type === "gawad_pagasa"
  ) {
    const first = Array.isArray(d.nominees) ? d.nominees[0] : null;
    const others = Array.isArray(d.nominees) ? d.nominees.length - 1 : 0;
    if (first?.full_name) {
      return others > 0
        ? `${first.full_name} + ${others} more`
        : first.full_name;
    }
  }
  return "";
}

export function eventDate(row) {
  const d = row?.details || {};
  if (row?.type === "exam_passer") return d.exam_date || null;
  if (row?.type === "award_recognition" || row?.type === "form_b")
    return d.event_datetime || null;
  if (row?.type === "graduate_studies") return d.date_completed || null;
  if (row?.type === "gawad_parangal_kawani") return row?.created_at || null;
  return row?.created_at || null;
}

export function normalizePhone(value) {
  if (!value) return "";
  const digits = String(value).replace(/\D/g, "");
  if (digits.length === 10 && digits.startsWith("9")) return "0" + digits;
  if (digits.length === 11 && digits.startsWith("0")) return digits;
  if (digits.length === 12 && digits.startsWith("63"))
    return "0" + digits.slice(2);
  return digits.slice(0, 11);
}

export function getStoredOffice() {
  try {
    const direct = localStorage.getItem("office");
    if (direct) return direct;
    const raw = localStorage.getItem("authUser");
    if (!raw) return "";
    const parsed = JSON.parse(raw);
    return parsed?.office || "";
  } catch {
    return "";
  }
}
