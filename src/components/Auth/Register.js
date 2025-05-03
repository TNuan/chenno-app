import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../services/api';
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Register = () => {
  const navigate = useNavigate();

  const [values, setValue] = useState({
    username: '',
    email: '',
    password: '',
    repeat_password: ''
  })

  const toastOptions = {
    position: 'bottom-right',
    autoClose: 5000,
    pauseOnHover: true,
    draggable: true,
    theme: 'dark'
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (handleValidation()) {
      register(values).then(data => {
        if (data.status === false) {
          toast.error(data.msg, toastOptions)
        }
        if (data.status === true) {
          alert('Đăng ký thành công, vui lòng kiểm tra email để xác thực tài khoản!')
          // Mở Gmail trong tab mới
          window.open('https://mail.google.com', '_blank')
          navigate('/login')
        }
      })
    }
  };

  const handleValidation = () => {
    const { username, email, password, repeat_password } = values
    if (email === '') {
      toast.error('email is requied', toastOptions)
      return false
    }

    if (password !== repeat_password) {
      toast.error(
        'password and confirm password should be same! ',
        toastOptions
      )
      return false
    }

    if (username.length < 3) {
      toast.error(
        'Username should be greater than 3 characters',
        toastOptions
      )
      return false
    }

    if (password.length < 8) {
      toast.error(
        'Password should be greater than 8 characters',
        toastOptions
      )
      return false
    }

    return true
  }

  const handleChange = (event) => {
    setValue({ ...values, [event.target.name]: event.target.value })
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-center mb-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-4 rounded-xl mr-3 group-hover:scale-105 transition-transform">
          <span className="text-2xl font-bold text-white">IT</span>
        </div>
        <span className="text-2xl font-bold text-gray-800 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
          Kv1
        </span>
      </div>

      {/* {error && <p className="text-red-500 mb-4">{error}</p>} */}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          {/* <label className="block text-gray-700">Tên người dùng</label> */}
          <input
            type="text"
            placeholder="Username"
            name="username" onChange={(event) => handleChange(event)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          {/* <label className="block text-gray-700">Email</label> */}
          <input
            type="email"
            placeholder="Email"
            name="email" onChange={(event) => handleChange(event)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          {/* <label className="block text-gray-700">Mật khẩu</label> */}
          <input
            type="password"
            placeholder="Password"
            name="password" onChange={(event) => handleChange(event)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          {/* <label className="block text-gray-700">Nhập lại mật khẩu</label> */}
          <input
            type="password"
            placeholder="Confirm Password"
            name="repeat_password" onChange={(event) => handleChange(event)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Đăng ký
        </button>
      </form>
      <p className="mt-4 text-center">
        Đã có tài khoản?{' '}
        <a href="/login" className="text-blue-500 hover:underline">
          Đăng nhập
        </a>
      </p>
      <ToastContainer />
    </div>
  );
};

export default Register;