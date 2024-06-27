const dial = document.querySelector('.dial');
const dialContainer = document.querySelector('.dial-container');
const compassButtons = document.querySelectorAll('.compass-button');

let angle = 0;
let isDragging = false;
let startAngle = 0;
let startMouseAngle = 0;

function updateDial() {
  dial.style.transform = `rotate(${angle}deg)`;
}

function getMouseAngle(event) {
  const rect = dialContainer.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  return Math.atan2(event.clientY - centerY, event.clientX - centerX) * 180 / Math.PI;
}

dialContainer.addEventListener('mousedown', (event) => {
  isDragging = true;
  startAngle = angle;
  startMouseAngle = getMouseAngle(event);
});

document.addEventListener('mousemove', (event) => {
  if (isDragging) {
    const currentMouseAngle = getMouseAngle(event);
    const angleDiff = currentMouseAngle - startMouseAngle;
    angle = (startAngle + angleDiff + 360) % 360;
    updateDial();
  }
});

document.addEventListener('mouseup', () => {
  isDragging = false;
});

compassButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    angle = index * 45;
    updateDial();
  });
});

updateDial();