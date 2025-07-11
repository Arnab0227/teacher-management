"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { TeacherListSection } from "@/components/teacher-list-section"
import { ScheduleChartSection } from "@/components/schedule-chart-section"
import { PaymentPortalSection } from "@/components/payment-portal-section"
import { OverviewSection } from "@/components/overview-section"
import { DataManager } from "@/lib/data-manager"

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
  hourlyRate: number
}

export default function TeacherManagement() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [activeSection, setActiveSection] = useState("overview") 

  useEffect(() => {
    const loadTeachers = () => {
      const teachersData = DataManager.getTeachers()
      setTeachers(teachersData)
    }
    loadTeachers()
  }, [])

  const handleAddTeacher = (data: TeacherFormData) => {
    const newTeacher: Teacher = {
      id: Date.now().toString(),
      ...data,
      status: "active", // Default status
      joinDate: new Date().toISOString().split("T")[0],
      avatar: "/placeholder.svg", // Default avatar
    }

    DataManager.addTeacher(newTeacher)
    setTeachers(DataManager.getTeachers()) 
  }

  const handleEditTeacher = (teacherId: string, data: TeacherFormData) => {
    DataManager.updateTeacher(teacherId, data)
    setTeachers(DataManager.getTeachers()) 
  }

  const handleDeleteTeacher = (teacherId: string) => {
    DataManager.deleteTeacher(teacherId)
    setTeachers(DataManager.getTeachers()) 
  }

  return (
    <DashboardLayout activeSection={activeSection} onSectionChange={setActiveSection}>
      {activeSection === "overview" && (
        <OverviewSection teachers={teachers} /> 
      )}
      {activeSection === "teachers" && (
        <TeacherListSection
          teachers={teachers}
          onAddTeacher={handleAddTeacher}
          onEditTeacher={handleEditTeacher}
          onDeleteTeacher={handleDeleteTeacher}
        />
      )}
      {activeSection === "schedule" && <ScheduleChartSection teachers={teachers} />}
      {activeSection === "payment" && <PaymentPortalSection teachers={teachers} />}
    </DashboardLayout>
  )
}
