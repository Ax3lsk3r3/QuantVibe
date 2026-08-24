import sys
import tempfile
import unittest
from pathlib import Path

import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))

from qlib_side.evaluate import ic_metrics, check_gate  # noqa: E402
from bridge import track_record as tr  # noqa: E402


def _wide(values_by_sym):
    dates = [f"2026-01-{d:02d}" for d in range(5, 5 + len(next(iter(values_by_sym.values()))))]
    return pd.DataFrame(values_by_sym, index=dates)


class TestIcMetrics(unittest.TestCase):
    def test_perfect_monotonic_scores_give_ic_one(self):
        scores = _wide({"A": [1, 1, 1], "B": [2, 2, 2], "C": [3, 3, 3], "D": [4, 4, 4]})
        fwd = _wide({"A": [0.01, 0.02, 0.03], "B": [0.02, 0.03, 0.04],
                     "C": [0.03, 0.04, 0.05], "D": [0.04, 0.05, 0.06]})
        m = ic_metrics(scores, fwd, top_k=2)
        self.assertAlmostEqual(m["mean_ic"], 1.0, places=9)
        self.assertEqual(m["hit_rate_topk"], 1.0)

    def test_inverted_scores_give_negative_ic(self):
        scores = _wide({"A": [4, 4, 4], "B": [3, 3, 3], "C": [2, 2, 2], "D": [1, 1, 1]})
        fwd = _wide({"A": [0.01, 0.01, 0.01], "B": [0.02, 0.02, 0.02],
                     "C": [0.03, 0.03, 0.03], "D": [0.04, 0.04, 0.04]})
        m = ic_metrics(scores, fwd, top_k=2)
        self.assertAlmostEqual(m["mean_ic"], -1.0, places=9)

    def test_gate_blocks_low_ic(self):
        metrics = {"n_days": 100, "mean_ic": -0.05, "icir": -0.4,
                   "hit_rate_topk": 0.4, "avg_topk_fwd_return": -0.001,
                   "avg_universe_fwd_return": 0.0}
        verdict = check_gate(metrics, {})
        self.assertFalse(verdict["passed"])
        self.assertTrue(any("mean_ic" in f for f in verdict["failures"]))

    def test_gate_blocks_few_days(self):
        metrics = {"n_days": 10, "mean_ic": 0.2, "icir": 0.5,
                   "hit_rate_topk": 0.6, "avg_topk_fwd_return": 0.01,
                   "avg_universe_fwd_return": 0.005}
        verdict = check_gate(metrics, {"min_days": 60})
        self.assertFalse(verdict["passed"])

    def test_nan_ic_rejected(self):
        metrics = {"n_days": 100, "mean_ic": float("nan"), "icir": float("nan"),
                   "hit_rate_topk": 0.5, "avg_topk_fwd_return": 0.0,
                   "avg_universe_fwd_return": 0.0}
        self.assertFalse(check_gate(metrics, {})["passed"])


class TestTrackRecord(unittest.TestCase):
    UNIVERSE = ["AAPL", "MSFT", "XOM", "KO"]

    def _payload(self, as_of="2026-01-05"):
        from bridge.signal_store import build_payload, select_top_k

        signals = select_top_k({"AAPL": 0.05, "MSFT": 0.03}, 2)
        return build_payload(
            signals=signals, universe=self.UNIVERSE, as_of=as_of,
            source_model="TestModel", data_source="test", top_k=2, horizon_days=1,
        )

    def _write_csvs(self, raw: Path):
        dates = ["2026-01-05", "2026-01-06", "2026-01-07", "2026-01-08"]
        closes = {"AAPL": [100, 110, 121, 110], "MSFT": [50, 51, 52, 53],
                  "XOM": [80, 79, 78, 77], "KO": [30, 31, 32, 33]}
        for sym, cl in closes.items():
            with open(raw / f"{sym}.csv", "w", encoding="utf-8", newline="") as fh:
                fh.write("date,symbol,close\n")
                for d, c in zip(dates, cl):
                    fh.write(f"{d},{sym},{c}\n")

    def test_log_is_idempotent_and_settles(self):
        with tempfile.TemporaryDirectory() as td:
            db = Path(td) / "tr.db"
            raw = Path(td) / "raw"
            raw.mkdir()
            self._write_csvs(raw)
            payload = self._payload()

            first = tr.log_signals(db, payload)
            second = tr.log_signals(db, payload)
            self.assertGreater(first, 0)
            self.assertEqual(second, 0)

            settled = tr.settle(db, raw, self.UNIVERSE, horizon=1)
            self.assertEqual(settled, 2)

            report = tr.stats(db)
            self.assertIn("TestModel", report)
            self.assertIn("liquidadas=2/2", report)

    def test_settle_skips_future_dates(self):
        with tempfile.TemporaryDirectory() as td:
            db = Path(td) / "tr.db"
            raw = Path(td) / "raw"
            raw.mkdir()
            self._write_csvs(raw)
            tr.log_signals(db, self._payload(as_of="2099-01-01"))
            self.assertEqual(tr.settle(db, raw, self.UNIVERSE), 0)


if __name__ == "__main__":
    unittest.main()
