import React, { useState } from 'react';
import { db } from './firebase'; 
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
import { Gift, Search, PlusCircle, CheckCircle2, AlertCircle, Snowflake } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('register');
  
  const [myName, setMyName] = useState('');
  const [myGifts, setMyGifts] = useState(['', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
  };

  const normalizeName = (str) => {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  };

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
      const docRef = doc(db, 'artifacts', "pcc", 'public', 'data', 'regalos', documentId);
      
      await setDoc(docRef, {
        name: myName.trim(),
        gifts: validGifts,
        updatedAt: new Date().toISOString()
      });
      
      showNotification("¡Tus opciones de regalo se han guardado exitosamente!");
      
      setMyName('');
      setMyGifts(['', '', '']);
    } catch (error) {
      console.error("Error guardando regalos:", error);
      showNotification("Hubo un error al guardar tu lista. Intenta nuevamente.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      showNotification("Por favor, ingresa un nombre para buscar.", "error");
      return;
    }

    setIsSearching(true);
    setSearchResult(null);

    try {
      const queryTerm = normalizeName(searchQuery);
      const regalosRef = collection(db, 'artifacts', "pcc", 'public', 'data', 'regalos');
      const querySnapshot = await getDocs(regalosRef);

      let foundParticipants = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const dbName = normalizeName(data.name);

        if (dbName.includes(queryTerm) || queryTerm.includes(dbName)) {
          foundParticipants.push(data);
        }
      });

      if (foundParticipants.length === 1) {
        setSearchResult(foundParticipants[0]);
      } else if (foundParticipants.length > 1) {
        setSearchResult(foundParticipants);
      } else {
        setSearchResult('NOT_FOUND');
        showNotification('No se encontró a nadie con ese nombre.', 'error');
      }
    } catch (error) {
      console.error("Error buscando: ", error);
      showNotification('Hubo un error al buscar en la base de datos.', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const updateGift = (index, value) => {
    const newGifts = [...myGifts];
    newGifts[index] = value;
    setMyGifts(newGifts);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col relative overflow-hidden">
      {/* Estilos para Nieve y Luces */}
      <style dangerouslySetInnerHTML={{__html: `
        .snowflake {
          color: #fff;
          font-size: 1.2em;
          font-family: Arial, sans-serif;
          text-shadow: 0 0 5px #000;
          position: absolute;
          top: -10%;
          z-index: 1;
          user-select: none;
          cursor: default;
          animation-name: snowflakes-fall, snowflakes-shake;
          animation-duration: 10s, 3s;
          animation-timing-function: linear, ease-in-out;
          animation-iteration-count: infinite, infinite;
          animation-play-state: running, running;
        }
        @keyframes snowflakes-fall{0%{top:-10%}100%{top:100%}}
        @keyframes snowflakes-shake{0%,100%{transform:translateX(0)}50%{transform:translateX(80px)}}
        .snowflake:nth-of-type(0){left:1%;animation-delay:0s,0s}
        .snowflake:nth-of-type(1){left:10%;animation-delay:1s,1s}
        .snowflake:nth-of-type(2){left:20%;animation-delay:6s,.5s}
        .snowflake:nth-of-type(3){left:30%;animation-delay:4s,2s}
        .snowflake:nth-of-type(4){left:40%;animation-delay:2s,2s}
        .snowflake:nth-of-type(5){left:50%;animation-delay:8s,3s}
        .snowflake:nth-of-type(6){left:60%;animation-delay:6s,2s}
        .snowflake:nth-of-type(7){left:70%;animation-delay:2.5s,1s}
        .snowflake:nth-of-type(8){left:80%;animation-delay:1s,0s}
        .snowflake:nth-of-type(9){left:90%;animation-delay:3s,1.5s}
        
        .twinkle {
          animation: twinkle 1.5s infinite alternate;
        }
        @keyframes twinkle {
          0% { opacity: 0.6; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1.1); text-shadow: 0 0 15px #FFD700; }
        }
      `}} />

      {/* Notificación Flotante */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 transform transition-all duration-300 ${
          notification.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
        }`}>
          {notification.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* Cabecera Navideña Centrada */}
      <header className="bg-emerald-800 border-b-4 border-red-700 py-10 px-4 shadow-lg relative z-10 overflow-hidden">
        <div className="snowflakes" aria-hidden="true">
          <div className="snowflake">❅</div><div className="snowflake">❆</div><div className="snowflake">❅</div>
          <div className="snowflake">❆</div><div className="snowflake">❅</div><div className="snowflake">❆</div>
          <div className="snowflake">❅</div><div className="snowflake">❆</div><div className="snowflake">❅</div>
        </div>

        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center gap-6 relative z-10">
          
          <div className="bg-white p-4 rounded-2xl shadow-2xl relative group transform hover:scale-105 transition-transform duration-300">
            <div className="absolute -top-7 -left-5 text-6xl transform -rotate-12 drop-shadow-md z-20 hover:rotate-0 transition-transform cursor-default">
              🎅
            </div>
            <img 
              src="/logo-pcc-navidad-rect.png" 
              alt="Logo PCC Navideño" 
              className="h-20 sm:h-24 object-contain relative z-10 rounded-xl"
            />
          </div>
          
          <div className="text-center text-white">
            <div className="flex justify-center items-center gap-3 text-2xl mb-1 twinkle">
              ✨ 🎄 ✨
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold flex items-center justify-center gap-3 drop-shadow-lg mb-3">
              <Gift className="w-8 h-8 text-red-400" />
              Amigo Secreto 2026
              <Snowflake className="w-8 h-8 text-blue-200 animate-spin-slow" />
            </h1>
            <span className="text-emerald-50 mt-2 font-semibold bg-black/20 backdrop-blur-sm inline-block px-5 py-2 rounded-full border border-emerald-600/50 shadow-inner">
              Presupuesto: S/ 70.00
            </span>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-grow max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 relative z-10 -mt-6">
        
        {/* Navegación por Pestañas */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-full p-1.5 shadow-lg border border-slate-200 inline-flex">
            <button
              onClick={() => setActiveTab('register')}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'register' 
                  ? 'bg-emerald-700 text-white shadow-md' 
                  : 'text-slate-500 hover:text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              Mi Lista de Regalos
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'search' 
                  ? 'bg-red-700 text-white shadow-md' 
                  : 'text-slate-500 hover:text-red-700 hover:bg-red-50'
              }`}
            >
              <Search className="w-4 h-4" />
              Buscar a mi Amigo
            </button>
          </div>
        </div>

        {/* Pestaña: Registro de Regalos */}
        {activeTab === 'register' && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800">Registra tus Opciones</h2>
              <p className="text-slate-500 mt-2">¿Qué te gustaría recibir este año? Escribe hasta 3 opciones.</p>
            </div>

            <form onSubmit={handleRegisterGifts} className="space-y-6">
              <div>
                <label htmlFor="myName" className="block text-sm font-bold text-slate-700 mb-2">
                  Tu Nombre Completo
                </label>
                <input
                  type="text"
                  id="myName"
                  value={myName}
                  onChange={(e) => setMyName(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:ring-0 focus:border-emerald-500 transition-colors bg-slate-50"
                  required
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Opciones de Regalo
                </label>
                
                {[0, 1, 2].map((index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      value={myGifts[index]}
                      onChange={(e) => updateGift(index, e.target.value)}
                      placeholder={`Opción de regalo`}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:ring-0 focus:border-emerald-500 transition-colors"
                      required={index === 0}
                    />
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-4 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-6 text-lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Gift className="w-6 h-6" />
                    Guardar mis regalos
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Pestaña: Búsqueda de Amigo Secreto */}
        {activeTab === 'search' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8 mb-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Encuentra a tu Amigo Secreto</h2>
                <p className="text-slate-500 mt-2">Busca a la persona que te tocó en el sorteo para ver qué regalos desea.</p>
              </div>

              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Escribe su nombre o apellido..."
                    className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-slate-200 focus:ring-0 focus:border-red-500 transition-colors bg-slate-50 text-lg"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="bg-red-700 hover:bg-red-800 text-white font-bold py-4 px-8 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-70 flex-shrink-0 text-lg"
                >
                  {isSearching ? 'Buscando...' : 'Buscar'}
                </button>
              </form>
            </div>

            {/* Resultados de Búsqueda */}
            {searchResult && searchResult !== 'NOT_FOUND' && (
              <div className="bg-white rounded-2xl shadow-xl border-t-4 border-red-700 p-6 sm:p-8 transform transition-all animate-in fade-in slide-in-from-bottom-4">
                
                {Array.isArray(searchResult) ? (
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Search className="w-5 h-5 text-emerald-600" />
                      Se encontraron {searchResult.length} personas:
                    </h3>
                    <p className="text-slate-500 text-sm mb-4">Selecciona a tu amigo secreto de la lista para ver sus regalos.</p>
                    <div className="space-y-3">
                      {searchResult.map((person, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSearchResult(person)}
                          className="w-full text-left bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 p-4 rounded-xl transition-colors flex justify-between items-center group"
                        >
                          <span className="font-bold text-slate-700 group-hover:text-emerald-700">{person.name}</span>
                          <span className="text-emerald-600 text-sm font-bold bg-emerald-100 px-3 py-1 rounded-full group-hover:bg-emerald-200 transition-colors">
                            Ver lista &rarr;
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                      <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 shadow-inner">
                        <Gift className="w-7 h-7 text-red-700" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-800">Lista de {searchResult.name}</h3>
                        <p className="text-sm text-slate-500 mt-1 font-medium">
                          Actualizado el {new Date(searchResult.updatedAt || new Date()).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {searchResult.gifts.map((gift, index) => (
                        <div key={index} className="flex gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white shadow-sm text-emerald-700 flex items-center justify-center font-bold text-lg border border-emerald-100">
                            {index + 1}
                          </div>
                          <p className="text-slate-700 font-medium text-lg">{gift}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-8 pt-4 text-center">
                      <button 
                        onClick={() => {
                          setSearchQuery('');
                          setSearchResult(null);
                        }}
                        className="text-slate-500 hover:text-emerald-700 font-bold transition-colors underline decoration-2 underline-offset-4"
                      >
                        Limpiar búsqueda y volver
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-slate-800 text-slate-400 py-6 text-center text-sm relative z-10 mt-auto">
        <p>© 2026 Proyectos, Construcción & Comisionamiento.</p>
        <p className="mt-1">El regalo perfecto es el que se da con cariño. ¡Felices fiestas!</p>
      </footer>
    </div>
  );
}