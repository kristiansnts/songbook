import React from 'react'
import { CreatePage } from '@/lib/resources/pages'
import { SongResource } from '../SongResource'

const resource = new SongResource()

export default function SongCreatePage() {
  return (
    <CreatePage resource={resource} />
  )
}
