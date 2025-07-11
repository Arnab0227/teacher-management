"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Mail, Phone, MapPin, Calendar, Award, Users, BookOpen, GraduationCap, Clock, DollarSign } from "lucide-react"
import { DataManager } from "@/lib/data-manager" // Import DataManager
import { useEffect, useState } from "react"

// Ensure this Teacher interface is consistent with lib/data-manager.ts
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
  hourlyRate: number // Changed from optional to required
}

interface ScheduleSlot {
  availability: string
  scheduled_lessons: string
  meetings: string
  office_hours: string
}

interface ViewTeacherModalProps {
  teacher: Teacher | null
  isOpen: boolean
  onClose: () => void
  allTeachers: Teacher[] // Pass all teachers to access schedule data
}

export function ViewTeacherModal({ teacher, isOpen, onClose, allTeachers }: ViewTeacherModalProps) {
  const [dailyEngagedHours, setDailyEngagedHours] = useState(0)
  const [dailyEarnings, setDailyEarnings] = useState(0)

  useEffect(() => {
    if (teacher && isOpen) {
      const scheduleData = DataManager.getScheduleData(allTeachers)
      const teacherSchedule = scheduleData.teacherSchedules[teacher.id]

      if (teacherSchedule) {
        let engagedSlots = 0
        Object.values(teacherSchedule.schedule).forEach((slot: ScheduleSlot) => {
          // Count slots where the teacher is actively engaged in a lesson, meeting, or office hours
          if (slot.scheduled_lessons.trim() !== "" || slot.meetings.trim() !== "" || slot.office_hours.trim() !== "") {
            engagedSlots++
          }
        })
        // Each slot is 30 minutes, so 2 slots = 1 hour
        const hours = engagedSlots * 0.5
        setDailyEngagedHours(hours)
        const rate = teacher.hourlyRate ?? 0
        setDailyEarnings(hours * rate)
      } else {
        setDailyEngagedHours(0)
        setDailyEarnings(0)
      }
    }
  }, [teacher, isOpen, allTeachers])

  if (!teacher) return null

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        {" "}
        {/* Increased max-width */}
        <DialogHeader>
          <DialogTitle>Teacher Details</DialogTitle>
          <DialogDescription>Complete information about the selected teacher</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={teacher.avatar || "/placeholder.svg"} alt={teacher.name} />
                <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold text-lg">
                  {teacher.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{teacher.name}</h2>
                <p className="text-lg text-slate-600">{teacher.subject}</p>
                <Badge className={`mt-2 ${getStatusColor(teacher.status)}`}>
                  {teacher.status.replace("-", " ").toUpperCase()}
                </Badge>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2 text-slate-600">
                <Award className="w-4 h-4" />
                <span className="font-medium">{teacher.rating}/5.0 Rating</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600">
                <Users className="w-4 h-4" />
                <span>{teacher.studentsCount} Students</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600">
                <Clock className="w-4 h-4" />
                <span>{teacher.experience} Years Experience</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600">
                <GraduationCap className="w-4 h-4" />
                <span>{teacher.department} Department</span>
              </div>
              {/* New: Hourly Rate, Daily Engaged Hours, Daily Earnings */}
              <div className="flex items-center space-x-2 text-slate-600">
                <DollarSign className="w-4 h-4" />
                <span>₹{teacher.hourlyRate.toFixed(2)}/hour</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600">
                <Clock className="w-4 h-4" />
                <span>{dailyEngagedHours.toFixed(1)} Engaged Hours/Day</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600">
                <DollarSign className="w-4 h-4" />
                <span>₹{dailyEarnings.toFixed(2)} Daily Earnings</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="font-medium">{teacher.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-slate-500">Phone</p>
                    <p className="font-medium">{teacher.phone}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-sm text-slate-500">Location</p>
                    <p className="font-medium">{teacher.location}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-slate-500">Join Date</p>
                    <p className="font-medium">{formatDate(teacher.joinDate)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bio Section */}
          {teacher.bio && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Biography</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 leading-relaxed">{teacher.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Qualifications and Specializations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teacher.qualifications && teacher.qualifications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <BookOpen className="w-5 h-5" />
                    <span>Qualifications</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {teacher.qualifications.map((qualification, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        <span className="text-slate-700">{qualification}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {teacher.specializations && teacher.specializations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Award className="w-5 h-5" />
                    <span>Specializations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {teacher.specializations.map((specialization, index) => (
                      <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                        {specialization}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
