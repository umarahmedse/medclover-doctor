/* eslint-disable*/

"use client"
import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useSession } from "@clerk/nextjs";
import { useToast } from "@/hooks/use-toast"; // Correctly import useToast
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"; // Import Shadcn Select components

const DoctorProfileUpdateForm = () => {
  const { session } = useSession();
  const userId = session?.user.publicMetadata.user_id;
  const { toast } = useToast(); // Get the toast function from the hook
  const [formData, setFormData] = useState<any>({
    id: "", // Make sure id has a default value of an empty string
    email: "",
    name: "",
    phone: "",
    specialization: "",
    experienceYears: 0, // Default number is 0
  });

  const [loading, setLoading] = useState(false);

  // Fetch the doctor profile data
  useEffect(() => {
    if (!userId) return;

    const fetchDoctorData = async () => {
      try {
        // Ensure userId is available and valid
        if (!userId) {
          console.error("User ID is missing.");
          return;
        }

        // Make the GET request with the userId query parameter
        const response = await axios.get(`/api/doctors/profile?id=${userId}`);

        // Assuming the response data contains the doctor profile
        setFormData({
          id: response.data.id || "",
          email: response.data.email || "",
          name: response.data.name || "",
          phone: response.data.phone || "",
          specialization: response.data.specialization || "",
          experienceYears: response.data.experienceYears || 0, // Default to 0 if missing
        });
      } catch (error) {
        console.error("Failed to fetch doctor profile data:", error);
      }
    };

    fetchDoctorData();
  }, [userId]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Send PUT request to update the profile
      const response = await axios.put("/api/doctors/update", formData);

      // Show success toast
      toast({
        description: response.data.message || "Profile updated successfully!",
        variant: "default", // Default for success
      });
    } catch (error) {
      // Show error toast
      toast({
        description: "Failed to update profile. Please try again later.",
        variant: "destructive", // Destructive for errors
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="p-4 w-full">
      <h1 className="text-3xl !mx-auto font-semibold w-fit">
        Update Doctor Profile
      </h1>
      <form
        onSubmit={handleSubmit}
        className="p-4 flex flex-col gap-3 items-center"
      >
        <div className="flex flex-col gap-1 md:w-[50%]">
          <Label htmlFor="id">ID</Label>
          <Input
            id="id"
            name="id"
            type="text"
            value={userId || ("" as any)} // Ensure userId has a value
            disabled={true}
          />
        </div>

        <div className="flex flex-col gap-1 md:w-[50%]">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email || ""} // Ensure empty string if undefined
            disabled={true}
            required
          />
        </div>

        <div className="flex flex-col gap-1 md:w-[50%]">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            value={formData.name || ""} // Default to empty string if undefined
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>

        <div className="flex flex-col gap-1 md:w-[50%]">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone || ""} // Default to empty string if undefined
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>

        <div className="flex flex-col gap-1 md:w-[50%]">
          <Label htmlFor="specialization">Specialization</Label>
          <Select
            name="specialization"
            value={formData.specialization || ""}
            onValueChange={(value) =>
              setFormData((prev: any) => ({ ...prev, specialization: value }))
            }
            disabled={loading}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Specialization" />
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

        <div className="flex flex-col gap-1 md:w-[50%]">
          <Label htmlFor="experienceYears">Experience (Years)</Label>
          <Input
            id="experienceYears"
            name="experienceYears"
            type="number"
            value={formData.experienceYears || 0} // Default to 0 if undefined
            onChange={handleChange}
            disabled={loading}
            min="0"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="md:w-[200px] w-full"
        >
          {loading ? (
            <>
              <Spinner className="mr-2" /> Updating...
            </>
          ) : (
            "Update Profile"
          )}
        </Button>
      </form>
    </div>
  );
};

export default DoctorProfileUpdateForm;
