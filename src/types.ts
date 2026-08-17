export type MediaFile = {
  id: string
  name: string
  createdAt: number
  opfsName: string
  mimeType: string
}

export type Project = {
  id: string
  name: string
  clips: Clip[]
}

export type Clip = {
  id: string
  source: string
  cutStart?: number
  cutEnd?: number
}
