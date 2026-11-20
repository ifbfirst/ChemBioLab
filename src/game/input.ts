import { useEffect } from 'react'

/** Общее поле ввода: клавиатура, касания и мышь пишут сюда, а кадр игры только читает. */
export const input = {
  keys: {} as Record<string, boolean>,
  moveX: 0,
  moveY: 0,
  lookX: 0,
  lookY: 0,
  jumpPressed: false,
  interactPressed: false,
}

export const debugPose = { x: 0, y: 0, z: 0, cx: 0, cy: 0, cz: 0 }

export const debugTeleport: { current: { x: number; y: number; z: number } | null } = {
  current: null,
}

export function consumeLook(): { x: number; y: number } {
  const x = input.lookX
  const y = input.lookY
  input.lookX = 0
  input.lookY = 0
  return { x, y }
}

function clearHeldKeys(): void {
  for (const key of Object.keys(input.keys)) delete input.keys[key]
  input.moveX = 0
  input.moveY = 0
}

export function useInputListeners(): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target
      if (target instanceof HTMLElement && (target.tagName === 'BUTTON' || target.tagName === 'INPUT')) {
        return
      }
      if (event.code === 'Space' || event.code.startsWith('Arrow')) event.preventDefault()
      if (event.repeat) return
      input.keys[event.code] = true
      if (event.code === 'KeyE') input.interactPressed = true
      if (event.code === 'Space') input.jumpPressed = true
    }

    const onKeyUp = (event: KeyboardEvent) => {
      input.keys[event.code] = false
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', clearHeldKeys)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', clearHeldKeys)
    }
  }, [])
}
