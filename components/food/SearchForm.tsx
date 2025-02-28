import type React from "react"
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

export function SearchForm({ searchQuery, onSearchChange, onSearch, onQuickAdd, isLoading = false }: SearchFormProps) {
  return (
    <div className="w-full space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">Search the food database by name</h3>
      <form onSubmit={onSearch} className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search foods..."
            className="w-full"
            disabled={isLoading}
          />
        </div>
        <Button type="submit" className="shrink-0" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Searching...
            </>
          ) : (
            "Search"
          )}
        </Button>
      </form>
      {/* <Link href="#" onClick={onQuickAdd} className="text-sm text-blue-500 hover:underline inline-block">
        Quick add calories
      </Link> */}
    </div>
  )
}

