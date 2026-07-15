import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

export function PageTransition() {
  const location = useLocation()
  const isFirst = useRef(true)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  useEffect(() => {
    isFirst.current = false
  }, [])

  return (
    <div
      key={location.key}
      className={`flex w-full flex-1 flex-col${isFirst.current ? '' : ' page-enter'}`}
    >
      <Outlet />
    </div>
  )
}
