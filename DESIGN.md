---
name: Schoolhouse
description: A campus handbook for the everyday work of a school.
colors:
  pine: "#173e35"
  green: "#285747"
  paper: "#f7f8f3"
  ink: "#243c34"
  muted: "#68716a"
  line: "#e5e8e0"
  white: "#fff"
  selected-nav: "#e3eccd"
  welcome: "#e9eddd"
  present-bg: "#ecf3e6"
  present-text: "#3c6335"
  late-bg: "#faf1df"
  late-text: "#7e6122"
  absent-bg: "#f9ebe5"
  absent-text: "#994733"
  focus: "#a1b95b"
  danger: "#a34d37"
typography:
  display:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "40px"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "32px"
    fontWeight: 400
  title:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "15px"
    fontWeight: 550
    letterSpacing: "-0.02em"
  body:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "12px"
    fontWeight: 500
  table:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "11px"
    fontWeight: 400
  table-heading:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "10px"
    fontWeight: 500
rounded:
  badge: "5px"
  field: "6px"
  control: "7px"
  panel: "14px"
  dialog: "15px"
spacing:
  compact: "8px"
  control: "16px"
  form-gap: "18px"
  section-gap: "24px"
  panel-inline: "25px"
  page-inline: "42px"
components:
  button-primary:
    backgroundColor: "{colors.pine}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "11px 16px"
    typography: "{typography.label}"
  button-secondary:
    backgroundColor: "{colors.white}"
    textColor: "#405340"
    rounded: "{rounded.control}"
    padding: "11px 16px"
    typography: "{typography.label}"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "11px 16px"
    typography: "{typography.label}"
  input:
    backgroundColor: "{colors.white}"
    textColor: "#3b5137"
    rounded: "{rounded.field}"
    padding: "10px 11px"
  navigation-active:
    backgroundColor: "{colors.selected-nav}"
    textColor: "#203e32"
    rounded: "{rounded.control}"
    height: "44px"
    padding: "0 14px"
  badge-present:
    backgroundColor: "{colors.present-bg}"
    textColor: "{colors.present-text}"
    rounded: "{rounded.badge}"
    padding: "3px 9px"
  panel:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.panel}"
---

# Design System: Schoolhouse

## Overview

**Creative North Star: "The Campus Handbook"**

The calm precision of a campus handbook, translated into a daily school workspace. Warm paper, pine navigation and literary headings give school administration a human voice, while compact sans-serif records keep the work clear.

The system is restrained and lightly ruled. Color carries location and status; typography separates welcome and orientation from editing and inspection. Small contextual illustrations belong to the school world, while working controls remain direct.

**Key Characteristics:**
- Literary serif orientation paired with precise sans-serif records.
- Warm paper and pine with quiet botanical accents.
- Flat bordered panels, compact tables and visible keyboard states.

## Colors

Pine and warm paper establish the school world; subdued semantic colors distinguish attendance without overpowering records. The frontmatter owns exact values; `frontend/src/styles.css` is the implementation source.

### Primary
- **Pine:** persistent navigation, primary actions and caret color.
- **Working Green:** supporting botanical accent, subordinate to pine.

### Secondary
- **Selected Leaf:** active navigation fill with dark text.
- **Welcome Sage:** broad welcome surface rather than a general card fill.
- **Present, Late and Absent:** green, amber and terracotta text/background pairs for explicit attendance states. Red also marks destructive actions.

### Neutral
- **Warm Paper:** workspace canvas.
- **School Ink:** default text.
- **Secondary Ink:** supporting labels, placeholders and footer information; preserve the final corrected contrast.
- **Rule:** quiet panel boundaries and dividers.
- **White:** data panels and controls.

**The Working Ink Rule.** Use ink for records and pine for navigation and primary actions; reserve pale status colors for labeled states.

## Typography

**Display Font:** self-hosted Instrument Serif, with Georgia and serif fallbacks; regular and italic faces are included.
**Body Font:** self-hosted DM Sans, with sans-serif fallback; variable weight supports the compact hierarchy.

**Character:** literary orientation above a precise working layer. Italic serif adds warmth to the welcome message; it does not spread into controls.

### Hierarchy
- **Display:** page headings use the display token; responsive headings range from 35px on mobile to 40px on desktop. Welcome headings range from 33px on narrow screens to 48px above the wide breakpoint.
- **Headline:** dialog titles use the headline token, reducing to 30px on small screens. Empty states also use the serif.
- **Title:** panel headings use the title token; directory headings use 14px.
- **Body:** the root body is 14px; page explanations and empty-state copy use 12–13px.
- **Label:** form labels and action labels use compact sans. Mobile form controls increase to 16px rather than magnifying the full interface.
- **Table:** records use the table role and lighter secondary lines. Headers use the table-heading role. Tables, totals, chart summaries and schedule times use tabular numerals.

**The Two Voices Rule.** Use the serif for orientation and the sans for working data, labels and controls.

## Layout

A fixed desktop sidebar is 236px wide with a matching content offset. It narrows to 214px at 1180px and 192px at 950px. The top bar is 76px high; desktop main content uses 42px side padding and a 1570px maximum width. Overview panels use a 1.2fr/1fr grid and 24px gaps, with slightly wider attendance emphasis above 1500px.

At 760px navigation becomes an off-canvas 236px drawer with a scrim; the content offset disappears and the top bar becomes 62px. At 570px main gutters become 16px, overview panels stack, heading actions wrap, and search occupies a full row. Tables retain their column structure in a horizontally scrollable region; directory tables have a 610px minimum below 950px, recent enrollments 640px below 570px. Secondary page details can disappear as space narrows, but records remain inspectable.

Forms use a two-column grid with 18px gaps, wide fields spanning both columns. The dialog is at most 580px wide, inset 16px from viewport edges; small screens use 12px insets and 16px field gaps. Preserve the dense but orderly rhythm rather than introducing a uniform oversized spacing scale.

## Elevation & Depth

Ordinary panels are flat white with thin rules. Tonal changes organize the welcome panel and navigation; overlays alone receive diffuse depth.

### Shadow Vocabulary
- **Record dialog:** `0 20px 80px #102a3429`, paired with a translucent `#142d2670` backdrop.
- **Confirmation toast:** `0 8px 35px #142d261a`, above the workspace near the lower center.

**The Quiet Surface Rule.** Keep ordinary panels flat; reserve diffuse shadows for dialogs and notifications.

Motion is brief and state-led: background/color transitions generally last 0.18s; the navigation drawer slides over 0.25s, dialogs enter over 0.26s, and chart heights settle over 0.6s using the implemented ease. Preserve the reduced-motion override from the stylesheet.

## Shapes

Soft rectangular geometry distinguishes working controls from containers: fields use the field radius, action buttons and navigation use the control radius, panels use the panel radius, and dialogs use the dialog radius. Status badges are small rounded rectangles, not capsules. Person avatars are circles; course icons sit in small rounded squares. Thin borders and clipping provide structure without heavy outlines.

## Components

### Buttons
Compact, calm and explicit. Primary actions use pine with white labels; secondary actions use white with a pale border; destructive confirmation uses terracotta. All share 11px/16px padding and a 39px minimum desktop height. Primary hover becomes `#2f5c48`; secondary hover becomes `#edf0e6`; danger hover becomes `#873f2d`. Disabled buttons reduce opacity to 0.48. Keyboard focus uses a 3px olive outline with 3px offset.

### Chips
Attendance and grade badges use 10px medium-weight text, 3px/9px padding and the badge radius. Meaning is written explicitly; the small green status dot supplements the label. Neutral badges represent ungraded or ordinary values.

### Cards / Containers
Panels have white fill, a 1px rule border and clipped corners. Headings use 23px/25px/0 padding; the table or chart supplies its own interior spacing. The sage welcome panel has a distinct copy region and a separately ruled totals strip.

### Inputs / Fields
Form controls have white fill, a pale `#d7dfcc` border, 10px/11px padding and a 40px minimum height. Focus changes the border to `#7d9866` and preserves the shared visible outline. At 570px they use 16px text and at least 43px height. The search container instead uses a 2px `#91a969` focus-within outline; its input suppresses the duplicate outline. Error feedback is a readable terracotta block above the footer. Keep native input and select semantics.

### Navigation
The pine sidebar uses 13px labels and inline stroke SVG icons. Links are 44px high with a 6px vertical gap. Hover lightens the pine field; the selected leaf row switches to dark text and medium weight, with a count or dot at its trailing edge. The same links live inside the mobile drawer.

### Ruled records
Tables use pale header bands, subtle row dividers and a near-white hover field. Identity cells pair circular initials with a name and secondary email. Directory rows use 17px vertical padding, reducing to 15px on small screens. Edit buttons become fully visible on row hover or keyboard focus and remain visible on mobile. Pagination stays below the table with outlined arrow controls.

### Inspectable attendance and weekly schedule
Seven attendance columns are actual buttons with selected and hover fills; values become visible on hover, focus or selection. A ruled detail line reports the selected day. Schedule day buttons use an explicit selected pine state; arrow keys move between tabs and their corresponding panel. These patterns expose data, not decorative animation.

## Do's and Don'ts

### Do:
- **Do** preserve the serif/sans division between orientation and records.
- **Do** pair status colors with explicit text and keep numeric records tabular.
- **Do** retain visible focus rings, labeled icon actions and horizontal scrolling for wide tables.
- **Do** use the final muted text token for secondary labels and placeholders.

### Don't:
- **Don't** turn ordinary data panels into floating shadow cards.
- **Don't** substitute decorative display typography for table text or form labels.
- **Don't** hide record columns by squeezing their text below the implemented scale.
