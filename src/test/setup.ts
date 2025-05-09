import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Mock BroadcastChannel
class MockBroadcastChannel {
  constructor() {
    return {
      postMessage: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      close: vi.fn(),
    };
  }
}

vi.stubGlobal('BroadcastChannel', MockBroadcastChannel);

// Mock environment variables
vi.stubGlobal('import.meta', {
  env: {
    VITE_SUPABASE_URL: 'http://localhost:54321',
    VITE_SUPABASE_ANON_KEY: 'test-anon-key',
    VITE_YOUTUBE_API_KEY: 'test-youtube-key',
    VITE_GEMINI_API_KEY: 'test-gemini-key',
    VITE_GEMINI_MODEL: 'gemini-1.0-pro',
  },
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});