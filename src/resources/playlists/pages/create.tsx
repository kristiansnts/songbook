import React from 'react'
import { CreatePage } from '@/lib/resources/pages'
import { PlaylistResource } from '../PlaylistResource'

const resource = new PlaylistResource()

export default function PlaylistCreatePage() {
  return (
    <CreatePage resource={resource} />
  )
}
