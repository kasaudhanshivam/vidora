import { useState } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../contexts/authContext';
import { useNavigate, Router } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

export default function Authentication() {

    const navigate = useNavigate();
    const [name, setName] = useState();
    const [username, setUsername] = useState();
    const [password, setPassword] = useState();
    const [error, setError] = useState();
    const [message, setMessage] = useState();





    const [isLogin, setIsLogin] = useState(true); // true for login, false for signup

    const toggleAuth = () => {
        setIsLogin(!isLogin);
    };

    const { handleRegister, handleLogin } = useContext(AuthContext);

    let handleAuth = async (e) => {
        e.preventDefault();
        if (isLogin) {   //when user wants to login
            try {
                let message = await handleLogin(username, password);
                setMessage(message);
                toast.success(`${message}!`, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
                navigate('/home')

            } catch (error) {
                let mes = error.response.data.message;
                setError(mes);
                toast.error(`${mes}!`, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
            }
        } else {   //when user wants to register
            try {
                let message = await handleRegister(name, username, password);
                setMessage(message);
                toast.success(`${message}!`, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
                setError("");
                setIsLogin(true);
                setPassword("");
            } catch (error) {
                let mes = error.response.data.message;
                setError(mes);
                toast.error(`${mes}!`, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
            }
        }
    };

    return (
        <div className='authContainer'>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />
            <div className='sideTheme'>
                <div className="authRight">
                    <div className="auth-box">
                        <h2>{isLogin ? "Login" : "Sign Up"}</h2>
                        <form>
                            {!isLogin && (
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    className="auth-input"
                                    value={name}
                                    required
                                    onChange={(e) => setName(e.target.value)}
                                />
                            )}
                            <input
                                type="text"
                                placeholder="Username"
                                className="auth-input"
                                value={username}
                                required
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                className="auth-input"
                                value={password}
                                required
                                onChange={(e) => setPassword(e.target.value)}
                            />

                            <p>{error && <span className="error">{error}!</span>}</p>

                            <button type="submit" className="auth-btn" onClick={handleAuth} >
                                {isLogin ? "Login" : "Sign Up"}
                            </button>
                        </form>
                        <p className="auth-toggle">
                            {isLogin
                                ? "Don't have an account?"
                                : "Already have an account?"}{" "}
                            <span onClick={toggleAuth}>
                                {isLogin ? "Sign Up" : "Login"}
                            </span>
                        </p>
                    </div>
                </div>
            </div>

        </div>
    )
}