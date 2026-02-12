# MUMUSO LOYALTY APP — UI DESIGN SPECIFICATION
### *A Premium Membership Experience*

---

> **Design Philosophy**: This app should feel like walking into a beautifully lit minimalist boutique — calm, confident, and premium. Not loud. Not colorful. Just quietly impressive. Every screen should feel considered, every interaction should feel satisfying, and every user should feel like a valued member — not just another customer.

---

## 01. DESIGN DIRECTION

### The Core Idea: **"Quiet Luxury"**

Forget everything you've seen in loyalty apps — the confetti, the coin animations, the aggressive reds and oranges screaming "SAVE NOW!". This app takes the opposite direction.

Think: **Matte black card. Soft glow. Clean type. Intentional space.**

The design borrows from:
- **Premium banking apps** (calm, trusted, structured)
- **Luxury hotel digital experiences** (generous space, refined typography)
- **Japanese minimalist aesthetics** (nothing is placed without purpose)
- **Modern fintech** (data presented beautifully, not cluttered)

The user should open this app and feel: *"This is different. This feels premium."*

---

### Design Personality

| Trait | Approach |
|-------|----------|
| **Tone** | Calm, confident, trustworthy |
| **Feel** | Premium, soft, refined |
| **Energy** | Understated, not loud |
| **Density** | Spacious, never cluttered |
| **Motion** | Smooth, purposeful, not flashy |
| **Color** | Near-monochrome with one warm accent |

---

## 02. COLOR SYSTEM

### Philosophy
The palette is built on **near-neutrals** — deep charcoals, warm off-whites, and soft grays — with a single warm accent that appears sparingly and meaningfully. Think of it as a black and white photograph with one element in color.

---

### Core Palette

```
── BACKGROUNDS ──────────────────────────────────────────────

  Canvas (main bg)         #F5F3F0      Warm off-white, never pure white
  Surface (cards)          #FFFFFF      Pure white for cards on warm bg
  Surface Raised           #FAFAF8      Subtle card elevation
  Surface Dark             #1C1C1E      Near-black (used in dark zones)

── TEXT ─────────────────────────────────────────────────────

  Text Primary             #1A1A1A      Almost black, never pure black
  Text Secondary           #6B6B6B      Soft gray, secondary info
  Text Tertiary            #9E9E9E      Hints, labels, placeholders
  Text Inverted            #F5F3F0      Text on dark backgrounds

── ACCENT (USE SPARINGLY) ───────────────────────────────────

  Accent Gold              #C8A96E      Warm gold — the ONE signature color
  Accent Gold Light        #F0E4C8      Pale gold, for subtle tints
  Accent Gold Dark         #A07840      Deeper gold, for pressed states

── FUNCTIONAL ───────────────────────────────────────────────

  Success                  #4A9B7F      Muted green (not neon)
  Error                    #C0544A      Muted red (not alarming)
  Warning                  #C08040      Amber (consistent with warm palette)
  Info                     #5A7FA0      Muted blue

── BORDERS & DIVIDERS ───────────────────────────────────────

  Border Subtle            #E8E5E0      Barely-there dividers
  Border Default           #D4D0C8      Standard borders
  Border Strong            #B0AA9E      Emphasized borders

── MEMBERSHIP CARD GRADIENT ─────────────────────────────────

  Card Start               #1C1C1E      Deep charcoal
  Card Mid                 #2C2C30      Slightly lifted
  Card Accent              #3A3228      Subtle warm undertone
  Card Shimmer             #C8A96E      Gold shimmer overlay
```

---

### Dark Mode Palette (Auto-switches with system)

```
  Canvas                   #0F0F0F      True dark, not gray
  Surface                  #1C1C1E      Raised surface
  Surface Raised           #252528      Even more raised
  Text Primary             #F0EDE8      Warm white
  Text Secondary           #9E9B96      Muted warm gray
  Border Subtle            #2A2A2D      Nearly invisible borders
  Accent Gold              #D4B87C      Slightly brighter in dark mode
```

---

### How to Use Color

**✅ DO:**
- Use warm white (`#F5F3F0`) as the main background — never cold white
- Apply gold accent only on: active states, savings amounts, premium indicators
- Let large sections breathe with solid neutral backgrounds
- Use dark surface (`#1C1C1E`) only for the membership card and hero zones
- Keep text hierarchy strict: primary, secondary, tertiary — no exceptions

**❌ DON'T:**
- Use bright green for discounts (use muted success green or gold instead)
- Add gradient backgrounds to regular screens
- Use the accent color for more than 3 elements on one screen
- Apply colored backgrounds to form inputs
- Use more than 2 text colors on any single component

---

## 03. TYPOGRAPHY

### Font Choices

```
── DISPLAY FONT ─────────────────────────────────────────────
  Family:    "Cormorant Garamond"
  Style:     Serif with elegant proportions
  Use for:   Membership card name, hero numbers, large headings
  Fallback:  Georgia, serif
  Why:       Conveys premium, historical weight, rare in apps

── HEADING FONT ─────────────────────────────────────────────
  Family:    "DM Sans"
  Style:     Geometric sans-serif, slightly round
  Use for:   Screen titles, section headers, navigation labels
  Fallback:  'Helvetica Neue', sans-serif
  Why:       Modern but friendly, excellent legibility at all sizes

── BODY FONT ────────────────────────────────────────────────
  Family:    "DM Sans" (same as heading, different weight)
  Style:     Regular weight, relaxed tracking
  Use for:   Descriptions, form labels, list items
  Fallback:  'Helvetica Neue', sans-serif

── MONO/DATA FONT ───────────────────────────────────────────
  Family:    "JetBrains Mono" or "IBM Plex Mono"
  Style:     Monospace, clean
  Use for:   Member ID, transaction IDs, QR code label
  Why:       Makes data feel technical and trustworthy
```

---

### Type Scale

```
── SIZE SCALE ───────────────────────────────────────────────

  Display    48px / 56px line-height / Cormorant Garamond Bold
             → Used for: Member name on card, savings hero number

  H1         32px / 40px line-height / DM Sans SemiBold
             → Used for: Main screen titles

  H2         24px / 32px line-height / DM Sans SemiBold
             → Used for: Section headers within screens

  H3         20px / 28px line-height / DM Sans Medium
             → Used for: Card titles, modal headers

  H4         17px / 24px line-height / DM Sans Medium
             → Used for: List item titles, sub-section labels

  Body L     16px / 24px line-height / DM Sans Regular
             → Used for: Primary body copy

  Body M     14px / 20px line-height / DM Sans Regular
             → Used for: Secondary descriptions, help text

  Caption    12px / 16px line-height / DM Sans Regular
             → Used for: Timestamps, metadata, footnotes

  Label      11px / 14px line-height / DM Sans Medium (UPPERCASE)
             → Used for: Navigation labels, tags, status badges
             → Letter spacing: 0.08em (wide tracking)

  Mono       14px / 20px line-height / JetBrains Mono Regular
             → Used for: IDs, codes, transaction numbers
```

---

### Typography Rules

**Hierarchy is everything:**
- Each screen must have exactly ONE H1
- Supporting text must be visually smaller, lighter, or less prominent
- Never use bold for body text — use size and color instead

**Spacing around text:**
- Headings always have more space above than below
- Related text elements are tightly grouped
- Unrelated elements have generous space between them

**Line length:**
- Body text: 40–65 characters per line maximum
- Use padding to enforce this on wide screens

---

## 04. SPACING & LAYOUT

### The 8px Grid

Every spacing value is a multiple of 8:
```
  4px    →  Micro spacing (icon-to-label gaps, etc.)
  8px    →  XS (tight internal padding)
  16px   →  SM (standard element spacing)
  24px   →  MD (card internal padding, section padding)
  32px   →  LG (between major sections)
  48px   →  XL (top-of-screen padding, hero space)
  64px   →  XXL (generous hero zones)
```

---

### Screen Layout Structure

```
┌─────────────────────────────────────┐
│  STATUS BAR                         │  ← System, transparent
│                                     │
│  ← NAVIGATION BAR (64px)            │  ← Back btn, title, actions
│                                     │
│  ╔═══════════════════════════════╗  │
│  ║                               ║  │  ← HERO ZONE (variable)
│  ║   Primary visual / card       ║  │    Full-bleed, often dark
│  ║   Membership QR / Stat        ║  │    Card or gradient
│  ╚═══════════════════════════════╝  │
│                                     │
│  CONTENT ZONE (scrollable)          │  ← Standard 24px padding
│  ─────────────────────────────────  │    Warm off-white background
│  Section 1                          │    Cards float on this
│  ─────────────────────────────────  │
│  Section 2                          │
│  ─────────────────────────────────  │
│                                     │
│                                     │
│  ████████████████████████████████  │  ← BOTTOM TAB BAR (80px)
└─────────────────────────────────────┘
```

---

### Card Anatomy

```
┌────────────────────────────────────────┐
│ ←24px padding                          │
│                                        │
│  EYEBROW TEXT (Label style, gold)  12px│  ← Optional category label
│  Card Title                        20px│  ← H3
│  Supporting description            14px│  ← Body M, secondary color
│                                        │
│  ───────────────────────────────────  │  ← Divider: 1px #E8E5E0
│                                        │
│  Metric 1         Metric 2             │  ← Side-by-side data
│                                        │
│                            CTA →  14px │  ← Right-aligned action
│                                   24px→│
└────────────────────────────────────────┘
  Border-radius: 20px
  Shadow: 0 2px 16px rgba(0,0,0,0.06)
  Background: #FFFFFF
```

---

## 05. COMPONENT LIBRARY

### 5.1 Buttons

**Primary Button — "The Action Button"**
```
Visual:
  Background: #1A1A1A (dark, confident)
  Text: #F5F3F0 (warm white)
  Font: DM Sans SemiBold, 15px
  Letter-spacing: 0.02em
  Height: 56px
  Border-radius: 14px
  Padding: 0 28px
  Shadow: 0 4px 16px rgba(26,26,26,0.18)

States:
  Hover:    Background lifts to #2C2C2C + subtle shadow increase
  Pressed:  Scale 0.97, shadow reduces
  Loading:  Text hides, thin spinner appears (gold color)
  Disabled: Opacity 0.35, no shadow, cursor blocked

Transitions:
  All: 200ms cubic-bezier(0.34, 1.56, 0.64, 1)
  (Slight spring bounce on hover in)
```

**Secondary Button — "The Ghost Button"**
```
Visual:
  Background: Transparent
  Border: 1.5px solid #D4D0C8
  Text: #1A1A1A
  Font: DM Sans Medium, 15px
  Height: 56px
  Border-radius: 14px

States:
  Hover: Border color darkens to #1A1A1A
  Pressed: Background tints to rgba(0,0,0,0.03)
```

**Gold Accent Button — "The Premium Action"**
```
Use for: Membership purchase, renewal, premium CTAs ONLY
Visual:
  Background: Linear gradient → #C8A96E to #A07840
  Text: #FFFFFF
  Font: DM Sans SemiBold, 15px
  Letter-spacing: 0.03em
  Height: 56px
  Border-radius: 14px
  Shimmer effect: Animated light sweep on load
```

**Text Button — "The Subtle Link"**
```
Visual:
  Background: None
  Text: #6B6B6B
  Font: DM Sans Medium, 14px
  Underline: None (underline only on press)
  Padding: 8px 0 (tap-safe height)
```

**Icon Button — "The Control"**
```
Visual:
  Size: 44x44px touch target
  Icon container: 36x36px, border-radius: 10px
  Background: #F0EDE8 (warm light gray)
  Icon: 20px, color #1A1A1A
  States: Hover → #E8E4DC, Pressed → scale 0.94
```

---

### 5.2 Input Fields

**Standard Input — "The Refined Field"**
```
Visual:
  Height: 56px
  Border-radius: 14px
  Background: #FFFFFF
  Border: 1.5px solid #E8E5E0
  Padding: 0 20px
  Font: DM Sans Regular, 16px
  Color: #1A1A1A
  Placeholder: DM Sans Regular, 16px, #9E9E9E

  Label (above field):
    Font: DM Sans Medium, 12px, UPPERCASE
    Color: #9E9E9E
    Letter-spacing: 0.08em
    Margin-bottom: 8px

  Focused State:
    Border: 1.5px solid #1A1A1A
    Shadow: 0 0 0 3px rgba(26,26,26,0.06)

  Error State:
    Border: 1.5px solid #C0544A
    Shadow: 0 0 0 3px rgba(192,84,74,0.08)
    Error text below: DM Sans Regular, 12px, #C0544A

  Success State (verified):
    Border: 1.5px solid #4A9B7F
    Checkmark icon on right side

  Password Field:
    Eye icon (right side, 20px)
    Tap to toggle visibility
```

**OTP Input — "The Code Boxes"**
```
Visual:
  6 individual boxes
  Each box: 52x60px
  Border-radius: 12px
  Background: #FFFFFF
  Border: 1.5px solid #E8E5E0
  Font: DM Sans SemiBold, 24px, centered
  Gap between boxes: 10px

  Active box:
    Border: 1.5px solid #1A1A1A
    Faint shadow
    Slight scale up: 1.04

  Filled box:
    Background: #F5F3F0
    Border: 1.5px solid #D4D0C8
```

**Search Input — "The Floating Bar"**
```
Visual:
  Height: 48px
  Border-radius: 24px (pill shape)
  Background: #FFFFFF
  Shadow: 0 2px 12px rgba(0,0,0,0.06)
  Border: none (shadow defines edge)
  Padding: 0 20px
  Search icon: left side, 18px, #9E9E9E
  Clear button: right side, appears when text entered
  Font: DM Sans Regular, 15px
```

---

### 5.3 Cards

**Standard Content Card**
```
  Background: #FFFFFF
  Border-radius: 20px
  Shadow: 0 2px 16px rgba(0,0,0,0.06)
  Padding: 24px
  Margin-bottom: 12px

  → On press: Scale 0.98, shadow lightens
  → Transition: 180ms ease
```

**Membership Card — "The Hero Card"**
```
Size: Full width, 200px height (landscape)
      or 240px (portrait/tall mode)

Visual Treatment:
  Background: Linear gradient
    135deg: #1C1C1E → #2C2C2E → #1C1C1E
  + Subtle noise texture overlay (opacity 3%)
  + Gold shimmer line (diagonal, animated, subtle)
  Border-radius: 24px
  Padding: 28px

Content layout:
  ┌─────────────────────────────────────────┐
  │  MUMUSO MEMBER         [status badge]   │
  │  Cormorant 11px, gold  Active ●         │
  │                                         │
  │                                         │
  │  Ahmed Khan                             │
  │  Cormorant 26px, #F0EDE8                │
  │                                         │
  │  MUM · 12345           Valid Until      │
  │  Mono 13px, #9E9B96    Jan 2026         │
  │                         14px #9E9B96    │
  └─────────────────────────────────────────┘

Back of card (tap to flip — 3D flip animation):
  Shows QR code centered, large
  Member ID below QR
  "Show to cashier at checkout" in Label style
  Brightness auto-increases to 100%

Card material feel:
  Faint holographic shimmer when phone tilts (gyroscope)
  Very subtle, elegant
```

**Stat Card — "The Data Tile"**
```
Size: (screenWidth - 48px) / 2 = half width pair
      or full width for featured stat

Visual:
  Background: #FFFFFF
  Border-radius: 20px
  Shadow: 0 2px 12px rgba(0,0,0,0.05)
  Padding: 20px

Content:
  Eyebrow label: 11px, uppercase, #9E9E9E, 0.08em spacing
  Number: 32px, DM Sans SemiBold, #1A1A1A
  Supporting text: 13px, #6B6B6B

Example:
  TOTAL SAVED
  Rs. 1,250
  This year
  (savings number in #C8A96E gold)
```

**Transaction Card — "The History Row"**
```
Style: Horizontal list item, NOT a full card
Height: 72px
Separator: 1px #E8E5E0 (inset, not full width)

Layout:
  [Store icon/avatar 40px] [Store name + date] [Amount right-aligned]
                            Bold 15px            Rs. 2,250
                            Secondary 12px      -Rs. 250 (gold)

Store avatar:
  Circle, 40px
  Background: gradient from store category color
  Initial letter of store name, white
```

**Notification Card**
```
Unread:
  Left border: 3px solid #C8A96E
  Background: #FAFAF8
  Title: DM Sans SemiBold

Read:
  No left border
  Background: #FFFFFF
  Title: DM Sans Regular
  Opacity of icon: 0.5
```

---

### 5.4 Navigation

**Bottom Tab Bar — "The Dock"**
```
Visual:
  Background: rgba(255,255,255,0.92)
  Backdrop blur: 20px (frosted glass)
  Border-top: 1px solid rgba(0,0,0,0.06)
  Height: 80px (includes safe area)
  Padding-bottom: safe area inset

Tab Items (4 total):
  Icon: 24px
  Label: 10px, DM Sans Medium, uppercase, 0.06em tracking
  Gap between icon and label: 4px

  Inactive: Icon #B0AA9E, Label #B0AA9E
  Active:   Icon #1A1A1A, Label #C8A96E (gold label only)

  Active indicator:
    NOT a background pill (too conventional)
    Instead: 3px wide, 20px long horizontal line
    Above icon, centered
    Color: #C8A96E
    Appears with spring animation

Tab icons (custom, not standard):
  Home:     Rounded square outline
  Card:     ID card outline
  History:  Layered papers outline
  Profile:  Person circle outline
```

**Top Navigation Bar**
```
Height: 56px
Background: Transparent (content scrolls under)
            Frosted white when scrolled down

Back button:
  Icon: Chevron left (not arrow)
  Size: 18px
  Color: #1A1A1A
  Touch target: 44x44px
  No background circle (clean look)

Title:
  DM Sans SemiBold, 17px
  Centered
  Fades in as user scrolls (on scroll-heavy screens)

Right actions:
  1-2 icon buttons max
  Icon button style (see 5.1)
```

**In-Screen Section Header**
```
  Label: DM Sans Medium, 12px, uppercase, 0.08em tracking
  Color: #9E9E9E
  Padding: 24px 24px 12px 24px
  No background, no borders
  Just careful spacing
```

---

### 5.5 Badges & Tags

**Status Badge**
```
Active:
  Background: rgba(74,155,127,0.12)   (muted green tint)
  Text: #4A9B7F
  Font: DM Sans SemiBold, 11px, uppercase
  Padding: 4px 10px
  Border-radius: 6px
  Dot before text: 6px circle, same green

Expired:
  Background: rgba(192,84,74,0.10)
  Text: #C0544A
  Same specs

Expiring Soon:
  Background: rgba(192,128,64,0.12)
  Text: #C08040
  Same specs
```

**Discount Badge**
```
  Background: rgba(200,169,110,0.15)  (gold tint)
  Text: #A07840
  Font: DM Sans SemiBold, 12px
  Padding: 4px 10px
  Border-radius: 6px
  Example: "-10%"
```

---

### 5.6 Empty States

**Philosophy**: Empty states are opportunities to communicate, not just placeholders.

```
Each empty state has:
  1. A simple line illustration (not colorful, 1-2 color lines only)
  2. A short, warm headline (not robotic)
  3. One line of helpful description
  4. One optional CTA button

Examples:

  No transactions yet:
    Illustration: Line drawing of a shopping bag, receipt floating
    Headline: "Your first purchase awaits"
    Body: "When you shop, your history will appear here"
    CTA: "Find a Store"

  No notifications:
    Illustration: Bell with gentle lines radiating
    Headline: "All quiet here"
    Body: "We'll let you know when something important comes up"
    No CTA

  Expired membership:
    Illustration: Calendar with clock
    Headline: "Your membership has rested"
    Body: "Renew to unlock 10% savings on every purchase"
    CTA: "Renew Now" (gold button)
```

---

### 5.7 Loading States

**Skeleton Screens**
```
  Color: Linear gradient animation
  From: #F0EDE8
  To: #E5E0D8
  Animation: Shimmer, 1.4s, infinite, ease-in-out
  Border-radius: Matches the real component it replaces

  NEVER show a spinner for full-screen loading
  ALWAYS show skeleton that matches the real layout
```

**Button Loading**
```
  Text fades out (opacity 0)
  Thin circular spinner fades in (centered)
  Spinner color: #C8A96E (gold)
  Spinner size: 20px
  Stroke width: 2px
  Rotation: 600ms linear infinite
```

**Inline Loading** (for search, API calls)
```
  3 dots, pulsing in sequence
  Color: #9E9E9E
  Each dot: 5px circle
  Gap: 4px
  Animation: Scale 0.6 → 1.0 → 0.6, 600ms staggered
```

---

## 06. SCREEN-BY-SCREEN DESIGN SPEC

### Screen 01 — Splash Screen

```
Background: #1C1C1E (dark)

Center of screen:
  Mumuso wordmark
  Font: Cormorant Garamond Bold, 38px
  Color: #F0EDE8 (warm white)
  Letter-spacing: 0.15em (wide, luxury feel)

Below wordmark:
  Thin gold line: 32px wide, 1px tall, #C8A96E
  Margin-top: 16px

Below line:
  "MEMBER" text
  Font: DM Sans Medium, 10px, uppercase
  Color: #9E9B96
  Letter-spacing: 0.2em

Animation sequence:
  0ms:    Screen fully dark
  200ms:  Wordmark fades in (600ms ease)
  600ms:  Gold line draws from center out (400ms ease)
  900ms:  "MEMBER" text fades in (400ms ease)
  1800ms: Begin transition to next screen (fade to warm white)

Version number:
  Bottom center, 10px, #6B6B6B
  "v1.0.0"
```

---

### Screen 02 — Onboarding (3 slides)

**Layout concept**: Full-screen slides with large illustration zone (top 55%) and content zone (bottom 45%). No carousel dots — instead a thin progress line that fills across.

```
Top Zone (55% height):
  Background: #F5F3F0 (warm off-white)
  Contains: Simple, elegant line illustration
    Style: Single-line continuous drawing (one stroke)
    Color: #1C1C1E (dark)
    Accent: One element in #C8A96E (gold)
    No fills, just lines — editorial style

  Illustrations:
    Slide 1: Minimalist shopping scene (bag, person, coins)
    Slide 2: Phone with QR, scanner beam
    Slide 3: Chart/graph showing savings growth

Bottom Zone (45% height):
  Background: #FFFFFF
  Border-radius: 32px 32px 0 0 (rounds up over top zone)
  Padding: 32px 28px 48px

  Content:
    Slide indicator: Thin progress bar at very top
      Height: 2px
      Background: #E8E5E0
      Fill: #1A1A1A (left to right)
      Animates as slides progress

    Small label (uppercase):
      "BENEFIT 01" / "BENEFIT 02" / "BENEFIT 03"
      11px, DM Sans Medium, gold, 0.1em tracking

    Headline:
      32px, DM Sans SemiBold, #1A1A1A
      Two lines max
      Margin-top: 12px

    Description:
      15px, DM Sans Regular, #6B6B6B
      Line-height: 1.6
      Max 2 lines
      Margin-top: 12px

    Navigation:
      Bottom row, space-between
      Left: "Skip" text button → gray, 14px
      Right: Large circular button → #1A1A1A, chevron right, 52px circle

  Slide transitions:
    Content: Slide + fade (300ms cubic-bezier spring)
    Illustration: Slow cross-fade (500ms ease)
    Progress bar: Smooth fill (300ms ease)
```

---

### Screen 03 — Auth Gateway (Login / Register choice)

```
Background: #F5F3F0 (warm off-white)

Top half (illustration zone):
  Large elegant graphic or abstract shapes
  Warm tones: beige, cream, soft gold
  Height: 45% of screen
  Bleeds to edges

Bottom half (content):
  Background: #FFFFFF
  Border-radius: 32px 32px 0 0
  Padding: 36px 28px 40px

  Mumuso mark:
    Small, centered
    Font: Cormorant, 22px, #1A1A1A
    Letter-spacing: 0.15em
    Margin-bottom: 8px

  Tagline:
    "Save smarter. Every visit."
    Font: DM Sans Regular, 16px, #6B6B6B
    Centered
    Margin-bottom: 40px

  Primary CTA:
    "Create Account" → Primary button (full width, dark)
    Margin-bottom: 12px

  Secondary CTA:
    "I Already Have an Account" → Ghost button (full width)

  Bottom text:
    "By continuing, you agree to our Terms of Service"
    11px, #9E9E9E, centered, tappable links in gold
    Margin-top: 24px
```

---

### Screen 04 — Registration

```
Background: #F5F3F0

Top nav:
  Back button (left)
  No title (title is in content)

Scroll container (padding: 0 24px):

  Header section:
    Margin-top: 32px
    Small label: "STEP 1 OF 2" (if multi-step) — 11px, gold, uppercase
    H1: "Create Your Account"
      32px, DM Sans SemiBold, #1A1A1A
      Margin-top: 8px
    Subtext: "Join thousands of members saving every day"
      15px, #6B6B6B
      Margin-top: 8px

  Form (sections grouped):

    Section 1: Personal Details
      Grouped inside white card (border-radius 20px, padding 20px)

      Fields stacked:
        Full Name (input)
        ─────── divider (1px, #E8E5E0) ───────
        Phone Number (input with +92 prefix)
        ─────── divider ───────
        Email Address (input)

      Note: Group related fields inside one card, NOT individual cards

    Section 2: Profile Details
      Same card style
      Date of Birth (input → opens date wheel)
      ─────── divider ───────
      Gender (dropdown — appears as a row with chevron)
      ─────── divider ───────
      City (dropdown — same style)

    Section 3: Security
      Password input
      ─────── divider ───────
      Confirm Password input
      Password strength bar (below confirm field, 4 segments)

    Terms section:
      NOT a checkbox (too conventional)
      Instead: inline text with tappable links
      "By creating account you agree to our Privacy Policy and Terms of Use"
      14px, #6B6B6B
      "Privacy Policy" and "Terms of Use" in gold
      Required — show error if not acknowledged on submit

    CTA:
      "Continue" → Primary button (full width)
      Fixed to bottom (not scrolling)
      Floats above content with blur shadow

  Keyboard behavior:
    Screen scrolls up when keyboard appears
    Active field always visible
    Submit button stays pinned to top of keyboard
```

---

### Screen 05 — OTP Verification

```
Background: #F5F3F0

Content (centered, not top-aligned):
  Margin-top: 64px

  Illustration:
    Simple line drawing of phone with signal waves
    Height: 140px, centered
    Color: #1A1A1A

  Headline: "Verify Your Number"
    H1 style, centered

  Description:
    "We sent a 6-digit code to"
    Bold: "+92 312 ****567"
    Centered, Body L, #6B6B6B
    Margin-top: 12px

  "Change number" link:
    Small text, gold, centered, tappable
    Margin-top: 8px

  OTP boxes (see component 5.2):
    Margin-top: 40px
    Centered as group

  Resend section:
    Margin-top: 32px, centered
    "Resend code in 0:59"
    When timer ends: "Resend Code" gold text button appears

  Auto-submit:
    When all 6 digits entered, submits without button tap
    Shows loading state in boxes (shimmer animation)

  Error handling:
    Boxes shake (horizontal wiggle animation)
    "Incorrect code" appears below, red small text
    Boxes clear, ready for re-entry
```

---

### Screen 06 — Home Dashboard

```
NAVIGATION BAR:
  Left: Mumuso wordmark (small, 18px Cormorant, gold)
  Right: Notification icon button + Profile avatar (32px circle)

HERO ZONE — Membership Card (full width, 24px horizontal margin):
  The dark membership card floats here
  (Full design spec in card component section)
  Card has gentle shadow on warm background
  Tap card front → flip to QR side (3D flip, 500ms)
  "Tap to show QR code" label below card in caption style

QUICK STATS (below card, 16px margin-top):
  Two stat tiles side by side:
  Left:  "TOTAL SAVED" / Rs. 1,250 (gold) / This year
  Right: "PURCHASES" / 15 / This membership year

QUICK ACTIONS (horizontal scroll, 24px margin-top):
  Label: "QUICK ACTIONS" (section header style)

  Pill-shaped action chips (not cards):
    Height: 44px
    Border-radius: 22px
    Background: #FFFFFF
    Border: 1.5px solid #E8E5E0
    Shadow: subtle
    Padding: 0 20px
    Content: [Icon 16px] [Label 13px DM Sans Medium]
    Gap between chips: 8px
    Scroll horizontally, no pagination

  Actions:
    🏪 Find Store
    🔔 Notifications
    📋 Full History
    💳 Payment Methods
    🎁 Refer a Friend
    ❓ Help

RECENT ACTIVITY (24px margin-top):
  Section header: "RECENT ACTIVITY"

  Last 3 transactions (transaction row style)
  Clean, minimal rows
  "View all history →" gold text link at bottom

  If no transactions:
    Empty state (see 5.6)

BOTTOM TAB BAR: (sticky, frosted)
```

---

### Screen 07 — Membership Card (Full Screen)

```
Background: #0F0F0F (very dark — makes card pop)

Status bar: Light content (white icons)

CARD DISPLAY:
  Card centered on screen
  Width: screenWidth - 48px
  Height: 260px
  The premium dark card with gold shimmer

  FRONT (default):
    Member name: Cormorant 28px, warm white
    Member ID: Mono 14px, muted
    Status: Active badge (green)
    Valid until: Caption, muted

  BACK (tap to flip):
    3D CSS flip animation: 500ms, ease
    Shows QR code: centered, 180x180px
    QR background: pure white square with 16px padding
    QR border-radius: 12px
    Member ID below QR: Mono 15px, #F0EDE8
    "SHOW TO CASHIER" label: 11px, gold, uppercase, 0.15em tracking

  Gyroscope tilt:
    Card gently tilts to match phone orientation
    Gold shimmer layer parallaxes slightly
    Max tilt: 8 degrees

BELOW CARD:
  Three action buttons in a row:
  [Save to Photos] [Add to Wallet] [Share]
  Icon + text, ghost buttons
  On dark background: border color #3A3A3D, text #F0EDE8

BRIGHTNESS:
  Screen auto-brightens to 100% when this screen opens
  Resets on screen exit

HELP LINK (bottom):
  "QR not scanning? Get help"
  12px, #9E9B96, centered, tappable
```

---

### Screen 08 — Purchase History

```
NAVIGATION: "Purchase History" title, filter icon (right)

SUMMARY STRIP (below nav, before scroll):
  Background: White
  Horizontal scroll of 3 summary chips:
  [Total Spent: Rs. 45,000] [Total Saved: Rs. 4,500] [Visits: 23]
  Chip style: white card, rounded, gentle shadow
  Numbers in gold for savings

FILTER BAR (sticky when scrolled):
  Horizontal scroll of filter pills:
  [All] [Last 30 Days] [Last 3 Months] [By Store]
  Pill style:
    Inactive: #F0EDE8 background, #6B6B6B text
    Active: #1A1A1A background, #FFFFFF text

TRANSACTION LIST:
  Grouped by date:

  Date header (section label style):
    "TODAY" / "YESTERDAY" / "15 JANUARY 2024"
    Label: 11px, uppercase, #9E9E9E, no background
    Padding: 16px 24px 8px

  Transaction rows inside white card (no separator cards):
    The whole day's transactions share one white card
    Rows separated by 1px internal dividers

    Each row:
    [Store initial circle] [Store name + time] [Amounts right-side]
    42px avatar            Bold 15px           Rs. 2,250 bold
                           12px, #9E9E9E        -Rs. 250 gold

    Tap → Slide in Transaction Detail (sheet or push)

EMPTY STATE: See component 5.6

LOAD MORE:
  Not a button — infinite scroll
  Skeleton rows appear at bottom while loading
```

---

### Screen 09 — Transaction Detail

```
PRESENTATION: Bottom Sheet slide-up (not full navigation)
Corner radius: 24px top corners

HANDLE BAR:
  32px wide, 4px tall
  Color: #D4D0C8
  Centered, top of sheet
  Margin-top: 12px

RECEIPT DESIGN (inside scrollable content):
  Styled like a physical receipt but elevated

  Store Header:
    Store name: H2, DM Sans SemiBold
    Address: 13px, #6B6B6B
    Date/Time: 12px, #9E9E9E, right-aligned

  ─ ─ ─ ─ (dashed separator — receipt style) ─ ─ ─ ─

  Item List:
    Each item row:
    [Item name 15px] [Qty × Price right-aligned]
    Clean, no bullets, no borders

  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─

  Calculation:
    Subtotal:          Rs. 2,500
    Member Discount:   - Rs. 250    ← gold color, highlight
    ───────────────────────────
    Total Paid:        Rs. 2,250    ← bold

  SAVINGS CALLOUT:
    Small card inside receipt:
    Background: rgba(200,169,110,0.10) (gold tint)
    Border-left: 3px solid #C8A96E
    "You saved Rs. 250 with your membership"
    Text: 14px, #A07840
    Icon: small star or coin

  Payment Method row:
    Icon + "Paid with Cash" / "Paid with JazzCash"
    13px, #6B6B6B

  Transaction ID:
    "TXN · 20240115001"
    Mono 12px, #9E9E9E
    Bottom of receipt

ACTION BUTTONS (bottom, sticky):
  [Download PDF]  [Share Receipt]
  Two ghost buttons, side by side
  "Report an issue" text button below
```

---

### Screen 10 — Membership Purchase

```
VISUAL CONCEPT: This is the most important conversion screen.
It should feel premium, worth paying for.

HERO SECTION (top, dark background):
  Background: #1C1C1E
  Padding: 48px 28px 40px
  Height: ~40% of screen

  Eyebrow: "MUMUSO MEMBERSHIP" — 11px, gold, uppercase, tracking
  Headline: "One payment.\nA year of savings."
  Font: Cormorant Garamond, 38px, #F0EDE8
  Line-height: 1.2

  Price:
    "Rs. 2,000 / year" — DM Sans, 20px, #F0EDE8
    Below: "Rs. 167 per month" — 14px, #9E9B96

CONTENT SECTION (scrollable, warm white background):
  Border-radius: 32px 32px 0 0 (lifts over hero)
  Padding: 28px 24px

  BENEFITS LIST:
    Not bullet points — elegant check rows
    Each benefit:
      [Gold checkmark 16px] [Benefit text 15px DM Sans]
      Spacing: 16px between each
      Divider: none (use spacing)

    Benefits:
      ✓  10% off on all eligible purchases
      ✓  Valid at all Mumuso stores in Pakistan
      ✓  Digital membership card on your phone
      ✓  Full purchase history & savings tracker
      ✓  Early access to special member offers

  SAVINGS CALCULATOR (optional widget):
    Background: #F5F3F0
    Border-radius: 16px
    Padding: 20px
    Margin-top: 24px

    Label: "See your savings"
    Slider: "I spend Rs. ___ per month"
    Slider style: Dark track, gold thumb
    Result: "You'd save Rs. ___ per year"
    Result large number in gold

  PAYMENT METHOD SELECTOR:
    Label: "HOW WOULD YOU LIKE TO PAY" (section header style)
    Margin-top: 28px

    Payment options as horizontal scrollable chips:
    Each chip: white card, 80px × 48px, logo + name
    Selected: Dark border, checkmark in corner

  CTA BUTTON (fixed bottom, not scrolling):
    "Activate Membership · Rs. 2,000"
    Gold gradient button (see 5.1)
    Full width with 24px sides
    Above safe area
    "Secure payment" caption below: lock icon + text, 11px #9E9E9E
```

---

### Screen 11 — Profile

```
NAVIGATION: "Profile" title

PROFILE HEADER (white card, prominent):
  Avatar circle (64px):
    If photo: round photo
    If no photo: initials, background gradient (gold to dark)
  Name: H2, DM Sans SemiBold
  Member since: "Member since January 2024"
    12px, #9E9E9E

  Membership status (below name):
    Active: Green badge with "Active · Expires Jan 2025"
    Expiring soon: Gold badge with "Expires in 7 days · Renew →"
    Expired: Red badge with "Expired · Renew Now"

SETTINGS SECTIONS:
  Each section is a white card
  Items inside share the card, divided by 1px lines
  Each row: 56px height

  Row anatomy:
    [Icon 20px, muted gray] [Label 15px] [Value / Chevron right-aligned]
    Example: [✉️] Email address    user@mail.com  >

  SECTION 1 — Personal Information:
    Full Name
    Phone Number (verified badge)
    Email Address (verified badge)
    Date of Birth
    City

  SECTION 2 — Membership:
    Membership ID: MUM-12345 (mono style)
    Valid Until: date
    Auto-Renew: Toggle switch
    Payment Methods

  SECTION 3 — Preferences:
    Notifications: Toggle
    Dark Mode: Toggle
    Language: English / اردو  >

  SECTION 4 — Account:
    Help & Support
    Privacy Policy
    Terms of Use
    About App (version in secondary text)

  SECTION 5 — Danger Zone (separated):
    Log Out (red text, no icon)
    Delete Account (red text, smaller, tertiary)

Toggle Switch Design:
  Inactive: #D4D0C8 background
  Active: #1A1A1A background (not green — keeps palette clean)
  Thumb: White circle
  Size: 50px × 30px
  Transition: 250ms spring
```

---

### Screen 12 — Renewal

```
CONCEPT: This screen needs to feel urgent but not panicked.
Calm, honest, motivational.

Case A: Expiring Soon (30 days):
  Show as a BANNER on Home Screen:
    Background: rgba(200,169,110,0.12) (soft gold tint)
    Left border: 3px solid #C8A96E
    Text: "Your membership expires in 30 days"
    CTA: "Renew →" (gold text)
    Dismiss: × button (right side)

Case B: Expiring in 7 days:
  Show as BOTTOM SHEET on app open:
    Cannot be scrolled past (modal)
    Content:
      Illustration: Hourglass or calendar
      "7 days left"
      Your savings this year: Rs. X,XXX
      "Renew for another year and keep saving"
    CTAs: "Renew Now" (gold) + "Remind Me Tomorrow" (text)

Case C: Expired:
  Show as FULL SCREEN GATE:
    Background: #F5F3F0
    Top: Membership card shown with "EXPIRED" overlay
      Card greyed out, diagonal stamp-style "EXPIRED" text
      Font: Cormorant, red, angled 15 degrees
    Middle: Your stats from last year
      "You saved Rs. X,XXX last year"
      "You visited X times"
      Motivational: "Don't lose your benefits"
    Bottom: "Renew Membership · Rs. 2,000" (gold button)
            "Maybe Later" (tiny text button, barely visible)
```

---

### Screen 13 — Onboarding QR Flow (New User: First Time at Checkout)

```
This screen appears ONCE, first time a user tries to open card.
Explains how to use the QR code.

Slide 1:
  Show their membership card
  Arrow pointing to QR code
  "This is your key to savings"

Slide 2:
  Animation: QR code being scanned (lottie or simple CSS)
  "Show this to the cashier at checkout"
  "They'll scan it to apply your discount"

Slide 3:
  Simple: receipt showing discount applied
  "Discount applied automatically — no coupons needed"

CTA: "Got it, I'm ready!" → goes to full card screen
```

---

## 07. MOTION & ANIMATION SYSTEM

### Philosophy
Motion in this app is like a well-trained waiter — efficient, smooth, noticed only when absent. No bounce, no sparkle, no celebration overload. Just satisfying transitions.

---

### Transition Timings

```
  Instant:    0ms    → Toggle checked, tab switched
  Fast:      150ms   → Tooltips, hover states
  Normal:    250ms   → Most UI interactions (button press, etc.)
  Smooth:    350ms   → Screen transitions, sheet expansions
  Deliberate: 500ms  → Card flips, major state changes
  Slow:      700ms+  → Background transitions, ambient animations
```

---

### Easing Functions

```
  Standard:    cubic-bezier(0.4, 0.0, 0.2, 1)   → Most interactions
  Enter:       cubic-bezier(0.0, 0.0, 0.2, 1)   → Things coming in
  Exit:        cubic-bezier(0.4, 0.0, 1, 1)     → Things going out
  Spring:      cubic-bezier(0.34, 1.56, 0.64, 1) → Satisfying bounce (subtle)
```

---

### Specific Animations

**Screen Entry:**
```
  Elements stagger in from bottom, 24px offset
  Each element: 0, 50, 100, 150ms delay
  Fade (0 → 1) + translate (24px → 0)
  Duration: 350ms, Enter easing
```

**Card Flip (Membership Card):**
```
  Perspective: 1200px
  rotateY: 0deg → 180deg (front to back)
  Duration: 500ms, Standard easing
  At 90 degrees: swap content (front/back)
  Shadow increases then decreases during flip
```

**Membership Activation (Success):**
```
  Checkmark draws itself (SVG stroke animation, 600ms)
  Circle draws around checkmark (400ms, 200ms delay)
  Card appears below with slide-up (500ms, 400ms delay)
  Subtle gold particle burst (small, not confetti)
  Screen background pulses very faintly gold once
```

**Savings Number Count-Up:**
```
  When stats section appears in view:
  Numbers count up from 0 to final value
  Duration: 1000ms
  Easing: ease-out (fast start, slow end)
  Only plays once (not on re-scroll)
```

**Pull to Refresh:**
```
  Custom indicator: Thin gold circle that draws
  Completes full circle when threshold reached
  Release: Circle fills → spin loading
  Success: Brief check, then content reloads
```

**Bottom Sheet Presentation:**
```
  Slide up: 350ms, Enter easing
  Background overlay: fade to rgba(0,0,0,0.4), 250ms
  Dismiss: Slide down 300ms, Exit easing
  Drag to dismiss: Real-time following, spring snap
```

---

## 08. ICONOGRAPHY

### Icon Style
```
  Style: Outlined, rounded corners
  Stroke width: 1.8px (at 24px size)
  Corner radius: Rounded (not sharp)
  Visual weight: Medium (not too thin, not bold)
  Recommended: Phosphor Icons, Lucide Icons, or custom
  Size: 20px in lists, 24px in nav, 28px in featured
```

### Custom Icons Needed
These should be designed custom to feel unique:
```
  1. Mumuso logo icon (app icon, wordmark)
  2. Membership card icon (slightly 3D-looking)
  3. QR code icon (custom style)
  4. Savings/piggy bank (refined, minimal)
  5. Bottom tab icons (5 custom icons)
```

---

## 09. DARK MODE

### Implementation
```
  Follows system setting automatically
  Manual toggle in Profile → Preferences
  Smooth transition: 400ms cross-fade between themes
  NOT a simple color inversion — designed separately
```

### Dark Mode Key Differences
```
  Canvas:   #0F0F0F       (True dark, not #333)
  Surface:  #1C1C1E       (Slightly lifted)
  Cards:    #252528        (Card background)
  Text:     #F0EDE8       (Warm white, never pure)

  Gold accent: Slightly brighter (#D4B87C) for visibility
  Borders: Very subtle (#2A2A2D)

  Shadows: Replaced with borders in dark mode
    (Shadows don't show on dark backgrounds)
    Cards: 1px solid #2A2A2D instead of shadow

  Images/illustrations: Add slight warm tint filter
```

---

## 10. ACCESSIBILITY

### Requirements
```
  Minimum tap target: 44×44pt — non-negotiable
  Color contrast: WCAG AA (4.5:1 for body, 3:1 for large text)
  Dynamic type: All text scales with system font size
  Screen reader: All elements labeled with semantic meaning
  Reduce motion: Respect system "Reduce Motion" setting
    → Replace all animations with simple fades
  Color-blind safe: Never use color alone to convey meaning
    → Always pair color with icon, text, or pattern
```

---

## 11. APP ICON

```
CONCEPT: Simple. Memorable. The "M" elevated.

Design:
  Background: Very dark charcoal (#1C1C1E)
  Center element: Stylized "M" lettermark
    Font: Cormorant Garamond Bold
    Color: #C8A96E (gold)
    Size: 60% of icon area

  Or alternative:
  Background: Same dark charcoal
  Center: Abstract QR-inspired mark using "M" shape
    Clean, modern, not obviously a QR
    Gold on dark

  Border-radius: iOS standard (follows system)
  No drop shadow — flat design
```

---

## 12. DESIGN DON'TS (FOR IMPLEMENTORS)

These are rules that preserve the unique look. Breaking these makes it look like every other app.

```
❌ DO NOT add blue as a color anywhere in the UI
❌ DO NOT use green for savings amounts (use gold instead)
❌ DO NOT add colorful gradients to card backgrounds
❌ DO NOT use circular avatar for stores (use square rounded)
❌ DO NOT use confetti animations (use subtle gold pulse instead)
❌ DO NOT add a floating action button (FAB)
❌ DO NOT use tab bar with filled/pill indicator (use line indicator)
❌ DO NOT use modal dialogs with colored header bars
❌ DO NOT use rounded pill buttons as primary actions
❌ DO NOT add emojis to UI (only in notification content)
❌ DO NOT use card grids for transaction history (use rows)
❌ DO NOT add a search bar on screens that don't need search
❌ DO NOT use full-width dividers between list items
   (use inset dividers that respect left padding)
❌ DO NOT use font sizes below 11px for any readable content
❌ DO NOT use pure black (#000000) or pure white (#FFFFFF) as backgrounds
❌ DO NOT add loading spinners for full-screen states
   (always use skeleton screens)
```

---

## 13. SUMMARY: THE DESIGN SYSTEM IN ONE PARAGRAPH

This app lives in a world of warm off-whites, deep charcoals, and a single thread of gold that runs through everything meaningful. The typeface pairing of Cormorant Garamond and DM Sans creates tension between classical elegance and modern clarity. Motion is deliberate and quiet — nothing bounces, nothing explodes, everything just slides into place with confidence. The membership card is the soul of the app: a dark, premium object that the user is proud to own and show at checkout. Every screen earns its place. Every element is chosen. Nothing is accidental.

---

**Document Version**: 2.0 — UI Design Specification
**Status**: Ready for Design & Development
**Prepared by**: Development Team
**Last Updated**: February 2026

---

*"Design is not what it looks like. Design is how it works — and how it makes you feel."*
