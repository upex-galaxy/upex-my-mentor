import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/types/supabase";
import { supabaseUrl, supabaseAnonKey } from "../config";

export const createClient = () => 
  createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
