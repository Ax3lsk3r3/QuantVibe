from __future__ import annotations

import hashlib
import hmac
import json
import math
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional

SCHEMA_VERSION = 1
REQUIRED_TOP_KEYS = (
    "schema_version",
    "generated_at",
    "source_model",
    "universe",
    "as_of",
    "signals",
    "metadata",
)


class SignalValidationError(ValueError):
    pass


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def canonical_json(payload: Dict[str, Any]) -> str:
    return json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def checksum_of(payload: Dict[str, Any]) -> str:
    body = {k: v for k, v in payload.items() if k != "checksum"}
    return hashlib.sha256(canonical_json(body).encode("utf-8")).hexdigest()


def select_top_k(scores: Dict[str, float], k: int) -> List[Dict[str, Any]]:
    if k <= 0:
        raise ValueError("k must be positive")
    ranked = sorted(scores.items(), key=lambda kv: (-kv[1], kv[0]))[:k]
    return [
        {"instrument": sym, "score": float(score), "rank": i}
        for i, (sym, score) in enumerate(ranked, start=1)
    ]


def build_payload(
    signals: List[Dict[str, Any]],
    universe: Iterable[str],
    as_of: str,
    source_model: str,
    data_source: str,
    top_k: int,
    horizon_days: int,
    test_start: Optional[str] = None,
    test_end: Optional[str] = None,
) -> Dict[str, Any]:
    metadata: Dict[str, Any] = {
        "top_k": int(top_k),
        "horizon_days": int(horizon_days),
        "data_source": data_source,
        "n_candidates": len(signals) or None,
    }
    if test_start and test_end:
        metadata["test_window"] = [test_start, test_end]
    payload = {
        "schema_version": SCHEMA_VERSION,
        "generated_at": utc_now_iso(),
        "source_model": source_model,
        "universe": sorted(universe),
        "as_of": as_of,
        "horizon_days": int(horizon_days),
        "signals": signals,
        "metadata": metadata,
    }
    return payload


def validate_payload(payload: Dict[str, Any]) -> None:
    if not isinstance(payload, dict):
        raise SignalValidationError("payload must be a JSON object")
    for key in REQUIRED_TOP_KEYS:
        if key not in payload:
            raise SignalValidationError(f"missing required key: {key}")
    if payload["schema_version"] != SCHEMA_VERSION:
        raise SignalValidationError(
            f"unsupported schema_version={payload['schema_version']!r}, expected {SCHEMA_VERSION}"
        )
    try:
        datetime.fromisoformat(str(payload["generated_at"]).replace("Z", "+00:00"))
    except ValueError as exc:
        raise SignalValidationError(f"generated_at is not ISO-8601: {exc}") from exc
    if not isinstance(payload["as_of"], str) or len(payload["as_of"]) != 10:
        raise SignalValidationError("as_of must be a YYYY-MM-DD string")

    universe = payload["universe"]
    if not isinstance(universe, list) or not universe or not all(isinstance(s, str) and s for s in universe):
        raise SignalValidationError("universe must be a non-empty list of strings")

    signals = payload["signals"]
    if not isinstance(signals, list) or not signals:
        raise SignalValidationError("signals must be a non-empty list")
    seen_instruments = set()
    ranks: List[int] = []
    for entry in signals:
        if not isinstance(entry, dict):
            raise SignalValidationError("each signal must be an object")
        inst = entry.get("instrument")
        score = entry.get("score")
        rank = entry.get("rank")
        if not isinstance(inst, str) or not inst:
            raise SignalValidationError("signal.instrument must be a non-empty string")
        if inst in seen_instruments:
            raise SignalValidationError(f"duplicated instrument in signals: {inst}")
        seen_instruments.add(inst)
        try:
            score_f = float(score)
        except (TypeError, ValueError) as exc:
            raise SignalValidationError(f"signal.score for {inst} is not numeric") from exc
        if not math.isfinite(score_f):
            raise SignalValidationError(f"signal.score for {inst} is not finite")
        if not isinstance(rank, int) or isinstance(rank, bool):
            raise SignalValidationError(f"signal.rank for {inst} must be an integer")
        ranks.append(rank)
    if sorted(ranks) != list(range(1, len(signals) + 1)):
        raise SignalValidationError("ranks must be a contiguous 1..N sequence without duplicates")


def write_signals(path: os.PathLike | str, payload: Dict[str, Any]) -> Path:
    validate_payload(payload)
    out = Path(path)
    out.parent.mkdir(parents=True, exist_ok=True)
    full = dict(payload)
    full["checksum"] = checksum_of(full)
    tmp = out.with_suffix(out.suffix + ".tmp")
    with open(tmp, "w", encoding="utf-8") as fh:
        json.dump(full, fh, indent=2, ensure_ascii=False)
        fh.write("\n")
    os.replace(tmp, out)
    return out


def load_signals(path: os.PathLike | str, verify_checksum: bool = True) -> Dict[str, Any]:
    out = Path(path)
    if not out.is_file():
        raise FileNotFoundError(f"archivo de señales no encontrado: {out}")
    with open(out, "r", encoding="utf-8") as fh:
        payload = json.load(fh)
    stored = payload.get("checksum")
    if verify_checksum:
        if not isinstance(stored, str) or not stored:
            raise SignalValidationError("checksum missing from signals file")
        expected = checksum_of(payload)
        if not hmac.compare_digest(stored, expected):
            raise SignalValidationError(
                "checksum no coincide: el archivo de señales fue modificado después de escribirse"
            )
    else:
        payload.pop("checksum", None)
    validate_payload(payload)
    return payload


def summary(payload: Dict[str, Any]) -> str:
    lines = [
        f"model={payload['source_model']} as_of={payload['as_of']} "
        f"data={payload['metadata'].get('data_source', 'unknown')}",
        f"top_{len(payload['signals'])} del universo({len(payload['universe'])}):",
    ]
    for s in sorted(payload["signals"], key=lambda x: x["rank"]):
        lines.append(f"  #{s['rank']:<2} {s['instrument']:<6} score={s['score']:+.6f}")
    return "\n".join(lines)
