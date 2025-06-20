"use client"

/**
 * Custom hook to prevent mouse wheel scrolling from changing number input values
 */
import { useEffect } from 'react';

const usePreventNumberScroll = () => {
  useEffect(() => {
    // Function to prevent wheel events on number inputs
    const preventWheel = (e) => {
      // Only prevent default if the target is a number input
      if (e.target.type === 'number') {
        e.preventDefault();
      }
    };

    // Function to add event listeners to all number inputs
    const addEventListeners = () => {
      const numberInputs = document.querySelectorAll('input[type="number"]');
      numberInputs.forEach(input => {
        input.addEventListener('wheel', preventWheel, { passive: false });
      });
    };

    // Add event listeners initially
    addEventListeners();

    // Set up a MutationObserver to watch for new number inputs added to the DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          // Check if any new number inputs were added
          const newNumberInputs = [];
          mutation.addedNodes.forEach(node => {
            // Check if the node itself is a number input
            if (node.nodeName === 'INPUT' && node.type === 'number') {
              newNumberInputs.push(node);
            }
            // Check if the node contains any number inputs
            if (node.querySelectorAll) {
              const inputs = node.querySelectorAll('input[type="number"]');
              inputs.forEach(input => newNumberInputs.push(input));
            }
          });

          // Add event listeners to any new number inputs
          newNumberInputs.forEach(input => {
            input.addEventListener('wheel', preventWheel, { passive: false });
          });
        }
      });
    });

    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true });

    // Clean up function
    return () => {
      // Remove event listeners from all number inputs
      const numberInputs = document.querySelectorAll('input[type="number"]');
      numberInputs.forEach(input => {
        input.removeEventListener('wheel', preventWheel);
      });
      
      // Disconnect the observer
      observer.disconnect();
    };
  }, []);
};

export default usePreventNumberScroll;
