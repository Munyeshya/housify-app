from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is None:
        return response

    normalized_errors = []
    data = response.data

    if isinstance(data, dict):
        for field, value in data.items():
            if isinstance(value, list):
                for item in value:
                    normalized_errors.append(
                        {
                            "field": None if field == "non_field_errors" else field,
                            "detail": str(item),
                            "code": getattr(item, "code", response.status_code),
                        }
                    )
            else:
                normalized_errors.append(
                    {
                        "field": None if field == "non_field_errors" else field,
                        "detail": str(value),
                        "code": response.status_code,
                    }
                )
    elif isinstance(data, list):
        for item in data:
            normalized_errors.append(
                {
                    "field": None,
                    "detail": str(item),
                    "code": getattr(item, "code", response.status_code),
                }
            )
    else:
        normalized_errors.append(
            {
                "field": None,
                "detail": str(data),
                "code": response.status_code,
            }
        )

    response.data = {
        "status_code": response.status_code,
        "errors": normalized_errors,
    }
    return response
