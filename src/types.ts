export type MediaFile = {
  id: string
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
  mediaFileOpfsName: string
  cutStart?: number
  cutEnd?: number
}
