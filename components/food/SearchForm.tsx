import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Loader2 } from "lucide-react"

interface SearchFormProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  onSearch: (e: React.FormEvent) => void
  onQuickAdd: (e: React.MouseEvent) => void
  isLoading?: boolean
}

export function SearchForm({ 
  searchQuery, 
  onSearchChange, 
  onSearch, 
  onQuickAdd,
  isLoading = false 
}: SearchFormProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">
        Search the food database by name
      </h3>
      <form onSubmit={onSearch} className="flex flex-col sm:flex-row gap-2 justify-center">
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search foods..."
          className="flex-1 max-w-full sm:max-w-2xl"
          disabled={isLoading}
        />
        <Button type="submit" className="w-full sm:w-24" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
        </Button>
      </form>
      <Link 
        href="#" 
        onClick={onQuickAdd} 
        className="text-sm text-blue-500 hover:underline"
      >
        Quick add calories
      </Link>
    </div>
  )
}