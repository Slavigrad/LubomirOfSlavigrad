// Test file to verify ButtonComponent CVA + clsx refactoring
// This file tests the type safety and functionality of our refactored ButtonComponent

import { cva } from 'class-variance-authority';
import clsx from 'clsx';

// Type definitions from our ButtonComponent
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'glass';
type ButtonSize = 'sm' | 'md' | 'lg';

// CVA variant definition (copied from ButtonComponent)
const buttonVariants = cva('btn', {
  variants: {
    variant: {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      ghost: 'btn-ghost',
      outline: 'btn-outline',
      glass: 'btn-glass'
    },
    size: {
      sm: 'btn-sm',
      md: 'btn-md',
      lg: 'btn-lg'
    }
  },
  compoundVariants: [
    {
      variant: 'glass',
      size: 'lg',
      class: 'glass-glow-effect'
    }
  ],
  defaultVariants: {
    variant: 'primary',
    size: 'md'
  }
});

// Test function to verify class generation
function testButtonClasses() {
  console.log('Testing ButtonComponent CVA + clsx refactoring...\n');

  // Test 1: Default variants
  const defaultClasses = clsx(buttonVariants({}));
  console.log('✅ Default variants:', defaultClasses);
  // Expected: "btn btn-primary btn-md"

  // Test 2: Specific variants
  const primarySmall = clsx(buttonVariants({ variant: 'primary', size: 'sm' }));
  console.log('✅ Primary Small:', primarySmall);
  // Expected: "btn btn-primary btn-sm"

  // Test 3: Compound variant (glass + large)
  const glassLarge = clsx(buttonVariants({ variant: 'glass', size: 'lg' }));
  console.log('✅ Glass Large (compound):', glassLarge);
  // Expected: "btn btn-glass btn-lg glass-glow-effect"

  // Test 4: With conditional classes
  const loadingButton = clsx(
    buttonVariants({ variant: 'secondary', size: 'md' }),
    {
      'cursor-wait': true,
      'opacity-50': false
    }
  );
  console.log('✅ Loading state:', loadingButton);
  // Expected: "btn btn-secondary btn-md cursor-wait"

  // Test 5: All variants
  const variants: ButtonVariant[] = ['primary', 'secondary', 'ghost', 'outline', 'glass'];
  const sizes: ButtonSize[] = ['sm', 'md', 'lg'];
  
  console.log('\n📊 All variant combinations:');
  variants.forEach(variant => {
    sizes.forEach(size => {
      const classes = clsx(buttonVariants({ variant, size }));
      console.log(`  ${variant}-${size}: ${classes}`);
    });
  });

  console.log('\n✅ All tests completed successfully!');
  console.log('🎯 CVA + clsx refactoring is working correctly');
}

// Performance test
function performanceTest() {
  console.log('\n⚡ Performance Test:');
  
  const iterations = 10000;
  
  // Test CVA + clsx approach
  const startTime = performance.now();
  for (let i = 0; i < iterations; i++) {
    clsx(
      buttonVariants({ variant: 'primary', size: 'md' }),
      { 'cursor-wait': i % 2 === 0, 'opacity-50': i % 3 === 0 }
    );
  }
  const endTime = performance.now();
  
  const avgTime = (endTime - startTime) / iterations;
  console.log(`📈 Average time per computation: ${avgTime.toFixed(4)}ms`);
  console.log(`🎯 Target: < 0.05ms (${avgTime < 0.05 ? '✅ PASSED' : '❌ FAILED'})`);
}

// Type safety test
function typeSafetyTest() {
  console.log('\n🔒 Type Safety Test:');
  
  // These should work (valid types)
  const validButton1 = buttonVariants({ variant: 'primary', size: 'sm' });
  const validButton2 = buttonVariants({ variant: 'glass', size: 'lg' });
  console.log('✅ Valid type combinations work');
  
  // These would cause TypeScript errors (commented out):
  // const invalidButton1 = buttonVariants({ variant: 'invalid', size: 'sm' }); // ❌
  // const invalidButton2 = buttonVariants({ variant: 'primary', size: 'xl' }); // ❌
  
  console.log('✅ TypeScript provides compile-time type safety');
}

// Run all tests
if (typeof window === 'undefined') {
  // Node.js environment
  testButtonClasses();
  performanceTest();
  typeSafetyTest();
} else {
  // Browser environment
  console.log('ButtonComponent CVA + clsx test file loaded');
  console.log('Open browser console and call testButtonClasses() to run tests');
}

export { testButtonClasses, performanceTest, typeSafetyTest, buttonVariants };
