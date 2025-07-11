"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TeacherForm } from "./teacher-form"

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
}

interface TeacherFormData {
  name: string
  email: string
  phone: string
  subject: string
  department: string
  experience: number
  location: string
  bio?: string
  rating: number // Added
  studentsCount: number // Added
  qualifications: string[] // Added
  specializations: string[] // Added
}

interface EditTeacherModalProps {
  teacher: Teacher | null
  isOpen: boolean
  onClose: () => void
  onSave: (teacherId: string, data: TeacherFormData) => void
}

export function EditTeacherModal({ teacher, isOpen, onClose, onSave }: EditTeacherModalProps) {
  if (!teacher) return null

  const handleSubmit = (data: TeacherFormData) => {
    onSave(teacher.id, data)
    onClose()
  }

  const initialData = {
    name: teacher.name,
    email: teacher.email,
    phone: teacher.phone,
    subject: teacher.subject,
    department: teacher.department,
    experience: teacher.experience,
    location: teacher.location,
    bio: teacher.bio || "",
    rating: teacher.rating || 0, // Added
    studentsCount: teacher.studentsCount || 0, // Added
    qualifications: teacher.qualifications || [], // Added
    specializations: teacher.specializations || [], // Added
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        {" "}
        {/* Increased max-width */}
        <DialogHeader>
          <DialogTitle>Edit Teacher</DialogTitle>
          <DialogDescription>Update teacher information</DialogDescription>
        </DialogHeader>
        <TeacherForm initialData={initialData} onSubmit={handleSubmit} onCancel={onClose} isEditing={true} />
      </DialogContent>
    </Dialog>
  )
}
