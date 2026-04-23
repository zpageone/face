import { useState, useRef } from 'react';
import { Camera, Upload, RefreshCcw, Sparkles, Brain, User, ShieldCheck, AlertCircle } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gemini API Key from environment variables (Vite prefix required for client-side)
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

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
    setImageFile(file);
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

  // Helper function to convert file to Gemini format
  const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.readAsDataURL(file);
    });
    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
  };

  const handleAnalyze = async () => {
    if (!imageFile || !apiKey) {
      if (!apiKey) setError('API 키가 설정되지 않았습니다. .env 파일에 VITE_GEMINI_API_KEY를 추가해주세요.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult('');

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // 최신 버전인 gemini-1.5-flash-latest 모델로 업데이트하여 안정성 확보
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

      const prompt = `
        당신은 수십 년의 경력을 가진 최고의 관상 전문가입니다. 
        첨부된 이미지 속 인물의 이목구비(눈, 코, 입, 귀, 눈썹 등)와 얼굴형을 꼼꼼히 분석해 주세요.
        다음 항목을 포함하여 친절하고 흥미로운 어조로 관상 결과를 풀이해 주세요:
        1. 전체적인 인상과 얼굴형의 특징
        2. 재물운
        3. 직업/성공운
        4. 연애/인간관계운
        5. 관상에 따른 조언 한 마디
        (주의: 부정적인 내용은 너무 무겁지 않게, 긍정적인 방향으로 승화해서 설명해 주세요.)
      `;

      const imagePart = await fileToGenerativePart(imageFile);
      const response = await model.generateContent([prompt, imagePart]);
      const text = await response.response.text();
      
      setResult(text);
    } catch (err: any) {
      console.error("분석 중 오류 상세:", err);
      // 구체적인 에러 메시지 출력
      const errorMsg = err.message || '';
      if (errorMsg.includes('API key not valid')) {
        setError('유효하지 않은 API 키입니다. 키 설정을 다시 확인해주세요.');
      } else if (errorMsg.includes('Quota exceeded')) {
        setError('API 사용량이 초과되었습니다. 잠시 후 다시 시도해주세요.');
      } else if (errorMsg.includes('model not found')) {
        setError('사용하려는 모델(gemini-1.5-pro)을 찾을 수 없습니다.');
      } else {
        setError(`분석 실패: ${errorMsg || '서버와의 통신 중 오류가 발생했습니다.'}`);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setSelectedImage(null);
    setImageFile(null);
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
            전문적인 관상학 지식을 갖춘 AI가 당신의 이목구비를 분석합니다. <br className="hidden md:block" />
            사진을 업로드하고 숨겨진 삶의 지혜를 발견해보세요.
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
                    <p className="text-lg font-bold animate-pulse text-center px-4">AI 관상가가 정성을 다해 <br />관상을 살피는 중입니다...</p>
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
                    나의 관상 확인하기
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
                <h3 className="text-xl font-bold">📜 분석 결과</h3>
              </div>
              <p className="text-slate-700 text-lg leading-relaxed whitespace-pre-wrap">
                {result}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-indigo-600 border border-indigo-100">#정밀_관상</span>
                <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-indigo-600 border border-indigo-100">#Gemini_Pro_Vision</span>
                <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-indigo-600 border border-indigo-100">#운세_풀이</span>
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
            <h4 className="text-lg font-bold mb-2">전문가 페르소나</h4>
            <p className="text-slate-500 text-sm">풍부한 관상학 지식을 학습한 AI가 실제 전문가처럼 상세하게 풀이해 드립니다.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
              <ShieldCheck size={24} />
            </div>
            <h4 className="text-lg font-bold mb-2">프라이버시 중심</h4>
            <p className="text-slate-500 text-sm">클라이언트 사이드 SDK를 사용하여 이미지 데이터를 브라우저에서 안전하게 처리합니다.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
              <User size={24} />
            </div>
            <h4 className="text-lg font-bold mb-2">맞춤형 분석</h4>
            <p className="text-slate-500 text-sm">재물, 직업, 연애 등 삶의 주요 영역에 대한 구체적인 분석과 조언을 제공합니다.</p>
          </div>
        </section>
      </main>

      <footer className="py-12 px-4 border-t border-slate-200 mt-20">
        <div className="max-w-5xl mx-auto text-center text-slate-400 text-sm">
          <p>© 2026 AI 관상 분석소. Powered by Gemini 1.5 Pro.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
