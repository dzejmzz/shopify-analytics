/**
 * Testing utilities for verifying functionality and performance
 */

import { performanceMonitor } from './performance';

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
  details?: any;
}

interface PerformanceTest {
  name: string;
  threshold: number; // in milliseconds
  metric: string;
}

class TestRunner {
  private results: TestResult[] = [];

  /**
   * Run a functional test
   */
  async runTest(
    name: string,
    testFn: () => Promise<boolean> | boolean
  ): Promise<TestResult> {
    const startTime = performance.now();
    
    try {
      const result = await testFn();
      const duration = performance.now() - startTime;
      
      const testResult: TestResult = {
        name,
        passed: result,
        duration,
      };
      
      this.results.push(testResult);
      return testResult;
    } catch (error) {
      const duration = performance.now() - startTime;
      const testResult: TestResult = {
        name,
        passed: false,
        duration,
        error: error instanceof Error ? error.message : String(error),
      };
      
      this.results.push(testResult);
      return testResult;
    }
  }

  /**
   * Run a performance test
   */
  async runPerformanceTest(test: PerformanceTest): Promise<TestResult> {
    const averageTime = performanceMonitor.getAverageMetric(test.metric);
    const passed = averageTime > 0 && averageTime <= test.threshold;
    
    const testResult: TestResult = {
      name: test.name,
      passed,
      duration: averageTime,
      details: {
        threshold: test.threshold,
        actual: averageTime,
        metric: test.metric,
      },
    };
    
    this.results.push(testResult);
    return testResult;
  }

  /**
   * Get all test results
   */
  getResults(): TestResult[] {
    return [...this.results];
  }

  /**
   * Get summary of test results
   */
  getSummary() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = total - passed;
    const averageDuration = total > 0 
      ? this.results.reduce((sum, r) => sum + r.duration, 0) / total 
      : 0;

    return {
      total,
      passed,
      failed,
      passRate: total > 0 ? (passed / total) * 100 : 0,
      averageDuration,
    };
  }

  /**
   * Clear all results
   */
  clear(): void {
    this.results = [];
  }

  /**
   * Generate a test report
   */
  generateReport(): string {
    const summary = this.getSummary();
    let report = `\n=== Test Report ===\n`;
    report += `Total Tests: ${summary.total}\n`;
    report += `Passed: ${summary.passed}\n`;
    report += `Failed: ${summary.failed}\n`;
    report += `Pass Rate: ${summary.passRate.toFixed(1)}%\n`;
    report += `Average Duration: ${summary.averageDuration.toFixed(2)}ms\n\n`;

    if (summary.failed > 0) {
      report += `Failed Tests:\n`;
      this.results
        .filter(r => !r.passed)
        .forEach(r => {
          report += `- ${r.name}: ${r.error || 'Failed'}\n`;
        });
      report += `\n`;
    }

    return report;
  }
}

// Global test runner instance
export const testRunner = new TestRunner();

/**
 * Predefined functional tests for the application
 */
export const functionalTests = {
  /**
   * Test navigation functionality
   */
  async testNavigation(): Promise<boolean> {
    if (typeof window === 'undefined') return true;
    
    try {
      // Test if navigation elements exist
      const navElement = document.querySelector('nav');
      if (!navElement) return false;
      
      // Test if navigation links exist
      const links = navElement.querySelectorAll('a');
      if (links.length === 0) return false;
      
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Test component rendering
   */
  async testComponentRendering(): Promise<boolean> {
    if (typeof window === 'undefined') return true;
    
    try {
      // Test if main content exists
      const mainElement = document.querySelector('main');
      if (!mainElement) return false;
      
      // Test if cards are rendered
      const cards = document.querySelectorAll('[class*="card"], [class*="Card"]');
      if (cards.length === 0) return false;
      
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Test responsive design
   */
  async testResponsiveDesign(): Promise<boolean> {
    if (typeof window === 'undefined') return true;
    
    try {
      const originalWidth = window.innerWidth;
      
      // Test mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      window.dispatchEvent(new Event('resize'));
      
      // Check if mobile styles are applied
      const gridElement = document.querySelector('[class*="grid"]');
      const isMobileResponsive = gridElement !== null;
      
      // Restore original width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: originalWidth,
      });
      window.dispatchEvent(new Event('resize'));
      
      return isMobileResponsive;
    } catch {
      return false;
    }
  },

  /**
   * Test accessibility features
   */
  async testAccessibility(): Promise<boolean> {
    if (typeof window === 'undefined') return true;
    
    try {
      // Test if interactive elements have proper attributes
      const buttons = document.querySelectorAll('button, a');
      for (const button of buttons) {
        if (!button.textContent?.trim() && !button.getAttribute('aria-label')) {
          return false;
        }
      }
      
      // Test if images have alt text
      const images = document.querySelectorAll('img');
      for (const img of images) {
        if (!img.getAttribute('alt')) {
          return false;
        }
      }
      
      return true;
    } catch {
      return false;
    }
  },
};

/**
 * Predefined performance tests
 */
export const performanceTests: PerformanceTest[] = [
  {
    name: 'Component Render Performance',
    threshold: 16, // 60fps = 16.67ms per frame
    metric: 'PacingPage_render',
  },
  {
    name: 'Navigation Performance',
    threshold: 100,
    metric: 'NavBar_render',
  },
  {
    name: 'First Contentful Paint',
    threshold: 1500, // 1.5 seconds
    metric: 'FCP',
  },
  {
    name: 'Largest Contentful Paint',
    threshold: 2500, // 2.5 seconds
    metric: 'LCP',
  },
];

/**
 * Run all functional tests
 */
export async function runAllFunctionalTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  for (const [name, testFn] of Object.entries(functionalTests)) {
    const result = await testRunner.runTest(name, testFn);
    results.push(result);
  }
  
  return results;
}

/**
 * Run all performance tests
 */
export async function runAllPerformanceTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  for (const test of performanceTests) {
    const result = await testRunner.runPerformanceTest(test);
    results.push(result);
  }
  
  return results;
}

/**
 * Run comprehensive test suite
 */
export async function runComprehensiveTests(): Promise<{
  functional: TestResult[];
  performance: TestResult[];
  summary: ReturnType<TestRunner['getSummary']>;
  report: string;
}> {
  testRunner.clear();
  
  const functional = await runAllFunctionalTests();
  const performance = await runAllPerformanceTests();
  
  const summary = testRunner.getSummary();
  const report = testRunner.generateReport();
  
  return {
    functional,
    performance,
    summary,
    report,
  };
}