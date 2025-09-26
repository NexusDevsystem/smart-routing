const STORAGE_PREFIX = 'sr:';
const CURRENT_VERSION = 1;

interface PlanIndexEntry {
  id: string;
  name: string;
  createdAt: string;
  city: string;
  stopsCount: number;
  totalDistanceMeters: number;
  totalDurationSec: number;
  version: number;
}

class LocalDBWrapper {
  private getKey(key: string): string {
    return `${STORAGE_PREFIX}${key}`;
  }

  private isAvailable(): boolean {
    try {
      const test = '__test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  // Plan management
  async savePlan<T extends { id: string }>(plan: T): Promise<void> {
    if (!this.isAvailable()) throw new Error('localStorage is not available');
    
    const planKey = this.getKey(`plan:${plan.id}`);
    const indexKey = this.getKey('plans:index');
    
    try {
      // Save plan
      const planWithVersion = { ...plan, version: CURRENT_VERSION };
      localStorage.setItem(planKey, JSON.stringify(planWithVersion));
      
      // Update index
      const indexEntry: PlanIndexEntry = {
        id: plan.id,
        name: (plan as any).name || 'Untitled Plan',
        createdAt: (plan as any).createdAt || new Date().toISOString(),
        city: (plan as any).city || 'Unknown',
        stopsCount: (plan as any).stops?.length || 0,
        totalDistanceMeters: (plan as any).totalDistanceMeters || 0,
        totalDurationSec: (plan as any).totalDurationSec || 0,
        version: CURRENT_VERSION,
      };
      
      const index = this.getPlanIndex();
      const updatedIndex = [
        ...index.filter(p => p.id !== plan.id),
        indexEntry
      ];
      
      localStorage.setItem(indexKey, JSON.stringify(updatedIndex));
    } catch (error) {
      throw new Error(`Failed to save plan: ${error}`);
    }
  }

  async getPlan<T>(id: string): Promise<T | null> {
    if (!this.isAvailable()) throw new Error('localStorage is not available');
    
    const key = this.getKey(`plan:${id}`);
    const data = localStorage.getItem(key);
    
    if (!data) return null;
    
    try {
      const plan = JSON.parse(data);
      if (plan.version !== CURRENT_VERSION) {
        // TODO: Implement migration if needed
      }
      return plan;
    } catch {
      return null;
    }
  }

  async deletePlan(id: string): Promise<void> {
    if (!this.isAvailable()) throw new Error('localStorage is not available');
    
    const planKey = this.getKey(`plan:${id}`);
    const indexKey = this.getKey('plans:index');
    
    try {
      // Remove plan
      localStorage.removeItem(planKey);
      
      // Update index
      const index = this.getPlanIndex();
      const updatedIndex = index.filter(p => p.id !== id);
      localStorage.setItem(indexKey, JSON.stringify(updatedIndex));
    } catch (error) {
      throw new Error(`Failed to delete plan: ${error}`);
    }
  }

  getPlanIndex(): PlanIndexEntry[] {
    if (!this.isAvailable()) throw new Error('localStorage is not available');
    
    const key = this.getKey('plans:index');
    const data = localStorage.getItem(key);
    
    if (!data) return [];
    
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  async duplicatePlan<T>(id: string): Promise<string | null> {
    const plan = await this.getPlan<T>(id);
    if (!plan) return null;
    
    const newId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const duplicatedPlan = {
      ...plan,
      id: newId,
      name: `${(plan as any).name || 'Plan'} (Copy)`,
      createdAt: now,
    };
    
    await this.savePlan(duplicatedPlan);
    return newId;
  }

  // Dark mode preference
  saveDarkModePreference(isDark: boolean): void {
    if (!this.isAvailable()) return;
    localStorage.setItem(this.getKey('darkMode'), String(isDark));
  }

  getDarkModePreference(): boolean | null {
    if (!this.isAvailable()) return null;
    const pref = localStorage.getItem(this.getKey('darkMode'));
    return pref ? pref === 'true' : null;
  }
}

export const localdb = new LocalDBWrapper();