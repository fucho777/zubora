import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { ChefHat, CheckCircle, XCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';

interface LocationState {
  verificationEmailSent?: boolean;
  email?: string;
}

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  
  const [verificationStatus, setVerificationStatus] = useState<'waiting' | 'verifying' | 'success' | 'error'>(
    state?.verificationEmailSent ? 'waiting' : 'verifying'
  );
  const [error, setError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const { signOut } = useAuthStore();

  // Log verification attempt details for debugging
  useEffect(() => {
    const token = searchParams.get('token');
    console.log('Verification attempt:', {
      hasToken: !!token,
      currentPath: location.pathname,
      fullUrl: window.location.href,
      emailSent: state?.verificationEmailSent,
      origin: window.location.origin,
      host: window.location.host,
      protocol: window.location.protocol,
      search: location.search,
      state: state
    });
  }, [searchParams, location, state]);

  // Log verification attempt details for debugging
  useEffect(() => {
    const token = searchParams.get('token');
    console.log('Verification attempt:', {
      hasToken: !!token,
      currentPath: location.pathname,
      fullUrl: window.location.href,
      emailSent: state?.verificationEmailSent,
    });
  }, [searchParams, location, state]);

  const handleResendEmail = async () => {
    if (!state?.email || isResending) return;
    
    await signOut(); // Sign out before resending to clear any stale session
    setIsResending(true);
    try {
      const { error: signUpError } = await useAuthStore.getState().signUp(
        state.email,
        '' // Empty password to trigger verification without account creation
      );
      
      if (signUpError) throw signUpError;
      
      setVerificationStatus('waiting');
      setError(null);
    } catch (err) {
      setError('確認メールの再送信に失敗しました。もう一度お試しください。');
    } finally {
      setIsResending(false);
    }
  };

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      // If no token but we just sent verification email, show waiting message
      if (!token && state?.verificationEmailSent) {
        return;
      }
      
      if (!token) {
        setVerificationStatus('error');
        setError('無効な確認リンクです。');
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/verify_email`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({ p_token: token }),
          }
        );

        if (!response.ok) {
          throw new Error('Verification request failed');
        }

        const result = await response.json();
        
        console.log('Verification response:', { 
          ok: response.ok,
          data: result,
          status: response.status,
          token: token?.substring(0, 8) + '...' // Log first 8 chars for debugging
        });
        
        if (!result.success) {
          setVerificationStatus('error');
          setError(result.message || 'メールアドレスの確認に失敗しました。');
          return;
        }

        setVerificationStatus('success');
        setError(null);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (err) {
        console.error('Verification error:', err);
        setVerificationStatus('error');
        setError('予期せぬエラーが発生しました。もう一度お試しください。');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <ChefHat className="h-12 w-12 text-orange-500" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          {state?.verificationEmailSent ? '確認メールを送信しました' : 'メールアドレスの確認'}
        </h2>

        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {verificationStatus === 'waiting' && (
            <div className="flex flex-col items-center">
              <div className="p-3 bg-orange-100 rounded-full">
                <ChefHat className="h-12 w-12 text-orange-500" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-800">確認メールを送信しました</h3>
              <p className="mt-2 text-center text-gray-600">
                {state?.email} 宛に確認メールを送信しました。<br />
                メール内のリンクをクリックして、登録を完了してください。
                <br />
                <span className="text-sm text-orange-600">
                  ※確認リンクの有効期限は24時間です
                </span>
              </p>
              <p className="mt-4 text-sm text-gray-500">
                ※メールが届かない場合は、迷惑メールフォルダもご確認ください。
              </p>
              <div className="mt-6 space-y-4">
                <Button
                  variant="outline"
                  onClick={handleResendEmail}
                  isLoading={isResending}
                  disabled={isResending}
                  className="w-full"
                >
                  確認メールを再送信
                </Button>
                <Link
                  to="/"
                  className="block text-center text-sm text-gray-600 hover:text-gray-900"
                >
                  ホームページに戻る
                </Link>
              </div>
            </div>
          )}
          
          {verificationStatus === 'verifying' && (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
              <p className="mt-4 text-gray-600">メールアドレスを確認中...</p>
            </div>
          )}

          {verificationStatus === 'success' && (
            <div className="flex flex-col items-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <h3 className="mt-4 text-xl font-semibold text-gray-800">確認完了！</h3>
              <p className="mt-2 text-gray-600">
                メールアドレスの確認が完了しました。
              </p>
              <div className="mt-6 space-y-4">
                <Button
                  onClick={() => navigate('/login')}
                  className="w-full"
                >
                  ログインページへ
                </Button>
                <Link
                  to="/"
                  className="block text-center text-sm text-gray-600 hover:text-gray-900"
                >
                  ホームページに戻る
                </Link>
              </div>
            </div>
          )}

          {verificationStatus === 'error' && (
            <div className="flex flex-col items-center">
              <XCircle className="h-12 w-12 text-red-500" />
              <h3 className="mt-4 text-xl font-semibold text-gray-800">エラー</h3>
              <p className="mt-2 text-center text-gray-600">{error}</p>
              <div className="mt-6 space-y-4">
                {state?.email && (
                  <Button
                    variant="outline"
                    onClick={handleResendEmail}
                    isLoading={isResending}
                    disabled={isResending}
                    className="w-full"
                  >
                    確認メールを再送信
                  </Button>
                )}
                <Link
                  to="/register"
                  className="block text-center text-sm text-gray-600 hover:text-gray-900"
                >
                  新規登録ページに戻る
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;