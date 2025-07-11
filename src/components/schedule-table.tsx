"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, MessageSquare } from 'lucide-react'
import { DataManager } from "@/lib/data-manager"

interface ScheduleSlot {
  status: string
  lesson: string | null
  comments: string
}

interface TeacherSchedule {
  id: string
  name: string
  schedule: Record<string, ScheduleSlot>
}

interface ScheduleData {
  timeSlots: string[]
  teachers: TeacherSchedule[]
}

export function ScheduleTable() {
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<{
    teacherId: string
    timeSlot: string
    data: ScheduleSlot
  } | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    const data = DataManager.getScheduleData()
    setScheduleData(data)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200"
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "unavailable":
        return "bg-red-100 text-red-800 border-red-200"
      case "break":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "lunch":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "office-hours":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "meeting":
        return "bg-indigo-100 text-indigo-800 border-indigo-200"
      case "research":
        return "bg-teal-100 text-teal-800 border-teal-200"
      case "on-leave":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  const getStatusLabel = (status: string) => {
    return status.replace("-", " ").toUpperCase()
  }

  const handleSlotClick = (teacherId: string, timeSlot: string, slotData: ScheduleSlot) => {
    setSelectedSlot({ teacherId, timeSlot, data: slotData })
    setIsEditModalOpen(true)
  }

  const handleSlotUpdate = (newData: ScheduleSlot) => {
    if (!selectedSlot || !scheduleData) return

    const updatedScheduleData = {
      ...scheduleData,
      teachers: scheduleData.teachers.map((teacher) =>
        teacher.id === selectedSlot.teacherId
          ? {
              ...teacher,
              schedule: {
                ...teacher.schedule,
                [selectedSlot.timeSlot]: newData,
              },
            }
          : teacher,
      ),
    }

    setScheduleData(updatedScheduleData)
    DataManager.saveScheduleData(updatedScheduleData)
    setIsEditModalOpen(false)
    setSelectedSlot(null)
  }

  if (!scheduleData) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading schedule...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white shadow-sm border-0 shadow-slate-200/50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="w-5 h-5" />
          <span>Teacher Schedule & Availability</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 bg-white border border-slate-200 p-3 text-left font-semibold text-slate-700 min-w-[120px]">
                  Time
                </th>
                {scheduleData.teachers.map((teacher) => (
                  <th
                    key={teacher.id}
                    className="border border-slate-200 p-3 text-left font-semibold text-slate-700 min-w-[200px]"
                  >
                    {teacher.name}
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
                  {scheduleData.teachers.map((teacher) => {
                    const slotData = teacher.schedule[timeSlot]
                    return (
                      <td key={`${teacher.id}-${timeSlot}`} className="border border-slate-200 p-2">
                        <div
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => handleSlotClick(teacher.id, timeSlot, slotData)}
                        >
                          <Badge className={`text-xs mb-1 ${getStatusColor(slotData.status)}`}>
                            {getStatusLabel(slotData.status)}
                          </Badge>
                          {slotData.lesson && (
                            <p className="text-xs font-medium text-slate-700 mb-1">{slotData.lesson}</p>
                          )}
                          {slotData.comments && (
                            <p className="text-xs text-slate-500 flex items-center">
                              <MessageSquare className="w-3 h-3 mr-1" />
                              {slotData.comments}
                            </p>
                          )}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-6 p-4 bg-slate-50 rounded-lg">
          <h4 className="font-semibold text-slate-700 mb-3">Status Legend</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {[
              "available",
              "scheduled",
              "unavailable",
              "break",
              "lunch",
              "office-hours",
              "meeting",
              "research",
              "on-leave",
            ].map((status) => (
              <div key={status} className="flex items-center space-x-2">
                <Badge className={`text-xs ${getStatusColor(status)}`}>{getStatusLabel(status)}</Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      {/* Edit Slot Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Schedule Slot</DialogTitle>
            <DialogDescription>
              {selectedSlot &&
                `${selectedSlot.timeSlot} - ${
                  scheduleData.teachers.find((t) => t.id === selectedSlot.teacherId)?.name
                }`}
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
  initialData: ScheduleSlot
  onSave: (data: ScheduleSlot) => void
  onCancel: () => void
}

function EditSlotForm({ initialData, onSave, onCancel }: EditSlotFormProps) {
  const [formData, setFormData] = useState<ScheduleSlot>(initialData)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="unavailable">Unavailable</SelectItem>
            <SelectItem value="break">Break</SelectItem>
            <SelectItem value="lunch">Lunch</SelectItem>
            <SelectItem value="office-hours">Office Hours</SelectItem>
            <SelectItem value="meeting">Meeting</SelectItem>
            <SelectItem value="research">Research</SelectItem>
            <SelectItem value="on-leave">On Leave</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="lesson">Lesson/Activity</Label>
        <Input
          id="lesson"
          value={formData.lesson || ""}
          onChange={(e) => setFormData({ ...formData, lesson: e.target.value || null })}
          placeholder="Enter lesson or activity"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="comments">Comments</Label>
        <Textarea
          id="comments"
          value={formData.comments}
          onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
          placeholder="Enter comments"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          type="button" 
          variant="secondary" 
          onClick={() => setFormData({
            status: "available",
            lesson: null,
            comments: ""
          })}
        >
          Reset
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          Save Changes
        </Button>
      </div>
    </form>
  )
}