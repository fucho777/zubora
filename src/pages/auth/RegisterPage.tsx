import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChefHat } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuthStore();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください。');
      setIsSubmitting(false);
      return;
    }
    
    try {
      console.log('Starting signup process for email:', email);
      const { error: signUpError } = await signUp(email, password);
      
      // エラーがある場合の処理
      if (signUpError) {
        console.error('Signup error:', signUpError);
        console.error('Signup error:', signUpError);
        
        // より具体的なエラーメッセージの表示
        if (signUpError.message?.includes('already registered') || 
            signUpError.message?.includes('already exists') || 
            signUpError.message?.includes('unique constraint') ||
            signUpError.code === '23505') {
          setError('このメールアドレスは既に登録されています。ログインページからログインしてください。');
        } else if (signUpError.message?.includes('invalid email') || signUpError.message?.includes('not a valid email')) {
          setError('有効なメールアドレスを入力してください。正しい形式（例：name@example.com）で入力してください。');
        } else if (signUpError.message?.includes('weak password') || signUpError.message?.includes('password too short')) {
          setError('より強力なパスワードを設定してください。8文字以上で、数字、大文字、小文字、記号を組み合わせることをお勧めします。');
        } else if (signUpError.message?.includes('network')) {
          setError('ネットワーク接続に問題があります。インターネット接続を確認して、再度お試しください。');
        } else if (signUpError.message?.includes('timeout')) {
          setError('サーバーとの通信がタイムアウトしました。しばらく時間をおいて再度お試しください。');
        } else if (signUpError.message?.includes('rate limit')) {
          setError('アクセス制限に達しました。しばらく時間をおいて再度お試しください。');
        } else if (signUpError.message?.includes('invalid credentials')) {
          setError('入力情報が正しくありません。メールアドレスとパスワードを確認してください。');
        } else {
          // エラーコードに基づいた詳細メッセージ
          const errorMessage = getDetailedErrorMessage(signUpError.code, signUpError.message);
          setError(errorMessage || `アカウント登録に失敗しました: ${signUpError.message || '不明なエラー'}`);
        }
        setIsSubmitting(false);
        return;
      }
      
      console.log('Registration successful, navigating to profile page');
      // Ensure we're using the full origin for the verification page
      navigate('/verify-email', { 
        state: { 
          verificationEmailSent: true,
          email: email
        } 
      });
    } catch (err) {
      console.error('Uncaught error in registration process:', err);
      setError('予期しないエラーが発生しました。もう一度お試しください。');
      setIsSubmitting(false);
    }
  };
  
  // エラーコードに基づいた詳細なエラーメッセージを取得する関数
  const getDetailedErrorMessage = (errorCode: string | undefined, errorMessage: string | undefined): string | null => {
    if (!errorCode) return null;
    
    const errorMessages: Record<string, string> = {
      '400': '入力データが不正です。入力内容を確認してください。',
      '401': '認証に失敗しました。',
      '403': 'この操作を実行する権限がありません。',
      '404': 'リクエストされたリソースが見つかりません。',
      '409': 'このメールアドレスは既に使用されています。',
      '422': '入力データの検証に失敗しました。形式を確認してください。',
      '429': 'リクエストが多すぎます。しばらく時間をおいてから再度お試しください。',
      '500': 'サーバーエラーが発生しました。しばらく時間をおいてから再度お試しください。',
      'auth/email-already-in-use': 'このメールアドレスは既に使用されています。別のメールアドレスを使用するか、ログインしてください。',
      'auth/invalid-email': '有効なメールアドレスを入力してください。',
      'auth/weak-password': 'パスワードが弱すぎます。より強力なパスワードを設定してください。',
      'auth/user-disabled': 'このアカウントは無効化されています。サポートにお問い合わせください。',
      'auth/user-not-found': 'このメールアドレスに対応するアカウントが見つかりません。',
      'auth/wrong-password': '入力したパスワードが正しくありません。',
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
          新規アカウント登録
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          すでにアカウントをお持ちの方は{' '}
          <Link to="/login" className="font-medium text-orange-500 hover:text-orange-400">
            ログイン
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="example@email.com"
              disabled={isSubmitting}
            />
            
            <Input
              label="パスワード"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="6文字以上で入力してください"
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            >
              {isSubmitting ? '登録中...' : 'アカウント作成'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;