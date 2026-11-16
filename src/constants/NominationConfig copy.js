// src/constants/NominationConfig.js

/* =========================================================
   NOMINATION TYPES (static fallback — the live list now comes
   from the backend via useNominationTypeStore)
========================================================= */
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

/* =========================================================
   NOMINATION TYPE GROUPS (backend-driven)
========================================================= */
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

/* =========================================================
   TYPE FLAGS (per code)
========================================================= */
export const TYPE_FLAGS = {
  // ── LOCAL PRAISE AWARDS ───────────────────────────────
  exam_passer: {
    batch: true,
    officeNominee: false,
    applyToAll: true,
    hint: "batch entry; shared fields can be copied to all",
  },
  graduate_studies: {
    batch: false,
    officeNominee: false,
    applyToAll: false,
    hint: "each employee has unique graduate details",
  },
  gawad_parangal_kawani: {
    batch: false,
    officeNominee: false,
    applyToAll: false,
    hint: "each employee has unique personal and accomplishment details",
  },
  form_b: {
    batch: true,
    officeNominee: true,
    applyToAll: true,
    hint: "batch entry; shared fields can be copied to all",
  },

  // ── NATIONAL AWARDS ───────────────────────────────────
  gawad_lingkod_bayan: {
    batch: false,
    officeNominee: false,
    applyToAll: false,
    hint: "individual national award nomination",
  },
  gawad_dangal_ng_bayan: {
    batch: false,
    officeNominee: false,
    applyToAll: false,
    hint: "individual national award nomination",
  },
  gawad_pagasa: {
    batch: false,
    officeNominee: false,
    applyToAll: false,
    hint: "individual national award nomination",
  },

  // ── CUSTOMIZED REWARDS ────────────────────────────────
  customized_most_outstanding_head: {
    batch: false,
    officeNominee: false,
    applyToAll: false,
    hint: "individual award nomination",
  },
  customized_most_productive_unit: {
    batch: false,
    officeNominee: true,
    applyToAll: false,
    hint: "office-level award nomination",
  },
  customized_best_attendance: {
    batch: false,
    officeNominee: false,
    applyToAll: false,
    hint: "individual award nomination",
  },
  customized_top_performing_employee: {
    batch: false,
    officeNominee: false,
    applyToAll: false,
    hint: "individual award nomination",
  },
  customized_service_award: {
    batch: false,
    officeNominee: false,
    applyToAll: false,
    hint: "individual award nomination",
  },
  customized_exemplary_behavior: {
    batch: false,
    officeNominee: false,
    applyToAll: false,
    hint: "individual award nomination",
  },
};

/* =========================================================
   TYPE → LABEL / CLASS MAPS
========================================================= */
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

  // Same form as award_recognition — reuse it.
  form_b: [
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
          key: "essay",
          label: "Essay (350 words max)",
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

/* =========================================================
   FILE LIMITS
========================================================= */
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/* =========================================================
   HELPERS — blank shapes
========================================================= */
function makeEmptyRow(field) {
  const row = {};
  (field.rowFields || []).forEach((f) => {
    row[f.key] = "";
  });
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
  // Repeatable groups: value is an array of row objects.
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
        const err = fieldError(sub, row[sub.key]);
        if (err) {
          return `${field.label || "Entry"} #${i + 1}: ${err}`;
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
    if (!PHONE_RE.test(phone)) {
      return {
        message: "Mobile number must be 11 digits starting with 09",
      };
    }
  }

  const sections = TYPE_SECTIONS[type] || [];
  for (const section of sections) {
    for (const field of section.fields) {
      if (field.kind === "derived") continue;
      const err = fieldError(field, entry.data?.[field.key]);
      if (err) return { message: err };
    }
  }

  const docs = TYPE_DOCS[type] || [];
  for (const doc of docs) {
    if (doc.optional) continue;
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
  return "";
}

export function eventDate(row) {
  const d = row?.details || {};

  if (row?.type === "exam_passer") return d.exam_date || null;
  if (row?.type === "award_recognition" || row?.type === "form_b") {
    return d.event_datetime || null;
  }
  if (row?.type === "graduate_studies") return d.date_completed || null;
  if (row?.type === "gawad_parangal_kawani") {
    return row?.created_at || null;
  }

  return row?.created_at || null;
}

export function normalizePhone(value) {
  if (!value) return "";
  const digits = String(value).replace(/\D/g, "");

  if (digits.length === 10 && digits.startsWith("9")) return "0" + digits;
  if (digits.length === 11 && digits.startsWith("0")) return digits;
  if (digits.length === 12 && digits.startsWith("63")) {
    return "0" + digits.slice(2);
  }
  return digits.slice(0, 11);
}

/* =========================================================
   HELPERS — storage
========================================================= */
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
