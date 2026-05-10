# /design

Design system for SquadCredit. Read before building any UI component.

## Brand direction

SquadCredit borrows visual language from Hayvn — confident, modern, well-considered, opinionated typography, lots of negative space, tactile components — but uses Squad's brand palette to feel native to the Squad product family. The result should feel like a real Squad product line, not a generic fintech dashboard.

## Color tokens

### Primary (Squad brand)

- `--squad-orange`: `#F25C19` — primary CTAs, active states, brand accent
- `--squad-orange-50`: `#FEF1EB`
- `--squad-orange-100`: `#FDE0D2`
- `--squad-orange-500`: `#F25C19`
- `--squad-orange-600`: `#D44A0F`
- `--squad-orange-700`: `#A93808`
- `--squad-red`: `#9A1F2A` — secondary brand, used sparingly for emphasis
- `--squad-red-700`: `#7A1620`

### Surfaces

- `--surface-base`: `#FAFAF7` — page background, warm off-white (NOT pure white)
- `--surface-raised`: `#FFFFFF` — cards, modals, sheets
- `--surface-sunken`: `#F4F3EE` — input backgrounds, secondary panels
- `--surface-muted`: `#EDEBE3` — dividers, hover states on muted elements

### Typography

- `--text-primary`: `#1A1815` — body text, headers
- `--text-secondary`: `#5C5852` — supporting copy, labels
- `--text-tertiary`: `#8B867E` — hints, timestamps, very secondary
- `--text-on-brand`: `#FFFFFF` — text on orange/red backgrounds

### Semantic

- `--success`: `#0F7A4D` — repaid loans, score increases, positive deltas
- `--success-bg`: `#E8F4ED`
- `--warning`: `#B8730A` — pending states, score drops, attention
- `--warning-bg`: `#FBF1DC`
- `--danger`: `#A8211A` — overdue, errors, defaults
- `--danger-bg`: `#FAE8E6`

### Borders

- `--border-subtle`: `rgba(26, 24, 21, 0.08)` — default card borders
- `--border-default`: `rgba(26, 24, 21, 0.14)` — input borders, dividers
- `--border-strong`: `rgba(26, 24, 21, 0.24)` — focus rings, emphasized borders

## Typography

### Font stack

- Primary: `'Inter', system-ui, sans-serif` — load from Google Fonts
- Display (optional, for the hero number on the dashboard): `'Instrument Serif', serif` — used sparingly, only for the trust score and key amounts to give it editorial weight
- Mono: `'JetBrains Mono', ui-monospace, monospace` — for NUBANs and transaction references

### Scale

- Display 1: 56px / 60px line / -0.02em tracking / 500 weight — only the trust score
- Display 2: 40px / 44px / -0.015em / 500 — section heroes (today's inflows)
- H1: 28px / 34px / -0.01em / 500 — page titles
- H2: 22px / 28px / -0.005em / 500 — card titles
- H3: 18px / 24px / 500 — subsections
- Body: 15px / 22px / 400 — default
- Body-sm: 13px / 18px / 400 — supporting copy
- Caption: 12px / 16px / 500 / 0.02em tracking, uppercase — labels, badges
- Mono: 14px / 20px / 400 — NUBANs, references

### Rules

- Sentence case throughout. NEVER use Title Case or ALL CAPS except for `caption` style on labels/badges.
- Never use 600+ font weights for body text. 400 regular, 500 medium are the only weights.
- For naira amounts, use tabular figures: `font-feature-settings: "tnum"`
- Display 1 and Display 2 use Instrument Serif. Everything else is Inter.

## Spacing scale

4px base. Use 4, 8, 12, 16, 20, 24, 32, 40, 48, 64. Never arbitrary values.

## Radii

- `--radius-sm`: 6px — pills, small badges
- `--radius-md`: 10px — buttons, inputs
- `--radius-lg`: 16px — cards
- `--radius-xl`: 24px — modal sheets, hero cards
- `--radius-full`: 9999px — fully rounded pills

Cards generally use `--radius-lg`. The hero score card on the dashboard uses `--radius-xl` to feel special.

## Shadows

Sparingly. Two only:

- `--shadow-card`: `0 1px 2px rgba(26,24,21,0.04), 0 1px 3px rgba(26,24,21,0.04)` — default card lift
- `--shadow-elevated`: `0 4px 12px rgba(26,24,21,0.08), 0 2px 4px rgba(26,24,21,0.04)` — modals, dropdowns

No glow effects. No colored shadows. No shadow on flat surfaces.

## Component direction

### Buttons

Primary: solid `--squad-orange` background, white text, `--radius-md`, 14px vertical padding, 24px horizontal. On hover, darken to `--squad-orange-600`.

Secondary: white background, `--text-primary` text, `--border-default` 1px border. On hover, background shifts to `--surface-sunken`.

Tertiary/ghost: no background, no border, `--text-primary` text. On hover, light `--surface-sunken` background.

Destructive: solid `--danger` background, white text. Same shape as primary.

All buttons have a subtle `transform: scale(0.98)` on `:active` for tactile feel.

### Cards

- Background: `--surface-raised`
- Border: 1px `--border-subtle`
- Radius: `--radius-lg`
- Padding: 24px default
- Shadow: `--shadow-card`

The hero score card breaks these rules: 32px padding, `--radius-xl`, no border, subtle linear gradient background from `--squad-orange-50` to `--surface-raised`.

### Inputs

- Background: `--surface-sunken`
- No visible border by default — uses background color to define edge
- 1px `--border-strong` on focus, with `--squad-orange` ring
- 14px vertical padding, 16px horizontal
- `--radius-md`

### Score display

The trust score (0-1000) is the visual centerpiece of the trader dashboard. Treatment:

- Display 1 size (56px) using Instrument Serif
- Color shifts based on tier: 0-499 `--text-secondary`, 500-649 `--squad-orange`, 650-799 `--success`, 800+ `--squad-red` (red is "elite," not bad here)
- Animated counter when score changes (use `framer-motion`)
- Tiny delta arrow next to it: green up arrow `+9` when score rises, etc.

### Transaction list rows

- 56px row height
- Sender name in body weight, amount tabular and right-aligned in body-sm
- Time in caption style, `--text-tertiary`, far right
- Subtle horizontal divider between rows: 1px `--border-subtle`
- On row tap: brief background flash to `--surface-sunken`

### Charts

- Use `recharts` only
- Single accent color per chart, `--squad-orange`
- No grid lines, no axes lines
- Tooltips: `--surface-raised` background with `--shadow-elevated`, `--radius-md`
- Numeric labels in mono, tabular figures

## Microcopy rules

### Voice

- Direct, no fintech jargon, sentence case
- Use the trader's first name freely once known
- Numbers in naira: `₦19,400` (with comma separator, no decimals for whole amounts, two decimals only when there are kobo)
- Percentages without space: `15%` not `15 %`
- Dates: "Today, 2:45pm" / "Yesterday, 10am" / "Mon 5 May" — never raw timestamps in UI

### Tone examples (good)

- "You can borrow up to ₦19,400 right now."
- "Sade, your score went up by 9 points today."
- "Auto-saved ₦625 from this payment."
- "Loan repaid. Nice work."

### Tone (avoid)

- "Congratulations!" (over-eager)
- "Disbursement initiated." (corporate)
- "Click here to access your funds." (generic)
- "ERROR: Transaction failed." (shouty, vague)

### Error states

- Always tell the user what happened in plain language and what to do next
- Examples: "We couldn't reach Squad. Try again in a moment." / "Your daily limit is reached. Resets at midnight."

## Animation

- Reach for motion sparingly. Most things should not animate.
- Score updates: use `framer-motion` `<motion.span>` with `key` change to retrigger a soft 400ms counter roll-up
- Transaction arrival: new row slides in from top with 250ms ease-out, 8px translate
- Modal entrance: fade + 4px translate up, 180ms
- No bouncing, no springs, no parallax. Restraint.

## What we do not do

- No glassmorphism (this is not Hayvn's marketing site)
- No gradients except the one on the hero score card
- No 3D effects, no neumorphism
- No emojis in product UI (deck and marketing only)
- No icons-only buttons without aria-label
- No raw timestamps shown to users
- No fintech buzzwords ("seamless," "powerful," "leverage," "ecosystem")
