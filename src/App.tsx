/* eslint-disable react/react-in-jsx-scope */
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
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
    setFromLanguage,
    setToLanguage,
    toLanguage,
    interchangeLanguages,
    fromText,
    result,
    setFromText,
    setResult,
    loading,
  } = useStoreReducer()

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
              onChange={setResult}
              loading={loading}
            />
          </Stack>
        </Col>
      </Row>
    </Container>
  )
}

export default App
