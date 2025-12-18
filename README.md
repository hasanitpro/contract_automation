# Contract Automation

This repository contains the backend Azure Functions that capture contract input data ("Mask A") and generate populated rental contracts from stored templates.

## Repository layout
- `backend/save_mask_a`: Azure Function that validates Mask A submissions and persists them to Azure Table Storage (`MaskAInput`).
- `backend/generate_contract`: Azure Function that builds a contract context from Mask A/B payloads, fills a DOCX/HTML template, and uploads the generated contract to blob storage.
- `backend/domain/contract_context.py`: Domain logic for composing the contract placeholder context, including Mietpreisbremse (MPB) cascades and validation helpers.
- `frontend` and `source_of_truth`: Supporting assets for the end-to-end workflow.

## Local backend setup and testing
Follow these steps to run the backend functions locally with Azurite for storage emulation.

1. **Install prerequisites**
   - Python 3.10+ with `venv` support.
   - [Azure Functions Core Tools v4](https://learn.microsoft.com/azure/azure-functions/functions-run-local) (includes the `func` CLI).
   - [Azurite](https://learn.microsoft.com/azure/storage/common/storage-use-azurite) for local Table/Blob Storage (NPM package or Docker container).

2. **Start Azurite** (in a separate terminal):
   ```bash
   azurite --tableHost 0.0.0.0 --blobHost 0.0.0.0
   ```
   The default connection string `UseDevelopmentStorage=true` in `backend/local.settings.json` assumes Azurite is running on the default ports.

3. **Create and activate a virtual environment**
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

4. **Configure settings**
   - Update `backend/local.settings.json` if you want to override defaults:
     - `MaskAInput`: Connection string for Azure Table Storage used by `save_mask_a` (defaults to Azurite when unset).
     - `TemplateBlobConnection`, `TemplateBlobPath`, `TemplatesContainer`: Where contract templates are stored.
     - `ContractsBlobConnection`, `ContractsContainer`: Where generated contracts are uploaded.
   - You can also supply these values via environment variables when running `func start`.

5. **Run the Functions host**
   ```bash
   func start
   ```
   The `save_mask_a` and `generate_contract` endpoints will be available at the URLs printed by the host (typically `http://localhost:7071/api/<functionName>`).

6. **Smoke-test the endpoints**
   - **Mask A**: Submit a sample payload to `save_mask_a`:
     ```bash
     curl -X POST http://localhost:7071/api/save_mask_a \
       -H "Content-Type: application/json" \
       -d '{"rolle": "Vermieter", "eigene_name": "A", "eigene_anschrift": "Addr", "eigene_email": "a@example.com", "eigene_telefon": "123", "eigene_iban": "DE12", "gegenpartei_bekannt": "Ja", "gegenpartei_name": "B", "gegenpartei_anschrift": "Addr B", "objektadresse": "Obj", "wohnungsart": "Wohnung", "wohnflaeche": "50", "bezugsfertig": "2014-01-01", "mietbeginn": "2024-01-01", "vertragsart": "Miete", "grundmiete": "1000", "kaution": "1000", "kaution_zahlweise": "einmalig"}'
     ```
   - **Contract generation**: Post a request with matching `maskA`/`maskB` data to `generate_contract` (ensure a template exists at `TemplateBlobPath`):
     ```bash
     curl -X POST http://localhost:7071/api/generate_contract \
       -H "Content-Type: application/json" \
       -d '{"maskA": {"rolle": "Vermieter", "eigene_name": "A", "eigene_anschrift": "Addr", "eigene_email": "a@example.com", "eigene_telefon": "123", "eigene_iban": "DE12", "gegenpartei_bekannt": "Ja", "gegenpartei_name": "B", "gegenpartei_anschrift": "Addr B", "objektadresse": "Obj", "wohnung_bez": "Unit 1", "wohnflaeche": "50", "bezugsfertig": "2014-01-01", "mietbeginn": "2024-01-01", "vertragsart": "Miete", "grundmiete": "1000", "kaution": "1000", "kaution_zahlweise": "einmalig", "zustand": "renoviert"}, "maskB": {"kuendigungsverzicht": 0, "mpb_status": "Bereits vermietet", "mpb_vormiet": "vor dem 1. Juni 2015", "mpb_grenze": "Ja, unter Grenze"}}'
     ```

## Backend improvement plan
Planned refinements identified while reviewing the current backend implementation:
- **Persisting Mask A submissions (`backend/save_mask_a/__init__.py`)**: add server-side timestamps and caller metadata to stored entities, harden validation for optional/extra fields, and introduce unit coverage for table write failures.
- **Contract generation flow (`backend/generate_contract/__init__.py`)**: consolidate template/contract storage configuration, expand error responses with actionable hints (e.g., missing template blobs), and add integration-style tests around `_load_template`, `_render_docx_template`, and `_upload_contract` for both Azurite and real storage.
- **Domain context builder (`backend/domain/contract_context.py`)**: cover edge cases in `_build_mpb_clause` (invalid date formats, multi-justification scenarios), strengthen placeholder validation, and expose reusable formatters for other functions that may share contract context logic.
