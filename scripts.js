// Define aerodynamic constants



// Main Workhorse function
// Procedure should be:
// - read the input variables from the app
// - do caluclations
// - update results and display in app


const HEIGHT_FT_DEFAULT = 5
const HEIGHT_IN_DEFAULT = 10
const HEIGHT_CM_DEFAULT = 178
const WEIGHT_LBS_DEFAULT = 150
const WEIGHT_KG_DEFAULT = 68


function updateResult(){
  console.log("result updated!")
  console.log(angle)

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
    effortText.innerHTML = "effort"
  } else {
    effortMode = false;
    effortText.innerHTML = "pace"
  }
  updateResult()
})

console.log(effortToggle)
console.log(effortToggle.checked)





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

  // Adjust text
  setWindType()
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


// Toggle metric vs imperial

const imp_metric_buttons = document.querySelectorAll('.metric-toggle');

imp_metric_buttons.forEach(button => {
    button.addEventListener('click', (e) => {
        // Remove active class from all buttons
        imp_metric_buttons.forEach(btn => btn.classList.remove('active'));
        // Toggle the active state of the clicked button
        e.target.classList.toggle('active');

        console.log(button.innerText)

        document.getElementById('metric-input').classList.toggle('hidden')
        document.getElementById('imperial-input').classList.toggle('hidden')


        setHeightWeightUnits(button);
        //setOutputText(button);
        updateResult();
    });
});


function setHeightWeightUnits(button){
  console.log("SWITCH UNITS")
}


function resetHeightWeight(){
  console.log('FIRE UPDATE')
  heightFtInput.value = HEIGHT_FT_DEFAULT
  heightInInput.value = HEIGHT_IN_DEFAULT
  heightCmInput.value = HEIGHT_CM_DEFAULT
  weightLbsInput.value = WEIGHT_LBS_DEFAULT
  weightKgInput.value = WEIGHT_KG_DEFAULT  
}


document.getElementById("advanced-reset").addEventListener('click', function(){
  var content = document.getElementById("advanced-content");
  var labelText = document.getElementById("typical-or-custom");
  var resetButton = document.getElementById("advanced-reset");
  var expandGear = document.getElementById("advanced-expand");

    // Toggle the icon or text if needed
    if (content.classList.contains("expanded")) {
      expandGear.innerText = "settings";

      resetHeightWeight();


      // AND SET HEIGHT WEIGHt
      console.log('RESET HEIGHT WEIGTH EHER')
  } else {
    // Else if it is not expanded, do nothing
  }

})



// Dial and input controls


// --- Incrementing pace dials --- 

//First incrementor
let d1 = document.querySelector("#d1");
const d1_up = document.querySelector('#d1-up');
const d1_down = document.querySelector('#d1-down');

d1_up.addEventListener('click', () => {
    increment_minutes(d1,1);
    updateResult();
});

d1_down.addEventListener('click', () => {
    increment_minutes(d1,-1);
    updateResult();
});

//Second incrementors - a bit different
const d2_up = document.querySelector('#d2-up');
const d2_down = document.querySelector('#d2-down');

d2_up.addEventListener('click', () => {
    increment_sec_digit(d2,6,1);
    updateResult();
});

d2_down.addEventListener('click', () => {
    increment_sec_digit(d2,6,-1);
    updateResult();
});

// 3rd digit is limit 10
const d3_up = document.querySelector('#d3-up');
const d3_down = document.querySelector('#d3-down');

d3_up.addEventListener('click', () => {
    increment_sec_digit(d3,10,1);
    updateResult();
});

d3_down.addEventListener('click', () => {
    increment_sec_digit(d3,10,-1,5); //floor of 5
    updateResult();
});

// --- icnrementing speed

//First incrementor
let s1 = document.querySelector("#s1");
const s1_up = document.querySelector('#s1-up');
const s1_down = document.querySelector('#s1-down');

s1_up.addEventListener('click', () => {
    increment_minutes(s1,1);
    updateResult();
});

s1_down.addEventListener('click', () => {
    increment_minutes(s1,-1);
    updateResult();
});

//Second incrementors - a bit different
const s2_up = document.querySelector('#s2-up');
const s2_down = document.querySelector('#s2-down');

s2_up.addEventListener('click', () => {
    increment_sec_digit(s2,10,1);
    updateResult();
});

s2_down.addEventListener('click', () => {
    increment_sec_digit(s2,10,-1);
    updateResult();
});



// incremntor functions

function increment_sec_digit(digit_object, digit_limit, change){
    let digit_val = parseInt(digit_object.textContent);
    // mod ops to circularize
    if (change === 1) {
        digit_val = (digit_val + 1) % digit_limit;
    }
    if (change === -1) {
        digit_val = (digit_val - 1 + digit_limit) % digit_limit;
    }
    // DEAL WITH 0:00 SOMEHOW...
    digit_object.textContent = digit_val;
}

function increment_minutes(digit_object,change){
    let digit_val = parseInt(digit_object.textContent);
    //Disallow > 60
    if (change > 0 && digit_val < 60) {
        digit_object.textContent = digit_val + change
    }
    //Disallow < 0
    if (digit_val > 0 && change < 0) {
        digit_object.textContent = digit_val + change
    }
}

// ------ Unit selectors (Input / output) -------


// Input unit selector
const pace_buttons = document.querySelectorAll('.pace-toggle');

pace_buttons.forEach(button => {
    button.addEventListener('click', (e) => {
        // Remove active class from all buttons
        pace_buttons.forEach(btn => btn.classList.remove('active'));
        // Toggle the active state of the clicked button
        e.target.classList.toggle('active');
        setPaceText(button);
    });
});

// Output unit selector
const output_buttons = document.querySelectorAll('.wind-toggle');

output_buttons.forEach(button => {
    button.addEventListener('click', (e) => {
        // Remove active class from all buttons
        output_buttons.forEach(btn => btn.classList.remove('active'));
        // Toggle the active state of the clicked button
        e.target.classList.toggle('active');
        setWindUnits(button);
        //setOutputText(button);
        updateResult();
    });
});


const speed_dials = document.querySelector('#speed-dials')
const pace_dials = document.querySelector('#pace-dials')

function setMode(dial_mode) {
    if (dial_mode == "pace") {
        // set global var, swap hidden states
        pace_mode = "pace"
        speed_dials.classList.add('hidden');
        pace_dials.classList.remove('hidden');

    }
    if (dial_mode == "speed") {
        // set global var, swap hidden states
        pace_mode = "speed"
        pace_dials.classList.add('hidden');
        speed_dials.classList.remove('hidden');

    }
}


//Change display text by pace
function setPaceText(button){
    //4 things can happen here: mi, km, mph, kmh.
    let pace_units = document.querySelector('#pace-units')
    let speed_units = document.querySelector('#speed-units')

    // [/mi] 
    if (button.textContent == "/mi" || button.textContent == "/km") {
        setMode("pace");        
        pace_units.textContent = button.textContent;
        // function like pass_pace_to_speed()
    }
    if (button.textContent == "mph" || button.textContent == "km/h" || button.textContent == "m/s") {
        setMode("speed");
        speed_units.textContent = button.textContent;
        // function like pass_speed_to_pace()
    }

    updateResult();
}

var output_text = document.querySelector('#output-text')
// Use this to change otuput text directly

//easy once you get inoptu as m/s and output as m/s

// Chang eoutptu text
function setOutputText(button){
    //4 things can happen here: mi, km, mph, kmh.
    let output_units = document.querySelector('#output-units')
    // [/mi] 
    output_units.textContent = button.textContent;
    if (button.textContent == "/mi" || button.textContent == "/km") {
        // UNIT CONVERTION TODO FIX HACK BUG    
        // output_units.textContent = button.textContent;
        // function like pass_pace_to_speed()
        output_pace_mode = 'pace'
    }
    if (button.textContent == "mph" || button.textContent == "km/h" || button.textContent == "m/s") {
        // setMode("speed");
        // speed_units.textContent = button.textContent;
        // function like pass_speed_to_pace()
        output_pace_mode = 'speed'
    }
}


let wind_units = document.querySelector('#wind-units')

// Chnage wind units
function setWindUnits(button){
  //4 things can happen here: mi, km, mph, kmh.
  // [/mi] 
  wind_units.textContent = button.textContent;

  if (wind_units.textContent == "m/s"){
    wind_text.textContent = wind_val.toFixed(1)
  } else {
    wind_val = Math.round(wind_val)
    wind_text.textContent = wind_val.toFixed(0)
  }
  
  //Do I need to od anthign else? 

}



// Wind magnitude 

// TODO: Implement decimals for m/s

let wind_text = document.querySelector("#wind-digit")
let wind_val = parseFloat(wind_text.textContent)

// In order left to right...
const wind_m5 = document.querySelector("#wind-m5")
wind_m5.addEventListener('click', () => {
    increment_wind(-5)
})

const wind_m1 = document.querySelector("#wind-m1")
wind_m1.addEventListener('click', () => {
  increment_wind(-1)
})

const wind_p1 = document.querySelector("#wind-p1")
wind_p1.addEventListener('click', () => {
  increment_wind(1)
})

const wind_p5 = document.querySelector("#wind-p5")
wind_p5.addEventListener('click', () => {
  increment_wind(5)
})

function increment_wind(change){

  // for m/s the big change should be 1.0, and small change 0.1
  // so big change (5) we divide by 5
  if (wind_units.textContent == "m/s") {

    
    if (Math.abs(change) === 5){
      console.log("FIVE CHANGER")
      change = change/5;      
    } else {
      // else it is a +/- 1 wch we want as 0.1
      change = change/10
    }

    /// now... 

    // LEFT OFF HERE 
    // BNNOT SURE HOW DO DO THE MS MATH separate variables? or no>?


  }

    let proposed_val = wind_val + change

    // First, check if proposed change is allowed
    if (proposed_val <= 50 && proposed_val >= 0) {
      wind_val = proposed_val
        // Update text on page

        if (wind_units.textContent == "m/s") {
          wind_text.textContent = wind_val.toFixed(1)
        } else {
          wind_text.textContent = wind_val.toFixed(0)
        }
        //angle_text.textContent = angle_int;

        //Need to modify negateIncline to NOT flip what we just changed!
        updateResult();
    }
}


// Wind profile

// Output unit selector
const profile_buttons = document.querySelectorAll('.profile-toggle');

profile_buttons.forEach(button => {
    button.addEventListener('click', (e) => {
        // Remove active class from all buttons
        profile_buttons.forEach(btn => btn.classList.remove('active'));
        // Toggle the active state of the clicked button
        e.currentTarget.classList.toggle('active');
        setWindProfile(button);
        updateResult();
    });
});




function setWindType(){
  let wind_type = document.querySelector('#wind-type')
  if (angle >= 337.5 || angle < 22.5) {
    console.log("NORTH")
    wind_type.textContent = "headwind"
  } else if (angle >= 22.5 && angle < 67.5) {
    wind_type.textContent = "crosswind"
  } else if (angle >= 67.5 && angle < 112.5) {
    console.log("STRAIGHT EAST")
    wind_type.textContent = "lateral wind"
  } else if (angle >= 112.5 && angle < 157.5) {
    console.log("SOUTHEAST")
    wind_type.textContent = "crosswind"
  } else if (angle >= 157.5 && angle < 202.5) {
    console.log("SOUTH")
    wind_type.textContent = "tailwind"
  } else if (angle >= 202.5 && angle < 247.5) {
    console.log("SOUTHWEST")
    wind_type.textContent = "crosswind"
  } else if (angle >= 247.5 && angle < 292.5){
    console.log("WEST")
    wind_type.textContent = "lateral wind"
  } else if (angle >= 292.5 && angle < 337.5){
    console.log("NORTHWEST")
    wind_type.textContent = "crosswind"
  }

}

function setWindProfile(){
  //Do something...
}

updateResult();



console.log('test')