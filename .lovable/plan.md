

## Replace "See It In Action" with Linear-Style Interactive Dashboard Prototype

### What changes
Replace the current scroll-scene section (lines 429-481 in `Landing.tsx`) with a single full-width interactive prototype that mimics Linear's homepage approach: a live, functional-looking app UI embedded directly in the page, not separate mockup cards.

### Design approach — Linear-style embedded app

Instead of three alternating text+mockup scenes, build one large glassmorphic "app window" that visitors can interact with:

**Layout**: Full-width glass container with:
- A **sidebar** on the left (~200px) with nav items (Dashboard, Clients, Schedule, Lessons, Payments) — each clickable
- A **main content area** on the right that swaps content based on which sidebar item is selected
- A macOS-style title bar with traffic light dots at the top

**Interactive behavior**:
- `useState` tracks the active "view" (default: Dashboard)
- Clicking sidebar items swaps the main content panel with a smooth crossfade
- Each view renders a dense, data-rich mockup matching the actual app's design system

**Five views**:
1. **Dashboard** — stat cards grid (Clients: 24, Sessions: 128, Revenue: $4,200, Growth: +18%), mini schedule list, mini revenue chart bars
2. **Clients** — table-style list with 5 fake clients (name, email, sessions count, status badge)
3. **Schedule** — mini calendar grid + today's sessions list
4. **Lessons** — lesson template cards with exercise lists and checkboxes
5. **Payments** — payment table rows with amounts in mono, status pills (Paid/Pending)

**Visual style**:
- The entire prototype sits in a glass card with `shadow-[0_40px_100px_rgba(0,0,0,0.5)]` and a subtle emerald glow underneath
- Sidebar items highlight with emerald background when active
- Content transitions use framer-motion `AnimatePresence` with opacity+translateY
- Section heading above: "See it in action." in the existing massive Satoshi style
- Subtle gradient glow behind the entire prototype container

### Technical details
- **File modified**: `src/pages/Landing.tsx` only
- Remove the `scenes` array and the scroll-scenes section (lines 94-177 and 429-481)
- Add a new `InteractivePrototype` component inline (or as a const within the Landing component)
- New state: `const [activeView, setActiveView] = useState<string>("dashboard")`
- No new dependencies — uses existing framer-motion, lucide icons, and Tailwind
- No functionality changes — all existing waitlist, nav, routing untouched
- Mobile: sidebar collapses to a horizontal tab bar above the content area

