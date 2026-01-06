export interface WasteReport {
  id: string
  user_id: string
  description: string
  latitude: number
  longitude: number
  location_address?: string
  status: "open" | "resolved"
  rank?: number
  event?: string
  created_at: string
  updated_at: string

  // ui fields
  date?: string
  time?: string
  location?: string
  distance?: string
  estimatedTime?: string
}
