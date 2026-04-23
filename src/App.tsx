import { useState, useRef } from 'react';
import { Camera, Upload, RefreshCcw, Sparkles, Brain, User, ShieldCheck } from 'lucide-react';

function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    
    // Simulate AI Analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      setResult("이목구비가 뚜렷하며 기운이 넘치는 인상입니다. 리더십이 뛰어나고 재물운이 좋은 관상으로 보입니다. 주변 사람들에게 신뢰를 주는 이미지를 가지고 계시네요.");
    }, 3000);
  };

  const reset = () => {
    setSelectedImage(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="py-6 px-4 border-b bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <Sparkles size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">AI 관상가</h1>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-indigo-600 transition-colors">홈</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">사용방법</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">문의하기</a>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12 md:py-20">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            당신의 얼굴에 담긴 <br />운명을 확인해보세요
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10">
            최신 AI 기술을 활용하여 당신의 관상을 분석해드립니다. <br className="hidden md:block" />
            사진을 업로드하고 숨겨진 재능과 행운을 발견해보세요.
          </p>
        </section>

        {/* Upload & Analysis Section */}
        <section className="bg-white rounded-3xl shadow-xl shadow-indigo-100 border border-indigo-50 p-6 md:p-10 max-w-3xl mx-auto">
          {!selectedImage ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-2xl py-20 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group"
            >
              <div className="bg-slate-100 p-4 rounded-full text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors mb-4">
                <Upload size={40} />
              </div>
              <p className="text-lg font-semibold text-slate-700">얼굴 사진을 업로드하세요</p>
              <p className="text-sm text-slate-500 mt-2">JPG, PNG 파일 (최대 5MB)</p>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden" 
                accept="image/*"
              />
            </div>
          ) : (
            <div className="space-y-8">
              <div className="relative aspect-square max-w-sm mx-auto rounded-2xl overflow-hidden shadow-lg ring-4 ring-indigo-100">
                <img 
                  src={selectedImage} 
                  alt="Selected face" 
                  className="w-full h-full object-cover"
                />
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-indigo-900/40 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                    <div className="animate-spin mb-4">
                      <RefreshCcw size={48} />
                    </div>
                    <p className="text-lg font-bold animate-pulse">AI가 관상을 분석 중입니다...</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {!isAnalyzing && !result && (
                  <button 
                    onClick={handleAnalyze}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all active:scale-95"
                  >
                    <Brain size={20} />
                    관상 분석하기
                  </button>
                )}
                
                {!isAnalyzing && (
                  <button 
                    onClick={reset}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Camera size={20} />
                    다른 사진 선택
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Result Section */}
          {result && !isAnalyzing && (
            <div className="mt-12 p-8 bg-indigo-50 rounded-2xl border border-indigo-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center gap-2 mb-4 text-indigo-600">
                <Sparkles size={24} />
                <h3 className="text-xl font-bold">분석 결과</h3>
              </div>
              <p className="text-slate-700 text-lg leading-relaxed italic">
                "{result}"
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-indigo-600 border border-indigo-100">#리더십</span>
                <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-indigo-600 border border-indigo-100">#재물운_상승</span>
                <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-indigo-600 border border-indigo-100">#신뢰형_인상</span>
              </div>
            </div>
          )}
        </section>

        {/* Features Section */}
        <section className="mt-32 grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
              <Brain size={24} />
            </div>
            <h4 className="text-lg font-bold mb-2">딥러닝 AI 분석</h4>
            <p className="text-slate-500 text-sm">수만 장의 데이터를 학습한 AI가 얼굴의 주요 특징을 정밀하게 분석합니다.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
              <ShieldCheck size={24} />
            </div>
            <h4 className="text-lg font-bold mb-2">개인정보 보호</h4>
            <p className="text-slate-500 text-sm">업로드된 사진은 분석 후 즉시 삭제되며, 외부로 공유되지 않습니다.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
              <User size={24} />
            </div>
            <h4 className="text-lg font-bold mb-2">맞춤형 결과</h4>
            <p className="text-slate-500 text-sm">당신만의 고유한 이목구비를 바탕으로 개별화된 운세 리포트를 제공합니다.</p>
          </div>
        </section>
      </main>

      <footer className="py-12 px-4 border-t border-slate-200 mt-20">
        <div className="max-w-5xl mx-auto text-center text-slate-400 text-sm">
          <p>© 2026 AI 관상가. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;