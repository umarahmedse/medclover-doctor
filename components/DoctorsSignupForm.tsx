"use client"

import { useState } from "react"
import { useSignUp } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function DoctorSignupForm() {
  const { signUp } = useSignUp()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [specialization, setSpecialization] = useState("")
  const [experienceYears, setExperienceYears] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const user = await signUp.create({
        emailAddress: email,
        password: password,
        firstName: name.split(" ")[0], 
        lastName: name.split(" ")[1], 
        phoneNumber: phone
      })
      
      // Add additional data to Clerk user metadata (e.g., specialization, experience)
      await user.update({ metadata: { specialization, experienceYears } })
      
      alert("Doctor signed up successfully!")
    } catch (error) {
      console.error("Signup failed:", error)
      setErrorMessage("Failed to sign up. Please try again.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required onChange={(e) => setEmail(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" required onChange={(e) => setPhone(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required onChange={(e) => setPassword(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="specialization">Specialization</Label>
        <Select name="specialization" value={specialization} onValueChange={setSpecialization} required>
          <SelectTrigger>
            <SelectValue placeholder="Select specialization" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Cardiology">Cardiology</SelectItem>
            <SelectItem value="Neurology">Neurology</SelectItem>
            <SelectItem value="Orthopedics">Orthopedics</SelectItem>
            <SelectItem value="Dermatology">Dermatology</SelectItem>
            <SelectItem value="Ophthalmology">Ophthalmology</SelectItem>
            <SelectItem value="Pulmonology">Pulmonology</SelectItem>
            <SelectItem value="Gastroenterology">Gastroenterology</SelectItem>
            <SelectItem value="Urology">Urology</SelectItem>
            <SelectItem value="Endocrinology">Endocrinology</SelectItem>
            <SelectItem value="General Medicine">General Medicine</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="experienceYears">Years of Experience</Label>
        <Input id="experienceYears" name="experienceYears" type="number" min="0" required onChange={(e) => setExperienceYears(e.target.value)} />
      </div>

      <Button type="submit" className="w-full" disabled={isCreating}>
        {isCreating ? "Creating Account..." : "Sign Up"}
      </Button>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
    </form>
  )
}
