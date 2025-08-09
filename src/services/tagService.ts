export interface Tag {
  id: string
  name: string
  created_at?: string
  updated_at?: string
}

export interface TagSearchParams {
  search?: string
  limit?: number
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

interface CachedResponse<T> {
  data: T
  timestamp: number
  key: string
}

export class TagService {
  private static readonly BASE_URL = 'https://songbanks-v1-1.vercel.app/api'
  private static cache = new Map<string, CachedResponse<any>>()

  private static isExpired(cachedItem: CachedResponse<any>): boolean {
    return Date.now() - cachedItem.timestamp > CACHE_DURATION
  }

  private static getCacheKey(method: string, params?: any): string {
    return `tags_${method}:${JSON.stringify(params || {})}`
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

  private static clearCacheByPattern(pattern: string): void {
    for (const [key] of this.cache) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
  }

  public static clearAllCache(): void {
    this.cache.clear()
  }

  static async searchTags(params: TagSearchParams = {}): Promise<Tag[]> {
    const cacheKey = this.getCacheKey('searchTags', params)
    
    // Try cache first
    const cachedResult = this.getFromCache<Tag[]>(cacheKey)
    if (cachedResult) {
      return cachedResult
    }

    try {
      const url = new URL(`${this.BASE_URL}/tags`)
      
      if (params.search && params.search.trim()) {
        url.searchParams.set('search', params.search.trim())
      }
      if (params.limit) {
        url.searchParams.set('limit', params.limit.toString())
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      })

      if (!response.ok) {
        console.warn(`Tag search API request failed with status: ${response.status}`)
        return []
      }

      const result = await response.json()
      
      if (result.code === 200 && Array.isArray(result.data)) {
        const tags = result.data.map((tag: any) => ({
          id: tag.id,
          name: tag.name,
          created_at: tag.createdAt,
          updated_at: tag.updatedAt,
        }))
        
        // Cache the result
        this.setCache(cacheKey, tags)
        
        return tags
      } else {
        console.warn('Invalid tag search API response format:', result)
        return []
      }
    } catch (error) {
      console.warn('Error searching tags from API:', error)
      return []
    }
  }

  static async getOrCreateTag(name: string): Promise<Tag | null> {
    try {
      const response = await fetch(`${this.BASE_URL}/tags/get-or-create`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      })

      if (!response.ok) {
        console.warn(`Get or create tag API request failed with status: ${response.status}`)
        return null
      }

      const result = await response.json()
      
      if (result.code === 200 && result.data) {
        const tag = {
          id: result.data.id,
          name: result.data.name,
          created_at: result.data.createdAt,
          updated_at: result.data.updatedAt,
        }
        
        // Invalidate tag caches since we potentially created a new tag
        this.clearCacheByPattern('tags_')
        
        return tag
      } else {
        console.warn('Invalid get or create tag API response format:', result)
        return null
      }
    } catch (error) {
      console.warn('Error creating or getting tag from API:', error)
      return null
    }
  }

  static async getAllTags(): Promise<Tag[]> {
    return this.searchTags({ limit: 1000 })
  }
}