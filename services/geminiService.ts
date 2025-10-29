import { GoogleGenAI, Type, Modality, LiveServerMessage } from "@google/genai";
import { CVData, CVDataFromAI, SectionId, JobSuggestion } from "../types.ts";

let ai: GoogleGenAI | null = null;
const API_KEY = process.env.API_KEY;

if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  // Log an error to the console for developers. The UI will handle user feedback.
  console.error("API_KEY environment variable not set. AI features will be disabled.");
}

// Helper function to ensure ai is initialized before use.
// This will be caught by the try/catch blocks in the UI components.
const getAiInstance = (): GoogleGenAI => {
    if (!ai) {
        throw new Error("AI service is not configured. Please ensure the API key is set correctly.");
    }
    return ai;
};


const templatePrompts: Record<string, string> = {
  modern: `
- **Layout:** Use a clean, professional, single-column layout.
- **Summary:** Write a "Professional Summary" section.
- **Style:** Emphasize skills and recent experience. Use horizontal rules sparingly to separate major sections. The overall tone should be contemporary and direct.`,
  'two-column-professional': `
- **Layout:** Use a two-column Markdown table for the main body of the CV.
- **Structure:**
    - The **left column** (wider) should contain: Experience, Education, Projects, Professional Narrative.
    - The **right column** (narrower) should contain: Personal contact details (email, phone, address, links), Skills, Certifications.
- **Header:** The Full Name should be a level 1 heading (#) at the very top, before the table structure, unless a photo is included (see photo instructions).
- **Table Usage:** You MUST use a markdown table to create this layout. It's the only way the styling will work.
- **Example:**
    # Jane Doe
    > A brief, powerful tagline about your professional self.

    | Left Column | Right Column |
    | :--- | :--- |
    | **Experience** <br> ...details... <br> **Education** <br> ...details... | **Contact** <br> ...details... <br> **Skills** <br> ...details... |
`,
  'two-column-creative': `
- **Layout:** Use a two-column Markdown table for the main body of the CV.
- **Structure:**
    - The **left column** (narrower) should contain: Personal contact details (email, phone, address, links), Skills, Certifications.
    - The **right column** (wider) should contain: Experience, Education, Projects, Professional Narrative.
- **Header:** The Full Name should be a level 1 heading (#) at the very top, before the table structure, unless a photo is included (see photo instructions).
- **Table Usage:** You MUST use a markdown table to create this layout. It's the only way the styling will work.
- **Example:**
    # Jane Doe
    > A creative and impactful tagline about your professional self.

    | Left Column | Right Column |
    | :--- | :--- |
    | **Contact** <br> ...details... <br> **Skills** <br> ...details... | **Experience** <br> ...details... <br> **Education** <br> ...details... |
`,
  creative: `
- **Layout:** Use a single-column layout, but with more creative flair.
- **Style:** Use blockquotes for the professional summary or key achievements. Incorporate horizontal rules to visually separate sections. Headings can be more stylized (e.g., using bold and italics). The tone should be energetic and memorable.`,
  classic: `
- **Layout:** A traditional, single-column layout.
- **Style:** Prioritize clarity and chronological order. Use clear, formal headings for each section (e.g., "Work Experience," "Education"). The tone should be formal and professional. No decorative elements.`,
  'eu-cv': `
- **Layout:** A clean, minimal single-column layout.
- **Structure:** Strictly follow this order: Personal Information, Work Experience, Education and Training, Personal Skills.
- **Details:** For personal information, include Nationality. For personal skills, list languages with proficiency levels (e.g., A1, C2). Be comprehensive and clear.
- **Tone:** Formal, direct, and informational.`,
  'ai-content-editor': `
- **Layout:** A modern two-column layout is preferred to separate technical skills from project experience.
- **Focus:** Highlight skills in AI, content creation, prompt engineering, and digital strategy.
- **Projects:** The "Projects" section is crucial. Detail specific AI-driven content projects, mentioning tools, platforms, and outcomes.
- **Style:** Use a professional but tech-forward tone.`,
  'social-media-creative': `
- **Layout:** Visually engaging, can be a single or two-column layout.
- **Focus:** Emphasize social media metrics, successful campaigns, and platform-specific expertise.
- **Portfolio:** A "Portfolio" or "Campaign Highlights" section is highly recommended.
- **Style:** Use a vibrant, modern tone. Emojis can be used sparingly and professionally if appropriate for the target role.`,
  technical: `
- **Layout:** Clean, data-dense, single or two-column layout. A two-column layout with skills on the side is often effective.
- **Skills Section:** This is critical. Group skills by category (e.g., Languages, Frameworks, Databases, Cloud).
- **Projects Section:** Detail technical projects, mentioning the technologies used and your specific role.
- **Style:** Use a direct, information-rich tone. Use code blocks for snippets if relevant.`,
  minimalist: `
- **Layout:** Single-column with generous use of white space.
- **Style:** Focus on typography and a clean hierarchy. Use minimal formatting—light font weights, subtle color, and few decorative elements. The goal is elegance and clarity.`,
};

const languagePrompts: Record<string, string> = {
  en: "Generate the CV in American English.",
  it: "Genera il CV in italiano.",
  fr: "Générez le CV en français.",
  es: "Genera el CV en español.",
  pt: "Gerar o currículo em português.",
  ru: "Создайте резюме на русском языке.",
  ar: "أنشئ السيرة الذاتية باللغة العربية.",
  tr: "CV'yi Türkçe olarak oluşturun.",
  az: "CV-ni Azərbaycan dilində yaradın.",
  'it-ven': "Genera il CV in dialetto veneto (Vèneto). Usa vocaboli e grammatica appropriati della regione.",
  'it-par': "Genera il CV in dialetto parmigiano. Usa vocaboli e grammatica appropriati della regione.",
  'it-rom': "Genera il CV in dialetto romanesco. Usa vocaboli e grammatica appropriati di Roma.",
  'it-abr': "Genera il CV in dialetto abruzzese. Usa vocaboli e grammatica appropriati della regione Abruzzo.",
  'it-sal': "Genera il CV in dialetto salentino. Usa vocaboli e grammatica appropriati della regione salentina.",
  'it-sic': "Genera il CV in dialetto siciliano. Usa vocaboli e grammatica appropriati della regione siciliana.",
  sw: "Tengeneza CV kwa Kiswahili.",
  yo: "Ṣẹda CV ni ede Yorùbá.",
  zu: "Dala i-CV ngesiZulu.",
};


const cvSchema = {
    type: Type.OBJECT,
    properties: {
        personal: {
            type: Type.OBJECT,
            properties: {
                fullName: { type: Type.STRING },
                email: { type: Type.STRING },
                phone: { type: Type.STRING },
                dateOfBirth: { type: Type.STRING, description: 'Format as YYYY-MM-DD' },
                placeOfBirth: { type: Type.STRING },
                residence: { type: Type.STRING },
                linkedin: { type: Type.STRING },
                website: { type: Type.STRING },
                github: { type: Type.STRING },
                twitter: { type: Type.STRING },
            },
            required: ['fullName', 'email', 'phone', 'residence']
        },
        experience: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    jobTitle: { type: Type.STRING },
                    company: { type: Type.STRING },
                    location: { type: Type.STRING },
                    startDate: { type: Type.STRING, description: 'Format as YYYY-MM' },
                    endDate: { type: Type.STRING, description: 'Format as YYYY-MM or "Present"' },
                    responsibilities: { type: Type.STRING, description: 'A detailed description of responsibilities and achievements.' }
                },
                required: ['jobTitle', 'company', 'startDate', 'endDate', 'responsibilities']
            }
        },
        education: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    degree: { type: Type.STRING },
                    institution: { type: Type.STRING },
                    location: { type: Type.STRING },
                    startDate: { type: Type.STRING, description: 'Format as YYYY-MM' },
                    endDate: { type: Type.STRING, description: 'Format as YYYY-MM' },
                    details: { type: Type.STRING, description: 'Any extra details like GPA, honors, etc.' }
                },
                 required: ['degree', 'institution', 'startDate', 'endDate']
            }
        },
        skills: {
            type: Type.STRING,
            description: 'A comma-separated list of key skills.'
        },
        projects: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    technologies: { type: Type.STRING, description: 'Comma-separated list of technologies used.' },
                    link: { type: Type.STRING },
                    description: { type: Type.STRING }
                },
                required: ['name', 'technologies', 'description']
            }
        },
        certifications: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    issuingOrganization: { type: Type.STRING },
                    date: { type: Type.STRING, description: 'Format as YYYY-MM' }
                },
                required: ['name', 'issuingOrganization', 'date']
            }
        },
        professionalNarrative: {
            type: Type.STRING,
            description: "A compelling professional narrative or summary."
        }
    },
    required: ['personal', 'experience', 'education', 'skills', 'projects', 'certifications', 'professionalNarrative']
};


function fileToGenerativePart(file: File) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result !== 'string') {
                return reject(new Error("Failed to read file as base64 string."));
            }
            resolve({
                inlineData: {
                    data: reader.result.split(',')[1],
                    mimeType: file.type
                }
            });
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
    });
}


export const generateCV = async (
    cvData: CVData,
    templateId: string,
    sections: SectionId[],
    language: string,
    photoAlignment: 'left' | 'right' | 'center' | 'none',
    videoAlignment: 'left' | 'right' | 'center' | 'none',
    videoSize: 'small' | 'medium' | 'large'
): Promise<AsyncGenerator<string>> => {
    const localAi = getAiInstance();
    const templateInstruction = templatePrompts[templateId] || templatePrompts.modern;
    const languageInstruction = languagePrompts[language] || languagePrompts.en;

    const includedSections = sections.map(s => `- ${s}`).join('\n');

    let photoInstruction = "The user has not provided a photo or has chosen to hide it.";
    if (cvData.personal.photo && photoAlignment !== 'none') {
        photoInstruction = `A profile photo is provided. Embed it using Markdown like this: ![Profile Photo](${cvData.personal.photo}). You MUST wrap this markdown in a div for alignment: <div class="align-${photoAlignment}">...</div>. Do NOT use a table for the photo unless the template specifically requires a two-column layout where the photo is in one of the columns.`;
    }
    
    let videoInstruction = "A video profile is not provided or is hidden.";
    if (cvData.personal.videoProfileUrl && videoAlignment !== 'none') {
        const videoWidth = videoSize === 'small' ? 200 : videoSize === 'medium' ? 300 : 400;
        videoInstruction = `A video profile is provided. You MUST embed it using an HTML <video> tag. The src for the video is available in the provided JSON data under 'personal.videoProfileUrl'. The video MUST have the 'controls' attribute. Set the video width to '${videoWidth}px'. You MUST wrap the video tag in a div for alignment: <div class="align-${videoAlignment}">...</div>. If a photo is also present, you should place the video and photo together. In two-column layouts, they MUST be in the same column, creating a cohesive personal branding block, typically with the video directly under the photo.`;
    }

    const systemInstruction = `You are an expert CV writer. Your task is to generate a professional CV in Markdown format based on the user's data.
    - Follow all instructions regarding template, language, and structure precisely.
    - Ensure the output is clean, well-formatted Markdown.
    - Do not include any introductory text, comments, or apologies. Output only the CV content.
    - The user's signature, if provided, will be appended separately. Do not include it in your generation.
    - Pay close attention to the requested layout (single vs. two-column) and implement it correctly.
    - Two-column layouts MUST be created using a Markdown table.
    - ${languageInstruction}

    **Template Instructions for '${templateId}':**
    ${templateInstruction}

    **Photo Instructions:**
    ${photoInstruction}

    **Video Instructions:**
    ${videoInstruction}

    **Sections to Include:**
    Based on the user's data, generate content for the following sections:
    ${includedSections}
    `;

    // We omit the photo from the main JSON to save prompt tokens, as it's handled separately in the instructions.
    const data = JSON.stringify({ ...cvData, personal: { ...cvData.personal, photo: 'PHOTO_OMITTED_FOR_PROMPT' } });

    const response = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: `Here is the user's data in JSON format. Use this to generate the CV: ${data}`,
        config: {
            systemInstruction: systemInstruction,
        },
    });

    return (async function*() {
        for await (const chunk of response) {
            yield chunk.text;
        }
        // Append signature if it exists
        if (cvData.signature) {
             yield `\n\n<div style="text-align: right; margin-top: 40px;"><img src="${cvData.signature}" alt="Signature" style="height: 50px; display: inline-block;" /></div>`;
        }
    })();
};

export const parseAndEnhanceCVFromFile = async (file: File, language: string): Promise<CVDataFromAI> => {
    const localAi = getAiInstance();
    const languageInstruction = languagePrompts[language] || languagePrompts.en;
    
    const filePart = await fileToGenerativePart(file);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                filePart,
                {
                    text: `You are an expert CV parser and enhancer. A user has uploaded their CV. Your task is to:
1. Parse the document and extract all relevant information (personal details, work experience, education, skills, projects, certifications, professional narrative).
2. Clean up and standardize the formatting of the extracted data.
3. Enhance the content where possible: improve wording, fix typos, and ensure professional language. Use bullet points for responsibilities and achievements.
4. Populate the provided JSON schema with the parsed and enhanced data.
5. ${languageInstruction}
6. If any section is not present in the CV, return an empty string or empty array for that field in the JSON.
7. For dates, standardize them to YYYY-MM format if possible.

Return ONLY the JSON object that conforms to the schema. Do not include any other text or markdown formatting.`
                }
            ]
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: cvSchema,
        },
    });

    const jsonString = response.text;
    // It's possible for the response to be wrapped in markdown backticks.
    const cleanedJsonString = jsonString.replace(/^```json\s*|```$/g, '');
    return JSON.parse(cleanedJsonString);
};

export const findJobOpportunities = async (cvData: CVData, cities: string, language: string): Promise<JobSuggestion[]> => {
    const localAi = getAiInstance();
    const languageInstruction = languagePrompts[language] || languagePrompts.en;

    const jobSuggestionsSchema = {
        type: Type.OBJECT,
        properties: {
            suggestions: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        jobTitle: { type: Type.STRING },
                        companies: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    careersUrl: { type: Type.STRING }
                                },
                                required: ['name', 'careersUrl']
                            }
                        }
                    },
                    required: ['jobTitle', 'companies']
                }
            }
        },
        required: ['suggestions']
    };

    const videoData = JSON.stringify({ ...cvData, personal: { ...cvData.personal, photo: 'PHOTO_OMITTED_FOR_PROMPT', videoProfileUrl: cvData.personal.videoProfileUrl ? 'VIDEO_URL_PROVIDED' : '' } });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Based on the following CV data, find relevant job opportunities in these cities: ${cities}.
        For each suggested job title, list 3-5 relevant companies and provide a direct link to their careers page.
        ${languageInstruction}

        CV Data:
        ${videoData}`,
        config: {
            responseMimeType: 'application/json',
            responseSchema: jobSuggestionsSchema
        }
    });

    const jsonString = response.text;
    const parsed = JSON.parse(jsonString);
    return parsed.suggestions;
};

export const draftCoverLetter = async (cvData: CVData, jobTitle: string, companyName: string, language: string): Promise<string> => {
    const localAi = getAiInstance();
    const languageInstruction = languagePrompts[language] || languagePrompts.en;

    const videoData = JSON.stringify({ ...cvData, personal: { ...cvData.personal, photo: 'PHOTO_OMITTED_FOR_PROMPT', videoProfileUrl: cvData.personal.videoProfileUrl ? 'VIDEO_URL_PROVIDED' : '' } });

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Based on the provided CV, draft a professional and compelling cover letter for the position of **${jobTitle}** at **${companyName}**.
        The letter should be tailored to the user's experience and skills. It should be concise, professional, and enthusiastic.
        ${languageInstruction}

        CV Data:
        ${videoData}`
    });

    return response.text;
};


export const generateVideoScript = async (cvData: CVData, language: string): Promise<string> => {
    const localAi = getAiInstance();
    const languageInstruction = languagePrompts[language] || languagePrompts.en;
    
    const videoData = JSON.stringify({ ...cvData, personal: { ...cvData.personal, photo: 'PHOTO_OMITTED_FOR_PROMPT', videoProfileUrl: cvData.personal.videoProfileUrl ? 'VIDEO_URL_PROVIDED' : '' } });

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: `Based on the provided CV, generate a concise and engaging script for a 60-second video presentation. The script should be a professional summary that highlights the user's key strengths, experiences, and career goals. It should be written in a natural, conversational tone.
        ${languageInstruction}

        CV Data:
        ${videoData}`,
    });

    return response.text;
};


export const startLiveTranscriptionSession = async (
  onMessage: (message: LiveServerMessage) => void,
  onError: (error: Event) => void,
  language: string
) => {
    const localAi = getAiInstance();
    const languageCodeMapping: Record<string, string> = {
        en: "en-US", it: "it-IT", fr: "fr-FR", es: "es-ES", pt: "pt-BR",
        ru: "ru-RU", ar: "ar-SA", tr: "tr-TR", az: "az-AZ",
        'it-ven': 'it-IT', 'it-par': 'it-IT', 'it-rom': 'it-IT', 'it-abr': 'it-IT', 'it-sal': 'it-IT', 'it-sic': 'it-IT',
        sw: "sw-TZ", yo: "yo-NG", zu: "zu-ZA"
    };

    const session = await localAi.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
            onopen: () => console.log('Live session opened.'),
            onmessage: onMessage,
            onerror: onError,
            onclose: () => console.log('Live session closed.'),
        },
        config: {
            // responseModalities must be an array with a single 'AUDIO' element.
            responseModalities: [Modality.AUDIO],
            inputAudioTranscription: {
                languageCode: languageCodeMapping[language] || 'en-US'
            },
        },
    });

    return session;
};
