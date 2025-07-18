import React from 'react'
import { EditPage } from '@/lib/resources/pages'
import { UserResource } from '../userResource'
import { useParams } from '@tanstack/react-router'

const resource = new UserResource()

export default function UserEditPage() {
  const { id } = useParams({ from: '/_authenticated/users/edit/$id' })

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
