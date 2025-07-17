'use client'

import { useMemo } from 'react'

interface ChartData {
  labels: string[]
  values: number[]
}

interface AdminChartProps {
  data: ChartData
  type: 'line' | 'bar'
  color?: string
  height?: number
}

function AdminChart({ data, type, color = 'indigo', height = 200 }: AdminChartProps) {
  const maxValue = useMemo(() => Math.max(...data.values), [data.values])
  
  const colors = {
    indigo: 'from-indigo-500 to-purple-600',
    green: 'from-green-500 to-emerald-600',
    orange: 'from-orange-500 to-red-600',
    blue: 'from-blue-500 to-cyan-600',
  }

  const gradient = colors[color as keyof typeof colors] || colors.indigo

  if (type === 'bar') {
    return (
      <div className="relative" style={{ height }}>
        <div className="absolute inset-0 flex items-end justify-between gap-2">
          {data.values.map((value, index) => {
            const heightPercentage = (value / maxValue) * 100
            return (
              <div
                key={index}
                className="flex-1 relative group"
                style={{ height: '100%' }}
              >
                <div
                  className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${gradient} rounded-t-lg transition-all duration-500 group-hover:opacity-80`}
                  style={{ height: `${heightPercentage}%` }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {value.toLocaleString()}
                  </div>
                </div>
                <div className="absolute -bottom-6 left-0 right-0 text-xs text-gray-500 text-center">
                  {data.labels[index]}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Line chart
  return (
    <div className="relative" style={{ height }}>
      <svg className="w-full h-full">
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" className="text-indigo-500" stopColor="currentColor" stopOpacity="0.3" />
            <stop offset="100%" className="text-indigo-500" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((percentage) => (
          <line
            key={percentage}
            x1="0"
            y1={`${100 - percentage}%`}
            x2="100%"
            y2={`${100 - percentage}%`}
            stroke="currentColor"
            className="text-gray-200"
            strokeDasharray="4 4"
          />
        ))}
        
        {/* Data line */}
        <path
          d={data.values.map((value, index) => {
            const x = (index / (data.values.length - 1)) * 100
            const y = 100 - (value / maxValue) * 100
            return `${index === 0 ? 'M' : 'L'} ${x}% ${y}%`
          }).join(' ')}
          fill="none"
          stroke="currentColor"
          className="text-indigo-600"
          strokeWidth="3"
        />
        
        {/* Area fill */}
        <path
          d={`${data.values.map((value, index) => {
            const x = (index / (data.values.length - 1)) * 100
            const y = 100 - (value / maxValue) * 100
            return `${index === 0 ? 'M' : 'L'} ${x}% ${y}%`
          }).join(' ')} L 100% 100% L 0% 100% Z`}
          fill={`url(#gradient-${color})`}
        />
        
        {/* Data points */}
        {data.values.map((value, index) => {
          const x = (index / (data.values.length - 1)) * 100
          const y = 100 - (value / maxValue) * 100
          return (
            <g key={index} className="group">
              <circle
                cx={`${x}%`}
                cy={`${y}%`}
                r="4"
                fill="currentColor"
                className="text-indigo-600"
              />
              <circle
                cx={`${x}%`}
                cy={`${y}%`}
                r="8"
                fill="currentColor"
                className="text-indigo-600 opacity-0 group-hover:opacity-20 transition-opacity"
              />
              <text
                x={`${x}%`}
                y={`${y - 5}%`}
                textAnchor="middle"
                className="text-xs font-semibold fill-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {value.toLocaleString()}
              </text>
            </g>
          )
        })}
      </svg>
      
      {/* X-axis labels */}
      <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-500">
        {data.labels.map((label, index) => (
          <span key={index}>{label}</span>
        ))}
      </div>
    </div>
  )
}

export default AdminChart