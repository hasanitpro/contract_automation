# Azure Functions Backend

This backend now exposes two HTTP-triggered Azure Functions that replace the
previous HTML template rendering and template listing APIs. Both functions run
in Python 3.11 and rely on Azure Table and Blob Storage.

## Functions

### `save_mask_a` — `POST /api/save_mask_a`
- **Purpose:** persists Mask A submissions for later contract generation.
- **Required JSON fields:**
  - `rolle` (e.g., `Vermieter` or `Mieter`)
  - `eigeneName`
  - `eigeneEmail`
  - `eigeneTelefon`
- **Behavior:**
  - Validates the JSON payload.
  - Writes the payload as a JSON string to an Azure Table entity with
    `PartitionKey="MaskA"` and a generated `RowKey` UUID.
  - Table name defaults to `MaskAInput` (override with `MASKA_TABLE`).
  - Uses `TABLE_CONN_STRING` to create the Table service client.
- **Response:** `201 Created` with `{ "id": "<uuid>", "table": "<tableName>" }`.

### `generate_contract` — `POST /api/generate_contract`
- **Purpose:** renders a DOCX contract from Mask A and Mask B payloads and
  uploads it to Blob Storage.
- **Required JSON fields:** `maskA` and `maskB` (objects).
- **Behavior:**
  - Validates both masks and builds a contract context (landlord/tenant, rent,
    apartment details, and legal clauses).
  - Ensures `templates/base_contract.docx` is available, recreating it from the
    bundled `base_contract.docx.b64` fallback when needed.
  - Renders Jinja-style placeholders inside the DOCX and writes to a temporary
    file.
  - Uploads the file to the Blob container (default `contracts`, override with
    `CONTRACTS_CONTAINER`) using `BLOB_CONN_STRING`.
- **Response:** `200 OK` with `{ "blobName": "mietvertrag_<uuid>.docx", "blobUrl": "<downloadUrl>" }`.

## Configuration
Set the following values in `local.settings.json` (already scaffolded):

| Setting | Description |
| --- | --- |
| `TABLE_CONN_STRING` | Connection string for Azure Table Storage (or Azurite). |
| `MASKA_TABLE` | Optional override for the Mask A table name (default `MaskAInput`). |
| `BLOB_CONN_STRING` | Connection string for Azure Blob Storage (or Azurite). |
| `CONTRACTS_CONTAINER` | Optional override for the contracts container (default `contracts`). |

`AzureWebJobsStorage` must also point to a valid storage emulator or account for
Functions Core Tools.

## Local development on Windows with VS Code
1. **Install prerequisites**
   - Python **3.11** for Windows
   - Azure Functions Core Tools v4 (npm: `npm i -g azure-functions-core-tools@4`)
   - VS Code with the Azure Functions extension

2. **Clone and open the project**
   ```powershell
   git clone <repo-url>
   cd contract_automation\backend
   code .
   ```

3. **Create & activate a virtual environment (PowerShell)**
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

4. **Install dependencies**
   ```powershell
   pip install -r requirements.txt
   ```

5. **Configure local settings**
   - Copy `local.settings.json` if needed and update storage connection strings
     (`TABLE_CONN_STRING`, `BLOB_CONN_STRING`, etc.). For Azurite you can use
     `UseDevelopmentStorage=true` for both Table and Blob.

6. **Run the Functions host**
   ```powershell
   func start
   ```

## Using Azurite on Windows
- Install Azurite (`npm install -g azurite`) and start it:
  ```powershell
  azurite --location c:\azurite --debug c:\azurite\debug.log --table --blob
  ```
- Ensure `TABLE_CONN_STRING` and `BLOB_CONN_STRING` are set to
  `UseDevelopmentStorage=true` (Azurite’s default). The functions will create
  the `MaskAInput` table and `contracts` container automatically.

## Sample requests
- **Save Mask A**
  ```bash
  curl -X POST "http://localhost:7071/api/save_mask_a" \
    -H "Content-Type: application/json" \
    -d '{
          "rolle": "Vermieter",
          "eigeneName": "Max Mustermann",
          "eigeneEmail": "max@example.com",
          "eigeneTelefon": "+49 123 4567",
          "zusatz": "optional notes"
        }'
  ```

- **Generate contract**
  ```bash
  curl -X POST "http://localhost:7071/api/generate_contract" \
    -H "Content-Type: application/json" \
    -d '{
          "maskA": {
            "rolle": "Vermieter",
            "eigeneName": "Max Mustermann",
            "eigeneEmail": "max@example.com",
            "eigeneTelefon": "+49 123 4567"
          },
          "maskB": {
            "mieterName": "Erika Musterfrau",
            "adresse": "Musterstrasse 1, 10115 Berlin",
            "kaltmiete": "1200 EUR",
            "nebenkosten": "200 EUR",
            "kaution": "2400 EUR",
            "klauseln": ["Keine Haustiere", "Rauchen nur auf dem Balkon"]
          }
        }'
  ```

## Templates and output
- The DOCX template is reconstructed at runtime at
  `backend/templates/base_contract.docx` from the bundled
  `base_contract.docx.b64` file. The binary `.docx` is intentionally not
  versioned to avoid binary file handling issues.
- Generated contracts are uploaded to the configured Blob container with names
  like `mietvertrag_<uuid>.docx`. The response includes the direct blob URL.
