"use server";

export interface JSearchJob {
    job_id: string;
    job_title: string;
    employer_name: string;
    job_city: string;
    job_country: string;
    job_description: string;
    job_apply_link: string;
    job_posted_at_datetime_utc: string;
    job_employment_type: string;
    job_min_salary: number | null;
    job_max_salary: number | null;
    job_salary_currency: string | null;
    job_is_remote: boolean;
    source?: string;
}

/**
 * Get jobs directly from JSearch API with automatic key rotation
 * Supports up to 10 API keys and automatically switches when quota is exhausted
 */
export async function getJobs(query: string = "Developer", page: number = 1, location: string = "") {
    try {
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
            return {
                success: false,
                error: "No JSearch API keys available",
                jobs: [],
                source: "JSearch API"
            };
        }

        console.log(`Fetching jobs via JSearch API for: ${searchQuery}... (Page ${page})`);
        console.log(`Available API keys: ${apiKeys.length}`);

        let lastError = null;

        // Try each API key in sequence until one works
        for (let i = 0; i < apiKeys.length; i++) {
            const apiKey = apiKeys[i];
            const keyNumber = i + 1;

            try {
                console.log(`Trying JSearch API key #${keyNumber}...`);

                // JSearch API endpoint with pagination
                const jsearchUrl = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(searchQuery)}&page=${page}&num_pages=1`;

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
                    return {
                        success: true,
                        jobs: [],
                        source: "JSearch API",
                        message: "No jobs found. Try different search criteria.",
                        keyUsed: keyNumber
                    };
                }

                // Map JSearch API response to our interface
                const jobs: JSearchJob[] = data.data.map((job: any) => ({
                    job_id: job.job_id || Math.random().toString(),
                    job_title: job.job_title || "Untitled Position",
                    employer_name: job.employer_name || "Company",
                    job_city: job.job_city || "",
                    job_country: job.job_country || "",
                    job_description: job.job_description || `${job.job_title} position at ${job.employer_name}.`,
                    job_apply_link: job.job_apply_link || "",
                    job_posted_at_datetime_utc: job.job_posted_at_datetime_utc || new Date().toISOString(),
                    job_employment_type: job.job_employment_type || "FULLTIME",
                    job_min_salary: job.job_min_salary || null,
                    job_max_salary: job.job_max_salary || null,
                    job_salary_currency: job.job_salary_currency || null,
                    job_is_remote: job.job_is_remote || false,
                    source: "JSearch API"
                }));

                console.log(`✅ Success with JSearch API key #${keyNumber}! Found ${jobs.length} jobs.`);

                return {
                    success: true,
                    jobs,
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
            jobs: [],
            source: "JSearch API"
        };

    } catch (error: any) {
        console.error("JSearch API fetch error:", error);
        return {
            success: false,
            error: error.message,
            jobs: [],
            source: "JSearch API"
        };
    }
}
