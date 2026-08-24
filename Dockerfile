FROM python:3.11-slim

WORKDIR /app
ENV PIP_NO_CACHE_DIR=1 \
    PYTHONUNBUFFERED=1 \
    QVB_SIGNALS_PATH=/app/artifacts/signals.json \
    MLFLOW_ALLOW_FILE_STORE=true

COPY requirements-qlib.txt requirements-vibe.txt requirements-mcp.txt ./
RUN apt-get update \
    && apt-get install -y --no-install-recommends libgomp1 \
    && rm -rf /var/lib/apt/lists/* \
    && pip install -r requirements-qlib.txt -r requirements-mcp.txt

COPY bridge/ bridge/
COPY qlib_side/ qlib_side/
COPY vibe_side/ vibe_side/
COPY scripts/ scripts/
COPY config/ config/
COPY tests/ tests/
COPY vendor/ vendor/

RUN python -m compileall -q bridge qlib_side vibe_side scripts tests \
    && python -m unittest discover -s tests

CMD ["python", "scripts/run_pipeline.py", "--force-demo"]
