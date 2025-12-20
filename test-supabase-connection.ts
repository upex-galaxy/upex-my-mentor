#!/usr/bin/env bun
// Test script to verify Supabase connection and list tables
// This script will work even without environment variables set

import { createClient } from '@supabase/supabase-js';

// Try to get config from environment variables or use defaults
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ionevzckjyxtpmyenbxc.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-api-key-here';

console.log('🔍 Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key configured:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testConnection() {
  try {
    // If no API key is configured, we can't test the connection
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'your-api-key-here') {
      console.log('\n⚠️  No Supabase API key configured.');
      console.log('Please set up your environment variables:');
      console.log('1. Copy .env.example to .env.local');
      console.log('2. Add your Supabase credentials to .env.local');
      console.log('3. Run this script again');
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test basic connection
    console.log('\n📡 Testing connection...');
    const { error } = await supabase.from('_').select('*').limit(1);
    
    if (error && !error.message.includes('does not exist')) {
      console.error('❌ Connection failed:', error.message);
      return;
    }
    
    console.log('✅ Connection successful!');
    
    // List all tables using information_schema
    console.log('\n📋 Listing available tables...');
    const { data: schemaData, error: schemaError } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_type')
      .eq('table_schema', 'public')
      .order('table_name');
    
    if (schemaError) {
      console.error('❌ Could not list tables:', schemaError.message);
      return;
    }
    
    console.log('\n📊 Tables in public schema:');
    if (schemaData && schemaData.length > 0) {
      schemaData.forEach(({ table_name, table_type }) => {
        console.log(`  ${table_type}: ${table_name}`);
      });
      
      // Test basic queries on expected tables
      console.log('\n🧪 Testing basic table queries...');
      
      const expectedTables = ['profiles', 'reviews', 'conversations', 'messages'];
      
      for (const tableName of expectedTables) {
        try {
          const { data: testData, error: testError } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);
          
          if (testError) {
            console.log(`  ❌ ${tableName}: ${testError.message}`);
          } else {
            console.log(`  ✅ ${tableName}: OK (${testData?.length || 0} rows)`);
          }
        } catch (err) {
          console.log(`  ❌ ${tableName}: Error - ${err}`);
        }
      }
    } else {
      console.log('  No tables found in public schema');
    }
    
    console.log('\n🎉 Supabase connection test completed!');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

// Run the test
testConnection();