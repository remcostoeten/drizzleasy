'use client'

import { forwardRef } from 'react'

type TProps = {
  label?: string
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  disabled?: boolean
  error?: string
  type?: 'text' | 'email' | 'password' | 'number'
  className?: string
}

const Input = forwardRef<HTMLInputElement, TProps>(function Input(
  { label, placeholder, value, onChange, onBlur, disabled, error, type = 'text', className = '', ...props },
  ref
) {
  const inputClasses = `
    flex h-10 w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white
    placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white
    focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-50
    ${error ? 'border-red-500 focus-visible:ring-red-500' : ''}
    ${className}
  `.trim()

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-gray-200">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        className={inputClasses}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  )
})

export { Input }
