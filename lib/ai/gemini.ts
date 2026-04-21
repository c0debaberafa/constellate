import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;

/**
 * Checks if an error is a retryable server error (5xx) or timeout
 */
function isRetryableError(error: unknown): boolean {
  if (!error) return false;

  const errorMessage = String(error);
  const errorObj = error as {
    status?: number;
    code?: string;
    message?: string;
  };

  // Check for HTTP status codes >= 500
  if (errorObj.status && errorObj.status >= 500) {
    return true;
  }

  // Check error message for server error indicators
  const message = errorMessage.toLowerCase();
  const serverErrorPatterns = [
    "503",
    "504",
    "500",
    "502",
    "501",
    "timeout",
    "overloaded",
    "service unavailable",
    "internal server error",
    "bad gateway",
    "gateway timeout",
  ];

  return serverErrorPatterns.some((pattern) => message.includes(pattern));
}

/**
 * Wraps an async function with exponential backoff retry logic for retryable errors
 * @param fn The async function to wrap
 * @param operationName Name of the operation for logging purposes
 * @returns The result of the wrapped function
 */
async function withExponentialBackoff<T>(
  fn: () => Promise<T>,
  operationName: string
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if this is a retryable server error
      const isRetryable = isRetryableError(error);
      const isLastAttempt = attempt === MAX_RETRIES - 1;

      // If it's not retryable (client error) or it's the last attempt, throw immediately
      if (!isRetryable || isLastAttempt) {
        throw error;
      }

      // Calculate exponential backoff: INITIAL_BACKOFF_MS * 2^attempt
      const waitTime = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
      console.warn(
        `${operationName} attempt ${
          attempt + 1
        } failed with retryable error. Retrying in ${waitTime}ms...`,
        error
      );

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  // This should never be reached, but TypeScript requires it
  throw lastError || new Error(`${operationName} failed after all retries.`);
}

function safeParseJson<T>(rawText: string, operationName: string): T {
  try {
    return JSON.parse(rawText) as T;
  } catch {
    console.error(`Failed to parse JSON response for ${operationName}:`, rawText);
    throw new Error(`Received malformed JSON from the API for ${operationName}.`);
  }
}
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

  return await withExponentialBackoff(async () => {
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

    return safeParseJson(rawText, "journal_insights_generation");
  }, "Journal insights generation");
}

const profileSchema = {
  type: "object",
  properties: {
    livingEssay: {
      type: "string",
      description:
        "A single, concise but vivid paragraph about the user. This should be written with narrative flow, summarizing the user's origins, present, and future, as well as challenges and successes.",
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
              "A brief writeup on the current state of each theme or topic. 8 words max.",
          },
          motivation: {
            type: "string",
            description:
              "A brief call to action, reminder, or suggestion to protect and foster this pillar. 8 words max. ",
          },
          icon: {
            type: "string",
            description:
              "The name of a Lucide icon that best represents this pillar. Must be one of the following enum.",
            enum: [
              "Flame",
              "Atom",
              "Waves",
              "Wind",
              "Eclipse",
              "Rainbow",
              "Moon",
              "Heart",
              "Brain",
              "Flower",
              "Sprout",
              "Anchor",
              "Snowflake",
              "Rose",
              "TreePalm",
              "TreePine",
            ],
          },
        },
        required: ["title", "writeup", "motivation", "icon"],
      },
    },
    strengthsShadows: {
      type: "object",
      description:
        "A complementary view of where the user shines (strengths) and what they are working through (shadows).",
      properties: {
        strengths: {
          type: "array",
          minItems: 3,
          maxItems: 3,
          description:
            "Exactly 3 strengths. Each item should capture a core way the user naturally is at their best.",
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
                  "A brief, compassionate description of this strength and how it manifests. 16 words max.",
              },
            },
            required: ["title", "writeup"],
          },
        },
        shadows: {
          type: "array",
          minItems: 3,
          maxItems: 3,
          description:
            "Exactly 3 shadows. Each item should describe a hidden way the user is currently experiencing tension or struggling.",
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
                  "A brief, gentle description of the shadow and how it manifests. 16 words max.",
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
  profile: string,
  recentSummaries: string[]
) {
  const recentSummariesText =
    recentSummaries.length > 0
      ? recentSummaries.map((summary, idx) => `${idx + 1}. ${summary}`).join("\n")
      : "None";

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

    Recent Journal Summaries Before This Entry:
    """
    ${recentSummariesText}
    """
    `;

  // TEMPORARY: Log final prompt size
  console.log("=== Gemini Prompt Size Debug ===");
  console.log("Total prompt length:", prompt.length, "chars");
  console.log("Total prompt word count:", prompt.split(/\s+/).length, "words");
  console.log(
    "Estimated tokens (rough):",
    Math.ceil(prompt.length / 4),
    "tokens"
  );
  console.log("=================================");

  return await withExponentialBackoff(async () => {
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

    return safeParseJson(rawText, "profile_generation");
  }, "Profile generation");
}
