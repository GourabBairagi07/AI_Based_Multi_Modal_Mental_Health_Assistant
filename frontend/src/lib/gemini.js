import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const generateResponse = async (message, messages) => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-pro',
    });
    
    const chat = model.startChat({
      history: messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
      generationConfig: {
        maxOutputTokens: 2000,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(message);
    return (await result.response).text();
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
};
