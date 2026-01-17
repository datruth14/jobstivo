"use server";

import ScrapedJob from '@/models/ScrapedJob';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';

/**
 * Fetch jobs using JSearch API with automatic key rotation
 * Supports up to 10 API keys and automatically switches when quota is exhausted
 */
export async function fetchJobs(query: string = "software developer", location: string = "") {
    try {
        await connectDB();

        const searchQuery = location ? `${query} in ${location}` : query;

        // Get all available JSearch API keys from environment (supports up to 10 keys)
        const apiKeys = [
            process.env.RAPIDAPI_KEY,
            process.env.RAPIDAPI_KEY_2,
            process.env.RAPIDAPI_KEY_3,
            process.env.RAPIDAPI_KEY_4,
            process.env.RAPIDAPI_KEY_5,
            process.env.RAPIDAPI_KEY_6,
            process.env.RAPIDAPI_KEY_7,
            process.env.RAPIDAPI_KEY_8,
            process.env.RAPIDAPI_KEY_9,
            process.env.RAPIDAPI_KEY_10,
        ].filter(Boolean); // Remove undefined/null keys

        if (apiKeys.length === 0) {
            console.error("No JSearch API keys configured!");
            return { success: false, error: "No JSearch API keys available", count: 0 };
        }

        console.log(`Fetching jobs via JSearch API for: ${searchQuery}...`);
        console.log(`Available API keys: ${apiKeys.length}`);

        let lastError = null;

        // Try each API key in sequence until one works
        for (let i = 0; i < apiKeys.length; i++) {
            const apiKey = apiKeys[i];
            const keyNumber = i + 1;

            try {
                console.log(`Trying JSearch API key #${keyNumber}...`);

                // JSearch API endpoint
                const jsearchUrl = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(searchQuery)}&page=1&num_pages=1`;

                const response = await fetch(jsearchUrl, {
                    method: "GET",
                    headers: {
                        "x-rapidapi-key": apiKey as string,
                        "x-rapidapi-host": "jsearch.p.rapidapi.com",
                    },
                });

                // Check for quota exceeded (429) or other errors
                if (response.status === 429) {
                    console.warn(`JSearch API key #${keyNumber} quota exceeded (429). Trying next key...`);
                    lastError = `API key #${keyNumber} quota exceeded`;
                    continue; // Try next key
                }

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`JSearch API Error with key #${keyNumber}:`, response.status, errorText);
                    lastError = `API key #${keyNumber} error: ${response.status}`;
                    continue; // Try next key
                }

                const data = await response.json();

                if (!data.data || !Array.isArray(data.data)) {
                    console.log(`No jobs found in JSearch response with key #${keyNumber}`);
                    return { success: true, count: 0, source: "JSearch API", keyUsed: keyNumber };
                }

                const jobsData = data.data.map((job: any) => ({
                    title: job.job_title || "Untitled Position",
                    company: job.employer_name || "Company",
                    location: `${job.job_city || ''}${job.job_city && job.job_country ? ', ' : ''}${job.job_country || ''}` || "Remote",
                    salary: job.job_min_salary && job.job_max_salary
                        ? `$${job.job_min_salary} - $${job.job_max_salary}`
                        : (job.job_salary_currency ? "Salary: Negotiable" : "Not specified"),
                    description: job.job_description || `${job.job_title} position at ${job.employer_name}.`,
                    applyLink: job.job_apply_link || `https://www.google.com/search?q=${encodeURIComponent(job.job_title + " at " + job.employer_name)}`,
                    source: "JSearch API",
                    postedAt: job.job_posted_at_datetime_utc ? new Date(job.job_posted_at_datetime_utc) : new Date()
                }));

                console.log(`✅ Success with JSearch API key #${keyNumber}! Found ${jobsData.length} jobs.`);

                let addedCount = 0;
                for (const job of jobsData) {
                    try {
                        await ScrapedJob.findOneAndUpdate(
                            { applyLink: job.applyLink },
                            { $set: job },
                            { upsert: true, new: true }
                        );
                        addedCount++;
                    } catch (err) {
                        console.error("Error saving job:", err);
                    }
                }

                console.log(`JSearch API fetch completed. Added/Updated ${addedCount} jobs using API key #${keyNumber}.`);
                return {
                    success: true,
                    count: addedCount,
                    source: "JSearch API",
                    keyUsed: keyNumber,
                    totalKeys: apiKeys.length
                };

            } catch (error: any) {
                console.error(`Error with JSearch API key #${keyNumber}:`, error.message);
                lastError = error.message;
                continue; // Try next key
            }
        }

        // If we get here, all keys failed
        console.error("All JSearch API keys exhausted or failed!");
        return {
            success: false,
            error: `All ${apiKeys.length} API keys failed. Last error: ${lastError}`,
            count: 0
        };

    } catch (error: any) {
        console.error("JSearch API fetch error:", error);
        return { success: false, error: error.message, count: 0 };
    }
}
