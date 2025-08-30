import { Search, List, Tag, User, History, Plus, Music, Users, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useNavigate } from '@tanstack/react-router'

export default function Library() {
  const navigate = useNavigate()
  const songs = [
    { id: 1, type: 'all', label: 'All songs', count: 2, icon: List },
    { id: 2, type: 'tags', label: 'Tags', icon: Tag },
    { id: 3, type: 'artists', label: 'Artists', icon: User },
    { id: 4, type: 'recents', label: 'Recents', icon: History },
  ]

  const playlists = [
    { id: 1, name: 'Monoplex Club', count: 10 },
    { id: 2, name: 'Veľký Biel Festival', count: 9 },
    { id: 3, name: 'Summer Open Air', count: 8 },
  ]

  const teams = [
    { id: 1, name: 'My Team' },
  ]

  return (
    <div className="container mx-auto px-4 py-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Library</h1>
      </header>

      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          className="pl-10"
          placeholder="Song, tag or artist"
          type="text"
        />
      </div>

      <main>
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Songs
          </h2>
          <div className="space-y-1">
            {songs.map((song) => {
              const IconComponent = song.icon
              return (
                <Button
                  key={song.id}
                  variant="ghost"
                  className="w-full justify-between p-3 h-auto"
                  onClick={() => {
                    if (song.type === 'artists') {
                      navigate({ to: '/user/artist' })
                    }
                  }}
                >
                  <div className="flex items-center">
                    <IconComponent className="text-gray-600 mr-4 h-6 w-6" />
                    <span className="text-lg">{song.label}</span>
                  </div>
                  <div className="flex items-center">
                    {song.count && (
                      <span className="text-gray-500 mr-2">{song.count}</span>
                    )}
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </Button>
              )
            })}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Playlists
          </h2>
          <div className="space-y-1">
            {playlists.map((playlist) => (
              <Button
                key={playlist.id}
                variant="ghost"
                className="w-full justify-between p-3 h-auto"
                onClick={() => navigate({ to: '/playlist/$id', params: { id: playlist.id.toString() } })}
              >
                <div className="flex items-center">
                  <Music className="text-gray-600 mr-4 h-6 w-6" />
                  <span className="text-lg">{playlist.name}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-500 mr-2">{playlist.count}</span>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </Button>
            ))}
            <Button
              variant="ghost"
              className="w-full justify-start p-3 h-auto"
            >
              <Plus className="text-gray-600 mr-4 h-6 w-6" />
              <span className="text-lg">New playlist</span>
            </Button>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Playlist Teams
          </h2>
          <div className="space-y-1">
            {teams.map((team) => (
              <Button
                key={team.id}
                variant="ghost"
                className="w-full justify-start p-3 h-auto"
              >
                <Users className="text-gray-600 mr-4 h-6 w-6" />
                <span className="text-lg">{team.name}</span>
              </Button>
            ))}
            <Button
              variant="ghost"
              className="w-full justify-start p-3 h-auto"
            >
              <Plus className="text-gray-600 mr-4 h-6 w-6" />
              <span className="text-lg">New team</span>
            </Button>
          </div>
        </section>
      </main>
    </div>
  )
}