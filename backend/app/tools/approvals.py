"""
PraetorOps AI — Human-in-the-Loop Approval Gateway.
Ensures zero autonomous execution of high-impact or destructive operational commands.
Tracks pending requests, verifies approver authorization, logs audit records,
and executes approved remediation actions.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from ..core.security import SecurityContext
from ..core.audit import audit_manager

class ApprovalTicket:
    def __init__(
        self,
        ticket_id: str,
        tenant_id: str,
        action_title: str,
        risk_level: str,
        reason: str,
        expected_impact: str,
        evidence: str,
        tool_name: str,
        parameters: Dict[str, Any],
        requested_by_user: str,
        requested_by_agent: str,
        ai_recommendation: str,
        status: str = "PENDING"
    ):
        self.ticket_id = ticket_id
        self.tenant_id = tenant_id
        self.action_title = action_title
        self.risk_level = risk_level  # HIGH, CRITICAL
        self.reason = reason
        self.expected_impact = expected_impact
        self.evidence = evidence
        self.tool_name = tool_name
        self.parameters = parameters
        self.requested_by_user = requested_by_user
        self.requested_by_agent = requested_by_agent
        self.ai_recommendation = ai_recommendation
        self.status = status  # PENDING, APPROVED, REJECTED, MODIFIED
        self.created_at = datetime.now(timezone.utc).isoformat()
        self.resolved_at: Optional[str] = None
        self.resolved_by: Optional[str] = None
        self.resolution_notes: Optional[str] = None
        self.execution_output: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "ticket_id": self.ticket_id,
            "tenant_id": self.tenant_id,
            "action_title": self.action_title,
            "risk_level": self.risk_level,
            "reason": self.reason,
            "expected_impact": self.expected_impact,
            "evidence": self.evidence,
            "tool_name": self.tool_name,
            "parameters": self.parameters,
            "requested_by_user": self.requested_by_user,
            "requested_by_agent": self.requested_by_agent,
            "ai_recommendation": self.ai_recommendation,
            "status": self.status,
            "created_at": self.created_at,
            "resolved_at": self.resolved_at,
            "resolved_by": self.resolved_by,
            "resolution_notes": self.resolution_notes,
            "execution_output": self.execution_output
        }

class ApprovalGateway:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ApprovalGateway, cls).__new__(cls)
            cls._instance.tickets: Dict[str, ApprovalTicket] = {}
            cls._instance._seed_demo_approvals()
        return cls._instance

    def _seed_demo_approvals(self):
        # Seed realistic pending approvals for immediate demonstration
        t1 = ApprovalTicket(
            ticket_id="APR-2041",
            tenant_id="tenant_acme",
            action_title="Rollback API Gateway to v2.4.0 (Canary DEP-4019 De-escalation)",
            risk_level="HIGH",
            reason="Remediate INC-1024 cascading 504 timeouts caused by Envoy keep-alive mismatch in v2.4.1.",
            expected_impact="Brief 2-second connection drain on canary pods; terminates degraded Envoy proxies and restores p99 latency to 42ms.",
            evidence="Canary rollout DEP-4019 deployed at 18:00Z correlated with 18.4% error rate and connection pool exhaustion at 18:14Z (DOC-KB-001 Section 2).",
            tool_name="rollback_deployment",
            parameters={"service_name": "api-gateway", "target_version": "v2.4.0"},
            requested_by_user="sarah.chen@acme-corp.internal",
            requested_by_agent="Remediation Agent",
            ai_recommendation="Approve rollback immediately to restore ingress SLO.",
            status="PENDING"
        )
        self.tickets[t1.ticket_id] = t1

        t2 = ApprovalTicket(
            ticket_id="APR-2042",
            tenant_id="tenant_acme",
            action_title="Quarantine Compromised Service Account 'sa-dataproc-etl'",
            risk_level="CRITICAL",
            reason="Contain suspected credential leak and volumetric data egress flagged in SEC-8001 / INC-1027.",
            expected_impact="Dataproc night ETL batches will pause until new Workload Identity credential is bound.",
            evidence="Anomalous OAuth access token generated from unapproved external IP 203.0.113.195 followed by 42GB Cloud Storage read.",
            tool_name="rotate_credentials",
            parameters={"service_account": "sa-dataproc-etl@acme.iam.gserviceaccount.com"},
            requested_by_user="alex.rivera@acme-corp.internal",
            requested_by_agent="Security Agent",
            ai_recommendation="Approve isolation per Enterprise Security Policy DOC-KB-003 Section 4.1.",
            status="PENDING"
        )
        self.tickets[t2.ticket_id] = t2

        t3 = ApprovalTicket(
            ticket_id="APR-2040",
            tenant_id="tenant_acme",
            action_title="Scale Cloud Spanner Compute Capacity from 2 Nodes to 4 Nodes",
            risk_level="HIGH",
            reason="Relieve lock contention on 'settlement_ledger' row partition during reconciliation surge.",
            expected_impact="Transient 30% hourly billing increase during peak settlement batch window.",
            evidence="INC-1025 Spanner transaction abort rate spiked to 142 aborts/sec (normal is 0.4/sec).",
            tool_name="change_configuration",
            parameters={"service_name": "spanner-primary", "config_patch": {"nodes": 4}},
            requested_by_user="sarah.chen@acme-corp.internal",
            requested_by_agent="Remediation Agent",
            ai_recommendation="Approved previously by VP Ops Marcus Vance.",
            status="APPROVED"
        )
        t3.resolved_at = datetime.now(timezone.utc).isoformat()
        t3.resolved_by = "marcus.vance@acme-corp.internal"
        t3.resolution_notes = "Pre-approved for batch reconciliation peak."
        t3.execution_output = "Spanner instance scaled to 4 nodes in us-central1; commit queue drained."
        self.tickets[t3.ticket_id] = t3

    def request_approval(
        self,
        tenant_id: str,
        action_title: str,
        risk_level: str,
        reason: str,
        expected_impact: str,
        evidence: str,
        tool_name: str,
        parameters: Dict[str, Any],
        requested_by_user: str,
        requested_by_agent: str,
        ai_recommendation: str
    ) -> ApprovalTicket:
        ticket_id = f"APR-{len(self.tickets) + 2040:04d}"
        ticket = ApprovalTicket(
            ticket_id=ticket_id,
            tenant_id=tenant_id,
            action_title=action_title,
            risk_level=risk_level,
            reason=reason,
            expected_impact=expected_impact,
            evidence=evidence,
            tool_name=tool_name,
            parameters=parameters,
            requested_by_user=requested_by_user,
            requested_by_agent=requested_by_agent,
            ai_recommendation=ai_recommendation,
            status="PENDING"
        )
        self.tickets[ticket_id] = ticket

        # Audit event
        audit_manager.record_action(
            user=requested_by_user,
            tenant=tenant_id,
            action="TOOL_EXECUTION_REQUESTED",
            agent=requested_by_agent,
            tool=tool_name,
            risk_level=risk_level,
            approval_status="PENDING_APPROVAL",
            result=f"Approval ticket {ticket_id} created for {action_title}"
        )
        return ticket

    def list_tickets(self, tenant_id: str, status_filter: Optional[str] = None) -> List[Dict[str, Any]]:
        results = [t for t in self.tickets.values() if t.tenant_id == tenant_id]
        if status_filter and status_filter != "ALL":
            results = [t for t in results if t.status == status_filter]
        return [t.to_dict() for t in sorted(results, key=lambda x: x.created_at, reverse=True)]

    def resolve_ticket(
        self,
        ticket_id: str,
        decision: str,  # "APPROVE", "REJECT", "MODIFY"
        context: SecurityContext,
        notes: str = "",
        modified_params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        ticket = self.tickets.get(ticket_id)
        if not ticket:
            return {"status": "error", "message": f"Approval ticket {ticket_id} not found."}

        # Check cross-tenant access
        context.validate_tenant_access(ticket.tenant_id)

        # RBAC Check: Only Admin or Lead roles can approve/reject high-risk operations
        if decision in ["APPROVE", "MODIFY"] and not (context.has_permission("approvals:approve") or context.role == "Admin"):
            return {
                "status": "forbidden",
                "message": f"RBAC Restriction: Role '{context.role}' is not authorized to grant production execution approval."
            }

        now_iso = datetime.now(timezone.utc).isoformat()
        ticket.resolved_at = now_iso
        ticket.resolved_by = f"{context.user_name} ({context.role})"
        ticket.resolution_notes = notes

        if decision == "APPROVE":
            ticket.status = "APPROVED"
            ticket.execution_output = f"Simulated execution of '{ticket.tool_name}' completed successfully with params {ticket.parameters}."
            audit_action = "HUMAN_APPROVAL_GRANTED"
            res_msg = f"Action {ticket.tool_name} approved and executed by {context.user_name}."

        elif decision == "REJECT":
            ticket.status = "REJECTED"
            ticket.execution_output = "Action execution cancelled per operator rejection."
            audit_action = "HUMAN_APPROVAL_REJECTED"
            res_msg = f"Action {ticket.tool_name} rejected by {context.user_name}."

        elif decision == "MODIFY":
            ticket.status = "MODIFIED"
            if modified_params:
                ticket.parameters = modified_params
            ticket.execution_output = f"Action executed with modified parameters: {ticket.parameters}."
            audit_action = "HUMAN_APPROVAL_MODIFIED"
            res_msg = f"Action {ticket.tool_name} modified and executed by {context.user_name}."

        else:
            return {"status": "error", "message": f"Invalid decision '{decision}'."}

        # Record immutable audit entry
        audit_manager.record_action(
            user=context.user_id,
            tenant=ticket.tenant_id,
            action=audit_action,
            agent="Approval Gateway",
            tool=ticket.tool_name,
            risk_level=ticket.risk_level,
            approval_status=ticket.status,
            result=f"{ticket.ticket_id}: {res_msg} (Notes: {notes})"
        )

        return {"status": "success", "ticket": ticket.to_dict()}

approval_gateway = ApprovalGateway()
