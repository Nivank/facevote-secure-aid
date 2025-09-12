import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import Webcam from "react-webcam";
import { Camera, RotateCcw } from "lucide-react";

const FaceRecognition = () => {
  const [loading, setLoading] = useState(false);
  const [captured, setCaptured] = useState(false);
  const [faceData, setFaceData] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const voter = location.state?.voter;

  if (!voter) {
    navigate('/');
    return null;
  }

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setFaceData(imageSrc);
      setCaptured(true);
    }
  }, [webcamRef]);

  const retake = () => {
    setCaptured(false);
    setFaceData(null);
  };

  const processFaceRecognition = async () => {
    if (!faceData) return;

    setLoading(true);
    
    try {
      // In a real implementation, this would:
      // 1. Extract face features from the captured image
      // 2. Compare with existing face data in the database
      // 3. Check for duplicate faces across different users
      
      // For now, we'll simulate face recognition
      const faceHash = btoa(faceData.substring(0, 100)); // Simple hash simulation
      
      // Check if this face is already linked to another voter
      const { data: existingFaces, error: faceError } = await supabase
        .from('voters')
        .select('*')
        .not('face_data', 'is', null)
        .neq('id', voter.id);

      if (faceError) throw faceError;

      // Simulate face matching (in production, use actual face recognition)
      const duplicateFace = existingFaces?.find(v => 
        v.face_data && v.has_voted && v.face_data.substring(0, 20) === faceHash.substring(0, 20)
      );

      if (duplicateFace) {
        // Log fraud attempt
        await supabase.from('fraud_logs').insert({
          voter_id: voter.id,
          aadhar_number: voter.aadhar_number,
          attempt_type: 'duplicate_face',
          details: { 
            original_voter_id: duplicateFace.id,
            attempted_at: new Date().toISOString() 
          }
        });

        toast({
          title: "Face Already Linked",
          description: "This face is already linked with another voter who has voted",
          variant: "destructive",
        });
        return;
      }

      // Update voter with face data
      const { error: updateError } = await supabase
        .from('voters')
        .update({ face_data: faceHash })
        .eq('id', voter.id);

      if (updateError) throw updateError;

      toast({
        title: "Face Recognition Successful",
        description: "Proceeding to voting",
      });

      navigate('/voting', { state: { voter: { ...voter, face_data: faceHash } } });
      
    } catch (error) {
      console.error('Face recognition error:', error);
      toast({
        title: "Error",
        description: "Face recognition failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Face Recognition</CardTitle>
          <CardDescription>
            Please position your face in the camera frame and capture
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            {!captured ? (
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover"
                videoConstraints={{
                  width: 640,
                  height: 480,
                  facingMode: "user"
                }}
              />
            ) : (
              <img 
                src={faceData || ''} 
                alt="Captured face" 
                className="w-full h-full object-cover"
              />
            )}
          </div>
          
          <div className="flex gap-2 justify-center">
            {!captured ? (
              <Button onClick={capture} className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Capture Face
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={retake} className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Retake
                </Button>
                <Button 
                  onClick={processFaceRecognition} 
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading ? "Processing..." : "Verify & Proceed"}
                </Button>
              </>
            )}
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>Voter: {voter.name}</p>
            <p>Aadhar: {voter.aadhar_number}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FaceRecognition;