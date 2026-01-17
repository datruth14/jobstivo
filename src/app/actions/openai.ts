"use server";

import OpenAI from "openai";
import { marked } from "marked";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generateCV(userInfo: {
    name: string;
    jobTitle: string;
    experience: string;
    skills: string;
}) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are an expert resume builder. Create a structured, professional resume in clean, semantic HTML format.
                    
                    RULES:
                    1. Use ONLY standard HTML tags: <h1>, <h2>, <p>, <ul>, <li>, <strong>, <em>.
                    2. NEVER use Markdown symbols like #, *, -, or __.
                    3. Do NOT include <html>, <head>, or <body> tags. Just the content.
                    4. Ensure a modern, professional layout with sections for Summary, Experience, Education, and Skills.
                    5. Use <h1> for the name and <h2> for section headers.`,
                },
                {
                    role: "user",
                    content: `Name: ${userInfo.name}\nTarget Job Title: ${userInfo.jobTitle}\nExperience: ${userInfo.experience}\nSkills: ${userInfo.skills}`,
                },
            ],
        });

        let rawResume = response.choices[0].message.content || "";
        // Strip markdown code fences more robustly
        rawResume = rawResume.replace(/```(markdown)?/g, "").trim();

        const htmlResume = await marked.parse(rawResume);

        return {
            success: true,
            resume: htmlResume,
        };
    } catch (error: any) {
        console.error("OpenAI Error:", error);
        return {
            success: false,
            error: error.message || "Failed to generate CV",
        };
    }
}

export async function tailorAndApply(cvContent: string, jobDescription: string) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are an expert career coach. Tailor the given CV to the job description and write a compelling cover letter.
                    
                    Return the result in clean, semantic HTML format.
                    
                    RULES:
                    1. Use ONLY standard HTML tags: <h1>, <h2>, <p>, <ul>, <li>, <strong>, <em>.
                    2. NEVER use Markdown symbols like #, *, -, or __.
                    3. Structure the output into two main sections: <div id="tailored-cv"> and <div id="cover-letter">.
                    4. Within each section, use <h1> for the title and <h2> for subheaders.`,
                },
                {
                    role: "user",
                    content: `CV Content: ${cvContent}\n\nJob Description: ${jobDescription}`,
                },
            ],
        });

        const content = response.choices[0].message.content || "";

        // Simple split for demonstration, in a real app you might want structured output
        let [tailoredCV, coverLetter] = content.split(/Cover Letter/i);

        // Strip fences
        tailoredCV = tailoredCV.replace(/```(markdown)?/g, "").trim();
        const cleanCoverLetter = (coverLetter || "").replace(/```(markdown)?/g, "").trim();

        const htmlTailoredCV = await marked.parse(tailoredCV);
        const htmlCoverLetter = cleanCoverLetter ? await marked.parse(cleanCoverLetter) : "";

        return {
            success: true,
            tailoredCV: htmlTailoredCV,
            coverLetter: htmlCoverLetter || "Cover letter generation failed, but CV was tailored.",
        };
    } catch (error: any) {
        console.error("OpenAI Error:", error);
        return {
            success: false,
            error: error.message || "Failed to tailor application",
        };
    }
}

export async function improveUploadedCV(cvContent: string) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are an expert career coach and resume writer. Your task is to take raw text from an uploaded CV and transform it into a professional, modern, and highly-effective resume in clean, semantic HTML.

                    GOALS:
                    1. Re-organize the content into logical sections (Summary, Experience, Education, Skills).
                    2. Improve the language: Use strong action verbs, quantify achievements where possible, and ensure error-free grammar.
                    3. Maintain ALL the core information (dates, companies, degrees) but present it better.
                    
                    RULES:
                    1. Use ONLY standard HTML tags: <h1>, <h2>, <p>, <ul>, <li>, <strong>, <em>.
                    2. NEVER use Markdown symbols like #, *, -, or __.
                    3. Do NOT include <html>, <head>, or <body> tags. Just the content.
                    4. Use <h1> for the name and <h2> for section headers.`,
                },
                {
                    role: "user",
                    content: `Raw CV Content to improve:\n\n${cvContent}`,
                },
            ],
        });

        let content = response.choices[0].message.content || "";
        // Strip fences
        content = content.replace(/```(markdown)?/g, "").trim();

        const htmlResume = await marked.parse(content);

        return {
            success: true,
            resume: htmlResume,
        };
    } catch (error: any) {
        console.error("OpenAI Error:", error);
        return {
            success: false,
            error: error.message || "Failed to improve CV",
        };
    }
}
