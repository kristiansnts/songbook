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

export class TagService {
  private static readonly BASE_URL = 'https://songbanks-v1-1.vercel.app/api'

  static async searchTags(params: TagSearchParams = {}): Promise<Tag[]> {
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
        console.error(`Tag search API request failed with status: ${response.status}`)
        return []
      }

      const result = await response.json()
      
      if (result.code === 200 && Array.isArray(result.data)) {
        return result.data.map((tag: any) => ({
          id: tag.id,
          name: tag.name,
          created_at: tag.createdAt,
          updated_at: tag.updatedAt,
        }))
      } else {
        console.error('Invalid tag search API response format:', result)
        return []
      }
    } catch (error) {
      console.error('Error searching tags from API:', error)
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
        console.error(`Get or create tag API request failed with status: ${response.status}`)
        return null
      }

      const result = await response.json()
      
      if (result.code === 200 && result.data) {
        return {
          id: result.data.id,
          name: result.data.name,
          created_at: result.data.createdAt,
          updated_at: result.data.updatedAt,
        }
      } else {
        console.error('Invalid get or create tag API response format:', result)
        return null
      }
    } catch (error) {
      console.error('Error creating or getting tag from API:', error)
      return null
    }
  }

  static async getAllTags(): Promise<Tag[]> {
    return this.searchTags({ limit: 1000 })
  }
}