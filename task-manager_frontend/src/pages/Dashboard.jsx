import { useState, useEffect, useMemo, useCallback } from 'react'
import API from '../api/axios'
import Calendar from '../components/Calendar'
import AnalyticsDashboard from '../components/AnalyticsDashboard'
import VoiceCreator from '../components/VoiceCreator'
import Timeline from '../components/Timeline'
import Collaboration from '../components/Collaboration'

function Dashboard({ setUsername }) {
    const [tasks, setTasks] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    
    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

    const [displayName, setDisplayName] = useState(localStorage.getItem('username') || '')
    const [activeTile, setActiveTile] = useState('all') // tracks which stat tile is active

    // Tabs Navigation
    const [activeTab, setActiveTab] = useState('tasks')

    // AI Task Generator State
    const [aiPrompt, setAiPrompt] = useState('')
    const [generatingAI, setGeneratingAI] = useState(false)
    const [aiResult, setAiResult] = useState('')

    const handleAIGenerate = async (e) => {
        e.preventDefault()
        if (!aiPrompt.trim()) return
        setGeneratingAI(true)
        setAiResult('')
        try {
            const res = await API.post('/ai-generate/', { prompt: aiPrompt })
            setAiResult(res.data.message || 'Tasks generated successfully!')
            setAiPrompt('')
            fetchData() // Refresh list
        } catch (err) {
            console.error(err)
            setAiResult('Failed to generate tasks.')
        } finally {
            setGeneratingAI(false)
        }
    }

    // Filters and Sorting
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [filterCategory, setFilterCategory] = useState('all')
    const [sortBy, setSortBy] = useState('created_desc')

    // Modal States
    const [showTaskModal, setShowTaskModal] = useState(false)
    const [showCategoryModal, setShowCategoryModal] = useState(false)
    
    // Task Form State
    const [editingTask, setEditingTask] = useState(null)
    const [taskForm, setTaskForm] = useState({
        title: '',
        description: '',
        priority: 'medium',
        due_date: '',
        category: '',
        completed: false
    })

    // Category Form State
    const [categoryName, setCategoryName] = useState('')


    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            const [tasksRes, categoriesRes, meRes] = await Promise.all([
                API.get('/tasks/'),
                API.get('/categories/'),
                API.get('/me/')
            ])
            setTasks(tasksRes.data)
            setCategories(categoriesRes.data)
            // Update username everywhere
            const uname = meRes.data.username
            setDisplayName(uname)
            localStorage.setItem('username', uname)
            if (setUsername) setUsername(uname)
        } catch (err) {
            console.error('Fetch error:', err)
            setError('Failed to load data. Please login again.')
        } finally {
            setLoading(false)
        }
    }, [setUsername])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchData()
    }, [fetchData])

    const toggleComplete = async (task) => {
        // Optimistically update UI immediately so button responds instantly
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t))
        try {
            await API.patch(`/tasks/${task.id}/`, { completed: !task.completed })
        } catch (err) {
            console.error('Could not update task', err)
            // Revert on failure
            setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: task.completed } : t))
        }
    }

    const deleteTask = async (id) => {
        try {
            await API.delete(`/tasks/${id}/`)
            fetchData()
        } catch (err) {
            console.error('Could not delete task', err)
        }
    }

    const deleteCategory = async (id) => {
        try {
            await API.delete(`/categories/${id}/`)
            fetchData()
        } catch (err) {
            console.error('Could not delete category', err)
            alert('Failed to delete category. It might be a global category that you cannot delete.')
        }
    }

    // Task Form Handlers
    const handleTaskSubmit = async (e) => {
        e.preventDefault()
        try {
            const payload = { ...taskForm }
            if (!payload.due_date) delete payload.due_date // Handle empty date
            if (!payload.category) delete payload.category
            
            if (editingTask) {
                await API.put(`/tasks/${editingTask.id}/`, payload)
            } else {
                await API.post('/tasks/', payload)
            }
            closeTaskModal()
            fetchData()
        } catch (err) {
            console.error('Failed to save task', err.response?.data)
            alert('Error saving task')
        }
    }

    const openTaskModal = (task = null) => {
        if (task) {
            setEditingTask(task)
            setTaskForm({
                title: task.title,
                description: task.description,
                priority: task.priority,
                due_date: task.due_date || '',
                category: task.category || '',
                completed: task.completed || false
            })
        } else {
            setEditingTask(null)
            setTaskForm({ title: '', description: '', priority: 'medium', due_date: '', category: '', completed: false })
        }
        setShowTaskModal(true)
    }

    const closeTaskModal = () => setShowTaskModal(false)

    // Category Form Handlers
    const handleCategorySubmit = async (e) => {
        e.preventDefault()
        try {
            await API.post('/categories/', { name: categoryName })
            setCategoryName('')
            setShowCategoryModal(false)
            fetchData()
        } catch (err) {
            console.error('Failed to create category', err)
            alert('Error creating category')
        }
    }

    // Derived Data
    const filteredAndSortedTasks = useMemo(() => {
        let result = tasks.filter(t => {
            const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  t.description.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesStatus = filterStatus === 'all' ? true :
                                  filterStatus === 'completed' ? t.completed : !t.completed
            const matchesCategory = filterCategory === 'all' ? true : t.category === parseInt(filterCategory)
            return matchesSearch && matchesStatus && matchesCategory
        })

        result.sort((a, b) => {
            if (sortBy === 'created_desc') {
                return new Date(b.created_at) - new Date(a.created_at)
            } else if (sortBy === 'due_date') {
                if (!a.due_date) return 1
                if (!b.due_date) return -1
                return new Date(a.due_date) - new Date(b.due_date)
            } else if (sortBy === 'priority') {
                const pMap = { high: 3, medium: 2, low: 1 }
                return pMap[b.priority] - pMap[a.priority]
            }
            return 0
        })

        return result
    }, [tasks, searchTerm, filterStatus, filterCategory, sortBy])

    const stats = {
        total: tasks.length,
        completed: tasks.filter(t => t.completed).length,
        pending: tasks.filter(t => !t.completed).length,
        inProgress: tasks.filter(t => !t.completed && t.status === 'in_progress').length,
        highPriority: tasks.filter(t => !t.completed && t.priority === 'high').length
    }

    if (loading && tasks.length === 0) return <div className="container mt-5"><div className="spinner-border text-primary"></div></div>

    return (
        <div className="container py-4">
            {error && <div className="alert alert-danger">{error}</div>}

            {/* Greeting */}
            <div className="mb-4">
                <h2 className="fw-bold mb-0" style={{ fontSize: '2rem', color: 'var(--text-color)' }}>
                    {greeting}, <span style={{ background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{displayName || 'there'}</span>! 👋
                </h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: 0, fontSize: '0.95rem' }}>Here's what's on your plate today.</p>
            </div>

            {/* Main Tabs Navigation */}
            <div className="mb-4">
                <ul className="nav nav-pills glass-card p-2 gap-2" style={{ border: '1px solid var(--card-border)' }}>
                    {[
                        { id: 'tasks',     label: '📋 Tasks' },
                        { id: 'calendar',  label: '📅 Calendar' },
                        { id: 'analytics', label: '📊 Analytics' },
                        { id: 'collab',    label: '👥 Teams' },
                        { id: 'timeline',  label: '⚡ Activity Log' }
                    ].map(tab => (
                        <li className="nav-item" key={tab.id}>
                            <button 
                                className={`nav-link px-4 py-2 border-0 rounded fw-semibold ${activeTab === tab.id ? 'active btn-primary' : 'bg-transparent text-secondary'}`}
                                onClick={() => {
                                    setActiveTab(tab.id)
                                    setError('')
                                    setSuccess && setSuccess('')
                                }}
                                style={{ transition: 'all 0.2s' }}>
                                {tab.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {activeTab === 'tasks' && (
                <>
                    {/* Voice Creator & AI Generator */}
                    <div className="row g-3 mb-4">
                        <div className="col-lg-6">
                            <VoiceCreator 
                                onTaskCreated={async (voiceDetails) => {
                                    try {
                                        await API.post('/tasks/', {
                                            title: voiceDetails.title,
                                            priority: voiceDetails.priority,
                                            due_date: voiceDetails.due_date,
                                            completed: false
                                        })
                                        fetchData()
                                    } catch (err) {
                                        console.error('Voice task creation failed:', err)
                                    }
                                }} 
                            />
                        </div>
                        <div className="col-lg-6">
                            <div className="glass-card p-4 h-100 d-flex flex-column justify-content-between">
                                <div>
                                    <h6 className="fw-bold mb-1 text-primary">🤖 AI Task Generator</h6>
                                    <p className="small text-muted mb-3">Enter a goal (e.g., "Prepare for Python Interview") and generate a checklist of subtasks instantly.</p>
                                    <form onSubmit={handleAIGenerate}>
                                        <div className="input-group">
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                placeholder="e.g. Learn Django Basics" 
                                                value={aiPrompt}
                                                onChange={e => setAiPrompt(e.target.value)}
                                                required
                                                disabled={generatingAI}
                                            />
                                            <button className="btn btn-primary" type="submit" disabled={generatingAI}>
                                                {generatingAI ? 'Generating...' : 'Generate'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                                {aiResult && (
                                    <div className="small text-success fw-medium mt-2">
                                        ✓ {aiResult}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Clickable Stat Tiles */}
                    <div className="row mb-4">
                        {[
                            { id: 'all',          label: 'Total Tasks',   value: stats.total,        color: 'var(--primary)' },
                            { id: 'completed',    label: 'Completed',     value: stats.completed,    color: '#10b981' },
                            { id: 'pending',      label: 'Pending',       value: stats.pending,      color: '#f59e0b' },
                            { id: 'in_progress',  label: 'In Progress',   value: stats.inProgress,   color: '#f59e0b' },
                            { id: 'high',         label: 'High Priority', value: stats.highPriority, color: '#ef4444' },
                        ].map(s => {
                            const isActive = activeTile === s.id
                            return (
                                <div className="col-md-3 col-sm-6 mb-3" key={s.label}>
                                    <div
                                        className="glass-card p-3 text-center"
                                        onClick={() => {
                                            setActiveTile(s.id)
                                            if (s.id === 'all')         { setFilterStatus('all');       setFilterCategory('all') }
                                            else if (s.id === 'completed')  setFilterStatus('completed')
                                            else if (s.id === 'pending')    setFilterStatus('pending')
                                            else if (s.id === 'in_progress')setFilterStatus('pending')
                                            else if (s.id === 'high')   { setFilterStatus('pending');   setFilterCategory('all') }
                                        }}
                                        style={{
                                            cursor: 'pointer',
                                            border: isActive ? `2px solid ${s.color}` : '1px solid var(--card-border)',
                                            boxShadow: isActive ? `0 0 18px ${s.color}55` : undefined,
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        <h3 className="fw-bold mb-1" style={{ color: s.color, fontSize: '2rem' }}>{s.value}</h3>
                                        <span style={{ color: 'var(--text-color)', opacity: 0.75, fontSize: '0.82rem', fontWeight: 500 }}>{s.label}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Toolbar */}
                    <div className="glass-card p-3 mb-4 d-flex flex-wrap gap-3 align-items-center justify-content-between">
                        <div className="d-flex flex-wrap gap-2 flex-grow-1">
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="Search tasks..." 
                                style={{maxWidth: '300px'}}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                            <select className="form-select" style={{maxWidth: '150px'}} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                            </select>
                            <select className="form-select" style={{maxWidth: '150px'}} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                                <option value="all">All Categories</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <select className="form-select" style={{maxWidth: '160px'}} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                                <option value="created_desc">Newest First</option>
                                <option value="due_date">Due Date</option>
                                <option value="priority">Priority</option>
                            </select>
                        </div>
                        <div className="d-flex gap-2">
                            <button className="btn btn-outline-primary" onClick={() => setShowCategoryModal(true)}>
                                + Category
                            </button>
                            <button className="btn btn-primary" onClick={() => openTaskModal()}>
                                + New Task
                            </button>
                        </div>
                    </div>

                    {/* Task Grid */}
                    {(() => {
                        const pending   = filteredAndSortedTasks.filter(t => !t.completed)
                        const completed = filteredAndSortedTasks.filter(t => t.completed)

                        const TaskCard = ({ task, isCompletedSection }) => {
                            const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.completed
                            return (
                                <div className="col-md-6 col-lg-4">
                                    <div
                                        className={`glass-card h-100 p-3 d-flex flex-column ${isOverdue ? 'border-danger' : ''}`}
                                        style={{ opacity: isCompletedSection ? 0.75 : 1, borderWidth: isOverdue ? 2 : 1 }}
                                    >
                                        {/* Title + Badge */}
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <h5 className="fw-bold mb-0" style={{
                                                color: isCompletedSection ? 'var(--text-muted)' : 'var(--text-color)',
                                                textDecoration: isCompletedSection ? 'line-through' : 'none',
                                                fontSize: '1rem'
                                            }}>
                                                {task.title}
                                            </h5>
                                            <span className={`badge rounded-pill badge-${task.priority} text-capitalize ms-2`} style={{ flexShrink: 0 }}>
                                                {task.priority}
                                            </span>
                                        </div>

                                        {/* Description */}
                                        <p className="small mb-3 flex-grow-1" style={{ color: 'var(--text-color)', opacity: 0.7, lineHeight: 1.5 }}>
                                            {task.description}
                                        </p>

                                        {/* Meta */}
                                        <div className="d-flex flex-wrap gap-2 mb-3">
                                            {task.category_name && (
                                                <span style={{ background: 'var(--primary-glow)', color: 'var(--primary)', border: '1px solid var(--primary)', borderRadius: '999px', padding: '2px 10px', fontSize: '0.75rem', fontWeight: 600 }}>
                                                    📁 {task.category_name}
                                                </span>
                                            )}
                                            {task.project_name && (
                                                <span style={{ background: 'rgba(147, 51, 234, 0.12)', color: '#9333ea', border: '1px solid #9333ea', borderRadius: '999px', padding: '2px 10px', fontSize: '0.75rem', fontWeight: 600 }}>
                                                    👥 {task.project_name}
                                                </span>
                                            )}
                                            {task.due_date && (
                                                <span style={{ background: isOverdue ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.12)', color: isOverdue ? '#ef4444' : 'var(--primary)', border: `1px solid ${isOverdue ? '#ef4444' : 'var(--primary)'}`, borderRadius: '999px', padding: '2px 10px', fontSize: '0.75rem', fontWeight: 600 }}>
                                                    📅 {task.due_date} {isOverdue ? '⚠ Overdue' : ''}
                                                </span>
                                            )}
                                        </div>

                                        {/* Buttons */}
                                        <div className="d-flex gap-2 mt-auto pt-3" style={{ borderTop: '1px solid var(--card-border)' }}>
                                            {isCompletedSection ? (
                                                /* Completed row: Undo + Edit + Delete */
                                                <>
                                                    <button
                                                        className="btn btn-sm fw-bold"
                                                        style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid #10b981', borderRadius: '8px', whiteSpace: 'nowrap' }}
                                                        onClick={() => toggleComplete(task)}
                                                    >
                                                        ↩ Undo
                                                    </button>
                                                    <button className="btn btn-sm fw-semibold flex-grow-1" style={{ background: 'var(--primary-glow)', color: 'var(--primary)', border: '1px solid var(--primary)', borderRadius: '8px' }} onClick={() => openTaskModal(task)}>Edit</button>
                                                    <button className="btn btn-sm fw-semibold" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '8px' }} onClick={() => deleteTask(task.id)}>Delete</button>
                                                </>
                                            ) : (
                                                /* Pending row: Complete + Edit + Delete */
                                                <>
                                                    <button
                                                        className="btn btn-sm fw-bold flex-grow-1"
                                                        style={{ background: 'var(--primary-gradient)', border: 'none', color: 'var(--primary-text)', borderRadius: '8px', boxShadow: '0 4px 12px var(--primary-glow)' }}
                                                        onClick={() => toggleComplete(task)}
                                                    >
                                                        ✓ Complete
                                                    </button>
                                                    <button className="btn btn-sm fw-semibold" style={{ background: 'var(--primary-glow)', color: 'var(--primary)', border: '1px solid var(--primary)', borderRadius: '8px' }} onClick={() => openTaskModal(task)}>Edit</button>
                                                    <button className="btn btn-sm fw-semibold" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '8px' }} onClick={() => deleteTask(task.id)}>Delete</button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        }

                        return (
                            <>
                                {pending.length === 0 && completed.length === 0 ? (
                                    <div className="glass-card p-5 text-center">
                                        <h5 style={{ color: 'var(--text-color)' }}>No tasks found</h5>
                                        <p style={{ color: 'var(--text-color)', opacity: 0.6 }}>Try adjusting your filters or create a new task.</p>
                                    </div>
                                ) : (
                                    <>
                                        {pending.length > 0 && (
                                            <div className="row g-4 mb-4">
                                                {pending.map(task => <TaskCard key={task.id} task={task} isCompletedSection={false} />)}
                                            </div>
                                        )}

                                        {completed.length > 0 && (
                                            <div className="mt-2">
                                                <div className="d-flex align-items-center gap-3 mb-3">
                                                    <div style={{ height: 1, flex: 1, background: 'var(--card-border)' }} />
                                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                                        ✅ COMPLETED ({completed.length})
                                                    </span>
                                                    <div style={{ height: 1, flex: 1, background: 'var(--card-border)' }} />
                                                </div>
                                                <div className="row g-4">
                                                    {completed.map(task => <TaskCard key={task.id} task={task} isCompletedSection={true} />)}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </>
                        )
                    })()}
                </>
            )}

            {activeTab === 'calendar' && (
                <Calendar 
                    tasks={tasks} 
                    onAddTask={(dueDate) => { 
                        setTaskForm({
                            title: '',
                            description: '',
                            priority: 'medium',
                            due_date: dueDate,
                            category: '',
                            completed: false
                        }); 
                        setShowTaskModal(true); 
                    }} 
                />
            )}

            {activeTab === 'analytics' && <AnalyticsDashboard />}

            {activeTab === 'collab' && <Collaboration onTaskCreated={fetchData} />}

            {activeTab === 'timeline' && <Timeline />}

            {/* Footer Signature */}
            <footer className="text-center mt-5 mb-4 text-muted small py-3 border-top border-secondary border-opacity-10">
                🚀 Designed & Developed by <strong className="text-primary">Sai Shiva Anantha</strong> | Anantha Task Manager
            </footer>

            {/* Task Modal Overlay */}
            {showTaskModal && (
                <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050}}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content glass-card">
                            <div className="modal-header border-bottom border-secondary border-opacity-25">
                                <h5 className="modal-title fw-bold">{editingTask ? 'Edit Task' : 'Create Task'}</h5>
                                <button type="button" className="btn-close" onClick={closeTaskModal}></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleTaskSubmit} id="taskForm">
                                    <div className="mb-3">
                                        <label className="form-label">Title</label>
                                        <input type="text" className="form-control" required 
                                            value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Description</label>
                                        <textarea className="form-control" rows="3"
                                            value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})}></textarea>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Status</label>
                                            <select className="form-select" value={taskForm.completed} onChange={e => setTaskForm({...taskForm, completed: e.target.value === 'true'})}>
                                                <option value="false">Pending</option>
                                                <option value="true">Completed</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Priority</label>
                                            <select className="form-select" value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})}>
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Due Date</label>
                                            <input type="date" className="form-control" 
                                                value={taskForm.due_date} onChange={e => setTaskForm({...taskForm, due_date: e.target.value})} />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Category</label>
                                            <select className="form-select" value={taskForm.category} onChange={e => setTaskForm({...taskForm, category: e.target.value})}>
                                                <option value="">None</option>
                                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer border-top border-secondary border-opacity-25">
                                <button type="button" className="btn btn-outline-secondary" onClick={closeTaskModal}>Cancel</button>
                                <button type="submit" form="taskForm" className="btn btn-primary">Save Task</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Category Modal Overlay */}
            {showCategoryModal && (
                <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050}}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content glass-card">
                            <div className="modal-header border-bottom border-secondary border-opacity-25">
                                <h5 className="modal-title fw-bold">Manage Categories</h5>
                                <button type="button" className="btn-close" onClick={() => setShowCategoryModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <ul className="list-group mb-4">
                                    {categories.length === 0 ? (
                                        <li className="list-group-item bg-transparent text-muted border-secondary border-opacity-25 text-center">No categories yet</li>
                                    ) : (
                                        categories.map(c => (
                                            <li key={c.id} className="list-group-item d-flex justify-content-between align-items-center bg-transparent border-secondary border-opacity-25" style={{color: 'var(--text-color)'}}>
                                                {c.name}
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => deleteCategory(c.id)}>
                                                    Delete
                                                </button>
                                            </li>
                                        ))
                                    )}
                                </ul>
                                <form onSubmit={handleCategorySubmit} id="categoryForm">
                                    <h6 className="fw-bold mb-3">Add New Category</h6>
                                    <div className="d-flex gap-2">
                                        <input type="text" className="form-control" required placeholder="Category name..."
                                            value={categoryName} onChange={e => setCategoryName(e.target.value)} />
                                        <button type="submit" className="btn btn-primary">Add</button>
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer border-top border-secondary border-opacity-25">
                                <button type="button" className="btn btn-outline-secondary w-100" onClick={() => setShowCategoryModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Dashboard