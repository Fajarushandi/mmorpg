let favorites = [];
try{
  favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
}catch(e){
  console.warn('Gagal load favorites dari localStorage:', e);
  favorites = [];
}

function saveFavorites(){
  try{
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }catch(e){
    console.warn('Gagal simpan favorites (storage penuh / private mode):', e);
    showToast('Gagal simpan favorite');
  }
}

function esc(text){
  const div = document.createElement('div');
  div.textContent = text == null ? '' : String(text);
  return div.innerHTML;
}

function itemId(item){
  return `${item.korean}::${item.type}`;
}

function uniqueItems(items){
  const seen = new Set();
  return items.filter(item=>{
    const id = itemId(item);
    if(seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

function setupQuickChat(){
  const box = document.getElementById('quickBox');
  box.innerHTML = '';

  quickList.forEach(text=>{
    if(!dictionary[text]) return;

    const chip = document.createElement('div');
    chip.className = 'quick';
    chip.textContent = text;
    chip.onclick = ()=>{
      closeKeyboard();
      document.getElementById('input').value = text;
      document.getElementById('suggestions').innerHTML = '';
      generateText();
    };
    box.appendChild(chip);
  });
}

function setupCategories(){
  const box = document.getElementById('categoryBox');
  const result = document.getElementById('result');
  const resultHeader = document.getElementById('resultHeader');

  box.innerHTML = '';

  Object.entries(categories).forEach(([label, categoryId])=>{
    const btn = document.createElement('div');
    btn.className = 'quick';
    btn.innerText = label;

    btn.onclick = ()=>{
      if(result.dataset.category === categoryId){
        result.dataset.category = '';
        result.innerHTML = '';
        resultHeader.innerHTML = '';
        return;
      }

      result.dataset.category = categoryId;

      const found = [];

      Object.values(dictionary).forEach(list=>{
        list.forEach(item=>{
          if(item.category === categoryId){
            found.push(item);
          }
        });
      });

      const unique = uniqueItems(found).slice(0,100);

      resultHeader.innerHTML = `
        <div class="card" data-category-title="true">
          <div class="type">CATEGORY</div>
          <div class="korean">${esc(label.replace(/^[^A-Za-z0-9가-힣]+\s*/, ''))}</div>
          <div class="indo">Klik kategori yang sama lagi untuk menutup.</div>
        </div>
      `;

      showResults(unique);
    };

    box.appendChild(btn);
  });
}

function toggleFavorite(data){
  const id = itemId(data);
  const index = favorites.findIndex(item=>itemId(item) === id);

  if(index > -1){
    favorites.splice(index,1);
  }else{
    favorites.push(data);
  }

  saveFavorites();
  renderFavorites();
}

function renderFavorites(){
  const box = document.getElementById('favoriteBox');
  if(!box) return;

  box.innerHTML = '';

  if(favorites.length === 0){
    box.innerHTML = '<div class="empty-note">Belum ada favorite</div>';
    return;
  }

  favorites.forEach(item=>{
    const btn = document.createElement('div');
    btn.className = 'quick';
    btn.innerText = item.korean;
    btn.onclick = ()=>{
      document.getElementById('resultHeader').innerHTML = '';
      document.getElementById('result').dataset.category = '';
      showResults([item]);
    };
    box.appendChild(btn);
  });
}

async function generateText(){
  const rawInput = document.getElementById('input').value;
  const input = normalizeInput(rawInput);
  const result = document.getElementById('result');
  const resultHeader = document.getElementById('resultHeader');

  result.innerHTML = '';
  resultHeader.innerHTML = '';
  result.dataset.category = '';

  if(!input) return;

  const found = findDictionary(input);

  if(found){
    showResults(found);
    return;
  }

  result.innerHTML = `
    <div class="card">
      <div class="type">Phrase Not Found</div>
      <div class="indo">
        Phrase belum ada di database.<br><br>
        Coba keyword seperti:<br><br>
        • heal<br>
        • party<br>
        • boss<br>
        • pk<br>
        • afk<br>
        • gudang<br>
        • teleport
      </div>
    </div>
  `;
}

function showResults(items){
  const result = document.getElementById('result');

  if(!result.innerHTML.includes('CATEGORY')){
    result.innerHTML = '';
  }

  uniqueItems(items).forEach(item=>{
    const keyboard = hangulToKeyboard(item.korean);
    const isFav = favorites.some(fav=>itemId(fav) === itemId(item));

    const div = document.createElement('div');
    div.className = 'card';

    div.innerHTML = `
      <div class="type ${getTypeClass(item)}">${esc(item.type)}</div>
      <div class="korean">${esc(item.korean)}</div>
      <div class="keyboard">${esc(keyboard)}</div>
      <div class="indo">${esc(cleanDescription(item.indonesia))}</div>
      <div class="copy-row">
        <button class="copy">Copy Keyboard</button>
        <button class="fav">${isFav ? '⭐' : '☆'}</button>
      </div>
    `;

    div.querySelector('.copy').onclick = ()=>copyText(keyboard);

    div.querySelector('.fav').onclick = (e)=>{
      toggleFavorite(item);
      const active = favorites.some(fav=>itemId(fav) === itemId(item));
      e.target.innerText = active ? '⭐' : '☆';
    };

    result.appendChild(div);
  });

  result.scrollIntoView({behavior:'smooth', block:'start'});
}

function getTypeClass(item){

  const type = (item.type || '').toLowerCase().trim();

  if((item.category || '').includes('PK_CHAT')) return 'pk_chat';

  if(type === 'game') return 'game';
  if(type === 'formal') return 'formal';
  if(type === 'santai') return 'santai';
  if(type === 'singkat') return 'singkat';
  if(type === 'natural') return 'natural';

  // fallback to substring match in case new type variants are added
  if(type.includes('game')) return 'game';
  if(type.includes('formal')) return 'formal';
  if(type.includes('santai')) return 'santai';
  if(type.includes('singkat')) return 'singkat';
  if(type.includes('natural')) return 'natural';

  return '';

}

function cleanDescription(text){
  return (text || '-')
    .replace(/\s*\bformal\b/gi,'')
    .replace(/\s*\bsantai\b/gi,'')
    .replace(/\s*\bslang game\b/gi,'')
    .replace(/\s*\bgaya English\b/gi,'')
    .trim() || '-';
}

function copyText(text){
  if(navigator.clipboard && window.isSecureContext){
    navigator.clipboard.writeText(text)
      .then(showToast)
      .catch(()=>fallbackCopy(text));
  }else{
    fallbackCopy(text);
  }
}

function fallbackCopy(text){
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
  showToast();
}

function showToast(message){
  const toast = document.getElementById('toast');
  if(message) toast.textContent = message;
  else toast.textContent = 'Copied!';
  toast.classList.add('show');
  setTimeout(()=>toast.classList.remove('show'),1500);
}

function clearAll(){
  document.getElementById('input').value = '';
  document.getElementById('result').innerHTML = '';
  document.getElementById('resultHeader').innerHTML = '';
  document.getElementById('suggestions').innerHTML = '';
  document.getElementById('result').dataset.category = '';
}

let quickScrollTimer = null;
function scrollToSuggestions(){
  clearTimeout(quickScrollTimer);
  quickScrollTimer = setTimeout(()=>{
    const suggestions = document.getElementById('suggestions');
    if(!suggestions) return;
    suggestions.scrollIntoView({behavior:'smooth', block:'center', inline:'nearest'});
  },120);
}

setupQuickChat();
setupCategories();
renderFavorites();
