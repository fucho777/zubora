import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChefHat } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

interface ValidationErrors {
  email?: string;
  password?: string;
}

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const navigate = useNavigate();
  const { signIn } = useAuthStore();
  
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    if (!email.trim()) {
      errors.email = 'メールアドレスを入力してください。';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'メールアドレスの形式が正しくありません。';
    }
    
    if (!password) {
      errors.password = 'パスワードを入力してください。';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});
    
    if (!validateForm()) {
      return;
    }
    
    const { error: signInError } = await signIn(email, password);
    
    if (signInError) {
      console.error('Login error:', signInError);
      
      // より具体的なエラーメッセージの表示
      if (signInError.message?.includes('Invalid login credentials') || 
          signInError.message?.includes('invalid credentials') ||
          signInError.message?.includes('Invalid email or password')) {
        setError('メールアドレスまたはパスワードが正しくありません。入力内容を確認してください。');
      } else if (signInError.message?.includes('Email not confirmed')) {
        setError('メールアドレスの確認が完了していません。受信トレイをご確認ください。');
      } else if (signInError.message?.includes('not found') || signInError.message?.includes('user not found')) {
        setError('このメールアドレスに対応するアカウントが見つかりません。新規登録が必要です。');
      } else if (signInError.message?.includes('network')) {
        setError('ネットワーク接続に問題があります。インターネット接続を確認して、再度お試しください。');
      } else if (signInError.message?.includes('timeout')) {
        setError('サーバーとの通信がタイムアウトしました。しばらく時間をおいて再度お試しください。');
      } else if (signInError.message?.includes('rate limit')) {
        setError('ログイン試行回数が多すぎます。しばらく時間をおいて再度お試しください。');
      } else if (signInError.message?.includes('disabled') || signInError.message?.includes('blocked')) {
        setError('このアカウントは無効化されています。サポートにお問い合わせください。');
      } else {
        // エラーコードに基づいた詳細メッセージ
        const errorMessage = getDetailedErrorMessage(signInError.code, signInError.message);
        setError(errorMessage || 'ログインに失敗しました。メールアドレスとパスワードを確認してください。');
      }
      return;
    }
    
    navigate('/home');
  };
  
  // エラーコードに基づいた詳細なエラーメッセージを取得する関数
  const getDetailedErrorMessage = (errorCode: string | undefined, errorMessage: string | undefined): string | null => {
    if (!errorCode) return null;
    
    const errorMessages: Record<string, string> = {
      '400': '入力データが不正です。入力内容を確認してください。',
      '401': '認証に失敗しました。メールアドレスとパスワードを確認してください。',
      '403': 'このアカウントはアクセス権限がありません。',
      '404': 'アカウントが見つかりません。新規登録が必要かもしれません。',
      '409': '同時に複数のログイン処理が発生しました。再度お試しください。',
      '422': '入力データの検証に失敗しました。形式を確認してください。',
      '429': 'ログイン試行回数が多すぎます。しばらく時間をおいてから再度お試しください。',
      '500': 'サーバーエラーが発生しました。しばらく時間をおいてから再度お試しください。',
      'auth/user-not-found': 'このメールアドレスに対応するアカウントが見つかりません。',
      'auth/wrong-password': '入力したパスワードが正しくありません。',
      'auth/invalid-email': '有効なメールアドレスを入力してください。',
      'auth/user-disabled': 'このアカウントは無効化されています。サポートにお問い合わせください。',
      'auth/too-many-requests': 'ログイン試行回数が多すぎます。しばらく時間をおいて再度お試しください。',
      'auth/invalid-login-credentials': 'メールアドレスまたはパスワードが正しくありません。'
    };
    
    return errorMessages[errorCode] || null;
  };
  
  return (
    <div className="min-h-screen bg-orange-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center">
          <ChefHat className="h-12 w-12 text-orange-500" />
        </Link>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          ズボラシェフAIにログイン
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          アカウントをお持ちでない方は{' '}
          <Link to="/register" className="font-medium text-orange-500 hover:text-orange-400">
            新規登録
          </Link>
          {' '}または{' '}
          <Link to="/" className="font-medium text-orange-500 hover:text-orange-400">
            トップページに戻る
          </Link>
        </p>
      </div>
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="メールアドレス"
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="登録したメールアドレス"
              error={validationErrors.email}
            />
            
            <Input
              label="パスワード"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="パスワード"
              error={validationErrors.password}
            />
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full"
              size="lg"
            >
              ログイン
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;