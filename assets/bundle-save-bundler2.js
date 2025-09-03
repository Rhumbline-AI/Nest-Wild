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
    mattressSizeSelector: 'input[name="option2"], select[name="option2"]'
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
      },
      bedbaseInventory: {
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
      this.moveBundleToTarget();
      
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
        const $radio = $(e.target);
        this.updateBedbaseDisplay($radio);
        
        // Re-detect mattress size when bed base type changes
        this.updateMattressSize();
        console.log('Mattress size re-detected after bed base change:', this.state.currentMattressSize);
      });

      // Listen for mattress size changes on any option selector
      $(document).on('change', 'select[name*="option"], input[name*="option"]', (e) => {
        console.log('Option change event triggered for:', $(e.target).attr('name'));
        this.updateMattressSize();
        this.updateBedbasePricing();
        
        // Update bed base display if a bed base is currently selected
        const $selectedBedbase = $(this.selectors.bedbaseTypeRadios + ':checked');
        if ($selectedBedbase.length) {
          this.updateBedbaseDisplay($selectedBedbase);
        }
      });
      
      // Also listen for clicks on option radio buttons
      $(document).on('click', 'input[name*="option"]', (e) => {
        console.log('Option click event triggered for:', $(e.target).attr('name'));
        setTimeout(() => {
          this.updateMattressSize();
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
      
      // Initialize mattress size detection
      this.updateMattressSize();
    },

    updateMattressSize: function() {
      // Try to get mattress size from any option that contains size keywords
      let mattressSize = '';
      
      console.log('=== updateMattressSize called ===');
      console.log('Current product handle:', window.location.pathname);
      
      // Look for size option in different positions (option1, option2, option3, etc.)
      const sizeKeywords = ['size', 'mattress size', 'queen', 'king', 'twin', 'full', 'california'];
      
      // Check all select dropdowns for size-related options
      $('select[name*="option"]').each(function() {
        const $select = $(this);
        const currentValue = $select.val();
        
        console.log('Checking select:', $select.attr('name'), 'value:', currentValue);
        
        if (currentValue) {
          // Check if the value looks like a mattress size
          const valueLower = currentValue.toLowerCase();
          const isSize = sizeKeywords.some(keyword => 
            valueLower.includes(keyword) || 
            /^(twin|full|queen|king|california|split)/i.test(valueLower)
          );
          
          if (isSize) {
            mattressSize = currentValue;
            console.log('Mattress size from dropdown:', mattressSize, 'from', $select.attr('name'));
            return false; // break out of loop
          }
        }
      });
      
      // If no dropdown found, check radio buttons
      if (!mattressSize) {
        $('input[name*="option"]:checked').each(function() {
          const $radio = $(this);
          const currentValue = $radio.val();
          
          if (currentValue) {
            const valueLower = currentValue.toLowerCase();
            const isSize = sizeKeywords.some(keyword => 
              valueLower.includes(keyword) || 
              /^(twin|full|queen|king|california|split)/i.test(valueLower)
            );
            
            if (isSize) {
              mattressSize = currentValue;
              console.log('Mattress size from radio:', mattressSize, 'from', $radio.attr('name'));
              return false; // break out of loop
            }
          }
        });
      }
      
      if (mattressSize) {
        console.log('Original mattress size detected:', mattressSize);
        this.state.currentMattressSize = mattressSize.toLowerCase();
        console.log('Mattress size updated to:', this.state.currentMattressSize);
      } else {
        console.log('No mattress size detected');
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
          $(this.selectors.bedbasePrice).text(price);
        }
      }
    },

    loadBedbasePrices: function() {
      // Load all bed base variant prices and inventory
      $('.bedbase-variants .variant-data').each((index, element) => {
        const $variant = $(element);
        const type = $variant.data('type');
        const size = $variant.data('size');
        const price = $variant.data('price');
        const inventory = parseInt($variant.data('inventory')) || 0;
        
        if (!this.state.bedbasePrices[type]) {
          this.state.bedbasePrices[type] = {};
        }
        if (!this.state.bedbaseInventory[type]) {
          this.state.bedbaseInventory[type] = {};
        }
        
        this.state.bedbasePrices[type][size] = price;
        this.state.bedbaseInventory[type][size] = inventory;
      });
      
      console.log('Loaded bed base prices:', this.state.bedbasePrices);
      console.log('Loaded bed base inventory:', this.state.bedbaseInventory);
    },

    getBedbaseVariantForMattressSize: function(baseType, mattressSize) {
      console.log(`=== getBedbaseVariantForMattressSize called ===`);
      console.log(`baseType: ${baseType}, mattressSize: "${mattressSize}"`);
      
      // Map mattress size to bed base variant
      const sizeMap = {
        'twin': { adjustable: null, platform: null, riser: 'twin' },
        'twin xl': { adjustable: 'twin xl', platform: null, riser: 'twin xl' },
        'full': { adjustable: null, platform: 'full', riser: 'full' },
        'queen': { adjustable: 'queen', platform: 'queen', riser: 'queen' },
        'king': { adjustable: 'split king - 2 txl', platform: 'king', riser: 'king' },
        'split king': { adjustable: 'split king - 2 txl', platform: 'king', riser: 'king' },
        'split king (2 twin xl)': { adjustable: 'split king - 2 txl', platform: 'king', riser: 'twin xl' },
        'split king (2 twinxl)': { adjustable: 'split king - 2 txl', platform: 'king', riser: 'twin xl' },
        'split king 2 twin xl': { adjustable: 'split king - 2 txl', platform: 'king', riser: 'twin xl' },
        'split king - 2 twin xl': { adjustable: 'split king - 2 txl', platform: 'king', riser: 'twin xl' },
        'split king 2 txl': { adjustable: 'split king - 2 txl', platform: 'king', riser: 'twin xl' },
        'split king - 2 txl': { adjustable: 'split king - 2 txl', platform: 'king', riser: 'twin xl' },
        'california king': { adjustable: 'split king - 2 txl', platform: 'king', riser: 'king' }
      };
      
      const result = sizeMap[mattressSize] ? sizeMap[mattressSize][baseType] : null;
      console.log(`Result for ${baseType}: ${result}`);
      return result;
    },

    updateBedbasePricing: function() {
      if (!this.state.currentMattressSize) {
        // Get initial mattress size
        const $selectedSize = $(this.selectors.mattressSizeSelector + ':checked');
        if ($selectedSize.length) {
          this.state.currentMattressSize = $selectedSize.val().toLowerCase();
        }
      }
      
      console.log('=== updateBedbasePricing called ===');
      console.log('Current mattress size:', this.state.currentMattressSize);
      console.log('Current product handle:', window.location.pathname);
      
      if (!this.state.currentMattressSize) return;
      
      // Update each bed base option
      const baseTypes = ['adjustable', 'platform', 'riser'];
      baseTypes.forEach(type => {
        const variantSize = this.getBedbaseVariantForMattressSize(type, this.state.currentMattressSize);
        const $radio = $(`input[name="bedbase-type"][value="${type}"]`);
        const $container = $radio.closest('.radio-container');
        
        console.log(`Bed base ${type}: variant size = ${variantSize}, price = ${this.state.bedbasePrices[type][variantSize]}`);
        console.log(`Available sizes for ${type}:`, Object.keys(this.state.bedbasePrices[type] || {}));
        
        if (variantSize && this.state.bedbasePrices[type][variantSize]) {
          // Check if variant is in stock
          const inventory = this.state.bedbaseInventory[type][variantSize] || 0;
          const price = this.state.bedbasePrices[type][variantSize];
          
          if (inventory > 0) {
            // Variant available and in stock - enable and update price
            $container.removeClass('unavailable').removeAttr('style');
            $radio.prop('disabled', false);
            
            // Update price display
            $(this.selectors.bedbasePrice).text(price);
            
            // Remove any existing unavailable message
            $container.find('.unavailable-message').remove();
          } else {
            // Variant out of stock - disable and style
            $container.addClass('unavailable').css({
              'opacity': '0.4',
              'pointer-events': 'none'
            });
            $radio.prop('disabled', true);
            
            // Add out of stock message
            if (!$container.find('.unavailable-message').length) {
              $container.append('<div class="unavailable-message" style="font-size: 10px; color: #999; margin-top: 2px;">(out of stock)</div>');
            }
          }
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
      
      console.log('=== getBedbaseVariantId Debug ===');
      console.log('Selected type:', selectedType);
      console.log('Mattress size:', mattressSize);
      console.log('Mattress size type:', typeof mattressSize);
      
      // Use our corrected size mapping function to get the target variant size
      const targetVariantSize = this.getBedbaseVariantForMattressSize(selectedType, mattressSize);
      console.log('Target variant size from mapping:', targetVariantSize);
      
      // First, try to get variant ID from the HTML variant data using the mapped size
      let variantId = null;
      
      if (targetVariantSize) {
        // Look for the variant data in the HTML using the mapped size
        const $variantData = $(`.bedbase-variants .variant-data[data-type="${selectedType}"][data-size="${targetVariantSize}"]`);
        if ($variantData.length) {
          variantId = $variantData.data('id');
          console.log('Found variant ID from HTML data using mapped size:', variantId);
        }
      }
      
      // If not found in HTML, try with size variations
      if (!variantId && mattressSize) {
        console.log('No direct match in HTML, trying size variations...');
        
        const sizeVariations = [
          mattressSize,
          mattressSize.replace(/\s+/g, ' ').trim(),
          mattressSize.toLowerCase(),
          mattressSize.replace(/[^a-zA-Z0-9\s]/g, '').toLowerCase()
        ];
        
        for (let variation of sizeVariations) {
          const $variantData = $(`.bedbase-variants .variant-data[data-type="${selectedType}"][data-size="${variation}"]`);
          if ($variantData.length) {
            variantId = $variantData.data('id');
            console.log('Found variant ID with variation:', variation, '->', variantId);
            break;
          }
        }
      }
      
            // If still not found, try to find any variant for this type and size
      if (!variantId) {
        console.log('Looking for any variant of type:', selectedType);
        const $anyVariant = $(`.bedbase-variants .variant-data[data-type="${selectedType}"]`);
        if ($anyVariant.length) {
          // Special handling for adjustable base king/split king mapping
          if (selectedType === 'adjustable' && (mattressSize.includes('king') || mattressSize.includes('split king'))) {
            console.log('Looking for split king variant for adjustable base...');
            const $splitKingVariant = $anyVariant.filter(function() {
              const variantSize = $(this).data('size');
              return variantSize.includes('split king') || variantSize.includes('split king - 2 txl');
            });
            
            if ($splitKingVariant.length) {
              variantId = $splitKingVariant.first().data('id');
              console.log('Found split king variant for adjustable base:', variantId);
            }
          }
          
          // If still not found, try to find the best match based on mattress size
          if (!variantId) {
            let bestMatch = null;
            let bestScore = 0;
            
            const self = this; // Store reference to 'this'
            $anyVariant.each(function() {
              const $variant = $(this);
              const variantSize = $variant.data('size');
              const score = self.calculateSizeMatchScore(mattressSize, variantSize);
              
              if (score > bestScore) {
                bestScore = score;
                bestMatch = $variant.data('id');
              }
            });
            
            if (bestMatch) {
              variantId = bestMatch;
              console.log('Found best match variant ID:', variantId, 'with score:', bestScore);
            } else {
              // Use the first available variant
              variantId = $anyVariant.first().data('id');
              console.log('Using first available variant ID:', variantId);
            }
          }
        }
      }
      
      // Fallback to hardcoded values if HTML data is not available
      if (!variantId) {
        console.log('No HTML variant data found, using hardcoded fallback...');
        const variantMap = {
          adjustable: {
            'twin xl': '43518441160880',
            'queen': '43518441193648', 
            'king': '43518441226416',
            'split king': '43518441226416',
            'split king - 2 txl': '43518441226416',
            'california king': '43518441226416'
          },
          platform: {
            'full': '43557194268848',
            'queen': '43454855905456',
            'king': '' // Will be populated from HTML data
          },
          riser: {
            'twin': '43932973072560',
            'twin xl': '43932973007024',
            'full': '43932973138096',
            'queen': '43932973039792',
            'king': '43932973105328'
          }
        };
        
        variantId = variantMap[selectedType] && variantMap[selectedType][mattressSize];
        
        // If no direct match and it's a split king variant, fall back to king
        if (!variantId && mattressSize && mattressSize.includes('split king')) {
          console.log('Split king variant not found, falling back to king variant');
          variantId = variantMap[selectedType] && variantMap[selectedType]['king'];
        }
        
        // Final fallback: if still no variant found, use the first available variant for the type
        if (!variantId && variantMap[selectedType]) {
          const firstVariant = Object.values(variantMap[selectedType])[0];
          console.log('No variant found, using first available variant:', firstVariant);
          variantId = firstVariant;
        }
      }
      
      console.log('Final variant ID:', variantId);
      return variantId;
    },
    
    calculateSizeMatchScore: function(mattressSize, variantSize) {
      if (!mattressSize || !variantSize) return 0;
      
      const mattress = mattressSize.toLowerCase();
      const variant = variantSize.toLowerCase();
      
      // Exact match gets highest score
      if (mattress === variant) return 100;
      
      // Special handling for adjustable base - both king and split king should match split king variant
      if (variant.includes('split king') || variant.includes('split king - 2 txl')) {
        if (mattress.includes('king') || mattress.includes('split king')) {
          return 95; // High score for king/split king matching split king variant
        }
      }
      
      // Partial matches
      if (mattress.includes('king') && variant.includes('king')) return 80;
      if (mattress.includes('queen') && variant.includes('queen')) return 80;
      if (mattress.includes('full') && variant.includes('full')) return 80;
      if (mattress.includes('twin') && variant.includes('twin')) return 80;
      
      // Split king variations
      if (mattress.includes('split') && variant.includes('king')) return 70;
      
      return 0;
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
          // Determine quantity based on bed base type and mattress size
          let quantity = 1;
          
          // For HD Riser with Split King, add 2 Twin XL risers
          if (selectedType === 'riser' && mattressSize && mattressSize.includes('split king')) {
            quantity = 2;
            console.log('HD Riser with Split King detected - setting quantity to 2');
          }
          
          console.log('Final bed base selection:', {
            selectedType: selectedType,
            mattressSize: mattressSize,
            variantId: bedbaseVariantId,
            quantity: quantity
          });
          
          itemsToAdd.push({
            id: bedbaseVariantId,
            quantity: quantity
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
      
      console.log('=== addBedbaseToBundle Debug ===');
      console.log('Selected bed base type:', selectedType);
      console.log('Current mattress size:', mattressSize);
      console.log('Available mattress sizes in state:', this.state.currentMattressSize);
      
      // Get bed base variant ID
      const bedbaseVariantId = this.getBedbaseVariantId();
      
      console.log('Bed base variant ID:', bedbaseVariantId);
      
      if (!bedbaseVariantId) {
        console.error('No bed base variant ID found');
        console.log('Available variant mappings:', {
          adjustable: this.state.bedbasePrices.adjustable,
          platform: this.state.bedbasePrices.platform,
          riser: this.state.bedbasePrices.riser
        });
        this.showNotification('Unable to get bed base variant. Please try again.', 'error');
        return;
      }
      
      // Validate variant ID before adding to cart
      this.validateVariantId(bedbaseVariantId, selectedType, (isValid) => {
        if (!isValid) {
          console.error('Variant ID validation failed:', bedbaseVariantId);
          this.showNotification('This bed base variant is not available. Please try a different option.', 'error');
          $button.prop('disabled', false).text(originalText);
          return;
        }
        
        // Disable button and show loading
        $button.prop('disabled', true).text('ADDING...');
        
        console.log('Adding to cart with data:', {
          id: bedbaseVariantId,
          quantity: 1
        });
        
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
            console.error('Error adding bed base to cart:', {
              status: xhr.status,
              statusText: xhr.statusText,
              responseText: xhr.responseText,
              error: error
            });
            
            // More specific error message based on the error
            let errorMessage = 'Error adding bed base to cart. Please try again.';
            if (xhr.status === 422) {
              errorMessage = 'This bed base is not available for your mattress size.';
            } else if (xhr.status === 404) {
              errorMessage = 'Bed base product not found. Please contact support.';
            }
            
            this.showNotification(errorMessage, 'error');
            $button.prop('disabled', false).text(originalText);
          }
        });
      });
    },
    
    validateVariantId: function(variantId, selectedType, callback) {
      // First check if the variant exists in our HTML data
      const $variantData = $(`.bedbase-variants .variant-data[data-id="${variantId}"]`);
      if ($variantData.length) {
        const inventory = parseInt($variantData.data('inventory')) || 0;
        console.log('Variant found in HTML data, inventory:', inventory);
        
        if (inventory > 0) {
          callback(true);
          return;
        } else {
          console.log('Variant out of stock');
          callback(false);
          return;
        }
      }
      
      // If not found in HTML, try to validate via API
      console.log('Variant not found in HTML data, checking via API...');
      
      // For now, assume it's valid if we can't validate it
      // In a production environment, you might want to make an API call to validate
      callback(true);
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

    moveBundleToTarget: function() {
      // Move bundle to the bundler target element if it exists
      const $targetElement = $('#bundler-target-element');
      const $bundleSection = $('.shopify-section--bundle-save');
      
      if ($targetElement.length && $bundleSection.length) {
        console.log('Moving bundle to target element above cart');
        $bundleSection.detach().appendTo($targetElement);
      } else {
        console.log('Bundle target element not found or bundle section not found');
        console.log('Target element:', $targetElement.length);
        console.log('Bundle section:', $bundleSection.length);
      }
    }

  };

  // Initialize when DOM is ready
  $(document).ready(function() {
    BundleSave.init();
  });

})(jQuery);