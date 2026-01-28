import React from 'react'
import { Resource, ResourcePageConfig } from '@/lib/resources/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface BasePageProps {
  resource: Resource
  config: ResourcePageConfig
  children: React.ReactNode
  className?: string
}

export function BasePage({
  resource,
  config,
  children,
  className,
}: BasePageProps) {
  return (
    <div className={cn('container mx-auto space-y-6 p-6', className)}>
      {/* Simple Breadcrumbs */}
      {config.breadcrumbs && config.breadcrumbs.length > 0 && (
        <nav className='flex' aria-label='Breadcrumb'>
          <ol className='flex items-center space-x-2'>
            {config.breadcrumbs.map((breadcrumb, index) => (
              <li key={index} className='flex items-center'>
                {index > 0 && <span className='mx-2 text-gray-400'>/</span>}
                {breadcrumb.href ? (
                  <a
                    href={breadcrumb.href}
                    className='text-blue-600 hover:text-blue-800'
                  >
                    {breadcrumb.label}
                  </a>
                ) : (
                  <span className='text-gray-500'>{breadcrumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Page Header */}
      <div className='flex items-center justify-between'>
        <div>
          {config.title && (
            <h1 className='text-2xl font-bold'>{config.title}</h1>
          )}
          {config.subtitle && (
            <p className='text-muted-foreground mt-1'>{config.subtitle}</p>
          )}
        </div>

        {/* Page Actions */}
        {config.actions && config.actions.length > 0 && (
          <div className='flex items-center gap-2'>
            {config.actions.map((action) => (
              <Button
                key={action.name}
                onClick={() => action.action()}
                variant='default'
                className={
                  action.color
                    ? `bg-${action.color}-500 hover:bg-${action.color}-600`
                    : ''
                }
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Page Content */}
      {children}
    </div>
  )
}
