import { useState, useEffect } from 'react';
import { Stethoscope, Star, Video, Calendar, Clock, Award } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  qualifications: string;
  position: string;
  experience_years: number;
  rating: number;
  patients_count: number;
  available: boolean;
}

export default function DoctorSection() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .order('rating', { ascending: false })
        .limit(8);

      if (error) throw error;
      setDoctors(data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <section id="doctors" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-cyan-100 text-cyan-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Stethoscope className="h-4 w-4" />
            <span>Expert Medical Professionals</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Consult with Top Doctors
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Connect with experienced healthcare professionals anytime, anywhere
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {loading ? (
            <div className="col-span-full text-center py-8">
              <p className="text-slate-600">Loading doctors...</p>
            </div>
          ) : doctors.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-slate-600">No doctors available</p>
            </div>
          ) : (
            doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:transform hover:scale-105 cursor-pointer"
              >
                <div className="relative mb-4">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-400 to-blue-300 rounded-full"></div>
                  {doctor.available && (
                    <div className="absolute bottom-0 right-1/2 transform translate-x-12 bg-green-500 h-4 w-4 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-900 text-center mb-1">
                  {doctor.name}
                </h3>
                <p className="text-sm text-blue-600 text-center mb-1">{doctor.specialty}</p>
                <p className="text-xs text-gray-500 text-center mb-3 line-clamp-2">{doctor.qualifications}</p>
                <div className="flex items-center justify-center space-x-1 mb-3">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-semibold text-slate-900">{doctor.rating}</span>
                  <span className="text-sm text-gray-500">({doctor.patients_count})</span>
                </div>
                <div className="flex items-center justify-center text-sm text-slate-600 mb-4">
                  <Award className="h-4 w-4 mr-1" />
                  {doctor.experience_years} years experience
                </div>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors font-medium btn-depth">
                  Book Appointment
                </button>
              </div>
            ))
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="bg-blue-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
              <Video className="h-7 w-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Video Consultation</h3>
            <p className="text-slate-600 mb-4">
              Face-to-face consultation from the comfort of your home
            </p>
            <button className="text-blue-600 font-medium hover:underline">
              Learn more →
            </button>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="bg-cyan-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
              <Calendar className="h-7 w-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Easy Scheduling</h3>
            <p className="text-slate-600 mb-4">
              Book appointments at your preferred time with instant confirmation
            </p>
            <button className="text-blue-600 font-medium hover:underline">
              Learn more →
            </button>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="bg-blue-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
              <Clock className="h-7 w-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">24/7 Availability</h3>
            <p className="text-slate-600 mb-4">
              Access healthcare services whenever you need them, day or night
            </p>
            <button className="text-blue-600 font-medium hover:underline">
              Learn more →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
