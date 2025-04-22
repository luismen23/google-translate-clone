/* eslint-disable react/react-in-jsx-scope */
import Form from 'react-bootstrap/Form'
import { AUTO_LANGUAGE, SUPPORTED_LANGUAGES } from '../constants'
import { FC } from 'react'
import { FromLanguage, Language, SectionType } from '../types.d'

type Props =
  | {
      type: SectionType.From
      value: FromLanguage
      onChange: (language: FromLanguage) => void
    }
  | {
      type: SectionType.To
      value: Language
      onChange: (language: Language) => void
    }

export const LanguageSelect: FC<Props> = ({ onChange, type, value }) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value as Language)
  }
  return (
    <Form.Select
      aria-label='Select language'
      onChange={handleChange}
      style={{ width: '600px' }}
      value={value}
    >
      {type === SectionType.From && (
        <option value={AUTO_LANGUAGE}>Detect language</option>
      )}
      {Object.entries(SUPPORTED_LANGUAGES).map(([key, language]) => (
        <option key={key} value={key}>
          {language}
        </option>
      ))}
    </Form.Select>
  )
}
