import { Heart } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface ProductCardProps {
  id: string
  category: string
  description: string
  is_favorite: boolean
  name: string
  price: string
}

export function ProductCard({ id, category, description, is_favorite, name, price }: ProductCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{name}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Badge variant="secondary">{category}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mt-2 flex justify-between items-center">
          <p className="text-2xl font-bold">${price}</p>
          <Button variant="outline" size="icon" className={is_favorite ? "text-red-500" : "text-gray-500"}>
            <Heart className="h-4 w-4 " fill={is_favorite ? 'red':"none"} />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

