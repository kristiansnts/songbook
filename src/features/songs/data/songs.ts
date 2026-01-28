import { SongsService } from '../services/songs-service'

// Default songs data for initial seeding
export const songs = [
  {
    id: 'SONG-8782',
    title: 'Amazing Grace',
    artist: 'John Newton',
    tags: ['hymn', 'traditional'],
    status: 'in progress',
    label: 'hymn',
    lyric: 'Amazing grace, how sweet the sound...',
    lyricAndChords:
      'G       C       G\nAmazing grace, how sweet the sound\nG        D       G\nThat saved a wretch like me',
  },
  {
    id: 'SONG-7878',
    title: 'How Great Thou Art',
    artist: 'Stuart K. Hine',
    tags: ['hymn', 'worship'],
    status: 'backlog',
    label: 'hymn',
    lyric: 'O Lord my God, when I in awesome wonder...',
    lyricAndChords:
      'C        F       C\nO Lord my God, when I in awesome wonder\nC         G        C\nConsider all the worlds thy hands have made',
  },
  {
    id: 'SONG-7839',
    title: 'Be Thou My Vision',
    artist: 'Traditional Irish',
    tags: ['traditional', 'irish'],
    status: 'todo',
    label: 'traditional',
    lyric: 'Be thou my vision, O Lord of my heart...',
    lyricAndChords:
      'D        G       D\nBe thou my vision, O Lord of my heart\nA        D       G      D\nNaught be all else to me, save that thou art',
  },
]

// Export function to get songs from localStorage or default data
export const getSongs = () => SongsService.getSongs()
