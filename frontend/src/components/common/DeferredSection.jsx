import { Suspense, useEffect, useRef, useState } from 'react'

// Mount expensive sections near the viewport, and keep them mounted after arrival.
export default function DeferredSection({ children }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (!('IntersectionObserver' in window)) { setVisible(true); return }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect() }
    }, { rootMargin: '500px' })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return <div ref={ref} className={visible ? undefined : 'deferred-section'}>
    {visible && <Suspense fallback={<div className="deferred-section" />}>
      {children}
    </Suspense>}
  </div>
}
