import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mqzvyfbdmnefgxkdbxgf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xenZ5ZmJkbW5lZmd4a2RieGdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxOTg0NDcsImV4cCI6MjA5MTc3NDQ0N30.3h-weS5lU6O-w0egdAcG09gD-OTEyK7YN4KNXa533RM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
