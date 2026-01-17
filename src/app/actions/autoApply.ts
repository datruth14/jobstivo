"use server";

import puppeteer from "puppeteer";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function autoApply(jobUrl: string, userProfile: {
    name: string;
    email: string;
    phone: string;
    experience: string;
    skills: string;
    cvContent: string;
    coverLetter: string;
}) {
    console.log("Starting Auto-Apply for:", jobUrl);
    let browser = null;

    try {
        browser = await puppeteer.launch({
            headless: true, // Run in background
            args: ['--no-sandbox', '--disable-setuid-sandbox'] // Required for some environments
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });

        // Navigate to the job page
        // Timeout set to 60s for slow sites
        await page.goto(jobUrl, { waitUntil: 'networkidle2', timeout: 60000 });

        // 1. Scrape Form Fields
        // We get all inputs, textareas, selects
        // Returns a simplified JSON representation for the AI
        const formFields = await page.evaluate(() => {
            const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
            return inputs.map((el, index) => {
                const e = el as HTMLElement;
                return {
                    id: e.id || '',
                    name: (e as any).name || '',
                    type: (e as any).type || '',
                    placeholder: (e as any).placeholder || '',
                    label: e.previousElementSibling?.textContent?.trim() || '', // Heuristic: Label often precedes input
                    selector: e.id ? `#${e.id}` : (e as any).name ? `[name="${(e as any).name}"]` : null, // Best effort selector
                    index
                };
            }).filter(f => f.type !== 'hidden' && f.type !== 'submit');
        });

        console.log("Found Fields:", formFields.length);

        if (formFields.length === 0) {
            return { success: false, error: "No form fields found on this page. It might not be a direct application form." };
        }

        // 2. AI Mapping
        // Ask OpenAI to map user profile to the found fields
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are an expert form-filling agent. You will receive a list of HTML form fields and a User Profile. Return a JSON object where keys are the field 'selector' (if available, else index) and values are the exact string to type from the user profile. Do not invent information. If no match, omit."
                },
                {
                    role: "user",
                    content: `User Profile:
                    Name: ${userProfile.name}
                    Email: ${userProfile.email}
                    Phone: ${userProfile.phone}
                    CV Text: ${userProfile.cvContent}
                    Cover Letter: ${userProfile.coverLetter}
                    
                    Form Fields: ${JSON.stringify(formFields)}`
                }
            ],
            response_format: { type: "json_object" }
        });

        const mappingResult = JSON.parse(completion.choices[0].message.content || "{}");
        console.log("AI Mapping:", mappingResult);

        // 3. Automation: Fill Fields
        // We iterate through the AI's mapping and fill the data
        const actions = [];
        for (const [selector, value] of Object.entries(mappingResult)) {
            // Basic check to ensure value is a string
            if (typeof value === 'string' && selector) {
                try {
                    // Check if element exists and is visible
                    const element = await page.$(selector);
                    if (element) {
                        // Clear and Type
                        await page.focus(selector);
                        // await page.keyboard.down('Control');
                        // await page.keyboard.press('A');
                        // await page.keyboard.up('Control');
                        // await page.keyboard.press('Backspace');
                        await page.type(selector, value);
                        actions.push(`Filled ${selector}`);
                    }
                } catch (e) {
                    console.error(`Failed to fill ${selector}`, e);
                }
            }
        }

        // 4. Capture Proof
        const timestamp = Date.now();
        const screenshotPath = `public/auto-apply-${timestamp}.png`;
        // In a real app we'd save to blob storage. For this demo we just pretend or save locally if supported.
        // await page.screenshot({ path: screenshotPath }); 

        await browser.close();

        return {
            success: true,
            message: `Successfully filled ${actions.length} fields.`,
            actions
        };

    } catch (error: any) {
        console.error("AutoApply Error:", error);
        if (browser) await browser.close();
        return { success: false, error: error.message || "Automation failed" };
    }
}
