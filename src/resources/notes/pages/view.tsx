import React from 'react'
import { ViewPage } from '@/lib/resources/pages'
import { NoteResource } from '../NoteResource'
import { useNavigate } from '@tanstack/react-router'

const resource = new NoteResource()

interface NoteViewPageProps {
  recordId: string
}

export default function NoteViewPage({ recordId }: NoteViewPageProps) {
  const navigate = useNavigate()

  const handleEdit = () => {
    navigate({ to: '/notes/edit/$id', params: { id: recordId } })
  }

  const handleDelete = () => {
    navigate({ to: '/notes' })
  }

  return (
    <ViewPage 
      resource={resource} 
      recordId={recordId}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  )
}
