/**
 * PraetorOps AI — Unified API Client
 * Automatically applies tenant isolation and RBAC headers.
 */

const Api = {
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'X-Tenant-Id': AppState.currentTenant,
      'X-User-Role': AppState.currentRole,
      'X-User-Id': AppState.currentUserId,
      'X-User-Name': AppState.currentUserName
    };
  },

  async get(url) {
    try {
      const res = await fetch(url, { credentials: 'omit', headers: this.getHeaders() });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }
      return await res.json();
    } catch (e) {
      console.error(`API GET error on ${url}:`, e);
      throw e;
    }
  },

  async post(url, data = {}) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        credentials: 'omit',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }
      return await res.json();
    } catch (e) {
      console.error(`API POST error on ${url}:`, e);
      throw e;
    }
  },

  async delete(url) {
    try {
      const res = await fetch(url, {
        method: 'DELETE',
        credentials: 'omit',
        headers: this.getHeaders()
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }
      return await res.json();
    } catch (e) {
      console.error(`API DELETE error on ${url}:`, e);
      throw e;
    }
  },

  // Authentication & Identity API
  getPersonas() {
    return this.get('/api/auth/personas');
  },

  login(credentials) {
    return this.post('/api/auth/login', credentials);
  },

  logout(userName, tenantId) {
    return this.post(`/api/auth/logout?user_name=${encodeURIComponent(userName)}&tenant_id=${encodeURIComponent(tenantId)}`);
  },

  // Copilot API
  chat(query, incidentId = null) {
    return this.post('/api/copilot/chat', { query, incident_id: incidentId });
  },

  getPromptPresets() {
    return this.get('/api/copilot/prompts');
  },

  // Incidents API
  getIncidents(status = null, severity = null) {
    let url = '/api/incidents';
    const params = [];
    if (status) params.push(`status=${status}`);
    if (severity) params.push(`severity=${severity}`);
    if (params.length) url += `?${params.join('&')}`;
    return this.get(url);
  },

  getIncident(incidentId) {
    return this.get(`/api/incidents/${incidentId}`);
  },

  // Knowledge Base API
  getDocuments(category = null) {
    const url = category && category !== 'All' ? `/api/knowledge/documents?category=${category}` : '/api/knowledge/documents';
    return this.get(url);
  },

  getDocument(docId) {
    return this.get(`/api/knowledge/documents/${docId}`);
  },

  uploadDocument(docData) {
    return this.post('/api/knowledge/documents', docData);
  },

  deleteDocument(docId) {
    return this.delete(`/api/knowledge/documents/${docId}`);
  },

  reindexKnowledge() {
    return this.post('/api/knowledge/reindex');
  },

  getKnowledgeStats() {
    return this.get('/api/knowledge/stats');
  },

  // Approvals API
  getApprovals(status = null) {
    const url = status && status !== 'ALL' ? `/api/approvals?status=${status}` : '/api/approvals';
    return this.get(url);
  },

  resolveApproval(ticketId, decision, notes = '', modifiedParams = null) {
    return this.post(`/api/approvals/${ticketId}/resolve`, {
      decision,
      notes,
      modified_params: modifiedParams
    });
  },

  // Observability & Activity API
  getObservabilityMetrics() {
    return this.get('/api/observability/metrics');
  },

  getRecentTraces() {
    return this.get('/api/observability/recent-traces');
  },

  // Evaluation API
  getEvaluationSummary() {
    return this.get('/api/evaluations/summary');
  },

  runEvaluationSuite() {
    return this.post('/api/evaluations/run-suite');
  },

  getEvaluationCases() {
    return this.get('/api/evaluations/cases');
  },

  // Audit Logs API
  getAuditLogs(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.get(`/api/audit${q ? '?' + q : ''}`);
  },

  verifyAuditIntegrity() {
    return this.get('/api/audit/verify-integrity');
  },

  // Security API
  scanPrompt(prompt) {
    return this.post('/api/security/scan-prompt', { prompt });
  },

  getSecurityEvents(severity = null, status = null) {
    let url = '/api/security/events';
    const params = [];
    if (severity) params.push(`severity=${severity}`);
    if (status) params.push(`status=${status}`);
    if (params.length) url += `?${params.join('&')}`;
    return this.get(url);
  },

  getThreatModel() {
    return this.get('/api/security/threat-model');
  },

  getRbacMatrix() {
    return this.get('/api/security/rbac-matrix');
  }
};
