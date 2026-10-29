---
name: Schoolhouse — Campus Atelier
description: A contemporary school administration workspace in Tiffany, carbon and warm paper.
colors:
  tiffany: "#81d8d0"
  tiffany-dark: "#226c66"
  ink: "#20211f"
  paper: "#f4f2ed"
  muted: "#60635b"
  line: "#d1d3ca"
  white: "#fff"
  field: "#fafbf6"
  present-bg: "#dcebe1"
  present-text: "#285c4c"
  late-bg: "#ece5cf"
  late-text: "#72582e"
  absent-bg: "#f1dfda"
  absent-text: "#924b45"
  danger: "#9b423b"
typography:
  display:
    fontFamily: "Archivo, sans-serif"
    fontSize: "46px"
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Archivo, sans-serif"
    fontSize: "22px"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "-0.035em"
  timetable-title:
    fontFamily: "Archivo, sans-serif"
    fontSize: "27px"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "-0.04em"
  metric:
    fontFamily: "Archivo, sans-serif"
    fontSize: "35px"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.04em"
  dialog-title:
    fontFamily: "Archivo, sans-serif"
    fontSize: "28px"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "-0.035em"
  body:
    fontFamily: "IBM Plex Sans, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
  label:
    fontFamily: "IBM Plex Sans, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0em"
  table-label:
    fontFamily: "IBM Plex Sans, sans-serif"
    fontSize: "10px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
rounded:
  small: "3px"
  control: "4px"
  toast: "5px"
  dialog: "12px"
spacing:
  step-8: "8px"
  step-9: "9px"
  step-10: "10px"
  step-11: "11px"
  step-12: "12px"
  step-16: "16px"
  step-18: "18px"
  step-19: "19px"
  step-22: "22px"
  step-23: "23px"
  step-24: "24px"
  step-25: "25px"
  step-28: "28px"
  step-31: "31px"
  step-35: "35px"
  step-40: "40px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "11px 16px"
    typography: "{typography.label}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "11px 16px"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "10px 11px"
  navigation-active:
    backgroundColor: "{colors.ink}"
    textColor: "#f8faf4"
    rounded: "{rounded.small}"
    padding: "12px 11px"
  badge-present:
    backgroundColor: "{colors.present-bg}"
    textColor: "{colors.present-text}"
    rounded: "{rounded.small}"
    padding: "3px 7px"
  timetable:
    backgroundColor: "{colors.ink}"
    textColor: "#f5f5ed"
    rounded: "{rounded.control}"
    padding: "25px 23px 0"
  dialog:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    rounded: "{rounded.dialog}"
    width: "min(570px, calc(100vw - 32px))"
---
# Design System: Schoolhouse — Campus Atelier

## Overview

**Creative North Star: "Campus Atelier"**

Campus Atelier gives everyday school administration the clarity of a contemporary design-school catalog. Tiffany navigation establishes orientation; warm paper holds the working data; carbon provides the concentrated timetable contrast.

Archivo supplies robust headings and metrics while IBM Plex Sans keeps records, controls and supporting text precise. The workspace is open and ruled rather than divided into a grid of floating cards. The user-selected world replaces the former green serif identity; no serif face belongs to this system.

**Key Characteristics:**
- Tiffany navigation and carbon timetable contrast.
- Open working surfaces separated by thin rules.
- Compact sans-serif controls with restrained corners.
- Tabular numbers and explicit selected states.

## Colors

A cool Tiffany accent sits against warm paper and carbon; status colors remain secondary and functional. Frontmatter values are normative.

### Primary
- **Tiffany:** the navigation rail, chosen timetable day, selection and confirmation accents.
- **Deep Tiffany:** focus outlines, accent text and chart selection outlines.

### Neutral
- **Carbon ink:** headings, primary actions, chart bars and the timetable surface.
- **Warm paper:** the continuous application ground.
- **Muted:** supporting copy and metadata. **Line:** understated row and region dividers.
- **White / Field:** form controls and the native dialog surface.

Status pairs convey present, late and absent with text labels as well as color. Danger is reserved for destructive actions. Avatar tints and chart-specific status hues are local details, not additional brand accents.

**The Working Ground Rule.** Keep records on the warm paper ground; use carbon for concentrated schedule content and Tiffany for orientation and selection.

## Typography

**Display Font:** Archivo, sans-serif. **Body Font:** IBM Plex Sans, sans-serif. Both are locally hosted variable WOFF2 fonts using `font-display: swap`; Archivo supports weights 100–900 and IBM Plex Sans 100–700. No serif is used.

The pairing is robust, contemporary and compact. The body base is (14px/1.5); many operational labels deliberately use the smaller roles in the frontmatter. Tables, totals, chart summaries, schedule times and dates use tabular numerals.

### Hierarchy
- **Display:** page heading, (46px, 600, 1.12), tightly tracked. Responsive sizes are (54px) at 1600px and above, (40px) at 1050px and below, (42px) at 760px and below, then (39px) at 620px and below.
- **Headline:** panel heading, (22px, 500, 1.3); (20px) at 1050px and below and (23px) at 620px and below.
- **Timetable title:** (27px), becoming (28px) on the stacked mobile view.
- **Metric:** chart summary (35px, 500, 1.15); totals use (29px) on desktop with responsive reductions.
- **Dialog title:** (28px, 500), becoming (27px) at 620px and below.
- **Body / Label / Table label:** the compact operational hierarchy defined in frontmatter; directory record text is (12px), table headings (10px).

Font attribution: `frontend/public/fonts/Archivo-LICENSE.txt` credits the Archivo Project Authors (2020); `frontend/public/fonts/IBM-Plex-Sans-LICENSE.txt` credits IBM Corp. (2017), Reserved Font Name “Plex”. Both carry SIL Open Font License 1.1.

**The Two Sans Rule.** Use Archivo for headings and numerical emphasis, and IBM Plex Sans for records, labels and controls.

## Layout

The fixed desktop rail is (220px), narrowing to (204px) at 1250px and (190px) at 1050px. Main content and utility row cap at (1800px). Standard horizontal gutters are (40px), then (30px) and (25px). The overview has a flexible data column and a (326px) timetable, with a (35px) column gap; intermediate breakpoints reduce the schedule width rather than prematurely stacking it.

At 760px and below, navigation becomes a (220px) off-canvas rail with a scrim and menu trigger, main offset disappears, and gutters become (24px). At 620px and below, gutters become (18px), actions sit below the title, totals remain four columns, and content stacks attendance → timetable → enrollments. Tables retain overflow scrolling; directory tables maintain a (680px) minimum width on mobile. Search fills its toolbar row.

The native dialog is bounded by viewport width and dynamic height, scrolls internally, and uses a two-column field grid; fields become one column at 370px and below. Mobile field text grows to (16px) with a (45px) minimum control height. Spacing uses the measured steps in frontmatter rather than a fabricated uniform scale.

Account access extends the same ground with a flat Tiffany identity field and warm-paper form. Desktop uses a (44%) identity column with a (390px) minimum; the form caps at (420px) within (60px) gutters. At 1100px and below the identity becomes (42%) with a (330px) minimum and form gutters (40px). At 760px and below a Tiffany brand strip replaces the identity column; the single-column form uses (25px) gutters, reducing to (20px) at 370px.

## Elevation & Depth

Ordinary panels are flat. Borders, paper/carbon contrast and spacing establish hierarchy. The native modal and toast alone use floating shadows: dialog `0 22px 90px #162a2638`; toast `0 8px 30px #182d2626`. The modal backdrop is `#1528238c`; mobile navigation uses `#142b2480`.

The dialog enters over (0.25s) with a (12px) upward settling movement and clipping reveal; navigation uses the same duration and the custom easing `cubic-bezier(0.16, 1, 0.3, 1)`. Control colors transition over (0.18s). Reduced-motion preference removes transitions and animations.

**The Ruled Workspace Rule.** Separate ordinary data regions with spacing and thin rules; reserve floating depth for dialogs and notifications.

## Shapes

Controls are narrow, nearly square rectangles with small softened corners: navigation and badges (3px), buttons, fields, timetable and avatars (4px). Toasts use (5px). The native dialog intentionally uses a larger (12px) corner. Thin one-pixel rules define tables and separators. Small round dots communicate status; they do not turn controls into pills.

## Components

### Buttons
Carbon primary, transparent outlined secondary and red destructive variants share (42px) minimum height, (11px 16px) padding and medium (12px) labels. Primary hover darkens toward `#394039`; secondary hover fills `#e6e9df`. Disabled actions use (0.45) opacity and a not-allowed cursor. Global keyboard focus is a (3px) Deep Tiffany outline offset (4px).

### Inputs / Fields
Form controls use white backgrounds, (4px) corners, a thin muted border and (10px 11px) padding. Focus changes the border to Deep Tiffany. The search wrapper uses the Field surface, an inline SVG search icon, and a (2px) focus-within outline offset (3px); its input remains visually unboxed inside the wrapper.

### Navigation
The Tiffany rail uses (46px) minimum navigation rows with SVG icons. Hover fills `#65c8be`; the active route is carbon with light text and medium weight. The count remains subordinate. Mobile navigation retains the rail identity and moves off canvas; it is not replaced by a different visual language.

### Chips
Status badges pair a text label and small current-color dot with a muted functional fill, (3px 7px) padding and (3px) corners. Present, late and absent share (10px) medium text. These are status labels rather than action pills.

### Cards / Containers
Most containers are unboxed sections of the paper workspace. The signature timetable is a carbon container, light heading and text, Tiffany time labels and selection, thin internal rules, (4px) corners and (25px 23px 0) desktop padding. Its weekday buttons show actual dates and a clearly filled selected day.

### Tables and Dialogs
Tables use collapsed borders, subdued small headings, thin row separators and a light `#e9eee6` hover background. People use compact initial avatars and a secondary metadata line. Directory rows add vertical breathing room without making separate cards. The native dialog preserves modal focus behavior, explicit close and save controls, validation feedback and destructive confirmation.

### Account access
Account access is a flat extension of Campus Atelier, using the existing Tiffany orientation field, warm paper and carbon primary action without a raised form card. Archivo supplies the form heading (36px, 550, 1.15) and identity heading (clamp of 54px–86px, 550, 1.05); IBM Plex Sans carries labels (12px), descriptions (13px) and input text (14px). Form headings become (33px) at 1100px, (34px) at 760px and (30px) at 370px. Mobile input text is (16px).

- **Mode selection:** Sign in and Create account are grouped buttons with explicit pressed states. The selected mode has a carbon (2px) underline; hover uses Deep Tiffany. Switching mode clears feedback and hides passwords.
- **Fields:** Account inputs use restrained (4px) corners and (47px) minimum height, growing to (48px) on mobile. Password visibility is an SVG eye button with an accessible changing label and pressed state; it also controls confirmation visibility. The password wrapper uses a (3px) Deep Tiffany focus-within outline offset (3px). Other controls retain global keyboard focus.
- **Registration:** Name and password confirmation extend the sign-in fields. A connected hint specifies the implemented (12–128 character) password range; a native checkbox defaults to including fictional sample records and explains the empty-workspace alternative.
- **Submission and feedback:** The full-width carbon action has a (46px) minimum height. Busy submission disables fields, visibility, mode controls and submission, replacing the arrow with a spinner and explicit progress text. Session checking uses a status region with a spinner; request, password mismatch and expired-session feedback use a text alert inside the form. Feedback remains local to this surface rather than adding a brand accent.
- **Completion:** Successful access enters the account workspace; sidebar sign-out returns to sign-in. Email verification and password recovery are not represented because they are not implemented.

## Do's and Don'ts

### Do:
- **Do** retain Tiffany navigation, warm paper data surfaces and the carbon timetable.
- **Do** preserve tabular numerals in tables, totals, charts and dates.
- **Do** give keyboard focus a visible Tiffany-dark outline and keep selected states explicit.
- **Do** retain horizontal table scrolling on narrow screens and readable form field sizes.

### Don't:
- **Don't** restore the rejected green serif visual identity or introduce orange as the main accent.
- **Don't** turn every data section into a raised card.
- **Don't** replace functional icons with decorative glyphs or promote page-specific slogans into reusable visual rules.

Evidence: `frontend/src/styles.css`, `frontend/src/App.tsx`, `frontend/src/RecordForm.tsx`; approved scope in `PRODUCT.md` and `.impeccable/surface.md`. Final reviewed captures: `.impeccable/review/desktop.png`, `mobile.png`, `students-desktop.png`, `students-mobile.png`, `form-mobile.png`, `user-1200.png`, `navigation-mobile.png`. No material visual defects were reported in the final ship disposition. Page-specific wording and incidental local tint values are not promoted to global rules.
