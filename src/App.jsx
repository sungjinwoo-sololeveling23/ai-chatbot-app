import { useState, useRef, useEffect } from "react";

// ✅ PASTE YOUR GOOGLE CLIENT ID HERE
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

const PERSONAS = {
  aria:  { name: "Aria",  emoji: "✦", desc: "Warm & friendly assistant", prompt: "You are Aria, a warm, friendly, and concise AI assistant. When writing math equations or formulas, always use LaTeX notation wrapped in $...$ for inline math or $$...$$ for block/display math." },
  sage:  { name: "Sage",  emoji: "🧠", desc: "Deep thinker & analyst",   prompt: "You are Sage, a thoughtful analytical assistant. Use LaTeX for math: $...$ inline, $$...$$ block." },
  spark: { name: "Spark", emoji: "⚡", desc: "Creative & energetic",      prompt: "You are Spark, a creative and enthusiastic assistant! Use LaTeX for math." },
};

const THEMES = {
  violet: { accent: "#7c6aff", accent2: "#9a5eff", glow: "rgba(124,106,255,0.3)" },
  cyan:   { accent: "#06b6d4", accent2: "#0891b2", glow: "rgba(6,182,212,0.3)" },
  rose:   { accent: "#f43f5e", accent2: "#e11d48", glow: "rgba(244,63,94,0.3)" },
  amber:  { accent: "#f59e0b", accent2: "#d97706", glow: "rgba(245,158,11,0.3)" },
};

const FONT_SIZES = { small: 13, medium: 14.5, large: 16.5 };

const keyframes = `
@keyframes bounce{0%,80%,100%{transform:translateY(0);opacity:.4}40%{transform:translateY(-6px);opacity:1}}
@keyframes slideIn{from{opacity:0;transform:translateX(100%)}to{opacity:1;transform:translateX(0)}}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.18);opacity:0.75}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes popIn{0%{transform:scale(0.7);opacity:0}70%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
@keyframes gradientShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
*{box-sizing:border-box}
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:#2a2a3e;border-radius:4px}
.katex{font-size:1.1em!important}
.katex-display{overflow-x:auto;padding:4px 0}
`;

const SUGGESTIONS = [
  "What can you help me with?",
  "What is the quadratic formula?",
  "Explain Euler's identity",
  "Give me a productivity tip",
];

function useKaTeX() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (window.katex) { setReady(true); return; }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css";
    document.head.appendChild(link);
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js";
    s.onload = () => setReady(true);
    document.head.appendChild(s);
  }, []);
  return ready;
}

function parseMessage(text) {
  const segs = [], re = /\$\$([\s\S]+?)\$\$|\$([^\$\n]+?)\$/g;
  let last = 0, m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) segs.push({ type: "text", value: text.slice(last, m.index) });
    segs.push(m[1] !== undefined ? { type: "block", value: m[1] } : { type: "inline", value: m[2] });
    last = m.index + m[0].length;
  }
  if (last < text.length) segs.push({ type: "text", value: text.slice(last) });
  return segs;
}

function MathMessage({ text, color, fs }) {
  useKaTeX();
  return (
    <span style={{ fontSize: fs, lineHeight: 1.7, color, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
      {parseMessage(text).map((seg, i) => {
        if (!window.katex) return <span key={i}>{seg.value}</span>;
        if (seg.type === "block") return <div key={i} style={{ margin: "10px 0", overflowX: "auto" }} dangerouslySetInnerHTML={{ __html: window.katex.renderToString(seg.value, { throwOnError: false, displayMode: true }) }} />;
        if (seg.type === "inline") return <span key={i} dangerouslySetInnerHTML={{ __html: window.katex.renderToString(seg.value, { throwOnError: false }) }} />;
        return <span key={i}>{seg.value}</span>;
      })}
    </span>
  );
}

function LoginScreen({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const btnRef = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      if (!window.google) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (res) => {
          try {
            const payload = JSON.parse(atob(res.credential.split(".")[1]));
            onLogin({ name: payload.name, email: payload.email, picture: payload.picture });
          } catch { setError("Login failed. Please try again."); setLoading(false); }
        },
      });
      window.google.accounts.id.renderButton(btnRef.current, {
        theme: "filled_black", size: "large", shape: "pill", width: 280, text: "signin_with",
      });
    };
    document.head.appendChild(script);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <style>{keyframes}</style>
      <div style={{ width: "100%", maxWidth: 400, animation: "fadeUp 0.5s ease" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#7c6aff,#9a5eff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 16px", boxShadow: "0 0 40px rgba(124,106,255,0.4)" }}>✦</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#f0f0fa", letterSpacing: "-0.03em" }}>Welcome back</div>
          <div style={{ fontSize: 15, color: "#6b6b8a", marginTop: 8 }}>Sign in to continue to your AI assistant</div>
        </div>

        <div style={{ background: "#0d0d16", border: "1px solid #1e1e2e", borderRadius: 20, padding: "32px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
          {[
            { icon: "🧠", text: "Smart AI responses powered by Claude" },
            { icon: "🎤", text: "Voice input & camera search" },
            { icon: "📐", text: "Beautiful math formula rendering" },
          ].map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "#13131f", border: "1px solid #2a2a3e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>{f.icon}</div>
              <span style={{ fontSize: 14, color: "#9090b8", lineHeight: 1.4 }}>{f.text}</span>
            </div>
          ))}

          <div style={{ borderTop: "1px solid #1e1e2e", paddingTop: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div ref={btnRef} />

            {GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com" && (
              <div style={{ background: "#1a1a2e", border: "1px solid #2a2a5e", borderRadius: 12, padding: "12px 16px", fontSize: 12, color: "#9090c8", textAlign: "center", lineHeight: 1.6 }}>
                ⚙️ <strong>Developer mode:</strong> Replace <code style={{ background: "#0a0a2a", padding: "1px 6px", borderRadius: 4 }}>GOOGLE_CLIENT_ID</code> at the top of the code with your real Client ID from <span style={{ color: "#7c6aff" }}>console.cloud.google.com</span>
              </div>
            )}

            <button onClick={() => onLogin({ name: "Demo User", email: "demo@example.com", picture: null, isDemo: true })}
              style={{ background: "none", border: "1px solid #2a2a3e", borderRadius: 24, padding: "10px 24px", color: "#6b6b8a", fontSize: 13, cursor: "pointer", fontFamily: "inherit", width: "100%", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#7c6aff55"; e.currentTarget.style.color = "#9090b8"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a2a3e"; e.currentTarget.style.color = "#6b6b8a"; }}>
              Continue as Guest (Demo)
            </button>

            {error && <div style={{ color: "#f87171", fontSize: 13, textAlign: "center" }}>⚠️ {error}</div>}
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "#3a3a5a" }}>
          By signing in, you agree to our Terms of Service & Privacy Policy
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  if (!user) return <LoginScreen onLogin={setUser} />;
  return <AIChatbot user={user} onLogout={() => setUser(null)} />;
}

function AIChatbot({ user, onLogout }) {
  const [messages, setMessages]         = useState([]);
  const [input, setInput]               = useState("");
  const [loading, setLoading]           = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [persona, setPersona]           = useState("aria");
  const [themeKey, setThemeKey]         = useState("violet");
  const [fontSize, setFontSize]         = useState("medium");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [recording, setRecording]       = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [micError, setMicError]         = useState("");
  const [audioLevel, setAudioLevel]     = useState([]);
  const [pendingImage, setPendingImage] = useState(null);
  const [showCamera, setShowCamera]     = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [facingMode, setFacingMode]     = useState("environment");
  const [feedback, setFeedback]         = useState({});
  const [toastMsg, setToastMsg]         = useState("");

  const bottomRef   = useRef(null);
  const textareaRef = useRef(null);
  const mediaRec    = useRef(null);
  const audioChunks = useRef([]);
  const animFrame   = useRef(null);
  const fileInputRef = useRef(null);
  const videoRef    = useRef(null);
  const canvasRef   = useRef(null);
  const toastTimer  = useRef(null);

  useKaTeX();
  const theme = THEMES[themeKey];
  const fs    = FONT_SIZES[fontSize];
  const p     = PERSONAS[persona];

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
  useEffect(() => () => { if (animFrame.current) cancelAnimationFrame(animFrame.current); stopCamera(); }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(""), 2200);
  };

  const autoResize = el => { el.style.height = "auto"; el.style.height = Math.min(el.scrollHeight, 160) + "px"; };

  const giveFeedback = (idx, type) => {
    setFeedback(prev => {
      if (prev[idx] === type) { showToast("Feedback removed"); const u = {...prev}; delete u[idx]; return u; }
      showToast(type === "like" ? "👍 Thanks for the feedback!" : "👎 We'll try to do better!");
      return { ...prev, [idx]: type };
    });
  };

  const openCamera = async (mode = facingMode) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode }, audio: false });
      setCameraStream(stream); setShowCamera(true);
      setTimeout(() => { if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); } }, 100);
    } catch { setMicError("Camera access denied."); }
  };
  const stopCamera = () => { if (cameraStream) { cameraStream.getTracks().forEach(t => t.stop()); setCameraStream(null); } setShowCamera(false); };
  const flipCamera = async () => { stopCamera(); const next = facingMode==="environment"?"user":"environment"; setFacingMode(next); setTimeout(()=>openCamera(next),300); };
  const capturePhoto = () => {
    const v=videoRef.current, c=canvasRef.current; if(!v||!c) return;
    c.width=v.videoWidth; c.height=v.videoHeight; c.getContext("2d").drawImage(v,0,0);
    const d=c.toDataURL("image/jpeg",0.85); setPendingImage({base64:d.split(",")[1],mimeType:"image/jpeg",preview:d}); stopCamera();
  };
  const handleFileUpload = (e) => {
    const file=e.target.files?.[0]; if(!file) return;
    const r=new FileReader(); r.onload=()=>{const d=r.result; setPendingImage({base64:d.split(",")[1],mimeType:file.type,preview:d});}; r.readAsDataURL(file); e.target.value="";
  };

  const startAudioLevel = (stream) => {
    const ctx=new(window.AudioContext||window.webkitAudioContext)(), an=ctx.createAnalyser(); an.fftSize=64;
    ctx.createMediaStreamSource(stream).connect(an);
    const tick=()=>{ const d=new Uint8Array(an.frequencyBinCount); an.getByteFrequencyData(d); setAudioLevel(Array.from(d.slice(0,8)).map(v=>Math.max(4,(v/255)*28))); animFrame.current=requestAnimationFrame(tick); };
    tick();
  };
  const startRecording = async () => {
    setMicError("");
    try {
      const stream=await navigator.mediaDevices.getUserMedia({audio:true}); startAudioLevel(stream);
      const mime=MediaRecorder.isTypeSupported("audio/webm;codecs=opus")?"audio/webm;codecs=opus":MediaRecorder.isTypeSupported("audio/webm")?"audio/webm":"audio/mp4";
      const rec=new MediaRecorder(stream,{mimeType:mime}); audioChunks.current=[];
      rec.ondataavailable=e=>{if(e.data.size>0)audioChunks.current.push(e.data)};
      rec.onstop=async()=>{
        if(animFrame.current)cancelAnimationFrame(animFrame.current); setAudioLevel([]); stream.getTracks().forEach(t=>t.stop());
        const blob=new Blob(audioChunks.current,{type:mime}); if(blob.size<1000){setTranscribing(false);return;}
        setTranscribing(true);
        try {
          const r=new FileReader(); r.readAsDataURL(blob);
          r.onload=async()=>{
            const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:300,messages:[{role:"user",content:[{type:"text",text:"Transcribe this audio. Return ONLY transcribed text."},{type:"document",source:{type:"base64",media_type:mime,data:r.result.split(",")[1]}}]}]})});
            const data=await res.json(); const text=data.content?.map(b=>b.text||"").join("").trim()||"";
            if(text){setInput(prev=>(prev+" "+text).trim());if(textareaRef.current)autoResize(textareaRef.current);}
            else setMicError("Couldn't hear anything.");
            setTranscribing(false);
          };
        } catch { setMicError("Transcription failed."); setTranscribing(false); }
      };
      rec.start(); mediaRec.current=rec; setRecording(true);
    } catch(err){ setMicError(err.name==="NotAllowedError"?"Microphone permission denied.":"Could not access microphone."); }
  };
  const stopRecording = () => { if(mediaRec.current&&recording){mediaRec.current.stop();setRecording(false);} };

  const sendMessage = async (text) => {
    const userText=(text||input).trim(); if((!userText&&!pendingImage)||loading) return;
    const userContent=[];
    if(pendingImage) userContent.push({type:"image",source:{type:"base64",media_type:pendingImage.mimeType,data:pendingImage.base64}});
    userContent.push({type:"text",text:userText||"What's in this image?"});
    const newMessages=[...messages,{role:"user",content:userContent,displayText:userText||"What's in this image?",image:pendingImage?.preview}];
    setMessages(newMessages); setInput(""); setPendingImage(null);
    if(textareaRef.current) textareaRef.current.style.height="auto";
    setLoading(true);
    try {
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1500,system:p.prompt,messages:newMessages.map(m=>({role:m.role,content:m.content}))})});
      const data=await res.json(); const reply=data.content?.map(b=>b.text||"").join("")||"Sorry, I couldn't respond.";
      setMessages(prev=>[...prev,{role:"assistant",content:reply,displayText:reply}]);
    } catch { setMessages(prev=>[...prev,{role:"assistant",content:"Something went wrong.",displayText:"Something went wrong."}]); }
    finally { setLoading(false); }
  };

  const canSend=(input.trim()||pendingImage)&&!loading;

  return (
    <div style={{fontFamily:"system-ui,sans-serif",background:"#0a0a0f",minHeight:"100vh",display:"flex",flexDirection:"column",color:"#e8e8f0",position:"relative"}}>
      <style>{keyframes}</style>
      <canvas ref={canvasRef} style={{display:"none"}}/>
      <input ref={fileInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleFileUpload}/>

      {toastMsg&&<div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",zIndex:200,background:"#1e1e2e",border:"1px solid #3a3a5a",borderRadius:24,padding:"10px 20px",fontSize:14,color:"#e8e8f0",boxShadow:"0 8px 32px rgba(0,0,0,0.5)",animation:"popIn 0.25s ease",whiteSpace:"nowrap"}}>{toastMsg}</div>}

      <header style={{padding:"14px 20px",borderBottom:"1px solid #1e1e2e",display:"flex",alignItems:"center",gap:12,background:"#0d0d16"}}>
        <div style={{width:34,height:34,borderRadius:"50%",background:`linear-gradient(135deg,${theme.accent},${theme.accent2})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,boxShadow:`0 0 18px ${theme.glow}`}}>{p.emoji}</div>
        <div>
          <div style={{fontSize:16,fontWeight:600,color:"#f0f0fa"}}>{p.name}</div>
          <div style={{fontSize:11,color:"#6b6b8a"}}>{p.desc}</div>
        </div>
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:7,height:7,borderRadius:"50%",background:"#4ade80",boxShadow:"0 0 6px #4ade80"}}/>
          <div style={{position:"relative"}}>
            <button onClick={()=>setShowUserMenu(v=>!v)} style={{width:34,height:34,borderRadius:"50%",border:`2px solid ${theme.accent}44`,background:"#13131f",cursor:"pointer",overflow:"hidden",padding:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
              {user.picture ? <img src={user.picture} alt={user.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/> : <span style={{fontSize:15,color:theme.accent}}>{user.name[0]}</span>}
            </button>
            {showUserMenu&&(
              <div style={{position:"absolute",right:0,top:42,background:"#0d0d16",border:"1px solid #2a2a3e",borderRadius:14,padding:8,minWidth:200,zIndex:100,boxShadow:"0 8px 32px rgba(0,0,0,0.5)",animation:"fadeIn 0.2s ease"}}>
                <div style={{padding:"10px 12px",borderBottom:"1px solid #1e1e2e",marginBottom:6}}>
                  <div style={{fontSize:14,fontWeight:600,color:"#f0f0fa"}}>{user.name}</div>
                  <div style={{fontSize:12,color:"#6b6b8a",marginTop:2}}>{user.email}</div>
                  {user.isDemo&&<div style={{fontSize:11,color:theme.accent,marginTop:4}}>Guest session</div>}
                </div>
                <button onClick={()=>setShowSettings(true)} style={{width:"100%",padding:"9px 12px",background:"none",border:"none",color:"#9090b8",fontSize:13,cursor:"pointer",textAlign:"left",borderRadius:8,fontFamily:"inherit",display:"flex",alignItems:"center",gap:8,transition:"background 0.15s"}} onMouseEnter={e=>e.currentTarget.style.background="#13131f"} onMouseLeave={e=>e.currentTarget.style.background="none"}>
                  ⚙️ Settings
                </button>
                <button onClick={onLogout} style={{width:"100%",padding:"9px 12px",background:"none",border:"none",color:"#f87171",fontSize:13,cursor:"pointer",textAlign:"left",borderRadius:8,fontFamily:"inherit",display:"flex",alignItems:"center",gap:8,transition:"background 0.15s"}} onMouseEnter={e=>e.currentTarget.style.background="#1a1a2e"} onMouseLeave={e=>e.currentTarget.style.background="none"}>
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div style={{flex:1,display:"flex",overflow:"hidden"}}>
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          {messages.length===0 ? (
            <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px",textAlign:"center"}}>
              <div style={{fontSize:48,marginBottom:16}}>✨</div>
              <div style={{fontSize:24,fontWeight:600,color:"#e8e8f0",marginBottom:8}}>Welcome, {user.name}!</div>
              <div style={{fontSize:14,color:"#6b6b8a",marginBottom:24,maxWidth:300}}>Start a conversation with {p.name}. Ask anything!</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,maxWidth:400,width:"100%"}}>
                {SUGGESTIONS.map((s,i)=><button key={i} onClick={()=>sendMessage(s)} style={{padding:"12px 16px",background:"#13131f",border:`1px solid ${theme.accent}33`,borderRadius:12,color:"#9090b8",fontSize:13,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s",whiteSpace:"normal",lineHeight:1.4}} onMouseEnter={e=>{e.currentTarget.style.background="#1a1a2e";e.currentTarget.style.borderColor=theme.accent+"66";e.currentTarget.style.color="#e8e8f0";}} onMouseLeave={e=>{e.currentTarget.style.background="#13131f";e.currentTarget.style.borderColor=theme.accent+"33";e.currentTarget.style.color="#9090b8";}}>{s}</button>)}
              </div>
            </div>
          ) : (
            <div style={{flex:1,overflowY:"auto",padding:"20px",display:"flex",flexDirection:"column",gap:16}}>
              {messages.map((msg,idx)=>(
                <div key={idx} style={{display:"flex",gap:12,animation:"slideIn 0.3s ease"}}>
                  {msg.role==="assistant" && <div style={{width:32,height:32,borderRadius:"50%",background:`linear-gradient(135deg,${theme.accent},${theme.accent2})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0,boxShadow:`0 0 12px ${theme.glow}`}}>{p.emoji}</div>}
                  <div style={{flex:1,maxWidth:"70%"}}>
                    {msg.image && <img src={msg.image} alt="uploaded" style={{maxWidth:"100%",borderRadius:12,marginBottom:8}} />}
                    <div style={{background:msg.role==="assistant"?"#13131f":theme.accent,padding:"12px 16px",borderRadius:12,color:msg.role==="assistant"?"#e8e8f0":"#000",lineHeight:1.5}}>
                      {msg.role==="assistant" ? <MathMessage text={msg.displayText} color="#e8e8f0" fs={fs} /> : msg.displayText}
                    </div>
                  </div>
                  {msg.role==="assistant" && (
                    <div style={{display:"flex",gap:6,opacity:0.7,fontSize:14}}>
                      <button onClick={()=>giveFeedback(idx,"like")} title="Like" style={{background:"none",border:"none",cursor:"pointer",padding:4,color:feedback[idx]==="like"?"#4ade80":"#6b6b8a",transition:"color 0.15s"}}>👍</button>
                      <button onClick={()=>giveFeedback(idx,"dislike")} title="Dislike" style={{background:"none",border:"none",cursor:"pointer",padding:4,color:feedback[idx]==="dislike"?"#f87171":"#6b6b8a",transition:"color 0.15s"}}>👎</button>
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div style={{display:"flex",gap:12,animation:"slideIn 0.3s ease"}}>
                  <div style={{width:32,height:32,borderRadius:"50%",background:`linear-gradient(135deg,${theme.accent},${theme.accent2})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0,boxShadow:`0 0 12px ${theme.glow}`}}>{p.emoji}</div>
                  <div style={{display:"flex",gap:4,alignItems:"center"}}>
                    {[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:theme.accent,animation:"bounce 1.4s ease infinite",animationDelay:`${i*0.2}s`}}/>)}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </div>

      <div style={{borderTop:"1px solid #1e1e2e",background:"#0d0d16",padding:"16px 20px",display:"flex",gap:12,alignItems:"flex-end"}}>
        <div style={{flex:1,display:"flex",gap:8}}>
          <button onClick={()=>fileInputRef.current?.click()} title="Upload image" style={{width:40,height:40,borderRadius:12,background:"#13131f",border:`1px solid ${theme.accent}33`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,transition:"all 0.15s"}} onMouseEnter={e=>{e.currentTarget.style.background="#1a1a2e";e.currentTarget.style.borderColor=theme.accent+"66";}} onMouseLeave={e=>{e.currentTarget.style.background="#13131f";e.currentTarget.style.borderColor=theme.accent+"33";}}>📁</button>
          <button onClick={()=>openCamera()} title="Camera" style={{width:40,height:40,borderRadius:12,background:"#13131f",border:`1px solid ${theme.accent}33`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,transition:"all 0.15s"}} onMouseEnter={e=>{e.currentTarget.style.background="#1a1a2e";e.currentTarget.style.borderColor=theme.accent+"66";}} onMouseLeave={e=>{e.currentTarget.style.background="#13131f";e.currentTarget.style.borderColor=theme.accent+"33";}}>📸</button>
          <button onClick={recording?stopRecording:startRecording} title={recording?"Stop recording":"Start recording"} style={{width:40,height:40,borderRadius:12,background:recording?"#f87171":"#13131f",border:`1px solid ${recording?"#f87171":theme.accent+"33"}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,transition:"all 0.15s",animation:recording?"pulse 1s ease infinite":"none"}} onMouseEnter={e=>{if(!recording){e.currentTarget.style.background="#1a1a2e";e.currentTarget.style.borderColor=theme.accent+"66";}}} onMouseLeave={e=>{if(!recording){e.currentTarget.style.background="#13131f";e.currentTarget.style.borderColor=theme.accent+"33";}}}
          >
            {transcribing?"⏳":recording?"⏹️":"🎤"}
          </button>
          {audioLevel.length>0 && (
            <div style={{display:"flex",alignItems:"center",gap:2,paddingLeft:8}}>
              {audioLevel.map((h,i)=><div key={i} style={{width:3,height:h,background:theme.accent,borderRadius:2,transition:"height 0.05s"}}/>)}
            </div>
          )}
        </div>
        <textarea ref={textareaRef} value={input} onChange={e=>{setInput(e.target.value);autoResize(e.target);}} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();canSend&&sendMessage();}}} placeholder="Message..." style={{flex:1,background:"#13131f",border:`1px solid ${theme.accent}33`,borderRadius:12,padding:"12px 16px",color:"#e8e8f0",fontSize:fs,fontFamily:"inherit",resize:"none",maxHeight:160,minHeight:44,outline:"none",transition:"border-color 0.15s"}} onFocus={e=>e.target.style.borderColor=theme.accent+"66"} onBlur={e=>e.target.style.borderColor=theme.accent+"33"}/>
        <button onClick={()=>canSend&&sendMessage()} style={{width:44,height:44,borderRadius:12,background:canSend?theme.accent:"#3a3a5a",cursor:canSend?"pointer":"not-allowed",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,border:"none",transition:"all 0.15s"}} onMouseEnter={e=>{if(canSend)e.currentTarget.style.background=theme.accent2;}} onMouseLeave={e=>{if(canSend)e.currentTarget.style.background=theme.accent;}}>✈️</button>
      </div>

      {showSettings && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,backdropFilter:"blur(4px)",animation:"fadeIn 0.2s ease"}} onClick={()=>setShowSettings(false)}>
          <div style={{background:"#0d0d16",border:`1px solid ${theme.accent}33`,borderRadius:20,padding:"24px",maxWidth:400,width:"90%",maxHeight:"80vh",overflowY:"auto",animation:"popIn 0.3s ease",boxShadow:"0 20px 60px rgba(0,0,0,0.6)"}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:20,fontWeight:700,color:"#f0f0fa",marginBottom:20}}>⚙️ Settings</div>
            <div style={{marginBottom:20}}>
              <div style={{fontSize:12,fontWeight:600,color:"#6b6b8a",marginBottom:10,textTransform:"uppercase"}}>AI Persona</div>
              <div style={{display:"flex",gap:8}}>
                {Object.entries(PERSONAS).map(([key,p])=>(
                  <button key={key} onClick={()=>setPersona(key)} style={{flex:1,padding:"10px 12px",background:persona===key?theme.accent:"#13131f",border:`1px solid ${persona===key?theme.accent:theme.accent+"33"}`,borderRadius:10,color:persona===key?"#000":"#9090b8",fontSize:12,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s",fontWeight:persona===key?600:400}}>{p.emoji} {p.name}</button>
                ))}
              </div>
            </div>
            <div style={{marginBottom:20}}>
              <div style={{fontSize:12,fontWeight:600,color:"#6b6b8a",marginBottom:10,textTransform:"uppercase"}}>Theme</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {Object.entries(THEMES).map(([key,t])=>(
                  <button key={key} onClick={()=>setThemeKey(key)} style={{padding:"10px 12px",background:"#13131f",border:`2px solid ${themeKey===key?t.accent:t.accent+"33"}`,borderRadius:10,color:"#9090b8",fontSize:11,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s",textTransform:"capitalize",fontWeight:themeKey===key?600:400}}>{key}</button>
                ))}
              </div>
            </div>
            <div style={{marginBottom:20}}>
              <div style={{fontSize:12,fontWeight:600,color:"#6b6b8a",marginBottom:10,textTransform:"uppercase"}}>Font Size</div>
              <div style={{display:"flex",gap:8}}>
                {Object.entries(FONT_SIZES).map(([key])=>(
                  <button key={key} onClick={()=>setFontSize(key)} style={{flex:1,padding:"8px 12px",background:fontSize===key?theme.accent:"#13131f",border:`1px solid ${fontSize===key?theme.accent:theme.accent+"33"}`,borderRadius:8,color:fontSize===key?"#000":"#9090b8",fontSize:11,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s",textTransform:"capitalize",fontWeight:fontSize===key?600:400}}>{key}</button>
                ))}
              </div>
            </div>
            <div style={{paddingBottom:16,borderBottom:`1px solid ${theme.accent}22`,marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{fontSize:13,color:"#9090b8"}}>🔊 Sound notifications</span>
              <button onClick={()=>setSoundEnabled(!soundEnabled)} style={{width:40,height:24,borderRadius:12,background:soundEnabled?theme.accent:"#3a3a5a",border:"none",cursor:"pointer",transition:"all 0.15s",position:"relative"}}>
                <div style={{width:20,height:20,borderRadius:10,background:"#fff",position:"absolute",top:2,left:soundEnabled?18:2,transition:"left 0.15s"}}/>
              </button>
            </div>
            <button onClick={()=>setShowSettings(false)} style={{width:"100%",padding:"10px 16px",background:theme.accent,border:"none",borderRadius:10,color:"#000",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s"}} onMouseEnter={e=>e.currentTarget.style.background=theme.accent2} onMouseLeave={e=>e.currentTarget.style.background=theme.accent}>Done</button>
          </div>
        </div>
      )}

      {showCamera && (
        <div style={{position:"fixed",inset:0,background:"#000",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:1000}}>
          <video ref={videoRef} style={{width:"100%",height:"100%",objectFit:"cover"}} />
          <div style={{position:"absolute",bottom:20,left:"50%",transform:"translateX(-50%)",display:"flex",gap:12}}>
            <button onClick={flipCamera} style={{width:48,height:48,borderRadius:"50%",background:"rgba(255,255,255,0.2)",border:"2px solid #fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color:"#fff",transition:"background 0.15s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.3)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.2)"}>🔄</button>
            <button onClick={capturePhoto} style={{width:60,height:60,borderRadius:"50%",background:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,transition:"background 0.15s"}} onMouseEnter={e=>e.currentTarget.style.background="#f0f0f0"} onMouseLeave={e=>e.currentTarget.style.background="#fff"}>📷</button>
            <button onClick={stopCamera} style={{width:48,height:48,borderRadius:"50%",background:"rgba(255,255,255,0.2)",border:"2px solid #fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color:"#fff",transition:"background 0.15s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.3)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.2)"}>✕</button>
          </div>
        </div>
      )}

      {micError && <div style={{position:"fixed",bottom:20,left:20,background:"#f87171",color:"#fff",padding:"12px 16px",borderRadius:10,fontSize:13,zIndex:100,animation:"slideIn 0.3s ease"}}>{micError}</div>}
    </div>
  );
}
