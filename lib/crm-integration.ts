// CRM Integration utilities for connecting with external CRM systems
// Supports popular CRMs like HubSpot, Salesforce, Zoho CRM, Pipedrive

interface CRMConfig {
  provider: 'hubspot' | 'salesforce' | 'zoho' | 'pipedrive' | 'custom'
  apiKey?: string
  apiSecret?: string
  accessToken?: string
  baseUrl?: string
  enabled: boolean
}

interface CRMContact {
  email: string
  name: string
  mobile?: string
  source: 'enquiry' | 'exam_registration' | 'contact_form'
  courseInterest?: string
  examInterest?: string
  status: 'new' | 'contacted' | 'qualified' | 'converted'
  notes?: string
  customFields?: Record<string, any>
}

interface CRMDeal {
  title: string
  contactId: string
  amount: number
  currency: string
  stage: 'prospect' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  examType?: string
  closeDate?: Date
  customFields?: Record<string, any>
}

class CRMIntegration {
  private config: CRMConfig

  constructor(config: CRMConfig) {
    this.config = config
  }

  // Initialize CRM connection
  async initialize(): Promise<boolean> {
    if (!this.config.enabled) return false

    try {
      switch (this.config.provider) {
        case 'hubspot':
          return await this.initializeHubSpot()
        case 'salesforce':
          return await this.initializeSalesforce()
        case 'zoho':
          return await this.initializeZoho()
        case 'pipedrive':
          return await this.initializePipedrive()
        default:
          return false
      }
    } catch (error) {
      console.error('CRM initialization failed:', error)
      return false
    }
  }

  // Create or update contact in CRM
  async syncContact(contact: CRMContact): Promise<string | null> {
    if (!this.config.enabled) return null

    try {
      switch (this.config.provider) {
        case 'hubspot':
          return await this.syncToHubSpot(contact)
        case 'salesforce':
          return await this.syncToSalesforce(contact)
        case 'zoho':
          return await this.syncToZoho(contact)
        case 'pipedrive':
          return await this.syncToPipedrive(contact)
        default:
          return null
      }
    } catch (error) {
      console.error('CRM contact sync failed:', error)
      return null
    }
  }

  // Create deal/opportunity in CRM
  async createDeal(deal: CRMDeal): Promise<string | null> {
    if (!this.config.enabled) return null

    try {
      switch (this.config.provider) {
        case 'hubspot':
          return await this.createHubSpotDeal(deal)
        case 'salesforce':
          return await this.createSalesforceOpportunity(deal)
        case 'zoho':
          return await this.createZohoDeal(deal)
        case 'pipedrive':
          return await this.createPipedriveDeal(deal)
        default:
          return null
      }
    } catch (error) {
      console.error('CRM deal creation failed:', error)
      return null
    }
  }

  // Update deal status
  async updateDealStatus(dealId: string, status: string, notes?: string): Promise<boolean> {
    if (!this.config.enabled) return false

    try {
      switch (this.config.provider) {
        case 'hubspot':
          return await this.updateHubSpotDeal(dealId, status, notes)
        case 'salesforce':
          return await this.updateSalesforceOpportunity(dealId, status, notes)
        case 'zoho':
          return await this.updateZohoDeal(dealId, status, notes)
        case 'pipedrive':
          return await this.updatePipedriveDeal(dealId, status, notes)
        default:
          return false
      }
    } catch (error) {
      console.error('CRM deal update failed:', error)
      return false
    }
  }

  // HubSpot Integration Methods
  private async initializeHubSpot(): Promise<boolean> {
    if (!this.config.apiKey) return false

    const response = await fetch('https://api.hubapi.com/crm/v3/properties/contacts', {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    return response.ok
  }

  private async syncToHubSpot(contact: CRMContact): Promise<string | null> {
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          email: contact.email,
          firstname: contact.name.split(' ')[0],
          lastname: contact.name.split(' ').slice(1).join(' '),
          phone: contact.mobile,
          lifecyclestage: contact.status,
          lead_source: contact.source,
          course_interest: contact.courseInterest,
          exam_interest: contact.examInterest,
          notes_last_contacted: contact.notes,
          ...contact.customFields
        }
      })
    })

    if (response.ok) {
      const data = await response.json()
      return data.id
    }

    return null
  }

  private async createHubSpotDeal(deal: CRMDeal): Promise<string | null> {
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/deals', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          dealname: deal.title,
          dealstage: this.mapHubSpotStage(deal.stage),
          amount: deal.amount.toString(),
          closedate: deal.closeDate?.toISOString().split('T')[0],
          dealtype: 'newbusiness',
          exam_type: deal.examType,
          ...deal.customFields
        },
        associations: [{
          to: { id: deal.contactId },
          types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }] // Contact to Deal
        }]
      })
    })

    if (response.ok) {
      const data = await response.json()
      return data.id
    }

    return null
  }

  private async updateHubSpotDeal(dealId: string, status: string, notes?: string): Promise<boolean> {
    const response = await fetch(`https://api.hubapi.com/crm/v3/objects/deals/${dealId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          dealstage: this.mapHubSpotStage(status),
          deal_notes: notes
        }
      })
    })

    return response.ok
  }

  private mapHubSpotStage(stage: string): string {
    const stageMap: Record<string, string> = {
      'prospect': 'appointmentscheduled',
      'qualified': 'qualifiedtobuy',
      'proposal': 'presentationscheduled',
      'negotiation': 'decisionmakerboughtin',
      'closed_won': 'closedwon',
      'closed_lost': 'closedlost'
    }
    return stageMap[stage] || 'appointmentscheduled'
  }

  // Salesforce Integration Methods
  private async initializeSalesforce(): Promise<boolean> {
    if (!this.config.accessToken || !this.config.baseUrl) return false

    const response = await fetch(`${this.config.baseUrl}/services/data/v57.0/limits`, {
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    return response.ok
  }

  private async syncToSalesforce(contact: CRMContact): Promise<string | null> {
    const response = await fetch(`${this.config.baseUrl}/services/data/v57.0/sobjects/Contact`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Email: contact.email,
        FirstName: contact.name.split(' ')[0],
        LastName: contact.name.split(' ').slice(1).join(' ') || 'Unknown',
        MobilePhone: contact.mobile,
        LeadSource: contact.source,
        Course_Interest__c: contact.courseInterest,
        Exam_Interest__c: contact.examInterest,
        Status__c: contact.status,
        Notes__c: contact.notes,
        ...contact.customFields
      })
    })

    if (response.ok) {
      const data = await response.json()
      return data.id
    }

    return null
  }

  private async createSalesforceOpportunity(deal: CRMDeal): Promise<string | null> {
    const response = await fetch(`${this.config.baseUrl}/services/data/v57.0/sobjects/Opportunity`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Name: deal.title,
        AccountId: deal.contactId,
        Amount: deal.amount,
        CurrencyIsoCode: deal.currency,
        StageName: this.mapSalesforceStage(deal.stage),
        CloseDate: deal.closeDate?.toISOString().split('T')[0],
        Type: 'New Customer',
        Exam_Type__c: deal.examType,
        ...deal.customFields
      })
    })

    if (response.ok) {
      const data = await response.json()
      return data.id
    }

    return null
  }

  private async updateSalesforceOpportunity(opportunityId: string, status: string, notes?: string): Promise<boolean> {
    const response = await fetch(`${this.config.baseUrl}/services/data/v57.0/sobjects/Opportunity/${opportunityId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        StageName: this.mapSalesforceStage(status),
        Description: notes
      })
    })

    return response.ok
  }

  private mapSalesforceStage(stage: string): string {
    const stageMap: Record<string, string> = {
      'prospect': 'Prospecting',
      'qualified': 'Qualification',
      'proposal': 'Proposal/Price Quote',
      'negotiation': 'Negotiation/Review',
      'closed_won': 'Closed Won',
      'closed_lost': 'Closed Lost'
    }
    return stageMap[stage] || 'Prospecting'
  }

  // Zoho CRM Integration Methods
  private async initializeZoho(): Promise<boolean> {
    if (!this.config.apiKey) return false

    const response = await fetch('https://www.zohoapis.com/crm/v2/org', {
      headers: {
        'Authorization': `Zoho-oauthtoken ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    return response.ok
  }

  private async syncToZoho(contact: CRMContact): Promise<string | null> {
    const response = await fetch('https://www.zohoapis.com/crm/v2/Contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Zoho-oauthtoken ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: [{
          Email: contact.email,
          First_Name: contact.name.split(' ')[0],
          Last_Name: contact.name.split(' ').slice(1).join(' ') || 'Unknown',
          Mobile: contact.mobile,
          Lead_Source: contact.source,
          Course_Interest: contact.courseInterest,
          Exam_Interest: contact.examInterest,
          Lead_Status: contact.status,
          Description: contact.notes,
          ...contact.customFields
        }]
      })
    })

    if (response.ok) {
      const data = await response.json()
      return data.data[0].details.id
    }

    return null
  }

  private async createZohoDeal(deal: CRMDeal): Promise<string | null> {
    const response = await fetch('https://www.zohoapis.com/crm/v2/Deals', {
      method: 'POST',
      headers: {
        'Authorization': `Zoho-oauthtoken ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: [{
          Deal_Name: deal.title,
          Contact_Name: { id: deal.contactId },
          Amount: deal.amount,
          Currency: deal.currency,
          Stage: this.mapZohoStage(deal.stage),
          Closing_Date: deal.closeDate?.toISOString().split('T')[0],
          Type: 'New Business',
          Exam_Type: deal.examType,
          ...deal.customFields
        }]
      })
    })

    if (response.ok) {
      const data = await response.json()
      return data.data[0].details.id
    }

    return null
  }

  private async updateZohoDeal(dealId: string, status: string, notes?: string): Promise<boolean> {
    const response = await fetch(`https://www.zohoapis.com/crm/v2/Deals/${dealId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Zoho-oauthtoken ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: [{
          Stage: this.mapZohoStage(status),
          Description: notes
        }]
      })
    })

    return response.ok
  }

  private mapZohoStage(stage: string): string {
    const stageMap: Record<string, string> = {
      'prospect': 'Qualification',
      'qualified': 'Needs Analysis',
      'proposal': 'Value Proposition',
      'negotiation': 'Negotiation/Review',
      'closed_won': 'Closed Won',
      'closed_lost': 'Closed Lost'
    }
    return stageMap[stage] || 'Qualification'
  }

  // Pipedrive Integration Methods
  private async initializePipedrive(): Promise<boolean> {
    if (!this.config.apiKey) return false

    const response = await fetch('https://api.pipedrive.com/v1/users/me', {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    return response.ok
  }

  private async syncToPipedrive(contact: CRMContact): Promise<string | null> {
    const response = await fetch('https://api.pipedrive.com/v1/persons', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: contact.name,
        email: [{ value: contact.email, primary: true }],
        phone: contact.mobile ? [{ value: contact.mobile, primary: true }] : [],
        source: contact.source,
        course_interest: contact.courseInterest,
        exam_interest: contact.examInterest,
        status: contact.status,
        notes: contact.notes,
        ...contact.customFields
      })
    })

    if (response.ok) {
      const data = await response.json()
      return data.data.id.toString()
    }

    return null
  }

  private async createPipedriveDeal(deal: CRMDeal): Promise<string | null> {
    const response = await fetch('https://api.pipedrive.com/v1/deals', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: deal.title,
        person_id: parseInt(deal.contactId),
        value: deal.amount,
        currency: deal.currency,
        status: 'open',
        stage_id: this.mapPipedriveStage(deal.stage),
        expected_close_date: deal.closeDate?.toISOString().split('T')[0],
        exam_type: deal.examType,
        ...deal.customFields
      })
    })

    if (response.ok) {
      const data = await response.json()
      return data.data.id.toString()
    }

    return null
  }

  private async updatePipedriveDeal(dealId: string, status: string, notes?: string): Promise<boolean> {
    const response = await fetch(`https://api.pipedrive.com/v1/deals/${dealId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: status === 'closed_won' ? 'won' : status === 'closed_lost' ? 'lost' : 'open',
        stage_id: this.mapPipedriveStage(status),
        notes: notes
      })
    })

    return response.ok
  }

  private mapPipedriveStage(stage: string): number {
    // These are example stage IDs - would need to be configured per Pipedrive account
    const stageMap: Record<string, number> = {
      'prospect': 1,
      'qualified': 2,
      'proposal': 3,
      'negotiation': 4,
      'closed_won': 5,
      'closed_lost': 6
    }
    return stageMap[stage] || 1
  }
}

// Global CRM instance
let crmInstance: CRMIntegration | null = null

export const initializeCRM = async (config: CRMConfig): Promise<boolean> => {
  crmInstance = new CRMIntegration(config)
  return await crmInstance.initialize()
}

export const getCRM = (): CRMIntegration | null => {
  return crmInstance
}

export const syncContactToCRM = async (contact: CRMContact): Promise<string | null> => {
  if (!crmInstance) return null
  return await crmInstance.syncContact(contact)
}

export const createCRMDeal = async (deal: CRMDeal): Promise<string | null> => {
  if (!crmInstance) return null
  return await crmInstance.createDeal(deal)
}

export const updateCRMDealStatus = async (dealId: string, status: string, notes?: string): Promise<boolean> => {
  if (!crmInstance) return false
  return await crmInstance.updateDealStatus(dealId, status, notes)
}

export default CRMIntegration