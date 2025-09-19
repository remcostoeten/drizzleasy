type TProps = {
  children: React.ReactNode
  className?: string
}

function Card({ children, className = '' }: TProps) {
  return (
    <div className={`bg-gray-900 border border-gray-800 rounded-lg p-6 transition-all duration-200 hover:border-gray-700 hover:shadow-lg ${className}`}>
      {children}
    </div>
  )
}

export { Card }
