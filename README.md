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
