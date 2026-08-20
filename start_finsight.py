#!/usr/bin/env python3
"""FinSightApplication — single-process launcher (one port)."""
from __future__ import annotations
import os, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PART2 = ROOT / "part2_global_equity"
os.environ.setdefault("FINSIGHT_ROOT", str(ROOT))
os.chdir(PART2)
sys.path.insert(0, str(PART2))

import uvicorn
port = int(os.environ.get("PORT", "8000"))
print("=" * 60)
print("  FinSightApplication — unified (one port)")
print(f"  Root: {ROOT}")
print(f"  Open: http://127.0.0.1:{port}/")
print("  /  /country-ranking/  /equity/  /sector/")
print("=" * 60)
uvicorn.run("backend.main:app", host="0.0.0.0", port=port)
