#!/usr/bin/env bun
// Supabase Database Connection Helper
// This script helps verify and set up the Supabase connection

console.log('🔍 Upex My Mentor - Supabase Connection Helper');
console.log('==========================================\n');

// Check environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('📋 Environment Configuration:');
console.log(`  Supabase URL: ${supabaseUrl || '❌ Not set'}`);
console.log(`  Anon Key: ${supabaseAnonKey ? '✅ Configured' : '❌ Not set'}`);

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('\n⚠️  Missing environment variables!');
  console.log('\n📝 To fix this:');
  console.log('1. Go to your Supabase dashboard: https://app.supabase.com');
  console.log('2. Select your project');
  console.log('3. Go to Settings > API');
  console.log('4. Copy the Project URL and Anon Key');
  console.log('5. Create a .env.local file with:');
  console.log('   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here');
  console.log('6. Run this script again');
  process.exit(0);
}

console.log('\n✅ Environment variables configured!');

// Expected database schema based on documentation
console.log('\n📊 Expected Database Schema:');
console.log('  • profiles - User profiles (students & mentors)');
console.log('  • reviews - User reviews and ratings');
console.log('  • conversations - Messaging conversations');
console.log('  • messages - Individual messages');

console.log('\n🔐 Expected Row Level Security (RLS):');
console.log('  • profiles - Public read, owner write');
console.log('  • reviews - Public read, owner write');
console.log('  • conversations - Participants only');
console.log('  • messages - Conversation participants only');

console.log('\n🎯 Next Steps:');
console.log('  1. Verify your Supabase project has the required tables');
console.log('  2. Run the SQL scripts from supabase-messaging-schema.sql if needed');
console.log('  3. Test the connection with: bun run test-supabase-connection.ts');

console.log('\n📚 Useful Commands:');
console.log('  • Start dev server: bun run dev');
console.log('  • Type checking: bun run typecheck');
console.log('  • Linting: bun run lint');

console.log('\n🚀 Project is ready for development!');