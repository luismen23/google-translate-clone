/* eslint-disable react/react-in-jsx-scope */
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import { useEffect, useCallback } from 'react'
import { useStoreReducer } from './hooks/useStoreReducer'
import { Container, Row, Col, Button, Stack } from 'react-bootstrap'
import { AUTO_LANGUAGE } from './constants'
import { ArrowsIcon } from './components/icons'
import { LanguageSelect } from './components/LanguageSelect'
import { SectionType } from './types.d'
import { TextArea } from './components/TextArea'

function App() {
  // 1. Usa tu hook reducer
  const {
    fromLanguage,
    toLanguage,
    fromText,
    result,
    loading,
    error, // Obtén el estado de error
    interchangeLanguages,
    setFromLanguage,
    setToLanguage,
    setFromText,
    setError, // Obtén el dispatcher de error
    // Ya no necesitas setResult directamente aquí
    dispatch,
  } = useStoreReducer()

  // 2. Función para llamar a la Netlify Function (adaptada para usar dispatch)
  // Usamos useCallback para que la función no se recree en cada render,
  // si bien con dispatch no es estrictamente necesario ya que dispatch es estable.
  const handleTranslate = useCallback(async () => {
    // No necesitamos verificar el texto vacío aquí si el useEffect ya lo hace
    // No necesitamos poner loading=true aquí, SET_FROM_TEXT ya lo hace

    if (!fromText.trim()) {
      // console.log("handleTranslate skipped: empty text"); // Debug
      // Asegurar estado limpio si no hay texto
      dispatch({ type: 'SET_ERROR', payload: null })
      dispatch({ type: 'SET_RESULT', payload: '' })
      return
    }
    // Construye el cuerpo de la solicitud
    const body: { text: string; targetLang: string; sourceLang?: string } = {
      text: fromText, // Usa el texto del estado global
      targetLang: toLanguage, // Usa el idioma destino del estado global
    }

    // Solo añade sourceLang si no es 'auto'
    if (fromLanguage !== AUTO_LANGUAGE) {
      body.sourceLang = fromLanguage
    }

    try {
      const response = await fetch('/.netlify/functions/translate', {
        // Endpoint de tu función
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData = await response.json()
        // Lanza un error para que el catch lo maneje
        throw new Error(
          errorData.error || `Request failed with status ${response.status}`
        )
      }

      const data = await response.json()

      // Actualiza el estado global con el resultado usando dispatch

      dispatch({ type: 'SET_RESULT', payload: data.translation }) // Asumiendo que tienes SET_RESULT
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Translation fetch error:', err)
      // Actualiza el estado global con el error usando dispatch
      setError(
        err.message || 'An unexpected error occurred during translation.'
      )
    }
    // No necesitas setLoading(false) aquí, SET_RESULT y SET_ERROR ya lo hacen
  }, [fromText, fromLanguage, toLanguage, setError, dispatch]) // Incluye dispatch y setError como dependencias

  // 3. Traducción Automática con Debounce (usando el estado del reducer)
  useEffect(() => {
    // Limpia el timeout anterior si cambian las dependencias

    // Si no hay texto de entrada, no traducir.
    // Aseguramos que loading sea false y error null a través del reducer (acción SET_FROM_TEXT)
    if (!fromText.trim()) {
      // Opcional: podrías forzar limpieza aquí si el reducer no lo hace al 100%
      // setError(null); // Ya lo hace SET_FROM_TEXT
      // dispatch({ type: 'SET_RESULT', payload: ''}); // Ya lo hace SET_FROM_TEXT
      return
    }

    // Programar la ejecución de handleTranslate después del delay
    // console.log("useEffect setting timeout for:", fromText); // Debug
    const timerId = setTimeout(() => {
      // console.log("setTimeout executing handleTranslate for:", fromText) // Debug
      handleTranslate()
    }, 750) // Delay de 750ms

    // Función de limpieza: Se ejecuta si el componente se desmonta O
    // si las dependencias [fromText, fromLanguage, toLanguage] cambian ANTES de que se ejecute el timeout.
    // Esto cancela el timeout anterior antes de programar uno nuevo (si aplica).
    return () => {
      // console.log("useEffect cleanup clearing timeout ID:", timerId) // Debug
      clearTimeout(timerId)
    }
    // Dependencias: Ejecutar cuando cambie el texto, o los idiomas seleccionados
  }, [fromText, fromLanguage, toLanguage]) // handleTranslate está en las deps por useCallback

  return (
    <Container fluid>
      <h2 style={{ width: '250px', margin: ' 0 auto', marginBottom: '10px' }}>
        Google Translate
      </h2>

      <Row>
        <Col>
          <Stack gap={2}>
            <LanguageSelect
              onChange={setFromLanguage}
              type={SectionType.From}
              value={fromLanguage}
            />
            <TextArea
              type={SectionType.From}
              value={fromText}
              onChange={setFromText}
            />
          </Stack>
        </Col>

        <Col>
          <Button
            disabled={fromLanguage === AUTO_LANGUAGE}
            onClick={interchangeLanguages}
            variant='link'
            aria-label='Interchange languages'
          >
            <ArrowsIcon />
          </Button>
        </Col>

        <Col>
          <Stack gap={2}>
            <LanguageSelect
              onChange={setToLanguage}
              type={SectionType.To}
              value={toLanguage}
            />

            <TextArea
              type={SectionType.To}
              value={result}
              onChange={() => {}}
              loading={loading}
            />
            {error && (
              <div className='alert alert-danger mt-2' role='alert'>
                Error: {error}
              </div>
            )}
          </Stack>
        </Col>
      </Row>
    </Container>
  )
}

export default App
