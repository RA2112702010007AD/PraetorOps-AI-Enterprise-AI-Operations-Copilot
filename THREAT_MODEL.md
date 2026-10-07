# PraetorOps AI — Enterprise Threat Model

**Document Classification:** Security Architecture Analysis  
**Framework:** STRIDE + OWASP Top 10 for Large Language Model Applications  
**Version:** 1.0.0  

---

## Threat Matrix

| # | Threat Vector | Risk Level | Architecture Mitigation | Residual Risk |
| :-: | :--- | :---: | :--- | :--- |
| **1** | **Direct & Indirect Prompt Injection** | **Critical** | Dual-layer AI Safety Guard scanner; pre-flight regex threat signature matching; strict demarcation of untrusted user input using `<UNTRUSTED_DATA_BOUNDARY>` XML wrappers. System prompt isolation. | **Low** — Continuous 15-case evaluation benchmark checks injection variants. |
| **2** | **Data Exfiltration via Model Tooling** | **Critical** | All outbound enterprise tools are restricted to an allowlist; arbitrary HTTP/webhook egress is disabled at the network perimeter. Tools default to read-only semantics. | **Low** — No unvetted network tools exposed to agent. |
| **3** | **Cross-Tenant Access Breach** | **Critical** | Enforce `tenant_id` claim in all session tokens; automatically inject tenant filter into all vector search retrieval queries and database lookups. Access to non-tenant resources is blocked with HTTP 403. | **Negligible** — Hard partition filters enforced in data layer. |
| **4** | **Privilege Escalation via Prompt Manipulation** | **High** | Entitlement checks are decoupled from LLM reasoning. Tool registry enforces RBAC (`Admin`, `Engineer`, `Analyst`, `Viewer`) before executing any tool, ignoring LLM claims of elevated privilege. | **Low** — Deterministic code-level RBAC intercept. |
| **5** | **Malicious or Runaway Autonomous Tool Invocation** | **Critical** | Strict segregation between READ-ONLY tools (autonomous) and WRITE/HIGH-IMPACT tools. All high-impact operations (restarts, rollbacks, firewall changes) halt in the **Human-in-the-Loop Approval Gateway**. | **Negligible** — AI holds zero execution credentials for write operations. |
| **6** | **Sensitive Information Disclosure in Logs** | **High** | Internal chain-of-thought traces are suppressed; only concise evidence summaries are returned. Client-side telemetry logs are stripped of secrets. Audit logs use structured redaction. | **Low** — Redaction filter strips keys matching token signatures. |
| **7** | **RAG Knowledge Base Poisoning** | **High** | Writing or uploading documents to the RAG store requires explicit RBAC permission (`rag:manage`). Document provenance, chunk IDs, and authors are tracked in the audit trail. | **Low** — Document creation restricted to authorized roles. |
| **8** | **Model Hallucination on Operational Actions** | **High** | Grounded citation validation (`[Source 1]`) required for all recommendations. If retrieval score is below threshold, model strictly returns: *"I don't have sufficient evidence in the connected knowledge sources to answer this reliably."* | **Low** — Hard refusal logic prevents ungrounded assertions. |
| **9** | **Unauthorized Production Remediation** | **Critical** | Every proposed remediation registers a formal **Approval Ticket** with risk score, expected impact, and runbook evidence. Only operators with `approvals:approve` permission can authorize execution. | **Low** — Dual-operator visibility with audit trail. |
| **10** | **Browser-Side Credential & API Key Leakage** | **Critical** | Zero foundation model keys or database credentials are included in client bundles. All requests route through a secure server-side boundary in Cloud Run. | **Zero** — Keys never leave the backend environment. |

---

## Residual Risk Management Strategy

1. **Automated Continuous Evaluation:** The 15-case synthetic adversarial test suite runs against all staging releases to detect regression in prompt injection resistance, tenant isolation, or grounding accuracy.
2. **Cryptographic Chaining:** Audit trails are chained with SHA-256 hashes to ensure tamper-evidence and regulatory audit readiness.
3. **Emergency Circuit Breaker:** Administrators can revoke tool execution permissions globally via the `/api/security` configuration dashboard.
