# myapp/renderers.py
from rest_framework.renderers import JSONRenderer

class CustomJSONRenderer(JSONRenderer):
    """
    Custom renderer to wrap all responses in a consistent JSON format.
    """
    charset = 'utf-8'

    def render(self, data, accepted_media_type=None, renderer_context=None):
        response = renderer_context.get('response', None)
        status_code = getattr(response, 'status_code', None)

        # Default structure
        response_data = {
            "success": True,
            "message": "",
            "errors": None,
            "data": None
        }

        if status_code and status_code >= 400:
            # Error case
            response_data["success"] = False
            response_data["message"] = "Request failed"
            response_data["errors"] = data
        else:
            # Success case
            response_data["data"] = data
            response_data["message"] = "Request successful"

        return super().render(response_data, accepted_media_type, renderer_context)
