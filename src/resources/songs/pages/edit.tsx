import React from 'react'
import { EditPage } from '@/lib/resources/pages'
import { SongResource } from '../SongResource'
import { useParams } from '@tanstack/react-router'

const resource = new SongResource()

export default function SongEditPage() {
  const { id } = useParams({ from: '/_authenticated/songs/edit/$id' })

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
    <EditPage resource={resource} recordId={id} />
  )
}
