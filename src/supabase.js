import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://piqixymqdxpegdifawkx.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpcWl4eW1xZHhwZWdkaWZhd2t4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTA0ODY3OTQsImV4cCI6MjAyNjA2Mjc5NH0.xwlPtwsQ_u5zTabnJ0jodIUrqPH7VJJCA9VLTOzi5a8'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
export const ROOM = 'station-test';
export const channel = supabase.channel(ROOM);

