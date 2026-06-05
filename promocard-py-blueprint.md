# PromoCard PY — Blueprint v2

> Generado por The Architect | Revisado y auditado: 2026-06-01
> Archetype: Web App + Content Platform (híbrido)
> Developer: 1 persona | Escala objetivo: 10,000+ usuarios/mes

---

## 1. Descripción del Proyecto

### Visión

PromoCard PY es una web app para consumidores paraguayos con múltiples tarjetas de crédito. Resuelve un problema cotidiano: nadie lee los mensajes de los bancos, y cuando querés cargar combustible un lunes no sabés qué tarjeta usar. El usuario elige su necesidad (categoría) y sus tarjetas disponibles, y la app le muestra en segundos qué tarjeta conviene usar hoy, mañana, o cualquier día de la semana.

Los datos provienen de scraping automático semanal de los sitios web de todos los bancos paraguayos — tanto en formato HTML como PDF. Monetización inicial: Google AdSense. Sin sistema de cuentas de usuario: la búsqueda es completamente anónima y stateless. Los usuarios pueden dejar su email para recibir alertas semanales de nuevas promos.

### Objetivos

- Búsqueda instantánea sin registro: categoría + tarjetas disponibles + día → promos
- Datos actualizados automáticamente via scraping semanal de ~15 bancos paraguayos (HTML y PDF)
- Ingresos desde el día 1 via Google AdSense
- Alertas opcionales por email (sin cuentas de usuario — solo email + preferencias)

### Métricas de Éxito

- Resultados visibles < 1 segundo desde que el usuario hace la búsqueda
- Cobertura del 90%+ de bancos con tarjetas de crédito en Paraguay
- Scraping semanal sin fallos por 4 semanas consecutivas
- CTR de AdSense > 1% (benchmark finanzas)

---

## 2. Tech Stack

| Capa | Tecnología | Por qué |
|------|-----------|---------|
| Framework | Next.js 15 (App Router) | SSR + SSG para SEO; promos son contenido indexable |
| Lenguaje | TypeScript strict | Sin excepciones |
| Estilos | Tailwind CSS v4 | Estándar, máxima velocidad |
| Componentes | shadcn/ui | Accesible, personalizable, integrado con Tailwind |
| Base de datos | Supabase (PostgreSQL) | DB + Storage + tipos auto-generados en un servicio |
| Queries | Supabase JS SDK | Sin ORM adicional — evita el problema de conexiones de Prisma en serverless |
| Auth | **Ninguna** | Solo se recolecta email en tabla `subscribers`. Sin sesiones. |
| Admin | HTTP Basic Auth (middleware) | Username + password via env var. Suficiente para 1 developer. |
| Scraping | GitHub Actions (cron semanal) + Playwright + Cheerio | Gratis, aislado, soporta browsers headless |
| PDFs | pdf-parse + Supabase Storage | Extrae texto de PDFs; si falla, guarda el link |
| Rate Limiting | Upstash Rate Limit | Free tier, serverless-friendly |
| Hosting | Vercel (Hobby → Pro según tráfico) | Deploy instantáneo, CDN global |
| Email | Resend | Alertas semanales; free tier 3K/mes |
| Publicidad | Google AdSense | Auto-gestionado |
| Package manager | pnpm | Más rápido que npm |
| Tipos DB | Supabase CLI (`gen types`) | Auto-generados desde schema — reemplaza Prisma |

> **Por qué no Prisma**: Prisma en Vercel serverless abre una nueva conexión por invocación de función. Con 10k+ usuarios/mes, agota el límite de conexiones del free tier de Supabase (60 conexiones). El SDK de Supabase usa HTTP (Pooler integrado) y no tiene este problema.
> **Por qué no Firebase**: Agregar un segundo servicio de infraestructura cuando Supabase ya provee todo es complejidad innecesaria.
> **Por qué no sistema de auth**: El único dato de usuario que se necesita es el email para alertas. Una tabla `subscribers` simple es 10x más fácil de construir y mantener.

---

## 3. Estructura de Directorios

```
promocard-py/
├── src/
│   ├── app/
│   │   ├── (public)/                        # Rutas públicas — sin restricción
│   │   │   ├── page.tsx                     # Home: hero + grid de categorías
│   │   │   ├── buscar/
│   │   │   │   └── page.tsx                 # Selector tarjetas + resultados
│   │   │   ├── sobre-nosotros/
│   │   │   │   └── page.tsx
│   │   │   ├── privacidad/
│   │   │   │   └── page.tsx                 # Política de privacidad (Ley 1682/2001 PY)
│   │   │   ├── terminos/
│   │   │   │   └── page.tsx                 # Términos de uso
│   │   │   └── layout.tsx                   # Navbar + Footer
│   │   ├── (admin)/                         # Protegido por HTTP Basic Auth en middleware
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx                 # Dashboard: stats + estado scraping
│   │   │   │   ├── promociones/
│   │   │   │   │   ├── page.tsx             # Tabla promos (pendientes/verificadas)
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx         # Editor de promo
│   │   │   │   ├── bancos/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── tarjetas/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── categorias/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── scraping/
│   │   │   │       └── page.tsx             # Logs de scraping por banco
│   │   │   └── layout.tsx                   # Sidebar admin
│   │   ├── api/
│   │   │   ├── promociones/
│   │   │   │   └── route.ts                 # GET — búsqueda con rate limit
│   │   │   ├── bancos/
│   │   │   │   └── route.ts                 # GET — bancos + tarjetas activos
│   │   │   ├── categorias/
│   │   │   │   └── route.ts                 # GET — categorías activas
│   │   │   ├── suscribirse/
│   │   │   │   └── route.ts                 # POST — registrar email para alertas
│   │   │   ├── desuscribirse/
│   │   │   │   └── route.ts                 # DELETE — cancelar suscripción
│   │   │   └── admin/
│   │   │       ├── promociones/
│   │   │       │   └── route.ts             # GET/PATCH/DELETE — admin CRUD
│   │   │       ├── bancos/
│   │   │       │   └── route.ts
│   │   │       └── scraping/
│   │   │           └── route.ts             # GET — logs de scraping
│   │   ├── layout.tsx                       # Root layout (fonts, metadata)
│   │   └── globals.css                      # Tailwind + CSS variables
│   ├── components/
│   │   ├── ui/                              # shadcn/ui — no editar directamente
│   │   ├── search/
│   │   │   ├── CategoryGrid.tsx             # Grid de íconos en home
│   │   │   ├── CardSelector.tsx             # Multi-select de tarjetas
│   │   │   ├── BankGroup.tsx                # Tarjetas agrupadas por banco
│   │   │   ├── CardChip.tsx                 # Chip individual toggle
│   │   │   ├── DayFilter.tsx                # Tabs Hoy/Lun/Mar/...
│   │   │   └── SubscribeDialog.tsx          # Modal para suscribir email
│   │   ├── promo/
│   │   │   ├── PromoCard.tsx                # Card de promo HTML (datos estructurados)
│   │   │   ├── PdfPromoCard.tsx             # Card simplificada para promos PDF
│   │   │   ├── PromoList.tsx                # Lista + empty state + estado sin datos
│   │   │   ├── DiscountBadge.tsx            # "20% de reintegro"
│   │   │   └── DaysBadge.tsx                # "Lun · Mar · Mié"
│   │   ├── admin/
│   │   │   ├── PromoTable.tsx
│   │   │   ├── PromoEditor.tsx
│   │   │   ├── ScrapingLog.tsx
│   │   │   └── StatsCard.tsx
│   │   ├── ads/
│   │   │   ├── AdBanner.tsx
│   │   │   └── AdSidebar.tsx
│   │   └── layout/
│   │       ├── Navbar.tsx
│   │       ├── Footer.tsx
│   │       └── AdminSidebar.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                    # Browser client
│   │   │   └── server.ts                    # Server client (SSR/API routes)
│   │   ├── db/                              # Helpers de queries organizados por dominio
│   │   │   ├── promotions.ts                # searchPromotions(), getAdminPromotions()
│   │   │   ├── banks.ts                     # getBanksWithCards()
│   │   │   ├── categories.ts                # getCategories()
│   │   │   └── subscribers.ts               # subscribe(), unsubscribe()
│   │   ├── rate-limit.ts                    # Upstash Rate Limit config
│   │   ├── email.ts                         # Resend client + plantillas de alerta
│   │   └── utils.ts                         # cn(), formatDay(), formatDiscount()
│   ├── types/
│   │   ├── index.ts                         # Tipos del dominio (PromoSearchResult, etc.)
│   │   └── database.ts                      # Auto-generado: `pnpm db:types`
│   └── middleware.ts                        # HTTP Basic Auth para /admin/*
├── supabase/
│   └── migrations/
│       └── 001_initial.sql                  # Schema SQL completo + funciones + índices
├── scrapers/                                # Sub-proyecto Node.js independiente
│   ├── package.json
│   ├── tsconfig.json
│   ├── index.ts                             # Runner: Promise.allSettled() sobre todos los bancos
│   ├── banks/
│   │   ├── base.ts                          # Clase abstracta BaseBank
│   │   ├── itau.ts
│   │   ├── continental.ts
│   │   ├── familiar.ts
│   │   ├── ueno.ts
│   │   ├── sudameris.ts
│   │   ├── gnb.ts
│   │   ├── interfisa.ts
│   │   ├── bnf.ts
│   │   ├── vision.ts
│   │   ├── regional.ts
│   │   ├── atlas.ts
│   │   ├── bbva.ts
│   │   └── bancop.ts
│   └── utils/
│       ├── normalize.ts                     # Normaliza datos a NormalizedPromotion
│       ├── supabase-client.ts               # Cliente con SERVICE_ROLE_KEY
│       ├── day-parser.ts                    # "Lunes a Viernes" → [1,2,3,4,5]
│       ├── pdf-handler.ts                   # Descarga, sube a Storage, extrae texto
│       └── hash.ts                          # SHA-256 para external_hash
├── .github/
│   └── workflows/
│       ├── scrape.yml                       # Cron: domingos 05:00 UTC
│       └── scrape-manual.yml                # Workflow dispatch con input: bank_slug
├── public/
│   ├── banks/                               # Logos SVG por banco
│   ├── categories/                          # Íconos por categoría
│   └── og-image.png
├── .env.local
├── .env.example
└── next.config.ts
```

---

## 4. Modelo de Datos

### Schema SQL Completo

Ejecutar en Supabase Dashboard → SQL Editor, o como migración en `supabase/migrations/001_initial.sql`.

```sql
-- ============================================
-- SCHEMA: PromoCard PY
-- ============================================

-- Banks
CREATE TABLE banks (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT        NOT NULL,
  logo_url      TEXT,
  website_url   TEXT,
  promotions_url TEXT,                              -- URL específica de la página de promos
  scraper_type  TEXT        NOT NULL DEFAULT 'PLAYWRIGHT'
                            CHECK (scraper_type IN ('PLAYWRIGHT', 'CHEERIO')),
  scraper_config JSONB,                             -- Selectores CSS, wait conditions
  last_scraped_at TIMESTAMPTZ,
  active        BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cards
CREATE TABLE cards (
  id        UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_id   UUID    NOT NULL REFERENCES banks(id),
  name      TEXT    NOT NULL,                       -- "Visa Clásica", "Mastercard Gold"
  network   TEXT    NOT NULL
            CHECK (network IN ('VISA', 'MASTERCARD', 'AMEX', 'LOCAL')),
  color     TEXT,                                   -- Hex para UI
  active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Categories
CREATE TABLE categories (
  id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT    NOT NULL,                   -- "Combustible"
  slug          TEXT    NOT NULL UNIQUE,            -- "combustible"
  icon          TEXT    NOT NULL,                   -- nombre lucide-react
  color         TEXT,                               -- color del icono en UI
  display_order INTEGER NOT NULL DEFAULT 0,
  active        BOOLEAN NOT NULL DEFAULT TRUE
);

-- Promotions
CREATE TABLE promotions (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_id          UUID        NOT NULL REFERENCES banks(id),
  title            TEXT        NOT NULL,
  description      TEXT,
  discount_type    TEXT        NOT NULL
                   CHECK (discount_type IN ('PERCENTAGE', 'CASHBACK', 'CUOTAS', 'FREE')),
  discount_value   DECIMAL,                         -- 20 para "20%", 3 para "3 cuotas"
  discount_display TEXT        NOT NULL,            -- "20% de reintegro" — texto UI
  conditions       TEXT,                            -- Letra chica
  valid_from       DATE,
  valid_to         DATE,
  days_of_week     INTEGER[]   NOT NULL DEFAULT '{}', -- [] = todos los días
  is_active        BOOLEAN     NOT NULL DEFAULT TRUE,
  verified_by_admin BOOLEAN    NOT NULL DEFAULT FALSE,
  source_type      TEXT        NOT NULL DEFAULT 'HTML'
                   CHECK (source_type IN ('HTML', 'PDF')),
  source_url       TEXT,
  pdf_url          TEXT,                            -- URL del PDF en Supabase Storage
  external_hash    TEXT        UNIQUE,              -- SHA-256(bank_id+title+source_url)
  consecutive_misses INTEGER   NOT NULL DEFAULT 0, -- si llega a 2 → is_active = false
  scraped_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Promotion ↔ Cards (M:M)
CREATE TABLE promotion_cards (
  promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  card_id      UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  PRIMARY KEY (promotion_id, card_id)
);

-- Promotion ↔ Categories (M:M)
CREATE TABLE promotion_categories (
  promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  category_id  UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (promotion_id, category_id)
);

-- Email subscribers (reemplaza todo el sistema de auth)
CREATE TABLE subscribers (
  id          UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT      NOT NULL,
  category_id UUID      NOT NULL REFERENCES categories(id),
  card_names  TEXT[]    NOT NULL DEFAULT '{}',  -- nombres de tarjetas (no IDs)
  active      BOOLEAN   NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(email, category_id)                    -- un email no puede suscribirse 2x a la misma cat.
);

-- Scraping logs
CREATE TABLE scraping_logs (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_id        UUID        NOT NULL REFERENCES banks(id),
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

-- ============================================
-- ÍNDICES
-- ============================================
CREATE INDEX idx_promotions_bank_id          ON promotions(bank_id);
CREATE INDEX idx_promotions_active_valid     ON promotions(is_active, valid_to);
CREATE INDEX idx_promotions_external_hash    ON promotions(external_hash);
CREATE INDEX idx_promotion_cards_promo       ON promotion_cards(promotion_id);
CREATE INDEX idx_promotion_cards_card        ON promotion_cards(card_id);
CREATE INDEX idx_promotion_cats_promo        ON promotion_categories(promotion_id);
CREATE INDEX idx_promotion_cats_cat          ON promotion_categories(category_id);
CREATE INDEX idx_cards_bank_id               ON cards(bank_id);
CREATE INDEX idx_subscribers_category        ON subscribers(category_id);
CREATE INDEX idx_scraping_logs_bank_status   ON scraping_logs(bank_id, status);

-- ============================================
-- TRIGGER: updated_at automático
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_banks_updated_at
  BEFORE UPDATE ON banks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_cards_updated_at
  BEFORE UPDATE ON cards FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_promotions_updated_at
  BEFORE UPDATE ON promotions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- FUNCIÓN: búsqueda de promos (usada via supabase.rpc)
-- ============================================
CREATE OR REPLACE FUNCTION search_promotions(
  p_categoria TEXT,
  p_tarjetas  UUID[],
  p_dia       INTEGER   -- 0=Dom, 1=Lun ... 6=Sáb
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
      p_dia = ANY(p.days_of_week)   -- promo aplica a este día
      OR cardinality(p.days_of_week) = 0  -- promo aplica todos los días
    )
  ORDER BY p.id, p.discount_value DESC NULLS LAST
$$ LANGUAGE sql STABLE;
```

### Relaciones

- `Bank` 1→N `Card`
- `Bank` 1→N `Promotion`
- `Promotion` N:M `Card` via `promotion_cards`
- `Promotion` N:M `Category` via `promotion_categories`
- `Subscriber` N:1 `Category` (un subscriber por categoría; puede suscribirse a múltiples categorías)

---

## 5. API Design

### Resumen de Rutas

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | /api/categorias | Categorías activas | No |
| GET | /api/bancos | Bancos activos con tarjetas | No |
| GET | /api/promociones | Promos filtradas (rate-limited) | No |
| POST | /api/suscribirse | Registrar email + preferencias | No |
| DELETE | /api/desuscribirse | Cancelar suscripción por email | No |
| GET | /api/admin/promociones | Lista admin de todas las promos | Basic Auth |
| PATCH | /api/admin/promociones/[id] | Editar promo | Basic Auth |
| DELETE | /api/admin/promociones/[id] | Eliminar promo | Basic Auth |
| GET | /api/admin/bancos | Lista bancos con config scraper | Basic Auth |
| PATCH | /api/admin/bancos/[id] | Editar banco | Basic Auth |
| GET | /api/admin/scraping | Logs de scraping | Basic Auth |

> **Nota**: No existe endpoint de ingestión. Los scrapers escriben directamente a Supabase con `SERVICE_ROLE_KEY`. Esto elimina un punto de falla y reduce latencia.

### GET /api/promociones — Detalle

```
Query params:
  categoria  string (slug)        — requerido
  tarjetas   string (UUIDs CSV)   — requerido: "uuid1,uuid2"
  dia        integer (0-6)        — opcional; default: getDay() en timezone PY (UTC-4)
```

Validación Zod:
```typescript
const schema = z.object({
  categoria: z.string().min(1).max(50),
  tarjetas: z.string().transform(s => s.split(','))
    .pipe(z.array(z.string().uuid()).min(1).max(20)), // límite de 20 tarjetas
  dia: z.coerce.number().int().min(0).max(6).optional()
})
```

Rate limit: **20 requests/minuto por IP** (Upstash sliding window).

Implementación:
```typescript
const { data, error } = await supabase.rpc('search_promotions', {
  p_categoria: categoria,
  p_tarjetas: tarjetas,
  p_dia: dia
})
```

Response 200:
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "20% de reintegro en combustible",
      "discount_display": "20% de reintegro",
      "discount_type": "CASHBACK",
      "discount_value": 20,
      "conditions": "Máx. G. 50.000. Válido en estaciones afiliadas.",
      "valid_to": "2024-12-31",
      "days_of_week": [1, 2, 3, 4, 5],
      "source_type": "HTML",
      "pdf_url": null,
      "bank": { "id": "uuid", "name": "Banco Itaú", "logo_url": "/banks/itau.svg" },
      "matched_cards": [{ "id": "uuid", "name": "Visa Clásica", "network": "VISA" }]
    }
  ],
  "total": 5
}
```

Errores: 400 (params inválidos), 429 (rate limit), 500 (DB error).

### POST /api/suscribirse

```json
{
  "email": "usuario@example.com",
  "category_id": "uuid",
  "card_names": ["Itaú Visa Clásica", "Ueno Mastercard"]
}
```

Upsert en tabla `subscribers` con `UNIQUE(email, category_id)`. Si ya existe: actualiza `card_names` y reactiva si estaba inactivo. Response: 201 Created.

---

## 6. Arquitectura Frontend

### Páginas / Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Hero + grid de categorías |
| `/buscar?cat={slug}&tarjetas={csv}&dia={n}` | Selector tarjetas + resultados |
| `/sobre-nosotros` | Qué es PromoCard, cómo funciona |
| `/privacidad` | Política de privacidad (Ley 1682/2001 PY) |
| `/terminos` | Términos de uso |
| `/admin` | Dashboard admin: stats + logs scraping |
| `/admin/promociones` | Tabla de promos con filtros |
| `/admin/promociones/[id]` | Editor de promo |
| `/admin/bancos` | Gestión de bancos + config scraper |
| `/admin/tarjetas` | Gestión de tarjetas |
| `/admin/categorias` | CRUD categorías |
| `/admin/scraping` | Logs por banco + trigger manual |

### Jerarquía de Componentes — Flujo de Búsqueda

```
BuscarPage (Server Component — fetch bancos+tarjetas en el servidor)
  ├── SearchHeader
  │     ├── CategoryIcon (ícono + nombre de la categoría activa)
  │     └── CambiarButton → /
  ├── CardSelectorSection (Client Component)
  │     ├── BankGroup × n
  │     │     ├── BancoLogo
  │     │     └── CardChip × n  (toggle selección)
  │     └── BuscarButton (disabled si 0 seleccionadas)
  └── PromoResultados (Client Component — fetch vía useQuery)
        ├── DayFilter  (Hoy · Lun · Mar · Mié · Jue · Vie · Sáb · Dom)
        ├── PromoCount ("5 promociones para hoy")
        ├── AdBanner   (AdSense — top de resultados)
        ├── [Por cada promo]:
        │     ├── PromoCard (source_type: HTML — datos estructurados)
        │     └── PdfPromoCard (source_type: PDF — título + badge "Ver PDF")
        ├── AdSlot (cada 5 promos)
        ├── EmptyState (cuando total = 0)
        ├── NoDataState (cuando la DB está vacía — primer run del scraper pendiente)
        └── SubscribeDialog (modal: "Recibí alertas de estas promos")
```

### Manejo de Estado

- **Server Components** para fetch inicial (bancos, tarjetas, categorías) — sin waterfalls
- **Client Components** para selección de tarjetas y resultados
- **TanStack Query** para fetch de promos: `staleTime: Infinity`, refetch solo cuando cambian los params de URL
- **URL search params** como única fuente de verdad: `/buscar?cat=combustible&tarjetas=uuid1,uuid2&dia=1`
- **Sin estado global** (no Zustand, no Context para búsqueda)
- **Cache de servidor**: `next: { revalidate: 900 }` en `/api/bancos` y `/api/categorias` (15 min — datos poco volátiles). `/api/promociones` no cachea en servidor (datos dinámicos por params únicos).

---

## 7. Sistema Visual

### Paleta de Colores

| Rol | Hex | Uso |
|-----|-----|-----|
| Primary | `#F97316` | Botones CTA, íconos activos, selección |
| Primary Dark | `#EA580C` | Hover de primario |
| Secondary | `#7C3AED` | Badges de categoría, acciones secundarias |
| Accent | `#FBBF24` | Etiquetas "¡Nuevo!", highlights |
| Background | `#FFFFFF` | Fondo de página |
| Surface | `#F8FAFC` | Cards, paneles |
| Border | `#E2E8F0` | Bordes |
| Text | `#1E293B` | Texto principal |
| Muted | `#64748B` | Texto secundario |
| Destructive | `#EF4444` | Errores |
| Success | `#22C55E` | Verificado, confirmaciones |
| VISA | `#1A1F71` | Chip de tarjeta Visa |
| MASTERCARD | `#EB001B` | Chip Mastercard |
| AMEX | `#007BC7` | Chip AMEX |
| PDF | `#DC2626` | Badge "PDF" en PdfPromoCard |

### Tipografía

| Rol | Fuente | Tamaño | Peso |
|-----|--------|--------|------|
| Display/Hero | Plus Jakarta Sans | 48–64px | 800 |
| H1 | Plus Jakarta Sans | 32px | 700 |
| H2–H3 | Plus Jakarta Sans | 20–24px | 600 |
| Body | Inter | 16px | 400 |
| Small/Label | Inter | 13–14px | 500 |
| Badge | Inter | 12px | 600 |

Instalar via `next/font/google`: `Plus_Jakarta_Sans` + `Inter`.

### Espaciado y Layout

- Base: 4px → escala 4, 8, 12, 16, 20, 24, 32, 48, 64, 96
- Border radius: 8px inputs, 12px botones, 16px cards, 9999px chips/badges
- Ancho máximo: 1280px
- Grid categorías: 3 cols mobile → 4 tablet → 6 desktop
- Mobile-first: diseñar y testear primero en 375px

---

## 8. Autenticación y Autorización

### Para Usuarios Finales: Ninguna

El acceso a la búsqueda es 100% público y anónimo. No hay login, no hay sesión, no hay cookies de auth.

La única interacción "de usuario" es dejar el email para alertas, que va directo a la tabla `subscribers`. No hay "cuenta". Para cancelar, el usuario clickea un link único en el email que llama a `/api/desuscribirse?token={uuid}`.

### Para el Admin: HTTP Basic Auth

```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  const authHeader = request.headers.get('authorization')
  const validAuth = 'Basic ' + Buffer.from(
    `admin:${process.env.ADMIN_PASSWORD}`
  ).toString('base64')

  if (authHeader !== validAuth) {
    return new NextResponse('Acceso denegado', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="PromoCard Admin"' }
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*']
}
```

Al acceder a `/admin`, el browser muestra un diálogo nativo de usuario/contraseña. Sin UI que construir. Sin tokens que manejar.

| Rol | Acceso |
|-----|--------|
| Anónimo | Todo el sitio público + búsqueda |
| Admin | `/admin/*` con `ADMIN_PASSWORD` via Basic Auth |

---

## 9. Arquitectura de Scraping

### Principio

Los scrapers son un **sub-proyecto Node.js completamente independiente** en `/scrapers/`. No importan nada del app Next.js. Escriben directamente a Supabase usando la `SERVICE_ROLE_KEY` (bypass de RLS). No hay endpoint HTTP entre los scrapers y la DB.

```
GitHub Actions (domingos 05:00 UTC)
  → scrapers/index.ts
      → Promise.allSettled([itau(), continental(), ...])
          Cada scraper:
            1. Abre browser con Playwright (o parsea con Cheerio)
            2. Detecta si hay PDFs → pdf-handler.ts
            3. Normaliza → normalize.ts
            4. Genera external_hash → hash.ts
            5. Upsert en Supabase (directo, service_role)
            6. Hard delete de promos vencidas del banco
            7. Marca consecutive_misses += 1 para promos no encontradas
            8. Actualiza last_scraped_at + escribe scraping_log
  → index.ts envía resumen por email al admin (Resend)
```

### Clase Base del Scraper

```typescript
// scrapers/banks/base.ts
export abstract class BaseBank {
  abstract bankSlug: string
  abstract scrape(): Promise<NormalizedPromotion[]>

  async run(): Promise<ScrapingResult> {
    const log = await this.startLog()
    try {
      const promos = await this.scrape()
      const result = await this.upsertPromotions(promos)
      await this.deleteExpired()
      await this.markMissing(promos)
      await this.finishLog(log.id, 'SUCCESS', result)
      return result
    } catch (error) {
      await this.finishLog(log.id, 'FAILED', null, String(error))
      throw error
    }
  }

  private async upsertPromotions(promos: NormalizedPromotion[]) {
    // Upsert usando external_hash como clave de conflicto
    const { data, error } = await supabase
      .from('promotions')
      .upsert(
        promos.map(p => ({ ...p, consecutive_misses: 0 })),
        { onConflict: 'external_hash' }
      )
    return { created: ..., updated: ... }
  }

  private async deleteExpired() {
    await supabase
      .from('promotions')
      .delete()
      .eq('bank_id', this.bankId)
      .lt('valid_to', new Date().toISOString().split('T')[0])
      .not('valid_to', 'is', null)
  }

  private async markMissing(found: NormalizedPromotion[]) {
    const foundHashes = found.map(p => p.external_hash)
    // Incrementa consecutive_misses en promos no encontradas
    await supabase
      .from('promotions')
      .update({ consecutive_misses: supabase.rpc('increment_misses') })
      .eq('bank_id', this.bankId)
      .not('external_hash', 'in', `(${foundHashes.join(',')})`)
    // Desactiva las que llegan a 2 misses consecutivos
    await supabase
      .from('promotions')
      .update({ is_active: false })
      .eq('bank_id', this.bankId)
      .gte('consecutive_misses', 2)
  }
}
```

### Manejo de PDFs

```typescript
// scrapers/utils/pdf-handler.ts
import { createClient } from '@supabase/supabase-js'
import pdf from 'pdf-parse'
import { createHash } from 'crypto'

export async function handlePdf(pdfUrl: string, bankSlug: string): Promise<{
  text: string | null
  storedUrl: string
}> {
  // 1. Descargar PDF
  const response = await fetch(pdfUrl)
  const buffer = Buffer.from(await response.arrayBuffer())

  // 2. Subir a Supabase Storage
  const hash = createHash('sha256').update(pdfUrl).digest('hex').slice(0, 8)
  const fileName = `${bankSlug}/${new Date().toISOString().split('T')[0]}/${hash}.pdf`
  await supabase.storage.from('promotions-pdfs').upload(fileName, buffer, {
    upsert: true,
    contentType: 'application/pdf'
  })
  const { data } = supabase.storage.from('promotions-pdfs').getPublicUrl(fileName)

  // 3. Intentar extracción de texto
  try {
    const parsed = await pdf(buffer)
    const text = parsed.text?.trim()
    return { text: text || null, storedUrl: data.publicUrl }
  } catch {
    // PDF escaneado (imagen) — no se puede extraer texto
    return { text: null, storedUrl: data.publicUrl }
  }
}
```

Si `text` es null: la promo se crea con `source_type: 'PDF'`, `discount_display: 'Ver catálogo del banco'`, y un link al PDF en `pdf_url`. El usuario verá la `PdfPromoCard` en la UI con un botón "Ver PDF completo".

### GitHub Actions Workflow

```yaml
# .github/workflows/scrape.yml
name: Weekly Scraping

on:
  schedule:
    - cron: '0 5 * * 0'   # Domingos 05:00 UTC (01:00-02:00 AM PY según época)
  workflow_dispatch:        # Trigger manual desde GitHub UI

jobs:
  scrape:
    runs-on: ubuntu-latest
    timeout-minutes: 30     # Forzar timeout si algo cuelga
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install dependencies
        run: cd scrapers && pnpm install
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
      - name: Run scrapers
        run: cd scrapers && pnpm start
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
          ADMIN_EMAIL: ${{ secrets.ADMIN_EMAIL }}
```

```yaml
# .github/workflows/scrape-manual.yml
name: Manual Scraping (Single Bank)

on:
  workflow_dispatch:
    inputs:
      bank_slug:
        description: 'Banco a scrapear (ej: itau, continental, ueno)'
        required: true
        type: string

jobs:
  scrape-single:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: cd scrapers && pnpm install
      - run: npx playwright install --with-deps chromium
      - run: cd scrapers && pnpm start --bank=${{ inputs.bank_slug }}
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
          ADMIN_EMAIL: ${{ secrets.ADMIN_EMAIL }}
```

### Alerta de Scraping Fallido

Al terminar el runner (`scrapers/index.ts`), independientemente del resultado:

```typescript
// Resumen por email al admin
await resend.emails.send({
  from: 'scraping@promocard.com.py',
  to: process.env.ADMIN_EMAIL!,
  subject: `[PromoCard] Scraping semanal — ${successCount}/${totalCount} bancos OK`,
  html: generateScrapingReport(results) // tabla con banco, status, promos encontradas
})
```

---

## 10. Orden de Build

**Seguir en orden estricto. No saltear pasos.**

---

**Paso 1 — Scaffolding**

```bash
pnpm create next-app@latest promocard-py \
  --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd promocard-py
pnpm add @supabase/supabase-js @supabase/ssr
pnpm add lucide-react clsx tailwind-merge @tanstack/react-query
pnpm add @upstash/ratelimit @upstash/redis
pnpm add resend zod
pnpm add -D supabase @types/node
npx shadcn@latest init
npx shadcn@latest add button badge card dialog tabs input label \
  sheet separator skeleton table switch form
```

Configurar en `next.config.ts`:
- `images.remotePatterns` para dominios de logos de bancos
- Variables de entorno typed via `env`

---

**Paso 2 — Supabase + Schema**

1. Crear proyecto en supabase.com (plan **Pro** para producción — $25/mes — evita el pause automático)
2. Crear bucket de Storage: `promotions-pdfs` (público)
3. En Supabase Dashboard → SQL Editor: ejecutar `supabase/migrations/001_initial.sql` completo
4. Verificar que la función `search_promotions` fue creada: SQL Editor → `SELECT * FROM search_promotions('combustible', '{}', 1)` — debe retornar 0 filas sin error
5. Crear `/src/lib/supabase/server.ts` y `client.ts` con el patrón oficial de `@supabase/ssr`

---

**Paso 3 — Generar Tipos + Seed**

```bash
# Instalar Supabase CLI
pnpm supabase login
pnpm supabase gen types typescript --project-id [tu-project-id] \
  > src/types/database.ts

# Agregar script en package.json:
# "db:types": "supabase gen types typescript --project-id [id] > src/types/database.ts"
```

Seed via SQL en Supabase Dashboard (no script TypeScript — más simple):

```sql
-- Bancos
INSERT INTO banks (name, active, scraper_type) VALUES
  ('Banco Itaú', true, 'PLAYWRIGHT'),
  ('Banco Continental', true, 'PLAYWRIGHT'),
  ('Banco Familiar', true, 'PLAYWRIGHT'),
  ('Ueno', true, 'PLAYWRIGHT'),
  ('Banco Sudameris', true, 'PLAYWRIGHT'),
  ('Banco GNB', true, 'PLAYWRIGHT'),
  ('Banco Interfisa', true, 'PLAYWRIGHT'),
  ('BNF', true, 'PLAYWRIGHT'),
  ('Visión Banco', true, 'PLAYWRIGHT'),
  ('Banco Regional', true, 'PLAYWRIGHT'),
  ('Banco Atlas', true, 'PLAYWRIGHT'),
  ('BBVA Paraguay', true, 'PLAYWRIGHT'),
  ('Bancop', true, 'CHEERIO');

-- Categorías
INSERT INTO categories (name, slug, icon, display_order) VALUES
  ('Combustible',     'combustible',     'Fuel',         1),
  ('Farmacia',        'farmacia',        'Pill',         2),
  ('Supermercado',    'supermercado',    'ShoppingCart', 3),
  ('Restaurante',     'restaurante',     'Utensils',     4),
  ('Viajes',          'viajes',          'Plane',        5),
  ('Electrodomésticos','electrodomesticos','Tv',         6),
  ('Ropa',            'ropa',            'Shirt',        7),
  ('Entretenimiento', 'entretenimiento', 'Ticket',       8),
  ('Tecnología',      'tecnologia',      'Smartphone',   9),
  ('Salud',           'salud',           'Heart',        10);

-- Tarjetas (ejemplo — completar para todos los bancos)
INSERT INTO cards (bank_id, name, network) VALUES
  ((SELECT id FROM banks WHERE name='Banco Itaú'), 'Visa Clásica', 'VISA'),
  ((SELECT id FROM banks WHERE name='Banco Itaú'), 'Visa Gold', 'VISA'),
  ((SELECT id FROM banks WHERE name='Banco Itaú'), 'Mastercard', 'MASTERCARD'),
  ((SELECT id FROM banks WHERE name='Ueno'), 'Mastercard', 'MASTERCARD');
-- Continuar para todos los bancos
```

---

**Paso 4 — UX Core (con datos hardcodeados)**

Construir toda la UI antes de conectar la API. Datos mockeados.

1. `app/(public)/page.tsx` — Hero: "¿Qué tarjeta uso hoy?" + `CategoryGrid`
2. `components/search/CategoryGrid.tsx` — Grid responsivo con íconos de lucide-react
3. `app/(public)/buscar/page.tsx` — Layout 2 columnas: selector (izq) + resultados (der) en desktop; stack en mobile
4. `components/search/CardSelector.tsx` — Multi-select con `BankGroup` + `CardChip`
5. `components/search/DayFilter.tsx` — Tabs de días con highlighting del día actual
6. `components/promo/PromoCard.tsx` — Card HTML con todos los datos
7. `components/promo/PdfPromoCard.tsx` — Card simplificada con botón "Ver PDF"
8. `components/promo/PromoList.tsx` — Lista + `EmptyState` + `NoDataState`

**Testear en 375px antes de continuar al Paso 5.**

---

**Paso 5 — API de Búsqueda + Rate Limiting**

1. `src/lib/rate-limit.ts`:
```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, '1 m'),
  analytics: true,
})
```

2. `app/api/categorias/route.ts` — GET, retorna activas con `next: { revalidate: 900 }`
3. `app/api/bancos/route.ts` — GET, retorna bancos + tarjetas con `next: { revalidate: 900 }`
4. `app/api/promociones/route.ts`:
   - Extraer IP del header `x-forwarded-for`
   - Verificar rate limit → 429 si excede
   - Validar params con Zod (ver Sección 5)
   - `await supabase.rpc('search_promotions', { p_categoria, p_tarjetas, p_dia })`
   - Retornar `{ data, total: data.length }`
5. `src/lib/db/promotions.ts` — wrappear el `rpc` en una función tipada

---

**Paso 6 — Conectar UX con API**

1. `QueryClientProvider` en `app/layout.tsx` (Client Component wrapper)
2. En `BuscarPage`: Server Component que fetchea bancos+tarjetas al renderizar y los pasa como props
3. `CardSelector`: manejar selección con `useState`; al clickar "Buscar" → actualizar URL params con `useRouter.push`
4. `PromoResultados`: `useQuery` con `queryKey: ['promos', categoria, tarjetas, dia]` — refetch automático cuando cambia la URL
5. Sincronizar `DayFilter` con el param `dia` en la URL
6. Manejar estados: loading (Skeleton), error (mensaje), empty, noData

---

**Paso 7 — Admin Panel + HTTP Basic Auth**

1. `src/middleware.ts` — HTTP Basic Auth (ver Sección 8)
2. Variables en `.env.local`: `ADMIN_PASSWORD=clave-segura-larga`
3. `app/(admin)/admin/page.tsx` — Stats: total promos, bancos activos, promos pendientes de verificación, último scraping
4. `app/(admin)/admin/promociones/page.tsx` — Tabla con shadcn `DataTable`: filtros por estado (todas/pendientes/verificadas/inactivas), acciones: verificar, desactivar, editar
5. `app/(admin)/admin/promociones/[id]/page.tsx` — Formulario completo de edición
6. `app/(admin)/admin/bancos/page.tsx` — CRUD bancos: nombre, URLs, toggle active
7. `app/(admin)/admin/scraping/page.tsx` — Tabla de `scraping_logs`: banco, status, promos encontradas, timestamp, error
8. `app/api/admin/promociones/route.ts` — Verificar Basic Auth en cada route handler de admin

---

**Paso 8 — Infraestructura de Scrapers**

```bash
mkdir scrapers && cd scrapers
pnpm init
pnpm add playwright cheerio @supabase/supabase-js pdf-parse resend dayjs dotenv
pnpm add -D @types/node @types/pdf-parse typescript ts-node
npx playwright install chromium
```

Crear `scrapers/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "strict": true,
    "outDir": "dist"
  }
}
```

Crear en orden:
1. `scrapers/utils/hash.ts` — `generateHash(bankId, title, sourceUrl): string`
2. `scrapers/utils/day-parser.ts` — manejar todas las variaciones de texto de días en español
3. `scrapers/utils/normalize.ts` — `NormalizedPromotion` interface + función normalize
4. `scrapers/utils/pdf-handler.ts` — descarga, Storage, extracción (ver Sección 9)
5. `scrapers/utils/supabase-client.ts` — cliente con `SERVICE_ROLE_KEY`
6. `scrapers/banks/base.ts` — `BaseBank` abstracta
7. `scrapers/index.ts` — runner con `Promise.allSettled` + email de reporte

Crear `.github/workflows/scrape.yml` y `scrape-manual.yml` (ver Sección 9).

---

**Paso 9 — Scrapers MVP (5 bancos)**

Para cada banco, proceso:
1. Abrir el sitio manualmente en Chrome y localizar la página de promos
2. Inspeccionar HTML: ¿las promos son HTML o PDFs?
3. Si HTML: identificar selectores CSS y escribir el scraper con Playwright/Cheerio
4. Si PDF: detectar el link al PDF, usar `pdf-handler.ts`
5. Probar localmente: `cd scrapers && ts-node banks/itau.ts`
6. Verificar datos en Supabase Table Editor
7. Verificar que se muestran correctamente en `/buscar`

Orden de prioridad:
1. `itau.ts` — mayor base de clientes en PY
2. `ueno.ts` — banco digital, HTML más limpio y estructurado
3. `continental.ts`
4. `familiar.ts`
5. `sudameris.ts`

**Desafíos conocidos:**
- Anti-bot leve: Playwright debe usar `user_agent` real y delays aleatorios (`randomDelay(500, 2000)`)
- PDFs escaneados (imagen): `pdf-parse` retorna texto vacío → guardar link solamente
- Texto de días heterogéneo: `day-parser.ts` debe cubrir al menos: "todos los días", "lunes a viernes", "fines de semana", "lunes, miércoles y viernes", "días hábiles"

---

**Paso 10 — Scrapers Restantes (8 bancos)**

Repetir proceso del Paso 9 para: GNB, Interfisa, BNF, Visión, Regional, Atlas, BBVA, Bancop.

Agregar cada banco como step separado en el workflow de Actions para que fallen independientemente.

---

**Paso 11 — Google AdSense**

1. Registrar el sitio en google.com/adsense con el dominio final
2. Verificar propiedad via meta tag en `app/layout.tsx`
3. Crear 3 unidades de anuncio en el panel de AdSense
4. `components/ads/AdBanner.tsx` (Client Component) — banner 728×90 desktop / 320×50 mobile
5. `components/ads/AdSidebar.tsx` — 160×600 sidebar (solo visible en lg+)
6. Script de AdSense en `app/layout.tsx`:
```tsx
<Script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
  strategy="lazyOnload"
/>
```

> AdSense requiere contenido real y algo de tráfico para aprobación. Tener al menos 20 promos reales antes de solicitar revisión.

---

**Paso 12 — Suscriptores y Alertas**

1. `app/api/suscribirse/route.ts` — POST + validación Zod + upsert en `subscribers`
2. `app/api/desuscribirse/route.ts` — DELETE por email + category_id
3. `components/search/SubscribeDialog.tsx` — modal shadcn: campo email + categorías seleccionadas + tarjetas preferidas (texto libre)
4. `src/lib/email.ts` — plantilla de alerta:
```typescript
// Enviada por el scraper semanal
// Asunto: "Nueva promo: 20% en combustible con Itaú Visa"
// Body: lista de promos nuevas + link al buscador con params preconfigurados
```
5. En `scrapers/index.ts`, post-scraping: buscar suscriptores de las categorías afectadas y enviar alertas

---

**Paso 13 — Landing Page + SEO + Legal**

1. Enriquecer `app/(public)/page.tsx`:
   - Hero prominente con buscador directo
   - Sección "Cómo funciona" (3 pasos con íconos)
   - Grid de categorías populares
   - Footer con links (Privacidad, Términos, Sobre nosotros)
2. `app/(public)/privacidad/page.tsx` — texto básico de política de privacidad conforme a Ley 1682/2001 de Paraguay (protección de datos personales). Mencionar: qué datos se recolectan (email voluntario), para qué se usan (alertas), cómo eliminarlos (link de desuscripción)
3. `app/(public)/terminos/page.tsx` — términos de uso. Mencionar: datos de promos son informativos, no garantizamos vigencia, el sitio no tiene relación comercial con los bancos
4. Metadata en `app/layout.tsx`: title, description, keywords, OG image, Twitter card
5. `app/sitemap.ts` — sitemap automático de Next.js
6. `public/og-image.png` — 1200×630, fondo naranja, logo + tagline "¿Qué tarjeta uso hoy?"
7. `app/robots.ts` — permitir todo excepto `/admin`

---

**Paso 14 — Polish + Deploy a Producción**

1. Loading states: `Skeleton` en `PromoList` mientras carga
2. Error boundaries: `error.tsx` en `(public)` y `(admin)`
3. Test completo en 375px, 768px, 1280px
4. Lighthouse audit: apuntar a Performance > 90, Accessibility > 95
5. Crear proyecto en Vercel → conectar repo → configurar env vars
6. Crear proyecto Supabase **PROD** separado (distinto del dev)
7. Ejecutar `001_initial.sql` en el Supabase prod
8. Conectar dominio custom en Vercel DNS
9. Agregar en GitHub Secrets (prod):
   - `SUPABASE_URL` → URL del proyecto prod
   - `SUPABASE_SERVICE_ROLE_KEY` → clave del proyecto prod
   - `RESEND_API_KEY`
   - `ADMIN_EMAIL`
10. Ejecutar primer scraping manual desde GitHub Actions → verificar datos en prod
11. Verificar `/admin` con Basic Auth → revisar promos scrapeadas → verificar las correctas
12. Activar AdSense y solicitar revisión del sitio

---

## 11. Variables de Entorno

### `.env.local` (Next.js app)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...     # Solo en server-side, NUNCA en cliente

# Admin
ADMIN_PASSWORD=una-contrasena-larga-y-segura

# Email
RESEND_API_KEY=re_xxxxx
ADMIN_EMAIL=tu@email.com

# Rate Limiting (Upstash)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxx

# AdSense
NEXT_PUBLIC_ADSENSE_ID=ca-pub-xxxxxxxxxxxxxxxx

# App URL
NEXT_PUBLIC_APP_URL=https://promocard.com.py
```

### Variables del Scraper (GitHub Secrets)

```bash
# Nota: sin prefijo NEXT_PUBLIC_ — esto es Node.js puro, no Next.js
SUPABASE_URL=https://xxxxx.supabase.co     # mismo valor que NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
RESEND_API_KEY=re_xxxxx
ADMIN_EMAIL=tu@email.com
```

### Dónde Obtener Cada Una

| Variable | Dónde |
|----------|-------|
| SUPABASE_URL, ANON_KEY | Supabase Dashboard → Settings → API |
| SUPABASE_SERVICE_ROLE_KEY | Supabase Dashboard → Settings → API (mantener secreto) |
| RESEND_API_KEY | resend.com → API Keys |
| UPSTASH_REDIS_REST_URL/TOKEN | upstash.com → crear DB Redis → REST API |
| NEXT_PUBLIC_ADSENSE_ID | Google AdSense → Sites → Get Code |
| ADMIN_PASSWORD | Generar: `openssl rand -base64 24` |

---

## 12. Dependencias

### Next.js App

| Paquete | Para qué |
|---------|----------|
| `next@15` | Framework |
| `@supabase/supabase-js` | DB queries + Storage |
| `@supabase/ssr` | SSR-compatible Supabase client |
| `@tanstack/react-query` | Fetch + cache client-side |
| `@upstash/ratelimit` | Rate limiting serverless |
| `@upstash/redis` | Backend de rate limiting |
| `zod` | Validación de inputs |
| `lucide-react` | Íconos |
| `clsx` + `tailwind-merge` | Utilidades CSS |
| `resend` | Email de alertas |

### Sub-proyecto Scrapers

| Paquete | Para qué |
|---------|----------|
| `playwright` | Scraping de sitios JS-heavy |
| `cheerio` | Parsing HTML estático |
| `pdf-parse` | Extracción de texto de PDFs |
| `@supabase/supabase-js` | Escritura directa a Supabase |
| `dayjs` | Parsing de fechas de vigencia |
| `zod` | Validación de datos scrapeados |
| `resend` | Email de reporte al admin |

### Dev

| Paquete | Para qué |
|---------|----------|
| `supabase` (CLI) | Generación de tipos |
| `vitest` | Tests unitarios |
| `@playwright/test` | Tests E2E |
| `eslint` + `prettier` | Calidad de código |

---

## 13. Estrategia de Deploy

### Entornos

| Entorno | App | Base de datos |
|---------|-----|---------------|
| Local | localhost:3000 | Supabase proyecto "dev" |
| Preview | *.vercel.app | Supabase proyecto "dev" |
| Producción | promocard.com.py | Supabase proyecto "prod" (separado) |

**Regla absoluta**: los preview deploys de Vercel NUNCA se conectan a la DB de producción.

### Supabase Plan

**Dev**: Free tier (suficiente para desarrollo).
**Prod**: **Pro ($25/mes)**. El Free tier pausa proyectos con +7 días de inactividad. Con 10k usuarios reales no habrá inactividad, pero la pausa puede ocurrir antes de tener tráfico. Pro elimina este riesgo.

### CI/CD

```
Push a cualquier branch → Vercel preview deploy automático
Merge a main → Vercel deploy a producción
Domingos 05:00 UTC → GitHub Actions weekly scraping
```

### Escalabilidad a 10k+ usuarios/mes

Con el stack actual:
- **Vercel Hobby**: 100GB bandwidth/mes. Estimado para 10k usuarios: ~5-20GB. Suficiente.
- **Supabase Pro**: conexiones ilimitadas via pooler HTTP (SDK). Sin problema de conexiones.
- **Upstash Redis**: 10k requests/día en free tier. Con 10k usuarios/mes ≈ 333/día. Suficiente.
- **Cuello de botella a monitorear**: si se supera 50k usuarios/mes, considerar edge caching de `/api/categorias` y `/api/bancos` con Vercel KV.

---

## 14. Estrategia de Testing

### Unit Tests (Vitest)

Cubrir las funciones de lógica crítica del scraper:

```bash
# scrapers/utils/__tests__/
day-parser.test.ts    # Todos los formatos: "lunes a viernes", "fines de semana", etc.
normalize.test.ts     # Normalización de datos de diferentes estructuras
hash.test.ts          # Determinismo del hash
```

### E2E Tests (Playwright)

Flujos críticos:

1. Home → clic "Combustible" → URL `/buscar?cat=combustible`
2. `/buscar` → seleccionar 2 tarjetas → clic "Buscar" → resultados visibles
3. Filtro día: clic "Martes" → URL actualizada → promos actualizadas
4. Rate limit: 21 requests rápidos al API → el 21° retorna 429
5. `/admin` sin credenciales → browser muestra diálogo de auth
6. `/admin` con credenciales correctas → dashboard carga

---

## 15. Skills a Usar Durante la Build

| Skill | En qué paso | Para qué |
|-------|------------|----------|
| `/shadcn-ui` | Paso 1 | Setup inicial y agregar componentes |
| `/frontend-design` | Pasos 4, 13 | UI de búsqueda, PromoCard, landing page |
| `/playwright-cli` | Pasos 8, 9, 10 | Inspeccionar sitios de bancos, escribir scrapers |
| `/web-reader` | Pasos 9, 10 | Analizar estructura HTML de páginas de promos antes de escribir selectores |
| `/seo-audit` | Paso 13 | Auditoría SEO antes del launch |

---

## 16. CLAUDE.md para el Proyecto

```markdown
# PromoCard PY

Web app para consumidores paraguayos: buscá qué tarjeta usar según las promociones vigentes.
Flujo: elegís categoría → seleccionás tus tarjetas disponibles → ves promos filtradas por día.
Sin login, sin cuentas. Búsqueda 100% anónima y stateless.
Datos: scraping semanal (GitHub Actions) de ~15 bancos paraguayos. Monetización: Google AdSense.

## Comandos

- `pnpm dev`          — Servidor de desarrollo (localhost:3000)
- `pnpm build`        — Build de producción
- `pnpm lint`         — ESLint
- `pnpm test`         — Tests unitarios (Vitest)
- `pnpm e2e`          — Tests E2E (Playwright)
- `pnpm db:types`     — Regenerar tipos desde Supabase schema

## Stack

Next.js 15 (App Router) + TypeScript strict + Tailwind v4 + shadcn/ui +
Supabase (PostgreSQL + Storage) + Supabase JS SDK + Upstash (rate limit) +
Vercel + GitHub Actions (scrapers semanales)

**Sin Prisma** — queries via Supabase SDK directamente.
**Sin auth de usuarios** — admin usa HTTP Basic Auth; usuarios no tienen cuentas.

## Arquitectura

### Directorios clave
- `src/app/(public)/` — Rutas públicas: home + búsqueda + páginas legales
- `src/app/(admin)/admin/` — Panel admin (HTTP Basic Auth en middleware.ts)
- `src/app/api/` — API Routes de Next.js
- `src/components/search/` — CategoryGrid, CardSelector, DayFilter, SubscribeDialog
- `src/components/promo/` — PromoCard (HTML), PdfPromoCard (PDF), PromoList
- `src/lib/db/` — Helpers de queries por dominio (promotions.ts, banks.ts, etc.)
- `scrapers/` — Sub-proyecto Node.js independiente; escribe directo a Supabase

### Flujo de datos — Búsqueda
URL params (cat + tarjetas + dia) →
useQuery → GET /api/promociones →
supabase.rpc('search_promotions', params) →
PostgreSQL function → JSON → PromoCards

### Flujo de datos — Scraping
GitHub Actions (domingos 05:00 UTC) → scrapers/index.ts →
Promise.allSettled(bancos) → cada banco:
  Playwright/Cheerio + pdf-handler (si PDF) →
  normalize() + generateHash() →
  supabase.from('promotions').upsert() [directo, sin API HTTP] →
  deleteExpired() + markMissing() →
  scraping_log actualizado →
email de reporte al admin (Resend)

### Patrones clave
- Server Components por defecto; "use client" solo cuando hay interactividad real
- URL search params como única fuente de verdad para el estado de búsqueda
- TanStack Query con staleTime: Infinity; refetch solo cuando cambian params
- HTTP Basic Auth en middleware.ts para TODO /admin/* y /api/admin/*
- Supabase SDK con service_role solo en server-side (api routes, scrapers)
- La anon key de Supabase es segura para exponer en el cliente

## Sistema de Diseño

### Colores (definir en globals.css como CSS variables)
- Primary: #F97316 (naranja — botones, CTAs)
- Secondary: #7C3AED (violeta — badges)
- Accent: #FBBF24 (amarillo — highlights)
- Background: #FFFFFF
- Surface: #F8FAFC
- Text: #1E293B
- Muted: #64748B

### Tipografía
- Headings: Plus Jakarta Sans 600-800 (next/font/google)
- Body: Inter 400-500 (next/font/google)

### Estilo
- Border radius: 8px inputs, 12px botones, 16px cards, 9999px chips/badges
- Sombras: shadow-sm default, shadow-md hover
- Spacing base: 4px
- Animaciones: 150ms ease-out
- Mobile-first: testear siempre en 375px primero

## Variables de Entorno

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública (segura en cliente) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave privada — SOLO en server-side |
| `ADMIN_PASSWORD` | Contraseña del panel admin (Basic Auth) |
| `RESEND_API_KEY` | Para alertas por email |
| `ADMIN_EMAIL` | Email del admin (para reportes de scraping) |
| `UPSTASH_REDIS_REST_URL` | Rate limiting backend |
| `UPSTASH_REDIS_REST_TOKEN` | Rate limiting token |
| `NEXT_PUBLIC_ADSENSE_ID` | Publisher ID de AdSense |
| `NEXT_PUBLIC_APP_URL` | URL base del sitio |

## Reglas No Negociables

1. **TypeScript strict: nunca `any`.** Usar `unknown` + narrowing si el tipo no se conoce.
2. **Búsqueda en URL params.** Estado de búsqueda SIEMPRE en search params. Nunca en estado global.
3. **Scrapers son un sub-proyecto.** `/scrapers/` tiene su propio package.json. Nunca importar desde el app Next.js.
4. **Scrapers escriben directo a Supabase.** No hay endpoint HTTP de ingestión. Sin dependencia del app.
5. **Validar con Zod en TODOS los API routes.** Nunca confiar en query params sin validar.
6. **Mobile-first absoluto.** Toda pantalla nueva: testear en 375px antes que desktop.
7. **Los scrapers no crashean el runner.** Cada banco en try/catch. Un fallo no afecta a los demás.
8. **Basic Auth en TODOS los endpoints admin.** El middleware cubre /admin/* y /api/admin/*.
9. **SUPABASE_SERVICE_ROLE_KEY nunca en el cliente.** Solo en server-side. Bypasea RLS.
10. **AdSense con lazyOnload.** Never bloquear el render con el script de AdSense.
```

---

## 17. Reglas No Negociables

1. **TypeScript strict sin `any`.** Usar `unknown` + type narrowing. Nunca `as any`.

2. **La búsqueda vive en la URL.** Los params `cat`, `tarjetas` y `dia` son search params. Resultado compartible, botones back/forward funcionan.

3. **Scrapers son un sub-proyecto aislado.** `/scrapers/` tiene su propio `package.json`. El app de Next.js no importa nada de ahí.

4. **Los scrapers escriben directamente a Supabase.** No existe endpoint HTTP de ingestión. Esto elimina una dependencia circular y un punto de falla.

5. **Validar todos los inputs de API con Zod.** `/api/promociones` sin `categoria` → 400. UUID inválido → 400. Más de 20 tarjetas → 400. Nunca un 500 por input inválido.

6. **Mobile-first absoluto.** Toda pantalla nueva se diseña y prueba en 375px primero. El desktop es una extensión.

7. **Los scrapers no crashean el runner.** Cada banco está en `try/catch`. Un banco que falla → loguea el error + continúa con los demás. El runner termina siempre y manda el reporte.

8. **Basic Auth para todo `/admin`.** El middleware protege rutas y API routes. Verificar que no hay forma de acceder a datos admin sin credenciales.

9. **`SUPABASE_SERVICE_ROLE_KEY` nunca en código cliente.** Solo en API routes y scrapers. Esta clave bypasea todas las políticas de seguridad de Supabase.

10. **Dos proyectos Supabase separados.** Dev y producción son proyectos distintos con credenciales distintas. Un `DROP TABLE` accidental en dev no toca producción.

11. **Hard delete de promos vencidas.** No hay histórico. Las promos con `valid_to < hoy` se eliminan en cada run de scraping. Mantiene la DB pequeña.

12. **Una componente por archivo, máximo 300 líneas.** Si crece, extraer sub-componentes. Nombre del archivo = nombre del componente exported.
