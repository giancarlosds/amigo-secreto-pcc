import React, { useState, useEffect } from 'react';
import { Gift, Search, Send, AlertCircle, CheckCircle2, TreePine, Star, Snowflake, User, List } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// --- Configuración Real de Firebase ---
const firebaseConfig = {
  apiKey: "AIzaSyBNp_WZz3IFFlh41RfF45adDvLX1zcoPDU",
  authDomain: "amigo-secreto-pcc.firebaseapp.com",
  projectId: "amigo-secreto-pcc",
  storageBucket: "amigo-secreto-pcc.firebasestorage.app",
  messagingSenderId: "338296642948",
  appId: "1:338296642948:web:db5dc67d600bad92b691d1",
  measurementId: "G-KXN86N8JCD"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
//const envAppId = typeof __app_id !== 'undefined' ? __app_id : 'amigo-secreto-pcc-app';

export default function App() {
  const [activeTab, setActiveTab] = useState('register'); // 'register' | 'search'
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  // Estados de Registro
  const [myName, setMyName] = useState('');
  const [myGifts, setMyGifts] = useState(['', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados de Búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null); // null = sin buscar, 'NOT_FOUND' = no existe, Object = encontrado
  const [isSearching, setIsSearching] = useState(false);

  // --- Utilidades ---
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 5000);
  };

  const handleGiftChange = (index, value) => {
    const newGifts = [...myGifts];
    newGifts[index] = value;
    setMyGifts(newGifts);
  };

  const normalizeName = (name) => {
    // Convierte a minúsculas, quita espacios al inicio/fin y reemplaza espacios intermedios por guiones
    return name.trim().toLowerCase().replace(/\s+/g, '-');
  };

  // --- Manejadores de Firebase ---
  const handleRegisterGifts = async (e) => {
    e.preventDefault();

    if (!myName.trim()) {
      showNotification("Por favor, ingresa tu nombre completo.", "error");
      return;
    }
    
    const validGifts = myGifts.filter(g => g.trim() !== '');
    if (validGifts.length === 0) {
      showNotification("Por favor, ingresa al menos una opción de regalo.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const documentId = normalizeName(myName);
      const docRef = doc(db, 'artifacts', envAppId, 'public', 'data', 'regalos', documentId);
      
      await setDoc(docRef, {
        name: myName.trim(),
        gifts: validGifts,
        updatedAt: new Date().toISOString()
      });
      
      showNotification("¡Tus opciones de regalo se han guardado exitosamente!");
      // Opcional: limpiar formulario después de guardar
      // setMyName('');
      // setMyGifts(['', '', '']);
    } catch (error) {
      console.error("Error guardando regalos:", error);
      showNotification("Hubo un error al guardar tu lista. Intenta nuevamente.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResult(null);

    try {
      const documentId = normalizeName(searchQuery);
      const docRef = doc(db, 'artifacts', envAppId, 'public', 'data', 'regalos', documentId);
      
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setSearchResult(docSnap.data());
      } else {
        setSearchResult('NOT_FOUND');
      }
    } catch (error) {
      console.error("Error buscando regalos:", error);
      showNotification("Hubo un error al buscar. Intenta nuevamente.", "error");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      {/* Cabecera Navideña */}
      <header className="bg-emerald-800 text-white shadow-xl relative overflow-hidden border-b-[6px] border-red-600 shrink-0">
        <style>{`
          @keyframes fall {
            0% { transform: translateY(-50px) rotate(0deg); opacity: 0; }
            20% { opacity: 0.8; }
            80% { opacity: 0.8; }
            100% { transform: translateY(300px) rotate(360deg); opacity: 0; }
          }
          .snow { position: absolute; color: white; animation: fall linear infinite; }
          .snow-1 { left: 15%; animation-duration: 6s; animation-delay: 0s; }
          .snow-2 { left: 35%; animation-duration: 5s; animation-delay: 2s; }
          .snow-3 { left: 55%; animation-duration: 7s; animation-delay: 1s; }
          .snow-4 { left: 75%; animation-duration: 5.5s; animation-delay: 3s; }
          .snow-5 { left: 90%; animation-duration: 6.5s; animation-delay: 1.5s; }
        `}</style>
        
        {/* Elementos Decorativos */}
        <div className="absolute inset-0 pointer-events-none">
          <Snowflake className="snow snow-1 w-5 h-5 opacity-70" />
          <Snowflake className="snow snow-2 w-7 h-7 opacity-50" />
          <Snowflake className="snow snow-3 w-6 h-6 opacity-60" />
          <Snowflake className="snow snow-4 w-5 h-5 opacity-80" />
          <Snowflake className="snow snow-5 w-8 h-8 opacity-40" />
          
          <div className="absolute top-6 left-1/4 text-yellow-300 animate-pulse opacity-50"><Star size={24} /></div>
          <div className="absolute top-1/2 right-1/4 text-yellow-300 animate-pulse opacity-40"><Star size={16} /></div>
          <div className="absolute top-1/2 left-10 text-emerald-400 opacity-30 hidden md:block"><TreePine size={40} /></div>
          <div className="absolute bottom-4 right-10 text-red-400 opacity-40 hidden md:block"><Gift size={32} /></div>
        </div>
        
        <div className="max-w-3xl mx-auto px-4 py-8 md:py-12 text-center relative z-10">
          <div className="flex justify-center mb-6 relative">
            <div className="bg-white px-6 py-4 rounded-2xl shadow-2xl inline-flex items-center justify-center border-4 border-red-500 relative ring-4 ring-emerald-600/30">
              {/* Gorrito de Navidad usando SVG */}
              <div className="absolute -top-7 -right-5 z-20 drop-shadow-lg transform rotate-12">
                <svg width="50" height="50" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M52 38C52 38 48 18 32 18C16 18 12 38 12 38" fill="#DC2626"/>
                  <path d="M32 18C40 18 45 28 50 32C52 33.6 54 38 54 38C54 38 48 18 32 18Z" fill="#B91C1C"/>
                  <path d="M8 38H56V46H8V38Z" fill="white"/>
                  <circle cx="32" cy="14" r="8" fill="white"/>
                </svg>
              </div>
              
              <img 
                src="https://i.postimg.cc/g2YW4QPS/logo-PCC.jpg" 
                alt="Logo PCC" 
                className="h-12 md:h-16 object-contain relative z-10"
              />
            </div>
          </div>
          
          <div className="inline-flex items-center justify-center space-x-3 mb-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white drop-shadow-md">Amigo Secreto</h1>
          </div>
          <p className="text-emerald-100 text-sm md:text-base max-w-xl mx-auto drop-shadow px-4">
            Registra tus opciones de regalo o busca las preferencias de la persona que te tocó sorprender.
          </p>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-2xl mx-auto px-4 py-8 w-full flex-grow">
        
        {/* Notificaciones */}
        {notification.show && (
          <div className={`mb-6 p-4 rounded-lg flex items-center shadow-sm ${
            notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 mr-3 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
            )}
            <p className="font-medium text-sm">{notification.message}</p>
          </div>
        )}

        {/* Sistema de Pestañas */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="flex flex-col sm:flex-row border-b border-slate-200 bg-slate-50">
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-4 px-6 text-sm font-semibold flex items-center justify-center transition-colors ${
                activeTab === 'register' 
                  ? 'bg-white text-emerald-700 border-b-2 border-emerald-600' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              <List className="w-4 h-4 mr-2" />
              Mi Lista de Regalos
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`flex-1 py-4 px-6 text-sm font-semibold flex items-center justify-center transition-colors ${
                activeTab === 'search' 
                  ? 'bg-white text-red-600 border-b-2 border-red-600' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Search className="w-4 h-4 mr-2" />
              Buscar Amigo Secreto
            </button>
          </div>

          <div className="p-6 md:p-8">
            
            {/* PESTAÑA 1: REGISTRO */}
            {activeTab === 'register' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start shadow-sm">
                  <AlertCircle className="h-5 w-5 text-amber-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-amber-800 font-bold text-sm mb-1">Presupuesto máximo: 50 soles</h4>
                    <p className="text-xs text-amber-700">Asegúrate de que tus opciones de regalo no superen este monto para mantener la equidad del juego.</p>
                  </div>
                </div>

                <form onSubmit={handleRegisterGifts} className="space-y-6">
                  <div>
                    <label htmlFor="myName" className="block text-sm font-semibold text-slate-700 mb-2 flex items-center">
                      <User className="w-4 h-4 mr-2 text-slate-400" />
                      Tu Nombre Completo
                    </label>
                    <input
                      type="text"
                      id="myName"
                      value={myName}
                      onChange={(e) => setMyName(e.target.value)}
                      placeholder="Ej. Juan Pérez"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50 focus:bg-white transition-all outline-none"
                      required
                    />
                    <p className="text-xs text-slate-500 mt-1.5 ml-1">Usa tu nombre tal como te conocen para que sea fácil encontrarte.</p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center">
                      <Gift className="w-4 h-4 mr-2 text-slate-400" />
                      Tus opciones de regalo (Máximo 3)
                    </label>
                    
                    {[0, 1, 2].map((index) => (
                      <div key={index} className="flex items-center relative">
                        <span className="absolute left-4 text-slate-400 font-bold text-sm">{index + 1}.</span>
                        <input
                          type="text"
                          value={myGifts[index]}
                          onChange={(e) => handleGiftChange(index, e.target.value)}
                          placeholder={`Opción de regalo ${index + 1}`}
                          className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50 focus:bg-white transition-all outline-none"
                          required={index === 0}
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all ${
                      isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg hover:-translate-y-0.5'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Guardar mi lista
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* PESTAÑA 2: BÚSQUEDA */}
            {activeTab === 'search' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <form onSubmit={handleSearch} className="mb-8">
                  <label htmlFor="searchName" className="block text-sm font-semibold text-slate-700 mb-2">
                    ¿A quién te tocó regalar?
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="searchName"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Escribe su nombre..."
                      className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-slate-50 focus:bg-white outline-none transition-all"
                    />
                    <button
                      type="submit"
                      disabled={isSearching}
                      className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors disabled:opacity-70"
                    >
                      {isSearching ? (
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      ) : (
                        "Buscar"
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 ml-1">Busca usando el nombre y apellido si es necesario.</p>
                </form>

                {/* Resultados de Búsqueda */}
                {searchResult === 'NOT_FOUND' && (
                  <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-200 mb-3">
                      <Search className="h-6 w-6 text-slate-500" />
                    </div>
                    <h4 className="text-slate-800 font-bold mb-1">Aún no hay registros</h4>
                    <p className="text-sm text-slate-500 px-4">
                      Parece que <span className="font-semibold">"{searchQuery}"</span> aún no ha guardado sus opciones de regalo, o el nombre está escrito diferente.
                    </p>
                  </div>
                )}

                {searchResult && searchResult !== 'NOT_FOUND' && (
                  <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl p-6 border border-emerald-100 shadow-inner relative overflow-hidden">
                    <div className="absolute -top-3 -right-3">
                      <div className="bg-red-500 text-white p-2 rounded-full shadow-md transform rotate-12">
                        <Gift size={24} />
                      </div>
                    </div>
                    
                    <h3 className="text-slate-600 mb-5 text-sm font-medium">
                      Opciones de regalo para <br/>
                      <span className="text-xl md:text-2xl font-bold text-emerald-800">{searchResult.name}</span>
                    </h3>
                    
                    <ul className="space-y-3">
                      {searchResult.gifts.map((gift, index) => (
                        <li key={index} className="flex items-center bg-white p-3 md:p-4 rounded-lg shadow-sm border border-emerald-50">
                          <span className="flex-shrink-0 h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold mr-4">
                            {index + 1}
                          </span>
                          <span className="text-slate-700 font-medium">{gift}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-slate-200 text-center bg-white">
        <p className="text-xs text-slate-400 font-medium">Amigo Secreto PCC</p>
      </footer>
    </div>
  );
}