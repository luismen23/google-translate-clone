import { Form } from 'react-bootstrap'
import { SectionType } from '../types.d'
import React from 'react' // Import React to use CSSProperties

interface Props {
  type: SectionType
  loading?: boolean
  onChange: (value: string) => void
  value: string
}

const getPlaceholder = ({
  type,
  loading,
}: {
  type: SectionType
  loading?: boolean
}) => {
  if (type === SectionType.From) return 'Type to translate'
  if (loading) return 'Loading ...'
  return 'Traduction'
}

export const TextArea = ({ type, loading, onChange, value }: Props) => {
  const commonStyles: React.CSSProperties = { height: '150px', resize: 'none' }

  const styles: React.CSSProperties =
    type === SectionType.From
      ? commonStyles
      : {
          ...commonStyles,
          backgroundColor: 'var(--bs-secondary-bg)',
          border: 0,
        }

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value)
  }
  return (
    <Form.Control
      as='textarea'
      placeholder={getPlaceholder({ type, loading })}
      autoFocus={type === SectionType.From}
      disabled={type === SectionType.To}
      style={styles}
      value={value}
      onChange={handleChange}
    />
  )
}
