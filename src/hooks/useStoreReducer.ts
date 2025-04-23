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

    // limpiar texto y resultado al intercambiar
    // const loading = state.fromText !== '' // Si hay texto, inicia carga para nueva traducción

    return {
      ...state,
      // loading, // Opcional
      error: null, // Limpia error
      fromLanguage: state.toLanguage,
      toLanguage: state.fromLanguage,
      result: '', // Opcional: limpiar resultado anterior
      // fromText: state.result // Opcional: si quieres usar el resultado como nuevo input
    }
  }

  if (type === 'SET_FROM_LANGUAGE') {
    // Si el cambio de idioma debe disparar una nueva traducción (y hay texto)
    const shouldTranslateOnFromLangChange = state.fromText !== ''
    return {
      ...state,
      fromLanguage: action.payload,
      result: '', // Limpia resultado anterior
      error: null,
      loading: shouldTranslateOnFromLangChange, // Inicia carga si aplica
    }
  }

  if (type === 'SET_TO_LANGUAGE') {
    // Si el cambio de idioma debe disparar una nueva traducción (y hay texto)
    const shouldTranslateOnToLangChange = state.fromText !== ''
    return {
      ...state,
      toLanguage: action.payload,
      result: '', // Limpia resultado anterior
      error: null,
      loading: shouldTranslateOnToLangChange, // Inicia carga si aplica
    }
  }

  if (type === 'SET_FROM_TEXT') {
    // Si el texto está vacío, no cargues
    const loading = action.payload !== ''
    return {
      ...state,
      loading: loading,
      fromText: action.payload,
      result: '', // Limpia resultado anterior
      error: null, // Limpia error al empezar a escribir
    }
  }

  if (type === 'SET_RESULT') {
    return {
      ...state,
      loading: false,
      result: action.payload,
      error: null, // Limpia error si la traducción fue exitosa
    }
  }

  if (type === 'SET_ERROR') {
    return {
      ...state,
      loading: false, // Detiene la carga en caso de error
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

  // Ya no necesitas setResult directamente desde fuera, el fetch lo hará
  // const setResult = (payload: string) =>
  //   dispatch({ type: 'SET_RESULT', payload });

  // Función para manejar errores
  const setError = (
    payload: string | null // Añadido
  ) => dispatch({ type: 'SET_ERROR', payload })

  return {
    // State
    fromLanguage,
    fromText,
    toLanguage,
    result,
    loading,
    error, // Añadido
    // Dispatchers
    interchangeLanguages,
    setFromLanguage,
    setToLanguage,
    setFromText,
    // Ya no exportamos setResult, exportamos setError
    setError, // Añadido
    // Hacemos dispatch disponible si se necesita para acciones más complejas fuera del hook
    // aunque es mejor encapsularlas si es posible
    dispatch,
  }
}
