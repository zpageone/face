import { useState, useRef } from 'react';
import { Camera, Upload, RefreshCcw, Sparkles, Brain, User, ShieldCheck, AlertCircle } from 'lucide-react';

function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageBase64: selectedImage }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || '분석 중 오류가 발생했습니다.');
      }
      setResult(data.result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || '서버와 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setSelectedImage(null);
    setResult(null);
    setError(null);
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
            최신 Gemini AI 기술을 활용하여 당신의 관상을 분석해드립니다. <br className="hidden md:block" />
            사진을 업로드하고 숨겨진 재능과 행운을 발견해보세요.
          </p>
        </section>

        {/* Error Message */}
        {error && (
          <div className="max-w-3xl mx-auto mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 flex items-center gap-3 animate-in fade-in duration-300">
            <AlertCircle size={20} />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Upload & Analysis Section */}
        <section className="bg-white rounded-3xl shadow-xl shadow-indigo-100 border border-indigo-50 p-6 md:p-10 max-w-3xl mx-auto">
          {!selectedImage ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl py-20 flex flex-col items-center justify-center cursor-pointer transition-all group ${
                isDragging 
                  ? 'border-indigo-600 bg-indigo-50/80 scale-[1.02]' 
                  : 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50'
              }`}
            >
              <div className={`p-4 rounded-full transition-colors mb-4 ${
                isDragging 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'
              }`}>
                <Upload size={40} />
              </div>
              <p className="text-lg font-semibold text-slate-700">
                {isDragging ? '여기에 놓으세요!' : '얼굴 사진을 업로드하거나 끌어다 놓으세요'}
              </p>
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
                    <p className="text-lg font-bold animate-pulse text-center px-4">AI가 관상을 정밀하게 <br />분석 중입니다...</p>
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
                <h3 className="text-xl font-bold">Gemini AI 분석 결과</h3>
              </div>
              <p className="text-slate-700 text-lg leading-relaxed italic whitespace-pre-wrap">
                "{result}"
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-indigo-600 border border-indigo-100">#AI관상</span>
                <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-indigo-600 border border-indigo-100">#Gemini_Pro</span>
                <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-indigo-600 border border-indigo-100">#오늘의_운세</span>
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
            <h4 className="text-lg font-bold mb-2">Gemini 1.5 Flash 분석</h4>
            <p className="text-slate-500 text-sm">최신 멀티모달 AI 모델이 얼굴 이미지를 직접 분석하여 정교한 관상을 풀이합니다.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
              <ShieldCheck size={24} />
            </div>
            <h4 className="text-lg font-bold mb-2">안전한 데이터 관리</h4>
            <p className="text-slate-500 text-sm">업로드된 이미지는 Cloudflare Functions를 통해 암호화되어 전송되며 분석 직후 파기됩니다.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
              <User size={24} />
            </div>
            <h4 className="text-lg font-bold mb-2">직관적 경험</h4>
            <p className="text-slate-500 text-sm">드래그 앤 드롭으로 간편하게 사진을 업로드하고 결과를 즉시 확인할 수 있습니다.</p>
          </div>
        </section>
      </main>

      <footer className="py-12 px-4 border-t border-slate-200 mt-20">
        <div className="max-w-5xl mx-auto text-center text-slate-400 text-sm">
          <p>© 2026 AI 관상가. Powered by Gemini & Cloudflare.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;