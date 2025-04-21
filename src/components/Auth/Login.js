import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  // const { isAuthenticated, isLoading } = useAuth();

  // useEffect(() => {
  //   if (isAuthenticated) {
  //     navigate('/dashboard');
  //   }
  // }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(email, password);
      // Lưu token và thời gian hết hạn
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
    }
  };

  // if (isLoading) {
  //   return (
  //     <div className="flex justify-center items-center min-h-screen">
  //       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  //     </div>
  //   );
  // }

  // if (isAuthenticated) {
  //   return null;
  // }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Đăng nhập</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Mật khẩu</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Đăng nhập
        </button>
      </form>
      <p className="mt-4 text-center">
        Chưa có tài khoản?{' '}
        <a href="/register" className="text-blue-500 hover:underline">
          Đăng ký
        </a>
      </p>
    </div>
  );
};

export default Login;