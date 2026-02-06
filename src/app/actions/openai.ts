"use server";

import OpenAI from "openai";
import { marked } from "marked";
import connectDB from "@/lib/mongodb";
import User, { ICV } from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

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

export async function generateAndSaveCV(userCV: string, jobDescription: string, jobTitle: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return { success: false, error: "Unauthorized" };
        }

        // 1. Generate the CV using the existing logic (reusing the prompt or calling the internal helper if we refactored, but here I'll inline/call tailorAndApply logic)
        // Actually, let's reuse tailorAndApply but we need just the CV part, or we can just call the OpenAI API similarly.
        // Let's use the same prompt structure as tailorAndApply for consistency.

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are an expert career coach. Your task is to rewriting the user's CV to perfectly match the provided Job Description.
                    
                    CRITICAL INSTRUCTIONS:
                    1. **Aggressive Tailoring**: Do not just copy the old CV. Rewrite specific bullet points to use keywords from the job description.
                    2. **Skills Alignment**: Reorder skills. If the user has a skill that matches the job, highlight it. 
                    3. **Professional Summary**: Completely rewrite the summary to pitch the candidate specifically for THIS job.
                    4. **HTML Format**: Return the result as a full, structured HTML document (without <html>/<body> tags).
                    
                    HTML RULES:
                    - Use <h1> for the candidate's name.
                    - Use <h2> for section headers (Summary, Experience, Education, Skills).
                    - Use <ul>/<li> for lists.
                    - Use <p> for paragraphs.
                    - Use <strong> for emphasis.
                    - NO Markdown syntax.
                    `,
                },
                {
                    role: "user",
                    content: `CANDIDATE CV:\n${userCV}\n\nTARGET JOB DESCRIPTION:\n${jobDescription}`,
                },
            ],
        });

        let content = response.choices[0].message.content || "";
        content = content.replace(/```(markdown)?/g, "").trim();
        const htmlCV = await marked.parse(content);

        // 2. Save to User Profile
        await connectDB();
        const user = await User.findOne({ email: session.user.email });
        if (!user) return { success: false, error: "User not found" };

        const newCV: ICV = {
            name: jobTitle || `CV for ${new Date().toLocaleDateString()}`,
            content: htmlCV,
            isDefault: false,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        user.cvs.push(newCV);
        await user.save();

        // Get the ID of the newly saved CV (it's the last one)
        const savedCV = user.cvs[user.cvs.length - 1];

        return {
            success: true,
            cvId: savedCV?._id?.toString() || "",
            cvContent: htmlCV
        };

    } catch (error: any) {
        console.error("OpenAI Error:", error);
        return {
            success: false,
            error: error.message || "Failed to generate and save CV",
        };
    }
}
