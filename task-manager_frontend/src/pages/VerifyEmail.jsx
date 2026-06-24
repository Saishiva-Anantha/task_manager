import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import API from '../api/axios'

function VerifyEmail() {
    const [searchParams] = useSearchParams()
    const [status, setStatus] = useState('verifying')
    const [message, setMessage] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        const verify = async () => {
            const uid = searchParams.get('uid')
            const token = searchParams.get('token')

            if (!uid || !token) {
                setStatus('error')
                setMessage('Invalid or missing verification link.')
                return
            }

            try {
                const response = await API.post('/verify-email/', { uid, token })
                setStatus('success')
                setMessage(response.data.message || 'Email verified successfully! You can now log in.')
            } catch (error) {
                setStatus('error')
                setMessage(error.response?.data?.error || 'Verification failed. The link may be expired or invalid.')
            }
        }

        verify()
    }, [searchParams])

    return (
        <div className="auth-wrapper">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-5 col-lg-4">
                        <div className="glass-card p-5 text-center">
                            {status === 'verifying' && (
                                <>
                                    <div className="spinner-border text-primary mb-3" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <h4 className="fw-bold text-primary mb-2">Verifying Email...</h4>
                                    <p className="text-muted">Please wait while we confirm your email address.</p>
                                </>
                            )}

                            {status === 'success' && (
                                <>
                                    <div className="text-success mb-3" style={{ fontSize: '3rem' }}>✓</div>
                                    <h4 className="fw-bold text-success mb-2">Verified!</h4>
                                    <p className="text-muted mb-4">{message}</p>
                                    <Link to="/login" className="btn btn-primary w-100">Go to Login</Link>
                                </>
                            )}

                            {status === 'error' && (
                                <>
                                    <div className="text-danger mb-3" style={{ fontSize: '3rem' }}>✗</div>
                                    <h4 className="fw-bold text-danger mb-2">Verification Failed</h4>
                                    <p className="text-muted mb-4">{message}</p>
                                    <Link to="/register" className="btn btn-outline-primary w-100 mb-2">Back to Registration</Link>
                                    <Link to="/login" className="text-muted text-decoration-none small">Go to Login</Link>
                                </>
                            )}
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

export default VerifyEmail
