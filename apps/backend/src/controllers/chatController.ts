// Chat controller
import { Request, Response } from 'express';
import {
  successResponse,
  errorResponse,
  createdResponse,
  deletedResponse,
} from '../utils/response';
import prisma from '../utils/prisma';

/**
 * Generate Playwright script from test arguments
 */
function generatePlaywrightScript(testName: string, args: any): string {
  const url = args.url || 'https://example.com';
  const searchQuery = args.searchQuery || args.query || '';
  
  let script = `import { test, expect } from '@playwright/test';\n\n`;
  script += `test('${testName}', async ({ page }) => {\n`;
  script += `  // Navigate to the page\n`;
  script += `  await page.goto('${url}');\n\n`;
  
  if (searchQuery) {
    script += `  // Perform search\n`;
    script += `  await page.getByRole('searchbox').fill('${searchQuery}');\n`;
    script += `  await page.getByRole('button', { name: /search/i }).click();\n\n`;
    script += `  // Wait for results\n`;
    script += `  await page.waitForSelector('[data-testid="results"], .results, #results', { timeout: 10000 });\n\n`;
    script += `  // Validate results are visible\n`;
    script += `  await expect(page.locator('[data-testid="results"], .results, #results')).toBeVisible();\n`;
  } else {
    script += `  // Wait for page to load\n`;
    script += `  await page.waitForLoadState('networkidle');\n\n`;
    script += `  // Validate page title\n`;
    script += `  await expect(page).toHaveTitle(/.+/);\n`;
  }
  
  script += `});\n`;
  
  return script;
}


// GET /api/chat/history
export const getChatHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    const conversations = await prisma.chatConversation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { messages: true },
        },
      },
    });

    res.json(successResponse(conversations));
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

// GET /api/chat/:id
export const getChat = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const conversation = await prisma.chatConversation.findFirst({
      where: { id, userId },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json(errorResponse('Conversation not found'));
    }

    res.json(successResponse(conversation));
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

// POST /api/chat/new
export const createChat = async (req: Request, res: Response) => {
  try {
    const { title } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json(errorResponse('Unauthorized'));
    }

    const conversation = await prisma.chatConversation.create({
      data: {
        userId,
        title: title || 'New Conversation',
      },
    });

    res.status(201).json(createdResponse(conversation));
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

// POST /api/chat/message
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { conversationId, content, role = 'user', projectId, branchId } = req.body;
    const userId = req.user?.id;

    if (!content) {
      return res.status(400).json(errorResponse('content is required'));
    }

    let currentConversationId = conversationId;

    // If no conversationId, create a new conversation
    if (!currentConversationId) {
      const newConversation = await prisma.chatConversation.create({
        data: {
          userId: userId!,
          title: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
          projectId,
          branchId,
        },
      });
      currentConversationId = newConversation.id;
    } else {
      // Verify user owns conversation
      const conversation = await prisma.chatConversation.findFirst({
        where: { id: currentConversationId, userId },
      });

      if (!conversation) {
        return res.status(404).json(errorResponse('Conversation not found'));
      }
    }

    // Create user message
    const userMessage = await prisma.chatMessage.create({
      data: {
        conversationId: currentConversationId,
        role: 'user',
        content,
      },
    });

    // Process with Planner LLM if user message
    if (role === 'user') {
      // Import orchestrator dynamically to avoid circular dependencies
      const { OrchestratorAgent } = await import('../agents/OrchestratorAgent');
      const { IntentParserAgent } = await import('../agents/IntentParserAgent');
      
      const intentParser = new IntentParserAgent(process.env.OPENAI_API_KEY);
      
      try {
        // Check if this is a confirmation to a previous request
        const lowerContent = content.toLowerCase().trim();
        const isConfirmation = ['yes', 'ok', 'okay', 'sure', 'proceed', 'go ahead', 'do it', 'execute', 'create'].some(word => lowerContent.includes(word));
        const isExecuteRequest = ['execute', 'run', 'test it', 'try it'].some(word => lowerContent.includes(word));
        const isCreateRequest = ['create', 'save', 'add'].some(word => lowerContent.includes(word)) && !isExecuteRequest;
        
        // Get previous messages to check for pending test plan
        const previousMessages = await prisma.chatMessage.findMany({
          where: { conversationId: currentConversationId },
          orderBy: { timestamp: 'desc' },
          take: 10, // Look at more messages
        });
        
        // Find the most recent assistant message with a test plan
        let pendingTestPlan = null;
        for (const msg of previousMessages) {
          if (msg.role === 'assistant' && msg.metadata) {
            try {
              const msgMetadata = JSON.parse(msg.metadata as string);
              if (msgMetadata.testPlan && msgMetadata.executed === false) {
                pendingTestPlan = msgMetadata.testPlan;
                console.log('✅ Found pending test plan:', pendingTestPlan);
                break;
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
        
        console.log('🔍 Confirmation check:', { isConfirmation, isExecuteRequest, isCreateRequest, hasPendingTestPlan: !!pendingTestPlan });
        
        // If user wants to execute with full orchestrator workflow
        if (isExecuteRequest && pendingTestPlan) {
          console.log('🚀 Executing full orchestrator workflow...');
          
          // Create progress message for execution
          const progressMessage = await prisma.chatMessage.create({
            data: {
              conversationId: currentConversationId,
              role: 'assistant',
              content: `🚀 Executing Full Agent Workflow\n\n⏳ Starting orchestration...`,
              metadata: JSON.stringify({ type: 'progress', stage: 'orchestrating' }),
            },
          });
          
          // Create execution tracking
          const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          try {
            // Execute full orchestrator agent workflow
            const orchestrator = new OrchestratorAgent(process.env.OPENAI_API_KEY);
            
            const testInput = {
              prompt: pendingTestPlan.args.url 
                ? `Test ${pendingTestPlan.args.testName} on ${pendingTestPlan.args.url}`
                : pendingTestPlan.args.testName || 'Unnamed test',
              environment: pendingTestPlan.args.environment || 'TEST',
              runType: 'single' as const,
              options: {
                headless: true,
                recordVideo: false,
                screenshots: true,
              },
            };
            
            // Update progress
            await prisma.chatMessage.update({
              where: { id: progressMessage.id },
              data: {
                content: `🚀 Full Agent Workflow\n\n✅ Intent parsed\n🔄 Generating test plan\n⏳ Discovering page\n⏳ Executing with Playwright\n⏳ Collecting evidence\n⏳ Generating report`,
                metadata: JSON.stringify({ type: 'progress', stage: 'test-planning' }),
              },
            });
            
            // Emit start update
            await prisma.chatMessage.create({
              data: {
                conversationId: currentConversationId,
                role: 'assistant',
                content: '[Execution Started]',
                metadata: JSON.stringify({
                  type: 'execution-update',
                  executionId,
                  executionUpdate: {
                    type: 'progress',
                    status: 'starting',
                    progress: 0,
                    timestamp: new Date().toISOString(),
                  },
                }),
              },
            });

            // Wrap console.log to track progress
            const originalLog = console.log;
            const logs: string[] = [];
            let stepCount = 0;
            const emitUpdate = async (update: any) => {
              try {
                await prisma.chatMessage.create({
                  data: {
                    conversationId: currentConversationId,
                    role: 'assistant',
                    content: `[Update: ${update.type}]`,
                    metadata: JSON.stringify({
                      type: 'execution-update',
                      executionId,
                      executionUpdate: {
                        type: update.type,
                        status: update.status,
                        progress: update.progress,
                        currentUrl: update.currentUrl,
                        step: update.step,
                        screenshot: update.screenshot,
                        screenshotLabel: update.screenshotLabel,
                        log: update.log,
                        error: update.error,
                        timestamp: new Date().toISOString(),
                      },
                    }),
                  },
                });
              } catch (error) {
                console.error('Failed to emit update:', error);
              }
            };

            console.log = (...args: any[]) => {
              const message = args.map(arg => 
                typeof arg === 'string' ? arg : JSON.stringify(arg)
              ).join(' ');
              
              logs.push(message);
              originalLog(...args);

              // Emit log updates every 5 logs
              if (logs.length % 5 === 0) {
                emitUpdate({
                  type: 'log',
                  log: message,
                }).catch(console.error);
              }

              // Track step execution
              if (message.includes('Step') && message.includes(':')) {
                stepCount++;
                const match = message.match(/Step (\d+):\s*(.+?)(\s*-\s*(.+))?$/);
                if (match) {
                  emitUpdate({
                    type: 'step',
                    status: 'running',
                    progress: Math.min(90, 10 + (stepCount * 5)),
                    step: {
                      number: parseInt(match[1]),
                      action: match[2],
                      description: match[4],
                      timestamp: new Date().toISOString(),
                      status: 'running',
                    },
                  }).catch(console.error);
                }
              }
            };
            
            const result = await orchestrator.executeTestFlow(testInput);
            console.log = originalLog;

            // Emit screenshot updates
            if (result.evidence?.screenshots?.length > 0) {
              for (let i = 0; i < result.evidence.screenshots.length; i++) {
                const screenshot = result.evidence.screenshots[i];
                await emitUpdate({
                  type: 'screenshot',
                  screenshot: screenshot,
                  screenshotLabel: `Screenshot ${i + 1}`,
                  progress: 60 + (i * 5),
                });
              }
            }

            // Mark steps as completed
            if (result.steps?.length > 0) {
              for (let i = 0; i < result.steps.length; i++) {
                const step = result.steps[i];
                await emitUpdate({
                  type: 'step',
                  status: step.status === 'PASS' ? 'completed' : 'failed',
                  progress: 70 + (i * 3),
                  step: {
                    number: i + 1,
                    action: step.action || `Step ${i + 1}`,
                    timestamp: new Date().toISOString(),
                    status: step.status === 'PASS' ? 'completed' : 'failed',
                  },
                });
              }
            }
            
            // Update with results
            const statusEmoji = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
            const confidence = result.confidence || 0;
            const successContent = `${statusEmoji} Test Execution Complete!\n\n**Status:** ${result.status}\n**Test ID:** ${result.testId}\n\n**Steps Executed:** ${result.steps.length}\n**Screenshots:** ${result.evidence.screenshots.length}\n**Logs:** ${result.evidence.logs.length} entries\n\n**Summary:**\n${result.summary}\n\n**Confidence:** ${(confidence * 100).toFixed(0)}%`;
            
            // Emit completion
            await emitUpdate({
              type: 'complete',
              status: 'completed',
              progress: 100,
            });
            
            await prisma.chatMessage.update({
              where: { id: progressMessage.id },
              data: {
                content: successContent,
                metadata: JSON.stringify({ 
                  type: 'execution-result',
                  executionId: executionId,
                  result: {
                    testId: result.testId,
                    status: result.status,
                    stepCount: result.steps.length,
                    confidence: result.confidence,
                  },
                  executed: true,
                }),
              },
            });
            
            const fullConversation = await prisma.chatConversation.findFirst({
              where: { id: currentConversationId },
              include: {
                messages: {
                  orderBy: { timestamp: 'asc' },
                },
              },
            });
            
            return res.status(201).json(createdResponse({
              conversation: fullConversation,
              userMessage,
              executionResult: result,
            }));
            
          } catch (execError: any) {
            console.error('❌ Orchestrator execution failed:', execError);
            
            // Emit error update
            await prisma.chatMessage.create({
              data: {
                conversationId: currentConversationId,
                role: 'assistant',
                content: '[Execution Error]',
                metadata: JSON.stringify({
                  type: 'execution-update',
                  executionId: executionId,
                  executionUpdate: {
                    type: 'error',
                    status: 'failed',
                    error: execError.message,
                    timestamp: new Date().toISOString(),
                  },
                }),
              },
            });
            
            await prisma.chatMessage.update({
              where: { id: progressMessage.id },
              data: {
                content: `❌ Test execution failed:\n\n${execError.message}\n\nPlease try again or create the test case to run later.`,
                metadata: JSON.stringify({ type: 'error', error: execError.message }),
              },
            });
            
            const fullConversation = await prisma.chatConversation.findFirst({
              where: { id: currentConversationId },
              include: {
                messages: {
                  orderBy: { timestamp: 'asc' },
                },
              },
            });
            
            return res.status(201).json(createdResponse({
              conversation: fullConversation,
              userMessage,
              error: execError.message,
            }));
          }
        }
        
        // If user confirmed and there's a pending test plan, create test case
        if ((isConfirmation || isCreateRequest) && pendingTestPlan) {
          console.log('✅ Executing pending test plan...');
          
          // Create progress message
          let progressMessage = await prisma.chatMessage.create({
            data: {
              conversationId: currentConversationId,
              role: 'assistant',
              content: `⚙️ Initiating test creation workflow...\n\n📝 Setting up...`,
              metadata: JSON.stringify({ type: 'progress', stage: 'initializing' }),
            },
          });
          
          // Get user's default project or create one
          let userProject = await prisma.project.findFirst({
            where: { userId: userId! },
            orderBy: { createdAt: 'desc' },
          });
          
          if (!userProject) {
            userProject = await prisma.project.create({
              data: {
                name: 'Default Project',
                description: 'Auto-created project',
                userId: userId!,
              },
            });
          }
          
          // Update progress - Step 1: Analyzing
          await prisma.chatMessage.update({
            where: { id: progressMessage.id },
            data: {
              content: `⚙️ Test Creation Workflow\n\n✅ Analyzing request\n🔄 Creating test structure\n⏳ Saving to database`,
              metadata: JSON.stringify({ type: 'progress', stage: 'analyzing' }),
            },
          });
          
          // Create the test case
          const testName = pendingTestPlan.args.testName || 'Untitled Test';
          console.log('💾 Creating test case:', testName);
          
          // If there's a URL in the args, we can optionally integrate Playwright Discovery
          const shouldDiscoverElements = pendingTestPlan.args.url && false; // Set to true to enable discovery
          
          let testStepsData = pendingTestPlan.args;
          
          // Optional: Use Playwright Discovery Agent if URL is provided
          if (shouldDiscoverElements) {
            try {
              // Update progress - Discovery phase
              await prisma.chatMessage.update({
                where: { id: progressMessage.id },
                data: {
                  content: `⚙️ Test Creation Workflow\n\n✅ Request analyzed\n🔄 Discovering page elements\n⏳ Generating test structure\n⏳ Saving to database`,
                  metadata: JSON.stringify({ type: 'progress', stage: 'discovering' }),
                },
              });
              
              // TODO: Integrate PlaywrightDiscoveryAgent here when needed
              // const discovery = new PlaywrightDiscoveryAgent();
              // const discoveredPage = await discovery.discoverPage(pendingTestPlan.args.url);
              // testStepsData = { ...testStepsData, discoveredElements: discoveredPage };
            } catch (discError) {
              console.warn('⚠️ Discovery failed, continuing with basic test creation:', discError);
            }
          }
          
          // Update progress - Step 2: Creating
          await prisma.chatMessage.update({
            where: { id: progressMessage.id },
            data: {
              content: `⚙️ Test Creation Workflow\n\n✅ Request analyzed\n✅ Test structure created\n🔄 Saving to database`,
              metadata: JSON.stringify({ type: 'progress', stage: 'saving' }),
            },
          });
          
          const testCase = await prisma.testCase.create({
            data: {
              name: testName,
              description: `Test created via chat: ${testName}${pendingTestPlan.args.environment ? ` (${pendingTestPlan.args.environment} environment)` : ''}`,
              projectId: userProject.id,
              status: 'active',
              stepsJson: JSON.stringify(pendingTestPlan.args),
            },
            include: {
              project: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          });
          
          // Create default test steps if not already created
          const defaultSteps = [
            { stepNumber: 1, action: 'Navigate to URL', description: 'Navigate to the test URL', expectedResult: 'Page loaded successfully', uiSection: 'Navigation' },
            { stepNumber: 2, action: 'Validate Content', description: 'Validate page content', expectedResult: 'Content is visible', uiSection: 'Validation' },
          ];
          
          for (const step of defaultSteps) {
            await prisma.testStep.create({
              data: {
                testCaseId: testCase.id,
                stepNumber: step.stepNumber,
                action: step.action,
                expectedResult: step.expectedResult,
                uiSection: step.uiSection,
              },
            });
          }
          
          console.log('✅ Test case created successfully:', testCase.id);
          
          // AUTO-EXECUTE: Execute the test
          await prisma.chatMessage.update({
            where: { id: progressMessage.id },
            data: {
              content: `✅ Test case created successfully!\n\n📋 **Test Name:** ${testCase.name}\n🆔 **Test ID:** ${testCase.id}\n\n🚀 **Status:** WIP - Executing test...`,
              metadata: JSON.stringify({ type: 'progress', stage: 'executing' }),
            },
          });
          
          // Execute the test
          try {
            const { OrchestratorAgent } = await import('../agents/OrchestratorAgent');
            const orchestrator = new OrchestratorAgent(process.env.OPENAI_API_KEY);
            
            const testInput = {
              prompt: `Execute test: ${testCase.name}`,
              options: {
                headless: true,
                screenshots: true,
                recordVideo: false,
              },
            };
            
            const startTime = Date.now();
            const result = await orchestrator.executeTestFlow(testInput);
            const duration = Date.now() - startTime;
            
            // Store execution in database
            const execution = await prisma.execution.create({
              data: {
                testCaseId: testCase.id,
                status: result.status === 'PASS' ? 'passed' : result.status === 'FAIL' ? 'failed' : 'warning',
                startedAt: new Date(startTime),
                completedAt: new Date(),
                duration: duration,
                errorMessage: result.status === 'FAIL' ? result.summary : null,
              },
            });
            
            // Update test steps based on execution results
            if (result.steps && Array.isArray(result.steps)) {
              // Delete existing steps
              await prisma.testStep.deleteMany({
                where: { testCaseId: testCase.id },
              });
              
              // Create new steps from execution results
              for (let i = 0; i < result.steps.length; i++) {
                const step = result.steps[i];
                await prisma.testStep.create({
                  data: {
                    testCaseId: testCase.id,
                    stepNumber: step.step || i + 1,
                    action: step.action || `Step ${i + 1}`,
                    expectedResult: step.status === 'PASS' ? '✅ Passed' : step.status === 'FAIL' ? '❌ Failed' : '⏭️ Skipped',
                    uiSection: 'Execution',
                  },
                });
              }
            }
            
            const statusEmoji = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
            
            // Format steps with completion markers
            let stepsContent = '';
            if (result.steps && result.steps.length > 0) {
              stepsContent = '\n\n📝 **Steps Executed:**\n';
              result.steps.forEach((step: any, index: number) => {
                const stepStatus = step.status === 'passed' || step.status === 'success' ? '✅' : 
                                 step.status === 'failed' || step.status === 'error' ? '❌' : '⚠️';
                stepsContent += `${stepStatus} ${index + 1}. ${step.description || step.action}\n`;
              });
            }
            
            await prisma.chatMessage.update({
              where: { id: progressMessage.id },
              data: {
                content: `${statusEmoji} **Test Execution Complete!**\n\n📋 **Test Name:** ${testCase.name}\n🆔 **Test ID:** ${testCase.id}\n📁 **Project:** ${testCase.project.name}${stepsContent}\n\n📊 **Result:**\n- **Status:** ${result.status}\n- **Screenshots:** ${result.evidence.screenshots.length}\n- **Confidence:** ${result.confidence ? (result.confidence * 100).toFixed(0) : 'N/A'}%\n\nView in Test List for full details.`,
                metadata: JSON.stringify({ 
                  type: 'execution-complete', 
                  testCase: {
                    id: testCase.id,
                    name: testCase.name,
                    projectId: testCase.projectId,
                  },
                  executionResult: {
                    executionId: execution.id,
                    status: result.status,
                    stepCount: result.steps.length,
                    confidence: result.confidence,
                    steps: result.steps,
                  },
                  executed: true,
                }),
              },
            });
          } catch (execError: any) {
            console.error('Test execution failed:', execError);
            
            await prisma.chatMessage.update({
              where: { id: progressMessage.id },
              data: {
                content: `✅ **Test case created!**\n\n📋 **Test Name:** ${testCase.name}\n🆔 **Test ID:** ${testCase.id}\n📁 **Project:** ${testCase.project.name}\n\n⚠️ **Execution Status:** Failed to execute automatically\n\n**Error:** ${execError.message}\n\nYou can run this test manually from the Test Execution panel.`,
                metadata: JSON.stringify({ 
                  type: 'success-with-warning', 
                  testCase: {
                    id: testCase.id,
                    name: testCase.name,
                    projectId: testCase.projectId,
                  },
                  executionError: execError.message,
                  executed: false,
                }),
              },
            });
          }
          
          // Return conversation with updated messages
          const fullConversation = await prisma.chatConversation.findFirst({
            where: { id: currentConversationId },
            include: {
              messages: {
                orderBy: { timestamp: 'asc' },
              },
            },
          });
          
          return res.status(201).json(createdResponse({
            conversation: fullConversation,
            userMessage,
            testCase,
          }));
        }
        
        // Normal flow - parse intent
        const intent = await intentParser.parseIntent(content);
        console.log('📊 Parsed intent:', JSON.stringify(intent, null, 2));
        
        // Create thinking/planning message
        const thinkingMessage = await prisma.chatMessage.create({
          data: {
            conversationId: currentConversationId,
            role: 'assistant',
            content: `🤔 Analyzing your request...`,
            metadata: JSON.stringify({ type: 'thinking', intent }),
          },
        });

        // Generate response based on intent
        let responseContent = '';
        let metadata: any = { intent };

        if (intent.primaryAction === 'CREATE' || intent.primaryAction === 'RUN' || intent.primaryAction === 'CREATE_BULK') {
          // Generate test plan
          const testName = intent.args.testName || intent.args.testPattern || 'test';
          const actionType = intent.primaryAction === 'CREATE' ? 'create' : 'run';
          
          responseContent = `I understand you want to ${actionType} "${testName}"`;
          
          if (intent.args.environment) {
            responseContent += ` in ${intent.args.environment} environment`;
          }
          
          responseContent += `\n\n📋 I'll ${actionType} a test for this. Here's what I'll do:\n\n`;
          responseContent += `1. Create test case: "${testName}"\n`;
          if (intent.args.testName) {
            responseContent += `2. Test name: "${intent.args.testName}"\n`;
          }
          if (intent.args.environment) {
            responseContent += `3. Environment: ${intent.args.environment}\n`;
          }
          if (intent.args.url) {
            responseContent += `4. Target URL: ${intent.args.url}\n`;
          }
          
          // Different question based on action
          if (intent.primaryAction === 'CREATE') {
            responseContent += `\nWould you like me to create this test case?`;
          } else if (intent.primaryAction === 'RUN') {
            responseContent += `\nWould you like me to:\n`;
            responseContent += `- Type 'create' to save as a test case\n`;
            responseContent += `- Type 'execute' to run it with Playwright (full agent workflow)`;
          }
          
          metadata.testPlan = {
            action: intent.primaryAction,
            args: intent.args,
            confidence: intent.confidence,
          };
          metadata.executed = false;
        } else {
          // Generic response
          const testName = intent.args.testName || intent.args.testPattern || 'this';
          responseContent = `I can help you with ${intent.primaryAction.toLowerCase()} "${testName}". `;
          responseContent += `\n\nWhat would you like me to do specifically?`;
        }

        // Create assistant response message
        const assistantMessage = await prisma.chatMessage.create({
          data: {
            conversationId: currentConversationId,
            role: 'assistant',
            content: responseContent,
            metadata: JSON.stringify(metadata),
          },
        });

        // Return conversation with all messages
        const fullConversation = await prisma.chatConversation.findFirst({
          where: { id: currentConversationId },
          include: {
            messages: {
              orderBy: { timestamp: 'asc' },
            },
          },
        });

        res.status(201).json(createdResponse({
          conversation: fullConversation,
          userMessage,
          assistantMessage,
        }));
      } catch (llmError) {
        console.error('LLM processing error:', llmError);
        
        // Create fallback response
        const fallbackMessage = await prisma.chatMessage.create({
          data: {
            conversationId: currentConversationId,
            role: 'assistant',
            content: 'I received your message. However, I encountered an issue processing it with AI. Please try again or rephrase your request.',
          },
        });

        const fullConversation = await prisma.chatConversation.findFirst({
          where: { id: currentConversationId },
          include: {
            messages: {
              orderBy: { timestamp: 'asc' },
            },
          },
        });

        res.status(201).json(createdResponse({
          conversation: fullConversation,
          userMessage,
          assistantMessage: fallbackMessage,
        }));
      }
    } else {
      // Just return the message if it's not a user message
      res.status(201).json(createdResponse(userMessage));
    }
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

// DELETE /api/chat/:id
export const deleteChat = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Verify user owns conversation
    const conversation = await prisma.chatConversation.findFirst({
      where: { id, userId },
    });

    if (!conversation) {
      return res.status(404).json(errorResponse('Conversation not found'));
    }

    // Delete conversation (cascades to messages)
    await prisma.chatConversation.delete({
      where: { id },
    });

    res.json(deletedResponse('Conversation deleted successfully'));
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};

// GET /api/chat/:conversationId/execution-stream - Stream execution updates (SSE)
export const streamExecutionUpdates = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user?.id;

    // Verify user has access to this conversation
    const conversation = await prisma.chatConversation.findFirst({
      where: { id: conversationId, userId },
    });

    if (!conversation) {
      return res.status(404).json(errorResponse('Conversation not found'));
    }

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('X-Accel-Buffering', 'no');

    let lastMessageId = '';
    let isComplete = false;
    const processedUpdates = new Set<string>();

    // Send initial connection message
    res.write(`data: ${JSON.stringify({
      type: 'connected',
      conversationId,
      timestamp: new Date().toISOString(),
    })}\n\n`);

    // Poll for execution updates every 500ms
    const interval = setInterval(async () => {
      if (isComplete) {
        clearInterval(interval);
        res.end();
        return;
      }

      try {
        // Get recent assistant messages with execution metadata
        const messages = await prisma.chatMessage.findMany({
          where: {
            conversationId,
            role: 'assistant',
          },
          orderBy: { timestamp: 'desc' },
          take: 50,
        });

        for (const message of messages) {
          if (message.id === lastMessageId) break;

          if (message.metadata) {
            try {
              const metadata = JSON.parse(message.metadata);

              // Process execution updates
              if (metadata.executionId && metadata.executionUpdate) {
                const updateKey = `${metadata.executionId}-${message.id}`;
                
                if (!processedUpdates.has(updateKey)) {
                  processedUpdates.add(updateKey);
                  
                  const update = metadata.executionUpdate;
                  const eventData = {
                    type: update.type || 'progress',
                    executionId: metadata.executionId,
                    conversationId,
                    currentUrl: update.currentUrl,
                    status: update.status,
                    progress: update.progress,
                    screenshot: update.screenshot,
                    screenshotLabel: update.screenshotLabel,
                    step: update.step,
                    error: update.error,
                    log: update.log,
                    logs: update.logs,
                    totalSteps: update.totalSteps,
                    completedSteps: update.completedSteps,
                    timestamp: message.timestamp.toISOString(),
                  };

                  res.write(`data: ${JSON.stringify(eventData)}\n\n`);

                  // Mark as complete
                  if (update.type === 'complete' || update.type === 'error') {
                    isComplete = true;
                  }
                }
              }

              lastMessageId = message.id;
            } catch (e) {
              // Skip messages with invalid JSON metadata
            }
          }
        }
      } catch (error) {
        console.error('Stream update error:', error);
        clearInterval(interval);
        res.end();
      }
    }, 500);

    // Handle client disconnect
    req.on('close', () => {
      clearInterval(interval);
      res.end();
    });

    // Safety timeout - close connection after 5 minutes
    setTimeout(() => {
      clearInterval(interval);
      res.end();
    }, 5 * 60 * 1000);

  } catch (error) {
    console.error('Stream execution updates error:', error);
    res.status(500).json(errorResponse('Internal server error'));
  }
};
