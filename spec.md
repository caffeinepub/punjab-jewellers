# Punjab Jewellers

## Current State
New project. No existing frontend or backend code.

## Requested Changes (Diff)

### Add
- Full luxury single-page website for Punjab Jewellers, a premium gold and diamond jewelry showroom in Patiala, Punjab, India
- 3D interactive hero section with rotating jewelry (Three.js / React Three Fiber)
- Product collection section with 3D tilt cards, glow effects, WhatsApp inquiry buttons
- 360° product viewer simulation (interactive rotation on product cards)
- Live Gold Price section (static/simulated daily rates for 24K and 22K gold in INR per gram)
- Digital catalog gallery with category filters, bestseller/new-arrival tags
- About section with brand storytelling
- Google Maps embed via static map + Get Directions link to the business address
- Customer testimonials with star ratings
- Contact section with inquiry form, phone, and WhatsApp button
- Legal pages (Privacy Policy, Terms & Conditions, Refund Policy) accessible from footer
- Elegant loading/splash screen
- Smooth scroll, parallax animations, glassmorphism effects
- Mobile-responsive layout

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan

### Backend
- Store inquiry form submissions (name, phone, product interest, message)
- Store product catalog items (name, category, price, description, tags)
- Seed with placeholder product data for 6 categories

### Frontend
- Luxury dark theme: black + royal gold + champagne gold
- Elegant serif + modern sans-serif typography
- Three.js rotating jewelry in hero (torus/ring geometry with gold material)
- Product cards: 3D tilt on hover, gold glow, WhatsApp inquiry deeplink
- Gold price section: simulated 24K/22K rates in INR
- Category filter tabs for catalog
- Google Maps static image + "Get Directions" button linking to Google Maps URL
- Contact form wired to backend inquiry storage
- Footer with legal page links (modal or separate routes)
- All sections: smooth scroll anchors, parallax, micro-interactions
- Business details:
  - Name: Punjab Jewellers
  - Address: GOL GAPPA CHOWNK, SCO 946, Tripuri, Patiala, Punjab 147004
  - Phone: 09815757180
  - WhatsApp: https://wa.me/919815757180
  - Google Maps: https://www.google.com/maps/search/Punjab+Jewellers+Patiala
