# Korean Snacks & Goods E-Commerce — Build Goal

Build a new Next.js e-commerce web app for Korean snacks, living goods, and clothing, utilizing an existing proven backend architecture but with a completely new frontend design system.

---

## 1. Technical Infrastructure (Keep this identical to previous project)

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database/Auth:** Prisma ORM + Supabase
- **Core Workflows to replicate:** Custom manual checkout (FPS/Bank Transfer), Admin Dashboard (Orders, Members), Cart state management.

## 2. New Design System (See attached reference images)

- **Vibe:** Minimalist, soft, elegant, and organic.
- **Color Palette:** Soft cream/beige backgrounds (e.g., #FAF7F2), with dark charcoal or muted brown for typography. Very low contrast, soothing tones.
- **Typography:** High-contrast, elegant Serif font for all Headings (e.g., Playfair Display or similar Google Font). Clean, modern Sans-serif for body text.
- **UI Elements:** Use large organic shapes (oval or arch-shaped image masks), pill-shaped buttons with thin borders (`rounded-full`, `border-gray-300`), and generous, airy padding (`p-12`, `gap-8`).

## 3. Initial Execution Plan

1. Initialize the Tailwind configuration with the new soft color palette and set up the Serif/Sans-serif font variables in `layout.tsx`.
2. Build the global Header (Navbar) and Footer according to the minimal layout.
3. Build the Landing Page Hero section, ensuring we implement the oval/arch image frames and soft typography seen in the mood board.

Once the foundation is set, the app will have cohesive foundational styling ready for all pages.
