import { useState, useEffect } from 'react'
import API from '../api/axios'

function Timeline() {
    const [activities, setActivities] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchActivities = async () => {
        setLoading(true)
        try {
            const res = await API.get('/activities/')
            setActivities(res.data)
        } catch (err) {
            console.error('Failed to fetch activity logs:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchActivities()
    }, [])

    const getActionIcon = (action) => {
        switch (action) {
            case 'created':
                return { symbol: '➕', color: 'bg-primary' }
            case 'completed':
                return { symbol: '✓', color: 'bg-success' }
            case 'uncompleted':
                return { symbol: '⟳', color: 'bg-warning' }
            case 'updated':
                return { symbol: '✏️', color: 'bg-info' }
            case 'deleted':
                return { symbol: '🗑️', color: 'bg-danger' }
            case 'project_created':
                return { symbol: '📁', color: 'bg-purple' }
            case 'project_invite':
                return { symbol: '👥', color: 'bg-primary' }
            default:
                return { symbol: '🔔', color: 'bg-secondary' }
        }
    }

    const formatTimestamp = (isoString) => {
        const date = new Date(isoString)
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading Timeline...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="glass-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold text-primary mb-0">Activity Timeline</h4>
                <button className="btn btn-outline-primary btn-sm" onClick={fetchActivities}>Refresh</button>
            </div>

            {activities.length > 0 ? (
                <div className="timeline-container ps-4" style={{ borderLeft: '2px solid rgba(255, 255, 255, 0.1)', position: 'relative' }}>
                    {activities.map((activity, idx) => {
                        const iconData = getActionIcon(activity.action)
                        return (
                            <div key={activity.id || idx} className="timeline-item mb-4" style={{ position: 'relative' }}>
                                {/* Floating dot node */}
                                <div className={`rounded-circle d-flex align-items-center justify-content-center text-white ${iconData.color}`}
                                     style={{
                                         width: '32px',
                                         height: '32px',
                                         position: 'absolute',
                                         left: '-48px',
                                         top: '0',
                                         boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
                                         fontSize: '0.85rem'
                                     }}>
                                    {iconData.symbol}
                                </div>

                                <div className="timeline-content p-3 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                    <div className="d-flex justify-content-between align-items-center flex-wrap mb-1">
                                        <span className="fw-bold text-primary small">
                                            @{activity.username}
                                        </span>
                                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                                            {formatTimestamp(activity.timestamp)}
                                        </span>
                                    </div>
                                    <p className="mb-0 text-white-50 small lh-base">
                                        {activity.details}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="text-center py-4">
                    <p className="text-muted small mb-0">No activities logged yet. Start working on tasks to populate the timeline!</p>
                </div>
            )}
        </div>
    )
}

export default Timeline
