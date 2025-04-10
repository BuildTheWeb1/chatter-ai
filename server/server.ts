import cors from "cors";
import express from "express";
import type { Request, Response } from "express";
import dotenv from "dotenv";
import { join } from "node:path";
import { existsSync, readFileSync } from "node:fs";

// Load environment variables from .env file
dotenv.config();

// Check if .env.local exists and load it (it overrides .env)
const envLocalPath = join(__dirname, "../.env.local");
if (existsSync(envLocalPath)) {
  // Use dotenv.parse to parse the file content
  const envLocalContent = readFileSync(envLocalPath, 'utf8');
  const envLocalConfig = dotenv.parse(envLocalContent);
  
  // Add parsed variables to process.env
  for (const key in envLocalConfig) {
    if (Object.prototype.hasOwnProperty.call(envLocalConfig, key)) {
      process.env[key] = envLocalConfig[key];
    }
  }
}

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for your React app
app.use(cors());
// Parse JSON bodies
app.use(express.json());

// OpenAI API types
interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenAIErrorResponse {
  error?: {
    message?: string;
  };
}

interface OpenAISuccessResponse {
  choices: {
    message: OpenAIMessage;
    finish_reason: string;
    index: number;
  }[];
}

// Define route handlers
const handleChatRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message } = req.body;
    
    // Get API key from environment variables (server-side only)
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      res.status(500).json({ 
        error: "OpenAI API key is missing. Please set the OPENAI_API_KEY environment variable." 
      });
      return;
    }
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 150,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json() as OpenAIErrorResponse;
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json() as OpenAISuccessResponse;
    res.json({ 
      response: data.choices[0]?.message?.content || "No response generated" 
    });
    
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    res.status(500).json({ 
      error: "Failed to get response from AI service" 
    });
  }
};

// OpenAI API proxy endpoint
app.post("/api/chat", handleChatRequest);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
