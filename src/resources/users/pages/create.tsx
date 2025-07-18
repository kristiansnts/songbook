import React from 'react'
import { CreatePage } from '@/lib/resources/pages'
import { UserResource } from '../userResource'

const resource = new UserResource()

export default function UserCreatePage() {
  return (
    <CreatePage resource={resource} />
  )
}
