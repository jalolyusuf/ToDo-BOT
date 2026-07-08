import json
import logging
import sys
from collections.abc import Mapping
from datetime import UTC, datetime
from typing import Any

from app.core.config import Settings

SENSITIVE_KEYS = {"password", "secret", "token", "authorization", "api_key"}


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "timestamp": datetime.now(UTC).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        extra = getattr(record, "extra", None)
        if isinstance(extra, Mapping):
            payload.update(_sanitize_mapping(extra))
        return json.dumps(payload, ensure_ascii=False)


class ConsoleFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        base = super().format(record)
        extra = getattr(record, "extra", None)
        if isinstance(extra, Mapping) and extra:
            return f"{base} {_sanitize_mapping(extra)}"
        return base


class StructuredLogger:
    def __init__(self, logger: logging.Logger) -> None:
        self._logger = logger

    def info(self, message: str, **extra: Any) -> None:
        self._logger.info(message, extra={"extra": extra})

    def warning(self, message: str, **extra: Any) -> None:
        self._logger.warning(message, extra={"extra": extra})

    def error(self, message: str, **extra: Any) -> None:
        self._logger.error(message, extra={"extra": extra})

    def exception(self, message: str, **extra: Any) -> None:
        self._logger.exception(message, extra={"extra": extra})


def _sanitize_mapping(values: Mapping[str, Any]) -> dict[str, Any]:
    sanitized: dict[str, Any] = {}
    for key, value in values.items():
        if any(sensitive in key.lower() for sensitive in SENSITIVE_KEYS):
            sanitized[key] = "***"
        elif isinstance(value, Mapping):
            sanitized[key] = _sanitize_mapping(value)
        else:
            sanitized[key] = value
    return sanitized


def configure_logging(settings: Settings) -> None:
    log_level = getattr(logging, settings.log_level.upper(), logging.INFO)
    handler = logging.StreamHandler(sys.stdout)
    if settings.log_format.lower() == "json":
        handler.setFormatter(JsonFormatter())
    else:
        handler.setFormatter(
            ConsoleFormatter("%(asctime)s %(levelname)s [%(name)s] %(message)s")
        )

    root_logger = logging.getLogger()
    root_logger.handlers.clear()
    root_logger.setLevel(log_level)
    root_logger.addHandler(handler)


def get_logger(name: str) -> StructuredLogger:
    return StructuredLogger(logging.getLogger(name))
