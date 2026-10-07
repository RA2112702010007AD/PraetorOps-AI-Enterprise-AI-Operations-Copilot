/**
 * PraetorOps AI — Global Client State Management
 */

const storedSession = (() => {
  try {
    const raw = localStorage.getItem('praetorops_session') || localStorage.getItem('aegisops_session');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
})();

const AppState = {
  // Session Authentication State
  isAuthenticated: !!storedSession,
  token: storedSession ? storedSession.token : null,

  // Current Authentication & Tenant Context
  currentTenant: storedSession ? storedSession.tenantId : 'tenant_acme',
  currentRole: storedSession ? storedSession.user.role : 'Engineer',
  currentUserId: storedSession ? storedSession.user.id : 'usr_sre_01',
  currentUserName: storedSession ? storedSession.user.name : 'Sarah Chen',
  currentView: 'login',

  // Tenant Display Metadata
  tenants: {
    tenant_acme: {
      name: 'Acme Global Enterprise (Production)',
      tier: 'Tier 1 Critical',
      region: 'us-central1'
    },
    tenant_nova: {
      name: 'Nova Financial (PCI Dedicated)',
      tier: 'PCI-DSS Level 1',
      region: 'us-east4'
    },
    tenant_demo: {
      name: 'Global Demo Sandbox',
      tier: 'Demo Sandbox',
      region: 'europe-west1'
    }
  },

  // Predefined Personas
  personas: {
    Engineer: {
      id: 'usr_sre_01',
      name: 'Sarah Chen',
      email: 'sarah.chen@acme-corp.internal',
      title: 'Staff SRE',
      role: 'Engineer'
    },
    Admin: {
      id: 'usr_mgr_03',
      name: 'Marcus Vance',
      email: 'marcus.vance@acme-corp.internal',
      title: 'VP Cloud Ops',
      role: 'Admin'
    },
    Analyst: {
      id: 'usr_sec_02',
      name: 'Alex Rivera',
      email: 'alex.rivera@acme-corp.internal',
      title: 'Lead SecOps',
      role: 'Analyst'
    },
    Viewer: {
      id: 'usr_sup_04',
      name: 'Elena Rostova',
      email: 'elena.rostova@acme-corp.internal',
      title: 'Sr Support Lead',
      role: 'Viewer'
    }
  },

  // Event Listeners for State Changes
  listeners: [],

  subscribe(listener) {
    this.listeners.push(listener);
  },

  notify() {
    this.listeners.forEach(fn => fn(this));
  },

  setTenant(tenantId) {
    this.currentTenant = tenantId;
    this.saveSession();
    this.notify();
  },

  setPersona(role) {
    if (this.personas[role]) {
      this.currentRole = role;
      this.currentUserId = this.personas[role].id;
      this.currentUserName = this.personas[role].name;
      this.saveSession();
      this.notify();
    }
  },

  loginUser(authPayload) {
    this.isAuthenticated = true;
    this.token = authPayload.token;
    this.currentRole = authPayload.user.role;
    this.currentUserId = authPayload.user.id;
    this.currentUserName = authPayload.user.name;
    this.currentTenant = authPayload.user.tenant_id || authPayload.tenant.id || this.currentTenant;
    this.saveSession();
    this.setView('overview');
  },

  logoutUser() {
    this.isAuthenticated = false;
    this.token = null;
    try {
      localStorage.removeItem('praetorops_session');
      localStorage.removeItem('aegisops_session');
    } catch (e) {}
    this.setView('login');
  },

  saveSession() {
    try {
      localStorage.setItem('praetorops_session', JSON.stringify({
        token: this.token,
        tenantId: this.currentTenant,
        user: {
          id: this.currentUserId,
          name: this.currentUserName,
          role: this.currentRole
        }
      }));
    } catch (e) {}
  },

  setView(viewName) {
    this.currentView = viewName;
    this.notify();
  }
};
