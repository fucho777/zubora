import { describe, it, expect } from 'vitest';
import {
  formatDate,
  truncateText,
  getRemainingSearches,
  getRemainingRecipes,
  generateToken,
  batchVideoIds,
} from '../lib/utils';

describe('Utils', () => {
  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2025-01-01');
      expect(formatDate(date)).toBe('2025年1月1日');
    });
  });

  describe('truncateText', () => {
    it('truncates text when longer than maxLength', () => {
      const text = 'This is a long text';
      expect(truncateText(text, 7)).toBe('This is...');
    });

    it('returns original text when shorter than maxLength', () => {
      const text = 'Short';
      expect(truncateText(text, 10)).toBe('Short');
    });
  });

  describe('getRemainingSearches', () => {
    it('calculates remaining searches correctly', () => {
      expect(getRemainingSearches(2)).toBe(3);
      expect(getRemainingSearches(5)).toBe(0);
      expect(getRemainingSearches(0)).toBe(5);
    });

    it('never returns negative values', () => {
      expect(getRemainingSearches(6)).toBe(0);
      expect(getRemainingSearches(10)).toBe(0);
    });
  });

  describe('getRemainingRecipes', () => {
    it('calculates remaining recipes correctly', () => {
      expect(getRemainingRecipes(2)).toBe(3);
      expect(getRemainingRecipes(5)).toBe(0);
      expect(getRemainingRecipes(0)).toBe(5);
    });

    it('never returns negative values', () => {
      expect(getRemainingRecipes(6)).toBe(0);
      expect(getRemainingRecipes(10)).toBe(0);
    });
  });

  describe('generateToken', () => {
    it('generates a token of correct length', () => {
      const token = generateToken();
      expect(token).toHaveLength(64); // 32 bytes = 64 hex characters
    });

    it('generates unique tokens', () => {
      const token1 = generateToken();
      const token2 = generateToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('batchVideoIds', () => {
    it('batches video IDs correctly', () => {
      const ids = Array.from({ length: 120 }, (_, i) => `video${i}`);
      const batches = batchVideoIds(ids);
      
      expect(batches).toHaveLength(3); // 120 items should create 3 batches
      expect(batches[0]).toHaveLength(50); // First batch should have 50 items
      expect(batches[1]).toHaveLength(50); // Second batch should have 50 items
      expect(batches[2]).toHaveLength(20); // Last batch should have remaining 20 items
    });

    it('handles empty array', () => {
      const batches = batchVideoIds([]);
      expect(batches).toHaveLength(0);
    });

    it('handles array smaller than batch size', () => {
      const ids = ['video1', 'video2', 'video3'];
      const batches = batchVideoIds(ids);
      expect(batches).toHaveLength(1);
      expect(batches[0]).toHaveLength(3);
    });
  });
});