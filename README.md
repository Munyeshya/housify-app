# Housify

Monorepo for the Housify platform.

## Product Overview

Housify is a rental property management and listing platform for landlords, tenants, and agents.

It combines:
- a private management system where landlords control properties, occupancy, agents, payments, complaints, and tenant assignment
- a public property listing experience where available properties can be shown for discovery and bookmarking
- a shared backend that powers both the web and mobile apps

The goal is to help landlords manage rental portfolios more cleanly while giving tenants a reliable housing record and an easier way to discover available properties.

## Core Concept

Landlords create and manage properties under their account. They can:
- register properties with names, descriptions, types, prices, and visibility settings
- assign tenants to properties
- remove tenants from properties without losing historical records
- track occupation status
- record payments
- handle complaints
- work with agents when they do not want to handle all management tasks directly

Tenants have a profile that keeps their rental history even after they leave a property. That history can be used when they are being considered for a new property.

Properties can be public or private:
- public properties are visible on the public-facing app/site for discovery
- private properties remain only inside landlord management flows

## User Roles

### Landlord

Landlords are the main property owners or managers in the system. They can:
- create and manage multiple properties under one account
- organize properties in a hierarchy
- control property availability and public visibility
- assign and remove tenants
- view current and historical occupation records
- record and review payments
- manage complaints
- add or remove agents from their workflow

### Tenant

Tenants are the occupants or prospective occupants of rental properties. They can:
- keep an account with their personal and rental history
- provide a unique identifier to a landlord for history review
- upload legal identification documents
- make or review payment records
- submit and receive complaint updates
- bookmark public properties

### Agent

Agents help landlords manage properties. Housify supports two types of agents:
- private agents: created by a landlord inside their account and removable by that landlord
- public agents: agents who register themselves on the platform and can be linked or unlinked by landlords, but not deleted by them

### Admin

Admins manage platform-level oversight, moderation, support, and verification.

## Property Management Model

The platform should support a hierarchy similar to folders and subfolders so landlords can manage small and large portfolios cleanly.

Example hierarchy:
- portfolio
- property
- building or section
- unit
- room or sub-unit

This supports cases where a landlord has:
- several separate properties under one account
- one property with multiple buildings or blocks
- units inside a building
- optional deeper nesting for complex rental setups

Each property or unit should be easy to identify through:
- a clear name
- a type such as apartment, house, compound, room, or unit
- a status such as available, occupied, hidden, archived, or under maintenance

## Tenant History and Identity Rules

Tenant history is a major feature of Housify.

Rules:
- a tenant keeps historical rental information even after being removed from a property
- landlords can review a prospective tenant's history only when the tenant provides their unique identifier
- the lookup of tenant history happens under a landlord account
- a tenant must have a legal identification document on file before they can be assigned to a property
- a landlord can view a tenant's legal identification document only while that tenant is currently occupying the landlord's property

This allows tenant movement between landlords without losing historical context while still protecting privacy.

## Pricing and Payments

Pricing is separate from payments.

### Pricing

Properties or units should support pricing information such as:
- rent amount
- currency
- billing cycle such as monthly, weekly, or yearly
- security deposit
- advance payment requirements
- late fees
- service charges
- pricing notes
- negotiable flag

The system should also be able to preserve price history over time.

### Payments

Payments record what has actually been paid by the tenant and what has been received by the landlord.

The platform should support:
- payment records tied to tenants and properties
- payment status tracking
- balance visibility
- landlord-side and tenant-side payment history
- future support for reminders, due dates, and payment analytics

## Complaints and Communication

Housify should support complaints or issue tracking between involved parties.

This includes:
- tenant to landlord complaints
- landlord to tenant issue records
- complaint history per tenancy or property
- status tracking for open, resolved, or escalated issues

## Public Property Discovery

Available properties can be displayed on the public-facing site and apps.

Public listing features should include:
- property visibility control by landlord
- price display
- property details and descriptions
- availability status
- property type
- bookmarking or saving properties for later

## Cross-Platform Direction

All major features are intended to be available on:
- web
- mobile

The backend is the central source of truth and must supply:
- authentication and authorization
- property management APIs
- tenant history APIs
- pricing and payment APIs
- complaint APIs
- agent management APIs
- public listing APIs

## Planned Core Modules

The platform is currently expected to grow around these backend domains:
- accounts
- properties
- pricing
- tenancies
- payments
- complaints
- agents
- bookmarks
- documents
- history
- public_listings

## MVP Direction

The first practical version of Housify should focus on:
- account creation and role management
- landlord property registration and organization
- public listing visibility controls
- tenant assignment and unassignment
- tenant history lookup by unique identifier
- legal ID document requirement for assignment
- pricing and payment record management
- complaints tracking
- public and private agent management
- bookmarking of public properties

## Included Product Enhancements

In addition to the core MVP, Housify is also intended to include these role-based benefits as part of the product direction:
- tenant trust indicators or profile completeness scores
- landlord occupancy dashboards
- saved search alerts
- rent reminders and agreement reminders
- agent performance metrics
- printable payment history

## Future Opportunities

Potential feature expansions include:
- AI-based property suggestions from user preferences
- AI-assisted tenant recommendations based on wider platform history and patterns

## Repository Structure

- `apps/backend` - Django project
- `apps/web` - React web app created with Vite
- `apps/mobile` - React Native app created with Expo
