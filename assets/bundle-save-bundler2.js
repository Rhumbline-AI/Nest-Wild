/**
 * Bundle & Save Component
 */

(function($) {
  'use strict';
  
  const BundleSave = {
      selectors: {
    container: '#bundle-save-bundler2',
    pillowDetails: '#pillow-options',
    bedbaseDetails: '#bedbase-options',
    pillowQuantity: '#pillow-quantity',
    pillowSizeRadios: 'input[name="pillow-size"]',
    bedbaseTypeRadios: 'input[name="bedbase-type"]',
    bedbaseImage: '#bedbase-image',
    bedbaseTitle: '#bedbase-title',
    bedbasePrice: '#bedbase-price',
    pillowAddButton: '#pillow-add-button',
    bedbaseAddButton: '#bedbase-add-button',
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
      
      // Sections are now always visible, no toggle functionality needed

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

      // Individual add buttons
      $container.on('click', this.selectors.pillowAddButton, (e) => {
        e.preventDefault();
        this.addPillowToBundle();
      });

      $container.on('click', this.selectors.bedbaseAddButton, (e) => {
        e.preventDefault();
        this.addBedbaseToBundle();
      });
    },

    initializeState: function() {
      // Sections are always visible now
      $(this.selectors.pillowDetails).show();
      $(this.selectors.bedbaseDetails).show();
      
      // Set default bed base
      const $defaultBase = $(`${this.selectors.bedbaseTypeRadios}[value="adjustable"]`);
      $defaultBase.prop('checked', true);
      this.updateBedbaseDisplay($defaultBase);
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
      
      console.log('Selected pillow size:', selectedSize);
      
      // Map radio button values to actual variant sizes
      const sizeMapping = {
        'standard': 'standard/queen',
        'king': 'king'
      };
      
      const actualSize = sizeMapping[selectedSize] || selectedSize;
      console.log('Mapped to actual size:', actualSize);
      
      // Get variant ID from the hidden variant data
      const $variant = $(`.pillow-variants .variant-data[data-size="${actualSize}"]`);
      
      // Debug: Log all available variants
      console.log('Available pillow variants:');
      $('.pillow-variants .variant-data').each(function() {
        console.log('Variant:', $(this).data('size'), 'ID:', $(this).data('id'));
      });
      
      let variantId = $variant.data('id');
      console.log('Found variant ID from variant data:', variantId);
      
      // Fallback: If no variant found, use hardcoded variant IDs
      if (!variantId) {
        console.log('No variant found, using fallback variant IDs...');
        
        // Fallback variant IDs for DreamChill Quattro Pillow
        const fallbackVariants = {
          'standard': '43549412032688', // Standard variant
          'king': '43549412065456'      // King variant
        };
        
        variantId = fallbackVariants[selectedSize];
        console.log('Using fallback variant ID:', variantId);
      }
      
      return variantId;
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

    addPillowToBundle: function() {
      const $button = $(this.selectors.pillowAddButton);
      const originalText = $button.text();
      
      // Get pillow details
      const pillowQuantity = parseInt($(this.selectors.pillowQuantity).val()) || 1;
      const pillowSize = $(this.selectors.pillowSizeRadios + ':checked').val();
      
      // Get pillow variant ID
      const pillowVariantId = this.getPillowVariantId();
      
      if (!pillowVariantId) {
        this.showNotification('Unable to get pillow variant. Please try again.', 'error');
        return;
      }
      
      // Disable button and show loading
      $button.prop('disabled', true).text('ADDING...');
      
      // Add pillow to cart
      $.ajax({
        url: '/cart/add.js',
        method: 'POST',
        dataType: 'json',
        data: {
          id: pillowVariantId,
          quantity: pillowQuantity
        },
        success: (response) => {
          console.log('Pillow added to cart successfully:', response);
          
          // Show success notification
          const quantityText = pillowQuantity > 1 ? 'pillows' : 'pillow';
          this.showNotification(
            `${pillowQuantity} ${quantityText} added to bundle - add mattress to cart to see total savings`,
            'success'
          );
          
          // Update cart count
          this.updateCartCount();
          
          // Reset button
          $button.prop('disabled', false).text(originalText);
        },
        error: (xhr, status, error) => {
          console.error('Error adding pillow to cart:', error);
          this.showNotification('Error adding pillow to cart. Please try again.', 'error');
          $button.prop('disabled', false).text(originalText);
        }
      });
    },

    addBedbaseToBundle: function() {
      const $button = $(this.selectors.bedbaseAddButton);
      const originalText = $button.text();
      
      // Get bed base details
      const selectedType = $(this.selectors.bedbaseTypeRadios + ':checked').val();
      const mattressSize = this.state.currentMattressSize;
      
      // Get bed base variant ID
      const bedbaseVariantId = this.getBedbaseVariantId();
      
      if (!bedbaseVariantId) {
        this.showNotification('Unable to get bed base variant. Please try again.', 'error');
        return;
      }
      
      // Disable button and show loading
      $button.prop('disabled', true).text('ADDING...');
      
      // Add bed base to cart
      $.ajax({
        url: '/cart/add.js',
        method: 'POST',
        dataType: 'json',
        data: {
          id: bedbaseVariantId,
          quantity: 1
        },
        success: (response) => {
          console.log('Bed base added to cart successfully:', response);
          
          // Show success notification
          const baseTypeText = selectedType === 'adjustable' ? 'Adjustable Base' : 
                              selectedType === 'platform' ? 'Wooden Platform' : 'HD Riser Frame';
          this.showNotification(
            `${baseTypeText} added to bundle - add mattress to cart to see total savings`,
            'success'
          );
          
          // Update cart count
          this.updateCartCount();
          
          // Reset button
          $button.prop('disabled', false).text(originalText);
        },
        error: (xhr, status, error) => {
          console.error('Error adding bed base to cart:', error);
          this.showNotification('Error adding bed base to cart. Please try again.', 'error');
          $button.prop('disabled', false).text(originalText);
        }
      });
    },

    showNotification: function(message, type = 'info') {
      // Remove any existing notifications
      $('.bundle-notification').remove();
      
      // Create notification element
      const $notification = $(`
        <div class="bundle-notification ${type}">
          <button class="bundle-notification-close">&times;</button>
          <div class="bundle-notification-title">${type === 'success' ? 'Success!' : type === 'error' ? 'Error' : 'Info'}</div>
          <div class="bundle-notification-message">${message}</div>
        </div>
      `);
      
      // Add to page
      $('body').append($notification);
      
      // Show notification
      setTimeout(() => {
        $notification.addClass('show');
      }, 100);
      
      // Auto-hide after 6 seconds
      setTimeout(() => {
        $notification.removeClass('show');
        setTimeout(() => {
          $notification.remove();
        }, 300);
      }, 6000);
      
      // Close button functionality
      $notification.on('click', '.bundle-notification-close', () => {
        $notification.removeClass('show');
        setTimeout(() => {
          $notification.remove();
        }, 300);
      });
    },


  };

  // Initialize when DOM is ready
  $(document).ready(function() {
    BundleSave.init();
  });

})(jQuery);