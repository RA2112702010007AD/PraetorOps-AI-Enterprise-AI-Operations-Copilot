/**
 * PraetorOps AI — Human-in-the-Loop Approvals Gateway View
 */

const ApprovalsView = {
  tickets: [],

  async render(container) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
        Loading Human Approval Queue...
      </div>
    `;

    try {
      this.tickets = await Api.getApprovals();

      const pendingCount = this.tickets.filter(t => t.status === 'PENDING').length;

      container.innerHTML = `
        <div class="approvals-view">
          
          <!-- Banner -->
          <div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(15, 23, 42, 1) 100%); border: 1px solid rgba(245, 158, 11, 0.35); border-radius: var(--radius-lg); padding: 1.25rem; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
            <div>
              <div style="font-size: 1rem; font-weight: 700; color: #FCD34D; display: flex; align-items: center; gap: 0.5rem;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                Human-in-the-Loop Security Gateway
              </div>
              <p style="font-size: 0.8rem; color: var(--text-secondary); max-width: 680px; margin-top: 0.25rem; line-height: 1.45;">
                In accordance with enterprise zero-trust principles, AI agents are prohibited from autonomously executing destructive or high-impact actions. Operators review evidence and impact prior to authorization.
              </p>
            </div>
            <div>
              <span class="badge ${pendingCount > 0 ? 'badge-critical' : 'badge-low'}" style="font-size: 0.8rem; padding: 0.4rem 0.85rem;">
                ${pendingCount} Pending Authorization(s)
              </span>
            </div>
          </div>

          <!-- Filter Bar -->
          <div class="filter-bar">
            <div style="display: flex; gap: 0.5rem;">
              <button class="btn btn-secondary btn-sm filter-approval-tab active" data-status="ALL">All Requests (${this.tickets.length})</button>
              <button class="btn btn-secondary btn-sm filter-approval-tab" data-status="PENDING">Pending (${pendingCount})</button>
              <button class="btn btn-secondary btn-sm filter-approval-tab" data-status="APPROVED">Approved</button>
              <button class="btn btn-secondary btn-sm filter-approval-tab" data-status="REJECTED">Rejected</button>
            </div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">
              Active Approver Context: <strong style="color: var(--accent-cyan);">${AppState.currentUserName} (${AppState.currentRole})</strong>
            </div>
          </div>

          <!-- Cards List -->
          <div id="approvalsList" style="display: flex; flex-direction: column; gap: 1.25rem;">
            <!-- Rendered by renderTickets -->
          </div>

        </div>
      `;

      this.renderTickets(this.tickets);

      // Filter tabs
      container.querySelectorAll('.filter-approval-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          container.querySelectorAll('.filter-approval-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          const st = tab.getAttribute('data-status');
          const filtered = st === 'ALL' ? this.tickets : this.tickets.filter(t => t.status === st);
          this.renderTickets(filtered);
        });
      });

    } catch (e) {
      container.innerHTML = `<div style="color: var(--color-danger); padding: 2rem;">Error loading approvals: ${e.message}</div>`;
    }
  },

  renderTickets(items) {
    const list = document.getElementById('approvalsList');
    if (!list) return;

    if (items.length === 0) {
      list.innerHTML = `
        <div style="text-align: center; padding: 3rem; background: var(--bg-card); border-radius: var(--radius-lg); color: var(--text-muted);">
          No approval requests in this category.
        </div>
      `;
      return;
    }

    list.innerHTML = items.map(ticket => `
      <div class="section-card" style="border-left: 4px solid ${ticket.status === 'PENDING' ? '#F59E0B' : (ticket.status === 'APPROVED' ? '#10B981' : '#EF4444')};">
        <div class="section-header">
          <div>
            <div style="display: flex; align-items: center; gap: 0.65rem; margin-bottom: 0.25rem;">
              <span class="table-code">${ticket.ticket_id}</span>
              <span class="badge ${ticket.risk_level === 'CRITICAL' ? 'badge-critical' : 'badge-high'}">${ticket.risk_level} RISK</span>
              <span class="badge ${ticket.status === 'PENDING' ? 'badge-investigating' : (ticket.status === 'APPROVED' ? 'badge-mitigated' : 'badge-critical')}">
                ${ticket.status}
              </span>
            </div>
            <div style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary);">${ticket.action_title}</div>
          </div>
          <div style="font-size: 0.725rem; font-family: var(--font-mono); color: var(--text-muted); text-align: right;">
            <div>Created: ${ticket.created_at.slice(11, 19)} UTC</div>
            <div>Tenant: ${ticket.tenant_id}</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 140px 1fr; gap: 0.65rem 1rem; font-size: 0.8rem; margin-bottom: 1.25rem;">
          <div style="color: var(--text-muted); font-weight: 600;">Tool Requested:</div>
          <div><code class="table-code" style="color: #FCD34D;">${ticket.tool_name}</code> (Parameters: <code>${JSON.stringify(ticket.parameters)}</code>)</div>

          <div style="color: var(--text-muted); font-weight: 600;">Reason:</div>
          <div style="color: var(--text-secondary);">${ticket.reason}</div>

          <div style="color: var(--text-muted); font-weight: 600;">Expected Impact:</div>
          <div style="color: var(--text-secondary);">${ticket.expected_impact}</div>

          <div style="color: var(--text-muted); font-weight: 600;">Evidence Correlated:</div>
          <div style="color: var(--accent-cyan); font-weight: 500;">${ticket.evidence}</div>

          <div style="color: var(--text-muted); font-weight: 600;">Requested By:</div>
          <div style="color: var(--text-secondary);">${ticket.requested_by_agent} for <strong>${ticket.requested_by_user}</strong></div>

          <div style="color: var(--text-muted); font-weight: 600;">AI Recommendation:</div>
          <div style="color: #FCD34D; font-weight: 500;">${ticket.ai_recommendation}</div>

          ${ticket.resolved_by ? `
            <div style="color: var(--text-muted); font-weight: 600;">Resolved By:</div>
            <div style="color: var(--color-success); font-weight: 600;">${ticket.resolved_by} (Notes: ${ticket.resolution_notes || 'None'})</div>
          ` : ''}

          ${ticket.execution_output ? `
            <div style="color: var(--text-muted); font-weight: 600;">Execution Output:</div>
            <div style="font-family: var(--font-mono); font-size: 0.725rem; color: #34D399; background: rgba(0,0,0,0.3); padding: 0.4rem; border-radius: var(--radius-sm);">
              ${ticket.execution_output}
            </div>
          ` : ''}
        </div>

        ${ticket.status === 'PENDING' ? `
          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; border-top: 1px solid var(--border-subtle); padding-top: 0.85rem;">
            <button class="btn btn-secondary btn-sm modify-ticket-btn" data-ticket-id="${ticket.ticket_id}">
              Modify Parameters
            </button>
            <button class="btn btn-danger btn-sm reject-ticket-btn" data-ticket-id="${ticket.ticket_id}">
              Reject Action
            </button>
            <button class="btn btn-success btn-sm approve-ticket-btn" data-ticket-id="${ticket.ticket_id}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              Approve & Execute Tool
            </button>
          </div>
        ` : ''}
      </div>
    `).join('');

    // Actions
    list.querySelectorAll('.approve-ticket-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const tid = btn.getAttribute('data-ticket-id');
        const notes = prompt('Enter approval justification / notes (optional):', 'Approved for production incident mitigation');
        if (notes !== null) {
          try {
            btn.disabled = true;
            await Api.resolveApproval(tid, 'APPROVE', notes);
            alert(`Approval ticket ${tid} approved and simulated tool executed.`);
            this.render(this.container);
          } catch (e) {
            alert('Approval error: ' + e.message);
            btn.disabled = false;
          }
        }
      });
    });

    list.querySelectorAll('.reject-ticket-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const tid = btn.getAttribute('data-ticket-id');
        const notes = prompt('Enter rejection reason:', 'Operator rejected action to evaluate non-disruptive alternatives');
        if (notes !== null) {
          try {
            btn.disabled = true;
            await Api.resolveApproval(tid, 'REJECT', notes);
            alert(`Approval ticket ${tid} rejected.`);
            this.render(this.container);
          } catch (e) {
            alert('Rejection error: ' + e.message);
            btn.disabled = false;
          }
        }
      });
    });

    list.querySelectorAll('.modify-ticket-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const tid = btn.getAttribute('data-ticket-id');
        const notes = prompt('Enter modification notes:', 'Modified execution parameters');
        if (notes !== null) {
          try {
            btn.disabled = true;
            await Api.resolveApproval(tid, 'MODIFY', notes, { modified: true });
            alert(`Approval ticket ${tid} modified and authorized.`);
            this.render(this.container);
          } catch (e) {
            alert('Modification error: ' + e.message);
            btn.disabled = false;
          }
        }
      });
    });
  }
};
