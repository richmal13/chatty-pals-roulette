import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DTELECOM_API_KEY = Deno.env.get('DTELECOM_API_KEY')
const DTELECOM_API_URL = 'https://api.dtelecom.org'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, roomId } = await req.json()
    let url = `${DTELECOM_API_URL}`
    let method = 'POST'
    
    switch (action) {
      case 'createRoom':
        url += '/rooms'
        break
      case 'joinRoom':
        if (!roomId) {
          throw new Error('Room ID is required for joining')
        }
        url += `/rooms/${roomId}/join`
        break
      default:
        throw new Error('Invalid action')
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${DTELECOM_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('DTelecom API error:', errorData)
      throw new Error(`DTelecom API error: ${response.status}`)
    }

    const data = await response.json()
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in dtelecom function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})