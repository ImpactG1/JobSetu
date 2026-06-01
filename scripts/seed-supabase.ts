/**
 * Seed script: Import CSV data into Supabase tables
 * Usage: npx tsx scripts/seed-supabase.ts
 * 
 * Requires .env with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 * (or a service role key for bypassing RLS)
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing SUPABASE_URL or key in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQuotes = !inQuotes; }
    else if (ch === ',' && !inQuotes) { result.push(current.replace(/\r/g, '')); current = ''; }
    else { current += ch; }
  }
  result.push(current.replace(/\r/g, ''));
  return result;
}

function parseCSV(filePath: string): Record<string, string>[] {
  const text = readFileSync(filePath, 'utf-8');
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = (vals[idx] || '').trim(); });
    rows.push(row);
  }
  return rows;
}

async function seedDirectJobs() {
  const csvPath = resolve(__dirname, '../telegram_job_scraper/jobs_direct_jobs.csv');
  console.log('📂 Reading direct jobs from:', csvPath);
  const rows = parseCSV(csvPath);
  
  const jobs = rows
    .filter(r => r.company && r.job_title)
    .map(r => ({
      company: r.company,
      job_title: r.job_title,
      location: r.location || '',
      batch: r.batch || '',
      salary: r.salary || '',
      stipend: r.stipend || '',
      employment_type: r.employment_type || '',
      skills: r.skills || '',
      email: r.email || '',
      application_link: r.application_link || '',
      source_message: (r.source_message || '').slice(0, 2000),
    }));

  console.log(`📊 Parsed ${jobs.length} valid jobs`);
  
  // Insert in batches of 50
  for (let i = 0; i < jobs.length; i += 50) {
    const batch = jobs.slice(i, i + 50);
    const { error, data } = await supabase.from('direct_jobs').insert(batch).select('id');
    if (error) {
      console.error(`❌ Batch ${i}-${i + batch.length} failed:`, error.message);
    } else {
      console.log(`✅ Inserted ${data?.length || 0} jobs (batch ${i + 1}-${i + batch.length})`);
    }
  }
}

async function seedReferralOpportunities() {
  const csvPath = resolve(__dirname, '../telegram_job_scraper/jobs_referral_opportunities.csv');
  console.log('📂 Reading referrals from:', csvPath);
  const rows = parseCSV(csvPath);
  
  const refs = rows
    .filter(r => r.company || r.job_titles)
    .map(r => ({
      company: r.company || 'Unknown',
      job_titles: r.job_titles || '',
      location: r.location || '',
      eligibility: r.eligibility || '',
      salary: r.salary || '',
      stipend: r.stipend || '',
      referral_form_link: r.referral_form_link || '',
      career_page_link: r.career_page_link || '',
      other_links: r.other_links || '',
      source_message: (r.source_message || '').slice(0, 2000),
    }));

  console.log(`📊 Parsed ${refs.length} valid referrals`);
  
  for (let i = 0; i < refs.length; i += 50) {
    const batch = refs.slice(i, i + 50);
    const { error, data } = await supabase.from('referral_opportunities').insert(batch).select('id');
    if (error) {
      console.error(`❌ Batch ${i}-${i + batch.length} failed:`, error.message);
    } else {
      console.log(`✅ Inserted ${data?.length || 0} referrals (batch ${i + 1}-${i + batch.length})`);
    }
  }
}

async function main() {
  console.log('🚀 Starting Supabase seed...\n');
  await seedDirectJobs();
  console.log('');
  await seedReferralOpportunities();
  console.log('\n✨ Seeding complete!');
}

main().catch(console.error);
