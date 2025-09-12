import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

interface Candidate {
  id: string;
  name: string;
  party: string;
  description: string;
  image_url?: string;
}

const Voting = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const voter = location.state?.voter;

  if (!voter) {
    navigate('/');
    return null;
  }

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCandidates(data || []);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      toast({
        title: "Error",
        description: "Failed to load candidates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const submitVote = async () => {
    if (!selectedCandidate) {
      toast({
        title: "No Candidate Selected",
        description: "Please select a candidate to vote for",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    
    try {
      // Record the vote
      const { error: voteError } = await supabase
        .from('votes')
        .insert({
          voter_id: voter.id,
          candidate_id: selectedCandidate
        });

      if (voteError) throw voteError;

      // Mark voter as having voted
      const { error: updateError } = await supabase
        .from('voters')
        .update({ has_voted: true })
        .eq('id', voter.id);

      if (updateError) throw updateError;

      toast({
        title: "Vote Recorded Successfully",
        description: "Thank you for participating in the voting process",
      });

      navigate('/vote-confirmation', { 
        state: { 
          voter,
          candidate: candidates.find(c => c.id === selectedCandidate)
        } 
      });
      
    } catch (error) {
      console.error('Error submitting vote:', error);
      toast({
        title: "Error",
        description: "Failed to record your vote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            Loading candidates...
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Cast Your Vote</CardTitle>
            <CardDescription>
              Select your preferred candidate and submit your vote
            </CardDescription>
            <div className="text-sm text-muted-foreground">
              Voter: {voter.name} | Aadhar: {voter.aadhar_number}
            </div>
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {candidates.map((candidate) => (
            <Card 
              key={candidate.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedCandidate === candidate.id 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => setSelectedCandidate(candidate.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{candidate.name}</h3>
                  {selectedCandidate === candidate.id && (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  )}
                </div>
                <Badge variant="secondary" className="mb-2">
                  {candidate.party}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {candidate.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button 
            onClick={submitVote}
            disabled={!selectedCandidate || submitting}
            size="lg"
            className="min-w-40"
          >
            {submitting ? "Submitting Vote..." : "Submit Vote"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Voting;