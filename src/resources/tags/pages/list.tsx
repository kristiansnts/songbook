import React from 'react'
import { ListPage, useListPage } from '@/lib/resources/pages'
import { TagResource } from '../TagResource'

const resource = new TagResource()

export default function TagListPage() {
  const { data, loading, error, refresh } = useListPage(resource)

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <ListPage
      resource={resource}
      data={data}
      loading={loading}
      onRefresh={refresh}
    />
  )
}
