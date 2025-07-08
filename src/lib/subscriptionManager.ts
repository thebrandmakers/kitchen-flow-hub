// Global subscription manager to prevent duplicate Supabase subscriptions
import { supabase } from '@/integrations/supabase/client';

class SubscriptionManager {
  private activeSubscriptions = new Map<string, any>();
  
  getOrCreateSubscription(key: string, createSubscription: () => any): any {
    // If subscription already exists, return it
    if (this.activeSubscriptions.has(key)) {
      return this.activeSubscriptions.get(key);
    }
    
    // Create new subscription
    const subscription = createSubscription();
    this.activeSubscriptions.set(key, subscription);
    
    return subscription;
  }
  
  removeSubscription(key: string): void {
    const subscription = this.activeSubscriptions.get(key);
    if (subscription) {
      supabase.removeChannel(subscription);
      this.activeSubscriptions.delete(key);
    }
  }
  
  cleanup(): void {
    // Remove all active subscriptions
    for (const [key, subscription] of this.activeSubscriptions) {
      supabase.removeChannel(subscription);
    }
    this.activeSubscriptions.clear();
  }
}

// Global singleton instance
export const subscriptionManager = new SubscriptionManager();