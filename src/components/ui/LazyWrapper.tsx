"use client";

import React, { Suspense, lazy, ComponentType } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface LazyWrapperProps {
  fallback?: React.ReactNode;
  className?: string;
}

/**
 * Higher-order component for lazy loading with suspense
 */
export function withLazyLoading<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunc);

  return function LazyWrapper(props: P & LazyWrapperProps) {
    const { fallback: propFallback, className, ...componentProps } = props;
    
    return (
      <Suspense 
        fallback={
          propFallback || 
          fallback || 
          <div className={className}>
            <LoadingSpinner size="lg" />
          </div>
        }
      >
        <LazyComponent {...(componentProps as P)} />
      </Suspense>
    );
  };
}

/**
 * Generic lazy wrapper component
 */
interface GenericLazyWrapperProps extends LazyWrapperProps {
  children: React.ReactNode;
}

export function LazyWrapper({ 
  children, 
  fallback, 
  className 
}: GenericLazyWrapperProps) {
  return (
    <Suspense 
      fallback={
        fallback || 
        <div className={className}>
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

/**
 * Hook for intersection observer-based lazy loading
 */
export function useIntersectionObserver(
  ref: React.RefObject<HTMLElement | null>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  const [hasIntersected, setHasIntersected] = React.useState(false);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [ref, hasIntersected, options]);

  return { isIntersecting, hasIntersected };
}

/**
 * Component that only renders children when in viewport
 */
interface LazyRenderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  once?: boolean;
}

export function LazyRender({ 
  children, 
  fallback, 
  className,
  once = true 
}: LazyRenderProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const { isIntersecting, hasIntersected } = useIntersectionObserver(ref);

  const shouldRender = once ? hasIntersected : isIntersecting;

  return (
    <div ref={ref} className={className}>
      {shouldRender ? children : (fallback || <LoadingSpinner size="md" />)}
    </div>
  );
}