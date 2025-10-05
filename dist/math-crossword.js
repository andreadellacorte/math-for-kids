"use strict";(()=>{var A=document.getElementById("grid"),L=document.getElementById("ans"),T=document.getElementById("eqSlider"),Z=document.getElementById("eqOut"),O=document.getElementById("difficultySelect"),H=document.getElementById("rangePreset"),W=document.getElementById("opAdd"),V=document.getElementById("opSub"),_=document.getElementById("opMul"),D=document.getElementById("opDiv"),z=document.getElementById("stat"),G=(a,l)=>Math.floor(Math.random()*(l-a+1))+a;var ne=(a,l,o)=>Math.max(l,Math.min(o,a));function j(a,l,o=365){let r=new Date;r.setTime(r.getTime()+o*24*60*60*1e3),document.cookie=`${a}=${encodeURIComponent(l)};expires=${r.toUTCString()};path=/;SameSite=Lax`}function F(a){let l=document.cookie.split(";").map(o=>o.trim()).find(o=>o.startsWith(a+"="));return l?decodeURIComponent(l.split("=")[1]):null}function oe(){let a=F("mx_eq"),l=F("mx_diff"),o=F("mx_range"),r=F("mx_ops");T.value=ne(parseInt(a)||30,3,50),O.value=l||"medium",o?H.value=o:H.value="0-20",Z.textContent=T.value;let g=r?JSON.parse(r):{add:!0,sub:!0,mul:!0,div:!0};W.checked=g.add!==!1,V.checked=g.sub!==!1,_.checked=g.mul!==!1,D.checked=g.div!==!1}function se(a,l,o,r){return a=+a,o=+o,r=+r,l==="+"?a+o===r:l==="-"?a-o===r:l==="\xD7"?a*o===r:l==="\xF7"?o!==0&&a/o===r:!1}function J(a,l){let o=document.createElementNS("http://www.w3.org/2000/svg",a);for(let r in l)o.setAttribute(r,l[r]);return o}function X(){let a=[];return W.checked&&a.push("+"),V.checked&&a.push("-"),_.checked&&a.push("\xD7"),D.checked&&a.push("\xF7"),a.length>0?a:["+"]}function U(){let a=0,l=20,o=H.value;if(/^(\d+)-(\d+)$/.test(o)){let r=o.match(/^(\d+)-(\d+)$/);a=parseInt(r[1]),l=parseInt(r[2])}return{min:a,max:l}}function S(a,l,o,r,g=null){a=parseInt(a),l=parseInt(l),o=parseInt(o);let s=g||U();if(a<s.min||a>s.max||l<s.min||l>s.max||o<s.min||o>s.max||!Number.isInteger(a)||!Number.isInteger(l)||!Number.isInteger(o)||a<=0||l<=0||o<=0)return!1;switch(r){case"+":return a+l===o;case"-":return a-l===o&&o>0;case"\xD7":return a*l===o;case"\xF7":return l!==0&&a/l===o&&a%l===0;default:return!1}}function R(){let a=X(),l=U(),o="auto";for(let g=0;g<300;g++){let s=a[Math.floor(Math.random()*a.length)],n,t,e;switch(s){case"+":{n=G(l.min,l.max),t=G(l.min,l.max),e=n+t;break}case"-":{n=G(Math.max(l.min,1),l.max),t=G(l.min,l.max),t>n&&([n,t]=[t,n]),e=n-t;break}case"\xD7":{let x=Math.min(Math.floor(Math.sqrt(l.max)),20);if(n=G(2,Math.max(2,x)),t=G(2,Math.max(2,x)),e=n*t,e<l.min||e>l.max)continue;break}case"\xF7":{if(t=G(Math.max(l.min,2),Math.max(l.min,l.max)),e=G(Math.max(l.min,1),Math.max(l.min,l.max)),n=t*e,n<1)continue;break}}if(S(n,t,e,s,l))return{A:n,B:t,C:e,op:s}}return{...l.max<=20?{A:8,B:4,C:2}:{A:12,B:4,C:3},op:"\xF7"}}function K(a){let l=["+","-","\xD7","\xF7"];for(let o=0;o<1e3;o++){let r=R(),g=[r.A,r.B,r.C],s=!0;for(let[n,t]of Object.entries(a))if(g[parseInt(n)/2]!==t){s=!1;break}if(s&&S(r.A,r.B,r.C,r.op))return r}if(Object.keys(a).length===1){let[o,r]=Object.entries(a)[0],g=parseInt(o)/2;for(let s of l){let n,t,e;if(g===0){n=r;for(let x=0;x<50;x++)if(s==="+"){if(t=Math.floor(Math.random()*40)+10,e=n+t,S(n,t,e,s))return{A:n,B:t,C:e,op:s}}else if(s==="-"){if(t=Math.floor(Math.random()*Math.min(n-1,40))+1,e=n-t,S(n,t,e,s))return{A:n,B:t,C:e,op:s}}else if(s==="\xD7"){if(t=Math.floor(Math.random()*Math.min(9,Math.floor(99/n)))+2,e=n*t,S(n,t,e,s))return{A:n,B:t,C:e,op:s}}else if(s==="\xF7"){let w=[];for(let f=2;f<=Math.min(9,n);f++)n%f===0&&w.push(f);if(w.length>0&&(t=w[Math.floor(Math.random()*w.length)],e=n/t,S(n,t,e,s)))return{A:n,B:t,C:e,op:s}}}else if(g===1){t=r;for(let x=0;x<50;x++)if(s==="+"){if(n=Math.floor(Math.random()*(99-t))+10,e=n+t,S(n,t,e,s))return{A:n,B:t,C:e,op:s}}else if(s==="-"){if(n=Math.floor(Math.random()*40)+t+10,e=n-t,S(n,t,e,s))return{A:n,B:t,C:e,op:s}}else if(s==="\xD7"){if(n=Math.floor(Math.random()*Math.min(9,Math.floor(99/t)))+2,e=n*t,S(n,t,e,s))return{A:n,B:t,C:e,op:s}}else if(s==="\xF7"&&(e=Math.floor(Math.random()*10)+2,n=t*e,S(n,t,e,s)))return{A:n,B:t,C:e,op:s}}else if(g===2){e=r;for(let x=0;x<50;x++)if(s==="+"){if(n=Math.floor(Math.random()*Math.min(e-10,50))+10,t=e-n,t>=10&&t<=50)return{A:n,B:t,C:e,op:s}}else if(s==="-"){if(t=Math.floor(Math.random()*Math.min(30,e-1))+10,n=e+t,S(n,t,e,s))return{A:n,B:t,C:e,op:s}}else if(s==="\xD7"){let w=[];for(let f=2;f<=Math.min(9,e);f++)e%f===0&&e/f>=2&&e/f<=9&&w.push([f,e/f]);if(w.length>0){let[f,u]=w[Math.floor(Math.random()*w.length)];if(S(f,u,e,s))return{A:f,B:u,C:e,op:s}}}else if(s==="\xF7"&&(t=Math.floor(Math.random()*8)+2,n=e*t,S(n,t,e,s)))return{A:n,B:t,C:e,op:s}}}}return R()}function ie(a,l){let o=fe(a,l);return o?re(o,l):null}function re(a,l){let{grid:o,equations:r}=a,g=[];for(let f=0;f<24;f++)for(let u=0;u<24;u++)o[f]&&o[f][u]&&o[f][u].k==="num"&&g.push(`${f},${u}`);let s=new Set(g),n=de(l,g.length);if(!n||!n.percentage)return a;let t=0,e=l==="expert"?1e3:500;for(;s.size>n.maxGivens&&t<e;){t++;let f=le(o,r,s,l);if(!f)break;if(t%10===0){let u=Math.round(s.size/g.length*100);typeof window<"u"&&window.stat&&(window.stat.textContent=`\u{1F504} Optimizing ${l} difficulty... ${u}% \u2192 ${n.percentage.max}% (attempt ${t})`)}if(s.delete(f),l==="expert"){if(me(o,r,s)){s.add(f);break}}else if(!ue(o,r,s)){s.add(f);break}}let x=s.size;return s=ae(o,r,s),s.size>x,{...a,optimizedGivens:s}}function le(a,l,o,r="expert"){let g=[];for(let s of o){let[n,t]=s.split(",").map(Number),e=ce(a,l,o,n,t,r);e>0&&g.push({pos:s,score:e,r:n,c:t})}return g.length===0?null:(g.sort((s,n)=>n.score-s.score),g.length>0,g[0].pos)}function ce(a,l,o,r,g,s="expert"){let n=0,t=[];for(let e of l)for(let x=0;x<5;x+=2){let w=e.across?e.row:e.row+x,f=e.across?e.col+x:e.col;if(w===r&&f===g){t.push({eq:e,position:x});break}}for(let{eq:e,position:x}of t){let w=[];for(let d=0;d<5;d+=2){let i=e.across?e.row:e.row+d,h=e.across?e.col+d:e.col;i<24&&h<24&&w.push(`${i},${h}`)}let f=w.filter(d=>o.has(d)).length;if(s==="expert"){if(f===1){if(Q(a,l,o,r,g)<2)return 0;n+=30}}else if(f<=1)return 0;if(f>=3)n+=20;else if(f===2){let d=Q(a,l,o,r,g);d>=2?n+=15:d>=1?n+=10:n+=5}x===4&&(n+=2),parseInt(a[r][g].ch)>20&&(n+=1)}return n}function Q(a,l,o,r,g){let s=0;for(let n of l)for(let t=0;t<5;t+=2){let e=n.across?n.row:n.row+t,x=n.across?n.col+t:n.col;if(e===r&&x===g){let w=[];for(let u=0;u<5;u+=2){let d=n.across?n.row:n.row+u,i=n.across?n.col+u:n.col;d<24&&i<24&&w.push(`${d},${i}`)}w.filter(u=>o.has(u)).length>=2&&s++;break}}return s}function ae(a,l,o){let r=new Set([...o]),g=0;for(let s of l){let n=[];for(let e=0;e<5;e+=2){let x=s.across?s.row:s.row+e,w=s.across?s.col+e:s.col;x<24&&w<24&&n.push(`${x},${w}`)}let t=n.filter(e=>r.has(e)).length;if(t===0)r.add(n[0]),g++;else if(t===1&&n.length>=3){let e=0;for(let x of n)if(!r.has(x)){let[w,f]=x.split(",").map(Number),u=!1;for(let d of l)if(d!==s){for(let i=0;i<5;i+=2){let h=d.across?d.row:d.row+i,p=d.across?d.col+i:d.col;if(h===w&&p===f){u=!0;break}}if(u)break}u||e++}if(e===n.length-t){let x=n.filter(w=>!r.has(w));x.length>0&&(r.add(x[0]),g++)}}}return r}function fe(a,l="expert"){let o=Array.from({length:24},()=>Array(24).fill(null)),r=[],g=100,s=Math.floor(Math.random()*8)+8,n=Math.floor(Math.random()*8)+8,t=Math.random()<.5,e=R(),x=[{k:"num",ch:String(e.A)},{k:"op",ch:e.op},{k:"num",ch:String(e.B)},{k:"eq",ch:"="},{k:"num",ch:String(e.C)}];for(let f=0;f<5;f++){let u=t?s:s+f,d=t?n+f:n;o[u][d]={...x[f],id:1}}r.push({across:t,row:s,col:n,eq:e});for(let f=2;f<=a;f++){let u=!1;for(let d=0;d<g&&!u;d++){let i=[];for(let h=1;h<23;h++)for(let p=1;p<23;p++)if(o[h][p]&&o[h][p].k==="num")for(let b of[!0,!1])for(let c=0;c<5;c+=2){let m=b?h:h-c,k=b?p-c:p;if(m>=0&&m<24&&k>=0&&k<24){let M=!0,y={},C=0;for(let v=0;v<5;v++){let E=b?m:m+v,P=b?k+v:k;if(E>=24||P>=24){M=!1;break}let $=o[E][P];if($)if($.k==="num")y[v]=parseInt($.ch),C++;else if($.k==="op"&&v===1)if(X().map(B=>B.symbol).includes($.ch))y[v]=$.ch,C++;else{M=!1;break}else if($.k==="eq"&&v===3)y[v]=$.ch,C++;else if(f<=5){M=!1;break}else{M=!1;break}}let q;switch(l){case"expert":q=(f<=3,1);break;case"hard":q=1;break;case"medium":case"easy":q=(f<=5,1);break;default:q=1}M&&C>=q&&i.push({row:m,col:k,across:b,constraints:y,intersectionCount:C})}}if(i.length>0){i.sort((y,C)=>C.intersectionCount-y.intersectionCount);let h;switch(l){case"expert":h=.4;break;case"hard":h=.6;break;case"medium":h=.8;break;case"easy":h=1;break;default:h=.5}let p=i.slice(0,Math.max(1,Math.ceil(i.length*h))),b=p[Math.floor(Math.random()*p.length)],c=null,m=0;for(;!c&&m<10;)c=K(b.constraints),m++;if(!c&&i.length>1){if(l==="expert"){let y=i.filter(C=>C.intersectionCount>1);if(y.length>0){let C=y[Math.floor(Math.random()*y.length)];c=K(C.constraints)}}if(!c){let y=i.filter(C=>C.intersectionCount===1);if(y.length>0){let C=y[Math.floor(Math.random()*y.length)];c=K(C.constraints)}}}c||(c=R());let k=[{k:"num",ch:String(c.A)},{k:"op",ch:c.op},{k:"num",ch:String(c.B)},{k:"eq",ch:"="},{k:"num",ch:String(c.C)}],M=!0;for(let y=0;y<5;y++){let C=b.across?b.row:b.row+y,q=b.across?b.col+y:b.col;if(o[C][q]&&o[C][q].k==="num"&&o[C][q].ch!==k[y].ch){M=!1;break}}if(M)for(let y=0;y<5;y++){let C=b.across?b.row:b.row+y,q=b.across?b.col+y:b.col;o[C][q]||(o[C][q]={...k[y],id:f})}else continue;r.push({across:b.across,row:b.row,col:b.col,eq:c}),u=!0}}if(!u){for(let d=0;d<g&&!u;d++){let i=Math.floor(Math.random()*16)+4,h=Math.floor(Math.random()*16)+4,p=Math.random()<.5,b=!0;for(let c=0;c<5;c++){let m=p?i:i+c,k=p?h+c:h;if(m>=24||k>=24||o[m][k]){b=!1;break}}if(b){let c=R(),m=[{k:"num",ch:String(c.A)},{k:"op",ch:c.op},{k:"num",ch:String(c.B)},{k:"eq",ch:"="},{k:"num",ch:String(c.C)}];for(let k=0;k<5;k++){let M=p?i:i+k,y=p?h+k:h;o[M][y]={...m[k],id:f}}r.push({across:p,row:i,col:h,eq:c}),u=!0}}if(!u)for(let d=0;d<50&&!u;d++){let i=Math.floor(Math.random()*20)+2,h=Math.floor(Math.random()*20)+2,p=Math.random()<.5,b=!0;for(let c=0;c<5;c++){let m=p?i:i+c,k=p?h+c:h;if(m>=24||k>=24||o[m][k]){b=!1;break}}if(b){let c=R(),m=[{k:"num",ch:String(c.A)},{k:"op",ch:c.op},{k:"num",ch:String(c.B)},{k:"eq",ch:"="},{k:"num",ch:String(c.C)}];for(let k=0;k<5;k++){let M=p?i:i+k,y=p?h+k:h;o[M][y]={...m[k],id:f}}r.push({across:p,row:i,col:h,eq:c}),u=!0}}}}let w=0;for(let f of r){let u=[];for(let d=0;d<5;d+=2){let i=f.across?f.row:f.row+d,h=f.across?f.col+d:f.col;i<24&&h<24&&o[i][h]?u.push(parseInt(o[i][h].ch)):w++}if(u.length===3){let[d,i,h]=u,p=f.across?o[f.row][f.col+1].ch:o[f.row+1][f.col].ch,b=!1;switch(p){case"+":b=d+i===h;break;case"-":b=d-i===h;break;case"\xD7":b=d*i===h;break;case"\xF7":b=i!==0&&d/i===h;break}b||w++}}return w>0,{grid:o,equations:r}}function de(a,l){let o={expert:{min:.05,max:.4,name:"Expert"},hard:{min:.35,max:.5,name:"Hard"},medium:{min:.55,max:.65,name:"Medium"},easy:{min:.65,max:.75,name:"Easy"}},r=o[a]||o.medium;return{minGivens:Math.ceil(l*r.min),maxGivens:Math.ceil(l*r.max),name:r.name,percentage:{min:Math.round(r.min*100),max:Math.round(r.max*100)}}}function ue(a,l,o){let r=Array.from({length:24},()=>Array(24).fill(null));for(let t=0;t<24;t++)for(let e=0;e<24;e++)a[t][e]&&o.has(`${t},${e}`)?r[t][e]=a[t][e]:a[t][e]&&(r[t][e]={k:a[t][e].k,ch:a[t][e].k==="num"?null:a[t][e].ch,id:a[t][e].id});let g=!0,s=0,n=10;for(;g&&s<n;){g=!1,s++;let t=!0,e=0,x=20;for(;t&&e<x;){t=!1,e++;for(let w of l){let f=[];for(let u=0;u<5;u++){let d=w.across?w.row:w.row+u,i=w.across?w.col+u:w.col;d<24&&i<24&&r[d][i]&&f.push({r:d,c:i,cell:r[d][i],pos:u})}if(f.length===5){let u=f.filter(i=>i.cell.k==="num"),d=f.find(i=>i.cell.k==="op");if(d&&u.length>=2){let i={},h=[];for(let p of u)p.cell.ch!==null?i[p.pos]=parseInt(p.cell.ch):h.push(p.pos);if(Object.keys(i).length===2&&h.length===1){let p=d.cell.ch,b=h[0],c=null;if(b===0){let m=i[2],k=i[4];p==="+"?c=k-m:p==="-"?c=k+m:p==="\xD7"?c=m!==0?k/m:null:p==="\xF7"&&(c=k*m)}else if(b===2){let m=i[0],k=i[4];p==="+"?c=k-m:p==="-"?c=m-k:p==="\xD7"?c=m!==0?k/m:null:p==="\xF7"&&(c=m!==0?m/k:null)}else if(b===4){let m=i[0],k=i[2];p==="+"?c=m+k:p==="-"?c=m-k:p==="\xD7"?c=m*k:p==="\xF7"&&(c=k!==0?m/k:null)}if(c!==null&&c>0&&c<=99&&Number.isInteger(c)){let m=f.find(k=>k.pos===b);m&&m.cell.ch===null&&(m.cell.ch=String(c),t=!0,g=!0)}}}}}}for(let w of l){let f=[];for(let u=0;u<5;u++){let d=w.across?w.row:w.row+u,i=w.across?w.col+u:w.col;d<24&&i<24&&r[d][i]&&f.push({r:d,c:i,cell:r[d][i],pos:u})}if(f.length===5){let u=f.filter(i=>i.cell.k==="num");if(f.find(i=>i.cell.k==="op")&&u.length>=1){let i={},h=[];for(let p of u)p.cell.ch!==null?i[p.pos]=parseInt(p.cell.ch):h.push(p.pos);if(Object.keys(i).length===1&&h.length===2)for(let p of h){let b=f.find(m=>m.pos===p),c=he(r,l,b.r,b.c);if(c&&c.length===1){b.cell.ch=String(c[0]),g=!0;break}}}}}}for(let t=0;t<24;t++)for(let e=0;e<24;e++)if(a[t][e]&&a[t][e].k==="num"&&(!r[t][e]||r[t][e].ch===null))return!1;return!0}function he(a,l,o,r){let g=[],s=U();for(let n=s.min;n<=s.max;n++){let t=!0;for(let e of l){let x=!1,w=-1;for(let f=0;f<5;f+=2){let u=e.across?e.row:e.row+f,d=e.across?e.col+f:e.col;if(u===o&&d===r){x=!0,w=f;break}}if(x){let f=[];for(let u=0;u<5;u++){let d=e.across?e.row:e.row+u,i=e.across?e.col+u:e.col;d<24&&i<24&&a[d][i]&&f.push({r:d,c:i,cell:a[d][i],pos:u})}if(f.length===5){let u=f.filter(i=>i.cell.k==="num"),d=f.find(i=>i.cell.k==="op");if(d&&u.length===3){let i={},h=!1;for(let p of u)p.r===o&&p.c===r?i[p.pos]=n:p.cell.ch!==null?i[p.pos]=parseInt(p.cell.ch):h=!0;if(Object.keys(i).length>=2&&!h){let p=i[0],b=i[2],c=i[4],m=d.cell.ch;if(p!==void 0&&b!==void 0&&c!==void 0&&!se(p,m,b,c)){t=!1;break}}}}}}t&&g.push(n)}return g}function me(a,l,o){for(let r of l){let g=[];for(let n=0;n<5;n+=2){let t=r.across?r.row:r.row+n,e=r.across?r.col+n:r.col;t<24&&e<24&&g.push({r:t,c:e,pos:n})}let s=g.filter(n=>o.has(`${n.r},${n.c}`)).length;if(s===0)return!0;if(g.length>=3&&s===1){let n=0;for(let t of g)if(!o.has(`${t.r},${t.c}`)){for(let e of l)if(e!==r)for(let x=0;x<5;x+=2){let w=e.across?e.row:e.row+x,f=e.across?e.col+x:e.col;if(w===t.r&&f===t.c){n++;break}}}if(n===0)return!0}}return!1}function pe(a,l){let o={expert:{min:.05,max:.4,name:"Expert"},hard:{min:.35,max:.5,name:"Hard"},medium:{min:.55,max:.65,name:"Medium"},easy:{min:.65,max:.75,name:"Easy"}},r=o[a]||o.medium;return{minGivens:Math.ceil(l*r.min),maxGivens:Math.ceil(l*r.max),name:r.name}}function ge(a,l){let{grid:o,equations:r,optimizedGivens:g}=a,s=g||new Set,n=[];for(let c=0;c<24;c++)for(let m=0;m<24;m++)o[c][m]&&n.push({r:c,c:m});let t=Math.min(...n.map(c=>c.r)),e=Math.max(...n.map(c=>c.r)),x=Math.min(...n.map(c=>c.c)),w=Math.max(...n.map(c=>c.c)),f=e-t+1,u=w-x+1,d=Math.min(32,Math.floor(320/Math.max(f,u))),i=u*d,h=f*d;A.setAttribute("viewBox",`0 0 ${i} ${h}`),A.setAttribute("width",i),A.setAttribute("height",h),A.innerHTML="";for(let c=t;c<=e;c++)for(let m=x;m<=w;m++){let k=(m-x)*d,M=(c-t)*d,y=o[c][m];if(y){A.appendChild(J("rect",{x:k,y:M,width:d,height:d,fill:"#fff",stroke:"#000","stroke-width":2}));let C=y.ch;y.k==="num"&&!L.checked&&(C=s.has(`${c},${m}`)?y.ch:"");let q=Math.max(12,C.length>=2?d*.5:d*.7),v=J("text",{x:k+d/2,y:M+d/2+q/4,"text-anchor":"middle","dominant-baseline":"middle","font-size":q,"font-family":"Arial, sans-serif","font-weight":"bold"});v.textContent=C,A.appendChild(v)}}A.appendChild(J("rect",{x:0,y:0,width:i,height:h,fill:"none",stroke:"#000","stroke-width":3})),document.getElementById("grid").style.display="none",xe(o,s,t,e,x,w),be(o,s,t,e,x,w);let p=[];for(let c=0;c<24;c++)for(let m=0;m<24;m++)o[c][m]&&o[c][m].k==="num"&&p.push({r:c,c:m});let b=pe(l,p.length);return{numTotal:p.length,actualGivens:s.size,difficulty:b}}function xe(a,l,o,r,g,s){let n=document.getElementById("screenGrid"),t=document.createElement("div");t.className="print-grid";let e=24,x=(s-g+1)*e,w=(r-o+1)*e;t.style.width=x+"px",t.style.height=w+"px";let f=0;for(let u=o;u<=r;u++)for(let d=g;d<=s;d++){let i=a[u][d];if(i){let h=document.createElement("div");h.className="print-cell screen-view";let p=(d-g)*e,b=(u-o)*e;h.style.left=p+"px",h.style.top=b+"px",h.style.width=e+"px",h.style.height=e+"px",h.style.fontSize=Math.floor(e*.6)+"px",a[u]&&a[u][d+1]||h.classList.add("border-right"),a[u+1]&&a[u+1][d]||h.classList.add("border-bottom");let k=i.ch,M=!1;if(i.k==="num"&&!L.checked&&(M=l.has(`${u},${d}`),k=M?i.ch:""),h.textContent=k,i.k==="op")switch(i.ch){case"+":h.classList.add("op-add");break;case"-":h.classList.add("op-sub");break;case"\xD7":h.classList.add("op-mul");break;case"\xF7":h.classList.add("op-div");break}else i.k==="eq"?h.classList.add("op-eq"):i.k==="num"&&(M&&!L.checked?h.classList.add("given"):h.classList.add(f%2===0?"num-even":"num-odd"),f++);t.appendChild(h)}}n.innerHTML="",n.appendChild(t)}function be(a,l,o,r,g,s){let n=document.getElementById("printGrid"),t=document.createElement("div");t.className="print-grid";let e=r-o+1,x=s-g+1,w=175,f=250,u=225,d=175,i=3.78,h=Math.floor(w*i/x),p=Math.floor(f*i/e),b=Math.min(h,p),c=Math.floor(u*i/x),m=Math.floor(d*i/e),k=Math.min(c,m),M=Math.max(Math.floor(b*.9),Math.floor(k*.9),23),y=b>=k;window.printOrientation=y?"portrait":"landscape",window.printCellSize=M;let C=(s-g+1)*M,q=(r-o+1)*M;t.style.width=C+"px",t.style.height=q+"px";for(let v=o;v<=r;v++)for(let E=g;E<=s;E++){let P=a[v][E];if(P){let $=document.createElement("div");$.className="print-cell";let B=window.printCellSize||cellSize,ee=(E-g)*B,te=(v-o)*B;$.style.left=ee+"px",$.style.top=te+"px",$.style.width=B+"px",$.style.height=B+"px",$.style.fontSize=Math.max(12,Math.floor(B*.4))+"px",a[v]&&a[v][E+1]||$.classList.add("border-right"),a[v+1]&&a[v+1][E]||$.classList.add("border-bottom");let Y=P.ch;P.k==="num"&&!L.checked&&(Y=l.has(`${v},${E}`)?P.ch:""),$.textContent=Y,t.appendChild($)}}n.innerHTML="",n.appendChild(t)}function N(){j("mx_eq",T.value),j("mx_diff",O.value),j("mx_range",H.value),j("mx_ops",JSON.stringify({add:W.checked,sub:V.checked,mul:_.checked,div:D.checked}))}function I(a=!1){let l=O.value||"medium";z.textContent=`\u{1F504} Generating ${l} puzzle... (this may take longer for precise difficulty targeting)`,z.style.background="#fff3cd",z.style.color="#856404",z.style.border="2px solid #ffeeba",setTimeout(async()=>{let o=parseInt(T.value)||30,r=O.value||"medium";if(X().length===0){z.textContent="\u26A0\uFE0F Please select at least one operation!",z.style.background="#f8d7da",z.style.color="#721c24",z.style.border="2px solid #f5c6cb";return}N();let s={expert:{min:5,max:40},hard:{min:35,max:50},medium:{min:55,max:65},easy:{min:65,max:75}},n=s[r]||s.medium,t=0,e=null,x=null,w=0,f=()=>{if(!document.getElementById("spinnerStyles")){let M=document.createElement("style");M.id="spinnerStyles",M.textContent=`
          .puzzle-spinner-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            background: rgba(248, 249, 250, 0.8);
            border-radius: 12px;
            border: 2px dashed #dee2e6;
          }
          .puzzle-spinner {
            width: 60px;
            height: 60px;
            border: 6px solid #f3f3f3;
            border-top: 6px solid #007bff;
            border-radius: 50%;
            animation: spin 1.2s linear infinite;
            margin-bottom: 20px;
          }
          .spinner-text {
            font-size: 16px;
            color: #6c757d;
            font-weight: 500;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `,document.head.appendChild(M)}let b=document.createElement("div");b.className="puzzle-spinner-container",b.id="puzzleSpinnerContainer";let c=document.createElement("div");c.className="puzzle-spinner";let m=document.createElement("div");m.className="spinner-text",m.id="spinnerText",m.textContent="Generating puzzle...",b.appendChild(c),b.appendChild(m);let k=document.getElementById("screenGrid");k&&k.parentNode&&k.parentNode.insertBefore(b,k)},u=()=>{let b=document.getElementById("puzzleSpinnerContainer");b&&b.remove()},d=document.getElementById("grid"),i=document.getElementById("screenGrid"),h=document.getElementById("printGrid"),p=document.getElementById("ans");for(d&&(d.style.display="none"),i&&(i.style.display="none"),h&&(h.style.display="none"),p&&(p.style.display="none"),f();t<10;){t++;let b=document.getElementById("spinnerText");b&&(b.textContent=`Generating ${r} puzzle... (attempt ${t}/10)`),z.textContent=`\u{1F504} Targeting ${n.min}-${n.max}% difficulty (attempt ${t}/10)`,await new Promise(c=>setTimeout(c,10));try{let c=ie(o,r);if(!c)continue;let m=ge(c,r),k=Math.round(m.actualGivens/m.numTotal*100);if(k>=n.min&&k<=n.max){e=c,x=m,w=k;break}else(!e||Math.abs(k-(n.min+n.max)/2)<Math.abs(w-(n.min+n.max)/2))&&(e=c,x=m,w=k)}catch{continue}}if(u(),i&&(i.style.display=""),p&&(p.style.display=""),h&&(h.style.display="none"),e&&x){let b=U();z.style.background="#d4edda",z.style.color="#155724",z.style.border="2px solid #c3e6cb",z.textContent=`\u2705 Generated ${x.difficulty.name} puzzle (${b.min}-${b.max}) with ${e.equations.length} equations, showing ${x.actualGivens}/${x.numTotal} numbers (${w}%) [attempt ${t}]`,a&&setTimeout(()=>window.print(),100)}else{z.textContent="\u26A0\uFE0F Unexpected error during generation.",z.style.background="#f8d7da",z.style.color="#721c24",z.style.border="2px solid #f5c6cb";return}},10)}function ke(){let a=window.open("","_blank","width=800,height=600"),l=r(),o=window.printOrientation||"portrait";function r(){let g=document.getElementById("printGrid");if(!g||!g.firstChild)return"<div>No puzzle generated</div>";let s=g.firstChild.cloneNode(!0),n=s.querySelectorAll(".print-cell"),t=0;return n.forEach(e=>{let x=e.textContent.trim();if(["+","-","\xD7","\xF7"].includes(x))switch(x){case"+":e.classList.add("op-add");break;case"-":e.classList.add("op-sub");break;case"\xD7":e.classList.add("op-mul");break;case"\xF7":e.classList.add("op-div");break}else x==="="?e.classList.add("op-eq"):x&&!isNaN(x)&&(e.style.fontSize&&parseInt(e.style.fontSize)>15?e.classList.add("given"):e.classList.add(t%2===0?"num-even":"num-odd"),t++)}),s.outerHTML}a.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Math Crossword - Color Print</title>
      <style>
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        body {
          margin: 20px;
          font-family: Arial, sans-serif;
          background: white;
        }

        .print-grid {
          position: relative;
          margin: 0 auto;
          font-family: Arial, sans-serif;
        }

        .print-cell {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          box-sizing: border-box;
          border-top: 1px solid #666;
          border-left: 1px solid #666;
        }

        .print-cell.border-right {
          border-right: 1px solid #666;
        }

        .print-cell.border-bottom {
          border-bottom: 1px solid #666;
        }

        .print-cell.op-add {
          background: #e8f5e8 !important;
          color: #4a7c59 !important;
        }
        .print-cell.op-sub {
          background: #fff3e0 !important;
          color: #8d4004 !important;
        }
        .print-cell.op-mul {
          background: #f3e5f5 !important;
          color: #6a1b9a !important;
        }
        .print-cell.op-div {
          background: #e3f2fd !important;
          color: #1565c0 !important;
        }
        .print-cell.op-eq {
          background: #fce4ec !important;
          color: #ad1457 !important;
        }
        .print-cell.num-even {
          background: #f8f9fa !important;
          color: #495057 !important;
        }
        .print-cell.num-odd {
          background: #f1f8e9 !important;
          color: #2e7d32 !important;
        }
        .print-cell.given {
          background: #fff8e1 !important;
          color: #f57c00 !important;
          font-weight: 900 !important;
        }

        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          @page {
            size: A4 ${o};
            margin: 10mm 10mm 13.5mm 10mm; /* top right bottom left */
          }
        }
      </style>
    </head>
    <body>
      <h2 style="text-align: center; margin-bottom: 20px;">Math Crossword Puzzle</h2>
      ${l}
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 100);
        };
      <\/script>
    </body>
    </html>
  `),a.document.close()}document.getElementById("gen").addEventListener("click",()=>I(!1));document.getElementById("printColor").addEventListener("click",()=>ke());L.addEventListener("change",()=>I(!1));T.addEventListener("input",()=>{Z.textContent=T.value,N()});O.addEventListener("change",()=>{N(),I(!1)});H.addEventListener("change",()=>{N(),I(!1)});W.addEventListener("change",()=>{N(),I(!1)});V.addEventListener("change",()=>{N(),I(!1)});_.addEventListener("change",()=>{N(),I(!1)});D.addEventListener("change",()=>{N(),I(!1)});oe();I(!1);})();
