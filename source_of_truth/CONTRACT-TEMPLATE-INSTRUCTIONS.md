# Contract Template DOCX

This repository ships with the script and annotated source needed to build an exportable DOCX
template, but the DOCX itself is **not** committed (binary files are blocked in this project).
Generate the DOCX locally when needed and upload it to your storage target; do not add it to git.

## Files
- `contract-template-annotated.html` – source of truth with mapping and conditional logic
- `generate_contract_template.py` – one-step exporter that builds the DOCX from the annotated HTML
  into `source_of_truth/contract-template.docx`

## Regenerating the DOCX
1. From the repository root run:
   ```bash
   python source_of_truth/generate_contract_template.py
   ```
2. The script reads `contract-template-annotated.html`, strips annotations, and writes
   `source_of_truth/contract-template.docx`.
3. Commit both the regenerated DOCX and any related source updates so downstream systems stay in sync.

## How to Use the Template
- Replace placeholders like `[LANDLORD_NAME]`, `[TENANT_NAME]`, `[OBJEKTADRESSE]`, etc. with data
  from the client and lawyer forms before sending the document to customers.
- Conditional paragraphs remain in the DOCX. Apply your business rules to decide whether a section
  (e.g., WEG paragraph or cosmetic repairs variant) is included or removed before delivery.
- The backend expects this file at `templates/contract-template.docx` (see
  `backend/local.settings.json`), so upload the generated DOCX to your configured storage
  container at that path.

## Change Management
- Make text or placeholder edits in `contract-template-annotated.html` first so the authoritative
  documentation stays current.
- Regenerate the DOCX with the script and verify that placeholders still match your replacement
  logic.
- If you introduce new placeholders, update your backend replacement code and any mapping tables
  accordingly.
