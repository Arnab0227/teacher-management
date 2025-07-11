"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, XCircle, Loader2, BarChart3, Banknote, Calculator } from "lucide-react"
import { DataManager } from "@/lib/data-manager"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

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
  scheduled_lessons: string
  meetings: string
  office_hours: string
}

interface PayoutFormData {
  teacherId: string
  payoutAmount: number
  paymentMethod: "upi" | "bank_transfer"
  upiId?: string
  bankAccountNumber?: string
  ifscCode?: string
  remarks: string
}

interface TeacherCalculation {
  name: string
  busySlots: string[]
  busyHours: number
  hourlyRate: number
  totalPayout: number
}

interface PaymentPortalSectionProps {
  teachers: Teacher[]
}

export function PaymentPortalSection({ teachers }: PaymentPortalSectionProps) {
  const [payoutFormData, setPayoutFormData] = useState<Partial<PayoutFormData>>({
    teacherId: "",
    paymentMethod: "upi",
    remarks: "",
  })
  const [payoutErrors, setPayoutErrors] = useState<Partial<Record<keyof PayoutFormData, string>>>({})
  const [isPayoutSubmitting, setIsPayoutSubmitting] = useState(false)
  const [payoutStatus, setPayoutStatus] = useState<"success" | "error" | null>(null)
  const [payoutMessage, setPayoutMessage] = useState<string | null>(null)
  const [teacherEngagementData, setTeacherEngagementData] = useState<
    { name: string; busyHours: number; payout: number }[]
  >([])
  const [detailedCalculations, setDetailedCalculations] = useState<TeacherCalculation[]>([])
  const [isCalculationModalOpen, setIsCalculationModalOpen] = useState(false)

  const selectedTeacher = teachers.find((t) => t.id === payoutFormData.teacherId)

  useEffect(() => {
    if (teachers.length > 0) {
      const scheduleData = DataManager.getScheduleData(teachers)
      const engagementStats: { name: string; busyHours: number; payout: number }[] = []
      const calculations: TeacherCalculation[] = []

      teachers.forEach((teacher) => {
        const teacherSchedule = scheduleData.teacherSchedules[teacher.id]
        const busySlots: string[] = []

        if (teacherSchedule) {
          Object.entries(teacherSchedule.schedule).forEach(([timeSlot, slot]: [string, ScheduleSlot]) => {
            // Count only slots marked as "busy"
            if (slot.availability === "busy") {
              busySlots.push(timeSlot)
            }
          })
        }

        const busyHours = busySlots.length * 0.5 // Each slot is 30 minutes
        const safeHourly = typeof teacher.hourlyRate === "number" ? teacher.hourlyRate : 0
        const payout = busyHours * safeHourly

        engagementStats.push({ name: teacher.name, busyHours, payout })
        calculations.push({
          name: teacher.name,
          busySlots,
          busyHours,
          hourlyRate: safeHourly,
          totalPayout: payout,
        })
      })

      setTeacherEngagementData(engagementStats)
      setDetailedCalculations(calculations)

      // Set default selected teacher for payout form if not already set
      if (!payoutFormData.teacherId && teachers.length > 0) {
        const firstTeacher = teachers[0]
        const firstTeacherPayout = engagementStats.find((t) => t.name === firstTeacher.name)?.payout || 0 // Find payout from calculated stats
        setPayoutFormData((prev) => ({
          ...prev,
          teacherId: firstTeacher.id,
          payoutAmount: firstTeacherPayout, 
        }))
      }
    }
  }, [teachers, payoutFormData.teacherId]) 

  const validatePayoutForm = (): boolean => {
    const newErrors: Partial<Record<keyof PayoutFormData, string>> = {}

    if (!payoutFormData.teacherId) {
      newErrors.teacherId = "Please select a teacher"
    }
    if (payoutFormData.payoutAmount === undefined || payoutFormData.payoutAmount <= 0) {
      newErrors.payoutAmount = "Payout amount must be greater than 0"
    }

    if (payoutFormData.paymentMethod === "upi") {
      if (!payoutFormData.upiId?.trim()) {
        newErrors.upiId = "UPI ID is required"
      } else if (!/^[a-zA-Z0-9.-]+@[a-zA-Z0-9]+$/.test(payoutFormData.upiId)) {
        newErrors.upiId = "Invalid UPI ID format (e.g., example@bank)"
      }
    } else if (payoutFormData.paymentMethod === "bank_transfer") {
      if (!payoutFormData.bankAccountNumber?.trim()) {
        newErrors.bankAccountNumber = "Bank Account Number is required"
      }
      if (!payoutFormData.ifscCode?.trim()) {
        newErrors.ifscCode = "IFSC Code is required"
      }
    }

    setPayoutErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePayoutChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setPayoutFormData((prev) => ({
      ...prev,
      [id]: id === "payoutAmount" ? Number.parseFloat(value) || 0 : value,
    }))
    if (payoutErrors[id as keyof PayoutFormData]) {
      setPayoutErrors((prev) => ({ ...prev, [id as keyof PayoutFormData]: undefined }))
    }
    setPayoutStatus(null)
    setPayoutMessage(null)
  }

  const handlePayoutSelectChange = (field: keyof PayoutFormData, value: string) => {
    setPayoutFormData((prev) => ({ ...prev, [field]: value }))
    if (payoutErrors[field]) {
      setPayoutErrors((prev) => ({ ...prev, [field]: undefined }))
    }
    setPayoutStatus(null)
    setPayoutMessage(null)
  }

  const handlePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPayoutStatus(null)
    setPayoutMessage(null)

    if (!validatePayoutForm()) {
      return
    }

    setIsPayoutSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      if (Math.random() > 0.1) {
        setPayoutStatus("success")
        setPayoutMessage(
          `Payout of ₹${payoutFormData.payoutAmount?.toFixed(2)} to ${selectedTeacher?.name} successful!`,
        )
        setPayoutFormData((prev) => ({
          teacherId: prev.teacherId,
          paymentMethod: "upi",
          remarks: "",
          upiId: "",
          bankAccountNumber: "",
          ifscCode: "",
        }))
      } else {
        setPayoutStatus("error")
        setPayoutMessage("Payout failed. Please try again.")
      }
    } catch (err) {
      setPayoutStatus("error")
      setPayoutMessage("An unexpected error occurred.")
      console.error("Payout error:", err)
    } finally {
      setIsPayoutSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Payment Portal</h1>
          <p className="text-slate-600 mt-2">Manage teacher payouts based on busy hours</p>
        </div>
        <Dialog open={isCalculationModalOpen} onOpenChange={setIsCalculationModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
              <Calculator className="w-4 h-4" />
              <span>View Detailed Calculations</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detailed Payment Calculations</DialogTitle>
              <DialogDescription>Breakdown of busy hours and payment calculations for each teacher</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {detailedCalculations.map((calc, index) => (
                <Card key={index} className="border">
                  <CardHeader>
                    <CardTitle className="text-lg">{calc.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-slate-600">Busy Slots:</span>
                        <div className="font-semibold">{calc.busySlots.length}</div>
                      </div>
                      <div>
                        <span className="text-slate-600">Busy Hours:</span>
                        <div className="font-semibold">{calc.busyHours.toFixed(1)}h</div>
                      </div>
                      <div>
                        <span className="text-slate-600">Hourly Rate:</span>
                        <div className="font-semibold">₹{calc.hourlyRate.toFixed(2)}</div>
                      </div>
                      <div>
                        <span className="text-slate-600">Total Payout:</span>
                        <div className="font-semibold text-green-600">₹{calc.totalPayout.toFixed(2)}</div>
                      </div>
                    </div>
                    {calc.busySlots.length > 0 && (
                      <div>
                        <span className="text-slate-600 text-sm">Busy Time Slots:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {calc.busySlots.map((slot, i) => (
                            <span key={i} className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                              {slot}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded">
                      <strong>Calculation:</strong> {calc.busySlots.length} slots × 0.5 hours × ₹
                      {calc.hourlyRate.toFixed(2)} = ₹{calc.totalPayout.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white shadow-sm border-0 shadow-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Daily Teacher Busy Hours & Payouts</span>
          </CardTitle>
          <CardDescription>
            Daily busy hours and calculated payouts per teacher (only counting &quot;busy&quot; slots).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {teacherEngagementData.length > 0 ? (
            <ChartContainer
              config={{
                busyHours: {
                  label: "Busy Hours",
                  color: "hsl(var(--chart-1))",
                },
                payout: {
                  label: "Payout (₹)",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teacherEngagementData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} />
                  <YAxis yAxisId="left" orientation="left" stroke="var(--color-busyHours)" />
                  <YAxis yAxisId="right" orientation="right" stroke="var(--color-payout)" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="busyHours" fill="var(--color-busyHours)" name="Busy Hours" />
                  <Bar yAxisId="right" dataKey="payout" fill="var(--color-payout)" name="Calculated Payout (₹)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="text-center py-8 text-slate-500">No teacher busy hours data available.</div>
          )}
        </CardContent>
      </Card>

      <Card className="w-full max-w-2xl mx-auto bg-white shadow-lg border-0 shadow-slate-200/50">
        <CardHeader className="text-center">
          <Banknote className="w-10 h-10 text-green-600 mx-auto mb-2" />
          <CardTitle className="text-2xl font-bold text-slate-900">Initiate Payout</CardTitle>
          <CardDescription className="text-slate-600">Send payments to teachers based on busy hours.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePayoutSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="teacherId">Select Teacher</Label>
              <Select
                value={payoutFormData.teacherId || ""}
                onValueChange={(value) => {
                  // When teacher changes, update both teacherId and payoutAmount
                  const selectedTeacherData = teacherEngagementData.find(
                    (t) => t.name === teachers.find((teacher) => teacher.id === value)?.name,
                  )
                  setPayoutFormData((prev) => ({
                    ...prev,
                    teacherId: value,
                    payoutAmount: selectedTeacherData?.payout || 0,
                  }))
                }}
              >
                <SelectTrigger className={payoutErrors.teacherId ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {payoutErrors.teacherId && <p className="text-sm text-red-500">{payoutErrors.teacherId}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="payoutAmount">Payout Amount (₹)</Label>
              <Input
                id="payoutAmount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Calculated automatically"
                value={payoutFormData.payoutAmount?.toFixed(2) || ""}
                onChange={handlePayoutChange}
                className={payoutErrors.payoutAmount ? "border-red-500" : ""}
                readOnly // Make it read-only as it's calculated
                aria-invalid={payoutErrors.payoutAmount ? "true" : "false"}
                aria-describedby="payoutAmount-error"
              />
              {payoutErrors.payoutAmount && (
                <p id="payoutAmount-error" className="text-sm text-red-500">
                  {payoutErrors.payoutAmount}
                </p>
              )}
              {selectedTeacher?.hourlyRate !== undefined && (
                <p className="text-xs text-slate-500 mt-1">
                  Calculated at ₹{(selectedTeacher.hourlyRate ?? 0).toFixed(2)}/hour × busy hours only.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                value={payoutFormData.paymentMethod || "upi"}
                onValueChange={(value: "upi" | "bank_transfer") => handlePayoutSelectChange("paymentMethod", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {payoutFormData.paymentMethod === "upi" && (
              <div className="space-y-2">
                <Label htmlFor="upiId">UPI ID</Label>
                <Input
                  id="upiId"
                  type="text"
                  placeholder="teachername@upi"
                  value={payoutFormData.upiId || ""}
                  onChange={handlePayoutChange}
                  className={payoutErrors.upiId ? "border-red-500" : ""}
                  aria-invalid={payoutErrors.upiId ? "true" : "false"}
                  aria-describedby="upiId-error"
                />
                {payoutErrors.upiId && (
                  <p id="upiId-error" className="text-sm text-red-500">
                    {payoutErrors.upiId}
                  </p>
                )}
              </div>
            )}

            {payoutFormData.paymentMethod === "bank_transfer" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="bankAccountNumber">Bank Account Number</Label>
                  <Input
                    id="bankAccountNumber"
                    type="text"
                    placeholder="Enter account number"
                    value={payoutFormData.bankAccountNumber || ""}
                    onChange={handlePayoutChange}
                    className={payoutErrors.bankAccountNumber ? "border-red-500" : ""}
                    aria-invalid={payoutErrors.bankAccountNumber ? "true" : "false"}
                    aria-describedby="bankAccountNumber-error"
                  />
                  {payoutErrors.bankAccountNumber && (
                    <p id="bankAccountNumber-error" className="text-sm text-red-500">
                      {payoutErrors.bankAccountNumber}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ifscCode">IFSC Code</Label>
                  <Input
                    id="ifscCode"
                    type="text"
                    placeholder="Enter IFSC code"
                    value={payoutFormData.ifscCode || ""}
                    onChange={handlePayoutChange}
                    className={payoutErrors.ifscCode ? "border-red-500" : ""}
                    aria-invalid={payoutErrors.ifscCode ? "true" : "false"}
                    aria-describedby="ifscCode-error"
                  />
                  {payoutErrors.ifscCode && (
                    <p id="ifscCode-error" className="text-sm text-red-500">
                      {payoutErrors.ifscCode}
                    </p>
                  )}
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks (Optional)</Label>
              <Textarea
                id="remarks"
                placeholder="Payment for busy hours..."
                value={payoutFormData.remarks || ""}
                onChange={handlePayoutChange}
                rows={3}
              />
            </div>

            {payoutStatus && payoutMessage && (
              <div
                className={`flex items-center space-x-2 p-3 rounded-md ${
                  payoutStatus === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
                role="alert"
              >
                {payoutStatus === "success" ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                <p className="text-sm font-medium">{payoutMessage}</p>
              </div>
            )}

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isPayoutSubmitting}>
              {isPayoutSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Payout...
                </>
              ) : (
                "Initiate Payout"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
