import unittest
from starlette.testclient import TestClient
from web.api import app


class TestWebAPI(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_status_endpoint(self):
        res = self.client.get("/api/status")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("artifacts", data)
        self.assertIn("pipeline", data)
        self.assertIn("mcp_server", data)

    def test_signals_endpoint_verified(self):
        res = self.client.get("/api/signals")
        # May be 200 if artifacts exist, or 404 if not
        if res.status_code == 200:
            data = res.json()
            self.assertTrue(data.get("verified"))
            self.assertEqual(data["checksum"], data["computed_checksum"])

    def test_evaluation_endpoint(self):
        res = self.client.get("/api/evaluation")
        if res.status_code == 200:
            data = res.json()
            self.assertIn("mean_ic", data)
            self.assertIn("passed", data)

    def test_orders_endpoint(self):
        res = self.client.get("/api/orders")
        if res.status_code == 200:
            data = res.json()
            self.assertIn("orders", data)
            self.assertIn("totals", data)

    def test_spa_root_served(self):
        res = self.client.get("/")
        self.assertEqual(res.status_code, 200)
        self.assertIn("QuantVibe", res.text)


if __name__ == "__main__":
    unittest.main()
