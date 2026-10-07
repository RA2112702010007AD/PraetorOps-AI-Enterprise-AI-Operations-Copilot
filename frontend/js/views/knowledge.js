/**
 * PraetorOps AI — Knowledge Base & Grounded RAG Management View
 */

const KnowledgeView = {
  documents: [],

  async render(container) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
        Loading Knowledge Base Corpus...
      </div>
    `;

    try {
      const [docs, stats] = await Promise.all([
        Api.getDocuments(),
        Api.getKnowledgeStats()
      ]);
      this.documents = docs;

      container.innerHTML = `
        <div class="knowledge-view">
          
          <!-- Knowledge Corpus Stats Header -->
          <div class="grid-4" style="margin-bottom: 1.25rem;">
            <div class="kpi-card">
              <div class="kpi-label">Verified Runbooks & Docs</div>
              <div class="kpi-value-row">
                <span class="kpi-value" id="kbDocCount">${stats.total_documents}</span>
              </div>
              <div class="kpi-subtext">Tenant: ${AppState.currentTenant}</div>
            </div>

            <div class="kpi-card">
              <div class="kpi-label">Indexed Vector Chunks</div>
              <div class="kpi-value-row">
                <span class="kpi-value" id="kbChunkCount">${stats.total_chunks}</span>
              </div>
              <div class="kpi-subtext">Metadata Enriched Chunks</div>
            </div>

            <div class="kpi-card">
              <div class="kpi-label">Avg Grounding Score</div>
              <div class="kpi-value-row">
                <span class="kpi-value">${(stats.avg_grounding_score * 100).toFixed(0)}%</span>
              </div>
              <div class="kpi-subtext">Vertex RRF + BM25 Reranked</div>
            </div>

            <div class="kpi-card">
              <div class="kpi-label">Queries Served</div>
              <div class="kpi-value-row">
                <span class="kpi-value">${stats.queries_executed}</span>
              </div>
              <div class="kpi-subtext">Last Indexed: ${stats.last_indexed_at.slice(11, 19)} UTC</div>
            </div>
          </div>

          <!-- Actions & Filter Bar -->
          <div class="filter-bar">
            <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
              <div class="search-input-wrapper">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" id="kbSearchInput" class="search-input" placeholder="Search documentation titles or authors...">
              </div>

              <select id="kbCategoryFilter" class="header-select" style="padding-left: 0.85rem;">
                <option value="All">All Categories</option>
                <option value="Runbook">Runbooks</option>
                <option value="Security Policy">Security Policies</option>
                <option value="Architecture">Architecture Specs</option>
                <option value="Deployment Guide">Deployment Guides</option>
                <option value="Governance">Governance</option>
                <option value="AI Governance">AI Governance</option>
              </select>
            </div>

            <div style="display: flex; gap: 0.75rem;">
              <button class="btn btn-secondary btn-sm" id="kbReindexBtn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                <span>Re-Index Corpus</span>
              </button>
              <button class="btn btn-primary btn-sm" id="kbUploadDocBtn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                <span>Upload New Runbook</span>
              </button>
            </div>
          </div>

          <!-- Documents Table -->
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Doc ID</th>
                  <th>Category</th>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Version</th>
                  <th>Chunks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="kbTableBody">
                <!-- Injected via renderTableRows -->
              </tbody>
            </table>
          </div>

        </div>
      `;

      this.renderTableRows(this.documents);

      // Search & Category Filters
      const searchInput = document.getElementById('kbSearchInput');
      const catFilter = document.getElementById('kbCategoryFilter');

      const applyFilters = () => {
        const q = searchInput.value.toLowerCase();
        const cat = catFilter.value;
        const filtered = this.documents.filter(d => {
          const matchQ = !q || d.title.toLowerCase().includes(q) || d.id.toLowerCase().includes(q) || d.author.toLowerCase().includes(q);
          const matchCat = cat === 'All' || d.category === cat;
          return matchQ && matchCat;
        });
        this.renderTableRows(filtered);
      };

      searchInput.addEventListener('input', applyFilters);
      catFilter.addEventListener('change', applyFilters);

      // Upload Document Modal
      document.getElementById('kbUploadDocBtn')?.addEventListener('click', () => {
        this.openUploadModal();
      });

      // Re-Index Button
      document.getElementById('kbReindexBtn')?.addEventListener('click', async () => {
        const btn = document.getElementById('kbReindexBtn');
        btn.disabled = true;
        btn.innerText = 'Re-Indexing...';
        try {
          const res = await Api.reindexKnowledge();
          alert(`Corpus Re-Indexed: ${res.stats.total_chunks} chunks indexed across ${res.stats.total_documents} documents.`);
          this.render(container);
        } catch (e) {
          alert('Re-index failed: ' + e.message);
          btn.disabled = false;
        }
      });

    } catch (e) {
      container.innerHTML = `<div style="color: var(--color-danger); padding: 2rem;">Error loading knowledge base: ${e.message}</div>`;
    }
  },

  renderTableRows(items) {
    const tbody = document.getElementById('kbTableBody');
    if (!tbody) return;

    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2rem; color: var(--text-muted);">No documents found.</td></tr>`;
      return;
    }

    tbody.innerHTML = items.map(doc => `
      <tr>
        <td><span class="table-code">${doc.id}</span></td>
        <td><span class="badge" style="background: rgba(56,189,248,0.1); color: var(--accent-cyan);">${doc.category}</span></td>
        <td><strong style="color: var(--text-primary);">${doc.title}</strong></td>
        <td>${doc.author}</td>
        <td><span class="table-code" style="color: #94A3B8;">${doc.version}</span></td>
        <td><span class="badge" style="background: rgba(255,255,255,0.08);">${doc.chunks_count || 2} chunks</span></td>
        <td>
          <div style="display: flex; gap: 0.4rem;">
            <button class="btn btn-secondary btn-sm preview-doc-btn" data-doc-id="${doc.id}">Preview Chunks</button>
            <button class="btn btn-danger btn-sm delete-doc-btn" data-doc-id="${doc.id}">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.preview-doc-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const docId = btn.getAttribute('data-doc-id');
        this.openPreviewModal(docId);
      });
    });

    tbody.querySelectorAll('.delete-doc-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const docId = btn.getAttribute('data-doc-id');
        if (confirm(`Delete document ${docId}?`)) {
          try {
            await Api.deleteDocument(docId);
            this.documents = this.documents.filter(d => d.id !== docId);
            this.renderTableRows(this.documents);
          } catch (e) {
            alert('Delete failed: ' + e.message);
          }
        }
      });
    });
  },

  async openPreviewModal(docId) {
    const modalContainer = document.getElementById('modalContainer');
    if (!modalContainer) return;

    modalContainer.classList.remove('hidden');
    modalContainer.innerHTML = `
      <div class="modal-window">
        <div class="modal-header">
          <div class="modal-title">Loading Chunks for ${docId}...</div>
          <button class="modal-close-btn" id="modalCloseBtn">&times;</button>
        </div>
        <div class="modal-body" style="text-align: center; padding: 2rem;">Loading...</div>
      </div>
    `;

    document.getElementById('modalCloseBtn')?.addEventListener('click', () => modalContainer.classList.add('hidden'));

    try {
      const doc = await Api.getDocument(docId);
      modalContainer.innerHTML = `
        <div class="modal-window" style="max-width: 760px;">
          <div class="modal-header">
            <div>
              <span class="table-code">${doc.id}</span>
              <strong style="font-size: 0.95rem; color: #fff; margin-left: 0.5rem;">${doc.title}</strong>
            </div>
            <button class="modal-close-btn" id="modalCloseBtn">&times;</button>
          </div>

          <div class="modal-body">
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 1rem;">
              Category: <strong style="color: var(--accent-cyan);">${doc.category}</strong> • Author: ${doc.author} • Updated: ${doc.last_updated.slice(0, 10)}
            </div>

            <h4 style="font-size: 0.85rem; color: var(--text-primary); margin-bottom: 0.5rem;">Enriched Vector Chunks (${doc.chunks ? doc.chunks.length : 0}):</h4>
            <div style="display: flex; flex-direction: column; gap: 0.85rem;">
              ${(doc.chunks || []).map(chunk => `
                <div style="background: rgba(0,0,0,0.3); border: 1px solid var(--border-subtle); padding: 0.85rem; border-radius: var(--radius-md);">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
                    <strong style="color: var(--accent-cyan); font-size: 0.775rem;">${chunk.section}</strong>
                    <code class="table-code">${chunk.chunk_id}</code>
                  </div>
                  <p style="font-size: 0.775rem; color: var(--text-secondary); line-height: 1.5; white-space: pre-wrap;">${chunk.text}</p>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" id="modalCloseBtn2">Close</button>
          </div>
        </div>
      `;

      document.getElementById('modalCloseBtn')?.addEventListener('click', () => modalContainer.classList.add('hidden'));
      document.getElementById('modalCloseBtn2')?.addEventListener('click', () => modalContainer.classList.add('hidden'));

    } catch (e) {
      modalContainer.innerHTML = `<div class="modal-window"><div class="modal-body" style="color:var(--color-danger);">Error: ${e.message}</div></div>`;
    }
  },

  openUploadModal() {
    const modalContainer = document.getElementById('modalContainer');
    if (!modalContainer) return;

    modalContainer.classList.remove('hidden');
    modalContainer.innerHTML = `
      <div class="modal-window" style="max-width: 680px;">
        <div class="modal-header">
          <div class="modal-title">Upload / Ingest Synthetic Runbook</div>
          <button class="modal-close-btn" id="modalCloseBtn">&times;</button>
        </div>

        <form id="uploadDocForm">
          <div class="modal-body" style="display: flex; flex-direction: column; gap: 0.85rem;">
            <div>
              <label style="display:block; font-size:0.75rem; color:var(--text-muted); margin-bottom:0.25rem;">DOCUMENT TITLE</label>
              <input type="text" id="uploadTitle" class="chat-input" style="width:100%;" required placeholder="e.g. Runbook: Redis Memory Eviction & Sentinel Failover" />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
              <div>
                <label style="display:block; font-size:0.75rem; color:var(--text-muted); margin-bottom:0.25rem;">CATEGORY</label>
                <select id="uploadCategory" class="header-select" style="width:100%; padding-left:0.75rem;">
                  <option value="Runbook">Runbook</option>
                  <option value="Security Policy">Security Policy</option>
                  <option value="Deployment Guide">Deployment Guide</option>
                  <option value="Architecture">Architecture</option>
                </select>
              </div>
              <div>
                <label style="display:block; font-size:0.75rem; color:var(--text-muted); margin-bottom:0.25rem;">AUTHOR / TEAM</label>
                <input type="text" id="uploadAuthor" class="chat-input" style="width:100%;" value="${AppState.currentUserName}" />
              </div>
            </div>

            <div>
              <label style="display:block; font-size:0.75rem; color:var(--text-muted); margin-bottom:0.25rem;">DOCUMENT CONTENT (Paragraphs will be auto-chunked into embeddings)</label>
              <textarea id="uploadContent" class="chat-input" style="width:100%; height:160px; resize:vertical; font-family:var(--font-mono); font-size:0.75rem;" required placeholder="Section 1. Triage...\n\nSection 2. Mitigation..."></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="modalCancelBtn">Cancel</button>
            <button type="submit" class="btn btn-primary" id="modalSubmitUploadBtn">Ingest & Index</button>
          </div>
        </form>
      </div>
    `;

    document.getElementById('modalCloseBtn')?.addEventListener('click', () => modalContainer.classList.add('hidden'));
    document.getElementById('modalCancelBtn')?.addEventListener('click', () => modalContainer.classList.add('hidden'));

    document.getElementById('uploadDocForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('uploadTitle').value.trim();
      const category = document.getElementById('uploadCategory').value;
      const author = document.getElementById('uploadAuthor').value.trim();
      const content = document.getElementById('uploadContent').value.trim();

      const btn = document.getElementById('modalSubmitUploadBtn');
      btn.disabled = true;
      btn.innerText = 'Chunking & Indexing...';

      try {
        const created = await Api.uploadDocument({ title, category, author, content });
        alert(`Document ingested successfully: ${created.id} with ${created.chunks_count} chunks.`);
        modalContainer.classList.add('hidden');
        this.render(this.container);
      } catch (err) {
        alert('Upload failed: ' + err.message);
        btn.disabled = false;
        btn.innerText = 'Ingest & Index';
      }
    });
  }
};
