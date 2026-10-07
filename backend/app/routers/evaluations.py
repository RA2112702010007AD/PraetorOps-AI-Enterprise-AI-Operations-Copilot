"""
PraetorOps AI — Evaluation Dashboard & Benchmark Router.
"""

from fastapi import APIRouter, Depends, Query, HTTPException
from typing import Optional, List, Dict, Any
from ..core.security import get_current_security_context, SecurityContext
from ..agents.evaluation_agent import evaluation_agent
from ..data.evaluations_data import EVALUATION_TEST_CASES

router = APIRouter(prefix="/api/evaluations", tags=["AI Evaluation"])

@router.get("/summary")
def get_evaluation_summary(
    context: SecurityContext = Depends(get_current_security_context)
):
    context.require_permission("eval:run")
    # Return pre-computed or current benchmark results
    return evaluation_agent.run_benchmark_suite()

@router.post("/run-suite")
def run_evaluation_suite(
    context: SecurityContext = Depends(get_current_security_context)
):
    context.require_permission("eval:run")
    return evaluation_agent.run_benchmark_suite()

@router.get("/cases")
def list_test_cases(
    context: SecurityContext = Depends(get_current_security_context)
):
    return EVALUATION_TEST_CASES
