# Arabic Translation Review Checklist — HUMAN REQUIRED

Status: `ARABIC_LINGUISTIC_REVIEW = HUMAN_REQUIRED`. Current Arabic strings are a first-pass product draft, not a certified translation. A fluent Arabic reviewer should approve wording and screenshots before release.

## Review scope

- Home: hero, trip card, all three character descriptions, AI entry and actions.
- Discover: four discovery themes, place/food cards, action labels and navigation.
- AI workspace: QA, itinerary and creation panel names, prompt examples, empty/error/loading states, AI responses.
- Trip: day labels, itinerary time/place/transport/meal/tip/evidence labels, safety notice and action dialogs.
- My / Star Atlas: profile, saved state, planned state, memory creation and privacy labels.
- Settings and bottom tab bar.
- Shapotou, story, scenic details, cultural gallery/product and memory detail.
- Canonical IP identity: 岩羊 / Argali (وعل جبلي); 骆驼 / Camel (جمل); 沙狐 / Sand Fox (ثعلب الرمال). Confirm identity and ecological/cultural associations remain distinct.
- Place names: retain the approved Chinese official name where Arabic display names have not been reviewed. Never use translated display text as `landmarkId`.

## Visual and language checks

- Check Arabic shaping, joining, diacritics (if any), punctuation, bidirectional isolation and wrapping on WeChat iOS and Android.
- Verify RTL reading order for headings, cards, buttons, lists, profile and AI bubbles while preserving chronological Trip order and the LTR time strings `09:30`, `13:30`.
- Check Latin brand names, URLs, phone numbers, technical IDs, digits, map orientation and logos remain readable and are not mirrored.
- Check button/card width, tab labels, titles, dialogs, bottom sheets, AI bubbles, persona cards and long place names for clipping or overlap.
- Review cultural terminology and transliteration with a Ningxia-aware Arabic speaker. Do not improvise Arabic place-name spellings.

## Approval evidence to attach

- Reviewer name/qualification and date.
- Approved terminology table for people, places, IP names and cultural terms.
- Screenshots: HOME ar, DISCOVER ar, TRIP ar, AI WORKSPACE ar, MY ar, SETTINGS ar.
- Recorded issue list and retest results for each supported device/platform.

Until this evidence is attached, do not mark Arabic translations or Arabic RTL as fully verified.
