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
