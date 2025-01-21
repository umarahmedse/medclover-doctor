"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useSession } from "@clerk/nextjs";
import { useToast } from "@/hooks/use-toast";  // Correctly import useToast

const DoctorProfileUpdateForm = () => {
  const { session } = useSession();
  const userId = session?.user.publicMetadata.user_id;
  const { toast } = useToast();  // Get the toast function from the hook
  const [formData, setFormData] = useState<any>({
    id: "",
    email: "",
    name: "",
    phone: "",
    specialization: "",
    experienceYears: 0,
  });

  const [loading, setLoading] = useState(false);

  // Fetch the doctor profile data
  useEffect(() => {
    if (!userId) return;

    const fetchDoctorData = async () => {
      try {
        const response = await axios.get(`/api/doctors/profile?id=${userId}`);
        setFormData(response.data);
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
        variant: "default",  // Default for success
      });
    } catch (error) {
      // Show error toast
      toast({
        description: "Failed to update profile. Please try again later.",
        variant: "destructive",  // Destructive for errors
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev : any) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email || ""}
          onChange={handleChange}
          disabled={loading}
          required
        />

        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          disabled={loading}
          required
        />

        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          disabled={loading}
          required
        />

        <Label htmlFor="specialization">Specialization</Label>
        <Input
          id="specialization"
          name="specialization"
          type="text"
          value={formData.specialization}
          onChange={handleChange}
          disabled={loading}
          required
        />

        <Label htmlFor="experienceYears">Experience (Years)</Label>
        <Input
          id="experienceYears"
          name="experienceYears"
          type="number"
          value={formData.experienceYears}
          onChange={handleChange}
          disabled={loading}
          min="0"
          required
        />

        <Button type="submit" disabled={loading}>
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
