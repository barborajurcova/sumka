// @ts-nocheck
import React, { useState } from 'react';
import { 
  BarChart3, Sparkles, Rocket, ChevronLeft, ChevronRight,
  Zap, Percent, BarChart2, Calendar, FileSpreadsheet, Package, CheckCircle
} from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
  onRegister: () => void;
}

export default function LandingPage({ onLogin, onRegister }: LandingPageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  // PNG obrázky s průhledností
  const images = [
    'https://imgur.com/OoIfcZc.png',
    'https://i.imgur.com/VxzYU1L.png',
    'https://i.imgur.com/Dgs9b1Y.png',
    'https://i.imgur.com/hNHutld.png'
  ];

  const nextSlide = () => setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));

  return (
    <div className="w-full h-full overflow-auto bg-white font-sans text-slate-900">
      <style>{`
        .gradient-text {
          background: linear-gradient(135deg, #6366f1, #9333ea);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-glow {
          position: absolute; width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%);
          top: -100px; left: 50%; transform: translateX(-50%); pointer-events: none; z-index: 0;
        }
        .carousel-container {
          perspective: 1200px; display: flex; align-items: center; justify-content: center;
          height: 480px; width: 100%; position: relative; margin-top: 1rem;
        }
        .carousel-card {
          position: absolute; transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
          width: 270px; overflow: visible;
          filter: drop-shadow(0 25px 35px rgba(0,0,0,0.2));
        }
        .card-active { transform: translate3d(0, 0, 0) scale(1.1); z-index: 30; opacity: 1; }
        .card-prev { transform: translate3d(-180px, 0, -250px) scale(0.85); z-index: 20; opacity: 0.5; cursor: pointer; }
        .card-next { transform: translate3d(180px, 0, -250px) scale(0.85); z-index: 20; opacity: 0.5; cursor: pointer; }
        .card-hidden { transform: translate3d(0, 0, -500px) scale(0.5); z-index: 10; opacity: 0; }
        .btn-nav {
          background: white; color: #6366f1; padding: 12px; border-radius: 50%;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15); z-index: 40; transition: all 0.3s ease;
        }
        .btn-nav:hover { transform: scale(1.1); color: #9333ea; }
        .pricing-ring {
          padding: 2px; background: linear-gradient(135deg, #6366f1, #9333ea); border-radius: 2.5rem;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .anim-1 { animation: fadeUp 0.7s ease forwards; }
        .anim-2 { animation: fadeUp 0.7s 0.15s ease forwards; opacity: 0; }
        .anim-3 { animation: fadeUp 0.7s 0.3s ease forwards; opacity: 0; }
        .anim-4 { animation: fadeUp 0.7s 0.45s ease forwards; opacity: 0; }
      `}</style>

      {/* Navigace */}
      <nav className="w-full px-6 py-5 flex items-center justify-between max-w-6xl mx-auto relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black text-gray-900 uppercase tracking-tighter">Sumka</span>
        </div>
        <button onClick={onLogin} className="text-xs font-black text-indigo-600 hover:text-purple-600 uppercase tracking-widest transition-all">
          Přihlásit se
        </button>
      </nav>

      {/* Hero sekce */}
      <header className="relative w-full max-w-6xl mx-auto px-6 pt-10 text-center">
        <div className="hero-glow"></div>
        <div className="relative z-10">
          <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-6 anim-1">
            <Sparkles className="w-4 h-4 inline -mt-0.5 mr-1" /> Ideální pro stánkový prodej
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-gray-900 leading-[1.1] max-w-4xl mx-auto anim-2 uppercase tracking-tighter">
            Pokladna, která <br />se vám vejde <span className="gradient-text">do kapsy</span>.
          </h1>
          <p className="mt-8 text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed anim-3 font-medium">
            Zapomeňte na složité papírování. Se Sumkou máte svůj stánkový prodej pod kontrolou. Prodávejte kdekoli, přehledně a bleskově.
          </p>
        </div>

        {/* 🎡 3D KOLOTOČ */}
        <div className="relative z-10 mt-12 flex flex-col items-center anim-4">
          <div className="carousel-container">
            <button onClick={prevSlide} className="btn-nav absolute left-4 sm:left-10 md:left-24">
              <ChevronLeft size={24} />
            </button>
            {images.map((img, index) => {
              let pos = 'card-hidden';
              if (index === currentIndex) pos = 'card-active';
              else if (index === (currentIndex === 0 ? images.length - 1 : currentIndex - 1)) pos = 'card-prev';
              else if (index === (currentIndex === images.length - 1 ? 0 : currentIndex + 1)) pos = 'card-next';
              return (
                <div key={index} className={`carousel-card ${pos}`} onClick={() => { if(pos === 'card-prev') prevSlide(); if(pos === 'card-next') nextSlide(); }}>
                   <img src={img} alt="Sumka App" className="w-full h-auto block" />
                </div>
              );
            })}
            <button onClick={nextSlide} className="btn-nav absolute right-4 sm:right-10 md:right-24">
              <ChevronRight size={24} />
            </button>
          </div>
          <div className="flex gap-2 mt-4">
            {images.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-8 bg-indigo-600' : 'w-2 bg-slate-200'}`} />
            ))}
          </div>
          <div className="mt-12">
            <button onClick={onRegister} className="bg-slate-900 text-white font-black px-12 py-5 rounded-[2rem] text-xs uppercase tracking-widest shadow-2xl hover:bg-indigo-600 transition-all">
              Vyzkoušet Sumku zdarma
            </button>
          </div>
        </div>
      </header>

      {/* FUNKCE */}
      <section className="w-full max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-3">Funkce Sumky</p>
          <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Vše pro váš klidný prodej</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard icon={<Zap />} title="Blesková pokladna" desc="Prodejte produkt na dvě kliknutí. Ideální pro fronty u stánku." color="indigo" />
          <FeatureCard icon={<Percent />} title="Slevy ihned" desc="Systém automaticky přepočítá cenu po slevě. Žádné počítání z hlavy." color="purple" />
          <FeatureCard icon={<BarChart2 />} title="Denní přehledy" desc="Okamžitě vidíte tržby v hotovosti i kartou. Vše v reálném čase." color="emerald" />
          <FeatureCard icon={<Calendar />} title="Historie prodejů" desc="Všechny prodeje jsou bezpečně uložené v přehledném archivu." color="amber" />
          <FeatureCard icon={<FileSpreadsheet />} title="Podklady pro účetní" desc="Stáhněte si denní uzávěrku v CSV formátu jedním kliknutím." color="sky" />
          <FeatureCard icon={<Package />} title="Správa sortimentu" desc="Ceny i názvy položek změníte během vteřiny přímo v aplikaci." color="rose" />
        </div>
      </section>

      {/* CENÍK */}
      <section className="w-full max-w-6xl mx-auto px-6 py-24 bg-slate-50/50 rounded-[4rem] mb-20 text-center">
        <div className="max-w-md mx-auto pricing-ring shadow-2xl">
          <div className="bg-white rounded-[calc(2.5rem-2px)] p-10">
            <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-6">Jednoduchá cena</div>
            <div className="flex items-end justify-center gap-1 mb-4">
              <span className="text-6xl font-black gradient-text tracking-tighter">150 Kč</span>
              <span className="text-gray-400 text-sm font-bold mb-2">/ měsíc</span>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-8">Všechny funkce bez limitů a bez závazků.</p>
            <ul className="text-left space-y-4 mb-10">
              <PricingItem text="Neomezený počet produktů" />
              <PricingItem text="Kompletní historie prodejů" />
              <PricingItem text="CSV exporty pro účetní" />
              <PricingItem text="Přístup z mobilu i tabletu" />
            </ul>
            <button onClick={onRegister} className="w-full bg-slate-900 text-white font-black py-5 rounded-[1.5rem] text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl">
              Začít prodávat se Sumkou
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full py-16 text-center border-t border-slate-100">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md"><BarChart3 className="w-4 h-4 text-white" /></div>
          <span className="font-black text-gray-900 uppercase tracking-tighter text-xl">Sumka</span>
        </div>
        <div className="flex justify-center gap-6 mb-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <button onClick={() => setShowTerms(true)} className="hover:text-indigo-600 transition-colors">Obchodní podmínky</button>
          <button onClick={() => setShowPrivacy(true)} className="hover:text-indigo-600 transition-colors">Zpracování údajů</button>
        </div>
        <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.3em]">© 2026 Sumka – Všechna práva vyhrazeny</p>
        
        {showTerms && <LegalModal title="Obchodní podmínky" onClose={() => setShowTerms(false)} content="Všeobecné obchodní podmínky (VOP)
1. Úvodní ustanovení

1.1. Tyto obchodní podmínky upravují práva a povinnosti mezi poskytovatelem (dále jen „Poskytovatel“) a uživatelem (dále jen „Uživatel“) při používání webové aplikace pokladního systému (dále jen „Aplikace“).

1.2. Poskytovatel:
Fyzická osoba (OSVČ)
IČO: 14216850
Sídlo: Kainarova 286/3, Přerov 75002

1.3. Aplikace je poskytována jako webová služba (SaaS) a slouží výhradně jako pomocný nástroj pro evidenci a výpočty (v režimu „vylepšené kalkulačky“).

2. Charakteristika služby a aktualizace

2.1. Aplikace není napojena na žádné systémy třetích stran ani na systémy státní správy (např. EET).
2.2. Aplikace neslouží k vedení certifikovaného účetnictví podle platných právních předpisů. Slouží pouze jako podpůrný nástroj pro lepší přehled a evidenci Uživatele.
2.3. Jelikož se jedná o webovou aplikaci, veškeré aktualizace systému probíhají automaticky na straně Poskytovatele. Uživatel má vždy přístup k nejnovější verzi.

3. Uživatelský účet a registrace

3.1. Uživatel získává přístup do Aplikace na základě registrace provedené na webových stránkách Poskytovatele.
3.2. Uživatel je povinen při registraci uvádět pravdivé údaje a chránit své přihlašovací údaje před zneužitím třetími stranami.

4. Cena služby a platební podmínky

4.1. Služba je zpoplatněna částkou 150 Kč měsíčně.
4.2. Platba probíhá formou předplatného na daný měsíc dopředu.
4.3. Platby jsou realizovány prostřednictvím zabezpečené platební brány Stripe (podporovány jsou platební karty, Apple Pay a Google Pay).
4.4. V případě, že Uživatel zruší předplatné během již zaplaceného měsíce, poměrná částka se nevrací a Uživatel má právo Aplikaci využívat až do konce předplaceného období.

5. Odpovědnost a garance dostupnosti

5.1. Poskytovatel garantuje dostupnost systému v režimu 24 hodin denně, 7 dní v týdnu, 365 dní v roce (24/7/365), s výjimkou případů zásahu vyšší moci nebo nezbytné technické údržby.
5.2. Omezení odpovědnosti: Uživatel nese plnou a výhradní odpovědnost za správnost, úplnost a zákonnost veškerých dat zadaných do Aplikace.
5.3. Vyloučení odpovědnosti za sankce: Poskytovatel nenese absolutně žádnou odpovědnost za případné chyby ve výpočtech způsobené chybným zadáním ze strany Uživatele. Poskytovatel výslovně neručí za žádné finanční ztráty, doměrky daně, ani za pokuty či penále udělené Uživateli ze strany Finančního úřadu či jiných orgánů státní správy.

6. Ochrana a správa dat

6.1. Veškerá data Uživatele jsou bezpečně ukládána v cloudové databázi (SupaBase).
6.2. V případě ukončení předplatného (výpovědi) a deaktivace účtu se Poskytovatel zavazuje uchovat uživatelská data po dobu dalších 12 měsíců. Během této doby má Uživatel možnost si v případě obnovení předplatného svá data navrátit. Po uplynutí 12 měsíců mohou být data trvale smazána.

7. Trvání smlouvy a výpověď

7.1. Smlouva se uzavírá na dobu neurčitou s měsíčním fakturačním cyklem.
7.2. Uživatel může předplatné kdykoliv zrušit v nastavení svého účtu.
7.3. Výpovědní lhůta je okamžitá s tím, že služba je Uživateli poskytována až do doběhnutí konce již předplaceného měsíce. Poté dojde k omezení přístupu do Aplikace.

8. Závěrečná ustanovení

8.1. Tyto obchodní podmínky se řídí právním řádem České republiky.
8.2. Poskytovatel si vyhrazuje právo tyto obchodní podmínky jednostranně měnit. O změnách bude Uživatel informován s dostatečným předstihem prostřednictvím Aplikace nebo e-mailem.
8.3. Tyto VOP nabývají účinnosti dnem zveřejnění." />}
        {showPrivacy && <LegalModal title="Ochrana údajů" onClose={() => setShowPrivacy(false)} content="Zásady zpracování osobních údajů
1. Kdo zpracovává vaše údaje?

Správcem vašich osobních údajů je:
Jméno a příjmení: Barbora Jurčová (OSVČ)
IČO: 14216850
Sídlo: Kainarova 286/3, Přerov 75002
(dále jen „Správce“)

2. Jaké údaje zpracováváme a proč?

Zpracováváme pouze naprosté minimum osobních údajů, které jsou nezbytné pro fungování naší webové aplikace a vedení vašeho účtu.

Jméno a e-mailová adresa: Tyto údaje potřebujeme k vytvoření vašeho uživatelského účtu, k přihlašování do aplikace, zasílání informací o platbách a k případné technické podpoře.

Platební údaje: K zaplacení předplatného využíváme zabezpečenou platební bránu. My samotní nemáme přístup k údajům o vaší platební kartě. Známe pouze informaci o tom, zda byla platba úspěšně provedena.

Zákonný důvod zpracování: Zpracování těchto údajů je nezbytné pro plnění smlouvy (poskytování naší aplikace) dle čl. 6 odst. 1 písm. b) nařízení GDPR.

3. Komu údaje předáváme?

Vaše osobní údaje s nikým nesdílíme za účelem marketingu ani je neprodáváme. Aby však mohla aplikace fungovat, využíváme prověřené technologické partnery (tzv. zpracovatele), kteří s daty nakládají výhradně podle našich pokynů:

Stripe: Poskytovatel platební brány, který zajišťuje bezpečné zpracování vašich plateb (kartou, Apple Pay, Google Pay).

SupaBase: Poskytovatel cloudové databáze, na jejíchž zabezpečených serverech jsou vaše data a údaje uloženy.

4. Jak dlouho údaje uchováváme?

Vaše osobní údaje uchováváme po dobu trvání vašeho předplatného.

V případě, že předplatné zrušíte, uchováváme váš účet a data po dobu dalších 12 měsíců pro případ, že byste se rozhodli k aplikaci vrátit (jak je uvedeno v Obchodních podmínkách).

Po uplynutí této lhůty (nebo na základě vaší výslovné žádosti o dřívější smazání) vaše osobní údaje trvale vymažeme.

Výjimku tvoří pouze údaje na vystavených fakturách, které musíme ze zákona uchovávat po dobu stanovenou daňovými a účetními předpisy.

5. Jaká máte práva?

Podle předpisů o ochraně osobních údajů (GDPR) máte právo:

Na přístup: Můžete se nás kdykoliv zeptat, jaké údaje o vás zpracováváme.

Na opravu: Pokud jsou vaše údaje nepřesné, máte právo je v aplikaci upravit nebo nás požádat o nápravu.

Na výmaz (právo „být zapomenut“): Můžete nás požádat o smazání vašich osobních údajů, pokud už pro nás nejsou nezbytné.

Na přenositelnost: Můžete požádat o export vašich dat ve strojově čitelném formátu.

Podat stížnost: Pokud se domníváte, že s vašimi údaji nenakládáme správně, máte právo podat stížnost u Úřadu pro ochranu osobních údajů (ÚOOÚ).

V případě jakýchkoli dotazů ohledně ochrany soukromí nebo uplatnění vašich práv nás můžete kontaktovat na e-mailu: barbora.jurcova@seznam.cz." />}
      </footer>
    </div>
  );
}

// POMOCNÉ KOMPONENTY
function FeatureCard({ icon, title, desc, color }: any) {
  const colors: any = {
    indigo: "bg-indigo-50 text-indigo-600",
    purple: "bg-purple-50 text-purple-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    sky: "bg-sky-50 text-sky-600",
    rose: "bg-rose-50 text-rose-600"
  };
  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 text-left hover:shadow-xl transition-all">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${colors[color]}`}>{React.cloneElement(icon, { size: 28 })}</div>
      <h3 className="font-black text-gray-900 text-xl mb-3 uppercase tracking-tight">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed font-medium">{desc}</p>
    </div>
  );
}

function PricingItem({ text }: { text: string }) {
  return <li className="flex items-center gap-3 text-sm font-bold text-slate-600"><CheckCircle className="w-5 h-5 text-emerald-500" />{text}</li>;
}

function LegalModal({ title, onClose, content }: any) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-black uppercase tracking-widest">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 text-xl px-2">✕</button>
        </div>
        <div className="p-8 overflow-y-auto text-left text-sm text-slate-600 whitespace-pre-wrap">{content}</div>
        <div className="p-6 border-t text-center"><button onClick={onClose} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase">Rozumím</button></div>
      </div>
    </div>
  );
}