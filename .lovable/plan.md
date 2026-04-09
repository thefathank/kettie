

## Landing Page Hero & Visual Overhaul

### Problem
The current hero has overly italic fonts, awkward spacing, and uses old mockup screenshots that don't match the new dark glassmorphic design system. The user wants futuristic graphics and/or actual views of the current dashboard.

### Plan

**Step 1: Fix hero typography and spacing**
- Remove `italic` from the hero heading — use Satoshi black, upright, with tighter tracking (`-0.04em`)
- Increase heading size slightly (`text-[80px]` on desktop) with better line-height (`leading-[0.95]`)
- Tighten vertical spacing: reduce gap between heading → subheading → CTAs
- Make subheading slightly larger (`text-xl`) with better letter-spacing
- Add a second CTA button ("See Demo" ghost/outline) alongside the primary
- Remove the decorative SVG arc lines — they add clutter

**Step 2: Replace mockup screenshots with futuristic abstract graphics**
- Remove the static mockup-dashboard.png from the hero entirely
- Replace with a futuristic abstract graphic composition: a set of glassmorphic floating UI cards/panels arranged in a 3D perspective layout
- These cards will be pure CSS/HTML — not images — containing fake dashboard data (stat numbers, mini chart bars, schedule rows) styled with the actual design system
- Cards float at different depths with the existing mouse-parallax effect, creating a "dashboard exploded view"
- Each card gets a subtle emerald glow and glass treatment
- This approach: no external images needed, matches the live design system, looks futuristic

**Step 3: Update the "Product in Action" scroll scenes**
- Replace the three mockup images (`mockup-dashboard.png`, `mockup-schedule.png`, `mockup-lessons.png`) with browser-framed screenshots of the actual current app
- Take fresh screenshots of the Dashboard, Schedule, and Lessons pages using the browser tool, then save them as new assets
- Alternatively, build inline CSS mockup frames that mirror the actual UI using the glassmorphic cards, stat cards, and table styles already in the design system — no images needed

**Step 4: Tighten section spacing globally**
- Reduce excessive padding between sections (currently `py-28` everywhere)
- Use `py-20` for standard sections, `py-28` only for the final CTA
- Tighten inner element spacing for a denser, more confident layout

### Technical Details
- **Files modified**: `src/pages/Landing.tsx` (primary), possibly `src/index.css` for any new utility classes
- **No new dependencies** — all graphics are CSS/HTML components
- **No functionality changes** — waitlist form, navigation, routing all untouched
- The floating UI cards in the hero use `transform: translate3d()` driven by the existing `mousePos` state for parallax depth

