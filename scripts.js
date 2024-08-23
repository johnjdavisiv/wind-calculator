// Define aerodynamic constants



// Main Workhorse function
// Procedure should be:
// - read the input variables from the app
// - do caluclations
// - update results and display in app


function updateResult(){
  console.log("result updated!")

  // notice how we need to read height here, not externally in global space
  let foo = document.getElementById('height-ft')

  console.log(`Height: ${foo.value}`)

  // ok bc of scope and such we need to read the values at all times! 
}



// AAHHHH DOES NOT WORKKK


// Get variables from input boxes so we can manipulate them
// Get the values from the input boxes
let heightFtInput = document.getElementById('height-ft')
let heightInInput = document.getElementById('height-in')
let weightLbsInput = document.getElementById('weight-lbs')
let heightCmInput = document.getElementById('height-cm')
let weightKgInput = document.getElementById('weight-kg')

// Update results when any of these these change
heightFtInput.addEventListener('input', updateResult);
heightInInput.addEventListener('input', updateResult);
weightLbsInput.addEventListener('input', updateResult);
heightCmInput.addEventListener('input', updateResult);
weightKgInput.addEventListener('input', updateResult);

// Convert the values to numbers if needed
heightFt = parseFloat(heightFtInput.value);
heightIn = parseFloat(heightInInput.value);
weightLbs = parseFloat(weightLbsInput.value);
heightCm = parseFloat(heightCmInput.value);
weightKg = parseFloat(weightKgInput.value);




// Now you can use these variables in your code
console.log(`Height: ${heightFt} ft ${heightIn} in`);
console.log(`Weight: ${weightLbs} lbs`);
console.log(`Height: ${heightCm} cm`);
console.log(`Weight: ${weightKg} kg`);



// Effort vs pace toggle switch


// Attach the event listener to the checkbox input


let effortMode = true

let effortToggle = document.querySelector('#pace-post .switch input[type="checkbox"]');
effortToggle.addEventListener('change', function() {
  let effortText = document.getElementById("pace-or-effort")

  // if checkbox is checked, we are in EFFORT MODE
  if (effortToggle.checked){
    effortMode = true;
    effortText.innerHTML = "effort level&nbsp;"
  } else {
    effortMode = false;
    effortText.innerHTML = "pace&nbsp;"
  }
  updateResult()
})

console.log(effortToggle)
console.log(effortToggle.checked)


//addEventListener("click", function() {

















// Compass wheel knob stuff
const dial = document.querySelector('.dial');
const dialContainer = document.querySelector('.dial-container');
const compassButtons = document.querySelectorAll('.compass-button');

let angle = 0;
let isDragging = false;
let startAngle = 0;
let startPointerAngle = 0;

function updateDial() {
  updateResult();
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
  var resetButton = document.getElementById("advanced-reset");


  content.classList.toggle("expanded");
  
  // Toggle the icon or text if needed
  if (content.classList.contains("expanded")) {
      this.innerText = "expand_less"; // Use a different icon for collapse
      labelText.innerText = "Custom runner"; 
      resetButton.classList.remove("invis");
  } else {
      this.innerText = "settings";
      labelText.innerText = "Custom runner";
  }
});


document.getElementById("advanced-reset").addEventListener('click', function(){
  var content = document.getElementById("advanced-content");
  var labelText = document.getElementById("typical-or-custom");
  var resetButton = document.getElementById("advanced-reset");
  var expandGear = document.getElementById("advanced-expand");

  // deal with if they click reset after drawer is closed
  if (labelText.innerText == "Custom runner"){
    labelText.innerText = "For a typical runner"; 
  } 
  
    // Toggle the icon or text if needed
    if (content.classList.contains("expanded")) {
      labelText.innerText = "For a typical runner"; 
      content.classList.toggle("expanded");
      resetButton.classList.add("invis");
      expandGear.innerText = "settings";


      // AND SET HEIGHT WEIGHt
      console.log('RESET HEIGHT WEIGTH EHER')
  } else {
    // Else if it is not expanded, do nothing
  }

})


console.log('test')