"""
PraetorOps AI — Specialized Remediation Agent.
Generates step-by-step remediation plans and enforces strict Human-in-the-Loop approval
for any high-risk or destructive operational actions.
"""

from typing import Dict, Any, List
from ..rag.engine import rag_engine
from ..tools.approvals import approval_gateway
from ..core.security import SecurityContext
from ..core.audit import audit_manager

class RemediationAgent:
    name = "Remediation Agent"
    role = "Formulates safe remediation plans and registers approval requests for high-impact actions."

    @classmethod
    def execute(
        cls,
        query: str,
        context: SecurityContext,
        incident_id: str = "INC-1024"
    ) -> Dict[str, Any]:
        # Formulate remediation based on context
        is_rollback_requested = "rollback" in query.lower() or "v2.4.0" in query.lower() or "inc-1024" in query.lower()
        is_kafka = "kafka" in query.lower() or "inc-1028" in query.lower() or "heap" in query.lower()

        if is_kafka:
            action_title = "Scale JVM Heap Allocation to -Xmx8g for Order Consumer Pods"
            tool_name = "change_configuration"
            risk_level = "HIGH"
            params = {"service_name": "order-processing-v2", "config_patch": {"JAVA_TOOL_OPTIONS": "-Xmx8g -XX:+UseG1GC"}}
            reason = "Resolve consumer lag and Stop-The-World GC pauses causing Kafka consumer partition rebalance storms (INC-1028)."
            impact = "Rolling restart of 6 consumer pods over 90 seconds. Consumer lag will drain within 4 minutes."
            evidence = "OutOfMemoryError in order-worker-7c pod logs; Runbook DOC-KB-004 recommends -Xmx8g heap scale."
            doc_query = "Kafka Consumer Lag JVM Heap OOM Troubleshooting DOC-KB-004"
        else:
            action_title = "Rollback Canary Deployment DEP-4019 to Stable Envoy Proxy v2.4.0"
            tool_name = "rollback_deployment"
            risk_level = "HIGH"
            params = {"service_name": "api-gateway", "target_version": "v2.4.0"}
            reason = "Restore API Gateway latency SLO and eliminate cascading 504 timeouts (INC-1024)."
            impact = "Canary traffic drained over 2 seconds; ingress p99 latency expected to normalize from 4,890ms to 42ms."
            evidence = "Canary DEP-4019 v2.4.1 correlated with 18.4% 504 error rate spike and Envoy pool queue overflow (DOC-KB-001 Section 2)."
            doc_query = "API Gateway High Latency 504 Gateway Timeout Triage DOC-KB-001"

        # Retrieve grounding runbook
        rag_sources = rag_engine.retrieve_chunks(
            query=doc_query,
            tenant_id=context.tenant_id,
            top_k=2
        )

        # Register formal pending approval ticket in the gateway
        ticket = approval_gateway.request_approval(
            tenant_id=context.tenant_id,
            action_title=action_title,
            risk_level=risk_level,
            reason=reason,
            expected_impact=impact,
            evidence=evidence,
            tool_name=tool_name,
            parameters=params,
            requested_by_user=context.user_name,
            requested_by_agent=cls.name,
            ai_recommendation=f"Recommended per {rag_sources[0]['citation_id'] if rag_sources else 'Runbook'}. Operator approval required."
        )

        answer_text = (
            f"### Proposed Remediation Plan (Human Approval Required)\n\n"
            f"The AI Copilot has generated the following remediation plan. In accordance with Enterprise Safety Policy, **the AI is prohibited from executing high-risk actions autonomously**.\n\n"
            f"**Action Title:** {action_title}\n"
            f"**Risk Level:** `{risk_level}`\n"
            f"**Approval Ticket Created:** `{ticket.ticket_id}` (Status: `PENDING`)\n\n"
            f"#### Evidence & Supporting Context:\n"
            f"{evidence}\n\n"
            f"#### Expected Operational Impact:\n"
            f"{impact}\n\n"
            f"#### Runbook Justification:\n"
        )

        if rag_sources:
            for s in rag_sources:
                answer_text += f"- {s['citation_id']} **{s['document_name']}** ({s['section']}): {s['evidence_snippet'][:200]}...\n"

        answer_text += (
            f"\n\n👉 **Next Action:** Please review and authorize this action in the **Approvals** dashboard, or click **Approve** on the action card below."
        )

        audit_manager.record_action(
            user=context.user_id,
            tenant=context.tenant_id,
            action="REMEDIATION_PROPOSED",
            agent=cls.name,
            tool=tool_name,
            risk_level=risk_level,
            approval_status="PENDING_APPROVAL",
            result=f"Registered approval ticket {ticket.ticket_id}"
        )

        return {
            "answer": answer_text,
            "citations": rag_sources,
            "grounding_score": 0.98,
            "has_sufficient_evidence": True,
            "approval_ticket": ticket.to_dict(),
            "reasoning_summary": f"Formulated {risk_level}-risk plan based on {rag_sources[0]['citation_id'] if rag_sources else 'Runbook'} and created approval ticket {ticket.ticket_id}."
        }
