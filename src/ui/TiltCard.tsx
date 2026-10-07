import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'
import type { PointerEvent, ReactNode } from 'react'

const SPRING = { stiffness: 260, damping: 22 }

// Cartão que inclina em 3D seguindo o mouse, com um reflexo de luz (como uma carta colecionável).
// `max` é a inclinação máxima em graus.
export function TiltCard({ children, max = 6, className = '' }: { children: ReactNode; max?: number; className?: string }) {
  const reduced = useReducedMotion() ?? false
  // Posição do ponteiro de 0 a 1 em cada eixo (0,5 = centro).
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const glare = useMotionValue(0)
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), SPRING)
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), SPRING)
  const glareOpacity = useSpring(glare, SPRING)
  const gx = useTransform(px, (v) => `${v * 100}%`)
  const gy = useTransform(py, (v) => `${v * 100}%`)
  const background = useMotionTemplate`radial-gradient(circle at ${gx} ${gy}, rgb(255 255 255 / 0.16), transparent 55%)`

  if (reduced) return <div className={className}>{children}</div>

  function move(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse') return
    const box = event.currentTarget.getBoundingClientRect()
    px.set((event.clientX - box.left) / box.width)
    py.set((event.clientY - box.top) / box.height)
    glare.set(1)
  }

  function leave() {
    px.set(0.5)
    py.set(0.5)
    glare.set(0)
  }

  return (
    <div className={className} style={{ perspective: 1000 }}>
      <motion.div
        onPointerMove={move}
        onPointerLeave={leave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative rounded-2xl"
      >
        {children}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{ background, opacity: glareOpacity }}
        />
      </motion.div>
    </div>
  )
}
