import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API from '../api/axios'

function Login() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError]       = useState('')
    const [loading, setLoading]   = useState(false)
    const navigate                = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await API.post('/token/', { username, password })
            localStorage.setItem('access_token', res.data.access)
            localStorage.setItem('refresh_token', res.data.refresh)
            navigate('/dashboard')
        } catch (err) {
            console.error('Login error:', err)
            setError('Invalid username or password')
        } finally {
            setLoading(false)
        }
    }
    
    return (
        <div className="auth-wrapper">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-5 col-lg-4">
                        <div className="glass-card p-5">
                            <div className="text-center mb-4">
                                <h2 className="fw-bold text-primary mb-2">ZenTask</h2>
                                <p className="text-muted">Welcome back! Please login to your account.</p>
                            </div>
                            
                            {error && <div className="alert alert-danger py-2">{error}</div>}
                            
                            <form onSubmit={handleLogin}>
                                <div className="mb-4">
                                    <label className="form-label fw-medium">Username</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-lg"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Enter your username"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label fw-medium">Password</label>
                                    <input
                                        type="password"
                                        className="form-control form-control-lg"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary btn-lg w-100 mb-3" disabled={loading}>
                                    {loading ? 'Logging in...' : 'Login'}
                                </button>
                                <p className="text-center mb-0">
                                    Don't have an account? <Link to="/register" className="text-primary text-decoration-none fw-medium">Register here</Link>
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login