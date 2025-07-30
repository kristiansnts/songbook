// PlaylistResource exports - Auto-discoverable by resource registry
export { PlaylistResource } from './PlaylistResource'
export { playlistSchema, type Playlist, type CreatePlaylist } from './playlist-schema'

// Page components
export { default as PlaylistListPage } from './pages/list'
export { default as PlaylistCreatePage } from './pages/create'
export { default as PlaylistEditPage } from './pages/edit'
export { default as PlaylistViewPage } from './pages/view'
