"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertTriangle } from "lucide-react"

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
  hourlyRate: number // Added
}

interface DeleteTeacherModalProps {
  teacher: Teacher | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (teacherId: string) => void
}

export function DeleteTeacherModal({ teacher, isOpen, onClose, onConfirm }: DeleteTeacherModalProps) {
  if (!teacher) return null

  const handleConfirm = () => {
    onConfirm(teacher.id)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span>Delete Teacher</span>
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the teacher&apos;s record.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
            <Avatar className="w-12 h-12">
              <AvatarImage src={teacher.avatar || "/placeholder.svg"} alt={teacher.name} />
              <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                {teacher.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-slate-900">{teacher.name}</h3>
              <p className="text-sm text-slate-600">{teacher.subject}</p>
              <p className="text-sm text-slate-500">{teacher.email}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Delete Teacher
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
