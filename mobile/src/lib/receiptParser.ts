import AsyncStorage from '@react-native-async-storage/async-storage';
import { ParsedReceiptResult } from '../types';

const STORAGE_KEY_GEMINI = '@gemini_vision_api_key';

export async function getStoredGeminiKey(): Promise<string> {
  try {
    const key = await AsyncStorage.getItem(STORAGE_KEY_GEMINI);
    return key?.trim() || '';
  } catch {
    return '';
  }
}

export async function saveStoredGeminiKey(key: string): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY_GEMINI, key.trim());
  } catch (err) {
    console.error('Failed to save Gemini key', err);
  }
}

/**
 * Normalizes category into standard app categories
 */
function normalizeCategory(rawCategory: string): string {
  const lower = (rawCategory || '').toLowerCase();
  if (lower.includes('groc') || lower.includes('sauda') || lower.includes('mart') || lower.includes('super')) {
    return 'Groceries';
  }
  if (lower.includes('food') || lower.includes('dining') || lower.includes('rest') || lower.includes('cafe') || lower.includes('chai')) {
    return 'Food & Dining';
  }
  if (lower.includes('fuel') || lower.includes('petrol') || lower.includes('cng') || lower.includes('diesel') || lower.includes('shell') || lower.includes('pso')) {
    return 'Fuel';
  }
  if (lower.includes('bill') || lower.includes('util') || lower.includes('bijli') || lower.includes('gas') || lower.includes('wapda') || lower.includes('lesco') || lower.includes('k-electric')) {
    return 'Utilities';
  }
  if (lower.includes('med') || lower.includes('pharm') || lower.includes('dawa') || lower.includes('doctor') || lower.includes('hospital')) {
    return 'Medical';
  }
  if (lower.includes('shop') || lower.includes('cloth') || lower.includes('kapre') || lower.includes('shoes')) {
    return 'Shopping';
  }
  if (lower.includes('edu') || lower.includes('school') || lower.includes('fee') || lower.includes('college') || lower.includes('books')) {
    return 'Education';
  }
  if (lower.includes('trav') || lower.includes('ride') || lower.includes('careem') || lower.includes('indrive') || lower.includes('uber')) {
    return 'Travel';
  }
  return 'Other';
}

/**
 * Parses an invoice or receipt image via Gemini 1.5 Flash Vision API
 */
export async function parseReceiptWithGemini(
  base64Image: string,
  apiKey: string
): Promise<ParsedReceiptResult> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    throw new Error('Please provide a Google Gemini API Key to enable automated AI receipt scanning.');
  }

  // Remove data URI prefix if present
  const base64Data = base64Image.includes(',')
    ? base64Image.split(',')[1]
    : base64Image;

  const prompt = `You are an expert Pakistani receipt and invoice OCR assistant.
Examine this invoice/receipt image carefully.
Extract the following information accurately in JSON format:
{
  "amount": number, // The final Net Total / Grand Total payable in Pakistani Rupees (PKR / Rs). Be strictly accurate and ignore intermediate subtotals.
  "merchant": string, // Name of the shop, supermarket, fuel station, pharmacy, or restaurant (e.g. Imtiaz Super Market, Al-Fatah, Shell, D. Watson, KFC, etc.). If unnamed, describe the vendor type.
  "category": string, // One of: "Groceries", "Food & Dining", "Fuel", "Utilities", "Shopping", "Medical", "Travel", "Education", "Other"
  "date": string, // Transaction date in YYYY-MM-DD format if visible, otherwise use current date "${new Date().toISOString().split('T')[0]}"
  "description": string, // A short list or summary of key items purchased (e.g., "Milk, cooking oil, detergent" or "Petrol 20 Litres")
  "confidence": number // Confidence rating from 0.0 to 1.0
}
Strict requirement: Return ONLY the JSON object. Do not enclose in backticks or markdown quotes.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${cleanKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: base64Data,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        response_mime_type: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let msg = `AI Scanner error (${response.status})`;
    try {
      const errObj = JSON.parse(errorText);
      if (errObj.error?.message) {
        msg = errObj.error.message;
      }
    } catch {}
    throw new Error(msg);
  }

  const result = await response.json();
  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('Could not read invoice content from image.');
  }

  // Clean possible markdown quotes
  const cleanJson = text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  const parsed = JSON.parse(cleanJson);

  return {
    amount: typeof parsed.amount === 'number' ? Math.round(parsed.amount) : 0,
    merchant: parsed.merchant || 'Shop / Vendor',
    category: normalizeCategory(parsed.category),
    date: parsed.date || new Date().toISOString().split('T')[0],
    description: parsed.description || '',
    confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.9,
  };
}
