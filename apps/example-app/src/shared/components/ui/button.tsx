'use client'

import { forwardRef } from 'react'

type TVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
type TSize = 'sm' | 'md' | 'lg'

type TProps = {
  variant?: TVariant
  size?: TSize
  disabled?: boolean
  loading?: boolean
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
}

const Button = forwardRef<HTMLButtonElement, TProps>(function Button(
  { variant = 'primary', size = 'md', disabled, loading, children, onClick, type = 'button', className = '', ...props },
  ref
) {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-105 active:scale-95'
  
  const variants = {
    primary: 'bg-white text-black hover:bg-gray-100 focus-visible:ring-white',
    secondary: 'bg-gray-800 text-white border border-gray-700 hover:bg-gray-700 focus-visible:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
    ghost: 'text-gray-300 hover:text-white hover:bg-gray-800 focus-visible:ring-gray-500'
  }
  
  const sizes = {
    sm: 'h-8 px-3 text-sm rounded-md',
    md: 'h-10 px-4 py-2 rounded-md',
    lg: 'h-12 px-6 text-lg rounded-md'
  }
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`
  
  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  )
})

export { Button }
