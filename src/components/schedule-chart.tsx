"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, User, ChevronLeft, ChevronRight, Edit3, Calendar } from "lucide-react"
import { DataManager } from "@/lib/data-manager"

interface ScheduleSlot {
  availability: string
  unavailability: string
  schedule: string
  scheduled_lessons: string
  unscheduled_lessons: string
  meetings: string
  office_hours: string
  break_time: string
  comments: string
  history: string
}

interface TeacherSchedule {
  teacherId: string
  teacherName: string
  schedule: Record<string, ScheduleSlot>
}

interface ScheduleColumn {
  key: keyof ScheduleSlot
  label: string
  color: string
}

interface ScheduleData {
  timeSlots: string[]
  columns: ScheduleColumn[]
  teacherSchedules: Record<string, TeacherSchedule>
}

interface Teacher {
  // Re-defining Teacher interface for clarity within this component
  id: string
  name: string
  email: string
  subject: string
  status: "active" | "inactive" | "on-leave"
}

interface ScheduleChartProps {
  teachers: Teacher[] // Receive teachers as a prop
}

export function ScheduleChart({ teachers }: ScheduleChartProps) {
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null)
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("")
  const [selectedSlot, setSelectedSlot] = useState<{
    timeSlot: string
    column: string
    data: string
  } | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    const loadSchedule = () => {
      try {
        // Ensure DataManager.getScheduleData is called with the latest teachers
        const data = DataManager.getScheduleData(teachers)
        setScheduleData(data)

        // Set initial selected teacher if not already set or if current teacher is removed
        if (teachers.length > 0 && (!selectedTeacherId || !teachers.some((t) => t.id === selectedTeacherId))) {
          setSelectedTeacherId(teachers[0].id)
        } else if (teachers.length === 0) {
          setSelectedTeacherId("")
        }
      } catch (error) {
        console.error("Error loading schedule data:", error)
      }
    }

    loadSchedule()
  }, [teachers, selectedTeacherId]) // Depend on teachers prop and selectedTeacherId

  // Add validation for current teacher and schedule
  const currentTeacher = teachers.find((t) => t.id === selectedTeacherId)
  const currentSchedule = scheduleData?.teacherSchedules?.[selectedTeacherId]

  const handleSlotClick = (timeSlot: string, column: keyof ScheduleSlot, data: string) => {
    setSelectedSlot({ timeSlot, column: column as string, data }) // Cast column to string
    setIsEditModalOpen(true)
  }

  const handleSlotUpdate = (newData: string) => {
    if (!selectedSlot || !scheduleData || !currentSchedule) return

    const updatedSchedule = {
      ...currentSchedule,
      schedule: {
        ...currentSchedule.schedule,
        [selectedSlot.timeSlot]: {
          ...currentSchedule.schedule[selectedSlot.timeSlot],
          [selectedSlot.column]: newData,
        },
      },
    }

    const updatedScheduleData = {
      ...scheduleData,
      teacherSchedules: {
        ...scheduleData.teacherSchedules,
        [selectedTeacherId]: updatedSchedule,
      },
    }

    setScheduleData(updatedScheduleData)
    DataManager.saveScheduleData(updatedScheduleData)
    setIsEditModalOpen(false)
    setSelectedSlot(null)
  }

  const getNextTeacher = () => {
    const currentIndex = teachers.findIndex((t) => t.id === selectedTeacherId)
    const nextIndex = (currentIndex + 1) % teachers.length
    setSelectedTeacherId(teachers[nextIndex].id)
  }

  const getPrevTeacher = () => {
    const currentIndex = teachers.findIndex((t) => t.id === selectedTeacherId)
    const prevIndex = currentIndex === 0 ? teachers.length - 1 : currentIndex - 1
    setSelectedTeacherId(teachers[prevIndex].id)
  }

  const getCellContent = (timeSlot: string, column: ScheduleColumn) => {
    // Safely access nested properties
    const slotData = currentSchedule?.schedule?.[timeSlot]
    if (!slotData) return ""
    return slotData[column.key] || ""
  }

  const getCellColor = (content: string, column: ScheduleColumn) => {
    if (!content.trim()) return "bg-white"

    // Color coding based on content type
    if (column.key === "availability") {
      if (content.toLowerCase().includes("available")) return "bg-green-100 text-green-800"
      if (content.toLowerCase().includes("busy")) return "bg-red-100 text-red-800"
    }
    if (column.key === "scheduled_lessons" && content) return "bg-blue-100 text-blue-800"
    if (column.key === "meetings" && content) return "bg-purple-100 text-purple-800"
    if (column.key === "break_time" && content) return "bg-orange-100 text-orange-800"
    if (column.key === "office_hours" && content) return "bg-teal-100 text-teal-800"

    return column.color
  }

  // Don’t render the chart until every piece of data we need is present
  if (
    !scheduleData ||
    !Array.isArray(scheduleData.columns) ||
    !Array.isArray(scheduleData.timeSlots) ||
    !currentSchedule ||
    teachers.length === 0
  ) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading schedule chart...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white shadow-sm border-0 shadow-slate-200/50">
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Teacher Schedule Chart</span>
          </CardTitle>

          {/* Teacher Switcher and Dropdown */}
          <div className="flex flex-wrap items-center gap-4 md:flex-nowrap">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={getPrevTeacher} disabled={teachers.length <= 1}>
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-lg">
                <User className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-900">{currentTeacher?.name || "Unknown Teacher"}</span>
                <Badge variant="secondary" className="text-xs">
                  {currentTeacher?.subject}
                </Badge>
              </div>

              <Button variant="outline" size="sm" onClick={getNextTeacher} disabled={teachers.length <= 1}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            {/* Single dropdown, its position will be controlled by the parent's flex-wrap */}
            <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId} className="w-48">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.name} - {teacher.subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Desktop View */}
        <div className="hidden lg:block">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-200">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-slate-100 border border-slate-200 p-3 text-left font-semibold text-slate-700 min-w-[100px]">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>Time</span>
                    </div>
                  </th>
                  {scheduleData.columns.map((column) => (
                    <th
                      key={column.key}
                      className="border border-slate-200 p-3 text-left font-semibold text-slate-700 min-w-[150px]"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scheduleData.timeSlots.map((timeSlot) => (
                  <tr key={timeSlot} className="hover:bg-slate-50">
                    <td className="sticky left-0 bg-white border border-slate-200 p-3 font-medium text-slate-600">
                      {timeSlot}
                    </td>
                    {scheduleData.columns.map((column) => {
                      const content = getCellContent(timeSlot, column)
                      return (
                        <td key={`${timeSlot}-${column.key}`} className="border border-slate-200 p-2">
                          <div
                            className={`cursor-pointer hover:opacity-80 transition-opacity p-2 rounded min-h-[40px] ${getCellColor(content, column)}`}
                            onClick={() => handleSlotClick(timeSlot, column.key, content)}
                          >
                            {content && (
                              <div className="text-xs">
                                {content.length > 50 ? `${content.substring(0, 50)}...` : content}
                              </div>
                            )}
                            {!content && <div className="text-xs text-slate-400 italic">Click to add</div>}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden space-y-4">
          {scheduleData.timeSlots.map((timeSlot) => (
            <Card key={timeSlot} className="border border-slate-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-slate-700">{timeSlot}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {currentTeacher?.name}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {scheduleData.columns.map((column) => {
                  const content = getCellContent(timeSlot, column)
                  if (!content.trim()) return null

                  return (
                    <div
                      key={column.key}
                      className={`p-3 rounded-lg cursor-pointer hover:opacity-80 transition-opacity ${getCellColor(content, column)}`}
                      onClick={() => handleSlotClick(timeSlot, column.key, content)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-xs font-medium text-slate-600 mb-1">{column.label}</div>
                          <div className="text-sm">{content}</div>
                        </div>
                        <Edit3 className="w-3 h-3 text-slate-400" />
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Statistics */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-900">
              {
                scheduleData.timeSlots.filter((slot) =>
                  getCellContent(slot, { key: "scheduled_lessons" } as ScheduleColumn),
                ).length
              }
            </div>
            <div className="text-xs text-blue-600">Scheduled Classes</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-900">
              {
                scheduleData.timeSlots.filter((slot) =>
                  getCellContent(slot, { key: "availability" } as ScheduleColumn)
                    .toLowerCase()
                    .includes("available"),
                ).length
              }
            </div>
            <div className="text-xs text-green-600">Available Slots</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-lg font-bold text-purple-900">
              {
                scheduleData.timeSlots.filter((slot) => getCellContent(slot, { key: "meetings" } as ScheduleColumn))
                  .length
              }
            </div>
            <div className="text-xs text-purple-600">Meetings</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-lg font-bold text-orange-900">
              {
                scheduleData.timeSlots.filter((slot) => getCellContent(slot, { key: "break_time" } as ScheduleColumn))
                  .length
              }
            </div>
            <div className="text-xs text-orange-600">Break Times</div>
          </div>
        </div>
      </CardContent>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Schedule Entry</DialogTitle>
            <DialogDescription>
              {selectedSlot && `${selectedSlot.timeSlot} - ${selectedSlot.column.replace("_", " ").toUpperCase()}`}
            </DialogDescription>
          </DialogHeader>
          {selectedSlot && (
            <EditSlotForm
              initialData={selectedSlot.data}
              onSave={handleSlotUpdate}
              onCancel={() => setIsEditModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}

interface EditSlotFormProps {
  initialData: string
  onSave: (data: string) => void
  onCancel: () => void
}

function EditSlotForm({ initialData, onSave, onCancel }: EditSlotFormProps) {
  const [formData, setFormData] = useState(initialData)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={formData}
          onChange={(e) => setFormData(e.target.value)}
          placeholder="Enter content for this time slot..."
          rows={4}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          Save Changes
        </Button>
      </div>
    </form>
  )
}
