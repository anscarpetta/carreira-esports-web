import { Disclaimer } from './Disclaimer.tsx'
import { Intro } from './Intro.tsx'

export default function App() {
  return (
    <div className="flex min-h-svh flex-col justify-between">
      <main>
        <Intro />
      </main>
      <Disclaimer />
    </div>
  )
}
