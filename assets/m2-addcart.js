// ===== Script C: Reliable Sequential Add-to-Cart with Loader Overlay =====

// Inject loader overlay HTML (no inline styles)
(function insertCartLoaderOverlay() {
  if ($('#cart-loader-overlay').length) return;

  const html = `
    <div id="cart-loader-overlay">
      <div class="loader-inner">
        <div class="cart-spinner"></div>
        <div>Packaging your custom bundle...</div>
      </div>
    </div>
  `;
  $('body').append(html);
})();

// Loader control
function showLoader() {
  $('#cart-loader-overlay').fadeIn(200);
}
function hideLoader() {
  $('#cart-loader-overlay').fadeOut(200);
}

// React to cart drawer event
document.documentElement.addEventListener('cart:refresh', () => {
  hideLoader();
});

function getVariantIdFromUrl() {
  const url = new URL(window.location.href);
  const variantId = url.searchParams.get('variant');
  return variantId ? parseInt(variantId) : null;
}

function addItemToCart(variantId, quantity = 1, callback) {
  fetch('/cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: variantId, quantity }),
  })
    .then(res => {
      if (!res.ok) throw new Error(`Add failed: ${res.status}`);
      return res.json();
    })
    .then(data => {
      console.log(`[✅ Added] Variant ${variantId} x ${quantity}`, data);
      callback(null, data);
    })
    .catch(err => {
      console.error(`[❌ Add Error] Variant ${variantId}`, err);
      callback(err);
    });
}

function addItemToCartAsync(variantId, quantity = 1) {
  return new Promise((resolve, reject) => {
    addItemToCart(variantId, quantity, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function dispatchCartEvents(cart) {
  const detail = {
    cart,
    openMiniCart: true,
    replacementDelay: 0
  };
  document.documentElement.dispatchEvent(new CustomEvent("cart:updated", {
    bubbles: true,
    detail: { cart }
  }));
  document.documentElement.dispatchEvent(new CustomEvent("cart:refresh", {
    bubbles: true,
    detail
  }));
  console.log('[Cart Event] cart:refresh dispatched');
}

async function handleAddToCart() {
  try {
    console.log('[🛒 Add to Cart Triggered]');
    showLoader();

    const mattressId = getVariantIdFromUrl();
    if (!mattressId) {
      alert('Missing mattress variant ID in URL.');
      hideLoader();
      return;
    }

    const tasks = [];

    // Mattress
    tasks.push({ id: mattressId, quantity: 1, label: 'Mattress' });

    // Pillow
    if ($('.cb_2267578_872876').is(':checked') && selectedPillowSize) {
      const pillowId = VARIANTS.pillow[selectedPillowSize];
      if (pillowId) tasks.push({ id: pillowId, quantity: pillowQty, label: 'Pillow' });
    }

    // Bed Base
    if ($('.cb_2267588_872876').is(':checked') && selectedBedBase && mattressSize) {
      const baseId = VARIANTS.bedBase[selectedBedBase]?.[mattressSize];
      if (baseId) tasks.push({ id: baseId, quantity: 1, label: 'Bed Base' });
    }

    for (const task of tasks) {
      try {
        console.log(`[Add →] ${task.label} (ID: ${task.id}, Qty: ${task.quantity})`);
        await addItemToCartAsync(task.id, task.quantity);
        await wait(300);
      } catch (err) {
        console.error(`[❌ Failed] ${task.label} - skipping`);
      }
    }

    let cart = await fetch('/cart.js').then(r => r.json());
    if (!cart || cart.item_count === 0) {
      console.warn('[⏳ Retry] Cart empty after adds, waiting...');
      await wait(400);
      cart = await fetch('/cart.js').then(r => r.json());
    }

    dispatchCartEvents(cart);

  } catch (err) {
    console.error('[Fatal Cart Error]', err);
    alert('Error adding items to cart. See console.');
    hideLoader();
  }
}

$('.addCartCustom button').on('click', function (e) {
  e.preventDefault();
  handleAddToCart();
});
