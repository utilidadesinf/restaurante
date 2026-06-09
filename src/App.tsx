import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  CheckCircle2, 
  Utensils, 
  Sparkles, 
  Smartphone, 
  ShieldCheck, 
  ChefHat, 
  Plus, 
  Trash2, 
  Search, 
  Eye, 
  CreditCard,
  Layers, 
  RotateCcw,
  Volume2,
  ListFilter,
  TrendingUp,
  X,
  Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Models & Seed Data
import { Mesa, Plato, Cuenta, Pedido, PedidoEstado, MesaEstado, PedidoItem } from './types';
import { INITIAL_PLATOS, INITIAL_MESAS, CATEGORIAS } from './data';

// Custom Components
import CustomerHeader from './components/CustomerHeader';
import ProductCard from './components/ProductCard';
import AdminSidebar from './components/AdminSidebar';
import OrderKitchenCard from './components/OrderKitchenCard';
import MesaGridCard from './components/MesaGridCard';
import DragAndDropZone from './components/DragAndDropZone';

export default function App() {
  // --- DATABASE PERSISTENCE IN LOCALSTORAGE ---
  const [mesas, setMesas] = useState<Mesa[]>(() => {
    const saved = localStorage.getItem('foodclick_mesas');
    return saved ? JSON.parse(saved) : INITIAL_MESAS;
  });

  const [platos, setPlatos] = useState<Plato[]>(() => {
    const saved = localStorage.getItem('foodclick_platos');
    return saved ? JSON.parse(saved) : INITIAL_PLATOS;
  });

  const [pedidos, setPedidos] = useState<Pedido[]>(() => {
    const saved = localStorage.getItem('foodclick_pedidos');
    return saved ? JSON.parse(saved) : [];
  });

  const [cuentas, setCuentas] = useState<Cuenta[]>(() => {
    const saved = localStorage.getItem('foodclick_cuentas');
    if (saved) return JSON.parse(saved);
    
    // Seed initial mock accounts for Table 2 (occupied) to show interactive metrics
    return [
      {
        id: 'c2',
        mesaId: 'm2',
        totalAcumulado: 23.40,
        pagado: false,
        createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
      },
      // Previous mock paid orders for stats
      {
        id: 'cr1',
        mesaId: 'm4',
        totalAcumulado: 45.80,
        pagado: true,
        fechaPago: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
      },
      {
        id: 'cr2',
        mesaId: 'm1',
        totalAcumulado: 72.30,
        pagado: true,
        fechaPago: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
      },
      {
        id: 'cr3',
        mesaId: 'm9',
        totalAcumulado: 18.90,
        pagado: true,
        fechaPago: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString()
      }
    ];
  });

  // Seed sample initial tickets in kitchen to showcase the semaphores beautifully
  useEffect(() => {
    if (pedidos.length === 0) {
      const samplePedidos: Pedido[] = [
        {
          id: 'p1',
          cuentaId: 'c2',
          mesaNumero: 2,
          estadoCocina: 'pendiente',
          horaEnvio: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // > 8 minutes ago! (Yellow status)
          items: [
            { platoId: '4', nombre: 'Philly Salmon Roll', precio: 12.50, cantidad: 1 },
            { platoId: '3', nombre: 'Ebi Tempura Golden', precio: 10.90, cantidad: 1 }
          ]
        },
        {
          id: 'p2',
          cuentaId: 'c2',
          mesaNumero: 2,
          estadoCocina: 'preparando',
          horaEnvio: new Date(Date.now() - 18 * 60 * 1000).toISOString(), // > 16 minutes! (Red critical)
          items: [
            { platoId: '1', nombre: 'Gyozas de Cerdo Crujientes', precio: 7.90, cantidad: 2 }
          ]
        },
        {
          id: 'p3',
          cuentaId: 'c-fake',
          mesaNumero: 8,
          estadoCocina: 'listo', // ready for waiter delivery!
          horaEnvio: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
          items: [
            { platoId: '7', nombre: 'Limonada de Jengibre y Menta', precio: 4.20, cantidad: 1 }
          ]
        }
      ];
      setPedidos(samplePedidos);
      localStorage.setItem('foodclick_pedidos', JSON.stringify(samplePedidos));
    }
  }, []);

  // Save changes to LocalStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('foodclick_mesas', JSON.stringify(mesas));
  }, [mesas]);

  useEffect(() => {
    localStorage.setItem('foodclick_platos', JSON.stringify(platos));
  }, [platos]);

  useEffect(() => {
    localStorage.setItem('foodclick_pedidos', JSON.stringify(pedidos));
  }, [pedidos]);

  useEffect(() => {
    localStorage.setItem('foodclick_cuentas', JSON.stringify(cuentas));
  }, [cuentas]);


  // --- SIMULATION WORKSPACE STATE ---
  const [currentRole, setCurrentRole] = useState<'cliente' | 'cocina' | 'mesero' | 'admin'>('cliente');
  const [simulatedMesaId, setSimulatedMesaId] = useState<string>('m12'); // Tablet simulates Mesa 12 by default
  const activeMesaObj = mesas.find(m => m.id === simulatedMesaId) || mesas[11]; // Mesa 12

  // --- CLIENT ROLE STATE ---
  const [clientTab, setClientTab] = useState<'menu' | 'cuenta'>('menu');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Shopping Cart: Keyed by simulatedMesaId to track independent carts for different tables!
  const [carts, setCarts] = useState<Record<string, { plato: Plato; cantidad: number }[]>>({});
  const clientCart = carts[simulatedMesaId] || [];

  // Active modals
  const [detailedPlato, setDetailedPlato] = useState<Plato | null>(null);
  const [detailQuantity, setDetailQuantity] = useState(1);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'none' | 'processing' | 'form' | 'success'>('none');
  const [paymentMethod, setPaymentMethod] = useState<'tarjeta' | 'bizum' | 'digital'>('tarjeta');
  
  // Payment fields
  const [payCardName, setPayCardName] = useState('');
  const [payCardNum, setPayCardNum] = useState('');
  const [payCardCvv, setPayCardCvv] = useState('');

  // Sfx feedback emulation (nice alerts)
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Trigger brief floating notifications
  const triggerNotification = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 3500);
  };


  // --- ADMIN ROLE STATE ---
  const [adminSection, setAdminSection] = useState<'metrics' | 'crud'>('metrics');
  const [editingPlato, setEditingPlato] = useState<Plato | null>(null);
  const [isPlatoFormOpen, setIsPlatoFormOpen] = useState(false);
  
  // Plato form fields
  const [formPlatoName, setFormPlatoName] = useState('');
  const [formPlatoDesc, setFormPlatoDesc] = useState('');
  const [formPlatoPrice, setFormPlatoPrice] = useState(0);
  const [formPlatoCategory, setFormPlatoCategory] = useState('Entradas');
  const [formPlatoImgUrl, setFormPlatoImgUrl] = useState('');
  const [formPlatoActive, setFormPlatoActive] = useState(true);


  // --- CALCULATION LOGIC ---
  const getMesaCuentaTotal = (mesaId: string) => {
    const activeMesa = mesas.find(m => m.id === mesaId);
    if (!activeMesa || !activeMesa.cuentaActivaId) return 0;
    const cuenta = cuentas.find(c => c.id === activeMesa.cuentaActivaId && !c.pagado);
    return cuenta ? cuenta.totalAcumulado : 0;
  };

  const getDailyRevenue = () => {
    const today = new Date().toDateString();
    return cuentas
      .filter(c => c.pagado && c.fechaPago && new Date(c.fechaPago).toDateString() === today)
      .reduce((sum, c) => sum + c.totalAcumulado, 0);
  };

  const getStarProduct = () => {
    // Collect all purchased items across accounts or kitchen tickets
    const itemCounts: Record<string, { nombre: string; count: number }> = {};
    
    // Scan all pedidos that are completed or active
    pedidos.forEach(p => {
      p.items.forEach(item => {
        if (!itemCounts[item.platoId]) {
          itemCounts[item.platoId] = { nombre: item.nombre, count: 0 };
        }
        itemCounts[item.platoId].count += item.cantidad;
      });
    });

    const itemsArray = Object.values(itemCounts);
    if (itemsArray.length === 0) return 'Ninguno asignado aún';
    itemsArray.sort((a, b) => b.count - a.count);
    return `${itemsArray[0].nombre} (${itemsArray[0].count} uds)`;
  };


  // --- INTERACTION HANDLERS ---

  // -- Client Actions --
  const handleSelectMesa = (mesaId: string) => {
    setSimulatedMesaId(mesaId);
    setClientTab('menu');
    setCheckoutStep('none');
    setIsCartOpen(false);
    triggerNotification(`Simulando Tablet de Mesa ${mesas.find(m => m.id === mesaId)?.numeroMesa}`);
  };

  const handleStartExperience = () => {
    // 1. Move Mesa transition to 'ocupada'
    const updatedMesas = mesas.map(m => {
      if (m.id === simulatedMesaId) {
        const newCuentaId = `c-${Date.now()}`;
        
        // 2. Spawn a new fresh unpaid Cuenta
        const newCuenta: Cuenta = {
          id: newCuentaId,
          mesaId: simulatedMesaId,
          totalAcumulado: 0,
          pagado: false,
          createdAt: new Date().toISOString()
        };
        setCuentas(prev => [newCuenta, ...prev]);

        return { ...m, estado: 'ocupada' as const, cuentaActivaId: newCuentaId };
      }
      return m;
    });
    setMesas(updatedMesas);
    triggerNotification("¡Bienvenido! Por favor elija sus platos de nuestra cocina artesanal.");
  };

  const handleAddToCart = (plato: Plato, customQty: number = 1) => {
    // If table is currently libre, auto start experience
    if (activeMesaObj.estado === 'libre') {
      handleStartExperience();
    }

    setCarts(prev => {
      const currentCart = prev[simulatedMesaId] || [];
      const existsIndex = currentCart.findIndex(item => item.plato.id === plato.id);
      
      let updatedCart;
      if (existsIndex > -1) {
        updatedCart = [...currentCart];
        updatedCart[existsIndex].cantidad += customQty;
      } else {
        updatedCart = [...currentCart, { plato, cantidad: customQty }];
      }
      
      return { ...prev, [simulatedMesaId]: updatedCart };
    });

    triggerNotification(`Agregado: ${plato.nombre} (x${customQty}) al pedido.`);
  };

  const handleRemoveFromCart = (platoId: string) => {
    setCarts(prev => {
      const currentCart = prev[simulatedMesaId] || [];
      const updatedCart = currentCart.filter(item => item.plato.id !== platoId);
      return { ...prev, [simulatedMesaId]: updatedCart };
    });
  };

  const handleUpdateCartQty = (platoId: string, q: number) => {
    if (q <= 0) {
      handleRemoveFromCart(platoId);
      return;
    }
    setCarts(prev => {
      const currentCart = prev[simulatedMesaId] || [];
      const updatedCart = currentCart.map(item => {
        if (item.plato.id === platoId) {
          return { ...item, cantidad: q };
        }
        return item;
      });
      return { ...prev, [simulatedMesaId]: updatedCart };
    });
  };

  const handleSendToKitchen = () => {
    if (clientCart.length === 0) return;
    if (!activeMesaObj.cuentaActivaId) return;

    // Construct the new order record
    const nuevoPedido: Pedido = {
      id: `p-${Date.now()}`,
      cuentaId: activeMesaObj.cuentaActivaId,
      mesaNumero: activeMesaObj.numeroMesa,
      estadoCocina: 'pendiente',
      horaEnvio: new Date().toISOString(),
      items: clientCart.map(item => ({
        platoId: item.plato.id,
        nombre: item.plato.nombre,
        precio: item.plato.precio,
        cantidad: item.cantidad
      }))
    };

    // Append items total to table balance
    const orderCost = clientCart.reduce((sum, item) => sum + (item.plato.price ?? item.plato.precio) * item.cantidad, 0);

    setCuentas(prev => prev.map(c => {
      if (c.id === activeMesaObj.cuentaActivaId) {
        return { ...c, totalAcumulado: c.totalAcumulado + orderCost };
      }
      return c;
    }));

    setPedidos(prev => [nuevoPedido, ...prev]);
    
    // Clear cart for this table
    setCarts(prev => ({ ...prev, [simulatedMesaId]: [] }));
    setIsCartOpen(false);

    triggerNotification("¡Enviado! Su comanda se ha ordenado cronológicamente en la Pantalla de Cocina.");
  };

  const handleInitCheckout = () => {
    setCheckoutStep('form');
  };

  const handleConfirmMockPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMesaObj.cuentaActivaId) return;

    setCheckoutStep('processing');

    // Simulate standard webhook response
    setTimeout(() => {
      // 1. Mark account as paid
      setCuentas(prev => prev.map(c => {
        if (c.id === activeMesaObj.cuentaActivaId) {
          return { ...c, pagado: true, fechaPago: new Date().toISOString() };
        }
        return c;
      }));

      // 2. Change Table status to await_cleaning (esperando_limpieza)
      setMesas(prev => prev.map(m => {
        if (m.id === simulatedMesaId) {
          return { ...m, estado: 'esperando_limpieza' as const };
        }
        return m;
      }));

      setCheckoutStep('success');
      triggerNotification("¡Transacción aceptada por pasarela! Mesa lista para limpieza.");
    }, 2000);
  };

  const handleReturnToWelcomeAfterPayment = () => {
    setCheckoutStep('none');
    setClientTab('menu');
  };


  // -- Kitchen Actions --
  const handleKitchenStartPreparation = (pedidoId: string) => {
    setPedidos(prev => prev.map(p => {
      if (p.id === pedidoId) {
        return { ...p, estadoCocina: 'preparando' as const };
      }
      return p;
    }));
    triggerNotification("Comanda iniciada. Progreso en preparación.");
  };

  const handleKitchenMarkAsReady = (pedidoId: string) => {
    setPedidos(prev => prev.map(p => {
      if (p.id === pedidoId) {
        return { 
          ...p, 
          estadoCocina: 'listo' as const,
          horaCompletado: new Date().toISOString()
        };
      }
      return p;
    }));
    triggerNotification("¡Plato terminado! Notificación enviada de inmediato al mesero.");
  };


  // -- Waiter Actions --
  const handleWaiterLiberarMesa = (mesaId: string) => {
    setMesas(prev => prev.map(m => {
      if (m.id === mesaId) {
        return { ...m, estado: 'libre' as const, cuentaActivaId: undefined };
      }
      return m;
    }));
    triggerNotification("Limpieza terminada. Tablet reseteada a Pantalla de Bienvenida.");
  };

  const handleWaiterSetMesaOcupada = (mesaId: string) => {
    const updatedMesas = mesas.map(m => {
      if (m.id === mesaId) {
        const newCuentaId = `c-${Date.now()}`;
        const newCuenta: Cuenta = {
          id: newCuentaId,
          mesaId,
          totalAcumulado: 0,
          pagado: false,
          createdAt: new Date().toISOString()
        };
        setCuentas(prev => [newCuenta, ...prev]);
        return { ...m, estado: 'ocupada' as const, cuentaActivaId: newCuentaId };
      }
      return m;
    });
    setMesas(updatedMesas);
    triggerNotification("Comensal ubicado en mesa seleccionada.");
  };

  // When waiter delivers finished dishes to client table
  const handleWaiterSimularServido = (mesaNumero: number) => {
    // Select all orders of this table that are 'listo' and flag them 'entregado'
    setPedidos(prev => prev.map(p => {
      if (p.mesaNumero === mesaNumero && p.estadoCocina === 'listo') {
        return { ...p, estadoCocina: 'entregado' as const };
      }
      return p;
    }));
    triggerNotification(`Platos entregados físicamente a Mesa ${mesaNumero}.`);
  };


  // -- Admin CRUD Actions --
  const handleOpenCreatePlato = () => {
    setEditingPlato(null);
    setFormPlatoName('');
    setFormPlatoDesc('');
    setFormPlatoPrice(0);
    setFormPlatoCategory('Entradas');
    setFormPlatoImgUrl('https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=600&q=80');
    setFormPlatoActive(true);
    setIsPlatoFormOpen(true);
  };

  const handleOpenEditPlato = (plato: Plato) => {
    setEditingPlato(plato);
    setFormPlatoName(plato.nombre);
    setFormPlatoDesc(plato.descripcion);
    setFormPlatoPrice(plato.precio);
    setFormPlatoCategory(plato.categoria);
    setFormPlatoImgUrl(plato.imagenUrl);
    setFormPlatoActive(plato.activo);
    setIsPlatoFormOpen(true);
  };

  const handleSavePlatoForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPlatoName.trim() || formPlatoPrice <= 0) {
      alert("Por favor introduzca un nombre de plato válido y precio mayor que cero ($)");
      return;
    }

    if (editingPlato) {
      // Update existing
      setPlatos(prev => prev.map(p => {
        if (p.id === editingPlato.id) {
          return {
            ...p,
            nombre: formPlatoName,
            descripcion: formPlatoDesc,
            precio: Number(formPlatoPrice),
            categoria: formPlatoCategory,
            imagenUrl: formPlatoImgUrl,
            activo: formPlatoActive
          };
        }
        return p;
      }));
      triggerNotification(`Plato "${formPlatoName}" editado con éxito.`);
    } else {
      // Create new
      const nuevoPlato: Plato = {
        id: `plato-${Date.now()}`,
        nombre: formPlatoName,
        descripcion: formPlatoDesc,
        precio: Number(formPlatoPrice),
        categoria: formPlatoCategory,
        imagenUrl: formPlatoImgUrl,
        activo: formPlatoActive
      };
      setPlatos(prev => [...prev, nuevoPlato]);
      triggerNotification(`Nuevo plato "${formPlatoName}" agregado al catálogo.`);
    }

    setIsPlatoFormOpen(false);
  };

  const handleDeletePlato = (id: string, name: string) => {
    if (confirm(`¿Estás seguro de eliminar "${name}" del menú?`)) {
      setPlatos(prev => prev.filter(p => p.id !== id));
      triggerNotification(`Se eliminó "${name}" de la tienda.`);
    }
  };

  const handleTogglePlatoActive = (id: string) => {
    setPlatos(prev => prev.map(p => {
      if (p.id === id) {
        const nextState = !p.activo;
        triggerNotification(`${p.nombre} ahora está ${nextState ? 'Activo' : 'Inactivo'}`);
        return { ...p, activo: nextState };
      }
      return p;
    }));
  };

  // Reset local storage database back to pristine standard seed state
  const handleResetDatabase = () => {
    if (confirm("¿Deseas resetear toda la simulación a los valores iniciales y limpiar el historial financiero?")) {
      localStorage.removeItem('foodclick_mesas');
      localStorage.removeItem('foodclick_platos');
      localStorage.removeItem('foodclick_pedidos');
      localStorage.removeItem('foodclick_cuentas');
      
      setMesas(INITIAL_MESAS);
      setPlatos(INITIAL_PLATOS);
      setPedidos([]);
      setCuentas([
        {
          id: 'c2',
          mesaId: 'm2',
          totalAcumulado: 23.40,
          pagado: false,
          createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
        }
      ]);
      triggerNotification("Base de datos de la simulación reseteada a semillas de fábrica.");
    }
  };


  // Filtered dishes for client menu
  const getFilteredDishes = () => {
    return platos.filter(p => {
      const matchCategory = selectedCategory === 'Todos' || p.categoria === selectedCategory;
      const matchSearch = p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.descripcion.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch && p.activo;
    });
  };

  // Orders that are yet to be fully served on dining table (not marked completed/delivered)
  const activeKitchenOrders = pedidos.filter(p => p.estadoCocina !== 'entregado');


  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between">
      
      {/* 🔮 SUPER PERSISTENT MULTI-ROLE SANDBOX SIMULATOR WORK BAR (FOR ACCESSIBILITY & DEMO) */}
      <div className="bg-slate-900 border-b border-slate-800 text-slate-100 py-3.5 px-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
          
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-custom"></span>
            </span>
            <div className="text-left">
              <h4 className="text-xs font-black tracking-wider text-slate-200">FOODCLICK 2026 • WORKSPACE DE SIMULACIÓN</h4>
              <p className="text-[10px] text-slate-400">Toca los roles a continuación para simular pantallas paralelas en tiempo real.</p>
            </div>
          </div>

          {/* Role selection tab pills */}
          <div className="flex flex-wrap bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              id="sandbox-pill-client"
              onClick={() => setCurrentRole('cliente')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentRole === 'cliente' 
                  ? 'bg-primary-custom text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Tablet Mesa</span>
            </button>

            <button
              id="sandbox-pill-kitchen"
              onClick={() => setCurrentRole('cocina')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all relative flex items-center gap-1.5 ${
                currentRole === 'cocina' 
                  ? 'bg-primary-custom text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>Cocina</span>
              {activeKitchenOrders.filter(p => p.estadoCocina !== 'listo').length > 0 && (
                <span className="bg-[#FFB703] text-slate-900 font-extrabold text-[9px] px-1.5 py-0.2 rounded-full">
                  {activeKitchenOrders.filter(p => p.estadoCocina !== 'listo').length}
                </span>
              )}
            </button>

            <button
              id="sandbox-pill-waiter"
              onClick={() => setCurrentRole('mesero')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all relative flex items-center gap-1.5 ${
                currentRole === 'mesero' 
                  ? 'bg-primary-custom text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Mesero</span>
              {pedidos.filter(p => p.estadoCocina === 'listo').length > 0 && (
                <span className="bg-primary-custom text-white font-extrabold text-[9px] px-1.5 py-0.2 rounded-full animate-bounce">
                  {pedidos.filter(p => p.estadoCocina === 'listo').length}
                </span>
              )}
            </button>

            <button
              id="sandbox-pill-admin"
              onClick={() => {
                setCurrentRole('admin');
                setAdminSection('metrics');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentRole === 'admin' 
                  ? 'bg-primary-custom text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Panel</span>
            </button>
          </div>

          {/* Quick table selector (for client simulation) */}
          {currentRole === 'cliente' && (
            <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-bold pl-2 hidden sm:inline">Simular Mesa:</span>
              <select
                id="select-simulated-table"
                value={simulatedMesaId}
                onChange={(e) => handleSelectMesa(e.target.value)}
                className="bg-transparent text-slate-200 border-none select-none text-xs font-bold font-mono focus:outline-none focus:ring-0 pr-1"
              >
                {mesas.map(m => (
                  <option id={`option-select-table-${m.numeroMesa}`} key={m.id} value={m.id} className="bg-slate-900 text-white">
                    Mesa {m.numeroMesa} — ({m.estado === 'libre' ? 'Disponible' : m.estado === 'ocupada' ? 'Comiendo' : 'Limpieza'})
                  </option>
                ))}
              </select>
            </div>
          )}

        </div>
      </div>

      {/* 🚀 FLOAT BACKEND SIMULATION NOTIFICATIONS BANNER */}
      <AnimatePresence>
        {feedbackMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-18 left-1/2 -translate-x-1/2 z-40 w-full max-w-sm px-4"
          >
            <div className="bg-slate-900 text-slate-100 p-3.5 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-amber-400 shrink-0 animate-bounce" />
              <div className="flex-1 text-xs">
                <p className="font-extrabold tracking-wide uppercase text-[9px] text-primary-custom">Alerta del Sistema</p>
                <p className="text-slate-200 mt-0.5 leading-relaxed font-medium">{feedbackMsg}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* ──────────────────────────────────────────────────────── */}
      {/* RENDER VIEW 1: CLIENT PORTAL (TABLET MESA)               */}
      {/* ─────────────────────────�            {/* SCREEN 1.1: WELCOME SCREEN (MESA EN ESTADO LIBRE) */}
      {currentRole === 'cliente' && (
        <div className="flex-1 flex flex-col w-full">
          <AnimatePresence mode="wait">
            {activeMesaObj.estado === 'libre' ? (
              <motion.div
                key="welcome-client"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto py-16"
              >
                <div className="bg-primary-custom/10 p-6 rounded-full mb-6 relative">
                  <div className="absolute inset-0 bg-primary-custom/15 rounded-full animate-ping" />
                  <Utensils className="w-16 h-16 text-primary-custom" />
                </div>

                <span className="font-mono text-xs text-primary-custom font-bold tracking-widest uppercase mb-1">
                  AUTOPEDIDO INTELIGENTE
                </span>
                
                <h2 className="font-sans font-bold text-3xl text-secondary-custom tracking-tight mb-2">
                  Bienvenido a FoodClick
                </h2>
                
                <p className="text-sm text-slate-550 max-w-xs leading-relaxed mb-8">
                  Pide directamente a cocina, sigue tu preparación y paga integrado con tarjeta sin esperas.
                </p>

                {/* Table identifier badge */}
                <div className="bg-white border border-slate-150/60 shadow-xs px-8 py-4 rounded-xl mb-8">
                  <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-semibold">Estás asignado en:</p>
                  <p className="font-sans font-bold text-2xl text-secondary-custom">MESA {activeMesaObj.numeroMesa}</p>
                </div>

                <button
                  id="btn-client-start-experience"
                  onClick={handleStartExperience}
                  className="px-8 py-3.5 bg-primary-custom hover:opacity-95 active:scale-95 transition-all rounded-xl text-xs font-bold text-white shadow-sm tracking-wider flex items-center gap-2"
                >
                  <Plus className="w-4 h-4 text-white" />
                  <span>TOCA PARA VER EL MENÚ</span>
                </button>
              </motion.div>
            ) : (
              
              /* SCREEN 1.2: MAIN DIGITAL MENU & TABS */
              <div className="flex-1 flex flex-col">
                <CustomerHeader
                  numeroMesa={activeMesaObj.numeroMesa}
                  totalAcumulado={getMesaCuentaTotal(simulatedMesaId)}
                  cartCount={clientCart.reduce((sum, item) => sum + item.cantidad, 0)}
                  onOpenCart={() => setIsCartOpen(true)}
                  activeTab={clientTab}
                  setActiveTab={setClientTab}
                />

                <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 flex-1 w-full flex flex-col">
                  
                  {clientTab === 'menu' ? (
                    <motion.div
                      key="menu-tab-content"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-6 flex-1 flex flex-col"
                    >
                      {/* Search and Category Filters Row */}
                      <div className="flex flex-col md:flex-row justify-between items-stretch gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 select-none">
                        
                        {/* Search Input */}
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Buscar en el menú... (gyozas, sushi, rolls, sake...)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-custom/15 focus:border-primary-custom transition-all"
                          />
                          {searchQuery && (
                            <button 
                              onClick={() => setSearchQuery('')}
                              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* Category filter pills */}
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <button
                            id="category-pill-all"
                            onClick={() => setSelectedCategory('Todos')}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                              selectedCategory === 'Todos'
                                ? 'bg-secondary-custom text-white'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            Todos
                          </button>
                          {CATEGORIAS.map(cat => (
                            <button
                              id={`category-pill-${cat.toLowerCase()}`}
                              key={cat}
                              onClick={() => setSelectedCategory(cat)}
                              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                                selectedCategory === cat
                                  ? 'bg-secondary-custom text-white shadow-sm'
                                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>

                      </div>

                      {/* Menu Grid */}
                      <div className="flex-1">
                        {getFilteredDishes().length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {getFilteredDishes().map(plato => (
                              <ProductCard
                                key={plato.id}
                                plato={plato}
                                onAgregar={(p) => handleAddToCart(p, 1)}
                                onVerDetalle={(p) => {
                                  setDetailedPlato(p);
                                  setDetailQuantity(1);
                                }}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                            <p className="text-slate-400 text-sm font-medium">No se encontraron platos activos que coincidan con la búsqueda.</p>
                            <button 
                              onClick={() => { setSelectedCategory('Todos'); setSearchQuery(''); }}
                              className="mt-3.5 text-xs text-primary-custom font-bold underline"
                            >
                              Ver todos los platos
                            </button>
                          </div>
                        )}
                      </div>

                    </motion.div>
                  ) : (
                    
                    /* VIEW: MI CUENTA / ESTADO DE PLATOS (CLIENT VIEW) */
                    <motion.div
                      key="cuenta-tab-content"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-6 flex-1 max-w-3xl mx-auto w-full"
                    >
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                        
                        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                          <div>
                            <h3 className="font-sans font-bold text-xl text-secondary-custom">Consumo de la Mesa</h3>
                            <p className="text-xs text-slate-400 font-mono">Sesión: {activeMesaObj.cuentaActivaId}</p>
                          </div>
                          
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block tracking-wider uppercase font-mono">Monto Acumulado</span>
                            <span className="font-display font-extrabold text-2xl text-emerald-600">
                              ${getMesaCuentaTotal(simulatedMesaId).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* List of kitchen orders dispatched from this table */}
                        <div className="space-y-4">
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">Platos Ordenados en Cocina:</h4>
                          
                          {pedidos.filter(p => p.cuentaId === activeMesaObj.cuentaActivaId).length === 0 ? (
                            <div className="text-center py-6 bg-slate-50 rounded-xl text-xs text-slate-500 italic">
                              Aún no has enviado platos a la cocina. ¡Agrega tus sushis al carrito y ordénalos!
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {pedidos
                                .filter(p => p.cuentaId === activeMesaObj.cuentaActivaId)
                                .map((ped) => (
                                  <div key={ped.id} className="bg-slate-50 rounded-xl p-4 border border-slate-100 divide-y divide-slate-100/50">
                                    
                                    <div className="flex justify-between items-center pb-2 mb-2">
                                      <span className="text-[10px] font-mono text-slate-400">
                                        Pedido #{ped.id.slice(-6).toUpperCase()} • {new Date(ped.horaEnvio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                      
                                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                        ped.estadoCocina === 'entregado'
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : ped.estadoCocina === 'listo'
                                          ? 'bg-blue-100 text-blue-800 animate-pulse'
                                          : ped.estadoCocina === 'preparando'
                                          ? 'bg-amber-100 text-amber-800'
                                          : 'bg-slate-200 text-slate-700'
                                      }`}>
                                        {ped.estadoCocina === 'entregado' && 'Servido en Mesa'}
                                        {ped.estadoCocina === 'listo' && '¡Listo! Retirar en Barra'}
                                        {ped.estadoCocina === 'preparando' && 'En preparación...'}
                                        {ped.estadoCocina === 'pendiente' && 'Espera en Cola'}
                                      </span>
                                    </div>

                                    <div className="pt-2 space-y-1.5">
                                      {ped.items.map((item, index) => (
                                        <div key={index} className="flex justify-between text-xs font-semibold text-slate-700">
                                          <span>{item.nombre}</span>
                                          <span>x{item.cantidad}</span>
                                        </div>
                                      ))}
                                    </div>

                                  </div>
                                ))}
                            </div>
                          )}
                        </div>

                        {/* Interactive payment drawer trigger */}
                        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                          <p className="text-xs text-slate-400 max-w-sm">
                            Una vez finalizado tu consumo, puedes proceder al pago digital integrado desde esta misma tablet. El mesero recibirá una alerta para despejar la mesa.
                          </p>
                          
                          <button
                            id="btn-trigger-payment"
                            onClick={handleInitCheckout}
                            disabled={getMesaCuentaTotal(simulatedMesaId) === 0}
                            className={`px-6 py-3 rounded-xl text-xs font-bold text-white tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5 uppercase ${
                              getMesaCuentaTotal(simulatedMesaId) === 0
                                ? 'bg-slate-300 cursor-not-allowed shadow-none'
                                : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95'
                            }`}
                          >
                            <CreditCard className="w-4 h-4" />
                            <span>Pagar Cuenta</span>
                          </button>
                        </div>

                      </div>
                    </motion.div>
                  )}

                </div>
              </div>

            )}
            
          </AnimatePresence>

          {/* ──────────────────────────────────────────────────────── */}
          {/* DRAWER COMPONENT: CURRENT SHOPPING CART                  */}
          {/* ──────────────────────────────────────────────────────── */}
          <AnimatePresence>
            {isCartOpen && (
              <div className="fixed inset-0 z-50 overflow-hidden">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={() => setIsCartOpen(false)} />
                
                <div className="absolute inset-y-0 right-0 max-w-full flex">
                  <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                    className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full"
                  >
                    <div className="p-4.5 border-b border-slate-100 flex items-center justify-between bg-secondary-custom text-white">
                      <div>
                        <h3 className="font-sans font-bold text-sm text-white">Bandeja de Selección</h3>
                        <p className="text-[10px] text-white/50 tracking-wide">Por pedir a cocina (Mesa {activeMesaObj.numeroMesa})</p>
                      </div>
                      <button
                        onClick={() => setIsCartOpen(false)}
                        className="p-1 rounded-full text-white/60 hover:text-white transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Split content sections */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-6">
                      
                      {/* Section A: Nuevos elementos por pedir */}
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-slate-450 uppercase tracking-widest font-mono">A. Nuevos Platos por Pedir:</h4>
                        
                        {clientCart.length === 0 ? (
                          <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                            <p className="text-slate-400 text-xs italic">La bandeja de selección está vacía.</p>
                            <button
                              onClick={() => setIsCartOpen(false)}
                              className="mt-2.5 text-xs text-primary-custom font-bold hover:underline"
                            >
                              Elige sushis deliciosos
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {clientCart.map((item) => (
                              <div key={item.plato.id} className="flex gap-3 bg-white border border-slate-100 p-2.5 rounded-xl shadow-xs">
                                <img src={item.plato.imagenUrl} alt={item.plato.nombre} className="w-16 h-12 rounded-lg object-cover bg-slate-50 border border-slate-100" referrerPolicy="no-referrer" />
                                <div className="flex-1 min-w-0">
                                  <h5 className="text-xs font-bold text-slate-800 truncate">{item.plato.nombre}</h5>
                                  <p className="text-xs text-slate-500 font-bold mt-0.5">${(item.plato.price ?? item.plato.precio).toFixed(2)}</p>
                                  
                                  {/* Item steppers */}
                                  <div className="flex items-center gap-2 mt-1.5">
                                    <button
                                      id={`btn-cart-minus-qty-${item.plato.id}`}
                                      onClick={() => handleUpdateCartQty(item.plato.id, item.cantidad - 1)}
                                      className="w-6 h-6 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-md font-bold text-xs border border-slate-200 flex items-center justify-center"
                                    >
                                      -
                                    </button>
                                    <span className="text-xs font-bold font-mono px-1.5">{item.cantidad}</span>
                                    <button
                                      id={`btn-cart-plus-qty-${item.plato.id}`}
                                      onClick={() => handleUpdateCartQty(item.plato.id, item.cantidad + 1)}
                                      className="w-6 h-6 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-md font-bold text-xs border border-slate-200 flex items-center justify-center"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>

                                <button
                                  id={`btn-cart-remove-${item.plato.id}`}
                                  onClick={() => handleRemoveFromCart(item.plato.id)}
                                  className="text-slate-400 hover:text-primary-custom p-1 self-start transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Section B: Tu cuenta actual (already sent status) */}
                      <div className="pt-5 border-t border-slate-100 space-y-3">
                        <h4 className="text-[10px] font-bold text-slate-450 uppercase tracking-widest font-mono">B. Cuenta Abierta en Prep:</h4>
                        
                        <div className="space-y-1.5 text-xs text-slate-500">
                          {pedidos.filter(p => p.cuentaId === activeMesaObj.cuentaActivaId).length === 0 ? (
                            <p className="italic text-[11px] text-slate-400 text-center py-2">Ningún pedido despachado anteriormente.</p>
                          ) : (
                            pedidos
                              .filter(p => p.cuentaId === activeMesaObj.cuentaActivaId)
                              .flatMap(p => p.items)
                              .map((item, idx) => (
                                <div key={idx} className="flex justify-between py-1 border-b border-slate-100/40">
                                  <span>{item.nombre}</span>
                                  <span className="font-bold text-slate-600">x{item.cantidad}</span>
                                </div>
                              ))
                          )}
                        </div>
                      </div>

                    </div>

                    {/* Footer section showing totals and buttons */}
                    <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-505">Consumido en mesa:</span>
                        <span className="font-bold font-mono text-slate-700">${getMesaCuentaTotal(simulatedMesaId).toFixed(2)}</span>
                      </div>
                      
                      {clientCart.length > 0 && (
                        <div className="flex justify-between items-center text-xs font-bold border-b border-slate-205 pb-2">
                          <span className="text-primary-custom">Nuevos ítems por pedir:</span>
                          <span className="text-primary-custom font-mono">
                            +${clientCart.reduce((sum, item) => sum + (item.plato.price ?? item.plato.precio) * item.cantidad, 0).toFixed(2)}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-sm font-bold pt-1">
                        <span>Total Acumulado:</span>
                        <span className="font-sans font-bold text-secondary-custom text-lg">
                          ${(
                            getMesaCuentaTotal(simulatedMesaId) + 
                            clientCart.reduce((sum, item) => sum + (item.plato.price ?? item.plato.precio) * item.cantidad, 0)
                          ).toFixed(2)}
                        </span>
                      </div>

                      <button
                        id="btn-client-dispatch-kitchen"
                        disabled={clientCart.length === 0}
                        onClick={handleSendToKitchen}
                        className={`w-full py-3 rounded-lg text-xs font-bold text-white tracking-wider flex items-center justify-center gap-1.5 uppercase transition-all shadow-xs ${
                          clientCart.length === 0
                            ? 'bg-slate-300 cursor-not-allowed'
                            : 'bg-primary-custom hover:opacity-95 active:scale-95'
                        }`}
                      >
                        <ChefHat className="w-4 h-4 text-white" />
                        <span>Enviar a Cocina</span>
                      </button>
                    </div>

                  </motion.div>
                </div>
              </div>
            )}
          </AnimatePresence>

          {/* ──────────────────────────────────────────────────────── */}
          {/* MODAL DETALLES DE PLATO                                  */}
          {/* ──────────────────────────────────────────────────────── */}
          <AnimatePresence>
            {detailedPlato && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setDetailedPlato(null)} />
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="bg-white rounded-3xl overflow-hidden w-full max-w-xl shadow-2xl relative z-10"
                >
                  <button 
                    onClick={() => setDetailedPlato(null)}
                    className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white rounded-full p-1.5 z-20"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="relative h-60 sm:h-64 bg-slate-50">
                    <img src={detailedPlato.imagenUrl} alt={detailedPlato.nombre} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />
                    <div className="absolute bottom-4 left-5">
                      <span className="bg-primary-custom text-white px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest">{detailedPlato.categoria}</span>
                      <h4 className="font-display font-black text-2xl text-white tracking-tight mt-1">{detailedPlato.nombre}</h4>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-sm text-slate-500 leading-relaxed font-sans">{detailedPlato.descripcion}</p>
                    
                    <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block tracking-wider uppercase font-mono">Precio Unitario</span>
                        <span className="font-sans font-bold text-secondary-custom text-2xl">${detailedPlato.precio.toFixed(2)}</span>
                      </div>

                      {/* Stepper details */}
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 text-xs font-semibold">Cantidad:</span>
                        <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200">
                          <button
                            id="detail-qty-minus"
                            onClick={() => setDetailQuantity(q => Math.max(1, q - 1))}
                            className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center font-bold text-slate-700 text-sm hover:bg-slate-50"
                          >
                            -
                          </button>
                          <span className="px-3.5 flex items-center justify-center font-mono text-xs font-bold text-slate-800">{detailQuantity}</span>
                          <button
                            id="detail-qty-plus"
                            onClick={() => setDetailQuantity(q => q + 1)}
                            className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center font-bold text-slate-700 text-sm hover:bg-slate-50"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 mt-4 leading-normal italic text-center">
                      * El plato se enviará en lote de pedido y aparecerá instantáneamente en la pantalla de cocina.
                    </p>

                    <div className="mt-5 flex gap-3">
                      <button
                        onClick={() => setDetailedPlato(null)}
                        className="flex-1 py-3 text-xs font-bold bg-slate-100 text-slate-700 rounded-2xl hover:bg-slate-200 transition-colors"
                      >
                        Volver
                      </button>
                      <button
                        id="btn-detail-add-action"
                        onClick={() => {
                          handleAddToCart(detailedPlato, detailQuantity);
                          setDetailedPlato(null);
                        }}
                        className="flex-3 py-3 px-6 text-xs font-bold text-white bg-primary-custom hover:opacity-95 active:scale-95 transition-all rounded-2xl shadow-xs uppercase tracking-wider flex justify-center items-center gap-2"
                      >
                        <Plus className="w-4 h-4 text-white" />
                        <span>Agregar x{detailQuantity} (${(detailedPlato.precio * detailQuantity).toFixed(2)})</span>
                      </button>
                    </div>

                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* ──────────────────────────────────────────────────────── */}
          {/* PASARELA MODAL: DIAL DIGITAL PAGO                        */}
          {/* ──────────────────────────────────────────────────────── */}
          <AnimatePresence>
            {checkoutStep !== 'none' && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" />
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-3xl overflow-hidden w-full max-w-md shadow-2xl relative z-10 p-6 space-y-6"
                >
                  
                  {checkoutStep === 'form' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                        <div>
                          <h3 className="font-sans font-bold text-lg text-secondary-custom">Pasarela de Pago Seguro</h3>
                          <p className="text-xs text-slate-400 font-mono">MESA {activeMesaObj.numeroMesa} • FoodClick Pay</p>
                        </div>
                        <button 
                          onClick={() => setCheckoutStep('none')}
                          className="p-1 rounded-full text-slate-400 hover:text-slate-600 bg-slate-50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Payment Methods tabs */}
                      <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('tarjeta')}
                          className={`py-2 text-[10px] font-bold rounded-lg transition-all ${
                            paymentMethod === 'tarjeta'
                              ? 'bg-secondary-custom text-white shadow-sm'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Tarjeta Crédito
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('bizum')}
                          className={`py-2 text-[10px] font-bold rounded-lg transition-all ${
                            paymentMethod === 'bizum'
                              ? 'bg-sky-600 text-white shadow-sm'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Bizum / Móvil
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('digital')}
                          className={`py-2 text-[10px] font-bold rounded-lg transition-all ${
                            paymentMethod === 'digital'
                              ? 'bg-black text-white shadow-sm'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Apple / Google
                        </button>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold text-slate-500">
                          <span>Subtotal Consumo</span>
                          <span>${getMesaCuentaTotal(simulatedMesaId).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs font-semibold text-slate-500">
                          <span>Servicio e IVA (Incluido)</span>
                          <span>$0.00</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-secondary-custom pt-2 border-t border-slate-200">
                          <span>TOTAL A PAGAR</span>
                          <span className="font-display">${getMesaCuentaTotal(simulatedMesaId).toFixed(2)}</span>
                        </div>
                      </div>

                      <form onSubmit={handleConfirmMockPayment} className="space-y-3.5">
                        {paymentMethod === 'tarjeta' ? (
                          <>
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">Titular de la Tarjeta</label>
                              <input
                                required
                                type="text"
                                placeholder="P. Ej: NOMBRE COMPLETO"
                                value={payCardName}
                                onChange={(e) => setPayCardName(e.target.value)}
                                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-secondary-custom"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">Número de Tarjeta</label>
                              <input
                                required
                                type="text"
                                maxLength={16}
                                placeholder="4000 1234 5678 9010"
                                value={payCardNum}
                                onChange={(e) => setPayCardNum(e.target.value)}
                                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-secondary-custom"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">Expiración</label>
                                <input
                                  required
                                  type="text"
                                  placeholder="MM/AA"
                                  maxLength={5}
                                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-secondary-custom"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">CVC / Seguridad</label>
                                <input
                                  required
                                  type="text"
                                  maxLength={3}
                                  placeholder="123"
                                  value={payCardCvv}
                                  onChange={(e) => setPayCardCvv(e.target.value)}
                                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-secondary-custom"
                                />
                              </div>
                            </div>
                          </>
                        ) : paymentMethod === 'bizum' ? (
                          <div className="space-y-3 py-2 text-center">
                            <p className="text-xs text-slate-500 leading-relaxed font-semibold">Introduce tu número de teléfono móvil para enviar notificación a tu App:</p>
                            <input
                              required
                              type="tel"
                              placeholder="+34 600 000 000"
                              className="w-full text-center px-4 py-2 text-sm border-2 border-slate-200 font-mono rounded-xl focus:ring-1 focus:ring-sky-500"
                            />
                          </div>
                        ) : (
                          <div className="py-6 flex flex-col items-center justify-center bg-stone-50 border border-dashed border-stone-200 rounded-xl space-y-2">
                            <Smartphone className="w-9 h-9 text-slate-800 animate-pulse" />
                            <p className="text-xs font-semibold text-slate-800 tracking-wide uppercase">Apple Pay / Google Pay</p>
                            <p className="text-[10px] text-slate-400">Acerque su dispositivo o pulse dos veces para confirmar</p>
                          </div>
                        )}

                        <button
                          id="btn-process-mock-card-pay"
                          type="submit"
                          className="w-full py-3.5 bg-secondary-custom hover:opacity-90 font-bold text-white rounded-xl text-xs tracking-wider uppercase transition-all shadow-xs active:scale-[0.98]"
                        >
                          Confirmar Pago Seguro de ${getMesaCuentaTotal(simulatedMesaId).toFixed(2)}
                        </button>
                      </form>
                    </div>
                  )}

                  {checkoutStep === 'processing' && (
                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto animate-pulse" />
                      <div>
                        <h4 className="font-sans font-bold text-slate-705 text-base">Procesando Transacción con Stripe...</h4>
                        <p className="text-xs text-slate-400 mt-1 leading-normal">Liquidando comanda, asegurando flujos con Banco emisor.</p>
                      </div>
                    </div>
                  )}

                  {checkoutStep === 'success' && (
                    <div className="py-6 flex flex-col items-center justify-center text-center space-y-5">
                      <div className="bg-emerald-50 text-emerald-650 p-4 rounded-full relative">
                        <CheckCircle2 className="w-12 h-12" />
                      </div>
                      
                      <div>
                        <span className="font-mono text-[9px] font-bold text-emerald-600 tracking-widest uppercase">TRANSACCIÓN COMPLETADA</span>
                        <h4 className="font-sans font-bold text-slate-800 text-2xl tracking-tight mt-1 mb-2">¡Muchas Gracias!</h4>
                        <p className="text-xs text-slate-500 max-w-sm leading-relaxed px-2">
                          Tu pago se ha procesado con rotundo éxito. Hemos enviado una alerta en tiempo real al mesero para retirar los platos vacíos y desinfectar la mesa. 
                        </p>
                      </div>

                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 w-full text-xs font-semibold text-slate-500 flex justify-between items-center font-mono">
                        <span>ESTADO MESA:</span>
                        <span className="text-amber-600 uppercase animate-pulse">Esperando Limpieza</span>
                      </div>

                      <button
                        id="btn-checkout-finish-welcome-back"
                        onClick={handleReturnToWelcomeAfterPayment}
                        className="w-full py-3 bg-secondary-custom hover:opacity-90 font-bold text-white rounded-xl text-xs tracking-wider uppercase transition-all shadow-xs"
                      >
                        Volver al Inicio
                      </button>
                    </div>
                  )}

                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </div>
      )}


      {/* ──────────────────────────────────────────────────────── */}
      {/* RENDER VIEW 2: KITCHEN PRODUCTION BOARD (PANTALLA COCINA) */}
      {/* ──────────────────────────────────────────────────────── */}
      {currentRole === 'cocina' && (
        <div className="flex-1 max-w-7xl mx-auto px-4 md:px-6 py-6 w-full flex flex-col space-y-6">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-105">
            <div>
              <div className="flex items-center gap-2">
                <ChefHat className="w-6 h-6 text-primary-custom" />
                <h2 className="font-sans font-bold text-2xl text-secondary-custom tracking-tight">Consola de Producción de Cocina</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-normal">
                Comandas ordenadas cronológicamente. Los pedidos cambian a semáforo de alerta tras <strong className="text-amber-655 font-bold">8 minutos</strong> (retrasados) o <strong className="text-primary-custom font-bold">16 minutos</strong> (críticos).
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-100 shadow-xs text-xs font-semibold text-slate-650">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-green-custom animate-pulse"></span>
              <span className="text-slate-400">Total en preparación:</span>
              <strong className="text-slate-800 font-bold">{pedidos.filter(p => p.estadoCocina === 'pendiente' || p.estadoCocina === 'preparando').length} comandas</strong>
            </div>
          </div>

          {/* Active Orders List */}
          {activeKitchenOrders.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-white border border-dashed border-slate-200 rounded-3xl min-h-[400px]">
              <div className="bg-emerald-50 text-emerald-650 p-5 rounded-full mb-4">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h3 className="font-sans font-bold text-slate-805 text-lg mb-1">¡Cocina al día!</h3>
              <p className="text-sm text-slate-400 max-w-xs leading-normal">
                No hay pedidos pendientes de cocinar en este instante. Las tablets de las mesas se sincronizarán en cuanto los clientes envíen comandas.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
              {activeKitchenOrders.map((pedido) => (
                <OrderKitchenCard
                  key={pedido.id}
                  pedido={pedido}
                  onPreparar={handleKitchenStartPreparation}
                  onMarcarListo={handleKitchenMarkAsReady}
                />
              ))}
            </div>
          )}

        </div>
      )}


      {/* ──────────────────────────────────────────────────────── */}
      {/* RENDER VIEW 3: WAITER BOARD (ESTADO DE MESAS)            */}
      {/* ──────────────────────────────────────────────────────── */}
      {currentRole === 'mesero' && (
        <div className="flex-1 max-w-7xl mx-auto px-4 md:px-6 py-6 w-full flex flex-col space-y-6">
          
          <div className="pb-4 border-b border-slate-105 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-6 h-6 text-secondary-custom" />
                <h2 className="font-sans font-bold text-2xl text-secondary-custom tracking-tight">Monitor del Personal de Sala (Mesero)</h2>
              </div>
              <p className="text-xs text-slate-505 mt-1">
                Visualice el plano general de mesas del restaurante en tiempo real. Responda a alertas de entrega de comida y libere mesas finalizadas tras la limpieza.
              </p>
            </div>

            {/* Quick stats panel */}
            <div className="flex gap-2.5">
              <div className="bg-white p-2 px-3 border border-slate-100 shadow-xs rounded-xl flex flex-col text-[10px] font-bold text-slate-500 uppercase">
                <span>Ocupación</span>
                <span className="text-base text-secondary-custom font-bold">{mesas.filter(m => m.estado === 'ocupada').length} / 12 mesas</span>
              </div>
              <div className="bg-white p-2 px-3 border border-slate-100 shadow-xs rounded-xl flex flex-col text-[10px] font-bold text-slate-500 uppercase">
                <span>Desinfección</span>
                <span className="text-base text-amber-600 font-extrabold animate-pulse">{mesas.filter(m => m.estado === 'esperando_limpieza').length} pendientes</span>
              </div>
            </div>
          </div>

          {/* Tables layout grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {mesas.map((mesa) => {
              // Count how many orders for this table are completed and 'listo' (waiting pick up!)
              const listoOrders = pedidos.filter(p => p.mesaNumero === mesa.numeroMesa && p.estadoCocina === 'listo');
              
              return (
                <MesaGridCard
                  key={mesa.id}
                  mesa={mesa}
                  cuentaTotal={getMesaCuentaTotal(mesa.id)}
                  platosListosCount={listoOrders.length}
                  onLiberar={handleWaiterLiberarMesa}
                  onSetOcupada={handleWaiterSetMesaOcupada}
                  onSimularServido={handleWaiterSimularServido}
                />
              );
            })}
          </div>

        </div>
      )}


      {/* ──────────────────────────────────────────────────────── */}
      {/* RENDER VIEW 4: ADMIN CONTROLLER (KPIs + CRUD)            */}
      {/* ──────────────────────────────────────────────────────── */}
      {currentRole === 'admin' && (
        <div className="flex-1 flex flex-col lg:flex-row bg-[#F8F9FA]">
          
          <AdminSidebar
            activeSection={adminSection}
            setActiveSection={setAdminSection}
            dailyEarnings={getDailyRevenue()}
            ordersCount={pedidos.filter(p => p.estadoCocina === 'entregado').length}
            starProduct={getStarProduct()}
            onExit={() => setCurrentRole('cliente')}
          />

          <main className="flex-1 p-6 space-y-6">
            <AnimatePresence mode="wait">
              
              {/* SUBVIEW 4.1: METRICS & KPIS */}
              {adminSection === 'metrics' && (
                <motion.div
                  key="admin-metrics-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h3 className="font-sans font-bold text-2xl text-secondary-custom tracking-tight">Cuadro de Mando de Operaciones (2026)</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Reportes financieros automatizados y contabilidad express.</p>
                    </div>

                    <button
                      id="btn-admin-reset-data"
                      onClick={handleResetDatabase}
                      className="px-3.5 py-2 hover:bg-slate-100 text-slate-600 bg-white border border-slate-200 transition-all text-xs font-semibold rounded-xl flex items-center gap-1 shadow-sm active:scale-95"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Limpiar Historial / Reset</span>
                    </button>
                  </div>

                  {/* Kpi Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider font-mono">Facturación Diaria (Hoy)</span>
                      <div className="mt-2 flex justify-between items-end">
                        <span className="font-display font-black text-3xl text-emerald-600">${getDailyRevenue().toFixed(2)}</span>
                        <span className="text-[11px] text-emerald-500 font-bold bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                          <TrendingUp className="w-3 h-3" /> +12%
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2">Suma certificada de mesas pagadas hoy.</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider font-mono">Servicios Entregados</span>
                      <div className="mt-2 flex justify-between items-end">
                        <span className="font-display font-black text-3xl text-slate-800">
                          {pedidos.filter(p => p.estadoCocina === 'entregado').length} comandas
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold font-mono">100% éxito</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2">Platos cocinados y entregados en mesa.</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider font-mono">Índice de Ocupación actual</span>
                      <div className="mt-2 flex justify-between items-end">
                        <span className="font-display font-black text-3xl text-blue-800">
                          {Math.round((mesas.filter(m => m.estado === 'ocupada').length / 12) * 100)}%
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold font-mono">{mesas.filter(m => m.estado === 'ocupada').length} de 12</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2">Mesas con comensales activos ahora.</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider font-mono">Plato Estrella Líder</span>
                      <div className="mt-2 text-ellipsis overflow-hidden">
                        <span className="font-sans font-bold text-sm text-primary-custom truncate block">
                          {getStarProduct().split('(')[0]}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold font-mono">
                          {getStarProduct().includes('(') ? `Volumen: (${getStarProduct().split('(')[1]}` : 'Sin ventas registradas'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">El artículo favorito del comensal.</p>
                    </div>

                  </div>

                  {/* Financial Log list */}
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
                    <div>
                      <h4 className="font-display font-black text-slate-800 text-lg">Historial de Transacciones</h4>
                      <p className="text-xs text-slate-400">Auditoría completa de sesiones de cuenta dadas de alta.</p>
                    </div>

                    <div className="overflow-x-auto min-w-full">
                      <table className="min-w-full divide-y divide-slate-150">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Código Cuenta</th>
                            <th className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Mesa</th>
                            <th className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Fecha Apertura</th>
                            <th className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Total Liquidado</th>
                            <th className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Estado Pago</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100 text-xs">
                          {cuentas.map((c) => (
                            <tr key={c.id}>
                              <td className="px-4 py-3 font-mono font-bold text-slate-800">{c.id}</td>
                              <td className="px-4 py-3 font-bold text-slate-700">
                                Mesa {mesas.find(m => m.id === c.mesaId)?.numeroMesa ?? '?'}
                              </td>
                              <td className="px-4 py-3 text-slate-400">
                                {new Date(c.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                              </td>
                              <td className="px-4 py-3 font-bold text-slate-850 font-mono text-emerald-600">${c.totalAcumulado.toFixed(2)}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase ${
                                  c.pagado 
                                    ? 'bg-emerald-100 text-emerald-800' 
                                    : 'bg-amber-100 text-amber-800 animate-pulse'
                                }`}>
                                  {c.pagado ? 'Pagado' : 'Abierto'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </motion.div>
              )}

              {/* SUBVIEW 4.2: GESTIÓN DE CATÁLOGO (CRUD PLATOS) */}
              {adminSection === 'crud' && (
                <motion.div
                  key="admin-crud-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h3 className="font-sans font-bold text-2xl text-secondary-custom tracking-tight">Gestión del Catálogo del Restaurante</h3>
                      <p className="text-xs text-slate-505 mt-0.5">Cree, modifique o inhabilite platillos del menú digital de las mesas.</p>
                    </div>

                    <button
                      id="btn-admin-add-dish"
                      onClick={handleOpenCreatePlato}
                      className="px-4 py-2.5 bg-primary-custom hover:opacity-95 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Plus className="w-4 h-4 text-white" />
                      <span>Agregar Nuevo Plato</span>
                    </button>
                  </div>

                  {/* Plates list table */}
                  <div className="bg-white rounded-3xl border border-slate-105 shadow-sm overflow-hidden p-6 space-y-4">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-secondary-custom/5">
                          <tr>
                            <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-600 tracking-wider uppercase">Plato</th>
                            <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-600 tracking-wider uppercase">Categoría</th>
                            <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-600 tracking-wider uppercase">Precio</th>
                            <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-600 tracking-wider uppercase">Estado en Tablet</th>
                            <th className="px-4 py-3 text-center text-[10px] font-bold text-slate-600 tracking-wider uppercase">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {platos.map((plato) => (
                            <tr key={plato.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-4 py-3.5 flex items-center gap-3">
                                <img src={plato.imagenUrl} alt={plato.nombre} className="w-14 h-11 object-cover rounded-lg border border-slate-150" referrerPolicy="no-referrer" />
                                <div className="max-w-xs md:max-w-md truncate">
                                  <p className="font-bold text-slate-800 text-sm leading-snug">{plato.nombre}</p>
                                  <p className="text-slate-450 text-[11px] line-clamp-1 italic mt-0.5">{plato.descripcion}</p>
                                </div>
                              </td>
                              
                              <td className="px-4 py-3">
                                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase font-mono border border-slate-200">
                                  {plato.categoria}
                                </span>
                              </td>
                              
                              <td className="px-4 py-3 font-mono font-bold text-slate-800 text-sm">
                                ${plato.precio.toFixed(2)}
                              </td>

                              <td className="px-4 py-3">
                                <button
                                  id={`btn-toggle-plato-active-${plato.id}`}
                                  onClick={() => handleTogglePlatoActive(plato.id)}
                                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all tracking-wide ${
                                    plato.activo 
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200' 
                                      : 'bg-rose-100 text-rose-800 border border-rose-200 hover:bg-rose-200'
                                  }`}
                                >
                                  {plato.activo ? '● Activo' : '○ Inactivo'}
                                </button>
                              </td>

                              <td className="px-4 py-3 text-center">
                                <div className="flex justify-center gap-2">
                                  <button
                                    id={`btn-edit-plato-trigger-${plato.id}`}
                                    onClick={() => handleOpenEditPlato(plato)}
                                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-secondary-custom hover:text-white transition-all flex items-center justify-center"
                                    title="Editar Plato"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    id={`btn-delete-plato-trigger-${plato.id}`}
                                    onClick={() => handleDeletePlato(plato.id, plato.nombre)}
                                    className="p-1.5 rounded-lg border border-slate-200 text-primary-custom hover:bg-primary-custom hover:text-white transition-all flex items-center justify-center"
                                    title="Eliminar Plato"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </motion.div>
              )}

            </AnimatePresence>
          </main>


          {/* ──────────────────────────────────────────────────────── */}
          {/* SIDE DESIGN DRAWER: WRITE & UPDATE PLATO (CRUD DIALOG)  */}
          {/* ──────────────────────────────────────────────────────── */}
          <AnimatePresence>
            {isPlatoFormOpen && (
              <div className="fixed inset-0 z-50 overflow-hidden">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsPlatoFormOpen(false)} />
                
                <div className="absolute inset-y-0 right-0 max-w-full flex">
                  <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                    className="w-screen max-w-lg bg-white shadow-2xl flex flex-col h-full"
                  >
                    
                    <div className="p-4 bg-secondary-custom text-white flex justify-between items-center">
                      <div>
                        <h3 className="font-display font-black text-base">
                          {editingPlato ? 'Editar Receta / Plato' : 'Añadir Plato al Menú'}
                        </h3>
                        <p className="text-[10px] text-white/75 font-mono">Modificados se muestran al segundo en la tablet.</p>
                      </div>
                      <button onClick={() => setIsPlatoFormOpen(false)} className="p-1 rounded-full text-white/50 hover:text-white">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleSavePlatoForm} className="flex-1 overflow-y-auto p-5 space-y-4">
                      
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">Nombre del Plato</label>
                        <input
                          required
                          type="text"
                          placeholder="P. Ej: California Roll Premium"
                          value={formPlatoName}
                          onChange={(e) => setFormPlatoName(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary-custom"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">Precio ($)</label>
                          <input
                            required
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="12.50"
                            value={formPlatoPrice || ''}
                            onChange={(e) => setFormPlatoPrice(Number(e.target.value))}
                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary-custom"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">Categoría</label>
                          <select
                            value={formPlatoCategory}
                            onChange={(e) => setFormPlatoCategory(e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary-custom bg-white text-slate-700"
                          >
                            {CATEGORIAS.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">Descripción Detallada</label>
                        <textarea
                          rows={3}
                          placeholder="Escriba los ingredientes, preparación rápida, aderezos especiales p. ej: aguacate, salmón fresco noruego..."
                          value={formPlatoDesc}
                          onChange={(e) => setFormPlatoDesc(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-primary-custom"
                        />
                      </div>

                      <DragAndDropZone
                        onImageSelected={(url) => setFormPlatoImgUrl(url)}
                        currentUrl={formPlatoImgUrl}
                      />

                      <div className="flex items-center gap-2 py-2">
                        <input
                          id="input-crud-active-check"
                          type="checkbox"
                          checked={formPlatoActive}
                          onChange={(e) => setFormPlatoActive(e.target.checked)}
                          className="w-4 h-4 text-primary-custom border-slate-200 rounded focus:ring-primary-custom"
                        />
                        <label htmlFor="input-crud-active-check" className="text-xs font-bold text-slate-705 cursor-pointer">
                          Habilitar plato inmediatamente en la carta digital de las tablets
                        </label>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex gap-2">
                        <button
                          type="button"
                          onClick={() => setIsPlatoFormOpen(false)}
                          className="flex-1 py-2.5 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl"
                        >
                          Cancelar
                        </button>
                        <button
                          id="btn-admin-submit-dish"
                          type="submit"
                          className="flex-2 py-2.5 bg-primary-custom hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-xs uppercase tracking-wider"
                        >
                          {editingPlato ? 'Guardar Cambios' : 'Añadir al Menú'}
                        </button>
                      </div>

                    </form>

                  </motion.div>
                </div>
              </div>
            )}
          </AnimatePresence>

        </div>
      )}


      {/* ──────────────────────────────────────────────────────── */}
      {/* PROFESSIONAL COMPACT STATIC FOOTER                       */}
      {/* ──────────────────────────────────────────────────────── */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-500 py-4 px-4 text-center select-none">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] font-sans">
          <p className="tracking-wide">
            © 2026 FoodClick Inc. Todos los derechos reservados. Sistema Integral de Autoservicios en Mesa.
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-slate-400 font-bold font-mono">Simulación Centralizada Activa</span>
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
