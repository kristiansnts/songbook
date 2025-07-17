import React from 'react'
import { CreatePage } from '@/lib/resources/pages'
import { NoteResource } from '../NoteResource'
import { useNavigate } from '@tanstack/react-router'

const resource = new NoteResource()

export default function NoteCreatePage() {
  const navigate = useNavigate()

  const handleSuccess = () => {
    navigate({ to: '/notes' })
  }

  const handleCancel = () => {
    navigate({ to: '/notes' })
  }

  return (
    <CreatePage 
      resource={resource} 
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  )
}
