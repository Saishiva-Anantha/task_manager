import { useState, useEffect } from 'react'
import API from '../api/axios'

function AnalyticsDashboard() {
    const [analytics, setAnalytics] = useState(null)
    const [aiSummary, setAiSummary] = useState('')
    const [loadingSummary, setLoadingSummary] = useState(false)
    const [loadingAnalytics, setLoadingAnalytics] = useState(true)

    const fetchAnalytics = async () => {
        setLoadingAnalytics(true)
        try {
            const res = await API.get('/analytics/')
            setAnalytics(res.data)
        } catch (err) {
            console.error('Failed to fetch analytics:', err)
        } finally {
            setLoadingAnalytics(false)
        }
    }

    const fetchAISummary = async () => {
        setLoadingSummary(true)
        try {
            const res = await API.get('/ai-summary/')
            setAiSummary(res.data.summary)
        } catch (err) {
            console.error('Failed to fetch AI summary:', err)
            setAiSummary('Failed to fetch AI summary. Make sure the backend server is running.')
        } finally {
            setLoadingSummary(false)
        }
    }

    useEffect(() => {
        fetchAnalytics()
    }, [])

    if (loadingAnalytics) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading Analytics...</span>
                </div>
            </div>
        )
    }

    if (!analytics) {
        return (
            <div className="glass-card p-4 text-center">
                <p className="text-muted">No analytics data available at the moment.</p>
            </div>
        )
    }

    // Days representation helper
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const weeklyCompletions = analytics.completed_this_week || {}
    const maxCompletions = Math.max(...Object.values(weeklyCompletions), 1)

    return (
        <div className="row g-4">
            {/* Left Column: Key Stats & Weekly Completion Charts */}
            <div className="col-lg-8">
                {/* Stats Summary cards */}
                <div className="row g-3 mb-4">
                    <div className="col-md-4">
                        <div className="glass-card p-3 text-center border-start border-success border-3">
                            <span className="text-muted small fw-medium">Completed Tasks</span>
                            <h2 className="fw-bold text-success mt-1 mb-0">{analytics.total_completed}</h2>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="glass-card p-3 text-center border-start border-warning border-3">
                            <span className="text-muted small fw-medium">Pending Tasks</span>
                            <h2 className="fw-bold text-warning mt-1 mb-0">{analytics.total_pending}</h2>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="glass-card p-3 text-center border-start border-primary border-3">
                            <span className="text-muted small fw-medium">Productivity Score</span>
                            <h2 className="fw-bold text-primary mt-1 mb-0">{analytics.productivity_score}%</h2>
                        </div>
                    </div>
                </div>

                {/* Weekly Completion Bar Chart */}
                <div className="glass-card p-4 mb-4">
                    <h5 className="fw-bold text-primary mb-4">Weekly Completions Activity</h5>
                    <div className="d-flex justify-content-around align-items-end" style={{ height: '200px' }}>
                        {days.map(day => {
                            const val = weeklyCompletions[day] || 0
                            const heightPercent = (val / maxCompletions) * 100
                            return (
                                <div key={day} className="d-flex flex-column align-items-center w-100">
                                    <span className="small text-muted mb-1" style={{ fontSize: '0.8rem' }}>{val}</span>
                                    <div className="bg-primary bg-gradient rounded-top" 
                                         style={{ 
                                             height: `${Math.max(heightPercent, 5)}%`, 
                                             width: '40px',
                                             opacity: val > 0 ? 0.9 : 0.2,
                                             transition: 'height 0.5s ease-out'
                                         }}>
                                    </div>
                                    <span className="small mt-2 fw-medium text-secondary">{day}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Right Column: AI Task Summary & Priorities & Categories */}
            <div className="col-lg-4">
                {/* AI Summary Card */}
                <div className="glass-card p-4 mb-4 border-start border-primary border-3" style={{ background: 'linear-gradient(135deg, rgba(13, 110, 253, 0.05) 0%, rgba(255, 255, 255, 0.03) 100%)' }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="fw-bold text-primary mb-0">
                            🤖 AI Productivity Coach
                        </h5>
                        <button className="btn btn-outline-primary btn-sm" onClick={fetchAISummary} disabled={loadingSummary}>
                            {loadingSummary ? 'Writing...' : aiSummary ? 'Regenerate' : 'Generate Summary'}
                        </button>
                    </div>

                    {aiSummary ? (
                        <p className="mb-0 text-muted lh-base italic" style={{ fontSize: '0.95rem' }}>
                            "{aiSummary}"
                        </p>
                    ) : (
                        <p className="mb-0 text-muted small">
                            Click 'Generate Summary' to get a customized, AI-driven critique of your task completions and productivity behavior!
                        </p>
                    )}
                </div>

                {/* Priorities Distribution */}
                <div className="glass-card p-4 mb-4">
                    <h5 className="fw-bold text-primary mb-3">Tasks by Priority</h5>
                    <div className="d-flex flex-column gap-3">
                        {['high', 'medium', 'low'].map(p => {
                            const count = analytics.by_priority[p] || 0
                            const total = analytics.total_completed + analytics.total_pending
                            const percentage = total > 0 ? (count / total) * 100 : 0
                            const colorClass = p === 'high' ? 'danger' : p === 'medium' ? 'warning' : 'info'
                            return (
                                <div key={p}>
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <span className="text-capitalize small fw-medium text-secondary">{p} Priority</span>
                                        <span className="badge bg-secondary">{count}</span>
                                    </div>
                                    <div className="progress" style={{ height: '6px' }}>
                                        <div className={`progress-bar bg-${colorClass}`} 
                                             role="progressbar" 
                                             style={{ width: `${percentage}%` }} 
                                             aria-valuenow={percentage} 
                                             aria-valuemin="0" 
                                             aria-valuemax="100">
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Categories Count */}
                <div className="glass-card p-4">
                    <h5 className="fw-bold text-primary mb-3">Tasks by Category</h5>
                    {Object.keys(analytics.by_category).length > 0 ? (
                        <div className="d-flex flex-column gap-2">
                            {Object.entries(analytics.by_category).map(([catName, count]) => (
                                <div key={catName} className="d-flex justify-content-between align-items-center p-2 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)' }}>
                                    <span className="small text-secondary fw-medium">{catName}</span>
                                    <span className="badge rounded bg-primary text-white" style={{ fontSize: '0.8rem' }}>{count} tasks</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted small mb-0 text-center">No categories with tasks yet.</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AnalyticsDashboard
