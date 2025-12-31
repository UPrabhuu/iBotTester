// Intent Parser Agent
// Parses user prompts and extracts intent, target URL, and key actions
import OpenAI from 'openai';

export interface ParsedIntent {
  action: string; // e.g., "purchase", "login", "search", "validate"
  target: string; // e.g., "Nike shoes", "checkout page"
  url?: string; // Extracted URL if present
  constraints?: string[]; // e.g., ["under $150", "size 9"]
  expectedOutcome?: string; // What user expects to happen
  confidence: number; // 0-1 confidence score
}

export class IntentParserAgent {
  private openai: OpenAI | null = null;

  constructor(apiKey?: string) {
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  /**
   * Parse user prompt to extract intent
   */
  async parseIntent(prompt: string): Promise<ParsedIntent> {
    if (!this.openai) {
      return this.parseIntentBasic(prompt);
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an intent parser for a test automation system. Analyze user prompts and extract:
- action: main action type (purchase, login, search, validate, navigate, etc.)
- target: what they're acting on
- url: any URLs mentioned
- constraints: any conditions or filters
- expectedOutcome: what should happen

Return ONLY valid JSON with these fields. Be precise and deterministic.`,
          },
          {
            role: 'user',
            content: `Parse this test request: "${prompt}"`,
          },
        ],
        temperature: 0.1, // Very low for determinism
        max_tokens: 300,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI');
      }

      // Parse JSON response
      let cleaned = content.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }

      const parsed = JSON.parse(cleaned);
      
      return {
        action: parsed.action || 'unknown',
        target: parsed.target || '',
        url: parsed.url,
        constraints: parsed.constraints || [],
        expectedOutcome: parsed.expectedOutcome,
        confidence: 0.9, // High confidence with AI
      };
    } catch (error) {
      console.error('Intent parsing error:', error);
      return this.parseIntentBasic(prompt);
    }
  }

  /**
   * Basic intent parsing without AI
   */
  private parseIntentBasic(prompt: string): ParsedIntent {
    const lowerPrompt = prompt.toLowerCase();
    
    // Extract URL - more comprehensive pattern
    const urlMatch = prompt.match(/(?:on|at|from|visit)\s+((?:https?:\/\/)?(?:[\w-]+\.)+[\w-]+(?::\d+)?(?:\/[^\s]*)?)/i);
    const url = urlMatch ? (urlMatch[1].startsWith('http') ? urlMatch[1] : `https://${urlMatch[1]}`) : undefined;

    // Determine action
    let action = 'navigate';
    if (lowerPrompt.includes('purchase') || lowerPrompt.includes('buy')) {
      action = 'purchase';
    } else if (lowerPrompt.includes('login') || lowerPrompt.includes('sign in')) {
      action = 'login';
    } else if (lowerPrompt.includes('search')) {
      action = 'search';
    } else if (lowerPrompt.includes('validate') || lowerPrompt.includes('check')) {
      action = 'validate';
    }

    // Extract constraints (simple patterns)
    const constraints: string[] = [];
    const priceMatch = prompt.match(/under\s+\$?(\d+)/i);
    if (priceMatch) constraints.push(`under $${priceMatch[1]}`);
    
    const sizeMatch = prompt.match(/size\s+(\d+)/i);
    if (sizeMatch) constraints.push(`size ${sizeMatch[1]}`);

    return {
      action,
      target: prompt.substring(0, 100),
      url,
      constraints,
      confidence: 0.6, // Lower confidence for basic parsing
    };
  }

  /**
   * Check if AI is available
   */
  isAIAvailable(): boolean {
    return this.openai !== null;
  }
}
