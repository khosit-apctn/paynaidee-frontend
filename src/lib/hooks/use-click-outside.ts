import { useEffect, useRef, type RefObject } from 'react';

/**
 * Hook to detect clicks outside of specified elements
 * 
 * Applies Vercel best practices:
 * - client-event-listeners: Deduplicate global event listeners
 * - advanced-use-latest: Use ref for stable callback references
 * 
 * @param refs - Array of refs to elements that should not trigger the callback
 * @param callback - Function to call when click is detected outside all refs
 * 
 * @example
 * const menuRef = useRef<HTMLDivElement>(null);
 * const dropdownRef = useRef<HTMLDivElement>(null);
 * 
 * useClickOutside([menuRef, dropdownRef], () => {
 *   setIsOpen(false);
 * });
 */
export function useClickOutside(
  refs: RefObject<HTMLElement | null>[],
  callback: () => void
) {
  // Use ref to store latest callback without recreating event listener
  // This prevents unnecessary event listener removal/addition on every render
  const savedCallback = useRef(callback);

  // Update ref when callback changes (doesn't trigger effect re-run)
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up event listener only once (or when refs array changes)
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      // Check if click is outside ALL specified elements
      const isOutside = refs.every(
        (ref) => ref.current && !ref.current.contains(event.target as Node)
      );
      
      if (isOutside) {
        savedCallback.current();
      }
    };

    // Add single event listener for all refs
    document.addEventListener('mousedown', handleClick);
    
    // Cleanup on unmount or when refs change
    return () => document.removeEventListener('mousedown', handleClick);
  }, [refs]); // Only recreate if refs array changes
}
