import { type NextRequest, NextResponse } from "next/server"
import { initializeCRM, syncContactToCRM, createCRMDeal, updateCRMDealStatus } from "@/lib/crm-integration"

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json()

    switch (action) {
      case 'initialize':
        const initialized = await initializeCRM(data.config)
        return NextResponse.json({ success: initialized })

      case 'sync_contact':
        const contactId = await syncContactToCRM(data.contact)
        return NextResponse.json({ contactId })

      case 'create_deal':
        const dealId = await createCRMDeal(data.deal)
        return NextResponse.json({ dealId })

      case 'update_deal':
        const updated = await updateCRMDealStatus(data.dealId, data.status, data.notes)
        return NextResponse.json({ success: updated })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('CRM API error:', error)
    return NextResponse.json({ error: 'CRM operation failed' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'status':
        // Return CRM connection status
        return NextResponse.json({
          connected: false, // This would check actual connection status
          provider: null,
          lastSync: null
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('CRM status check error:', error)
    return NextResponse.json({ error: 'Status check failed' }, { status: 500 })
  }
}