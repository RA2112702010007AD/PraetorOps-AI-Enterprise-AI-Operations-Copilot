/**
 * PraetorOps AI — System Architecture & Google Cloud Mapping View
 */

const ArchitectureView = {
  render(container) {
    container.innerHTML = `
      <div class="architecture-view" style="max-width: 1100px; margin: 0 auto;">
        
        <div class="section-card">
          <div class="section-header">
            <div>
              <div class="section-title">End-to-End Enterprise Agent Architecture</div>
              <div class="section-desc">Interactive schematic illustrating agent dispatch, RAG grounding, and Human-in-the-Loop gating</div>
            </div>
          </div>

          <!-- Flow Chart Visual Nodes -->
          <div class="arch-flow-grid">
            <div class="arch-node">
              <span class="badge" style="background: rgba(56,189,248,0.15); color: var(--accent-cyan); margin-bottom: 0.5rem;">STEP 1</span>
              <div class="arch-node-title">Enterprise User</div>
              <div class="arch-node-sub">SRE / SecOps / VP Ops via HTTPS & RBAC</div>
            </div>

            <div class="arch-node">
              <span class="badge" style="background: rgba(56,189,248,0.15); color: var(--accent-cyan); margin-bottom: 0.5rem;">STEP 2</span>
              <div class="arch-node-title">AI Safety Guard</div>
              <div class="arch-node-sub">Prompt Injection Scanner & Data Demarcation</div>
            </div>

            <div class="arch-node">
              <span class="badge" style="background: rgba(56,189,248,0.15); color: var(--accent-cyan); margin-bottom: 0.5rem;">STEP 3</span>
              <div class="arch-node-title">AI Orchestrator</div>
              <div class="arch-node-sub">Intent Classification & Specialist Planning</div>
            </div>

            <div class="arch-node">
              <span class="badge" style="background: rgba(56,189,248,0.15); color: var(--accent-cyan); margin-bottom: 0.5rem;">STEP 4</span>
              <div class="arch-node-title">Specialized Agents</div>
              <div class="arch-node-sub">Incident, Knowledge, Security, Remediation</div>
            </div>

            <div class="arch-node">
              <span class="badge" style="background: rgba(56,189,248,0.15); color: var(--accent-cyan); margin-bottom: 0.5rem;">STEP 5</span>
              <div class="arch-node-title">RAG Knowledge Layer</div>
              <div class="arch-node-sub">Vertex Vector Search + Reciprocal Rank Fusion</div>
            </div>

            <div class="arch-node">
              <span class="badge" style="background: rgba(56,189,248,0.15); color: var(--accent-cyan); margin-bottom: 0.5rem;">STEP 6</span>
              <div class="arch-node-title">Gemini Reasoning</div>
              <div class="arch-node-sub">Grounded Synthesis & Structured Outputs</div>
            </div>

            <div class="arch-node">
              <span class="badge" style="background: rgba(245,158,11,0.15); color: #FCD34D; margin-bottom: 0.5rem;">STEP 7 (GATE)</span>
              <div class="arch-node-title">Approval Gateway</div>
              <div class="arch-node-sub">Human-in-the-Loop Authorization for Writes</div>
            </div>

            <div class="arch-node">
              <span class="badge" style="background: rgba(16,185,129,0.15); color: #34D399; margin-bottom: 0.5rem;">STEP 8</span>
              <div class="arch-node-title">Audit & Telemetry</div>
              <div class="arch-node-sub">SHA-256 Chained Log & Cloud Monitoring</div>
            </div>
          </div>
        </div>

        <!-- Google Cloud Native Mapping Table -->
        <div class="section-card">
          <div class="section-header">
            <div>
              <div class="section-title">Google Cloud Target Topology</div>
              <div class="section-desc">Production mapping for zero-trust deployment on Google Cloud Platform (GCP)</div>
            </div>
          </div>

          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Architecture Component</th>
                  <th>Google Cloud Service</th>
                  <th>Enterprise Security & Governance Rationale</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Frontend Web Client</strong></td>
                  <td><span class="table-code">Google Cloud Run</span></td>
                  <td>Serverless container execution behind Google Cloud Armor WAF with identity-aware proxy (IAP).</td>
                </tr>
                <tr>
                  <td><strong>Backend / Agent API</strong></td>
                  <td><span class="table-code">Google Cloud Run</span></td>
                  <td>Stateless autoscaling containers running within a VPC Service Controls perimeter.</td>
                </tr>
                <tr>
                  <td><strong>Foundation LLM</strong></td>
                  <td><span class="table-code">Vertex AI (Gemini 1.5 Pro)</span></td>
                  <td>Private Vertex AI API endpoints with customer data residency and no model retraining on inputs.</td>
                </tr>
                <tr>
                  <td><strong>Vector Index & Retrieval</strong></td>
                  <td><span class="table-code">Vertex AI Vector Search</span></td>
                  <td>Sub-millisecond semantic retrieval filtered strictly by <code class="table-code">tenant_id</code> partition tokens.</td>
                </tr>
                <tr>
                  <td><strong>Document & Artifact Store</strong></td>
                  <td><span class="table-code">Google Cloud Storage (GCS)</span></td>
                  <td>CMEK encrypted buckets with Uniform Bucket-Level Access and 7-year Bucket Lock for compliance.</td>
                </tr>
                <tr>
                  <td><strong>Secret & Key Management</strong></td>
                  <td><span class="table-code">Secret Manager & Cloud KMS</span></td>
                  <td>Zero credentials in client code. Dynamic retrieval of service account credentials via Workload Identity.</td>
                </tr>
                <tr>
                  <td><strong>Audit & Telemetry</strong></td>
                  <td><span class="table-code">Cloud Logging & Monitoring</span></td>
                  <td>Structured JSON logs streamed to BigQuery and immutable log sinks with cryptographic hash checks.</td>
                </tr>
                <tr>
                  <td><strong>Container CI/CD</strong></td>
                  <td><span class="table-code">Cloud Build & Artifact Registry</span></td>
                  <td>Vulnerability scanning and Binary Authorization ensuring only signed container images run.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Google Agent Development Kit (ADK) Alignment -->
        <div class="section-card">
          <div class="section-header">
            <div>
              <div class="section-title">Alignment with Google Agent Development Kit (ADK)</div>
              <div class="section-desc">Architectural blueprint ready for transition to Google ADK production agents</div>
            </div>
          </div>

          <p style="font-size: 0.825rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 0.85rem;">
            PraetorOps AI adheres directly to Google's Agent Development Kit patterns:
          </p>

          <ul style="font-size: 0.8rem; color: var(--text-muted); padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.45rem;">
            <li><strong>Declarative Tool Schemas:</strong> Tools define strict parameters, read-only vs destructive classification, and explicit RBAC bindings.</li>
            <li><strong>State & Memory Boundary:</strong> Session context and tenant IDs are isolated; private chain-of-thought is suppressed in favor of concise evidence summaries.</li>
            <li><strong>Evaluator-Optimizer Loop:</strong> Continuous evaluation agents score grounding and citation consistency prior to customer release.</li>
          </ul>
        </div>

      </div>
    `;
  }
};
