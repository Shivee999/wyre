(function(){
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  requestAnimationFrame(function(){ document.body.classList.add("loaded"); });

  /* lifestyle panel: background moves slower than scroll (parallax) */
  var bg = document.getElementById("parallaxBg");
  var section = document.getElementById("lifestyle");
  if (bg && section && !reduced){
    var ticking = false;
    var move = function(){
      ticking = false;
      var r = section.getBoundingClientRect();
      var vh = window.innerHeight || 1;
      if (r.bottom < 0 || r.top > vh) return;
      var progress = (vh - r.top) / (vh + r.height);
      var shift = (progress - 0.5) * 70;
      bg.style.transform = "translateY(" + shift.toFixed(1) + "px) scale(1.08)";
    };
    window.addEventListener("scroll", function(){
      if (!ticking){ ticking = true; requestAnimationFrame(move); }
    }, {passive:true});
    window.addEventListener("resize", move, {passive:true});
    move();
  }

  /* connector switch */
  var COPY = {
    usbc: {name:"USB-C",connector:"USB-C",fits:"iPhone 15 and later, iPad with USB-C, Mac, and Android or Windows devices that support USB-C audio",audio:"Built-in DAC in the connector \u2014 no adapter, no dongle",auth:"Not required. USB-C audio is an open standard."},
    lightning: {name:"Lightning",connector:"Lightning",fits:"iPhone 14 and earlier, and iPads with a Lightning port",audio:"Built-in DAC in the connector \u2014 no adapter, no dongle",auth:"Uses an authentication chip so iOS recognises the accessory on plug-in"}
  };
  var tabs   = Array.prototype.slice.call(document.querySelectorAll(".toggle button"));
  var shapes = Array.prototype.slice.call(document.querySelectorAll(".plug-shape"));
  var panel  = document.getElementById("panel-specs");
  var plugNm = document.getElementById("plug-name");

  function select(variant){
    var data = COPY[variant];
    if (!data) return;
    tabs.forEach(function(t){
      var on = t.getAttribute("data-variant") === variant;
      t.setAttribute("aria-selected", on ? "true" : "false");
      if (on && panel) panel.setAttribute("aria-labelledby", t.id);
    });
    shapes.forEach(function(s){
      s.setAttribute("data-off", s.getAttribute("data-variant") === variant ? "false" : "true");
    });
    if (plugNm) plugNm.textContent = data.name;
    ["connector","fits","audio","auth"].forEach(function(key){
      var cell = document.querySelector('[data-spec="' + key + '"]');
      if (!cell) return;
      if (reduced){ cell.textContent = data[key]; return; }
      cell.style.transition = "opacity 180ms ease";
      cell.style.opacity = "0";
      window.setTimeout(function(){ cell.textContent = data[key]; cell.style.opacity = "1"; }, 180);
    });
  }
  tabs.forEach(function(tab, i){
    tab.addEventListener("click", function(){ select(tab.getAttribute("data-variant")); });
    tab.addEventListener("keydown", function(e){
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      var next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
      next.focus(); select(next.getAttribute("data-variant"));
    });
  });

  /* UPI: copy-to-clipboard */
  var copyBtn = document.getElementById("copyUpiBtn");
  var upiText = document.getElementById("upiIdText");
  if (copyBtn && upiText){
    copyBtn.addEventListener("click", function(){
      var id = upiText.textContent.trim();
      var done = function(){
        copyBtn.setAttribute("data-copied","true");
        copyBtn.textContent = "Copied";
        window.setTimeout(function(){
          copyBtn.removeAttribute("data-copied");
          copyBtn.textContent = "Copy";
        }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(id).then(done).catch(function(){
          window.prompt("Copy UPI ID:", id);
        });
      } else {
        window.prompt("Copy UPI ID:", id);
      }
    });
  }

  /* scroll reveal */
  var revealables = document.querySelectorAll(".reveal");
  if (reduced || !("IntersectionObserver" in window)){
    Array.prototype.forEach.call(revealables, function(el){ el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (!en.isIntersecting) return;
        en.target.classList.add("in");
        io.unobserve(en.target);
      });
    }, {threshold:0.14, rootMargin:"0px 0px -8% 0px"});
    Array.prototype.forEach.call(revealables, function(el, i){
      el.style.transitionDelay = (Math.min(i, 4) * 70) + "ms";
      io.observe(el);
    });
  }
})();

/* ==========================================================
   WYRE motion engine
   ========================================================== */
(function(){
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- scroll progress ---- */
  var bar = document.getElementById("progBar");
  function onScroll(){
    if(!bar) return;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var p = h > 0 ? (window.scrollY / h) * 100 : 0;
    bar.style.width = p.toFixed(2) + "%";
  }
  window.addEventListener("scroll", onScroll, {passive:true});
  onScroll();

  if (reduced) return;

  /* ---- 3D tilt rig on hero photo ---- */
  var pf = document.getElementById("heroPhoto");
  if (pf){
    var rig = pf.parentElement;
    rig.addEventListener("pointermove", function(e){
      var r = pf.getBoundingClientRect();
      var nx = (e.clientX - r.left) / r.width  - 0.5;
      var ny = (e.clientY - r.top)  / r.height - 0.5;
      pf.classList.add("tilting");
      pf.style.transform =
        "rotateY(" + (nx * 13).toFixed(2) + "deg) rotateX(" + (-ny * 13).toFixed(2) + "deg)";
      pf.style.setProperty("--gx", ((nx + 0.5) * 100).toFixed(1) + "%");
      pf.style.setProperty("--gy", ((ny + 0.5) * 100).toFixed(1) + "%");
    });
    rig.addEventListener("pointerleave", function(){
      pf.classList.remove("tilting");
      pf.style.transform = "";
    });
  }

  /* ---- magnetic CTA buttons ---- */
  Array.prototype.forEach.call(document.querySelectorAll(".cta"), function(btn){
    btn.classList.add("mag");
    btn.addEventListener("pointermove", function(e){
      var r = btn.getBoundingClientRect();
      var mx = e.clientX - r.left - r.width/2;
      var my = e.clientY - r.top  - r.height/2;
      btn.style.transform = "translate(" + (mx*0.22).toFixed(1) + "px," + (my*0.3).toFixed(1) + "px)";
    });
    btn.addEventListener("pointerleave", function(){ btn.style.transform = ""; });
  });

  /* ---- staggered reveals ---- */
  var groups = [].concat(
    [].slice.call(document.querySelectorAll(".specs")),
    [].slice.call(document.querySelectorAll(".tablewrap")),
    [].slice.call(document.querySelectorAll(".wipe"))
  );
  if ("IntersectionObserver" in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, {threshold:0.18});
    groups.forEach(function(el){ io.observe(el); });
  } else {
    groups.forEach(function(el){ el.classList.add("in"); });
  }

  /* ---- ambient chrome particle field ---- */
  var cv = document.getElementById("fx");
  if (cv && cv.getContext){
    var ctx = cv.getContext("2d"), dpr = Math.min(window.devicePixelRatio||1, 2);
    var pts = [], W = 0, H = 0, mouse = {x:-9999, y:-9999};

    function size(){
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W*dpr; cv.height = H*dpr;
      ctx.setTransform(dpr,0,0,dpr,0,0);
    }
    function seed(){
      var n = Math.min(64, Math.round(W*H/26000));
      pts = [];
      for (var i=0;i<n;i++){
        pts.push({
          x: Math.random()*W, y: Math.random()*H,
          vx:(Math.random()-0.5)*0.24, vy:(Math.random()-0.5)*0.24,
          r: Math.random()*1.7 + 0.6
        });
      }
    }
    function frame(){
      ctx.clearRect(0,0,W,H);
      for (var i=0;i<pts.length;i++){
        var p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < -20) p.x = W+20; if (p.x > W+20) p.x = -20;
        if (p.y < -20) p.y = H+20; if (p.y > H+20) p.y = -20;

        var dx = p.x-mouse.x, dy = p.y-mouse.y;
        var d2 = dx*dx + dy*dy;
        if (d2 < 16000){
          var f = (1 - d2/16000) * 0.9;
          p.x += dx/Math.sqrt(d2||1) * f;
          p.y += dy/Math.sqrt(d2||1) * f;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fillStyle = "rgba(142,146,153,0.30)";
        ctx.fill();

        for (var j=i+1;j<pts.length;j++){
          var q = pts[j], ax = p.x-q.x, ay = p.y-q.y, ad = ax*ax + ay*ay;
          if (ad < 14000){
            ctx.beginPath();
            ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y);
            ctx.strokeStyle = "rgba(142,146,153," + (0.16*(1-ad/14000)).toFixed(3) + ")";
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(frame);
    }
    window.addEventListener("resize", function(){ size(); seed(); }, {passive:true});
    window.addEventListener("pointermove", function(e){ mouse.x=e.clientX; mouse.y=e.clientY; }, {passive:true});
    window.addEventListener("pointerleave", function(){ mouse.x=-9999; mouse.y=-9999; });
    size(); seed(); frame();
  }

  /* ---- wordmark scramble on the topbar mark ---- */
  var mark = document.querySelector("[data-scramble]");
  if (mark){
    var target = mark.getAttribute("data-scramble");
    var glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&/\\";
    var running = false;
    mark.addEventListener("pointerenter", function(){
      if (running) return;
      running = true;
      var step = 0, total = 22;
      var iv = setInterval(function(){
        var out = "";
        for (var i=0;i<target.length;i++){
          var done = step > (i+1) * (total/target.length);
          out += done ? target[i] : glyphs[Math.floor(Math.random()*glyphs.length)];
        }
        mark.textContent = out;
        if (++step > total){ clearInterval(iv); mark.textContent = target; running = false; }
      }, 34);
    });
  }
})();

/* failsafe: nothing may stay invisible, whatever happens above */
setTimeout(function(){
  var sel = ".specs,.tablewrap,.wipe";
  Array.prototype.forEach.call(document.querySelectorAll(sel), function(el){
    el.classList.add("in");
  });
  document.body.classList.add("loaded");
  Array.prototype.forEach.call(document.querySelectorAll(".reveal"), function(el){
    el.classList.add("in");
  });
}, 2500);

/* ==========================================================
   HANGING CABLE ENGINE
   ========================================================== */
(function(){
  "use strict";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var svg  = document.getElementById("wireSvg");
  var back = document.getElementById("wireBack");
  var main = document.getElementById("wireMain");
  var core = document.getElementById("wireCore");
  var hi   = document.getElementById("wireHi");
  var bud  = document.getElementById("wireBud");
  if (!svg || !main) return;

  var W = 0, H = 0, len = 0, backLen = 0, t = 0, target = 0, eased = 0;

  function docHeight(){
    var b = document.body, e = document.documentElement;
    return Math.max(b.scrollHeight, b.offsetHeight, e.scrollHeight, e.offsetHeight);
  }

  function buildPath(dx, ampScale, phase){
    var pts = [], N = 11;
    for (var i = 0; i <= N; i++){
      var p  = i / N;
      var y  = p * H;
      var amp = Math.min(30, W * 0.055);
      var sway = Math.sin(p * 2.6 + t * 0.5  + phase) * amp
               + Math.sin(p * 5.3 - t * 0.28 + phase) * (amp * 0.34)
               + Math.sin(p * 1.2 + t * 0.17) * (amp * 0.5);
      var lane = W - Math.max(42, W * 0.105);
      var pin = 0.35 + 0.65 * Math.sin(Math.PI * Math.min(1, Math.max(0, p)));
      var x = lane + dx + sway * ampScale * pin;
      pts.push([x, y]);
    }
    var d = "M" + pts[0][0].toFixed(1) + "," + pts[0][1].toFixed(1);
    for (var j = 0; j < pts.length - 1; j++){
      var p0 = pts[j === 0 ? 0 : j - 1],
          p1 = pts[j], p2 = pts[j + 1],
          p3 = pts[j + 2 >= pts.length ? pts.length - 1 : j + 2];
      var c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
      var c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += "C" + c1x.toFixed(1) + "," + c1y.toFixed(1) + " "
               + c2x.toFixed(1) + "," + c2y.toFixed(1) + " "
               + p2[0].toFixed(1) + "," + p2[1].toFixed(1);
    }
    return d;
  }

  function resize(){
    W = window.innerWidth;
    H = docHeight();
    svg.setAttribute("width", W);
    svg.setAttribute("height", H);
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.parentNode.style.height = H + "px";
  }

  function scrollProgress(){
    var max = docHeight() - window.innerHeight;
    return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 1;
  }

  function frame(){
    t += 0.016;

    var d = buildPath(0, 1, 0);
    main.setAttribute("d", d);
    hi.setAttribute("d", d);
    if (core) core.setAttribute("d", d);
    back.setAttribute("d", buildPath(-W * 0.045, 0.66, 1.9));

    var L = main.getTotalLength();
    if (L !== len){
      len = L;
      main.style.strokeDasharray = L;
      hi.style.strokeDasharray   = "10 90";
      var BL = back.getTotalLength();
      back.style.strokeDasharray = BL; backLen = BL;
    }
    target = scrollProgress();
    var shown = 0.18 + target * 0.82;
    eased += (shown - eased) * 0.09;

    main.style.strokeDashoffset = (len * (1 - eased)).toFixed(1);
    if (core){ core.style.strokeDasharray = len;
      core.style.strokeDashoffset = (len * (1 - eased)).toFixed(1); }
    back.style.strokeDashoffset = (backLen * (1 - eased * 0.94)).toFixed(1);
    hi.style.strokeDashoffset   = (-t * 22).toFixed(1);

    var tip = main.getPointAtLength(len * eased);
    var prev = main.getPointAtLength(Math.max(0, len * eased - 6));
    var ang = Math.atan2(tip.y - prev.y, tip.x - prev.x) * 180 / Math.PI - 90;
    bud.setAttribute("transform",
      "translate(" + tip.x.toFixed(1) + "," + tip.y.toFixed(1) + ") rotate(" + ang.toFixed(1) + ")");

    requestAnimationFrame(frame);
  }

  window.addEventListener("resize", resize, {passive:true});
  window.addEventListener("load", resize);
  [400, 1200, 2600].forEach(function(ms){ setTimeout(resize, ms); });

  resize();
  requestAnimationFrame(frame);
})();
