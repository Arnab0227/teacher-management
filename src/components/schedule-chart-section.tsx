"use client"
import { ScheduleChart } from "@/components/schedule-chart"

interface Teacher {
  id: string
  name: string
  email: string
  phone: string
  subject: string
  department: string
  experience: number
  status: "active" | "inactive" | "on-leave"
  avatar?: string
  joinDate: string
  location: string
  rating: number
  studentsCount: number
  bio?: string
  qualifications?: string[]
  specializations?: string[]
  hourlyRate: number
}

interface ScheduleChartSectionProps {
  teachers: Teacher[]
}

export function ScheduleChartSection({ teachers }: ScheduleChartSectionProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Teacher Schedule</h1>
        <p className="text-slate-600 mt-2">View and manage teacher availability and lesson schedules</p>
      </div>
      <ScheduleChart teachers={teachers} />
    </div>
  )
}
