'use client'

import { useEffect, useState } from 'react'

interface TypewriterEffectProps {
  words?: string[]
  text?: string
  speed?: number
  deletingSpeed?: number
  pauseDuration?: number
  onComplete?: () => void
  onTextUpdate?: (text: string) => void
  className?: string
  loop?: boolean
}

export default function TypewriterEffect({ 
  words,
  text, 
  speed = 50, 
  deletingSpeed = 30,
  pauseDuration = 2000,
  onComplete,
  onTextUpdate,
  className = '',
  loop = true
}: TypewriterEffectProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  // Handle single text mode
  useEffect(() => {
    if (text && !words && currentIndex < text.length) {
      const timeout = setTimeout(() => {
        const newText = displayedText + text[currentIndex]
        setDisplayedText(newText)
        setCurrentIndex(prev => prev + 1)
        if (onTextUpdate) {
          onTextUpdate(newText)
        }
      }, speed)

      return () => clearTimeout(timeout)
    } else if (text && !words && onComplete && currentIndex === text.length) {
      onComplete()
    }
  }, [currentIndex, text, speed, onComplete, displayedText, onTextUpdate, words])

  // Reset when text changes
  useEffect(() => {
    if (text && !words) {
      setDisplayedText('')
      setCurrentIndex(0)
    }
  }, [text, words])

  // Handle multiple words mode
  useEffect(() => {
    if (words && words.length > 0) {
      const currentWord = words[currentWordIndex]
      
      const timeout = setTimeout(() => {
        if (!isDeleting) {
          // Typing
          if (displayedText !== currentWord) {
            const newText = currentWord.slice(0, displayedText.length + 1)
            setDisplayedText(newText)
            if (onTextUpdate) {
              onTextUpdate(newText)
            }
          } else {
            // Finished typing, pause then start deleting
            setTimeout(() => setIsDeleting(true), pauseDuration)
          }
        } else {
          // Deleting
          if (displayedText !== '') {
            const newText = displayedText.slice(0, -1)
            setDisplayedText(newText)
            if (onTextUpdate) {
              onTextUpdate(newText)
            }
          } else {
            // Finished deleting, move to next word
            setIsDeleting(false)
            const nextIndex = (currentWordIndex + 1) % words.length
            setCurrentWordIndex(nextIndex)
            
            if (nextIndex === 0 && !loop && onComplete) {
              onComplete()
            }
          }
        }
      }, isDeleting ? deletingSpeed : speed)

      return () => clearTimeout(timeout)
    }
  }, [displayedText, isDeleting, currentWordIndex, words, speed, deletingSpeed, pauseDuration, onTextUpdate, loop, onComplete])

  // Render based on mode
  if (text && !words) {
    return <span className={className}>{displayedText}<span className="animate-pulse">|</span></span>
  }

  if (words && words.length > 0) {
    return (
      <span className={className}>
        {displayedText}
        <span className="animate-pulse">|</span>
      </span>
    )
  }

  return null
}