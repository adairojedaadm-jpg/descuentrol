"use client"

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface DayFilterProps {
  selectedDay: number | null // null = Todos o Hoy por defecto
  onSelectDay: (day: number) => void
}

const DAYS = [
  { value: 1, label: 'Lunes', short: 'Lun' },
  { value: 2, label: 'Martes', short: 'Mar' },
  { value: 3, label: 'Miércoles', short: 'Mié' },
  { value: 4, label: 'Jueves', short: 'Jue' },
  { value: 5, label: 'Viernes', short: 'Vie' },
  { value: 6, label: 'Sábado', short: 'Sáb' },
  { value: 0, label: 'Domingo', short: 'Dom' },
]

export default function DayFilter({ selectedDay, onSelectDay }: DayFilterProps) {
  // Get current day of week in Paraguay timezone (America/Asuncion -> UTC-3)
  const getCurrentParaguayDay = () => {
    // Para mayor seguridad, obtenemos el día de la semana con Date de JavaScript corregido al huso de Paraguay (UTC-3 permanente)
    const utcDate = new Date()
    const pyOffset = -3 * 60 // -180 mins
    const pyDate = new Date(utcDate.getTime() + (pyOffset + utcDate.getTimezoneOffset()) * 60000)
    return pyDate.getDay()
  }

  const currentDay = getCurrentParaguayDay()

  return (
    <div className="w-full overflow-x-auto pb-1 scrollbar-hide">
      <Tabs 
        value={selectedDay !== null ? selectedDay.toString() : currentDay.toString()} 
        onValueChange={(val) => onSelectDay(parseInt(val))}
        className="w-full"
      >
        <TabsList className="inline-flex h-11 items-center justify-start rounded-xl bg-muted/60 p-1 border border-border/20 text-muted-foreground w-full sm:w-auto">
          {DAYS.map((day) => {
            const isToday = day.value === currentDay
            
            return (
              <TabsTrigger
                key={day.value}
                value={day.value.toString()}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-xs font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  {day.short}
                  {isToday && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" title="Hoy" />
                  )}
                </span>
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>
    </div>
  )
}
