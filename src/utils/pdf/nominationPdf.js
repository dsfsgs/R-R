// src/utils/pdf/nominationPdf.js
//
// Dispatcher. Picks the right form file based on record.type.
// Each form file is fully standalone — no shared imports.

import { buildFormA } from "src/utils/pdf/formA";
import { buildFormB } from "src/utils/pdf/formB";
import { buildFormC } from "src/utils/pdf/formC";

export function buildNominationPdf(record, options = {}) {
  switch (record.type) {
    case "exam_passer":
      return buildFormA(record, options);

    case "award_recognition":
      return buildFormB(record, options);

    case "graduate_studies":
      return buildFormC(record, options);

    default:
      throw new Error(`Unknown nomination type: ${record.type}`);
  }
}
