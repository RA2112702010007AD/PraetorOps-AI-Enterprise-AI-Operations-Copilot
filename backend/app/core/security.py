"""
PraetorOps AI — Security, RBAC & Prompt Injection Defense Architecture.
Implements:
1. Role-Based Access Control (RBAC): Admin, Engineer, Analyst, Viewer
2. Multi-Tenant Boundary Enforcement
3. Real-time Prompt Injection & Jailbreak Defense (AI Safety Guard)
4. Data vs. Instruction Demarcation (<UNTRUSTED_DATA_BOUNDARY>)
5. Tool Execution Permission Validation
"""

import re
from typing import Dict, Any, Optional, Tuple, List
from fastapi import Header, HTTPException, status

# Role Permissions Matrix
ROLE_PERMISSIONS: Dict[str, List[str]] = {
    "Admin": [
        "incident:read", "incident:write", "rag:search", "rag:manage",
        "tools:read", "tools:execute_low_risk", "tools:execute_high_risk",
        "approvals:request", "approvals:approve", "approvals:reject",
        "security:read", "security:manage", "audit:read", "eval:run"
    ],
    "Engineer": [
        "incident:read", "incident:write", "rag:search", "rag:manage",
        "tools:read", "tools:execute_low_risk",
        "approvals:request", "security:read", "audit:read", "eval:run"
    ],
    "Analyst": [
        "incident:read", "rag:search", "tools:read", "security:read",
        "security:write", "audit:read", "eval:run", "approvals:request"
    ],
    "Viewer": [
        "incident:read", "rag:search", "audit:read"
    ]
}

# Prompt Injection Threat Signatures
INJECTION_PATTERNS = [
    r"(?i)ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|directives|prompts|rules)",
    r"(?i)reveal\s+(your\s+)?(internal\s+)?(system\s+prompt|instructions|developer\s+mode)",
    r"(?i)print\s+(your\s+)?(secret|configuration|master\s+passwords?|keys?)",
    r"(?i)you\s+are\s+now\s+in\s+(developer\s+mode|dan|god\s+mode|unrestricted)",
    r"(?i)send\s+(the\s+)?(database|credentials|passwords?|keys?)\s+to\s+",
    r"(?i)disable\s+(all\s+)?(security\s+controls|safeguards|filters|audit)",
    r"(?i)bypass\s+(rbac|authorization|waf|firewall)",
    r"(?i)drop\s+database\s+",
    r"(?i)sudo\s+rm\s+-rf",
    r"(?i)execute\s+this\s+administrator\s+command\s+without\s+approval"
]

class PromptInjectionGuard:
    """Enterprise AI Safety Guard inspecting inputs and retrieved text."""
    
    @staticmethod
    def scan_query(query: str) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Scans a query for prompt injection or adversarial patterns.
        Returns: (is_safe, refusal_reason, matched_pattern)
        """
        for pattern in INJECTION_PATTERNS:
            match = re.search(pattern, query)
            if match:
                return (
                    False,
                    f"AI Safety Guard Refusal: Query matched prompt injection threat signature '{match.group(0)}'. "
                    f"Enterprise policy strictly prohibits instruction overrides or system credential disclosure.",
                    match.group(0)
                )
        return (True, None, None)

    @staticmethod
    def sanitize_untrusted_data(content: str, source_label: str) -> str:
        """
        Wraps external data in explicit instruction-data boundary tags.
        Prevents indirect prompt injections from hijacking agent execution.
        """
        # Strip potential boundary escapes
        cleaned = content.replace("</UNTRUSTED_DATA_BOUNDARY>", "[ESCAPED_BOUNDARY]")
        return (
            f"\n<UNTRUSTED_DATA_BOUNDARY source=\"{source_label}\">\n"
            f"{cleaned}\n"
            f"</UNTRUSTED_DATA_BOUNDARY>\n"
        )

class SecurityContext:
    """Validated caller identity and authorization context."""
    def __init__(
        self,
        user_id: str,
        user_name: str,
        role: str,
        tenant_id: str,
        permissions: List[str]
    ):
        self.user_id = user_id
        self.user_name = user_name
        self.role = role
        self.tenant_id = tenant_id
        self.permissions = permissions

    def has_permission(self, permission: str) -> bool:
        return permission in self.permissions or "admin:all" in self.permissions

    def require_permission(self, permission: str):
        if not self.has_permission(permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"RBAC Authorization Denied: Role '{self.role}' lacks required permission '{permission}'."
            )

    def validate_tenant_access(self, target_tenant_id: str):
        if self.tenant_id != target_tenant_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Cross-Tenant Security Violation: Principal of tenant '{self.tenant_id}' cannot access resources in tenant '{target_tenant_id}'."
            )

def get_current_security_context(
    x_user_role: Optional[str] = Header("Engineer", alias="X-User-Role"),
    x_tenant_id: Optional[str] = Header("tenant_acme", alias="X-Tenant-Id"),
    x_user_id: Optional[str] = Header("usr_sre_01", alias="X-User-Id"),
    x_user_name: Optional[str] = Header("Sarah Chen", alias="X-User-Name")
) -> SecurityContext:
    """Dependency resolver extracting validated identity from simulated auth headers."""
    role = x_user_role if x_user_role in ROLE_PERMISSIONS else "Viewer"
    perms = ROLE_PERMISSIONS.get(role, [])
    
    return SecurityContext(
        user_id=x_user_id or "usr_demo",
        user_name=x_user_name or "Demo User",
        role=role,
        tenant_id=x_tenant_id or "tenant_acme",
        permissions=perms
    )
