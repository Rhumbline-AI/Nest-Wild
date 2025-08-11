/**
 * Bundle & Save - Progressive Disclosure Logic
 * Handles show/hide animations, size matching, and state management
 */

(function($) {
  'use strict';
  
  // Bundle state management
  const BundleSave = {
    // Configuration
    config: {
      animationDuration: 300,
      notificationDuration: 2000,
      mattressSizeMapping: {
        'Twin': 'twin',
        'Twin XL': 'twin-xl', 
        'Full': 'full',
        'Queen': 'queen',
        'King': 'king',
        'California King': 'california-king'
      },
      pillowSizeMapping: {
        'Twin': 'standard',
        'Twin XL': 'standard',
        'Full': 'standard', 
        'Queen': 'standard',
        'King': 'king',
        'California King': 'king'
      },
      // Product variant mappings (will be populated dynamically)
      variantMappings: {
        pillow: {
          // DreamChill Quattro Pillow variants
          'standard': null, // Will be fetched dynamically
          'king': null
        },
        bedbase: {
          // Bed base variants by type and size
          adjustable: {}, // Will be populated: { twin: variantId, queen: variantId, etc. }
          platform: {},
          riser: {}
        }
      }
    },

    // State variables
    state: {
      pillowEnabled: false,
      bedbaseEnabled: false,
      currentMattressSize: null,
      selectedPillowSize: 'standard',
      selectedBedbaseType: null,
      selectedBedbaseSize: null
    },

    // DOM selectors
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
      bedbaseSizeDisplay: '#bedbase-size-display',
      bundleActions: '.bundle-actions',
      bundleTotal: '#bundle-total',
      bundleAddToCart: '#bundle-add-to-cart',
      quantityButtons: '.quantity-btn',
      successMessage: '.bundle-success-message',
      errorMessage: '.bundle-error-message',
      statusMessages: '.bundle-status-messages',
      // Main product form selectors
      mainProductForm: 'form[action*="/cart/add"]',
      variantRadios: 'input[name*="option"], input[type="radio"][name*="variant"]',
      variantSelects: 'select[name*="option"]'
    },

    // Initialize the bundle functionality
    init: function() {
      console.log('Initializing Bundle Save functionality...');
      
      // Check if container exists
      if ($(this.selectors.container).length === 0) {
        console.warn('Bundle Save container not found');
        return;
      }
      
      this.bindEvents();
      this.detectCurrentMattressSize();
      this.initializeState();
      
      console.log('Bundle Save initialized successfully');
    },

    // Bind all event handlers
    bindEvents: function() {
      const $container = $(this.selectors.container);
      
      if (!$container.length) {
        console.warn('Bundle Save container not found');
        return;
      }

      // Pillow checkbox toggle
      $container.on('change', this.selectors.pillowCheckbox, (e) => {
        this.togglePillowSection(e.target.checked);
      });

      // Bed base checkbox toggle  
      $container.on('change', this.selectors.bedbaseCheckbox, (e) => {
        this.toggleBedbaseSection(e.target.checked);
      });

      // Pillow size change
      $container.on('change', this.selectors.pillowSizeRadios, (e) => {
        this.state.selectedPillowSize = e.target.value;
        this.updateBundleTotal();
      });

      // Bed base type change
      $container.on('change', this.selectors.bedbaseTypeRadios, (e) => {
        this.handleBedbaseTypeChange(e.target);
        this.updateBedbaseDisplay(e.target);
      });

      // Quantity controls
      $container.on('click', this.selectors.quantityButtons, (e) => {
        this.handleQuantityChange(e.target);
      });

      // Bundle add to cart button
      $container.on('click', this.selectors.bundleAddToCart, (e) => {
        e.preventDefault();
        this.handleBundleAddToCart();
      });

      // Listen for mattress size changes from main product form
      $(document).on('change', this.selectors.variantRadios, () => {
        setTimeout(() => this.handleMattressSizeChange(), 100);
      });
      
      $(document).on('change', this.selectors.variantSelects, () => {
        setTimeout(() => this.handleMattressSizeChange(), 100);
      });

      // Intercept main product form submission to add bundled items
      $(document).on('submit', this.selectors.mainProductForm, (e) => {
        this.handleMainProductFormSubmission(e);
      });
    },

    // Initialize component state
    initializeState: function() {
      // Hide all detail sections initially
      $(this.selectors.pillowDetails).hide();
      $(this.selectors.bedbaseDetails).hide();
      $(this.selectors.bundleActions).hide();
      
      // Reset checkboxes
      $(this.selectors.pillowCheckbox).prop('checked', false);
      $(this.selectors.bedbaseCheckbox).prop('checked', false);
      
      // Set default pillow size
      $(`${this.selectors.pillowSizeRadios}[value="standard"]`).prop('checked', true);
    },

    // Toggle pillow section visibility
    togglePillowSection: function(enabled) {
      this.state.pillowEnabled = enabled;
      const $details = $(this.selectors.pillowDetails);
      
      if (enabled) {
        // Auto-select pillow size based on mattress size
        this.autoSelectPillowSize();
        
        $details.show();
        this.updateBundleVisibility();
      } else {
        $details.hide();
        this.resetPillowOptions();
        this.updateBundleVisibility();
      }
    },

    // Toggle bed base section visibility
    toggleBedbaseSection: function(enabled) {
      this.state.bedbaseEnabled = enabled;
      const $details = $(this.selectors.bedbaseDetails);
      
      if (enabled) {
        // Auto-match bed base size to mattress
        this.syncBedbaseSize();
        
        $details.show();
        this.updateBundleVisibility();
      } else {
        $details.hide();
        this.resetBedbaseOptions();
        this.updateBundleVisibility();
      }
    },

    // Auto-select pillow size based on mattress size
    autoSelectPillowSize: function() {
      if (!this.state.currentMattressSize) return;
      
      const pillowSize = this.config.pillowSizeMapping[this.state.currentMattressSize] || 'standard';
      
      $(`${this.selectors.pillowSizeRadios}[value="${pillowSize}"]`).prop('checked', true);
      this.state.selectedPillowSize = pillowSize;
      
      console.log(`Auto-selected pillow size: ${pillowSize} for mattress: ${this.state.currentMattressSize}`);
    },

    // Handle bed base type change (radio button selection)
    handleBedbaseTypeChange: function(target) {
      const $target = $(target);
      const bedbaseType = $target.val();
      const productId = $target.data('product-id');
      
      this.state.selectedBedbaseType = bedbaseType;
      
      // Update bed base image and info
      this.updateBedbaseDisplay(bedbaseType, productId);
      
      // Sync size with current mattress
      this.syncBedbaseSize();
      
      this.updateBundleTotal();
      
      console.log(`Selected bed base type: ${bedbaseType} (Product ID: ${productId})`);
    },

    // Update bed base image and product info
    updateBedbaseDisplay: function(bedbaseType, productId) {
      const bedbaseData = {
        'adjustable': {
          title: 'Nest & Wild Adjustable Base',
          image: '', // Will be populated with actual image URLs
          price: '$899.00' // Will be dynamically fetched
        },
        'platform': {
          title: 'Nest & Wild Wooden Platform',
          image: '',
          price: '$399.00'
        },
        'riser': {
          title: 'Nest & Wild HD Riser Frame', 
          image: '',
          price: '$199.00'
        }
      };
      
      const data = bedbaseData[bedbaseType];
      if (!data) return;
      
      // Update display with smooth transition
      const $image = $(this.selectors.bedbaseImage);
      const $title = $(this.selectors.bedbaseTitle);
      const $price = $(this.selectors.bedbasePrice);
      
      $image.fadeOut(200, function() {
        if (data.image) {
          $(this).attr('src', data.image).fadeIn(200);
        }
      });
      
      $title.fadeOut(200, function() {
        $(this).text(data.title).fadeIn(200);
      });
      
      $price.fadeOut(200, function() {
        $(this).text(data.price).fadeIn(200);
      });
    },

    // Sync bed base size with current mattress size
    syncBedbaseSize: function() {
      if (!this.state.currentMattressSize) return;
      
      const bedbaseSize = this.config.mattressSizeMapping[this.state.currentMattressSize];
      this.state.selectedBedbaseSize = bedbaseSize;
      
      // Update size display
      $(this.selectors.bedbaseSizeDisplay).text(`${this.state.currentMattressSize} (matches mattress)`);
      
      console.log(`Synced bed base size: ${bedbaseSize} with mattress: ${this.state.currentMattressSize}`);
    },

    // Handle quantity button clicks
    handleQuantityChange: function(button) {
      const $button = $(button);
      const target = $button.data('target');
      const $input = $(`#${target}`);
      const currentVal = parseInt($input.val()) || 1;
      const isPlus = $button.hasClass('quantity-plus');
      const isMinus = $button.hasClass('quantity-minus');
      
      let newVal = currentVal;
      
      if (isPlus && currentVal < 10) {
        newVal = currentVal + 1;
      } else if (isMinus && currentVal > 1) {
        newVal = currentVal - 1;
      }
      
      $input.val(newVal);
      this.updateBundleTotal();
      
      // Add visual feedback
      $input.addClass('quantity-updated');
      setTimeout(() => $input.removeClass('quantity-updated'), 300);
    },

    // Detect current mattress size from main product form
    detectCurrentMattressSize: function() {
      // Try different methods to find the selected size
      let mattressSize = null;
      
      // Method 1: Look for checked radio buttons with size options
      $(this.selectors.variantRadios + ':checked').each(function() {
        const value = $(this).val();
        const label = $(this).next('label').text() || $(this).parent().text();
        
        // Check if this looks like a size option
        Object.keys(BundleSave.config.mattressSizeMapping).forEach(size => {
          if (value.includes(size) || label.includes(size)) {
            mattressSize = size;
          }
        });
      });
      
      // Method 2: Look for select dropdowns
      if (!mattressSize) {
        $(this.selectors.variantSelects).each(function() {
          const selectedValue = $(this).val();
          const selectedText = $(this).find('option:selected').text();
          
          Object.keys(BundleSave.config.mattressSizeMapping).forEach(size => {
            if (selectedValue.includes(size) || selectedText.includes(size)) {
              mattressSize = size;
            }
          });
        });
      }
      
      // Method 3: Default to first available size if none found
      if (!mattressSize) {
        mattressSize = 'Queen'; // Default fallback
      }
      
      this.state.currentMattressSize = mattressSize;
      console.log(`Detected mattress size: ${mattressSize}`);
      
      return mattressSize;
    },

    // Handle mattress size changes
    handleMattressSizeChange: function() {
      const previousSize = this.state.currentMattressSize;
      const newSize = this.detectCurrentMattressSize();
      
      if (previousSize !== newSize) {
        console.log(`Mattress size changed from ${previousSize} to ${newSize}`);
        
        // Update pillow size if pillow is enabled
        if (this.state.pillowEnabled) {
          this.autoSelectPillowSize();
        }
        
        // Update bed base size if bed base is enabled
        if (this.state.bedbaseEnabled) {
          this.syncBedbaseSize();
        }
        
        this.updateBundleTotal();
      }
    },

    // Reset pillow options to defaults
    resetPillowOptions: function() {
      $(this.selectors.pillowQuantity).val(1);
      $(`${this.selectors.pillowSizeRadios}[value="standard"]`).prop('checked', true);
      this.state.selectedPillowSize = 'standard';
    },

    // Reset bed base options to defaults
    resetBedbaseOptions: function() {
      $(this.selectors.bedbaseTypeRadios).prop('checked', false);
      $(this.selectors.bedbaseImage).attr('src', '');
      $(this.selectors.bedbaseTitle).text('Select a Bed Base');
      $(this.selectors.bedbasePrice).text('$XX.XX');
      $(this.selectors.bedbaseSizeDisplay).text('Will match mattress size');
      
      this.state.selectedBedbaseType = null;
      this.state.selectedBedbaseSize = null;
    },

    // Update bundle actions visibility
    updateBundleVisibility: function() {
      const shouldShow = this.state.pillowEnabled || this.state.bedbaseEnabled;
      const $actions = $(this.selectors.bundleActions);
      
      console.log('Bundle visibility update:', {
        shouldShow,
        pillowEnabled: this.state.pillowEnabled,
        bedbaseEnabled: this.state.bedbaseEnabled,
        actionsFound: $actions.length
      });
      
      if (shouldShow) {
        $actions.show();
        this.updateBundleTotal();
      } else {
        $actions.hide();
      }
    },

    // Update bed base display when selection changes
    updateBedbaseDisplay: function(selectedRadio) {
      const $radio = $(selectedRadio);
      const productTitle = $radio.data('product-title');
      const productPrice = $radio.data('product-price');
      const productImage = $radio.data('product-image');
      
      // Update display elements
      $(this.selectors.bedbaseTitle).text(productTitle || 'Select a Bed Base');
      $(this.selectors.bedbasePrice).text(productPrice || '$0.00');
      
      const $image = $(this.selectors.bedbaseImage);
      if (productImage) {
        $image.attr('src', productImage).show();
      } else {
        $image.hide();
      }
      
      console.log('Bed base display updated:', {
        title: productTitle,
        price: productPrice,
        image: productImage
      });
    },

    // Update bundle total price
    updateBundleTotal: function() {
      let total = 0;
      
      if (this.state.pillowEnabled) {
        const quantity = parseInt($(this.selectors.pillowQuantity).val()) || 1;
        // Get pillow price from the displayed price (remove $ and convert to number)
        const pillowPriceText = $(this.selectors.pillowPrice).text().replace(/[^0-9.]/g, '');
        const pillowPrice = parseFloat(pillowPriceText) || 0;
        total += pillowPrice * quantity;
      }
      
      if (this.state.bedbaseEnabled && this.state.selectedBedbaseType) {
        // Get selected bed base price from the displayed price
        const bedbasePriceText = $(this.selectors.bedbasePrice).text().replace(/[^0-9.]/g, '');
        const bedbasePrice = parseFloat(bedbasePriceText) || 0;
        total += bedbasePrice;
      }
      
      $(this.selectors.bundleTotal).text(`$${total.toFixed(2)}`);
      
      console.log(`Bundle total updated: $${total.toFixed(2)}`, {
        pillowEnabled: this.state.pillowEnabled,
        bedbaseEnabled: this.state.bedbaseEnabled,
        bedbaseType: this.state.selectedBedbaseType
      });
    },

    // Handle bundle add to cart button click
    handleBundleAddToCart: async function() {
      try {
        // Validate selections first
        const validation = this.validateBundleSelection();
        if (!validation.isValid) {
          this.showNotification(validation.errors[0], 'error');
          return;
        }

        this.showNotification('Adding to Bundle...', 'loading');
        
        const addedItems = [];
        
        // Add pillow if enabled
        if (this.state.pillowEnabled) {
          const pillowResult = await this.addPillowToCart();
          if (pillowResult.success) {
            addedItems.push('Pillow');
          }
        }
        
        // Add bed base if enabled
        if (this.state.bedbaseEnabled && this.state.selectedBedbaseType) {
          const bedbaseResult = await this.addBedbaseToCart();
          if (bedbaseResult.success) {
            addedItems.push('Bed Base');
          }
        }
        
        if (addedItems.length > 0) {
          const message = addedItems.length === 1 
            ? `${addedItems[0]} Added to Cart!`
            : `${addedItems.join(' & ')} Added to Cart!`;
          this.showNotification(message, 'success');
          await this.updateCartCount();
        } else {
          this.showNotification('Please select items to bundle', 'error');
        }
        
      } catch (error) {
        console.error('Bundle add to cart error:', error);
        this.showNotification('Error adding bundle to cart', 'error');
      }
    },

    // Add pillow to cart silently
    addPillowToCart: async function() {
      try {
        const quantity = parseInt($(this.selectors.pillowQuantity).val()) || 1;
        const size = this.state.selectedPillowSize;
        
        // Get pillow variant ID (placeholder for now)
        const variantId = this.getPillowVariantId(size);
        if (!variantId) {
          throw new Error(`No variant found for pillow size: ${size}`);
        }
        
        const response = await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            id: variantId, 
            quantity: quantity 
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Pillow added to cart:', data);
        
        return { success: true, data };
        
      } catch (error) {
        console.error('Error adding pillow to cart:', error);
        return { success: false, error };
      }
    },

    // Add bed base to cart silently
    addBedbaseToCart: async function() {
      try {
        const bedbaseType = this.state.selectedBedbaseType;
        const size = this.state.selectedBedbaseSize || this.config.mattressSizeMapping[this.state.currentMattressSize];
        
        // Get bed base variant ID
        const variantId = this.getBedbaseVariantId(bedbaseType, size);
        if (!variantId) {
          throw new Error(`No variant found for bed base: ${bedbaseType} ${size}`);
        }
        
        const response = await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            id: variantId, 
            quantity: 1 
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Bed base added to cart:', data);
        
        return { success: true, data };
        
      } catch (error) {
        console.error('Error adding bed base to cart:', error);
        return { success: false, error };
      }
    },

    // Get pillow variant ID for size
    getPillowVariantId: function(size) {
      // For now, using placeholder variant IDs
      // These would be fetched dynamically from product data
      const pillowVariants = {
        'standard': '43549412032688', // DreamChill Quattro Pillow - Standard
        'king': '43549412065456'       // DreamChill Quattro Pillow - King
      };
      
      return pillowVariants[size] || pillowVariants['standard'];
    },

    // Get bed base variant ID for type and size
    getBedbaseVariantId: function(type, size) {
      // Placeholder variant IDs - these would be fetched dynamically
      const bedbaseVariants = {
        'adjustable': {
          'twin': '43549412098224',
          'queen': '43549412130992',
          'king': '43549412163760'
        },
        'platform': {
          'twin': '43549412196528',
          'queen': '43549412229296',
          'king': '43549412262064'
        },
        'riser': {
          'twin': '43549412294832',
          'queen': '43549412327600',
          'king': '43549412360368'
        }
      };
      
      return bedbaseVariants[type] && bedbaseVariants[type][size] 
        ? bedbaseVariants[type][size] 
        : null;
    },

    // Show notification with spinner or status
    showNotification: function(message, type = 'info') {
      const $statusMessages = $(this.selectors.statusMessages);
      const $successMessage = $(this.selectors.successMessage);
      const $errorMessage = $(this.selectors.errorMessage);
      
      // Clear existing messages
      $successMessage.hide().empty();
      $errorMessage.hide().empty();
      
      let $messageEl, icon = '';
      
      switch (type) {
        case 'loading':
          icon = '<span class="bundle-spinner">⏳</span> ';
          $messageEl = $successMessage;
          break;
        case 'success':
          icon = '<span class="bundle-success-icon">✅</span> ';
          $messageEl = $successMessage;
          break;
        case 'error':
          icon = '<span class="bundle-error-icon">❌</span> ';
          $messageEl = $errorMessage;
          break;
        default:
          $messageEl = $successMessage;
      }
      
      $messageEl.html(icon + message).fadeIn(200);
      $statusMessages.fadeIn(200);
      
      // Auto-hide success messages
      if (type === 'success') {
        setTimeout(() => {
          $messageEl.fadeOut(300);
          setTimeout(() => {
            $statusMessages.fadeOut(200);
          }, 300);
        }, this.config.notificationDuration);
      }
      
      console.log(`Bundle notification: ${type} - ${message}`);
    },

    // Update cart count using theme's event system
    updateCartCount: async function() {
      try {
        // Fetch updated cart data
        const response = await fetch('/cart.js');
        const cart = await response.json();
        
        // Dispatch cart updated event (theme's standard pattern)
        document.documentElement.dispatchEvent(new CustomEvent("cart:updated", {
          bubbles: true,
          detail: { cart }
        }));
        
        console.log('Cart count updated:', cart.item_count);
        
      } catch (error) {
        console.error('Error updating cart count:', error);
      }
    },

    // Handle main product form submission to add bundled items
    handleMainProductFormSubmission: async function(e) {
      // Only intercept if we have bundled items
      if (!this.state.pillowEnabled && !this.state.bedbaseEnabled) {
        return; // Let normal form submission proceed
      }

      e.preventDefault();
      
      try {
        this.showNotification('Adding mattress and bundle items...', 'loading');
        
        // First add the main mattress product
        const formData = new FormData(e.target);
        const mattressResponse = await fetch('/cart/add.js', {
          method: 'POST',
          body: formData
        });

        if (!mattressResponse.ok) {
          throw new Error('Failed to add mattress to cart');
        }

        const mattressData = await mattressResponse.json();
        console.log('Mattress added to cart:', mattressData);

        // Then add bundled items silently
        const addedItems = ['Mattress'];
        
        if (this.state.pillowEnabled) {
          const pillowResult = await this.addPillowToCart();
          if (pillowResult.success) {
            addedItems.push('Pillow');
          }
        }
        
        if (this.state.bedbaseEnabled && this.state.selectedBedbaseType) {
          const bedbaseResult = await this.addBedbaseToCart();
          if (bedbaseResult.success) {
            addedItems.push('Bed Base');
          }
        }

        // Show success message
        const message = `${addedItems.join(', ')} added to cart!`;
        this.showNotification(message, 'success');
        
        // Update cart count and open drawer
        await this.updateCartCount();
        this.openCartDrawer();

      } catch (error) {
        console.error('Error adding items to cart:', error);
        this.showNotification('Error adding items to cart. Please try again.', 'error');
      }
    },

    // Open cart drawer (integrates with theme's cart system)
    openCartDrawer: function() {
      // Try multiple methods to open the cart drawer
      if (typeof window.openCartDrawer === 'function') {
        window.openCartDrawer();
      } else if (document.querySelector('[data-action="open-cart-drawer"]')) {
        document.querySelector('[data-action="open-cart-drawer"]').click();
      } else if (document.querySelector('.cart-drawer-toggle, .cart-toggle, [data-cart-toggle]')) {
        document.querySelector('.cart-drawer-toggle, .cart-toggle, [data-cart-toggle]').click();
      } else {
        // Dispatch custom event as fallback
        document.documentElement.dispatchEvent(new CustomEvent('cart:open', { bubbles: true }));
      }
    },

    // Enhanced error handling for out of stock and invalid selections
    validateBundleSelection: function() {
      const errors = [];

      if (this.state.pillowEnabled) {
        const quantity = parseInt($(this.selectors.pillowQuantity).val());
        if (!quantity || quantity < 1 || quantity > 10) {
          errors.push('Invalid pillow quantity (1-10 allowed)');
        }
        
        if (!this.state.selectedPillowSize) {
          errors.push('Please select a pillow size');
        }
      }

      if (this.state.bedbaseEnabled) {
        if (!this.state.selectedBedbaseType) {
          errors.push('Please select a bed base type');
        }
        
        if (!this.state.currentMattressSize) {
          errors.push('Unable to determine mattress size for bed base matching');
        }
      }

      return {
        isValid: errors.length === 0,
        errors: errors
      };
    },

    // Check variant availability
    checkVariantAvailability: async function(variantId) {
      try {
        const response = await fetch(`/products.json`);
        const data = await response.json();
        
        // This is a simplified check - in production you'd check specific product availability
        return { available: true, inventory: null };
      } catch (error) {
        console.warn('Could not check variant availability:', error);
        return { available: true, inventory: null }; // Assume available if check fails
      }
    },

    // Update bundle total price
    updateBundleTotal: function() {
      let total = 0;
      
      if (this.state.pillowEnabled) {
        const quantity = parseInt($(this.selectors.pillowQuantity).val()) || 1;
        const pillowPrice = 89.99; // This will come from product data
        total += pillowPrice * quantity;
      }
      
      if (this.state.bedbaseEnabled && this.state.selectedBedbaseType) {
        const bedbasePrices = {
          'adjustable': 899.00,
          'platform': 399.00,
          'riser': 199.00
        };
        total += bedbasePrices[this.state.selectedBedbaseType] || 0;
      }
      
      $(this.selectors.bundleTotal).text(`$${total.toFixed(2)}`);
      
      console.log(`Bundle total updated: $${total.toFixed(2)}`);
    }
  };

  // Add CSS for smooth animations and visual feedback
  const bundleCSS = `
    <style>
    .quantity-updated {
      background-color: #e8f5e8 !important;
      transition: background-color 0.3s ease;
    }
    
    .bundle-option-details {
      overflow: hidden;
    }
    
    .bundle-product-image img {
      transition: opacity 0.2s ease;
    }
    
    .bundle-product-title,
    .bundle-product-price {
      transition: opacity 0.2s ease;
    }
    
    .bundle-spinner {
      display: inline-block;
      animation: bundleRotate 1s linear infinite;
    }
    
    @keyframes bundleRotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    .bundle-success-icon,
    .bundle-error-icon {
      font-weight: bold;
    }
    
    .bundle-success-message,
    .bundle-error-message {
      font-weight: 500;
    }
    </style>
  `;
  
  // Inject additional CSS
  $('head').append(bundleCSS);

  // Initialize when DOM is ready
  $(document).ready(function() {
    console.log('DOM ready, initializing Bundle Save...');
    console.log('jQuery available:', typeof $);
    console.log('Container exists:', $('#bundle-save-bundler2').length);
    BundleSave.init();
  });

  // Expose to global scope for debugging
  window.BundleSave = BundleSave;

})(jQuery);
