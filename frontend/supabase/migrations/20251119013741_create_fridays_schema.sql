/*
  # Fridays Perú Order Management System - Database Schema

  ## Overview
  Complete database schema for a restaurant order management system with e-commerce,
  kitchen operations, delivery tracking, and administrative functions.

  ## New Tables

  ### 1. `sedes` - Restaurant Locations
    - `id` (uuid, primary key)
    - `name` (text) - Location name (e.g., "Fridays Miraflores")
    - `address` (text) - Full address
    - `phone` (text) - Contact phone
    - `active` (boolean) - Operating status
    - `created_at` (timestamptz)

  ### 2. `users` - System Users (All Roles)
    - `id` (uuid, primary key) - References auth.users
    - `sede_id` (uuid) - Assigned location
    - `email` (text, unique)
    - `role` (text) - Role type: cliente, digitador, cheff, cocinero, empacador, repartidor, admin
    - `name` (text) - Full name
    - `phone` (text) - Contact phone
    - `active` (boolean) - Account status
    - `created_at` (timestamptz)

  ### 3. `menu_items` - Menu Catalog
    - `id` (uuid, primary key)
    - `sede_id` (uuid) - Location (null = all locations)
    - `name` (text) - Item name
    - `description` (text) - Item description
    - `price` (decimal) - Price in PEN
    - `category` (text) - Category: hamburguesas, bebidas, postres, etc.
    - `image_url` (text) - Product image
    - `available` (boolean) - Availability status
    - `preparation_time` (integer) - Minutes to prepare
    - `station` (text) - Kitchen station: parrilla, freidora, bar, etc.
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### 4. `orders` - Customer Orders
    - `id` (uuid, primary key)
    - `order_number` (text, unique) - Human-readable order number
    - `sede_id` (uuid) - Restaurant location
    - `customer_id` (uuid) - Customer user ID
    - `customer_name` (text) - Customer name
    - `customer_phone` (text) - Contact phone
    - `customer_address` (text) - Delivery address
    - `order_type` (text) - Type: delivery, pickup
    - `status` (text) - Status: pending, confirmed, in_kitchen, cooking, packaging, ready, on_the_way, delivered, cancelled
    - `total_amount` (decimal) - Total order amount
    - `assigned_cheff_id` (uuid) - Cheff who assigned the order
    - `assigned_driver_id` (uuid) - Delivery driver
    - `notes` (text) - Special instructions
    - `created_at` (timestamptz)
    - `confirmed_at` (timestamptz)
    - `kitchen_start_at` (timestamptz)
    - `ready_at` (timestamptz)
    - `delivered_at` (timestamptz)

  ### 5. `order_items` - Items in Each Order
    - `id` (uuid, primary key)
    - `order_id` (uuid) - Parent order
    - `menu_item_id` (uuid) - Menu item reference
    - `name` (text) - Item name snapshot
    - `price` (decimal) - Price snapshot
    - `quantity` (integer) - Quantity ordered
    - `station` (text) - Kitchen station
    - `status` (text) - Status: pending, assigned, cooking, ready
    - `assigned_cook_id` (uuid) - Assigned cook
    - `notes` (text) - Item-specific notes

  ### 6. `cart_items` - Shopping Cart (Temporary)
    - `id` (uuid, primary key)
    - `customer_id` (uuid) - Customer user ID
    - `menu_item_id` (uuid) - Menu item
    - `quantity` (integer) - Quantity in cart
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### 7. `order_status_history` - Order Status Timeline
    - `id` (uuid, primary key)
    - `order_id` (uuid) - Parent order
    - `status` (text) - New status
    - `changed_by` (uuid) - User who made the change
    - `notes` (text) - Additional notes
    - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Policies for each role:
    - Customers can view own orders and menu
    - Staff can manage orders for their sede
    - Admins have full access

  ## Important Notes
  - All tables use UUID primary keys
  - Timestamps track order lifecycle
  - RLS ensures data isolation by sede and user role
  - Cascading deletes maintain referential integrity
*/

-- Create sedes table
CREATE TABLE IF NOT EXISTS sedes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  phone text NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  sede_id uuid REFERENCES sedes(id) ON DELETE SET NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('cliente', 'digitador', 'cheff', 'cocinero', 'empacador', 'repartidor', 'admin')),
  name text NOT NULL,
  phone text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sede_id uuid REFERENCES sedes(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  category text NOT NULL,
  image_url text,
  available boolean DEFAULT true,
  preparation_time integer DEFAULT 15,
  station text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  sede_id uuid REFERENCES sedes(id) ON DELETE CASCADE NOT NULL,
  customer_id uuid REFERENCES users(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_address text,
  order_type text NOT NULL CHECK (order_type IN ('delivery', 'pickup')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_kitchen', 'cooking', 'packaging', 'ready', 'on_the_way', 'delivered', 'cancelled')),
  total_amount decimal(10,2) NOT NULL,
  assigned_cheff_id uuid REFERENCES users(id) ON DELETE SET NULL,
  assigned_driver_id uuid REFERENCES users(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  confirmed_at timestamptz,
  kitchen_start_at timestamptz,
  ready_at timestamptz,
  delivered_at timestamptz
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE SET NULL,
  name text NOT NULL,
  price decimal(10,2) NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  station text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'cooking', 'ready')),
  assigned_cook_id uuid REFERENCES users(id) ON DELETE SET NULL,
  notes text
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE CASCADE NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(customer_id, menu_item_id)
);

-- Create order_status_history table
CREATE TABLE IF NOT EXISTS order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL,
  changed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_sede ON users(sede_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_menu_items_sede ON menu_items(sede_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_orders_sede ON orders(sede_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_customer ON cart_items(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_order ON order_status_history(order_id);

-- Enable Row Level Security
ALTER TABLE sedes ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sedes
CREATE POLICY "Anyone can view active sedes"
  ON sedes FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can manage sedes"
  ON sedes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- RLS Policies for users
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage users"
  ON users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'admin'
    )
  );

-- RLS Policies for menu_items
CREATE POLICY "Anyone can view available menu items"
  ON menu_items FOR SELECT
  USING (available = true);

CREATE POLICY "Staff can manage menu items"
  ON menu_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'cheff', 'digitador')
    )
  );

-- RLS Policies for orders
CREATE POLICY "Customers can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Staff can view sede orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.sede_id = orders.sede_id
      AND users.role IN ('digitador', 'cheff', 'cocinero', 'empacador', 'repartidor', 'admin')
    )
  );

CREATE POLICY "Customers can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Staff can update sede orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.sede_id = orders.sede_id
      AND users.role IN ('digitador', 'cheff', 'cocinero', 'empacador', 'repartidor', 'admin')
    )
  );

-- RLS Policies for order_items
CREATE POLICY "Users can view order items if they can view the order"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (
        orders.customer_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM users
          WHERE users.id = auth.uid()
          AND users.sede_id = orders.sede_id
          AND users.role IN ('digitador', 'cheff', 'cocinero', 'empacador', 'repartidor', 'admin')
        )
      )
    )
  );

CREATE POLICY "Staff can manage order items"
  ON order_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      JOIN users ON users.sede_id = orders.sede_id
      WHERE orders.id = order_items.order_id
      AND users.id = auth.uid()
      AND users.role IN ('digitador', 'cheff', 'cocinero', 'empacador', 'admin')
    )
  );

-- RLS Policies for cart_items
CREATE POLICY "Customers can manage own cart"
  ON cart_items FOR ALL
  TO authenticated
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

-- RLS Policies for order_status_history
CREATE POLICY "Users can view order status history"
  ON order_status_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_status_history.order_id
      AND (
        orders.customer_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM users
          WHERE users.id = auth.uid()
          AND users.sede_id = orders.sede_id
          AND users.role IN ('digitador', 'cheff', 'cocinero', 'empacador', 'repartidor', 'admin')
        )
      )
    )
  );

CREATE POLICY "Staff can create status history"
  ON order_status_history FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      JOIN users ON users.sede_id = orders.sede_id
      WHERE orders.id = order_status_history.order_id
      AND users.id = auth.uid()
      AND users.role IN ('digitador', 'cheff', 'cocinero', 'empacador', 'repartidor', 'admin')
    )
  );

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  new_number text;
  counter integer;
BEGIN
  SELECT COUNT(*) + 1 INTO counter FROM orders WHERE DATE(created_at) = CURRENT_DATE;
  new_number := 'ORD-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(counter::text, 4, '0');
  RETURN new_number;
END;
$$;

-- Function to update order status and create history
CREATE OR REPLACE FUNCTION update_order_status(
  p_order_id uuid,
  p_new_status text,
  p_user_id uuid,
  p_notes text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE orders SET status = p_new_status WHERE id = p_order_id;
  
  INSERT INTO order_status_history (order_id, status, changed_by, notes)
  VALUES (p_order_id, p_new_status, p_user_id, p_notes);
  
  CASE p_new_status
    WHEN 'confirmed' THEN
      UPDATE orders SET confirmed_at = now() WHERE id = p_order_id;
    WHEN 'in_kitchen' THEN
      UPDATE orders SET kitchen_start_at = now() WHERE id = p_order_id;
    WHEN 'ready' THEN
      UPDATE orders SET ready_at = now() WHERE id = p_order_id;
    WHEN 'delivered' THEN
      UPDATE orders SET delivered_at = now() WHERE id = p_order_id;
    ELSE
  END CASE;
END;
$$;

-- Trigger to update updated_at on menu_items
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();