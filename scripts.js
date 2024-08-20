const dial = document.querySelector('.dial');
const dialContainer = document.querySelector('.dial-container');
const compassButtons = document.querySelectorAll('.compass-button');

let angle = 0;
let isDragging = false;
let startAngle = 0;
let startPointerAngle = 0;

function updateDial() {
  dial.style.transform = `rotate(${angle}deg)`;
}

function getPointerAngle(clientX, clientY) {
  const rect = dialContainer.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  return Math.atan2(clientY - centerY, clientX - centerX) * 180 / Math.PI;
}

function startDrag(event) {
  isDragging = true;
  startAngle = angle;
  const clientX = event.clientX || event.touches[0].clientX;
  const clientY = event.clientY || event.touches[0].clientY;
  startPointerAngle = getPointerAngle(clientX, clientY);
  event.preventDefault();  // Prevent accidental selection or dragging
}

function moveDrag(event) {
  if (isDragging) {
    const clientX = event.clientX || event.touches[0].clientX;
    const clientY = event.clientY || event.touches[0].clientY;
    const currentPointerAngle = getPointerAngle(clientX, clientY);
    const angleDiff = currentPointerAngle - startPointerAngle;
    angle = (startAngle + angleDiff + 360) % 360;
    updateDial();
    event.preventDefault();  // Prevent scrolling during touchmove
  }
}

function endDrag() {
  isDragging = false;
}

// Mouse events
dialContainer.addEventListener('mousedown', startDrag);
document.addEventListener('mousemove', moveDrag);
document.addEventListener('mouseup', endDrag);

// Touch events
dialContainer.addEventListener('touchstart', startDrag);
document.addEventListener('touchmove', moveDrag, { passive: false });  // Set passive to false to allow preventDefault
document.addEventListener('touchend', endDrag);

compassButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    angle = index * 45;
    updateDial();
  });
});

updateDial();


// Setup the advanced dropdown box

document.getElementById("advanced-expand").addEventListener("click", function() {
  var content = document.getElementById("advanced-content");
  var labelText = document.getElementById("typical-or-custom");
  content.classList.toggle("expanded");
  
  // Toggle the icon or text if needed
  if (content.classList.contains("expanded")) {
      this.innerText = "expand_less"; // Use a different icon for collapse
      labelText.innerText = "Custom runner";
  } else {
      this.innerText = "settings";
      labelText.innerText = "Custom runner";
  }
});


