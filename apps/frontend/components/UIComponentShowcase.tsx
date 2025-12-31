import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import Badge from '@/components/ui/Badge';
import Card, {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import Divider from '@/components/ui/Divider';
import {
  ArrowRight,
  Download,
  Mail,
  Lock,
  Search,
  Check,
  X,
  AlertTriangle,
  Eye,
  EyeOff,
} from 'lucide-react';

const UIComponentShowcase: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [comment, setComment] = useState('');

  const simulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center">
          <Heading as="h1" gradient>
            UI Component Library
          </Heading>
          <Text size="lg" color="text-neutral-600" className="mt-2">
            Reusable, accessible, and customizable components for iBotTester
          </Text>
        </div>

        <Divider />

        {/* Button Section */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Button Component</CardTitle>
              <CardDescription>
                Versatile buttons with multiple variants, sizes, and states
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Variants */}
                <div>
                  <Text weight="semibold" className="mb-3">
                    Variants
                  </Text>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="danger">Danger</Button>
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <Text weight="semibold" className="mb-3">
                    Sizes
                  </Text>
                  <div className="flex flex-wrap gap-3 items-center">
                    <Button size="sm">Small</Button>
                    <Button size="md">Medium</Button>
                    <Button size="lg">Large</Button>
                  </div>
                </div>

                {/* With Icons */}
                <div>
                  <Text weight="semibold" className="mb-3">
                    With Icons
                  </Text>
                  <div className="flex flex-wrap gap-3">
                    <Button leftIcon={<Download size={16} />}>Download</Button>
                    <Button rightIcon={<ArrowRight size={16} />}>
                      Continue
                    </Button>
                    <Button
                      variant="secondary"
                      leftIcon={<Mail size={16} />}
                    >
                      Email
                    </Button>
                  </div>
                </div>

                {/* States */}
                <div>
                  <Text weight="semibold" className="mb-3">
                    States
                  </Text>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      isLoading={isLoading}
                      onClick={simulateLoading}
                    >
                      {isLoading ? 'Processing...' : 'Submit'}
                    </Button>
                    <Button disabled>Disabled</Button>
                    <Button fullWidth variant="primary">
                      Full Width
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Input Section */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Input Component</CardTitle>
              <CardDescription>
                Flexible input fields with labels, icons, and validation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <Input
                  label="Search"
                  leftIcon={<Search size={20} />}
                  placeholder="Search..."
                />

                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  leftIcon={<Lock size={20} />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  }
                  placeholder="Enter password"
                />

                <Input
                  label="Username"
                  helperText="Choose a unique username"
                  placeholder="johndoe"
                />

                <Input
                  label="Email with Error"
                  type="email"
                  leftIcon={<Mail size={20} />}
                  error={true}
                  errorMessage="Please enter a valid email address"
                  value="invalid-email"
                />

                <Input
                  variant="filled"
                  label="API Key"
                  placeholder="Enter your API key"
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Textarea Section */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Textarea Component</CardTitle>
              <CardDescription>
                Multiline text input with resize options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Textarea
                  label="Description"
                  placeholder="Enter test description..."
                  rows={4}
                />

                <Textarea
                  label="Comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  helperText={`${comment.length}/500 characters`}
                  rows={4}
                  maxLength={500}
                />

                <Textarea
                  label="Fixed Size"
                  resize="none"
                  rows={3}
                  placeholder="This textarea cannot be resized"
                />

                <Textarea
                  label="With Error"
                  error={true}
                  errorMessage="This field is required"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Typography Section */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Typography Components</CardTitle>
              <CardDescription>
                Headings and text with flexible styling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Text weight="semibold" className="mb-3">
                    Headings
                  </Text>
                  <div className="space-y-2">
                    <Heading as="h1">Heading 1</Heading>
                    <Heading as="h2">Heading 2</Heading>
                    <Heading as="h3">Heading 3</Heading>
                    <Heading as="h4">Heading 4</Heading>
                    <Heading as="h5">Heading 5</Heading>
                    <Heading as="h6">Heading 6</Heading>
                    <Heading as="h2" gradient>
                      Gradient Heading
                    </Heading>
                  </div>
                </div>

                <Divider />

                <div>
                  <Text weight="semibold" className="mb-3">
                    Text Sizes
                  </Text>
                  <div className="space-y-2">
                    <Text size="xs">Extra small text</Text>
                    <Text size="sm">Small text</Text>
                    <Text size="base">Base text</Text>
                    <Text size="lg">Large text</Text>
                    <Text size="xl">Extra large text</Text>
                  </div>
                </div>

                <Divider />

                <div>
                  <Text weight="semibold" className="mb-3">
                    Text Weights
                  </Text>
                  <div className="space-y-2">
                    <Text weight="normal">Normal weight</Text>
                    <Text weight="medium">Medium weight</Text>
                    <Text weight="semibold">Semibold weight</Text>
                    <Text weight="bold">Bold weight</Text>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Badge Section */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Badge Component</CardTitle>
              <CardDescription>
                Status indicators and labels with variants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Text weight="semibold" className="mb-3">
                    Variants
                  </Text>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="default">Default</Badge>
                    <Badge variant="primary">Primary</Badge>
                    <Badge variant="success">Success</Badge>
                    <Badge variant="warning">Warning</Badge>
                    <Badge variant="danger">Danger</Badge>
                    <Badge variant="info">Info</Badge>
                  </div>
                </div>

                <div>
                  <Text weight="semibold" className="mb-3">
                    Outlined
                  </Text>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="primary" outlined>
                      Primary
                    </Badge>
                    <Badge variant="success" outlined>
                      Success
                    </Badge>
                    <Badge variant="danger" outlined>
                      Danger
                    </Badge>
                  </div>
                </div>

                <div>
                  <Text weight="semibold" className="mb-3">
                    With Icons
                  </Text>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="success" icon={<Check size={14} />}>
                      Passed
                    </Badge>
                    <Badge variant="danger" icon={<X size={14} />}>
                      Failed
                    </Badge>
                    <Badge variant="warning" icon={<AlertTriangle size={14} />}>
                      Warning
                    </Badge>
                  </div>
                </div>

                <div>
                  <Text weight="semibold" className="mb-3">
                    Dot Indicators
                  </Text>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="success" dot>
                      Online
                    </Badge>
                    <Badge variant="danger" dot>
                      Offline
                    </Badge>
                    <Badge variant="warning" dot>
                      Away
                    </Badge>
                  </div>
                </div>

                <div>
                  <Text weight="semibold" className="mb-3">
                    Sizes
                  </Text>
                  <div className="flex flex-wrap gap-2 items-center">
                    <Badge size="sm">Small</Badge>
                    <Badge size="md">Medium</Badge>
                    <Badge size="lg">Large</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Card Section */}
        <section>
          <div className="space-y-4">
            <Heading as="h2">Card Component</Heading>
            <Text color="text-neutral-600">
              Container component with header, content, and footer sections
            </Text>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Card</CardTitle>
                  <CardDescription>Simple card with content</CardDescription>
                </CardHeader>
                <CardContent>
                  <Text>This is a basic card with default styling.</Text>
                </CardContent>
              </Card>

              <Card variant="bordered">
                <CardHeader>
                  <CardTitle>Bordered Card</CardTitle>
                  <CardDescription>Card with thicker border</CardDescription>
                </CardHeader>
                <CardContent>
                  <Text>This card has a 2px border for emphasis.</Text>
                </CardContent>
              </Card>

              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Elevated Card</CardTitle>
                  <CardDescription>Card with shadow elevation</CardDescription>
                </CardHeader>
                <CardContent>
                  <Text>This card uses shadow instead of border.</Text>
                </CardContent>
              </Card>

              <Card hoverable>
                <CardHeader>
                  <CardTitle>Hoverable Card</CardTitle>
                  <CardDescription>Hover to see the effect</CardDescription>
                </CardHeader>
                <CardContent>
                  <Text>This card has hover animations.</Text>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>With Footer</CardTitle>
                  <CardDescription>Card with action footer</CardDescription>
                </CardHeader>
                <CardContent>
                  <Text>Content goes here.</Text>
                </CardContent>
                <CardFooter>
                  <Button variant="primary" size="sm" fullWidth>
                    Action
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Test Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <Text size="xl" weight="bold" color="text-blue-600" as="div">
                      245
                    </Text>
                    <Text size="sm" color="text-neutral-500">
                      Total Tests
                    </Text>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Spinner Section */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Spinner Component</CardTitle>
              <CardDescription>Loading indicators with variants</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Text weight="semibold" className="mb-3">
                    Sizes
                  </Text>
                  <div className="flex flex-wrap gap-6 items-center">
                    <Spinner size="xs" />
                    <Spinner size="sm" />
                    <Spinner size="md" />
                    <Spinner size="lg" />
                    <Spinner size="xl" />
                  </div>
                </div>

                <div>
                  <Text weight="semibold" className="mb-3">
                    With Labels
                  </Text>
                  <div className="flex flex-wrap gap-6">
                    <Spinner label="Loading..." />
                    <Spinner label="Processing..." variant="secondary" />
                  </div>
                </div>

                <div>
                  <Text weight="semibold" className="mb-3">
                    Centered
                  </Text>
                  <div className="h-32 border border-neutral-200 rounded-lg">
                    <Spinner centered label="Loading content..." />
                  </div>
                </div>

                <div>
                  <Text weight="semibold" className="mb-3">
                    Variants
                  </Text>
                  <div className="flex flex-wrap gap-6">
                    <Spinner variant="primary" label="Primary" />
                    <Spinner variant="secondary" label="Secondary" />
                    <div className="bg-neutral-800 p-4 rounded-lg">
                      <Spinner variant="white" label="White" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Divider Section */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Divider Component</CardTitle>
              <CardDescription>
                Horizontal and vertical separators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Text weight="semibold" className="mb-3">
                    Horizontal Dividers
                  </Text>
                  <div className="space-y-4">
                    <div>
                      <Text size="sm" color="text-neutral-500">Solid</Text>
                      <Divider variant="solid" />
                    </div>
                    <div>
                      <Text size="sm" color="text-neutral-500">Dashed</Text>
                      <Divider variant="dashed" />
                    </div>
                    <div>
                      <Text size="sm" color="text-neutral-500">Dotted</Text>
                      <Divider variant="dotted" />
                    </div>
                  </div>
                </div>

                <div>
                  <Text weight="semibold" className="mb-3">
                    With Label
                  </Text>
                  <Divider label="OR" />
                </div>

                <div>
                  <Text weight="semibold" className="mb-3">
                    Vertical Divider
                  </Text>
                  <div className="flex items-center h-12 gap-4">
                    <Text>Left Content</Text>
                    <Divider orientation="vertical" />
                    <Text>Center Content</Text>
                    <Divider orientation="vertical" />
                    <Text>Right Content</Text>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <div className="text-center pt-8">
          <Divider />
          <Text size="sm" color="text-neutral-500" className="mt-8">
            UI Component Library for iBotTester • Built with React, TypeScript & Tailwind CSS
          </Text>
        </div>
      </div>
    </div>
  );
};

export default UIComponentShowcase;
