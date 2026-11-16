// src/stores/nominationStore.js
import { defineStore } from "pinia";
import { ref } from "vue";
import { api } from "boot/axios";

export const useNominationStore = defineStore("nomination", () => {
  const nominations = ref([]);
  const isLoading = ref(false);

  // -------------------------------------------------------------------
  function getById(id) {
    return nominations.value.find((n) => String(n.id) === String(id)) || null;
  }

  function replaceRow(id, updated) {
    if (!updated) return;
    const idx = nominations.value.findIndex((n) => String(n.id) === String(id));
    if (idx >= 0) nominations.value[idx] = updated;
  }

  // -------------------------------------------------------------------
  // Signed-form key registry.
  //
  // MUST match NominationService::signedDocumentKeysFor() on the backend.
  // If a type ever needs multiple signed forms, list them here — the page
  // renders one uploader per key.
  // -------------------------------------------------------------------
  const SIGNED_FORM_KEYS = {
    default: ["signed_form"],
    gawad_lingkod_bayan: ["signed_form"],
    gawad_dangal_ng_bayan: ["signed_form"],
    gawad_pagasa: ["signed_form"],
  };

  function signedFormKeysFor(type) {
    return SIGNED_FORM_KEYS[type] || SIGNED_FORM_KEYS.default;
  }

  // -------------------------------------------------------------------
  async function fetchForOffice() {
    isLoading.value = true;
    try {
      const { data } = await api.get("/nominations");
      nominations.value = Array.isArray(data) ? data : [];
      return { success: true, message: "Nominations loaded." };
    } catch (err) {
      return {
        success: false,
        message: err?.response?.data?.message || "Unable to load nominations.",
      };
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchForHr(filters = {}) {
    isLoading.value = true;
    try {
      const params = {};
      if (filters.office) params.office = filters.office;
      if (filters.type) params.type = filters.type;
      if (filters.status) params.status = filters.status;
      if (filters.includeDrafts) params.include_drafts = 1;

      const { data } = await api.get("/hr/nominations", { params });
      nominations.value = Array.isArray(data) ? data : [];
      return { success: true, message: "Nominations loaded." };
    } catch (err) {
      return {
        success: false,
        message: err?.response?.data?.message || "Unable to load nominations.",
      };
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchOne(id, { cache = true } = {}) {
    if (cache) {
      const existing = nominations.value.find(
        (n) => String(n.id) === String(id)
      );
      if (existing && Array.isArray(existing.status_history)) {
        return { success: true, data: existing };
      }
    }
    try {
      const { data } = await api.get(`/nominations/${id}`);
      replaceRow(id, data);
      return { success: true, data };
    } catch (err) {
      return {
        success: false,
        message: err?.response?.data?.message || "Unable to load nomination.",
      };
    }
  }

  // -------------------------------------------------------------------
  // CREATE — signed forms travel per-entry: entries[i].signed_forms[key]
  // -------------------------------------------------------------------
  async function createBatch(payload) {
    isLoading.value = true;
    try {
      const hasFiles = batchHasFiles(payload);

      const response = hasFiles
        ? await api.post("/nominations", buildBatchFormData(payload), {
            headers: { "Content-Type": "multipart/form-data" },
          })
        : await api.post("/nominations", payload);

      const created = Array.isArray(response.data.data)
        ? response.data.data
        : [];
      nominations.value = [...created, ...nominations.value];
      return { success: true, message: response.data.message, data: created };
    } catch (err) {
      const res = err?.response?.data;
      return {
        success: false,
        message: res?.message || "Unable to save nomination.",
        errors: res?.errors || null,
      };
    } finally {
      isLoading.value = false;
    }
  }

  // -------------------------------------------------------------------
  // UPDATE — signed forms travel at root: signed_forms[key]
  // -------------------------------------------------------------------
  async function updateNomination(id, changes) {
    isLoading.value = true;
    try {
      const hasFiles = entryHasFiles(changes) || hasSignedForms(changes);

      let response;
      if (hasFiles) {
        const fd = buildUpdateFormData(changes);
        fd.append("_method", "PUT");
        response = await api.post(`/nominations/${id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await api.put(`/nominations/${id}`, changes);
      }

      const updated = response.data.data;
      replaceRow(id, updated);
      return { success: true, message: response.data.message, data: updated };
    } catch (err) {
      const res = err?.response?.data;
      return {
        success: false,
        message: res?.message || "Unable to update nomination.",
        errors: res?.errors || null,
      };
    } finally {
      isLoading.value = false;
    }
  }

  // -------------------------------------------------------------------
  // SUBMIT — signed forms travel at root, optionally included
  // -------------------------------------------------------------------
  async function submitNomination(id, signedForms = null) {
    isLoading.value = true;
    try {
      let response;
      const hasSigned = signedForms && Object.values(signedForms).some(isFile);

      if (hasSigned) {
        const fd = new FormData();
        Object.entries(signedForms).forEach(([key, file]) => {
          if (isFile(file)) fd.append(`signed_forms[${key}]`, toRawFile(file));
        });
        response = await api.post(`/nominations/${id}/submit`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await api.post(`/nominations/${id}/submit`);
      }

      const updated = response.data.data;
      replaceRow(id, updated);
      return { success: true, message: response.data.message, data: updated };
    } catch (err) {
      const res = err?.response?.data;
      return {
        success: false,
        message: res?.message || "Unable to submit nomination.",
        errors: res?.errors || null,
        missing: res?.missing || null,
      };
    } finally {
      isLoading.value = false;
    }
  }

  async function removeNomination(id) {
    isLoading.value = true;
    try {
      const { data } = await api.delete(`/nominations/${id}`);
      nominations.value = nominations.value.filter(
        (n) => String(n.id) !== String(id)
      );
      return { success: true, message: data.message };
    } catch (err) {
      return {
        success: false,
        message:
          err?.response?.data?.message || "Unable to withdraw nomination.",
      };
    } finally {
      isLoading.value = false;
    }
  }

  // ===================================================================
  // HR REVIEW ACTIONS — unchanged except awaitHardcopy removed
  // ===================================================================
  async function review(id) {
    isLoading.value = true;
    try {
      const { data } = await api.post(`/nominations/${id}/review`);
      const updated = data.data;
      replaceRow(id, updated);
      return { success: true, message: data.message, data: updated };
    } catch (err) {
      return {
        success: false,
        message: err?.response?.data?.message || "Unable to start review.",
      };
    } finally {
      isLoading.value = false;
    }
  }

  async function returnNomination(id, remarks) {
    isLoading.value = true;
    try {
      const { data } = await api.post(`/nominations/${id}/return`, {
        remarks,
      });
      const updated = data.data;
      replaceRow(id, updated);
      return { success: true, message: data.message, data: updated };
    } catch (err) {
      return {
        success: false,
        message: err?.response?.data?.message || "Unable to return nomination.",
        errors: err?.response?.data?.errors || null,
      };
    } finally {
      isLoading.value = false;
    }
  }

  async function reject(id, remarks) {
    isLoading.value = true;
    try {
      const { data } = await api.post(`/nominations/${id}/reject`, {
        remarks,
      });
      const updated = data.data;
      replaceRow(id, updated);
      return { success: true, message: data.message, data: updated };
    } catch (err) {
      return {
        success: false,
        message: err?.response?.data?.message || "Unable to reject nomination.",
        errors: err?.response?.data?.errors || null,
      };
    } finally {
      isLoading.value = false;
    }
  }

  // ===================================================================
  // SIGNED FORM — dedicated upload endpoint kept for save-as-draft flow
  // (Submit paths now carry signed forms inline; this is optional.)
  // ===================================================================
  async function uploadSignedForm(id, key, file) {
    try {
      const fd = new FormData();
      fd.append("file", toRawFile(file));
      const { data } = await api.post(
        `/nominations/${id}/signed-form/${key}`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return { success: true, message: data.message, data: data.data };
    } catch (err) {
      return {
        success: false,
        message:
          err?.response?.data?.message || "Unable to upload the signed form.",
        errors: err?.response?.data?.errors || null,
      };
    }
  }

  async function approve(id, payload = {}) {
    isLoading.value = true;
    try {
      const { data } = await api.post(`/nominations/${id}/approve`, payload);
      const updated = data.data;
      replaceRow(id, updated);
      return { success: true, message: data.message, data: updated };
    } catch (err) {
      return {
        success: false,
        message:
          err?.response?.data?.message || "Unable to approve nomination.",
        errors: err?.response?.data?.errors || null,
      };
    } finally {
      isLoading.value = false;
    }
  }

  async function updateSchedule(id, payload) {
    isLoading.value = true;
    try {
      const { data } = await api.patch(`/nominations/${id}/schedule`, payload);
      const updated = data.data;
      replaceRow(id, updated);
      return { success: true, message: data.message, data: updated };
    } catch (err) {
      return {
        success: false,
        message: err?.response?.data?.message || "Unable to update schedule.",
        errors: err?.response?.data?.errors || null,
      };
    } finally {
      isLoading.value = false;
    }
  }

  async function announce(id, remarks = null) {
    isLoading.value = true;
    try {
      const { data } = await api.post(`/nominations/${id}/announce`, {
        remarks,
      });
      const updated = data.data;
      replaceRow(id, updated);
      return { success: true, message: data.message, data: updated };
    } catch (err) {
      return {
        success: false,
        message:
          err?.response?.data?.message || "Unable to announce nomination.",
      };
    } finally {
      isLoading.value = false;
    }
  }

  // ===================================================================
  // LEGACY DOCUMENT UPLOAD ENDPOINTS
  // ===================================================================
  async function uploadDocument(id, key, file) {
    try {
      const fd = new FormData();
      fd.append("file", toRawFile(file));
      const { data } = await api.post(
        `/nominations/${id}/documents/${key}`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return { success: true, message: data.message, data: data.data };
    } catch (err) {
      return {
        success: false,
        message:
          err?.response?.data?.message || "Unable to upload the document.",
        errors: err?.response?.data?.errors || null,
      };
    }
  }

  async function uploadNomineeDocument(id, rowIdx, docKey, file) {
    try {
      const fd = new FormData();
      fd.append("file", toRawFile(file));
      const { data } = await api.post(
        `/nominations/${id}/nominee-documents/${rowIdx}/${docKey}`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return { success: true, message: data.message, data: data.data };
    } catch (err) {
      return {
        success: false,
        message:
          err?.response?.data?.message ||
          "Unable to upload the nominee document.",
        errors: err?.response?.data?.errors || null,
      };
    }
  }

  async function uploadDocuments(id, docsMap) {
    if (!docsMap || typeof docsMap !== "object") {
      return { success: true, message: "Nothing to upload.", data: {} };
    }

    const uploaded = {};
    for (const [key, file] of Object.entries(docsMap)) {
      if (!isFile(file)) continue;
      const res = await uploadDocument(id, key, file);
      if (!res.success) {
        return {
          success: false,
          message: res.message,
          data: uploaded,
          failedKey: key,
        };
      }
      uploaded[key] = res.data;
    }

    return {
      success: true,
      message: `${Object.keys(uploaded).length} document(s) uploaded.`,
      data: uploaded,
    };
  }

  return {
    nominations,
    isLoading,
    getById,
    signedFormKeysFor,
    fetchForOffice,
    fetchForHr,
    fetchOne,
    createBatch,
    updateNomination,
    submitNomination,
    removeNomination,
    review,
    returnNomination,
    reject,
    uploadSignedForm,
    approve,
    updateSchedule,
    announce,
    uploadDocument,
    uploadDocuments,
    uploadNomineeDocument,
  };
});

// ===========================================================================
// Helpers
// ===========================================================================

function isFile(v) {
  if (!v) return false;
  if (typeof File !== "undefined" && v instanceof File) return true;
  return (
    typeof v === "object" &&
    Object.prototype.toString.call(v) === "[object File]"
  );
}

function toRawFile(file) {
  if (typeof File !== "undefined" && file instanceof File) return file;
  return file?.__v_raw || file;
}

/** Any File on any entry (docs, nominee_docs, OR signed_forms)? */
function batchHasFiles(payload) {
  if (!Array.isArray(payload?.entries)) return false;
  return payload.entries.some(entryHasFiles);
}

function entryHasFiles(entry) {
  if (!entry) return false;
  if (Object.values(entry.docs || {}).some(isFile)) return true;
  if (Object.values(entry.nominee_docs || {}).some(isFile)) return true;
  if (Object.values(entry.signedForms || {}).some(isFile)) return true;
  return false;
}

function hasSignedForms(changes) {
  if (!changes) return false;
  return Object.values(changes.signedForms || {}).some(isFile);
}

/** Recursively append a plain object / array / scalar to FormData. */
function appendNested(fd, prefix, value, { skipKeys = [] } = {}) {
  if (value === null || value === undefined) return;

  if (Array.isArray(value)) {
    value.forEach((v, i) =>
      appendNested(fd, `${prefix}[${i}]`, v, { skipKeys })
    );
    return;
  }

  if (typeof value === "object" && !isFile(value)) {
    Object.entries(value).forEach(([k, v]) => {
      if (skipKeys.includes(k)) return;
      appendNested(fd, `${prefix}[${k}]`, v, { skipKeys });
    });
    return;
  }

  fd.append(prefix, String(value));
}

function splitNomineeDocKey(k) {
  const sep = k.indexOf("_");
  if (sep < 0) return [null, k];
  return [k.slice(0, sep), k.slice(sep + 1)];
}

/** Batch: entries[i][...] with per-entry signed forms. */
function buildBatchFormData(payload) {
  const fd = new FormData();

  ["type", "nominee_type", "nomination_mode", "office", "status"].forEach(
    (k) => {
      if (payload[k] !== undefined && payload[k] !== null) {
        fd.append(k, String(payload[k]));
      }
    }
  );
  if (payload.agency_officials) {
    fd.append("agency_officials", JSON.stringify(payload.agency_officials));
  }

  (payload.entries || []).forEach((entry, i) => {
    appendEntryScalars(fd, `entries[${i}]`, entry);
    appendDetails(fd, `entries[${i}][details]`, entry.details);
    appendDocs(fd, `entries[${i}][docs]`, entry.docs);
    appendNomineeDocs(
      fd,
      `entries[${i}][details][nominees]`,
      entry.nominee_docs
    );
    // NEW: signed forms per-entry
    appendSignedForms(fd, `entries[${i}][signed_forms]`, entry.signedForms);
  });

  return fd;
}

/** Single-entry update: root-level, including signed_forms. */
function buildUpdateFormData(changes) {
  const fd = new FormData();

  [
    "control_no",
    "employee",
    "position",
    "mobile_no",
    "department",
    "employment_status",
    "status",
    "nomination_mode",
  ].forEach((k) => {
    if (changes[k] !== undefined && changes[k] !== null) {
      fd.append(k, String(changes[k]));
    }
  });

  if (changes.is_office !== undefined) {
    fd.append("is_office", changes.is_office ? "1" : "0");
  }
  if (changes.is_complete !== undefined) {
    fd.append("is_complete", changes.is_complete ? "1" : "0");
  }
  if (changes.agency_officials) {
    fd.append("agency_officials", JSON.stringify(changes.agency_officials));
  }

  appendDetails(fd, "details", changes.details);
  appendDocs(fd, "docs", changes.docs);
  appendNomineeDocs(fd, "details[nominees]", changes.nominee_docs);
  // NEW: signed forms at root
  appendSignedForms(fd, "signed_forms", changes.signedForms);

  return fd;
}

function appendEntryScalars(fd, prefix, entry) {
  const scalarKeys = [
    "control_no",
    "employee",
    "position",
    "mobile_no",
    "department",
    "employment_status",
  ];
  scalarKeys.forEach((k) => {
    if (entry[k] !== undefined && entry[k] !== null && entry[k] !== "") {
      fd.append(`${prefix}[${k}]`, String(entry[k]));
    }
  });
  if (entry.is_office !== undefined) {
    fd.append(`${prefix}[is_office]`, entry.is_office ? "1" : "0");
  }
  if (entry.is_complete !== undefined) {
    fd.append(`${prefix}[is_complete]`, entry.is_complete ? "1" : "0");
  }
}

function appendDetails(fd, prefix, details) {
  if (!details) return;
  appendNested(fd, prefix, details, {
    skipKeys: ["__docs", "__existing_docs", "_docs"],
  });
}

function appendDocs(fd, prefix, docs) {
  if (!docs) return;
  Object.entries(docs).forEach(([key, file]) => {
    if (isFile(file)) fd.append(`${prefix}[${key}]`, toRawFile(file));
  });
}

function appendNomineeDocs(fd, nomineesPrefix, nomineeDocs) {
  if (!nomineeDocs) return;
  Object.entries(nomineeDocs).forEach(([combined, file]) => {
    if (!isFile(file)) return;
    const [rowIdx, docKey] = splitNomineeDocKey(combined);
    if (rowIdx === null) return;
    fd.append(
      `${nomineesPrefix}[${rowIdx}][__docs][${docKey}]`,
      toRawFile(file)
    );
  });
}

/** NEW: signed_forms[key] = File. */
function appendSignedForms(fd, prefix, signedForms) {
  if (!signedForms) return;
  Object.entries(signedForms).forEach(([key, file]) => {
    if (isFile(file)) fd.append(`${prefix}[${key}]`, toRawFile(file));
  });
}
