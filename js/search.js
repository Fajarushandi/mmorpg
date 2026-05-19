function normalizeInput(text){

  return text.toLowerCase().trim().replace(/\s+/g,' ');
}

function typoScore(a,b){

  if(Math.abs(a.length - b.length) > 2) return 99;

  let diff = 0;
  const len = Math.max(a.length,b.length);

  for(let i=0;i<len;i++){
    if(a[i] !== b[i]) diff++;
  }

  return diff;
}

function closeKeyboard(){

  const input = document.getElementById('input');

  input.blur();

  input.setAttribute('readonly', true);

  setTimeout(()=>{
    input.removeAttribute('readonly');
  },100);

}

function findTypoKey(input,keys){

  if(input.length < 4) return null;

  let bestKey = null;
  let bestScore = 99;

  keys.forEach(key=>{

    const score = typoScore(input,key);

    if(score < bestScore){
      bestScore = score;
      bestKey = key;
    }

  });

  return bestScore <= 2 ? bestKey : null;
}

const aliases = {
  "arrow":"panah",
  "arrows":"panah",
  "ammo":"panah",

  "panah dikit":"panah tinggal sedikit",
  "panah sedikit":"panah tinggal sedikit",
  "panah sisa sedikit":"panah tinggal sedikit",
  "arrow dikit":"panah tinggal sedikit",
  "arrow sedikit":"panah tinggal sedikit",

  "pt":"party",
  "pt dong":"join party",

  "heal me":"heal aku",
  "heal pls":"heal dong",

  "buff me":"buff dong",
  "buff pls":"buff dong",

  "res me":"revive dong",
  "rev me":"revive dong",

  "pk incoming":"pk datang",
  "lagg":"lag parah",

  "sial":"anjir",
  "anjing":"anjir",
  "tolol":"goblok",
  "idiot":"goblok",
  "noob":"cupu",
  "gg":"gg",
  "real":"real",
  "agree":"setuju",
  "setuju":"setuju",
  "kabur takut":"kabur takut",
  "pk bocah":"bocah pk"
};

function findDictionary(input){

  if(aliases[input] && dictionary[aliases[input]]){
    input = aliases[input];
  }

  const keys = Object.keys(dictionary);

  if(dictionary[input]){
    return dictionary[input];
  }

  const scored = [];

  keys.forEach(key=>{

    let score = 0;

    if(key === input){
      score += 100;
    }

    else if(key.startsWith(input)){
      score += 80;
    }

    else if(key.includes(input)){
      score += 60;
    }

    else if(input.includes(key)){
      score += 45;
    }

    const inputWords = input.split(" ");
    const keyWords = key.split(" ");

    const matchCount = keyWords.filter(word =>
      inputWords.includes(word)
    ).length;

    if(matchCount > 0 && input.length >= 3){
      score += matchCount * 20;
    }

    if(score > 0){
      scored.push({
        key,
        score
      });
    }

  });

  scored.sort((a,b)=>{
    if(b.score !== a.score){
      return b.score - a.score;
    }

    return a.key.length - b.key.length;
  });

  const results = [];
  const seen = new Set();

  scored.forEach(data=>{

    dictionary[data.key].forEach(item=>{

      const id = item.korean + item.type;

      if(!seen.has(id)){
        seen.add(id);
        results.push(item);
      }

    });

  });

  if(results.length > 0){
    return results.slice(0,8);
  }

  const typoKey = findTypoKey(input, keys);

  if(typoKey){
    return dictionary[typoKey];
  }

  return null;
}

function updateSuggestions(){

  const input = normalizeInput(document.getElementById('input').value);
  const box = document.getElementById('suggestions');

  box.innerHTML = '';

  if(!input || input.length < 2) return;

  const keys = Object.keys(dictionary);

  const matches = keys

  .filter(key => {

    const lowerKey = key.toLowerCase();
    const lowerInput = input.toLowerCase();

    return (
      lowerKey.startsWith(lowerInput) ||
      lowerKey.includes(lowerInput) ||
      lowerInput.includes(lowerKey) ||
      lowerKey.split(' ').some(word => word.startsWith(lowerInput))
    );

  })

  .sort((a,b)=>{

    const lowerInput = input.toLowerCase();

    const aStart = a.toLowerCase().startsWith(lowerInput) ? 1 : 0;
    const bStart = b.toLowerCase().startsWith(lowerInput) ? 1 : 0;

    return bStart - aStart;

  })

  .slice(0,10);

  matches.forEach(key=>{

    const chip=document.createElement('div');

    chip.className='suggestion';

    chip.textContent=key;

    chip.onclick=()=>{
    
    closeKeyboard();

      document.getElementById('input').value=key;

      box.innerHTML='';

      generateText();

    };

    box.appendChild(chip);

  });

}
