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
  /* ------------------------------------------------------------------ */
  /*  TEACHERS                                                          */
  /* ------------------------------------------------------------------ */
  static getTeachers(): Teacher[] {
    // During SSR we just return an empty list
    if (typeof window === "undefined") return []

    const stored = localStorage.getItem(TEACHERS_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) return parsed as Teacher[]
      } catch (err) {
        console.error("Invalid teachers data in storage – falling back to defaults:", err)
      }
    }
    
    const defaults: Teacher[] = [
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
        bio: "Passionate mathematics educator with expertise in advanced calculus and statistics.",
        qualifications: ["PhD in Mathematics", "M.Ed in Curriculum Development"],
        specializations: ["Calculus", "Statistics", "Algebra"],
        hourlyRate: 50,
        avatar: "/placeholder.svg",
      },
      
    ]
    this.saveTeachers(defaults)
    return defaults
  }

  static saveTeachers(teachers: Teacher[]) {
    if (typeof window !== "undefined") {
      localStorage.setItem(TEACHERS_KEY, JSON.stringify(teachers))
    }
  }

  static addTeacher(t: Teacher) {
    const teachers = this.getTeachers()
    teachers.push(t)
    this.saveTeachers(teachers)
  }

  static updateTeacher(id: string, data: Partial<Teacher>) {
    const teachers = this.getTeachers().map((t) => (t.id === id ? { ...t, ...data } : t))
    this.saveTeachers(teachers)
  }

  static deleteTeacher(id: string) {
    const teachers = this.getTeachers().filter((t) => t.id !== id)
    this.saveTeachers(teachers)

    
    const sched = this.getScheduleData(teachers)
    delete sched.teacherSchedules[id]
    this.saveScheduleData(sched)
  }

  /* ------------------------------------------------------------------ */
  /*  SCHEDULE                                                          */
  /* ------------------------------------------------------------------ */
  static getScheduleData(currentTeachers: Teacher[]): ScheduleData {
    if (typeof window === "undefined") {
      return { timeSlots: [], columns: [], teacherSchedules: {} }
    }

    let stored: ScheduleData | null = null
    try {
      const raw = localStorage.getItem(SCHEDULE_KEY)
      if (raw) stored = JSON.parse(raw)
    } catch (err) {
      console.error("Bad schedule in storage – rebuilding:", err)
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
      { key: "availability", label: "Availability", color: "bg-gray-50" },
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

    const schedules: Record<string, TeacherSchedule> = stored?.teacherSchedules || {}

    currentTeachers.forEach((t) => {
      if (!schedules[t.id]) {
        const newSlots: Record<string, ScheduleSlot> = {}
        timeSlots.forEach((slot) => {
          newSlots[slot] = {
            availability: "available",
            unavailability: "",
            schedule: "",
            scheduled_lessons: "",
            unscheduled_lessons: "",
            meetings: "",
            office_hours: "",
            break_time: "",
            comments: "",
            history: "",
          }
        })
        schedules[t.id] = { teacherId: t.id, teacherName: t.name, schedule: newSlots }
      } else {
        schedules[t.id].teacherName = t.name
      }
    })

    Object.keys(schedules).forEach((id) => {
      if (!currentTeachers.some((t) => t.id === id)) delete schedules[id]
    })

    const finalData: ScheduleData = { timeSlots, columns, teacherSchedules: schedules }
    this.saveScheduleData(finalData)
    return finalData
  }

  static saveScheduleData(sd: ScheduleData) {
    if (typeof window !== "undefined") {
      localStorage.setItem(SCHEDULE_KEY, JSON.stringify(sd))
    }
  }
}

export type { ScheduleData, ScheduleSlot, ScheduleColumn, TeacherSchedule }
