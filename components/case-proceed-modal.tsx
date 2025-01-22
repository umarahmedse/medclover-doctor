/* eslint-disable*/

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import axios from "axios"
import { useRouter } from "next/navigation"  // Import useRouter
import { Toast, ToastAction, ToastProvider } from "@/components/ui/toast"  // Import Toast and ToastProvider
import { useToast } from "@/hooks/use-toast"
import { Spinner } from "./ui/spinner"

interface CaseProceedModalProps {
  isOpen: boolean
  onClose: () => void
  caseData: any
}

export function CaseProceedModal({ isOpen, onClose, caseData }: CaseProceedModalProps) {
  const [diagnosis, setDiagnosis] = useState("")
  const [prescription, setPrescription] = useState("")
  const [doctorRemarks, setDoctorRemarks] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()  // Initialize router for navigation
  const { toast } = useToast()  // Initialize the toast function

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await axios.put(`/api/cases/${caseData._id}`, {
        id: caseData._id,
        diagnosis,
        prescription,
        doctorRemarks,
        isClosed: true,
      })
      onClose()  // Close the modal

      // Show success toast with correct 'variant' prop
      toast({
        title: "Case Updated Successfully",
        description: `The Case Is Updated And Closed.`,
        variant: "default",  // Correct usage of 'variant' for success
      })

      // Force reload of the same route to get fresh data
      router.replace("/cases-list")  // Force refetch

    } catch (error) {
      setError("Error updating case. Please try again.")
      console.error("Error updating case:", error)

      // Show error toast with correct 'variant' prop
      toast({
        title: "Error Updating Case",
        description: "There was an issue updating the case. Please try again.",
        variant: "destructive",  // Correct usage of 'variant' for error (destructive)
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Proceed Case: {caseData._id.slice(-5).toUpperCase()}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Input
              id="diagnosis"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="prescription">Prescription</Label>
            <Textarea
              id="prescription"
              value={prescription}
              onChange={(e) => setPrescription(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="doctorRemarks">Doctor's Remarks</Label>
            <Textarea
              id="doctorRemarks"
              value={doctorRemarks}
              onChange={(e) => setDoctorRemarks(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-red-600">{error}</div>}
          <Button type="submit" disabled={loading}>
            {loading ? <Spinner /> : "Submit and Close Case"}
          </Button>
        </form>
      </DialogContent>

      {/* Toast Notification Component */}
      <ToastProvider>
        {/* Toast notifications will appear here */}
        <Toast />
      </ToastProvider>
    </Dialog>
  )
}
