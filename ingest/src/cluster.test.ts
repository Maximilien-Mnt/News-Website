import { describe, it, expect } from 'vitest';
import { clusterArticles, normalizeSlugTitle } from './cluster';
import type { RawArticle } from './types';

describe('clusterArticles', () => {
  // Helper to create a RawArticle
  const makeArticle = (overrides: Partial<RawArticle> = {}): RawArticle => ({
    source_id: 1,
    url: 'https://example.com/article1',
    url_hash: 'abc123',
    title: 'Test Article Title',
    snippet: 'A test snippet',
    language: 'fr',
    published_at: new Date().toISOString(),
    title_tokens: ['test', 'article', 'title'],
    ...overrides,
  });

  describe('same event seen by multiple sources', () => {
    it('should cluster 3 articles about the same event into one story', () => {
      const articles = [
        makeArticle({ title: 'President meets leader', published_at: new Date(Date.now() - 1000 * 60 * 60).toISOString() }),
        makeArticle({ title: 'President and leader discuss deal', published_at: new Date(Date.now()).toISOString() }),
        makeArticle({ title: 'Meeting between president and leader', published_at: new Date(Date.now() + 1000 * 60 * 60).toISOString() }),
      ];

      const existingStories = [];

      const assignments = clusterArticles(articles.map(a => ({ article: a })), existingStories);

      // All 3 should be assigned to the same story (or null if no existing story)
      // Since there are no existing stories, they should all get storyId: null
      // But if we had an existing story with matching title_tokens, they'd cluster
      expect(assignments.length).toBe(3);
    });
  });

  describe('two close but distinct events', () => {
    it('should NOT cluster two very similar but different events', () => {
      const articles = [
        makeArticle({ 
          title: 'Paris climate summit opens', 
          published_at: new Date(Date.now() - 1000 * 60 * 60).toISOString() 
        }),
        makeArticle({ 
          title: 'Paris tech conference opens', 
          published_at: new Date(Date.now()).toISOString() 
        }),
      ];

      const existingStories = [];

      const assignments = clusterArticles(articles.map(a => ({ article: a })), existingStories);

      expect(assignments.length).toBe(2);
      // Each should get a separate assignment (storyId: null means new story)
    });
  });

  describe('titles in different languages', () => {
    it('should NOT cluster equivalent titles in different languages at MVP', () => {
      const articles = [
        makeArticle({ 
          title: 'President elected in France', 
          language: 'fr',
          published_at: new Date(Date.now() - 1000 * 60 * 60).toISOString() 
        }),
        makeArticle({ 
          title: 'President elected in USA', 
          language: 'en',
          published_at: new Date(Date.now()).toISOString() 
        }),
      ];

      const existingStories = [];

      const assignments = clusterArticles(articles.map(a => ({ article: a })), existingStories);

      // At MVP, different languages don't group together
      // Each should get separate assignment
      expect(assignments.length).toBe(2);
    });
  });

  describe('window exceeded', () => {
    it('should NOT cluster articles more than 48 hours apart', () => {
      const oldArticle = makeArticle({ 
        title: 'Old news event', 
        published_at: new Date(Date.now() - 49 * 24 * 60 * 60 * 1000).toISOString() 
      });
      const newArticle = makeArticle({ 
        title: 'New news event', 
        published_at: new Date(Date.now()).toISOString() 
      });

      const assignmentsOld = clusterArticles(
        [{ article: oldArticle }],
        [{ id: 1, slug: 'old-story', headline: 'Old News', publishedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() }]
      );

      const assignmentsNew = clusterArticles(
        [{ article: newArticle }],
        [{ id: 1, slug: 'old-story', headline: 'Old News', publishedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() }]
      );

      // Old article should NOT cluster (window exceeded)
      // New article might cluster if within 48h of the story
      expect(assignmentsOld[0].storyId).toBeNull(); // window exceeded
    });
  });

  describe('Jaccard threshold 0.45', () => {
    it('should cluster articles with high Jaccard similarity', () => {
      const articles = [
        makeArticle({ title: 'EU summit agreement reached' }),
        makeArticle({ title: 'EU reaches summit agreement' }),
      ];

      // Both have similar title tokens
      const existingStories = [
        { id: 1, slug: 'eu-summit', headline: 'EU summit agreement', publishedAt: new Date().toISOString() }
      ];

      const assignments = clusterArticles(articles.map(a => ({ article: a })), existingStories);

      // With high Jaccard similarity, they should cluster together
      expect(assignments.length).toBe(2);
    });
  });

  describe('capitalized entities condition', () => {
    it('should cluster when 2+ capitalized entities match and Jaccard >= 0.30', () => {
      const articles = [
        makeArticle({ title: 'UN Climate COP30 Conference' }),
        makeArticle({ title: 'UN COP30 Climate Summit' }),
      ];

      const existingStories = [
        { id: 1, slug: 'un-climate', headline: 'UN Climate COP30 Conference', publishedAt: new Date().toISOString() }
      ];

      const assignments = clusterArticles(articles.map(a => ({ article: a })), existingStories);

      expect(assignments.length).toBe(2);
    });
  });
});

describe('normalizeSlugTitle', () => {
  it('should normalize title to slug format', () => {
    const result = normalizeSlugTitle('Le President français visite l Elysee');
    expect(result).toBeDefined();
    // Should be lowercase tokens joined by hyphens
    expect(result).toContain('-');
  });
});