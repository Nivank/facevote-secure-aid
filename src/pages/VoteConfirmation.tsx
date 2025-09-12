import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, Home } from "lucide-react";

const VoteConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { voter, candidate } = location.state || {};

  if (!voter || !candidate) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-700">
            Vote Recorded Successfully!
          </CardTitle>
          <CardDescription>
            Thank you for participating in the democratic process
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Vote Details</h3>
            <p className="text-sm text-muted-foreground">
              <strong>Voter:</strong> {voter.name}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Candidate:</strong> {candidate.name}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Party:</strong> {candidate.party}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Time:</strong> {new Date().toLocaleString()}
            </p>
          </div>
          
          <div className="text-xs text-muted-foreground bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
            <strong>Important:</strong> Your vote has been securely recorded and cannot be changed. 
            Please keep this confirmation for your records.
          </div>
          
          <Button 
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Return to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoteConfirmation;