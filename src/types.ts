export type MediaAsset = {
  opfsName: string
  mimeType: string
  duration: number
}

export type Project = {
  id: string
  name: string
  clips: Clip[]
}

export type Clip = {
  id: string
  mediaAssetOpfsName: string
  cutStart?: number
  cutEnd?: number
}

export type LibraryItem = { type: 'project'; project: Project } | { type: 'media'; mediaAsset: MediaAsset }
