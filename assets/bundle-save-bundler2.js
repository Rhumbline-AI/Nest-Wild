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
      pillowData: '#pillow-product-data'
    },

    state: {
      pillowPrices: {
        standard: '',
        king: ''
      },
    },

    init: function() {
      if (!$(this.selectors.container).length) return;
      
      this.loadPillowPrices();
      this.bindEvents();
      this.initializeState();
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
      const price = $radio.data('product-price');
      const image = $radio.data('product-image');

      $(this.selectors.bedbaseTitle).text(title);
      $(this.selectors.bedbasePrice).text(price);
      $(this.selectors.bedbaseImage).attr('src', image);
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