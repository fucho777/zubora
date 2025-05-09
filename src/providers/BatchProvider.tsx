import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { scheduleBatchJobs, processBatchJobs } from '../lib/batch';

interface BatchContextType {
  runBatchJobs: () => Promise<void>;
}

const BatchContext = createContext<BatchContextType>({
  runBatchJobs: async () => {},
});

export const useBatch = () => useContext(BatchContext);

export const BatchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const runBatchJobs = useCallback(async () => {
    try {
      await scheduleBatchJobs();
      // Only process batch jobs if scheduling was successful
      try {
        await processBatchJobs();
      } catch (error) {
        console.warn('Failed to process batch jobs:', error);
        // Don't throw here to prevent app from crashing
      }
    } catch (error) {
      console.warn('Failed to schedule batch jobs:', error);
      // Don't throw here to prevent app from crashing
    }
  }, []);

  useEffect(() => {
    // Run initial batch jobs after a short delay
    const initialJobsTimeout = setTimeout(runBatchJobs, 1000);

    // Set up interval for batch jobs
    const batchInterval = setInterval(runBatchJobs, 60 * 60 * 1000); // Run every hour

    return () => {
      clearInterval(batchInterval);
      clearTimeout(initialJobsTimeout);
    };
  }, [runBatchJobs]);

  return (
    <BatchContext.Provider value={{ runBatchJobs }}>
      {children}
    </BatchContext.Provider>
  );
};