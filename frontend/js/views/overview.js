/**
 * PraetorOps AI — Executive Overview Dashboard View
 */

const OverviewView = {
  async render(container) {
    container.innerHTML = `
      <div class="overview-loading" style="text-align: center; padding: 3rem; color: var(--text-muted);">
        <div class="status-dot online" style="margin: 0 auto 1rem;"></div>
        Loading Enterprise Operations Telemetry...
      </div>
    `;

    try {
      const [incidents, approvals, obsMetrics, secEvents, kbStats] = await Promise.all([
        Api.getIncidents(),
        Api.getApprovals(),
        Api.getObservabilityMetrics(),
        Api.getSecurityEvents(),
        Api.getKnowledgeStats()
      ]);

      const activeIncidents = incidents.filter(i => i.status !== 'Resolved');
      const pendingApprovals = approvals.filter(a => a.status === 'PENDING');

      container.innerHTML = `
        <div class="overview-view">
          
          <!-- Pending Approvals Alert Banner (if any) -->
          ${pendingApprovals.length > 0 ? `
            <div style="background: linear-gradient(90deg, rgba(245, 158, 11, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: var(--radius-lg); padding: 0.9rem 1.25rem; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem;">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span class="status-dot" style="background-color: var(--color-warning); box-shadow: 0 0 8px var(--color-warning);"></span>
                <div>
                  <strong style="color: #FCD34D; font-size: 0.85rem;">${pendingApprovals.length} Operational Action(s) Pending Human Authorization</strong>
                  <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.1rem;">
                    High-impact remediation operations are halted in the Approval Gateway pending operator approval.
                  </div>
                </div>
              </div>
              <button class="btn btn-primary btn-sm" id="overviewViewApprovalsBtn" style="background: #D97706; border-color: #B45309;">
                Review Approval Queue
              </button>
            </div>
          ` : ''}

          <!-- 4 Core Metric KPI Cards -->
          <div class="grid-4">
            <div class="kpi-card">
              <div class="kpi-card-header">
                <span class="kpi-label">Active Incidents</span>
                <div class="kpi-icon danger">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                </div>
              </div>
              <div class="kpi-value-row">
                <span class="kpi-value">${activeIncidents.length}</span>
                <span class="badge badge-sev1">${incidents.filter(i => i.severity === 'SEV-1').length} SEV-1</span>
              </div>
              <div class="kpi-subtext">${incidents.length} total recorded in tenant</div>
            </div>

            <div class="kpi-card">
              <div class="kpi-card-header">
                <span class="kpi-label">RAG Grounding Score</span>
                <div class="kpi-icon cyan">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                </div>
              </div>
              <div class="kpi-value-row">
                <span class="kpi-value">${obsMetrics.rag_grounding_score_pct}%</span>
                <span class="badge" style="background: rgba(56,189,248,0.15); color: var(--accent-cyan);">Vertex RAG</span>
              </div>
              <div class="kpi-subtext">${kbStats.total_documents} documents • ${kbStats.total_chunks} indexed chunks</div>
            </div>

            <div class="kpi-card">
              <div class="kpi-card-header">
                <span class="kpi-label">Agent Success Rate</span>
                <div class="kpi-icon success">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              </div>
              <div class="kpi-value-row">
                <span class="kpi-value">${obsMetrics.agent_success_rate_pct}%</span>
                <span class="badge" style="background: var(--color-success-bg); color: var(--color-success);">SLO Met</span>
              </div>
              <div class="kpi-subtext">Avg response latency: ${obsMetrics.avg_response_latency_ms}ms</div>
            </div>

            <div class="kpi-card">
              <div class="kpi-card-header">
                <span class="kpi-label">Safety & Security Events</span>
                <div class="kpi-icon warning">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
              </div>
              <div class="kpi-value-row">
                <span class="kpi-value">${secEvents.length}</span>
                <span class="badge badge-high">${secEvents.filter(s => s.severity === 'CRITICAL' || s.severity === 'HIGH').length} High</span>
              </div>
              <div class="kpi-subtext">${obsMetrics.safety_blocks_today} prompt injections blocked today</div>
            </div>
          </div>

          <!-- Active Incidents Table & AI Investigation Quick Trigger -->
          <div class="section-card">
            <div class="section-header">
              <div>
                <div class="section-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                  Operational Incidents Triaged by PraetorOps
                </div>
                <div class="section-desc">Active telemetric anomalies correlated with recent CI/CD deployments and runbooks</div>
              </div>
              <button class="btn btn-secondary btn-sm" id="overviewViewAllIncidentsBtn">
                View All ${incidents.length} Incidents
              </button>
            </div>

            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Impacted Service</th>
                    <th>Incident Summary</th>
                    <th>Correlated Change</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${incidents.slice(0, 5).map(inc => `
                    <tr>
                      <td><span class="table-code">${inc.id}</span></td>
                      <td><span class="badge badge-${inc.severity.toLowerCase().replace('-', '')}">${inc.severity}</span></td>
                      <td><span class="badge badge-${inc.status.toLowerCase()}">${inc.status}</span></td>
                      <td><span style="font-weight: 600; color: var(--text-primary);">${inc.service}</span></td>
                      <td style="max-width: 320px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${inc.summary}">
                        ${inc.title}
                      </td>
                      <td>
                        ${inc.related_deployment_id ? `<span class="table-code" style="color: #FCD34D;">${inc.related_deployment_id}</span>` : '<span style="color: var(--text-muted);">None</span>'}
                      </td>
                      <td>
                        <button class="btn btn-primary btn-sm trigger-investigation-btn" data-inc-id="${inc.id}">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                          Investigate
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Bottom Grid: Knowledge Base & Security Posture -->
          <div class="grid-2">
            <div class="section-card">
              <div class="section-header">
                <div>
                  <div class="section-title">Knowledge Retrieval (RAG) Architecture</div>
                  <div class="section-desc">Multi-tenant runbooks and operational policy repository</div>
                </div>
                <button class="btn btn-secondary btn-sm" id="overviewViewKbBtn">Knowledge Base</button>
              </div>

              <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid var(--border-subtle); font-size: 0.8rem;">
                  <span style="color: var(--text-muted);">Connected Runbooks & Specs</span>
                  <span style="font-weight: 600; color: var(--text-primary);">${kbStats.total_documents} Verified Documents</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid var(--border-subtle); font-size: 0.8rem;">
                  <span style="color: var(--text-muted);">Vector Embedding Chunks</span>
                  <span style="font-weight: 600; color: var(--text-primary);">${kbStats.total_chunks} Chunks (text-embedding-004)</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid var(--border-subtle); font-size: 0.8rem;">
                  <span style="color: var(--text-muted);">Retrieval Reranking Policy</span>
                  <span style="font-weight: 600; color: var(--accent-cyan);">Reciprocal Rank Fusion + BM25</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; font-size: 0.8rem;">
                  <span style="color: var(--text-muted);">Hallucination Protection</span>
                  <span style="font-weight: 600; color: var(--color-success);">Strict Insufficient Evidence Fallback</span>
                </div>
              </div>
            </div>

            <div class="section-card">
              <div class="section-header">
                <div>
                  <div class="section-title">Security & Governance Controls</div>
                  <div class="section-desc">Active perimeter defenses and authorization state</div>
                </div>
                <button class="btn btn-secondary btn-sm" id="overviewViewSecBtn">Security Guard</button>
              </div>

              <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid var(--border-subtle); font-size: 0.8rem;">
                  <span style="color: var(--text-muted);">AI Safety Guard Scanner</span>
                  <span class="badge" style="background: var(--color-success-bg); color: var(--color-success);">ACTIVE (Pre-Flight)</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid var(--border-subtle); font-size: 0.8rem;">
                  <span style="color: var(--text-muted);">Tenant Boundary Isolation</span>
                  <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--accent-cyan);">${AppState.currentTenant} (ENFORCED)</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid var(--border-subtle); font-size: 0.8rem;">
                  <span style="color: var(--text-muted);">Human Approval Policy</span>
                  <span style="font-weight: 600; color: var(--color-warning);">Mandatory for all Write / High-Impact Tools</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; font-size: 0.8rem;">
                  <span style="color: var(--text-muted);">Audit Trail Cryptography</span>
                  <span style="font-family: var(--font-mono); font-size: 0.75rem; color: #34D399;">SHA-256 Hash Chained (VERIFIED)</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      `;

      // Event Listeners
      document.getElementById('overviewViewApprovalsBtn')?.addEventListener('click', () => {
        AppState.setView('approvals');
      });

      document.getElementById('overviewViewAllIncidentsBtn')?.addEventListener('click', () => {
        AppState.setView('incidents');
      });

      document.getElementById('overviewViewKbBtn')?.addEventListener('click', () => {
        AppState.setView('knowledge');
      });

      document.getElementById('overviewViewSecBtn')?.addEventListener('click', () => {
        AppState.setView('security');
      });

      container.querySelectorAll('.trigger-investigation-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const incId = btn.getAttribute('data-inc-id');
          AppState.setView('copilot');
          setTimeout(() => {
            if (window.CopilotViewInstance && window.CopilotViewInstance.triggerQuery) {
              window.CopilotViewInstance.triggerQuery(`Investigate incident ${incId}. Why did API latency spike and what changed before the failure?`, incId);
            }
          }, 100);
        });
      });

    } catch (e) {
      container.innerHTML = `
        <div style="padding: 2rem; background: var(--bg-card); border-radius: var(--radius-lg); color: var(--color-danger);">
          Failed to load dashboard data: ${e.message}
        </div>
      `;
    }
  }
};
