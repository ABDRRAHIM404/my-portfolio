# Abderrahim — portfolio

Open `index.html` in any browser. HTML, CSS, and JavaScript live in separate files.

## Change the profile photo

The hero now uses your local photo at `assets/profile.jpg`. If you want to replace it later, keep the same filename or update the `src` in `index.html`. The local placeholder is `assets/avatar-placeholder.svg`.

## Projects

Four repository links and live site links are included. The demo links are from each repository's homepage metadata; check their published status before sharing the site publicly.

## Before publishing

Replace `your-email@example.com` in `index.html` with your actual email.

## CV

Your original HTML CV is included at `assets/Abderrahim_Bounga_CV.html`; the home and contact sections link to it. The contact email comes from the CV.

## English / Français

Use the EN / FR switch in the navigation to translate the entire portfolio. Your choice is remembered locally. All translations are in `js/translations.js`; no translation service or internet connection is needed. The original CV is in French and opens separately.

## Scroll curtain introduction

Open index.html and scroll down: two dark-purple panels open to reveal the portfolio. Scroll back to the top and continue scrolling upward to close them. The reveal now animates separately from the website, preventing page jumps. The effect is written in `css/style.css` and `js/curtain.js`. Reduced-motion visitors skip the intro. GitHub and LinkedIn links are in the hero and footer.

## Animated opening
The opening monogram expands **A → Abderrahim** and **B → Bounga**, while a glowing violet line highlights the curtain seam. Scroll to expand the name and open the panels. The portfolio layout stays fixed underneath. Reduced-motion settings skip the introduction.

## Curtain timing
The curtain holds closed for the first 38% of scroll progress while the initials expand into your name. The doors then open smoothly. Adjust the `0.38` threshold in `js/curtain.js` for a shorter or longer hold.

The center seam glows continuously and fades only in the final part of the curtain opening.

## Moving light and name

The AB-to-name animation and brighter glowing seams are attached to the left and right curtain panels, so they travel outward with the panels. The centered helper text fades before the doors open. Edit CSS section `Tracking edge lights and names` to adjust glow density.


## Hero magic

This version adds floating particles, a cursor spotlight, portrait aura, animated text shine, and subtle 3D mouse parallax to the hero section while keeping the curtain intro unchanged. On mobile and reduced-motion settings, interactions are simplified automatically.


## Hero fix

This version softens the 3D parallax and repositions the portrait labels so they no longer get cut off or overlap the caption. Decorative rings remain behind the photo and are toned down on smaller screens.

Photo repair: removed the intermediary portrait wrapper, anchored the image in a fixed-size card, and applied a rounded purple overlay that fades on hover.


## Projects journey

The projects now alternate left/right on desktop, with a curving SVG connector that fills as you scroll. Cards have gentle cursor tilt, purple border glow, illustrated app previews, scroll reveal, and GitHub/live buttons. On narrow phones the route becomes a vertical thread alongside full-width cards. Previews are stylized rather than actual website screenshots; live sites remain linked. The curtain and hero code are unchanged.


## Thick center route
The project journey path is now thicker and overlays the cards, entering and leaving through their physical centers on desktop and mobile. The glowing progress line still fills while scrolling.


## Path readability fix
The bright connector still follows card-center coordinates, but is layered behind the opaque project cards instead of over descriptions or buttons.


## Project screenshots (November 2026)

All four screenshot previews are saved locally in `assets/projects/` as WebP images, from user-provided screenshots. Project Atelier is replaced by Cassemiro (`https://cassemiro-one.vercel.app/`). Movocco GitHub works, but its Live site control intentionally has no destination yet. The EN/FR content has been updated for Cassemiro.

## About Me animation

The two-column About Me layout now includes a gently tilting card, glowing keywords, three floating symbols, and staggered biography reveals. All effects respect reduced-motion settings. English/French translations remain available.

## Interactive skills

Hover or focus a skill card to open its floating code preview. On touch devices, tap the card; tap outside or the × to close. Frontend supports switching among HTML/CSS/JS, Data supports SQL/API, and Workflow supports Git/Deploy. The preview has a typing animation unless reduced motion is enabled. Code examples are illustrative demos, not production source.

## Experience & Education timeline

Both career columns now have purple scroll-progress rails, milestone dots, and accessible hover/focus states. Content remains unchanged and follows English/French translations. Reduced-motion setting simplifies the effect.

## Contact

The Contact section includes WhatsApp and telephone links for +212 657 143 579, email, LinkedIn, GitHub and the existing HTML CV. A gentle pointer spotlight lights the contact panel on desktop. French and English text is included.

## Header & Footer
Sticky glass header, animated progress bar, scroll-active navigation, accessible mobile menu, and a redesigned closing footer with email, social and WhatsApp links. Both keep the EN/FR switch.

## Minimal footer
Removed the duplicate contact call-to-action from the footer. Kept only the name, translated developer subtitle, back-to-top link, copyright, GitHub and LinkedIn icons.


## Final responsive and performance review (2026-11-19)
- Optimized the local portrait to WebP; all four screenshot thumbnails already use WebP.
- Added image dimensions, asynchronous decoding, and lazy loading for project screenshots to reduce layout shifts.
- Improved small-screen text sizing, touch targets, mobile menu scrolling, focus visibility and skill-popup focus handling.
- Repaired a malformed CSS `box-shadow` declaration.
- Preserved the opening curtain, hero interactions, project timeline, About, Skills, Experience, Contact, header, footer and English/French language switch.
- Source-level checks passed. Automated Chromium rendering was blocked by the test environment, so visually verify the curtain, project line and skill popup on your devices before publishing.

## Footer & Languages fixes

The footer Back to top link now runs a smooth 2.1-second document scroll followed by a 1.25-second curtain closing animation, preserving the original curtain for regular navigation. Reduced-motion visitors return immediately. Language names now appear as an inline row with decorative animated bars (not proficiency scores, because the supplied CV did not specify levels). Both English and French labels are supported.

## Back to Top & language levels
The footer Back to Top button scrolls the page up at a deliberate speed and then re-closes the existing curtain. Language proficiency bars are inline on desktop: Arabic 100%, Amazigh 100%, French 80%, English 100%, based on your self-rating.

## Curtain timing fix
The AB initials expand into the full name before the doors begin moving. A scroll-progress hold shows the entire name, followed by a slower door-opening phase. The return-to-top closing is also slower. Text is remeasured after web fonts load and on viewport resize.

## Header and Back to Top
The navigation header scrolls away with the page. The 3px reading-progress line stays fixed at the top of the viewport. Footer Back to Top uses a 3000ms scroll, then closes the curtain.


## Mobile curtain layout correction
This version fixes the phone-width alignment instead of adjusting animation speed. Mobile curtains use two exact 50%-width panels inside a fixed full-viewport stage, and the labels are centered to the viewport. The desktop curtain and 3000ms Back-to-Top duration are untouched. CSS and curtain script URLs are cache-busted for GitHub Pages.
