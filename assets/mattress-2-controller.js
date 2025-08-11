jQuery(document).ready(function ($) {
    const MAIN_PRODUCT_VARIANT_ID = '44348731326640'; // Queen variant ID
  
    const VARIANTS = {
      pillow: {
        Standard: '43549412032688',
        King: '43549412065456',
      },
      bedBase: {
        'Power Base': {
          'Twin XL': '43518441160880',
          Queen: '43518441193648',
          King: '43518441226416',
          'Split King': '43518441226416',
          'California King': '43518441226416',
        },
        'HD Riser': {
          Twin: '43932973072560',
          'Twin XL': '43932973007024',
          Full: '43932973138096',
          Queen: '43932973039792',
          King: '43932973105328',
          'Split King': '43932973105328',
          'California King': '43932973105328',
        },
        'Wooden Platform': {
          Full: '43557194268848',
          Queen: '43454855905456',
          King: '43454855938224',
          'Split King': '43454855938224',
          'California King': '43454855938224',
        },
      },
    };
  
    const IMAGES = {
      Original: 'https://cdn.shopify.com/s/files/1/0152/7916/1444/files/HD-original-pdp-hero.png',
      Hybrid: 'https://cdn.shopify.com/s/files/1/0152/7916/1444/files/HD-luxury-pdp-hero.png',
    };
  
    const DESCRIPTIONS = {
      Original: {
        title: 'The Original',
        text: 'The Nest & Wild Original mattress is the heart of our brand and what put N&W on the map! The Original all-foam mattress combines our Best in Class cooling cover with premium, pressure relieving, comfort layers and a high density support core to keep you comfortable for years to come.',
      },
      Hybrid: {
        title: 'Luxury Hybrid',
        text: 'Experience ultimate luxury with the Nest & Wild Luxury Hybrid, our best-selling addition to the collection. Boasting a premium cooling cover, highly breathable comfort layers, and an American-made wrapped QuadCoil unit, this mattress offers unbeatable comfort and support.',
      },
    };
  
    // State
    let selectedPillowSize = null;
    let selectedBedBase = null;
    let mattressSize = null;
    let pillowQty = 1;
    let selectedMattressType = '';
  
    const $heroImg = $('.mattressHeroShot img');
    const $mattressOptions = $('.mattress2Options');
  
    function initializeState() {
      setTimeout(() => {
        selectedPillowSize = $('input[name="properties[Size]"]:checked').val() || null;
        selectedBedBase = $('input[name="properties[Base Options]"]:checked').val() || null;
        mattressSize = $('select[name="Mattress Size"]').val() || null;
        pillowQty = Math.min(Math.max(parseInt($('input[name="properties[Number of Pillows]"]').val(), 10) || 1, 1), 4);
        $('input[name="properties[Number of Pillows]"]').val(pillowQty);
        console.log('[Debug] Initial State:', { selectedPillowSize, selectedBedBase, mattressSize, pillowQty });
      }, 800);
    }
  
    function setupEventListeners() {
      $(document).on('change', 'input[name="properties[Size]"]', function () {
        selectedPillowSize = $(this).val();
        console.log('[Debug] Selected Pillow Size:', selectedPillowSize);
      });
  
      $(document).on('change', 'input[name="properties[Base Options]"]', function () {
        selectedBedBase = $(this).val();
        console.log('[Debug] Selected Bed Base:', selectedBedBase);
      });
  
      $(document).on('change', 'select[name="Mattress Size"]', function () {
        mattressSize = $(this).val();
        console.log('[Debug] Mattress Size:', mattressSize);
      });
  
      $(document).on('input', 'input[name="properties[Number of Pillows]"]', function () {
        pillowQty = Math.min(Math.max(parseInt($(this).val(), 10) || 1, 1), 4);
        $(this).val(pillowQty);
        console.log('[Debug] Pillow Quantity:', pillowQty);
      });
  
      $('.optionMattressType .option-item-inner').on('click', function () {
        selectedMattressType = $(this).attr('option-name-value');
        console.log('[Debug] Selected Mattress Type:', selectedMattressType);
        updateMattressDisplay(selectedMattressType);
      });
  
      $('.addCartCustom button').on('click', async (e) => {
        e.preventDefault();
        await handleAddToCart();
      });
  
      $(document).on('change', '.mattress2Options .bold_option_checkbox input[type="checkbox"]', () => {
        setTimeout(updateToggleStates, 50);
      });
    }
  
    function updateMattressDisplay(type) {
      const { title, text } = DESCRIPTIONS[type] || DESCRIPTIONS.Original;
      const imgSrc = IMAGES[type] || IMAGES.Original;
  
      if ($heroImg.length) {
        $heroImg.fadeOut(300, function () {
          $heroImg.attr('src', imgSrc).fadeIn(300);
        });
      } else {
        console.error('[Error] .mattressHeroShot img not found');
      }
  
      $('.prodTitle h1').text(title);
      $('.prodDescript .p-description-wrapper p span').text(text);
    }
  
    function initializeToggles() {
      $mattressOptions.css('opacity', '0');
      setTimeout(() => {
        $('.mattress2Options .bold_option_checkbox').each(function () {
          const $wrapper = $(this);
          const $checkbox = $wrapper.find('input[type="checkbox"]');
          if ($wrapper.find('.customToggleSwitch').length === 0) {
            $('<span class="customToggleSwitch"></span>').insertAfter($checkbox);
          }
        });
        updateToggleStates();
        $mattressOptions.fadeTo(300, 1);
      }, 1000);
    }
  
    function updateToggleStates() {
      $('.mattress2Options .bold_option_checkbox').each(function () {
        const $wrapper = $(this);
        const $hiddenInput = $wrapper.find('input[type="hidden"]');
        const $toggle = $wrapper.find('.customToggleSwitch');
        $toggle.toggleClass('on', $hiddenInput.val() === '✓');
      });
    }
  
    function openCartDrawer() {
      if (window.CartDrawer && typeof window.CartDrawer.open === 'function') {
        window.CartDrawer.open();
      } else {
        document.dispatchEvent(new CustomEvent('cart:refresh'));
      }
    }
  
    async function handleAddToCart() {
      const variantId = '43549412032688'; // Standard pillow
      const quantity = 1;
  
      console.log('[Debug] Adding via /cart/add.js:', variantId);
  
      try {
        const response = await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: variantId, quantity })
        });
  
        const data = await response.json();
        console.log('[✅ /cart/add.js result]', data);
  
        openCartDrawer();
      } catch (err) {
        console.error('[Add to Cart Error]', err);
        alert('There was an error adding the item to the cart.');
      }
    }
  
    // Init
    initializeState();
    setupEventListeners();
    initializeToggles();
    console.log('[Native Cart API] Bundle cart script loaded.');
  
    $('.addCartCustom button').attr('type', 'button');
    $('form[action="/cart/add"]').off('submit').on('submit', function (e) {
      e.preventDefault();
    });
  });
  