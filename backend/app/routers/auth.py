"""
PraetorOps AI — Authentication & Session Management Router.
Simulates enterprise identity management (Google Workspace SSO, Okta SAML 2.0,
Titan Hardware Key MFA, and Role-Based Persona Authentication).
Records every authentication handshake in the immutable audit log.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
import uuid
from ..core.audit import audit_manager
from ..core.security import ROLE_PERMISSIONS
from ..data.synthetic_db import USERS_DB, TENANTS_DB

router = APIRouter(prefix="/api/auth", tags=["Authentication & Identity"])

class LoginRequest(BaseModel):
    email: Optional[str] = "sarah.chen@acme-corp.internal"
    role: Optional[str] = "Engineer"
    tenant_id: Optional[str] = "tenant_acme"
    auth_method: Optional[str] = "PERSONA_QUICK_LOGIN"  # "PASSWORD", "GOOGLE_WORKSPACE_SSO", "SAML_OKTA", "PERSONA_QUICK_LOGIN"
    mfa_code: Optional[str] = None
    remember_session: bool = True

@router.get("/personas")
def get_available_personas():
    """Returns curated enterprise personas for instant evaluation & demo sign-in."""
    personas_info = [
        {
            "id": "usr_mgr_03",
            "name": "Marcus Vance",
            "email": "marcus.vance@acme-corp.internal",
            "role": "Admin",
            "title": "VP of Cloud Operations",
            "department": "Global Infrastructure",
            "tenant_id": "tenant_acme",
            "clearance": "Top Secret / Production Root",
            "description": "Full administrator authority. Can approve and execute high-risk write remediations (rollbacks, cluster restarts).",
            "badges": ["Hardware MFA Enforced", "Production Approver", "Admin Root"],
            "permissions_count": len(ROLE_PERMISSIONS.get("Admin", []))
        },
        {
            "id": "usr_sre_01",
            "name": "Sarah Chen",
            "email": "sarah.chen@acme-corp.internal",
            "role": "Engineer",
            "title": "Staff Site Reliability Engineer",
            "department": "Platform Reliability",
            "tenant_id": "tenant_acme",
            "clearance": "Operational Reliability Tier-1",
            "description": "Diagnoses incidents, inspects telemetry, runs RAG runbooks, and requests remediation approvals.",
            "badges": ["Incident Responder", "Read-Only Tools", "Approval Requester"],
            "permissions_count": len(ROLE_PERMISSIONS.get("Engineer", []))
        },
        {
            "id": "usr_sec_02",
            "name": "Alex Rivera",
            "email": "alex.rivera@acme-corp.internal",
            "role": "Analyst",
            "title": "Lead Security Operations Analyst",
            "department": "Cyber Defense & Threat Intelligence",
            "tenant_id": "tenant_acme",
            "clearance": "SecOps Threat Intelligence",
            "description": "Triages security detections, analyzes prompt injection attacks, audits cryptographic logs, and requests account quarantines.",
            "badges": ["Threat Intel", "Audit Inspector", "Quarantine Requester"],
            "permissions_count": len(ROLE_PERMISSIONS.get("Analyst", []))
        },
        {
            "id": "usr_sup_04",
            "name": "Elena Rostova",
            "email": "elena.rostova@acme-corp.internal",
            "role": "Viewer",
            "title": "Senior Technical Support Engineer",
            "department": "Customer Tier-3 Engineering",
            "tenant_id": "tenant_acme",
            "clearance": "Support Read-Only",
            "description": "Accesses knowledge runbooks and inspects customer-facing incidents without write permissions.",
            "badges": ["Read-Only", "No Write Authority", "Support Tier-3"],
            "permissions_count": len(ROLE_PERMISSIONS.get("Viewer", []))
        }
    ]
    return personas_info

@router.post("/login")
def login_endpoint(req: LoginRequest):
    """
    Authenticates user, validates tenant and role entitlements, and creates
    an ephemeral zero-trust session while emitting an immutable audit event.
    """
    role = req.role if req.role in ROLE_PERMISSIONS else "Viewer"
    tenant_id = req.tenant_id if any(t["id"] == req.tenant_id for t in TENANTS_DB) else "tenant_acme"

    # Match user profile or synthesize matching profile
    matching_user = next((u for u in USERS_DB if u["role"] == role and (u["tenant_id"] == tenant_id or role == "Admin")), None)
    if not matching_user:
        matching_user = next((u for u in USERS_DB if u["role"] == role), USERS_DB[0])

    tenant_obj = next((t for t in TENANTS_DB if t["id"] == tenant_id), TENANTS_DB[0])
    session_id = f"sess_{uuid.uuid4().hex[:12]}"

    # Record immutable audit entry
    risk_level = "HIGH" if role == "Admin" else "LOW"
    audit_manager.record_action(
        user=matching_user["name"],
        tenant=tenant_id,
        action="USER_AUTHENTICATED",
        agent="Identity Gateway",
        tool=f"auth_protocol:{req.auth_method.lower()}",
        risk_level=risk_level,
        approval_status="AUTO_ALLOWED",
        result=f"Session {session_id} established for {matching_user['name']} ({role}) under {tenant_obj['name']}"
    )

    return {
        "status": "success",
        "session_id": session_id,
        "token": f"praetor_jwt_{uuid.uuid4().hex}",
        "user": {
            "id": matching_user["id"],
            "name": matching_user["name"],
            "email": req.email or matching_user["email"],
            "role": role,
            "title": matching_user["title"],
            "department": matching_user.get("department", "Cloud Operations"),
            "tenant_id": tenant_id,
            "permissions": ROLE_PERMISSIONS.get(role, [])
        },
        "tenant": tenant_obj,
        "auth_method": req.auth_method,
        "mfa_verified": True,
        "expires_in_seconds": 28800,
        "login_time": datetime.now(timezone.utc).isoformat()
    }

@router.post("/logout")
def logout_endpoint(user_name: Optional[str] = "User", tenant_id: Optional[str] = "tenant_acme"):
    """Terminates session and records logout in audit log."""
    audit_manager.record_action(
        user=user_name or "User",
        tenant=tenant_id or "tenant_acme",
        action="USER_LOGGED_OUT",
        agent="Identity Gateway",
        tool="session_terminate",
        risk_level="LOW",
        approval_status="AUTO_ALLOWED",
        result=f"Session revoked for {user_name}"
    )
    return {"status": "success", "message": "Session terminated cleanly."}
