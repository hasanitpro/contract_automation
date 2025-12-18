from __future__ import annotations

import os

from azure.core.exceptions import ResourceExistsError
from azure.data.tables import TableClient, TableServiceClient
from azure.storage.blob import BlobServiceClient, ContainerClient


def _get_env_setting(key: str) -> str:
    value = os.getenv(key)
    if not value:
        raise RuntimeError(f"Missing required setting: {key}")
    return value


def get_table_client(table_name: str) -> TableClient:
    connection_string = _get_env_setting("TABLE_CONN_STRING")
    service = TableServiceClient.from_connection_string(conn_str=connection_string)
    table_client = service.get_table_client(table_name=table_name)
    table_client.create_table_if_not_exists()
    return table_client


def get_blob_container_client(container_name: str) -> ContainerClient:
    connection_string = _get_env_setting("BLOB_CONN_STRING")
    blob_service = BlobServiceClient.from_connection_string(conn_str=connection_string)
    container_client = blob_service.get_container_client(container=container_name)
    try:
        container_client.create_container()
    except ResourceExistsError:
        pass
    return container_client
