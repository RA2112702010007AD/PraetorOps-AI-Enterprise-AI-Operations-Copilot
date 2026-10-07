"""
PraetorOps AI — Multi-Tenant Knowledge Store.
Manages documents, chunks, and metadata per tenant with support for upload,
deletion, full-text preview, and re-indexing.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from ..data.synthetic_db import DOCUMENTS_DB

class KnowledgeStore:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(KnowledgeStore, cls).__new__(cls)
            cls._instance.documents: Dict[str, Dict[str, Any]] = {}
            cls._instance.chunks: List[Dict[str, Any]] = []
            cls._instance.last_indexed_at = datetime.now(timezone.utc).isoformat()
            cls._instance.query_count = 0
            cls._instance._load_initial_corpus()
        return cls._instance

    def _load_initial_corpus(self):
        for doc in DOCUMENTS_DB:
            self.add_document(doc, is_initial=True)

    def add_document(self, doc_data: Dict[str, Any], is_initial: bool = False) -> Dict[str, Any]:
        doc_id = doc_data.get("id") or f"DOC-USR-{len(self.documents)+1:03d}"
        tenant_id = doc_data.get("tenant_id", "tenant_acme")
        
        # If document already contains chunks, register them
        chunks = doc_data.get("chunks", [])
        if not chunks and "content" in doc_data:
            # Auto-chunking uploaded document text
            content = doc_data["content"]
            paragraphs = [p.strip() for p in content.split("\n\n") if p.strip()]
            for idx, p in enumerate(paragraphs):
                chunks.append({
                    "chunk_id": f"{doc_id}#p{idx+1}",
                    "section": f"Section {idx+1}",
                    "text": p
                })

        enriched_doc = {
            "id": doc_id,
            "title": doc_data.get("title", "Untitled Knowledge Document"),
            "tenant_id": tenant_id,
            "category": doc_data.get("category", "General Operations"),
            "version": doc_data.get("version", "v1.0"),
            "author": doc_data.get("author", "Cloud Operations"),
            "last_updated": doc_data.get("last_updated") or datetime.now(timezone.utc).isoformat(),
            "chunks_count": len(chunks)
        }
        self.documents[doc_id] = enriched_doc

        # Register chunks in global search index with enriched metadata
        for chk in chunks:
            self.chunks.append({
                "chunk_id": chk["chunk_id"],
                "doc_id": doc_id,
                "doc_title": enriched_doc["title"],
                "tenant_id": tenant_id,
                "category": enriched_doc["category"],
                "section": chk.get("section", "General"),
                "text": chk["text"],
                "timestamp": enriched_doc["last_updated"],
                "source": f"{enriched_doc['title']} ({chk.get('section', 'General')})"
            })

        self.last_indexed_at = datetime.now(timezone.utc).isoformat()
        return enriched_doc

    def delete_document(self, doc_id: str, tenant_id: str) -> bool:
        if doc_id in self.documents and self.documents[doc_id]["tenant_id"] == tenant_id:
            del self.documents[doc_id]
            self.chunks = [c for c in self.chunks if c["doc_id"] != doc_id]
            self.last_indexed_at = datetime.now(timezone.utc).isoformat()
            return True
        return False

    def list_documents(self, tenant_id: str, category: Optional[str] = None) -> List[Dict[str, Any]]:
        docs = [d for d in self.documents.values() if d["tenant_id"] == tenant_id]
        if category and category != "All":
            docs = [d for d in docs if d["category"] == category]
        return docs

    def get_document_details(self, doc_id: str, tenant_id: str) -> Optional[Dict[str, Any]]:
        doc = self.documents.get(doc_id)
        if not doc or doc["tenant_id"] != tenant_id:
            return None
        doc_chunks = [c for c in self.chunks if c["doc_id"] == doc_id]
        return {**doc, "chunks": doc_chunks}

    def get_stats(self, tenant_id: str) -> Dict[str, Any]:
        tenant_docs = [d for d in self.documents.values() if d["tenant_id"] == tenant_id]
        tenant_chunks = [c for c in self.chunks if c["tenant_id"] == tenant_id]
        return {
            "total_documents": len(tenant_docs),
            "total_chunks": len(tenant_chunks),
            "last_indexed_at": self.last_indexed_at,
            "queries_executed": self.query_count,
            "avg_grounding_score": 0.94
        }

knowledge_store = KnowledgeStore()
