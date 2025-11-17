import { useState, useEffect } from 'react';
import { Upload, X, File, Clock, Trash2, Activity } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

interface DiagnosisRecord {
  id: string;
  symptoms: string;
  description: string;
  diagnosis_result: string;
  height?: number;
  weight?: number;
  age?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  blood_sugar?: number;
  heart_rate?: number;
  temperature?: number;
  created_at: string;
  images: Array<{ id: string; image_url: string; file_name: string; uploaded_at: string }>;
  reports: Array<{ id: string; report_title: string; report_url: string; file_type: string; uploaded_at: string }>;
}

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

export default function AIDiagnosis() {
  const [symptoms, setSymptoms] = useState('');
  const [description, setDescription] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [bloodPressureSystolic, setBloodPressureSystolic] = useState('');
  const [bloodPressureDiastolic, setBloodPressureDiastolic] = useState('');
  const [bloodSugar, setBloodSugar] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [temperature, setTemperature] = useState('');
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [uploadedReports, setUploadedReports] = useState<File[]>([]);
  const [previousRecords, setPreviousRecords] = useState<DiagnosisRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState('');
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<DiagnosisRecord | null>(null);

  useEffect(() => {
    fetchPreviousRecords();
  }, []);

  const fetchPreviousRecords = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: diagnoses, error } = await supabase
        .from('diagnoses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const recordsWithDetails = await Promise.all(
        (diagnoses || []).map(async (diagnosis) => {
          const { data: images } = await supabase
            .from('diagnosis_images')
            .select('*')
            .eq('diagnosis_id', diagnosis.id);

          const { data: reports } = await supabase
            .from('diagnosis_reports')
            .select('*')
            .eq('diagnosis_id', diagnosis.id);

          return {
            ...diagnosis,
            images: images || [],
            reports: reports || [],
          };
        })
      );

      setPreviousRecords(recordsWithDetails);
    } catch (error) {
      console.error('Error fetching records:', error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedImages([...uploadedImages, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrls((prev) => [...prev, event.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleReportUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedReports([...uploadedReports, ...files]);
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
    setPreviewUrls(previewUrls.filter((_, i) => i !== index));
  };

  const removeReport = (index: number) => {
    setUploadedReports(uploadedReports.filter((_, i) => i !== index));
  };

  const handleSubmitDiagnosis = async () => {
    if (!symptoms.trim()) {
      alert('Please enter your symptoms');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please log in to use the diagnosis feature');
        setLoading(false);
        return;
      }

      const { data: diagnosis, error: diagError } = await supabase
        .from('diagnoses')
        .insert({
          user_id: user.id,
          symptoms,
          description,
          diagnosis_result: 'Analysis in progress...',
          height: height ? parseFloat(height) : null,
          weight: weight ? parseFloat(weight) : null,
          age: age ? parseInt(age) : null,
          blood_pressure_systolic: bloodPressureSystolic ? parseInt(bloodPressureSystolic) : null,
          blood_pressure_diastolic: bloodPressureDiastolic ? parseInt(bloodPressureDiastolic) : null,
          blood_sugar: bloodSugar ? parseFloat(bloodSugar) : null,
          heart_rate: heartRate ? parseInt(heartRate) : null,
          temperature: temperature ? parseFloat(temperature) : null,
        })
        .select()
        .maybeSingle();

      if (diagError) throw diagError;
      if (!diagnosis) throw new Error('No diagnosis created');

      setDiagnosisResult('Based on your symptoms and information provided, we recommend consulting with a healthcare professional for a comprehensive evaluation.');

      setSymptoms('');
      setDescription('');
      setHeight('');
      setWeight('');
      setAge('');
      setBloodPressureSystolic('');
      setBloodPressureDiastolic('');
      setBloodSugar('');
      setHeartRate('');
      setTemperature('');
      setUploadedImages([]);
      setUploadedReports([]);
      setPreviewUrls([]);

      await fetchPreviousRecords();
    } catch (error) {
      console.error('Error submitting diagnosis:', error);
      alert('Error submitting diagnosis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deleteRecord = async (recordId: string) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;

    try {
      const { error } = await supabase
        .from('diagnoses')
        .delete()
        .eq('id', recordId);

      if (error) throw error;

      await fetchPreviousRecords();
      if (selectedRecord?.id === recordId) setSelectedRecord(null);
    } catch (error) {
      console.error('Error deleting record:', error);
      alert('Error deleting record');
    }
  };

  return (
    <section id="diagnosis" className="py-20 px-6 lg:px-8 bg-gradient-to-br from-emerald-50 to-cyan-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold font-poppins text-gray-900 mb-2">AI Health Diagnosis</h2>
        <p className="text-gray-600 mb-12">Get instant health insights by describing your symptoms and sharing medical information</p>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
              <h3 className="text-2xl font-bold font-poppins text-gray-900 mb-6">New Diagnosis</h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold font-poppins text-gray-900 mb-3">
                    Describe Your Symptoms
                  </label>
                  <textarea
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="e.g., I have a persistent headache, fever, and body aches for 2 days..."
                    className="w-full h-24 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold font-poppins text-gray-900 mb-3">
                    Additional Details (Optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Medications you're taking, previous conditions, duration, etc."
                    className="w-full h-20 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-200">
                  <div className="flex items-center space-x-2 mb-4">
                    <Activity className="h-5 w-5 text-cyan-600" />
                    <h4 className="text-lg font-bold font-poppins text-gray-900">
                      Health Index (Optional)
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">
                        Height (cm)
                      </label>
                      <input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        placeholder="170"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="70"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">
                        Age (years)
                      </label>
                      <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="30"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">
                        Heart Rate (bpm)
                      </label>
                      <input
                        type="number"
                        value={heartRate}
                        onChange={(e) => setHeartRate(e.target.value)}
                        placeholder="72"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">
                        Temperature (°C)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={temperature}
                        onChange={(e) => setTemperature(e.target.value)}
                        placeholder="37.0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">
                        Blood Sugar (mg/dL)
                      </label>
                      <input
                        type="number"
                        value={bloodSugar}
                        onChange={(e) => setBloodSugar(e.target.value)}
                        placeholder="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-2">
                        Blood Pressure (mmHg)
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={bloodPressureSystolic}
                          onChange={(e) => setBloodPressureSystolic(e.target.value)}
                          placeholder="120"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                        />
                        <span className="text-gray-600 font-semibold">/</span>
                        <input
                          type="number"
                          value={bloodPressureDiastolic}
                          onChange={(e) => setBloodPressureDiastolic(e.target.value)}
                          placeholder="80"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Systolic / Diastolic</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold font-poppins text-gray-900 mb-3">
                    Attach Medical Photos
                  </label>
                  <div className="border-2 border-dashed border-emerald-300 rounded-xl p-8 text-center hover:bg-emerald-50 transition-colors cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                      <Upload className="h-8 w-8 text-emerald-600 mb-2" />
                      <p className="font-semibold font-poppins text-gray-900">Click to upload photos</p>
                      <p className="text-sm text-gray-600">PNG, JPG up to 10MB each</p>
                    </label>
                  </div>

                  {previewUrls.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="relative">
                          <img src={url} alt={`preview ${index}`} className="w-full h-24 object-cover rounded-lg" />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold font-poppins text-gray-900 mb-3">
                    Attach Previous Reports (Optional)
                  </label>
                  <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center hover:bg-blue-50 transition-colors cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.png"
                      onChange={handleReportUpload}
                      className="hidden"
                      id="report-upload"
                    />
                    <label htmlFor="report-upload" className="cursor-pointer flex flex-col items-center">
                      <File className="h-8 w-8 text-blue-600 mb-2" />
                      <p className="font-semibold font-poppins text-gray-900">Click to upload reports</p>
                      <p className="text-sm text-gray-600">PDF, DOC, JPG up to 20MB each</p>
                    </label>
                  </div>

                  {uploadedReports.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {uploadedReports.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-200"
                        >
                          <div className="flex items-center space-x-2">
                            <File className="h-5 w-5 text-blue-600" />
                            <span className="text-sm font-medium text-gray-900">{file.name}</span>
                          </div>
                          <button
                            onClick={() => removeReport(index)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSubmitDiagnosis}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-emerald-600 text-white font-bold font-poppins rounded-full hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Analyzing...' : 'Get AI Diagnosis'}
                </button>

                {diagnosisResult && (
                  <div className="mt-6 p-6 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <h4 className="font-bold font-poppins text-gray-900 mb-2">Diagnosis Result</h4>
                    <p className="text-gray-700">{diagnosisResult}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100 h-fit">
            <h3 className="text-2xl font-bold font-poppins text-gray-900 mb-6">Previous Reports</h3>

            {previousRecords.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No previous diagnoses yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {previousRecords.map((record) => (
                  <div
                    key={record.id}
                    onClick={() => setSelectedRecord(selectedRecord?.id === record.id ? null : record)}
                    className="p-4 bg-gradient-to-br from-emerald-50 to-cyan-50 border border-emerald-200 rounded-xl cursor-pointer hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-semibold font-poppins text-gray-900 text-sm line-clamp-2">
                          {record.symptoms}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {new Date(record.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteRecord(record.id);
                        }}
                        className="text-red-500 hover:text-red-600 ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {selectedRecord?.id === record.id && (
                      <div className="mt-4 pt-4 border-t border-emerald-200 space-y-3">
                        {(record.height || record.weight || record.age || record.heart_rate || record.temperature || record.blood_sugar || record.blood_pressure_systolic) && (
                          <div className="bg-white rounded-lg p-3 border border-cyan-200">
                            <p className="text-xs font-bold font-poppins text-gray-900 mb-2 flex items-center">
                              <Activity className="h-3 w-3 mr-1 text-cyan-600" />
                              Health Index
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {record.age && (
                                <div>
                                  <span className="text-gray-600">Age:</span>
                                  <span className="font-semibold text-gray-900 ml-1">{record.age} yrs</span>
                                </div>
                              )}
                              {record.height && (
                                <div>
                                  <span className="text-gray-600">Height:</span>
                                  <span className="font-semibold text-gray-900 ml-1">{record.height} cm</span>
                                </div>
                              )}
                              {record.weight && (
                                <div>
                                  <span className="text-gray-600">Weight:</span>
                                  <span className="font-semibold text-gray-900 ml-1">{record.weight} kg</span>
                                </div>
                              )}
                              {record.heart_rate && (
                                <div>
                                  <span className="text-gray-600">HR:</span>
                                  <span className="font-semibold text-gray-900 ml-1">{record.heart_rate} bpm</span>
                                </div>
                              )}
                              {record.temperature && (
                                <div>
                                  <span className="text-gray-600">Temp:</span>
                                  <span className="font-semibold text-gray-900 ml-1">{record.temperature}°C</span>
                                </div>
                              )}
                              {record.blood_sugar && (
                                <div>
                                  <span className="text-gray-600">Blood Sugar:</span>
                                  <span className="font-semibold text-gray-900 ml-1">{record.blood_sugar} mg/dL</span>
                                </div>
                              )}
                              {(record.blood_pressure_systolic && record.blood_pressure_diastolic) && (
                                <div className="col-span-2">
                                  <span className="text-gray-600">BP:</span>
                                  <span className="font-semibold text-gray-900 ml-1">
                                    {record.blood_pressure_systolic}/{record.blood_pressure_diastolic} mmHg
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {record.images.length > 0 && (
                          <div>
                            <p className="text-xs font-bold font-poppins text-gray-900 mb-2">
                              {record.images.length} Photo(s)
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              {record.images.map((img) => (
                                <img
                                  key={img.id}
                                  src={img.image_url}
                                  alt={img.file_name}
                                  className="w-full h-16 object-cover rounded-lg"
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {record.reports.length > 0 && (
                          <div>
                            <p className="text-xs font-bold font-poppins text-gray-900 mb-2">
                              {record.reports.length} Report(s)
                            </p>
                            <div className="space-y-1">
                              {record.reports.map((report) => (
                                <div key={report.id} className="flex items-center space-x-2 text-xs">
                                  <File className="h-3 w-3 text-blue-600" />
                                  <span className="text-gray-700 truncate">{report.report_title}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
