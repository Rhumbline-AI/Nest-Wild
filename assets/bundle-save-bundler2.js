/**
 * Bundle & Save Component
 */

(function($) {
  'use strict';
  
  const BundleSave = {
    selectors: {
      container: '#bundle-save-bundler2',
      pillowCheckbox: '#add-pillow',
      bedbaseCheckbox: '#add-bedbase',
      pillowDetails: '#pillow-options',
      bedbaseDetails: '#bedbase-options',
      pillowQuantity: '#pillow-quantity',
      pillowSizeRadios: 'input[name="pillow-size"]',
      bedbaseTypeRadios: 'input[name="bedbase-type"]',
      bedbaseImage: '#bedbase-image',
      bedbaseTitle: '#bedbase-title',
      bedbasePrice: '#bedbase-price',
      bundleAddToCart: '#bundle-add-to-cart',
      quantityButtons: '.quantity-btn',
      pillowPrice: '#pillow-price',
      pillowData: '#pillow-product-data',
      mattressSizeSelector: 'input[name="option2"]'
    },

    state: {
      pillowPrices: {
        standard: '',
        king: ''
      },
      currentMattressSize: '',
      bedbasePrices: {
        adjustable: {},
        platform: {},
        riser: {}
      }
    },

    init: function() {
      if (!$(this.selectors.container).length) return;
      
      this.loadPillowPrices();
      this.loadBedbasePrices();
      this.bindEvents();
      this.initializeState();
      this.updateBedbasePricing();
      this.placeBundlerAboveBuyButtons();
      this.bindResizeHandler();
      
      // Debug: Check if mattress size selector exists
      console.log('Mattress size selector found:', $(this.selectors.mattressSizeSelector).length);
      console.log('Current mattress size:', $(this.selectors.mattressSizeSelector + ':checked').val());
    },

    loadPillowPrices: function() {
      // Read prices from the variant data that's already working
      const $standardVariant = $('.pillow-variants .variant-data[data-size="standard/queen"]');
      const $kingVariant = $('.pillow-variants .variant-data[data-size="king"]');
      
      const standardPrice = $standardVariant.data('price');
      const kingPrice = $kingVariant.data('price');
      
      // Only store prices if we successfully loaded them
      if (standardPrice && kingPrice) {
        this.state.pillowPrices = {
          standard: standardPrice,
          king: kingPrice
        };
        // Update initial price display if we have the data
        $(this.selectors.pillowPrice).text(standardPrice);
        console.log('Loaded pillow prices:', this.state.pillowPrices);
      } else {
        console.log('Using default pillow prices');
      }
    },

    bindEvents: function() {
      const $container = $(this.selectors.container);
      
      // Toggle sections
      $container.on('change', this.selectors.pillowCheckbox, (e) => {
        this.toggleSection($(this.selectors.pillowDetails), e.target.checked);
      });

      $container.on('change', this.selectors.bedbaseCheckbox, (e) => {
        this.toggleSection($(this.selectors.bedbaseDetails), e.target.checked);
      });

      // Handle pillow size changes
      $container.on('change', this.selectors.pillowSizeRadios, (e) => {
        const size = $(e.target).val();
        // Only update price if we have dynamic prices loaded
        if (this.state.pillowPrices[size]) {
          $(this.selectors.pillowPrice).text(this.state.pillowPrices[size]);
          console.log('Updating to dynamic price:', this.state.pillowPrices[size]);
        } else {
          // Keep the default price if we don't have dynamic prices
          console.log('Keeping default price');
        }
      });

      // Handle bed base type changes
      $container.on('change', this.selectors.bedbaseTypeRadios, (e) => {
        this.updateBedbaseDisplay($(e.target));
      });

      // Listen for mattress size changes
      $(document).on('change', this.selectors.mattressSizeSelector, (e) => {
        console.log('Mattress size change event triggered');
        this.state.currentMattressSize = $(e.target).val().toLowerCase();
        console.log('Mattress size changed to:', this.state.currentMattressSize);
        this.updateBedbasePricing();
      });
      
      // Also listen for clicks on mattress size options
      $(document).on('click', this.selectors.mattressSizeSelector, (e) => {
        console.log('Mattress size click event triggered');
        setTimeout(() => {
          this.state.currentMattressSize = $(e.target).val().toLowerCase();
          console.log('Mattress size clicked to:', this.state.currentMattressSize);
          this.updateBedbasePricing();
        }, 100);
      });

      // Quantity controls
      $container.on('click', this.selectors.quantityButtons, (e) => {
        this.handleQuantityChange($(e.target));
      });

      // Add bundle to cart
      $container.on('click', this.selectors.bundleAddToCart, (e) => {
        e.preventDefault();
        this.addBundleToCart();
      });
    },

    initializeState: function() {
      // Show sections by default
      $(this.selectors.pillowDetails).show();
      $(this.selectors.bedbaseDetails).show();
      
      // Set checkboxes checked by default
      $(this.selectors.pillowCheckbox).prop('checked', true);
      $(this.selectors.bedbaseCheckbox).prop('checked', true);
      
      // Set default bed base
      const $defaultBase = $(`${this.selectors.bedbaseTypeRadios}[value="adjustable"]`);
      $defaultBase.prop('checked', true);
      this.updateBedbaseDisplay($defaultBase);
    },

    toggleSection: function($section, enabled) {
      const $option = $section.closest('.bundle-option');
      if (enabled) {
        $option.removeClass('disabled');
      } else {
        $option.addClass('disabled');
      }
    },

    updateBedbaseDisplay: function($radio) {
      if (!$radio.length) return;

      const title = $radio.data('product-title');
      const image = $radio.data('product-image');
      const baseType = $radio.val();

      $(this.selectors.bedbaseTitle).text(title);
      $(this.selectors.bedbaseImage).attr('src', image);
      
      // Update price based on current mattress size
      if (this.state.currentMattressSize) {
        const variantSize = this.getBedbaseVariantForMattressSize(baseType, this.state.currentMattressSize);
        if (variantSize && this.state.bedbasePrices[baseType][variantSize]) {
          const price = this.state.bedbasePrices[baseType][variantSize];
          $(this.selectors.bedbasePrice).text(`$${price}`);
        }
      }
    },

    loadBedbasePrices: function() {
      // Load all bed base variant prices
      $('.bedbase-variants .variant-data').each((index, element) => {
        const $variant = $(element);
        const type = $variant.data('type');
        const size = $variant.data('size');
        const price = $variant.data('price');
        
        if (!this.state.bedbasePrices[type]) {
          this.state.bedbasePrices[type] = {};
        }
        this.state.bedbasePrices[type][size] = price;
      });
      
      console.log('Loaded bed base prices:', this.state.bedbasePrices);
    },

    getBedbaseVariantForMattressSize: function(baseType, mattressSize) {
      // Map mattress size to bed base variant
      const sizeMap = {
        'twin': { adjustable: null, platform: null, riser: 'twin' },
        'twin xl': { adjustable: 'twin xl', platform: null, riser: 'twin xl' },
        'full': { adjustable: null, platform: 'full', riser: 'full' },
        'queen': { adjustable: 'queen', platform: 'queen', riser: 'queen' },
        'king': { adjustable: 'split king - 2 txl', platform: 'king', riser: 'king' },
        'split king': { adjustable: 'split king - 2 txl', platform: 'king', riser: 'king' },
        'california king': { adjustable: 'split king - 2 txl', platform: 'king', riser: 'king' }
      };
      
      return sizeMap[mattressSize] ? sizeMap[mattressSize][baseType] : null;
    },

    updateBedbasePricing: function() {
      if (!this.state.currentMattressSize) {
        // Get initial mattress size
        const $selectedSize = $(this.selectors.mattressSizeSelector + ':checked');
        if ($selectedSize.length) {
          this.state.currentMattressSize = $selectedSize.val().toLowerCase();
        }
      }
      
      console.log('Updating bed base pricing for mattress size:', this.state.currentMattressSize);
      
      if (!this.state.currentMattressSize) return;
      
      // Update each bed base option
      const baseTypes = ['adjustable', 'platform', 'riser'];
      baseTypes.forEach(type => {
        const variantSize = this.getBedbaseVariantForMattressSize(type, this.state.currentMattressSize);
        const $radio = $(`input[name="bedbase-type"][value="${type}"]`);
        const $container = $radio.closest('.radio-container');
        
        console.log(`Bed base ${type}: variant size = ${variantSize}, price = ${this.state.bedbasePrices[type][variantSize]}`);
        
        if (variantSize && this.state.bedbasePrices[type][variantSize]) {
          // Variant available - enable and update price
          const price = this.state.bedbasePrices[type][variantSize];
          $container.removeClass('unavailable').removeAttr('style');
          $radio.prop('disabled', false);
          
          // Update price display
          $(this.selectors.bedbasePrice).text(`$${price}`);
          
          // Remove any existing unavailable message
          $container.find('.unavailable-message').remove();
        } else {
          // Variant not available - disable and style
          $container.addClass('unavailable').css({
            'opacity': '0.4',
            'pointer-events': 'none'
          });
          $radio.prop('disabled', true);
          
          // Add unavailable message
          if (!$container.find('.unavailable-message').length) {
            $container.append('<div class="unavailable-message" style="font-size: 10px; color: #999; margin-top: 2px;">(size not available)</div>');
          }
        }
      });
      
      // Update the currently selected bed base display
      const $selectedBase = $(this.selectors.bedbaseTypeRadios + ':checked');
      if ($selectedBase.length) {
        this.updateBedbaseDisplay($selectedBase);
      }
    },

    showNotification: function(message, type = 'success') {
      const $messages = $('.bundle-status-messages');
      const $message = type === 'success' ? $('.bundle-success-message') : $('.bundle-error-message');
      
      $message.text(message);
      $messages.show();
      $message.show();
      
      // Auto-hide after 3 seconds
      setTimeout(() => {
        $message.fadeOut();
        setTimeout(() => {
          if (!$('.bundle-success-message').is(':visible') && !$('.bundle-error-message').is(':visible')) {
            $messages.hide();
          }
        }, 300);
      }, 3000);
    },

    getPillowVariantId: function() {
      const selectedSize = $(this.selectors.pillowSizeRadios + ':checked').val();
      
      // Get variant ID from the hidden variant data
      const $variant = $(`.pillow-variants .variant-data[data-size="${selectedSize}"]`);
      return $variant.data('id');
    },

    getBedbaseVariantId: function() {
      const selectedType = $(this.selectors.bedbaseTypeRadios + ':checked').val();
      const mattressSize = this.state.currentMattressSize;
      
      // Use the correct variant IDs from the existing codebase
      const variantMap = {
        adjustable: {
          'twin xl': '43518441160880',
          'queen': '43518441193648', 
          'king': '43518441226416',
          'split king': '43518441226416',
          'california king': '43518441226416'
        },
        platform: {
          'full': '43557194268848',
          'queen': '43454855905456',
          'king': '43454855938224'
        },
        riser: {
          'twin': '43932973072560',
          'twin xl': '43932973007024',
          'full': '43932973138096',
          'queen': '43932973039792',
          'king': '43932973105328'
        }
      };
      
      return variantMap[selectedType] && variantMap[selectedType][mattressSize];
    },

    addBundleToCart: function() {
      const $button = $(this.selectors.bundleAddToCart);
      const originalText = $button.text();
      
      // Disable button and show loading state
      $button.prop('disabled', true).text('BUILDING BUNDLE...');
      this.showNotification('Building bundle...', 'success');
      
      const itemsToAdd = [];
      
      // Add pillow if enabled
      if ($(this.selectors.pillowCheckbox).is(':checked')) {
        const pillowVariantId = this.getPillowVariantId();
        const pillowQuantity = parseInt($(this.selectors.pillowQuantity).val()) || 1;
        
        console.log('Pillow selection:', {
          enabled: $(this.selectors.pillowCheckbox).is(':checked'),
          variantId: pillowVariantId,
          quantity: pillowQuantity
        });
        
        if (pillowVariantId) {
          itemsToAdd.push({
            id: pillowVariantId,
            quantity: pillowQuantity
          });
        }
      }
      
      // Add bed base if enabled
      if ($(this.selectors.bedbaseCheckbox).is(':checked')) {
        const bedbaseVariantId = this.getBedbaseVariantId();
        const selectedType = $(this.selectors.bedbaseTypeRadios + ':checked').val();
        const mattressSize = this.state.currentMattressSize;
        
        console.log('Bed base selection:', {
          enabled: $(this.selectors.bedbaseCheckbox).is(':checked'),
          selectedType: selectedType,
          mattressSize: mattressSize,
          variantId: bedbaseVariantId
        });
        
        if (bedbaseVariantId) {
          itemsToAdd.push({
            id: bedbaseVariantId,
            quantity: 1
          });
        }
      }
      
      console.log('Items to add to cart:', itemsToAdd);
      
      if (itemsToAdd.length === 0) {
        this.showNotification('Please select at least one item to add to bundle', 'error');
        $button.prop('disabled', false).text(originalText);
        return;
      }
      
      // Add items to cart using Shopify Ajax API
      $.ajax({
        url: '/cart/add.js',
        method: 'POST',
        dataType: 'json',
        data: {
          items: itemsToAdd
        },
        success: (response) => {
          console.log('Bundle added to cart successfully:', response);
          this.showNotification('Bundle added to cart!', 'success');
          
          // Update cart count/icon
          this.updateCartCount();
          
          // Reset button
          $button.prop('disabled', false).text(originalText);
        },
        error: (xhr, status, error) => {
          console.error('Error adding bundle to cart:', {
            status: xhr.status,
            statusText: xhr.statusText,
            responseText: xhr.responseText,
            error: error
          });
          this.showNotification('Error adding bundle to cart. Please try again.', 'error');
          $button.prop('disabled', false).text(originalText);
        }
      });
    },

    updateCartCount: function() {
      // Fetch updated cart data
      $.getJSON('/cart.js', (cart) => {
        // Trigger cart update event for theme compatibility
        $(document).trigger('cart:updated', { cart: cart });
        
        // Update cart count if theme has a cart counter
        const $cartCount = $('.cart-count, .cart-count-bubble, [data-cart-count]');
        if ($cartCount.length) {
          $cartCount.text(cart.item_count);
        }
      });
    },

    handleQuantityChange: function($button) {
      const target = $button.data('target');
      const $input = $(`#${target}`);
      const currentVal = parseInt($input.val()) || 1;
      
      if ($button.hasClass('quantity-plus') && currentVal < 10) {
        $input.val(currentVal + 1);
      } else if ($button.hasClass('quantity-minus') && currentVal > 1) {
        $input.val(currentVal - 1);
      }
    },

    placeBundlerAboveBuyButtons: function() {
      try {
        const isDesktop = window.matchMedia('(min-width: 1000px)').matches;
        const $bundleSection = $('.shopify-section--bundle-save');
        const $buyButtons = $('.product-form__buy-buttons');
        if (!$bundleSection.length || !$buyButtons.length) return;

        if (isDesktop) {
          // If not already placed right before buy buttons, move it
          const alreadyPlaced = $bundleSection.next()[0] === $buyButtons[0];
          if (!alreadyPlaced) {
            $bundleSection.insertBefore($buyButtons);
            console.log('[Bundler] Moved bundler above buy buttons');
          }
        } else {
          // On mobile, ensure bundler stays below the form (default order)
          const $templateBundleSlot = $('#shopify-section-' + $bundleSection.attr('id'));
          // No-op: we leave at current position for mobile
        }
      } catch (e) {
        console.warn('[Bundler] placeBundlerAboveBuyButtons error', e);
      }
    },

    bindResizeHandler: function() {
      let resizeTimer = null;
      $(window).on('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => this.placeBundlerAboveBuyButtons(), 150);
      });
    }
  };

  // Initialize when DOM is ready
  $(document).ready(function() {
    BundleSave.init();
  });

})(jQuery);