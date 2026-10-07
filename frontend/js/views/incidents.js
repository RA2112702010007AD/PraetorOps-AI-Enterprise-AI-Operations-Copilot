/**
 * PraetorOps AI — Incidents Management & Telemetry Correlation View
 */

const IncidentsView = {
  incidents: [],

  async render(container) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
        Loading Incidents Telemetry...
      </div>
    `;

    try {
      this.incidents = await Api.getIncidents();

      container.innerHTML = `
        <div class="incidents-view">
          
          <div class="filter-bar">
            <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
              <div class="search-input-wrapper">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" id="incidentsSearchInput" class="search-input" placeholder="Search by ID, title, or service...">
              </div>

              <select id="incidentsSeverityFilter" class="header-select" style="padding-left: 0.85rem;">
                <option value="ALL">All Severities</option>
                <option value="SEV-1">SEV-1 Critical</option>
                <option value="SEV-2">SEV-2 Major</option>
                <option value="SEV-3">SEV-3 Minor</option>
              </select>

              <select id="incidentsStatusFilter" class="header-select" style="padding-left: 0.85rem;">
                <option value="ALL">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Investigating">Investigating</option>
                <option value="Mitigated">Mitigated</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            <div style="font-size: 0.775rem; color: var(--text-muted);">
              Showing <strong style="color: var(--text-primary);" id="incidentCountLabel">${this.incidents.length}</strong> incidents for <code style="color: var(--accent-cyan);">${AppState.currentTenant}</code>
            </div>
          </div>

          <div class="table-container">
            <table class="data-table" id="incidentsTable">
              <thead>
                <tr>
                  <th>Incident ID</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Service</th>
                  <th>Title & Summary</th>
                  <th>Created</th>
                  <th>Correlated Change</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="incidentsTableBody">
                <!-- Injected via renderRows -->
              </tbody>
            </table>
          </div>

        </div>
      `;

      this.renderRows(this.incidents);

      // Filter events
      const searchInput = document.getElementById('incidentsSearchInput');
      const sevFilter = document.getElementById('incidentsSeverityFilter');
      const statusFilter = document.getElementById('incidentsStatusFilter');

      const applyFilters = () => {
        const q = searchInput.value.toLowerCase();
        const sev = sevFilter.value;
        const stat = statusFilter.value;

        const filtered = this.incidents.filter(inc => {
          const matchQ = !q || inc.id.toLowerCase().includes(q) || inc.title.toLowerCase().includes(q) || inc.service.toLowerCase().includes(q);
          const matchSev = sev === 'ALL' || inc.severity === sev;
          const matchStat = stat === 'ALL' || inc.status === stat;
          return matchQ && matchSev && matchStat;
        });

        this.renderRows(filtered);
        const countLabel = document.getElementById('incidentCountLabel');
        if (countLabel) countLabel.innerText = filtered.length;
      };

      searchInput.addEventListener('input', applyFilters);
      sevFilter.addEventListener('change', applyFilters);
      statusFilter.addEventListener('change', applyFilters);

    } catch (e) {
      container.innerHTML = `<div style="color: var(--color-danger); padding: 2rem;">Error loading incidents: ${e.message}</div>`;
    }
  },

  renderRows(items) {
    const tbody = document.getElementById('incidentsTableBody');
    if (!tbody) return;

    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 2rem; color: var(--text-muted);">No matching incidents found.</td></tr>`;
      return;
    }

    tbody.innerHTML = items.map(inc => `
      <tr>
        <td><span class="table-code">${inc.id}</span></td>
        <td><span class="badge badge-${inc.severity.toLowerCase().replace('-', '')}">${inc.severity}</span></td>
        <td><span class="badge badge-${inc.status.toLowerCase()}">${inc.status}</span></td>
        <td><strong>${inc.service}</strong></td>
        <td>
          <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 0.15rem;">${inc.title}</div>
          <div style="font-size: 0.725rem; color: var(--text-muted); max-width: 380px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${inc.summary}</div>
        </td>
        <td style="font-size: 0.725rem; font-family: var(--font-mono); color: var(--text-muted);">
          ${inc.created_at.slice(11, 19)} UTC
        </td>
        <td>
          ${inc.related_deployment_id ? `<span class="table-code" style="color: #FCD34D;">${inc.related_deployment_id}</span>` : '<span style="color: var(--text-muted);">None</span>'}
        </td>
        <td>
          <div style="display: flex; gap: 0.4rem;">
            <button class="btn btn-secondary btn-sm view-incident-btn" data-inc-id="${inc.id}">Details</button>
            <button class="btn btn-primary btn-sm ai-investigate-btn" data-inc-id="${inc.id}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              Copilot
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.view-incident-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const incId = btn.getAttribute('data-inc-id');
        this.openIncidentModal(incId);
      });
    });

    tbody.querySelectorAll('.ai-investigate-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const incId = btn.getAttribute('data-inc-id');
        AppState.setView('copilot');
        setTimeout(() => {
          if (window.CopilotViewInstance) {
            window.CopilotViewInstance.triggerQuery(`Investigate incident ${incId}. Why did API latency spike and what changed before the failure?`, incId);
          }
        }, 100);
      });
    });
  },

  async openIncidentModal(incidentId) {
    const modalContainer = document.getElementById('modalContainer');
    if (!modalContainer) return;

    modalContainer.classList.remove('hidden');
    modalContainer.innerHTML = `
      <div class="modal-window" style="max-width: 720px;">
        <div class="modal-header">
          <div class="modal-title">Loading ${incidentId}...</div>
          <button class="modal-close-btn" id="modalCloseBtn">&times;</button>
        </div>
        <div class="modal-body" style="text-align: center; padding: 2rem;">Loading telemetry...</div>
      </div>
    `;

    document.getElementById('modalCloseBtn')?.addEventListener('click', () => {
      modalContainer.classList.add('hidden');
    });

    try {
      const data = await Api.getIncident(incidentId);
      const inc = data.incident;
      const dep = data.correlated_deployment;

      modalContainer.innerHTML = `
        <div class="modal-window" style="max-width: 760px;">
          <div class="modal-header">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="table-code">${inc.id}</span>
              <span class="badge badge-${inc.severity.toLowerCase().replace('-', '')}">${inc.severity}</span>
              <span class="modal-title">${inc.title}</span>
            </div>
            <button class="modal-close-btn" id="modalCloseBtn">&times;</button>
          </div>

          <div class="modal-body">
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-bottom: 1rem; background: rgba(0,0,0,0.25); padding: 0.75rem; border-radius: var(--radius-md);">
              <div><span style="color: var(--text-muted); font-size: 0.7rem;">STATUS:</span> <strong style="display:block; color: var(--text-primary);">${inc.status}</strong></div>
              <div><span style="color: var(--text-muted); font-size: 0.7rem;">SERVICE:</span> <strong style="display:block; color: var(--accent-cyan);">${inc.service}</strong></div>
              <div><span style="color: var(--text-muted); font-size: 0.7rem;">IMPACT:</span> <strong style="display:block; color: #F87171;">${inc.impact}</strong></div>
            </div>

            <h4 style="color: var(--text-primary); font-size: 0.85rem; margin-bottom: 0.35rem;">Preliminary Root Cause:</h4>
            <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1rem; line-height: 1.5;">${inc.root_cause_preliminary}</p>

            ${dep ? `
              <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: var(--radius-md); padding: 0.85rem; margin-bottom: 1rem;">
                <div style="font-size: 0.75rem; font-weight: 700; color: #FCD34D; margin-bottom: 0.25rem;">CORRELATED DEPLOYMENT EVENT: ${dep.id} (${dep.version})</div>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">
                  Deployed by <strong>${dep.deployed_by}</strong> at ${dep.timestamp} (Commit <code class="table-code">${dep.commit_hash}</code>)
                </div>
                <div style="font-size: 0.725rem; color: var(--text-muted); margin-top: 0.25rem;">"${dep.commit_message}"</div>
              </div>
            ` : ''}

            <h4 style="color: var(--text-primary); font-size: 0.85rem; margin-bottom: 0.35rem;">Correlated Cloud Logging Snippets:</h4>
            <div style="background: var(--bg-app); border: 1px solid var(--border-subtle); padding: 0.75rem; border-radius: var(--radius-md); font-family: var(--font-mono); font-size: 0.725rem; color: #94A3B8; max-height: 140px; overflow-y: auto;">
              ${inc.logs_snippet.map(l => `<div style="padding: 0.15rem 0;">${l}</div>`).join('')}
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" id="modalDismissBtn">Close</button>
            <button class="btn btn-primary" id="modalInvestigateCopilotBtn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              Launch AI Investigation
            </button>
          </div>
        </div>
      `;

      document.getElementById('modalCloseBtn')?.addEventListener('click', () => modalContainer.classList.add('hidden'));
      document.getElementById('modalDismissBtn')?.addEventListener('click', () => modalContainer.classList.add('hidden'));

      document.getElementById('modalInvestigateCopilotBtn')?.addEventListener('click', () => {
        modalContainer.classList.add('hidden');
        AppState.setView('copilot');
        setTimeout(() => {
          if (window.CopilotViewInstance) {
            window.CopilotViewInstance.triggerQuery(`Investigate incident ${inc.id}. Why did API latency spike and what changed before the failure?`, inc.id);
          }
        }, 100);
      });

    } catch (e) {
      modalContainer.innerHTML = `<div class="modal-window"><div class="modal-body" style="color:var(--color-danger);">Error: ${e.message}</div></div>`;
    }
  }
};
