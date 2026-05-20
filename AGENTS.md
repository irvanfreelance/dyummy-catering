# AI Coding Agent Instructions

**Project Context:** Next.js Catering CRM & Master Data Application.

When building, generating, or refactoring code for this project, you MUST strictly adhere to the following directives:

## 1. API Routing & File Structure (CRITICAL)
* Use the **Next.js Pages Router** specifically for backend APIs (`pages/api/...`).
* **ONE ROUTE = ONE FILE.** You are strictly forbidden from creating generic API files that handle multiple HTTP methods via switch statements.
* Correct Structure Example:
  * `pages/api/customers/get-list.ts` (Handles only GET)
  * `pages/api/customers/create.ts` (Handles only POST)
  * `pages/api/customers/update-by-id.ts` (Handles only PUT/PATCH)

## 2. Database & Data Fetching (CRITICAL)
* **NO ORM USAGE:** Do not use Prisma, Drizzle ORM, TypeORM, or Sequelize for application logic.
* **RAW SQL ONLY:** Execute all database queries using raw SQL strings via the `@neondatabase/serverless` pool.
* **Parameterization:** Always use parameterized queries (e.g., `WHERE id = $1`) to prevent SQL injection.
* **No Migrations:** Do not generate SQL schema files or migration scripts. Assume the tables (users, customers, leads, products, recipes, orders, order_items) are already migrated via the external question bank admin panel system.
* **Drizzle Exception:** Drizzle is only allowed if writing standalone seed scripts, not for runtime API queries.

## 3. Technology Stack & Features
* **Auth:** Install `next-auth` v4 and setup the boilerplate for Google SSO, but do not wrap the application in strict session guards for this phase.
* **Charts:** Implement `recharts`. Support Line, Vertical Bar, Pie, and RadialBar charts.
* **Exports:** Integrate `xlsx` for Excel data downloads and prepare logic for PDF generation (`pdfmake` or print media CSS).
* **Styling:** Tailwind CSS with `lucide-react` icons. Maintain clean, non-bold default font weights (`Source Sans Pro`).

## 4. Types & Identifiers
* Assume database IDs are `BIGSERIAL` (Numbers/Strings in JS, not UUIDs).
* Assume statuses are `VARCHAR` (not ENUMs).