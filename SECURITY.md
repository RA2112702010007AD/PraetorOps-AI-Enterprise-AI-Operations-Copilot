# PraetorOps AI — Enterprise Security Policy & Architecture

**Document Classification:** Internal / Architecture Specification  
**Version:** 1.0.0  
**Target Environment:** Google Cloud Platform (Cloud Run, Vertex AI, GCS, Secret Manager)  

---

## 1. Executive Summary

PraetorOps AI is an Enterprise AI Operations Copilot designed according to zero-trust principles. Its mission is to assist engineering, operations, and security teams in diagnosing incidents, retrieving verified runbooks, and formulating remediation plans **without granting the AI autonomous execution authority over production systems**.

> [!IMPORTANT]
> **Enterprise Security Notice:**  
> This system is designed with enterprise security principles. Controls and multi-tenant isolation are implemented for demonstration. Production deployment requires organization-specific compliance validation.

---

## 2. Authentication & Identity Model

- **Separation of Authentication and Authorization:** The system decouples identity assertion from entitlement checks.
- **Service Identity:** In production, workloads authenticate via **Google Cloud Workload Identity Federation**, binding Kubernetes Service Accounts (KSA) or Cloud Run identities to least-privilege Google IAM Service Accounts. Long-lived JSON service account keys are strictly prohibited.
- **Simulated Auth Demo Mode:** In sandbox environments, authentication is simulated via request headers (`X-User-Id`, `X-User-Role`, `X-Tenant-Id`, `X-User-Name`) passed through a server-side perimeter proxy.

---

## 3. Authorization & Role-Based Access Control (RBAC)

The application enforces a granular 4-tier Role-Based Access Control model:

| Role | Personas | Granted Permissions | Write / Tool Authority |
| :--- | :--- | :--- | :--- |
| **Admin** | VP of Cloud Operations, CISO | `admin:all`, `approvals:approve`, `approvals:reject`, `tools:execute_high_risk`, `security:override` | Full authority to approve and execute production remediations. |
| **Engineer** | Staff SRE, DevOps Lead | `incident:read`, `incident:write`, `rag:search`, `rag:manage`, `tools:read`, `tools:execute_low_risk`, `approvals:request` | Read-only telemetry tools; can **request** high-impact actions but cannot approve. |
| **Analyst** | SecOps Lead, Threat Hunter | `security:read`, `security:write`, `audit:read`, `rag:search`, `tools:read`, `approvals:request` | Read security events, query audit logs; request quarantine actions. |
| **Viewer** | Tech Support, Junior Auditor | `incident:read`, `rag:search`, `audit:read` | Read-only knowledge retrieval and incident inspection only. |

---

## 4. Multi-Tenant Isolation Architecture

1. **Partitioning Key:** Every entity (documents, vector embeddings, telemetry incidents, approval tickets, and audit logs) is tagged with a mandatory `tenant_id` (e.g. `tenant_acme`, `tenant_nova`, `tenant_demo`).
2. **Context Binding:** On every incoming API call, the tenant context is extracted and injected into:
   - Vector search metadata filters (eliminating cross-tenant RAG candidate generation).
   - Tool execution arguments.
   - Audit logging streams.
3. **Cross-Tenant Violation Detection:** If an agent or user attempts to retrieve an entity belonging to a different tenant, the request is intercepted, rejected with `HTTP 403 Forbidden`, and recorded as a `CROSS_TENANT_REQUEST_BLOCKED` security event.

---

## 5. Prompt Injection Defense & AI Safety Guard

Before any prompt or retrieved document is sent to Gemini/Vertex AI, it is scanned by the **AI Safety Guard**:

```
USER QUERY / EXTERNAL DOCUMENT
            ↓
┌───────────────────────────────────────┐
│         AI SAFETY GUARD               │
│  - Threat Signature Regex Matching    │
│  - Instruction Override Detection     │
│  - Jailbreak Token Interception       │
└───────────────────────────────────────┘
            ↓
  ┌─────────┴─────────┐
[SAFE]             [BLOCKED]
  ↓                   ↓
Demarcate Data     Emit Audit Event
Proceed to Agent   Return Security Refusal
```

### Threat Signatures Detected:
- Direct instruction overrides (`"ignore all previous instructions"`, `"ignore prior rules"`)
- System prompt exfiltration (`"reveal your internal system prompt"`, `"print developer mode"`)
- Credential harvesting (`"send database master passwords to..."`)
- Security control bypassing (`"disable security controls"`, `"bypass rbac"`)

### Data vs. Instruction Demarcation:
External text and user-uploaded documents are wrapped in boundary tags:
```xml
<UNTRUSTED_DATA_BOUNDARY source="Doc Title">
...external untrusted text...
</UNTRUSTED_DATA_BOUNDARY>
```
This informs the foundation model that the enclosed block is strictly data to be analyzed, never executable instructions.

---

## 6. Safe Tool Invocation & Human-in-the-Loop Gateway

### Tool Classification:
- **READ-ONLY TOOLS (Autonomous):**
  - `get_incident_details()`
  - `get_service_health()`
  - `get_recent_deployments()`
  - `search_logs()`
  - `get_security_alerts()`
  - `get_runbook()`
  - `get_service_metrics()`
- **WRITE / HIGH-IMPACT TOOLS (MANDATORY APPROVAL):**
  - `restart_production_service()`
  - `rollback_deployment()`
  - `change_configuration()`
  - `rotate_credentials()`
  - `isolate_compromised_host()`
  - `modify_firewall_rule()`

### Approval Workflow:
1. When a remediation step requires a high-impact tool, the agent registers a pending **Approval Ticket**.
2. The ticket details:
   - Action Title & Tool Requested
   - Risk Level (`HIGH` or `CRITICAL`)
   - Reason & Expected Operational Impact
   - Grounded Evidence & Supporting Runbook Citations
   - Requested By (Agent & User)
3. The system presents `[Approve]`, `[Reject]`, and `[Modify]` buttons.
4. The tool **never executes** until authorized by an operator with appropriate RBAC permissions (`Admin`).

---

## 7. Cryptographic Audit Trail

- Every action is recorded in an immutable-style audit log.
- Each log entry contains a **SHA-256 integrity hash** chained to the preceding entry:
  $$\text{Hash}_n = \text{SHA256}(\text{Entry}_n \parallel \text{Hash}_{n-1})$$
- Operators can verify the chain of custody at any time via the `/api/audit/verify-integrity` endpoint.

---

## 8. Secrets Management & Client Boundary Protection

- **No Secrets in Client Code:** API keys, database credentials, and service account keys are never passed to the browser.
- **Server-Side Proxy Boundary:** All calls to Google Cloud Vertex AI and Gemini pass through the backend FastAPI service.
- **Environment Variables:** Credentials are read from environment variables or Google Cloud Secret Manager.

---

## 9. Known Limitations

- In demonstration mode, enterprise tools execute against a high-fidelity synthetic telemetry dataset rather than modifying active cloud infrastructure.
- Multi-region failover and CMEK key rotation in demo mode simulate Google Cloud APIs.
