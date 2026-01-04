import { NextRequest, NextResponse } from 'next/server'

const CASPER_RPC_URL = process.env.NEXT_PUBLIC_CASPER_RPC || 'https://node.testnet.casper.network/rpc'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(CASPER_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
