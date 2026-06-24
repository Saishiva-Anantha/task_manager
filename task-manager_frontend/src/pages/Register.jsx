import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API from '../api/axios'

function Register() {
    const [username, setUsername] = useState('')
    const [email,    setEmail]    = useState('')
    const [password, setPassword] = useState('')
    const [error,    setError]    = useState('')
    const [success,  setSuccess]  = useState('')
    const [loading,  setLoading]  = useState(false)
    const navigate = useNavigate()

    const handleRegister = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const response = await API.post('/register/', { username, email, password })
            setSuccess(response.data.message || 'Registration successful! Please check your email to verify your account.')
            setUsername('')
            setEmail('')
            setPassword('')
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed')
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
                                <h2 className="fw-bold text-primary mb-2">Create Account</h2>
                                <p className="text-muted">Join Anantha Task Manager to boost your productivity.</p>
                            </div>
                            
                            {error   && <div className="alert alert-danger py-2">{error}</div>}
                            {success && <div className="alert alert-success py-2">{success}</div>}
                            
                            <form onSubmit={handleRegister}>
                                <div className="mb-3">
                                    <label className="form-label fw-medium">Username</label>
                                    <input type="text" className="form-control"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)} 
                                        placeholder="Choose a username"
                                        required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-medium">Email Address</label>
                                    <input type="email" className="form-control"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)} 
                                        placeholder="Enter your email"
                                        required />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label fw-medium">Password</label>
                                    <input type="password" className="form-control"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)} 
                                        placeholder="Create a strong password"
                                        required />
                                </div>
                                <button type="submit" className="btn btn-primary btn-lg w-100 mb-3" disabled={loading}>
                                    {loading ? 'Creating...' : 'Register'}
                                </button>
                                <p className="text-center mb-0">
                                     Already have an account? <Link to="/login" className="text-primary text-decoration-none fw-medium">Login</Link>
                                 </p>
                            </form>
                            <hr className="my-4 border-secondary border-opacity-25" />
                            <div className="text-center text-muted small">
                                🛡️ Designed & Developed by <br />
                                <strong className="text-primary">Sai Shiva Anantha</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Register