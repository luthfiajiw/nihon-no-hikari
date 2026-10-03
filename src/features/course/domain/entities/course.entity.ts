export type ModuleStatus = 'locked' | 'unlocked' | 'in_progress' | 'completed'

export interface CourseLevel {
  id: string
  code: string
  name: string
}

export interface Module {
  id: string
  slug: string
  title: string
  description: string
  is_mandatory: boolean
  is_entry: boolean
  status: ModuleStatus
  estimated_minutes: number
}

export interface Course {
  id: string
  slug: string
  title: string
  description: string
  thumbnail_url?: string
  total_minutes: number
  total_lessons: number
  level: CourseLevel
}

export interface CourseDetail {
  id: string
  slug: string
  title: string
  description: string
  thumbnail_url?: string
  total_minutes: number
  total_lessons: number
  level: CourseLevel
  modules: Module[]
}

export interface ListCourseResponse {
  success: boolean
  message: string
  data: Course[]
}

export interface CourseDetailResponse {
  success: boolean
  message: string
  data: CourseDetail
}

export interface UpdateModuleProgressRequest {
  status: Extract<ModuleStatus, 'in_progress' | 'completed'>
}

export interface UpdateModuleProgressResponse {
  success: boolean
  message: string
}
