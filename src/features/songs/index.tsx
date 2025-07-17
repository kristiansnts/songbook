// import { Header } from '@/components/layout/header'
// import { Main } from '@/components/layout/main'
// import { ProfileDropdown } from '@/components/profile-dropdown'
// import { Search } from '@/components/search'
// import { ThemeSwitch } from '@/components/theme-switch'
// import { columns } from './components/columns'
// import { DataTable } from './components/data-table'
// import { SongsDialogs } from './components/songs-dialogs'
// import { SongsPrimaryButtons } from './components/songs-primary-buttons'
// import SongsProvider, { useSongs } from './context/songs-context'

// function SongsContent() {
//   const { songs } = useSongs()
  
//   return (
//     <>
//       <Header fixed>
//         <Search />
//         <div className='ml-auto flex items-center space-x-4'>
//           <ThemeSwitch />
//           <ProfileDropdown />
//         </div>
//       </Header>

//       <Main>
//         <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
//           <div>
//             <h2 className='text-2xl font-bold tracking-tight'>Songs</h2>
//             <p className='text-muted-foreground'>
//               Here&apos;s a list of your songs in the songbook!
//             </p>
//           </div>
//           <SongsPrimaryButtons />
//         </div>
//         <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
//           <DataTable data={songs} columns={columns} />
//         </div>
//       </Main>

//       <SongsDialogs />
//     </>
//   )
// }

// export default function Songs() {
//   return (
//     <SongsProvider>
//       <SongsContent />
//     </SongsProvider>
//   )
// }
