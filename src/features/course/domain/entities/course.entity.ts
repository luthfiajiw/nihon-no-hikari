export interface CourseLevel {
  id: string
  code: string
  name: string
}

export interface Course {
  id: string
  slug: string
  title: string
  description: string
  thumbnail_url?: string
  total_hours: number
  total_lessons: number
  level: CourseLevel
}

export interface ListCourseResponse {
  success: boolean
  message: string
  data: Course[]
}