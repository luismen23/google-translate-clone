import { Handler, HandlerEvent } from '@netlify/functions'
import fetch from 'node-fetch' // Usamos node-fetch para la llamada API

const handler: Handler = async (event: HandlerEvent) => {
  // 1. Validar método HTTP (solo aceptamos POST)
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405, // Method Not Allowed
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    }
  }

  // 2. Obtener la API Key de las variables de entorno de Netlify (¡MUY IMPORTANTE!)
  const DEEPL_API_KEY = process.env.DEEPL_API_KEY
  if (!DEEPL_API_KEY) {
    console.error('DeepL API Key not found in environment variables.')
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Server configuration error: Missing API Key.',
      }),
    }
  }

  // 3. Parsear los datos enviados desde el frontend
  let textToTranslate: string
  let targetLang: string
  let sourceLang: string | undefined // El idioma origen es opcional para DeepL

  try {
    // Asegúrate de que el body no sea null o undefined antes de parsearlo
    if (!event.body) {
      throw new Error('Request body is missing')
    }
    const body = JSON.parse(event.body)
    textToTranslate = body.text
    targetLang = body.targetLang
    sourceLang = body.sourceLang // Puede ser undefined si quieres autodetectar

    if (!textToTranslate || !targetLang) {
      throw new Error("Missing 'text' or 'targetLang' in request body")
    }
  } catch (error) {
    console.error('Error parsing request body:', error)
    return {
      statusCode: 400, // Bad Request
      body: JSON.stringify({
        error:
          "Invalid request body. Ensure 'text' and 'targetLang' are provided.",
      }),
    }
  }

  // 4. Construir la URL y los parámetros para la API de DeepL
  // Usa la URL correcta para tu tipo de plan (Free o Pro)
  const deeplUrl = `https://api-free.deepl.com/v2/translate` // O https://api.deepl.com/v2/translate para Pro
  // const deeplUrl = `https://api.deepl.com/v2/translate`; // Para usuarios Pro

  const params = new URLSearchParams()
  params.append('text', textToTranslate)
  params.append('target_lang', targetLang)
  if (sourceLang) {
    params.append('source_lang', sourceLang)
  }

  // 5. Realizar la llamada a la API de DeepL
  try {
    const response = await fetch(deeplUrl, {
      method: 'POST',
      headers: {
        Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    })

    // 6. Procesar la respuesta de DeepL
    if (!response.ok) {
      // Si DeepL devuelve un error (ej. 4xx, 5xx)
      const errorBody = await response.text() // Intenta obtener más detalles del error
      console.error(`DeepL API Error (${response.status}): ${errorBody}`)
      throw new Error(`DeepL API request failed with status ${response.status}`)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await response.json()

    // Extraer la traducción del objeto de respuesta de DeepL
    const translatedText =
      data.translations && data.translations[0] ? data.translations[0].text : ''

    // 7. Devolver la traducción al frontend
    return {
      statusCode: 200,
      body: JSON.stringify({ translation: translatedText }),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  } catch (error) {
    console.error('Error calling DeepL API:', error)
    return {
      statusCode: 500, // Internal Server Error
      body: JSON.stringify({ error: `Failed to translate: ${error.message}` }),
    }
  }
}

export { handler }
