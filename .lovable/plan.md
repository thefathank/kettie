

## Complete UI Overhaul — Premium Dark Glassmorphic Design

This is a visual-only overhaul. No functionality, routing, or data logic changes.

### Step 1: Fonts & index.html
Add Satoshi (Fontshare CDN) and Geist Sans/Mono (CDN) font imports to `index.html`.

### Step 2: Tailwind Config
Update `tailwind.config.ts`:
- Add `fontFamily` entries: `heading` (Satoshi), `sans` (Geist Sans), `mono` (Geist Mono)
- Keep all existing color/animation config

### Step 3: CSS Variables & Dark-Only Theme (`src/index.css`)
Replace `:root` and `.dark` blocks with a single dark-only palette:
- `--background`: black (#000000)
- `--foreground`: near-white (#fafafa)
- `--card`: rgba(255,255,255,0.04) equivalent in HSL
- `--primary`: emerald (#10b981 → HSL 160 84% 39%)
- `--muted-foreground`: #a1a1aa
- `--border`/`--input`: very subtle white (approx HSL 0 0% 12%)
- `--sidebar-background`: #0a0a0a glass
- `--destructive`: muted red, `--accent`: muted amber
- Add body radial gradient background, force `dark` class on `<html>`

### Step 4: Card Component (`src/components/ui/card.tsx`)
Add glassmorphic styling: translucent bg, `backdrop-blur-xl`, subtle white border, `rounded-2xl`, hover glow with emerald shadow, `transition-all duration-150`.

### Step 5: Button Component (`src/components/ui/button.tsx`)
- Primary: emerald bg, white text, glow shadow on hover
- Outline/Ghost: subtle white border, emerald text on hover
- All: `rounded-[10px]`

### Step 6: Input Component (`src/components/ui/input.tsx`)
Dark glass bg (`rgba(255,255,255,0.05)`), subtle border, emerald focus ring, `rounded-[10px]`.

### Step 7: Logo Redesign (`src/components/Logo.tsx`)
Replace tennis ball SVG with an abstract geometric "P³" monogram mark in emerald on transparent bg. White wordmark using Satoshi bold. Works on black backgrounds, suitable as favicon.

### Step 8: Layout/Sidebar (`src/components/Layout.tsx`)
- Sidebar: dark glass bg (`bg-black/80 backdrop-blur-xl`), subtle border
- Active nav link: 3px emerald left border + faint emerald bg tint
- Mobile header: same dark glass treatment
- Sign-out button: ghost/outline style matching new palette

### Step 9: StatCard (`src/components/StatCard.tsx`)
Large value text in `font-mono` (Geist Mono), icon with faint emerald tint.

### Step 10: Landing Page (`src/pages/Landing.tsx`)
- Dark gradient background with emerald radial glow
- Satoshi headings, Geist body
- Glass cards for features, "Who It's For", testimonials
- Nav: backdrop-blur glass bar
- CTA buttons: emerald primary with glow, ghost outline secondary

### Step 11: Auth Page (`src/pages/Auth.tsx`)
- Dark bg with gradient, glass card for form
- Remove tennis emoji, use new Logo component
- Emerald focus rings on inputs

### Step 12: Pricing Page (`src/pages/Pricing.tsx`)
- Dark bg, glass pricing cards
- Emerald accents for checkmarks and primary tier
- Amber accents preserved for academy tier but muted to fit dark palette

### Step 13: Footer (`src/components/Footer.tsx`)
Dark glass panel, emerald hover accents on links.

### Step 14: All Remaining Pages
Apply consistent dark glass styling to Dialog components, tables (subtle row dividers, emerald hover tint), empty states, and skeleton loaders across all ~20 page files. Most changes are className updates only.

### Step 15: Dialog/Sheet Components
Update `src/components/ui/dialog.tsx` and `src/components/ui/sheet.tsx` overlay and content styling for glass panel treatment.

### Step 16: Force Dark Mode
Add `class="dark"` to `<html>` in `index.html` and remove any light-mode CSS variable block.

### Technical Notes
- ~25 files modified, all className/styling changes
- No business logic, routing, or data fetching touched
- All shadcn/ui tokens updated via CSS variables so most components inherit automatically
- Card, Button, Input, Dialog get direct component-level style updates for glassmorphism effects that can't be expressed via CSS variables alone

