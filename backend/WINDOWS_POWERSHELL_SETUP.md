# Windows PowerShell guide for local Azurite + contract generation

The backend expects a contract template in blob storage. These steps show how to
prepare Azurite, upload the template, and call the `generate_contract` HTTP
trigger from PowerShell on Windows.

## Prerequisites
- Python 3.11+
- [Azurite](https://learn.microsoft.com/azure/storage/common/storage-use-azurite?tabs=visual-studio) (Node.js runtime installed)
- Azure CLI **or** the `Az` PowerShell module for blob uploads
- Azure Functions Core Tools (to run `func host start`)

## 1) Generate the contract template locally
Run from the repository root so the relative paths line up:

```powershell
python source_of_truth/generate_contract_template.py
```

The command produces `source_of_truth/contract-template.docx`, which is uploaded
in the next step.

## 2) Start Azurite for blob + table emulation
From the repository root, launch Azurite with loopback addresses that align with
`backend/local.settings.json`:

```powershell
npx azurite --silent --blobHost 127.0.0.1 --tableHost 127.0.0.1
```

Azurite listens on:
- Blob service: `http://127.0.0.1:10000/devstoreaccount1`
- Table service: `http://127.0.0.1:10002/devstoreaccount1`

Keep this terminal open so Azurite remains available.

## 3) Create the `templates` container and upload the DOCX
Set the development storage connection string once per session:

```powershell
$env:AZURE_STORAGE_CONNECTION_STRING = "UseDevelopmentStorage=true;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;TableEndpoint=http://127.0.0.1:10002/devstoreaccount1;"
```

Then create the container and upload the template using **either** the `Az`
module or the Azure CLI.

### Option A: Az PowerShell module
```powershell
$context = New-AzStorageContext -ConnectionString $env:AZURE_STORAGE_CONNECTION_STRING
New-AzStorageContainer -Name templates -Context $context -ErrorAction SilentlyContinue | Out-Null
Set-AzStorageBlobContent -Container templates -File "$PSScriptRoot\..\source_of_truth\contract-template.docx" -Blob "contract-template.docx" -Context $context -Force
```

### Option B: Azure CLI
```powershell
az storage container create --name templates --connection-string $env:AZURE_STORAGE_CONNECTION_STRING
az storage blob upload --container-name templates --name contract-template.docx --file .\source_of_truth\contract-template.docx --overwrite --connection-string $env:AZURE_STORAGE_CONNECTION_STRING
```

After uploading, the template is reachable at
`http://127.0.0.1:10000/devstoreaccount1/templates/contract-template.docx`.

## 4) Run the Functions host
In a new terminal, start the backend so it reads `backend/local.settings.json`:

```powershell
cd backend
func host start --cors http://localhost:5173 --cors-credentials
```

Ensure `TemplateBlobPath` is set to `templates/contract-template.docx` (the
default in `local.settings.json`) so the function resolves the template from the
blob you uploaded.

## 5) Call the API from PowerShell and confirm 200
Use `Invoke-RestMethod` to send a POST request to the local Functions host. The
example maps simple mask values to placeholders used by the DOCX template and
captures the HTTP status code.

```powershell
$body = @{
    maskA = @{ client = @{ name = "Ada Lovelace"; email = "ada@example.com" } }
    maskB = @{ contract = @{ startDate = "2024-01-01"; endDate = "2024-12-31" } }
    placeholderMapping = @{
        "ClientName" = "maskA.client.name"
        "ClientEmail" = "maskA.client.email"
        "StartDate" = "maskB.contract.startDate"
        "EndDate" = "maskB.contract.endDate"
    }
    templatePath = "templates/contract-template.docx"
}

$response = Invoke-RestMethod -Method Post -Uri "http://localhost:7071/api/generate_contract" -Body ($body | ConvertTo-Json -Depth 6) -ContentType "application/json" -StatusCodeVariable status

# Confirm the function succeeded and inspect the download URL
$status    # should output 200
$response  # includes a downloadUrl pointing at Azurite
```

If `$status` reports `200`, the backend successfully rendered the contract and
stored it in the blob container configured by `ContractsBlobConnection` and
`ContractsContainer`.
