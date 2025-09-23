#!/usr/bin/env node

/**
 * Performance Budget Monitoring Script
 * Analyzes build output and checks against performance budgets
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Performance budgets configuration
const BUDGETS = {
  initial: {
    maxSize: 500 * 1024, // 500KB
    warningSize: 400 * 1024, // 400KB
    description: 'Initial bundle size'
  },
  lazy: {
    maxSize: 200 * 1024, // 200KB
    warningSize: 150 * 1024, // 150KB
    description: 'Lazy-loaded chunk size'
  },
  total: {
    maxSize: 2 * 1024 * 1024, // 2MB
    warningSize: 1.5 * 1024 * 1024, // 1.5MB
    description: 'Total bundle size'
  },
  css: {
    maxSize: 50 * 1024, // 50KB
    warningSize: 40 * 1024, // 40KB
    description: 'CSS bundle size'
  }
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  bold: '\x1b[1m'
};

class PerformanceBudgetMonitor {
  constructor() {
    this.distPath = path.join(process.cwd(), 'dist/LubomirOfSlavigrad');
    this.results = {
      passed: 0,
      warnings: 0,
      failed: 0,
      details: []
    };
  }

  /**
   * Run performance budget analysis
   */
  async run() {
    console.log(`${colors.blue}${colors.bold}🚀 Performance Budget Analysis${colors.reset}\n`);

    try {
      // Check if dist directory exists
      if (!fs.existsSync(this.distPath)) {
        throw new Error('Build output not found. Please run "ng build" first.');
      }

      // Analyze bundle files
      await this.analyzeBundles();
      
      // Generate report
      this.generateReport();
      
      // Exit with appropriate code
      process.exit(this.results.failed > 0 ? 1 : 0);
      
    } catch (error) {
      console.error(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
      process.exit(1);
    }
  }

  /**
   * Analyze bundle files against budgets
   */
  async analyzeBundles() {
    const files = fs.readdirSync(this.distPath);
    
    let totalSize = 0;
    let initialSize = 0;
    let cssSize = 0;
    const lazyChunks = [];

    // Categorize files
    files.forEach(file => {
      const filePath = path.join(this.distPath, file);
      const stats = fs.statSync(filePath);
      const size = stats.size;
      
      totalSize += size;

      if (file.endsWith('.css')) {
        cssSize += size;
      } else if (file.endsWith('.js')) {
        if (file.includes('main') || file.includes('polyfills')) {
          initialSize += size;
        } else if (file.includes('chunk-')) {
          lazyChunks.push({ file, size });
        }
      }
    });

    // Check budgets
    this.checkBudget('initial', initialSize, BUDGETS.initial);
    this.checkBudget('total', totalSize, BUDGETS.total);
    this.checkBudget('css', cssSize, BUDGETS.css);

    // Check lazy chunks
    const maxLazySize = Math.max(...lazyChunks.map(chunk => chunk.size), 0);
    this.checkBudget('lazy', maxLazySize, BUDGETS.lazy);

    // Store detailed information
    this.storeDetailedResults({
      totalSize,
      initialSize,
      cssSize,
      lazyChunks,
      files: files.map(file => ({
        name: file,
        size: fs.statSync(path.join(this.distPath, file)).size
      }))
    });
  }

  /**
   * Check individual budget
   */
  checkBudget(type, actualSize, budget) {
    const status = this.getBudgetStatus(actualSize, budget);
    
    this.results.details.push({
      type,
      description: budget.description,
      actualSize,
      maxSize: budget.maxSize,
      warningSize: budget.warningSize,
      status,
      percentage: (actualSize / budget.maxSize) * 100
    });

    switch (status) {
      case 'passed':
        this.results.passed++;
        break;
      case 'warning':
        this.results.warnings++;
        break;
      case 'failed':
        this.results.failed++;
        break;
    }
  }

  /**
   * Determine budget status
   */
  getBudgetStatus(actualSize, budget) {
    if (actualSize > budget.maxSize) {
      return 'failed';
    } else if (actualSize > budget.warningSize) {
      return 'warning';
    } else {
      return 'passed';
    }
  }

  /**
   * Store detailed results for reporting
   */
  storeDetailedResults(details) {
    const reportPath = path.join(process.cwd(), 'performance-report.json');
    
    const report = {
      timestamp: new Date().toISOString(),
      budgets: BUDGETS,
      results: this.results,
      details,
      recommendations: this.generateRecommendations(details)
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📊 Detailed report saved to: ${reportPath}`);
  }

  /**
   * Generate optimization recommendations
   */
  generateRecommendations(details) {
    const recommendations = [];

    // Check for large initial bundle
    if (details.initialSize > BUDGETS.initial.warningSize) {
      recommendations.push({
        type: 'bundle-size',
        severity: details.initialSize > BUDGETS.initial.maxSize ? 'high' : 'medium',
        message: 'Initial bundle size is large',
        suggestion: 'Consider lazy loading more routes and optimizing imports'
      });
    }

    // Check for large lazy chunks
    const largeLazyChunks = details.lazyChunks.filter(chunk => 
      chunk.size > BUDGETS.lazy.warningSize
    );
    
    if (largeLazyChunks.length > 0) {
      recommendations.push({
        type: 'lazy-chunks',
        severity: 'medium',
        message: `${largeLazyChunks.length} lazy chunks are larger than recommended`,
        suggestion: 'Split large components into smaller chunks'
      });
    }

    // Check for large CSS
    if (details.cssSize > BUDGETS.css.warningSize) {
      recommendations.push({
        type: 'css-size',
        severity: 'medium',
        message: 'CSS bundle is large',
        suggestion: 'Consider purging unused CSS and optimizing styles'
      });
    }

    return recommendations;
  }

  /**
   * Generate console report
   */
  generateReport() {
    console.log(`${colors.bold}📋 Performance Budget Report${colors.reset}\n`);

    // Summary
    const totalChecks = this.results.passed + this.results.warnings + this.results.failed;
    console.log(`Total checks: ${totalChecks}`);
    console.log(`${colors.green}✅ Passed: ${this.results.passed}${colors.reset}`);
    console.log(`${colors.yellow}⚠️  Warnings: ${this.results.warnings}${colors.reset}`);
    console.log(`${colors.red}❌ Failed: ${this.results.failed}${colors.reset}\n`);

    // Detailed results
    console.log(`${colors.bold}Detailed Results:${colors.reset}`);
    this.results.details.forEach(detail => {
      const statusIcon = this.getStatusIcon(detail.status);
      const statusColor = this.getStatusColor(detail.status);
      const sizeFormatted = this.formatSize(detail.actualSize);
      const maxSizeFormatted = this.formatSize(detail.maxSize);
      const percentage = detail.percentage.toFixed(1);

      console.log(
        `${statusColor}${statusIcon} ${detail.description}${colors.reset}: ` +
        `${sizeFormatted} / ${maxSizeFormatted} (${percentage}%)`
      );
    });

    console.log('');

    // Overall status
    if (this.results.failed > 0) {
      console.log(`${colors.red}${colors.bold}❌ Performance budget check FAILED${colors.reset}`);
      console.log(`${colors.red}Some bundles exceed the maximum size limits.${colors.reset}`);
    } else if (this.results.warnings > 0) {
      console.log(`${colors.yellow}${colors.bold}⚠️  Performance budget check passed with WARNINGS${colors.reset}`);
      console.log(`${colors.yellow}Some bundles are approaching size limits.${colors.reset}`);
    } else {
      console.log(`${colors.green}${colors.bold}✅ Performance budget check PASSED${colors.reset}`);
      console.log(`${colors.green}All bundles are within acceptable size limits.${colors.reset}`);
    }
  }

  /**
   * Get status icon
   */
  getStatusIcon(status) {
    switch (status) {
      case 'passed': return '✅';
      case 'warning': return '⚠️ ';
      case 'failed': return '❌';
      default: return '❓';
    }
  }

  /**
   * Get status color
   */
  getStatusColor(status) {
    switch (status) {
      case 'passed': return colors.green;
      case 'warning': return colors.yellow;
      case 'failed': return colors.red;
      default: return colors.reset;
    }
  }

  /**
   * Format file size for display
   */
  formatSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }
}

// Run the monitor
if (require.main === module) {
  const monitor = new PerformanceBudgetMonitor();
  monitor.run();
}

module.exports = PerformanceBudgetMonitor;
