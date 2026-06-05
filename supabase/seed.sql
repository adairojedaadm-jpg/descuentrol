-- ============================================
-- SEED DATA: descuentrol
-- ============================================

-- 1. Inserción de Categorías
INSERT INTO categories (name, slug, icon, display_order) VALUES
  ('Combustible',      'combustible',     'Fuel',         1),
  ('Farmacia',         'farmacia',        'Pill',         2),
  ('Supermercado',     'supermercado',    'ShoppingCart', 3),
  ('Restaurante',      'restaurante',     'Utensils',     4),
  ('Viajes',           'viajes',          'Plane',        5),
  ('Electrodomésticos','electrodomesticos','Tv',         6),
  ('Ropa',             'ropa',            'Shirt',        7),
  ('Entretenimiento',  'entretenimiento', 'Ticket',       8),
  ('Tecnología',       'tecnologia',      'Smartphone',   9),
  ('Salud',            'salud',           'Heart',        10)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  display_order = EXCLUDED.display_order;

-- 2. Inserción de Bancos
INSERT INTO banks (name, active, scraper_type) VALUES
  ('Banco Itaú Paraguay', true, 'PLAYWRIGHT'),
  ('Banco Continental', true, 'PLAYWRIGHT'),
  ('Banco Familiar', true, 'PLAYWRIGHT'),
  ('ueno bank', true, 'PLAYWRIGHT'),
  ('Banco Sudameris', true, 'PLAYWRIGHT'),
  ('Banco GNB Paraguay', true, 'PLAYWRIGHT'),
  ('Banco Interfisa', true, 'PLAYWRIGHT'),
  ('BNF (Banco Nacional de Fomento)', true, 'PLAYWRIGHT'),
  ('Banco Atlas', true, 'PLAYWRIGHT'),
  ('Bancop', true, 'CHEERIO'),
  ('Banco Basa', true, 'PLAYWRIGHT'),
  ('Solar Banco', true, 'PLAYWRIGHT'),
  ('Banco Zeta', true, 'PLAYWRIGHT');

-- 3. Inserción de Tarjetas por Banco
-- Banco Itaú Paraguay
INSERT INTO cards (bank_id, name, network, color) VALUES
  ((SELECT id FROM banks WHERE name='Banco Itaú Paraguay'), 'Itaú Visa Clásica', 'VISA', '#1A1F71'),
  ((SELECT id FROM banks WHERE name='Banco Itaú Paraguay'), 'Itaú Mastercard Clásica', 'MASTERCARD', '#EB001B'),
  ((SELECT id FROM banks WHERE name='Banco Itaú Paraguay'), 'Itaú Visa Gold', 'VISA', '#D4AF37'),
  ((SELECT id FROM banks WHERE name='Banco Itaú Paraguay'), 'Itaú Mastercard Gold', 'MASTERCARD', '#D4AF37'),
  ((SELECT id FROM banks WHERE name='Banco Itaú Paraguay'), 'Itaú Visa Infinite', 'VISA', '#000000'),
  ((SELECT id FROM banks WHERE name='Banco Itaú Paraguay'), 'Itaú Mastercard Black', 'MASTERCARD', '#000000');

-- Banco Continental
INSERT INTO cards (bank_id, name, network, color) VALUES
  ((SELECT id FROM banks WHERE name='Banco Continental'), 'Continental Visa Clásica', 'VISA', '#1A1F71'),
  ((SELECT id FROM banks WHERE name='Banco Continental'), 'Continental Mastercard Clásica', 'MASTERCARD', '#EB001B'),
  ((SELECT id FROM banks WHERE name='Banco Continental'), 'Continental Visa Gold', 'VISA', '#D4AF37'),
  ((SELECT id FROM banks WHERE name='Banco Continental'), 'Continental Visa Platinum', 'VISA', '#A0A0A0'),
  ((SELECT id FROM banks WHERE name='Banco Continental'), 'Continental Visa Infinite', 'VISA', '#000000'),
  ((SELECT id FROM banks WHERE name='Banco Continental'), 'Continental Mastercard Black', 'MASTERCARD', '#000000');

-- Banco Familiar
INSERT INTO cards (bank_id, name, network, color) VALUES
  ((SELECT id FROM banks WHERE name='Banco Familiar'), 'Familiar Visa Clásica', 'VISA', '#1A1F71'),
  ((SELECT id FROM banks WHERE name='Banco Familiar'), 'Familiar Mastercard Clásica', 'MASTERCARD', '#EB001B'),
  ((SELECT id FROM banks WHERE name='Banco Familiar'), 'Familiar Visa Gold', 'VISA', '#D4AF37'),
  ((SELECT id FROM banks WHERE name='Banco Familiar'), 'Familiar Visa Infinite', 'VISA', '#000000');

-- ueno bank
INSERT INTO cards (bank_id, name, network, color) VALUES
  ((SELECT id FROM banks WHERE name='ueno bank'), 'ueno Mastercard Clásica', 'MASTERCARD', '#EB001B'),
  ((SELECT id FROM banks WHERE name='ueno bank'), 'ueno Mastercard Duo', 'MASTERCARD', '#00DF89'),
  ((SELECT id FROM banks WHERE name='ueno bank'), 'ueno Mastercard Black', 'MASTERCARD', '#000000');

-- Banco Sudameris
INSERT INTO cards (bank_id, name, network, color) VALUES
  ((SELECT id FROM banks WHERE name='Banco Sudameris'), 'Sudameris Visa Clásica', 'VISA', '#1A1F71'),
  ((SELECT id FROM banks WHERE name='Banco Sudameris'), 'Sudameris Mastercard Clásica', 'MASTERCARD', '#EB001B'),
  ((SELECT id FROM banks WHERE name='Banco Sudameris'), 'Sudameris Visa Infinite', 'VISA', '#000000'),
  ((SELECT id FROM banks WHERE name='Banco Sudameris'), 'Sudameris Mastercard Black', 'MASTERCARD', '#000000');

-- Banco GNB Paraguay
INSERT INTO cards (bank_id, name, network, color) VALUES
  ((SELECT id FROM banks WHERE name='Banco GNB Paraguay'), 'GNB Visa Clásica', 'VISA', '#1A1F71'),
  ((SELECT id FROM banks WHERE name='Banco GNB Paraguay'), 'GNB Mastercard Clásica', 'MASTERCARD', '#EB001B'),
  ((SELECT id FROM banks WHERE name='Banco GNB Paraguay'), 'GNB Visa Platinum', 'VISA', '#A0A0A0'),
  ((SELECT id FROM banks WHERE name='Banco GNB Paraguay'), 'GNB Mastercard Black', 'MASTERCARD', '#000000');

-- Banco Interfisa
INSERT INTO cards (bank_id, name, network, color) VALUES
  ((SELECT id FROM banks WHERE name='Banco Interfisa'), 'Interfisa Visa Clásica', 'VISA', '#1A1F71'),
  ((SELECT id FROM banks WHERE name='Banco Interfisa'), 'Interfisa Mastercard Clásica', 'MASTERCARD', '#EB001B'),
  ((SELECT id FROM banks WHERE name='Banco Interfisa'), 'Interfisa Visa Gold', 'VISA', '#D4AF37');

-- BNF
INSERT INTO cards (bank_id, name, network, color) VALUES
  ((SELECT id FROM banks WHERE name='BNF (Banco Nacional de Fomento)'), 'BNF Visa Clásica', 'VISA', '#1A1F71'),
  ((SELECT id FROM banks WHERE name='BNF (Banco Nacional de Fomento)'), 'BNF Mastercard Clásica', 'MASTERCARD', '#EB001B'),
  ((SELECT id FROM banks WHERE name='BNF (Banco Nacional de Fomento)'), 'BNF Visa Gold', 'VISA', '#D4AF37'),
  ((SELECT id FROM banks WHERE name='BNF (Banco Nacional de Fomento)'), 'BNF Mastercard Gold', 'MASTERCARD', '#D4AF37');

-- Banco Atlas
INSERT INTO cards (bank_id, name, network, color) VALUES
  ((SELECT id FROM banks WHERE name='Banco Atlas'), 'Atlas Visa Clásica', 'VISA', '#1A1F71'),
  ((SELECT id FROM banks WHERE name='Banco Atlas'), 'Atlas Mastercard Clásica', 'MASTERCARD', '#EB001B'),
  ((SELECT id FROM banks WHERE name='Banco Atlas'), 'Atlas Visa Infinite', 'VISA', '#000000'),
  ((SELECT id FROM banks WHERE name='Banco Atlas'), 'Atlas Mastercard Black', 'MASTERCARD', '#000000');

-- Bancop
INSERT INTO cards (bank_id, name, network, color) VALUES
  ((SELECT id FROM banks WHERE name='Bancop'), 'Bancop Visa Clásica', 'VISA', '#1A1F71'),
  ((SELECT id FROM banks WHERE name='Bancop'), 'Bancop Mastercard Clásica', 'MASTERCARD', '#EB001B'),
  ((SELECT id FROM banks WHERE name='Bancop'), 'Bancop Visa Gold', 'VISA', '#D4AF37');

-- Banco Basa
INSERT INTO cards (bank_id, name, network, color) VALUES
  ((SELECT id FROM banks WHERE name='Banco Basa'), 'Basa Visa Clásica', 'VISA', '#1A1F71'),
  ((SELECT id FROM banks WHERE name='Banco Basa'), 'Basa Mastercard Clásica', 'MASTERCARD', '#EB001B'),
  ((SELECT id FROM banks WHERE name='Banco Basa'), 'Basa Visa Gold', 'VISA', '#D4AF37'),
  ((SELECT id FROM banks WHERE name='Banco Basa'), 'Basa Visa Platinum', 'VISA', '#A0A0A0'),
  ((SELECT id FROM banks WHERE name='Banco Basa'), 'Basa Visa Infinite', 'VISA', '#000000');

-- Solar Banco
INSERT INTO cards (bank_id, name, network, color) VALUES
  ((SELECT id FROM banks WHERE name='Solar Banco'), 'Solar Visa Clásica', 'VISA', '#1A1F71'),
  ((SELECT id FROM banks WHERE name='Solar Banco'), 'Solar Mastercard Clásica', 'MASTERCARD', '#EB001B'),
  ((SELECT id FROM banks WHERE name='Solar Banco'), 'Solar Visa Gold', 'VISA', '#D4AF37');

-- Banco Zeta
INSERT INTO cards (bank_id, name, network, color) VALUES
  ((SELECT id FROM banks WHERE name='Banco Zeta'), 'Zeta Visa Clásica', 'VISA', '#1A1F71'),
  ((SELECT id FROM banks WHERE name='Banco Zeta'), 'Zeta Mastercard Clásica', 'MASTERCARD', '#EB001B'),
  ((SELECT id FROM banks WHERE name='Banco Zeta'), 'Zeta Visa Gold', 'VISA', '#D4AF37');
