export interface MuxAsset {
  id: string
  status: string
  playback_ids?: Array<{
    id: string
    policy: string
  }>
  created_at: string
  duration?: number
  title?: string
  description?: string
}
