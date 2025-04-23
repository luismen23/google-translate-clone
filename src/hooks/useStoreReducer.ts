import { useReducer } from 'react'
import { Action, FromLanguage, Language, type State } from '../types.d'
import { AUTO_LANGUAGE } from '../constants'

const initialState: State = {
  fromLanguage: 'auto',
  toLanguage: 'en',
  fromText: '',
  result: '',
  loading: false,
  error: null,
}

function reducer(state: State, action: Action) {
  const { type } = action

  if (type === 'INTERCHANGE_LANGUAGES') {
    if (state.fromLanguage === AUTO_LANGUAGE) return state

    return {
      ...state,

      error: null,
      fromLanguage: state.toLanguage,
      toLanguage: state.fromLanguage,
      result: '',
    }
  }

  if (type === 'SET_FROM_LANGUAGE') {
    // Si el cambio de idioma debe disparar una nueva traducción (y hay texto)
    const shouldTranslateOnFromLangChange = state.fromText !== ''
    return {
      ...state,
      fromLanguage: action.payload,
      result: '',
      error: null,
      loading: shouldTranslateOnFromLangChange,
    }
  }

  if (type === 'SET_TO_LANGUAGE') {
    // Si el cambio de idioma debe disparar una nueva traducción (y hay texto)
    const shouldTranslateOnToLangChange = state.fromText !== ''
    return {
      ...state,
      toLanguage: action.payload,
      result: '',
      error: null,
      loading: shouldTranslateOnToLangChange,
    }
  }

  if (type === 'SET_FROM_TEXT') {
    // Si el texto está vacío, no cargues
    const loading = action.payload !== ''
    return {
      ...state,
      loading: loading,
      fromText: action.payload,
      result: '',
      error: null,
    }
  }

  if (type === 'SET_RESULT') {
    return {
      ...state,
      loading: false,
      result: action.payload,
      error: null,
    }
  }

  if (type === 'SET_ERROR') {
    return {
      ...state,
      loading: false,
      error: action.payload,
    }
  }

  return state
}

export function useStoreReducer() {
  const [
    { fromLanguage, fromText, toLanguage, result, loading, error },
    dispatch,
  ] = useReducer(reducer, initialState)

  const interchangeLanguages = () => dispatch({ type: 'INTERCHANGE_LANGUAGES' })

  const setFromLanguage = (payload: FromLanguage) =>
    dispatch({ type: 'SET_FROM_LANGUAGE', payload })

  const setToLanguage = (payload: Language) =>
    dispatch({ type: 'SET_TO_LANGUAGE', payload })

  const setFromText = (payload: string) =>
    dispatch({ type: 'SET_FROM_TEXT', payload })

  // Función para manejar errores
  const setError = (payload: string | null) =>
    dispatch({ type: 'SET_ERROR', payload })

  return {
    // State
    fromLanguage,
    fromText,
    toLanguage,
    result,
    loading,
    error,
    interchangeLanguages,
    setFromLanguage,
    setToLanguage,
    setFromText,
    setError,
    dispatch,
  }
}
