import React from 'react'
import { EditPage } from '@/lib/resources/pages'
import { NoteResource } from '../NoteResource'
import { useNavigate } from '@tanstack/react-router'

const resource = new NoteResource()

interface NoteEditPageProps {
  recordId: string
}

export default function NoteEditPage({ recordId }: NoteEditPageProps) {
  const navigate = useNavigate()

  const handleSuccess = () => {
    navigate({ to: '/notes' })
  }

  const handleCancel = () => {
    navigate({ to: '/notes' })
  }

  return (
    <EditPage 
      resource={resource} 
      recordId={recordId}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  )
}
