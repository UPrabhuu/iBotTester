import { chromium, Browser, Page, Locator } from 'playwright';

/**
 * Represents a discovered UI element
 */
export interface DiscoveredElement {
  tagName: string;
  text?: string;
  role?: string;
  ariaLabel?: string;
  placeholder?: string;
  type?: string;
  id?: string;
  className?: string;
  name?: string;
  href?: string;
  src?: string;
  value?: string;
  visible: boolean;
  enabled: boolean;
  recommended: {
    locator: string;
    strategy: 'role' | 'label' | 'placeholder' | 'text' | 'testid' | 'css' | 'xpath';
    confidence: number;
  };
  alternatives: Array<{
    locator: string;
    strategy: string;
    confidence: number;
  }>;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Represents a discovered page structure
 */
export interface DiscoveredPage {
  url: string;
  title: string;
  viewport: {
    width: number;
    height: number;
  };
  elements: {
    buttons: DiscoveredElement[];
    inputs: DiscoveredElement[];
    links: DiscoveredElement[];
    headings: DiscoveredElement[];
    forms: DiscoveredElement[];
    interactive: DiscoveredElement[];
    all: DiscoveredElement[];
  };
  metadata: {
    discoveryTime: number;
    elementCount: number;
    uniqueRoles: string[];
    hasNavigation: boolean;
    hasForm: boolean;
    screenshots?: {
      full?: string;
      viewport?: string;
    };
  };
}

/**
 * Options for page discovery
 */
export interface DiscoveryOptions {
  url: string;
  waitForSelector?: string;
  waitTimeout?: number;
  includeHidden?: boolean;
  captureScreenshots?: boolean;
  viewportSize?: { width: number; height: number };
  userAgent?: string;
  extraHTTPHeaders?: Record<string, string>;
  storageState?: string;
}

/**
 * PlaywrightDiscoveryAgent
 * Discovers page elements and generates reliable locators
 */
export class PlaywrightDiscoveryAgent {
  private browser: Browser | null = null;
  private page: Page | null = null;

  /**
   * Discover page structure and elements
   */
  async discoverPage(options: DiscoveryOptions): Promise<DiscoveredPage> {
    const startTime = Date.now();

    try {
      // Launch browser
      this.browser = await chromium.launch({ headless: true });
      const context = await this.browser.newContext({
        viewport: options.viewportSize || { width: 1280, height: 720 },
        userAgent: options.userAgent,
        extraHTTPHeaders: options.extraHTTPHeaders,
        storageState: options.storageState,
      });

      this.page = await context.newPage();

      // Navigate to URL
      await this.page.goto(options.url, { waitUntil: 'networkidle' });

      // Wait for specific selector if provided
      if (options.waitForSelector) {
        await this.page.waitForSelector(options.waitForSelector, {
          timeout: options.waitTimeout || 30000,
        });
      }

      // Get page metadata
      const title = await this.page.title();
      const viewport = this.page.viewportSize() || { width: 1280, height: 720 };

      // Discover elements by category
      const buttons = await this.discoverButtons(options.includeHidden);
      const inputs = await this.discoverInputs(options.includeHidden);
      const links = await this.discoverLinks(options.includeHidden);
      const headings = await this.discoverHeadings();
      const forms = await this.discoverForms();
      const interactive = await this.discoverInteractiveElements(options.includeHidden);

      // Combine all elements
      const allElements = [...buttons, ...inputs, ...links, ...headings, ...forms, ...interactive];

      // Extract unique roles
      const uniqueRoles = [...new Set(allElements.map(e => e.role).filter(Boolean))];

      // Capture screenshots if requested
      let screenshots: { full?: string; viewport?: string } | undefined;
      if (options.captureScreenshots) {
        const fullScreenshot = await this.page.screenshot({
          fullPage: true,
          type: 'png',
        });
        const viewportScreenshot = await this.page.screenshot({
          fullPage: false,
          type: 'png',
        });

        screenshots = {
          full: fullScreenshot.toString('base64'),
          viewport: viewportScreenshot.toString('base64'),
        };
      }

      const discoveryTime = Date.now() - startTime;

      return {
        url: this.page.url(),
        title,
        viewport,
        elements: {
          buttons,
          inputs,
          links,
          headings,
          forms,
          interactive,
          all: allElements,
        },
        metadata: {
          discoveryTime,
          elementCount: allElements.length,
          uniqueRoles: uniqueRoles as string[],
          hasNavigation: links.length > 0,
          hasForm: forms.length > 0,
          screenshots,
        },
      };
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Discover button elements
   */
  private async discoverButtons(includeHidden: boolean = false): Promise<DiscoveredElement[]> {
    if (!this.page) return [];

    const selector = includeHidden
      ? 'button, [role="button"], [type="submit"], [type="button"]'
      : 'button:visible, [role="button"]:visible, [type="submit"]:visible, [type="button"]:visible';

    const elements = await this.page.locator(selector).all();
    const discovered: DiscoveredElement[] = [];

    for (const element of elements) {
      const elementInfo = await this.extractElementInfo(element, 'button');
      if (elementInfo) discovered.push(elementInfo);
    }

    return discovered;
  }

  /**
   * Discover input elements
   */
  private async discoverInputs(includeHidden: boolean = false): Promise<DiscoveredElement[]> {
    if (!this.page) return [];

    const selector = includeHidden
      ? 'input, textarea, select, [role="textbox"], [role="combobox"]'
      : 'input:visible, textarea:visible, select:visible, [role="textbox"]:visible, [role="combobox"]:visible';

    const elements = await this.page.locator(selector).all();
    const discovered: DiscoveredElement[] = [];

    for (const element of elements) {
      const elementInfo = await this.extractElementInfo(element, 'input');
      if (elementInfo) discovered.push(elementInfo);
    }

    return discovered;
  }

  /**
   * Discover link elements
   */
  private async discoverLinks(includeHidden: boolean = false): Promise<DiscoveredElement[]> {
    if (!this.page) return [];

    const selector = includeHidden ? 'a[href]' : 'a[href]:visible';
    const elements = await this.page.locator(selector).all();
    const discovered: DiscoveredElement[] = [];

    for (const element of elements) {
      const elementInfo = await this.extractElementInfo(element, 'link');
      if (elementInfo) discovered.push(elementInfo);
    }

    return discovered;
  }

  /**
   * Discover heading elements
   */
  private async discoverHeadings(): Promise<DiscoveredElement[]> {
    if (!this.page) return [];

    const elements = await this.page.locator('h1, h2, h3, h4, h5, h6').all();
    const discovered: DiscoveredElement[] = [];

    for (const element of elements) {
      const elementInfo = await this.extractElementInfo(element, 'heading');
      if (elementInfo) discovered.push(elementInfo);
    }

    return discovered;
  }

  /**
   * Discover form elements
   */
  private async discoverForms(): Promise<DiscoveredElement[]> {
    if (!this.page) return [];

    const elements = await this.page.locator('form').all();
    const discovered: DiscoveredElement[] = [];

    for (const element of elements) {
      const elementInfo = await this.extractElementInfo(element, 'form');
      if (elementInfo) discovered.push(elementInfo);
    }

    return discovered;
  }

  /**
   * Discover other interactive elements
   */
  private async discoverInteractiveElements(includeHidden: boolean = false): Promise<DiscoveredElement[]> {
    if (!this.page) return [];

    const selector = includeHidden
      ? '[role="tab"], [role="checkbox"], [role="radio"], [role="switch"], [role="slider"], [role="menuitem"]'
      : '[role="tab"]:visible, [role="checkbox"]:visible, [role="radio"]:visible, [role="switch"]:visible, [role="slider"]:visible, [role="menuitem"]:visible';

    const elements = await this.page.locator(selector).all();
    const discovered: DiscoveredElement[] = [];

    for (const element of elements) {
      const elementInfo = await this.extractElementInfo(element, 'interactive');
      if (elementInfo) discovered.push(elementInfo);
    }

    return discovered;
  }

  /**
   * Extract detailed information from an element
   */
  private async extractElementInfo(
    locator: Locator,
    category: string
  ): Promise<DiscoveredElement | null> {
    try {
      const tagName = await locator.evaluate((el) => el.tagName.toLowerCase());
      const text = await locator.innerText().catch(() => undefined);
      const role = await locator.getAttribute('role').catch(() => null);
      const ariaLabel = await locator.getAttribute('aria-label').catch(() => null);
      const placeholder = await locator.getAttribute('placeholder').catch(() => null);
      const type = await locator.getAttribute('type').catch(() => null);
      const id = await locator.getAttribute('id').catch(() => null);
      const className = await locator.getAttribute('class').catch(() => null);
      const name = await locator.getAttribute('name').catch(() => null);
      const href = await locator.getAttribute('href').catch(() => null);
      const src = await locator.getAttribute('src').catch(() => null);
      const value = await locator.inputValue().catch(() => undefined);
      const visible = await locator.isVisible().catch(() => false);
      const enabled = await locator.isEnabled().catch(() => false);
      const boundingBox = await locator.boundingBox().catch(() => undefined);

      // Generate recommended locator strategy
      const recommended = this.generateRecommendedLocator({
        tagName,
        text,
        role: role || undefined,
        ariaLabel: ariaLabel || undefined,
        placeholder: placeholder || undefined,
        type: type || undefined,
        id: id || undefined,
        name: name || undefined,
      });

      // Generate alternative locators
      const alternatives = this.generateAlternativeLocators({
        tagName,
        text,
        role: role || undefined,
        ariaLabel: ariaLabel || undefined,
        placeholder: placeholder || undefined,
        type: type || undefined,
        id: id || undefined,
        className: className || undefined,
        name: name || undefined,
      });

      return {
        tagName,
        text,
        role: role || undefined,
        ariaLabel: ariaLabel || undefined,
        placeholder: placeholder || undefined,
        type: type || undefined,
        id: id || undefined,
        className: className || undefined,
        name: name || undefined,
        href: href || undefined,
        src: src || undefined,
        value,
        visible,
        enabled,
        recommended,
        alternatives,
        boundingBox: boundingBox || undefined,
      };
    } catch (error) {
      console.error('Error extracting element info:', error);
      return null;
    }
  }

  /**
   * Generate the most reliable locator strategy
   */
  private generateRecommendedLocator(attrs: {
    tagName: string;
    text?: string;
    role?: string;
    ariaLabel?: string;
    placeholder?: string;
    type?: string;
    id?: string;
    name?: string;
  }): { locator: string; strategy: 'role' | 'label' | 'placeholder' | 'text' | 'testid' | 'css' | 'xpath'; confidence: number } {
    
    // Priority 1: Role with accessible name
    if (attrs.role && attrs.ariaLabel) {
      return {
        locator: `page.getByRole('${attrs.role}', { name: '${attrs.ariaLabel}' })`,
        strategy: 'role',
        confidence: 0.95,
      };
    }

    // Priority 2: Role with text
    if (attrs.role && attrs.text && attrs.text.length < 50) {
      return {
        locator: `page.getByRole('${attrs.role}', { name: '${attrs.text.trim()}' })`,
        strategy: 'role',
        confidence: 0.9,
      };
    }

    // Priority 3: Label (aria-label)
    if (attrs.ariaLabel) {
      return {
        locator: `page.getByLabel('${attrs.ariaLabel}')`,
        strategy: 'label',
        confidence: 0.85,
      };
    }

    // Priority 4: Placeholder
    if (attrs.placeholder) {
      return {
        locator: `page.getByPlaceholder('${attrs.placeholder}')`,
        strategy: 'placeholder',
        confidence: 0.8,
      };
    }

    // Priority 5: Text content
    if (attrs.text && attrs.text.length < 50) {
      return {
        locator: `page.getByText('${attrs.text.trim()}')`,
        strategy: 'text',
        confidence: 0.75,
      };
    }

    // Priority 6: ID
    if (attrs.id) {
      return {
        locator: `page.locator('#${attrs.id}')`,
        strategy: 'css',
        confidence: 0.7,
      };
    }

    // Priority 7: Name attribute
    if (attrs.name) {
      return {
        locator: `page.locator('[name="${attrs.name}"]')`,
        strategy: 'css',
        confidence: 0.65,
      };
    }

    // Fallback: Tag name
    return {
      locator: `page.locator('${attrs.tagName}')`,
      strategy: 'css',
      confidence: 0.4,
    };
  }

  /**
   * Generate alternative locator strategies
   */
  private generateAlternativeLocators(attrs: {
    tagName: string;
    text?: string;
    role?: string;
    ariaLabel?: string;
    placeholder?: string;
    type?: string;
    id?: string;
    className?: string;
    name?: string;
  }): Array<{ locator: string; strategy: string; confidence: number }> {
    const alternatives: Array<{ locator: string; strategy: string; confidence: number }> = [];

    // ID-based
    if (attrs.id) {
      alternatives.push({
        locator: `#${attrs.id}`,
        strategy: 'css',
        confidence: 0.7,
      });
    }

    // Name-based
    if (attrs.name) {
      alternatives.push({
        locator: `[name="${attrs.name}"]`,
        strategy: 'css',
        confidence: 0.65,
      });
    }

    // Type-based (for inputs)
    if (attrs.type) {
      alternatives.push({
        locator: `${attrs.tagName}[type="${attrs.type}"]`,
        strategy: 'css',
        confidence: 0.6,
      });
    }

    // Class-based (less reliable)
    if (attrs.className) {
      const classes = attrs.className.split(' ').filter(c => c.trim());
      if (classes.length > 0) {
        alternatives.push({
          locator: `.${classes[0]}`,
          strategy: 'css',
          confidence: 0.5,
        });
      }
    }

    // XPath with text
    if (attrs.text && attrs.text.length < 50) {
      alternatives.push({
        locator: `//${attrs.tagName}[contains(text(), '${attrs.text.trim()}')]`,
        strategy: 'xpath',
        confidence: 0.7,
      });
    }

    return alternatives;
  }

  /**
   * Find element by natural language description
   */
  async findElementByDescription(
    page: DiscoveredPage,
    description: string
  ): Promise<DiscoveredElement | null> {
    const lowerDesc = description.toLowerCase();
    const words = lowerDesc.split(/\s+/);

    // Search through all elements
    for (const element of page.elements.all) {
      // Match by text content
      if (element.text && words.some(word => element.text!.toLowerCase().includes(word))) {
        return element;
      }

      // Match by aria-label
      if (element.ariaLabel && words.some(word => element.ariaLabel!.toLowerCase().includes(word))) {
        return element;
      }

      // Match by placeholder
      if (element.placeholder && words.some(word => element.placeholder!.toLowerCase().includes(word))) {
        return element;
      }

      // Match by role
      if (element.role && lowerDesc.includes(element.role)) {
        return element;
      }
    }

    return null;
  }

  /**
   * Clean up browser resources
   */
  private async cleanup(): Promise<void> {
    try {
      if (this.page) {
        await this.page.close();
        this.page = null;
      }
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }

  /**
   * Get page screenshot
   */
  async captureScreenshot(
    url: string,
    fullPage: boolean = false
  ): Promise<string> {
    try {
      this.browser = await chromium.launch({ headless: true });
      this.page = await this.browser.newPage();
      await this.page.goto(url, { waitUntil: 'networkidle' });

      const screenshot = await this.page.screenshot({
        fullPage,
        type: 'png',
      });

      return screenshot.toString('base64');
    } finally {
      await this.cleanup();
    }
  }
}
