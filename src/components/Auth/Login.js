import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/api';
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Login = () => {
  const navigate = useNavigate();
  const [values, setValue] = useState({
    email: '',
    password: ''
  })

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (handleValidation()) {
      login(values).then(data => {
        if (data.status === false) {
          toast.error(data.msg, toastOptions)
        }
        if (data.status === true) {
          localStorage.setItem('user', JSON.stringify(data.user))
          localStorage.setItem('accessToken', data.accessToken)
          navigate('/')
        }
      })
    }
  }

  const toastOptions = {
    position: 'bottom-right',
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: 'dark'
  }

  const handleValidation = () => {
    const { email, password } = values
    console.log('values', values)
    if (email === '' || password === '') {
      toast.error('Email and Password is requied', toastOptions)
      return false
    }

    return true
  }

  const handleChange = (event) => {
    setValue({ ...values, [event.target.name]: event.target.value })
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      {/* <h2 className="text-2xl font-bold mb-6 text-center">Đăng nhập</h2> */}
      <div className="flex items-center justify-center mb-6 group cursor-pointer">
        <div className="bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-500 dark:to-blue-300 p-4 rounded-xl mr-3 group-hover:scale-105 transition-all duration-300">
          <span className="text-2xl font-bold text-white">IT</span>
        </div>
        <span className="text-2xl font-bold text-blue-600  group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-300">
          Kv1
        </span>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            onChange={(event) => handleChange(event)}
            name="email"
            className="w-full p-2 border rounded"
            min="3"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Mật khẩu</label>
          <input
            type="password"
            onChange={(event) => handleChange(event)}
            name="password"
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
      <ToastContainer />
    </div>
  );
};

export default Login;