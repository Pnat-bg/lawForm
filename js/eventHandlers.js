let draggedItem = null;

// === การลากแท็บโจทก์ ===
export function dragPlaintiffTab(event) {
  draggedItem = event.target.closest(".plaintiff-tab");
  event.dataTransfer.setData("text", draggedItem.dataset.index);
  console.log("Dragging plaintiff tab:", draggedItem.dataset.index);
}

export function allowDropPlaintiffTab(event) {
  event.preventDefault();
  console.log("Allowing drop on plaintiff tab");
}

export function dropPlaintiffTab(event) {
  event.preventDefault();
  
  const targetItem = event.target.closest(".plaintiff-tab");
  const container = document.getElementById("plaintiffTabsContainer");

  if (!targetItem || draggedItem === targetItem || !container.contains(targetItem)) {
    console.log("Drop cancelled: Invalid target or same item");
    return;
  }

  const items = Array.from(container.children);
  const draggedIndex = parseInt(draggedItem.dataset.index);
  const targetIndex = parseInt(targetItem.dataset.index);

  const [movedPlaintiff] = window.plaintiffData.splice(draggedIndex, 1);
  window.plaintiffData.splice(targetIndex, 0, movedPlaintiff);

  if (draggedIndex < targetIndex) {
    container.insertBefore(draggedItem, targetItem.nextSibling);
  } else {
    container.insertBefore(draggedItem, targetItem);
  }

  window.updatePlaintiffTabNames();

  if (window.currentPlaintiffIndex === draggedIndex) {
    window.currentPlaintiffIndex = targetIndex;
  } else if (draggedIndex < window.currentPlaintiffIndex && window.currentPlaintiffIndex <= targetIndex) {
    window.currentPlaintiffIndex--;
  } else if (draggedIndex > window.currentPlaintiffIndex && window.currentPlaintiffIndex >= targetIndex) {
    window.currentPlaintiffIndex++;
  }

  window.selectPlaintiffTab(window.currentPlaintiffIndex);
  window.debouncedUpdatePreview();
  console.log("Dropped plaintiff tab from", draggedIndex, "to", targetIndex);
}

// === การลากแท็บจำเลย ===
export function dragDefendantTab(event) {
  draggedItem = event.target.closest(".defendant-tab");
  event.dataTransfer.setData("text", draggedItem.dataset.index);
  console.log("Dragging defendant tab:", draggedItem.dataset.index);
}

export function allowDropDefendantTab(event) {
  event.preventDefault();
  console.log("Allowing drop on defendant tab");
}

export function dropDefendantTab(event) {
  event.preventDefault();
  
  const targetItem = event.target.closest(".defendant-tab");
  const container = document.getElementById("defendantTabsContainer");

  if (!targetItem || draggedItem === targetItem || !container.contains(targetItem)) {
    console.log("Drop cancelled: Invalid target or same item");
    return;
  }

  const items = Array.from(container.children);
  const draggedIndex = parseInt(draggedItem.dataset.index);
  const targetIndex = parseInt(targetItem.dataset.index);

  const [movedDefendant] = window.defendantData.splice(draggedIndex, 1);
  window.defendantData.splice(targetIndex, 0, movedDefendant);

  if (draggedIndex < targetIndex) {
    container.insertBefore(draggedItem, targetItem.nextSibling);
  } else {
    container.insertBefore(draggedItem, targetItem);
  }

  window.updateDefendantTabNames();

  if (window.currentDefendantIndex === draggedIndex) {
    window.currentDefendantIndex = targetIndex;
  } else if (draggedIndex < window.currentDefendantIndex && window.currentDefendantIndex <= targetIndex) {
    window.currentDefendantIndex--;
  } else if (draggedIndex > window.currentDefendantIndex && window.currentDefendantIndex >= targetIndex) {
    window.currentDefendantIndex++;
  }

  window.selectDefendantTab(window.currentDefendantIndex);
  window.debouncedUpdatePreview();
  console.log("Dropped defendant tab from", draggedIndex, "to", targetIndex);
}