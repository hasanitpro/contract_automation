# Azure Functions Backend (Python)

This backend follows the earlier plan for a Python Azure Functions app. It includes
HTTP-triggered functions for contract generation, template discovery, and a simple
health check.

## Structure
- `functions/contract_generation`: POST `/api/contract/generate` accepts a JSON
  payload, validates it with Pydantic, and renders a Jinja2 template.
- `functions/template_management`: GET `/api/templates` lists available templates
  from `backend/templates`.
- `functions/health_check`: GET `/api/health` returns a static healthy response.
- `shared/`: reusable Pydantic models and template rendering helpers.
- `templates/`: sample Jinja2 contract template files (e.g., `basic_contract.html`).

## Local development
1. Install Azure Functions Core Tools and Python 3.11.
2. Create a virtual environment and install dependencies:
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
3. Update `local.settings.json` with your storage connection or managed identity
   settings.
4. Start the function app locally:
   ```bash
   func start
   ```

## API request example
```bash
curl -X POST "http://localhost:7071/api/contract/generate" \
  -H "Content-Type: application/json" \
  -d '{
        "template_id": "basic_contract",
        "effective_date": "2024-05-20",
        "parties": [
          {"name": "Acme Corp", "role": "Supplier"},
          {"name": "Contoso Ltd", "role": "Customer"}
        ],
        "terms": [
          {"key": "price", "value": "$1000"},
          {"key": "delivery", "value": "30 days"}
        ]
      }'
```
