"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, GraduationCap, BookOpen, TrendingUp, Award, Clock } from "lucide-react"

interface StatsData {
  totalTeachers: number
  activeTeachers: number
  totalStudents: number
  avgRating: number
  avgExperience: number
  departmentCount: number
}

interface StatsDashboardProps {
  stats: StatsData
}

export function StatsDashboard({ stats }: StatsDashboardProps) {
  const statCards = [
    {
      title: "Total Teachers",
      value: stats.totalTeachers,
      icon: Users,
      color: "text-blue-600",
      change: "+2 from last month",
      changeType: "positive" as const,
    },
    {
      title: "Active Teachers",
      value: stats.activeTeachers,
      icon: GraduationCap,
      color: "text-green-600",
      change: `${((stats.activeTeachers / stats.totalTeachers) * 100).toFixed(1)}% of total`,
      changeType: "neutral" as const,
    },
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: BookOpen,
      color: "text-purple-600",
      change: `Avg ${Math.round(stats.totalStudents / stats.activeTeachers)} per teacher`,
      changeType: "neutral" as const,
    },
    {
      title: "Avg Rating",
      value: stats.avgRating.toFixed(1),
      icon: Award,
      color: "text-orange-600",
      change: "+0.2 from last quarter",
      changeType: "positive" as const,
    },
    {
      title: "Avg Experience",
      value: `${stats.avgExperience.toFixed(1)} yrs`,
      icon: Clock,
      color: "text-indigo-600",
      change: "Across all teachers",
      changeType: "neutral" as const,
    },
    {
      title: "Departments",
      value: stats.departmentCount,
      icon: TrendingUp,
      color: "text-pink-600",
      change: "Active departments",
      changeType: "neutral" as const,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index} className="bg-white shadow-sm border-0 shadow-slate-200/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            <p
              className={`text-xs mt-1 ${
                stat.changeType === "positive"
                  ? "text-green-600"
                  : stat.changeType === "negative"
                    ? "text-red-600"
                    : "text-slate-500"
              }`}
            >
              {stat.changeType === "positive" && <span className="text-green-600">↗ </span>}
              {stat.changeType === "negative" && <span className="text-red-600">↘ </span>}
              {stat.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
