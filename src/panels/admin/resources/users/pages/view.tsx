import React from 'react'
import { useParams } from '@tanstack/react-router'
import { ViewPage } from '@/lib/resources/pages'
import { UserResource } from '../userResource'

const resource = new UserResource()

export default function UserViewPage() {
  const { id } = useParams({ from: '/_authenticated/users/view/$id' })

  if (!id) {
    return (
      <div className='container mx-auto p-6'>
        <div className='text-center'>
          <p className='text-red-600'>Invalid record ID</p>
        </div>
      </div>
    )
  }

  return <ViewPage resource={resource} recordId={id} />
}
