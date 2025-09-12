import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";

const AdminLogin = () => {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // For demo purposes, we'll use simple authentication
      // In production, implement proper password hashing and JWT tokens
      if ((adminId === 'admin1' || adminId === 'admin2') && password === 'password') {
        // Create session token
        const sessionToken = btoa(`${adminId}:${Date.now()}`);
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour session

        // Get admin user
        const { data: adminUser, error } = await supabase
          .from('admin_users')
          .select('*')
          .eq('admin_id', adminId)
          .single();

        if (error) throw error;

        // Store session
        const { error: sessionError } = await supabase
          .from('admin_sessions')
          .insert({
            admin_id: adminUser.id,
            token: sessionToken,
            expires_at: expiresAt.toISOString()
          });

        if (sessionError) throw sessionError;

        // Store session in localStorage
        localStorage.setItem('admin_token', sessionToken);
        localStorage.setItem('admin_user', JSON.stringify(adminUser));
        
        toast({
          title: "Login Successful",
          description: "Welcome to the admin dashboard",
        });

        navigate('/admin/dashboard');
      } else {
        toast({
          title: "Invalid Credentials",
          description: "Please check your admin ID and password",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
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
          <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <CardDescription>
            Enter your admin credentials to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminId">Admin ID</Label>
              <Input
                id="adminId"
                type="text"
                placeholder="Enter admin ID"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
          
          <div className="mt-4 p-3 bg-muted/50 rounded text-xs text-muted-foreground">
            <strong>Demo Credentials:</strong><br/>
            Admin ID: admin1 or admin2<br/>
            Password: password
          </div>
          
          <div className="mt-4 text-center">
            <Button variant="link" onClick={() => navigate('/')}>
              Back to Voting
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;