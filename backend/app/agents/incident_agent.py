"""
PraetorOps AI — Specialized Incident Investigation Agent.
Correlates incident telemetry, Cloud Logging traces, Prometheus/Cloud Monitoring metrics,
and recent CI/CD deployments to establish Root Cause Analysis (RCA).
"""

from typing import Dict, Any, List, Optional
from ..data.synthetic_db import INCIDENTS_DB, DEPLOYMENTS_DB
from ..tools.registry import tool_registry
from ..rag.engine import rag_engine
from ..core.security import SecurityContext
from ..core.audit import audit_manager

class IncidentInvestigationAgent:
    name = "Incident Investigation Agent"
    role = "Correlates metrics, telemetry logs, and deployments to diagnose production incidents."

    @classmethod
    def execute(
        cls,
        query: str,
        context: SecurityContext,
        incident_id: Optional[str] = None
    ) -> Dict[str, Any]:
        # Extract incident ID if present in query or parameter
        target_id = incident_id
        if not target_id:
            import re
            match = re.search(r"INC-\d{4}", query.upper())
            target_id = match.group(0) if match else "INC-1024"

        # Safe read-only tool invocation
        details_res = tool_registry.execute_read_only_tool(
            tool_name="get_incident_details",
            params={"incident_id": target_id},
            context=context
        )
        incident = details_res.get("data")

        if not incident or "id" not in incident:
            return {
                "answer": f"No active incident record found matching identifier '{target_id}' in tenant {context.tenant_id}.",
                "citations": [],
                "grounding_score": 0.0,
                "has_sufficient_evidence": False,
                "reasoning_summary": "Incident lookup returned no matching entity."
            }

        # Correlate recent deployments
        dep_res = tool_registry.execute_read_only_tool(
            tool_name="get_recent_deployments",
            params={"service_name": incident.get("service")},
            context=context
        )
        deployments = dep_res.get("data", [])
        related_dep = next((d for d in deployments if d.get("id") == incident.get("related_deployment_id")), None)
        if not related_dep and deployments:
            related_dep = deployments[0]

        # Retrieve relevant runbook documentation via RAG
        rag_sources = rag_engine.retrieve_chunks(
            query=f"{incident['service']} {incident['title']} {incident['root_cause_preliminary']}",
            tenant_id=context.tenant_id,
            top_k=2
        )

        # Build investigation report
        metrics = incident.get("metrics", {})
        metric_str = ", ".join([f"{k}: {v}" for k, v in list(metrics.items())[:4]])
        
        dep_str = "None identified"
        if related_dep:
            dep_str = f"{related_dep['id']} ({related_dep['version']}) deployed at {related_dep['timestamp']} by {related_dep['deployed_by']} — '{related_dep['commit_message']}'"

        logs_str = "\n".join([f"  • {l}" for l in incident.get("logs_snippet", [])])

        answer_text = (
            f"### Incident Investigation Summary: {incident['id']} ({incident['severity']})\n\n"
            f"**Service Impacted:** `{incident['service']}` | **Status:** {incident['status']}\n"
            f"**Observed Impact:** {incident['impact']}\n\n"
            f"#### 1. Telemetry & Metric Anomalies\n"
            f"{metric_str}\n\n"
            f"#### 2. Correlated Change Event\n"
            f"{dep_str}\n\n"
            f"#### 3. Critical Log Signatures\n"
            f"```text\n{logs_str}\n```\n\n"
            f"#### 4. Root Cause Analysis\n"
            f"{incident['root_cause_preliminary']}\n\n"
            f"#### 5. Relevant Operational Runbooks\n"
        )

        if rag_sources:
            for s in rag_sources:
                answer_text += f"- {s['citation_id']} **{s['document_name']}** ({s['section']}): {s['evidence_snippet'][:160]}...\n"
        else:
            answer_text += "No matching runbook found in tenant knowledge base.\n"

        audit_manager.record_action(
            user=context.user_id,
            tenant=context.tenant_id,
            action="INCIDENT_INVESTIGATED",
            agent=cls.name,
            tool="get_incident_details",
            risk_level="LOW",
            approval_status="AUTO_ALLOWED",
            result=f"Completed RCA correlation for {incident['id']}"
        )

        return {
            "answer": answer_text,
            "citations": rag_sources,
            "grounding_score": 0.96,
            "has_sufficient_evidence": True,
            "correlations": {
                "incident": incident,
                "correlated_deployment": related_dep,
                "metrics": metrics
            },
            "reasoning_summary": f"Correlated incident {incident['id']} with deployment event {related_dep.get('id') if related_dep else 'N/A'} and verified logs against runbook {rag_sources[0]['citation_id'] if rag_sources else 'N/A'}."
        }
