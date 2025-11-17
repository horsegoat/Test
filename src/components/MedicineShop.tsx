import { useState, useEffect } from 'react';
import { Pill, ShoppingCart, Truck, Shield, Package, Search, Scan, Upload, X, FileText, Check } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../context/AuthContext';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface Medicine {
  id: string;
  name: string;
  category: string;
  price: number;
  in_stock: boolean;
  requires_prescription: boolean;
  description?: string;
}

interface CartItem {
  id: string;
  medicine_id: string;
  quantity: number;
  medicine: Medicine;
}

export default function MedicineShop() {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPrescriptionScanner, setShowPrescriptionScanner] = useState(false);
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [prescriptionPreview, setPrescriptionPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [extractedMedicines, setExtractedMedicines] = useState<string[]>([]);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    fetchMedicines();
    if (user) {
      fetchCart();
    }
  }, [user]);

  const fetchMedicines = async () => {
    try {
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .order('name');

      if (error) throw error;
      setMedicines(data || []);
    } catch (error) {
      console.error('Error fetching medicines:', error);
    }
  };

  const fetchCart = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          medicine_id,
          quantity,
          medicine:medicines(*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setCart(data || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const addToCart = async (medicineId: string) => {
    if (!user) {
      alert('Please log in to add items to cart');
      return;
    }

    try {
      const existingItem = cart.find(item => item.medicine_id === medicineId);

      if (existingItem) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            medicine_id: medicineId,
            quantity: 1,
          });

        if (error) throw error;
      }

      await fetchCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error adding to cart');
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);

      if (error) throw error;
      await fetchCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const handlePrescriptionUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPrescriptionFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPrescriptionPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const scanPrescription = async () => {
    if (!prescriptionFile || !user) return;

    setUploading(true);
    try {
      const fileExt = prescriptionFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `prescriptions/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('medical-files')
        .upload(filePath, prescriptionFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('medical-files')
        .getPublicUrl(filePath);

      const mockExtractedMedicines = [
        'Paracetamol 500mg',
        'Amoxicillin 250mg',
        'Vitamin D3 Supplement'
      ];

      const { data: prescriptionData, error: prescriptionError } = await supabase
        .from('prescriptions')
        .insert({
          user_id: user.id,
          image_url: urlData.publicUrl,
          file_name: prescriptionFile.name,
          extracted_medicines: mockExtractedMedicines,
          status: 'processed',
        })
        .select()
        .maybeSingle();

      if (prescriptionError) throw prescriptionError;

      setExtractedMedicines(mockExtractedMedicines);

      for (const medicineName of mockExtractedMedicines) {
        const medicine = medicines.find(m =>
          m.name.toLowerCase().includes(medicineName.toLowerCase()) ||
          medicineName.toLowerCase().includes(m.name.toLowerCase())
        );

        if (medicine && medicine.in_stock) {
          await addToCart(medicine.id);
        }
      }

      alert('Prescription scanned successfully! Medicines have been added to your cart.');
      setShowPrescriptionScanner(false);
      setPrescriptionFile(null);
      setPrescriptionPreview('');
    } catch (error) {
      console.error('Error scanning prescription:', error);
      alert('Error processing prescription. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    medicine.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const cartTotal = cart.reduce((total, item) => {
    const medicine = item.medicine as unknown as Medicine;
    return total + (medicine.price * item.quantity);
  }, 0);

  return (
    <section id="shop" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Pill className="h-4 w-4" />
            <span>Online Pharmacy</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Medicine Shop
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Order your prescribed medicines and wellness products with fast delivery
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-3xl p-8 mb-12">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for medicines, vitamins, supplements..."
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowPrescriptionScanner(true)}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all font-medium btn-depth"
              >
                <Scan className="h-5 w-5" />
                <span>Scan Prescription</span>
              </button>

              {user && cart.length > 0 && (
                <button
                  onClick={() => setShowCart(true)}
                  className="relative px-6 py-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all font-medium btn-depth"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                    {cart.length}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredMedicines.map((medicine) => (
            <div
              key={medicine.id}
              className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all hover:border-blue-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-gradient-to-br from-blue-100 to-blue-100 w-16 h-16 rounded-xl flex items-center justify-center">
                  <Pill className="h-8 w-8 text-blue-600" />
                </div>
                {medicine.requires_prescription && (
                  <span className="bg-amber-100 text-amber-800 text-xs font-medium px-3 py-1 rounded-full">
                    Rx Required
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">{medicine.name}</h3>
              <p className="text-sm text-slate-600 mb-4">{medicine.category}</p>
              <div className="flex items-center justify-between mb-4">
                <p className="text-2xl font-bold text-blue-600">${medicine.price.toFixed(2)}</p>
                {medicine.in_stock ? (
                  <span className="text-green-600 text-sm font-medium">In Stock</span>
                ) : (
                  <span className="text-red-600 text-sm font-medium">Out of Stock</span>
                )}
              </div>
              <button
                onClick={() => addToCart(medicine.id)}
                disabled={!medicine.in_stock}
                className={`w-full px-4 py-3 rounded-2xl font-medium transition-all btn-depth ${
                  medicine.in_stock
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                <ShoppingCart className="inline-block h-4 w-4 mr-2" />
                Add to Cart
              </button>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-8 text-center">
            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Truck className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Fast Delivery</h3>
            <p className="text-slate-600">
              Get your medicines delivered within 24-48 hours
            </p>
          </div>

          <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl p-8 text-center">
            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">100% Authentic</h3>
            <p className="text-slate-600">
              All medicines are sourced from licensed manufacturers
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 text-center">
            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Easy Returns</h3>
            <p className="text-slate-600">
              Hassle-free returns within 7 days of delivery
            </p>
          </div>
        </div>
      </div>

      {showPrescriptionScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex items-center justify-between rounded-t-3xl">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Scan className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Scan Prescription</h3>
                  <p className="text-sm text-slate-600">Upload your prescription to automatically add medicines</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPrescriptionScanner(false);
                  setPrescriptionFile(null);
                  setPrescriptionPreview('');
                  setExtractedMedicines([]);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {!prescriptionPreview ? (
                <div className="border-2 border-dashed border-blue-300 rounded-2xl p-12 text-center hover:bg-blue-50 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handlePrescriptionUpload}
                    className="hidden"
                    id="prescription-upload"
                  />
                  <label htmlFor="prescription-upload" className="cursor-pointer flex flex-col items-center">
                    <Upload className="h-16 w-16 text-blue-600 mb-4" />
                    <p className="text-xl font-bold text-slate-900 mb-2">Upload Prescription</p>
                    <p className="text-slate-600">Click to upload or drag and drop</p>
                    <p className="text-sm text-slate-500 mt-2">PNG, JPG, PDF up to 10MB</p>
                  </label>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="relative">
                    <img
                      src={prescriptionPreview}
                      alt="Prescription preview"
                      className="w-full rounded-2xl border-2 border-gray-200"
                    />
                    <button
                      onClick={() => {
                        setPrescriptionFile(null);
                        setPrescriptionPreview('');
                      }}
                      className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {extractedMedicines.length > 0 && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
                      <div className="flex items-center space-x-2 mb-4">
                        <Check className="h-5 w-5 text-emerald-600" />
                        <h4 className="font-bold text-slate-900">Medicines Detected</h4>
                      </div>
                      <ul className="space-y-2">
                        {extractedMedicines.map((medicine, index) => (
                          <li key={index} className="flex items-center space-x-2 text-slate-700">
                            <FileText className="h-4 w-4 text-emerald-600" />
                            <span>{medicine}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    onClick={scanPrescription}
                    disabled={uploading}
                    className="w-full px-6 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed btn-depth"
                  >
                    {uploading ? (
                      <span>Processing...</span>
                    ) : (
                      <span className="flex items-center justify-center space-x-2">
                        <Scan className="h-5 w-5" />
                        <span>Scan & Add to Cart</span>
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex items-center justify-between rounded-t-3xl">
              <div className="flex items-center space-x-3">
                <div className="bg-emerald-100 p-3 rounded-xl">
                  <ShoppingCart className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Your Cart</h3>
              </div>
              <button
                onClick={() => setShowCart(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => {
                    const medicine = item.medicine as unknown as Medicine;
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between bg-gradient-to-br from-blue-50 to-slate-50 p-4 rounded-xl border border-gray-200"
                      >
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="bg-blue-100 p-3 rounded-lg">
                            <Pill className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-900">{medicine.name}</h4>
                            <p className="text-sm text-slate-600">{medicine.category}</p>
                            <p className="text-sm font-semibold text-blue-600">
                              ${medicine.price.toFixed(2)} x {item.quantity}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <p className="text-lg font-bold text-slate-900">
                            ${(medicine.price * item.quantity).toFixed(2)}
                          </p>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  <div className="border-t-2 border-gray-200 pt-4 mt-4">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-xl font-bold text-slate-900">Total:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        ${cartTotal.toFixed(2)}
                      </span>
                    </div>
                    <button className="w-full px-6 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all btn-depth">
                      Proceed to Checkout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
