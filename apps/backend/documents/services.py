from dataclasses import dataclass


@dataclass
class DocumentVerificationResult:
    is_available: bool
    is_valid: bool | None
    provider_code: str
    message: str
    raw_payload: dict | None = None


class TenantDocumentVerificationGateway:
    provider_code = "national-registry"

    def verify_tenant_document(self, *, document, landlord):
        raise NotImplementedError("External document verification has not been configured yet.")


class UnconfiguredTenantDocumentVerificationGateway(TenantDocumentVerificationGateway):
    def verify_tenant_document(self, *, document, landlord):
        return DocumentVerificationResult(
            is_available=False,
            is_valid=None,
            provider_code=self.provider_code,
            message=(
                "External tenant document verification is not configured yet. "
                "Wire a national registry or immigration provider into this gateway later."
            ),
            raw_payload={
                "tenant_id": document.tenant_id,
                "landlord_id": landlord.id,
                "document_type": document.document_type,
            },
        )


def get_document_verification_gateway():
    return UnconfiguredTenantDocumentVerificationGateway()
