from django.core.exceptions import ValidationError
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import AgentProfile, AgentType, LandlordProfile, TenantProfile, User, UserRole
from complaints.models import Complaint, ComplaintCategory, ComplaintDirection, ComplaintStatus
from payments.models import Payment, PaymentCategory, PaymentMethod, PaymentStatus
from properties.models import BillingCycle, Property, PropertyStatus, PropertyType
from tenancies.models import Tenancy, TenancyStatus

from .models import AgentAssignmentStatus, PropertyAgentAssignment


class AgentsApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.landlord_user = User.objects.create_user(
            email="landlord@example.com",
            password="password123",
            role=UserRole.LANDLORD,
            full_name="Landlord One",
        )
        self.other_landlord_user = User.objects.create_user(
            email="other-landlord@example.com",
            password="password123",
            role=UserRole.LANDLORD,
            full_name="Landlord Two",
        )
        self.landlord = LandlordProfile.objects.create(user=self.landlord_user, display_name="Landlord One")
        self.other_landlord = LandlordProfile.objects.create(
            user=self.other_landlord_user,
            display_name="Landlord Two",
        )

        self.tenant_user = User.objects.create_user(
            email="tenant@example.com",
            password="password123",
            role=UserRole.TENANT,
            full_name="Tenant One",
        )
        self.tenant = TenantProfile.objects.create(
            user=self.tenant_user,
            legal_id_type="National ID",
            legal_id_number="1199980012345678",
            legal_id_document_url="https://example.com/legal-id.pdf",
        )

        self.public_agent_user = User.objects.create_user(
            email="public-agent@example.com",
            password="password123",
            role=UserRole.AGENT,
            full_name="Public Agent",
        )
        self.public_agent = AgentProfile.objects.create(
            user=self.public_agent_user,
            agent_type=AgentType.PUBLIC,
            bio="Public agent profile",
        )

        self.private_agent_user = User.objects.create_user(
            email="private-agent@example.com",
            password="password123",
            role=UserRole.AGENT,
            full_name="Private Agent",
        )
        self.private_agent = AgentProfile.objects.create(
            user=self.private_agent_user,
            agent_type=AgentType.PRIVATE,
            created_by_landlord=self.landlord,
            bio="Private agent profile",
        )

        self.property = Property.objects.create(
            landlord=self.landlord,
            name="hill-view",
            title="Hill View Residences",
            short_description="Two-bedroom apartment",
            description="A complete residence for testing.",
            property_type=PropertyType.APARTMENT,
            status=PropertyStatus.AVAILABLE,
            is_public=True,
            bedrooms=2,
            bathrooms=2,
            kitchens=1,
            living_rooms=1,
            parking_spaces=1,
            address_line_1="KG 11 Ave",
            city="Kigali",
            rent_amount=450000,
            currency="RWF",
            billing_cycle=BillingCycle.MONTHLY,
        )
        self.other_property = Property.objects.create(
            landlord=self.other_landlord,
            name="other-home",
            title="Other Landlord Home",
            short_description="Another property",
            description="Owned by a different landlord.",
            property_type=PropertyType.HOUSE,
            status=PropertyStatus.AVAILABLE,
            address_line_1="KG 22 Ave",
            city="Kigali",
            rent_amount=800000,
            currency="RWF",
            billing_cycle=BillingCycle.MONTHLY,
        )

        self.tenancy = Tenancy.objects.create(
            landlord=self.landlord,
            property=self.property,
            tenant=self.tenant,
            assigned_by=self.landlord_user,
            status=TenancyStatus.ACTIVE,
            start_date="2026-04-01",
            monthly_rent_snapshot=450000,
            security_deposit_snapshot=450000,
            billing_cycle_snapshot=BillingCycle.MONTHLY,
        )

        Payment.objects.create(
            tenancy=self.tenancy,
            category=PaymentCategory.RENT,
            status=PaymentStatus.PAID,
            method=PaymentMethod.MOBILE_MONEY,
            amount_due=450000,
            amount_paid=450000,
            currency="RWF",
            reference="PAY-001",
        )
        Complaint.objects.create(
            tenancy=self.tenancy,
            created_by=self.tenant_user,
            assigned_to=self.landlord_user,
            title="Water leak",
            description="Kitchen sink leaking",
            category=ComplaintCategory.MAINTENANCE,
            direction=ComplaintDirection.TENANT_TO_LANDLORD,
            status=ComplaintStatus.OPEN,
        )

    def test_attach_public_agent_to_landlord_property(self):
        self.client.force_authenticate(user=self.landlord_user)
        response = self.client.post(
            "/api/v1/agents/assignments/",
            {
                "landlord": self.landlord.id,
                "agent": self.public_agent.id,
                "property": self.property.id,
                "status": AgentAssignmentStatus.ACTIVE,
                "granted_by": self.landlord_user.id,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(PropertyAgentAssignment.objects.count(), 1)
        self.assertEqual(response.data["agent"]["type"], AgentType.PUBLIC)

    def test_cannot_attach_agent_to_other_landlord_property(self):
        self.client.force_authenticate(user=self.landlord_user)
        response = self.client.post(
            "/api/v1/agents/assignments/",
            {
                "landlord": self.landlord.id,
                "agent": self.public_agent.id,
                "property": self.other_property.id,
                "status": AgentAssignmentStatus.ACTIVE,
                "granted_by": self.landlord_user.id,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(PropertyAgentAssignment.objects.count(), 0)

    def test_create_private_agent_and_assign_to_property(self):
        self.client.force_authenticate(user=self.landlord_user)
        create_response = self.client.post(
            "/api/v1/agents/private/",
            {
                "landlord": self.landlord.id,
                "email": "new-private@example.com",
                "full_name": "New Private Agent",
                "phone_number": "0788000000",
                "password": "password123",
                "bio": "Created by landlord",
            },
            format="json",
        )
        self.assertEqual(create_response.status_code, 201)

        new_agent = AgentProfile.objects.get(user__email="new-private@example.com")
        assign_response = self.client.post(
            "/api/v1/agents/assignments/",
            {
                "landlord": self.landlord.id,
                "agent": new_agent.id,
                "property": self.property.id,
                "status": AgentAssignmentStatus.ACTIVE,
                "granted_by": self.landlord_user.id,
            },
            format="json",
        )

        self.assertEqual(assign_response.status_code, 201)
        self.assertEqual(assign_response.data["agent"]["type"], AgentType.PRIVATE)

    def test_revoke_property_access(self):
        assignment = PropertyAgentAssignment.objects.create(
            landlord=self.landlord,
            agent=self.public_agent,
            property=self.property,
            status=AgentAssignmentStatus.ACTIVE,
            granted_by=self.landlord_user,
        )
        self.client.force_authenticate(user=self.landlord_user)

        response = self.client.post(
            f"/api/v1/agents/assignments/{assignment.id}/revoke/",
            {},
            format="json",
        )

        assignment.refresh_from_db()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(assignment.status, AgentAssignmentStatus.REVOKED)
        self.assertIsNotNone(assignment.revoked_at)

    def test_public_and_private_agents_have_different_legal_id_visibility(self):
        public_assignment = PropertyAgentAssignment.objects.create(
            landlord=self.landlord,
            agent=self.public_agent,
            property=self.property,
            status=AgentAssignmentStatus.ACTIVE,
            granted_by=self.landlord_user,
        )
        private_assignment = PropertyAgentAssignment.objects.create(
            landlord=self.landlord,
            agent=self.private_agent,
            property=self.property,
            status=AgentAssignmentStatus.ACTIVE,
            granted_by=self.landlord_user,
        )

        self.client.force_authenticate(user=self.public_agent_user)
        public_response = self.client.get(f"/api/v1/agents/{self.public_agent.id}/properties/")
        self.client.force_authenticate(user=self.private_agent_user)
        private_response = self.client.get(f"/api/v1/agents/{self.private_agent.id}/properties/")

        public_tenancy = public_response.data[0]["active_tenancies"][0]
        private_tenancy = private_response.data[0]["active_tenancies"][0]

        self.assertEqual(public_assignment.can_view_legal_id, False)
        self.assertEqual(private_assignment.can_view_legal_id, True)
        self.assertIsNone(public_tenancy["legal_id_document_url"])
        self.assertEqual(private_tenancy["legal_id_document_url"], self.tenant.legal_id_document_url)

    def test_agent_can_view_managed_payments_and_complaints(self):
        PropertyAgentAssignment.objects.create(
            landlord=self.landlord,
            agent=self.public_agent,
            property=self.property,
            status=AgentAssignmentStatus.ACTIVE,
            granted_by=self.landlord_user,
        )

        self.client.force_authenticate(user=self.public_agent_user)
        payments_response = self.client.get(f"/api/v1/agents/{self.public_agent.id}/payments/")
        complaints_response = self.client.get(f"/api/v1/agents/{self.public_agent.id}/complaints/")

        self.assertEqual(payments_response.status_code, 200)
        self.assertEqual(complaints_response.status_code, 200)
        self.assertEqual(len(payments_response.data), 1)
        self.assertEqual(len(complaints_response.data), 1)

    def test_duplicate_active_assignment_is_blocked(self):
        PropertyAgentAssignment.objects.create(
            landlord=self.landlord,
            agent=self.public_agent,
            property=self.property,
            status=AgentAssignmentStatus.ACTIVE,
            granted_by=self.landlord_user,
        )
        self.client.force_authenticate(user=self.landlord_user)

        response = self.client.post(
            "/api/v1/agents/assignments/",
            {
                "landlord": self.landlord.id,
                "agent": self.public_agent.id,
                "property": self.property.id,
                "status": AgentAssignmentStatus.ACTIVE,
                "granted_by": self.landlord_user.id,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_model_blocks_duplicate_active_assignment(self):
        PropertyAgentAssignment.objects.create(
            landlord=self.landlord,
            agent=self.public_agent,
            property=self.property,
            status=AgentAssignmentStatus.ACTIVE,
            granted_by=self.landlord_user,
        )

        with self.assertRaises(ValidationError):
            PropertyAgentAssignment.objects.create(
                landlord=self.landlord,
                agent=self.public_agent,
                property=self.property,
                status=AgentAssignmentStatus.ACTIVE,
                granted_by=self.landlord_user,
            )

    def test_public_agent_cannot_be_deleted_by_landlord(self):
        self.client.force_authenticate(user=self.landlord_user)
        response = self.client.delete(f"/api/v1/agents/private/{self.public_agent.id}/")

        self.assertEqual(response.status_code, 400)
        self.assertTrue(AgentProfile.objects.filter(id=self.public_agent.id).exists())

    def test_private_agent_can_be_deleted_by_creator_landlord(self):
        PropertyAgentAssignment.objects.create(
            landlord=self.landlord,
            agent=self.private_agent,
            property=self.property,
            status=AgentAssignmentStatus.ACTIVE,
            granted_by=self.landlord_user,
        )

        self.client.force_authenticate(user=self.landlord_user)
        response = self.client.delete(f"/api/v1/agents/private/{self.private_agent.id}/")

        self.assertEqual(response.status_code, 204)
        self.assertFalse(AgentProfile.objects.filter(id=self.private_agent.id).exists())
        self.assertFalse(User.objects.filter(id=self.private_agent_user.id).exists())
