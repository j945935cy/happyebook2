# Happy eBook Design System

## Layout
- max-width: 1200px
- section spacing: 80px

## Colors
- primary: #2563eb
- secondary: #f97316
- success: #16a34a
- bg: #f8fafc
- text: #0f172a

## Typography
- font: system-ui
- h1: 32px bold
- h2: 24px
- body: 16px

## Components
- card: rounded + shadow
- button: rounded + hover
- tag: badge style
- Homepage: limit hero actions to the three highest-intent entries (AI learning, iPAS AI, book catalogue); keep secondary destinations in the site navigation and later sections.
- Site navigation: one shared link list in `src/script.js` drives consistent primary and footer navigation; secondary learning destinations are grouped in a responsive menu with route-aware active states.
- Catalogue: quick links use existing category metadata only; do not infer difficulty or study duration when those fields are absent.
- Contact: disclose that the static form opens the visitor's configured mail application; do not imply server-side submission.