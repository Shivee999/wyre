/* WYRE tile loader: builds the hero and lifestyle image stacks from
   small tiles. Tiles are kept small so each deploys without corruption. */
(function(){
  "use strict";
  function stack(host, prefix, count){
    if(!host) return;
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
  stack(document.querySelector(".phstack"), "H", 10);
  stack(document.getElementById("parallaxBg"), "L", 21);
})();
