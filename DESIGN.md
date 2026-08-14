---
name: PneumaticTH Trusted Factory Manual
description: A clear Thai industrial interface built around authentic proof, PneumaticTH blue, and a uniquely primary LINE contact path.
colors:
  ink: "#17202f"
  muted: "#5c6678"
  paper: "#ffffff"
  wash: "#f3f6fb"
  brand-blue: "#286ffb"
  brand-blue-dark: "#1553d1"
  divider: "#dce4f1"
  line-brand: "#06c755"
  line-brand-dark: "#05a847"
  hero-deep: "#102348"
  footer-deep: "#101d38"
  footer-text: "#eaf0fb"
  footer-muted: "#bfc9da"
  footer-icon: "#78a4ff"
  footer-hover: "#8fb2ff"
  footer-bar: "#91a0b8"
  gallery-placeholder: "#e8edf5"
typography:
  display:
    fontFamily: "Maledpan, Arial, sans-serif"
    fontSize: "clamp(2.15rem, 5vw, 4.8rem)"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  product-display:
    fontFamily: "Maledpan, Arial, sans-serif"
    fontSize: "clamp(2.5rem, 5vw, 4.6rem)"
    fontWeight: 700
    lineHeight: 1.25
  headline:
    fontFamily: "Maledpan, Arial, sans-serif"
    fontSize: "clamp(1.65rem, 3vw, 2.6rem)"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Maledpan, Arial, sans-serif"
    fontSize: "clamp(1.25rem, 2vw, 1.65rem)"
    fontWeight: 700
    lineHeight: 1.25
  body:
    fontFamily: "Maledpan, Arial, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.75
  article:
    fontFamily: "Maledpan, Arial, sans-serif"
    fontSize: "1.08rem"
    fontWeight: 400
    lineHeight: 1.75
  product-lead:
    fontFamily: "Maledpan, Arial, sans-serif"
    fontSize: "clamp(1.12rem, 1.6vw, 1.3rem)"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "Maledpan, Arial, sans-serif"
    fontSize: "16.72px"
    fontWeight: 600
    lineHeight: 1.15
rounded:
  compact: "8px"
  menu: "9px"
  control: "10px"
  gallery: "12px"
  surface: "14px"
  round: "50%"
spacing:
  control-x: "1.15rem"
  control-y: "0.7rem"
  mobile-inset: "18px"
  content-inset: "24px"
  gallery-gap: "12px"
  grid-gap: "1.5rem"
  product-column-min: "3rem"
  product-column-max: "6rem"
  card-min: "1.5rem"
  card-max: "2.4rem"
components:
  button-brand:
    backgroundColor: "{colors.brand-blue}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "{spacing.control-y} {spacing.control-x}"
    height: "46px"
  button-brand-hover:
    backgroundColor: "{colors.brand-blue-dark}"
    textColor: "{colors.paper}"
  button-line-header:
    backgroundColor: "{colors.line-brand}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "7.2px {spacing.control-x}"
    height: "46px"
  button-line-header-hover:
    backgroundColor: "{colors.line-brand-dark}"
    textColor: "{colors.paper}"
  button-line-contact:
    backgroundColor: "{colors.line-brand}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    width: "100%"
    height: "58px"
  menu-toggle:
    backgroundColor: "{colors.brand-blue}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.menu}"
    padding: "0.65rem 0.9rem"
  service-card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.surface}"
    padding: "clamp(1.5rem, 3vw, 2.4rem)"
  product-contact-card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.surface}"
    padding: "clamp(1.6rem, 3vw, 2.25rem)"
---

# Design System: PneumaticTH Trusted Factory Manual

## Overview

**Creative North Star: "The Trusted Factory Manual"**

PneumaticTH feels like a well-kept engineering reference maintained by a real supplier: direct, calm, legible, and grounded in authentic company and industrial evidence. The system refines the established identity rather than replacing it, keeping company context, products, services, and proof ahead of decorative expression.

The visual system is spacious but practical. Maledpan gives both navigation and long Thai content a familiar local voice at a deliberately readable 18px body size. White and pale blue-neutral surfaces provide clarity, PneumaticTH blue carries all ordinary brand interaction, and LINE green appears only where the interface leads directly to LINE. Product pages extend this world with short photographic heroes, concise product evidence, direct company contact, and real delivered-product galleries.

**Key Characteristics:**

- Maledpan across headers and body, with an intentional 18px base size.
- PneumaticTH blue for brand interaction; LINE green reserved for LINE.
- Authentic industrial, company, brand, and delivered-product imagery used as evidence.
- Short product heroes followed by a two-column proof-and-contact decision area.
- LINE remains immediately reachable in the sticky header, including a compact mobile icon.
- Moderate curves, blue-tinted low elevation, and restrained motion.
- Responsive Thai text and technical content without truncation.

## Colors

The palette is a blue-led industrial system: vivid PneumaticTH blue supplies brand energy, cool neutrals support reading, and LINE green has one exclusive meaning.

### Primary

- **PneumaticTH Blue** (`#286ffb`): ordinary links, content actions, icons, keyboard focus, and the mobile menu control.
- **Deep PneumaticTH Blue** (`#1553d1`): hover reinforcement for brand links and buttons.

### Tertiary

- **LINE Signal Green** (`#06c755`): direct LINE actions only, including header and product contact controls.
- **Deep LINE Green** (`#05a847`): hover state for direct LINE actions only.

### Neutral

- **Engineering Ink** (`#17202f`): primary text and navigation.
- **Measured Slate** (`#5c6678`): secondary copy, prompts, and supporting information.
- **Paper White** (`#ffffff`): main reading surface, header, cards, and contact modules.
- **Blueprint Wash** (`#f3f6fb`): low-contrast section separation and the delivered-product proof field.
- **Quiet Blue Divider** (`#dce4f1`): data-table borders and structural hairlines.
- **Hero Deep Blue** (`#102348`): photographic hero fallback and overlay family.
- **Footer Deep Blue** (`#101d38`): grounded footer surface.
- **Footer Light** (`#eaf0fb`): primary footer links.
- **Footer Muted** (`#bfc9da`): secondary footer copy.
- **Footer Icon Blue** (`#78a4ff`): footer contact icons.
- **Footer Hover Blue** (`#8fb2ff`): footer-link hover state.
- **Footer Bar Slate** (`#91a0b8`): low-priority copyright text.
- **Gallery Placeholder Blue** (`#e8edf5`): fallback behind delivered-product imagery.

### Named Rules

**The LINE Green Rule.** Green means a direct LINE destination and nothing else; all non-LINE actions use PneumaticTH blue.

**The Brand Blue Rule.** Use the user-selected `#286ffb` consistently for brand interaction, including visible keyboard focus.

## Typography

**Display Font:** Maledpan (with Arial and generic sans-serif fallbacks)  
**Body Font:** Maledpan (with Arial and generic sans-serif fallbacks)  
**Label Font:** Maledpan (with Arial and generic sans-serif fallbacks)

**Character:** Maledpan is the selected voice for both header and body. Its open Thai forms make the interface feel familiar and readable; one family keeps migrated content coherent while scale, spacing, and synthetic emphasis establish hierarchy.

### Hierarchy

- **Display** (700, `clamp(2.15rem, 5vw, 4.8rem)`, 1.25): primary page and home hero headings.
- **Product Display** (700, `clamp(2.5rem, 5vw, 4.6rem)`, 1.25): left-aligned product titles over short photographic heroes.
- **Headline** (700, `clamp(1.65rem, 3vw, 2.6rem)`, 1.25): major sections; delivered-product headings use the narrower `clamp(1.75rem, 3vw, 2.5rem)` variant.
- **Title** (700, `clamp(1.25rem, 2vw, 1.65rem)`, 1.25): cards and subsections; product contact titles use 1.35rem.
- **Body** (400, 18px, 1.75): the explicit global base for Thai interface and content copy; paragraphs and list items stop at 72ch.
- **Article** (400, 1.08rem, 1.75): long-form technical content.
- **Product Lead** (400, `clamp(1.12rem, 1.6vw, 1.3rem)`, 1.75): opening product proposition.
- **Label** (600, 16.72px, 1.15): header brand and navigation; action labels use 700.

### Named Rules

**The Maledpan Everywhere Rule.** Header, navigation, actions, and body copy use Maledpan; do not reintroduce Noto Thai or a separate display face.

**The Eighteen Pixel Rule.** The 18px body size is a user-selected design token, not a default to shrink during cleanup.

**The Thai Reading Rule.** Preserve generous line-height, natural wrapping, and full text; never compress, truncate, or letter-space Thai copy to force a layout.

## Layout

The shared spatial frame remains centered at a maximum 1180px with 24px desktop insets and 18px mobile insets. Header, hero copy, standard content, product content, home sections, proof headings, and footer align back to this frame even when their backgrounds or imagery run full width.

Product pages at `/pneumatic/`, `/hydraulic/`, and `/filter/` use a short photographic hero between 340px and 510px tall on larger screens, reducing to 320px below 560px. The title sits low and left inside the shared frame over a left-to-right deep-blue overlay. The main product shell begins with responsive vertical space from 3.5rem to 6rem.

The decision area is a two-column grid: product lead, brand evidence, and a contact prompt occupy a flexible 1.12fr left column; a company contact card occupies the .88fr right column with a 340px minimum. The column gap scales from 3rem to 6rem. The product proof section then breaks full width onto blueprint wash and presents real delivered-product imagery in a four-column, 240px-row gallery; the first image spans two columns and two rows.

At 860px and below, the header remains sticky while LINE becomes a 46px icon control beside the menu. The decision area stacks into one column, the contact card follows its prompt, and the proof gallery becomes two columns with 220px rows. At 560px and below, the gallery becomes one column with 270px rows and the first image stops spanning. Tables and other wide technical content remain reachable through bounded overflow.

**The Shared Frame Rule.** Full-width backgrounds may break out, but their headings, copy, controls, and evidence align to the 1180px content frame.

**The Proof Before More Copy Rule.** Product pages move from concise proposition and brand evidence to direct contact and delivered-product proof; do not bury the proof gallery beneath unrelated migrated sections.

## Elevation & Depth

Depth is structural and blue-tinted. Standard white cards use a broad ambient shadow (`0 14px 35px rgba(23,48,92,.1)`), while the product contact card receives a slightly stronger decision-layer shadow (`0 18px 46px rgba(23,48,92,.13)`). The sticky header uses a divider-like shadow (`0 1px 0 var(--line)`), and the expanded mobile navigation uses a firmer panel shadow (`0 16px 30px rgba(20,35,29,.14)`). Product heroes and image-led service cards derive depth from deep-blue photographic overlays; delivered-product images remain flat within clipped frames.

### Shadow Vocabulary

- **Header Divider** (`0 1px 0 var(--line)`): separates the sticky header without making it appear to float.
- **Ambient Card** (`0 14px 35px rgba(23,48,92,.1)`): standard service-card lift.
- **Product Contact** (`0 18px 46px rgba(23,48,92,.13)`): stronger emphasis for the product-page contact decision.
- **Mobile Navigation Panel** (`0 16px 30px rgba(20,35,29,.14)`): identifies the open navigation as an overlay.
- **Image Title** (`0 1px 14px rgba(0,0,0,.28)`): supports white text over photographic service cards.

### Named Rules

**The Shadows Explain Structure Rule.** Use elevation only for cards, overlays, sticky navigation, or a decision-critical contact module; ordinary reading content and galleries stay flat.

## Shapes

The form language remains practical and moderately curved. Large surfaces, media, embeds, and contact cards use 14px corners. Delivered-product frames use 12px, ordinary controls use 10px, and compact header or home LINE controls use 8–9px. The company mark is circular. Borders are quiet and rare, appearing mainly in technical tables, the footer divider, and the translucent home hero action.

**The Moderate Curve Rule.** Keep content surfaces at 14px, proof images at 12px, and controls between 8px and 10px; do not turn the system into pills.

## Components

### Buttons

Buttons are direct, high-contrast, and semantically color-coded.

- **Brand Action:** PneumaticTH blue, white 700-weight label, 10px corners, at least 46px tall, and `0.7rem 1.15rem` padding.
- **LINE Header Action:** LINE green, white label and inline LINE mark, 10px corners, and a 46px minimum height; hover shifts only to deep LINE green.
- **Product LINE Action:** full-width LINE green inside the contact card, 58px tall, 10px corners, and a 1.08rem label.
- **Mobile Header LINE:** 46px square with 9px corners; it retains only the LINE icon while keeping the full accessible name.
- **Hover / Focus:** buttons lift 1px over 200ms on hover; all focus-visible states use a 3px PneumaticTH-blue outline with 3px offset.

### Cards / Containers

- **Service Cards:** 14px white surfaces with responsive 1.5rem–2.4rem padding and the ambient card shadow; photographic home service cards use real industrial images under a dark blue gradient.
- **Product Contact Card:** a 14px white surface with responsive 1.6rem–2.25rem padding and stronger decision-layer elevation. Company identity, address, phone, email, map, and LINE remain together.
- **Internal Icons:** small engineering-ink contact icons; blue icons denote ordinary brand or service information.

### Navigation

The sticky white header uses a three-part desktop grid: company mark, three centered product-category links, and the LINE action. Brand and navigation labels use Maledpan at 16.72px; links are engineering ink at rest and PneumaticTH blue on hover. At 860px, navigation moves into a stacked white disclosure panel, the menu becomes a blue text control, and a compact LINE icon remains visible beside it.

### Product Hero

Product heroes are short evidence-led banners, not home-page-scale campaigns. Use the retained industrial photograph, slightly reduced saturation, a deep-blue left-to-right overlay, and one large left-aligned product title near the lower edge. The image loads eagerly because it is the primary page image.

### Product Proof and Contact

The product lead, brand image, muted sales prompt, contact card, and delivered-product proof gallery form one continuous decision system. Preserve the migrated factual copy and contact destinations. The proof heading and note are concise, and gallery imagery uses `object-fit: cover` with only a restrained 1.025 hover scale over 250ms.

### Technical Content

Tables fill the available width and become horizontally scrollable; cells use 0.75rem padding and quiet divider borders. Video iframes remain 16:9, cap at 900px, and use 14px corners. Retained embeds, objects, outbound links, product brand images, and authored media keep their original targets and proportions.

## Do's and Don'ts

### Do:

- **Do** use Maledpan for both header and body and preserve the intentional 18px base size.
- **Do** use `#286ffb` for ordinary brand interaction and reserve green for direct LINE actions.
- **Do** keep LINE visible in the sticky header on desktop and mobile.
- **Do** build product pages from a short photographic hero, concise evidence, direct contact, and a real delivered-product gallery.
- **Do** preserve original copy, href values, phone numbers, outbound links, and video or PDF embed targets exactly.
- **Do** keep authentic product and company imagery correctly cropped, responsive, and meaningfully alt-labeled.
- **Do** honor reduced-motion preferences, including static customer logos and effectively removed transitions.

### Don't:

- **Don't** reintroduce Noto Thai, reduce the 18px body token, or substitute a generic corporate type hierarchy.
- **Don't** use green for product links, generic buttons, icons, success decoration, or anything that does not lead to LINE.
- **Don't** turn product heroes into full-screen campaigns or center their titles over the image.
- **Don't** replace delivered-product proof with stock imagery, invented claims, testimonials, pricing, or performance data.
- **Don't** hide the mobile LINE action inside the navigation disclosure.
- **Don't** truncate Thai text, force narrow fixed widths, or clip wide technical content outside the viewport.
- **Don't** rewrite factual claims or alter tracked, outbound, contact, or embed destinations for visual convenience.
