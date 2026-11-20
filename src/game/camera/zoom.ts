/** Очередь шагов масштаба: отрицательное значение отдаляет камеру. */
export const cameraZoom = { steps: 0 }

export function zoomOut(): void {
  cameraZoom.steps -= 1
}

export function zoomIn(): void {
  cameraZoom.steps += 1
}
