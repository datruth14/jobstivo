"use client";

import { useState, useEffect } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
    ClassicEditor,
    Bold,
    Essentials,
    Italic,
    Mention,
    Paragraph,
    Undo,
    Heading,
    List,
    Link,
    BlockQuote,
    Alignment,
    Font,
    HeadingConfig,
    Autoformat,
    Code
} from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';

import { marked } from 'marked';

interface RichEditorProps {
    data: string;
    onChange: (data: string) => void;
}

export default function RichEditor({ data, onChange }: RichEditorProps) {
    const [processedData, setProcessedData] = useState<string>("");

    useEffect(() => {
        const process = async () => {
            if (data && !data.includes('<')) {
                const html = await marked.parse(data.replace(/```(markdown)?/g, "").trim());
                setProcessedData(html);
            } else {
                setProcessedData(data || "");
            }
        };
        process();
    }, [data]);

    return (
        <div className="rich-editor-container">
            <style jsx global>{`
                .ck-editor__editable_inline {
                    min-height: 800px;
                    padding: 3rem !important;
                    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
                }
                .ck.ck-editor__main>.ck-editor__editable {
                    background: #fff !important;
                    border: 1px solid #e2e8f0 !important;
                    border-radius: 0 0 40px 40px !important;
                    box-shadow: none !important;
                }
                .ck.ck-toolbar {
                    background: #f8fafc !important;
                    border: 1px solid #e2e8f0 !important;
                    border-radius: 40px 40px 0 0 !important;
                    padding: 0.5rem 1rem !important;
                }
                .ck.ck-button:hover {
                    background: #f1f5f9 !important;
                }
                .ck.ck-button.ck-on {
                    background: #3b82f6 !important;
                    color: #fff !important;
                }
                
                /* Hide the demo/trial banner if it exists */
                .ck-balloon-panel_visible { z-index: 1000 !important; }
                .ck-powered-by { display: none !important; }
            `}</style>
            <CKEditor
                editor={ClassicEditor}
                config={{
                    licenseKey: 'GPL',
                    plugins: [
                        Essentials, Bold, Italic, Paragraph, Mention, Undo,
                        Heading, List, Link, BlockQuote, Alignment, Font,
                        Autoformat, Code
                    ],
                    toolbar: [
                        'undo', 'redo', '|',
                        'heading', '|',
                        'bold', 'italic', '|',
                        'link', 'bulletedList', 'numberedList', 'blockQuote', '|',
                        'alignment', 'fontSize', 'fontColor'
                    ],
                    heading: {
                        options: [
                            { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
                            { model: 'heading1', view: 'h1', title: 'Header 1', class: 'ck-heading_heading1' },
                            { model: 'heading2', view: 'h2', title: 'Header 2', class: 'ck-heading_heading2' }
                        ]
                    } as HeadingConfig
                }}
                data={processedData}
                onChange={(event, editor) => {
                    const content = editor.getData();
                    onChange(content);
                }}
            />
        </div>
    );
}
