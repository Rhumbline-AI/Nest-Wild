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

    handleQuantityChange: function($button) {
      const target = $button.data('target');
      const $input = $(`#${target}`);
      const currentVal = parseInt($input.val()) || 1;
      
      if ($button.hasClass('quantity-plus') && currentVal < 10) {
        $input.val(currentVal + 1);
      } else if ($button.hasClass('quantity-minus') && currentVal > 1) {
        $input.val(currentVal - 1);
      }
    }
  };

  // Initialize when DOM is ready
  $(document).ready(function() {
    BundleSave.init();
  });

})(jQuery);