/**
 * PraetorOps AI — Core Application Router & View Dispatcher
 */

const App = {
  views: {
    login: LoginView,
    overview: OverviewView,
    copilot: CopilotView,
    incidents: IncidentsView,
    knowledge: KnowledgeView,
    approvals: ApprovalsView,
    observability: ObservabilityView,
    evaluations: EvaluationsView,
    audit: AuditView,
    security: SecurityView,
    architecture: ArchitectureView,
    landing: LandingView
  },

  init() {
    this.setupNavigation();
    this.setupHeaderControls();
    this.setupStateSubscriptions();

    // Initial render
    this.renderCurrentView();
    this.updateCounters();
  },

  setupNavigation() {
    // Sidebar nav items
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.getAttribute('data-view');
        if (view && this.views[view]) {
          AppState.setView(view);
        }
      });
    });

    // Mobile menu toggle
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('mainSidebar');
    if (mobileBtn && sidebar) {
      mobileBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
    }

    // Quick launch button
    document.getElementById('quickLaunchCopilotBtn')?.addEventListener('click', () => {
      AppState.setView('copilot');
    });

    // Header Switch User / Sign Out button
    document.getElementById('headerSwitchUserBtn')?.addEventListener('click', () => {
      AppState.setView('login');
    });
  },

  setupHeaderControls() {
    const tenantSelect = document.getElementById('tenantSelect');
    const personaSelect = document.getElementById('personaSelect');

    if (tenantSelect) {
      tenantSelect.value = AppState.currentTenant;
      tenantSelect.addEventListener('change', (e) => {
        AppState.setTenant(e.target.value);
      });
    }

    if (personaSelect) {
      personaSelect.value = AppState.currentRole;
      personaSelect.addEventListener('change', (e) => {
        AppState.setPersona(e.target.value);
      });
    }
  },

  setupStateSubscriptions() {
    AppState.subscribe((state) => {
      // Sync Topbar Selectors
      const tenantSelect = document.getElementById('tenantSelect');
      if (tenantSelect && tenantSelect.value !== state.currentTenant) {
        tenantSelect.value = state.currentTenant;
      }

      const personaSelect = document.getElementById('personaSelect');
      if (personaSelect && personaSelect.value !== state.currentRole) {
        personaSelect.value = state.currentRole;
      }

      // Update Topbar Badges
      const roleBadge = document.getElementById('currentRoleName');
      if (roleBadge) roleBadge.innerText = state.currentRole;

      // Update Nav active state
      document.querySelectorAll('.nav-item').forEach(btn => {
        const v = btn.getAttribute('data-view');
        btn.classList.toggle('active', v === state.currentView);
      });

      // Update Breadcrumb
      const viewTitleMap = {
        login: 'Identity & Sign-In',
        overview: 'Overview',
        copilot: 'AI Copilot',
        incidents: 'Incidents',
        knowledge: 'Knowledge Base (RAG)',
        approvals: 'Approvals Gateway',
        observability: 'Agent Activity',
        evaluations: 'Evaluations',
        audit: 'Audit Logs',
        security: 'Security & Guard',
        architecture: 'Architecture',
        landing: 'Public Overview'
      };
      const crumb = document.getElementById('currentViewName');
      if (crumb) crumb.innerText = viewTitleMap[state.currentView] || state.currentView;

      // Render the active view
      this.renderCurrentView();
      this.updateCounters();
    });
  },

  async updateCounters() {
    try {
      const [incidents, approvals] = await Promise.all([
        Api.getIncidents(),
        Api.getApprovals()
      ]);

      const activeIncCount = incidents.filter(i => i.status !== 'Resolved').length;
      const pendingAppCount = approvals.filter(a => a.status === 'PENDING').length;

      const incBadge = document.getElementById('incidentsCountBadge');
      if (incBadge) incBadge.innerText = activeIncCount;

      const appBadge = document.getElementById('approvalsCountBadge');
      if (appBadge) {
        appBadge.innerText = pendingAppCount;
        appBadge.style.display = pendingAppCount > 0 ? 'inline-block' : 'none';
      }
    } catch (e) {
      // Silent error for counters
    }
  },

  renderCurrentView() {
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;

    // Toggle full-viewport auth-mode for welcome/login view
    if (AppState.currentView === 'login') {
      document.body.classList.add('auth-mode');
    } else {
      document.body.classList.remove('auth-mode');
    }

    const view = this.views[AppState.currentView];
    if (view && typeof view.render === 'function') {
      view.render(mainContent);
    } else {
      mainContent.innerHTML = `<div style="padding:2rem;">View '${AppState.currentView}' not found.</div>`;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
