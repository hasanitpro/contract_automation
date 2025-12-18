from azure.storage.blob import BlobServiceClient

CONN = (
    "DefaultEndpointsProtocol=http;"
    "AccountName=devstoreaccount1;"
    "AccountKey=Eby8vdM02xNOcqFeqCndE0Fj8U2gP0J6G2p/7k0K5v5mC0k9H6xJ6YkqQ+XkZfF8Y3d5J6fHk2J4Yk5Xg==;"
    "BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;"
)

service = BlobServiceClient.from_connection_string(CONN)

for name in ["templates", "contracts"]:
    container = service.get_container_client(name)
    if not container.exists():
        container.create_container()
        print(f"Created container: {name}")
    else:
        print(f"Container already exists: {name}")
