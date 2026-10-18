"""
Python kodni ishga tushirish.

Production: Docker konteyner (--network none, memory/cpu, cap-drop, non-root).
Local (faqat RUNNER_ALLOW_LOCAL=1): subprocess fallback.
"""

from __future__ import annotations

import os
import re
import shutil
import subprocess
import sys
import tempfile
import uuid
from dataclasses import dataclass
from pathlib import Path

from django.conf import settings


BLOCKED_PATTERNS = [
    re.compile(r"\bimport\s+os\b"),
    re.compile(r"\bimport\s+sys\b"),
    re.compile(r"\bimport\s+subprocess\b"),
    re.compile(r"\bimport\s+socket\b"),
    re.compile(r"\bimport\s+ctypes\b"),
    re.compile(r"\bimport\s+multiprocessing\b"),
    re.compile(r"\bimport\s+pathlib\b"),
    re.compile(r"\bimport\s+shutil\b"),
    re.compile(r"\bfrom\s+os\b"),
    re.compile(r"\bfrom\s+sys\b"),
    re.compile(r"\bfrom\s+subprocess\b"),
    re.compile(r"\bfrom\s+pathlib\b"),
    re.compile(r"\b__import__\s*\("),
    re.compile(r"\beval\s*\("),
    re.compile(r"\bexec\s*\("),
    re.compile(r"\bopen\s*\("),
    re.compile(r"\bcompile\s*\("),
    re.compile(r"\bglobals\s*\("),
    re.compile(r"\blocals\s*\("),
    re.compile(r"\bgetattr\s*\("),
    re.compile(r"\bbreakpoint\s*\("),
]


@dataclass
class RunResult:
    ok: bool
    stdout: str
    stderr: str
    timed_out: bool
    exit_code: int | None
    error: str | None = None
    via: str = "local"


def _truncate(text: str, limit: int) -> str:
    if len(text) <= limit:
        return text
    return text[:limit] + "\n...[chiqish qisqartirildi]"


def validate_code(code: str) -> str | None:
    max_chars = settings.RUNNER_MAX_CODE_CHARS
    if not code or not code.strip():
        return "Kod bo‘sh."
    if len(code) > max_chars:
        return f"Kod juda uzun (maks. {max_chars} belgi)."

    for pattern in BLOCKED_PATTERNS:
        if pattern.search(code):
            return (
                "Xavfsizlik: bu kodda ruxsat etilmagan konstruktsiya bor "
                "(os/sys/subprocess/open/eval/...)."
            )
    return None


def _docker_available() -> bool:
    if not shutil.which("docker"):
        return False
    try:
        completed = subprocess.run(
            ["docker", "version", "--format", "{{.Server.Version}}"],
            capture_output=True,
            text=True,
            timeout=5,
        )
        return completed.returncode == 0
    except (OSError, subprocess.TimeoutExpired):
        return False


def _code_workdir() -> Path:
    raw = getattr(settings, "RUNNER_CODE_DIR", "") or ""
    if raw:
        path = Path(raw)
        path.mkdir(parents=True, exist_ok=True)
        return path
    return Path(tempfile.gettempdir())


def _run_local(script_path: Path, stdin: str, timeout: int, cwd: str) -> subprocess.CompletedProcess[str]:
    python_bin = settings.RUNNER_PYTHON or sys.executable
    return subprocess.run(
        [python_bin, "-I", str(script_path)],
        input=stdin or "",
        capture_output=True,
        text=True,
        timeout=timeout,
        cwd=cwd,
        encoding="utf-8",
        errors="replace",
    )


def _run_docker(script_path: Path, stdin: str, timeout: int) -> subprocess.CompletedProcess[str]:
    image = settings.RUNNER_DOCKER_IMAGE
    # Host Docker uchun path (bind-mounted /tmp/kurs-runs)
    host_path = str(script_path.resolve())

    cmd = [
        "docker",
        "run",
        "--rm",
        "-i",
        "--network",
        "none",
        "--memory",
        settings.RUNNER_DOCKER_MEMORY,
        "--memory-swap",
        settings.RUNNER_DOCKER_MEMORY,
        "--cpus",
        settings.RUNNER_DOCKER_CPUS,
        "--pids-limit",
        "64",
        "--read-only",
        "--tmpfs",
        "/tmp:rw,size=16m,mode=1777",
        "--cap-drop",
        "ALL",
        "--security-opt",
        "no-new-privileges:true",
        "--user",
        "65534:65534",
        "--ulimit",
        "nofile=64:64",
        "--ulimit",
        "nproc=64:64",
        "-v",
        f"{host_path}:/code/main.py:ro",
        "-w",
        "/code",
        image,
        "python",
        "-I",
        "main.py",
    ]

    return subprocess.run(
        cmd,
        input=stdin or "",
        capture_output=True,
        text=True,
        timeout=timeout + 5,
        encoding="utf-8",
        errors="replace",
    )


def run_python(code: str, stdin: str = "") -> RunResult:
    problem = validate_code(code)
    if problem:
        return RunResult(
            ok=False,
            stdout="",
            stderr="",
            timed_out=False,
            exit_code=None,
            error=problem,
        )

    timeout = settings.RUNNER_TIMEOUT_SECONDS
    out_limit = settings.RUNNER_MAX_OUTPUT_CHARS
    want_docker = settings.RUNNER_USE_DOCKER
    docker_ok = _docker_available()
    use_docker = want_docker and docker_ok

    if want_docker and not docker_ok:
        return RunResult(
            ok=False,
            stdout="",
            stderr="",
            timed_out=False,
            exit_code=None,
            error="Docker sandbox mavjud emas. Local rejim o‘chirilgan.",
            via="docker",
        )

    if not use_docker and not settings.RUNNER_ALLOW_LOCAL:
        return RunResult(
            ok=False,
            stdout="",
            stderr="",
            timed_out=False,
            exit_code=None,
            error="Local sandbox o‘chirilgan. RUNNER_USE_DOCKER=1 kerak.",
            via="local",
        )

    run_dir = _code_workdir() / f"kurs-run-{uuid.uuid4().hex}"
    run_dir.mkdir(parents=True, exist_ok=True)
    script_path = run_dir / "main.py"

    try:
        script_path.write_text(code, encoding="utf-8")
        # Hostdan o‘qilishi uchun (Docker bind)
        os.chmod(script_path, 0o644)
        os.chmod(run_dir, 0o755)

        try:
            if use_docker:
                completed = _run_docker(script_path, stdin, timeout)
                via = "docker"
            else:
                completed = _run_local(script_path, stdin, timeout, str(run_dir))
                via = "local"
        except subprocess.TimeoutExpired as exc:
            stdout = _truncate(
                (exc.stdout or "") if isinstance(exc.stdout, str) else "",
                out_limit,
            )
            stderr = _truncate(
                (exc.stderr or "") if isinstance(exc.stderr, str) else "",
                out_limit,
            )
            return RunResult(
                ok=False,
                stdout=stdout,
                stderr=stderr or f"Vaqt tugadi ({timeout}s).",
                timed_out=True,
                exit_code=None,
                error=f"Kod {timeout} soniyadan oshib ketdi.",
                via="docker" if use_docker else "local",
            )
        except OSError as exc:
            return RunResult(
                ok=False,
                stdout="",
                stderr="",
                timed_out=False,
                exit_code=None,
                error=f"Jarayon ishga tushmadi: {exc}",
                via="docker" if use_docker else "local",
            )

        stdout = _truncate(completed.stdout or "", out_limit)
        stderr = _truncate(completed.stderr or "", out_limit)
        ok = completed.returncode == 0

        if (
            not ok
            and via == "docker"
            and "Unable to find image" in (stderr or "")
        ):
            return RunResult(
                ok=False,
                stdout=stdout,
                stderr=stderr,
                timed_out=False,
                exit_code=completed.returncode,
                error=(
                    "Sandbox image topilmadi. "
                    "docker build -f backend/Dockerfile.sandbox -t kurs-sandbox:latest backend"
                ),
                via=via,
            )

        return RunResult(
            ok=ok,
            stdout=stdout,
            stderr=stderr,
            timed_out=False,
            exit_code=completed.returncode,
            error=None if ok else "Kod xato bilan yakunlandi.",
            via=via,
        )
    finally:
        shutil.rmtree(run_dir, ignore_errors=True)
