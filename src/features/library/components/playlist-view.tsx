import { ArrowLeft, MoreHorizontal, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from '@tanstack/react-router'

interface PlaylistViewProps {
  playlistName?: string
  songCount?: number
}

export default function PlaylistView({ playlistName = "Test", songCount = 0 }: PlaylistViewProps) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 flex items-center justify-between border-b">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate({ to: '/user/dashboard' })}
            className="flex items-center p-0 hover:bg-transparent"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span className="text-lg">Song lists</span>
          </Button>
        </div>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-6 w-6" />
        </Button>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center text-center px-4">
        <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded-lg mb-6">
          <svg
            className="w-32 h-32 text-gray-300"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              clipRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM6 9a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 4a1 1 0 100 2h3a1 1 0 100-2H7z"
              fillRule="evenodd"
            />
            <path d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L13 7.414V17a1 1 0 11-2 0V7.414L8.707 9.707a1 1 0 01-1.414-1.414l4-4z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-2">{playlistName}</h1>
        <p className="text-gray-500">
          {songCount === 0 ? 'Setlist has no songs.' : `${songCount} songs`}
        </p>
      </main>

      <div className="px-4 py-6 border-t">
        <Button 
          variant="ghost" 
          className="flex items-center w-full text-left py-2 justify-start h-auto"
        >
          <Plus className="text-blue-500 mr-3 h-6 w-6" />
          <span className="text-lg">Add ...</span>
        </Button>
        <div className="border-t my-4" />
        <p className="text-gray-500">{songCount} songs</p>
      </div>
    </div>
  )
}