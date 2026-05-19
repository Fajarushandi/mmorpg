const CHO=['r','R','s','e','E','f','a','q','Q','t','T','d','w','W','c','z','x','v','g'];
const JUNG=['k','o','i','O','j','p','u','P','h','hk','ho','hl','y','n','nj','np','nl','b','m','ml','l'];
const JONG=['','r','R','rt','s','sw','sg','e','f','fr','fa','fq','ft','fx','fv','fg','a','q','qt','t','T','d','w','c','z','x','v','g'];

const JAMO={
'ㄱ':'r','ㄲ':'R','ㄳ':'rt','ㄴ':'s','ㄵ':'sw','ㄶ':'sg',
'ㄷ':'e','ㄸ':'E','ㄹ':'f','ㄺ':'fr','ㄻ':'fa','ㄼ':'fq',
'ㄽ':'ft','ㄾ':'fx','ㄿ':'fv','ㅀ':'fg','ㅁ':'a','ㅂ':'q',
'ㅃ':'Q','ㅄ':'qt','ㅅ':'t','ㅆ':'T','ㅇ':'d','ㅈ':'w',
'ㅉ':'W','ㅊ':'c','ㅋ':'z','ㅌ':'x','ㅍ':'v','ㅎ':'g',
'ㅏ':'k','ㅐ':'o','ㅑ':'i','ㅒ':'O','ㅓ':'j','ㅔ':'p',
'ㅕ':'u','ㅖ':'P','ㅗ':'h','ㅘ':'hk','ㅙ':'ho','ㅚ':'hl',
'ㅛ':'y','ㅜ':'n','ㅝ':'nj','ㅞ':'np','ㅟ':'nl','ㅠ':'b',
'ㅡ':'m','ㅢ':'ml','ㅣ':'l'
};

function hangulToKeyboard(text){
  let output='';

  for(const char of text){
    const code=char.charCodeAt(0);

    if(JAMO[char]){
      output+=JAMO[char];
      continue;
    }
    
    if(code>=0xAC00 && code<=0xD7A3){
      const offset=code-0xAC00;
      const jong=offset%28;
      const jung=Math.floor((offset/28)%21);
      const cho=Math.floor(offset/588);

      output+=CHO[cho]+JUNG[jung]+JONG[jong];
      continue;
    }

    output+=char;
  }

  return output;
}
