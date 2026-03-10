-- Add missing tables for contacts, messages, and meetings

-- Contacts table for storing scanned business cards
CREATE TABLE IF NOT EXISTS public.contacts (
  id bigserial PRIMARY KEY,
  user_id text NOT NULL,
  name text NOT NULL,
  company text,
  email text,
  phone text,
  status text DEFAULT 'New',
  scanned_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Messages table for tracking WhatsApp messages
CREATE TABLE IF NOT EXISTS public.messages (
  id bigserial PRIMARY KEY,
  user_id text NOT NULL,
  contact_id bigint REFERENCES public.contacts(id) ON DELETE CASCADE,
  campaign_id bigint REFERENCES public.campaigns(id) ON DELETE CASCADE,
  message_text text,
  status text DEFAULT 'pending',
  sent_at timestamptz,
  replied_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Meetings table for tracking booked meetings
CREATE TABLE IF NOT EXISTS public.meetings (
  id bigserial PRIMARY KEY,
  user_id text NOT NULL,
  contact_id bigint REFERENCES public.contacts(id) ON DELETE CASCADE,
  meeting_time timestamptz,
  status text DEFAULT 'scheduled',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_contacts_user ON public.contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_scanned_at ON public.contacts(scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_user ON public.messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_contact ON public.messages(contact_id);
CREATE INDEX IF NOT EXISTS idx_messages_campaign ON public.messages(campaign_id);
CREATE INDEX IF NOT EXISTS idx_meetings_user ON public.meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_meetings_contact ON public.meetings(contact_id);

-- Enable RLS on all tables
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for contacts
DROP POLICY IF EXISTS "Users can view their own contacts" ON public.contacts;
CREATE POLICY "Users can view their own contacts" ON public.contacts
  FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can insert their own contacts" ON public.contacts;
CREATE POLICY "Users can insert their own contacts" ON public.contacts
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can update their own contacts" ON public.contacts;
CREATE POLICY "Users can update their own contacts" ON public.contacts
  FOR UPDATE USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can delete their own contacts" ON public.contacts;
CREATE POLICY "Users can delete their own contacts" ON public.contacts
  FOR DELETE USING (auth.uid()::text = user_id);

-- Create RLS policies for messages
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
CREATE POLICY "Users can view their own messages" ON public.messages
  FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can insert their own messages" ON public.messages;
CREATE POLICY "Users can insert their own messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
CREATE POLICY "Users can update their own messages" ON public.messages
  FOR UPDATE USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can delete their own messages" ON public.messages;
CREATE POLICY "Users can delete their own messages" ON public.messages
  FOR DELETE USING (auth.uid()::text = user_id);

-- Create RLS policies for meetings
DROP POLICY IF EXISTS "Users can view their own meetings" ON public.meetings;
CREATE POLICY "Users can view their own meetings" ON public.meetings
  FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can insert their own meetings" ON public.meetings;
CREATE POLICY "Users can insert their own meetings" ON public.meetings
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can update their own meetings" ON public.meetings;
CREATE POLICY "Users can update their own meetings" ON public.meetings
  FOR UPDATE USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can delete their own meetings" ON public.meetings;
CREATE POLICY "Users can delete their own meetings" ON public.meetings
  FOR DELETE USING (auth.uid()::text = user_id);
