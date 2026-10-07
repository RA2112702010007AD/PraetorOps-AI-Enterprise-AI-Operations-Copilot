/**
 * PraetorOps AI — Observability & Agent Activity Telemetry View
 */

const ObservabilityView = {
  async render(container) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
        Loading Observability & Agent Telemetry...
      </div>
    `;

    try {
      const [metrics, traces] = await Promise.all([
        Api.getObservabilityMetrics(),
        Api.getRecentTraces()
      ]);

      container.innerHTML = `
        <div class="observability-view">
          
          <!-- Observability KPI Summary -->
          <div class="grid-4">
            <div class="kpi-card">
              <div class="kpi-label">Avg Pipeline Latency</div>
              <div class="kpi-value-row">
                <span class="kpi-value">${metrics.avg_response_latency_ms}ms</span>
              </div>
              <div class="kpi-subtext">Model: ${metrics.model_latency_ms}ms • RAG: ${metrics.retrieval_latency_ms}ms</div>
            </div>

            <div class="kpi-card">
              <div class="kpi-label">Agent Success Rate</div>
              <div class="kpi-value-row">
                <span class="kpi-value">${metrics.agent_success_rate_pct}%</span>
              </div>
              <div class="kpi-subtext">SLO Threshold: 99.0% Availability</div>
            </div>

            <div class="kpi-card">
              <div class="kpi-label">Token Consumption</div>
              <div class="kpi-value-row">
                <span class="kpi-value">${(metrics.token_usage_today.total_tokens / 1000).toFixed(0)}k</span>
              </div>
              <div class="kpi-subtext">Est. Cost: $${metrics.token_usage_today.estimated_cost_usd} / day</div>
            </div>

            <div class="kpi-card">
              <div class="kpi-label">Safety Interceptions</div>
              <div class="kpi-value-row">
                <span class="kpi-value">${metrics.safety_blocks_today}</span>
              </div>
              <div class="kpi-subtext">Zero instruction leaks recorded</div>
            </div>
          </div>

          <!-- Latency Breakdown Phase Distribution -->
          <div class="section-card">
            <div class="section-header">
              <div>
                <div class="section-title">End-to-End Agentic Latency Breakdown</div>
                <div class="section-desc">Average millisecond budget per operational execution stage</div>
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 0.65rem;">
              ${metrics.latency_breakdown.map(item => `
                <div>
                  <div style="display: flex; justify-content: space-between; font-size: 0.775rem; margin-bottom: 0.25rem;">
                    <span style="color: var(--text-primary); font-weight: 500;">${item.phase}</span>
                    <span style="font-family: var(--font-mono); color: var(--accent-cyan);">${item.latency_ms}ms (${item.pct}%)</span>
                  </div>
                  <div style="height: 6px; background: rgba(255,255,255,0.06); border-radius: 9999px; overflow: hidden;">
                    <div style="height: 100%; width: ${item.pct}%; background: ${item.phase.includes('Safety') ? '#10B981' : (item.phase.includes('Reasoning') ? '#38BDF8' : '#6366F1')}; border-radius: 9999px;"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Representative Agent Execution Traces -->
          <div class="section-card">
            <div class="section-header">
              <div>
                <div class="section-title">Agent Execution Traces & Timeline</div>
                <div class="section-desc">Trace-like audit: Request → Orchestrator → RAG → Specialized Agent → Tool → Evidence Validation</div>
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 1rem;">
              ${traces.map(trace => `
                <div style="background: rgba(0,0,0,0.25); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1rem;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                      <span class="table-code">${trace.trace_id}</span>
                      <strong style="color: var(--text-primary); font-size: 0.85rem;">${trace.orchestrator_decision}</strong>
                      <span class="badge ${trace.safety_status === 'BLOCKED' ? 'badge-critical' : (trace.safety_status === 'GATEWAY_INTERCEPTED' ? 'badge-high' : 'badge-low')}">
                        ${trace.safety_status}
                      </span>
                    </div>
                    <div style="font-family: var(--font-mono); font-size: 0.725rem; color: var(--text-muted);">
                      ${trace.timestamp.slice(11, 19)} UTC • Total: ${trace.latency_ms}ms
                    </div>
                  </div>

                  <div style="font-size: 0.775rem; color: var(--text-secondary); margin-bottom: 0.75rem;">
                    <strong>Query:</strong> "${trace.query}"
                  </div>

                  <!-- Flow Nodes -->
                  <div style="display: flex; align-items: center; gap: 0.4rem; overflow-x: auto; padding: 0.4rem 0;">
                    ${trace.steps.map((st, i) => `
                      <div style="display: flex; align-items: center; gap: 0.4rem; flex-shrink: 0;">
                        <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 0.35rem 0.65rem; font-size: 0.7rem;">
                          <div style="font-weight: 600; color: ${st.status === 'BLOCKED' ? '#F87171' : (st.status === 'PENDING_APPROVAL' ? '#FCD34D' : 'var(--accent-cyan)')};">${st.name}</div>
                          <div style="font-size: 0.65rem; color: var(--text-muted);">${st.duration_ms}ms • ${st.agent}</div>
                        </div>
                        ${i < trace.steps.length - 1 ? '<span style="color: var(--text-muted); font-size: 0.75rem;">→</span>' : ''}
                      </div>
                    `).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Safe Enterprise Tool Registry -->
          <div class="section-card">
            <div class="section-header">
              <div>
                <div class="section-title">Enterprise Safe Tool Registry</div>
                <div class="section-desc">Strict separation between READ-ONLY tools and approval-gated WRITE operations</div>
              </div>
            </div>

            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Tool Name</th>
                    <th>Classification</th>
                    <th>Required Permission</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  ${metrics.registered_tools.map(tool => `
                    <tr>
                      <td><code class="table-code">${tool.name}()</code></td>
                      <td>
                        <span class="badge ${tool.is_high_impact ? 'badge-critical' : 'badge-low'}">
                          ${tool.is_high_impact ? 'WRITE (Approval Required)' : 'READ-ONLY (Auto)'}
                        </span>
                      </td>
                      <td><span class="table-code" style="color: var(--text-muted);">${tool.required_permission}</span></td>
                      <td style="font-size: 0.775rem;">${tool.description}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      `;
    } catch (e) {
      container.innerHTML = `<div style="color: var(--color-danger); padding: 2rem;">Error loading observability data: ${e.message}</div>`;
    }
  }
};
