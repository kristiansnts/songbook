import React from 'react'
import { ViewPage } from '@/lib/resources/pages'
import { PlaylistResource } from '../PlaylistResource'
import { useParams } from '@tanstack/react-router'

const resource = new PlaylistResource()

export default function PlaylistViewPage() {
  const { id } = useParams({ from: '/_authenticated/playlists/view/$id' })

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
