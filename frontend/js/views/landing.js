/**
 * PraetorOps AI — Public / Enterprise Landing Page View
 */

const LandingView = {
  render(container) {
    container.innerHTML = `
      <div class="landing-page-wrapper" style="max-width: 1100px; margin: 0 auto; padding: 1.5rem 0 3rem;">
        
        <!-- Hero Section -->
        <div class="landing-hero" style="text-align: center; padding: 2.5rem 1rem 3.5rem; border-bottom: 1px solid var(--border-subtle);">
          <div style="display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 9999px; padding: 0.35rem 0.9rem; margin-bottom: 1.25rem;">
            <span class="status-dot online"></span>
            <span style="font-size: 0.75rem; font-weight: 600; color: var(--accent-cyan); letter-spacing: 0.04em;">GOOGLE CLOUD & VERTEX AI POWERED</span>
          </div>
          <h1 style="font-size: 2.5rem; font-weight: 800; letter-spacing: -0.03em; color: #fff; line-height: 1.2; margin-bottom: 1rem;">
            PraetorOps AI — Enterprise AI Operations Copilot
          </h1>
          <p style="font-size: 1.05rem; color: var(--text-secondary); max-width: 760px; margin: 0 auto 2rem; line-height: 1.6;">
            A secure agentic AI operations platform for enterprise teams. Accelerate incident triage, correlate telemetry and CI/CD deployments, and retrieve verified runbook knowledge with Gemini-powered reasoning — <strong style="color: #F8FAFC;">without allowing the AI to perform high-impact actions autonomously</strong>.
          </p>
          <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
            <button class="btn btn-primary" id="landingLaunchCopilotBtn" style="padding: 0.65rem 1.4rem; font-size: 0.9rem;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              <span>Launch AI Operations Copilot</span>
            </button>
            <button class="btn btn-secondary" id="landingExploreArchBtn" style="padding: 0.65rem 1.4rem; font-size: 0.9rem;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
              <span>Explore Architecture & Threat Model</span>
            </button>
          </div>
        </div>

        <!-- Problem & Solution Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(440px, 1fr)); gap: 1.5rem; margin: 2.5rem 0;">
          <div class="section-card" style="border-left: 3px solid var(--color-danger);">
            <h3 style="color: #F87171; font-size: 1rem; font-weight: 700; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              The Enterprise Challenge
            </h3>
            <p style="font-size: 0.825rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 0.75rem;">
              When critical incidents occur (e.g. 504 Gateway Timeouts or database lock contention), on-call SREs navigate fragmented telemetry, disparate runbooks, and recent canary releases under high cognitive load.
            </p>
            <ul style="font-size: 0.8rem; color: var(--text-muted); padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.4rem;">
              <li>Unsafe AI wrappers risk prompt injection and confidential data leakage</li>
              <li>Autonomous agents risk catastrophic runaway production outages</li>
              <li>Generic LLMs hallucinate non-existent runbook steps and false citations</li>
            </ul>
          </div>

          <div class="section-card" style="border-left: 3px solid var(--color-success);">
            <h3 style="color: #34D399; font-size: 1rem; font-weight: 700; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
              The PraetorOps Solution
            </h3>
            <p style="font-size: 0.825rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 0.75rem;">
              PraetorOps delivers an enterprise-grade agentic copilot with zero-trust AI guardrails, strict tenant boundary isolation, and human-in-the-loop authorization gates.
            </p>
            <ul style="font-size: 0.8rem; color: var(--text-muted); padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.4rem;">
              <li><strong style="color: var(--text-primary);">Grounded RAG:</strong> Every assertion maps to verified documents (<span class="table-code">[Source 1]</span>)</li>
              <li><strong style="color: var(--text-primary);">Human Approval Gateway:</strong> Destructive commands require operator sign-off</li>
              <li><strong style="color: var(--text-primary);">Zero-Trust AI Safety Guard:</strong> Blocks prompt injection & instruction hijacking</li>
            </ul>
          </div>
        </div>

        <!-- 8 Core Architectural Pillars -->
        <div class="section-card">
          <div class="section-header">
            <div>
              <div class="section-title">8 Enterprise Architecture Pillars</div>
              <div class="section-desc">Designed according to Google Cloud and Agent Development Kit (ADK) enterprise patterns</div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin-top: 1rem;">
            <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-subtle); padding: 1rem; border-radius: var(--radius-md);">
              <div style="font-weight: 700; color: var(--accent-cyan); font-size: 0.85rem; margin-bottom: 0.35rem;">1. Gemini-Powered Reasoning</div>
              <p style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.45;">Multi-step intent classification, planning, and root cause diagnosis through Google Cloud Vertex AI.</p>
            </div>

            <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-subtle); padding: 1rem; border-radius: var(--radius-md);">
              <div style="font-weight: 700; color: var(--accent-cyan); font-size: 0.85rem; margin-bottom: 0.35rem;">2. Multi-Agent Orchestration</div>
              <p style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.45;">Coordinated specialized agents: Incident Investigation, Knowledge, Security, Document, Remediation, and Evaluation.</p>
            </div>

            <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-subtle); padding: 1rem; border-radius: var(--radius-md);">
              <div style="font-weight: 700; color: var(--accent-cyan); font-size: 0.85rem; margin-bottom: 0.35rem;">3. Production RAG Architecture</div>
              <p style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.45;">Multi-tenant chunking, vector reranking, and explicit fallback refusal if evidence is insufficient.</p>
            </div>

            <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-subtle); padding: 1rem; border-radius: var(--radius-md);">
              <div style="font-weight: 700; color: var(--accent-cyan); font-size: 0.85rem; margin-bottom: 0.35rem;">4. Human-in-the-Loop Gateway</div>
              <p style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.45;">Read-only tools execute automatically; high-impact actions (rollbacks, credential revocation) pause for authorization.</p>
            </div>

            <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-subtle); padding: 1rem; border-radius: var(--radius-md);">
              <div style="font-weight: 700; color: var(--accent-cyan); font-size: 0.85rem; margin-bottom: 0.35rem;">5. AI Safety Guard & Injection Shield</div>
              <p style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.45;">Pre-flight scanning intercepting instruction override attacks and demarcating untrusted data boundaries.</p>
            </div>

            <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-subtle); padding: 1rem; border-radius: var(--radius-md);">
              <div style="font-weight: 700; color: var(--accent-cyan); font-size: 0.85rem; margin-bottom: 0.35rem;">6. Strict Multi-Tenant Isolation</div>
              <p style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.45;">Every vector chunk and API call binds to tenant_id; cross-tenant leakage attempts are blocked at the perimeter.</p>
            </div>

            <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-subtle); padding: 1rem; border-radius: var(--radius-md);">
              <div style="font-weight: 700; color: var(--accent-cyan); font-size: 0.85rem; margin-bottom: 0.35rem;">7. Cryptographic Audit Trail</div>
              <p style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.45;">SHA-256 hash chaining tracks every agent invocation, tool call, and operator approval decision.</p>
            </div>

            <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-subtle); padding: 1rem; border-radius: var(--radius-md);">
              <div style="font-weight: 700; color: var(--accent-cyan); font-size: 0.85rem; margin-bottom: 0.35rem;">8. Continuous AI Evaluation</div>
              <p style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.45;">Automated 15-case adversarial benchmark verifying Grounding (97%), Safety (100%), and Tool Accuracy (95%).</p>
            </div>
          </div>
        </div>

        <!-- Compliance & Security Disclaimer -->
        <div style="background: rgba(15, 23, 42, 0.4); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1rem 1.25rem; font-size: 0.75rem; color: var(--text-muted); line-height: 1.5; text-align: center;">
          <strong style="color: var(--text-secondary);">Enterprise Security Notice:</strong>
          Designed with enterprise security principles. Security controls and multi-tenant isolation implemented for demonstration. Production deployment requires organization-specific compliance validation. All demonstrated company profiles, logs, and incidents are synthetic.
        </div>

      </div>
    `;

    document.getElementById('landingLaunchCopilotBtn')?.addEventListener('click', () => {
      AppState.setView('copilot');
    });

    document.getElementById('landingExploreArchBtn')?.addEventListener('click', () => {
      AppState.setView('architecture');
    });
  }
};
