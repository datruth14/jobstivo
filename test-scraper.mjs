// Test script to verify Google Jobs scraper
import { crawlGoogleJobs } from './src/app/actions/crawler';

async function testGoogleJobsScraper() {
    console.log('Testing Google Jobs scraper...\n');

    const result = await crawlGoogleJobs('software developer', 'remote');

    console.log('Result:', JSON.stringify(result, null, 2));

    if (result.success) {
        console.log(`\n✅ Success! Scraped ${result.count} jobs from Google Jobs`);
    } else {
        console.log(`\n❌ Failed: ${result.error}`);
    }

    process.exit(0);
}

testGoogleJobsScraper().catch(console.error);
