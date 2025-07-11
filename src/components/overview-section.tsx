"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, GraduationCap, Award, Clock, IndianRupee, CalendarDays } from "lucide-react"
import { DataManager } from "@/lib/data-manager"
import { useEffect, useState } from "react"

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

interface ScheduleSlot {
  availability: string
  scheduled_lessons: string
  meetings: string
  office_hours: string
}

interface OverviewSectionProps {
  teachers: Teacher[]
}

export function OverviewSection({ teachers }: OverviewSectionProps) {
  const [totalEngagedHours, setTotalEngagedHours] = useState(0)
  const [totalDailyPayouts, setTotalDailyPayouts] = useState(0)
  const [totalAvailableSlots, setTotalAvailableSlots] = useState(0)
  const [totalBusySlots, setTotalBusySlots] = useState(0)

  useEffect(() => {
    if (teachers.length > 0) {
      const scheduleData = DataManager.getScheduleData(teachers)
      let totalHours = 0
      let totalPayouts = 0
      let availableCount = 0
      let busyCount = 0

      teachers.forEach((teacher) => {
        const teacherSchedule = scheduleData.teacherSchedules[teacher.id]
        if (teacherSchedule) {
          Object.values(teacherSchedule.schedule).forEach((slot: ScheduleSlot) => {
            if (slot.availability === "busy") {
              busyCount++
              totalHours += 0.5 // Each busy slot is 30 minutes
              totalPayouts += 0.5 * (teacher.hourlyRate || 0)
            } else if (slot.availability === "available") {
              availableCount++
            }
          })
        }
      })

      setTotalEngagedHours(totalHours)
      setTotalDailyPayouts(totalPayouts)
      setTotalAvailableSlots(availableCount)
      setTotalBusySlots(busyCount)
    } else {
      setTotalEngagedHours(0)
      setTotalDailyPayouts(0)
      setTotalAvailableSlots(0)
      setTotalBusySlots(0)
    }
  }, [teachers])

  const activeTeachers = teachers.filter((t) => t.status === "active")
  const onLeaveTeachers = teachers.filter((t) => t.status === "on-leave")
  const totalStudents = teachers.reduce((sum, teacher) => sum + teacher.studentsCount, 0)
  const averageRating =
    teachers.length > 0 ? teachers.reduce((sum, teacher) => sum + teacher.rating, 0) / teachers.length : 0

  const departmentStats = teachers.reduce(
    (acc, teacher) => {
      acc[teacher.department] = (acc[teacher.department] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const topPerformers = [...teachers].sort((a, b) => b.rating - a.rating).slice(0, 3)
  const recentlyAdded = [...teachers]
    .sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime())
    .slice(0, 3)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "on-leave":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-600 mt-2">Key metrics and insights for your teaching staff</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white shadow-sm border-0 shadow-slate-200/50 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Teachers</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{teachers.length}</div>
            <p className="text-xs text-slate-500 mt-1">
              {activeTeachers.length} active, {onLeaveTeachers.length} on leave
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-0 shadow-slate-200/50 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Students</CardTitle>
            <GraduationCap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalStudents}</div>
            <p className="text-xs text-slate-500 mt-1">
              Avg {Math.round(totalStudents / Math.max(teachers.length, 1))} per teacher
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-0 shadow-slate-200/50 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Average Rating</CardTitle>
            <Award className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{averageRating.toFixed(1)}</div>
            <p className="text-xs text-slate-500 mt-1">Out of 5.0 stars</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-0 shadow-slate-200/50 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Daily Busy Hours</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalEngagedHours.toFixed(1)}</div>
            <p className="text-xs text-slate-500 mt-1">Total busy hours today</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white shadow-sm border-0 shadow-slate-200/50 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Daily Payouts</CardTitle>
            <IndianRupee className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">₹{totalDailyPayouts.toFixed(2)}</div>
            <p className="text-xs text-slate-500 mt-1">Total daily teacher compensation</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-0 shadow-slate-200/50 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Schedule Overview</CardTitle>
            <CalendarDays className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-2xl font-bold text-slate-900">{totalAvailableSlots}</div>
                <p className="text-xs text-slate-500 mt-1">Available Slots</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{totalBusySlots}</div>
                <p className="text-xs text-slate-500 mt-1">Busy Slots</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recently Added Teachers */}
      <Card className="bg-white shadow-sm border-0 shadow-slate-200/50">
        <CardHeader>
          <CardTitle>Recently Added Teachers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentlyAdded.length > 0 ? (
              recentlyAdded.map((teacher) => (
                <div
                  key={teacher.id}
                  className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={teacher.avatar || "/placeholder.svg"} alt={teacher.name} />
                    <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                      {teacher.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{teacher.name}</h3>
                    <p className="text-sm text-slate-600">
                      {teacher.subject} • {teacher.department}
                    </p>
                  </div>
                  <Badge className={`${getStatusColor(teacher.status)}`}>
                    {teacher.status.replace("-", " ").toUpperCase()}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-slate-500">No recently added teachers.</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Department Distribution */}
      <Card className="bg-white shadow-sm border-0 shadow-slate-200/50">
        <CardHeader>
          <CardTitle>Department Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(departmentStats).map(([department, count]) => (
              <div
                key={department}
                className="text-center p-4 bg-slate-50 rounded-lg hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className="text-2xl font-bold text-slate-900">{count}</div>
                <div className="text-sm text-slate-600">{department}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card className="bg-white shadow-sm border-0 shadow-slate-200/50">
        <CardHeader>
          <CardTitle>Top Performing Teachers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPerformers.length > 0 ? (
              topPerformers.map((teacher, index) => (
                <div
                  key={teacher.id}
                  className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold">
                    {index + 1}
                  </div>
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={teacher.avatar || "/placeholder.svg"} alt={teacher.name} />
                    <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                      {teacher.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{teacher.name}</h3>
                    <p className="text-sm text-slate-600">
                      {teacher.subject} • {teacher.department}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <Award className="w-4 h-4 text-yellow-500" />
                      <span className="font-semibold text-slate-900">{teacher.rating}</span>
                    </div>
                    <p className="text-sm text-slate-500">{teacher.studentsCount} students</p>
                  </div>
                  <Badge className={`${getStatusColor(teacher.status)}`}>
                    {teacher.status.replace("-", " ").toUpperCase()}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-slate-500">No top performing teachers found.</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-white shadow-sm border-0 shadow-slate-200/50">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-slate-600">New teacher Dr. Sarah Johnson added to Mathematics department</span>
              <span className="text-slate-400">2 hours ago</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-slate-600">Schedule updated for Prof. Michael Chen</span>
              <span className="text-slate-400">4 hours ago</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-slate-600">Payment processed for Ms. Emily Rodriguez</span>
              <span className="text-slate-400">1 day ago</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-slate-600">Dr. James Wilson marked as on leave</span>
              <span className="text-slate-400">2 days ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
