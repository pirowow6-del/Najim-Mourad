/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Globe, 
  Moon, 
  Sun, 
  X, 
  Check, 
  History, 
  Zap, 
  Copy, 
  RefreshCw,
  AlertCircle,
  FileJson,
  Layout,
  Palette,
  Box,
  Wind
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generatePromptFromImage, PromptModel } from './services/geminiService';

interface ModelOption {
  id: PromptModel;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const MODELS: ModelOption[] = [
  { 
    id: 'general', 
    title: 'General Image Prompt', 
    description: 'Natural language description of the image',
    icon: <ImageIcon className="w-5 h-5" />
  },
  { 
    id: 'structured', 
    title: 'Structured Prompt', 
    description: 'Splits into Subject, Environment & Visual Style',
    icon: <Layout className="w-5 h-5" />
  },
  { 
    id: 'graphic', 
    title: 'Graphic Design', 
    description: 'Typography, layout, and professional aesthetics',
    icon: <Palette className="w-5 h-5" />
  },
  { 
    id: 'json', 
    title: 'JSON', 
    description: 'Translates visuals into machine-native JSON code',
    icon: <FileJson className="w-5 h-5" />
  },
  { 
    id: 'flux', 
    title: 'Flux', 
    description: 'Optimized for state-of-the-art Flux AI models',
    icon: <Zap className="w-5 h-5" />
  },
  { 
    id: 'midjourney', 
    title: 'Midjourney', 
    description: 'Tailored for Midjourney with parameters',
    icon: <Box className="w-5 h-5" />
  },
  { 
    id: 'stablediffusion', 
    title: 'Stable Diffusion', 
    description: 'Formatted for Stable Diffusion models',
    icon: <Wind className="w-5 h-5" />
  },
];

const LANGUAGES = ['English', 'French', 'Spanish', 'German', 'Chinese', 'Japanese'];

export default function App() {
  const [showBanner, setShowBanner] = useState(true);
  const [activeTab, setActiveTab] = useState<'image' | 'text'>('image');
  const [selectedModel, setSelectedModel] = useState<PromptModel>('general');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [usageCount, setUsageCount] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('usage_count');
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem('usage_date');

    if (lastDate === today) {
      setUsageCount(parseInt(stored || '0'));
    } else {
      localStorage.setItem('usage_date', today);
      localStorage.setItem('usage_count', '0');
      setUsageCount(0);
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        alert('File size exceeds 4MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setMimeType(file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!image) return;
    if (usageCount >= 5) {
      alert('Daily limit reached. Please try again tomorrow.');
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = await generatePromptFromImage({
        image,
        mimeType,
        modelType: selectedModel,
        language: selectedLanguage
      });
      setGeneratedPrompt(prompt);
      const newCount = usageCount + 1;
      setUsageCount(newCount);
      localStorage.setItem('usage_count', newCount.toString());
    } catch (error) {
      console.error(error);
      alert('Failed to generate prompt. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (generatedPrompt) {
      navigator.clipboard.writeText(generatedPrompt);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-brand text-white py-2 px-4 flex items-center justify-center gap-4 text-sm font-medium overflow-hidden"
          >
            <span>Would you like to switch to Français?</span>
            <button className="bg-white text-brand px-3 py-1 rounded-full text-xs font-bold hover:bg-slate-100 transition-colors">YES</button>
            <button onClick={() => setShowBanner(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <header className="sticky top-0 z-50 glass border-b border-slate-200">
        <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="text-2xl font-bold tracking-tight text-brand flex items-center gap-2">
              <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white">
                <ImageIcon className="w-5 h-5" />
              </div>
              ImagePrompt<span className="text-slate-400 font-normal">.org</span>
            </div>
            <ul className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <li className="hover:text-brand cursor-pointer transition-colors">Home</li>
              <li className="hover:text-brand cursor-pointer transition-colors">Inspiration</li>
              <li className="hover:text-brand cursor-pointer transition-colors">Tutorials</li>
              <li className="hover:text-brand cursor-pointer transition-colors">Tools</li>
              <li className="hover:text-brand cursor-pointer transition-colors">Pricing</li>
            </ul>
          </div>
          <div className="flex items-center gap-4">
            <button className="hidden sm:block text-sm font-medium text-slate-600 hover:text-brand transition-colors">Feedback</button>
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg">
              <button className="p-1.5 rounded-md hover:bg-white transition-all text-slate-600"><Moon className="w-4 h-4" /></button>
              <button className="p-1.5 rounded-md hover:bg-white transition-all text-slate-600"><Globe className="w-4 h-4" /></button>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-grow max-w-5xl mx-auto px-4 py-12 w-full">
        {/* Hero */}
        <section className="text-center mb-12">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4"
          >
            Free Image to Prompt Generator
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600"
          >
            Convert Image to Prompt to generate your own image
          </motion.p>
        </section>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
            <button 
              onClick={() => setActiveTab('image')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'image' ? 'bg-white shadow-sm text-brand' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Image to Prompt
            </button>
            <button 
              onClick={() => setActiveTab('text')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'text' ? 'bg-white shadow-sm text-brand' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Text to Prompt
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Alert Box */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3 text-sm text-blue-800">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>
              Have many images to convert? Try our <a href="#" className="font-bold underline">Batch Image to Prompt</a> tool for better efficiency.
            </p>
          </div>

          {/* Upload Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-4">
              <div className="flex gap-4 border-b border-slate-100 pb-4">
                <button className="text-sm font-bold text-brand border-b-2 border-brand pb-4 -mb-4">Upload Image</button>
                <button className="text-sm font-medium text-slate-400 pb-4 -mb-4 hover:text-slate-600 transition-colors">Input Image URL</button>
              </div>
              
              <label className="flex-grow flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-8 cursor-pointer hover:border-brand/50 hover:bg-slate-50 transition-all group relative overflow-hidden">
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6 text-slate-400 group-hover:text-brand" />
                </div>
                <p className="font-medium text-slate-900">Upload a photo or drag and drop</p>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG, or WEBP up to 4MB</p>
              </label>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-slate-900">Image Preview</h3>
              <div className="flex-grow bg-slate-50 rounded-xl flex items-center justify-center overflow-hidden relative">
                {image ? (
                  <img src={image} alt="Preview" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                ) : (
                  <div className="text-center">
                    <ImageIcon className="w-12 h-12 text-slate-200 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Your image will show here</p>
                  </div>
                )}
                {image && (
                  <button 
                    onClick={() => setImage(null)}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Model Selection */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Select AI Model</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={`flex flex-col text-left p-4 rounded-xl border transition-all ${
                    selectedModel === model.id 
                      ? 'border-brand bg-brand/5 ring-1 ring-brand' 
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg ${selectedModel === model.id ? 'bg-brand text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {model.icon}
                    </div>
                    {selectedModel === model.id && <Check className="w-5 h-5 text-brand" />}
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{model.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">{model.description}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Prompt Language */}
          <div className="flex flex-col gap-2 max-w-xs">
            <label className="text-sm font-bold text-slate-900">Prompt Language</label>
            <div className="relative">
              <select 
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
              >
                {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <Globe className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Result Area */}
          <AnimatePresence>
            {generatedPrompt && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900">Generated Prompt</h3>
                  <button 
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors"
                  >
                    {copySuccess ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    {copySuccess ? 'Copied!' : 'Copy Prompt'}
                  </button>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 font-mono text-sm text-slate-700 whitespace-pre-wrap border border-slate-100">
                  {generatedPrompt}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-slate-100">
            <button 
              onClick={handleGenerate}
              disabled={!image || isGenerating || usageCount >= 5}
              className={`w-full sm:w-auto px-12 py-4 rounded-xl font-bold text-white shadow-lg shadow-brand/20 transition-all flex items-center justify-center gap-2 ${
                !image || isGenerating || usageCount >= 5
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-brand hover:bg-brand-dark hover:-translate-y-0.5 active:translate-y-0'
              }`}
            >
              {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-current" />}
              {isGenerating ? 'Generating...' : 'Generate Prompt'}
            </button>
            
            <div className="flex items-center gap-6 text-sm">
              <div className="flex flex-col items-end">
                <span className="text-slate-500">Uses Today : <span className={`font-bold ${usageCount >= 5 ? 'text-red-500' : 'text-slate-900'}`}>{usageCount}/5</span></span>
                <a href="#" className="text-brand font-bold hover:underline">Get More Uses</a>
              </div>
              <div className="h-8 w-px bg-slate-200 hidden sm:block" />
              <a href="#" className="flex items-center gap-2 text-slate-600 hover:text-brand font-medium transition-colors">
                <History className="w-4 h-4" />
                View History
              </a>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="text-xl font-bold tracking-tight text-brand flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-brand rounded flex items-center justify-center text-white">
                <ImageIcon className="w-4 h-4" />
              </div>
              ImagePrompt.org
            </div>
            <p className="text-sm text-slate-500 max-w-sm">
              The world's most advanced free image to prompt generator. Convert any image into high-quality AI prompts for your favorite models.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li className="hover:text-brand cursor-pointer">Features</li>
              <li className="hover:text-brand cursor-pointer">Pricing</li>
              <li className="hover:text-brand cursor-pointer">API</li>
              <li className="hover:text-brand cursor-pointer">Enterprise</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li className="hover:text-brand cursor-pointer">About</li>
              <li className="hover:text-brand cursor-pointer">Privacy</li>
              <li className="hover:text-brand cursor-pointer">Terms</li>
              <li className="hover:text-brand cursor-pointer">Contact</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-100 text-center text-xs text-slate-400">
          © 2026 ImagePrompt.org. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

