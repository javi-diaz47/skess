def validate_message(data: dict):
    """
    Check if the data implements the required interface
    and returns an error message accordingly

    Parameters:
        data (dict): Input message data

    Returns:
        dict: A dictionary with:
            - "error" (str | None): Error type if the validation fail
            - "message" (str | None): Error message
    """
    if "type" not in data:
        return {
            "error": "Invalid Message",
            "message": "No type was provided",
        }

    if "payload" not in data:
        return {
            "error": "Invalid Message",
            "message": "No payload was provided",
        }

    return {"error": None, "message": None}


def validate_payload(data: dict):
    """
    Check if the data payload implements the required interface
    and returns an error message accordingly

    Parameters:
        data (dict): Input message data

    Returns:
        dict: A dictionary with:
            - "error" (str | None): Error type if the validation fail
            - "message" (str | None): Error message
    """
    if data["type"] == "guess":
        if "message" not in data["payload"]:
            return {
                "error": "Invalid Message",
                "message": "Payload must include a property message of type string",
            }

    if data["type"] == "sketch":
        if "path" not in data["payload"]:
            return {
                "error": "Invalid Message",
                "message": "Payload must include a property path of type string",
            }

        if "color" not in data["payload"]:
            return {
                "error": "Invalid Message",
                "message": "Payload must include a string property color representing the path’s hexadecimal color.",
            }

        if "sketching" not in data["payload"]:
            return {
                "error": "Invalid Message",
                "message": "Payload must include a boolean property sketching indicating whether the path is finished.",
            }

    return {"error": None, "message": None}
