import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { scheduleBatchJobs, processBatchJobs } from '../lib/batch';
import { logEdgeFunctionError } from '../lib/utils';

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
      // Check if we have the required environment variables
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
      if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('Supabase configuration is missing. Skipping batch jobs.');
        return;
      }

      await scheduleBatchJobs();
      
      console.log('Batch jobs scheduled successfully', {
        timestamp: new Date().toISOString()
      });
      
      try {
        await processBatchJobs();
      } catch (error) {
        const errorDetails = {
          name: error instanceof Error ? error.name : 'Unknown',
          message: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString()
        };
        
        if (error instanceof Error && error.message.includes('Failed to fetch')) {
          console.warn('Failed to process batch jobs (Edge Function may not be deployed):', {
            ...errorDetails,
            url: supabaseUrl
          });
          return; // Silently handle network errors in development
        }
        
        console.warn('Failed to process batch jobs:', errorDetails);
        
        // Log to Supabase if it's not a network error
        if (!(error instanceof Error) || !error.message.includes('Failed to fetch')) {
          await logEdgeFunctionError('batch-processor', errorDetails.message, errorDetails);
        }
      }
    } catch (error) {
      const errorDetails = {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      };
      
      console.warn('Failed to schedule batch jobs:', errorDetails);
      
      // Log to Supabase if it's not a network error
      if (!(error instanceof Error) || !error.message.includes('Failed to fetch')) {
        await logEdgeFunctionError('batch-processor', 'Failed to schedule batch jobs', errorDetails);
      }
    }
  }, []);

  useEffect(() => {
    // Run initial batch jobs after a delay to ensure Edge Function is ready
    const initialJobsTimeout = setTimeout(runBatchJobs, 5000); // Increased delay to 5 seconds

    // Set up interval for batch jobs
    const batchInterval = setInterval(runBatchJobs, 60 * 60 * 1000); // Run every hour

    console.log('Batch provider initialized', {
      timestamp: new Date().toISOString()
    });

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