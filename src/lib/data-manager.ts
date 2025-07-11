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

const TEACHERS_KEY = "teachers_data"
const SCHEDULE_KEY = "schedule_data"

export class DataManager {
  static getTeachers(): Teacher[] {
    if (typeof window === "undefined") return []

    const stored = localStorage.getItem(TEACHERS_KEY)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (e) {
        console.error("Error parsing stored teachers data:", e)
        // Fallback to default if parsing fails
      }
    }

    const defaultTeachers: Teacher[] = [
      {
        id: "1",
        name: "Dr. Sarah Johnson",
        email: "sarah.johnson@school.edu",
        phone: "+1 (555) 123-4567",
        subject: "Mathematics",
        department: "Science",
        experience: 8,
        status: "active",
        joinDate: "2019-08-15",
        location: "New York, NY",
        rating: 4.8,
        studentsCount: 120,
        bio: "Passionate mathematics educator with expertise in advanced calculus and statistics. Committed to making complex mathematical concepts accessible to all students.",
        qualifications: ["PhD in Mathematics", "M.Ed in Curriculum Development"],
        specializations: ["Calculus", "Statistics", "Algebra"],
      },
      {
        id: "2",
        name: "Prof. Michael Chen",
        email: "michael.chen@school.edu",
        phone: "+1 (555) 234-5678",
        subject: "Physics",
        department: "Science",
        experience: 12,
        status: "active",
        joinDate: "2015-09-01",
        location: "California, CA",
        rating: 4.9,
        studentsCount: 95,
        bio: "Experienced physics professor specializing in quantum mechanics and thermodynamics. Published researcher with over 50 academic papers.",
        qualifications: ["PhD in Physics", "M.S. in Applied Physics"],
        specializations: ["Quantum Mechanics", "Thermodynamics", "Electromagnetism"],
      },
      {
        id: "3",
        name: "Ms. Emily Rodriguez",
        email: "emily.rodriguez@school.edu",
        phone: "+1 (555) 345-6789",
        subject: "English Literature",
        department: "Arts",
        experience: 6,
        status: "on-leave",
        joinDate: "2020-01-20",
        location: "Texas, TX",
        rating: 4.7,
        studentsCount: 85,
        bio: "Creative writing enthusiast and literature expert. Focuses on contemporary fiction and poetry analysis.",
        qualifications: ["M.A. in English Literature", "B.A. in Creative Writing"],
        specializations: ["Contemporary Fiction", "Poetry", "Creative Writing"],
      },
      {
        id: "4",
        name: "Dr. James Wilson",
        email: "james.wilson@school.edu",
        phone: "+1 (555) 456-7890",
        subject: "Chemistry",
        department: "Science",
        experience: 15,
        status: "active",
        joinDate: "2012-03-10",
        location: "Florida, FL",
        rating: 4.6,
        studentsCount: 110,
        bio: "Organic chemistry specialist with extensive laboratory experience. Mentor for science fair competitions.",
        qualifications: ["PhD in Chemistry", "M.S. in Organic Chemistry"],
        specializations: ["Organic Chemistry", "Biochemistry", "Laboratory Techniques"],
      },
      {
        id: "5",
        name: "Mrs. Lisa Thompson",
        email: "lisa.thompson@school.edu",
        phone: "+1 (555) 567-8901",
        subject: "History",
        department: "Social Studies",
        experience: 10,
        status: "active",
        joinDate: "2017-08-25",
        location: "Illinois, IL",
        rating: 4.5,
        studentsCount: 105,
        bio: "World history expert with focus on ancient civilizations and modern political movements.",
        qualifications: ["M.A. in History", "B.A. in Political Science"],
        specializations: ["Ancient History", "World Wars", "Political Movements"],
      },
    ]

    this.saveTeachers(defaultTeachers)
    return defaultTeachers
  }

  static saveTeachers(teachers: Teacher[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem(TEACHERS_KEY, JSON.stringify(teachers))
  }

  static addTeacher(teacher: Teacher): void {
    const teachers = this.getTeachers()
    teachers.push(teacher)
    this.saveTeachers(teachers)
    // Also update schedule data to include the new teacher
    this.getScheduleData(teachers)
  }

  static updateTeacher(teacherId: string, updatedData: Partial<Teacher>): void {
    const teachers = this.getTeachers()
    const index = teachers.findIndex((t) => t.id === teacherId)
    if (index !== -1) {
      teachers[index] = { ...teachers[index], ...updatedData }
      this.saveTeachers(teachers)
      // Also update schedule data if teacher status or name changes
      this.getScheduleData(teachers)
    }
  }

  static deleteTeacher(teacherId: string): void {
    const teachers = this.getTeachers()
    const filteredTeachers = teachers.filter((t) => t.id !== teacherId)
    this.saveTeachers(filteredTeachers)

    // Also remove the teacher's schedule
    const currentScheduleData = this.getScheduleData(filteredTeachers)
    if (currentScheduleData) {
      const updatedTeacherSchedules = { ...currentScheduleData.teacherSchedules }
      delete updatedTeacherSchedules[teacherId]
      const newScheduleData = {
        ...currentScheduleData,
        teacherSchedules: updatedTeacherSchedules,
      }
      this.saveScheduleData(newScheduleData)
    }
  }

  static getScheduleData(currentTeachers: Teacher[]): ScheduleData {
    if (typeof window === "undefined") {
      // Return a default empty structure for SSR to prevent errors
      return {
        timeSlots: [],
        columns: [],
        teacherSchedules: {},
      }
    }

    let storedSchedule: ScheduleData | null = null
    try {
      const stored = localStorage.getItem(SCHEDULE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Validate the structure
        if (parsed.timeSlots && parsed.columns && parsed.teacherSchedules) {
          storedSchedule = parsed
        }
      }
    } catch (error) {
      console.error("Error parsing stored schedule data:", error)
    }

    const timeSlots = [
      "08:00",
      "08:30",
      "09:00",
      "09:30",
      "10:00",
      "10:30",
      "11:00",
      "11:30",
      "12:00",
      "12:30",
      "13:00",
      "13:30",
      "14:00",
      "14:30",
      "15:00",
      "15:30",
      "16:00",
      "16:30",
      "17:00",
      "17:30",
    ]

    const columns: ScheduleColumn[] = [
      { key: "availability", label: "Availability", color: "bg-green-50" },
      { key: "unavailability", label: "Unavailability", color: "bg-red-50" },
      { key: "schedule", label: "Schedule", color: "bg-blue-50" },
      { key: "scheduled_lessons", label: "Scheduled Lessons", color: "bg-purple-50" },
      { key: "unscheduled_lessons", label: "Unscheduled Lessons", color: "bg-yellow-50" },
      { key: "meetings", label: "Meetings", color: "bg-indigo-50" },
      { key: "office_hours", label: "Office Hours", color: "bg-teal-50" },
      { key: "break_time", label: "Break Time", color: "bg-orange-50" },
      { key: "comments", label: "Comments", color: "bg-gray-50" },
      { key: "history", label: "History", color: "bg-pink-50" },
    ]

    const teacherSchedules: Record<string, TeacherSchedule> = storedSchedule?.teacherSchedules || {}

    // Ensure all current teachers have a schedule entry
    currentTeachers.forEach((teacher) => {
      if (!teacherSchedules[teacher.id]) {
        teacherSchedules[teacher.id] = {
          teacherId: teacher.id,
          teacherName: teacher.name,
          schedule: {},
        }
        timeSlots.forEach((timeSlot) => {
          teacherSchedules[teacher.id].schedule[timeSlot] = {
            availability: teacher.status === "active" ? "available" : "unavailable",
            unavailability: teacher.status !== "active" ? "On Leave" : "",
            schedule: "Free Period",
            scheduled_lessons: "",
            unscheduled_lessons: "",
            meetings: "",
            office_hours: "",
            break_time: "",
            comments: "",
            history: "",
          }
        })
      } else {
        // Update teacher name and status in existing schedule if they changed
        teacherSchedules[teacher.id].teacherName = teacher.name
        // Optionally update availability based on current teacher status if it's a default slot
        timeSlots.forEach((timeSlot) => {
          const slot = teacherSchedules[teacher.id].schedule[timeSlot]
          if (slot && (slot.availability === "available" || slot.availability === "unavailable")) {
            slot.availability = teacher.status === "active" ? "available" : "unavailable"
            if (teacher.status !== "active") {
              slot.unavailability = "On Leave"
            } else {
              slot.unavailability = ""
            }
          }
        })
      }
    })

    // Remove schedules for teachers who no longer exist
    Object.keys(teacherSchedules).forEach((teacherId) => {
      if (!currentTeachers.some((t) => t.id === teacherId)) {
        delete teacherSchedules[teacherId]
      }
    })

    const finalScheduleData: ScheduleData = {
      timeSlots,
      columns,
      teacherSchedules,
    }

    this.saveScheduleData(finalScheduleData)
    return finalScheduleData
  }

  static saveScheduleData(scheduleData: ScheduleData): void {
    if (typeof window === "undefined") return
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(scheduleData))
  }
}
