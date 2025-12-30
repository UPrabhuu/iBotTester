import express, { Express, Request, Response } from 'express';

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'iBotTester API Server',
    version: '1.0.0',
    status: 'running'
  });
});

app.post('/api/test-plan', (req: Request, res: Response) => {
  const { prompt } = req.body;
  
  res.json({
    success: true,
    testPlan: {
      id: 'test-001',
      prompt,
      steps: [],
      status: 'created'
    }
  });
});

// Error handling
app.use((err: any, req: Request, res: Response) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
