'use client'

import { useEffect, useState } from 'react'

interface TypewriterEffectProps {
  text: string
  speed?: number
  onComplete?: () => void
  onTextUpdate?: (text: string) => void
  className?: string
}

export default function TypewriterEffect({ 
  text, 
  speed = 30, 
  onComplete,
  onTextUpdate,
  className = ''
}: TypewriterEffectProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        const newText = displayedText + text[currentIndex]
        setDisplayedText(newText)
        setCurrentIndex(prev => prev + 1)
        if (onTextUpdate) {
          onTextUpdate(newText)
        }
      }, speed)

      return () => clearTimeout(timeout)
    } else if (onComplete && currentIndex === text.length) {
      onComplete()
    }
  }, [currentIndex, text, speed, onComplete, displayedText, onTextUpdate])

  // Reset when text changes
  useEffect(() => {
    setDisplayedText('')
    setCurrentIndex(0)
  }, [text])

  return null // We'll use the onTextUpdate callback instead
}