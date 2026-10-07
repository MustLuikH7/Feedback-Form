import { lazy, Suspense } from 'react'
import './App.css'
import Header from './components/header/Header'
import Form from './components/form/Form'

const TeacherPage = lazy(() => import('./components/teacher/TeacherPage'))

const isTeacherPage = window.location.pathname.replace(/\/+$/, '') === '/opetajale'

function App() {
  if (isTeacherPage) {
    return (
      <div className="page page--wide">
        <Header
          title="Õpetaja vaade"
          lead="Vaata, mida õpilased sinu tundide kohta arvavad."
        >
          <a className="header-link" href="/">← Tagasiside vorm</a>
        </Header>
        <main>
          <Suspense fallback={<p className="muted-note">Laadin…</p>}>
            <TeacherPage />
          </Suspense>
        </main>
      </div>
    )
  }

  return (
    <div className="page">
      <Header />
      <main>
        <Form />
        <p className="page-footnote">
          Oled õpetaja? <a href="/opetajale">Vaata tagasisidet</a>
        </p>
      </main>
    </div>
  )
}

export default App
