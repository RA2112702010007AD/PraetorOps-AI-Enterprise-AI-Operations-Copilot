"""
PraetorOps AI — Enterprise Tool Registry & Safe Execution Engine.
Strictly separates:
- READ-ONLY tools (can execute automatically if permitted by RBAC)
- WRITE / HIGH-IMPACT tools (NEVER execute autonomously; require Human-in-the-loop approval)
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from ..data.synthetic_db import INCIDENTS_DB, DEPLOYMENTS_DB, SECURITY_EVENTS_DB
from ..core.security import SecurityContext

class ToolDefinition:
    def __init__(
        self,
        name: str,
        description: str,
        is_high_impact: bool,
        required_permission: str,
        parameters: Dict[str, Any]
    ):
        self.name = name
        self.description = description
        self.is_high_impact = is_high_impact
        self.required_permission = required_permission
        self.parameters = parameters

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "description": self.description,
            "is_high_impact": self.is_high_impact,
            "category": "WRITE_ACTION (Approval Required)" if self.is_high_impact else "READ_ONLY",
            "required_permission": self.required_permission,
            "parameters": self.parameters
        }

class EnterpriseToolRegistry:
    def __init__(self):
        self.tools: Dict[str, ToolDefinition] = {}
        self._register_default_tools()

    def _register_default_tools(self):
        # 1. READ-ONLY TOOLS
        self.register(ToolDefinition(
            name="get_incident_details",
            description="Retrieves telemetry, metrics, preliminary root cause and logs for an incident.",
            is_high_impact=False,
            required_permission="incident:read",
            parameters={"incident_id": "string"}
        ))
        self.register(ToolDefinition(
            name="get_service_health",
            description="Fetches live health status, CPU, memory, error rates for a cloud service.",
            is_high_impact=False,
            required_permission="tools:read",
            parameters={"service_name": "string"}
        ))
        self.register(ToolDefinition(
            name="get_recent_deployments",
            description="Lists recent Cloud Deploy / ArgoCD deployment and canary events.",
            is_high_impact=False,
            required_permission="tools:read",
            parameters={"service_name": "optional string", "limit": "int"}
        ))
        self.register(ToolDefinition(
            name="search_logs",
            description="Searches Cloud Logging telemetry for error traces and stack signatures.",
            is_high_impact=False,
            required_permission="tools:read",
            parameters={"service_name": "string", "query": "string"}
        ))
        self.register(ToolDefinition(
            name="get_security_alerts",
            description="Fetches active security detections, anomalous IAM actions, or VPC flow spikes.",
            is_high_impact=False,
            required_permission="security:read",
            parameters={"severity": "optional string"}
        ))
        self.register(ToolDefinition(
            name="get_service_metrics",
            description="Retrieves time-series metrics such as p99 latency, connection counts, and error rates.",
            is_high_impact=False,
            required_permission="tools:read",
            parameters={"service_name": "string", "metric_type": "string"}
        ))
        self.register(ToolDefinition(
            name="get_runbook",
            description="Retrieves operational runbook procedures and escalation matrix for a specific topic.",
            is_high_impact=False,
            required_permission="rag:search",
            parameters={"topic": "string"}
        ))

        # 2. WRITE / HIGH-IMPACT TOOLS (MANDATORY APPROVAL GATEWAY)
        self.register(ToolDefinition(
            name="restart_production_service",
            description="Performs graceful rolling restart of Kubernetes deployment pods.",
            is_high_impact=True,
            required_permission="tools:execute_high_risk",
            parameters={"service_name": "string", "namespace": "string", "reason": "string"}
        ))
        self.register(ToolDefinition(
            name="rollback_deployment",
            description="Rolls back deployment release to a previously verified stable container tag.",
            is_high_impact=True,
            required_permission="tools:execute_high_risk",
            parameters={"service_name": "string", "target_version": "string", "reason": "string"}
        ))
        self.register(ToolDefinition(
            name="change_configuration",
            description="Modifies production ConfigMap or environment runtime parameters.",
            is_high_impact=True,
            required_permission="tools:execute_high_risk",
            parameters={"service_name": "string", "config_patch": "object", "reason": "string"}
        ))
        self.register(ToolDefinition(
            name="rotate_credentials",
            description="Revokes active OAuth tokens and regenerates key pairs for a service account.",
            is_high_impact=True,
            required_permission="tools:execute_high_risk",
            parameters={"service_account": "string", "reason": "string"}
        ))
        self.register(ToolDefinition(
            name="isolate_compromised_host",
            description="Applies VPC firewall quarantine tags to sever outbound network connections.",
            is_high_impact=True,
            required_permission="tools:execute_high_risk",
            parameters={"host_ip": "string", "quarantine_zone": "string"}
        ))
        self.register(ToolDefinition(
            name="modify_firewall_rule",
            description="Updates Google Cloud Armor WAF policy or VPC firewall filter.",
            is_high_impact=True,
            required_permission="tools:execute_high_risk",
            parameters={"rule_id": "string", "action": "ALLOW|DENY", "cidr": "string"}
        ))

    def register(self, tool_def: ToolDefinition):
        self.tools[tool_def.name] = tool_def

    def get_tool(self, tool_name: str) -> Optional[ToolDefinition]:
        return self.tools.get(tool_name)

    def list_tools(self) -> List[Dict[str, Any]]:
        return [t.to_dict() for t in self.tools.values()]

    def execute_read_only_tool(
        self,
        tool_name: str,
        params: Dict[str, Any],
        context: SecurityContext
    ) -> Dict[str, Any]:
        """Executes simulated read-only enterprise tools safely."""
        tool = self.get_tool(tool_name)
        if not tool:
            return {"status": "error", "message": f"Tool '{tool_name}' not found."}
        if tool.is_high_impact:
            return {
                "status": "approval_required",
                "message": f"Tool '{tool_name}' is high-impact and cannot be executed automatically."
            }

        # Validate read permission
        context.require_permission(tool.required_permission)

        # Dispatch simulated read operations
        if tool_name == "get_incident_details":
            inc_id = params.get("incident_id", "INC-1024").upper()
            found = next((i for i in INCIDENTS_DB if i["id"] == inc_id and i["tenant_id"] == context.tenant_id), None)
            if not found:
                # Fallback to search by service name
                found = next((i for i in INCIDENTS_DB if params.get("incident_id", "").lower() in i["title"].lower() and i["tenant_id"] == context.tenant_id), None)
            return {"status": "success", "data": found or {"message": f"Incident {inc_id} not found for tenant {context.tenant_id}"}}

        elif tool_name == "get_service_health":
            svc = params.get("service_name", "api-gateway")
            return {
                "status": "success",
                "data": {
                    "service": svc,
                    "tenant_id": context.tenant_id,
                    "status": "Degraded" if svc in ["api-gateway", "payment-service", "order-processing-v2"] else "Healthy",
                    "uptime_pct": 99.82,
                    "active_pods": 8,
                    "ready_pods": 8,
                    "cpu_usage_pct": 94.2 if svc == "api-gateway" else 42.1,
                    "memory_usage_pct": 88.5,
                    "active_alerts": 2 if svc == "api-gateway" else 0
                }
            }

        elif tool_name == "get_recent_deployments":
            svc = params.get("service_name")
            matched = [d for d in DEPLOYMENTS_DB if d["tenant_id"] == context.tenant_id]
            if svc:
                matched = [d for d in matched if d["service"] == svc]
            return {"status": "success", "data": matched[:5]}

        elif tool_name == "search_logs":
            q = params.get("query", "").lower()
            svc = params.get("service_name", "api-gateway")
            logs = []
            for inc in INCIDENTS_DB:
                if inc["tenant_id"] == context.tenant_id:
                    for l in inc["logs_snippet"]:
                        if not q or q in l.lower():
                            logs.append(l)
            return {"status": "success", "data": {"matched_logs": logs[:6], "service": svc}}

        elif tool_name == "get_security_alerts":
            sev = params.get("severity")
            alerts = [a for a in SECURITY_EVENTS_DB if a["tenant_id"] == context.tenant_id]
            if sev:
                alerts = [a for a in alerts if a["severity"].upper() == sev.upper()]
            return {"status": "success", "data": alerts[:6]}

        elif tool_name == "get_service_metrics":
            svc = params.get("service_name", "api-gateway")
            return {
                "status": "success",
                "data": {
                    "service": svc,
                    "p50_latency_ms": 18,
                    "p95_latency_ms": 120,
                    "p99_latency_ms": 4890 if svc == "api-gateway" else 35,
                    "throughput_rps": 1240,
                    "error_rate_pct": 18.4 if svc == "api-gateway" else 0.05
                }
            }

        elif tool_name == "get_runbook":
            topic = params.get("topic", "")
            return {
                "status": "success",
                "data": {
                    "topic": topic,
                    "recommended_doc": "DOC-KB-001 (API Gateway High Latency Triage)",
                    "summary": "Check keep-alive timeouts and Envoy cluster connection pools. Rollback if v2.4.1 deployment."
                }
            }

        return {"status": "unknown_tool", "data": None}

tool_registry = EnterpriseToolRegistry()
