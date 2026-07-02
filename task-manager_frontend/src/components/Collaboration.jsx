import { useState, useEffect } from 'react'
import API from '../api/axios'

function Collaboration({ onTaskCreated }) {
    const [projects, setProjects] = useState([])
    const [systemUsers, setSystemUsers] = useState([])
    const [selectedProject, setSelectedProject] = useState(null)
    const [newProjectName, setNewProjectName] = useState('')
    const [inviteUsername, setInviteUsername] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [projectTasks, setProjectTasks] = useState([])

    // Project task creation fields
    const [taskTitle, setTaskTitle] = useState('')
    const [taskPriority, setTaskPriority] = useState('medium')
    const [taskDueDate, setTaskDueDate] = useState('')
    const [taskAssignee, setTaskAssignee] = useState('')

    const fetchData = async () => {
        setLoading(true)
        try {
            const [projRes, usersRes] = await Promise.all([
                API.get('/projects/'),
                API.get('/users/')
            ])
            setProjects(projRes.data)
            setSystemUsers(usersRes.data)
        } catch (err) {
            console.error('Failed to load collaboration data:', err)
            setError('Failed to load project details.')
        } finally {
            setLoading(false)
        }
    }

    const fetchProjectTasks = async (projectId) => {
        try {
            const res = await API.get(`/tasks/?project_id=${projectId}`)
            setProjectTasks(res.data)
        } catch (err) {
            console.error('Failed to load project tasks:', err)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        if (selectedProject) {
            fetchProjectTasks(selectedProject.id)
        }
    }, [selectedProject])

    const handleCreateProject = async (e) => {
        e.preventDefault()
        if (!newProjectName.trim()) return
        setError('')
        setSuccess('')
        try {
            const res = await API.post('/projects/', { name: newProjectName, member_ids: [] })
            setProjects([res.data, ...projects])
            setNewProjectName('')
            setSuccess(`Project "${res.data.name}" created successfully!`)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create project.')
        }
    }

    const handleInviteMember = async (e) => {
        e.preventDefault()
        if (!inviteUsername || !selectedProject) return
        setError('')
        setSuccess('')
        try {
            const res = await API.post(`/projects/${selectedProject.id}/invite/`, { username: inviteUsername })
            setSuccess(res.data.message || 'User invited successfully.')
            setInviteUsername('')
            // Refresh projects to update members list
            const projRes = await API.get('/projects/')
            setProjects(projRes.data)
            const updatedProj = projRes.data.find(p => p.id === selectedProject.id)
            setSelectedProject(updatedProj)
        } catch (err) {
            setError(err.response?.data?.error || 'Invitation failed.')
        }
    }

    const handleCreateProjectTask = async (e) => {
        e.preventDefault()
        if (!taskTitle.trim() || !selectedProject) return
        setError('')
        try {
            const data = {
                title: taskTitle,
                priority: taskPriority,
                due_date: taskDueDate || null,
                project: selectedProject.id,
                assigned_to: taskAssignee || null
            }
            const res = await API.post('/tasks/', data)
            setProjectTasks([res.data, ...projectTasks])
            setTaskTitle('')
            setTaskDueDate('')
            setTaskAssignee('')
            setSuccess('Task created and assigned successfully!')
            
            // Notify parent dashboard if needed to refresh
            if (onTaskCreated) onTaskCreated(res.data)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create task.')
        }
    }

    const handleToggleTaskCompleted = async (task) => {
        try {
            const res = await API.patch(`/tasks/${task.id}/`, { completed: !task.completed })
            setProjectTasks(projectTasks.map(t => t.id === task.id ? res.data : t))
            if (onTaskCreated) onTaskCreated(res.data) // Refresh
        } catch (err) {
            console.error('Failed to toggle task:', err)
        }
    }

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading Teams...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="row g-4">
            {/* Left Sidebar: Projects List & Creation */}
            <div className="col-md-4">
                <div className="glass-card p-4 mb-4">
                    <h5 className="fw-bold text-primary mb-3">Project Teams</h5>
                    
                    <form onSubmit={handleCreateProject} className="mb-4">
                        <div className="input-group">
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="New project name" 
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                required 
                            />
                            <button className="btn btn-primary" type="submit">+</button>
                        </div>
                    </form>

                    {projects.length > 0 ? (
                        <div className="list-group gap-2">
                            {projects.map(project => (
                                <button 
                                    key={project.id}
                                    type="button"
                                    onClick={() => {
                                        setSelectedProject(project)
                                        setError('')
                                        setSuccess('')
                                    }}
                                    className={`list-group-item list-group-item-action border-0 rounded p-3 text-start ${selectedProject?.id === project.id ? 'bg-primary text-white' : 'glass-card-item text-secondary'}`}
                                    style={{
                                        transition: 'all 0.2s',
                                        backgroundColor: selectedProject?.id === project.id ? '' : 'rgba(255, 255, 255, 0.02)'
                                    }}>
                                    <div className="fw-bold">{project.name}</div>
                                    <div className="small opacity-75 mt-1">{project.members.length} members</div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted small text-center mb-0">No projects created yet.</p>
                    )}
                </div>
            </div>

            {/* Right: Selected Project Board */}
            <div className="col-md-8">
                {selectedProject ? (
                    <div>
                        {/* Messages alerts */}
                        {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}
                        {success && <div className="alert alert-success py-2 mb-3">{success}</div>}

                        {/* Project Header & Invites */}
                        <div className="glass-card p-4 mb-4">
                            <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
                                <div>
                                    <h3 className="fw-bold text-primary mb-1">{selectedProject.name}</h3>
                                    <span className="text-muted small">Created by @{selectedProject.created_by_username}</span>
                                </div>

                                {/* Invite member form */}
                                <form onSubmit={handleInviteMember} className="d-flex gap-2">
                                    <select 
                                        className="form-select form-select-sm"
                                        value={inviteUsername}
                                        onChange={(e) => setInviteUsername(e.target.value)}
                                        required>
                                        <option value="">Select user to invite</option>
                                        {systemUsers.map(user => (
                                            <option key={user.id} value={user.username}>
                                                {user.username} ({user.email})
                                            </option>
                                        ))}
                                    </select>
                                    <button className="btn btn-primary btn-sm px-3" type="submit">Invite</button>
                                </form>
                            </div>

                            {/* Project members list */}
                            <div>
                                <h6 className="fw-bold text-secondary mb-2 small">Project Members ({selectedProject.members.length})</h6>
                                <div className="d-flex flex-wrap gap-2">
                                    {selectedProject.members.map(member => (
                                        <span key={member.id} className="badge bg-secondary p-2 fw-normal" style={{ fontSize: '0.8rem' }}>
                                            👤 {member.username}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Task Creation inside Project */}
                        <div className="glass-card p-4 mb-4">
                            <h5 className="fw-bold text-primary mb-3">Add Team Task</h5>
                            <form onSubmit={handleCreateProjectTask} className="row g-3">
                                <div className="col-md-6">
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        placeholder="Task title" 
                                        value={taskTitle}
                                        onChange={(e) => setTaskTitle(e.target.value)}
                                        required 
                                    />
                                </div>
                                <div className="col-md-3">
                                    <select 
                                        className="form-select"
                                        value={taskPriority}
                                        onChange={(e) => setTaskPriority(e.target.value)}>
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                                <div className="col-md-3">
                                    <input 
                                        type="date" 
                                        className="form-control" 
                                        value={taskDueDate}
                                        onChange={(e) => setTaskDueDate(e.target.value)} 
                                    />
                                </div>
                                <div className="col-md-6">
                                    <select 
                                        className="form-select"
                                        value={taskAssignee}
                                        onChange={(e) => setTaskAssignee(e.target.value)}>
                                        <option value="">Assign to member</option>
                                        {selectedProject.members.map(m => (
                                            <option key={m.id} value={m.id}>@{m.username}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <button className="btn btn-primary w-100" type="submit">Create & Assign Task</button>
                                </div>
                            </form>
                        </div>

                        {/* Project Tasks List */}
                        <div className="glass-card p-4">
                            <h5 className="fw-bold text-primary mb-3">Project Board Tasks</h5>
                            {projectTasks.length > 0 ? (
                                <div className="d-flex flex-column gap-2">
                                    {projectTasks.map(task => (
                                        <div key={task.id} className="d-flex justify-content-between align-items-center p-3 rounded" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--card-border)' }}>
                                            <div className="d-flex align-items-center gap-3">
                                                <input 
                                                    type="checkbox" 
                                                    className="form-check-input"
                                                    checked={task.completed}
                                                    onChange={() => handleToggleTaskCompleted(task)} 
                                                />
                                                <div>
                                                    <span className={`fw-semibold small ${task.completed ? 'text-decoration-line-through opacity-50' : ''}`} style={{ color: 'var(--text-color)' }}>
                                                        {task.title}
                                                    </span>
                                                    <div className="d-flex align-items-center gap-2 mt-1">
                                                        <span className={`badge bg-opacity-10 text-capitalize px-2 py-1 priority-badge-${task.priority}`} style={{ fontSize: '0.65rem' }}>
                                                            {task.priority}
                                                        </span>
                                                        {task.due_date && (
                                                            <span className="text-muted small" style={{ fontSize: '0.7rem' }}>
                                                                📅 Due {task.due_date}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-end">
                                                <span className="badge bg-secondary small" style={{ fontSize: '0.75rem' }}>
                                                    👤 {task.assigned_to_username ? `Assigned to @${task.assigned_to_username}` : 'Unassigned'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted small text-center mb-0 py-3">No tasks in this project yet.</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="glass-card p-5 text-center d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '300px' }}>
                        <span style={{ fontSize: '3rem' }}>👥</span>
                        <h5 className="fw-bold text-primary mt-3">Select a Project</h5>
                        <p className="text-muted small">Choose a project from the left sidebar to view tasks, invite members, or assign duties.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Collaboration
