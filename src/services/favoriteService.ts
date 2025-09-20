export class FavoriteService {
  private static instance: FavoriteService;
  private favorites: Set<number> = new Set();
  private readonly STORAGE_KEY = 'global-store-favorites';

  private constructor() {
    this.loadFavoritesFromStorage();
  }

  public static getInstance(): FavoriteService {
    if (!FavoriteService.instance) {
      FavoriteService.instance = new FavoriteService();
    }
    return FavoriteService.instance;
  }

  private loadFavoritesFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const storedFavorites = localStorage.getItem(this.STORAGE_KEY);
      if (storedFavorites) {
        const favoriteIds = JSON.parse(storedFavorites);
        this.favorites = new Set(favoriteIds);
      }
    } catch (error) {
      console.error('Error loading favorites from storage:', error);
      this.favorites = new Set();
    }
  }

  private saveFavoritesToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const favoriteIds = Array.from(this.favorites);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favoriteIds));
    } catch (error) {
      console.error('Error saving favorites to storage:', error);
    }
  }

  public addToFavorites(productId: number): void {
    this.favorites.add(productId);
    this.saveFavoritesToStorage();
  }

  public removeFromFavorites(productId: number): void {
    this.favorites.delete(productId);
    this.saveFavoritesToStorage();
  }

  public toggleFavorite(productId: number): boolean {
    if (this.isFavorite(productId)) {
      this.removeFromFavorites(productId);
      return false;
    } else {
      this.addToFavorites(productId);
      return true;
    }
  }

  public isFavorite(productId: number): boolean {
    return this.favorites.has(productId);
  }

  public getFavorites(): number[] {
    return Array.from(this.favorites);
  }

  public getFavoriteCount(): number {
    return this.favorites.size;
  }

  public clearFavorites(): void {
    this.favorites.clear();
    this.saveFavoritesToStorage();
  }
}

// Export singleton instance
export const favoriteService = FavoriteService.getInstance();
