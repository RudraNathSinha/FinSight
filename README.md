# FinSightApplication

**Unified single-origin app** — one process, one port, one deploy.

| Path | Product |
|------|---------|
| `/` | Landing |
| `/equity/` | Global Equity Universe |
| `/sector/` | Sector & Industry Intelligence |
| `/country-ranking/` | Country Ranking |

---

## Windows (one command)

```powershell
cd FinSightApplication
python -m pip install -r requirements.txt
python start_finsight.py
```

Or double-click `start.bat`.

Open: **http://127.0.0.1:8000/**

---

## macOS / Linux

```bash
cd FinSightApplication
pip install -r requirements.txt
python start_finsight.py
# or: ./start.sh
```

---

## Render (single Web Service)

- **Root Directory:** `FinSightApplication`
- **Build:** `pip install -r requirements.txt`
- **Start:** `cd part2_global_equity && python -m uvicorn backend.main:app --host 0.0.0.0 --port $PORT`

Or use `render.yaml`.

Do **not** create multiple services. Do **not** use port 5000.

---

## Disclaimer

Educational only. Not SEBI-registered research or personalised investment advice.

© All rights reserved FinSight prepared by Rudra Nath Sinha.
