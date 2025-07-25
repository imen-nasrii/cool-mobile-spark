// Performance optimization utilities

// Debounce function for search and input handling
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Throttle function for scroll events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

// Lazy loading with Intersection Observer
export function useLazyLoading(
  callback: () => void,
  options: IntersectionObserverInit = {}
) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback();
        observer.unobserve(entry.target);
      }
    });
  }, options);

  return observer;
}

// Image optimization
export function optimizeImage(
  url: string,
  width: number,
  height: number,
  quality: number = 80
): string {
  // For production, you might use a service like Cloudinary or ImageKit
  // For now, return the original URL
  return url;
}

// Memory management for large lists
export function useVirtualization(
  items: any[],
  itemHeight: number,
  containerHeight: number,
  scrollTop: number
) {
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );
  
  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;
  
  return {
    visibleItems,
    offsetY,
    totalHeight: items.length * itemHeight
  };
}

// Bundle splitting helper
export function loadComponent(importFunc: () => Promise<any>) {
  return React.lazy(importFunc);
}

// Cache management
export class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number = 5 * 60 * 1000) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear() {
    this.cache.clear();
  }

  delete(key: string) {
    this.cache.delete(key);
  }
}

// Request deduplication
export class RequestDeduplicator {
  private pendingRequests = new Map<string, Promise<any>>();

  async request<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    const promise = requestFn();
    this.pendingRequests.set(key, promise);

    try {
      const result = await promise;
      this.pendingRequests.delete(key);
      return result;
    } catch (error) {
      this.pendingRequests.delete(key);
      throw error;
    }
  }
}

// Performance monitoring
export function measurePerformance(name: string, fn: () => void) {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`Performance: ${name} took ${end - start} milliseconds`);
}

// Async performance monitoring
export async function measureAsyncPerformance<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const end = performance.now();
    console.log(`Performance: ${name} took ${end - start} milliseconds`);
    return result;
  } catch (error) {
    const end = performance.now();
    console.log(`Performance: ${name} failed after ${end - start} milliseconds`);
    throw error;
  }
}

// Web Worker utilities
export function createWebWorker(workerScript: string) {
  const blob = new Blob([workerScript], { type: 'application/javascript' });
  return new Worker(URL.createObjectURL(blob));
}

// Service Worker registration
export async function registerServiceWorker(scriptUrl: string) {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(scriptUrl);
      console.log('Service Worker registered successfully:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  } else {
    console.warn('Service Workers are not supported in this browser');
  }
}

export const cacheManager = new CacheManager();
export const requestDeduplicator = new RequestDeduplicator();