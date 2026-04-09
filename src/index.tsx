import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { supabase } from './supabaseClient';
import LandingPage from './LandingPage';
import './index.css';

// --- TYPY ---
interface Product { id: string; name: string; price: number; vatRate: number; }
interface CartItem { productId: string; productName: string; price: number; quantity: number; vatRate: number; }
interface Transaction { id: string; timestamp: string; items: CartItem[]; total: number; paymentMethod: 'cash' | 'card'; discountPercent: number; }

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'landing' | 'login' | 'signup'>('landing');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-indigo-600 animate-pulse uppercase tracking-widest text-xs">Načítám pokladnu...</div>;
  if (session) return <SalesTrackerApp user={session.user} />;

  if (view === 'landing') {
    return <LandingPage onLogin={() => setView('login')} onRegister={() => setView('signup')} />;
  }

  return (
    <div className="relative">
      <button onClick={() => setView('landing')} className="absolute top-6 left-6 text-[10px] font-black uppercase opacity-30 hover:opacity-100 z-50 transition-all">← Zpět na web</button>
      <AuthScreen initialRegister={view === 'signup'} />
    </div>
  );
}

// --- AUTH SCREEN ---
function AuthScreen({ initialRegister }: { initialRegister: boolean }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gdprAgreed, setGdprAgreed] = useState(false);
  const [isRegistering, setIsRegistering] = useState(initialRegister);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegistering) {
      if (!gdprAgreed) return alert("Musíte souhlasit se zpracováním údajů.");
      const { error } = await supabase.auth.signUp({
        email, password, options: { data: { first_name: firstName, last_name: lastName } }
      });
      if (error) alert(error.message);
      else alert("Registrace odeslána! Potvrďte ji v e-mailu.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert("Chyba: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-0 sm:p-4 font-sans">
      <div className="bg-white p-8 sm:p-12 w-full sm:max-w-md min-h-screen sm:min-h-0 sm:rounded-[3rem] shadow-2xl flex flex-col justify-center animate-in fade-in zoom-in-95 duration-500 text-center">
        <h2 className="text-2xl font-black text-indigo-600 tracking-[0.2em] uppercase mb-8">Sales Tracker</h2>
        <form onSubmit={handleAuth} className="space-y-4 text-left">
          {isRegistering && (
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="JMÉNO" className="p-4 bg-slate-50 rounded-2xl border text-xs font-bold outline-none" value={firstName} onChange={e => setFirstName(e.target.value)} required />
              <input type="text" placeholder="PŘÍJMENÍ" className="p-4 bg-slate-50 rounded-2xl border text-xs font-bold outline-none" value={lastName} onChange={e => setLastName(e.target.value)} required />
            </div>
          )}
          <input type="email" placeholder="E-MAIL" className="w-full p-4 bg-slate-50 rounded-2xl border text-xs font-bold outline-none" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="HESLO" className="w-full p-4 bg-slate-50 rounded-2xl border text-xs font-bold outline-none" value={password} onChange={e => setPassword(e.target.value)} required />
          {isRegistering && (
            <div className="flex items-start gap-3 p-2">
              <input type="checkbox" id="gdpr" checked={gdprAgreed} onChange={e => setGdprAgreed(e.target.checked)} className="mt-1 accent-indigo-600" />
              <label htmlFor="gdpr" className="text-[10px] font-bold text-slate-400 leading-tight uppercase">Souhlasím se zpracováním údajů.</label>
            </div>
          )}
          <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black tracking-widest text-xs uppercase shadow-xl active:scale-95 transition-all mt-2">
            {isRegistering ? 'Zaregistrovat se' : 'Vstoupit do pokladny'}
          </button>
        </form>
        <button onClick={() => setIsRegistering(!isRegistering)} className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
          {isRegistering ? 'Už máte účet? Přihlaste se' : 'Nemáte účet? Registrace'}
        </button>
      </div>
    </div>
  );
}

// --- SAMOTNÁ POKLADNA ---
function SalesTrackerApp({ user }: { user: any }) {
  const [isVatPayer, setIsVatPayer] = useState<boolean>(() => {
    const saved = localStorage.getItem(`pos_isVatPayer_${user.id}`);
    return saved ? JSON.parse(saved) : false;
  });
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(`pos_products_${user.id}`);
    return saved ? JSON.parse(saved) : [{ id: '1', name: 'KAFE', price: 60, vatRate: 12 }];
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(`pos_transactions_${user.id}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [currentCart, setCurrentCart] = useState<Record<string, number>>({});
  const [discount, setDiscount] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showProductManager, setShowProductManager] = useState(false);
  const [historyDate, setHistoryDate] = useState(new Date().toISOString().split('T')[0]);

  // STAVY PRO ÚPRAVU PRODUKTU
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formVat, setFormVat] = useState('21');

  useEffect(() => { localStorage.setItem(`pos_isVatPayer_${user.id}`, JSON.stringify(isVatPayer)); }, [isVatPayer, user.id]);
  useEffect(() => { localStorage.setItem(`pos_products_${user.id}`, JSON.stringify(products)); }, [products, user.id]);
  useEffect(() => { localStorage.setItem(`pos_transactions_${user.id}`, JSON.stringify(transactions)); }, [transactions, user.id]);

  const addToCart = (id: string) => setCurrentCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  const removeFromCart = (id: string) => {
    setCurrentCart(prev => {
      const newCart = { ...prev };
      if (newCart[id] > 1) newCart[id] -= 1; else delete newCart[id];
      return newCart;
    });
  };

  const cartItems = Object.entries(currentCart).map(([id, quantity]) => {
    const product = products.find(p => p.id === id)!;
    return { productId: id, productName: product.name, price: product.price, quantity, vatRate: product.vatRate || 0 };
  });

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = Math.round(subtotal * (discount / 100));
  const cartTotal = subtotal - discountAmount;

  const markAsPaid = (method: 'cash' | 'card') => {
    if (cartItems.length === 0) return;
    setTransactions(prev => [...prev, {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      items: [...cartItems],
      total: cartTotal,
      paymentMethod: method,
      discountPercent: discount
    }]);
    setCurrentCart({});
    setDiscount(0);
  };

  const getDailyStats = (dateStr: string) => {
    const txs = transactions.filter(t => t.timestamp.startsWith(dateStr));
    const cash = txs.filter(t => t.paymentMethod === 'cash').reduce((s, t) => s + t.total, 0);
    const card = txs.filter(t => t.paymentMethod === 'card').reduce((s, t) => s + t.total, 0);
    return { cash, card, total: cash + card };
  };

  const exportToCSV = (date: string) => {
    const filtered = transactions.filter(t => t.timestamp.startsWith(date));
    if (filtered.length === 0) return alert('Žádná data pro tento den.');

    let csv = `\uFEFFDatum;Čas;Produkt;${isVatPayer ? 'Sazba DPH;' : ''}Množství;Celkem;Metoda\n`;
    const vatTotals: Record<number, { base: number, vat: number, total: number }> = { 0: { base: 0, vat: 0, total: 0 }, 12: { base: 0, vat: 0, total: 0 }, 21: { base: 0, vat: 0, total: 0 } };

    filtered.forEach(t => {
      const time = new Date(t.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      const discountFactor = 1 - (t.discountPercent / 100);
      const methodStr = t.paymentMethod === 'cash' ? 'Hotově' : 'Kartou';
      t.items.forEach(i => {
        const itemTotal = i.price * i.quantity * discountFactor;
        const rate = i.vatRate || 0;
        const base = itemTotal / (1 + rate / 100);
        vatTotals[rate].base += base; vatTotals[rate].vat += (itemTotal - base); vatTotals[rate].total += itemTotal;
        csv += `${date};${time};${i.productName};`;
        if (isVatPayer) csv += `${rate}%;`;
        csv += `${i.quantity};${itemTotal.toFixed(2)};${methodStr}\n`;
      });
    });

    if (isVatPayer) {
      csv += "\nREKAPITULACE DPH\nSazba;Základ;DPH;Celkem\n";
      [0, 12, 21].forEach(r => { if(vatTotals[r].total > 0) csv += `${r}%;${vatTotals[r].base.toFixed(2)};${vatTotals[r].vat.toFixed(2)};${vatTotals[r].total.toFixed(2)}\n`; });
    }
    const s = getDailyStats(date);
    csv += `\nCELKOVÉ SHRNUTÍ\nCelkem Hotově:;${s.cash.toFixed(2)} Kč\nCelkem Kartou:;${s.card.toFixed(2)} Kč\nCELKOVÁ TRŽBA:;${s.total.toFixed(2)} Kč\n`;
    
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    link.download = `report_${date}.csv`;
    link.click();
  };

  // FUNKCE PRO UKLÁDÁNÍ / UPRAVOVÁNÍ PRODUKTU
  const handleProductSubmit = () => {
    if (!formName || !formPrice) return;

    if (editingId) {
      // AKTUALIZACE
      setProducts(products.map(p => 
        p.id === editingId ? { ...p, name: formName.toUpperCase(), price: Number(formPrice), vatRate: Number(formVat) } : p
      ));
      setEditingId(null);
    } else {
      // PŘIDÁNÍ NOVÉHO
      setProducts([...products, { id: Date.now().toString(), name: formName.toUpperCase(), price: Number(formPrice), vatRate: Number(formVat) }]);
    }
    
    setFormName('');
    setFormPrice('');
  };

  const startEditing = (p: Product) => {
    setEditingId(p.id);
    setFormName(p.name);
    setFormPrice(p.price.toString());
    setFormVat(p.vatRate.toString());
  };

  const today = getDailyStats(new Date().toISOString().split('T')[0]);
  const stats = getDailyStats(historyDate);
  const firstName = user.user_metadata?.first_name || 'Uživatel';
  const todayDateFormatted = new Date().toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center p-0 sm:p-4 font-sans text-slate-800">
      <div className="w-full max-w-4xl bg-white shadow-2xl min-h-screen sm:min-h-0 sm:rounded-[2.5rem] overflow-hidden flex flex-col relative">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 sm:p-12 text-center relative text-white z-10">
          <button onClick={() => setShowProductManager(true)} className="absolute left-6 top-9 sm:top-12 z-30 opacity-70 hover:opacity-100 text-2xl transition-transform hover:rotate-90 p-2">⚙️</button>
          <button onClick={() => setShowHistory(true)} className="absolute right-6 top-9 sm:top-12 z-30 bg-white/20 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/30 p-2">Archiv</button>
          <h1 className="text-xl font-black tracking-widest uppercase mb-2">Vítej, {firstName}</h1>
          <div className="flex flex-col items-center opacity-90">
             <span className="text-[10px] font-bold uppercase tracking-widest">{todayDateFormatted}</span>
             <span className="text-[12px] font-black bg-white/20 px-6 py-2 rounded-full mt-3 tracking-tighter shadow-sm uppercase">Tržba dnes: {today.total} Kč</span>
          </div>
        </div>

        {/* KOŠÍK */}
        <div className="p-6 border-b bg-slate-50/50">
          {cartItems.length > 0 ? (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="max-h-40 overflow-y-auto space-y-2 pr-2 text-left">
                {cartItems.map(item => (
                  <div key={item.productId} className="flex justify-between items-center text-sm font-bold">
                    <div className="flex items-center gap-3">
                      <button onClick={() => removeFromCart(item.productId)} className="w-8 h-8 rounded-full bg-white border shadow-sm flex items-center justify-center">-</button>
                      <span>{item.quantity}x {item.productName}</span>
                    </div>
                    <span>{item.price * item.quantity} Kč</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sleva</span>
                  {discount > 0 && <span className="text-xs font-bold text-rose-500">-{discountAmount} Kč</span>}
                </div>
                <div className="flex gap-2">
                  {[0, 5, 10, 20].map(val => (
                    <button key={val} onClick={() => setDiscount(val)} className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${discount === val ? 'bg-purple-600 text-white shadow-md' : 'bg-white border text-slate-400'}`}>{val}%</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <button onClick={() => markAsPaid('cash')} className="bg-emerald-500 text-white py-5 rounded-2xl font-black text-xs uppercase shadow-lg active:scale-95 transition-all">Hotově ({cartTotal})</button>
                <button onClick={() => markAsPaid('card')} className="bg-indigo-500 text-white py-5 rounded-2xl font-black text-xs uppercase shadow-lg active:scale-95 transition-all">Kartou ({cartTotal})</button>
              </div>
            </div>
          ) : <div className="text-center text-slate-300 font-black text-[10px] uppercase py-8 tracking-widest opacity-40">🛒 Pokladna je připravena k prodeji</div>}
        </div>

        {/* PRODUKTY */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 content-start bg-slate-50/30">
          {products.map(p => (
            <button key={p.id} onClick={() => addToCart(p.id)} className="relative p-6 bg-white rounded-[2rem] border-2 border-transparent hover:border-purple-200 active:scale-95 transition-all flex flex-col items-center justify-center text-center shadow-sm">
              <span className="text-slate-700 font-black tracking-tight text-sm uppercase">{p.name}</span>
              <span className="text-slate-400 text-[10px] font-bold">{p.price} Kč</span>
              {currentCart[p.id] > 0 && (
                <div className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] font-black w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-bounce">
                  {currentCart[p.id]}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* PATIČKA */}
        <div className="p-6 bg-white border-t sticky bottom-0 z-20">
          <div className="max-w-2xl mx-auto">
             <button onClick={() => setShowReport(true)} className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black tracking-widest text-xs uppercase shadow-xl transition-all active:scale-95">Rychlá uzávěrka dne</button>
          </div>
        </div>

        {/* --- MODÁLY --- */}

        {/* UZÁVĚRKA */}
        {showReport && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 z-[60] animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-300">
              <h2 className="text-center font-black text-lg tracking-widest text-purple-600 uppercase">Dnešní přehled</h2>
              <div className="space-y-3 font-black uppercase text-[10px]">
                <div className="flex justify-between p-5 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-600 shadow-sm text-left"><span className="tracking-widest">Hotově</span><span className="text-sm font-black">{today.cash} Kč</span></div>
                <div className="flex justify-between p-5 bg-indigo-50 rounded-2xl border border-indigo-100 text-indigo-600 shadow-sm text-left"><span className="tracking-widest">Kartou</span><span className="text-sm font-black">{today.card} Kč</span></div>
                <div className="flex justify-between p-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[1.8rem] text-white shadow-xl mt-4 text-left"><span className="self-center tracking-[0.2em] font-bold">Celkem</span><span className="text-xl font-black">{today.total} Kč</span></div>
              </div>
              <button onClick={() => setShowReport(false)} className="w-full py-5 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Zavřít</button>
            </div>
          </div>
        )}

        {/* ARCHIV */}
        {showHistory && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-0 sm:p-6 z-[60] animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg h-full sm:h-auto sm:max-h-[90%] sm:rounded-[3rem] p-8 flex flex-col animate-in slide-in-from-bottom-8 duration-500 shadow-2xl">
              <h2 className="font-black text-center mb-6 tracking-[0.2em] uppercase text-slate-800">Historie tržeb</h2>
              <input type="date" value={historyDate} onChange={e => setHistoryDate(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl mb-6 font-bold text-center border-2 border-slate-100 outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-50 transition-all" />
              <div className="flex-1 overflow-y-auto space-y-2 mb-6 pr-2 font-bold text-[11px] text-left">
                {transactions.filter(t => t.timestamp.startsWith(historyDate)).length > 0 ? (
                  transactions.filter(t => t.timestamp.startsWith(historyDate)).map(t => (
                    <div key={t.id} className="p-4 bg-slate-50 rounded-2xl flex justify-between border border-slate-100 shadow-sm">
                      <span className="opacity-40 tracking-tighter">{new Date(t.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      <span className="text-purple-600 uppercase font-black">{t.total} Kč ({t.paymentMethod === 'cash' ? 'H' : 'K'})</span>
                    </div>
                  ))
                ) : <p className="text-center text-slate-300 py-12 uppercase text-[10px] font-black tracking-widest">Žádné prodeje</p>}
              </div>
              <div className="p-6 bg-slate-900 rounded-[2.2rem] text-white mb-6 space-y-2 shadow-2xl border-t-4 border-purple-500 text-left">
                <div className="flex justify-between text-[10px] font-bold text-emerald-400 tracking-widest uppercase"><span>Hotově</span><span>{stats.cash} Kč</span></div>
                <div className="flex justify-between text-[10px] font-bold text-indigo-300 tracking-widest uppercase"><span>Kartou</span><span>{stats.card} Kč</span></div>
                <div className="flex justify-between font-black text-2xl pt-3 border-t border-white/10 mt-2 uppercase tracking-widest text-purple-400"><span className="text-sm self-center">Total</span><span>{stats.total} Kč</span></div>
              </div>
              <button onClick={() => exportToCSV(historyDate)} className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase shadow-lg mb-3 tracking-widest active:scale-95 transition-all text-center">Stáhnout CSV report</button>
              <button onClick={() => setShowHistory(false)} className="w-full py-2 text-slate-300 font-black text-[10px] uppercase tracking-[0.3em] hover:text-slate-500 transition-colors text-center">Zavřít</button>
            </div>
          </div>
        )}

        {/* NASTAVENÍ PRODUKTŮ A DPH */}
        {showProductManager && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-0 sm:p-6 z-[60]">
            <div className="bg-white w-full max-w-lg h-full sm:h-auto sm:max-h-[85%] sm:rounded-[3rem] p-8 flex flex-col shadow-2xl">
              <h2 className="font-black text-center mb-6 uppercase text-slate-400 tracking-widest">Nabídka</h2>
              
              <div className="bg-slate-50 p-5 rounded-2xl mb-6 flex justify-between items-center border border-slate-100 shadow-inner">
                 <div className="flex flex-col text-left">
                   <span className="text-[11px] font-black uppercase tracking-tight">Plátce DPH</span>
                   <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">Aktivuje daňové sazby</span>
                 </div>
                 <input type="checkbox" checked={isVatPayer} onChange={e => setIsVatPayer(e.target.checked)} className="w-7 h-7 accent-indigo-600 rounded-lg cursor-pointer" />
              </div>

              {/* SEZNAM PRODUKTŮ S ÚPRAVOU */}
              <div className="flex-1 overflow-y-auto space-y-2 mb-6 pr-1 text-left">
                {products.map(p => (
                  <div key={p.id} className={`flex justify-between items-center p-4 rounded-2xl text-[10px] font-bold border transition-all ${editingId === p.id ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100'}`}>
                    <span className="uppercase">{p.name} ({p.price} Kč) {isVatPayer && <span className="text-indigo-400 ml-1">[{p.vatRate}%]</span>}</span>
                    <div className="flex gap-2">
                       {/* TLAČÍTKO UPRAVIT */}
                       <button onClick={() => startEditing(p)} className="text-indigo-500 bg-white p-2 rounded-lg shadow-sm hover:bg-indigo-500 hover:text-white transition-all text-[12px]">✏️</button>
                       {/* TLAČÍTKO SMAZAT */}
                       <button onClick={() => setProducts(products.filter(item => item.id !== p.id))} className="text-rose-500 bg-white p-2 rounded-lg shadow-sm hover:bg-rose-500 hover:text-white transition-all text-[12px]">✕</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* FORMULÁŘ PŘIDAT / AKTUALIZOVAT */}
              <div className={`space-y-3 pt-5 border-t border-slate-100 p-4 rounded-[1.5rem] transition-colors ${editingId ? 'bg-indigo-50/50 border-indigo-200' : ''}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{editingId ? 'Upravit produkt' : 'Nový produkt'}</span>
                  {editingId && <button onClick={() => { setEditingId(null); setFormName(''); setFormPrice(''); }} className="text-[9px] font-black text-rose-500 uppercase">Zrušit úpravu</button>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="NÁZEV" className="p-4 bg-white rounded-2xl border text-[10px] font-bold outline-none uppercase focus:border-indigo-300 transition-all" value={formName} onChange={e => setFormName(e.target.value)} />
                  <input placeholder="CENA" type="number" className="p-4 bg-white rounded-2xl border text-[10px] font-bold outline-none focus:border-indigo-300 transition-all" value={formPrice} onChange={e => setFormPrice(e.target.value)} />
                  
                  {isVatPayer && (
                    <select className="col-span-2 p-4 bg-white rounded-2xl border text-[10px] font-black text-indigo-600 text-center outline-none cursor-pointer" value={formVat} onChange={e => setFormVat(e.target.value)}>
                      <option value="21">SAZBA 21 % (ZÁKLADNÍ)</option>
                      <option value="12">SAZBA 12 % (SNÍŽENÁ)</option>
                      <option value="0">SAZBA 0 % (OSVOBOZENO)</option>
                    </select>
                  )}

                  <button onClick={handleProductSubmit} className={`col-span-2 py-5 rounded-2xl font-black text-[10px] uppercase shadow-lg active:scale-95 transition-all text-white ${editingId ? 'bg-indigo-600' : 'bg-slate-900'}`}>
                    {editingId ? 'Aktualizovat produkt' : 'Přidat do nabídky'}
                  </button>
                </div>
              </div>
              
              <div className="mt-6 flex justify-between items-center pt-2">
                 <button onClick={() => supabase.auth.signOut()} className="text-rose-500 font-black text-[10px] uppercase hover:underline tracking-widest transition-all">Odhlásit se</button>
                 <button onClick={() => setShowProductManager(false)} className="py-2 text-slate-300 font-black text-[10px] uppercase tracking-widest hover:text-slate-500 transition-colors">Zavřít</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<React.StrictMode><App /></React.StrictMode>);