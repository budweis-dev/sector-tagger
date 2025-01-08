import * as React from 'react'
import { createRoot } from 'react-dom/client'
import ImageTagger from './ImageTagger'

function App() {
    return (
        <div>
            <ImageTagger />
        </div>
    )
}

const container = document.getElementById('root')
const root = createRoot(container!)
root.render(<App />)