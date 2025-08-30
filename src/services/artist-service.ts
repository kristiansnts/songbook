interface Artist {
  id: number
  name: string
}

const BASE_URL = 'https://songbanks-v1-1.vercel.app/api'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

interface CachedResponse<T> {
  data: T
  timestamp: number
  key: string
}

export class ArtistService {
  private static cache = new Map<string, CachedResponse<any>>()

  private static isExpired(cachedItem: CachedResponse<any>): boolean {
    return Date.now() - cachedItem.timestamp > CACHE_DURATION
  }

  private static getCacheKey(method: string, params?: any): string {
    return `${method}:${JSON.stringify(params || {})}`
  }

  private static getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (cached && !this.isExpired(cached)) {
      return cached.data
    }
    if (cached) {
      this.cache.delete(key) // Remove expired cache
    }
    return null
  }

  private static setCache<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      key
    })
  }

  public static clearAllCache(): void {
    this.cache.clear()
  }

  async getAllArtists(): Promise<Artist[]> {
    const cacheKey = ArtistService.getCacheKey('getAllArtists')
    
    // Try cache first
    const cachedResult = ArtistService.getFromCache<Artist[]>(cacheKey)
    if (cachedResult) {
      return cachedResult
    }

    try {
      const response = await fetch(`${BASE_URL}/artists`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch artists: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.code === 200 && Array.isArray(result.data)) {
        const artists = result.data.map((artist, index) => this.transformArtistData(artist, index))
        
        // Cache the result
        ArtistService.setCache(cacheKey, artists)
        
        return artists
      }
      
      throw new Error(`Invalid response format: ${JSON.stringify(result)}`)
    } catch (error) {
      console.warn('Error fetching artists:', error)
      throw error
    }
  }

  private transformArtistData(artist: any, index: number): Artist {
    // Handle both string format and object format
    if (typeof artist === 'string') {
      return {
        id: index + 1, // Generate ID based on index
        name: artist,
      }
    }
    return {
      id: artist.id || index + 1,
      name: artist.name || artist || 'Unknown Artist',
    }
  }
}

export const artistService = new ArtistService()