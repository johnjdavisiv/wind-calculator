// Define aerodynamic constants

// Main Workhorse function
// Procedure should be:
// - read the input variables from the app
// - do caluclations
// - update results and display in app


const WEIGHT_LBS_DEFAULT = 150
const WEIGHT_KG_DEFAULT = 68
const WEIGHT_ST_DEFAULT = 10
const WEIGHT_ST_LB_DEFAULT = 10


// wind profile vals
const ALPHA_CITY = 0.4
const ALPHA_SUBURBS = 0.3
const ALPHA_RURAL = 0.16
const ALPHA_NONE = 0.0

const WIND_SPEED_DEFAULT = 2.2352 // 5 mph

let runner_weight_kg = WEIGHT_KG_DEFAULT


// Forward and lateral components
// DEFINITIONS: Postiive forward compnent = HEADWIND (wind coming at runner)
// 
let wind_fwd_comp = 1*WIND_SPEED_DEFAULT
let wind_lat_comp = 0
// wind fwd comp is actually the real workhorse here. Reember it's in m.s alawys. 


let runner_speed_ms // just read it first time from pace dials
let pace_mode = "pace"
let units_mode = "usa"
let effort_mode = true
let wind_ms = WIND_SPEED_DEFAULT
let eq_speed = 3.35 // m/s, setup intiial so its correct


let alpha_exp = ALPHA_SUBURBS






// TODO:

// Get runner speed m/s from input pace OR input speed

// for now, just convert runner speed back to output unit and display

// Later, will have antoehr variabl called effectivespeed that we use in same back-convert function

// for now copy GAp code ont hat front


// Then get the math working in a SEPAREATE index.html file to test cleanly

// cf with R, try some test cases

// Also need to fix output AND output units, but that will happen after calcs are done




function updateResult(){
  
  // CONSIDER: cool color changing gradient for headwind button
  // ie angle changse it   
  // notice how we need to read weight here, not externally in global space
  updateWeight()
  readCurrentSpeed()
  readCurrentWind()

  // do calcs
  updateOutput(eq_speed)

  // ok bc of scope and such we need to read the values at all times! 
}

// Get variables from input boxes so we can manipulate them
// Get the values from the input boxes
let weightLbsInput = document.getElementById('weight-lbs')
let weightKgInput = document.getElementById('weight-kg')
let weightStInput = document.getElementById('weight-st')
let weightStLbInput = document.getElementById('weight-st-lb')



// Can replace this with a selectorAll later, just add a specialc lass or use a fancy selection

// Update results when any of these these change
weightLbsInput.addEventListener('input', updateResult);
weightKgInput.addEventListener('input', updateResult);
weightStInput.addEventListener('input', updateResult);
weightStLbInput.addEventListener('input', updateResult);

// Effort vs pace toggle switch
// Attach the event listener to the checkbox input
let effortToggle = document.querySelector('#pace-post .switch input[type="checkbox"]');
effortToggle.addEventListener('change', function() {
  let effortText = document.getElementById("pace-or-effort")

  // if checkbox is checked, we are in EFFORT MODE - consdider swaping>?
  if (effortToggle.checked){
    effort_mode = true;
    effortText.innerHTML = "effort"
  } else {
    effort_mode = false;
    effortText.innerHTML = "pace"
  }
  updateResult()
})


// Compass wheel knob stuff
const dial = document.querySelector('.dial');
const dialContainer = document.querySelector('.dial-container');
const compassButtons = document.querySelectorAll('.compass-button');

let angle = 0;
let isDragging = false;
let startAngle = 0;
let startPointerAngle = 0;


function getWindComps(angleDegrees) {
  // Convert the angle from degrees to radians
  const angleRadians = angleDegrees * (Math.PI / 180);
  
  // Calculate the x and y components
  const fwd_comp = Math.cos(angleRadians);
  const lat_comp = Math.sin(angleRadians);
  
  return { fwd_comp: fwd_comp, lat_comp: lat_comp };
}



function updateDial() {
  dial.style.transform = `rotate(${angle}deg)`;

  // Adjust text (headwind, tailwind, etc)
  setWindType()

  updateResult();
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



// angle stuff








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
const imp_metric_divs = document.querySelectorAll('.ht-wt-div')

imp_metric_buttons.forEach(button => {
    button.addEventListener('click', (e) => {
        // Remove active class from all buttons
        imp_metric_buttons.forEach(btn => btn.classList.remove('active'));
        imp_metric_divs.forEach(btn => btn.classList.add('hidden'));
        
        // Toggle the active state of the clicked button
        e.target.classList.toggle('active');


        //messy ifelse for hiding
        if (button.innerText == "usa") {
          document.getElementById('imperial-input').classList.remove('hidden')
        } else if (button.innerText == "uk") {
          document.getElementById('uk-input').classList.remove('hidden')
        } else {
          document.getElementById('metric-input').classList.remove('hidden')
        }

        units_mode = button.textContent;
        //setOutputText(button);
        updateResult();
    });
});


function updateWeight(){
  if (units_mode == "usa"){
    runner_weight_kg = parseFloat(weightLbsInput.value)/2.20462
  } else if (units_mode == "uk") {
    // stone lbs to kg
    runner_weight_kg = (parseFloat(weightStInput.value)*14 + parseFloat(weightStLbInput.value))/2.20462
  } else {
    runner_weight_kg = parseFloat(weightKgInput.value)
  }
 
}


function resetWeight(){
 
  weightLbsInput.value = WEIGHT_LBS_DEFAULT
  weightKgInput.value = WEIGHT_KG_DEFAULT  
  weightStInput.value = WEIGHT_ST_DEFAULT
  weightStLbInput.value = WEIGHT_ST_LB_DEFAULT
}


document.getElementById("advanced-reset").addEventListener('click', function(){
  resetWeight();
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

    setOutputText(button)

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
        output_pace_mode = 'pace'
    }
    if (button.textContent == "mph" || button.textContent == "km/h" || button.textContent == "m/s") {
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

    // minor hack but prevents branching logic from getting messy
    if (Math.abs(change) === 5){
      change = change/5;      
    } else {
      // else it is a +/- 1 wch we want as 0.1
      change = change/10
    }
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

  //In case you want to use fancy termsl like quartering wind later

  //Can also do color chang ehere?

  if (angle >= 337.5 || angle < 22.5) {
    wind_type.textContent = "headwind"
  } else if (angle >= 22.5 && angle < 67.5) {
    wind_type.textContent = "crosswind"
  } else if (angle >= 67.5 && angle < 112.5) {
    wind_type.textContent = "lateral wind"
  } else if (angle >= 112.5 && angle < 157.5) {
    wind_type.textContent = "crosswind"
  } else if (angle >= 157.5 && angle < 202.5) {
    wind_type.textContent = "tailwind"
  } else if (angle >= 202.5 && angle < 247.5) {
    wind_type.textContent = "crosswind"
  } else if (angle >= 247.5 && angle < 292.5){
    wind_type.textContent = "lateral wind"
  } else if (angle >= 292.5 && angle < 337.5){
    wind_type.textContent = "crosswind"
  }

}

function setWindProfile(button){
  // Useful in case I need to tweak standards
  if (button.id == "profile-city") {
    alpha_exp = ALPHA_CITY
  } else if (button.id == "profile-suburbs") {
    alpha_exp = ALPHA_SUBURBS
  } else if (button.id == "profile-rural") {
    alpha_exp = ALPHA_RURAL
  } else if (button.id == "profile-none") {
    alpha_exp = ALPHA_NONE
  }
}


// ----- Reading speed from digits
function readCurrentSpeed(){
  // Pace mode
  if (pace_mode == "pace") {
      // read mm:ss
      var minute_val = parseInt(d1.textContent)
      var sec_val = 10*parseInt(d2.textContent) + parseInt(d3.textContent)
      var dec_minutes = minute_val + sec_val/60

      const pace_units = document.querySelector('#pace-units').textContent

      if (pace_units == "/mi"){
          //Convert to m/s
          input_m_s = 1609.344/(60*dec_minutes)
      } else if (pace_units == "/km"){
          //Convert to m/s
          input_m_s = 1000/(60*dec_minutes)
      }

  // Speed mode
  } else if (pace_mode == "speed") {
      const speed_units = document.querySelector('#speed-units').textContent
      //speed changes
      var dec_speed = parseInt(s1.textContent) + parseInt(s2.textContent)/10

          if (speed_units == "mph"){
          //Convert to m/s
          input_m_s = dec_speed*1609.344/3600
      } else if (speed_units == "km/h"){
          //Convert to m/s
          input_m_s = dec_speed*1000/3600
      } else if (speed_units == "m/s"){
          input_m_s = dec_speed // lol
      }
  }
}


function readCurrentWind(){
  var wind_units = document.querySelector('#wind-units').textContent
  var wind_input = document.querySelector('#wind-digit').textContent

  if (wind_units == "mph"){

    wind_ms = wind_input*0.44704
  } else if (wind_units == "km/h") {
    wind_ms = wind_input/3.6
  } else if (wind_units == "knots") {
    wind_ms = wind_input*0.51444
  } else if (wind_units == "m/s") {
    wind_ms = wind_input
  }
  
  const wind_components = getWindComps(angle);
  
  // Don't forget vector magntidue
  wind_fwd_comp = wind_components['fwd_comp']*wind_ms
  wind_lat_comp = wind_components['lat_comp']*wind_ms
}


/// m/s output to string
let conv_dec

const convert_dict = {
    // functions to convert m/s to [output unit, as key]
    '/mi':function (m_s){
        // to decimal minutes per mile
        conv_dec = 1609.344/(m_s*60)
        return decimal_pace_to_string(conv_dec);
    },
    '/km':function (m_s){
        // to decimal minutes per km
        conv_dec = 1000/(m_s*60)
        return decimal_pace_to_string(conv_dec);
    },
    'mph':function (m_s){
        conv_dec = m_s*2.23694
        return conv_dec.toFixed(1);
    },
    'km/h':function (m_s){
        conv_dec = m_s*3.6
        return conv_dec.toFixed(1);
    },
    'm/s':function (m_s){
        // ez mode lol
        return m_s.toFixed(2);
    }
}

function decimal_pace_to_string(pace_decimal){
    let pace_min = Math.floor(pace_decimal)
    //Could be zero!! 
    let pace_sec = (pace_decimal - pace_min)*60
    //e.g. 9.50 --> 30 

    //Deal with e.g. 3:59.9 --> 4:00.0
    if (Math.round(pace_sec) === 60) {
        pace_sec = 0
        pace_min = pace_min+1;
    } else {
        pace_sec = Math.round(pace_sec);
    }
    //To formatted string
    res = `${pace_min}:${pace_sec.toString().padStart(2,'0')}` 
    return res
}





function updateOutput(eq_speed){
  let out_text = document.querySelector('#output-text')
  let out_units = document.querySelector('#output-units')
  let convert_text = ''
  let impossible_box = document.querySelector('#impossible-box')

  if (!Number.isFinite(eq_speed)){
      // If we get any funny business...hmm
      convert_text = '🤔' // hmm or scream
  } else {
      const convert_fxn = convert_dict[out_units.textContent]
      convert_text = convert_fxn(eq_speed)
  }
  out_text.textContent = convert_text

  //Update text in doc
}


updateDial();
updateResult();