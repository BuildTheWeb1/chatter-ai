// Simple test script to verify OpenAI API key is working
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import fs from 'node:fs';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config();

// Check if .env.local exists and load it (it overrides .env)
const envLocalPath = join(__dirname, '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envLocalConfig = dotenv.parse(fs.readFileSync(envLocalPath));
  for (const k in envLocalConfig) {
    process.env[k] = envLocalConfig[k];
  }
}

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error('❌ Error: OPENAI_API_KEY is not set in your environment variables');
  console.log('Please create a .env.local file with your OpenAI API key');
  process.exit(1);
}

console.log('✅ Found OpenAI API key in environment variables');

// Test the OpenAI API
async function testOpenAI() {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Say hello!' }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Successfully connected to OpenAI API');
    console.log('Response:', data.choices[0]?.message?.content);
    return true;
  } catch (error) {
    console.error('❌ Error testing OpenAI API:', error.message);
    return false;
  }
}

testOpenAI();
