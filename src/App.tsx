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
      if (!apiKey) {
        throw new Error('VITE_GEMINI_API_KEY가 설정되지 않았습니다. .env 파일이나 Cloudflare 설정을 확인해주세요.');
      }
      
      const genAI = new GoogleGenerativeAI(apiKey);
      // 현재 가장 최신 모델인 gemini-2.0-flash를 적용하여 속도와 분석력을 향상시킵니다.
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash',
      });

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
      <header className="py-6 px-4 border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <Sparkles size={24} />
            </div>
            <h1 className="text-xl font-heading font-extrabold tracking-tight">AI 관상가</h1>
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-semibold text-slate-600 dark:text-slate-400">
            <a href="#" className="hover:text-indigo-600 transition-colors uppercase tracking-widest">홈</a>
            <a href="#" className="hover:text-indigo-600 transition-colors uppercase tracking-widest">사용방법</a>
            <a href="#" className="hover:text-indigo-600 transition-colors uppercase tracking-widest">문의하기</a>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-16 md:py-24">
        {/* Hero Section */}
        <section className="text-center mb-20">
          <h2 className="text-5xl md:text-7xl font-heading font-black mb-8 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent tracking-tighter text-balance">
            당신의 얼굴에 담긴 <br />운명을 확인해보세요
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
            전문적인 관상학 지식을 갖춘 AI가 당신의 이목구비를 분석합니다. <br className="hidden md:block" />
            사진을 업로드하고 숨겨진 삶의 지혜를 발견해보세요.
          </p>
        </section>

        {/* Error Message */}
        {error && (
          <div className="max-w-3xl mx-auto mb-8 p-5 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl text-red-600 dark:text-red-400 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle size={22} className="shrink-0 mt-0.5" />
            <p className="font-semibold leading-relaxed">{error}</p>
          </div>
        )}

        {/* Upload & Analysis Section */}
        <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-indigo-200/50 dark:shadow-none border border-indigo-50 dark:border-slate-800 p-8 md:p-14 max-w-4xl mx-auto transition-all">
          {!selectedImage ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-[2rem] py-24 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group ${
                isDragging 
                  ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-900/10 scale-[1.01]' 
                  : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:bg-indigo-50/30'
              }`}
            >
              <div className={`p-5 rounded-3xl transition-all duration-500 mb-6 shadow-sm ${
                isDragging 
                  ? 'bg-indigo-600 text-white scale-110 rotate-3' 
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 group-hover:rotate-[-3deg]'
              }`}>
                <Upload size={48} />
              </div>
              <p className="text-2xl font-heading font-bold text-slate-800 dark:text-slate-100">
                {isDragging ? '여기에 놓으세요!' : '얼굴 사진을 업로드하세요'}
              </p>
              <p className="text-slate-500 dark:text-slate-400 mt-3 font-medium">드래그 앤 드롭 또는 클릭하여 선택</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-6 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">JPG, PNG 파일 (MAX 5MB)</p>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden" 
                accept="image/*"
              />
            </div>
          ) : (
            <div className="space-y-12">
              <div className="relative aspect-square max-w-md mx-auto rounded-[2rem] overflow-hidden shadow-2xl ring-8 ring-indigo-50 dark:ring-slate-800">
                <img 
                  src={selectedImage} 
                  alt="Selected face" 
                  className="w-full h-full object-cover"
                />
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md flex flex-col items-center justify-center text-white p-8">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 animate-ping opacity-25">
                        <RefreshCcw size={64} className="text-indigo-400" />
                      </div>
                      <RefreshCcw size={64} className="animate-spin text-white" />
                    </div>
                    <p className="text-2xl font-heading font-black animate-pulse text-center leading-tight">AI 관상가가 정성을 다해 <br />관상을 살피는 중입니다...</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-5 justify-center">
                {!isAnalyzing && !result && (
                  <button 
                    onClick={handleAnalyze}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-2xl font-heading font-black text-xl flex items-center justify-center gap-3 shadow-xl shadow-indigo-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-95 group"
                  >
                    <Brain size={24} className="group-hover:animate-bounce" />
                    나의 관상 확인하기
                  </button>
                )}
                
                {!isAnalyzing && (
                  <button 
                    onClick={reset}
                    className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-10 py-5 rounded-2xl font-heading font-black text-xl flex items-center justify-center gap-3 transition-all active:scale-95"
                  >
                    <Camera size={24} />
                    다른 사진 선택
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Result Section */}
          {result && !isAnalyzing && (
            <div className="mt-16 p-10 md:p-14 bg-indigo-50/50 dark:bg-indigo-950/10 rounded-[2rem] border border-indigo-100 dark:border-indigo-900/30 animate-in fade-in slide-in-from-bottom-10 duration-1000 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Sparkles size={120} className="text-indigo-600" />
              </div>
              
              <div className="flex items-center gap-3 mb-8 text-indigo-600 dark:text-indigo-400">
                <Sparkles size={32} />
                <h3 className="text-3xl font-heading font-black tracking-tight">📜 분석 결과</h3>
              </div>
              
              <div className="prose prose-indigo dark:prose-invert max-w-none">
                <p className="text-slate-800 dark:text-slate-200 text-xl leading-relaxed whitespace-pre-wrap font-medium">
                  {result}
                </p>
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                <span className="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl text-sm font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 shadow-sm">#정밀_관상</span>
                <span className="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl text-sm font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 shadow-sm">#Gemini_AI_풀이</span>
                <span className="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl text-sm font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 shadow-sm">#운세_리포트</span>
              </div>
            </div>
          )}
        </section>

        {/* Features Section */}
        <section className="mt-40 grid md:grid-cols-3 gap-10">
          {[
            { 
              icon: <Brain size={28} />, 
              title: "전문가 페르소나", 
              desc: "수천 년 관상학의 지혜와 현대 심리학 데이터를 학습한 AI가 실제 전문가처럼 정밀하게 풀이해 드립니다." 
            },
            { 
              icon: <ShieldCheck size={28} />, 
              title: "프라이버시 중심", 
              desc: "이미지는 브라우저에서 직접 AI에게 전송되며 서버에 저장되지 않아 안심하고 이용할 수 있습니다." 
            },
            { 
              icon: <User size={28} />, 
              title: "맞춤형 분석", 
              desc: "당신만이 가진 고유한 특징을 통해 재물, 직업, 인간관계에 대한 맞춤형 조언을 제공합니다." 
            }
          ].map((feature, i) => (
            <div key={i} className="group p-8 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-indigo-100 dark:hover:shadow-none transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                {feature.icon}
              </div>
              <h4 className="text-xl font-heading font-bold mb-3 dark:text-white">{feature.title}</h4>
              <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="py-16 px-4 border-t border-slate-200 dark:border-slate-800 mt-32">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-6 opacity-50">
            <Sparkles size={18} className="text-indigo-600" />
            <span className="font-heading font-black tracking-tight text-slate-900 dark:text-white">AI 관상 분석소</span>
          </div>
          <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">© 2026 AI 관상 분석소. Powered by Gemini 2.0 Flash.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
