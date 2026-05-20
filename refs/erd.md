# Entity Relationship Document (ERD)

**Database:** Neon PostgreSQL
**Context:** Tables are pre-existing. Use `BIGSERIAL` for IDs and `VARCHAR` for statuses/types.

## 1. `users` (Master Users)
* `id` (BIGSERIAL, PK)
* `name` (VARCHAR)
* `email` (VARCHAR, UNIQUE)
* `password_hash` (VARCHAR)
* `role` (VARCHAR) - e.g., 'Super Admin', 'CS / Sales'
* `status` (VARCHAR) - e.g., 'Aktif', 'Nonaktif'

## 2. `customers` (CRM)
* `id` (BIGSERIAL, PK)
* `name` (VARCHAR)
* `phone` (VARCHAR, UNIQUE)
* `email` (VARCHAR)
* `type` (VARCHAR) - e.g., 'Instansi', 'Personal', 'Corporate'
* `address` (TEXT)
* `notes` (TEXT)

## 3. `leads` (CRM)
* `id` (BIGSERIAL, PK)
* `customer_id` (BIGINT, FK -> customers.id)
* `pic_id` (BIGINT, FK -> users.id)
* `lead_date` (DATE)
* `source` (VARCHAR) - e.g., 'WhatsApp', 'Instagram'
* `status` (VARCHAR) - e.g., 'New Lead', 'Closed Won'
* `tags` (VARCHAR)
* `notes` (TEXT)

## 4. `products` (Master Data)
* `id` (BIGSERIAL, PK)
* `name` (VARCHAR)
* `category` (VARCHAR)
* `description` (TEXT)
* `price` (DECIMAL 15,2)
* `status` (VARCHAR)

## 5. `recipes` (Master Data BOM)
* `id` (BIGSERIAL, PK)
* `product_id` (BIGINT, FK -> products.id)
* `ingredients` (TEXT)
* `standard_cost` (DECIMAL 15,2)

## 6. `orders` (Order Management)
* `id` (BIGSERIAL, PK)
* `customer_id` (BIGINT, FK -> customers.id)
* `lead_id` (BIGINT, FK -> leads.id, NULLABLE)
* `pic_id` (BIGINT, FK -> users.id)
* `order_date` (DATE)
* `delivery_date` (DATE)
* `departure_time` (TIME)
* `arrival_time` (TIME)
* `venue` (TEXT)
* `order_notes` (TEXT)
* `status_order` (VARCHAR) - e.g., 'Baru', 'Repeat'
* `status_payment` (VARCHAR)
* `grand_total` (DECIMAL 15,2)

## 7. `order_items` (Order Management)
* `id` (BIGSERIAL, PK)
* `order_id` (BIGINT, FK -> orders.id)
* `product_id` (BIGINT, FK -> products.id)
* `custom_menu` (TEXT)
* `price` (DECIMAL 15,2)
* `quantity` (INT)
* `discount` (DECIMAL 15,2)
* `subtotal` (DECIMAL 15,2)