import unittest

try:
    from starlette.testclient import TestClient
    from web.api import app
    HAS_WEB_DEPS = True
except ImportError:
    HAS_WEB_DEPS = False


@unittest.skipUnless(HAS_WEB_DEPS, "web dependencies (fastapi/starlette) not installed")
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

    def test_mt5_bridge_endpoints(self):
        # 1. Download EA
        res_ea = self.client.get("/api/mt5/download-ea")
        self.assertEqual(res_ea.status_code, 200)
        self.assertIn("QuantVibe_Bridge", res_ea.headers.get("content-disposition", ""))

        # 2. Heartbeat registration
        hb_payload = {
            "account": "998877",
            "broker": "IC Markets Demo",
            "server": "ICMarketsSC",
            "currency": "USD",
            "balance": 10000.0,
            "equity": 10000.0,
            "leverage": 500,
            "algo_trading": True
        }
        res_hb = self.client.post("/api/mt5/heartbeat", json=hb_payload)
        self.assertEqual(res_hb.status_code, 200)

        # 3. Status
        res_status = self.client.get("/api/mt5/status?account=998877")
        self.assertEqual(res_status.status_code, 200)
        self.assertTrue(res_status.json()["connected"])

        # 4. Ack
        ack_payload = {
            "order_id": "ORD-1",
            "account": "998877",
            "symbol": "TSLA.US",
            "status": "FILLED",
            "ticket": 123456,
            "fill_price": 60.50,
            "balance": 10000.0,
            "notes": "Test fill"
        }
        res_ack = self.client.post("/api/mt5/ack", json=ack_payload)
        self.assertEqual(res_ack.status_code, 200)

    def test_recalculate_orders_plan(self):
        res = self.client.post(
            "/api/orders/recalculate",
            json={"capital": 5000.0, "symbol_suffix": ".US", "symbol_prefix": ""}
        )
        if res.status_code == 200:
            data = res.json()
            self.assertEqual(data["total_notional_target"], 5000.0)
            for ord_item in data["orders"]:
                if ord_item["status"] == "PLANNED":
                    self.assertTrue(ord_item["broker_symbol"].endswith(".US"))

    def test_recalculate_orders_plan_injection_rejected(self):
        # Invalid capital
        res_neg = self.client.post(
            "/api/orders/recalculate",
            json={"capital": -100.0, "symbol_suffix": "", "symbol_prefix": ""}
        )
        self.assertEqual(res_neg.status_code, 400)

        # Disallowed characters in symbol suffix (command injection attempt)
        res_inj = self.client.post(
            "/api/orders/recalculate",
            json={"capital": 5000.0, "symbol_suffix": "; rm -rf /", "symbol_prefix": ""}
        )
        self.assertEqual(res_inj.status_code, 400)

    def test_ssrf_webhook_rejected(self):
        # Localhost attempt
        res_local = self.client.post(
            "/api/brokers/test",
            json={"broker_id": "webhook", "credentials": {"webhook_url": "http://127.0.0.1:8000/api/status"}}
        )
        self.assertEqual(res_local.status_code, 400)
        self.assertIn("anti-SSRF", res_local.json().get("detail", ""))

        # Alibaba Cloud ECS metadata service attempt
        res_alicloud = self.client.post(
            "/api/brokers/test",
            json={"broker_id": "webhook", "credentials": {"webhook_url": "http://100.100.100.200/latest/meta-data/"}}
        )
        self.assertEqual(res_alicloud.status_code, 400)

        # AWS/GCP metadata service attempt
        res_meta = self.client.post(
            "/api/brokers/test",
            json={"broker_id": "webhook", "credentials": {"webhook_url": "http://169.254.169.254/latest/meta-data/"}}
        )
        self.assertEqual(res_meta.status_code, 400)

        # Private RFC1918 VPC subnet attempt
        res_priv = self.client.post(
            "/api/brokers/test",
            json={"broker_id": "webhook", "credentials": {"webhook_url": "http://172.24.233.233:80/"}}
        )
        self.assertEqual(res_priv.status_code, 400)

    def test_pipeline_run_validation(self):
        # Disallowed mode
        res_mode = self.client.post(
            "/api/pipeline/run",
            json={"mode": "evil_mode"}
        )
        self.assertEqual(res_mode.status_code, 400)

        # Disallowed steps
        res_step = self.client.post(
            "/api/pipeline/run",
            json={"mode": "demo", "steps": ["prepare", "malicious_step"]}
        )
        self.assertEqual(res_step.status_code, 400)


if __name__ == "__main__":
    unittest.main()
