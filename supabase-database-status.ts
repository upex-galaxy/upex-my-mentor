#!/usr/bin/env bun
// Comprehensive Supabase Database Status Checker
// Uses REST API to check database schema and connectivity

import { supabaseUrl, supabaseAnonKey } from './src/lib/config';

console.log('🔍 Supabase Database Status Report');
console.log('===================================\n');

async function checkDatabaseStatus() {
  try {
    const baseUrl = supabaseUrl;
    const apiKey = supabaseAnonKey;

    console.log('📡 Project Information:');
    console.log(`  URL: ${baseUrl}`);
    console.log(`  API Key configured: ${!!apiKey}`);
    console.log(`  Project ID: ionevzckjyxtpmyenbxc`);

    // Test basic API connectivity
    console.log('\n🌐 Testing API Connectivity...');
    
    const headers = {
      'apikey': apiKey,
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };

    // Try to access the OpenAPI specification
    try {
      const response = await fetch(`${baseUrl}/rest/v1/`, { headers });
      
      if (response.ok) {
        console.log('  ✅ REST API accessible');
      } else if (response.status === 401) {
        console.log('  ❌ API Key invalid (401 Unauthorized)');
        console.log('  💡 Check your SUPABASE_ANON_KEY in .env.local');
        return;
      } else {
        console.log(`  ⚠️  API returned status: ${response.status}`);
      }
    } catch (error) {
      console.log('  ❌ Cannot connect to API');
      console.log(`  Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return;
    }

    // Check if we can query the information_schema
    console.log('\n📋 Checking Database Tables...');
    
    try {
      const schemaResponse = await fetch(
        `${baseUrl}/rest/v1/information_schema.tables?select=table_name,table_type&table_schema=eq.public&order=table_name`,
        { headers }
      );

      if (schemaResponse.ok) {
        const tables = await schemaResponse.json();
        
        if (tables.length > 0) {
          console.log(`  ✅ Found ${tables.length} tables in public schema:`);
          tables.forEach((table: any) => {
            console.log(`    ${table.table_type}: ${table.table_name}`);
          });

          // Check expected tables
          const expectedTables = ['profiles', 'reviews', 'conversations', 'messages'];
          const foundTables = tables.map((t: any) => t.table_name);
          
          console.log('\n📊 Expected Tables Status:');
          expectedTables.forEach(tableName => {
            const exists = foundTables.includes(tableName);
            console.log(`  ${exists ? '✅' : '❌'} ${tableName}`);
          });

        } else {
          console.log('  ⚠️  No tables found in public schema');
          console.log('  💡 You may need to run the SQL scripts to create tables');
        }
      } else {
        console.log(`  ❌ Cannot query schema: ${schemaResponse.status}`);
        
        if (schemaResponse.status === 403) {
          console.log('  💡 This might be due to RLS policies on information_schema');
        }
      }
} catch (error) {
        console.log('  ❌ Error querying schema:', error instanceof Error ? error.message : 'Unknown error');
      }

    // Try to access specific expected tables
    console.log('\n🧪 Testing Expected Tables...');
    
    const testTables = ['profiles', 'reviews', 'conversations', 'messages'];
    
    for (const tableName of testTables) {
      try {
        const tableResponse = await fetch(
          `${baseUrl}/rest/v1/${tableName}?select=*&limit=1`,
          { headers }
        );
        
        if (tableResponse.ok) {
          const data = await tableResponse.json();
          console.log(`  ✅ ${tableName}: Accessible (${data.length} rows)`);
        } else if (tableResponse.status === 404) {
          console.log(`  ❌ ${tableName}: Not found (404)`);
        } else if (tableResponse.status === 403) {
          console.log(`  ⚠️  ${tableName}: Access denied (403) - May need RLS policy`);
        } else {
          console.log(`  ⚠️  ${tableName}: HTTP ${tableResponse.status}`);
        }
      } catch (error) {
        console.log(`  ❌ ${tableName}: Error - ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Provide recommendations
    console.log('\n💡 Recommendations:');
    
    console.log('\n📝 Setup Required:');
    console.log('  1. Ensure Supabase project is created');
    console.log('  2. Run the SQL from supabase-messaging-schema.sql');
    console.log('  3. Set up RLS policies as documented');
    
    console.log('\n🚀 Development Commands:');
    console.log('  bun run dev - Start development server');
    console.log('  bun run typecheck - Check TypeScript types');
    console.log('  bun run lint - Run ESLint');
    
    console.log('\n📚 Resources:');
    console.log('  • Supabase Dashboard: https://app.supabase.com');
    console.log('  • Project Documentation: .context/backend-setup.md');
    console.log('  • Database Schema: supabase-messaging-schema.sql');

  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

// Run the status check
checkDatabaseStatus();