/* eslint-disable react/react-in-jsx-scope */
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import { useEffect, useCallback, useState } from 'react'
import { useStoreReducer } from './hooks/useStoreReducer'
import { Container, Row, Col, Button, Stack } from 'react-bootstrap'
import { AUTO_LANGUAGE } from './constants'
import { ArrowsIcon } from './components/icons'
import { LanguageSelect } from './components/LanguageSelect'
import { SectionType } from './types.d'
import { TextArea } from './components/TextArea'

function App() {
  const {
    fromLanguage,
    toLanguage,
    fromText,
    result,
    loading,
    error,
    interchangeLanguages,
    setFromLanguage,
    setToLanguage,
    setFromText,
    setError,
    dispatch,
  } = useStoreReducer()

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('theme')
    if (savedMode) {
      return savedMode === 'dark'
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const root = document.documentElement
    if (isDarkMode) {
      root.setAttribute('data-bs-theme', 'dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.removeAttribute('data-bs-theme')
      localStorage.setItem('theme', 'light')
    }
  }, [isDarkMode])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  const handleTranslate = useCallback(async () => {
    if (!fromText.trim()) {
      dispatch({ type: 'SET_ERROR', payload: null })
      dispatch({ type: 'SET_RESULT', payload: '' })
      return
    }

    const body: { text: string; targetLang: string; sourceLang?: string } = {
      text: fromText,
      targetLang: toLanguage,
    }

    if (fromLanguage !== AUTO_LANGUAGE) {
      body.sourceLang = fromLanguage
    }

    try {
      const response = await fetch('/.netlify/functions/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(
          errorData.error || `Request failed with status ${response.status}`
        )
      }

      const data = await response.json()

      dispatch({ type: 'SET_RESULT', payload: data.translation })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Translation fetch error:', err)

      setError(
        err.message || 'An unexpected error occurred during translation.'
      )
    }
  }, [fromText, fromLanguage, toLanguage, setError, dispatch])

  // Automatic Translation with Debounce (using reducer state)
  useEffect(() => {
    // If input text is empty, do not translate.
    if (!fromText.trim()) {
      return
    }

    // Schedule handleTranslate execution after a delay
    const timerId = setTimeout(() => {
      handleTranslate()
    }, 750) // 750ms delay

    // Cleanup function: Clears the previous timeout if dependencies change
    // or the component unmounts before the timeout executes.
    return () => {
      clearTimeout(timerId)
    }
    // Dependencies: Execute when text, or selected languages change
  }, [fromText, fromLanguage, toLanguage]) // handleTranslate is a dependency due to useCallback

  return (
    <Container fluid className='d-flex flex-column align-items-center pt-4'>
      <Button
        onClick={toggleDarkMode}
        variant={isDarkMode ? 'light' : 'dark'}
        className='mb-4'
      >
        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
      </Button>

      <h2 className='mb-4 text-center'> Google Translate Clone</h2>

      <Row className='w-100 justify-content-center gx-3'>
        {' '}
        <Col xs={12} md={5} className='mb-3 mb-md-0'>
          {' '}
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
        <Col
          xs={12}
          md={2}
          className='d-flex align-items-center justify-content-center mb-3 mb-md-0'
        >
          <Button
            disabled={fromLanguage === AUTO_LANGUAGE}
            onClick={interchangeLanguages}
            variant='link'
            aria-label='Interchange languages'
            className='p-0'
          >
            <ArrowsIcon />
          </Button>
        </Col>
        <Col xs={12} md={5}>
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
          </Stack>
        </Col>
      </Row>

      {error && (
        <div className='alert alert-danger mt-4 w-100' role='alert'>
          {' '}
          Error: {error}
        </div>
      )}
    </Container>
  )
}

export default App
