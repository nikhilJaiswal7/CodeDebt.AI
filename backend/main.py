from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
import time

app = FastAPI(title="DebtIntel.ai - Advanced Technical Debt Intelligence")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODELS ---

class ChatMessage(BaseModel):
    message: str

class SimulationRequest(BaseModel):
    scenario: str # "leaver", "feature_rush", "refactor_sprint"
    params: dict

# --- ENDPOINTS ---

@app.get("/api/health")
def get_health():
    return {
        "health_score": 82,
        "total_files_analyzed": 1432,
        "high_risk_files": 12,
        "debt_score": 91,
        "risk_trend": "+2.4%",
        "active_contributors": 24,
        "critical_repos": 2
    }

@app.get("/api/debt-trend")
def get_debt_trend():
    return [
        {"month": "Jan", "actual": 65, "predicted": 66},
        {"month": "Feb", "actual": 68, "predicted": 70},
        {"month": "Mar", "actual": 72, "predicted": 75},
        {"month": "Apr", "actual": 80, "predicted": 82},
        {"month": "May", "actual": 82, "predicted": 85},
        {"month": "Jun", "actual": None, "predicted": 88},
        {"month": "Jul", "actual": None, "predicted": 94},
    ]

@app.get("/api/dangerous-files")
def get_dangerous_files():
    return [
        {"path": "src/services/payment/PaymentProcessor.ts", "riskScore": 98, "busFactor": 1, "complexity": 142, "churn": "High", "impact": "Critical"},
        {"path": "src/auth/OAuthHandler.ts", "riskScore": 94, "busFactor": 2, "complexity": 89, "churn": "Medium", "impact": "High"},
        {"path": "src/db/migrations/0034_add_invoices.sql", "riskScore": 91, "busFactor": 1, "complexity": 15, "churn": "Low", "impact": "Medium"},
        {"path": "src/ui/components/CheckoutModal.tsx", "riskScore": 88, "busFactor": 3, "complexity": 64, "churn": "High", "impact": "Medium"},
        {"path": "src/utils/mathHelpers.js", "riskScore": 82, "busFactor": 1, "complexity": 230, "churn": "Low", "impact": "Low"},
    ]

@app.get("/api/risk-map")
def get_risk_map():
    modules = ["Auth", "Payments", "Invoices", "Notifications", "Core", "API", "Analytics", "Search", "CI/CD", "Security"]
    data = []
    for m in modules:
        data.append({
            "name": m,
            "riskLevel": random.choice(["Low", "Medium", "High", "Critical"]),
            "size": random.randint(60, 180),
            "loc": random.randint(1000, 50000)
        })
    return data

@app.get("/api/roi-analysis")
def get_roi():
    return {
        "refactor_cost_hours": 40,
        "potential_bug_reduction": "28%",
        "delivery_speed_increase": "14%",
        "maintenance_savings_annual": "$42,000",
        "payback_period": "2.5 Sprints"
    }

@app.post("/api/simulate")
def simulate_scenario(req: SimulationRequest):
    time.sleep(1.5) # Heavy simulation processing...
    if req.scenario == "leaver":
        dev_name = req.params.get("name", "Key Developer")
        return {
            "impact_score": "+44% Risk",
            "critical_modules": ["Auth", "Payments"],
            "recommendation": f"Initiate knowledge transfer for {dev_name}'s modules immediately.",
            "new_bus_factor": 0
        }
    elif req.scenario == "feature_rush":
        return {
            "impact_score": "+32% Bug Rate",
            "debt_projection": "72 -> 94",
            "stability_warning": "High probability of production incident in Module: Invoice",
            "recommendation": "Allocate 20% of next 3 sprints to 'Cool Down' refactoring."
        }
    return {"status": "Simulation Complete", "impact": "Neutral"}

@app.post("/api/copilot")
def copilot_chat(chat: ChatMessage):
    time.sleep(1) 
    msg = chat.message.lower()
    
    if "payment" in msg and "risky" in msg:
        response = "Payment Service analysis: Risk ↑24%. Complexity: +31%, Churn: +48%. Identified 4 unvetted dependencies. Bus factor is 1 (Nikhil). Impact Radius: High. Recommendation: Extract 'GatewayAdapter' to reduce coupling."
    elif "fail" in msg or "quarter" in msg:
        response = "Predictive Model suggests: `Invoice` module has 87% failure probability within 60 days. Current trend shows memory leak patterns in its processing loop. Also, `PaymentProcessor` coupling exceeds stable limits."
    elif "reduce" in msg or "fastest" in msg:
        response = "Optimal Debt Reduction Path:\n1. Decouple `OAuthHandler.ts` (Saves 12h/month)\n2. Refactor `PaymentProcessor.ts` (Reduces critical bugs by 15%)\n3. Automated test coverage for `mathHelpers.js` (Low effort, high safety reward)."
    elif "simulate" in msg or "digital twin" in msg:
        response = "Digital Twin is ready. Try simulating: 'What happens if we stop refactoring for 3 months?' or 'What happens if our Lead Architect leaves?'"
    else:
        response = "I am DebtIntel AI. I process your graph data, commits, and complexity to provide engineering foresight. Ask me about specific modules, future failure predictions, or ROI on refactoring."
        
    return {"reply": response}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
