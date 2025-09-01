import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { playlistService } from '@/services/playlist-service'
import { Playlist } from '@/types/playlist'
import { Song } from '@/types/song'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ChevronLeft, Search, X, Loader2, Play, Share, Copy, Trash2, Users } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authenticated/user/playlist/$id')({
  component: PlaylistComponent,
})

function PlaylistComponent() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set())
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [shareLink, setShareLink] = useState<string>('')
  const [generatingLink, setGeneratingLink] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [removeSongDialogOpen, setRemoveSongDialogOpen] = useState(false)
  const [songToRemove, setSongToRemove] = useState<Song | null>(null)
  const [playlistTeams, setPlaylistTeams] = useState<any[]>([])
  const [loadingTeams, setLoadingTeams] = useState(false)
  const [membersDialogOpen, setMembersDialogOpen] = useState(false)
  const [removingMemberId, setRemovingMemberId] = useState<number | null>(null)
  const [teamDetails, setTeamDetails] = useState<any>(null)
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [deleteTeamDialogOpen, setDeleteTeamDialogOpen] = useState(false)
  const [deletingTeam, setDeletingTeam] = useState(false)
  const [removeMemberDialogOpen, setRemoveMemberDialogOpen] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<any>(null)
  
  useEffect(() => {
    loadPlaylistData()
    loadPlaylistTeams()
  }, [id])

  useEffect(() => {
    // Set share link if playlist has one
    if (playlist?.sharable_link) {
      setShareLink(playlist.sharable_link)
    }
  }, [playlist])

  const loadPlaylistData = async () => {
    try {
      setLoading(true)
      const playlistData = await playlistService.getPlaylist(id)
      setPlaylist(playlistData)
      setSongs(playlistData.songs || [])
    } catch (_error) {
      setPlaylist({ id, name: 'Playlist Not Found', songCount: 0 })
      setSongs([])
    } finally {
      setLoading(false)
    }
  }

  const loadPlaylistTeams = async () => {
    try {
      setLoadingTeams(true)
      const teams = await playlistService.getPlaylistTeams()
      // Filter teams for this specific playlist
      const currentPlaylistTeams = teams.filter((team: any) => 
        team.playlist_id?.toString() === id.toString()
      )
      setPlaylistTeams(currentPlaylistTeams)
    } catch (error) {
      console.warn('Failed to load playlist teams:', error)
      setPlaylistTeams([])
    } finally {
      setLoadingTeams(false)
    }
  }

  const getCurrentPlaylistTeam = () => {
    return playlistTeams.find((team: any) => 
      team.playlist_id?.toString() === id.toString()
    )
  }

  const handleRemoveMemberClick = (member: any) => {
    setMemberToRemove(member)
    setRemoveMemberDialogOpen(true)
  }

  const handleConfirmRemoveMember = async () => {
    if (!memberToRemove || !playlist?.playlist_team_id) return

    try {
      setRemovingMemberId(memberToRemove.id)
      
      // Call API to remove member using team ID
      await playlistService.removeMemberFromPlaylist(playlist.playlist_team_id.toString(), memberToRemove.id)
      
      // Reload team details to refresh the member list
      await loadTeamDetails()
      
      toast.success('Member removed from playlist', {
        action: {
          label: 'x',
          onClick: () => toast.dismiss()
        }
      })
      
      // Close dialog and reset state
      setRemoveMemberDialogOpen(false)
      setMemberToRemove(null)
    } catch (error) {
      toast.error('Failed to remove member', {
        action: {
          label: 'x',
          onClick: () => toast.dismiss()
        }
      })
    } finally {
      setRemovingMemberId(null)
    }
  }

  const loadTeamDetails = async () => {
    // Get team ID from playlist data, not from playlist teams
    if (!playlist?.playlist_team_id) {
      console.warn('No playlist_team_id found in playlist data')
      setTeamDetails(null)
      return
    }

    try {
      setLoadingMembers(true)
      const teamId = playlist.playlist_team_id
      const details = await playlistService.getPlaylistTeamDetails(teamId.toString())
      
      setTeamDetails(details)
    } catch (error) {
      console.warn('Failed to load team details:', error)
      setTeamDetails(null)
    } finally {
      setLoadingMembers(false)
    }
  }

  const handleMembersDialogOpen = () => {
    setMembersDialogOpen(true)
    loadTeamDetails()
  }

  const handleDeleteTeam = async () => {
    if (!playlist?.playlist_team_id) return

    try {
      setDeletingTeam(true)
      await playlistService.deletePlaylistTeam(playlist.playlist_team_id.toString())
      
      toast.success('Team deleted successfully', {
        action: {
          label: 'x',
          onClick: () => toast.dismiss()
        }
      })
      
      // Close dialogs and refresh data
      setDeleteTeamDialogOpen(false)
      setMembersDialogOpen(false)
      setTeamDetails(null)
      
      // Reload playlist data to update playlist_team_id
      await loadPlaylistData()
      await loadPlaylistTeams()
    } catch (error) {
      toast.error('Failed to delete team', {
        action: {
          label: 'x',
          onClick: () => toast.dismiss()
        }
      })
    } finally {
      setDeletingTeam(false)
    }
  }

  const handleRemoveSongClick = (song: Song) => {
    setSongToRemove(song)
    setRemoveSongDialogOpen(true)
  }

  const handleConfirmRemoveSong = async () => {
    if (!songToRemove) return

    try {
      setRemovingIds(prev => new Set([...prev, songToRemove.id]))
      
      await playlistService.removeSongFromPlaylist(id, songToRemove.id)
      
      // Reload playlist data to get updated song list
      await loadPlaylistData()
      
      toast.success('Song removed from playlist', {
        action: {
          label: 'x',
          onClick: () => toast.dismiss()
        }
      })
    } catch (error) {
      toast.error('Failed to remove song from playlist', {
        action: {
          label: 'x',
          onClick: () => toast.dismiss()
        }
      })
    } finally {
      setRemovingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(songToRemove.id)
        return newSet
      })
      setRemoveSongDialogOpen(false)
      setSongToRemove(null)
    }
  }

  const handleBackToLibrary = () => {
    navigate({ to: '/user/dashboard' })
  }

  const handlePlayPlaylist = () => {
    if (songs.length > 0) {
      // Navigate to playlist viewer
      navigate({ 
        to: '/user/playlist/view/$id', 
        params: { id }
      })
    }
  }

  const handleDeletePlaylist = async () => {
    try {
      setDeleting(true)
      await playlistService.deletePlaylist(id)
      
      toast.success('Playlist deleted successfully', {
        action: {
          label: 'x',
          onClick: () => toast.dismiss()
        }
      })
      
      // Navigate back to dashboard
      navigate({ to: '/user/dashboard' })
    } catch (error) {
      toast.error('Failed to delete playlist', {
        action: {
          label: 'x',
          onClick: () => toast.dismiss()
        }
      })
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  const getOrCreateShareLink = async (): Promise<string> => {
    // Return existing share link if available
    if (playlist?.sharable_link) {
      return playlist.sharable_link
    }
    
    // Generate new share link
    try {
      const newShareLink = await playlistService.createShareLink(id)
      return newShareLink
    } catch (_error) {
      // Fallback to manual share link
      const fallbackUrl = `${window.location.origin}/user/playlist/${id}`
      toast.error('Using fallback share link', {
        description: 'Could not generate API share link',
        action: {
          label: 'x',
          onClick: () => toast.dismiss()
        }
      })
      return fallbackUrl
    }
  }

  const handleSharePlaylist = () => {
    // Check if we have a valid share link (not empty/null)
    const existingLink = playlist?.sharable_link || shareLink
    if (existingLink && existingLink.trim() !== '') {
      setShareLink(existingLink)
      setShareDialogOpen(true)
      return
    }
    
    // If no valid share link exists, show confirmation dialog
    setConfirmDialogOpen(true)
  }

  const handleConfirmCreateShareLink = async () => {
    setConfirmDialogOpen(false)
    setShareDialogOpen(true)
    
    try {
      setGeneratingLink(true)
      const link = await getOrCreateShareLink()
      setShareLink(link)
    } finally {
      setGeneratingLink(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      if (!shareLink) {
        toast.error('No share link available')
        return
      }
      
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareLink)
      } else {
        // Fallback for older browsers or non-HTTPS
        const textArea = document.createElement('textarea')
        textArea.value = shareLink
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        textArea.remove()
      }

      setCopySuccess(true)
      toast.success('Link copied to clipboard!', {
        action: {
          label: 'x',
          onClick: () => toast.dismiss()
        }
      })

      // Reset copy success state after 2 seconds
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      toast.error('Failed to copy link', {
        action: {
          label: 'x',
          onClick: () => toast.dismiss()
        }
      })
    }
  }
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading playlist...
        </div>
      </div>
    )
  }
  
  if (!playlist) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center p-8">
          Playlist not found
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToLibrary}
            className="mr-2 p-1"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <span className="text-lg">Library</span>
        </div>
      </header>

      {/* Playlist Info */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">{playlist.name}</h1>
            <p className="text-gray-500 mt-1">
              {playlist.songCount} {playlist.songCount === 1 ? 'song' : 'songs'}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={handleSharePlaylist}
          >
            <Share className="h-4 w-4" />
            Share
          </Button>

          <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Share Playlist</DialogTitle>
                <DialogDescription>
                  Anyone with this link can view this playlist
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center space-x-2">
                <div className="grid flex-1 gap-2">
                  <Input
                    id="link"
                    value={generatingLink ? 'Generating share link...' : shareLink}
                    readOnly
                    className="h-9"
                    disabled={generatingLink}
                  />
                </div>
                <Button
                  size="sm"
                  className="px-3"
                  onClick={handleCopyLink}
                  variant={copySuccess ? "default" : "secondary"}
                  disabled={generatingLink || !shareLink}
                >
                  {generatingLink ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {generatingLink ? "Generating..." : copySuccess ? "Copied!" : "Copy"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Confirmation Dialog for creating share link */}
          <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Create Share Link?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will create a shareable link that allows anyone with the link to view this playlist. 
                  Do you want to continue?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmCreateShareLink}>
                  Create Share Link
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Members Dialog */}
      <Dialog open={membersDialogOpen} onOpenChange={setMembersDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Playlist Members
            </DialogTitle>
            <DialogDescription>
              Manage members who have access to this playlist
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {loadingMembers ? (
              <div className="text-center py-4 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                Loading members...
              </div>
            ) : !teamDetails ? (
              <div className="text-center py-4 text-gray-500">
                No team data found
              </div>
            ) : (
              <div className="space-y-3">
                {(!teamDetails.members || teamDetails.members.length === 0) ? (
                  <div className="text-center py-4 text-gray-500">
                    No members in this playlist
                  </div>
                ) : (
                  teamDetails.members.map((member: any, index: number) => (
                    <div key={`member-${member.id}-${index}`} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex-1">
                        <div className="font-medium">{member.nama || member.name || 'No name'}</div>
                        <div className="text-sm text-gray-500">{member.email || 'No email'}</div>
                      </div>
                      
                      {/* Remove Member Button - Only show for playlist owners */}
                      {playlist?.access_type === 'owner' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMemberClick(member)}
                          disabled={removingMemberId === member.id}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          {removingMemberId === member.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          
          {/* Footer with Delete Team Button - Only show for playlist owners */}
          {playlist?.access_type === 'owner' && (
            <div className="flex justify-end pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteTeamDialogOpen(true)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"
                disabled={loadingMembers}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete Team
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Team Confirmation Dialog */}
      <AlertDialog open={deleteTeamDialogOpen} onOpenChange={setDeleteTeamDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the team and remove all members from this playlist.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingTeam}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTeam}
              disabled={deletingTeam}
              className="bg-red-500 hover:bg-red-600"
            >
              {deletingTeam ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete Team'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Member Confirmation Dialog */}
      <AlertDialog open={removeMemberDialogOpen} onOpenChange={setRemoveMemberDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{memberToRemove?.nama || memberToRemove?.name}" from this playlist team? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removingMemberId === memberToRemove?.id}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRemoveMember}
              disabled={removingMemberId === memberToRemove?.id}
              className="bg-red-500 hover:bg-red-600"
            >
              {removingMemberId === memberToRemove?.id ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Removing...
                </>
              ) : (
                'Remove Member'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          className="pl-10"
          placeholder="Search in playlist"
          type="text"
        />
      </div>

      {/* Songs List */}
      <div className="space-y-2">
        {songs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No songs in this playlist
          </div>
        ) : (
          songs.map((song, index) => (
            <div
              key={song.id}
              className="flex items-center p-4 rounded-lg group"
            >
              {/* Index */}
              <div className="w-8 text-center mr-4">
                <span className="text-gray-500 text-sm">
                  {index + 1}
                </span>
              </div>

              {/* Song Info - Only title and artist */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">
                  {song.title}
                </h3>
                <p className="text-sm text-gray-600 truncate">
                  {song.artist}
                </p>
              </div>

              {/* Remove Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveSongClick(song)}
                disabled={removingIds.has(song.id)}
                className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100"
              >
                {removingIds.has(song.id) ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {/* Group/People Button - Only show if playlist has team ID */}
        {playlist?.playlist_team_id && (
          <Button
            onClick={handleMembersDialogOpen}
            className="w-12 h-12 rounded-full bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl transition-all duration-200"
            disabled={loadingTeams}
          >
            {loadingTeams ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Users className="h-4 w-4" />
            )}
          </Button>
        )}

        {/* Delete Playlist Button - Only show for playlist owners */}
        {playlist?.access_type === 'owner' && (
          <Button
            onClick={() => setDeleteDialogOpen(true)}
            className="w-12 h-12 rounded-full bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-xl transition-all duration-200"
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        )}
        
        {/* Play Button */}
        {songs.length > 0 && (
          <Button
            onClick={handlePlayPlaylist}
            className="w-12 h-12 rounded-full bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Play className="h-4 w-4 ml-0.5" />
          </Button>
        )}
      </div>

      {/* Remove Song Confirmation Dialog */}
      <AlertDialog open={removeSongDialogOpen} onOpenChange={setRemoveSongDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Song from Playlist?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{songToRemove?.title}" by {songToRemove?.artist} from this playlist?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={songToRemove ? removingIds.has(songToRemove.id) : false}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRemoveSong}
              disabled={songToRemove ? removingIds.has(songToRemove.id) : false}
              className="bg-red-500 hover:bg-red-600"
            >
              {songToRemove && removingIds.has(songToRemove.id) ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Removing...
                </>
              ) : (
                'Remove Song'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Playlist?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the playlist "{playlist?.name}" and all its contents.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePlaylist}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete Playlist'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}