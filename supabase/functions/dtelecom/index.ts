import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DTelecomResponse {
  token: string;
  room: string;
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action } = await req.json()
    const DTELECOM_API_KEY = Deno.env.get('DTELECOM_API_KEY')

    if (!DTELECOM_API_KEY) {
      throw new Error('DTELECOM_API_KEY not found')
    }

    if (action === 'create-room') {
      // Create a new room in dTelecom
      const response = await fetch('https://api.dtelecom.org/rooms', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DTELECOM_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'p2p',
          max_participants: 2,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to create room: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Created room:', data)

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'get-token') {
      const { roomId, userId } = await req.json()
      
      // Get access token for the room
      const response = await fetch('https://api.dtelecom.org/tokens', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DTELECOM_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_id: roomId,
          user_id: userId,
          capabilities: ['publish', 'subscribe'],
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to get token: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Generated token:', data)

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    throw new Error('Invalid action')
  } catch (error) {
    console.error('Error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})