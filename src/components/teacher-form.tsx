"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface TeacherFormData {
  name: string
  email: string
  phone: string
  subject: string
  department: string
  experience: number
  location: string
  bio?: string
  rating: number
  studentsCount: number
  qualifications: string[]
  specializations: string[]
  hourlyRate: number // Added
}

interface TeacherFormProps {
  initialData?: Partial<TeacherFormData>
  onSubmit: (data: TeacherFormData) => void
  onCancel: () => void
  isEditing?: boolean
}

export function TeacherForm({ initialData, onSubmit, onCancel, isEditing = false }: TeacherFormProps) {
  const [formData, setFormData] = useState<TeacherFormData>({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    subject: initialData?.subject || "",
    department: initialData?.department || "",
    experience: initialData?.experience || 0,
    location: initialData?.location || "",
    bio: initialData?.bio || "",
    rating: initialData?.rating || 0,
    studentsCount: initialData?.studentsCount || 0,
    qualifications: initialData?.qualifications || [],
    specializations: initialData?.specializations || [],
    hourlyRate: initialData?.hourlyRate || 0, // Added
  })

  const [errors, setErrors] = useState<Partial<Record<keyof TeacherFormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TeacherFormData, string>> = {}

    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid"
    if (!formData.phone.trim()) newErrors.phone = "Phone is required"
    if (!formData.subject.trim()) newErrors.subject = "Subject is required"
    if (!formData.department) newErrors.department = "Department is required"
    if (formData.experience < 0) newErrors.experience = "Experience must be positive"
    if (!formData.location.trim()) newErrors.location = "Location is required"
    if (formData.rating < 0 || formData.rating > 5) newErrors.rating = "Rating must be between 0 and 5"
    if (formData.studentsCount < 0) newErrors.studentsCount = "Students count must be non-negative"
    if (formData.hourlyRate <= 0) newErrors.hourlyRate = "Hourly rate must be positive" 

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof TeacherFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleArrayInputChange = (field: "qualifications" | "specializations", value: string) => {
    const arrayValue = value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    setFormData((prev) => ({ ...prev, [field]: arrayValue }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Enter full name"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="Enter email address"
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            placeholder="Enter phone number"
            className={errors.phone ? "border-red-500" : ""}
          />
          {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="subject">Subject *</Label>
          <Input
            id="subject"
            value={formData.subject}
            onChange={(e) => handleInputChange("subject", e.target.value)}
            placeholder="Enter subject"
            className={errors.subject ? "border-red-500" : ""}
          />
          {errors.subject && <p className="text-sm text-red-500">{errors.subject}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="department">Department *</Label>
          <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)}>
            <SelectTrigger className={errors.department ? "border-red-500" : ""}>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Science">Science</SelectItem>
              <SelectItem value="Arts">Arts</SelectItem>
              <SelectItem value="Mathematics">Mathematics</SelectItem>
              <SelectItem value="Languages">Languages</SelectItem>
              <SelectItem value="Social Studies">Social Studies</SelectItem>
              <SelectItem value="Physical Education">Physical Education</SelectItem>
            </SelectContent>
          </Select>
          {errors.department && <p className="text-sm text-red-500">{errors.department}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="experience">Years of Experience *</Label>
          <Input
            id="experience"
            type="number"
            min="0"
            value={formData.experience}
            onChange={(e) => handleInputChange("experience", Number.parseInt(e.target.value) || 0)}
            placeholder="Enter years"
            className={errors.experience ? "border-red-500" : ""}
          />
          {errors.experience && <p className="text-sm text-red-500">{errors.experience}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="studentsCount">Number of Students *</Label>
          <Input
            id="studentsCount"
            type="number"
            min="0"
            value={formData.studentsCount}
            onChange={(e) => handleInputChange("studentsCount", Number.parseInt(e.target.value) || 0)}
            placeholder="Enter number of students"
            className={errors.studentsCount ? "border-red-500" : ""}
          />
          {errors.studentsCount && <p className="text-sm text-red-500">{errors.studentsCount}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="rating">Rating (0-5) *</Label>
          <Input
            id="rating"
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={formData.rating}
            onChange={(e) => handleInputChange("rating", Number.parseFloat(e.target.value) || 0)}
            placeholder="Enter rating"
            className={errors.rating ? "border-red-500" : ""}
          />
          {errors.rating && <p className="text-sm text-red-500">{errors.rating}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="hourlyRate">Hourly Rate (₹) *</Label>
        <Input
          id="hourlyRate"
          type="number"
          min="0.01"
          step="0.01"
          value={formData.hourlyRate}
          onChange={(e) => handleInputChange("hourlyRate", Number.parseFloat(e.target.value) || 0)}
          placeholder="Enter hourly rate"
          className={errors.hourlyRate ? "border-red-500" : ""}
        />
        {errors.hourlyRate && <p className="text-sm text-red-500">{errors.hourlyRate}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="qualifications">Qualifications (comma-separated)</Label>
        <Textarea
          id="qualifications"
          value={formData.qualifications.join(", ")} 
          onChange={(e) => handleArrayInputChange("qualifications", e.target.value)}
          placeholder="e.g., PhD in Math, M.Ed in Curriculum"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="specializations">Specializations (comma-separated)</Label>
        <Textarea
          id="specializations"
          value={formData.specializations.join(", ")} 
          onChange={(e) => handleArrayInputChange("specializations", e.target.value)}
          placeholder="e.g., Calculus, Statistics, Algebra"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location *</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => handleInputChange("location", e.target.value)}
          placeholder="Enter location"
          className={errors.location ? "border-red-500" : ""}
        />
        {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio (Optional)</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => handleInputChange("bio", e.target.value)}
          placeholder="Enter a brief bio..."
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : isEditing ? "Update Teacher" : "Add Teacher"}
        </Button>
      </div>
    </form>
  )
}
