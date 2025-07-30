import React from 'react'
import { CreatePage } from '@/lib/resources/pages'
import { TagResource } from '../TagResource'

const resource = new TagResource()

export default function TagCreatePage() {
  return (
    <CreatePage resource={resource} />
  )
}
