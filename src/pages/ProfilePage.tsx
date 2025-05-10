import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Search, LogOut, Check, Trash2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { formatDate, getRemainingSearches } from '../lib/utils';
import Button from '../components/ui/Button';
import Card, { CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import { Dialog, DialogHeader, DialogContent, DialogFooter } from '../components/ui/Dialog';
import { supabase } from '../lib/supabase';

const ProfilePage: React.FC = () => {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    // 新規登録成功時のメッセージ表示処理
    const state = location.state as { registrationSuccess?: boolean; email?: string } | undefined;
    if (state?.registrationSuccess) {
      setShowSuccessMessage(true);
      setRegisteredEmail(state.email || '');
      
      // 5秒後に成功メッセージを非表示にする
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [location]);
  
  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  
  const handleDeleteAccount = async () => {
    if (!user || !password) return;
    
    setIsDeleting(true);
    setDeleteError(null);
    
    try {
      const { data, error } = await supabase
        .rpc('delete_user_account', {
          p_user_id: user.id,
          p_password: password
        });
      
      if (error) throw error;
      
      if (!data.success) {
        setDeleteError(data.error || 'アカウントの削除に失敗しました。');
        return;
      }
      
      // Sign out and redirect to home
      await signOut();
      navigate('/', { 
        replace: true,
        state: { accountDeleted: true }
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      setDeleteError('アカウントの削除中にエラーが発生しました。');
    } finally {
      setIsDeleting(false);
    }
  };
  
  const remainingSearches = getRemainingSearches(user.dailySearchCount);
  const lastSearchDate = user.lastSearchDate ? formatDate(user.lastSearchDate) : '未検索';
  // 実際のユーザー作成日を取得してフォーマット
  const accountCreatedDate = user.createdAt ? formatDate(user.createdAt) : '不明';
  
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <User className="h-6 w-6 text-orange-500" />
        <h1 className="text-2xl font-bold text-gray-800">マイページ</h1>
      </div>
      
      {/* 新規登録成功メッセージ */}
      {showSuccessMessage && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-start">
          <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-green-800">アカウント登録が完了しました</h3>
            <div className="mt-1 text-sm text-green-700">
              <p>メールアドレス「{registeredEmail}」で登録が完了しました。ズボラシェフAIへようこそ！</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="outline">
          <CardContent>
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">アカウント情報</h2>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm text-gray-500">メールアドレス</label>
                    <p className="text-gray-800">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">アカウント作成日</label>
                    <p className="text-gray-800">{accountCreatedDate}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleSignOut}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <LogOut className="h-4 w-4" />
                    <span>ログアウト</span>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="w-full mt-4 text-red-600 hover:bg-red-50 hover:border-red-300"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Trash2 className="h-4 w-4" />
                    <span>アカウントを削除</span>
                  </div>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card variant="outline">
          <CardContent>
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">検索状況</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Search className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-600">残り検索回数</p>
                      <p className="text-2xl font-bold text-orange-500">{remainingSearches}回</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">1日の上限</p>
                    <p className="text-lg font-semibold text-gray-700">5回</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">最終検索日</label>
                  <p className="text-gray-800">{lastSearchDate}</p>
                </div>
                
                <div>
                  <label className="text-sm text-gray-500">本日の検索回数</label>
                  <p className="text-gray-800">{user.dailySearchCount}回</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Dialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setPassword('');
          setDeleteError(null);
        }}
      >
        <DialogHeader>
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-6 w-6" />
            <h3 className="text-lg font-semibold">アカウントの削除</h3>
          </div>
        </DialogHeader>
        
        <DialogContent>
          <p className="text-gray-600">
            アカウントを削除すると、保存したレシピなどのすべてのデータが完全に削除され、
            復元することはできません。本当に削除してもよろしいですか？
          </p>
          
          <div className="bg-orange-50 border border-orange-200 rounded p-3">
            <p className="text-sm text-orange-800">
              セキュリティのため、アカウントを削除するには現在のパスワードを入力してください。
            </p>
          </div>
          
          <Input
            type="password"
            placeholder="現在のパスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={deleteError}
          />
        </DialogContent>
        
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setIsDeleteDialogOpen(false);
              setPassword('');
              setDeleteError(null);
            }}
            disabled={isDeleting}
          >
            キャンセル
          </Button>
          <Button
            variant="secondary"
            onClick={handleDeleteAccount}
            disabled={!password || isDeleting}
            isLoading={isDeleting}
          >
            アカウントを削除
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default ProfilePage;