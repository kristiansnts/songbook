import { User } from '@/lib/auth-manager'

export interface PlanLimits {
  maxPlaylists: number | null // null means unlimited
  maxSongsPerPlaylist: number | null // null means unlimited
  planName: string
}

/**
 * Get plan limits based on user level
 *
 * User Level < 2 (Free/Basic Plan):
 * - Playlist Limit: Maximum 3 playlists (owned + shared combined)
 * - Song Limit per Playlist: Unlimited
 *
 * User Level = 2 (Standard/Squad Plan):
 * - Playlist Limit: Maximum 25 playlists
 * - Song Limit per Playlist: Unlimited
 *
 * User Level > 2 (Premium/Core Plan):
 * - Playlist Limit: Unlimited
 * - Song Limit per Playlist: Unlimited
 *
 * Admins (pengurus):
 * - No limits enforced
 */
export function getPlanLimits(user: User | null): PlanLimits {
  if (!user) {
    // Default to free plan if no user
    return {
      maxPlaylists: 3,
      maxSongsPerPlaylist: null,
      planName: 'Free',
    }
  }

  // Admins (pengurus) have no limits
  if (user.userType === 'pengurus' || user.isAdmin) {
    return {
      maxPlaylists: null,
      maxSongsPerPlaylist: null,
      planName: 'Admin',
    }
  }

  // Regular users (peserta) - check userlevel
  if (!user.userlevel) {
    // If userlevel is missing, user may need to re-login to get updated token
    // Default to free plan for safety
    return {
      maxPlaylists: 3,
      maxSongsPerPlaylist: null,
      planName: 'Free',
    }
  }

  const userLevel = parseInt(user.userlevel)

  if (userLevel < 2) {
    return {
      maxPlaylists: 3,
      maxSongsPerPlaylist: null,
      planName: 'Free',
    }
  }

  if (userLevel === 2) {
    return {
      maxPlaylists: 25,
      maxSongsPerPlaylist: null,
      planName: 'Squad',
    }
  }

  // userLevel > 2
  return {
    maxPlaylists: null,
    maxSongsPerPlaylist: null,
    planName: 'Core',
  }
}

/**
 * Check if user can create a new playlist
 */
export function canCreatePlaylist(
  user: User | null,
  currentPlaylistCount: number
): boolean {
  const limits = getPlanLimits(user)

  if (limits.maxPlaylists === null) {
    return true // Unlimited
  }

  return currentPlaylistCount < limits.maxPlaylists
}

/**
 * Check if user can add songs to a playlist
 */
export function canAddSongsToPlaylist(
  user: User | null,
  currentSongCount: number
): boolean {
  const limits = getPlanLimits(user)

  if (limits.maxSongsPerPlaylist === null) {
    return true // Unlimited
  }

  return currentSongCount < limits.maxSongsPerPlaylist
}

/**
 * Get remaining playlists count
 */
export function getRemainingPlaylists(
  user: User | null,
  currentPlaylistCount: number
): number | null {
  const limits = getPlanLimits(user)

  if (limits.maxPlaylists === null) {
    return null // Unlimited
  }

  return Math.max(0, limits.maxPlaylists - currentPlaylistCount)
}

/**
 * Get remaining songs count for a playlist
 */
export function getRemainingSongs(
  user: User | null,
  currentSongCount: number
): number | null {
  const limits = getPlanLimits(user)

  if (limits.maxSongsPerPlaylist === null) {
    return null // Unlimited
  }

  return Math.max(0, limits.maxSongsPerPlaylist - currentSongCount)
}

/**
 * Get formatted limit message for playlists
 */
export function getPlaylistLimitMessage(
  user: User | null,
  currentCount: number
): string | null {
  const limits = getPlanLimits(user)

  if (limits.maxPlaylists === null) {
    return null
  }

  if (currentCount >= limits.maxPlaylists) {
    return `You're at your limit of ${limits.maxPlaylists} playlists`
  }

  return `${currentCount}/${limits.maxPlaylists} playlists`
}

/**
 * Get formatted limit message for songs
 */
export function getSongLimitMessage(
  user: User | null,
  currentCount: number
): string | null {
  const limits = getPlanLimits(user)

  if (limits.maxSongsPerPlaylist === null) {
    return null
  }

  if (currentCount >= limits.maxSongsPerPlaylist) {
    return `You're at your limit of ${limits.maxSongsPerPlaylist} songs`
  }

  return `${currentCount}/${limits.maxSongsPerPlaylist} songs`
}
