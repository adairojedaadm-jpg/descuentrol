-- ============================================
-- SCHEMA DEFINITIVO: descuentrol
-- ============================================

-- Banks
CREATE TABLE banks (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT        NOT NULL,
  logo_url      TEXT,
  website_url   TEXT,
  promotions_url TEXT,
  scraper_type  TEXT        NOT NULL DEFAULT 'PLAYWRIGHT'
                            CHECK (scraper_type IN ('PLAYWRIGHT', 'CHEERIO')),
  scraper_config JSONB,
  last_scraped_at TIMESTAMPTZ,
  active        BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tarjetas
CREATE TABLE cards (
  id        UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_id   UUID    NOT NULL REFERENCES banks(id) ON DELETE CASCADE,
  name      TEXT    NOT NULL,
  network   TEXT    NOT NULL
            CHECK (network IN ('VISA', 'MASTERCARD', 'AMEX', 'LOCAL')),
  color     TEXT,
  active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Categorías
CREATE TABLE categories (
  id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT    NOT NULL,
  slug          TEXT    NOT NULL UNIQUE,
  icon          TEXT    NOT NULL,
  color         TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  active        BOOLEAN NOT NULL DEFAULT TRUE
);

-- Promociones
CREATE TABLE promotions (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_id          UUID        NOT NULL REFERENCES banks(id) ON DELETE CASCADE,
  title            TEXT        NOT NULL,
  description      TEXT,
  discount_type    TEXT        NOT NULL
                   CHECK (discount_type IN ('PERCENTAGE', 'CASHBACK', 'CUOTAS', 'FREE')),
  discount_value   DECIMAL,
  discount_display TEXT        NOT NULL,
  conditions       TEXT,
  valid_from       DATE,
  valid_to         DATE,
  days_of_week     INTEGER[]   NOT NULL DEFAULT '{}',
  is_active        BOOLEAN     NOT NULL DEFAULT TRUE,
  verified_by_admin BOOLEAN    NOT NULL DEFAULT FALSE,
  source_type      TEXT        NOT NULL DEFAULT 'HTML'
                   CHECK (source_type IN ('HTML', 'PDF')),
  source_url       TEXT,
  pdf_url          TEXT,
  external_hash    TEXT        UNIQUE,
  scraped_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- M:M Relaciones
CREATE TABLE promotion_cards (
  promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  card_id      UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  PRIMARY KEY (promotion_id, card_id)
);

CREATE TABLE promotion_categories (
  promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  category_id  UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (promotion_id, category_id)
);

-- Subscribers
CREATE TABLE subscribers (
  id          UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT      NOT NULL,
  category_id UUID      NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  card_names  TEXT[]    NOT NULL DEFAULT '{}',
  active      BOOLEAN   NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(email, category_id)
);

-- Logs
CREATE TABLE scraping_logs (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_id        UUID        NOT NULL REFERENCES banks(id) ON DELETE CASCADE,
  started_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at    TIMESTAMPTZ,
  status         TEXT        NOT NULL DEFAULT 'RUNNING'
                 CHECK (status IN ('RUNNING', 'SUCCESS', 'FAILED', 'PARTIAL')),
  promos_found   INTEGER     DEFAULT 0,
  promos_created INTEGER     DEFAULT 0,
  promos_updated INTEGER     DEFAULT 0,
  promos_deleted INTEGER     DEFAULT 0,
  error_message  TEXT
);

-- Índices
CREATE INDEX idx_promotions_bank_id          ON promotions(bank_id);
CREATE INDEX idx_promotions_active_valid     ON promotions(is_active, valid_to);
CREATE INDEX idx_promotions_external_hash    ON promotions(external_hash);
CREATE INDEX idx_promotion_cards_promo       ON promotion_cards(promotion_id);
CREATE INDEX idx_promotion_cards_card        ON promotion_cards(card_id);
CREATE INDEX idx_promotion_cats_promo        ON promotion_categories(promotion_id);
CREATE INDEX idx_promotion_cats_cat          ON promotion_categories(category_id);
CREATE INDEX idx_cards_bank_id               ON cards(bank_id);
CREATE INDEX idx_subscribers_category        ON subscribers(category_id);

-- trigger de updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_banks_updated_at BEFORE UPDATE ON banks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_cards_updated_at BEFORE UPDATE ON cards FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_promotions_updated_at BEFORE UPDATE ON promotions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Función SQL para la búsqueda reactiva por día
CREATE OR REPLACE FUNCTION search_promotions(
  p_categoria TEXT,
  p_tarjetas  UUID[],
  p_dia       INTEGER DEFAULT NULL
)
RETURNS TABLE (
  id               UUID,
  title            TEXT,
  description      TEXT,
  discount_type    TEXT,
  discount_value   DECIMAL,
  discount_display TEXT,
  conditions       TEXT,
  valid_to         DATE,
  days_of_week     INTEGER[],
  source_type      TEXT,
  pdf_url          TEXT,
  source_url       TEXT,
  bank             JSONB,
  matched_cards    JSONB
) AS $$
DECLARE
  v_dia INTEGER;
BEGIN
  IF p_dia IS NULL THEN
    v_dia := EXTRACT(DOW FROM CURRENT_TIMESTAMP AT TIME ZONE 'America/Asuncion')::INTEGER;
  ELSE
    v_dia := p_dia;
  END IF;

  RETURN QUERY
  SELECT DISTINCT ON (p.id)
    p.id,
    p.title,
    p.description,
    p.discount_type,
    p.discount_value,
    p.discount_display,
    p.conditions,
    p.valid_to,
    p.days_of_week,
    p.source_type,
    p.pdf_url,
    p.source_url,
    jsonb_build_object(
      'id', b.id, 'name', b.name, 'logo_url', b.logo_url
    ) AS bank,
    (
      SELECT jsonb_agg(
        jsonb_build_object('id', c.id, 'name', c.name, 'network', c.network)
      )
      FROM promotion_cards pc2
      JOIN cards c ON pc2.card_id = c.id
      WHERE pc2.promotion_id = p.id
        AND c.id = ANY(p_tarjetas)
    ) AS matched_cards
  FROM promotions p
  JOIN banks b ON p.bank_id = b.id
  JOIN promotion_cards pc ON p.id = pc.promotion_id
  JOIN promotion_categories pcat ON p.id = pcat.promotion_id
  JOIN categories cat ON pcat.category_id = cat.id
  WHERE cat.slug = p_categoria
    AND pc.card_id = ANY(p_tarjetas)
    AND p.is_active = TRUE
    AND (p.valid_to IS NULL OR p.valid_to >= CURRENT_DATE)
    AND (
      v_dia = ANY(p.days_of_week)
      OR cardinality(p.days_of_week) = 0
    )
  ORDER BY p.id, p.discount_value DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql STABLE;
