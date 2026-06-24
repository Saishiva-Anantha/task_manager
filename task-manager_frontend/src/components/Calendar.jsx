import { useState } from 'react'

function Calendar({ tasks, onAddTask }) {
    const [currentDate, setCurrentDate] = useState(new Date())

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]

    // Get first day of the month (0 = Sunday, 6 = Saturday)
    const firstDayIndex = new Date(year, month, 1).getDay()

    // Get total number of days in the month
    const totalDays = new Date(year, month + 1, 0).getDate()

    // Get total number of days in the previous month
    const prevTotalDays = new Date(year, month, 0).getDate()

    // Generate days grid
    const daysGrid = []

    // Padding from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
        daysGrid.push({
            day: prevTotalDays - i,
            isCurrentMonth: false,
            date: new Date(year, month - 1, prevTotalDays - i)
        })
    }

    // Days in current month
    for (let i = 1; i <= totalDays; i++) {
        daysGrid.push({
            day: i,
            isCurrentMonth: true,
            date: new Date(year, month, i)
        })
    }

    // Padding for next month to complete 6 weeks (42 cells)
    const remainingCells = 42 - daysGrid.length
    for (let i = 1; i <= remainingCells; i++) {
        daysGrid.push({
            day: i,
            isCurrentMonth: false,
            date: new Date(year, month + 1, i)
        })
    }

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1))
    }

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1))
    }

    // Helper to format Date as YYYY-MM-DD in local time
    const formatLocalDate = (date) => {
        const y = date.getFullYear()
        const m = String(date.getMonth() + 1).padStart(2, '0')
        const d = String(date.getDate()).padStart(2, '0')
        return `${y}-${m}-${d}`
    }

    // Filter tasks for a specific date
    const getTasksForDate = (date) => {
        const formatted = formatLocalDate(date)
        return tasks.filter(t => t.due_date === formatted)
    }

    const isToday = (date) => {
        const today = new Date()
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
    }

    return (
        <div className="glass-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold text-primary mb-0">
                    {monthNames[month]} {year}
                </h4>
                <div className="btn-group">
                    <button className="btn btn-outline-primary btn-sm" onClick={prevMonth}>&lt;</button>
                    <button className="btn btn-outline-primary btn-sm" onClick={() => setCurrentDate(new Date())}>Today</button>
                    <button className="btn btn-outline-primary btn-sm" onClick={nextMonth}>&gt;</button>
                </div>
            </div>

            <div className="calendar-grid">
                {/* Headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center fw-semibold text-muted py-2 border-bottom border-secondary border-opacity-10">
                        {day}
                    </div>
                ))}

                {/* Days cells */}
                {daysGrid.map((cell, index) => {
                    const dayTasks = getTasksForDate(cell.date)
                    const cellFormattedDate = formatLocalDate(cell.date)
                    return (
                        <div key={index} 
                             onClick={() => onAddTask && onAddTask(cellFormattedDate)}
                             className={`calendar-cell p-2 ${!cell.isCurrentMonth ? 'text-secondary opacity-50' : 'text-body'} ${isToday(cell.date) ? 'today-highlight' : ''}`}
                             style={{
                                 minHeight: '110px',
                                 border: '1px solid rgba(255, 255, 255, 0.05)',
                                 cursor: 'pointer',
                                 transition: 'background-color 0.2s',
                             }}>
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className={`fw-bold small px-1 rounded ${isToday(cell.date) ? 'bg-primary text-white' : ''}`}>
                                    {cell.day}
                                </span>
                                {dayTasks.length > 0 && (
                                    <span className="badge rounded-pill bg-secondary text-white font-monospace" style={{ fontSize: '0.7rem' }}>
                                        {dayTasks.length}
                                    </span>
                                )}
                            </div>
                            <div className="tasks-container overflow-hidden" style={{ maxHeight: '70px' }}>
                                {dayTasks.slice(0, 3).map(task => (
                                    <div key={task.id} 
                                         className={`text-truncate px-1 mb-1 rounded small text-white border-start border-3 priority-border-${task.priority}`}
                                         style={{ 
                                             fontSize: '0.75rem',
                                             backgroundColor: 'rgba(255, 255, 255, 0.07)',
                                             lineHeight: '1.4'
                                         }}
                                         title={task.title}>
                                        {task.title}
                                    </div>
                                ))}
                                {dayTasks.length > 3 && (
                                    <div className="text-muted small text-center" style={{ fontSize: '0.7rem' }}>
                                        + {dayTasks.length - 3} more
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default Calendar
