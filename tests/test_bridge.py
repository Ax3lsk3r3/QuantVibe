import json
import math
import sys
import tempfile
import unittest
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))

from bridge import signal_store as ss  # noqa: E402


class TestTopK(unittest.TestCase):
    def test_orders_by_score_desc_with_stable_ties(self):
        scores = {"AAPL": 0.01, "MSFT": 0.05, "GOOG": -0.02, "NVDA": 0.05}
        top = ss.select_top_k(scores, 3)
        self.assertEqual([t["instrument"] for t in top], ["MSFT", "NVDA", "AAPL"])
        self.assertEqual([t["rank"] for t in top], [1, 2, 3])

    def test_k_larger_than_universe(self):
        top = ss.select_top_k({"A": 1.0}, 5)
        self.assertEqual(len(top), 1)

    def test_invalid_k(self):
        with self.assertRaises(ValueError):
            ss.select_top_k({"A": 1.0}, 0)


class TestPayloadRoundtrip(unittest.TestCase):
    def setUp(self):
        signals = ss.select_top_k({"AAPL": 0.03, "MSFT": 0.01}, 2)
        self.payload = ss.build_payload(
            signals=signals,
            universe=["AAPL", "MSFT", "GOOG"],
            as_of="2026-08-21",
            source_model="DemoMomentum",
            data_source="synthetic",
            top_k=5,
            horizon_days=1,
            test_start="2025-01-02",
            test_end="2026-08-21",
        )

    def test_write_then_load_roundtrip(self):
        with tempfile.TemporaryDirectory() as td:
            path = Path(td) / "signals.json"
            ss.write_signals(path, self.payload)
            loaded = ss.load_signals(path)
            self.assertEqual(loaded["as_of"], "2026-08-21")
            self.assertEqual(loaded["signals"][0]["instrument"], "AAPL")

    def test_tamper_detected(self):
        with tempfile.TemporaryDirectory() as td:
            path = Path(td) / "signals.json"
            ss.write_signals(path, self.payload)
            data = json.loads(path.read_text(encoding="utf-8"))
            data["signals"][0]["score"] = 999.0
            path.write_text(json.dumps(data), encoding="utf-8")
            with self.assertRaises(ss.SignalValidationError):
                ss.load_signals(path)

    def test_missing_checksum_rejected(self):
        with tempfile.TemporaryDirectory() as td:
            path = Path(td) / "signals.json"
            body = dict(self.payload)
            body.pop("checksum", None)
            path.write_text(json.dumps(body), encoding="utf-8")
            with self.assertRaises(ss.SignalValidationError):
                ss.load_signals(path)


class TestValidation(unittest.TestCase):
    def _base_payload(self, **overrides):
        payload = {
            "schema_version": ss.SCHEMA_VERSION,
            "generated_at": "2026-08-21T12:00:00+00:00",
            "source_model": "M",
            "universe": ["A", "B"],
            "as_of": "2026-08-21",
            "horizon_days": 1,
            "signals": [
                {"instrument": "A", "score": 0.1, "rank": 1},
                {"instrument": "B", "score": -0.1, "rank": 2},
            ],
            "metadata": {},
        }
        payload.update(overrides)
        return payload

    def test_valid_passes(self):
        ss.validate_payload(self._base_payload())

    def test_bad_rank_sequence(self):
        bad = self._base_payload()
        bad["signals"][1]["rank"] = 3
        with self.assertRaises(ss.SignalValidationError):
            ss.validate_payload(bad)

    def test_duplicate_instrument(self):
        bad = self._base_payload()
        bad["signals"][1]["instrument"] = "A"
        with self.assertRaises(ss.SignalValidationError):
            ss.validate_payload(bad)

    def test_non_finite_score(self):
        bad = self._base_payload()
        bad["signals"][0]["score"] = math.inf
        with self.assertRaises(ss.SignalValidationError):
            ss.validate_payload(bad)

    def test_wrong_schema_version(self):
        with self.assertRaises(ss.SignalValidationError):
            ss.validate_payload(self._base_payload(schema_version=99))

    def test_generated_at_must_be_iso(self):
        with self.assertRaises(ss.SignalValidationError):
            ss.validate_payload(self._base_payload(generated_at="yesterday"))


if __name__ == "__main__":
    unittest.main()
