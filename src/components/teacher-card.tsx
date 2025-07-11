"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Mail, Phone, MapPin, Clock, Award, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"

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

interface TeacherCardProps {
  teacher: Teacher
  onEdit?: (teacher: Teacher) => void
  onDelete?: (teacherId: string) => void
  onView?: (teacher: Teacher) => void
}

export function TeacherCard({ teacher, onEdit, onDelete, onView }: TeacherCardProps) {
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
    <Card className="bg-white shadow-sm border-0 shadow-slate-200/50 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
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
              <DropdownMenuItem onClick={() => onView?.(teacher)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(teacher)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onClick={() => onDelete?.(teacher.id)}>
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
  )
}
