"use client"

import type React from "react"

import { DialogTrigger } from "@/components/ui/dialog"
import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Search, Plus, Mail, Phone, MapPin, Award, Clock, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { TeacherForm } from "@/components/teacher-form"
import { ViewTeacherModal } from "@/components/view-teacher-modal"
import { EditTeacherModal } from "@/components/edit-teacher-modal"
import { DeleteTeacherModal } from "@/components/delete-teacher-modal"

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

interface TeacherListSectionProps {
  teachers: Teacher[]
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>
  onAddTeacher: (data: TeacherFormData) => void
  onEditTeacher: (teacherId: string, data: TeacherFormData) => void
  onDeleteTeacher: (teacherId: string) => void
}

export function TeacherListSection({
  teachers,
  setTeachers,
  onAddTeacher,
  onEditTeacher,
  onDeleteTeacher,
}: TeacherListSectionProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDepartment, setFilterDepartment] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = filterDepartment === "all" || teacher.department === filterDepartment
    const matchesStatus = filterStatus === "all" || teacher.status === filterStatus

    return matchesSearch && matchesDepartment && matchesStatus
  })

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

  const handleViewTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher)
    setIsViewModalOpen(true)
  }

  const handleEditClick = (teacher: Teacher) => {
    setSelectedTeacher(teacher)
    setIsEditModalOpen(true)
  }

  const handleDeleteClick = (teacher: Teacher) => {
    setSelectedTeacher(teacher)
    setIsDeleteModalOpen(true)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Teacher List</h1>
          <p className="text-slate-600 mt-2">View and manage all teachers in the system</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              Add Teacher
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Teacher</DialogTitle>
              <DialogDescription>Fill in the details to add a new teacher to the system.</DialogDescription>
            </DialogHeader>
            <TeacherForm onSubmit={onAddTeacher} onCancel={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white shadow-sm border-0 shadow-slate-200/50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search teachers by name, email, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="Science">Science</SelectItem>
                <SelectItem value="Arts">Arts</SelectItem>
                <SelectItem value="Mathematics">Mathematics</SelectItem>
                <SelectItem value="Social Studies">Social Studies</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="on-leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTeachers.map((teacher) => (
          <Card
            key={teacher.id}
            className="bg-white shadow-sm border-0 shadow-slate-200/50 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
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
                    <h3 className="font-semibold text-slate-900 text-sm">{teacher.name}</h3>
                    <p className="text-xs text-slate-500">{teacher.subject}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewTeacher(teacher)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEditClick(teacher)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteClick(teacher)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={`text-xs ${getStatusColor(teacher.status)}`}>
                  {teacher.status.replace("-", " ").toUpperCase()}
                </Badge>
                <div className="flex items-center space-x-1">
                  <Award className="w-3 h-3 text-yellow-500" />
                  <span className="text-xs font-medium text-slate-600">{teacher.rating}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center space-x-2">
                  <Mail className="w-3 h-3" />
                  <span className="truncate">{teacher.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-3 h-3" />
                  <span>{teacher.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3 h-3" />
                  <span>{teacher.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-3 h-3" />
                  <span>{teacher.experience} years exp.</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Students</span>
                  <span className="font-medium text-slate-700">{teacher.studentsCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {filteredTeachers.length === 0 && (
        <Card className="bg-white shadow-sm border-0 shadow-slate-200/50">
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No teachers found</h3>
            <p className="text-slate-500">Try adjusting your search or filter criteria.</p>
          </CardContent>
        </Card>
      )}

      <ViewTeacherModal
        teacher={selectedTeacher}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedTeacher(null)
        }}
        allTeachers={teachers}
      />
      <EditTeacherModal
        teacher={selectedTeacher}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedTeacher(null)
        }}
        onSave={onEditTeacher}
      />
      <DeleteTeacherModal
        teacher={selectedTeacher}
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedTeacher(null)
        }}
        onConfirm={onDeleteTeacher}
      />
    </div>
  )
}
