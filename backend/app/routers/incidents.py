"""
PraetorOps AI — Incidents Router.
Exposes endpoints to list incidents, retrieve details, and inspect correlated deployments & logs.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, List, Dict, Any
from ..core.security import get_current_security_context, SecurityContext
from ..data.synthetic_db import INCIDENTS_DB, DEPLOYMENTS_DB

router = APIRouter(prefix="/api/incidents", tags=["Incidents"])

@router.get("")
def list_incidents(
    status: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    context: SecurityContext = Depends(get_current_security_context)
):
    context.require_permission("incident:read")
    items = [i for i in INCIDENTS_DB if i["tenant_id"] == context.tenant_id]
    if status and status != "ALL":
        items = [i for i in items if i["status"].lower() == status.lower()]
    if severity and severity != "ALL":
        items = [i for i in items if i["severity"].lower() == severity.lower()]
    return items

@router.get("/{incident_id}")
def get_incident_detail(
    incident_id: str,
    context: SecurityContext = Depends(get_current_security_context)
):
    context.require_permission("incident:read")
    inc = next((i for i in INCIDENTS_DB if i["id"] == incident_id and i["tenant_id"] == context.tenant_id), None)
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found in tenant {context.tenant_id}.")
    
    # Correlate deployment
    related_dep = next((d for d in DEPLOYMENTS_DB if d["id"] == inc.get("related_deployment_id")), None)
    return {
        "incident": inc,
        "correlated_deployment": related_dep
    }
