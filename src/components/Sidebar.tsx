import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { PatternConstructor } from "@/scripts/constructors/PatternConstructor"

interface SidebarProps {
  theme: 'light' | 'dark'
  selectedPattern: string | null
  onPatternSelect: (patternId: string) => void
  onThemeToggle: () => void
}

export function Sidebar({ theme, selectedPattern, onPatternSelect, onThemeToggle }: SidebarProps) {
  return (
    <aside className="w-80 border-r bg-card">
      <div className="flex h-16 items-center justify-between px-4 border-b">
        <h1 className="text-lg font-semibold">Layouter</h1>
      </div>

      <Tabs defaultValue="patterns" className="h-[calc(100vh-4rem)]">
        <div className="border-b px-4 py-2">
          <TabsList className="w-full">
            <TabsTrigger value="patterns" className="flex-1">Patterns</TabsTrigger>
            <TabsTrigger value="layers" className="flex-1">Layers</TabsTrigger>
            <TabsTrigger value="properties" className="flex-1">Properties</TabsTrigger>
          </TabsList>
        </div>

        <div className="overflow-auto h-[calc(100%-5rem)] p-4 scrollbar-thin scrollbar-track-muted scrollbar-thumb-muted-foreground/30 hover:scrollbar-thumb-muted-foreground/50">
          <TabsContent value="patterns" className="mt-0">
            <h3 className="text-xs font-semibold text-muted-foreground mb-3">Layout Patterns</h3>
            <div className="grid grid-cols-1 gap-3">
              {Object.entries(PatternConstructor.previews).map(([id, { label, preview }]) => (
                <Card 
                  key={id}
                  className={`cursor-pointer hover:border-primary transition-colors p-3 ${selectedPattern === id ? 'border-primary' : ''}`}
                  onClick={() => onPatternSelect(id)}
                >
                  <div dangerouslySetInnerHTML={{ __html: preview }} />
                  <div className="mt-2 text-xs text-muted-foreground">{label}</div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="layers" className="mt-0">
            <div className="space-y-2"></div>
          </TabsContent>

          <TabsContent value="properties" className="mt-0">
            <div className="space-y-4"></div>
          </TabsContent>
        </div>
      </Tabs>
    </aside>
  )
} 