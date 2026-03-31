# Studi Aperti — Design Document

## Overview

Studi Aperti is an artist and studio directory for the Upper Tiber Valley in Umbria, Italy. The website lets visitors browse a curated collection of local artists and studios via a dual map/listing interface, while artists self-manage their own listings through a simple submission and editing flow. An admin dashboard provides approval and management capabilities.

**Domain:** studi-aperti.com (registered on IONOS, DNS pointed to Vercel)

## Stack

| Layer | Technology | Cost |
|-------|-----------|------|
| Frontend + Hosting | Next.js on Vercel (free tier) | $0 |
| Database + Auth + Storage | Supabase (free tier: 500MB DB, 1GB storage, 50k requests/mo) | $0 |
| Map | Mapbox GL JS (free tier: 50k map loads/mo) | $0 |
| Email | Resend via Supabase Edge Functions (free tier: 100 emails/day) | $0 |
| Domain | studi-aperti.com on IONOS (already owned) | Already paid |

**Total monthly cost: $0**

## Pages

### 1. Homepage — Map + Listings

The primary experience. All content lives on this single page.

**Desktop layout:**
- Two-column: scrollable listing cards on the left, sticky Mapbox map on the right
- Clicking a map pin highlights and auto-scrolls to the corresponding listing card
- Scrolling through listings pans the map and highlights the corresponding pin
- Clicking a listing card expands it in-place to show full details (all images, description, contact info, availability)
- Tag filtering available at the top of the listings column

**Mobile layout:**
- Bottom tab bar toggles between "List View" and "Map View"
- List View: scrollable cards (same as desktop left column)
- Map View: full-screen map with mini-cards at the bottom (horizontally scrollable, showing photo + name + tags)
- Tapping a pin shows the mini-card; tapping the mini-card expands to full detail

**Listing card (collapsed) shows:**
- Photo thumbnail
- Artist/studio name
- Type tags (e.g., "Ceramics", "Sculpture")
- Short description snippet
- Availability summary

**Listing card (expanded) additionally shows:**
- Full description
- All uploaded photos
- Full per-day availability
- Contact info (email, phone, website)
- Address

### 2. Add Listing

Self-service form for artists to submit their studio.

**Form fields:**
- Studio/artist name (required)
- Description (required, single text area)
- Address with Mapbox geocoder + draggable pin for precise placement (required)
- Image upload — up to 5 images (at least 1 required)
- Contact email (optional)
- Contact phone (optional)
- Website URL (optional)
- Availability — per-day selector (see data model below)
- Tags — multi-select from admin-defined list
- 4-digit edit code (required) — the artist's "password" for future edits

**On submit:**
- Listing saved with status "pending"
- Email notification sent to all admins
- Confirmation message shown to the artist

### 3. Manage Listing

Simple access flow for artists to edit their existing listing.

- Enter studio name or email + 4-digit edit code
- If matched, loads the listing into an editable form (same fields as Add Listing)
- Edits go live immediately (no re-approval needed)
- Artist can also soft-delete their own listing from here

### 4. Admin Dashboard

Password-protected area at `/admin` using Supabase Auth.

**Sections:**

**Pending Listings**
- Cards showing each submitted listing with all details
- Approve or Reject buttons
- On approve: listing goes live, artist gets email notification
- On reject: listing status set to rejected

**Active Listings**
- Table/list of all approved listings
- Click to view full details
- Edit any field (name, description, images, tags, availability, contact, address)
- Remove a listing (soft delete)
- Restore a removed listing

**Tag Management**
- List of all tags with active/inactive toggle
- Add new tags
- Deactivate tags (hidden from submission form, but existing listings keep them)

**Admin Management**
- List of current admins
- Invite new admin by email (sends Supabase Auth invite)
- Remove an admin

**Email Notifications:**
- Admins receive email when a new listing is submitted
- Artists receive email when their listing is approved

## Data Model

### `listings` table

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | auto-generated primary key |
| name | text | studio/artist name, required |
| description | text | free-form description, required |
| address | text | street address, required |
| lat | float | latitude from map pin |
| lng | float | longitude from map pin |
| contact_email | text | optional |
| contact_phone | text | optional |
| website | text | optional |
| availability | jsonb | per-day structure (see below) |
| tags | text[] | array of tag names |
| images | text[] | array of Supabase Storage URLs |
| edit_code | text | hashed 4-digit code |
| status | text | "pending", "approved", "rejected", "removed" |
| created_at | timestamp | auto-generated |
| updated_at | timestamp | auto-updated |
| removed_at | timestamp | nullable, set on soft delete |

**Availability JSONB structure:**
```json
{
  "monday": { "type": "hours", "open": "10:00", "close": "17:00" },
  "tuesday": { "type": "closed" },
  "wednesday": { "type": "text", "value": "By appointment only" },
  "thursday": { "type": "hours", "open": "10:00", "close": "17:00" },
  "friday": { "type": "hours", "open": "10:00", "close": "17:00" },
  "saturday": { "type": "text", "value": "Call ahead" },
  "sunday": { "type": "closed" }
}
```

### `tags` table

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | auto-generated primary key |
| name | text | e.g., "Ceramics" |
| is_active | boolean | false = hidden from form, existing listings keep it |
| created_at | timestamp | auto-generated |

### `admins` table

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | references Supabase Auth user ID |
| email | text | admin's email |
| invited_by | uuid | nullable, references admins.id |
| created_at | timestamp | auto-generated |

## Design Direction

**Aesthetic:** Warm, earthy, artisanal — reflecting Umbrian craft culture.

**Color palette:**
- Background: warm white/cream
- Primary accent: terracotta/burnt sienna
- Secondary accent: olive green
- Text: warm grays/charcoal
- Map pins: terracotta

**Typography:**
- Headings: organic serif (e.g., Playfair Display, DM Serif Display)
- Body: clean sans-serif (e.g., Inter, DM Sans)

**Logo:** Simple wordmark — "Studi Aperti" in heading serif with a small artisanal mark/icon.

**Map style:** Custom Mapbox style with muted earthy tones — desaturated greens, warm-toned roads, subtle labels. Should feel integrated with the site, not like an embedded Google Maps widget.

**Overall feel:** Curated gallery catalog, not a tech product.

**Language:** English only.

## Not In Scope (v1)

- QR code generation/management
- About page
- Multi-language support (Italian)
- User accounts for visitors
- Events or blog
- Search functionality (tag filtering is sufficient at 20-50 listings)
- Social media integration
