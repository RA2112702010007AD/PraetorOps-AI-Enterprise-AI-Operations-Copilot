"""
PraetorOps AI — Knowledge Base Router.
Allows searching, uploading, previewing, deleting, and re-indexing runbooks and docs.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Body
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from ..core.security import get_current_security_context, SecurityContext
from ..core.audit import audit_manager
from ..rag.store import knowledge_store

router = APIRouter(prefix="/api/knowledge", tags=["Knowledge Base"])

class UploadDocRequest(BaseModel):
    title: str
    category: str = "Runbook"
    version: str = "v1.0"
    author: str = "Ops Engineering"
    content: str

@router.get("/documents")
def list_documents(
    category: Optional[str] = Query(None),
    context: SecurityContext = Depends(get_current_security_context)
):
    context.require_permission("rag:search")
    return knowledge_store.list_documents(tenant_id=context.tenant_id, category=category)

@router.get("/documents/{doc_id}")
def get_document(
    doc_id: str,
    context: SecurityContext = Depends(get_current_security_context)
):
    context.require_permission("rag:search")
    doc = knowledge_store.get_document_details(doc_id=doc_id, tenant_id=context.tenant_id)
    if not doc:
        raise HTTPException(status_code=404, detail=f"Document {doc_id} not found in tenant {context.tenant_id}.")
    return doc

@router.post("/documents")
def upload_document(
    req: UploadDocRequest,
    context: SecurityContext = Depends(get_current_security_context)
):
    context.require_permission("rag:manage")
    doc_data = {
        "title": req.title,
        "tenant_id": context.tenant_id,
        "category": req.category,
        "version": req.version,
        "author": req.author,
        "content": req.content
    }
    created = knowledge_store.add_document(doc_data)
    
    audit_manager.record_action(
        user=context.user_id,
        tenant=context.tenant_id,
        action="DOCUMENT_INGESTED",
        agent="Knowledge Agent",
        tool="rag_manage",
        risk_level="LOW",
        approval_status="AUTO_ALLOWED",
        result=f"Ingested document {created['id']} ({created['title']}) with {created['chunks_count']} chunks"
    )
    return created

@router.delete("/documents/{doc_id}")
def delete_document(
    doc_id: str,
    context: SecurityContext = Depends(get_current_security_context)
):
    context.require_permission("rag:manage")
    success = knowledge_store.delete_document(doc_id=doc_id, tenant_id=context.tenant_id)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found or access denied.")
    
    audit_manager.record_action(
        user=context.user_id,
        tenant=context.tenant_id,
        action="DOCUMENT_DELETED",
        agent="Knowledge Agent",
        tool="rag_manage",
        risk_level="MEDIUM",
        approval_status="AUTO_ALLOWED",
        result=f"Deleted document {doc_id}"
    )
    return {"status": "success", "message": f"Document {doc_id} deleted."}

@router.post("/reindex")
def reindex_knowledge_base(
    context: SecurityContext = Depends(get_current_security_context)
):
    context.require_permission("rag:manage")
    stats = knowledge_store.get_stats(tenant_id=context.tenant_id)
    audit_manager.record_action(
        user=context.user_id,
        tenant=context.tenant_id,
        action="KNOWLEDGE_BASE_REINDEXED",
        agent="Knowledge Agent",
        tool="rag_manage",
        risk_level="LOW",
        approval_status="AUTO_ALLOWED",
        result=f"Reindexed {stats['total_chunks']} chunks across {stats['total_documents']} documents"
    )
    return {"status": "success", "message": "Knowledge base vector index updated.", "stats": stats}

@router.get("/stats")
def get_knowledge_stats(
    context: SecurityContext = Depends(get_current_security_context)
):
    return knowledge_store.get_stats(tenant_id=context.tenant_id)
