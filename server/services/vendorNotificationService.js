const { sendTemplateEmail } = require('../utils/emailService');
const User = require('../models/User');
const Vendor = require('../models/Vendor');

class VendorNotificationService {
  
  async sendNewMessageEmail(vendorId, messageData) {
    try {
      const vendor = await Vendor.findById(vendorId).populate('user');
      if (!vendor || !vendor.user) {
        return { success: false, error: 'Vendor not found' };
      }

      const user = vendor.user;
      
      // Check if vendor has email notifications enabled
      const emailEnabled = vendor.settings?.notifications?.emailNotifications !== false;
      const userEmailEnabled = user.profile?.preferences?.notifications?.email !== false;
      
      if (!emailEnabled || !userEmailEnabled) {
        return { success: false, error: 'Email notifications disabled' };
      }

      const emailData = {
        vendorName: `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim() || vendor.businessInfo?.companyName || 'Vendor',
        senderName: messageData.senderName || 'Customer',
        messagePreview: messageData.content?.substring(0, 150) + (messageData.content?.length > 150 ? '...' : ''),
        timestamp: new Date().toLocaleString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        messageLink: `${process.env.FRONTEND_URL || 'https://buildhomemartsquares.com'}/vendor/messages`,
        unsubscribeLink: `${process.env.FRONTEND_URL || 'https://buildhomemartsquares.com'}/vendor/settings`
      };

      await sendTemplateEmail(user.email, 'vendor-new-message', emailData);

      return { success: true, message: 'Email sent successfully' };
    } catch (error) {
      console.error('Error sending new message email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendWeeklyReport(vendorId, reportData) {
    try {
      const vendor = await Vendor.findById(vendorId).populate('user');
      if (!vendor || !vendor.user) {
        return { success: false, error: 'Vendor not found' };
      }

      const user = vendor.user;
      
      // Check if vendor has weekly reports enabled
      const reportsEnabled = vendor.settings?.notifications?.weeklyReports !== false;
      
      if (!reportsEnabled) {
        return { success: false, error: 'Weekly reports disabled' };
      }

      const emailData = {
        vendorName: `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim() || vendor.businessInfo?.companyName || 'Vendor',
        weekRange: reportData.weekRange || 'This Week',
        newLeads: reportData.newLeads || 0,
        newInquiries: reportData.newInquiries || 0,
        propertyViews: reportData.propertyViews || 0,
        responseRate: reportData.responseRate || 0,
        topProperty: reportData.topProperty || null,
        dashboardLink: `${process.env.FRONTEND_URL || 'https://buildhomemartsquares.com'}/vendor/dashboard`,
        tip: reportData.tip || 'Respond to inquiries within 2 hours to improve your response rate!',
        unsubscribeLink: `${process.env.FRONTEND_URL || 'https://buildhomemartsquares.com'}/vendor/settings`
      };

      await sendTemplateEmail(user.email, 'vendor-weekly-report', emailData);

      return { success: true, message: 'Weekly report sent successfully' };
    } catch (error) {
      console.error('Error sending weekly report:', error);
      return { success: false, error: error.message };
    }
  }

  async sendBusinessUpdate(vendorId, updateData) {
    try {
      const vendor = await Vendor.findById(vendorId).populate('user');
      if (!vendor || !vendor.user) {
        return { success: false, error: 'Vendor not found' };
      }

      const user = vendor.user;
      
      // Check if vendor has email notifications enabled
      const emailEnabled = vendor.settings?.notifications?.emailNotifications !== false;
      
      if (!emailEnabled) {
        return { success: false, error: 'Email notifications disabled' };
      }

      const emailData = {
        vendorName: `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim() || vendor.businessInfo?.companyName || 'Vendor',
        updateTitle: updateData.title || 'Important Business Update',
        updateContent: updateData.content || '',
        actionRequired: updateData.actionRequired || null,
        actionLink: updateData.actionLink || null,
        actionLinkText: updateData.actionLinkText || 'Learn More',
        unsubscribeLink: `${process.env.FRONTEND_URL || 'https://buildhomemartsquares.com'}/vendor/settings`
      };

      await sendTemplateEmail(user.email, 'vendor-business-update', emailData);

      return { success: true, message: 'Business update sent successfully' };
    } catch (error) {
      console.error('Error sending business update:', error);
      return { success: false, error: error.message };
    }
  }

  async sendMarketingTips(vendorId, tipsData) {
    try {
      const vendor = await Vendor.findById(vendorId).populate('user');
      if (!vendor || !vendor.user) {
        return { success: false, error: 'Vendor not found' };
      }

      const user = vendor.user;
      
      // Check if vendor has marketing emails enabled
      const marketingEnabled = vendor.settings?.notifications?.marketingEmails === true;
      
      if (!marketingEnabled) {
        return { success: false, error: 'Marketing emails disabled' };
      }

      const emailData = {
        vendorName: `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim() || vendor.businessInfo?.companyName || 'Vendor',
        tips: tipsData.tips || [],
        resourceLink: `${process.env.FRONTEND_URL || 'https://buildhomemartsquares.com'}/vendor/resources`,
        unsubscribeLink: `${process.env.FRONTEND_URL || 'https://buildhomemartsquares.com'}/vendor/settings`
      };

      await sendTemplateEmail(user.email, 'vendor-marketing-tips', emailData);

      return { success: true, message: 'Marketing tips sent successfully' };
    } catch (error) {
      console.error('Error sending marketing tips:', error);
      return { success: false, error: error.message };
    }
  }

  // Send bulk notifications to multiple vendors
  async sendBulkNotification(vendorIds, notificationType, data) {
    const results = [];
    
    for (const vendorId of vendorIds) {
      try {
        let result;
        switch (notificationType) {
          case 'new_message':
            result = await this.sendNewMessageEmail(vendorId, data);
            break;
          case 'weekly_report':
            result = await this.sendWeeklyReport(vendorId, data);
            break;
          case 'business_update':
            result = await this.sendBusinessUpdate(vendorId, data);
            break;
          case 'marketing_tips':
            result = await this.sendMarketingTips(vendorId, data);
            break;
          default:
            result = { success: false, error: 'Unknown notification type' };
        }
        
        results.push({ vendorId, ...result });
      } catch (error) {
        results.push({ vendorId, success: false, error: error.message });
      }
    }
    
    return results;
  }

  // Get all vendors with specific notification preferences
  async getVendorsWithNotificationEnabled(notificationType) {
    const query = { status: 'active' };
    
    switch (notificationType) {
      case 'email':
        query['settings.notifications.emailNotifications'] = true;
        break;
      case 'weekly_reports':
        query['settings.notifications.weeklyReports'] = true;
        break;
      case 'marketing':
        query['settings.notifications.marketingEmails'] = true;
        break;
    }
    
    return await Vendor.find(query).populate('user', 'email profile');
  }
}

module.exports = new VendorNotificationService();
