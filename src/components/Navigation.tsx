import { useState } from 'react';
import { Activity, ChevronDown, Brain, Stethoscope, Pill, Video, Calendar, Users, Package, Tablets, Heart, FileText, X } from 'lucide-react';
import LoginPage from './LoginPage';

export default function Navigation() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState<any>(null);

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    setShowLogin(false);
  };

  const handleMouseEnter = (menu: string) => {
    setOpenDropdown(menu);
  };

  const toggleDropdown = (menu: string) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  const handleNavClick = (href: string) => {
    setOpenDropdown(null);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const dropdownMenus = {
    diagnosis: [
      { icon: Brain, label: 'Your Diagnosis', href: '#diagnosis' },
      { icon: FileText, label: 'Health Reports', href: '#diagnosis' },
      { icon: Heart, label: 'Health Index', href: '#diagnosis' },
      { icon: Activity, label: 'Diagnosis History', href: '#diagnosis' },
    ],
    doctors: [
      { icon: Users, label: 'Find Doctors', href: '#doctors' },
      { icon: Calendar, label: 'Your appointments', href: '#doctors' },
      { icon: Activity, label: 'Emergency Support', href: '#doctors' },
    ],
    shop: [
      { icon: Pill, label: 'Buy Medicines', href: '#shop' },
      { icon: FileText, label: 'Purchase History', href: '#shop' },
      { icon: Tablets, label: 'Dosage Reminder', href: '#shop' },
    ],
  };

  return (
    <nav className="relative z-50 px-6 py-4 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <button onClick={() => handleNavClick('#home')} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <Activity className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold font-poppins text-slate-800">CureSphere</span>
        </button>

        <div className="hidden md:flex items-center space-x-8">
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('diagnosis')}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button onClick={() => toggleDropdown('diagnosis')} className="flex items-center space-x-1 px-4 py-2 rounded-2xl bg-blue-100 text-blue-700 font-poppins font-bold hover:bg-blue-150 transition-all duration-200 border border-blue-200 btn-depth">
              <span>Check your Disease</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${openDropdown === 'diagnosis' ? 'rotate-180' : ''}`} />
            </button>

            {openDropdown === 'diagnosis' && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-fade-in">
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                  <span className="font-poppins font-bold text-gray-900">Check your Disease</span>
                  <button onClick={() => setOpenDropdown(null)} className="text-gray-400 hover:text-gray-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {dropdownMenus.diagnosis.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleNavClick(item.href)}
                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <item.icon className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-slate-700 font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('doctors')}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button onClick={() => toggleDropdown('doctors')} className="flex items-center space-x-1 px-4 py-2 rounded-2xl bg-blue-100 text-blue-700 font-poppins font-bold hover:bg-blue-150 transition-all duration-200 border border-blue-200 btn-depth">
              <span>Doctors</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${openDropdown === 'doctors' ? 'rotate-180' : ''}`} />
            </button>

            {openDropdown === 'doctors' && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-fade-in">
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                  <span className="font-poppins font-bold text-gray-900">Doctors</span>
                  <button onClick={() => setOpenDropdown(null)} className="text-gray-400 hover:text-gray-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {dropdownMenus.doctors.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleNavClick(item.href)}
                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <item.icon className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-slate-700 font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('shop')}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button onClick={() => toggleDropdown('shop')} className="flex items-center space-x-1 px-4 py-2 rounded-2xl bg-blue-100 text-blue-700 font-poppins font-bold hover:bg-blue-150 transition-all duration-200 border border-blue-200 btn-depth">
              <span>Medicine</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${openDropdown === 'shop' ? 'rotate-180' : ''}`} />
            </button>

            {openDropdown === 'shop' && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-fade-in">
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                  <span className="font-poppins font-bold text-gray-900">Medicine</span>
                  <button onClick={() => setOpenDropdown(null)} className="text-gray-400 hover:text-gray-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {dropdownMenus.shop.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleNavClick(item.href)}
                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <item.icon className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-slate-700 font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => handleNavClick('#contact')} className="px-4 py-2 rounded-2xl bg-slate-100 text-slate-700 font-poppins font-bold hover:bg-slate-200 transition-all duration-200 border border-slate-200 btn-depth">
            Contact
          </button>

          {user && profile ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 font-poppins font-bold rounded-full hover:bg-blue-150 hover:shadow-lg transition-all duration-200 shadow-md border border-blue-200"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{profile.name.charAt(0)}</span>
                </div>
                <span className="hidden sm:inline">{profile.name.split(' ')[0]}</span>
              </button>

              {showProfileMenu && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-fade-in z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        <span className="text-white font-bold">{profile.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{profile.name}</p>
                        <p className="text-sm text-slate-600">{profile.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="px-2 py-2 space-y-1">
                    <button className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left rounded-lg">
                      <UserIcon className="h-4 w-4 text-slate-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">Profile</p>
                        <p className="text-xs text-slate-500">{profile.phone_number}</p>
                      </div>
                    </button>
                    {profile.address && (
                      <button className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left rounded-lg">
                        <MapPin className="h-4 w-4 text-slate-600" />
                        <div>
                          <p className="text-sm font-medium text-slate-700">Address</p>
                          <p className="text-xs text-slate-500 line-clamp-1">{profile.address}</p>
                        </div>
                      </button>
                    )}
                  </div>

                  <div className="px-2 py-2 border-t border-gray-100">
                    <button
                      onClick={async () => {
                        await logout();
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-red-50 transition-colors text-left rounded-lg text-red-600"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="text-sm font-medium">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="px-6 py-2 bg-blue-600 text-white font-poppins font-bold rounded-2xl hover:bg-blue-700 transition-all duration-200 btn-depth"
            >
              Get Started
            </button>
          )}
        </div>
      </div>

      {showLogin && (
        <LoginPage
          onClose={() => setShowLogin(false)}
        />
      )}
    </nav>
  );
}
