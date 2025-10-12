// Image History Manager
export interface HistoricalImage {
  id: string;
  base64: string;
  preview: string;
  timestamp: Date;
  articleTitle: string;
  query?: string;
}

const MAX_HISTORY = 20;
const STORAGE_KEY = 'fincarta_image_history';

export const imageHistory = {
  save: (image: Omit<HistoricalImage, 'id'>): void => {
    try {
      const history = imageHistory.getAll();
      const newImage: HistoricalImage = {
        ...image,
        id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
      
      history.unshift(newImage);
      const trimmed = history.slice(0, MAX_HISTORY);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch (error) {
      console.error('Failed to save image history:', error);
    }
  },

  getAll: (): HistoricalImage[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      return parsed.map((img: any) => ({
        ...img,
        timestamp: new Date(img.timestamp),
      }));
    } catch (error) {
      console.error('Failed to load image history:', error);
      return [];
    }
  },

  getRecent: (limit: number = 5): HistoricalImage[] => {
    return imageHistory.getAll().slice(0, limit);
  },

  getByArticle: (articleTitle: string): HistoricalImage[] => {
    return imageHistory.getAll().filter(img => 
      img.articleTitle === articleTitle
    );
  },

  delete: (id: string): void => {
    try {
      const history = imageHistory.getAll();
      const filtered = history.filter(img => img.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  },

  clear: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  },
};

