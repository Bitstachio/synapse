from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="Aegis NLP Brain")

# Define what a 'User Story' looks like coming from the Gateway
class TicketContent(BaseModel):
    ticket_id: str
    description: str
    context: Optional[str] = "General Banking"

# Define the structured 'Verdict' we will return
class SafetyVerdict(BaseModel):
    status: str # e.g., "SAFE", "FLAGGED", "REJECTED"
    risk_score: float
    violations: List[str]
    suggestion: str

@app.post("/analyze", response_model=SafetyVerdict)
async def analyze_ticket(ticket: TicketContent):
    # This is where your NLP logic/API call will eventually live.
    # For now, we return a mock response to test the connection.
    
    mock_verdict = {
        "status": "SAFE",
        "risk_score": 0.1,
        "violations": [],
        "suggestion": "No issues detected in the initial scan."
    }
    
    return mock_verdict

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
