"""Custom database types."""

from typing import Any
from uuid import UUID

from sqlalchemy import types


class GUID(types.TypeDecorator):
    """Platform-independent GUID type."""

    impl = types.String(36)
    cache_ok = True

    def process_bind_param(self, value: Any, dialect: Any) -> str | None:
        """Convert UUID to string."""
        if value is None:
            return None
        if isinstance(value, UUID):
            return str(value)
        return str(value)

    def process_result_value(self, value: Any, dialect: Any) -> UUID | None:
        """Convert string to UUID."""
        if value is None:
            return None
        if isinstance(value, UUID):
            return value
        return UUID(value)
