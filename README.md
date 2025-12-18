# Contract Automation

This repository contains a frontend prototype and a Python-based Azure Functions
backend for generating contracts from templates.

- `frontend/`: Vite/React prototype for the contract automation UI.
- `backend/`: Azure Functions app with HTTP endpoints for contract generation,
  template discovery, and health checks.
- `source_of_truth/`: Supporting documentation and annotated contract template.

## Backend quick start
The backend lives in `backend/` and uses Azure Functions with Python 3.11.
See `backend/README.md` for setup instructions and example requests.

### Local Azure storage and Functions runtime

Use the bundled `backend/local.settings.json` to run everything locally. The
example values keep the frontend defaults working:

- `AzureWebJobsStorage=UseDevelopmentStorage=true`
- `MaskAInput=UseDevelopmentStorage=true;TableEndpoint=http://127.0.0.1:10002/devstoreaccount1;`
- `ContractsBlobConnection=UseDevelopmentStorage=true;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;`
- `ContractsContainer=contracts`
- `TemplateBlobPath=templates/contract-template.docx`

To start Azurite with both blob and table emulators (ports 10000 and 10002) in
one terminal:

```bash
npx azurite --silent --blobHost 127.0.0.1 --tableHost 127.0.0.1
```

Then start the Functions host in another terminal from the `backend/` folder so
it picks up `local.settings.json`:

```bash
cd backend
func host start
```

If you access the backend from the frontend dev server (`http://localhost:5173`)
you need a CORS allowlist entry on the Functions app. When running locally,
start the host with the CORS flag:

```bash
func host start --cors http://localhost:5173 --cors-credentials
```

When deploying to Azure, add `http://localhost:5173` (or your Vite dev URL) to
the app's allowed origins so the browser can call the Functions API.

## Frontend quick start
The frontend is built with Vite and React. To start the dev server:

1. Install dependencies the first time (or whenever `vite` is not found):

   ```bash
   cd frontend
   npm install
   ```

2. Run the Vite dev server from within `frontend/` so the local `vite` binary in
   `node_modules/.bin` is on your PATH:

   ```bash
   npm run dev
   ```

If you still see "vite is not recognized", double-check you are in the
`frontend/` directory and that `node_modules/.bin` exists after installing
dependencies.

## Full local testing guide
Follow these steps to run the entire stack locally.

### Backend (Azure Functions) setup
1. Install prerequisites: Python 3.11, Azure Functions Core Tools, and Azurite
   (for blob/table emulation). Use the bundled `backend/local.settings.json`
   values when running locally.

2. In one terminal, start Azurite with blob and table emulators on the default
   ports:

   ```bash
   npx azurite --silent --blobHost 127.0.0.1 --tableHost 127.0.0.1
   ```

3. In a second terminal, start the Functions host from the `backend/`
   directory so it reads `local.settings.json`:

   ```bash
   cd backend
   func host start
   ```

4. If you access the backend from the frontend dev server at
   `http://localhost:5173`, add a CORS allowlist entry when starting the host:

   ```bash
   func host start --cors http://localhost:5173 --cors-credentials
   ```

5. When deploying to Azure, include your Vite dev URL in the app’s allowed
   origins so browser calls succeed.

### Frontend (Vite/React) setup
1. Install dependencies the first time (or if `vite` is missing):

   ```bash
   cd frontend
   npm install
   ```

2. Start the Vite dev server from within `frontend/` so the local `vite`
   binary on `node_modules/.bin` is used:

   ```bash
   npm run dev
   ```

3. If `vite` is still not recognized, confirm you are in `frontend/` and that
   `node_modules/.bin` exists after installing dependencies.
