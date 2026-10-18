from django.test import SimpleTestCase
from rest_framework.test import APIClient

from runner.sandbox import run_python, validate_code


class SandboxTests(SimpleTestCase):
    def test_print_works(self):
        result = run_python('print("salom")')
        self.assertTrue(result.ok)
        self.assertIn("salom", result.stdout)

    def test_blocks_os_import(self):
        err = validate_code("import os\nprint(os.getcwd())")
        self.assertIsNotNone(err)

    def test_syntax_error(self):
        result = run_python("def broken(:\n  pass")
        self.assertFalse(result.ok)
        self.assertTrue(result.stderr or result.error)


class ApiTests(SimpleTestCase):
    def setUp(self):
        self.client = APIClient()

    def test_health(self):
        res = self.client.get("/api/health/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["status"], "ok")

    def test_run_endpoint(self):
        res = self.client.post(
            "/api/run/",
            {"code": "print(2+2)", "language": "python"},
            format="json",
        )
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.data["ok"])
        self.assertIn("4", res.data["stdout"])

    def test_run_blocked(self):
        res = self.client.post(
            "/api/run/",
            {"code": "import os\nprint(1)", "language": "python"},
            format="json",
        )
        self.assertEqual(res.status_code, 400)
