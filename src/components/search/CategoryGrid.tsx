"use client"

import Link from 'next/link'
import { CategoryIcon } from './CategoryIcon'
import { Card } from '@/components/ui/card'

export interface Category {
  id: string
  name: string
  slug: string
  icon: string
  color?: string | null
}

export const defaultCategories: Category[] = [
  { id: '1', name: 'Combustible', slug: 'combustible', icon: 'Fuel', color: 'from-orange-500/10 to-orange-500/5 hover:border-orange-500/50 hover:shadow-orange-500/5' },
  { id: '2', name: 'Farmacia', slug: 'farmacia', icon: 'Pill', color: 'from-purple-500/10 to-purple-500/5 hover:border-purple-500/50 hover:shadow-purple-500/5' },
  { id: '3', name: 'Supermercado', slug: 'supermercado', icon: 'ShoppingCart', color: 'from-green-500/10 to-green-500/5 hover:border-green-500/50 hover:shadow-green-500/5' },
  { id: '4', name: 'Restaurante', slug: 'restaurante', icon: 'Utensils', color: 'from-red-500/10 to-red-500/5 hover:border-red-500/50 hover:shadow-red-500/5' },
  { id: '5', name: 'Viajes', slug: 'viajes', icon: 'Plane', color: 'from-blue-500/10 to-blue-500/5 hover:border-blue-500/50 hover:shadow-blue-500/5' },
  { id: '6', name: 'Electrodomésticos', slug: 'electrodomesticos', icon: 'Tv', color: 'from-indigo-500/10 to-indigo-500/5 hover:border-indigo-500/50 hover:shadow-indigo-500/5' },
  { id: '7', name: 'Ropa', slug: 'ropa', icon: 'Shirt', color: 'from-pink-500/10 to-pink-500/5 hover:border-pink-500/50 hover:shadow-pink-500/5' },
  { id: '8', name: 'Entretenimiento', slug: 'entretenimiento', icon: 'Ticket', color: 'from-yellow-500/10 to-yellow-500/5 hover:border-yellow-500/50 hover:shadow-yellow-500/5' },
  { id: '9', name: 'Tecnología', slug: 'tecnologia', icon: 'Smartphone', color: 'from-cyan-500/10 to-cyan-500/5 hover:border-cyan-500/50 hover:shadow-cyan-500/5' },
  { id: '10', name: 'Salud', slug: 'salud', icon: 'Heart', color: 'from-rose-500/10 to-rose-500/5 hover:border-rose-500/50 hover:shadow-rose-500/5' },
]

interface CategoryGridProps {
  categories?: Category[]
}

export default function CategoryGrid({ categories = defaultCategories }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {categories.map((category) => {
        const styleClasses = category.color || 'from-primary/10 to-primary/5 hover:border-primary/50 hover:shadow-primary/5'
        
        return (
          <Link 
            key={category.id} 
            href={`/buscar?cat=${category.slug}`}
            className="group"
          >
            <Card className={`relative flex flex-col items-center justify-center p-6 h-36 rounded-2xl border border-border/60 bg-gradient-to-br ${styleClasses} shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1`}>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-background border border-border/40 text-foreground group-hover:text-primary transition-colors duration-300 shadow-sm">
                <CategoryIcon name={category.icon} className="h-6 w-6" />
              </div>
              <span className="mt-4 font-heading text-sm font-semibold tracking-tight text-foreground/80 group-hover:text-foreground text-center transition-colors duration-200">
                {category.name}
              </span>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
