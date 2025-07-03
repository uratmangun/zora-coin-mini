"use client"

import Link from "next/link"
import { Button } from "@/app/components/ui/button"
import { TextRotate } from "@/app/components/ui/text-rotate"
import { ThemeToggle } from "@/app/components/ui/theme-toggle"
import { Github, PlayCircle } from "lucide-react"
import { BlogSection } from "@/app/components/blog-section"

export default function Page() {
  return (
    <main>
      <section className="relative w-full h-screen mx-auto overflow-hidden">
        <div className="absolute top-4 right-4 z-20 flex items-center gap-4">
          
          <ThemeToggle />
        </div>
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center bg-black/50">
          <h1 className="text-4xl font-bold tracking-tighter text-white sm:text-5xl md:text-6xl lg:text-7xl/none">
            Turn Your Blog into a
          </h1>
          <TextRotate
            phrases={["Tradable Asset", "Zora Coin", "Community Hub"]}
            className="text-4xl font-bold tracking-tighter text-transparent sm:text-5xl md:text-6xl lg:text-7xl/none bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600"
          />
          <p className="max-w-3xl mx-auto mt-4 text-lg text-white md:text-xl">
            Empower your content. Let your readers invest in your ideas by turning each blog post into a unique, sellable Zora coin.
          </p>
          <div className="flex flex-col gap-2 mt-8 min-[400px]:flex-row">
            <Button asChild>
              <Link href="#" className="flex items-center">
                <PlayCircle className="w-4 h-4 mr-2" />
                Video Demo
              </Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="#" className="flex items-center">
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </Link>
            </Button>
          </div>
        </div>
      </section>
      <BlogSection />
    </main>
  )
}
