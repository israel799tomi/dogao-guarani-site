(() => {
  const BURGER_LAYERS = {
    'pao-cima':       { label:'Pão de cima',       width:1.00, overlap:.34 },
    alface:           { label:'Alface',            width:1.04, overlap:.34 },
    tomate:           { label:'Tomate',            width:.94,  overlap:.34 },
    'cebola-roxa':    { label:'Cebola roxa',       width:.88,  overlap:.34 },
    queijo:           { label:'Queijo',            width:.98,  overlap:.34 },
    presunto:         { label:'Presunto',          width:.92,  overlap:.34 },
    'frango-desfiado':{ label:'Frango desfiado',   width:.96,  overlap:.34 },
    ovo:              { label:'Ovo',               width:.76,  overlap:.34 },
    bacon:            { label:'Bacon',             width:.94,  overlap:.34 },
    carne:            { label:'Carne',             width:1.00, overlap:.34 },
    'pao-baixo':      { label:'Pão de baixo',      width:1.00, overlap:.34 }
  };
  const INGREDIENT_ORDER = Object.keys(BURGER_LAYERS);
  const ASSET_ROOT = './assets/burger/';
  let sequence = 0;

  function ingredientKey(value) {
    const text = String(value || '').toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (/pao/.test(text)) return /inferior|baixo|base/.test(text) ? 'pao-baixo' : 'pao-cima';
    if (/alface/.test(text)) return 'alface';
    if (/tomate/.test(text)) return 'tomate';
    if (/cebola/.test(text)) return 'cebola-roxa';
    if (/queijo|mucarela|mussarela|cheddar/.test(text)) return 'queijo';
    if (/presunto|apresuntado/.test(text)) return 'presunto';
    if (/frango/.test(text)) return 'frango-desfiado';
    if (/ovo/.test(text)) return 'ovo';
    if (/bacon/.test(text)) return 'bacon';
    if (/carne|hamburg|picanha|bife/.test(text)) return 'carne';
    return null;
  }
  function normalized(items) {
    const occurrences={};
    return (items || []).map(item => {
      const normalizedItem=typeof item === 'string' ? {label:item,key:ingredientKey(item)} : {...item,key:item.key||ingredientKey(item.label||item.name)};
      if (!BURGER_LAYERS[normalizedItem.key]) return null;
      const occurrence=occurrences[normalizedItem.key]||0; occurrences[normalizedItem.key]=occurrence+1;
      return {...normalizedItem,id:String(normalizedItem.id||`${normalizedItem.key}-${occurrence}`)};
    }).filter(Boolean)
      .sort((a,b) => INGREDIENT_ORDER.indexOf(a.key)-INGREDIENT_ORDER.indexOf(b.key));
  }
  const safe = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function layerMarkup(item,index,entering=false) {
    return `<div class="bsi-layer${entering?' bsi-entering':''}" data-layer-id="${safe(item.id)}" data-ingredient="${safe(item.label||BURGER_LAYERS[item.key].label)}" data-key="${item.key}" style="--bsi-i:${index};--bsi-delay:${index*40}ms"><img src="${ASSET_ROOT}${item.key}.png" alt="" draggable="false"></div>`;
  }
  function updateModal(container,items,state) {
    const flip=container.querySelector('.bsi-flip.bsi-modal'),host=flip?.querySelector('.bsi-layers');
    if (!flip||!host) return items;
    const current=[...host.querySelectorAll('.bsi-layer:not(.bsi-exiting)')],byId=new Map(current.map(node=>[node.dataset.layerId,node])),keep=new Set();
    items.forEach((item,index)=>{
      let node=byId.get(item.id);
      if (!node) {
        const holder=document.createElement('div');holder.innerHTML=layerMarkup(item,index,state==='open');node=holder.firstElementChild;host.appendChild(node);
        const img=node.querySelector('img');img.addEventListener('load',()=>layout(container),{once:true});img.addEventListener('error',()=>console.warn(`Imagem de ingrediente ausente: ${img.src}`),{once:true});
        if (state==='open') node.addEventListener('animationend',()=>node.classList.remove('bsi-entering'),{once:true});
      }
      node.dataset.ingredient=item.label||BURGER_LAYERS[item.key].label;node.dataset.key=item.key;node.style.setProperty('--bsi-i',index);node.style.setProperty('--bsi-delay',`${index*40}ms`);host.appendChild(node);keep.add(item.id);
    });
    current.filter(node=>!keep.has(node.dataset.layerId)).forEach(node=>{
      node.classList.add('bsi-exiting');
      window.setTimeout(()=>{node.remove();layout(container)},matchMedia('(prefers-reduced-motion: reduce)').matches?40:440);
    });
    flip.dataset.state=state;container._burgerItems=items;layout(container);return items;
  }
  function render(container, ingredients, {state='closed',labels=true,className='',labelsContainer=null}={}) {
    if (!container) return [];
    const items=normalized(ingredients), id=++sequence;
    if (className.split(/\s+/).includes('bsi-modal')&&container.querySelector('.bsi-flip.bsi-modal')) return updateModal(container,items,state);
    const layers=items.map((item,index)=>layerMarkup(item,index)).join('');
    const tags=items.map((item,index)=>`<span class="bsi-tag" data-key="${item.key}" style="--bsi-i:${index};--bsi-delay:${index*40}ms">${BURGER_LAYERS[item.key].label}</span>`).join('');
    const labelHost=labelsContainer||container;
    const isHero=className.split(/\s+/).includes('bsi-hero');
    container._burgerLabels=labelHost;
    const closedFace=isHero?`<div class="bsi-face bsi-closed"><div class="bsi-counter bsi-closed-counter"><img class="bsi-closed-img" src="${ASSET_ROOT}fechado.png" alt="" draggable="false"></div></div>`:'';
    container.innerHTML=`<div class="bsi-flip ${className}" data-state="${state}" data-instance="${id}" aria-hidden="true">${closedFace}<div class="bsi-face bsi-open"><div class="bsi-counter"><div class="bsi-layers">${layers}</div></div></div></div>${labelHost===container?`<div class="bsi-labels" aria-hidden="true" data-visible="${labels&&state==='open'}">${tags}</div>`:''}`;
    if(labelHost!==container) labelHost.innerHTML=`<div class="bsi-labels" aria-hidden="true" data-visible="${labels&&state==='open'}">${tags}</div>`;
    const flip=container.querySelector('.bsi-flip');
    const arrange=()=>layout(container);
    container.querySelectorAll('.bsi-layer img, .bsi-closed-img').forEach(img=>{
      if (img.complete && img.naturalWidth) return;
      img.addEventListener('load',arrange,{once:true});
      img.addEventListener('error',()=>console.warn(`Imagem de ingrediente ausente: ${img.src}`),{once:true});
    });
    arrange();
    if ('ResizeObserver' in window) { const observer=new ResizeObserver(arrange); observer.observe(container); flip._burgerObserver=observer; }
    return items;
  }
  function layout(container) {
    const flip=container?.querySelector('.bsi-flip');
    const counters=[...(container?.querySelectorAll('.bsi-counter')||[])];
    const layers=[...(container?.querySelectorAll('.bsi-layer:not(.bsi-exiting)')||[])];
    if (!flip||!counters.length||!layers.length) return;
    const stageWidth=container.clientWidth || container.parentElement?.clientWidth || 1;
    const stageHeight=container.clientHeight || container.parentElement?.clientHeight || 1;
    const heights=layers.map(layer=>{
      const config=BURGER_LAYERS[layer.dataset.key], width=stageWidth*config.width;
      layer.style.width=`${width}px`;
      const image=layer.querySelector('img');
      return image?.naturalWidth ? image.naturalHeight/image.naturalWidth*width : width*.24;
    });
    const totalHeight=heights.reduce((sum,height)=>sum+height,0);
    const isHero=flip.classList.contains('bsi-hero');
    const closedImage=flip.querySelector('.bsi-closed-img');
    const closedRatio=closedImage?.naturalWidth ? closedImage.naturalHeight/closedImage.naturalWidth : 764/871;
    const closedHeight=isHero ? stageWidth*closedRatio : null;
    const compactStep=isHero ? Math.max(0,(closedHeight-heights.at(-1))/Math.max(1,heights.slice(0,-1).reduce((sum,height)=>sum+height,0))) : null;
    let closedY=0;
    layers.forEach((layer,index)=>{
      const config=BURGER_LAYERS[layer.dataset.key];
      layer.style.zIndex=String(layers.length-index);
      layer.style.setProperty('--closed-y',`${closedY}px`);
      closedY+=heights[index]*(isHero?compactStep:1-config.overlap);
    });
    const stackClosedHeight=isHero?closedHeight:closedY-heights[heights.length-1]*(1-BURGER_LAYERS[layers.at(-1).dataset.key].overlap)+heights.at(-1);
    const gap=Math.max(8,stackClosedHeight*.055);
    let openY=0;
    layers.forEach((layer,index)=>{
      layer.style.setProperty('--open-y',`${openY}px`);
      openY+=heights[index]+gap;
    });
    const openHeight=totalHeight+gap*(layers.length-1);
    const maxClosed=isHero?Math.min(window.innerHeight*.70,stageHeight*.88):stageHeight*.88;
    const maxOpen=isHero?Math.min(window.innerHeight*.86,stageHeight*.94):stageHeight*.88;
    const closedScale=Math.min(1,maxClosed/stackClosedHeight), openScale=Math.min(1,maxOpen/openHeight);
    counters.forEach(counter=>{
      counter.style.width=`${stageWidth}px`;
      counter.style.setProperty('--bsi-frame-height',`${stackClosedHeight}px`);
      counter.style.setProperty('--bsi-fit-closed',String(closedScale));
      counter.style.setProperty('--bsi-fit-open',String(openScale));
      counter.style.setProperty('--bsi-open-height',`${openHeight}px`);
      counter.style.setProperty('--bsi-closed-height',`${stackClosedHeight}px`);
    });
    layers.forEach((layer,index)=>{
      const tag=(container._burgerLabels||container).querySelector(`.bsi-tag[data-key="${layer.dataset.key}"]`);
      if (tag) tag.style.setProperty('--label-y',`${(layers.slice(0,index).reduce((sum,item,i)=>sum+heights[i]+gap,0)+heights[index]/2-openHeight/2)*openScale}px`);
    });
    const labels=(container._burgerLabels||container).querySelector('.bsi-labels');
    if (labels) labels.style.setProperty('--bsi-label-left',`${stageWidth/2+stageWidth*openScale/2+10}px`);
  }
  function setState(container,state) {
    const flip=container?.querySelector('.bsi-flip'); if (flip) flip.dataset.state=state;
    const labels=(container?._burgerLabels||container)?.querySelector('.bsi-labels'); if (labels) labels.dataset.visible=state==='open'||state==='opening-spread';
  }
  function renderHero(container,ingredients,labelsContainer=null) { return render(container,ingredients,{state:'closed',labels:true,className:'bsi-hero',labelsContainer}); }
  window.BurgerStack={render,renderHero,setState,ingredientKey,getOrder:()=>[...INGREDIENT_ORDER],order:INGREDIENT_ORDER,labels:Object.fromEntries(INGREDIENT_ORDER.map(key=>[key,BURGER_LAYERS[key].label])),BURGER_LAYERS};
})();
