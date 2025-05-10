import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, AlertCircle, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .rpc('initiate_password_reset', {
          p_email: email
        });

      if (error) throw error;

      setSuccess(true);
    } catch (err) {
      console.error('Password reset error:', err);
      setError('パスワードリセットの処理中にエラーが発生しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center">
          <ChefHat className="h-12 w-12 text-orange-500" />
        </Link>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          パスワードをお忘れの方
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          登録したメールアドレスを入力してください。
          パスワードリセットの手順をメールでお送りします。
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {success ? (
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                メールを送信しました
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                {email} 宛にパスワードリセットの手順を送信しました。
                メールの内容に従ってパスワードを再設定してください。
              </p>
              <div className="mt-6">
                <Link
                  to="/login"
                  className="text-sm font-medium text-orange-500 hover:text-orange-400"
                >
                  ログインページに戻る
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <Input
                label="メールアドレス"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="登録したメールアドレス"
                error={error}
              />

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isSubmitting}
                disabled={isSubmitting || !email}
              >
                パスワードリセットを申請
              </Button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm font-medium text-orange-500 hover:text-orange-400"
                >
                  ログインページに戻る
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;