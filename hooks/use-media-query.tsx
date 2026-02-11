import React, { useEffect, useState } from 'react'

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query)
    const listener = (event: MediaQueryListEvent) => setMatches(event.matches)

    setMatches(mediaQueryList.matches)

    return () => mediaQueryList.removeEventListener("change", listener)
  }, [query])

  return matches
}

export default useMediaQuery
