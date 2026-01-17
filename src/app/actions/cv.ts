"use server";

import pdf from 'pdf-parse-fork';

/**
 * Extracts text from a PDF file
 */
export async function parsePdfAction(formData: FormData) {
    try {
        const file = formData.get('file') as File;
        if (!file) {
            return { success: false, error: "No file provided" };
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const data = await pdf(buffer);

        if (!data || !data.text) {
            return { success: false, error: "Could not extract text from PDF" };
        }

        return { success: true, text: data.text };
    } catch (error: any) {
        console.error("PDF Parsing Error:", error);
        return { success: false, error: `Parsing failed: ${error.message || 'Unknown error'}` };
    }
}
