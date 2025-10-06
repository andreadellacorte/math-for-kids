/**
 * cashier-challenge game logic
 * Migrated from cashier-challenge.html
 */

// Import utilities
import { setCookie, getCookie } from '../storage-utils';

// Declare globals that might be used
declare const window: any;
declare const document: any;

interface CatalogItem {
  name: string;
  price: number;
  barcode: string;
}

interface Discount {
  type: 'percent' | 'amount';
  item: string;
  percent?: number;
  amount?: number;
}

(function(){
  // Game state
  const itemsEl = document.getElementById('items');
  const receiptEl = document.getElementById('receipt');
  const notesEl = document.getElementById('notes');
  const coinsEl = document.getElementById('coins');
  const cashSlot = document.getElementById('cashSlot');
  const chipsEl = document.getElementById('chips');
  // queue removed
  const statusEl = document.getElementById('status');
  // start button removed
  const finishBtn = document.getElementById('finishBtn');
  // next removed

  const padDisplay = document.getElementById('padDisplay');
  // price checker removed
  const helpBtn = document.getElementById('helpBtn');
  const hintMsg = document.getElementById('hintMsg');
  const discountsListEl = document.getElementById('discountsList');

  // queue removed
  let cart: CatalogItem[] = [];
  let selected: CatalogItem | null = null;
  let subtotal = 0;
  let payments = 0;
  let inserted: number[] = [];
  let timerStart = 0;
  let activeDiscounts: Discount[] = [];

  const NOTE_VALUES = [50, 20, 10, 5];
  const COIN_VALUES = [2, 1, 0.5, 0.2, 0.1, 0.05, 0.01];

  const CATALOG: CatalogItem[] = [
    { name: 'Milk', price: 1.20, barcode: 'M-001' },
    { name: 'Bread', price: 0.90, barcode: 'B-002' },
    { name: 'Eggs', price: 1.80, barcode: 'E-003' },
    { name: 'Apples', price: 1.10, barcode: 'A-004' },
    { name: 'Pasta', price: 1.50, barcode: 'P-005' },
    { name: 'Juice', price: 1.30, barcode: 'J-006' },
    { name: 'Cereal', price: 2.70, barcode: 'C-007' },
    { name: 'Cheese', price: 2.10, barcode: 'C-008' },
    { name: 'Yogurt', price: 0.80, barcode: 'Y-009' }
  ];

  // queue removed

  function format(n: number): string { return n.toFixed(2); }

  function reset(): void {
    cart = []; subtotal = 0; payments = 0; selected = null; receiptEl!.innerHTML = ''; hintMsg!.textContent = '';
    activeDiscounts = [];
    if (discountsListEl) discountsListEl.innerHTML = '<div class="discount">No discounts</div>';
  }

  // queue removed

  function spawnItems(): void {
    // Random basket of 3-5 items
    const count = Math.floor(Math.random()*3)+3;
    const pool = [...CATALOG];
    const list: CatalogItem[] = [];
    for(let i=0;i<count;i++){
      const pick = pool.splice(Math.floor(Math.random()*pool.length),1)[0];
      list.push(pick);
    }
    itemsEl!.innerHTML = '';
    list.forEach((it)=>{
      const el = document.createElement('div');
      el.className = 'item';
      el.innerHTML = `<div>${it.name}</div><div class="price">£${format(it.price)}</div><div class="barcode">${it.barcode}</div>`;
      el.addEventListener('click', ()=> addItem(it));
      itemsEl!.appendChild(el);
    });

    // Generate 1-2 discounts relevant to this order
    activeDiscounts = [];
    const pickIdx = () => Math.floor(Math.random()*list.length);
    if (list.length > 0) {
      const d1Item = list[pickIdx()].name;
      const perc = [10,15,20][Math.floor(Math.random()*3)];
      activeDiscounts.push({ type:'percent', item:d1Item, percent: perc });
    }
    if (list.length > 1 && Math.random() < 0.6) {
      let d2Item = list[pickIdx()].name;
      // ensure not duplicate
      let guard=0; while (activeDiscounts.some(d=>d.item===d2Item) && guard++<5) d2Item = list[pickIdx()].name;
      const amount = [0.10,0.20,0.50][Math.floor(Math.random()*3)];
      activeDiscounts.push({ type:'amount', item:d2Item, amount: amount });
    }
    renderDiscounts();
  }

  function renderDiscounts(): void {
    discountsListEl!.innerHTML = '';
    if (activeDiscounts.length === 0){
      discountsListEl!.innerHTML = '<div class="discount">No discounts</div>';
      return;
    }
    activeDiscounts.forEach(d => {
      const el = document.createElement('div'); el.className = 'discount';
      if (d.type==='percent') el.textContent = `${d.item}: ${d.percent}% off`;
      else el.textContent = `${d.item}: £${format(d.amount!)} off`;
      discountsListEl!.appendChild(el);
    });
  }

  function getDiscountForItem(item: CatalogItem): { amount: number; label: string } {
    // compute best single discount for item
    let best = 0; let label = '';
    activeDiscounts.forEach(d => {
      if (d.item !== item.name) return;
      if (d.type==='percent'){
        const amt = Math.round(item.price * (d.percent!/100) * 100)/100;
        if (amt > best){ best = amt; label = `${d.percent}% off`; }
      } else if (d.type==='amount'){
        const amt = Math.min(d.amount!, item.price);
        if (amt > best){ best = amt; label = `£${format(amt)} off`; }
      }
    });
    return { amount: best, label };
  }

  function addItem(it: CatalogItem): void {
    cart.push(it);
    // add item line
    const itemLine = document.createElement('div'); itemLine.className = 'receipt-line';
    itemLine.innerHTML = `<span>${it.name}</span><span>£${format(it.price)}</span>`;
    receiptEl!.appendChild(itemLine);
    subtotal = Math.round((subtotal + it.price)*100)/100;

    // apply discount if any
    const disc = getDiscountForItem(it);
    if (disc.amount > 0){
      const dLine = document.createElement('div'); dLine.className = 'receipt-line';
      dLine.innerHTML = `<span>— Discount (${disc.label})</span><span>-£${format(disc.amount)}</span>`;
      receiptEl!.appendChild(dLine);
      subtotal = Math.round((subtotal - disc.amount)*100)/100;
    }

    statusEl!.textContent = 'Added ' + it.name + ' to receipt';
  }

  function renderCash(): void {
    notesEl!.innerHTML = ''; coinsEl!.innerHTML = '';
    NOTE_VALUES.forEach((v: number)=>{
      const b = document.createElement('button'); b.className = 'note'; b.textContent = '£' + v; b.addEventListener('click', ()=> insertCash(v));
      notesEl!.appendChild(b);
    });
    COIN_VALUES.forEach((v: number)=>{
      const b = document.createElement('button'); b.className = 'coin'; b.textContent = '£' + format(v); b.addEventListener('click', ()=> insertCash(v));
      coinsEl!.appendChild(b);
    });
  }

  function insertCash(v: number): void {
    payments = Math.round((payments + v)*100)/100;
    inserted.push(v);
    cashSlot!.textContent = 'Inserted: £' + format(payments);
    renderChips();
  }

  function renderChips(): void {
    chipsEl!.innerHTML = '';
    if (inserted.length === 0){
      chipsEl!.innerHTML = '<div style="opacity:0.7;">—</div>';
      return;
    }
    inserted.forEach((val, idx)=>{
      const c = document.createElement('button'); c.className = 'chip';
      c.textContent = '£' + format(val);
      c.title = 'Remove this';
      c.addEventListener('click', ()=> removeChip(idx));
      chipsEl!.appendChild(c);
    });
  }

  function removeChip(index: number): void {
    const val = inserted[index];
    inserted.splice(index,1);
    payments = Math.round((payments - val)*100)/100;
    cashSlot!.textContent = 'Inserted: £' + format(payments);
    renderChips();
  }

  function rebuildReceipt(): void {
    subtotal = 0;
    receiptEl!.innerHTML = '';
    cart.forEach(it => {
      const itemLine = document.createElement('div'); itemLine.className = 'receipt-line';
      itemLine.innerHTML = `<span>${it.name}</span><span>£${format(it.price)}</span>`;
      receiptEl!.appendChild(itemLine);
      subtotal = Math.round((subtotal + it.price)*100)/100;
      const disc = getDiscountForItem(it);
      if (disc.amount > 0){
        const dLine = document.createElement('div'); dLine.className = 'receipt-line';
        dLine.innerHTML = `<span>— Discount (${disc.label})</span><span>-£${format(disc.amount)}</span>`;
        receiptEl!.appendChild(dLine);
        subtotal = Math.round((subtotal - disc.amount)*100)/100;
      }
    });
  }

  // price checker removed

  function showHint(): void {
    if (cart.length===0) { hintMsg!.textContent = 'Add items first.'; return; }
    const due = Math.round(subtotal*100)/100;
    if (payments < due) { hintMsg!.textContent = `You need £${format(due - payments)} more.`; }
    else { hintMsg!.textContent = `Change should be £${format(payments - due)}.`; }
  }

  function evaluateOrder(): void {
    const due = Math.round(subtotal*100)/100;
    const change = Math.round((payments - due)*100)/100;
    let msg = `Subtotal £${format(due)}. `;
    if (payments < due) msg += `Short by £${format(due - payments)}.`;
    else if (payments === due) msg += 'Exact payment. Great job!';
    else msg += `Change due £${format(change)}.`;

    // Simple scoring
    const timeTaken = Math.round((performance.now() - timerStart)/1000);
    let stars = 3;
    if (payments < due) stars = 1;
    else if (timeTaken > 45) stars = 2;

    if (payments === due){
      statusEl!.textContent = `🎉 CONGRATULATIONS! ${msg} ⏱️ ${timeTaken}s ⭐ ${'★'.repeat(stars)}${'☆'.repeat(3-stars)}`;
      // Auto-load next order after short delay
      setTimeout(()=> start(), 1200);
    } else {
      statusEl!.textContent = `${msg} ⏱️ ${timeTaken}s ⭐ ${'★'.repeat(stars)}${'☆'.repeat(3-stars)}`;
    }
  }

  function start(): void {
    reset(); spawnItems(); renderCash();
    cashSlot!.textContent = 'Insert payment here';
    statusEl!.textContent = 'New order loaded. Click items to add, then Evaluate.';
    timerStart = performance.now();
  }

  function finish(): void {
    evaluateOrder();
  }

  // next removed

  // Pad logic (basic calculator for practice)
  (function initPad(){
    let expr = '';
    padDisplay!.textContent = '0.00';
    document.querySelectorAll('.pad-btn').forEach((btn: Element)=>{
      btn.addEventListener('click', ()=>{
        const t = btn.textContent!.trim();
        if (t === 'C'){ expr = ''; padDisplay!.textContent = '0.00'; return; }
        if (t === '='){ try{
          const val = Function('return ' + expr)();
          padDisplay!.textContent = isFinite(val) ? String(val) : 'Err';
        } catch { padDisplay!.textContent = 'Err'; }
        return; }
        if (t === '+' || t === '-') { expr += ' ' + t + ' '; }
        else { expr += t; }
        padDisplay!.textContent = expr;
      });
    });
  })();

  // Events
  // start removed
  finishBtn!.addEventListener('click', finish);
  // next removed
  // price checker removed
  helpBtn!.addEventListener('click', showHint);
  // Auto-load first order on page load
  start();
})();

// Export init function if it exists
if (typeof window !== 'undefined') {
  // Initialization code runs automatically
}
