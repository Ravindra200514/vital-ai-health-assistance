import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { Activity, Dumbbell, User, LogOut, MessageSquare, Droplets, Flame, ArrowRight, CheckCircle, XCircle } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

// --- SHARED COMPONENTS --- //

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  return (
    <nav className="glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', position: 'sticky', top: 0, zIndex: 100 }}>
      <div onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
        <Activity size={28} color="var(--primary-color)" /> 
        <span style={{letterSpacing: '-1px'}}>Vital<span style={{color: 'var(--primary-color)'}}>AI</span></span>
      </div>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {!user ? (
           <>
             <button onClick={() => navigate('/login')} className="btn btn-outline">Log In</button>
             <button onClick={() => navigate('/register')} className="btn btn-primary">Sign Up</button>
           </>
        ) : (
           <>
             <span style={{ color: 'var(--text-muted)' }}>Welcome, <strong style={{ color: 'var(--text-main)'}}>{user}</strong></span>
             <button onClick={() => navigate('/dashboard')} className="btn btn-outline" style={{ display: 'flex', gap: '0.5rem' }}><Activity size={16}/> Dashboard</button>
             <button onClick={onLogout} className="btn" style={{ background: 'transparent', color: 'var(--danger-color)', display: 'flex', gap: '0.5rem', padding: '0.5rem' }}><LogOut size={16}/> Logout</button>
           </>
        )}
      </div>
    </nav>
  );
}

function DumbbellLoader() {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '2rem' }}>
      <div className="animate-pump" style={{ fontSize: '4rem', filter: 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.6))' }}>
        <Dumbbell size={90} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          Heavy lifting your data...
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Generating elite personalized conditioning plan</p>
      </div>
    </div>
  );
}

function PublicAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [chat, setChat] = useState([{s: 'ai', t: 'Hi! Im the click-to-activate Health Assistant. How can I temporarily help you today before you make an account?'}]);

  const send = async(e) => {
      e.preventDefault();
      if(!msg.trim()) return;
      const newChat = [...chat, {s:'u', t:msg}];
      setChat(newChat);
      setMsg('');
      const res = await fetch(`${API_URL}/ai/public_chat`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({query: msg})
      });
      const data = await res.json();
      setChat([...newChat, {s:'ai', t:data.reply}]);
  };

  return (
      <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000 }}>
          {!isOpen ? (
              <button onClick={() => setIsOpen(true)} className="btn btn-primary animate-pulse" style={{ borderRadius: '50px', padding: '1rem 1.5rem', display: 'flex', gap: '0.5rem', boxShadow: 'var(--shadow-lg)', alignItems: 'center' }}>
                  <MessageSquare size={20} /> Get Health Assistance!
              </button>
          ) : (
              <div className="card glass animate-fade-in" style={{ width: '350px', height: '450px', display: 'flex', flexDirection: 'column', right: 0, bottom: 0, position: 'absolute' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.8rem', marginBottom: '0.8rem' }}>
                      <h3 style={{ margin: 0, color: 'var(--accent-color)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Activity size={18} /> Public Health Assistant
                      </h3>
                      <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>✖</button>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1rem' }}>
                         {chat.map((m, i) => (
                             <div key={i} style={{ alignSelf: m.s === 'u' ? 'flex-end' : 'flex-start', maxWidth: '85%', padding: '0.8rem', borderRadius: '12px', backgroundColor: m.s === 'u' ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.9rem', lineHeight: '1.4' }}>
                                 {m.t}
                             </div>
                         ))}
                  </div>
                  <form onSubmit={send} style={{ display: 'flex', gap: '0.5rem' }}>
                      <input type="text" className="form-input" value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Need health advice?" style={{ flex: 1, padding: '0.5rem' }} />
                      <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Ask</button>
                  </form>
              </div>
          )}
      </div>
  );
}

// --- PAGES --- //

function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="container animate-fade-in" style={{ paddingTop: '8rem', paddingBottom: '6rem', textAlign: 'center' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-color)', borderRadius: '50px', fontSize: '0.95rem', fontWeight: 'bold' }}>
          <Flame size={18}/> Elite Health Intelligence V2 Is Live
        </div>
        <h1 style={{ fontSize: '4.5rem', letterSpacing: '-2px', background: 'linear-gradient(135deg, var(--text-main) 20%, var(--primary-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Transform Your Body with Next-Gen AI
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', lineHeight: '1.8', maxWidth: '700px' }}>
          Stop guessing your macros. VitalAI cross-references your physical parameters to output highly-specific, elite conditioning diet plans detailing exactly what to eat and what to strictly avoid.
        </p>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button onClick={() => navigate('/register')} className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.2rem', display: 'flex', gap: '0.8rem', borderRadius: '50px' }}>
            Start Free Trial <ArrowRight size={20} />
          </button>
          <button onClick={() => navigate('/login')} className="btn btn-outline" style={{ padding: '1rem 2.5rem', fontSize: '1.2rem', borderRadius: '50px' }}>
            Login
          </button>
        </div>
      </div>

      <div style={{ marginTop: '8rem', textAlign: 'left', paddingBottom: '4rem' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', textAlign: 'center', color: 'var(--text-main)' }}>Featured Pre-Designed Protocols</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem auto' }}>Sneak peak at our world-class conditioning templates before you even sign up.</p>
        
        <div className="grid grid-cols-3" style={{ gap: '2rem' }}>
           {[
             { title: 'The Keto Shred', cals: '1800 kcal', desc: 'Aggressive fat-loss protocol relying on high fats and extreme carbohydrate restriction.' },
             { title: 'Hypertrophy Bulk', cals: '3200 kcal', desc: 'Complex carbohydrate and lean meat loading for maximum muscle protein synthesis.' },
             { title: 'Metabolic Reset', cals: '2100 kcal', desc: 'Balanced macronutrient curve designed to stabilize blood sugar and energy levels.' }
           ].map((diet, i) => (
               <div key={i} className="premium-3d-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer' }} onMouseEnter={(e)=>{e.currentTarget.style.transform='translateY(-10px) scale(1.02)';}} onMouseLeave={(e)=>{e.currentTarget.style.transform='translateY(0) scale(1)';}}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.8rem' }}>
                      <h3 style={{ color: 'white', margin: 0, textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>{diet.title}</h3>
                      <span style={{ fontSize: '0.8rem', background: 'rgba(56,189,248,0.15)', color: 'var(--accent-color)', padding: '0.3rem 0.8rem', borderRadius: '50px', border: '1px solid rgba(56,189,248,0.3)', boxShadow: '0 0 10px rgba(56,189,248,0.2)' }}>{diet.cals}</span>
                   </div>
                   <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>{diet.desc}</p>
                   
                   <div style={{ marginTop: '1rem' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                           <CheckCircle size={16} color="var(--primary-color)"/> Dynamic 3-Phase Meals
                       </div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', fontSize: '0.9rem', marginBottom: '1rem' }}>
                           <CheckCircle size={16} color="var(--primary-color)"/> "Do Not Eat" Analytics
                       </div>
                   </div>
                   
                   <button onClick={() => navigate('/register')} className="btn btn-outline" style={{ marginTop: 'auto', width: '100%', borderColor: 'rgba(139, 92, 246, 0.5)', color: 'white', background: 'rgba(139, 92, 246, 0.1)' }}>Unlock Protocol</button>
               </div>
           ))}
        </div>
      </div>

      <PublicAssistant />
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password})
        });
        const data = await res.json();
        if (res.status === 200) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('name', data.name);
            navigate('/dashboard');
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert("Failed to communicate with API.");
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="card glass animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-main)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
          <Activity color="var(--primary-color)" /> Login
        </h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="form-input" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="form-input" required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Secure Login</button>
        </form>
      </div>
    </div>
  );
}

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({name, email, password, phone})
        });
        const data = await res.json();
        if (res.status === 201) {
            alert(data.message);
            navigate('/login');
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert("Failed to communicate with API.");
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="card glass animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-main)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
          <User color="var(--primary-color)" /> Create Account
        </h2>
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" value={name} onChange={e=>setName(e.target.value)} className="form-input" required />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="form-input" required />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number (for SMS Alerts)</label>
            <input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} className="form-input" placeholder="+1234567890" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="form-input" required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create Account</button>
        </form>
      </div>
    </div>
  );
}

function ProfileSetup({ onComplete, initialProfile }) {
  const [formData, setFormData] = useState(initialProfile || {
      age: 25, weight: 70, height: 175, gender: 'Male', activity_level: 'Active', health_goals: 'Weight Loss'
  });

  const handleSubmit = async (e) => {
      e.preventDefault();
      try {
          await fetch(`${API_URL}/profile`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify(formData)
          });
          onComplete(formData);
      } catch (err) {
          alert('Failed to save profile');
      }
  };

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '2rem' }}>
       <div className="card glass" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User color="var(--accent-color)" /> Physical Profile Parameters
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2">
              <div className="form-group">
                  <label className="form-label">Age</label>
                  <input type="number" className="form-input" value={formData.age} onChange={e=>setFormData({...formData, age: e.target.value})} required />
              </div>
              <div className="form-group">
                  <label className="form-label">Weight (kg)</label>
                  <input type="number" step="0.1" className="form-input" value={formData.weight} onChange={e=>setFormData({...formData, weight: e.target.value})} required />
              </div>
              <div className="form-group">
                  <label className="form-label">Height (cm)</label>
                  <input type="number" step="0.1" className="form-input" value={formData.height} onChange={e=>setFormData({...formData, height: e.target.value})} required />
              </div>
              <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-input" value={formData.gender} onChange={e=>setFormData({...formData, gender: e.target.value})}>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                  </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Activity Level</label>
                  <select className="form-input" value={formData.activity_level} onChange={e=>setFormData({...formData, activity_level: e.target.value})}>
                      <option>Sedentary</option>
                      <option>Lightly Active</option>
                      <option>Active</option>
                      <option>Very Active</option>
                  </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Primary Health Goal</label>
                  <input type="text" className="form-input" value={formData.health_goals} onChange={e=>setFormData({...formData, health_goals: e.target.value})} required />
              </div>
              <div style={{ gridColumn: '1 / -1', marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                 <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>{initialProfile ? 'Update Parameters' : 'Lock in Parameters & Enter Dashboard'}</button>
                 {initialProfile && <button type="button" onClick={() => onComplete(false)} className="btn btn-outline" style={{ width: '100%' }}>Cancel</button>}
              </div>
          </form>
       </div>
    </div>
  );
}

function Dashboard() {
    const [profile, setProfile] = useState({});
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        const res = await fetch(`${API_URL}/profile`, {
            headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}
        });
        const data = await res.json();
        setProfile(data);
    };

    const generatePlan = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/ai/recommendation`, {
                headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}
            });
            const data = await res.json();
            setPlan(data);
        } catch(e) {
            alert('Failed to generate plan.');
        }
        setLoading(false);
    };

    if (loading) return <DumbbellLoader />;
    
    if (!profile.age) return <ProfileSetup onComplete={fetchProfile} />;

    if (isEditingProfile) {
        return (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', background: 'rgba(0,0,0,0.8)', zIndex: 1000, overflowY: 'auto', display: 'flex', alignItems: 'center' }}>
                <ProfileSetup 
                    initialProfile={profile} 
                    onComplete={(updated) => {
                        setIsEditingProfile(false);
                        if(updated) fetchProfile();
                    }} 
                />
            </div>
        );
    }

    return (
        <div className="container animate-fade-in" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h1 style={{ marginBottom: '0.5rem', color: 'var(--text-main)' }}>Your Command Center</h1>
                  <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                      Goal: <strong style={{color:'var(--text-main)'}}>{profile.health_goals}</strong> | {profile.weight}kg | {profile.height}cm
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => setIsEditingProfile(true)} className="btn btn-outline" style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
                        <User size={20}/> Edit Profile
                    </button>
                    <button onClick={generatePlan} className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
                        <Flame size={20}/> Generate Elite Diet Plan
                    </button>
                </div>
            </div>

            {plan ? (
                <div className="grid grid-cols-1" style={{ gap: '2rem' }}>
                    <div className="card glass">
                        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                             <div style={{ flex: 1, minWidth: '200px' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)' }}>
                                    <Activity /> Execution Summary
                                </h3>
                                <p style={{ fontSize: '1.1rem', marginTop: '0.5rem' }}>{plan.summary}</p>
                             </div>
                             <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-lg)', textAlign: 'center', minWidth: '150px' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>{plan.daily_calories}</div>
                                <div style={{ color: 'var(--text-muted)' }}>Daily Kilocalories</div>
                             </div>
                             <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-lg)', textAlign: 'center', minWidth: '150px' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary-color)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}><Droplets size={28}/> {plan.water_intake_liters}L</div>
                                <div style={{ color: 'var(--text-muted)' }}>Water Target</div>
                             </div>
                        </div>
                    </div>

                    <h2 style={{ marginTop: '1rem', color: 'var(--text-main)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Advanced 3-Phase Macro Guide</h2>
                    <div className="grid grid-cols-3">
                        {['breakfast', 'lunch', 'dinner'].map((mealName) => (
                             <div key={mealName} className="card glass animate-fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
                                 <h3 style={{ textTransform: 'capitalize', color: 'var(--primary-color)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>{mealName}</h3>
                                 <div style={{ flex: 1 }}>
                                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-color)', fontWeight: 'bold', marginBottom: '0.5rem' }}><CheckCircle size={16}/> STRICTLY EAT</div>
                                     <ul style={{ listStylePosition: 'inside', color: 'var(--text-main)', marginBottom: '1.5rem', opacity: 0.9 }}>
                                         {plan.meals[mealName].eat.map((i, idx) => <li key={idx} style={{ marginBottom: '0.25rem' }}>{i}</li>)}
                                     </ul>

                                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger-color)', fontWeight: 'bold', marginBottom: '0.5rem' }}><XCircle size={16}/> STRICTLY AVOID</div>
                                     <ul style={{ listStylePosition: 'inside', color: 'var(--text-muted)', opacity: 0.8 }}>
                                         {plan.meals[mealName].avoid.map((i, idx) => <li key={idx} style={{ marginBottom: '0.25rem' }}>{i}</li>)}
                                     </ul>
                                 </div>
                             </div>
                        ))}
                    </div>

                    <div className="card glass">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><Dumbbell color="var(--primary-color)" /> Required Output</h3>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                             {plan.exercise.map((ex, i) => (
                                 <div key={i} style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.1)' }}>{ex}</div>
                             ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="card glass" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                    <Dumbbell size={48} color="rgba(255,255,255,0.2)" style={{ marginBottom: '1rem' }} />
                    <p style={{ fontSize: '1.2rem' }}>Your dashboard is empty. Generate your first elite plan above.</p>
                </div>
            )}
        </div>
    );
}

// --- MAIN APP COMPONENT --- //

export default function App() {
  const [user, setUser] = useState(localStorage.getItem('name'));

  useEffect(() => {
    setUser(localStorage.getItem('name'));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <Router>
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}
