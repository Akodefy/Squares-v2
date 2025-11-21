const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');

class PlanChangeService {
  /**
   * Track plan changes and analyze impact on existing subscriptions
   */
  async analyzePlanChangeImpact(planId, changes) {
    try {
      const plan = await Plan.findById(planId);
      if (!plan) {
        throw new Error('Plan not found');
      }

      // Count active subscriptions using this plan
      const activeSubscriptions = await Subscription.countDocuments({
        plan: planId,
        status: 'active'
      });

      // Count pending subscriptions
      const pendingSubscriptions = await Subscription.countDocuments({
        plan: planId,
        status: 'pending'
      });

      const impact = {
        planName: plan.name,
        activeSubscriptions,
        pendingSubscriptions,
        totalAffected: activeSubscriptions + pendingSubscriptions,
        changes: [],
        affectsExistingUsers: false,
        affectsNewUsers: true
      };

      // Analyze specific changes
      if (changes.price !== undefined && changes.price !== plan.price) {
        impact.changes.push({
          field: 'price',
          oldValue: plan.price,
          newValue: changes.price,
          type: changes.price > plan.price ? 'increase' : 'decrease'
        });
      }

      if (changes.limits) {
        Object.keys(changes.limits).forEach(limitKey => {
          if (changes.limits[limitKey] !== plan.limits?.[limitKey]) {
            impact.changes.push({
              field: `limits.${limitKey}`,
              oldValue: plan.limits?.[limitKey],
              newValue: changes.limits[limitKey],
              type: 'limit_change'
            });
          }
        });
      }

      if (changes.features) {
        impact.changes.push({
          field: 'features',
          type: 'features_modified',
          note: 'Features have been modified'
        });
      }

      // Note: Existing subscriptions use snapshots, so they won't be affected
      impact.note = 'Existing subscriptions will continue with their original plan details. Only new subscriptions will get the updated plan.';

      return impact;
    } catch (error) {
      console.error('Error analyzing plan change impact:', error);
      throw error;
    }
  }

  /**
   * Get plan change history
   */
  async getPlanChangeHistory(planId) {
    try {
      const plan = await Plan.findById(planId)
        .populate('priceHistory.changedBy', 'email profile.firstName profile.lastName')
        .populate('featureHistory.changedBy', 'email profile.firstName profile.lastName');

      if (!plan) {
        throw new Error('Plan not found');
      }

      return {
        planName: plan.name,
        priceHistory: plan.priceHistory || [],
        featureHistory: plan.featureHistory || []
      };
    } catch (error) {
      console.error('Error getting plan change history:', error);
      throw error;
    }
  }

  /**
   * Get all subscriptions affected by a plan (using snapshot data)
   */
  async getAffectedSubscriptions(planId, status = 'active') {
    try {
      const subscriptions = await Subscription.find({
        plan: planId,
        status
      })
        .populate('user', 'email profile.firstName profile.lastName')
        .select('user status startDate endDate amount planSnapshot')
        .sort({ startDate: -1 });

      return subscriptions.map(sub => ({
        subscriptionId: sub._id,
        userId: sub.user._id,
        userEmail: sub.user.email,
        userName: `${sub.user.profile?.firstName || ''} ${sub.user.profile?.lastName || ''}`.trim(),
        status: sub.status,
        startDate: sub.startDate,
        endDate: sub.endDate,
        amount: sub.amount,
        planSnapshotExists: !!sub.planSnapshot,
        planSnapshot: sub.planSnapshot ? {
          name: sub.planSnapshot.name,
          price: sub.planSnapshot.price,
          limits: sub.planSnapshot.limits
        } : null
      }));
    } catch (error) {
      console.error('Error getting affected subscriptions:', error);
      throw error;
    }
  }

  /**
   * Validate plan changes before applying
   */
  async validatePlanChanges(planId, changes) {
    const validationErrors = [];
    const warnings = [];

    // Validate price changes
    if (changes.price !== undefined) {
      if (changes.price < 0) {
        validationErrors.push('Price cannot be negative');
      }
      
      const plan = await Plan.findById(planId);
      if (plan && changes.price > plan.price * 2) {
        warnings.push('Price increase is more than 100%. This might affect new subscriptions.');
      }
    }

    // Validate limit changes
    if (changes.limits) {
      if (changes.limits.properties !== undefined && changes.limits.properties < 0) {
        validationErrors.push('Property limit cannot be negative');
      }
    }

    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
      warnings
    };
  }
}

module.exports = new PlanChangeService();
