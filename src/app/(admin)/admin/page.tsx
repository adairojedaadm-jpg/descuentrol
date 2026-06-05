"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import {
  BarChart3,
  CreditCard,
  Users,
  Trash2,
  AlertTriangle,
  Activity,
  Search,
  Play,
  Clock,
  FileUp,
  CheckCircle2,
  Loader2,
  RotateCcw
} from 'lucide-react'
import type { ExtractedPromo } from '@/app/api/admin/upload-pdf/route'

// Interfaces
interface Stats {
  total_promotions: number
  active_banks: number
  active_subscribers: number
  pending_verification: number
  last_scrape_at: string | null
}

interface PromoAdmin {
  id: string
  bank_id: string
  title: string
  discount_type: string
  discount_display: string
  is_active: boolean
  verified_by_admin: boolean
  source_type: 'HTML' | 'PDF'
  valid_to: string | null
  bank_name: string
}

interface BankAdmin {
  id: string
  name: string
  active: boolean
  scraper_type: 'PLAYWRIGHT' | 'CHEERIO'
  last_scraped_at: string | null
}

interface ScrapingLogAdmin {
  id: string
  bank_id: string
  started_at: string
  finished_at: string | null
  status: 'RUNNING' | 'SUCCESS' | 'FAILED' | 'PARTIAL'
  promos_found: number
  promos_created: number
  promos_updated: number
  promos_deleted: number
  error_message: string | null
  bank_name: string
}

// ─── Tab PDF Upload ────────────────────────────────────────────────────────────
type PdfUploadState = 'select' | 'loading' | 'preview' | 'saving' | 'done' | 'error'

function PdfUploadTab({ banks }: { banks: BankAdmin[] }) {
  const [state, setState] = useState<PdfUploadState>('select')
  const [selectedBankId, setSelectedBankId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [extracted, setExtracted] = useState<ExtractedPromo[]>([])
  const [included, setIncluded] = useState<boolean[]>([])
  const [errorMsg, setErrorMsg] = useState('')
  const [savedCount, setSavedCount] = useState(0)

  const selectedBankName = banks.find(b => b.id === selectedBankId)?.name ?? ''

  const handleAnalyze = async () => {
    if (!file || !selectedBankId) return
    setState('loading')
    setErrorMsg('')
    try {
      const form = new FormData()
      form.append('pdf', file)
      form.append('bank_id', selectedBankId)
      const res = await fetch('/api/admin/upload-pdf', { method: 'POST', body: form })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error al analizar el PDF')
      const promos: ExtractedPromo[] = json.promotions
      setExtracted(promos)
      setIncluded(promos.map(() => true))
      setState('preview')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error desconocido')
      setState('error')
    }
  }

  const handleSave = async () => {
    const toSave = extracted.filter((_, i) => included[i])
    if (toSave.length === 0) return
    setState('saving')
    try {
      const res = await fetch('/api/admin/guardar-promociones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bank_id: selectedBankId, promotions: toSave }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error al guardar')
      setSavedCount(json.saved)
      setState('done')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error desconocido')
      setState('error')
    }
  }

  const reset = () => {
    setState('select')
    setFile(null)
    setExtracted([])
    setIncluded([])
    setErrorMsg('')
    setSavedCount(0)
  }

  const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  if (state === 'done') {
    return (
      <Card className="border-border/50 shadow-2sm rounded-2xl overflow-hidden">
        <CardContent className="p-10 flex flex-col items-center text-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600 border border-green-200">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h3 className="font-heading text-lg font-bold text-foreground">
            {savedCount} promociones guardadas
          </h3>
          <p className="text-xs text-muted-foreground">
            Las promos de <strong>{selectedBankName}</strong> ya están visibles en la pestaña Promociones y en la web pública.
          </p>
          <Button type="button" onClick={reset} className="mt-2 rounded-xl gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" />
            Cargar otro PDF
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (state === 'error') {
    return (
      <Card className="border-destructive/40 shadow-2sm rounded-2xl overflow-hidden">
        <CardContent className="p-8 flex flex-col items-center text-center gap-3">
          <AlertTriangle className="h-8 w-8 text-destructive" />
          <p className="text-sm font-semibold text-destructive">Ocurrió un error</p>
          <p className="text-xs text-muted-foreground max-w-md">{errorMsg}</p>
          <Button type="button" variant="outline" onClick={reset} className="mt-2 rounded-xl">
            Intentar de nuevo
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* PASO 1: Selección */}
      <Card className="border-border/50 shadow-2sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-muted/10 border-b border-border/20">
          <CardTitle className="font-heading text-base font-bold text-foreground flex items-center gap-2">
            <FileUp className="h-4 w-4 text-primary" />
            Cargar PDF de Beneficios con IA
          </CardTitle>
          <CardDescription className="text-3xs">
            Subí el PDF de beneficios de un banco. Claude AI extrae automáticamente todas las promociones.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          {/* Selector banco */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">1. Seleccioná el banco</label>
            <select
              title="Seleccioná el banco"
              value={selectedBankId}
              onChange={e => setSelectedBankId(e.target.value)}
              disabled={state === 'loading' || state === 'preview' || state === 'saving'}
              className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
            >
              <option value="">-- Elegir banco --</option>
              {banks.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Input PDF */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">2. Seleccioná el archivo PDF</label>
            <div className="relative">
              <input
                type="file"
                title="Seleccioná un archivo PDF"
                accept=".pdf,application/pdf"
                disabled={state === 'loading' || state === 'preview' || state === 'saving'}
                onChange={e => setFile(e.target.files?.[0] ?? null)}
                className="block w-full text-xs text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary hover:file:bg-primary/20 cursor-pointer disabled:opacity-50"
              />
            </div>
            {file && (
              <p className="text-3xs text-muted-foreground">
                Archivo: <span className="font-semibold text-foreground">{file.name}</span> ({(file.size / 1024).toFixed(0)} KB)
              </p>
            )}
          </div>

          {/* Botón analizar */}
          {state !== 'preview' && (
            <Button
              type="button"
              onClick={handleAnalyze}
              disabled={!file || !selectedBankId || state === 'loading'}
              className="w-full rounded-xl font-semibold gap-2 h-11"
            >
              {state === 'loading' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analizando con IA... (puede tardar unos segundos)
                </>
              ) : (
                <>
                  <FileUp className="h-4 w-4" />
                  Analizar PDF con IA
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* PASO 2: Preview */}
      {(state === 'preview' || state === 'saving') && extracted.length > 0 && (
        <Card className="border-border/50 shadow-2sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-muted/10 border-b border-border/20 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-heading text-base font-bold text-foreground">
                {extracted.length} promociones extraídas — {selectedBankName}
              </CardTitle>
              <CardDescription className="text-3xs">
                Desmarcar las que no querés guardar. El resto se insertará en la base de datos.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">
                {included.filter(Boolean).length} seleccionadas
              </span>
              <Button
                type="button"
                onClick={handleSave}
                disabled={included.filter(Boolean).length === 0 || state === 'saving'}
                className="rounded-xl font-semibold gap-1.5"
              >
                {state === 'saving' ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Guardando...</>
                ) : (
                  <><CheckCircle2 className="h-4 w-4" />Guardar {included.filter(Boolean).length}</>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/20">
                <TableRow>
                  <TableHead className="w-10 text-center">
                    <input
                      type="checkbox"
                      title="Seleccionar todas"
                      checked={included.every(Boolean)}
                      onChange={e => setIncluded(included.map(() => e.target.checked))}
                      className="rounded"
                    />
                  </TableHead>
                  <TableHead className="text-xs font-bold text-foreground">Título</TableHead>
                  <TableHead className="text-xs font-bold text-foreground">Descuento</TableHead>
                  <TableHead className="text-xs font-bold text-foreground">Días</TableHead>
                  <TableHead className="text-xs font-bold text-foreground">Categorías</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {extracted.map((promo, i) => (
                  <TableRow key={i} className={included[i] ? '' : 'opacity-40'}>
                    <TableCell className="text-center">
                      <input
                        type="checkbox"
                        title="Incluir esta promoción"
                        checked={included[i]}
                        onChange={e => {
                          const next = [...included]
                          next[i] = e.target.checked
                          setIncluded(next)
                        }}
                        className="rounded"
                      />
                    </TableCell>
                    <TableCell className="text-xs max-w-xs">
                      <div className="font-semibold text-foreground truncate" title={promo.title}>{promo.title}</div>
                      {promo.conditions && (
                        <div className="text-4xs text-muted-foreground truncate mt-0.5" title={promo.conditions}>{promo.conditions}</div>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant="outline" className="text-3xs font-semibold rounded-full border-secondary/20 bg-secondary/5 text-secondary">
                        {promo.discount_display}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {promo.days_of_week.length === 0 || promo.days_of_week.length === 7
                        ? 'Todos'
                        : promo.days_of_week.map(d => DAYS[d]).join('·')}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {(promo.category_slugs || []).join(', ') || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {(state === 'preview' || state === 'saving') && extracted.length === 0 && (
        <Card className="border-border/50 rounded-2xl">
          <CardContent className="p-8 text-center text-xs text-muted-foreground">
            La IA no encontró promociones en este PDF. Probá con otro archivo.
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ─── Dashboard Principal ───────────────────────────────────────────────────────
export default function AdminDashboard() {
  const queryClient = useQueryClient()
  const [promoFilter, setPromoFilter] = useState('')

  // 1. Queries
  const { data: statsData, isLoading: isStatsLoading } = useQuery<{ data: Stats }>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/stats')
      if (!res.ok) throw new Error('Error al cargar estadísticas')
      return res.json()
    }
  })

  const { data: promosData, isLoading: isPromosLoading } = useQuery<{ data: PromoAdmin[] }>({
    queryKey: ['admin-promos'],
    queryFn: async () => {
      const res = await fetch('/api/admin/promociones')
      if (!res.ok) throw new Error('Error al cargar promociones')
      return res.json()
    }
  })

  const { data: banksData, isLoading: isBanksLoading } = useQuery<{ data: BankAdmin[] }>({
    queryKey: ['admin-banks'],
    queryFn: async () => {
      const res = await fetch('/api/admin/bancos')
      if (!res.ok) throw new Error('Error al cargar bancos')
      return res.json()
    }
  })

  const { data: logsData, isLoading: isLogsLoading } = useQuery<{ data: ScrapingLogAdmin[] }>({
    queryKey: ['admin-logs'],
    queryFn: async () => {
      const res = await fetch('/api/admin/scraping')
      if (!res.ok) throw new Error('Error al cargar logs')
      return res.json()
    }
  })

  // 2. Mutations
  const toggleBankMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const res = await fetch('/api/admin/bancos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active })
      })
      if (!res.ok) throw new Error('Error al actualizar banco')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banks'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    }
  })

  const togglePromoMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PromoAdmin> }) => {
      const res = await fetch('/api/admin/promociones', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      })
      if (!res.ok) throw new Error('Error al actualizar promoción')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promos'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    }
  })

  const deletePromoMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/promociones?id=${id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Error al eliminar promoción')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promos'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    }
  })

  const triggerScrapeMutation = useMutation({
    mutationFn: async (bankSlug: string) => {
      const res = await fetch('/api/admin/scraping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bank_slug: bankSlug })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error al disparar scraper')
      return json
    },
    onSuccess: (data) => {
      alert(data.message || 'Raspado iniciado exitosamente.')
      queryClient.invalidateQueries({ queryKey: ['admin-logs'] })
    },
    onError: (err) => {
      alert(`Fallo al iniciar: ${err.message}`)
    }
  })

  // Format Helper
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('es-PY', { timeZone: 'America/Asuncion' })
  }

  const stats = statsData?.data
  const promos = promosData?.data || []
  const banks = banksData?.data || []
  const logs = logsData?.data || []

  // Filter promos by text
  const filteredPromos = promos.filter(p => 
    p.title.toLowerCase().includes(promoFilter.toLowerCase()) || 
    p.bank_name.toLowerCase().includes(promoFilter.toLowerCase()) || 
    p.discount_display.toLowerCase().includes(promoFilter.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-muted/20 pb-12">
      {/* Top Admin Header */}
      <header className="border-b border-border/40 bg-background sticky top-0 z-50">
        <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="font-heading text-lg font-bold tracking-tight">
              <span className="text-primary">descuen</span>
              <span className="text-secondary">trol</span>
              <span className="text-muted-foreground font-light text-sm ml-1">Panel Admin</span>
            </span>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm" className="rounded-xl border-border/60 text-xs font-semibold">
              Ver Web Pública
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              Consola de Control
            </h1>
            <TabsList className="bg-muted/80 border border-border/20 p-1 rounded-xl">
              <TabsTrigger value="overview" className="rounded-lg font-semibold text-xs cursor-pointer">Resumen</TabsTrigger>
              <TabsTrigger value="promos" className="rounded-lg font-semibold text-xs cursor-pointer">Promociones ({promos.length})</TabsTrigger>
              <TabsTrigger value="banks" className="rounded-lg font-semibold text-xs cursor-pointer">Bancos ({banks.length})</TabsTrigger>
              <TabsTrigger value="logs" className="rounded-lg font-semibold text-xs cursor-pointer">Logs de Raspado</TabsTrigger>
              <TabsTrigger value="upload-pdf" className="rounded-lg font-semibold text-xs cursor-pointer flex items-center gap-1">
                <FileUp className="h-3 w-3" />
                Cargar PDF
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: OVERVIEW */}
          <TabsContent value="overview" className="space-y-6 animate-fade-in">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-border/50 shadow-2sm rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Promociones Totales</CardTitle>
                  <CreditCard className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="font-heading text-2xl font-bold text-foreground">
                    {isStatsLoading ? '...' : stats?.total_promotions}
                  </div>
                  <p className="text-4xs text-muted-foreground mt-1">Activas e inactivas en catálogo</p>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-2sm rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Bancos Activos</CardTitle>
                  <BarChart3 className="h-4 w-4 text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="font-heading text-2xl font-bold text-foreground">
                    {isStatsLoading ? '...' : stats?.active_banks}
                  </div>
                  <p className="text-4xs text-muted-foreground mt-1">Habilitados para cron de scraping</p>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-2sm rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Suscriptores</CardTitle>
                  <Users className="h-4 w-4 text-accent-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="font-heading text-2xl font-bold text-foreground">
                    {isStatsLoading ? '...' : stats?.active_subscribers}
                  </div>
                  <p className="text-4xs text-muted-foreground mt-1">Correos suscritos a alertas</p>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-2sm rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Por Verificar</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="font-heading text-2xl font-bold text-foreground text-amber-600">
                    {isStatsLoading ? '...' : stats?.pending_verification}
                  </div>
                  <p className="text-4xs text-muted-foreground mt-1">Promociones sin auditar por admin</p>
                </CardContent>
              </Card>
            </div>

            {/* Last Execution Info */}
            <Card className="border-border/50 shadow-2sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-muted/10 border-b border-border/20">
                <CardTitle className="font-heading text-sm font-bold text-foreground flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <span>Estado del Servicio de Scraping</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-3xs text-muted-foreground uppercase tracking-wider font-bold">Última corrida exitosa:</span>
                    <p className="text-sm font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {stats?.last_scrape_at ? formatDate(stats.last_scrape_at) : 'Ninguna ejecución registrada'}
                    </p>
                  </div>
                  
                  <div className="text-3xs text-muted-foreground leading-normal max-w-md bg-muted/40 p-3 rounded-lg border border-border/20">
                    <strong>Programación:</strong> El cron automático corre todos los domingos a las 05:00 UTC (02:00 AM de Paraguay). Los scrapers utilizan Playwright headless y Cheerio de forma concurrente en GitHub Actions.
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: PROMOTIONS */}
          <TabsContent value="promos" className="space-y-4 animate-fade-in">
            <Card className="border-border/50 shadow-2sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-muted/10 border-b border-border/20 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="font-heading text-base font-bold text-foreground">Catálogo de Promociones</CardTitle>
                  <CardDescription className="text-3xs">Listado total de beneficios extraídos de los bancos.</CardDescription>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar por título, banco..." 
                    value={promoFilter} 
                    onChange={e => setPromoFilter(e.target.value)}
                    className="pl-9 rounded-xl border-border/60 text-xs focus-visible:ring-primary h-9"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                {isPromosLoading ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">Cargando catálogo...</div>
                ) : filteredPromos.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">No se encontraron promociones.</div>
                ) : (
                  <Table>
                    <TableHeader className="bg-muted/20">
                      <TableRow>
                        <TableHead className="text-xs font-bold text-foreground">Banco</TableHead>
                        <TableHead className="text-xs font-bold text-foreground">Título</TableHead>
                        <TableHead className="text-xs font-bold text-foreground">Tipo / Reintegro</TableHead>
                        <TableHead className="text-xs font-bold text-foreground">Origen</TableHead>
                        <TableHead className="text-xs font-bold text-foreground text-center">Estado</TableHead>
                        <TableHead className="text-xs font-bold text-foreground text-center">Auditado</TableHead>
                        <TableHead className="text-xs font-bold text-foreground text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPromos.map(promo => (
                        <TableRow key={promo.id} className="hover:bg-muted/5">
                          <TableCell className="text-xs font-bold text-foreground whitespace-nowrap">{promo.bank_name}</TableCell>
                          <TableCell className="text-xs max-w-xs truncate" title={promo.title}>{promo.title}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge variant="outline" className="text-3xs font-semibold rounded-full border-secondary/20 bg-secondary/5 text-secondary">
                              {promo.discount_display}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap uppercase text-3xs font-semibold">{promo.source_type}</TableCell>
                          <TableCell className="text-center">
                            <Switch 
                              checked={promo.is_active} 
                              onCheckedChange={(checked) => togglePromoMutation.mutate({ id: promo.id, updates: { is_active: checked } })}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className={`h-7 px-2 text-2xs rounded-lg ${promo.verified_by_admin ? 'text-green-600 hover:text-green-700 bg-green-50' : 'text-amber-600 hover:text-amber-700 bg-amber-50'}`}
                              onClick={() => togglePromoMutation.mutate({ id: promo.id, updates: { verified_by_admin: !promo.verified_by_admin } })}
                            >
                              {promo.verified_by_admin ? 'Verificado' : 'Pendiente'}
                            </Button>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg"
                              onClick={() => {
                                if (confirm('¿Estás seguro de eliminar permanentemente esta promoción?')) {
                                  deletePromoMutation.mutate(promo.id)
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: BANKS CONFIG */}
          <TabsContent value="banks" className="space-y-4 animate-fade-in">
            <Card className="border-border/50 shadow-2sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-muted/10 border-b border-border/20">
                <CardTitle className="font-heading text-base font-bold text-foreground">Configuración de Bancos y Extracciones</CardTitle>
                <CardDescription className="text-3xs">Toggles para activar/desactivar el scraping automático e iniciar raspados manuales.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                {isBanksLoading ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">Cargando bancos...</div>
                ) : (
                  <Table>
                    <TableHeader className="bg-muted/20">
                      <TableRow>
                        <TableHead className="text-xs font-bold text-foreground">Banco</TableHead>
                        <TableHead className="text-xs font-bold text-foreground">Scraper</TableHead>
                        <TableHead className="text-xs font-bold text-foreground">Última Extracción</TableHead>
                        <TableHead className="text-xs font-bold text-foreground text-center">Cron Activo</TableHead>
                        <TableHead className="text-xs font-bold text-foreground text-right">Ejecutar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {banks.map(bank => {
                        const slug = bank.name
                          .toLowerCase()
                          .normalize('NFD')
                          .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
                          .replace('banco ', '')
                          .replace(' (banco nacional de fomento)', '')
                          .trim()
                          .split(' ')[0] // ej: "itau", "ueno", "continental"

                        return (
                          <TableRow key={bank.id} className="hover:bg-muted/5">
                            <TableCell className="text-xs font-bold text-foreground whitespace-nowrap">{bank.name}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              <Badge variant="outline" className="text-4xs font-bold px-1.5 py-0.5 rounded bg-muted/40 uppercase">
                                {bank.scraper_type}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                              {bank.last_scraped_at ? formatDate(bank.last_scraped_at) : 'Sin registros'}
                            </TableCell>
                            <TableCell className="text-center">
                              <Switch 
                                checked={bank.active} 
                                onCheckedChange={(checked) => toggleBankMutation.mutate({ id: bank.id, active: checked })}
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 rounded-lg border-border/60 hover:bg-primary hover:text-primary-foreground text-2xs font-semibold gap-1"
                                onClick={() => {
                                  if (confirm(`¿Iniciar raspado manual para ${bank.name}? (Se enviará la petición a GitHub Actions)`)) {
                                    triggerScrapeMutation.mutate(slug)
                                  }
                                }}
                              >
                                <Play className="h-3 w-3 fill-current" />
                                <span>Correr</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: SCRAPING LOGS */}
          <TabsContent value="logs" className="space-y-4 animate-fade-in">

            <Card className="border-border/50 shadow-2sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-muted/10 border-b border-border/20">
                <CardTitle className="font-heading text-base font-bold text-foreground">Historial de Ejecuciones de Scraping</CardTitle>
                <CardDescription className="text-3xs">Últimos 100 registros de logs emitidos por los workflows de GitHub Actions.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                {isLogsLoading ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">Cargando logs...</div>
                ) : logs.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">No hay logs registrados.</div>
                ) : (
                  <Table>
                    <TableHeader className="bg-muted/20">
                      <TableRow>
                        <TableHead className="text-xs font-bold text-foreground">Banco</TableHead>
                        <TableHead className="text-xs font-bold text-foreground">Inicio</TableHead>
                        <TableHead className="text-xs font-bold text-foreground">Fin</TableHead>
                        <TableHead className="text-xs font-bold text-foreground text-center">Estado</TableHead>
                        <TableHead className="text-xs font-bold text-foreground text-center">Promos (+ / ~ / -)</TableHead>
                        <TableHead className="text-xs font-bold text-foreground">Mensaje / Detalle</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map(log => (
                        <TableRow key={log.id} className="hover:bg-muted/5">
                          <TableCell className="text-xs font-bold text-foreground whitespace-nowrap">{log.bank_name}</TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(log.started_at)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{log.finished_at ? formatDate(log.finished_at) : 'En ejecución'}</TableCell>
                          <TableCell className="text-center">
                            <Badge 
                              className={`text-4xs font-bold px-1.5 py-0.5 rounded uppercase ${
                                log.status === 'SUCCESS' ? 'bg-green-500 hover:bg-green-600' :
                                log.status === 'FAILED' ? 'bg-red-500 hover:bg-red-600' :
                                log.status === 'PARTIAL' ? 'bg-amber-500 hover:bg-amber-600' :
                                'bg-blue-500 hover:bg-blue-600 animate-pulse'
                              }`}
                            >
                              {log.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center text-xs whitespace-nowrap font-medium font-mono text-[11px]">
                            <span className="text-blue-600 font-bold" title="Encontradas">{log.promos_found}</span>
                            <span className="text-muted-foreground font-normal"> / </span>
                            <span className="text-green-600 font-bold" title="Nuevas">{log.promos_created}</span>
                            <span className="text-muted-foreground font-normal"> / </span>
                            <span className="text-red-500 font-bold" title="Borradas">{log.promos_deleted}</span>
                          </TableCell>
                          <TableCell className="text-xs max-w-sm truncate text-muted-foreground font-medium" title={log.error_message || ''}>
                            {log.error_message || 'Ejecutado con éxito'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          {/* TAB 5: CARGAR PDF */}
          <TabsContent value="upload-pdf" className="animate-fade-in">
            <PdfUploadTab banks={banks} />
          </TabsContent>

        </Tabs>
      </main>
    </div>
  )
}
