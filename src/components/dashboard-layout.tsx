"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Home, Users, CalendarDays, DollarSign, Menu, X, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children: React.ReactNode
  activeSection: string
  onSectionChange: (section: string) => void
}

export function DashboardLayout({ children, activeSection, onSectionChange }: DashboardLayoutProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const navItems = [
    {
      id: "overview",
      label: "Overview",
      icon: Home,
    },
    {
      id: "teachers",
      label: "Teacher List",
      icon: Users,
    },
    {
      id: "schedule",
      label: "Schedule Chart",
      icon: CalendarDays,
    },
    {
      id: "payment",
      label: "Payment Portal",
      icon: DollarSign,
    },
  ]

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white">
      {" "}
      
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-black border-r border-gray-200 shadow-sm transition-all duration-300 ease-in-out",
          isSidebarCollapsed ? "w-16" : "w-64",
        )}
      >
        
        <div className="flex items-center justify-between h-16 border-b border-gray-800 px-4">
          {!isSidebarCollapsed && <h2 className="text-xl font-bold text-white">Teacher Admin</h2>}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="text-white hover:bg-white hover:text-black transition-colors"
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

      
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "w-full text-white hover:bg-white hover:text-black transition-colors duration-200",
                isSidebarCollapsed ? "justify-center px-2" : "justify-start",
                activeSection === item.id && "bg-white text-black font-semibold",
              )}
              onClick={() => onSectionChange(item.id)}
              title={isSidebarCollapsed ? item.label : undefined}
            >
              <item.icon className={cn("h-5 w-5", !isSidebarCollapsed && "mr-3")} />
              {!isSidebarCollapsed && item.label}
            </Button>
          ))}
        </nav>
      </aside>
      
      <header className="lg:hidden w-full bg-black border-b border-gray-200 shadow-sm p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Teacher Admin</h1>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white hover:text-black">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle navigation</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-black border-r border-gray-800">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between h-16 border-b border-gray-800 px-4">
                <h2 className="text-xl font-bold text-white">Teacher Admin</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSheetOpen(false)}
                  className="text-white hover:bg-white hover:text-black"
                >
                  <X className="h-6 w-6" />
                  <span className="sr-only">Close navigation</span>
                </Button>
              </div>
              <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-white hover:bg-white hover:text-black transition-colors duration-200",
                      activeSection === item.id && "bg-white text-black font-semibold",
                    )}
                    onClick={() => {
                      onSectionChange(item.id)
                      setIsSheetOpen(false)
                    }}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Button>
                ))}
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </header>
     
      <main className="flex-1 bg-white overflow-auto">
        <div className="p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-8">{children}</div>
        </div>
      </main>
    </div>
  )
}
