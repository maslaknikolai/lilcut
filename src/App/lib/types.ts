export type Video = {
  opfsName: string
  mimeType: string
  duration: number
  size: number
}

export type Project = {
  id: string
  name: string
  clips: Clip[]
}

export type Clip = {
  id: string
  videoOpfsName: string
  cutStart?: number
  cutEnd?: number
}

export const LibraryItemType = {
  Project: 'project',
  Video: 'video',
} as const

export type LibraryItemType = (typeof LibraryItemType)[keyof typeof LibraryItemType]

export type LibraryItem =
  | { type: typeof LibraryItemType.Project; project: Project }
  | { type: typeof LibraryItemType.Video; video: Video }

export type LibraryFilter = LibraryItemType | 'all'
