"""
PraetorOps AI — Security & AI Safety Guard Router.
Provides AI Safety Guard live scanning, security events, and threat model references.
"""

from fastapi import APIRouter, Depends, Query, Body
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from ..core.security import get_current_security_context, SecurityContext, PromptInjectionGuard, ROLE_PERMISSIONS
from ..data.synthetic_db import SECURITY_EVENTS_DB, TENANTS_DB

router = APIRouter(prefix="/api/security", tags=["Security & Governance"])

class SafetyTestRequest(BaseModel):
    prompt: str

@router.post("/scan-prompt")
def scan_prompt_endpoint(
    req: SafetyTestRequest,
    context: SecurityContext = Depends(get_current_security_context)
):
    """Interactive playground for testing the prompt injection scanner."""
    is_safe, refusal_reason, pattern = PromptInjectionGuard.scan_query(req.prompt)
    return {
        "is_safe": is_safe,
        "matched_threat_signature": pattern,
        "refusal_reason": refusal_reason,
        "action_taken": "ALLOW_AGENT_DISPATCH" if is_safe else "INTERCEPT_AND_REFUSE",
        "tested_prompt": req.prompt
    }

@router.get("/events")
def list_security_events(
    severity: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    context: SecurityContext = Depends(get_current_security_context)
):
    context.require_permission("security:read")
    events = [e for e in SECURITY_EVENTS_DB if e["tenant_id"] == context.tenant_id]
    if severity and severity != "ALL":
        events = [e for e in events if e["severity"].upper() == severity.upper()]
    if status and status != "ALL":
        events = [e for e in events if e["status"].upper() == status.upper()]
    return events

@router.get("/rbac-matrix")
def get_rbac_matrix():
    return {
        "roles": list(ROLE_PERMISSIONS.keys()),
        "permissions_matrix": ROLE_PERMISSIONS
    }

@router.get("/tenants")
def get_tenants():
    return TENANTS_DB

@router.get("/threat-model")
def get_threat_model_summary():
    """Returns the 10 core threats addressed in the system architecture."""
    return [
        {
            "id": "THREAT-1",
            "threat": "Prompt Injection (Direct & Indirect)",
            "risk": "Critical",
            "mitigation": "Dual-layer AI Safety Guard, regex attack signature filter, <UNTRUSTED_DATA_BOUNDARY> tagging.",
            "residual_risk": "Low (Continuous evaluation suite checks edge cases)."
        },
        {
            "id": "THREAT-2",
            "threat": "Data Exfiltration & Credential Leakage",
            "risk": "Critical",
            "mitigation": "Server-side credential boundary; read-only default tooling; VPC Service Perimeters.",
            "residual_risk": "Low (No outbound arbitrary webhooks enabled)."
        },
        {
            "id": "THREAT-3",
            "threat": "Cross-Tenant Access Breach",
            "risk": "Critical",
            "mitigation": "Mandatory tenant_id token injection into all vector queries and API routes.",
            "residual_risk": "Negligible (Strict partition enforcement)."
        },
        {
            "id": "THREAT-4",
            "threat": "Privilege Escalation via Agent Prompting",
            "risk": "High",
            "mitigation": "RBAC verification on tool invocation; Viewer role blocked from write tools.",
            "residual_risk": "Low (Context authorization checked on every call)."
        },
        {
            "id": "THREAT-5",
            "threat": "Malicious or Runaway Tool Invocation",
            "risk": "Critical",
            "mitigation": "All write/destructive tools require explicit Human-in-the-Loop approval.",
            "residual_risk": "Negligible (AI lacks autonomous execution tokens)."
        },
        {
            "id": "THREAT-6",
            "threat": "Sensitive Information Disclosure in Logs",
            "risk": "High",
            "mitigation": "Chain-of-thought suppressed; client logs stripped of secrets; audit hashing.",
            "residual_risk": "Low."
        },
        {
            "id": "THREAT-7",
            "threat": "RAG Knowledge Poisoning",
            "risk": "High",
            "mitigation": "Document write requires RBAC permission ('rag:manage'); chunk provenance tracking.",
            "residual_risk": "Low."
        },
        {
            "id": "THREAT-8",
            "threat": "Model Hallucination on Operational Actions",
            "risk": "High",
            "mitigation": "Explicit fallback rule ('insufficient evidence'); citation verification before response.",
            "residual_risk": "Low."
        },
        {
            "id": "THREAT-9",
            "threat": "Unauthorized Production Remediation",
            "risk": "Critical",
            "mitigation": "Formal Approval Tickets in Approval Gateway with cryptographic audit logging.",
            "residual_risk": "Low."
        },
        {
            "id": "THREAT-10",
            "threat": "Browser-Side Secret Exposure",
            "risk": "Critical",
            "mitigation": "Backend server proxy; zero API keys or secrets shipped in frontend JS bundle.",
            "residual_risk": "Zero."
        }
    ]
