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

export type LibraryItem = { type: 'project'; project: Project } | { type: 'video'; video: Video }
