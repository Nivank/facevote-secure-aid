-- Create voters table
CREATE TABLE public.voters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aadhar_number VARCHAR(12) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  face_data TEXT, -- Store face encoding/hash
  has_voted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create candidates table
CREATE TABLE public.candidates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  party VARCHAR(255),
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create votes table
CREATE TABLE public.votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  voter_id UUID NOT NULL REFERENCES public.voters(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  voted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin_users table
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id VARCHAR(50) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create fraud_logs table
CREATE TABLE public.fraud_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  voter_id UUID REFERENCES public.voters(id),
  aadhar_number VARCHAR(12),
  attempt_type VARCHAR(50) NOT NULL, -- 'duplicate_face', 'multiple_attempts', 'invalid_credentials'
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sessions table for admin
CREATE TABLE public.admin_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES public.admin_users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.voters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public access (voting system needs to be accessible)
CREATE POLICY "Voters can be viewed by anyone" ON public.voters FOR SELECT USING (true);
CREATE POLICY "Voters can be updated for voting" ON public.voters FOR UPDATE USING (true);

CREATE POLICY "Candidates can be viewed by anyone" ON public.candidates FOR SELECT USING (true);

CREATE POLICY "Votes can be inserted by anyone" ON public.votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Votes can be viewed by anyone" ON public.votes FOR SELECT USING (true);

CREATE POLICY "Admin users can be viewed by anyone" ON public.admin_users FOR SELECT USING (true);

CREATE POLICY "Fraud logs can be inserted by anyone" ON public.fraud_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Fraud logs can be viewed by anyone" ON public.fraud_logs FOR SELECT USING (true);

CREATE POLICY "Admin sessions can be managed by anyone" ON public.admin_sessions FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX idx_voters_aadhar ON public.voters(aadhar_number);
CREATE INDEX idx_votes_voter_id ON public.votes(voter_id);
CREATE INDEX idx_votes_candidate_id ON public.votes(candidate_id);
CREATE INDEX idx_fraud_logs_aadhar ON public.fraud_logs(aadhar_number);
CREATE INDEX idx_admin_sessions_token ON public.admin_sessions(token);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_voters_updated_at
  BEFORE UPDATE ON public.voters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_candidates_updated_at
  BEFORE UPDATE ON public.candidates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default admin users
INSERT INTO public.admin_users (admin_id, password_hash, name) VALUES 
('admin1', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Primary Admin'),
('admin2', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Secondary Admin');

-- Insert sample candidates
INSERT INTO public.candidates (name, party, description) VALUES 
('Candidate A', 'Party X', 'Description for Candidate A'),
('Candidate B', 'Party Y', 'Description for Candidate B'),
('Candidate C', 'Party Z', 'Description for Candidate C');

-- Insert sample voters for testing
INSERT INTO public.voters (aadhar_number, name) VALUES 
('123456789012', 'John Doe'),
('123456789013', 'Jane Smith'),
('123456789014', 'Mike Johnson');