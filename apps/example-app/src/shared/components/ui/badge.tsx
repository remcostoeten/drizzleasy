type TVariant = 'default' | 'success' | 'warning' | 'danger'

type TProps = {
  children: React.ReactNode
  variant?: TVariant
  className?: string
}

function Badge({ children, variant = 'default', className = '' }: TProps) {
  const variants = {
    default: 'bg-gray-800 text-gray-300 border-gray-700',
    success: 'bg-green-900 text-green-300 border-green-700',
    warning: 'bg-yellow-900 text-yellow-300 border-yellow-700',
    danger: 'bg-red-900 text-red-300 border-red-700'
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

export { Badge }
