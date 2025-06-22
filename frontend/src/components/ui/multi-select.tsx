import * as React from "react"
import { X, ChevronDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

export type Option = {
  label: string
  value: string
}

interface MultiSelectProps {
  options: Option[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const handleUnselect = (value: string) => {
    onChange(selected.filter((item) => item !== value))
  }

  const handleSelect = (value: string) => {
    if (!selected.includes(value)) {
      onChange([...selected, value])
    }
    // Keep the dropdown open after selection
    setOpen(true)
  }

  const selectables = options.filter((option) => !selected.includes(option.value))

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <div
            className="flex w-full flex-wrap gap-1 border border-input px-3 py-2 text-sm ring-offset-background rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 cursor-pointer"
            onClick={() => setOpen(true)}
          >
            {selected.length > 0 ? (
              selected.map((value) => {
                const option = options.find((option) => option.value === value)
                return (
                  <Badge key={value} variant="secondary">
                    {option?.label}
                    <button
                      type="button"
                      className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleUnselect(value)
                        }
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleUnselect(value)
                      }}
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </button>
                  </Badge>
                )
              })
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <div className="ml-auto flex items-center self-center">
              <ChevronDown className="h-4 w-4 opacity-50" />
            </div>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="w-[--radix-dropdown-menu-trigger-width]" 
          align="start"
          side="bottom"
        >
          {selectables.length > 0 ? (
            selectables.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onSelect={() => handleSelect(option.value)}
                className="cursor-pointer"
              >
                {option.label}
              </DropdownMenuItem>
            ))
          ) : (
            <div className="text-center py-2 text-sm text-muted-foreground">
              No options available
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
