"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Music, Video, Settings, Home, Sparkles } from "lucide-react"

export function MainNav() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/",
      label: "Home",
      icon: Home,
      active: pathname === "/",
    },
    {
      href: "/music-creator",
      label: "Music Creator",
      icon: Music,
      active: pathname === "/music-creator",
    },
    {
      href: "/music-studio",
      label: "Music Studio",
      icon: Sparkles,
      active: pathname === "/music-studio",
    },
    {
      href: "/video-studio",
      label: "Video Studio",
      icon: Video,
      active: pathname === "/video-studio",
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
      active: pathname === "/settings",
    },
  ]

  return (
    <nav className="flex items-center space-x-1">
      {routes.map((route) => {
        const Icon = route.icon
        return (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center space-x-2 px-4 py-2 rounded-lg transition-all",
              route.active ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white hover:bg-purple-500/20",
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="text-sm font-medium">{route.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
