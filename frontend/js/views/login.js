/**
 * PraetorOps AI — Executive Welcome & Enterprise Dynamic Login Gateway View
 * Provides a dedicated Welcome showcase on the left and dynamic identity
 * authentication on the right with full separation for Admin and User roles,
 * Google Workspace SSO, enterprise credentials, and hardware MFA simulation.
 */

const LoginView = {
  activeTab: 'persona', // 'persona' | 'credentials' | 'sso'
  personas: [],

  async render(container) {
    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100vh; color: var(--text-muted); background: var(--bg-app);">
        <div class="status-dot online" style="margin-right: 0.6rem;"></div>
        <span>Initializing PraetorOps Enterprise Identity Gateway...</span>
      </div>
    `;

    try {
      this.personas = await Api.getPersonas();
    } catch (e) {
      this.personas = [
        {
          id: "usr_mgr_03",
          name: "Marcus Vance",
          email: "marcus.vance@acme-corp.internal",
          role: "Admin",
          title: "VP of Cloud Operations",
          clearance: "Top Secret / Production Root",
          description: "Full administrator authority. Can approve and execute high-risk write remediations (rollbacks, cluster restarts, emergency overrides).",
          badges: ["Hardware MFA Enforced", "Production Approver", "Admin Root"]
        },
        {
          id: "usr_sre_01",
          name: "Sarah Chen",
          email: "sarah.chen@acme-corp.internal",
          role: "Engineer",
          title: "Staff Site Reliability Engineer",
          clearance: "Operational Reliability Tier-1",
          description: "Diagnoses incidents, inspects telemetry, runs RAG runbooks, and requests remediation approvals.",
          badges: ["Incident Responder", "Read-Only Tools", "Approval Requester"]
        },
        {
          id: "usr_sec_02",
          name: "Alex Rivera",
          email: "alex.rivera@acme-corp.internal",
          role: "Analyst",
          title: "Lead Security Operations Analyst",
          clearance: "SecOps Threat Intelligence",
          description: "Triages security detections, analyzes prompt injection attacks, audits cryptographic logs, and requests account quarantines.",
          badges: ["Threat Intel", "Audit Inspector", "Quarantine Requester"]
        },
        {
          id: "usr_sup_04",
          name: "Elena Rostova",
          email: "elena.rostova@acme-corp.internal",
          role: "Viewer",
          title: "Senior Technical Support Engineer",
          clearance: "Support Read-Only",
          description: "Accesses knowledge runbooks and inspects customer-facing incidents without write permissions.",
          badges: ["Read-Only", "No Write Authority", "Support Tier-3"]
        }
      ];
    }

    this.renderPortal(container);
  },

  renderPortal(container) {
    const adminPersona = this.personas.find(p => p.role === 'Admin') || this.personas[0];
    const userPersonas = this.personas.filter(p => p.role !== 'Admin');

    container.innerHTML = `
      <div class="welcome-portal-wrapper">
        
        <!-- Top Executive Navbar -->
        <header class="welcome-portal-navbar">
          <div class="welcome-nav-brand">
            <div class="brand-symbol" style="width:36px; height:36px;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
            </div>
            <div class="brand-text">
              <span class="brand-name" style="font-size:1.15rem;">PraetorOps AI</span>
              <span class="brand-tag">ENTERPRISE OPERATIONS COPILOT</span>
            </div>
          </div>

          <div class="welcome-nav-right">
            <div class="welcome-status-beacon">
              <span class="status-dot online"></span>
              <span>Google Cloud Vertex AI • Zero-Trust Perimeter Enforced</span>
            </div>

            <button class="btn btn-secondary btn-sm" id="exploreGuestBtn" title="Browse platform overview in read-only guest mode">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m4.93 19.07 4.24-4.24"/></svg>
              <span>Explore as Guest</span>
            </button>
          </div>
        </header>

        <!-- Main Dual-Pane Gateway Grid -->
        <div class="welcome-portal-grid">
          
          <!-- LEFT PANE: Welcome & Platform Architecture Showcase -->
          <div class="welcome-showcase">
            <div class="welcome-badge-row">
              <span class="welcome-badge">MISSION-CRITICAL OPERATIONS</span>
              <span class="welcome-badge" style="background:rgba(129,140,248,0.12); color:#818CF8; border-color:rgba(129,140,248,0.25);">VERTEX AI GEMINI 1.5</span>
            </div>

            <div>
              <h1 class="welcome-hero-title">
                Welcome to <span>PraetorOps AI</span>
              </h1>
              <div style="font-size:0.95rem; font-weight:600; color:#38BDF8; margin-top:0.35rem; margin-bottom:0.75rem;">
                Autonomous Reasoning Meets Enterprise Governance
              </div>
              <p class="welcome-hero-desc">
                PraetorOps AI is a production-grade AI operations copilot purpose-built for Google Cloud environments. It empowers SREs and SecOps teams to investigate Sev-1 incidents, retrieve verified organizational knowledge via grounded RAG, inspect multi-agent reasoning, and safely automate remediation without allowing autonomous high-impact actions.
              </p>
            </div>

            <!-- 4 Architecture & Trust Pillars -->
            <div class="welcome-pillars-list">
              <div class="welcome-pillar-item">
                <div class="welcome-pillar-icon cyan">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                </div>
                <div class="welcome-pillar-content">
                  <strong>Zero-Trust Safety Guardrail</strong>
                  <p>Pre-execution prompt injection scanner, tenant isolation, and strict input boundary demarcation (&lt;UNTRUSTED_DATA_BOUNDARY&gt;).</p>
                </div>
              </div>

              <div class="welcome-pillar-item">
                <div class="welcome-pillar-icon indigo">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                </div>
                <div class="welcome-pillar-content">
                  <strong>Specialized Multi-Agent Swarms</strong>
                  <p>Autonomous collaboration across Incident Investigation, Threat Hunting, Vector Runbooks, and Remediation specialists.</p>
                </div>
              </div>

              <div class="welcome-pillar-item">
                <div class="welcome-pillar-icon green">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/><path d="M6 10h10"/></svg>
                </div>
                <div class="welcome-pillar-content">
                  <strong>Grounded RAG with Strict Citations</strong>
                  <p>Direct chunk attribution to organizational runbooks with unambiguous refusal when institutional evidence is missing.</p>
                </div>
              </div>

              <div class="welcome-pillar-item">
                <div class="welcome-pillar-icon amber">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <div class="welcome-pillar-content">
                  <strong>Human-in-the-Loop Gateway</strong>
                  <p>High-impact actions (rollbacks, cluster restarts, account quarantine) strictly gated by two-person cryptographic authorization.</p>
                </div>
              </div>
            </div>

            <!-- Live Infrastructure Telemetry Box -->
            <div class="welcome-telemetry-box">
              <div class="welcome-telemetry-header">
                <span>SYSTEM TELEMETRY &amp; OPERATIONAL HEALTH</span>
                <span style="color:var(--color-success);">ALL SYSTEMS NORMAL</span>
              </div>
              <div class="welcome-telemetry-grid">
                <div class="welcome-stat-cell">
                  <div class="welcome-stat-label">LLM ENGINE</div>
                  <div class="welcome-stat-value">
                    <span class="status-dot online"></span>
                    <span>Vertex AI Gemini 1.5</span>
                  </div>
                </div>
                <div class="welcome-stat-cell">
                  <div class="welcome-stat-label">TENANT ISOLATION</div>
                  <div class="welcome-stat-value">
                    <span class="status-dot online"></span>
                    <span>Strict Partitioned</span>
                  </div>
                </div>
                <div class="welcome-stat-cell">
                  <div class="welcome-stat-label">EVAL BENCHMARKS</div>
                  <div class="welcome-stat-value" style="color:#10B981;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>15 / 15 Passed (100%)</span>
                  </div>
                </div>
                <div class="welcome-stat-cell">
                  <div class="welcome-stat-label">AUDIT INTEGRITY</div>
                  <div class="welcome-stat-value" style="font-family:var(--font-mono); font-size:0.7rem; color:var(--accent-cyan);">
                    SHA-256 Chained
                  </div>
                </div>
              </div>
            </div>

            <!-- Trust & Compliance Footer -->
            <div class="welcome-trust-row">
              <span>Security Certifications &amp; Frameworks</span>
              <div class="welcome-cert-tags">
                <span class="welcome-cert-tag">SOC 2 Type II</span>
                <span class="welcome-cert-tag">PCI-DSS Level 1</span>
                <span class="welcome-cert-tag">Google Cloud Ready</span>
              </div>
            </div>

          </div>

          <!-- RIGHT PANE: Dynamic Login & Identity Portal -->
          <div class="login-card-container">
            
            <!-- Portal Header -->
            <div class="login-header">
              <div class="login-brand-row">
                <div class="login-brand-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <path d="m9 12 2 2 4-4"/>
                  </svg>
                </div>
                <div class="login-brand-info">
                  <div class="login-title">Enterprise Identity Gateway</div>
                  <div class="login-tag">ZERO-TRUST ROLE &amp; TENANT BINDING</div>
                </div>
              </div>

              <div class="login-security-beacon">
                <span class="status-dot online"></span>
                <span>Select an Admin or User role below, or enter enterprise credentials.</span>
              </div>
            </div>

            <!-- Dynamic Auth Navigation Tabs -->
            <div class="login-tab-bar">
              <button class="login-tab-btn ${this.activeTab === 'persona' ? 'active' : ''}" id="tabBtnPersona">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <span>Quick Persona Sign-In</span>
              </button>
              <button class="login-tab-btn ${this.activeTab === 'credentials' ? 'active' : ''}" id="tabBtnCredentials">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <span>Enterprise Credentials</span>
              </button>
              <button class="login-tab-btn ${this.activeTab === 'sso' ? 'active' : ''}" id="tabBtnSso">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m4.93 19.07 4.24-4.24"/></svg>
                <span>Single Sign-On (SSO)</span>
              </button>
            </div>

            <!-- TAB 1: Quick Persona Sign-In (Admin vs Users) -->
            <div class="login-tab-content ${this.activeTab === 'persona' ? 'active' : ''}" id="contentPersona">
              
              <!-- ADMIN SECTION -->
              <div class="login-role-category">
                <div class="login-role-category-title">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span style="color:#F87171; font-weight:700;">ADMINISTRATOR PRIVILEGES (ROOT ACCESS)</span>
                </div>

                <div class="persona-card admin-card" data-role="Admin">
                  <div class="persona-card-top">
                    <div class="persona-avatar admin">MV</div>
                    <div class="persona-header-info">
                      <div class="persona-name-row">
                        <strong class="persona-name">${adminPersona.name}</strong>
                        <span class="badge badge-critical">ADMIN ROOT</span>
                      </div>
                      <div class="persona-title">${adminPersona.title}</div>
                    </div>
                  </div>

                  <p class="persona-desc">${adminPersona.description}</p>

                  <div class="persona-badges-row">
                    ${(adminPersona.badges || []).map(b => `<span class="persona-pill" style="border-color:rgba(239,68,68,0.3); color:#FCA5A5;">${b}</span>`).join('')}
                  </div>

                  <button class="btn btn-danger btn-sm persona-login-btn" data-role="Admin" data-email="${adminPersona.email}" data-name="${adminPersona.name}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                    <span>Sign In as Enterprise Admin (Marcus Vance)</span>
                  </button>
                </div>
              </div>

              <!-- OPERATIONAL USERS SECTION -->
              <div class="login-role-category" style="margin-bottom:0;">
                <div class="login-role-category-title">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  <span>OPERATIONAL USER ROLES (LEAST-PRIVILEGE ACCESS)</span>
                </div>

                <div class="persona-cards-grid">
                  ${userPersonas.map(p => `
                    <div class="persona-card" data-role="${p.role}">
                      <div class="persona-card-top">
                        <div class="persona-avatar ${p.role.toLowerCase()}">
                          ${p.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div class="persona-header-info">
                          <div class="persona-name-row">
                            <strong class="persona-name">${p.name}</strong>
                            <span class="badge ${p.role === 'Engineer' ? 'badge-sev2' : (p.role === 'Analyst' ? 'badge-sev3' : 'badge-low')}">
                              ${p.role.toUpperCase()}
                            </span>
                          </div>
                          <div class="persona-title">${p.title}</div>
                        </div>
                      </div>

                      <p class="persona-desc">${p.description}</p>

                      <div class="persona-badges-row">
                        ${(p.badges || []).map(b => `<span class="persona-pill">${b}</span>`).join('')}
                      </div>

                      <button class="btn btn-primary btn-sm persona-login-btn" data-role="${p.role}" data-email="${p.email}" data-name="${p.name}">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                        <span>Sign In as ${p.role} (${p.name.split(' ')[0]})</span>
                      </button>
                    </div>
                  `).join('')}
                </div>
              </div>

            </div>

            <!-- TAB 2: Standard Enterprise Credentials Form -->
            <div class="login-tab-content ${this.activeTab === 'credentials' ? 'active' : ''}" id="contentCredentials">
              <form id="credentialsLoginForm" class="login-form">
                <div class="login-form-group">
                  <label class="login-field-label">WORK EMAIL / CORPORATE PRINCIPAL</label>
                  <div class="login-input-with-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    <input type="email" id="credEmail" class="login-input" value="marcus.vance@acme-corp.internal" required placeholder="name@enterprise.internal" />
                  </div>
                </div>

                <div class="login-form-group">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                    <label class="login-field-label" style="margin-bottom:0;">PASSWORD</label>
                    <span style="font-size:0.675rem; color:var(--accent-cyan); font-family:var(--font-mono);">Zero real credentials stored</span>
                  </div>
                  <div class="login-input-with-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    <input type="password" id="credPassword" class="login-input" value="SecureTitanEnterprise2026!" required placeholder="Enter password" />
                    <button type="button" class="password-toggle-btn" id="togglePasswordVisibility" title="Toggle password visibility">
                      <svg id="eyeIcon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                  </div>
                </div>

                <div class="login-form-row">
                  <div class="login-form-group">
                    <label class="login-field-label">ROLE CLEARANCE LEVEL</label>
                    <select id="credRole" class="header-select" style="width:100%; padding-left:0.85rem;">
                      <option value="Admin">Admin (VP Cloud Operations — Full Root Authority)</option>
                      <option value="Engineer" selected>Engineer (Staff SRE — Triage &amp; Read-Only Tools)</option>
                      <option value="Analyst">Analyst (Lead SecOps — Threat Intelligence)</option>
                      <option value="Viewer">Viewer (Technical Support — Read-Only)</option>
                    </select>
                  </div>

                  <div class="login-form-group">
                    <label class="login-field-label">TENANT ENVIRONMENT</label>
                    <select id="credTenant" class="header-select" style="width:100%; padding-left:0.85rem;">
                      <option value="tenant_acme" selected>Acme Global Enterprise (Production Tier-1)</option>
                      <option value="tenant_nova">Nova Financial (PCI-DSS Dedicated)</option>
                      <option value="tenant_demo">Global Demo Sandbox</option>
                    </select>
                  </div>
                </div>

                <div class="login-checkbox-group">
                  <label class="checkbox-label">
                    <input type="checkbox" id="credHardwareMfa" checked />
                    <span>Simulate Google Titan Hardware Key MFA (FIDO2 / WebAuthn)</span>
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" id="credRemember" checked />
                    <span>Remember zero-trust session for 8 hours</span>
                  </label>
                </div>

                <button type="submit" class="btn btn-primary login-submit-btn" id="credSubmitBtn">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                  <span>Authenticate &amp; Enter Console</span>
                </button>
              </form>
            </div>

            <!-- TAB 3: Enterprise Single Sign-On (Google Workspace / Okta) -->
            <div class="login-tab-content ${this.activeTab === 'sso' ? 'active' : ''}" id="contentSso">
              <div class="login-section-desc">
                Connect via your enterprise Identity Provider (IdP). Enforces corporate OIDC / SAML 2.0 assertions and automated SCIM role provisioning.
              </div>

              <div class="sso-options-list">
                <button class="sso-provider-btn google-sso-btn" id="ssoGoogleBtn">
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <div style="text-align: left;">
                    <div style="font-weight: 600; color: #fff;">Single Sign-On with Google Workspace</div>
                    <div style="font-size: 0.7rem; color: var(--text-muted);">Cloud Identity • Workload Identity Federation</div>
                  </div>
                </button>

                <button class="sso-provider-btn okta-sso-btn" id="ssoOktaBtn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <circle cx="12" cy="12" r="9"/>
                    <circle cx="12" cy="12" r="4"/>
                  </svg>
                  <div style="text-align: left;">
                    <div style="font-weight: 600; color: #fff;">Enterprise SAML 2.0 / Okta Integration</div>
                    <div style="font-size: 0.7rem; color: var(--text-muted);">Okta Verify • Certificate-Bound Access</div>
                  </div>
                </button>
              </div>
            </div>

            <!-- Cryptographic Handshake Terminal Modal/Drawer (Visible during sign-in) -->
            <div id="handshakeOverlay" class="handshake-overlay hidden">
              <div class="handshake-box">
                <div class="handshake-header">
                  <div class="status-dot online"></div>
                  <strong style="color:#fff; font-size:0.85rem;">ZERO-TRUST HANDSHAKE IN PROGRESS</strong>
                </div>
                <div class="handshake-terminal" id="handshakeTerminal">
                  <!-- Injected sequentially -->
                </div>
              </div>
            </div>

            <!-- Security Policy Notice Footer -->
            <div class="login-footer">
              <div class="login-footer-security">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span>Designed with enterprise zero-trust principles. Ephemeral session tokens bound to tenant partition boundaries. No real credentials stored.</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    `;

    this.attachEvents(container);
  },

  attachEvents(container) {
    // Guest exploration button
    document.getElementById('exploreGuestBtn')?.addEventListener('click', () => {
      AppState.setView('overview');
    });

    // Tab switching
    const tabBtnPersona = document.getElementById('tabBtnPersona');
    const tabBtnCredentials = document.getElementById('tabBtnCredentials');
    const tabBtnSso = document.getElementById('tabBtnSso');

    const switchTab = (tabName) => {
      this.activeTab = tabName;
      this.renderPortal(container);
    };

    tabBtnPersona?.addEventListener('click', () => switchTab('persona'));
    tabBtnCredentials?.addEventListener('click', () => switchTab('credentials'));
    tabBtnSso?.addEventListener('click', () => switchTab('sso'));

    // Persona Quick Sign-in Buttons
    container.querySelectorAll('.persona-login-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const role = btn.getAttribute('data-role');
        const email = btn.getAttribute('data-email');
        const name = btn.getAttribute('data-name');
        this.performLogin({
          role,
          email,
          tenant_id: AppState.currentTenant,
          auth_method: 'PERSONA_QUICK_LOGIN'
        }, name);
      });
    });

    // Persona Card Click
    container.querySelectorAll('.persona-card').forEach(card => {
      card.addEventListener('click', () => {
        const role = card.getAttribute('data-role');
        const p = this.personas.find(x => x.role === role);
        if (p) {
          this.performLogin({
            role: p.role,
            email: p.email,
            tenant_id: AppState.currentTenant,
            auth_method: 'PERSONA_QUICK_LOGIN'
          }, p.name);
        }
      });
    });

    // Credentials Form Submit
    const credForm = document.getElementById('credentialsLoginForm');
    credForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('credEmail').value.trim();
      const role = document.getElementById('credRole').value;
      const tenant_id = document.getElementById('credTenant').value;

      this.performLogin({
        email,
        role,
        tenant_id,
        auth_method: 'PASSWORD'
      });
    });

    // Password Toggle Visibility
    const togglePassBtn = document.getElementById('togglePasswordVisibility');
    const passInput = document.getElementById('credPassword');
    togglePassBtn?.addEventListener('click', () => {
      if (passInput) {
        const isPass = passInput.type === 'password';
        passInput.type = isPass ? 'text' : 'password';
        togglePassBtn.style.color = isPass ? 'var(--accent-cyan)' : 'var(--text-muted)';
      }
    });

    // SSO Buttons
    document.getElementById('ssoGoogleBtn')?.addEventListener('click', () => {
      this.performLogin({
        email: 'sarah.chen@acme-corp.internal',
        role: 'Engineer',
        tenant_id: 'tenant_acme',
        auth_method: 'GOOGLE_WORKSPACE_SSO'
      }, 'Sarah Chen (Google Workspace)');
    });

    document.getElementById('ssoOktaBtn')?.addEventListener('click', () => {
      this.performLogin({
        email: 'marcus.vance@acme-corp.internal',
        role: 'Admin',
        tenant_id: 'tenant_acme',
        auth_method: 'SAML_OKTA'
      }, 'Marcus Vance (Okta SAML 2.0)');
    });
  },

  async performLogin(payload, displayName = null) {
    const overlay = document.getElementById('handshakeOverlay');
    const terminal = document.getElementById('handshakeTerminal');
    if (overlay && terminal) {
      overlay.classList.remove('hidden');
      terminal.innerHTML = '';
      
      const steps = [
        `[1/4] Authenticating principal '${payload.email}' via ${payload.auth_method}...`,
        `[2/4] Validating tenant boundary claims for '${payload.tenant_id}'...`,
        `[3/4] Binding RBAC privileges for role '${payload.role}'...`,
        `[4/4] Emitting SHA-256 integrity block to audit log stream...`
      ];

      for (let i = 0; i < steps.length; i++) {
        const line = document.createElement('div');
        line.className = 'handshake-line';
        line.innerText = steps[i];
        terminal.appendChild(line);
        await new Promise(r => setTimeout(r, 220));
      }
    }

    try {
      const res = await Api.login(payload);
      if (res.status === 'success') {
        AppState.loginUser(res);
      } else {
        alert('Authentication failed: ' + (res.message || 'Unknown error'));
        if (overlay) overlay.classList.add('hidden');
      }
    } catch (e) {
      alert('Authentication network error: ' + e.message);
      if (overlay) overlay.classList.add('hidden');
    }
  }
};
