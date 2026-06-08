INVALID_WEBSOCKET_MESSAGE = {
    "type": "error",
    "code": "INVALID_SCHEMA",
    "message": "The message sent does not match any allowed event schemas.",
    "expected_schemas": {
        "guess": {"event": {"type": "guess", "message": "string"}},
        "sketch": {
            "event": {
                "type": "sketch",
                "sketching": "boolean",
                "path": {"points": "[[float, float], ...]", "color": "string"},
            }
        },
        "select_word": {"event": {"type": "select_word", "word": "string"}},
    },
    "received": None,
}
