# SENTINEL — AI-Powered Financial Scam & Claim Verifier

> Built for **SANGYAN Investor Resilience Hackathon** — IIT (BHU) × SEBI × NSDL  
> **Track A: Digital Fraud & Scam Resilience**

---

## Problem Being Solved

Retail investors — especially first-time investors in Tier-2 and Tier-3 cities — receive suspicious financial messages via WhatsApp, SMS, Telegram, and email. These messages promise guaranteed returns, fake regulatory approvals, or impersonate officials. Victims often have no quick, trustworthy way to evaluate a message before acting.

**SENTINEL** provides an AI-powered, explainable risk assessment to help investors identify red flags in suspicious financial messages — without providing investment advice.

---

## What SENTINEL Does (and Does NOT Do)

| ✅ SENTINEL CAN | ❌ SENTINEL CANNOT |
|---|---|
| Analyse suspicious financial messages | Recommend buying/selling/holding assets |
| Detect scam/red-flag patterns | Predict stock prices or returns |
| Extract and assess specific claims | Provide personalised investment advice |
| Suggest safe verification steps | Promote brokers or financial products |
| Communicate uncertainty clearly | Collect OTPs, passwords, or sensitive data |

---

## Architecture

```
User Input (suspicious message)
        ↓
FastAPI Backend (Python 3.11+)
        ↓
Pydantic Validation (length, whitespace)
        ↓
Safety Guardrail (safety_service.py)
   ↙ blocked              ↘ scam message to analyse
Safety Response         Deterministic Scanner (analysis_service.py)
                              ↓ always runs
                        Risk Score + Indicators
                              ↓
                   LLM available? (LLM_API_KEY set?)
                    ↙ No              ↘ Yes
              Deterministic     LLM-enriched analysis
              Result             (claims, summary, steps)
                    ↓               ↓
               Merged AnalyzeResponse
                        ↓
                  JSON Response → Frontend
```

### Key Design Decisions
- **Deterministic first** — the rule-based scanner always runs and always anchors the risk score. The LLM only enriches it — it cannot lower the score.
- **No invented evidence** — the MVP never fabricates SEBI/NSDL source citations.
- **Graceful degradation** — works fully without an LLM API key (deterministic fallback).
- **Provider-agnostic LLM** — any OpenAI-compatible API works (OpenAI, Groq, Together AI, etc.).

---

## Project Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI app, CORS, lifespan, exception handlers
│   ├── config.py               # All env-var settings
│   ├── models/
│   │   ├── request_models.py   # AnalyzeRequest (Pydantic)
│   │   └── response_models.py  # AnalyzeResponse, SafetyResponse, enums
│   ├── routes/
│   │   ├── health.py           # GET /api/v1/health
│   │   └── analyze.py          # POST /api/v1/analyze
│   ├── services/
│   │   ├── llm_service.py      # OpenAI-compatible HTTP caller
│   │   ├── analysis_service.py # Deterministic scanner + LLM merger
│   │   └── safety_service.py   # Investment-advice guardrail
│   └── utils/
│       └── logging_config.py   # Structured logging setup
├── tests/
│   ├── test_health.py
│   ├── test_analyze.py
│   └── test_safety.py
├── .env.example
├── .gitignore
├── requirements.txt
├── pytest.ini
└── README.md
```

---

## Installation (Windows)

### 1. Create and activate a virtual environment

```bash
python -m venv .venv
.venv\Scripts\activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment

```bash
copy .env.example .env
```

Edit `.env` — at minimum set `LLM_API_KEY` if you have one. The backend works without it.

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `APP_NAME` | `SENTINEL` | Application name |
| `APP_VERSION` | `1.0.0` | Version string |
| `LLM_API_KEY` | _(empty)_ | Your LLM API key. Leave empty to run in deterministic mode. |
| `LLM_MODEL` | `gpt-4o-mini` | Model name |
| `LLM_BASE_URL` | `https://api.openai.com/v1` | OpenAI-compatible base URL |
| `LLM_TIMEOUT_SECONDS` | `30` | Request timeout |
| `ALLOWED_ORIGINS` | `http://localhost:5173,...` | CORS allowed origins |

### Supported LLM Providers

```env
# OpenAI
LLM_API_KEY=sk-...
LLM_MODEL=gpt-4o-mini
LLM_BASE_URL=https://api.openai.com/v1

# Groq (free tier available)
LLM_API_KEY=gsk_...
LLM_MODEL=llama-3.1-8b-instant
LLM_BASE_URL=https://api.groq.com/openai/v1

# Together AI
LLM_API_KEY=...
LLM_MODEL=meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo
LLM_BASE_URL=https://api.together.xyz/v1
```

---

## Running Locally

```bash
uvicorn app.main:app --reload --port 8000
```

| URL | Description |
|---|---|
| `http://localhost:8000` | Root |
| `http://localhost:8000/api/v1/health` | Health check |
| `http://localhost:8000/api/v1/analyze` | Analysis endpoint |
| `http://localhost:8000/docs` | Swagger UI |
| `http://localhost:8000/redoc` | ReDoc |

---

## API Endpoints

### `GET /api/v1/health`

```json
{
  "status": "healthy",
  "service": "sentinel-backend",
  "version": "1.0.0"
}
```

---

### `POST /api/v1/analyze`

**Request:**
```json
{
  "content": "Guaranteed 40% returns in 30 days. Join now and send the registration fee immediately. Limited slots!"
}
```

**Validation:**
- Required, min 10 chars, max 10,000 chars
- Whitespace-only input rejected

**Example response (deterministic mode — no LLM key):**
```json
{
  "analysis_id": "aa9a8b87-c139-451b-8663-2477bbe4c5b1",
  "risk_level": "HIGH",
  "risk_score": 70,
  "summary": "Multiple high-risk indicators detected (rule-based score: 70/100). This message contains patterns commonly associated with financial scams. Exercise extreme caution.",
  "claims": [],
  "risk_indicators": [
    {
      "indicator": "General guarantee language",
      "severity": "HIGH",
      "explanation": "Use of 'guaranteed' in financial promotion is a strong scam signal."
    },
    {
      "indicator": "Upfront fee request",
      "severity": "HIGH",
      "explanation": "Charging a registration fee before returns is a common advance-fee fraud pattern."
    },
    {
      "indicator": "Limited-slots pressure",
      "severity": "MEDIUM",
      "explanation": "Fake scarcity of 'slots' or 'seats' is a common soft-sell scam tactic."
    },
    {
      "indicator": "Urgency to join",
      "severity": "MEDIUM",
      "explanation": "Pressure to join immediately reduces due-diligence time — a common scam pattern."
    },
    {
      "indicator": "Return percentage promise",
      "severity": "MEDIUM",
      "explanation": "Specific high-return promises without caveats are suspicious."
    }
  ],
  "evidence_status": "Evidence could not be independently verified by this prototype. [DEVELOPMENT MODE: This result is from a rule-based scanner, not AI analysis.]",
  "evidence": [],
  "uncertainty": "This assessment is based on keyword pattern matching only. The absence of detected indicators does not confirm the message is legitimate.",
  "safe_next_steps": [
    "Do NOT transfer money or share personal details based on this message.",
    "Do NOT click any links in the message without verifying the sender.",
    "Never share OTPs, passwords, or banking credentials with anyone.",
    "Verify any SEBI registration claims at https://www.sebi.gov.in",
    "Report suspicious messages to SEBI at scores@sebi.gov.in"
  ],
  "disclaimer": "This analysis is for investor awareness and safety. It is not investment advice."
}
```

**Safety block response** (when user asks for investment advice directly):
```json
{
  "error": false,
  "message": "SENTINEL does not provide investment recommendations.",
  "guidance": "SENTINEL is designed for investor safety, scam detection and financial-content verification...",
  "disclaimer": "SENTINEL is an investor-safety and scam-verification tool..."
}
```

---

## Risk Score System

The deterministic scanner assigns weighted points to detected patterns:

| Severity | Points | Examples |
|---|---|---|
| HIGH | 20 | Guaranteed returns, OTP request, WhatsApp investment group, fake SEBI approval |
| MEDIUM | 10 | Urgency, limited-time offer, % return promise |
| LOW | 5 | Hurry, don't miss |

**Score → Risk Level:**
- `0–24` → `LOW`
- `25–49` → `MEDIUM`
- `50–100` → `HIGH`
- No indicators detected → `INSUFFICIENT_EVIDENCE`

> The score is an investor-awareness indicator. It is NOT a definitive determination of fraud.

---

## Testing

```bash
pytest tests/ -v
```

**38 tests across 3 files — all pass.**

| File | Tests |
|---|---|
| `test_health.py` | Health endpoint, response body, content type |
| `test_analyze.py` | Valid request, empty/short/long input, advice block, scam analysis, LLM failure/fallback |
| `test_safety.py` | 10 advice patterns blocked, 7 scam messages pass through, safety response structure |

---

## Safety & Guardrail Design

### Two-layer safety

**Layer 1 — Input Guardrail (`safety_service.py`)**  
Detects when the user is asking SENTINEL for direct investment advice and returns a safe refusal.

**Critical distinction:**
- ❌ `"Should I buy Infosys stock?"` → **blocked** (user wants advice)
- ✅ `"BUY XYZ! Guaranteed 50% return!"` → **analysed** (scam message)

**Layer 2 — Deterministic Score Anchor (`analysis_service.py`)**  
The rule-based scanner always runs. The LLM enriches but cannot override the risk level — preventing prompt-injected manipulation of the risk score.

### No invented evidence
The MVP never fabricates SEBI/NSDL citations. If verification was not performed, it says so.

---

## Hackathon Context

**Event:** SANGYAN Investor Resilience Hackathon  
**Organizers:** IIT (BHU), SEBI, NSDL  
**Track:** Track A — Digital Fraud & Scam Resilience  
**Target Users:** First-time and retail investors in Tier-2/Tier-3 cities in India

---

*SENTINEL is a public-good investor awareness tool. It does not provide investment advice.*
