import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ChefHat, Clock, Sparkles, Save, Search, PlayCircle, ArrowRight, Check, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const scrollToHowItWorks = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById('how-it-works');
    element?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="bg-white">
      {/* Account deletion success message */}
      {location.state?.accountDeleted && (
        <div className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-md">
          <div className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-green-800">
                アカウントが削除されました
              </h3>
              <p className="mt-1 text-sm text-green-700">
                アカウントとすべての関連データが正常に削除されました。
                ご利用ありがとうございました。
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Hero Section */}
      <header className="relative bg-gradient-to-b from-orange-50 to-white">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=1600')] bg-cover bg-center opacity-10"></div>
        <div className="container mx-auto px-4 pt-6 relative z-10">
          <nav className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <ChefHat className="h-8 w-8 text-orange-500" />
              <span className="text-xl font-bold text-gray-800">ズボラシェフAI</span>
            </div>
            <div className="space-x-4 relative z-20">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation('/login')}
              >
                ログイン
              </Button>
              <Button
                size="sm"
                onClick={() => handleNavigation('/register')}
              >
                無料登録
              </Button>
            </div>
          </nav>
          
          <div className="flex flex-col md:flex-row items-center py-16 md:py-24">
            <div className="md:w-1/2 md:pr-8">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
                簡単レシピを<span className="text-orange-500">AI</span>が見つけて<br />
                <span className="text-orange-500">時短</span>で作れる！
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                ズボラシェフAIは忙しいあなたの強い味方。キーワードを入力するだけで、
                簡単に作れる料理動画を見つけ、材料と手順を自動抽出します。
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={() => handleNavigation('/register')}
                >
                  <div className="flex items-center space-x-2">
                    <span>今すぐ始める</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={scrollToHowItWorks}
                >
                  <div className="flex items-center space-x-2">
                    <PlayCircle className="h-4 w-4" />
                    <span>使い方を見る</span>
                  </div>
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 mt-12 md:mt-0">
              <div className="relative">
                <div className="absolute -left-4 -top-4 w-24 h-24 bg-orange-200 rounded-full opacity-50 animate-pulse"></div>
                <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-red-200 rounded-full opacity-50 animate-pulse"></div>
                <img 
                  src="https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                  alt="簡単料理イメージ" 
                  className="relative z-10 rounded-xl shadow-xl transform transition-transform duration-500 hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="wave-divider h-16 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSI3MHB4IiB2aWV3Qm94PSIwIDAgMTI4MCAxNDAiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0iI2ZmZmZmZiI+PHBhdGggZD0iTTEyODAgMEw2NDAgNzAgMCAwdjE0MGgxMjgweiIvPjwvZz48L3N2Zz4=')] bg-center bg-no-repeat"></div>
      </header>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">ズボラでも<span className="text-orange-500">美味しく</span>作れる</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              面倒な献立決めや長いレシピ読みはもう終わり。
              AIが最適な料理動画を見つけ、必要な情報だけをまとめます。
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Search className="h-10 w-10 text-orange-500" />}
              title="簡単キーワード検索"
              description="「10分パスタ」「ズボラ飯」など、シンプルなキーワードで理想の料理動画を検索できます。"
            />
            <FeatureCard 
              icon={<Sparkles className="h-10 w-10 text-orange-500" />}
              title="AIがレシピを抽出"
              description="AIが動画を分析して材料と手順だけをテキストとして抽出。長い動画を見る必要はありません。"
            />
            <FeatureCard 
              icon={<Save className="h-10 w-10 text-orange-500" />}
              title="お気に入りレシピを保存"
              description="気に入ったレシピは保存して、いつでも簡単にアクセス。最大5つのお気に入りレシピを管理できます。"
            />
            <FeatureCard 
              icon={<Clock className="h-10 w-10 text-orange-500" />}
              title="時短で料理完成"
              description="動画の要点だけがわかるので、調理時間を大幅に短縮。忙しい日々の強い味方です。"
            />
            <FeatureCard 
              icon={<ChefHat className="h-10 w-10 text-orange-500" />}
              title="人気レシピをチェック"
              description="他のユーザーに人気のレシピランキングを確認できるので、いつも新しい料理との出会いがあります。"
            />
            <FeatureCard 
              icon={<ArrowRight className="h-10 w-10 text-orange-500" />}
              title="完全無料で利用可能"
              description="基本機能はすべて無料。1日5回まで検索可能で、登録だけで今すぐ使えます。"
            />
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">使い方はカンタン<span className="text-orange-500">3ステップ</span></h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              わずか数クリックで、理想のレシピが見つかります。
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard 
              number="1"
              title="キーワードを入力"
              description="作りたい料理や条件（時短、簡単など）のキーワードを入力するか、提案キーワードから選びます。"
              image="https://images.pexels.com/photos/4350099/pexels-photo-4350099.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
            />
            <StepCard 
              number="2"
              title="動画を選択"
              description="検索結果から気になる動画を選びます。AIが自動的に材料と手順を抽出します。"
              image="https://images.pexels.com/photos/5077064/pexels-photo-5077064.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            />
            <StepCard 
              number="3"
              title="レシピを確認＆保存"
              description="抽出されたレシピを確認し、気に入ったらマイページに保存。いつでも簡単にアクセスできます。"
              image="https://images.pexels.com/photos/833109/pexels-photo-833109.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            />
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-16 bg-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">よくある<span className="text-orange-500">質問</span></h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              ズボラシェフAIについてよくある質問にお答えします。
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <FaqItem 
              question="1日に何回まで検索できますか？"
              answer="無料プランでは1日5回まで検索できます。日付が変わると検索回数はリセットされます。"
            />
            <FaqItem 
              question="レシピは何件まで保存できますか？"
              answer="現在は最大5件までレシピを保存できます。保存数を増やすには古いレシピを削除する必要があります。"
            />
            <FaqItem 
              question="どんな料理のレシピが見つかりますか？"
              answer="主に時短料理や簡単料理、一人暮らし向けのレシピなど、忙しい方向けの手軽に作れるレシピが中心です。"
            />
            <FaqItem 
              question="抽出されるレシピの精度はどうですか？"
              answer="AIによる抽出のため完璧ではありませんが、材料と基本的な手順は高い精度で抽出されます。動画も同時に確認できるので安心です。"
            />
            <FaqItem 
              question="アプリの利用料金はかかりますか？"
              answer="基本機能は完全無料でご利用いただけます。将来的に追加機能のためのプレミアムプランを検討中です。"
            />
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-8 md:p-12 shadow-xl">
            <div className="text-center relative z-10">
              <h2 className="text-3xl font-bold text-white mb-4">
                今すぐ始めて、料理の<span className="underline decoration-2 decoration-white">時間</span>を取り戻そう！
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                無料会員登録して、AIの力で簡単においしい料理を作りましょう。
              </p>
              <Button 
                size="lg" 
                variant="secondary" 
                className="shadow-lg transform transition-transform duration-300 hover:scale-105"
                onClick={() => handleNavigation('/register')}
              >
                <div className="flex items-center space-x-2">
                  <ChefHat className="h-5 w-5" />
                  <span>無料で登録する</span>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:border-orange-200">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 p-3 bg-orange-100 rounded-full">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
};

const StepCard: React.FC<{
  number: string;
  title: string;
  description: string;
  image: string;
}> = ({ number, title, description, image }) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg">
      <div className="relative h-48">
        <img src={image} alt={title} className="w-full h-full object-cover" />
        <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
          {number}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
};

const FaqItem: React.FC<{
  question: string;
  answer: string;
}> = ({ question, answer }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:border-orange-200">
      <h3 className="font-bold text-lg text-gray-800 mb-2">{question}</h3>
      <p className="text-gray-600">{answer}</p>
    </div>
  );
};

export default LandingPage;