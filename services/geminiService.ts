

import { GoogleGenAI, Type, LiveServerMessage } from "@google/genai";
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
    photoAlignment: 'left' | 'right' | 'none'
): Promise<AsyncGenerator<string>> => {
    const localAi = getAiInstance();
    const templateInstruction = templatePrompts[templateId] || templatePrompts.modern;
    const languageInstruction = languagePrompts[language] || languagePrompts.en;

    const includedSections = sections.map(s => `- ${s}`).join('\n');

    let photoInstruction = "The user has not provided a photo. Do not add a placeholder.";
    if (cvData.personal.photo && photoAlignment !== 'none') {
        const alignment = photoAlignment === 'left' ? 'left-aligned' : 'right-aligned';
        photoInstruction = `The user has provided a profile photo. Display it at the top of the CV. To do this, create a Markdown table with two columns. Place the image in one column and the main header/contact info in the other. The image should be ${alignment}. Use this exact markdown for the image, replacing the alt text: ![Profile Photo](${cvData.personal.photo})`;
    }

    const systemInstruction = `You are an expert CV writer. Your task is to generate a professional CV in Markdown format based on the user's data.
    - Follow all instructions regarding template, language, and structure precisely.
    - Ensure the output is clean, well-formatted Markdown.
    - Do not include any introductory text, comments, or apologies. Output only the CV content.
    - The user's signature, if provided, will be appended separately. Do not include it in your generation.
    - Pay close attention to the requested layout (single vs. two-column) and implement it correctly.
    - Two-column layouts MUST be created using a Markdown table.
    - When listing responsibilities, projects, etc., use bullet points for clarity.
    `;
    
    const contents = `
        Please generate a CV with the following specifications:
        **Language:** ${languageInstruction}
        **Template:** ${templateInstruction}
        **Photo Inclusion:** ${photoInstruction}
        **Sections to Include:**
        ${includedSections}

        Here is the user's data in JSON format:
        ${JSON.stringify(cvData, null, 2)}
    `;

    const response = await localAi.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents: [{
            parts: [{ text: contents }]
        }],
        config: {
            systemInstruction
        }
    });

    return (async function*() {
        for await (const chunk of response) {
            yield chunk.text;
        }
    })();
};

export const parseAndEnhanceCVFromFile = async (file: File, language: string): Promise<CVDataFromAI> => {
    const localAi = getAiInstance();
    const filePart = await fileToGenerativePart(file);

    const languageInstruction = languagePrompts[language] || languagePrompts.en;

    const response = await localAi.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{
            parts: [
                {
                    text: `You are an expert CV parser and enhancer. A user has uploaded their CV file. Your task is to:
                    1.  Parse the content of the file.
                    2.  Extract all relevant information (personal details, work experience, education, skills, etc.).
                    3.  Enhance the content: improve wording, fix typos, and ensure a professional tone. For responsibilities and descriptions, use clear, action-oriented bullet points.
                    4.  Format the extracted and enhanced information into the provided JSON schema.
                    5.  The target language for the output is: ${languageInstruction}.
                    6.  Do not invent any information. If a field is not present in the CV, leave it blank in the JSON.
                    `
                },
                filePart
            ]
        }],
        config: {
            responseMimeType: "application/json",
            responseSchema: cvSchema
        }
    });

    const parsedJson = JSON.parse(response.text);

    // Basic validation to ensure the AI's output is structured correctly.
    const result: CVDataFromAI = {
        personal: parsedJson.personal || { socialLinks: [] },
        experience: parsedJson.experience || [],
        education: parsedJson.education || [],
        skills: parsedJson.skills || '',
        projects: parsedJson.projects || [],
        certifications: parsedJson.certifications || [],
        portfolio: [], // AI doesn't generate this from text
        professionalNarrative: parsedJson.professionalNarrative || '',
        videoUrl: '', // Not parsed from text
        signature: ''
    };
    
    return result;
};


export const generateVideoScript = async (cvData: CVData, language: string): Promise<string> => {
    const localAi = getAiInstance();
    const languageInstruction = languagePrompts[language] || languagePrompts.en;
    
    const response = await localAi.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Based on the following CV data, write a short and compelling script (around 60 seconds of speaking time) for a video presentation. The script should be a professional and engaging "elevator pitch".
        
        Instructions:
        - The tone should be confident and professional.
        - Start with a brief introduction.
        - Highlight 2-3 key achievements or skills from the experience/projects sections.
        - Conclude with a call to action (e.g., "I'm excited to bring my skills to a challenging new role and would welcome the opportunity to discuss how I can contribute to your team.").
        - The entire script should be in this language: ${languageInstruction}.
        - Output only the script text, with no preamble or extra formatting.

        CV Data:
        ${JSON.stringify(cvData, null, 2)}`
    });
    return response.text;
};

export const startLiveTranscriptionSession = async (
    onMessage: (message: LiveServerMessage) => void,
    onError: (e: Event) => void,
    language: string
) => {
    const localAi = getAiInstance();
    const languageCode = language.split('-')[0]; // Use base language code for BCP-47
    
    return localAi.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
            onopen: () => console.debug('Live session opened'),
            onmessage: onMessage,
            onerror: (e) => onError(e as Event),
            onclose: () => console.debug('Live session closed'),
        },
        config: {
            inputAudioTranscription: {
                bcp47LanguageCode: languageCode,
            },
        },
    });
};

const jobSuggestionsSchema = {
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
};

export const findJobOpportunities = async (cvData: CVData, cities: string, language: string): Promise<JobSuggestion[]> => {
    const localAi = getAiInstance();
    const languageInstruction = languagePrompts[language] || languagePrompts.en;

    const response = await localAi.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Based on the provided CV, identify 3-5 relevant job titles. For each job title, find 2-3 companies that are likely hiring for such a role in the specified cities. Provide the company name and a direct link to their careers/jobs page.

        CV Data:
        ${JSON.stringify(cvData, null, 2)}

        Target Cities: ${cities}
        Language for job titles: ${languageInstruction}
        `,
        config: {
            responseMimeType: "application/json",
            responseSchema: jobSuggestionsSchema,
        }
    });

    return JSON.parse(response.text) as JobSuggestion[];
};

export const draftCoverLetter = async (cvData: CVData, jobTitle: string, companyName: string, language: string): Promise<string> => {
    const localAi = getAiInstance();
    const languageInstruction = languagePrompts[language] || languagePrompts.en;

    const response = await localAi.models.generateContent({
        model: "gemini-2.5-pro",
        contents: `Based on the provided CV, draft a professional and compelling cover letter for the position of **${jobTitle}** at **${companyName}**.

        Instructions:
        - The tone should be professional, enthusiastic, and tailored to the role.
        - The letter should have three main paragraphs:
            1. Introduction: State the position being applied for and where it was seen (assume a generic job board).
            2. Body: Highlight 2-3 key skills or experiences from the CV that are most relevant to the job title. Connect these skills to the potential value you can bring to ${companyName}.
            3. Conclusion: Reiterate your interest, express eagerness for an interview, and thank the reader.
        - Generate the letter in this language: ${languageInstruction}.
        - Do not include the salutation ("Dear Hiring Manager"), closing ("Sincerely"), or the applicant's name. Output only the body of the letter.

        CV Data:
        ${JSON.stringify(cvData, null, 2)}
        `
    });

    return response.text;
};