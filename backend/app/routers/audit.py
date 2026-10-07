"""
PraetorOps AI — Immutable Audit Log Router.
Provides cryptographic verification and multi-dimensional filtering.
"""

from fastapi import APIRouter, Depends, Query
from typing import Optional, List, Dict, Any
from ..core.security import get_current_security_context, SecurityContext
from ..core.audit import audit_manager

router = APIRouter(prefix="/api/audit", tags=["Audit Log"])

@router.get("")
def query_audit_logs(
    user: Optional[str] = Query(None),
    agent: Optional[str] = Query(None),
    risk_level: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    context: SecurityContext = Depends(get_current_security_context)
):
    context.require_permission("audit:read")
    return audit_manager.query_logs(
        tenant=context.tenant_id,
        user=user,
        agent=agent,
        risk_level=risk_level,
        action=action,
        limit=limit
    )

@router.get("/verify-integrity")
def verify_hash_chain(
    context: SecurityContext = Depends(get_current_security_context)
):
    """Validates the SHA-256 cryptographic chain of custody."""
    context.require_permission("audit:read")
    logs = audit_manager.logs
    is_valid = True
    broken_at = None

    for i in range(1, len(logs)):
        if logs[i].prev_hash != logs[i-1].integrity_hash:
            is_valid = False
            broken_at = logs[i].entry_id
            break

    return {
        "status": "VALID" if is_valid else "CORRUPTED",
        "total_records_checked": len(logs),
        "latest_block_hash": audit_manager.last_hash,
        "broken_at_entry": broken_at,
        "compliance_standard": "Designed according to Immutable Audit Trail principles"
    }
