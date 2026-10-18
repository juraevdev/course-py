from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from django.conf import settings

from .sandbox import _docker_available, run_python
from .serializers import RunCodeSerializer, RunResultSerializer


def _authorized(request: Request) -> bool:
    """Ichki kalit majburiy (production). DEBUG da kalit bo‘lmasa ochiq."""
    expected = settings.RUNNER_API_KEY
    if not expected:
        return bool(settings.DEBUG)
    provided = request.headers.get("X-Runner-Key", "")
    return provided == expected


class HealthView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request: Request) -> Response:
        docker_ok = _docker_available()
        return Response(
            {
                "status": "ok",
                "service": "kurs-runner",
                "languages": ["python"],
                "auth_required": bool(settings.RUNNER_API_KEY) or not settings.DEBUG,
                "docker": {
                    "enabled": settings.RUNNER_USE_DOCKER,
                    "available": docker_ok,
                    "image": settings.RUNNER_DOCKER_IMAGE,
                    "mode": (
                        "docker"
                        if settings.RUNNER_USE_DOCKER and docker_ok
                        else "local"
                    ),
                },
            }
        )


class RunCodeView(APIView):
    """
    POST /api/run/
    {
      "code": "print(1+1)",
      "stdin": "",
      "language": "python"
    }
    Header: X-Runner-Key: <RUNNER_API_KEY>
    """

    authentication_classes = []
    permission_classes = []

    def post(self, request: Request) -> Response:
        if not _authorized(request):
            return Response(
                {"detail": "Unauthorized."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        serializer = RunCodeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        language = serializer.validated_data.get("language", "python")
        code = serializer.validated_data["code"]
        stdin = serializer.validated_data.get("stdin", "")

        if language != "python":
            return Response(
                {"detail": "Hozircha faqat Python qo‘llab-quvvatlanadi."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        result = run_python(code, stdin=stdin)
        payload = {
            "ok": result.ok,
            "stdout": result.stdout,
            "stderr": result.stderr,
            "timed_out": result.timed_out,
            "exit_code": result.exit_code,
            "error": result.error,
            "language": "python",
            "via": result.via,
        }
        out = RunResultSerializer(payload)
        http_status = status.HTTP_200_OK if result.ok else status.HTTP_200_OK
        # Doimo 200 — frontend stdout/stderr ni ko‘rsatadi; validation xatosi 400
        if result.error and result.exit_code is None and not result.timed_out and not result.stdout and not result.stderr:
            # validate_code / OSError
            if "Xavfsizlik" in (result.error or "") or "Kod bo‘sh" in (result.error or "") or "juda uzun" in (result.error or ""):
                return Response(out.data, status=status.HTTP_400_BAD_REQUEST)

        return Response(out.data, status=http_status)
