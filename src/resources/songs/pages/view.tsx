import React from 'react'
import { ViewPage } from '@/lib/resources/pages'
import { SongResource } from '../SongResource'
import { useParams } from '@tanstack/react-router'

const resource = new SongResource()

export default function SongViewPage() {
  const { id } = useParams({ from: '/_authenticated/songs/view/$id' })

  if (!id) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p className="text-red-600">Invalid record ID</p>
        </div>
      </div>
    )
  }

  return (
    <ViewPage resource={resource} recordId={id} />
  )
}
