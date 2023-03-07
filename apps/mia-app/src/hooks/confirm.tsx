import { useMemoizedFn } from 'ahooks'
import { useRef, useState } from 'react'

/**
 * Hook to handle double confirm
 * @param opts
 * @returns
 */
export function useDoubleConfirm<Keys extends string | number>(opts: {
  onConfirm: (key: Keys) => void
  onConfirmCanceled: (key: Keys) => void
}) {
  const [confirming, setConfirming] = useState<boolean>(false)
  const confirmKeyRef = useRef<Keys | null>()

  const startConfirming = useMemoizedFn((key: Keys) => {
    setConfirming(true)
    confirmKeyRef.current = key
  })

  const confirm = useMemoizedFn(() => {
    const key = confirmKeyRef.current
    if (key == null) {
      return
    }
    setConfirming(false)
    opts.onConfirm(key)
  })

  const cancelConfirm = useMemoizedFn(() => {
    setConfirming(false)
    confirmKeyRef.current = null
  })

  return {
    confirming,
    startConfirming,
    confirm,
    cancelConfirm,
  }
}
