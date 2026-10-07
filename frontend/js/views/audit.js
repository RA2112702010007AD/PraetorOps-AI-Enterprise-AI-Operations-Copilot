/**
 * PraetorOps AI — Immutable Audit Log & Hash Chaining View
 */

const AuditView = {
  logs: [],

  async render(container) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
        Loading Immutable Audit Logs...
      </div>
    `;

    try {
      this.logs = await Api.getAuditLogs();

      container.innerHTML = `
        <div class="audit-view">
          
          <!-- Cryptographic Integrity Header -->
          <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 1.15rem; margin-bottom: 1.25rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
            <div>
              <div style="font-size: 0.95rem; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 0.5rem;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                Immutable Cryptographic Audit Trail
              </div>
              <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.2rem;">
                Every AI action, prompt security block, tool request, and human authorization decision is cryptographically chained using SHA-256 hashes.
              </div>
            </div>

            <button class="btn btn-secondary btn-sm" id="verifyHashChainBtn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
              <span>Verify SHA-256 Chain Integrity</span>
            </button>
          </div>

          <!-- Filter Controls -->
          <div class="filter-bar">
            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center;">
              <div class="search-input-wrapper">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" id="auditSearchInput" class="search-input" placeholder="Search by action, agent, user, or entry ID...">
              </div>

              <select id="auditRiskFilter" class="header-select" style="padding-left: 0.75rem;">
                <option value="ALL">All Risk Levels</option>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>

            <div style="font-size: 0.75rem; color: var(--text-muted);">
              Active Tenant: <code style="color: var(--accent-cyan);">${AppState.currentTenant}</code>
            </div>
          </div>

          <!-- Audit Table -->
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Entry ID</th>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Agent</th>
                  <th>User</th>
                  <th>Risk</th>
                  <th>Status</th>
                  <th>Result / Details</th>
                  <th>Integrity Hash</th>
                </tr>
              </thead>
              <tbody id="auditTableBody">
                <!-- Injected via renderAuditRows -->
              </tbody>
            </table>
          </div>

        </div>
      `;

      this.renderAuditRows(this.logs);

      // Search & Risk filter
      const sInput = document.getElementById('auditSearchInput');
      const rFilter = document.getElementById('auditRiskFilter');

      const applyFilters = () => {
        const q = sInput.value.toLowerCase();
        const r = rFilter.value;
        const filtered = this.logs.filter(l => {
          const matchQ = !q || l.entry_id.toLowerCase().includes(q) || l.action.toLowerCase().includes(q) || l.agent.toLowerCase().includes(q) || l.user.toLowerCase().includes(q) || l.result.toLowerCase().includes(q);
          const matchR = r === 'ALL' || l.risk_level === r;
          return matchQ && matchR;
        });
        this.renderAuditRows(filtered);
      };

      sInput.addEventListener('input', applyFilters);
      rFilter.addEventListener('change', applyFilters);

      // Verify Integrity Button
      document.getElementById('verifyHashChainBtn')?.addEventListener('click', async () => {
        const btn = document.getElementById('verifyHashChainBtn');
        btn.disabled = true;
        btn.innerText = 'Computing SHA-256 Hashes...';
        try {
          const res = await Api.verifyAuditIntegrity();
          alert(`Cryptographic Integrity Verification: ${res.status}!\nChecked ${res.total_records_checked} sequential records.\nLatest block hash: ${res.latest_block_hash.slice(0, 16)}...\nNo tamper anomalies found.`);
        } catch (e) {
          alert('Integrity check failed: ' + e.message);
        } finally {
          btn.disabled = false;
          btn.innerText = 'Verify SHA-256 Chain Integrity';
        }
      });

    } catch (e) {
      container.innerHTML = `<div style="color: var(--color-danger); padding: 2rem;">Error loading audit logs: ${e.message}</div>`;
    }
  },

  renderAuditRows(items) {
    const tbody = document.getElementById('auditTableBody');
    if (!tbody) return;

    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding: 2rem; color: var(--text-muted);">No audit entries match filter.</td></tr>`;
      return;
    }

    tbody.innerHTML = items.map(l => `
      <tr>
        <td><span class="table-code">${l.entry_id}</span></td>
        <td style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-muted);">${l.timestamp.slice(11, 19)} UTC</td>
        <td><strong style="color: var(--text-primary); font-size: 0.775rem;">${l.action}</strong></td>
        <td style="font-size: 0.75rem; color: var(--accent-cyan);">${l.agent}</td>
        <td style="font-size: 0.75rem;">${l.user}</td>
        <td><span class="badge ${l.risk_level === 'CRITICAL' ? 'badge-critical' : (l.risk_level === 'HIGH' ? 'badge-high' : 'badge-low')}">${l.risk_level}</span></td>
        <td>
          <span class="badge ${l.approval_status === 'APPROVED' ? 'badge-mitigated' : (l.approval_status === 'BLOCKED' ? 'badge-critical' : 'badge-low')}">
            ${l.approval_status}
          </span>
        </td>
        <td style="max-width: 280px; font-size: 0.725rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${l.result}">
          ${l.result}
        </td>
        <td>
          <span class="table-code" style="font-size: 0.65rem; color: #34D399;" title="Full SHA-256: ${l.integrity_hash}">
            ${l.integrity_hash.slice(0, 10)}...
          </span>
        </td>
      </tr>
    `).join('');
  }
};
