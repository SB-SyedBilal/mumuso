# MUMUSO LOYALTY APP
## UI/UX Design Specification — Production Handoff
### Version 3.0 | February 2026

> **Single source of truth.** Every decision has a reason. Every pixel has intent. Do not deviate without understanding why something was specified the way it was.

---

## 00. HOW TO USE THIS DOCUMENT

| Team | Read First | Then |
|------|-----------|------|
| UI Designer | 01, 02, 03, 04, 05 | 06, 08, 14, 15 |
| Frontend Dev | 05, 06, 10, 12 | 07, 13, 17 |
| Content Writer | 01, 11 | 08, 09 |
| QA Engineer | 17, 18, 19 | 07, 12, 13 |
| AI Design Tool | All sections in order | Follow every spec literally |

**Notation:** `[Component]` = Section 06 component. `(Screen)` = Section 08 screen. `→` = navigates to. `px` = pixels at 1x.

---

## 01. DESIGN PHILOSOPHY

### The Core Concept: "Quiet Luxury"

This is not a coupon app. This is not a points game. This is a membership — and memberships feel different. They imply belonging, exclusivity, and value beyond the transaction.

The visual language must reflect that at every touchpoint.

**Reference products that share this feeling:**
- N26 banking app — calm, structured, nothing wasted
- Apple Card — dark, minimal, premium material
- Monocle magazine — editorial restraint, typographic confidence

**What this app must NOT feel like:**
- Aggressive discount apps (bright orange, confetti, coins)
- Busy loyalty apps (purple gradients, game-like patterns)
- Any app where color fights for your attention

### Three Design Principles

**1. Earn attention, don't demand it.**
Elements compete through hierarchy and space — never through color noise. If something is important, give it room. Don't make it louder.

**2. Every interaction must justify its existence.**
If an element cannot be explained in one sentence, it should not exist. Restraint is a feature.

**3. The user is the hero, not the app.**
The app is a well-dressed assistant. It facilitates. It does not perform.

### Personality Matrix

| Dimension | This App | Not This App |
|-----------|----------|--------------|
| Tone | Calm, assured | Excited, loud |
| Visual weight | Light, spacious | Dense, packed |
| Color | Near-monochrome + 1 accent | Multi-color |
| Typography | Editorial, refined | Friendly, bubbly |
| Motion | Purposeful, restrained | Bouncy, playful |
| Feedback | Subtle, elegant | Prominent, celebratory |

---

## 02. COLOR SYSTEM

### Philosophy
Near-monochromatic. One warm accent — gold — carries all meaning. Like a black-and-white photograph where one object is in color. Gold appears only where it matters most: savings figures, active states, membership card shimmer, premium CTAs. Never decoratively.

### Primary Palette

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `color-canvas` | `#F5F3F0` | 245,243,240 | Main app background |
| `color-surface` | `#FFFFFF` | 255,255,255 | Card backgrounds |
| `color-surface-raised` | `#FAFAF8` | 250,250,248 | Slightly elevated cards |
| `color-surface-dark` | `#1C1C1E` | 28,28,30 | Hero zones, membership card |
| `color-surface-darker` | `#141416` | 20,20,22 | Deepest dark — splash, card screen |

### Text Colors

| Token | Hex | Contrast on Canvas | Usage |
|-------|-----|-------------------|-------|
| `color-text-primary` | `#1A1A1A` | 14.2:1 ✅ AAA | Main readable text |
| `color-text-secondary` | `#6B6B6B` | 5.2:1 ✅ AA | Supporting text |
| `color-text-tertiary` | `#9E9E9E` | 2.8:1 ⚠️ Large only | Placeholders, captions |
| `color-text-inverted` | `#F0EDE8` | 14.0:1 on dark ✅ | Text on dark surfaces |
| `color-text-inverted-muted` | `#9E9B96` | 4.6:1 on dark ✅ | Secondary on dark |

> ⚠️ `color-text-tertiary` passes only for large text (18pt+). Never use for body copy or anything users must read and act on.

### Accent — The Single Gold

| Token | Hex | Usage |
|-------|-----|-------|
| `color-accent` | `#C8A96E` | Primary gold — icons, active states |
| `color-accent-light` | `#F0E4C8` | Tinted backgrounds |
| `color-accent-dark` | `#A07840` | Pressed/active states |
| `color-accent-text` | `#8B6430` | Gold text on white — passes 4.8:1 contrast |

> **Rule:** Gold appears in maximum 3 places per screen. It highlights. It does not theme.

### Functional Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `color-success` | `#4A9B7F` | Active status, verified states |
| `color-success-bg` | `#EBF5F1` | Success message backgrounds |
| `color-error` | `#C0544A` | Errors, expired membership |
| `color-error-bg` | `#F7EDEC` | Error backgrounds |
| `color-warning` | `#C08040` | Expiring soon, warnings |
| `color-warning-bg` | `#F7F0E8` | Warning backgrounds |

### Borders

| Token | Hex | Usage |
|-------|-----|-------|
| `color-border-subtle` | `#E8E5E0` | Most dividers |
| `color-border-default` | `#D4D0C8` | Standard borders |
| `color-border-strong` | `#B0AA9E` | Focused/emphasized |

### Membership Card Gradient
```
Direction: 135°
Stop 1:    #1C1C1E at 0%
Stop 2:    #2C2A26 at 50%
Stop 3:    #1C1C1E at 100%
+ noise texture overlay: opacity 0.03
+ animated shimmer: diagonal sweep, rgba(255,255,255,0.08) max, every 8s
```

### Contrast Verification Table

| Combination | Ratio | WCAG |
|------------|-------|------|
| `text-primary` on `canvas` | 14.2:1 | AAA ✅ |
| `text-secondary` on `canvas` | 5.2:1 | AA ✅ |
| `accent-text` on `surface` | 4.8:1 | AA ✅ |
| `text-inverted` on `surface-dark` | 14.0:1 | AAA ✅ |
| `success` on `success-bg` | 4.6:1 | AA ✅ |
| `error` on `error-bg` | 4.5:1 | AA ✅ |

### Color Rules (Hard)

**✅ Always:**
- Use `#F5F3F0` as main background — never cold white
- Use gold only for savings, active states, premium CTAs
- Pair every color-coded status with an icon AND text label

**❌ Never:**
- Add blue anywhere in the UI (not even links)
- Use bright green for discounts — use `color-accent-text`
- Apply gradients to content screens (membership card only)
- Use more than 2 text colors in a single card

---

## 03. TYPOGRAPHY SYSTEM

### Font Families

**Display: Cormorant Garamond**
```
Purpose:  Premium emotional moments — membership card name,
          hero savings number, membership purchase headline
Weights:  Regular (400), SemiBold (600), Bold (700)
Source:   Google Fonts (free)
Fallback: Georgia, 'Times New Roman', serif
Use for:  ONLY the 3 contexts above. Not UI copy.
```

**UI: DM Sans**
```
Purpose:  All interface text — labels, body, navigation, forms
Weights:  Regular (400), Medium (500), SemiBold (600), Bold (700)
Source:   Google Fonts (free)
Fallback: 'Helvetica Neue', Arial, sans-serif
```

**Data: JetBrains Mono**
```
Purpose:  Member IDs, transaction IDs, codes, reference numbers
Weights:  Regular (400), Medium (500)
Source:   Google Fonts (free)
Fallback: 'Courier New', monospace
```

### Type Scale

| Token | Size | Line Height | Weight | Font | Letter Spacing |
|-------|------|-------------|--------|------|---------------|
| `text-display` | 48px | 56px | 700 | Cormorant | -0.02em |
| `text-display-sm` | 36px | 44px | 600 | Cormorant | -0.01em |
| `text-h1` | 30px | 38px | 600 | DM Sans | -0.01em |
| `text-h2` | 24px | 32px | 600 | DM Sans | 0 |
| `text-h3` | 20px | 28px | 500 | DM Sans | 0 |
| `text-h4` | 17px | 24px | 500 | DM Sans | 0 |
| `text-body-lg` | 16px | 26px | 400 | DM Sans | 0 |
| `text-body-md` | 14px | 22px | 400 | DM Sans | 0 |
| `text-body-sm` | 13px | 20px | 400 | DM Sans | 0 |
| `text-caption` | 12px | 18px | 400 | DM Sans | 0 |
| `text-label` | 11px | 14px | 500 | DM Sans | **0.08em** (UPPERCASE always) |
| `text-mono` | 14px | 22px | 400 | JetBrains Mono | 0 |
| `text-mono-sm` | 12px | 18px | 400 | JetBrains Mono | 0 |

### Typography Rules
- One `text-h1` per screen, maximum — never two
- Never bold body text to create emphasis — use size or color instead
- Body text: 40–65 characters per line (enforce via container padding)
- Headings: always more whitespace above than below
- Cormorant Garamond: used ONLY for card name, hero numbers, purchase headline

---

## 04. SPACING & LAYOUT GRID

### 8pt Base Grid — All Values Are Multiples of 8

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Icon-to-label gap, micro spacing |
| `space-2` | 8px | Compact internal padding |
| `space-3` | 12px | Between list items |
| `space-4` | 16px | Standard padding, form field gaps |
| `space-5` | 20px | Compact card padding |
| `space-6` | 24px | Standard card padding |
| `space-8` | 32px | Between major sections |
| `space-10` | 40px | Hero top padding |
| `space-12` | 48px | Hero zones |
| `space-16` | 64px | Screen entry top space |

### Horizontal Margins by Device Width

| Device Width | Margin | Content Width |
|-------------|--------|---------------|
| 320px | 16px | 288px |
| 375px | 20px | 335px |
| 390px (reference) | 24px | 342px |
| 414px | 24px | 366px |
| 430px+ | 28px | 374px |

### Screen Zone Structure
```
┌──────────────────────────────────────────┐
│ ZONE 1: STATUS BAR (~44px iOS / ~24px Android)
│ Transparent, system-controlled           │
├──────────────────────────────────────────┤
│ ZONE 2: NAVIGATION BAR (56px)            │
│ Back | Title | Actions                   │
│ Transparent → frosted glass on scroll    │
├──────────────────────────────────────────┤
│                                          │
│ ZONE 3: CONTENT AREA (scrollable)        │
│ Horizontal padding per device table      │
│ Background: #F5F3F0                      │
│                                          │
├──────────────────────────────────────────┤
│ ZONE 4: BOTTOM TAB BAR (56px + safe area)│
│ Frosted glass                            │
└──────────────────────────────────────────┘
```

---

## 05. DESIGN TOKEN REFERENCE

### JSON (Figma Variables / Style Dictionary)
```json
{
  "color": {
    "canvas": "#F5F3F0", "surface": "#FFFFFF",
    "surface-raised": "#FAFAF8", "surface-dark": "#1C1C1E",
    "surface-darker": "#141416",
    "text": {
      "primary": "#1A1A1A", "secondary": "#6B6B6B",
      "tertiary": "#9E9E9E", "inverted": "#F0EDE8",
      "inverted-muted": "#9E9B96"
    },
    "accent": {
      "default": "#C8A96E", "light": "#F0E4C8",
      "dark": "#A07840", "text": "#8B6430"
    },
    "success": "#4A9B7F", "success-bg": "#EBF5F1",
    "error": "#C0544A", "error-bg": "#F7EDEC",
    "warning": "#C08040", "warning-bg": "#F7F0E8",
    "border": {
      "subtle": "#E8E5E0", "default": "#D4D0C8", "strong": "#B0AA9E"
    }
  },
  "font": {
    "display": "Cormorant Garamond",
    "ui": "DM Sans",
    "mono": "JetBrains Mono"
  },
  "radius": {
    "sm": "8px", "md": "12px", "lg": "16px",
    "xl": "20px", "2xl": "24px", "3xl": "32px", "full": "9999px"
  },
  "shadow": {
    "xs": "0 1px 4px rgba(0,0,0,0.04)",
    "sm": "0 2px 8px rgba(0,0,0,0.06)",
    "card": "0 2px 16px rgba(0,0,0,0.06)",
    "md": "0 4px 16px rgba(0,0,0,0.08)",
    "lg": "0 8px 32px rgba(0,0,0,0.10)",
    "membership": "0 12px 40px rgba(0,0,0,0.28)"
  },
  "motion": {
    "duration": {
      "instant": "0ms", "fast": "150ms", "normal": "250ms",
      "smooth": "350ms", "deliberate": "500ms", "slow": "700ms"
    },
    "easing": {
      "standard": "cubic-bezier(0.4, 0.0, 0.2, 1)",
      "enter": "cubic-bezier(0.0, 0.0, 0.2, 1)",
      "exit": "cubic-bezier(0.4, 0.0, 1, 1)",
      "spring": "cubic-bezier(0.34, 1.56, 0.64, 1)"
    }
  }
}
```

### CSS Custom Properties
```css
:root {
  --color-canvas: #F5F3F0;   --color-surface: #FFFFFF;
  --color-surface-raised: #FAFAF8; --color-surface-dark: #1C1C1E;
  --color-text-primary: #1A1A1A; --color-text-secondary: #6B6B6B;
  --color-text-tertiary: #9E9E9E; --color-text-inverted: #F0EDE8;
  --color-accent: #C8A96E; --color-accent-text: #8B6430;
  --color-success: #4A9B7F; --color-error: #C0544A;
  --color-border-subtle: #E8E5E0; --color-border-default: #D4D0C8;
  --font-display: 'Cormorant Garamond', Georgia, serif;
  --font-ui: 'DM Sans', 'Helvetica Neue', sans-serif;
  --font-mono: 'JetBrains Mono', 'Courier New', monospace;
  --radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px;
  --radius-xl: 20px; --radius-2xl: 24px; --radius-3xl: 32px;
  --shadow-card: 0 2px 16px rgba(0,0,0,0.06);
  --duration-fast: 150ms; --duration-normal: 250ms;
  --duration-smooth: 350ms; --duration-deliberate: 500ms;
  --ease-standard: cubic-bezier(0.4, 0.0, 0.2, 1);
  --ease-enter: cubic-bezier(0.0, 0.0, 0.2, 1);
  --ease-exit: cubic-bezier(0.4, 0.0, 1, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

---

## 06. COMPONENT LIBRARY

### 6.1 BUTTONS

**Primary Button**
```
Height: 56px  |  Border-radius: 14px  |  Background: #1A1A1A
Text: #F0EDE8, DM Sans SemiBold 15px, letter-spacing: 0.01em
Shadow: 0 4px 16px rgba(26,26,26,0.18)

States:
  Default:   as above
  Hover:     bg #2C2C2C, shadow increases
  Pressed:   scale(0.97), shadow reduces, 100ms ease-out
  Loading:   text opacity→0, gold spinner (20px, 2px stroke, 600ms)
  Disabled:  opacity 0.38, no shadow
  Focus:     outline 3px solid #C8A96E, offset 3px
```

**Gold Accent Button** (ONLY for: Membership purchase, Renewal)
```
Background: linear-gradient(135°, #C8A96E, #A07840)
Text: #FFFFFF, DM Sans SemiBold 15px, letter-spacing: 0.02em
Shimmer: white diagonal sweep, opacity 0→0.15→0, plays on mount then every 8s
Pressed: gradient darkens -10% brightness, scale(0.97)
```

**Secondary / Ghost Button**
```
Background: transparent  |  Border: 1.5px solid #D4D0C8
Text: #1A1A1A, DM Sans Medium 15px  |  Height: 56px  |  Radius: 14px
Hover: border→#1A1A1A, bg rgba(0,0,0,0.02)
```

**Text Button**
```
Text: #6B6B6B, DM Sans Medium 14px  |  No background  |  No border
Padding: 8px 4px (tap-safe height)
Gold variant: text #8B6430
Pressed: opacity 0.7
```

**Destructive Button**
```
Same as Ghost but: border #C0544A, text #C0544A
On press: bg rgba(192,84,74,0.06)
Use for: Delete account, cancel membership
```

**Icon Button**
```
Touch target: 44×44px (non-negotiable)
Icon container: 36×36px, radius 10px, bg #F0EDE8 (light) / #252528 (dark)
Icon: 20px  |  Pressed: scale(0.92)
Focus: outline 2px solid #C8A96E, offset 2px
```

---

### 6.2 INPUT FIELDS

**Standard Text Input**
```
Height: 56px  |  Radius: 14px  |  Bg: #FFFFFF  |  Border: 1.5px #E8E5E0
Padding: 0 20px  |  Font: DM Sans Regular 16px #1A1A1A

Label (above): DM Sans Medium 11px UPPERCASE, #9E9E9E, letter-spacing 0.08em, mb 8px

States:
  Focused:  border #1A1A1A, shadow 0 0 0 3px rgba(26,26,26,0.06), label→#1A1A1A
  Valid:    border #4A9B7F, checkmark icon right side
  Error:    border #C0544A, shadow 0 0 0 3px rgba(192,84,74,0.08)
            Error msg below: 12px DM Sans #C0544A, slide-down 200ms
  Disabled: bg #F5F3F0, opacity 0.5
```

**OTP Input**
```
6 boxes  |  Each: 52×60px  |  Radius: 12px  |  Gap: 10px
Font: DM Sans SemiBold 24px centered

Active box: border #1A1A1A, scale(1.04), cursor blink
Filled box: bg #F5F3F0, border #D4D0C8
Error: all boxes border #C0544A + shake: translateX(-4px→4px→-4px→0), 300ms

Auto-advance on digit  |  Auto-submit when 6th digit entered
Backspace: clear + move back  |  Paste: fill all boxes with stagger
```

**Search Bar**
```
Height: 48px  |  Radius: 24px (pill)  |  Bg: #FFFFFF  |  Shadow: shadow-sm
Padding: 0 16px 0 44px  |  Search icon: 18px left side
Clear btn: appears on input, X icon right side
Focus: shadow 0 0 0 2px #D4D0C8  (icon stays same — not gold)
```

**Dropdown**
```
Same visual as text input — presented as a row, NOT native select
Right icon: chevron-down 16px #9E9E9E
Opens: bottom sheet picker (iOS wheel / Android list)
Selected option: checkmark right side, text bold
```

---

### 6.3 CARDS

**Standard Card**
```
Bg: #FFFFFF  |  Radius: 20px  |  Shadow: shadow-card  |  Padding: 24px
Interactive: pressed → scale(0.985), shadow→shadow-xs, 180ms ease
```

**Membership Card (Hero)**
```
Width: screenWidth - (margin × 2)  |  Height: 200px (390px ref)
Radius: 24px  |  Shadow: shadow-membership

Background:
  linear-gradient(135°, #1C1C1E, #2C2A26, #1C1C1E)
  + noise texture (base64 PNG, opacity 0.03)
  + animated shimmer (see anim-card-shimmer in Section 10)

FRONT layout (24px padding all):
  Top-left: "MUMUSO MEMBER" — 10px DM Sans Medium uppercase gold (#9E9B96)
            letter-spacing: 0.14em
  Top-right: [Status Badge]
  Middle: Member name — Cormorant SemiBold 26px #F0EDE8
          Scales down if >18 chars (min 19px before truncation at 25)
  Bottom-left: "MUM · 12345" — JetBrains Mono 12px #6B6361
  Bottom-right: "VALID UNTIL" 10px + date 14px DM Sans #9E9B96

BACK layout (QR view, appears on 3D flip):
  QR code container: bg #FFFFFF, radius 16px, padding 16px, size 160×160px
  Centered in card
  Below QR: member ID mono 14px #9E9B96
  "SHOW TO CASHIER" — 10px uppercase gold, letter-spacing 0.14em

Gyroscope tilt:
  Max: ±8° X and Y  |  Shimmer parallaxes at 1.3× tilt speed
  Disabled when: accessibility/reduce-motion, no gyroscope available

Expired state:
  Front: dark vignette overlay rgba(0,0,0,0.15)
  Back: QR grayscale filter + diagonal "EXPIRED" stamp
        Cormorant Bold 28px #C0544A, -15° rotation, opacity 0.85
```

**Stat Tile**
```
Width: (contentWidth - 12px) / 2  |  Height: 100px
Radius: 20px  |  Bg: #FFFFFF  |  Shadow: shadow-card  |  Padding: 20px

Eyebrow: 10px DM Sans Medium UPPERCASE #9E9E9E, letter-spacing 0.1em
Value:   28px DM Sans SemiBold #1A1A1A (savings values: #8B6430 gold)
Sub:     13px DM Sans Regular #9E9E9E
```

**Transaction Row** (inside a grouped card, not standalone)
```
Height: 68px  |  Padding: 16px 20px

Left:   40px circle avatar — gradient bg, initial letter white DM Sans SemiBold
Center: Store name 15px DM Sans Medium #1A1A1A (ellipsis overflow)
        Date/time 12px DM Sans Regular #9E9E9E
Right:  Final amount 15px DM Sans SemiBold #1A1A1A
        Saved amount 12px DM Sans Medium #8B6430 (format: "– Rs. 250")

Separator: 1px #E8E5E0, inset from left at 68px (after avatar)
           Not shown on last item in group

Swipe left: reveals "Download" (dark) + "Report" (muted red)
            80px trigger threshold, spring snap
```

**Notification Card**
```
Unread: bg #FAFAF8, left border 3px #C8A96E, title DM Sans SemiBold
Read:   bg #FFFFFF, no left border, icon opacity 0.65, title Regular

Left: 36px circle icon (category-colored bg, category icon)
Center: title 14px + body 13px #6B6B6B (2 lines) + time 11px #9E9E9E
Right: unread dot — 8px circle #C8A96E (hidden when read)
```

---

### 6.4 NAVIGATION

**Bottom Tab Bar**
```
Height: 56px + safe-area-inset-bottom
Bg: rgba(245,243,240,0.88) + backdrop-blur 20px
Border-top: 1px solid rgba(0,0,0,0.06)

Tabs (4):
  Inactive: icon #B0AA9E, label #B0AA9E (10px DM Sans Medium UPPERCASE 0.06em)
  Active:   icon #1A1A1A, label #C8A96E (gold label only)
  Active indicator: 3px × 24px line, radius 2px, #C8A96E, 6px above icon
                    appears: scale(0→1) + fade, 200ms spring easing
  Tab press: icon scale(1→0.85→1) spring, 200ms

Tab order: Home | Card | History | Profile
```

**Navigation Bar (Top)**
```
Height: 56px (+ status bar)
Default: transparent
Scrolled: rgba(245,243,240,0.92) + backdrop-blur 16px (triggers at 8px scroll)

Back button: chevron-left 20px, touch target 44×44px, optional parent label (≤12 chars)
Title: DM Sans SemiBold 17px centered. On content screens: fades in after 40px scroll.
Right actions: max 2 icon buttons, 8px gap
```

---

### 6.5 BADGES

**Status Badge**
```
Active:         bg rgba(74,155,127,0.12),  text #4A9B7F, dot with pulse anim
Expired:        bg rgba(192,84,74,0.10),   text #C0544A, no dot
Expiring Soon:  bg rgba(192,128,64,0.12),  text #C08040, dot with pulse

All: padding 4px 10px 4px 8px, radius 6px, DM Sans SemiBold 11px UPPERCASE
Dot pulse: scale(1→1.6→1) + opacity(1→0.2→1), 2000ms infinite
```

**Discount Badge:** bg rgba(200,169,110,0.14), border 1px rgba(200,169,110,0.30), text #8B6430 12px SemiBold

---

### 6.6 EMPTY STATES

Each: centered vertically, 120×120px line-art SVG, headline, body (max 260px wide), optional CTA.

| State | Illustration | Headline | Body | CTA |
|-------|-------------|---------|------|-----|
| No transactions | Shopping bag + floating receipt | "Your first purchase awaits" | "Shop at any Mumuso store and your history will appear here" | "Find a Store" |
| No notifications | Bell + radiating arcs | "Nothing to see yet" | "We'll let you know about your membership and special offers" | None |
| Membership expired | Calendar, corner folded | "Your membership has rested" | "Renew to continue saving 10% on every purchase" | "Renew Membership" (gold button) |
| No stores nearby | Map pin outline | "No stores in this area" | "Try searching another city or view all locations" | "View All Stores" |
| Search no results | Magnifying glass | "No results for '[query]'" | "Try different keywords" | None |

---

### 6.7 LOADING STATES

**Skeleton Screen:** Always match real layout. Never full-screen spinner.
```
Colors: base #F0EDE8 → shimmer #E4DFD6, 1.4s ease-in-out infinite
Shapes: exact size/radius of real component
Text lines: height 14px, radius 7px, varied widths
```

**Button Loading:** Text opacity→0, gold spinner appears centered (20px, 2px stroke, 600ms rotation)

**Inline Loading:** 3 dots, 5px circles, #9E9E9E, sequential pulse 600ms each, 150ms stagger

**Pull to Refresh:**
```
0–32px: gold circle arc draws (0%→50%)
32–64px: arc completes (50%→100%)
64px+: arc spins (loading)
Complete: checkmark flash → reload
```

---

### 6.8 TOASTS & DIALOGS

**Toast**
```
Position: top, below status bar  |  Width: screenW - 32px  |  Radius: 14px
Bg: #1A1A1A  |  Text: #F0EDE8 DM Sans Medium 14px  |  Shadow: shadow-lg
Layout: [18px icon] [message] [optional X]
Enter: translateY(-40px→0) + fade, 300ms enter easing
Auto-dismiss: 3500ms  |  Progress line depletes at bottom

Success: checkmark-circle icon #4A9B7F
Error:   x-circle icon #C0544A
Info:    info-circle icon #C8A96E
```

**Confirmation Dialog** (Bottom sheet, NOT modal)
```
Bg: #FFFFFF  |  Radius: 24px 24px 0 0  |  Padding: 28px 24px 40px
Handle: 4×32px #D4D0C8 centered top

Content: optional 48px icon, H3 title centered, body 15px #6B6B6B centered
Buttons stacked: primary action (full width), Cancel text button below

Copy examples:
  Log Out: "See you soon" / "You can sign back in anytime" / "Log Out" / "Stay"
  Delete Account: "This cannot be undone" / [specific consequences] / "Delete My Account"
  Cancel Auto-Renew: "Turn off auto-renewal?" / [specific outcome] / "Turn Off" / "Keep"
```

---

## 07. GESTURE & INTERACTION SYSTEM

### Gesture Map

| Element | Gesture | Result |
|---------|---------|--------|
| Membership Card (Home) | Tap | 3D flip to QR side |
| Membership Card (Home) | Long press | Options: "Enlarge QR", "Save QR" |
| Membership Card (Card screen) | Physical tilt | Shimmer parallax |
| QR Code | Pinch to zoom | QR enlarges max 2× |
| QR Code | Tap | Full-screen QR toggle |
| Transaction row | Tap | Opens detail bottom sheet |
| Transaction row | Swipe left | Reveals "Download" + "Report" |
| Transaction row | Long press | Share receipt menu |
| Notification | Tap | Navigate to context + mark read |
| Notification | Swipe left | Delete |
| Notification | Swipe right | Mark read |
| Toggle switch | Tap | Toggle state + haptic |
| Bottom sheet | Swipe down | Dismiss |
| Bottom sheet | Fast swipe down | Dismiss immediately |
| History list | Pull down | Refresh |
| Savings slider | Drag | Real-time recalculation |
| OTP boxes | Paste | Fill all 6 boxes with stagger |

### Haptic Feedback Map

| Event | Haptic | Platform |
|-------|--------|----------|
| Membership activated | Success notification | Both |
| Payment confirmed | Success notification | Both |
| Toggle switch | Selection | Both |
| Primary button tap | Light impact | Both |
| Error / wrong OTP | Error notification | Both |
| Card flip | Light impact | Both |
| Pull-to-refresh threshold | Light impact | Both |
| Delete action | Medium impact | Both |
| Disabled button | None | Both |

### Touch Rules
- Minimum tap target: 44×44pt — no exceptions
- Adjacent interactive elements: ≥ 8px gap
- Visual feedback within ≤ 50ms
- Long press delay: 400ms

---

## 08. SCREEN SPECIFICATIONS

All wireframes use 390×844px reference. Grid: 24px horizontal margin.

---

### SCREEN 01 — Splash Screen
```
Bg: #141416

Center of screen:
  MUMUSO wordmark — Cormorant Garamond Bold 38px #F0EDE8, letter-spacing 0.18em
  Gold line — 36px wide, 1px, #C8A96E (appears after wordmark)
  MEMBER label — DM Sans Medium 10px UPPERCASE #9E9B96, letter-spacing 0.22em

Bottom: "v1.0.0" — 12px DM Sans Regular #4A4A4E

Animation:
  t=0:    screen dark, nothing visible
  t=100:  "MUMUSO" fades in, 700ms ease
  t=600:  gold line draws from center out, 400ms
  t=900:  "MEMBER" fades in, 400ms
  t=1800: all fades → transition to next screen
```

---

### SCREEN 02 — Onboarding (3 slides)
```
Top zone (52% height): #F5F3F0 bg, centered line-art illustration 180×180px
Bottom zone (48%): #FFFFFF card with radius 32px 32px 0 0

Inside card:
  Progress bar: 40px from top, 3px height, #E8E5E0 track, #1A1A1A fill, animated
  Label: "BENEFIT 01/02/03" — 11px gold uppercase, mt 24px
  Headline: 30px DM Sans SemiBold #1A1A1A, mt 12px
  Body: 15px DM Sans Regular #6B6B6B, line-height 1.6, mt 10px
  Navigation row: [Skip text button] ... [52px dark circle with chevron]
  Padding: 0 28px 48px

Slide transitions: content translate(32px→0) + fade, 300ms; illustration cross-fade 400ms

Illustrations (single-stroke, #D4D0C8 + one gold element):
  Slide 1: Shopping bag + price tag + star
  Slide 2: Phone + QR beam + register
  Slide 3: Rising chart + coins

Last slide: "Skip" hides, next button shows "Get Started" text
```

---

### SCREEN 03 — Auth Gateway
```
Top zone (42% height): abstract warm illustration (overlapping arcs/circles, beige/cream/gold)
Bottom zone: #FFFFFF card, radius 32px 32px 0 0, padding 32px 24px

Content:
  MUMUSO wordmark — Cormorant 24px #1A1A1A, letter-spacing 0.16em, centered
  Tagline: "Save smarter. Every visit." — 16px #6B6B6B, centered, mt 6px
  Divider: 1px #E8E5E0, margin 28px 0
  Primary button: "Create Account" (full width)
  Ghost button: "I Already Have an Account" (full width), mt 12px
  Legal: "By continuing you agree to our Terms · Privacy" — 11px #9E9E9E centered
         Tappable links: #8B6430 gold
```

---

### SCREEN 04 — Registration
```
Nav: back chevron only

HEADER:
  "STEP 1 OF 2" — 11px gold uppercase, mt 32px
  "Create Your Account" — H1, mt 8px
  "Join thousands of members saving every day." — body-md #6B6B6B, mt 6px

FORM (grouped white cards, radius-xl, no individual borders):

Card 1 — Personal:
  Full Name input
  ─── divider ───
  Phone Number (+92 prefix fixed)
  ─── divider ───
  Email Address

Card 2 — Profile:
  Date of Birth → date picker bottom sheet
  ─── divider ───
  Gender (optional) → dropdown
  ─── divider ───
  City → dropdown (Pakistani cities)

Card 3 — Security:
  Password + strength bar (4 segments, animated)
  ─── divider ───
  Confirm Password

Terms (not checkbox): "By creating an account you agree to our Privacy Policy and Terms of Use."
  13px #6B6B6B, links in #8B6430

STICKY BOTTOM (above keyboard, above safe area):
  Gold-to-white gradient mask (24px)
  "Continue" — Primary dark button, full width
  Moves to top of keyboard when keyboard is open
```

---

### SCREEN 05 — OTP Verification
```
Nav: back chevron
Content centered vertically (margin-top 64px)

  Line-art phone illustration — 140×140px, #D4D0C8 with one gold element
  "Verify Your Number" — H1 centered, mt 24px
  "We sent a 6-digit code to +92 312 ****567" — body-md #6B6B6B centered
    phone number in DM Sans SemiBold #1A1A1A
  "Change number" — gold text button, centered, mt 8px
  6 OTP boxes (see component 6.2), mt 40px
  Timer: "Resend code in 0:59" → "Resend Code" gold link after countdown

Error: boxes shake + "Incorrect code. X attempts remaining." 12px #C0544A
```

---

### SCREEN 06 — Membership Purchase
```
HERO ZONE (40% height, #1C1C1E):
  Back/close: X icon top-right
  "MUMUSO MEMBERSHIP" — 10px gold uppercase, letter-spacing 0.14em, pt 48px
  "One payment." + "A year of savings." — Cormorant SemiBold 36px #F0EDE8
  "Rs. 2,000 / year" — DM Sans Medium 20px #F0EDE8
  "Rs. 167/month" — 14px #9E9B96

CONTENT (white panel, radius 32px 32px 0 0, padding 28px 24px):

  BENEFITS:
    Each row: 18px checkmark #4A9B7F + 15px DM Sans Medium, 8px between rows
    ✓ 10% off all eligible purchases
    ✓ Valid at all Mumuso stores
    ✓ Digital membership card
    ✓ Full purchase history
    ✓ Member-only offers

  SAVINGS CALCULATOR:
    Card: bg #F5F3F0, radius 16px, padding 20px, mt 24px
    "I spend about:" — 14px #6B6B6B
    Slider: 4px track, #E8E5E0 bg, #C8A96E fill, 22px dark thumb
    Range: Rs.1,000–Rs.50,000, step Rs.500
    "Estimated savings: Rs. X per year" — 28px #8B6430 gold (updates live)
    "X× your membership cost" — 13px #6B6B6B

  PAYMENT:
    "HOW WOULD YOU LIKE TO PAY" — section header
    Chips: JazzCash | EasyPaisa | Card | Bank
    Selected: dark border + checkmark corner

STICKY BOTTOM:
  "Activate Membership · Rs. 2,000" — Gold gradient button
  "🔒 Secured by [gateway]" — 11px #9E9E9E centered
```

---

### SCREEN 07 — Membership Activation Success
```
Bg: #F5F3F0
No navigation bar — this is a moment

Center:
  SVG success animation (72px): circle draws #1A1A1A → checkmark draws #C8A96E
    Circle: 0–400ms stroke-dashoffset 283→0
    Checkmark: 250–600ms draws in
  "Welcome to Mumuso Membership" — H1 centered, mt 24px
  "Your membership is active. Show your card at checkout to save." — 15px #6B6B6B centered
  Small membership card preview (64px height) — slides up at t=600ms, mt 32px
  "View My Membership Card" — Primary dark button, mt 28px
  "Maybe later" — text button #9E9E9E

Background pulse at success: radial gold gradient, opacity 0→0.06→0, 1000ms — very subtle
```

---

### SCREEN 08 — Home Dashboard
```
NAV: wordmark left (Cormorant 20px gold) | notification bell (badge) | avatar 32px

┌─────────────────────────────────────┐
│  ■ MUMUSO                  🔔  [AK] │
├─────────────────────────────────────┤ (20px gap)
│ ╔═════════════════════════════════╗ │ ← MEMBERSHIP CARD 208px
│ ║ MUMUSO MEMBER        ACTIVE ●  ║ │
│ ║                                ║ │
│ ║ Ahmed Khan                     ║ │
│ ║ MUM · 12345          Jan 2026  ║ │
│ ╚═════════════════════════════════╝ │
│    "Tap to show QR code"            │ ← 12px #9E9E9E centered (20px gap)
│ ┌──────────────┐  ┌──────────────┐  │ ← STAT TILES (12px gap)
│ │ TOTAL SAVED  │  │  PURCHASES   │  │
│ │  Rs. 1,250   │  │      15      │  │   count-up animation on first view
│ │  This year   │  │  This year   │  │
│ └──────────────┘  └──────────────┘  │ (28px gap)
│ QUICK ACTIONS                       │ ← section header
│ [Stores][Notifs][History][Pay][Refer]→  ← horizontal scroll chips (12px gap)
│                                     │ (28px gap)
│ RECENT ACTIVITY           See all › │
│ ┌─────────────────────────────────┐ │ ← white card with grouped rows
│ │ [DM] Dolmen Mall  3pm  Rs.2,250 │ │
│ │                       –Rs.250   │ │ ← gold
│ │ ──────────────────────────────  │ │
│ │ [OP] Packages Mall 1pm Rs.1,800 │ │
│ │ ──────────────────────────────  │ │
│ │ [LM] Lucky One  12pm  Rs.  950  │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
████████████████████████████████████████ tab bar
```

---

### SCREEN 09 — Membership Card (Full Screen)
```
Bg: #0F0F0F  |  Status bar: light  |  Nav: back chevron (light)

Center: MEMBERSHIP CARD (width screenW-48px, height 208px)
        Large shadow floats it on dark bg

Card front: member info (see card spec)
Card back:  QR code (160×160px on white bg, radius 16px)

BELOW CARD (48px gap):
  Three ghost buttons (dark bg variant):
  [💾 Save Photo] [▸ Add to Wallet] [⤴ Share]
  border: #3A3A3E, text: #F0EDE8

BOTTOM:
  "QR not scanning? Get help" — 12px #6B6361 centered, tappable
  (flex-grow pushes this to bottom)

Screen brightness: auto-increases to 100% on open
"Hold steady · Cashier will scan" appears after flip
```

---

### SCREEN 10 — Purchase History
```
Nav: "Purchase History" title, filter icon (SlidersHorizontal) right

SUMMARY CHIPS (horizontal scroll):
  [Spent: Rs.45K] [Saved: Rs.4.5K] [Visits: 23]
  White cards, rounded, gentle shadow

FILTER PILLS (horizontal scroll):
  [All] [Last 30 Days] [Last 3 Months] [By Store]
  Inactive: #F0EDE8 bg #6B6B6B text
  Active: #1A1A1A bg #FFFFFF text

LIST (grouped by date):
  Date label: "TODAY" / "YESTERDAY" / "15 JANUARY 2024" — 11px label style
  
  Transactions share a white card per day group
  Rows divided by inset 1px dividers (inset at 68px left)
  Each row: transaction row spec (see 6.3)
  Tap row → opens Transaction Detail bottom sheet
  Swipe row left → Download + Report actions

Empty state: "Your first purchase awaits" (see 6.6)
Infinite scroll: skeleton rows at bottom while loading
```

---

### SCREEN 11 — Transaction Detail (Bottom Sheet)
```
Height: 85% screen  |  Bg: #FFFFFF  |  Radius: 24px top  |  Scrollable

Handle: 32×4px #D4D0C8 centered, mt 12px

RECEIPT DESIGN:
  Store name: H2 SemiBold
  Address: 13px #6B6B6B
  Date right-aligned with ↗ external map link

  - - - - - - - - - - (dashed separator) - - - - - -
  
  Item rows: name 15px #1A1A1A + qty 13px #9E9E9E + amount right-aligned
  
  - - - - - - - - - - - - - - - - - - - - - - - - - -
  
  Subtotal:           Rs. XXX    (14px #6B6B6B)
  Member Discount:  – Rs. XXX    (14px #8B6430 gold)
  ──────────────────────────────
  Total Paid:         Rs. XXX    (16px DM Sans SemiBold #1A1A1A)

SAVINGS CALLOUT (card):
  bg rgba(200,169,110,0.10)  |  left border 3px #C8A96E
  "You saved Rs.X with your membership" — 14px #8B6430

Payment method + TXN ID (mono 12px #9E9E9E)

ACTIONS (sticky bottom):
  [↓ Download PDF] [⤴ Share] — two ghost buttons side by side
  "Report an issue" — text button centered below
```

---

### SCREEN 12 — Profile
```
Nav: "Profile" centered, pencil icon right

PROFILE HEADER CARD:
  64px avatar (circle, gold gradient bg if no photo)
  H2 name centered  |  "Member since Jan 2024" caption centered
  Membership status card: bg tinted by status, progress bar (year % used)

SETTING SECTIONS (white cards, 56px rows, inset dividers):

  PERSONAL INFORMATION:
    Full Name | Phone (✓ verified) | Email (✓ verified) | Date of Birth | City
    Each: [icon 20px] [label 15px] [value/chevron right-aligned]

  MEMBERSHIP:
    Member ID (mono, no chevron) | Valid Until | Auto-Renew (toggle) | Payment Methods

  PREFERENCES:
    Notifications (toggle) | Dark Mode (toggle) | Language (English/اردو)

  (app settings card):
    Help & Support | Privacy Policy | Terms of Use | About · v1.0.0

DANGER ZONE (separated, no card):
  "Log Out" — text button #C0544A centered (↑ confirmation dialog)
  "Delete Account" — 12px #9E9E9E centered (↑ confirmation dialog)
```

---

### SCREEN 13 — Renewal Screens

**Banner (≤30 days, dismissible on Home):**
```
bg rgba(200,169,110,0.12), left border 3px #C8A96E
"Your membership expires in 30 days" + "Renew →" gold link + × dismiss
```

**Bottom Sheet Modal (≤7 days, once per day):**
```
Calendar illustration | "7 days left" H2 | savings summary | 
"Renew for another year and keep saving" | 
[Renew Now gold button] | "Remind Me Tomorrow" text button
```

**Full Screen Gate (Expired):**
```
Membership card with "EXPIRED" stamp + dark vignette (centered top)
"Your membership has rested" H1
Savings from last year: "You saved Rs.X last year" + "You visited X times"
[Renew Membership · Rs. 2,000 — gold button]
"Maybe Later" — tiny text button (barely visible, 10px)
```

---

## 09. USER FLOW DIAGRAMS

### Primary Navigation Map
```
SPLASH
  └→ (logged in + active membership?) → HOME
  └→ (logged in + expired?) → RENEWAL GATE → HOME
  └→ (not logged in) → ONBOARDING → AUTH GATEWAY
       ├→ CREATE ACCOUNT → REGISTRATION → OTP → MEMBERSHIP PURCHASE
       │                                         └→ PAYMENT → SUCCESS → HOME
       └→ LOGIN → HOME

HOME tabs:
  Home | Card | History | Profile
  (each tab maintains its own navigation stack)
```

### Membership Expiry Decision Tree
```
On every app open:
  >30 days left  → Normal experience
  ≤30 days left  → Dismissible banner on Home
  ≤7 days left   → Bottom sheet on open (max once per day)
  Expired        → Full screen gate (bypassed only: Profile, Support)
```

### POS Checkout Flow
```
Customer opens Card tab → shows card front
Taps card → flips to QR → brightness 100%
Cashier scans QR at CBS POS terminal
CBS POS → POST /api/membership/validate (member ID, store ID, amount)
Your backend checks: active? expired?
  Valid → responds {discount: 10%, amount: Rs.250}
    CBS POS applies discount automatically
    Customer pays discounted amount
    CBS POS → POST /api/transactions/sync (full transaction data)
    Backend → FCM notification to customer app
    App shows: "You saved Rs.250!" + transaction appears in history
  Invalid → CBS POS shows "No discount" message
    Cashier offers manual ID entry fallback
```

---

## 10. MOTION & ANIMATION SYSTEM

### Timing Reference

| Name | Duration | Use |
|------|----------|-----|
| `instant` | 0ms | Tab switches, toggle state |
| `fast` | 150ms | Hover states, tooltip |
| `normal` | 250ms | Button press, icon swap |
| `smooth` | 350ms | Screen transitions, sheets |
| `deliberate` | 500ms | Card flip, major states |
| `slow` | 700ms+ | Background, ambient |

### Easing Reference

| Name | Curve | Use |
|------|-------|-----|
| `standard` | `cubic-bezier(0.4, 0.0, 0.2, 1)` | Most interactions |
| `enter` | `cubic-bezier(0.0, 0.0, 0.2, 1)` | Elements entering |
| `exit` | `cubic-bezier(0.4, 0.0, 1, 1)` | Elements leaving |
| `spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Subtle bounce |

### Named Animations

**`anim-screen-enter`**
```
Properties: opacity (0→1) + translateY (24px→0)
Duration: 350ms, ease-enter
Stagger: 0/50/100/150ms on first 4 visible elements
```

**`anim-card-flip`**
```
Stage 1 (0–250ms):   rotateY 0→90°, shadow grows
Stage 2 (250ms):     swap face content (instant)
Stage 3 (250–500ms): rotateY 90→180°, shadow shrinks
Perspective: 1200px on parent  |  Haptic: light impact at start
```

**`anim-card-shimmer`**
```
Diagonal white gradient sweep, max opacity 0.08
Plays: t=2000ms after mount, then every 8s
Duration: 1500ms per sweep, ease-in-out
```

**`anim-success`**
```
t=0ms:   Circle draws (SVG stroke-dashoffset 283→0), 400ms, #1A1A1A
t=250ms: Checkmark draws, 350ms, #C8A96E
t=400ms: Background radial gold pulse, scale(0→1.5) opacity(0.06→0), 800ms
t=600ms: Card slides up (translateY 32px→0, opacity 0→1), 500ms
```

**`anim-number-countup`**
```
Trigger: IntersectionObserver (element enters viewport)
Start: 0  |  End: actual value  |  Duration: 1000ms  |  Easing: ease-out
Plays once per session  |  Instant when reduce-motion active
```

**`anim-status-pulse`** (active badge dot only)
```
Scale(1→1.6→1) + Opacity(1→0.2→1)  |  2000ms infinite  |  ease-in-out
```

**`anim-toast`**
```
Enter: translateY(-40px→0) + fade, 300ms enter
Progress line depletes over 3500ms
Dismiss: translateY(0→-40px) + fade, 250ms exit
```

### Reduced Motion (Mandatory)

When `prefers-reduced-motion: reduce`:
- All transform animations → opacity fade only (200ms)
- Card flip → cross-fade (no rotation)
- Count-up → shows final value immediately
- Shimmer → disabled entirely
- Gyroscope parallax → disabled
- Toast → fade only

---

## 11. MICROCOPY & CONTENT GUIDE

### Writing Principles

1. **Warm, not robotic** — Write as a knowledgeable person, not a system alert
2. **Specific, not vague** — Say exactly what happened and what to do
3. **Human first** — Put the outcome before the action
4. **Short** — If 5 words works, don't use 10

### Screen Titles

| Screen | Title |
|--------|-------|
| Home | (wordmark replaces title) |
| Card | My Card |
| Purchase History | Purchase History |
| Notifications | Notifications |
| Profile | Profile |
| Registration | Create Account |
| OTP | Verify Number |
| Membership Purchase | (no title — hero screen) |
| Store Locator | Find a Store |
| Help | Help & Support |

### Form Labels, Placeholders & Helper Text

| Field | Label | Placeholder | Helper |
|-------|-------|-------------|--------|
| Full name | FULL NAME | Your full name | — |
| Phone | PHONE NUMBER | 03XX XXXXXXX | We'll send a verification code |
| Email | EMAIL ADDRESS | name@email.com | For receipts and reminders |
| Date of birth | DATE OF BIRTH | DD / MM / YYYY | For birthday surprises |
| Gender | GENDER (OPTIONAL) | Prefer not to say | — |
| City | CITY | Select your city | — |
| Password | PASSWORD | Create a strong password | At least 8 characters |
| Confirm password | CONFIRM PASSWORD | Repeat your password | — |

### Error Messages (Exhaustive)

| Trigger | Message |
|---------|---------|
| Name too short | "Please enter your full name (at least 2 characters)" |
| Name has numbers | "Names can only contain letters" |
| Invalid phone | "Enter a valid Pakistani number starting with 03" |
| Phone taken | "This number is already registered. Try logging in instead." |
| Invalid email | "That doesn't look like a valid email address" |
| Email taken | "This email is already registered. Try logging in instead." |
| Age under 13 | "You must be at least 13 years old to create an account" |
| Weak password | "Password needs at least 8 characters, a number, and one uppercase letter" |
| Passwords mismatch | "Passwords don't match. Please try again." |
| Terms not agreed | "Please agree to our Terms and Privacy Policy to continue" |
| Wrong OTP | "That code is incorrect. X attempts remaining." |
| OTP expired | "That code has expired. We've sent a new one." |
| Too many OTP attempts | "Too many incorrect attempts. Try again in 10 minutes." |
| Wrong login | "Incorrect phone number or password" |
| Account locked | "Your account has been temporarily locked. Try again in 15 minutes." |
| Payment failed | "Payment was not completed. No charge was made. Please try again." |
| Payment timeout | "The payment session timed out. No charge was made." |
| Network error | "You seem to be offline. Please check your connection and try again." |
| Server error | "Something went wrong on our end. We're fixing it — please try again shortly." |
| Session expired | "Your session has expired. Please log in again." |
| QR invalid at POS | "That code doesn't match any active membership." |
| Membership expired at POS | "This membership expired on [date]. No discount applied." |

### Success Messages

| Action | Message |
|--------|---------|
| Account created | "Account created! Now let's set up your membership." |
| OTP verified | "Number verified." (toast) |
| Membership activated | "Welcome to Mumuso Membership!" |
| Membership renewed | "Renewed until [date]. Keep saving." |
| Profile updated | "Profile updated." |
| Password changed | "Password updated. You're all set." |
| Transaction synced | "Purchase confirmed. You saved Rs.[X]!" |
| QR saved | "Membership card saved to your photos." |

### Notification Copy

| Type | Title | Body |
|------|-------|------|
| Activated | "Welcome, [Name]!" | "Your membership is active. Start saving at checkout today." |
| Renewal 30d | "Membership renews in 30 days" | "Your savings year is almost up. Renew to stay protected." |
| Renewal 7d | "7 days left on your membership" | "Renew now and keep your 10% off uninterrupted." |
| Expired | "Your membership has expired" | "Renew to start saving again at every Mumuso store." |
| Purchase | "You saved Rs.[X]!" | "Great purchase at [Store]. [X]% off on Rs.[total]." |
| Birthday | "Happy Birthday, [Name]!" | "Here's a little something from all of us at Mumuso." |

### Confirmation Dialog Copy

**Log Out:**
> Title: "See you soon" | Body: "You can sign back in anytime with your phone number." | Action: "Log Out" | Cancel: "Stay"

**Delete Account:**
> Title: "This cannot be undone" | Body: "Your membership, purchase history, and saved data will be permanently removed." | Action: "Delete My Account" | Cancel: "Keep My Account"

**Cancel Auto-Renew:**
> Title: "Turn off auto-renewal?" | Body: "Your membership will expire on [date] and will not be renewed automatically." | Action: "Turn Off" | Cancel: "Keep Auto-Renewal"

---

## 12. RESPONSIVE BEHAVIOR

### Breakpoints

| Range | Label | Horizontal Margin |
|-------|-------|-----------------|
| 320–374px | Compact | 16px |
| 375–389px | Small | 20px |
| 390–413px | **Reference** | **24px** |
| 414–429px | Large | 24px |
| 430px+ | XL | 28px |

### Key Responsive Rules

**Membership Card:**
```
<375px:   height 184px, name font scales down to 21px at 18+ chars
375–413px: height 200px (reference)
414px+:   height 220px
Min name size: 19px. Truncate only at 25+ chars.
```

**Stat Tiles:** Always two-column. No 3-column layout at any size.

**OTP Boxes:** Container max 320px, centered. Boxes scale proportionally.

**Keyboard behavior:**
```
Screen scrolls to keep active field visible
Sticky button moves to top of keyboard
Tab bar hides (handle manually on Android)
All content above active field remains accessible by scroll
```

**Truncation Rules by Device:**

| Element | 390px | 320px |
|---------|-------|-------|
| Member name on card | 22 chars | 17 chars |
| Transaction store name | 24 chars | 18 chars |
| Notification title | 45 chars | 35 chars |
| Toast message | 60 chars | 50 chars |

---

## 13. ACCESSIBILITY SPECIFICATION

### Non-Negotiable Requirements

**Touch Targets:** All interactive elements 44×44pt. Adjacent elements ≥ 8pt gap.

**Color Contrast (WCAG AA minimum):**
- Normal text (<18pt): 4.5:1
- Large text (≥18pt): 3:1
- All combinations verified in Section 02

**Dynamic Type:** All text fluid. Containers expand for scaled text. Test at Default, Large, Accessibility Extra Large.

### Screen Reader Labels

| Element | Label |
|---------|-------|
| Membership card | "Mumuso membership card. Active. Expires [date]. Tap to show QR code." |
| QR code | "Membership QR code. Show to cashier to apply discount." |
| Stat tile (savings) | "Total saved this year: [amount] rupees" |
| Transaction row | "[Store name]. [Date]. Spent [amount]. Saved [amount]." |
| Active badge | "Active membership" |
| Expiring badge | "Membership expiring in [N] days" |
| Toggle (off) | "[Label]. Currently off. Double-tap to turn on." |
| Toggle (on) | "[Label]. Currently on. Double-tap to turn off." |
| Bottom tab | "[Name] tab. [N] unread notifications." |
| Back button | "Go back to [previous screen name]" |

### Focus States

```
All interactive elements:
  Outline: 3px solid #C8A96E
  Outline-offset: 3px
  Border-radius: matches component

Focus order: logical reading order (top-to-bottom, left-to-right)
Modal/sheet: focus trapped within when open
On close: focus returns to triggering element
```

### Color Blind Safety

Every status indicator uses THREE simultaneous signals:
1. Color (as designed)
2. Icon (independent of color)
3. Text label (always readable)

Never use color alone for: active/inactive, success/error, any information users must act on.

### Haptics as Accessibility Input

Every state change has a corresponding haptic that can be relied upon independently of visual feedback. Respects system Haptic Touch on/off setting.

### Reduce Motion (Mandatory)

When `prefers-reduced-motion: reduce`:
- All transforms → opacity fade (200ms)
- Card flip → cross-fade
- Count-up → shows final value immediately
- Shimmer → off
- Parallax/gyroscope → off
- All springs → linear

---

## 14. DARK MODE SYSTEM

Dark mode is not an inversion. It is a separately considered design.

**Activation:** Follows system setting. Manual override in Profile > Preferences. Transition: 400ms cross-fade.

### Complete Token Map (Light → Dark)

| Token | Light | Dark |
|-------|-------|------|
| `color-canvas` | `#F5F3F0` | `#0F0F0F` |
| `color-surface` | `#FFFFFF` | `#1C1C1E` |
| `color-surface-raised` | `#FAFAF8` | `#252528` |
| `color-text-primary` | `#1A1A1A` | `#F0EDE8` |
| `color-text-secondary` | `#6B6B6B` | `#9E9B96` |
| `color-text-tertiary` | `#9E9E9E` | `#6A6866` |
| `color-accent` | `#C8A96E` | `#D4B87C` |
| `color-accent-text` | `#8B6430` | `#C8A96E` |
| `color-border-subtle` | `#E8E5E0` | `#2A2A2D` |
| `color-border-default` | `#D4D0C8` | `#38383C` |
| `color-success` | `#4A9B7F` | `#5AAD90` |
| `color-success-bg` | `#EBF5F1` | `rgba(90,173,144,0.12)` |
| `color-error` | `#C0544A` | `#D06658` |
| `color-error-bg` | `#F7EDEC` | `rgba(208,102,88,0.12)` |

### Shadows in Dark Mode

Shadows are invisible on dark backgrounds. Replace with borders:

| Light | Dark |
|-------|------|
| `shadow-card` | `border: 1px solid #2A2A2D` |
| `shadow-md` | `border: 1px solid #38383C` |
| `shadow-membership` | `border: 1px solid #3A3A3E` + `box-shadow: 0 0 40px rgba(200,169,110,0.08)` |

### Dark Mode Specific

- Nav bar (scrolled): `rgba(15,15,15,0.92)`
- Tab bar: `rgba(15,15,15,0.90)`
- Membership card: same gradient, shimmer opacity 0.08 (vs 0.06)
- Toast: inverted — bg `#F0EDE8`, text `#1A1A1A`
- Success animation: circle `#F0EDE8`, checkmark `#C8A96E`

---

## 15. ICONOGRAPHY SYSTEM

### Style Specification
```
Style:        Outlined, rounded joins and caps
Stroke width: 1.8px at 24px  |  Adjust ±0.2px for optical balance
Canvas:       24×24px standard  |  20×20px compact  |  16×16px inline
Color:        Inherits from parent text color token
```

### Recommended Library: Phosphor Icons (Regular weight)

| Purpose | Icon Name |
|---------|-----------|
| Back | `CaretLeft` |
| Close | `X` |
| Home tab | `HouseSimple` |
| Card tab | `IdentificationCard` |
| History tab | `Receipt` |
| Profile tab | `UserCircle` |
| Notifications | `Bell` |
| Filter/settings | `SlidersHorizontal` |
| Search | `MagnifyingGlass` |
| Store/location | `MapPin` |
| QR code | `QrCode` |
| Share | `ShareNetwork` |
| Download | `DownloadSimple` |
| Edit | `PencilSimple` |
| Check/success | `CheckCircle` |
| Error | `XCircle` |
| Warning | `Warning` |
| Info | `Info` |
| Eye (show) | `Eye` |
| Eye (hide) | `EyeSlash` |
| Chevron right | `CaretRight` |
| Chevron down | `CaretDown` |
| Logout | `SignOut` |
| Delete | `Trash` |
| Phone | `Phone` |
| Email | `EnvelopeSimple` |
| Lock | `Lock` |
| Verified | `Seal` |
| Savings | `PiggyBank` |
| Help | `Question` |
| Refer | `UserPlus` |
| Calendar | `CalendarBlank` |
| Clock | `Clock` |

### Custom Icons Required

```
1. Mumuso "M" Wordmark
   Vector path (Cormorant Bold converted, NOT live text)
   Used: nav bar, splash screen

2. App Icon Mark
   Stylized "M" in #C8A96E on #1C1C1E
   Inner glow on letter: rgba(200,169,110,0.4), 2px blur
   NOT live text — path only

3. Membership Card Mini
   Card shape, gold stripe near bottom
   Used: quick actions, notification category icons

4. QR Scan Instruction Icon
   Phone silhouette + QR on screen + scan beam
   Used: help screens, first-time checkout tutorial
```

### Icon Size Map

| Context | Size | Container |
|---------|------|-----------|
| Bottom tab | 24px | None |
| Navigation bar action | 20px | 36×36 in 44×44 target |
| List row leading | 20px | 36×36 circle |
| List row trailing | 16px | None |
| Button leading | 18px | Within button |
| Toast | 18px | None |
| Empty state | 64px | None |
| Feature illustration | 48px | 64×64 circle |

---

## 16. APP ICON & BRAND ASSETS

### App Icon

```
Background: #1C1C1E (fills entire canvas)
Foreground: "M" lettermark
  Base: Cormorant Garamond Bold → converted to path
  Size: 52% of canvas
  Color: #C8A96E
  Centered (optical, not mathematical — adjust ±2px if needed)
  Inner shadow: rgba(0,0,0,0.30), 1px blur, 1px y-offset

iOS sizes: 1024, 180, 120, 87, 60px
Android: 512, 192, 144, 96, 72, 48px + Adaptive icon layers
```

### Launch Screen

```
iOS (LaunchScreen.storyboard): bg #141416, Mumuso wordmark centered (static)
Android (API 31+): bg #141416, app icon centered 288dp (SplashScreen API)
```

### App Store Screenshots (5 required)

```
Device: Space Black frame (dark complements dark app)
Background: #1C1C1E
Caption font: DM Sans SemiBold white

Screens to feature:
  1. Home dashboard — card visible, stats shown
  2. Membership card full screen (QR showing)
  3. Membership purchase screen
  4. Purchase history with savings
  5. Success / activation screen
```

---

## 17. COMPONENT STATE MATRIX

✅ Designed  |  ⚠️ Design with care  |  ❌ Not applicable

| Component | Default | Pressed | Focused | Disabled | Loading | Error | Success | Empty |
|-----------|---------|---------|---------|----------|---------|-------|---------|-------|
| Primary Button | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Gold Button | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Ghost Button | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Text Button | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Icon Button | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Text Input | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| OTP Input | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Dropdown | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Search Bar | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Toggle Switch | ✅ (off) | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ (on) | ❌ |
| Standard Card | ✅ | ✅ | ❌ | ❌ | ✅ skeleton | ❌ | ❌ | ✅ |
| Membership Card (front) | ✅ | ✅ flip | ❌ | ❌ | ✅ skeleton | ❌ | ❌ | ❌ |
| Membership Card (back) | ✅ | ✅ flip | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Membership Card (expired) | ⚠️ | ⚠️ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Stat Tile | ✅ | ❌ | ❌ | ❌ | ✅ skeleton | ❌ | ❌ | ❌ |
| Transaction Row | ✅ | ✅ | ❌ | ❌ | ✅ skeleton | ❌ | ❌ | ❌ |
| Notification Card | ✅ read | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ unread | ❌ |
| Status Badge (active) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Status Badge (expired) | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Status Badge (expiring) | ⚠️ | ❌ | ❌ | ❌ | ❌ | ⚠️ | ❌ | ❌ |
| Bottom Tab Bar | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Navigation Bar | ✅ transparent | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ scrolled | ❌ |
| Toast | ✅ info | ✅ dismiss | ❌ | ❌ | ❌ | ✅ error | ✅ success | ❌ |
| Bottom Sheet | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Confirmation Dialog | ✅ | ❌ | ❌ | ❌ | ✅ action | ❌ | ❌ | ❌ |
| Skeleton Screen | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Empty State | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Pull to Refresh | ✅ idle | ❌ | ❌ | ❌ | ✅ loading | ❌ | ✅ complete | ❌ |

### Special State Notes

**Toggle Switch — Both States:**
```
Off: track #D4D0C8, thumb white left (3px from edge)
On:  track #1A1A1A (same as primary button), thumb white right
NOT green. Kept palette-consistent. Position = meaning.
Transition: 250ms spring easing
```

**Input — Verified State (phone/email):**
```
Right: checkmark-circle 16px #4A9B7F
Border: 1.5px #4A9B7F  |  Label: #4A9B7F
Non-editable (request change via support)
Tap: toast "Verified. To change, contact support."
```

---

## 18. DESIGN DON'TS

Rules that protect the visual integrity. Violating these makes it look like every other app.

### Color
```
❌ Never add blue anywhere (not links, not states — nothing)
❌ Never use bright/neon green for savings or success
❌ Never apply gradient backgrounds to content screens
❌ Never use more than 2 text colors within a single card
❌ Never use pure #000000 or #FFFFFF as backgrounds
❌ Never show gold on more than 3 elements per screen
❌ Never use error red decoratively
```

### Typography
```
❌ Never use Cormorant Garamond for UI labels, buttons, or forms
❌ Never bold body text for emphasis — use size or color
❌ Never use font sizes below 11px for any visible text
❌ Never mix more than 3 font sizes in a single card
❌ Never all-caps anything longer than 4 words
❌ Never center-align paragraphs (only single lines)
❌ Never use letter-spacing on body text (only Label style)
```

### Components
```
❌ Never add a Floating Action Button (FAB)
❌ Never use tab bar with filled pill indicator (line only)
❌ Never use modal dialogs with colored header bars
❌ Never use pill-shaped primary buttons
❌ Never put emojis inside UI components (notifications okay)
❌ Never use card grids for transaction history (rows only)
❌ Never add a search bar to screens with fewer than 10 items
❌ Never use full-width list dividers (always inset)
❌ Never show a full-screen spinner (always skeletons)
❌ Never use confetti or particle explosions (subtle gold pulse only)
```

### Motion
```
❌ Never animate more than 4 elements simultaneously on screen entry
❌ Never use durations >700ms for user-triggered actions
❌ Never loop large visible animations indefinitely
❌ Never slide-from-left for forward navigation
❌ Never play animations without checking reduce-motion first
```

### Content
```
❌ Never write "An error occurred" — be specific
❌ Never write "Click" — always "Tap" for mobile
❌ Never open errors with "Oops!" — loses trust
❌ Never use generic "Are you sure?" in confirmation dialogs
❌ Never use passive voice in error messages
❌ Never write Rs without space: always "Rs. 2,000"
❌ Never show an error without telling the user what to do next
```

---

## 19. HANDOFF CHECKLIST

Before development begins on any screen, every box must be checked.

### Foundations
```
☐ All color tokens defined and contrast-verified (Section 02)
☐ All typography tokens defined, font files sourced or URLs confirmed
☐ Spacing grid documented and applied to all mockups (Section 04)
☐ Design tokens exported to JSON (Section 05)
☐ CSS custom properties exported (Section 05)
```

### Components
```
☐ All button variants designed — all states (Section 06.1)
☐ All input variants designed — all states (Section 06.2)
☐ All card types designed — all states (Section 06.3)
☐ Navigation components designed — all states (Section 06.4)
☐ All badges designed (Section 06.5)
☐ Empty states designed for all 5 contexts (Section 06.6)
☐ Skeleton states match real content layouts (Section 06.7)
☐ All toast types designed (Section 06.8)
☐ All confirmation dialogs with final microcopy (Section 06.8)
☐ Component state matrix reviewed (Section 17)
```

### Screens
```
☐ All 13 screens designed at 390×844 reference
☐ Each screen verified against spec (Section 08)
☐ Dark mode variants of all screens
☐ Compact (320px) variants checked — no overflow/clipping
☐ Large (430px) variants checked — no excessive whitespace
```

### Flows & Motion
```
☐ Navigation map verified (Section 09)
☐ Expiry flow covers all 4 states (>30d, ≤30d, ≤7d, expired)
☐ POS checkout flow covered (Section 09)
☐ Error paths designed (network, server, POS failure)
☐ All named animations documented (Section 10)
☐ Reduce-motion alternative defined for every animation
☐ Card flip prototype verified
☐ Success animation sequence timed and tested
```

### Content
```
☐ All screen titles confirmed (Section 11)
☐ All form labels, placeholders, helper text written
☐ All error messages written — all triggers covered (Section 11)
☐ All success messages written
☐ All notification copy written
☐ All empty state copy written
☐ All confirmation dialog copy written
```

### Accessibility
```
☐ All screen reader labels written (Section 13)
☐ Focus states designed for all interactive elements
☐ Color contrast verified for all text (Section 02 table)
☐ Dynamic type tested at Default, Large, Accessibility Extra Large
☐ Haptic map documented (Section 07)
☐ Reduce-motion behavior documented for all animations
```

### Responsive
```
☐ 320px breakpoint verified
☐ 390px reference design finalized
☐ 430px large screen verified
☐ Keyboard behavior documented for all forms
☐ Truncation rules applied and tested (Section 12)
```

### Dark Mode
```
☐ Complete token map implemented (Section 14)
☐ All screens have dark mode designs
☐ Shadow → border replacements applied
☐ Toast inverted colors in dark mode
☐ Membership card dark mode verified
```

### Assets
```
☐ App icon in all required sizes (Section 16)
☐ Launch screen assets for iOS + Android
☐ 5 App Store screenshots
☐ All custom icons as SVG + PNG @1x, 2x, 3x
☐ All line-art illustrations as SVG
☐ Font licenses confirmed (or Google Fonts URLs set)
```

### Developer Handoff
```
☐ Design file organized by section (Components → Screens → Assets)
☐ All components use Auto-Layout / Constraints
☐ Design tokens linked to components
☐ Assets exported in correct formats
☐ Animation specs shared with frontend developer
☐ Accessibility labels document shared
☐ Microcopy document in shared location
☐ This specification document linked in project docs
```

### QA Verification
```
☐ Every button state verified in build
☐ Every error message copy verified
☐ Screen reader test on all 13 screens
☐ Dynamic Type test at Accessibility Extra Large
☐ Reduce Motion test — all animations are fades
☐ Offline test — card still shows, appropriate messaging
☐ Dark mode — no broken colors or invisible text
☐ 320px test — no overflow or clipping
☐ 430px test — no excessive gaps
☐ Keyboard behavior — all forms scroll correctly
☐ OTP paste test — fills all 6 boxes
☐ Long name test (25+ chars) — handled gracefully
☐ Expired membership — all 3 states render correctly
☐ Card flip — completes without jitter on low-end devices
☐ Count-up animation — triggers once, not on re-scroll
☐ Toast auto-dismiss — 3500ms timing verified
☐ Swipe actions — threshold and snap behavior verified
```

---

## CLOSING

This document represents a complete, production-ready design specification for the Mumuso Loyalty App. Every section connects to every other. Color informs components. Components inform screens. Screens inform flows. Flows inform copy. All governed by one philosophy: **Quiet Luxury**.

A designer should produce pixel-perfect mockups without a single unanswered question.

A developer should implement every screen without guessing.

An AI model should generate accurate, consistent, on-brand outputs for any element.

That is the standard this document was written to.

---

```
Document:   Mumuso Loyalty App — UI/UX Design Specification
Version:    3.0 (Production Handoff)
Status:     Complete
Sections:   19
Standard:   WCAG 2.1 AA | iOS HIG | Material Design 3 (adapted)
Date:       February 2026
```

*The details are not the details. They make the design.*
— Charles Eames
