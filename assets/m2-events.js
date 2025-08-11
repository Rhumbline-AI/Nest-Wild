// ====== SCRIPT B: EVENT BINDINGS & INIT ======

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

  // Active state + selection update for mattress type
  $('.optionMattressType .option-item-inner').on('click', function () {
    $('.optionMattressType .option-item-inner').removeClass('active');
    $(this).addClass('active');

    selectedMattressType = $(this).attr('option-name-value');
    console.log('[Debug] Selected Mattress Type:', selectedMattressType);
    updateMattressDisplay(selectedMattressType);
  });

  // attach the add-to-cart handler from Script C
  $('.addCartCustom button').attr('type', 'button');
  $('form[action="/cart/add"]').off('submit').on('submit', function (e) {
    e.preventDefault();
  });
}

$(document).ready(function () {
  initializeState();
  setupEventListeners();
  initializeToggles();
  console.log('[Init] PDP logic initialized.');
});
