import Groq from 'groq-sdk';

console.log('GROQ_API_KEY status:', process.env.GROQ_API_KEY ? 'LOADED' : 'MISSING');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

export async function summarizeEmail(emailBody: string) {
  console.log('Summarize called with key:', process.env.GROQ_API_KEY ? 'Present' : 'Missing');
  try {
    const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'user',
          content: `Summarize this email in 2-3 bullet points. Be concise:\n\n${emailBody}`,
        },
      ],
    });
    console.log('Groq response received');
    return response.choices[0]?.message?.content || 'Summary unavailable';
  } catch (error: any) {
    console.error('Groq API Error:', error.message);
    console.error('Full error:', JSON.stringify(error, null, 2));
    throw error;
  }
}

export async function suggestReplies(emailBody: string) {
  try {
    const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'user',
          content: `Suggest 3 short reply options for this email. Return as JSON array:\n\n${emailBody}`,
        },
      ],
    });
    const content = response.choices[0]?.message?.content || '[]';
    try {
      return JSON.parse(content);
    } catch {
      return ['Okay, thanks!', 'I will check and get back.', 'Got it.'];
    }
  } catch (error: any) {
    console.error('Groq API Error:', error.message);
    throw error;
  }
}