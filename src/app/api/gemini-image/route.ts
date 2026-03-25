import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import sharp from 'sharp';

// Google Gemini Image Generation API route
const API_KEY = process.env.GOOGLE_CLOUD_API_KEY;

if (!API_KEY) {
    console.error("GOOGLE_CLOUD_API_KEY is not set. Please add it to your .env file.");
}

// Helper function to detect and extract MIME type from base64 data URL
function extractImageData(imageData: string): { mimeType: string; base64Data: string } {
    if (imageData.startsWith('data:')) {
        const matches = imageData.match(/^data:([^;]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
            return {
                mimeType: matches[1],
                base64Data: matches[2]
            };
        }
    }

    const base64Data = imageData.trim();
    let mimeType = 'image/jpeg'; // default

    if (base64Data.startsWith('/9j/')) {
        mimeType = 'image/jpeg';
    } else if (base64Data.startsWith('iVBORw0KGgo')) {
        mimeType = 'image/png';
    } else if (base64Data.startsWith('R0lGODlh') || base64Data.startsWith('R0lGODdh')) {
        mimeType = 'image/gif';
    } else if (base64Data.startsWith('UklGR')) {
        mimeType = 'image/webp';
    }

    return { mimeType, base64Data };
}

// Helper function to optimize the image received from Gemini
async function optimizeReceivedImage(base64Data: string, mimeType: string): Promise<{ optimizedBase64: string; newMimeType: string }> {
    try {
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // Apply optimization using sharp
        const sharpInstance = sharp(imageBuffer);

        // If PNG, apply compression
        if (mimeType === 'image/png') {
            const optimizedBuffer = await sharpInstance
                .png({ compressionLevel: 9, quality: 100 })
                .toBuffer();
            return {
                optimizedBase64: optimizedBuffer.toString('base64'),
                newMimeType: 'image/png'
            };
        }

        // Default to webp for better compression if not PNG
        const optimizedBuffer = await sharpInstance
            .webp({ quality: 85 })
            .toBuffer();

        return {
            optimizedBase64: optimizedBuffer.toString('base64'),
            newMimeType: 'image/webp'
        };
    } catch (error) {
        console.error("Error optimizing received image with sharp:", error);
        return { optimizedBase64: base64Data, newMimeType: mimeType };
    }
}

function isValidBase64(str: string): boolean {
    try {
        const cleaned = str.replace(/\s/g, '');
        return /^[A-Za-z0-9+/]*={0,2}$/.test(cleaned) && cleaned.length % 4 === 0;
    } catch {
        return false;
    }
}

export async function POST(req: NextRequest) {
    try {
        if (!API_KEY) {
            return NextResponse.json({
                error: "GOOGLE_CLOUD_API_KEY is not set. Please add it to your .env file."
            }, { status: 500 });
        }

        const body = await req.json();
        const { prompt, imageData, imageDataList, model: requestedModel, aspectRatio, resolution } = body;

        if (!prompt) {
            return NextResponse.json({ error: "A prompt is required." }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(API_KEY);

        // Default models based on user requirements
        const modelName = requestedModel || process.env.NEXT_PUBLIC_MODEL || "gemini-2.5-flash-image";

        // Initialize model
        const model = genAI.getGenerativeModel({
            model: modelName,
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE }
            ]
        });

        // Prepare prompt and images
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const promptParts: any[] = [];

        const addImagePart = (imgData: string) => {
            const { mimeType, base64Data } = extractImageData(imgData);
            if (isValidBase64(base64Data)) {
                promptParts.push({
                    inlineData: {
                        mimeType,
                        data: base64Data
                    }
                });
                return true;
            }
            return false;
        };

        if (imageData) addImagePart(imageData);
        if (Array.isArray(imageDataList)) {
            imageDataList.forEach(img => addImagePart(img));
        }

        // Construct prefix/postfix prompt as requested
        const totalImages = (imageData ? 1 : 0) + (imageDataList?.length || 0);
        let enhancedPrompt = `You are a professional editor. I have provided a reference image below. Your task is to ENHANCE this specific image based on the prompt: "${prompt}". 

STRICT GUIDELINES:
1. Maintain the exact same core subject, composition, and layout as the provided image.
2. Use the colors, lighting, and style from the reference unless explicitly asked to change them.
3. Only add or modify elements specifically mentioned in the prompt. Do not add anything extra.
4. The output should look like a professional, high-quality version of the PROVIDE image, not a completely new creation.`;

        if (totalImages > 0) {
            enhancedPrompt = `I have provided ${totalImages > 1 ? 'images' : 'the image'} for your reference. ${enhancedPrompt}`;
        }

        if (aspectRatio) {
            enhancedPrompt += ` Aspect ratio: ${aspectRatio}.`;
        }

        promptParts.push(enhancedPrompt);

        // Note: The standard @google/generative-ai generateContent doesn't directly support 
        // responseModalities: ["IMAGE"] via the usual SDK methods in the same way the user's snippet suggested.
        // However, I will follow the user's snippet structure for the response candidate check.

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let result: any;
        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                result = await model.generateContent(promptParts);
                break;
            } catch (error) {
                if (attempt === 2) throw error;
                console.warn(`Attempt ${attempt} failed, retrying...`);
            }
        }

        const response = result.response;
        let imageBase64 = null;
        let imageMimeType = null;
        let textResponse = "";

        try {
            textResponse = response.text();
        } catch (e) {
            // Text might be empty if only image is returned
        }

        // Check for image data in candidates (Common in Gemini Pro Vision / Flash for multi-modal output)
        if (response.candidates && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    imageBase64 = part.inlineData.data;
                    imageMimeType = part.inlineData.mimeType;
                }
            }
        }

        if (imageBase64) {
            const { optimizedBase64, newMimeType } = await optimizeReceivedImage(imageBase64, imageMimeType || 'image/png');
            return NextResponse.json({
                imageUrl: `data:${newMimeType};base64,${optimizedBase64}`,
                textResponse: textResponse || null,
                success: true
            });
        } else if (textResponse) {
            return NextResponse.json({
                textResponse: textResponse,
                success: true,
                warning: "API returned text but no image. The model may not support this type of image generation."
            });
        } else {
            return NextResponse.json({
                error: "No valid response from the API.",
                details: "The model didn't return any content."
            }, { status: 500 });
        }

    } catch (error) {
        console.error("Error in /api/gemini-image:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error instanceof Error ? error.message : "An unknown error occurred"
        }, { status: 500 });
    }
}
