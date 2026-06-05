import { 
  Fuel, 
  Pill, 
  ShoppingCart, 
  Utensils, 
  Plane, 
  Tv, 
  Shirt, 
  Ticket, 
  Smartphone, 
  Heart,
  HelpCircle 
} from 'lucide-react'

const iconMap: Record<string, React.ComponentType<any>> = {
  Fuel,
  Pill,
  ShoppingCart,
  Utensils,
  Plane,
  Tv,
  Shirt,
  Ticket,
  Smartphone,
  Heart
}

interface CategoryIconProps extends React.ComponentPropsWithoutRef<'svg'> {
  name: string
  className?: string
}

export function CategoryIcon({ name, ...props }: CategoryIconProps) {
  const IconComponent = iconMap[name] || HelpCircle
  return <IconComponent {...props} />
}
