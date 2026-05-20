-- ==============================================================================
-- DATABASE SCHEMA: CATERING ERP & CRM (NEON POSTGRESQL OPTIMIZED)
-- Dilarang menggunakan UUID & ENUM sesuai standar PRD
-- ==============================================================================

-- 1. DROP TABLES (Untuk reset data saat re-run script)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ==============================================================================
-- CREATE TABLES
-- ==============================================================================

-- TABEL USERS (Karyawan / Tim Internal)
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'Super Admin', 'CS / Sales', 'Finance', 'Kitchen'
    status VARCHAR(50) DEFAULT 'Aktif', -- 'Aktif', 'Nonaktif'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABEL CUSTOMERS (Database Pelanggan Utama)
-- Semua Lead wajib masuk ke sini, biarpun namanya "Anonim_Tgl"
CREATE TABLE customers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) UNIQUE, -- Bisa Null jika kontak dari email, tapi idealnya unik
    email VARCHAR(255),
    type VARCHAR(100), -- 'Instansi', 'Personal', 'Corporate', dll
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABEL LEADS (Pencatatan Prospek Harian CRM)
CREATE TABLE leads (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT REFERENCES customers(id) ON DELETE CASCADE,
    pic_id BIGINT REFERENCES users(id) ON DELETE SET NULL, -- CS yang menangani
    lead_date DATE NOT NULL,
    source VARCHAR(100) NOT NULL, -- 'WhatsApp', 'Instagram', 'Walk-in', 'Google Ads'
    status VARCHAR(50) NOT NULL, -- 'New Lead', 'Follow Up', 'Negosiasi', 'Closed Won', 'Closed Lost'
    tags VARCHAR(255), -- Remarketing tags
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABEL MASTER PRODUCTS (Katalog Paket Catering)
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100), -- 'Nasi Box', 'Prasmanan', 'Snack Box'
    description TEXT,
    price DECIMAL(15, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Aktif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABEL MASTER RECIPES (BOM & Standar HPP)
CREATE TABLE recipes (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    ingredients TEXT NOT NULL,
    standard_cost DECIMAL(15, 2) NOT NULL, -- HPP Modal Standar
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABEL ORDERS (Manajemen Pesanan, CRM to Finance)
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT REFERENCES customers(id) ON DELETE RESTRICT,
    lead_id BIGINT REFERENCES leads(id) ON DELETE SET NULL, -- Menyambungkan order dengan lead conversion
    pic_id BIGINT REFERENCES users(id) ON DELETE SET NULL, -- CS yang closing
    order_date DATE NOT NULL,
    delivery_date DATE NOT NULL,
    departure_time TIME,
    arrival_time TIME,
    venue TEXT,
    order_notes TEXT,
    status_order VARCHAR(50) DEFAULT 'Baru', -- 'Baru', 'Repeat'
    status_payment VARCHAR(50) DEFAULT 'Belum Lunas', -- 'Belum Lunas', 'DP', 'Lunas'
    grand_total DECIMAL(15, 2) DEFAULT 0,
    -- Finance Cost Control Columns
    estimated_budget DECIMAL(15, 2) DEFAULT 0,
    actual_cost DECIMAL(15, 2) DEFAULT 0,
    status_cost VARCHAR(50) DEFAULT 'Pending Input', -- 'Pending Input', 'Safe', 'Overbudget'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABEL ORDER ITEMS (Detail Paket yang Dipesan)
CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id) ON DELETE RESTRICT,
    custom_menu TEXT, -- Jika ada request khusus pada menu standar
    price DECIMAL(15, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    discount DECIMAL(15, 2) DEFAULT 0,
    subtotal DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- INDEX OPTIMIZATION (Untuk mempercepat query Dashboard & Filter CRM)
-- ==============================================================================

-- Index pencarian Customer berdasarkan No HP (sangat sering di CRM)
CREATE INDEX idx_customers_phone ON customers(phone);

-- Index untuk filter Lead (berdasarkan CS yang pegang, tanggal, dan status conversion)
CREATE INDEX idx_leads_pic ON leads(pic_id);
CREATE INDEX idx_leads_date ON leads(lead_date);
CREATE INDEX idx_leads_status ON leads(status);

-- Index untuk filter Order (berdasarkan tanggal kirim, CS, dan status)
CREATE INDEX idx_orders_delivery_date ON orders(delivery_date);
CREATE INDEX idx_orders_pic ON orders(pic_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status_cost ON orders(status_cost); -- Untuk deteksi Overbudget

-- ==============================================================================
-- SEED DATA (Data saling terhubung / relational)
-- ==============================================================================

-- 1. Insert Users (ID 1-4)
INSERT INTO users (id, name, email, password_hash, role, status) VALUES
(1, 'Siti (CS 1)', 'siti@catering.com', 'hashed_pw_here', 'CS / Sales', 'Aktif'),
(2, 'Budi (CS 2)', 'budi@catering.com', 'hashed_pw_here', 'CS / Sales', 'Aktif'),
(3, 'Andi Finance', 'finance@catering.com', 'hashed_pw_here', 'Finance', 'Aktif'),
(4, 'Super Admin', 'admin@catering.com', 'hashed_pw_here', 'Super Admin', 'Aktif');
SELECT setval('users_id_seq', 4);

-- 2. Insert Master Products (ID 1-3)
INSERT INTO products (id, name, category, description, price, status) VALUES
(1, 'Nasi Box Paket Lengkap', 'Nasi Box', 'Paket nasi box komplit dengan buah dan air mineral', 27000.00, 'Aktif'),
(2, 'Snack Box Premium', 'Snack Box', 'Snack box manis dan asin cocok untuk rapat atau acara santai', 15000.00, 'Aktif'),
(3, 'Prasmanan VIP', 'Prasmanan', 'Paket prasmanan eksklusif dengan dekorasi meja dan pramusaji', 75000.00, 'Aktif');
SELECT setval('products_id_seq', 3);

-- 3. Insert Master Recipes (HPP Standar)
INSERT INTO recipes (id, product_id, ingredients, standard_cost) VALUES
(1, 1, 'Nasi Putih, Ayam Serundeng, Cah Tahu Buncis, Perkedel Jagung, Lalapan, Sambal, Kerupuk, Pisang, Box', 18000.00),
(2, 2, 'Lontong Isi Ayam, Risoles Rogut, Brownies, Air Mineral Cup, Box', 8000.00),
(3, 3, 'Nasi Putih, Nasi Goreng, Daging Sapi Lada Hitam, Ayam Kodok, Salad, Sop Kimlo, Puding', 40000.00);
SELECT setval('recipes_id_seq', 3);

-- 4. Insert Customers (Database Kontak CRM)
INSERT INTO customers (id, name, phone, type, notes) VALUES
(1, 'Ressa', '085220073373', 'Instansi', 'Klien prioritas instansi'),
(2, 'APTIKOM', '081233445566', 'Corporate', 'Sering pesan prasmanan untuk rapat'),
(3, 'TINY HERNAWATI', '081254314639', 'Personal', 'Sering pesan bento'),
(4, 'Anonim_19Mei_085711223344', '085711223344', 'Personal', 'Belum menyebutkan nama saat WA');
SELECT setval('customers_id_seq', 4);

-- 5. Insert Leads (Traffic Masuk)
INSERT INTO leads (id, customer_id, pic_id, lead_date, source, status, tags, notes) VALUES
(1, 1, 1, '2026-05-18', 'WhatsApp', 'Closed Won', 'Instansi, Prioritas', 'Langsung deal untuk acara kelurahan'),
(2, 2, 1, '2026-05-18', 'WhatsApp', 'Closed Won', 'Kampus, Rapat', 'Repeat order untuk APTIKOM'),
(3, 4, 2, '2026-05-19', 'Instagram', 'New Lead', 'Tanya Harga', 'Nanya paket nasi box buat ultah anak, belum konfirm'),
(4, 3, 1, '2026-05-19', 'WhatsApp', 'Follow Up', 'Bento', 'Minta dikirimin pricelist bento terbaru');
SELECT setval('leads_id_seq', 4);

-- 6. Insert Orders (Hasil Closing CRM)
-- Asumsi Lead ID 1 dan 2 menjadi Order
INSERT INTO orders (id, customer_id, lead_id, pic_id, order_date, delivery_date, departure_time, arrival_time, venue, status_order, status_payment, grand_total, estimated_budget, actual_cost, status_cost) VALUES
(1, 1, 1, 1, '2026-05-18', '2026-05-19', '10:00:00', '11:00:00', 'Kantor Kelurahan Cisaranten Kidul, Jl. Riung Purna XI No.151, Kota Bandung', 'Repeat', 'Lunas', 1620000.00, 1080000.00, 1100000.00, 'Safe'),
(2, 2, 2, 1, '2026-05-18', '2026-05-19', '08:00:00', '09:00:00', 'Gedung APTIKOM Pusat', 'Repeat', 'DP', 3825000.00, 2040000.00, 2500000.00, 'Overbudget');
SELECT setval('orders_id_seq', 2);

-- 7. Insert Order Items (Detail produk per order)
-- Order 1: 60 x Nasi Box (Harga Jual 27k, HPP 18k -> Est Budget Total = 60*18k = 1.080.000)
INSERT INTO order_items (order_id, product_id, custom_menu, price, quantity, discount, subtotal) VALUES
(1, 1, '1. Nasi Putih\n2. Ayam Serundeng (pot. 8)\n3. Cah Tahu Buncis\n4. Perkedel Jagung', 27000.00, 60, 0, 1620000.00);

-- Order 2: 51 x Prasmanan VIP (Harga Jual 75k)
INSERT INTO order_items (order_id, product_id, custom_menu, price, quantity, discount, subtotal) VALUES
(2, 3, 'Sesuai standar menu VIP APTIKOM', 75000.00, 51, 0, 3825000.00);

-- Selesai!