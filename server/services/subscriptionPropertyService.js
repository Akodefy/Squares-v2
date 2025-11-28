/**
 * Subscription Property Service
 *
 * Simple logic: When vendor purchases a subscription, unarchive their properties.
 */

const Property = require('../models/Property');

class SubscriptionPropertyService {
  /**
   * Unarchive all archived properties when user purchases a subscription
   * Called when a user purchases any subscription
   *
   * @param {String} userId - The user/vendor ID
   * @returns {Object} Result with count of unarchived properties
   */
  async unarchiveFreeListingsOnSubscription(userId) {
    try {
      const result = await Property.updateMany(
        {
          owner: userId,
          archived: true
        },
        {
          $set: {
            archived: false,
            archivedAt: null,
            archivedReason: null,
            isFreeListing: false // No longer a free listing
          },
          $unset: {
            freeListingExpiresAt: 1 // Remove expiration date
          }
        }
      );

      console.log(`[SubscriptionPropertyService] Unarchived ${result.modifiedCount} properties for user ${userId}`);

      return {
        success: true,
        unarchivedCount: result.modifiedCount
      };
    } catch (error) {
      console.error('[SubscriptionPropertyService] Error unarchiving properties:', error);
      return {
        success: false,
        error: error.message,
        unarchivedCount: 0
      };
    }
  }
}

module.exports = new SubscriptionPropertyService();
