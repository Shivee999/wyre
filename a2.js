/* WYRE tile loader. Images ship as small tiles so each transfers intact. */
(function(){
  "use strict";
  function stack(host, prefix, count){
    if(!host || !count) return;
    host.innerHTML = "";
    host.style.display = "flex";
    host.style.flexDirection = "column";
    for(var i=1;i<=count;i++){
      var d = document.createElement("i");
      d.style.flex = "1 1 " + (100/count) + "%";
      d.style.backgroundImage = 'url("' + prefix + i + '.webp")';
      d.style.backgroundSize = "100% 100%";
      d.style.backgroundRepeat = "no-repeat";
      d.style.display = "block";
      host.appendChild(d);
    }
  }
  stack(document.querySelector(".phstack"), "H", 12);
  stack(document.getElementById("parallaxBg"), "L", 0);
})();
