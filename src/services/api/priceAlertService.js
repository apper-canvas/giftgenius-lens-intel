class PriceAlertService {
  constructor() {
    this.tableName = 'price_alert_c';
    // Initialize ApperClient with Project ID and Public Key
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
  }

  async delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getAll() {
    try {
      await this.delay(200);
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "enabled_c" } },
          { field: { Name: "price_drop_threshold_c" } },
          { field: { Name: "absolute_threshold_c" } },
          { field: { Name: "stock_alerts_c" } },
          { field: { Name: "email_enabled_c" } },
          { field: { Name: "push_enabled_c" } },
          { field: { Name: "frequency_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "last_triggered_c" } },
          { field: { Name: "total_savings_c" } },
          { field: { Name: "gift_c" } },
          { field: { Name: "recipient_c" } }
        ],
        orderBy: [{ fieldName: "Id", sorttype: "DESC" }]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      // Transform database response to match UI expectations
      const alerts = (response.data || []).map(record => ({
        Id: record.Id,
        giftId: record.gift_c?.Id || null,
        recipientId: record.recipient_c?.Id || null,
        enabled: record.enabled_c || false,
        priceDropThreshold: parseFloat(record.price_drop_threshold_c) || 0,
        absoluteThreshold: parseFloat(record.absolute_threshold_c) || 0,
        stockAlerts: record.stock_alerts_c || false,
        emailEnabled: record.email_enabled_c || false,
        pushEnabled: record.push_enabled_c || false,
        frequency: record.frequency_c || 'immediate',
        createdAt: record.created_at_c || new Date().toISOString(),
        lastTriggered: record.last_triggered_c || null,
        totalSavings: parseFloat(record.total_savings_c) || 0,
        gift: record.gift_c || null,
        recipient: record.recipient_c || null
      }));

      return alerts;
    } catch (error) {
      console.error("Error fetching price alerts:", error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async getById(id) {
    try {
      await this.delay(150);
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "enabled_c" } },
          { field: { Name: "price_drop_threshold_c" } },
          { field: { Name: "absolute_threshold_c" } },
          { field: { Name: "stock_alerts_c" } },
          { field: { Name: "email_enabled_c" } },
          { field: { Name: "push_enabled_c" } },
          { field: { Name: "frequency_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "last_triggered_c" } },
          { field: { Name: "total_savings_c" } },
          { field: { Name: "gift_c" } },
          { field: { Name: "recipient_c" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success || !response.data) {
        return null;
      }

      // Transform database response to match UI expectations
      const alert = {
        Id: response.data.Id,
        giftId: response.data.gift_c?.Id || null,
        recipientId: response.data.recipient_c?.Id || null,
        enabled: response.data.enabled_c || false,
        priceDropThreshold: parseFloat(response.data.price_drop_threshold_c) || 0,
        absoluteThreshold: parseFloat(response.data.absolute_threshold_c) || 0,
        stockAlerts: response.data.stock_alerts_c || false,
        emailEnabled: response.data.email_enabled_c || false,
        pushEnabled: response.data.push_enabled_c || false,
        frequency: response.data.frequency_c || 'immediate',
        createdAt: response.data.created_at_c || new Date().toISOString(),
        lastTriggered: response.data.last_triggered_c || null,
        totalSavings: parseFloat(response.data.total_savings_c) || 0,
        gift: response.data.gift_c || null,
        recipient: response.data.recipient_c || null
      };

      return alert;
    } catch (error) {
      console.error(`Error fetching price alert with ID ${id}:`, error?.response?.data?.message || error.message);
      return null;
    }
  }

  async create(alertData) {
    try {
      await this.delay(300);
      
      // Transform UI data to database format - only include Updateable fields
      const dbData = {
        Name: alertData.name || `Alert for ${alertData.giftTitle || 'Gift'}`,
        enabled_c: alertData.enabled !== false,
        price_drop_threshold_c: parseFloat(alertData.priceDropThreshold) || 0,
        absolute_threshold_c: parseFloat(alertData.absoluteThreshold) || 0,
        stock_alerts_c: alertData.stockAlerts !== false,
        email_enabled_c: alertData.emailEnabled !== false,
        push_enabled_c: alertData.pushEnabled !== false,
        frequency_c: alertData.frequency || 'immediate',
        created_at_c: new Date().toISOString(),
        total_savings_c: 0,
        gift_c: parseInt(alertData.giftId) || null,
        recipient_c: parseInt(alertData.recipientId) || null
      };

      const params = {
        records: [dbData]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create price alert ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
        }
        
        if (successfulRecords.length > 0) {
          const createdRecord = successfulRecords[0].data;
          return {
            Id: createdRecord.Id,
            giftId: createdRecord.gift_c?.Id || null,
            recipientId: createdRecord.recipient_c?.Id || null,
            enabled: createdRecord.enabled_c || false,
            priceDropThreshold: parseFloat(createdRecord.price_drop_threshold_c) || 0,
            absoluteThreshold: parseFloat(createdRecord.absolute_threshold_c) || 0,
            stockAlerts: createdRecord.stock_alerts_c || false,
            emailEnabled: createdRecord.email_enabled_c || false,
            pushEnabled: createdRecord.push_enabled_c || false,
            frequency: createdRecord.frequency_c || 'immediate',
            createdAt: createdRecord.created_at_c || new Date().toISOString(),
            lastTriggered: createdRecord.last_triggered_c || null,
            totalSavings: parseFloat(createdRecord.total_savings_c) || 0
          };
        }
      }
    } catch (error) {
      console.error("Error creating price alert:", error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async update(id, alertData) {
    try {
      await this.delay(250);
      
      // Transform UI data to database format - only include Updateable fields
      const dbData = {
        Id: parseInt(id),
        Name: alertData.name || `Alert for Gift`,
        enabled_c: alertData.enabled !== false,
        price_drop_threshold_c: parseFloat(alertData.priceDropThreshold) || 0,
        absolute_threshold_c: parseFloat(alertData.absoluteThreshold) || 0,
        stock_alerts_c: alertData.stockAlerts !== false,
        email_enabled_c: alertData.emailEnabled !== false,
        push_enabled_c: alertData.pushEnabled !== false,
        frequency_c: alertData.frequency || 'immediate',
        last_triggered_c: alertData.lastTriggered || null,
        total_savings_c: parseFloat(alertData.totalSavings) || 0
      };

      const params = {
        records: [dbData]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update price alert ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
        }
        
        if (successfulUpdates.length > 0) {
          const updatedRecord = successfulUpdates[0].data;
          return {
            Id: updatedRecord.Id,
            giftId: updatedRecord.gift_c?.Id || null,
            recipientId: updatedRecord.recipient_c?.Id || null,
            enabled: updatedRecord.enabled_c || false,
            priceDropThreshold: parseFloat(updatedRecord.price_drop_threshold_c) || 0,
            absoluteThreshold: parseFloat(updatedRecord.absolute_threshold_c) || 0,
            stockAlerts: updatedRecord.stock_alerts_c || false,
            emailEnabled: updatedRecord.email_enabled_c || false,
            pushEnabled: updatedRecord.push_enabled_c || false,
            frequency: updatedRecord.frequency_c || 'immediate',
            createdAt: updatedRecord.created_at_c,
            lastTriggered: updatedRecord.last_triggered_c || null,
            totalSavings: parseFloat(updatedRecord.total_savings_c) || 0
          };
        }
      }
    } catch (error) {
      console.error("Error updating price alert:", error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async updateConfig(id, config) {
    return this.update(id, config);
  }

  async toggleAlert(id) {
    try {
      await this.delay(200);
      const alert = await this.getById(id);
      if (!alert) throw new Error("Alert not found");
      
      return this.update(id, { enabled: !alert.enabled });
    } catch (error) {
      console.error("Error toggling alert:", error?.response?.data?.message || error.message);
      throw error;
    }
  }

  async delete(id) {
    try {
      await this.delay(250);
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete price alert ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
        }
        
        return successfulDeletions.length === 1;
      }
    } catch (error) {
      console.error("Error deleting price alert:", error?.response?.data?.message || error.message);
      throw error;
    }
  }

  // Helper methods for compatibility
  async getByGift(giftId) {
    try {
      const alerts = await this.getAll();
      return alerts.filter(alert => alert.giftId === parseInt(giftId));
    } catch (error) {
      console.error("Error fetching alerts by gift:", error?.response?.data?.message || error.message);
      return [];
    }
  }

  async getActiveAlerts() {
    try {
      const alerts = await this.getAll();
      return alerts.filter(alert => alert.enabled);
    } catch (error) {
      console.error("Error fetching active alerts:", error?.response?.data?.message || error.message);
      return [];
    }
  }

  async getNotificationSettings() {
    // Return default global settings - could be stored in a separate settings table
    return {
      emailEnabled: true,
      pushEnabled: true,
      frequency: 'immediate',
      priceDropThreshold: 10,
      absoluteThreshold: 0,
      stockAlerts: true
    };
  }

  async updateNotificationSettings(settings) {
    // Mock implementation for global settings
    return settings;
  }
}

export const priceAlertService = new PriceAlertService();