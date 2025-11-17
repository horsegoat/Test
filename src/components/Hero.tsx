import { Heart, Activity, Pill, Stethoscope } from 'lucide-react';
import Navigation from './Navigation';

export default function Hero() {
  return (
    <div className="relative bg-gradient-to-br from-blue-50 via-white to-slate-50 overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <Navigation />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 lg:py-32 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Heart className="h-4 w-4" />
              <span>AI-Powered Healthcare</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
              Your Health, Our
              <span className="text-blue-600"> Priority</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Experience the future of healthcare with AI-driven diagnosis, expert doctors, and convenient medicine delivery—all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all font-medium btn-depth">
                Start Diagnosis
              </button>
              <button className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-2xl hover:bg-blue-50 transition-all font-medium btn-depth">
                Learn More
              </button>
            </div>
            <div className="mt-12 flex items-center space-x-8">
              <div className="flex -space-x-2">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-300 border-2 border-white"></div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-400 border-2 border-white"></div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-emerald-400 border-2 border-white"></div>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">50,000+</p>
                <p className="text-sm text-slate-600">Satisfied Patients</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-300 rounded-3xl transform rotate-3"></div>
            <div className="relative bg-white rounded-3xl shadow-2xl p-8 transform -rotate-1">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl hover:scale-105 transition-transform cursor-pointer shadow-sm">
                  <Activity className="h-10 w-10 text-blue-600 mb-4" />
                  <h3 className="font-bold text-slate-900 mb-1">AI Diagnosis</h3>
                  <p className="text-sm text-slate-600">Instant health analysis</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl hover:scale-105 transition-transform cursor-pointer shadow-sm">
                  <Stethoscope className="h-10 w-10 text-blue-600 mb-4" />
                  <h3 className="font-bold text-slate-900 mb-1">Expert Doctors</h3>
                  <p className="text-sm text-slate-600">24/7 consultation</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl hover:scale-105 transition-transform cursor-pointer shadow-sm">
                  <Pill className="h-10 w-10 text-blue-600 mb-4" />
                  <h3 className="font-bold text-slate-900 mb-1">Medicine Shop</h3>
                  <p className="text-sm text-slate-600">Fast delivery</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl hover:scale-105 transition-transform cursor-pointer shadow-sm">
                  <Heart className="h-10 w-10 text-blue-600 mb-4" />
                  <h3 className="font-bold text-slate-900 mb-1">Care Plans</h3>
                  <p className="text-sm text-slate-600">Personalized care</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white via-white to-transparent"></div>
    </div>
  );
}
