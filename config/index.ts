import fs from 'node:fs';
import path from 'node:path';
import { BoardGameData, EcommerceData, SupportData } from './types';
import { generateBoardGamePrompt } from './prompts/boardGamePrompt';

/**
 * Loads data from a JSON file
 * @param filename The name of the JSON file in the data directory
 * @returns The parsed data
 */
function loadData(filename: string) {
  const dataPath = path.join(__dirname, 'data', filename);
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

/**
 * Generates a system prompt based on the data type
 * @param data The data to use for generating the prompt
 * @returns A formatted system prompt
 */
function generateSystemPrompt(data: BoardGameData | EcommerceData | SupportData): string {
  // Type guard for BoardGameData
  if ('gameName' in data && 'objective' in data) {
    return generateBoardGamePrompt(data as BoardGameData);
  }
  
  // Type guard for EcommerceData
  if ('storeName' in data && 'returnPolicy' in data) {
    // You can add a specific prompt generator for e-commerce here
    // For now, return a simple placeholder
    const ecommerceData = data as EcommerceData;
    return `You are a customer support assistant for ${ecommerceData.storeName}.`;
  }
  
  // Default case
  return 'You are a helpful assistant.';
}

// Export functions
export { loadData, generateSystemPrompt };

// Re-export types
export { BoardGameData, EcommerceData, SupportData };

// Re-export prompt generators
export { generateBoardGamePrompt };
