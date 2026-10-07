"""
PraetorOps AI — Approvals Router.
Manages the Human-in-the-Loop approval queue for high-impact actions.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Body
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from ..core.security import get_current_security_context, SecurityContext
from ..tools.approvals import approval_gateway

router = APIRouter(prefix="/api/approvals", tags=["Human Approvals"])

class ResolveTicketRequest(BaseModel):
    decision: str  # "APPROVE", "REJECT", "MODIFY"
    notes: Optional[str] = ""
    modified_params: Optional[Dict[str, Any]] = None

@router.get("")
def list_approval_tickets(
    status: Optional[str] = Query(None),
    context: SecurityContext = Depends(get_current_security_context)
):
    return approval_gateway.list_tickets(tenant_id=context.tenant_id, status_filter=status)

@router.post("/{ticket_id}/resolve")
def resolve_ticket(
    ticket_id: str,
    req: ResolveTicketRequest,
    context: SecurityContext = Depends(get_current_security_context)
):
    result = approval_gateway.resolve_ticket(
        ticket_id=ticket_id,
        decision=req.decision.upper(),
        context=context,
        notes=req.notes or "",
        modified_params=req.modified_params
    )
    if result.get("status") == "forbidden":
        raise HTTPException(status_code=403, detail=result.get("message"))
    if result.get("status") == "error":
        raise HTTPException(status_code=400, detail=result.get("message"))
    return result
