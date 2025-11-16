const colors = [
  "#FF7F7F",
  "#FFBF7F",
  "#FFDF7F",
  "#FFFF7F",
  "#BFFF7F",
  "#7FFF7F",
  "#7FFFFF",
  "#7FBFFF",
  "#7F7FFF",
  "#FF7FFF",
  "#BF7FBF",
  "#CFCFCF",
];

const settingsModal = document.querySelector(".settings-modal");
const colorsContainer = settingsModal.querySelector(".colors");
const tiersContainer = document.querySelector(".tiers");
const cardsContainer = document.querySelector(".cards");

let activeTier;
let autoScrollInterval = null;

const resetTierImages = (tier) => {
  const images = tier.querySelectorAll(".items img");
  images.forEach((img) => {
    cardsContainer.appendChild(img);
  });
};

const handleDeleteTier = () => {
  if (activeTier) {
    resetTierImages(activeTier);
    activeTier.remove();
    settingsModal.close();
  }
};

const handleClearTier = () => {
  if (activeTier) {
    resetTierImages(activeTier);
    settingsModal.close();
  }
};

const handlePrependTier = () => {
  if (activeTier) {
    tiersContainer.insertBefore(createTier(), activeTier);
    settingsModal.close();
  }
};

const handleAppendTier = () => {
  if (activeTier) {
    tiersContainer.insertBefore(createTier(), activeTier.nextSibling);
    settingsModal.close();
  }
};

const handleSettingsClick = (tier) => {
  activeTier = tier;

  const label = tier.querySelector(".label");
  settingsModal.querySelector(".tier-label").value = label.innerText;

  const color = getComputedStyle(label).getPropertyValue("--color");
  settingsModal.querySelector(`input[value="${color}"]`).checked = true;

  settingsModal.showModal();
};

const handleMoveTier = (tier, direction) => {
  const sibling =
    direction === "up" ? tier.previousElementSibling : tier.nextElementSibling;

  if (sibling) {
    const position = direction === "up" ? "beforebegin" : "afterend";
    sibling.insertAdjacentElement(position, tier);
  }
};

const handleDragover = (event) => {
  event.preventDefault(); // allow drop

  const draggedImage = document.querySelector(".dragging");
  const target = event.target;
  const mode = sessionStorage.getItem('tierlistMode');

  if (target.classList.contains("items")) {
    // In buildchampion mode, only allow 1 item per tier
    if (mode === 'buildchampion' && target.children.length >= 1 && !target.contains(draggedImage)) {
      return;
    }
    target.appendChild(draggedImage);
  } else if (target.tagName === "IMG" && target !== draggedImage) {
    const itemsContainer = target.parentElement;
    if (mode === 'buildchampion' && itemsContainer && itemsContainer.classList.contains('items')) {
      cardsContainer.appendChild(target);
      itemsContainer.appendChild(draggedImage);
    } else {
      const { left, width } = target.getBoundingClientRect();
      const midPoint = left + width / 2;

      if (event.clientX < midPoint) {
        target.before(draggedImage);
      } else {
        target.after(draggedImage);
      }
    }
  }
};

const handleDrop = (event) => {
  event.preventDefault();
};

const createTier = (label = "Change me") => {
  const tierColor = colors[tiersContainer.children.length % colors.length];

  const tier = document.createElement("div");
  tier.className = "tier";
  tier.innerHTML = `
  <div class="controls">
    <button class="settings"><i class="bi bi-gear-fill"></i></button>
    <button class="moveup"><i class="bi bi-chevron-up"></i></button>
    <button class="movedown"><i class="bi bi-chevron-down"></i></button>
  </div>
  <div class="label" contenteditable="plaintext-only" style="--color: ${tierColor}">
    <span>${label}</span>
  </div>
  <div class="items"></div>`;

  tier
    .querySelector(".settings")
    .addEventListener("click", () => handleSettingsClick(tier));
  tier
    .querySelector(".moveup")
    .addEventListener("click", () => handleMoveTier(tier, "up"));
  tier
    .querySelector(".movedown")
    .addEventListener("click", () => handleMoveTier(tier, "down"));
  tier.querySelector(".items").addEventListener("dragover", handleDragover);
  tier.querySelector(".items").addEventListener("drop", handleDrop);

  return tier;
};

const initColorOptions = () => {
  colors.forEach((color) => {
    const label = document.createElement("label");
    label.style.setProperty("--color", color);
    label.innerHTML = `<input type="radio" name="color" value="${color}" />`;
    colorsContainer.appendChild(label);
  });
};

const initDefaultTierList = () => {
  const mode = sessionStorage.getItem('tierlistMode');
  if (mode === 'buildchampion') {
    ["Passive", "Q Ability", "W Ability", "E Ability", "R Ability"].forEach((label) => {
      tiersContainer.appendChild(createTier(label));
    });
  } else {
    ["S", "A", "B", "C", "D"].forEach((label) => {
      tiersContainer.appendChild(createTier(label));
    });
  }
};

const initDraggables = () => {
  const images = cardsContainer.querySelectorAll("img");
  images.forEach((img) => {
    img.draggable = true;

    img.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", "");
      img.classList.add("dragging");
      
      // Start auto-scroll interval when dragging starts (desktop only)
      if (window.innerWidth > 480) {
        autoScrollInterval = setInterval(() => {
          const draggedElement = document.querySelector('.dragging');
          if (!draggedElement) {
            clearInterval(autoScrollInterval);
            return;
          }
        }, 50);
      }
    });

    img.addEventListener("dragend", () => {
      img.classList.remove("dragging");
      // Clear auto-scroll interval when dragging ends
      if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
      }
    });

    img.addEventListener("dblclick", () => {
      if (img.parentElement !== cardsContainer) {
        cardsContainer.appendChild(img);
        cardsContainer.scrollLeft = cardsContainer.scrollWidth;
      }
    });
  });
};

const showImagePopup = (imgSrc, imgName, imageType) => {
  const existingPopup = document.querySelector('.image-popup');
  if (existingPopup) {
    existingPopup.remove();
  }

  // Determine size class based on image type
  let sizeClass = '';
  if (['item', 'icon', 'summoner'].includes(imageType)) {
    sizeClass = 'scale-2x';
  } else if (['splash', 'map'].includes(imageType)) {
    sizeClass = 'scale-2x-large';
  }

  const popup = document.createElement('div');
  popup.className = 'image-popup';
  popup.innerHTML = `
    <div class="image-popup-content">
      <img src="${imgSrc}" alt="${imgName}" class="${sizeClass}">
      <div class="image-popup-name">${imgName}</div>
    </div>
  `;

  document.body.appendChild(popup);

  setTimeout(() => {
    const closePopup = (e) => {
      if (!popup.querySelector('.image-popup-content').contains(e.target)) {
        popup.remove();
        document.removeEventListener('click', closePopup);
      }
    };
    document.addEventListener('click', closePopup);
  }, 0);
};

const loadImagesFromStorage = () => {
  const storedImages = sessionStorage.getItem('tierlistImages');
  if (storedImages) {
    const images = JSON.parse(storedImages);
    images.forEach((imgData) => {
      const img = document.createElement('img');
      img.src = imgData.url;
      img.alt = imgData.name;
      img.dataset.id = imgData.id;
      img.dataset.name = imgData.name;
      img.dataset.type = imgData.type || 'icon';
      img.draggable = true;

      img.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", "");
        img.classList.add("dragging");
      });

      img.addEventListener("dragend", () => img.classList.remove("dragging"));

      // Touch support for mobile
      let touchStartX, touchStartY, touchMoved = false;
      let longPressTimer;

      img.addEventListener("touchstart", (e) => {
        touchMoved = false;
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        
        // Long press to start drag
        longPressTimer = setTimeout(() => {
          img.classList.add("dragging");
          img.style.position = "fixed";
          img.style.zIndex = "10000";
          img.style.pointerEvents = "none";
        }, 200);
      });

      img.addEventListener("touchmove", (e) => {
        const touch = e.touches[0];
        const moveX = Math.abs(touch.clientX - touchStartX);
        const moveY = Math.abs(touch.clientY - touchStartY);
        
        if (moveX > 5 || moveY > 5) {
          touchMoved = true;
          clearTimeout(longPressTimer);
        }

        if (img.classList.contains("dragging")) {
          e.preventDefault();
          img.style.left = touch.clientX - (img.offsetWidth / 2) + "px";
          img.style.top = touch.clientY - (img.offsetHeight / 2) + "px";
        }
      });

      img.addEventListener("touchend", (e) => {
        clearTimeout(longPressTimer);
        
        if (img.classList.contains("dragging")) {
          const touch = e.changedTouches[0];
          const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
          
          img.style.position = "";
          img.style.zIndex = "";
          img.style.pointerEvents = "";
          img.classList.remove("dragging");

          let target = elementBelow;
          while (target && !target.classList.contains("items") && target !== document.body) {
            target = target.parentElement;
          }

          const mode = sessionStorage.getItem('tierlistMode');
          if (target && target.classList.contains("items")) {
            if (mode === 'buildchampion' && target.children.length >= 1 && !target.contains(img)) {
              if (target.children[0]) {
                cardsContainer.appendChild(target.children[0]);
              }
            }
            target.appendChild(img);
          }
        } else if (!touchMoved) {
          showImagePopup(img.src, imgData.name, imgData.type || 'icon');
        }
      });

      img.addEventListener("click", (e) => {
        e.stopPropagation();
        showImagePopup(img.src, imgData.name, imgData.type || 'icon');
      });

      img.addEventListener("dblclick", () => {
        if (img.parentElement !== cardsContainer) {
          cardsContainer.appendChild(img);
          cardsContainer.scrollLeft = cardsContainer.scrollWidth;
        }
      });

      cardsContainer.appendChild(img);
    });
  }
};

initDefaultTierList();
initColorOptions();
loadImagesFromStorage();
initDraggables();

document.querySelector("h1").addEventListener("click", () => {
  tiersContainer.appendChild(createTier());
});

settingsModal.addEventListener("click", (event) => {
  if (event.target === settingsModal) {
    settingsModal.close();
  } else {
    const action = event.target.id;
    const actionMap = {
      delete: handleDeleteTier,
      clear: handleClearTier,
      prepend: handlePrependTier,
      append: handleAppendTier,
    };

    if (action && actionMap[action]) {
      actionMap[action]();
    }
  }
});

settingsModal.addEventListener("close", () => (activeTier = null));

settingsModal
  .querySelector(".tier-label")
  .addEventListener("input", (event) => {
    if (activeTier) {
      activeTier.querySelector(".label span").textContent = event.target.value;
    }
  });

colorsContainer.addEventListener("change", (event) => {
  if (activeTier) {
    activeTier
      .querySelector(".label")
      .style.setProperty("--color", event.target.value);
  }
});

cardsContainer.addEventListener("dragover", (event) => {
  event.preventDefault();

  const draggedImage = document.querySelector(".dragging");
  if (draggedImage) {
    cardsContainer.appendChild(draggedImage);
  }
  
  if (window.innerWidth > 480) {
    const rect = cardsContainer.getBoundingClientRect();
    const scrollZone = 50; // pixels from edge to trigger scroll
    const scrollSpeed = 10;
    const mouseY = event.clientY - rect.top;
    
    if (mouseY < scrollZone && cardsContainer.scrollTop > 0) {
      cardsContainer.scrollTop -= scrollSpeed;
    } else if (mouseY > rect.height - scrollZone) {
      cardsContainer.scrollTop += scrollSpeed;
    }
  }
});

cardsContainer.addEventListener("drop", (event) => {
  event.preventDefault();
  cardsContainer.scrollLeft = cardsContainer.scrollWidth;
});

document.getElementById('downloadBtn').addEventListener('click', async () => {
  const downloadBtn = document.getElementById('downloadBtn');
  const originalText = downloadBtn.innerHTML;
  downloadBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Generating...';
  downloadBtn.disabled = true;

  try {
    const mode = sessionStorage.getItem('tierlistMode');
    const downloadContainer = document.createElement('div');
    downloadContainer.style.cssText = `
      position: absolute;
      left: -9999px;
      top: 0;
      background: var(--bg-gradient);
      padding: 1rem;
    `;

    if (mode === 'buildchampion') {
      const title = document.createElement('div');
      title.style.cssText = `
        text-align: center;
        color: var(--text-color);
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 1rem;
        padding: 1rem;
      `;
      title.textContent = 'I imagine my perfect champion like this:';
      downloadContainer.appendChild(title);
    }

    const tiersClone = tiersContainer.cloneNode(true);
    tiersClone.style.border = '2px solid var(--border-color)';

    tiersClone.querySelectorAll('.controls').forEach((el) => el.remove());
    downloadContainer.appendChild(tiersClone);

    const footer = document.createElement('div');
    footer.style.cssText = `
      margin-top: 1rem;
      text-align: center;
      color: var(--text-secondary);
      font-size: 0.75rem;
      padding: 1rem;
    `;
    footer.innerHTML = `Create your own on League tierlist on <span style="color: var(--primary-color);">timfernix.github.io/tierlist</span>`;
    downloadContainer.appendChild(footer);

    document.body.appendChild(downloadContainer);

    const canvas = await html2canvas(downloadContainer, {
      backgroundColor: '#0a1428',
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true
    });

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `tierlist-${Date.now()}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);

      document.body.removeChild(downloadContainer);
      downloadBtn.innerHTML = originalText;
      downloadBtn.disabled = false;
    });
  } catch (error) {
    console.error('Error generating image:', error);
    alert('Error generating image. Please try again.');
    downloadBtn.innerHTML = originalText;
    downloadBtn.disabled = false;
  }
});
