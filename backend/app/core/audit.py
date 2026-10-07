"""
PraetorOps AI — Immutable-Style Audit Logging Service.
Implements:
- Structured security, agent, tool, and human approval audit trails
- Cryptographic hash chaining (SHA-256) for tamper-evident verification
- Multi-dimensional query filtering (User, Agent, Risk, Tenant, Action)
"""

import hashlib
import json
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

class AuditLogEntry:
    def __init__(
        self,
        entry_id: str,
        timestamp: str,
        user: str,
        tenant: str,
        action: str,
        agent: str,
        tool: Optional[str],
        risk_level: str,
        approval_status: str,
        result: str,
        prev_hash: str
    ):
        self.entry_id = entry_id
        self.timestamp = timestamp
        self.user = user
        self.tenant = tenant
        self.action = action
        self.agent = agent
        self.tool = tool
        self.risk_level = risk_level
        self.approval_status = approval_status
        self.result = result
        self.prev_hash = prev_hash
        self.integrity_hash = self._compute_hash()

    def _compute_hash(self) -> str:
        payload = f"{self.entry_id}|{self.timestamp}|{self.user}|{self.tenant}|{self.action}|{self.agent}|{self.tool}|{self.risk_level}|{self.approval_status}|{self.result}|{self.prev_hash}"
        return hashlib.sha256(payload.encode("utf-8")).hexdigest()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "entry_id": self.entry_id,
            "timestamp": self.timestamp,
            "user": self.user,
            "tenant": self.tenant,
            "action": self.action,
            "agent": self.agent,
            "tool": self.tool,
            "risk_level": self.risk_level,
            "approval_status": self.approval_status,
            "result": self.result,
            "prev_hash": self.prev_hash,
            "integrity_hash": self.integrity_hash
        }

class AuditLogManager:
    """Singleton-style manager preserving cryptographic audit chain."""
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AuditLogManager, cls).__new__(cls)
            cls._instance.logs: List[AuditLogEntry] = []
            cls._instance.last_hash: str = "0000000000000000000000000000000000000000000000000000000000000000"
            cls._instance._seed_initial_logs()
        return cls._instance

    def _seed_initial_logs(self):
        seed_data = [
            ("usr_sre_01", "tenant_acme", "AI_READ_KNOWLEDGE", "Knowledge Agent", "rag_search", "LOW", "AUTO_ALLOWED", "Retrieved 3 chunks for DOC-KB-001"),
            ("usr_sre_01", "tenant_acme", "TOOL_EXECUTION_REQUESTED", "Incident Agent", "get_incident_details", "LOW", "AUTO_ALLOWED", "Retrieved metrics for INC-1024"),
            ("usr_sre_01", "tenant_acme", "TOOL_EXECUTION_REQUESTED", "Remediation Agent", "rollback_deployment", "CRITICAL", "PENDING_APPROVAL", "Rollback to v2.4.0 requested"),
            ("usr_mgr_03", "tenant_acme", "HUMAN_APPROVAL_GRANTED", "Approval Gateway", "rollback_deployment", "HIGH", "APPROVED", "Approved by VP Ops Marcus Vance"),
            ("usr_sec_02", "tenant_acme", "PROMPT_INJECTION_BLOCKED", "Security Agent", None, "HIGH", "BLOCKED", "Pattern 'ignore all previous' blocked"),
            ("usr_sec_02", "tenant_acme", "TOOL_EXECUTION_REQUESTED", "Security Agent", "get_security_alerts", "LOW", "AUTO_ALLOWED", "Fetched 10 active alerts"),
            ("usr_sup_04", "tenant_acme", "CROSS_TENANT_REQUEST_BLOCKED", "Security Guard", None, "HIGH", "BLOCKED", "Attempted tenant_nova lookup blocked"),
            ("usr_sre_01", "tenant_acme", "UNSUPPORTED_CLAIM_DETECTED", "Evaluation Agent", None, "MEDIUM", "SAFE_REFUSAL", "Refused ungrounded credential query")
        ]
        
        base_time = datetime.now(timezone.utc)
        for i, (usr, ten, act, agt, tl, risk, status, res) in enumerate(seed_data):
            ts = (base_time - datetime.resolution * 1000 - (len(seed_data) - i) * __import__("datetime").timedelta(minutes=15)).isoformat()
            self.record_action(
                user=usr,
                tenant=ten,
                action=act,
                agent=agt,
                tool=tl,
                risk_level=risk,
                approval_status=status,
                result=res,
                timestamp=ts
            )

    def record_action(
        self,
        user: str,
        tenant: str,
        action: str,
        agent: str,
        tool: Optional[str] = None,
        risk_level: str = "LOW",
        approval_status: str = "AUTO_ALLOWED",
        result: str = "Success",
        timestamp: Optional[str] = None
    ) -> AuditLogEntry:
        entry_id = f"AUD-{len(self.logs) + 1:05d}"
        ts = timestamp or datetime.now(timezone.utc).isoformat()
        
        entry = AuditLogEntry(
            entry_id=entry_id,
            timestamp=ts,
            user=user,
            tenant=tenant,
            action=action,
            agent=agent,
            tool=tool,
            risk_level=risk_level,
            approval_status=approval_status,
            result=result,
            prev_hash=self.last_hash
        )
        self.logs.append(entry)
        self.last_hash = entry.integrity_hash
        return entry

    def query_logs(
        self,
        tenant: Optional[str] = None,
        user: Optional[str] = None,
        agent: Optional[str] = None,
        risk_level: Optional[str] = None,
        action: Optional[str] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        results = []
        for entry in reversed(self.logs):
            if tenant and entry.tenant != tenant:
                continue
            if user and user.lower() not in entry.user.lower():
                continue
            if agent and agent.lower() not in entry.agent.lower():
                continue
            if risk_level and entry.risk_level != risk_level:
                continue
            if action and action.lower() not in entry.action.lower():
                continue
            results.append(entry.to_dict())
            if len(results) >= limit:
                break
        return results

audit_manager = AuditLogManager()
