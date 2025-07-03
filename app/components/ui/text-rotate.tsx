"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"

import { cn } from "@/lib/utils"

interface TextRotateProps {
  phrases: string[]
  duration?: number
  className?: string
}

export function TextRotate({
  phrases,
  duration = 3000,
  className,
}: TextRotateProps) {
  const [index, setIndex] = React.useState(0)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIndex((prev) => (prev + 1) % phrases.length)
    }, duration)
    return () => clearTimeout(timer)
  }, [index, duration, phrases.length])

  return (
    <AnimatePresence mode="wait">
      <motion.h1
        key={phrases[index]}
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.5 }}
        className={cn("text-center", className)}
      >
        {phrases[index]}
      </motion.h1>
    </AnimatePresence>
  )
}
