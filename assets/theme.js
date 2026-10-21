/**
 * KAVRA Shopify Theme — Client-side Interactions
 * Vanilla JavaScript for navigation, drawers, variant selection, and cart handling
 */

document.addEventListener('DOMContentLoaded', () => {
  /* -------------------------------------------------------------------------
   * Mobile Menu Drawer
   * ----------------------------------------------------------------------- */
  const mobileToggle = document.querySelector('[data-mobile-menu-toggle]');
  const mobileDrawer = document.getElementById('MobileDrawer');
  const mobileBackdrop = document.querySelector('[data-drawer-backdrop]');
  const mobileClose = document.querySelector('[data-mobile-menu-close]');

  function openMobileDrawer() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.add('is-open');
    if (mobileBackdrop) mobileBackdrop.classList.add('is-open');
    if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileDrawer() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.remove('is-open');
    if (mobileBackdrop) mobileBackdrop.classList.remove('is-open');
    if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (mobileToggle) mobileToggle.addEventListener('click', openMobileDrawer);
  if (mobileClose) mobileClose.addEventListener('click', closeMobileDrawer);
  if (mobileBackdrop) mobileBackdrop.addEventListener('click', closeMobileDrawer);

  /* -------------------------------------------------------------------------
   * Filter Drawer (Collection Page)
   * ----------------------------------------------------------------------- */
  const filterToggle = document.querySelector('[data-filter-toggle]');
  const filterDrawer = document.getElementById('FilterDrawer');
  const filterBackdrop = document.querySelector('[data-filter-backdrop]');
  const filterClose = document.querySelector('[data-filter-close]');

  function openFilterDrawer() {
    if (!filterDrawer) return;
    filterDrawer.classList.add('is-open');
    if (filterBackdrop) filterBackdrop.classList.add('is-open');
    if (filterToggle) filterToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeFilterDrawer() {
    if (!filterDrawer) return;
    filterDrawer.classList.remove('is-open');
    if (filterBackdrop) filterBackdrop.classList.remove('is-open');
    if (filterToggle) filterToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (filterToggle) filterToggle.addEventListener('click', openFilterDrawer);
  if (filterClose) filterClose.addEventListener('click', closeFilterDrawer);
  if (filterBackdrop) filterBackdrop.addEventListener('click', closeFilterDrawer);

  // Global Escape key listener to close active drawers
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileDrawer();
      closeFilterDrawer();
    }
  });

  /* -------------------------------------------------------------------------
   * Wishlist Heart Toggle (Local state demonstration)
   * ----------------------------------------------------------------------- */
  const wishlistButtons = document.querySelectorAll('[data-wishlist-btn]');
  wishlistButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isActive = btn.classList.toggle('is-active');
      const productId = btn.getAttribute('data-product-id');

      try {
        let wishlist = JSON.parse(localStorage.getItem('kavra_wishlist') || '[]');
        if (isActive) {
          if (!wishlist.includes(productId)) wishlist.push(productId);
        } else {
          wishlist = wishlist.filter((id) => id !== productId);
        }
        localStorage.setItem('kavra_wishlist', JSON.stringify(wishlist));
      } catch (err) {
        // localStorage gracefully handled
      }
    });
  });

  // Restore saved wishlist state
  try {
    const savedWishlist = JSON.parse(localStorage.getItem('kavra_wishlist') || '[]');
    savedWishlist.forEach((id) => {
      const btn = document.querySelector(`[data-wishlist-btn][data-product-id="${id}"]`);
      if (btn) btn.classList.add('is-active');
    });
  } catch (err) {}

  /* -------------------------------------------------------------------------
   * Product Detail: Quantity Selector
   * ----------------------------------------------------------------------- */
  const quantityInput = document.getElementById('Quantity');
  const quantityMinus = document.querySelector('[data-quantity-minus]');
  const quantityPlus = document.querySelector('[data-quantity-plus]');

  if (quantityInput && quantityMinus && quantityPlus) {
    quantityMinus.addEventListener('click', () => {
      const currentVal = parseInt(quantityInput.value, 10) || 1;
      if (currentVal > 1) {
        quantityInput.value = currentVal - 1;
      }
    });

    quantityPlus.addEventListener('click', () => {
      const currentVal = parseInt(quantityInput.value, 10) || 1;
      quantityInput.value = currentVal + 1;
    });
  }

  /* -------------------------------------------------------------------------
   * Product Detail: Variant Options Radio Binding
   * ----------------------------------------------------------------------- */
  const variantRadios = document.querySelectorAll('.size-option-input');
  variantRadios.forEach((radio) => {
    radio.addEventListener('change', () => {
      const group = radio.closest('.variant-selector-group');
      if (group) {
        const displayLabel = group.querySelector('[data-selected-option-value]');
        if (displayLabel) {
          displayLabel.textContent = radio.value;
        }
      }
    });
  });

  /* -------------------------------------------------------------------------
   * Native Shopify Add to Cart Form Handling
   * ----------------------------------------------------------------------- */
  const productForm = document.getElementById('ProductForm');
  if (productForm) {
    productForm.addEventListener('submit', (e) => {
      const submitBtn = productForm.querySelector('#AddToCartBtn');
      const submitText = productForm.querySelector('#AddToCartText');

      if (submitBtn && submitText) {
        submitBtn.setAttribute('aria-busy', 'true');
        const originalText = submitText.textContent;
        submitText.textContent = submitBtn.dataset.addingText;

        // Graceful timeout to restore button text if submitted via standard POST
        setTimeout(() => {
          submitBtn.removeAttribute('aria-busy');
          submitText.textContent = originalText;
        }, 1500);
      }
    });
  }

  /* -------------------------------------------------------------------------
   * Split Gateway & Audience Switcher Preference Memory
   * ----------------------------------------------------------------------- */
  function setGenderPreference(gender) {
    if (!gender) return;
    const cleanGender = gender.toLowerCase().trim();
    // 1-year persistent cookie with SameSite=Lax
    document.cookie = `kavra_gender_preference=${encodeURIComponent(cleanGender)}; path=/; max-age=31536000; SameSite=Lax`;
  }

  const splitGatePanels = document.querySelectorAll('[data-gender-split]');
  splitGatePanels.forEach((panel) => {
    panel.addEventListener('click', () => {
      const gender = panel.getAttribute('data-gender');
      setGenderPreference(gender);
    });
  });

  const genderSwitchLinks = document.querySelectorAll('[data-gender-switch]');
  genderSwitchLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const gender = link.getAttribute('data-gender-switch');
      setGenderPreference(gender);
    });
  });
});
