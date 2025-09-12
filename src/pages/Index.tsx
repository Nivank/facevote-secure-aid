import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Vote, Shield, Users } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <Card className="mb-8">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <Vote className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-4xl font-bold mb-2">
              AI-Based Face Recognition Voting System
            </CardTitle>
            <CardDescription className="text-lg">
              Secure, transparent, and fraud-resistant digital voting platform
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/voter-registration')}>
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Voter Portal</h3>
              <p className="text-muted-foreground mb-4">
                Register and cast your vote using secure face recognition technology
              </p>
              <Button className="w-full">Start Voting Process</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin')}>
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Admin Portal</h3>
              <p className="text-muted-foreground mb-4">
                Manage voters, candidates, and monitor election statistics
              </p>
              <Button variant="outline" className="w-full">Admin Login</Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Key Features</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-primary">Secure Authentication</div>
                <div className="text-muted-foreground">Aadhar-based verification with face recognition</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-primary">Fraud Detection</div>
                <div className="text-muted-foreground">AI-powered duplicate detection and fraud alerts</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-primary">Real-time Analytics</div>
                <div className="text-muted-foreground">Live voting statistics and comprehensive reporting</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
