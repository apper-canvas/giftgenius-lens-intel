class GroupGiftService {
  constructor() {
    this.tableName = 'group_gift_c';
    // Initialize ApperClient with Project ID and Public Key
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
  }


async delay(ms = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

async getAll() {
    try {
      await this.delay();
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "title_c" } },
          { field: { Name: "target_amount_c" } },
          { field: { Name: "current_amount_c" } },
          { field: { Name: "deadline_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "occasion_type_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "created_by_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "recipient_c" } },
          { field: { Name: "gift_c" } }
        ],
        orderBy: [{ fieldName: "Id", sorttype: "DESC" }]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      // Transform database response to match UI expectations
      const groupGifts = (response.data || []).map(record => ({
        Id: record.Id,
        title: record.title_c || record.Name || '',
        recipientId: record.recipient_c?.Id || null,
        giftId: record.gift_c?.Id || null,
        occasionType: record.occasion_type_c || 'General',
        targetAmount: parseFloat(record.target_amount_c) || 0,
        currentAmount: parseFloat(record.current_amount_c) || 0,
        createdBy: record.created_by_c || '',
        createdAt: record.created_at_c || new Date().toISOString(),
        deadline: record.deadline_c || new Date().toISOString(),
        status: record.status_c || 'active',
        description: record.description_c || '',
        contributors: [], // Would be loaded from related table
        invitedContributors: [] // Would be loaded from related table
      }));

      return groupGifts;
    } catch (error) {
      console.error("Error fetching group gifts:", error?.response?.data?.message || error.message);
      throw error;
}
  }

  async getById(id) {
    try {
      await this.delay();
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "title_c" } },
          { field: { Name: "target_amount_c" } },
          { field: { Name: "current_amount_c" } },
          { field: { Name: "deadline_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "occasion_type_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "created_by_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "recipient_c" } },
          { field: { Name: "gift_c" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success || !response.data) {
        return null;
      }

      // Transform database response to match UI expectations
      const groupGift = {
        Id: response.data.Id,
        title: response.data.title_c || response.data.Name || '',
        recipientId: response.data.recipient_c?.Id || null,
        giftId: response.data.gift_c?.Id || null,
        occasionType: response.data.occasion_type_c || 'General',
        targetAmount: parseFloat(response.data.target_amount_c) || 0,
        currentAmount: parseFloat(response.data.current_amount_c) || 0,
        createdBy: response.data.created_by_c || '',
        createdAt: response.data.created_at_c || new Date().toISOString(),
        deadline: response.data.deadline_c || new Date().toISOString(),
        status: response.data.status_c || 'active',
        description: response.data.description_c || '',
        contributors: [], // Would be loaded from related table
        invitedContributors: [] // Would be loaded from related table
      };

      return groupGift;
    } catch (error) {
      console.error(`Error fetching group gift with ID ${id}:`, error?.response?.data?.message || error.message);
      return null;
    }
  }

async getByRecipient(recipientId) {
    try {
      const groupGifts = await this.getAll();
      return groupGifts.filter(g => g.recipientId === parseInt(recipientId));
    } catch (error) {
      console.error("Error fetching group gifts by recipient:", error?.response?.data?.message || error.message);
      return [];
    }
  }

async getByCreator(creatorEmail) {
    try {
      const groupGifts = await this.getAll();
      return groupGifts.filter(g => g.createdBy === creatorEmail);
    } catch (error) {
      console.error("Error fetching group gifts by creator:", error?.response?.data?.message || error.message);
      return [];
    }
  }

async create(groupGiftData) {
    try {
      await this.delay();
      
      // Transform UI data to database format - only include Updateable fields
      const dbData = {
        Name: groupGiftData.title || 'Group Gift',
        title_c: groupGiftData.title || '',
        target_amount_c: parseFloat(groupGiftData.targetAmount) || 0,
        current_amount_c: 0,
        deadline_c: groupGiftData.deadline || new Date().toISOString(),
        description_c: groupGiftData.description || '',
        occasion_type_c: groupGiftData.occasionType || 'General',
        status_c: 'active',
        created_by_c: groupGiftData.createdBy || '',
        created_at_c: new Date().toISOString(),
        recipient_c: parseInt(groupGiftData.recipientId) || null,
        gift_c: groupGiftData.giftId ? parseInt(groupGiftData.giftId) : null
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
          console.error(`Failed to create group gift ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
        }
        
        if (successfulRecords.length > 0) {
          const createdRecord = successfulRecords[0].data;
          return {
            Id: createdRecord.Id,
            title: createdRecord.title_c || createdRecord.Name || '',
            recipientId: createdRecord.recipient_c?.Id || null,
            giftId: createdRecord.gift_c?.Id || null,
            occasionType: createdRecord.occasion_type_c || 'General',
            targetAmount: parseFloat(createdRecord.target_amount_c) || 0,
            currentAmount: parseFloat(createdRecord.current_amount_c) || 0,
            createdBy: createdRecord.created_by_c || '',
            createdAt: createdRecord.created_at_c || new Date().toISOString(),
            deadline: createdRecord.deadline_c || new Date().toISOString(),
            status: createdRecord.status_c || 'active',
            description: createdRecord.description_c || '',
            contributors: [],
            invitedContributors: groupGiftData.invitedContributors || []
          };
        }
      }
    } catch (error) {
      console.error("Error creating group gift:", error?.response?.data?.message || error.message);
      throw error;
    }
  }

async update(id, groupGiftData) {
    try {
      await this.delay();
      
      // Transform UI data to database format - only include Updateable fields
      const dbData = {
        Id: parseInt(id),
        Name: groupGiftData.title || 'Group Gift',
        title_c: groupGiftData.title || '',
        target_amount_c: parseFloat(groupGiftData.targetAmount) || 0,
        current_amount_c: parseFloat(groupGiftData.currentAmount) || 0,
        deadline_c: groupGiftData.deadline || new Date().toISOString(),
        description_c: groupGiftData.description || '',
        occasion_type_c: groupGiftData.occasionType || 'General',
        status_c: groupGiftData.status || 'active'
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
          console.error(`Failed to update group gift ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
        }
        
        if (successfulUpdates.length > 0) {
          const updatedRecord = successfulUpdates[0].data;
          return {
            Id: updatedRecord.Id,
            title: updatedRecord.title_c || updatedRecord.Name || '',
            recipientId: updatedRecord.recipient_c?.Id || null,
            giftId: updatedRecord.gift_c?.Id || null,
            occasionType: updatedRecord.occasion_type_c || 'General',
            targetAmount: parseFloat(updatedRecord.target_amount_c) || 0,
            currentAmount: parseFloat(updatedRecord.current_amount_c) || 0,
            createdBy: updatedRecord.created_by_c || '',
            createdAt: updatedRecord.created_at_c || new Date().toISOString(),
            deadline: updatedRecord.deadline_c || new Date().toISOString(),
            status: updatedRecord.status_c || 'active',
            description: updatedRecord.description_c || '',
            contributors: groupGiftData.contributors || [],
            invitedContributors: groupGiftData.invitedContributors || []
          };
        }
      }
    } catch (error) {
      console.error("Error updating group gift:", error?.response?.data?.message || error.message);
      throw error;
}
  }

  async delete(id) {
    try {
      await this.delay();
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
          console.error(`Failed to delete group gift ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
        }
        
        return successfulDeletions.length === 1;
      }
    } catch (error) {
      console.error("Error deleting group gift:", error?.response?.data?.message || error.message);
      throw error;
    }
  }

// Mock implementations for contributor functionality
  // In a full implementation, these would work with related contributor tables
  async addContribution(id, contributionData) {
    try {
      await this.delay();
      
      const groupGift = await this.getById(id);
      if (!groupGift) throw new Error("Group gift not found");
      
      const newContribution = {
        Id: Math.random(), // Mock ID
        name: contributionData.name,
        email: contributionData.email,
        amount: parseFloat(contributionData.amount),
        contributedAt: new Date().toISOString(),
        message: contributionData.message || ''
      };

      // Update current amount in the database
      const newCurrentAmount = groupGift.currentAmount + newContribution.amount;
      const status = newCurrentAmount >= groupGift.targetAmount ? 'completed' : 'active';
      
      await this.update(id, { 
        currentAmount: newCurrentAmount,
        status: status
      });
      
      return newContribution;
    } catch (error) {
      console.error("Error adding contribution:", error?.response?.data?.message || error.message);
      throw error;
    }
  }

async inviteContributors(id, invitations) {
    try {
      await this.delay();
      
      const newInvitations = invitations.map(invitation => ({
        email: invitation.email,
        name: invitation.name || invitation.email,
        invitedAt: new Date().toISOString(),
        status: 'pending'
      }));

      // Mock implementation - in real app would store in related table
      return newInvitations;
    } catch (error) {
      console.error("Error inviting contributors:", error?.response?.data?.message || error.message);
      throw error;
    }
  }

async removeInvitation(id, email) {
    try {
      await this.delay();
      // Mock implementation - in real app would remove from related table
      return true;
    } catch (error) {
      console.error("Error removing invitation:", error?.response?.data?.message || error.message);
      throw error;
    }
  }

async getContributionStats() {
    try {
      await this.delay();
      const groupGifts = await this.getAll();
      
      const stats = {
        totalGroupGifts: groupGifts.length,
        activeGroupGifts: groupGifts.filter(g => g.status === 'active').length,
        completedGroupGifts: groupGifts.filter(g => g.status === 'completed').length,
        totalAmount: groupGifts.reduce((sum, g) => sum + (g.currentAmount || 0), 0),
        averageContribution: 0,
        totalContributors: 0
      };

      return stats;
    } catch (error) {
      console.error("Error fetching contribution stats:", error?.response?.data?.message || error.message);
      return {
        totalGroupGifts: 0,
        activeGroupGifts: 0,
        completedGroupGifts: 0,
        totalAmount: 0,
        averageContribution: 0,
        totalContributors: 0
      };
    }
  }
}

export const groupGiftService = new GroupGiftService();