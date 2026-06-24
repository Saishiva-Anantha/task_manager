import { useState, useEffect } from 'react'

function VoiceCreator({ onTaskCreated, categories, projects }) {
    const [isListening, setIsListening] = useState(false)
    const [transcription, setTranscription] = useState('')
    const [recognition, setRecognition] = useState(null)
    const [supported, setSupported] = useState(true)
    const [parsedDetails, setParsedDetails] = useState(null)

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!SpeechRecognition) {
            setSupported(false)
            return
        }

        const rec = new SpeechRecognition()
        rec.continuous = false
        rec.interimResults = false
        rec.lang = 'en-US'

        rec.onstart = () => {
            setIsListening(true)
            setTranscription('Listening...')
            setParsedDetails(null)
        }

        rec.onend = () => {
            setIsListening(false)
        }

        rec.onresult = (event) => {
            const text = event.results[0][0].transcript
            setTranscription(text)
            parseVoiceCommand(text)
        }

        rec.onerror = (event) => {
            console.error('Speech recognition error:', event.error)
            setTranscription(`Error: ${event.error}. Please check microphone permissions.`)
            setIsListening(false)
        }

        setRecognition(rec)
    }, [])

    const toggleListening = () => {
        if (!recognition) return
        if (isListening) {
            recognition.stop()
        } else {
            recognition.start()
        }
    }

    const parseVoiceCommand = (text) => {
        const textLower = text.toLowerCase()
        let title = text
        let dueDate = null
        let priority = 'medium'

        // Clean up activation phrases at the beginning
        const cleanPhrases = [
            'create task for', 'create task', 'add task for', 'add task', 
            'create a task for', 'create a task', 'new task for', 'new task'
        ]
        
        for (const phrase of cleanPhrases) {
            if (textLower.startsWith(phrase)) {
                title = text.slice(phrase.length).trim()
                break
            }
        }

        // Parse due dates (e.g. "tomorrow", "today", "on monday", "next week")
        const today = new Date()
        
        if (title.toLowerCase().includes('tomorrow')) {
            const tomorrow = new Date(today)
            tomorrow.setDate(today.getDate() + 1)
            dueDate = formatLocalDate(tomorrow)
            title = removeSubstringIgnoreCase(title, 'tomorrow')
        } else if (title.toLowerCase().includes('today')) {
            dueDate = formatLocalDate(today)
            title = removeSubstringIgnoreCase(title, 'today')
        } else if (title.toLowerCase().includes('next week')) {
            const nextWeek = new Date(today)
            nextWeek.setDate(today.getDate() + 7)
            dueDate = formatLocalDate(nextWeek)
            title = removeSubstringIgnoreCase(title, 'next week')
        }

        // Parse priorities (e.g. "high priority", "low priority")
        if (title.toLowerCase().includes('high priority')) {
            priority = 'high'
            title = removeSubstringIgnoreCase(title, 'high priority')
        } else if (title.toLowerCase().includes('low priority')) {
            priority = 'low'
            title = removeSubstringIgnoreCase(title, 'low priority')
        }

        // Clean up double spaces or trailing prepositions
        title = title.replace(/\s+/g, ' ').trim()
        // Remove trailing prepositions like 'for', 'by', 'on'
        title = title.replace(/\b(for|by|on|at|due)$/i, '').trim()

        if (title.length > 0) {
            setParsedDetails({
                title: title.charAt(0).toUpperCase() + title.slice(1),
                due_date: dueDate,
                priority: priority
            })
        }
    }

    const removeSubstringIgnoreCase = (str, sub) => {
        const regex = new RegExp(`\\b${sub}\\b`, 'gi')
        return str.replace(regex, '').trim()
    }

    const formatLocalDate = (date) => {
        const y = date.getFullYear()
        const m = String(date.getMonth() + 1).padStart(2, '0')
        const d = String(date.getDate()).padStart(2, '0')
        return `${y}-${m}-${d}`
    }

    const confirmCreateTask = () => {
        if (!parsedDetails || !onTaskCreated) return
        onTaskCreated(parsedDetails)
        setTranscription('')
        setParsedDetails(null)
    }

    if (!supported) {
        return (
            <div className="glass-card p-3 text-center mb-4">
                <small className="text-muted">🎤 Voice Task Creation is not supported in this browser. Please use Chrome, Edge, or Safari.</small>
            </div>
        )
    }

    return (
        <div className="glass-card p-4 mb-4">
            <div className="d-flex align-items-center gap-3">
                {/* Pulsing microphone button */}
                <button 
                    type="button"
                    onClick={toggleListening} 
                    className={`btn rounded-circle d-flex align-items-center justify-content-center ${isListening ? 'btn-danger animate-pulse' : 'btn-outline-primary'}`}
                    style={{ width: '56px', height: '56px', minWidth: '56px' }}>
                    <span style={{ fontSize: '1.5rem' }}>🎤</span>
                </button>

                <div className="flex-grow-1">
                    <h6 className="fw-bold mb-1 text-primary">Voice Command Input</h6>
                    <p className="small text-muted mb-0">
                        {isListening ? 'Listening... Speak now!' : 'Click the mic and say: "Create task for project review tomorrow"'}
                    </p>
                </div>
            </div>

            {/* Transcription display */}
            {transcription && (
                <div className="mt-3 p-3 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', border: '1px dashed rgba(255, 255, 255, 0.1)' }}>
                    <strong className="small text-secondary d-block mb-1">Transcribed Text:</strong>
                    <span className="text-white small italic">"{transcription}"</span>
                </div>
            )}

            {/* Parsed Output review */}
            {parsedDetails && (
                <div className="mt-3 p-3 border border-success border-opacity-25 rounded bg-success bg-opacity-5">
                    <h6 className="fw-bold text-success mb-2 small">Task Preview Details</h6>
                    <div className="row g-2 mb-3">
                        <div className="col-12">
                            <span className="small text-secondary">Title:</span> <span className="small text-white fw-semibold">{parsedDetails.title}</span>
                        </div>
                        {parsedDetails.due_date && (
                            <div className="col-md-6">
                                <span className="small text-secondary">Due Date:</span> <span className="small text-white fw-semibold">{parsedDetails.due_date}</span>
                            </div>
                        )}
                        <div className="col-md-6">
                            <span className="small text-secondary">Priority:</span> <span className={`small text-capitalize fw-semibold text-${parsedDetails.priority === 'high' ? 'danger' : parsedDetails.priority === 'medium' ? 'warning' : 'info'}`}>{parsedDetails.priority}</span>
                        </div>
                    </div>
                    <div className="d-flex gap-2">
                        <button className="btn btn-success btn-sm px-3" onClick={confirmCreateTask}>Create Task</button>
                        <button className="btn btn-outline-secondary btn-sm" onClick={() => setParsedDetails(null)}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default VoiceCreator
