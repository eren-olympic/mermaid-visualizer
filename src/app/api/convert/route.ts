import { NextResponse } from 'next/server';

const NEOBASE_API_URL = 'https://neobase.app/v1/chat-messages';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    const response = await fetch(NEOBASE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEOBASE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `Convert the following text into a proper Mermaid diagram syntax. Only return the Mermaid code without any explanation:\n\n${text}`,
        response_mode: 'blocking',
        user: 'mermaid_converter'
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({ mermaid: data.answer });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}