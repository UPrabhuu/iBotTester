import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { chromium } from 'playwright';
import OpenAI from 'openai';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Initialize OpenAI (optional - will only work if API key is provided)
let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'iBotTester API Server',
    version: '1.0.0',
    status: 'running',
    features: {
      playwright: true,
      openai: !!openai
    }
  });
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      api: 'running',
      playwright: 'available',
      openai: openai ? 'configured' : 'not configured'
    }
  });
});

app.post('/api/test-plan', async (req: Request, res: Response) => {
  const { prompt } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ 
      success: false, 
      error: 'Prompt is required' 
    });
  }

  try {
    let steps: string[] = [];
    
    // If OpenAI is configured, generate intelligent test steps
    if (openai) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are a test automation expert. Convert user prompts into clear, actionable test steps. Return a JSON array of step descriptions."
            },
            {
              role: "user",
              content: `Create test steps for: ${prompt}`
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        });

        const content = completion.choices[0]?.message?.content;
        if (content) {
          try {
            steps = JSON.parse(content);
          } catch {
            // If not valid JSON, split by newlines
            steps = content.split('\n').filter(s => s.trim());
          }
        }
      } catch (aiError) {
        console.error('OpenAI error:', aiError);
        // Fallback to basic step generation
        steps = [
          'Navigate to the target website',
          'Perform the requested action',
          'Validate the expected result'
        ];
      }
    } else {
      // Basic step generation without AI
      steps = [
        'Navigate to the target website',
        'Perform the requested action',
        'Validate the expected result'
      ];
    }

    const testPlan = {
      id: `test-${Date.now()}`,
      prompt,
      steps,
      status: 'created',
      createdAt: new Date().toISOString()
    };

    res.json({
      success: true,
      testPlan
    });
  } catch (error) {
    console.error('Error creating test plan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create test plan'
    });
  }
});

app.post('/api/execute-test', async (req: Request, res: Response) => {
  const { testPlanId, url } = req.body;
  
  if (!url) {
    return res.status(400).json({ 
      success: false, 
      error: 'URL is required' 
    });
  }

  let browser;
  try {
    // Launch browser
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Navigate to URL
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Take screenshot
    const screenshot = await page.screenshot();
    const screenshotBase64 = screenshot.toString('base64');
    
    // Get page title
    const title = await page.title();

    await browser.close();

    res.json({
      success: true,
      execution: {
        id: `exec-${Date.now()}`,
        testPlanId,
        url,
        title,
        screenshot: `data:image/png;base64,${screenshotBase64}`,
        status: 'completed',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    console.error('Error executing test:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute test'
    });
  }
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`✅ iBotTester API Server running on port ${PORT}`);
  console.log(`📊 Playwright: Available`);
  console.log(`🤖 OpenAI: ${openai ? 'Configured' : 'Not configured (set OPENAI_API_KEY)'}`);
});
