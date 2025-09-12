import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const VoterRegistration = () => {
  const [aadharNumber, setAadharNumber] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const validateAadhar = (value: string) => {
    return /^\d{12}$/.test(value);
  };

  const validateName = (value: string) => {
    return /^[a-zA-Z\s]+$/.test(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAadhar(aadharNumber)) {
      toast({
        title: "Invalid Aadhar Number",
        description: "Please enter a valid 12-digit Aadhar number",
        variant: "destructive",
      });
      return;
    }

    if (!validateName(name)) {
      toast({
        title: "Invalid Name",
        description: "Name should contain only letters and spaces",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Check if voter exists
      const { data: existingVoter, error } = await supabase
        .from('voters')
        .select('*')
        .eq('aadhar_number', aadharNumber)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (existingVoter) {
        if (existingVoter.has_voted) {
          toast({
            title: "Vote Already Recorded",
            description: "You have already cast your vote",
            variant: "destructive",
          });
          navigate('/');
          return;
        }
        
        // Proceed to face recognition
        navigate('/face-recognition', { 
          state: { 
            voter: existingVoter,
            isRegistered: true 
          } 
        });
      } else {
        toast({
          title: "Not Available",
          description: "Voter not found in the system. Please contact admin.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error checking voter:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Voter Registration</CardTitle>
          <CardDescription>
            Enter your Aadhar number and name to proceed with voting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="aadhar">Aadhar Number</Label>
              <Input
                id="aadhar"
                type="text"
                placeholder="Enter 12-digit Aadhar number"
                value={aadharNumber}
                onChange={(e) => setAadharNumber(e.target.value)}
                maxLength={12}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Verifying..." : "Proceed to Voting"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Button variant="link" onClick={() => navigate('/admin')}>
              Admin Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoterRegistration;