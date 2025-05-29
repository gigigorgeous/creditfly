"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MoonIcon, SunIcon, MenuIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"
import { UserProfileButton } from "./user-profile-button"

interface HeaderProps {
  user: { id: string; username: string; email: string } | null
  onLogin: (user: { id: string; username: string; email: string }) => void
  onLogout: () => void
}

export function Header({ user, onLogin, onLogout }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center rounded-full bg-primary w-8 h-8">
              <span className="text-primary-foreground font-bold">M</span>
            </div>
            <span className="font-bold hidden sm:inline-block">AI Music & Video</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <UserProfileButton user={user} onLogin={onLogin} onLogout={onLogout} />

          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            <span className="sr-only">Toggle theme</span>
          </Button>

          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <MenuIcon className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>AI Music & Video Creator</SheetTitle>
                <SheetDescription>Create amazing music and videos with AI</SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-4 py-4">
                <Button variant="ghost" asChild>
                  <Link href="/">Dashboard</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/pricing">Pricing</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/help">Help</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <div className="hidden md:flex md:items-center md:gap-2">
            <Button variant="ghost" asChild>
              <Link href="/pricing">Pricing</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/help">Help</Link>
            </Button>
            <Button variant="default" asChild>
              <Link href="/upgrade">Upgrade</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
