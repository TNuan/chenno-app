import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import VerifyEmail from '../components/Auth/VerifyEmail';
import VerifyEmailFailed from '../components/Auth/VerifyEmailFailed';
import { verifyEmail } from '../services/api';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const token = searchParams.get('token');
  const verificationAttempted = useRef(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        navigate('/login');
        return;
      }

      if (verificationAttempted.current) {
        return;
      }

      try {
        verificationAttempted.current = true;
        const response = await verifyEmail(token);
        console.log('Verification response:', response);
        
        if (response.status === true) {
          setVerificationStatus('success');
        } else {
          setMessage(response.message);
          setVerificationStatus('failed');
        }
      } catch (error) {
        console.error('Error verifying email:', error);
        setMessage('Có lỗi xảy ra khi xác thực email. Vui lòng thử lại sau.');
        setVerificationStatus('failed');
      }
    };

    verifyToken();
  }, [token, navigate]);

  // Loading state
  if (verificationStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Return appropriate component based on verification status
  return verificationStatus === 'success' ? <VerifyEmail /> : <VerifyEmailFailed message={message} />;
};

export default VerifyEmailPage;