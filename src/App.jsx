import { useState, useEffect, useRef } from "react";

/* ─── Leaflet via CDN ─────────────────────────────────────────────── */
function useLeaflet(cb) {
  useEffect(() => {
    if (window.L) { cb(window.L); return; }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    script.onload = () => cb(window.L);
    document.head.appendChild(script);
  }, []);
}

/* ─── Data ────────────────────────────────────────────────────────── */
const STAGES = [
  { day:1,  from:"Saint-Jean-Pied-de-Port", to:"Roncesvalles",          km:25.1, lat:43.1636, lng:-1.2386 },
  { day:2,  from:"Roncesvalles",            to:"Zubiri",                 km:21.9, lat:43.0094, lng:-1.3194 },
  { day:3,  from:"Zubiri",                  to:"Pamplona",               km:20.0, lat:42.9479, lng:-1.6440 },
  { day:4,  from:"Pamplona",                to:"Puente la Reina",        km:23.7, lat:42.6717, lng:-1.8142 },
  { day:5,  from:"Puente la Reina",         to:"Estella",                km:22.0, lat:42.6717, lng:-2.0322 },
  { day:6,  from:"Estella",                 to:"Logroño",                km:47.7, lat:42.4669, lng:-2.4452 },
  { day:7,  from:"Logroño",                 to:"Nájera",                 km:29.4, lat:42.4168, lng:-2.7291 },
  { day:8,  from:"Nájera",                  to:"Burgos",                 km:65.0, lat:42.3440, lng:-3.6970 },
  { day:9,  from:"Burgos",                  to:"Frómista",               km:49.5, lat:42.2671, lng:-4.4055 },
  { day:10, from:"Frómista",                to:"Sahagún",                km:56.3, lat:42.3683, lng:-5.0295 },
  { day:11, from:"Sahagún",                 to:"León",                   km:66.5, lat:42.5988, lng:-5.5671 },
  { day:12, from:"León",                    to:"Astorga",                km:46.3, lat:42.4587, lng:-6.0554 },
  { day:13, from:"Astorga",                 to:"O Cebreiro",             km:98.4, lat:42.7074, lng:-6.9972 },
  { day:14, from:"O Cebreiro",              to:"Triacastela",            km:20.9, lat:42.7537, lng:-7.2342 },
  { day:15, from:"Triacastela",             to:"Sarria",                 km:18.7, lat:42.7803, lng:-7.4145 },
  { day:16, from:"Sarria",                  to:"Portomarín",             km:22.7, lat:42.8079, lng:-7.6168 },
  { day:17, from:"Portomarín",              to:"Palas de Rei",           km:24.8, lat:42.8726, lng:-7.8667 },
  { day:18, from:"Palas de Rei",            to:"Arzúa",                  km:29.0, lat:42.9295, lng:-8.1617 },
  { day:19, from:"Arzúa",                   to:"Monte do Gozo",          km:38.6, lat:42.9068, lng:-8.4419 },
  { day:20, from:"Monte do Gozo",           to:"Santiago de Compostela", km:4.9,  lat:42.8782, lng:-8.5448 },
];
const TOTAL_KM = 800;

const TASKS = [
  { id:"reflection",  icon:"✍️", label:"Write a reflection",    desc:"One thought from today's walk" },
  { id:"conversation",icon:"💬", label:"Note a conversation",   desc:"Someone you spoke with today" },
  { id:"selfie",      icon:"🤳", label:"Post a selfie",         desc:"You on the Camino today" },
  { id:"photo",       icon:"📷", label:"Post a standout photo", desc:"One image that told the story" },
];

const QUOTES = [
  "The Camino provides.",
  "Buen Camino, peregrino.",
  "Not all who wander are lost.",
  "Every step is a prayer.",
  "The journey is the destination.",
  "Walk as if you are kissing the earth.",
  "The road is long but the heart grows stronger.",
  "Pilgrim, your footprints are the road.",
  "An arrow will always show you the way.",
  "It does not matter how slowly you go.",
];

/* ─── Style tokens ────────────────────────────────────────────────── */
const C = {
  bg:      "#120b00",
  surface: "rgba(255,255,255,0.04)",
  border:  "rgba(212,175,55,0.18)",
  gold:    "#d4af37",
  goldHi:  "#f0c040",
  text:    "#ede0c0",
  muted:   "#a8915a",
  faint:   "#5a4020",
};

const card = (extra={}) => ({
  background: C.surface,
  border: `1px solid ${C.border}`,
  borderRadius: "10px",
  overflow: "hidden",
  ...extra,
});

const cardHead = {
  padding: "0.85rem 1.3rem",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
  display: "flex", justifyContent: "space-between", alignItems: "center",
};

const lbl = { fontSize:"0.62rem", letterSpacing:"0.25em", textTransform:"uppercase", color:C.gold };

/* ─── Shell ───────────────────────────────────────────────────────── */
function Shell({ children }) {
  return (
    <div style={{
      minHeight:"100vh",
      background:`linear-gradient(155deg,#120b00 0%,#1e1000 50%,#120b00 100%)`,
      fontFamily:"'Palatino Linotype','Book Antiqua',Palatino,serif",
      color:C.text, position:"relative", overflowX:"hidden",
    }}>
      <div style={{
        position:"fixed",inset:0,pointerEvents:"none",zIndex:0,
        background:"radial-gradient(ellipse at 50% 0%,rgba(212,175,55,0.05) 0%,transparent 70%)",
      }}/>
      <div style={{position:"relative",zIndex:1,maxWidth:"740px",margin:"0 auto",paddingBottom:"3rem"}}>
        {children}
      </div>
    </div>
  );
}

/* ─── Header ──────────────────────────────────────────────────────── */
function Header({ day }) {
  const q = QUOTES[(day-1) % QUOTES.length];
  return (
    <div style={{textAlign:"center",padding:"2rem 1rem 0.5rem"}}>
      <div style={{
        display:"inline-block", border:"1px solid rgba(212,175,55,0.3)",
        padding:"0.25rem 1.1rem", borderRadius:"2px",
        fontSize:"0.58rem", letterSpacing:"0.35em", color:C.gold,
        textTransform:"uppercase", marginBottom:"0.7rem",
      }}>Camino de Santiago · Pilgrim's Journal</div>
      <h1 style={{
        fontSize:"clamp(2rem,6vw,3rem)", fontWeight:"normal",
        margin:"0 0 0.25rem", color:"#f9f0dc",
        letterSpacing:"0.06em", lineHeight:1.1,
      }}>Day {day}</h1>
      <p style={{fontSize:"0.83rem",color:C.muted,fontStyle:"italic",margin:0}}>"{q}"</p>
    </div>
  );
}

/* ─── Progress bar ────────────────────────────────────────────────── */
function ProgressBar({ kmWalked }) {
  const pct = Math.min(100,(kmWalked/TOTAL_KM)*100);
  const remaining = Math.max(0,TOTAL_KM-kmWalked).toFixed(1);
  return (
    <div style={{padding:"0 1.1rem 0.5rem"}}>
      <div style={{...card(),padding:"1.1rem 1.3rem"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:"0.5rem"}}>
          <span style={lbl}>Journey Progress</span>
          <span style={{fontSize:"1.5rem",fontWeight:"bold",color:C.goldHi}}>{pct.toFixed(1)}%</span>
        </div>
        <div style={{height:"8px",background:"rgba(255,255,255,0.07)",borderRadius:"4px",overflow:"hidden"}}>
          <div style={{
            height:"100%", width:`${pct}%`,
            background:"linear-gradient(90deg,#7a4f00,#d4af37,#f0c040)",
            borderRadius:"4px", transition:"width 0.9s ease",
            boxShadow:"0 0 12px rgba(240,192,64,0.5)",
          }}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:"0.5rem",fontSize:"0.7rem",color:C.faint}}>
          <span>🏁 Saint-Jean</span>
          <span style={{color:C.muted}}>{kmWalked.toFixed(1)} km · {remaining} km left</span>
          <span>⛪ Santiago</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Stats ───────────────────────────────────────────────────────── */
function Stats({ day }) {
  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0.7rem",padding:"0 1.1rem 0.5rem"}}>
      {[
        {icon:"🥾", val:day,             lbl:"Days Walked"},
        {icon:"🌄", val:STAGES.length-day, lbl:"Days Left"},
        {icon:"⛪", val:STAGES.length,  lbl:"Total Days"},
      ].map(s=>(
        <div key={s.lbl} style={{...card({padding:"0.9rem",textAlign:"center"})}}>
          <div style={{fontSize:"1.3rem"}}>{s.icon}</div>
          <div style={{fontSize:"1.9rem",fontWeight:"bold",color:C.gold,lineHeight:1.1}}>{s.val}</div>
          <div style={{fontSize:"0.58rem",letterSpacing:"0.15em",textTransform:"uppercase",color:C.faint,marginTop:"0.2rem"}}>{s.lbl}</div>
        </div>
      ))}
    </div>
  );
}

/* ─── Checklist ───────────────────────────────────────────────────── */
function Checklist({ tasks, onToggle }) {
  const done = tasks.filter(t=>t.done).length;
  const all  = done === TASKS.length;
  return (
    <div style={{padding:"0 1.1rem 0.5rem"}}>
      <div style={{...card(),border:`1px solid ${all?"rgba(212,175,55,0.55)":C.border}`,transition:"border-color 0.4s"}}>
        <div style={{...cardHead,background:all?"rgba(212,175,55,0.08)":"transparent"}}>
          <span style={lbl}>Daily Checklist</span>
          <span style={{fontSize:"0.78rem",color:all?C.gold:C.muted,fontWeight:all?"bold":"normal"}}>
            {all?"✦ Day Complete ✦":`${done} / ${TASKS.length}`}
          </span>
        </div>
        {TASKS.map((t,i)=>{
          const td = tasks[i];
          return (
            <div key={t.id} onClick={()=>onToggle(t.id)} style={{
              display:"flex", alignItems:"center", gap:"0.9rem",
              padding:"0.9rem 1.3rem",
              borderBottom:i<TASKS.length-1?"1px solid rgba(255,255,255,0.05)":"none",
              cursor:"pointer",
              background:td.done?"rgba(212,175,55,0.05)":"transparent",
              transition:"background 0.2s",
            }}>
              <div style={{
                width:"20px", height:"20px", borderRadius:"50%", flexShrink:0,
                border:`2px solid ${td.done?C.gold:"rgba(212,175,55,0.25)"}`,
                background:td.done?C.gold:"transparent",
                display:"flex", alignItems:"center", justifyContent:"center",
                transition:"all 0.25s", fontSize:"0.65rem", color:"#120b00", fontWeight:"bold",
              }}>{td.done&&"✓"}</div>
              <span style={{fontSize:"1.2rem",flexShrink:0}}>{t.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:"0.88rem",color:td.done?C.faint:C.text,textDecoration:td.done?"line-through":"none"}}>{t.label}</div>
                <div style={{fontSize:"0.68rem",color:C.faint,marginTop:"0.1rem"}}>{t.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Photo slot ──────────────────────────────────────────────────── */
function PhotoSlot({ capture, icon, title, desc, value, onChange }) {
  const ref = useRef();
  const onFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => onChange(ev.target.result);
    reader.readAsDataURL(file);
  };
  return (
    <div style={{flex:1,minWidth:"130px"}}>
      <input ref={ref} type="file" accept="image/*" capture={capture}
        style={{display:"none"}} onChange={onFile}/>
      <div onClick={()=>ref.current.click()} style={{
        border:`1px dashed ${value?"rgba(212,175,55,0.55)":C.border}`,
        borderRadius:"8px", aspectRatio:"1", cursor:"pointer",
        overflow:"hidden", position:"relative",
        background:value?"#000":"rgba(255,255,255,0.02)",
        transition:"border-color 0.3s",
      }}>
        {value ? (
          <>
            <img src={value} alt={title} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
            <div style={{
              position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",
              display:"flex",alignItems:"center",justifyContent:"center",
              opacity:0,transition:"opacity 0.2s",
            }}
              onMouseEnter={e=>e.currentTarget.style.opacity=1}
              onMouseLeave={e=>e.currentTarget.style.opacity=0}
            >
              <span style={{fontSize:"0.68rem",color:"#fff",letterSpacing:"0.1em"}}>Change</span>
            </div>
          </>
        ) : (
          <div style={{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"0.4rem",padding:"1rem"}}>
            <span style={{fontSize:"1.9rem"}}>{icon}</span>
            <span style={{fontSize:"0.68rem",textAlign:"center",color:C.muted,lineHeight:1.3}}>{title}</span>
            <span style={{fontSize:"0.58rem",textAlign:"center",color:C.faint,lineHeight:1.3}}>{desc}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Memories (photos) ───────────────────────────────────────────── */
function MemoriesSection({ dayData, onUpdate }) {
  return (
    <div style={{padding:"0 1.1rem 0.5rem"}}>
      <div style={card()}>
        <div style={cardHead}>
          <span style={lbl}>📸 Day's Photos</span>
          <span style={{fontSize:"0.68rem",color:C.faint}}>Tap to upload</span>
        </div>
        <div style={{padding:"1rem 1.1rem",display:"flex",gap:"0.8rem",flexWrap:"wrap"}}>
          <PhotoSlot capture="user" icon="🤳" title="Today's Selfie" desc="A photo of you"
            value={dayData.selfie} onChange={v=>onUpdate({selfie:v})}/>
          <PhotoSlot capture="environment" icon="📷" title="Standout Photo" desc="Best image of the day"
            value={dayData.standout} onChange={v=>onUpdate({standout:v})}/>
        </div>
      </div>
    </div>
  );
}

/* ─── Text note ───────────────────────────────────────────────────── */
function TextNote({ heading, icon, placeholder, value, onChange }) {
  return (
    <div style={{padding:"0 1.1rem 0.5rem"}}>
      <div style={card()}>
        <div style={cardHead}>
          <span style={lbl}>{icon} {heading}</span>
        </div>
        <div style={{padding:"0.9rem 1.1rem"}}>
          <textarea value={value} onChange={e=>onChange(e.target.value)}
            placeholder={placeholder}
            style={{
              width:"100%", minHeight:"95px",
              background:"rgba(255,255,255,0.03)",
              border:"1px solid rgba(212,175,55,0.15)",
              borderRadius:"6px", color:C.text,
              fontFamily:"'Palatino Linotype',Palatino,serif",
              fontSize:"0.86rem", padding:"0.75rem",
              resize:"vertical", outline:"none",
              lineHeight:1.7, boxSizing:"border-box",
            }}/>
        </div>
      </div>
    </div>
  );
}

/* ─── Geographic Map ──────────────────────────────────────────────── */
function GeoMap({ currentDay, allDayData }) {
  const mapRef = useRef(null);
  const mapInst = useRef(null);

  useLeaflet((L) => {
    if (mapInst.current) { mapInst.current.remove(); mapInst.current = null; }
    if (!mapRef.current) return;

    const map = L.map(mapRef.current, { center:[42.6,-4.5], zoom:6, zoomControl:true, attributionControl:false });
    mapInst.current = map;

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",{maxZoom:19}).addTo(map);

    // Full dashed route
    L.polyline(STAGES.map(s=>[s.lat,s.lng]),{color:"rgba(212,175,55,0.2)",weight:2,dashArray:"6 5"}).addTo(map);

    // Walked portion glowing
    const walked = STAGES.slice(0,currentDay).map(s=>[s.lat,s.lng]);
    if (walked.length>1) L.polyline(walked,{color:"#d4af37",weight:4,opacity:0.9}).addTo(map);

    STAGES.forEach((s,i)=>{
      const isWalked  = i < currentDay;
      const isCurrent = i === currentDay-1;
      const dd = allDayData[s.day]||{};
      const thumb = dd.standout||dd.selfie||null;

      let html;
      if (isCurrent) {
        html = `<div style="width:22px;height:22px;border-radius:50%;background:#f0c040;
          border:2px solid #fff;box-shadow:0 0 14px rgba(240,192,64,0.95);
          display:flex;align-items:center;justify-content:center;font-size:11px;">🚶</div>`;
      } else if (thumb) {
        html = `<div style="width:28px;height:28px;border-radius:50%;overflow:hidden;
          border:2px solid #d4af37;box-shadow:0 0 6px rgba(212,175,55,0.6);">
          <img src="${thumb}" style="width:100%;height:100%;object-fit:cover;"/></div>`;
      } else if (isWalked) {
        html = `<div style="width:10px;height:10px;border-radius:50%;background:#d4af37;opacity:0.8;"></div>`;
      } else {
        html = `<div style="width:8px;height:8px;border-radius:50%;background:rgba(212,175,55,0.15);border:1px solid rgba(212,175,55,0.35);"></div>`;
      }

      const icon = L.divIcon({html, className:"", iconAnchor:[isCurrent?11:thumb?14:5, isCurrent?11:thumb?14:5]});

      const popupHtml = `
        <div style="font-family:Palatino,serif;color:#ede0c0;min-width:150px;max-width:190px;">
          <div style="font-size:0.6rem;letter-spacing:0.12em;text-transform:uppercase;color:#d4af37;margin-bottom:3px;">Day ${s.day}</div>
          <div style="font-size:0.88rem;font-weight:bold;margin-bottom:1px;">${s.to}</div>
          <div style="font-size:0.68rem;color:#a8915a;margin-bottom:6px;">${s.km} km</div>
          ${dd.standout?`<img src="${dd.standout}" style="width:100%;border-radius:4px;margin-bottom:5px;display:block;max-height:110px;object-fit:cover;"/>`:
            dd.selfie?`<img src="${dd.selfie}" style="width:100%;border-radius:4px;margin-bottom:5px;display:block;max-height:110px;object-fit:cover;"/>`:""}
          ${dd.reflection?`<div style="font-size:0.7rem;color:#c0a870;font-style:italic;border-top:1px solid rgba(255,255,255,0.1);padding-top:4px;line-height:1.4;">${dd.reflection.slice(0,100)}${dd.reflection.length>100?"…":""}</div>`:""}
          ${dd.conversation?`<div style="font-size:0.66rem;color:#7a6040;margin-top:3px;">💬 ${dd.conversation.slice(0,80)}${dd.conversation.length>80?"…":""}</div>`:""}
        </div>`;

      L.marker([s.lat,s.lng],{icon}).addTo(map)
        .bindPopup(popupHtml,{maxWidth:200,className:"camino-popup"});
    });

    if (walked.length>1) map.fitBounds(L.latLngBounds(walked),{padding:[40,40]});
  });

  useEffect(()=>()=>{if(mapInst.current){mapInst.current.remove();}}, []);

  return (
    <div style={{padding:"0 1.1rem 0.5rem"}}>
      <div style={card()}>
        <div style={cardHead}>
          <span style={lbl}>🗺️ Geographic Route Map</span>
          <span style={{fontSize:"0.68rem",color:C.faint}}>Click markers for memories</span>
        </div>
        <div ref={mapRef} style={{height:"420px",width:"100%"}}/>
        <div style={{display:"flex",gap:"1.2rem",padding:"0.7rem 1.1rem",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
          <div style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"0.65rem",color:C.muted}}>
            <div style={{width:"20px",height:"3px",background:C.gold,borderRadius:"2px"}}/>Walked
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"0.65rem",color:C.faint}}>
            <div style={{width:"20px",height:"2px",borderTop:"2px dashed rgba(212,175,55,0.3)"}}/>Remaining
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"0.65rem",color:C.muted}}>
            <div style={{width:"12px",height:"12px",borderRadius:"50%",background:"rgba(212,175,55,0.3)",border:"1px solid #d4af37",overflow:"hidden",fontSize:"7px",textAlign:"center",lineHeight:"12px"}}>📷</div>Has photo
          </div>
        </div>
      </div>
      <style>{`
        .camino-popup .leaflet-popup-content-wrapper{background:rgba(18,11,0,0.96)!important;border:1px solid rgba(212,175,55,0.3)!important;border-radius:8px!important;box-shadow:0 6px 24px rgba(0,0,0,0.7)!important;color:#ede0c0!important;}
        .camino-popup .leaflet-popup-tip{background:rgba(18,11,0,0.96)!important;}
        .camino-popup .leaflet-popup-close-button{color:#d4af37!important;}
        .leaflet-control-zoom a{background:rgba(18,11,0,0.9)!important;color:#d4af37!important;border-color:rgba(212,175,55,0.3)!important;}
        .leaflet-control-attribution{display:none!important;}
      `}</style>
    </div>
  );
}

/* ─── Gallery ─────────────────────────────────────────────────────── */
function Gallery({ allDayData }) {
  const entries = Object.entries(allDayData)
    .filter(([,d])=>d.selfie||d.standout||d.reflection||d.conversation)
    .sort((a,b)=>parseInt(a[0])-parseInt(b[0]));

  if (!entries.length) return (
    <div style={{padding:"0 1.1rem"}}>
      <div style={{...card(),padding:"3rem 1.5rem",textAlign:"center"}}>
        <div style={{fontSize:"2.5rem",marginBottom:"0.7rem"}}>📖</div>
        <div style={{color:C.muted,fontSize:"0.88rem",marginBottom:"0.3rem"}}>Your journey memories will live here.</div>
        <div style={{color:C.faint,fontSize:"0.72rem",fontStyle:"italic"}}>Add photos, reflections and conversations each day.</div>
      </div>
    </div>
  );

  return (
    <div style={{padding:"0 1.1rem"}}>
      <div style={card()}>
        <div style={cardHead}>
          <span style={lbl}>📖 Journey Gallery</span>
          <span style={{fontSize:"0.68rem",color:C.faint}}>{entries.length} days captured</span>
        </div>
        <div style={{padding:"1rem"}}>
          {entries.map(([day,data])=>{
            const s = STAGES[parseInt(day)-1];
            return (
              <div key={day} style={{marginBottom:"1.4rem",paddingBottom:"1.4rem",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                <div style={{fontSize:"0.62rem",letterSpacing:"0.2em",textTransform:"uppercase",color:C.gold,marginBottom:"0.6rem"}}>
                  Day {day} · {s?.from} → {s?.to} &nbsp;·&nbsp; {s?.km} km
                </div>
                {(data.selfie||data.standout) && (
                  <div style={{display:"flex",gap:"0.6rem",marginBottom:"0.7rem"}}>
                    {data.selfie && (
                      <div style={{flexShrink:0,width:"90px",height:"90px",borderRadius:"6px",overflow:"hidden"}}>
                        <img src={data.selfie} alt="selfie" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                      </div>
                    )}
                    {data.standout && (
                      <div style={{flex:1,borderRadius:"6px",overflow:"hidden",maxHeight:"160px"}}>
                        <img src={data.standout} alt="standout" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                      </div>
                    )}
                  </div>
                )}
                {data.reflection && (
                  <p style={{
                    margin:"0 0 0.5rem",fontSize:"0.84rem",fontStyle:"italic",
                    color:C.muted,lineHeight:1.65,
                    borderLeft:"2px solid rgba(212,175,55,0.3)",paddingLeft:"0.75rem",
                  }}>{data.reflection}</p>
                )}
                {data.conversation && (
                  <div style={{
                    fontSize:"0.75rem",color:C.faint,lineHeight:1.55,
                    background:"rgba(255,255,255,0.02)",borderRadius:"4px",
                    padding:"0.5rem 0.7rem",
                  }}>
                    <span style={{color:C.gold,marginRight:"0.4rem"}}>💬</span>
                    {data.conversation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Day Selector ────────────────────────────────────────────────── */
function DaySelector({ current, onSelect, allDayData }) {
  return (
    <div style={{padding:"0.6rem 1.1rem"}}>
      <div style={{...card(),padding:"0.9rem 1.1rem"}}>
        <div style={{display:"flex",alignItems:"center",gap:"0.8rem",flexWrap:"wrap"}}>
          <span style={{...lbl,flexShrink:0}}>Select Day</span>
          <div style={{display:"flex",gap:"0.32rem",flexWrap:"wrap"}}>
            {STAGES.map(s=>{
              const dd = allDayData[s.day]||{};
              const has = dd.selfie||dd.standout||dd.reflection||dd.conversation;
              const isCur = s.day===current;
              return (
                <button key={s.day} onClick={()=>onSelect(s.day)} style={{
                  width:"30px",height:"30px",borderRadius:"50%",
                  border:`1px solid ${isCur?C.gold:"rgba(212,175,55,0.2)"}`,
                  background:isCur?"rgba(212,175,55,0.25)":has?"rgba(212,175,55,0.07)":"transparent",
                  color:isCur?C.gold:has?C.muted:C.faint,
                  fontSize:"0.68rem",cursor:"pointer",transition:"all 0.2s",
                  fontFamily:"inherit",position:"relative",
                }}>
                  {s.day}
                  {has&&!isCur&&<span style={{position:"absolute",top:"1px",right:"1px",width:"5px",height:"5px",borderRadius:"50%",background:C.gold,opacity:0.7}}/>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Tab bar ─────────────────────────────────────────────────────── */
function TabBar({ active, onChange }) {
  return (
    <div style={{display:"flex",justifyContent:"center",padding:"0.8rem 1.1rem 0.4rem"}}>
      <div style={{display:"flex",border:"1px solid rgba(212,175,55,0.2)",borderRadius:"6px",overflow:"hidden"}}>
        {[{id:"today",label:"Today"},{id:"map",label:"Map"},{id:"gallery",label:"Gallery"}].map((t,i)=>(
          <button key={t.id} onClick={()=>onChange(t.id)} style={{
            padding:"0.5rem 1.3rem",
            background:active===t.id?"rgba(212,175,55,0.18)":"transparent",
            borderLeft:i>0?"1px solid rgba(212,175,55,0.2)":"none",
            color:active===t.id?C.gold:C.faint,
            fontSize:"0.72rem",letterSpacing:"0.18em",textTransform:"uppercase",
            cursor:"pointer",transition:"all 0.2s",fontFamily:"inherit",
          }}>{t.label}</button>
        ))}
      </div>
    </div>
  );
}

/* ─── App root ────────────────────────────────────────────────────── */
export default function CaminoApp() {
  const [day, setDay]        = useState(1);
  const [tab, setTab]        = useState("today");
  const [tasksByDay, setTBD] = useState({});
  const [allDayData, setADD] = useState({});

  const stage   = STAGES[day-1];
  const kmWalked = STAGES.slice(0,day).reduce((s,st)=>s+st.km,0);
  const tasks   = tasksByDay[day] || TASKS.map(t=>({...t,done:false}));
  const dayData = allDayData[day] || {};

  const toggleTask = (id) => {
    setTBD(p=>({...p,[day]:(p[day]||tasks).map(t=>t.id===id?{...t,done:!t.done}:t)}));
  };

  const updateDayData = (patch) => {
    setADD(p=>({...p,[day]:{...(p[day]||{}), ...patch}}));
    // Auto-tick checklist when content added
    setTBD(p=>{
      const cur = p[day]||tasks;
      let upd = [...cur];
      if (patch.selfie)       upd = upd.map(t=>t.id==="selfie"?{...t,done:true}:t);
      if (patch.standout)     upd = upd.map(t=>t.id==="photo"?{...t,done:true}:t);
      if (patch.reflection)   upd = upd.map(t=>t.id==="reflection"?{...t,done:true}:t);
      if (patch.conversation) upd = upd.map(t=>t.id==="conversation"?{...t,done:true}:t);
      return {...p,[day]:upd};
    });
  };

  return (
    <Shell>
      <Header day={day}/>
      <TabBar active={tab} onChange={setTab}/>
      <DaySelector current={day} onSelect={setDay} allDayData={allDayData}/>

      {tab==="today" && <>
        <Stats day={day}/>
        <ProgressBar kmWalked={kmWalked}/>
        <div style={{padding:"0 1.1rem 0.4rem",textAlign:"center",fontSize:"0.78rem",color:C.muted}}>
          📍 {stage.from} → {stage.to} &nbsp;·&nbsp; {stage.km} km today
        </div>
        <Checklist tasks={tasks} onToggle={toggleTask}/>
        <MemoriesSection dayData={dayData} onUpdate={updateDayData}/>
        <TextNote heading="Reflection" icon="✍️"
          placeholder="What moved you today? What did the road teach you..."
          value={dayData.reflection||""} onChange={v=>updateDayData({reflection:v})}/>
        <TextNote heading="A Conversation" icon="💬"
          placeholder="Who did you meet? What was said? A moment of connection on the path..."
          value={dayData.conversation||""} onChange={v=>updateDayData({conversation:v})}/>
      </>}

      {tab==="map" && <>
        <ProgressBar kmWalked={kmWalked}/>
        <GeoMap currentDay={day} allDayData={allDayData}/>
        <div style={{padding:"0 1.1rem 0.5rem",fontSize:"0.7rem",color:C.faint,textAlign:"center",fontStyle:"italic"}}>
          As you add photos each day, they'll appear as thumbnail markers on the map.
        </div>
      </>}

      {tab==="gallery" && <Gallery allDayData={allDayData}/>}

      <div style={{textAlign:"center",padding:"1.5rem 1rem 0.5rem",fontSize:"0.58rem",color:"#3a2a10",letterSpacing:"0.3em",textTransform:"uppercase"}}>
        Ultreia et Suseia · Onward and Upward
      </div>
    </Shell>
  );
}
