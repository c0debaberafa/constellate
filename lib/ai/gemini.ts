import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});
// Define the schema using the required JSON Schema format
const journalSchema = {
  // The overall response is a JSON object
  type: "object",
  properties: {
    title: {
      type: "string",
      description:
        "A concise but powerful mantra in first-person perspective that reflects entry content (max 8 words). What is the user really saying here? Is there a deeper subliminal messsage that this journal entry is telling them?",
    },
    summary: {
      type: "object",
      properties: {
        sentence: {
          type: "string",
          description:
            "A short single sentence summary of content (16 words max, something along the lines of 'Today you...')",
        },
        bullets: {
          type: "array",
          items: {
            type: "string",
          },
          description:
            "A list of 4 key topics or takeaways from the entry. Bullet points can include but are not limited to prevalent themes in writing, description of general mood or vibe, or powerful moments.",
        },
      },
      // Require fields
      required: ["sentence", "bullets"],
    },
    highlights: {
      type: "array",
      // Define the structure of each item in the array
      items: {
        type: "object",
        properties: {
          quote: {
            type: "string",
            description:
              "At most 4 direct quotes from the entry content that you feel are important for the user to reflect on or appreciate.",
          },
          annotation: {
            type: "string",
            description:
              "A concise but moving annotation of corresponding quote. Should direct the user towards future action, not simply summarize -- can include but not limited to a suggestion for commitment, an open-ended question for future reflection, or even simple encouragement / appreciation for the line.",
          },
        },
        required: ["quote", "annotation"],
      },
    },
  },
  // Define the fields that must always be present in the final object
  required: ["title", "summary", "highlights"],
};

export async function generateJournalInsights(content: string) {
  const prompt = `
    You are a reflective journal assistant whose role is to guide the user through their mental landscape through insightful analysis of their journal entries.
    As a deeply personal journal guide, you must act as a reflection of their deeper subconcious, adopting their language and fostering their connection with their inner self in a mindful and healthy manner.
    
    Always address the user directly (i.e. "You" instead of "The user" or "They"). 
    Do not use emojis.
    Do not invent content, you must only draw from the journal entry.
    Always reflect, guide, and gently encourage.
    
    
    Journal entry:
    """
    ${content}
    """
    `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: journalSchema,
    },
  });

  const rawText = response.text;
  if (!rawText) {
    throw new Error("Gemini returned no text for the journal insights.");
  }

  try {
    const parsedObject = JSON.parse(rawText);
    return parsedObject;
  } catch (e) {
    console.error("Failed to parse JSON response:", rawText);
    throw new Error("Received malformed JSON from the API.");
  }
}

const profileSchema = {
  type: "object",
  properties: {
    livingEssay: {
      type: "string",
      description:
        "A brief essay about the user's story (4 paragraphs, 8 sentences max).",
    },
    pillars: {
      type: "array",
      minItems: 4,
      maxItems: 4,
      items: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description:
              "The 4 major prevalent themes or topics in the user's spiritual landscape.",
          },
          writeup: {
            type: "string",
            description:
              "A brief writeup on the current state of each theme or topic. 16 words max.",
          },
        },
        required: ["title", "writeup"],
      },
    },
    strengthsShadows: {
      type: "object",
      description:
        "A complementary view of where the user shines (strengths) and what they are working through (shadows).",
      properties: {
        strengths: {
          type: "array",
          minItems: 4,
          maxItems: 4,
          description:
            "Exactly 4 strengths. Each item should capture a core way the user naturally is at their best.",
          items: {
            type: "object",
            properties: {
              title: {
                type: "string",
                description:
                  "A short title naming this strength. 4 words max).",
              },
              writeup: {
                type: "string",
                description:
                  "A brief, compassionate description of this strength, how it manifests, and what can be done about it. 16 words max.",
              },
            },
            required: ["title", "writeup"],
          },
        },
        shadows: {
          type: "array",
          minItems: 4,
          maxItems: 4,
          description:
            "Exactly 4 shadows. Each item should describe a hidden way the user is currently experiencing tension or struggling.",
          items: {
            type: "object",
            properties: {
              title: {
                type: "string",
                description: "A short title naming this shadow",
              },
              writeup: {
                type: "string",
                description:
                  "A brief, gentle description of the current state of this shadow, how it manifests, and what can be done about it. 16 words max.",
              },
            },
            required: ["title", "writeup"],
          },
        },
      },
      required: ["strengths", "shadows"],
    },
    forecast: {
      type: "string",
      description: "A prophecy, prediction, forecast, foretune for the user.",
    },
  },
  required: ["livingEssay", "pillars", "strengthsShadows", "forecast"],
};

export async function generateProfileInsights(
  content: string,
  profile: string
) {
  const prompt = `You are a reflective journal assistant whose role is to guide the user through their mental landscape through insightful analysis of their journal entries.
    As a deeply personal journal guide, you must act as a reflection of their deeper subconcious, adopting their language and fostering their connection with their inner self in a mindful and healthy manner.
    
    Always address the user directly (i.e. "You" instead of "The user" or "They"). 
    Do not use emojis.
    Do not invent content, you must only draw from the journal entry.
    Always reflect, guide, and gently encourage.
    
    Kindly generate the updated user profile given the existing userProfile and new journal entry.
    If there is no pre-existing user profile, kindly create the first.
    
    Journal entry:
    """
    ${content}
    """

    User Profile:
    """
    ${profile}
    """
    `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: profileSchema,
    },
  });

  const rawText = response.text;
  if (!rawText) {
    throw new Error("Gemini returned no text for the profile insights.");
  }

  try {
    const parsedObject = JSON.parse(rawText);
    return parsedObject;
  } catch (e) {
    console.error("Failed to parse JSON response:", rawText);
    throw new Error("Received malformed JSON from the API.");
  }
}
