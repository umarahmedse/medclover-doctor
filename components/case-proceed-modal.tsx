/* eslint-disable*/

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import axios from "axios"
import { useRouter } from "next/navigation"
import { Toast, ToastAction, ToastProvider } from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import { Spinner } from "./ui/spinner"

interface CheckboxItem {
  id: string
  label: string
}

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
  const [checkboxItems, setCheckboxItems] = useState<CheckboxItem[]>([])
  const [isLoadingCheckboxes, setIsLoadingCheckboxes] = useState(true)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  
  // New state for other disease
  const [otherDisease, setOtherDisease] = useState("")
  const [includeOther, setIncludeOther] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchCheckboxItems = async () => {
      setIsLoadingCheckboxes(true)
      try {
        const response = await axios.post("/api/checkbox-items", {
          paragraph: `${caseData.patientDescription} ${caseData.enhancedDescription}`.trim(),
        })
        setCheckboxItems(response.data)
      } catch (error) {
        console.error("Error fetching checkbox items:", error)
        toast({
          title: "Error Fetching Checkbox Items",
          description: "There was an issue loading the checkbox items. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingCheckboxes(false)
      }
    }
    fetchCheckboxItems()
  }, [toast])

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setSelectedItems((prev) => {
      if (checked) {
        return [...prev, id]
      } else {
        return prev.filter((item) => item !== id)
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Combine selected items and other disease into one string
      const combinedItems = [...selectedItems]
      if (includeOther && otherDisease) {
        combinedItems.push(`Other Disease: ${otherDisease}`)
      }

      await axios.put(`/api/cases/${caseData._id}`, {
        id: caseData._id,
        diagnosis,
        prescription,
        doctorRemarks,
        selectedItems: combinedItems.join(","),
        isClosed: true,
      })
      onClose()

      toast({
        title: "Case Updated Successfully",
        description: `The Case Is Updated And Closed.`,
        variant: "default",
      })

      router.replace("/cases-list")
    } catch (error) {
      setError("Error updating case. Please try again.")
      console.error("Error updating case:", error)

      toast({
        title: "Error Updating Case",
        description: "There was an issue updating the case. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] flex">
        <div className="flex-1 pr-4 border-r">
          <DialogHeader>
            <DialogTitle>Proceed Case: {caseData._id.slice(-5).toUpperCase()}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="diagnosis">Diagnosis</Label>
              <Input id="diagnosis" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} required />
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

            {/* Other Disease Input */}
            <div>
              <Label htmlFor="otherDisease">Other (Optional)</Label>
              <Input
                id="otherDisease"
                value={otherDisease}
                onChange={(e) => setOtherDisease(e.target.value)}
                placeholder="Type another possible disease"
              />
            </div>

            {/* Include Other Disease Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeOther"
                checked={includeOther}
                onCheckedChange={(checked) => setIncludeOther(checked as boolean)}
              />
              <Label htmlFor="includeOther">Include this disease</Label>
            </div>

            {error && <div className="text-red-600">{error}</div>}
            <Button type="submit" disabled={loading}>
              {loading ? <Spinner size={"medium"} show={true}/> : "Submit and Close Case"}
            </Button>
          </form>
        </div>
        <div className="flex-1 pl-4">
          <h3 className="text-lg font-semibold mb-4">Recommendations - If Any </h3>
          {isLoadingCheckboxes ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {checkboxItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={item.id}
                    onCheckedChange={(checked) => handleCheckboxChange(item.id, checked as boolean)}
                  />
                  <Label htmlFor={item.id}>{item.label}</Label>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>

      <ToastProvider>
        <Toast />
      </ToastProvider>
    </Dialog>
  )
}
