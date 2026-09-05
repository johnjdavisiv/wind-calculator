// John J Davis, RunningWritings.com

const WEIGHT_LBS_DEFAULT = 150
const WEIGHT_KG_DEFAULT = 68
const WEIGHT_ST_DEFAULT = 10
const WEIGHT_ST_LB_DEFAULT = 10

const GRID_MAX_M_S = 12 // m/s, whats max value of our lookup table speed? min is zero ofc 
const GRID_STEP = 0.01 // m/s, how fine-grained is lookup table?
// Finer grids are slower, calculation-wise

const IS_ELITE = 1 // use elite runner metabolic cost? (barely matters at all, like 1-3 sec/mi)
// I do not think this matters much since it is a constant offset and we just look at changes
// Coudl add checkbox to customizer box

// wind profile vals
const ALPHA_CITY = 0.4
const ALPHA_SUBURBS = 0.3
const ALPHA_RURAL = 0.16
const ALPHA_NONE = 0.0
let alpha_exp = ALPHA_SUBURBS

const WIND_REFERENCE_HEIGHT = 10 // meters above ground for wind forecasts and measurements
const CHEST_HEIGHT = 1.5 // meters  (kinda arbitrary)

const WIND_SPEED_DEFAULT = 2.2352 // 5 mph
const RUNNER_SPEED_DEFAULT = 3.83176 // 7:00/mi
const DEFAULT_OUTPUT_SPEED_M_S = 3.915669 // fix later once you do calcs


let output_speed_ms = DEFAULT_OUTPUT_SPEED_M_S


// Drag equation 
// Wind stuff setup
const GRAVITY = 9.80665 // ISA gravity standard
const DRAG_COEFFICIENT = 0.8 // Pretty typical values from experimental + CDF studies
const AIR_DENSITY = 1.225 // kg/m^3, ISA air density at 15 C at sea level
const AP_RATIO = 0.266 // percent of body surface area that is forward-facing, Ap = AP_RATIO*BSA
// Reference: Pugh 1970, admittedly from only 9 young athletic males
const DA_SILVA_SLOPE = 6.13 // Da Silva 202x


// Setup for first calc (will update all in updateResults)
let runner_weight_kg = WEIGHT_KG_DEFAULT
let bsa = getBodySurfaceArea(runner_weight_kg)
let runner_Ap = getAp(bsa)




// wind fwd comp is actually the real workhorse here. Reember it's in m.s alawys. 
let input_m_s = RUNNER_SPEED_DEFAULT // just read it first time from pace dials
let pace_or_speed = "pace"
let units_mode = "usa"
let effort_mode = false


// wind_ms is user input wind converted to m/s
// true_wind_ms is our calculated wind after wind profile law (also in m/s)

let wind_ms = WIND_SPEED_DEFAULT

let true_wind_ms = windProfilePowerLaw(wind_ms, alpha_exp)
// Forward and lateral components
// DEFINITIONS: Postiive forward compnent = HEADWIND (wind coming at runner)
// 
let true_wind_fwd_comp = 1*true_wind_ms
let true_wind_lat_comp = 0




function updateResult(){
  // Wrapper function to attache verything to.
  
  // CONSIDER: cool color changing gradient for headwind button
  // ie angle changse it   
  // notice how we need to read weight here, not externally in global space
  updateWeight()
  updateRunnerLabel()
  readCurrentSpeed()
  readCurrentWind()
  doWindCalcs()
  updateOutput()
  saveState()   // every input change funnels through here, so this is the save point

  // ok bc of scope and such we need to read the values at all times! 
}

// Get variables from input boxes so we can manipulate them
// Get the values from the input boxes
let weightLbsInput = document.getElementById('weight-lbs')
let weightKgInput = document.getElementById('weight-kg')
let weightStInput = document.getElementById('weight-st')
let weightStLbInput = document.getElementById('weight-st-lb')



// Update results when any of these these change
weightLbsInput.addEventListener('input', updateResult);
weightKgInput.addEventListener('input', updateResult);
weightStInput.addEventListener('input', updateResult);
weightStLbInput.addEventListener('input', updateResult);

// Effort vs pace toggle switch
// Attach the event listener to the checkbox input
let effortToggle = document.querySelector('#pace-post .switch input[type="checkbox"]');

// Sync effort_mode + the surrounding labels to the switch. Split out from the
// change handler so applyState() can replay a saved switch position.
function setEffortFromToggle() {
  let effortText = document.getElementById("pace-or-effort")
  let resultPreText = document.getElementById('result-pre')

  // if checkbox is checked, we are in EFFORT MODE - consdider swaping>?
  if (effortToggle.checked){
    effort_mode = false;
    effortText.innerHTML = "pace"
    resultPreText.innerText = "is the same effort as"
  } else {
    effort_mode = true;
    effortText.innerHTML = "calm-day effort"
    resultPreText.innerText = "will result in"
  }
}

effortToggle.addEventListener('change', function() {
  setEffortFromToggle()
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


function getAngleComps(angleDegrees) {
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








// Inline SVG glyphs for the advanced-panel toggle (icons are inline SVG now, not a font)
const ICON_SVG = {
  expand_less: '<svg viewBox="0 -960 960 960" aria-hidden="true" focusable="false"><path d="m296-345-56-56 240-240 240 240-56 56-184-184-184 184Z"/></svg>',
  settings: '<svg viewBox="0 -960 960 960" aria-hidden="true" focusable="false"><path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z"/></svg>'
};

// Setup the advanced dropdown box
document.getElementById("advanced-expand").addEventListener("click", function() {
  var content = document.getElementById("advanced-content");
  var resetButton = document.getElementById("advanced-reset");

  content.classList.toggle("expanded");

  // Toggle the icon or text if needed
  if (content.classList.contains("expanded")) {
      this.innerHTML = ICON_SVG.expand_less; // Use a different icon for collapse
      resetButton.classList.remove("invis");
  } else {
      this.innerHTML = ICON_SVG.settings;
  }

  updateRunnerLabel();
});


function isDefaultWeight(){
  if (units_mode == "usa"){
    return parseFloat(weightLbsInput.value) === WEIGHT_LBS_DEFAULT
  } else if (units_mode == "uk") {
    return parseFloat(weightStInput.value) === WEIGHT_ST_DEFAULT
        && parseFloat(weightStLbInput.value) === WEIGHT_ST_LB_DEFAULT
  }
  return parseFloat(weightKgInput.value) === WEIGHT_KG_DEFAULT
}


function updateRunnerLabel(){
  var content = document.getElementById("advanced-content");
  var labelText = document.getElementById("typical-or-custom");

  if (content.classList.contains("expanded") || !isDefaultWeight()) {
    labelText.innerText = "Custom runner"
  } else {
    labelText.innerText = "For a typical runner"
  }
}


// Toggle metric vs imperial

const imp_metric_buttons = document.querySelectorAll('.metric-toggle');
const imp_metric_divs = document.querySelectorAll('.ht-wt-div')

// Reveal the matching weight box and set units_mode. Split out from the click
// handler so applyState() can replay a saved unit choice.
function setWeightUnits(button){
    imp_metric_divs.forEach(btn => btn.classList.add('hidden'));

    //messy ifelse for hiding
    if (button.textContent == "usa") {
      document.getElementById('imperial-input').classList.remove('hidden')
    } else if (button.textContent == "uk") {
      document.getElementById('uk-input').classList.remove('hidden')
    } else {
      document.getElementById('metric-input').classList.remove('hidden')
    }

    units_mode = button.textContent;
}

imp_metric_buttons.forEach(button => {
    button.addEventListener('click', (e) => {
        // Remove active class from all buttons
        imp_metric_buttons.forEach(btn => btn.classList.remove('active'));

        // Toggle the active state of the clicked button
        e.target.classList.toggle('active');

        setWeightUnits(button);
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

  //update weight-based params
  bsa = getBodySurfaceArea(runner_weight_kg)
  runner_Ap = getAp(bsa)
}


function resetWeight(){ 
  weightLbsInput.value = WEIGHT_LBS_DEFAULT
  weightKgInput.value = WEIGHT_KG_DEFAULT  
  weightStInput.value = WEIGHT_ST_DEFAULT
  weightStLbInput.value = WEIGHT_ST_LB_DEFAULT
}


document.getElementById("advanced-reset").addEventListener('click', function(){
  resetWeight();
  updateResult();
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
    increment_sec_digit(d3,10,-1);
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
        pace_or_speed = "pace"
        speed_dials.classList.add('hidden');
        pace_dials.classList.remove('hidden');

    }
    if (dial_mode == "speed") {
        // set global var, swap hidden states
        pace_or_speed = "speed"
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

// Make output match input
function setOutputText(button){
    let output_units = document.querySelector('#output-units')
    // [/mi] 
    output_units.textContent = button.textContent;
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
  updateWindStepTitles();
}

// Tooltips have to track the unit: m/s steps by 1.0 / 0.1, everything else by 5 / 1
function updateWindStepTitles() {
    const is_ms = wind_units.textContent === 'm/s';
    const big_step = is_ms ? '1.0' : '5';
    const small_step = is_ms ? '0.1' : '1';
    document.querySelector('#wind-m5').title = `-${big_step}`;
    document.querySelector('#wind-m1').title = `-${small_step}`;
    document.querySelector('#wind-p1').title = `+${small_step}`;
    document.querySelector('#wind-p5').title = `+${big_step}`;
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

  // Angle definitions: 
  // 0 deg: north
  // 45 deg: northeast
  // ... 
  // 315: Northwest

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
  if (pace_or_speed == "pace") {
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
  } else if (pace_or_speed == "speed") {
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
  var wind_input = parseFloat(document.querySelector('#wind-digit').textContent)

  if (wind_units == "mph"){

    wind_ms = wind_input*0.44704
  } else if (wind_units == "km/h") {
    wind_ms = wind_input/3.6
  } else if (wind_units == "knots") {
    wind_ms = wind_input*1852/3600 // 1 knot = 1 nautical mile per hour
  } else if (wind_units == "m/s") {
    wind_ms = wind_input
  }

  true_wind_ms = windProfilePowerLaw(wind_ms, alpha_exp)

  // SCRATCH THIS
  
  const angle_components = getAngleComps(angle);
  
  // Don't forget vector magntidue
  true_wind_fwd_comp = angle_components['fwd_comp']*true_wind_ms
  true_wind_lat_comp = angle_components['lat_comp']*true_wind_ms
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
    const res = `${pace_min}:${pace_sec.toString().padStart(2,'0')}`
    return res
}


function updateOutput(){
  let out_text = document.querySelector('#output-text')
  let out_units = document.querySelector('#output-units')
  let convert_text = ''

  if (!Number.isFinite(output_speed_ms) || output_speed_ms <= 0){
      // If we get any funny business...hmm
      convert_text = '🤔' // hmm or scream
  } else {
      const convert_fxn = convert_dict[out_units.textContent]
      convert_text = convert_fxn(output_speed_ms)
  }
  out_text.textContent = convert_text

  //Update text in doc
}



function getBodySurfaceArea(weight_kg) {
  // get body surface area in m**2 from weight in kg
  // Valid for weight from 10 to 250 kg
  // Reference: Livingston and Lee 2001
  return 0.1173*weight_kg**0.6466
}


function getAp(bsa){
  // get projected frontal area, in m**2, from body surface area and Pugh's A_p ratio
  return AP_RATIO*bsa
}


// Black et al polynomial for metabolic cost in TRUE STILL AIR (ie on a treadmill)
function calcTreadMetCost(speed_ms, isElite) {
  // Ref: Black et al 2018(?)
  // isElite is a binary value: 0 (no) / 1 (yes)
  // speed is in m/s
  // The function returns the average metabolic cost of treadmill running in Watts/kg  
  const metabolicCost = 8.09986 
                      + 0.12910 * speed_ms 
                      + 0.48105 * (speed_ms ** 2) 
                      - 1.13918 * isElite;
  return metabolicCost;
}

// percetnage increase in metabolci cost, works for calm air or elatiev ariflow
function calcAirPct(v_relative, relative_angle_deg) {
  // RElative angle is the angle, in RADIANS, of the drag force in relative airflow. NOT same as "angle" which is input wind angle

  // inc ase of calm air, v_relative is just input_m_s
  const relative_angle_rad = relative_angle_deg * (Math.PI / 180);

  // Avoids a divide-by-zero / NaN path when there is no relative airflow
  if (!(v_relative > 1e-9)) return 0;

  // get drag force for TOTAL airflow
  const dragForceTotal = calcDragForce(v_relative)
  // now get forward component of drag force
  const dragForceFwd = dragForceTotal*Math.sin(relative_angle_rad)

  // console.log(`Drag force total: ${dragForceTotal.toFixed(1)}`)
  // console.log(`Drag force fwd: ${dragForceFwd.toFixed(1)}`)
  // console.log(`Input relative angle: ${relative_angle_deg.toFixed(1)}`)


  // need for BW norm
  const bodyWeightNewtons = runner_weight_kg * GRAVITY;
  const air_pct = dragForceFwd/bodyWeightNewtons*DA_SILVA_SLOPE
  // Ok note how we neglect the lateral component here.

  // air pct is a FLOAT percentage, i.e. 0.03 for 3% increase. 
  // so you need to do treadmill_cost*(1 + air_pct) for correct calculations
  
  //this DIFFERS from R implementaiton in that I cancel the 100 implicitly

  return air_pct;
}



// This is "the" drag equation
function calcDragForce(relativeV) {  

  // Also, POSITIVE FORCE IS DEFINED AS OPPOSING the runner
  
  // Calculate the sign of relative velocity
  const pm_sign = Math.sign(relativeV);
  
  // Calculate drag force using the drag equation
  const dragForce = pm_sign * 0.5 * AIR_DENSITY * (relativeV ** 2) * DRAG_COEFFICIENT * runner_Ap;  
  return dragForce;
}


function calcCalmAirTotalMetCost(speed_ms){
  // Caculate metabolic cost of running overground in CALM AIR, in W/kg.
  // sub-functions access runner body weight in kg (in global scope).
  // operates on SCALARS. use map() to map to vecs

  const treadmill_cost = calcTreadMetCost(speed_ms, IS_ELITE)
  const air_pct = calcAirPct(speed_ms, 90) // 90 for straight forward airflow
  const calm_air_total_met_cost = treadmill_cost*(1+air_pct)
  return calm_air_total_met_cost
}

function doWindCalcs(){
  // Drag equation updaets

  if (!Number.isFinite(input_m_s) || input_m_s <= 0) {
    // 0:00 pace reads as an infinite speed, 0.0 mph as zero: neither is a runnable input
    output_speed_ms = NaN
  } else if (effort_mode){
    // input_m_s is our calm-air effort

    // (1) Calcualte calm air effort (a scalar!)

    const calm_air_total_met_cost = calcCalmAirTotalMetCost(input_m_s)
    // (2) generate lookup table for met cost at different actual speeds, including whatever wind we have
    const v_grid = makeGrid(0,GRID_MAX_M_S,GRID_STEP)

    ///  PROBELM - this is not correct for angles

    // v_relative is actually magniutde of <true_wind_lat_comp, v + true_wind_fwd_comp>  then youj have to take cos(angle)*Fdrag(vrel) to get force

    // I think we can still call getDragForce and just intercept the call to calcAirPct? ohoh shoot. Maybem odify acalcAirPct to do angle? 


    // NEW CORRECT CALCS...

    //At differenta ctual speeds, there are different relative airflows
    const v_relative_grid = v_grid.map(v => getVectorMag(true_wind_lat_comp, v + true_wind_fwd_comp))
    // Now we need a grid of the true angles!
    const relative_angle_grid_deg = v_grid.map(v => getRelativeWindAngle(true_wind_lat_comp, v + true_wind_fwd_comp))
    const air_pct_grid = v_relative_grid.map((v, index) => calcAirPct(v, relative_angle_grid_deg[index]))
    // want to do calcAirPct()


    //const air_pct_actual = calcAirPct(V_relative, relative_angle_deg)

    // for each v, we want to do...
    // get vector mag of (true_lat, true_fwd + v

    // relative_angle = getRelativeWindAngle(true_wind_lat_comp, true_wind_fwd_comp + input_m_s)
    
    const treadmill_cost_grid = v_grid.map(v => calcTreadMetCost(v, IS_ELITE))

    // elementiwse, do treadmill_cost*(1+air_pct) to get the metabolic cost in calm air at each point on the grid
    const total_cost_grid = treadmill_cost_grid.map((treadmillCost, index) => {
      const airPct = air_pct_grid[index];
      return treadmillCost * (1 + airPct);
    });
    // Now we have our grid of total metabolic cost at different overground speeds!

    // (3) Find the speed in total_cost_grid that produces a metabolic cost closest to calm_air_total_met_cost
    const eq_speed_in_wind = lookupSpeedFromCost(calm_air_total_met_cost, v_grid, total_cost_grid)
    output_speed_ms = eq_speed_in_wind
    
  
  } else {
    // (else we are in pace mode, not effort mode)

    // 1) make calm air metabolic cost lookup table, using grid of v avalues
    //      ie calc drag forces when v_relative = - v_runner, so calm air outdoors

    const v_grid = makeGrid(0,GRID_MAX_M_S,GRID_STEP)
    const C_calm_grid = v_grid.map(v => calcCalmAirTotalMetCost(v));

    

    // Lookup table of metabolic costs (W/kg) of running at a given speed overground in calm air


    // Find metabolic cost of running (treadmill and also relative-wind cost) at true_wind_fwd_comp
    // console.log(`True forward component of wind: ${true_wind_fwd_comp.toFixed(2)} m/s`)
    // console.log(`True runner velocity: ${input_m_s.toFixed(2)} m/s`)

    // this part will not be same for effort mode
    const cost_actual_treadmill = calcTreadMetCost(input_m_s, IS_ELITE)

    // Correct! 
    const V_relative = getVectorMag(true_wind_lat_comp, true_wind_fwd_comp + input_m_s)
    // console.log(`Correct V relative of airflow is ${V_relative.toFixed(2)}`)
    // console.log(`Input wind speed is ${true_wind_ms.toFixed(2)}`)

    const relative_angle_deg = getRelativeWindAngle(true_wind_lat_comp, true_wind_fwd_comp + input_m_s)
    // console.log(`Input wind angle is ${angle.toFixed(1)}`)
    // console.log(`Relative V angle is ${relative_angle_deg.toFixed(1)}`)

    // Now... use Fd sin (relative_angle) to get Fd fwd comp


    //const V_relative = input_m_s + true_wind_fwd_comp // <-- NOT CORRECT
    // console.log(`V_relative is: ${V_relative.toFixed(2)} m/s`)
    // console.log(`Treadmill cost at ${input_m_s.toFixed(2)} m/s is ${cost_actual_treadmill.toFixed(2)} W/kg`)

    // ALSO PROBLEM - need to fix so we use correct v_relative

    const air_pct_actual = calcAirPct(V_relative, relative_angle_deg)


    const total_cost_w_kg = cost_actual_treadmill*(1+air_pct_actual)
    // console.log(`Total metabolic cost at ${input_m_s.toFixed(2)} m/s in ${true_wind_fwd_comp.toFixed(2)} m/s true fwd wind is ${total_cost_w_kg.toFixed(2)} W/kg`)

    // 3) Look up closest metabolic cost in calm air grid for total_cost_w_kg
    const calm_air_equiv_speed = lookupSpeedFromCost(total_cost_w_kg, v_grid, C_calm_grid)
    // console.log(`Calm air equivalent of ${input_m_s.toFixed(2)} m/s in ${true_wind_fwd_comp.toFixed(2)} m/s true fwd is ${calm_air_equiv_speed.toFixed(2)} m/s`)
    output_speed_ms = calm_air_equiv_speed
  }
}


function getVectorMag(x_comp, y_comp){
  const v_mag = Math.sqrt(x_comp**2 + y_comp**2)
  // console.log(v_mag.toFixed(2))
  return v_mag
}

function getRelativeWindAngle(x_comp, y_comp){
  // No airflow at all (calm air, v = 0 on the grid): the angle is undefined and
  // atan(0/0) would poison the whole cost grid with NaN. Any angle works since
  // the drag force is zero, so return 0.
  if (Math.abs(x_comp) < 1e-9 && Math.abs(y_comp) < 1e-9) return 0
  const rel_angle_rad = Math.atan(y_comp / Math.abs(x_comp))
  // Note the absolute value here, VERY important to preserve sign of y comp only

  // return in DEGREES
  return rel_angle_rad*(180 / Math.PI)

}


// Lookup function
// Given a grid of speeds speed_grid, and a metaboic cost in W/kg at each speed cost_grid,
// return the speed whose metabolic cost most closely matches cost_query
function lookupSpeedFromCost(cost_query, speed_grid, cost_grid) {
  let f_x;

  // Check if x is outside the range of speed_m_s
  if (cost_query < cost_grid[0] || cost_query > cost_grid[cost_grid.length - 1]) {
      //throw new Error('x is outside of the range of the speed_m_s column');
      console.log('Cost query is outside range of the grid!')
      f_x = NaN;
  } else {
      // Find the indices that x falls between
      let i = 0;
      for (; i < cost_grid.length - 1; i++) {
          if (cost_query >= cost_grid[i] && cost_query <= cost_grid[i + 1]) {
              break;
          }
      }
      // Linear interpolation
      // y = y0 + (y1 - y0) * ((x - x0) / (x1 - x0))
      f_x = speed_grid[i] + (speed_grid[i + 1] - speed_grid[i]) * ((cost_query - cost_grid[i]) / (cost_grid[i + 1] - cost_grid[i]));
      // f(x) approximation
  }
  return f_x;
}


// Wind profiel adjustments

// Function to calculate wind velocity at a specific height using the power law
function windProfilePowerLaw(vRef, alpha) {
  // vRef: reference wind velocity in m/s
  // z: height above ground of desired wind velocity, in meters
  // zRef: height above ground of reference wind velocity, in meters
  // alpha: power law exponent, typically 0.11 - 0.40 (higher for more urban areas)
  
  const vZ = vRef * (CHEST_HEIGHT / WIND_REFERENCE_HEIGHT)**alpha;
  return vZ;
}

// Behaves same as seq(start_val, end_val, by = grid_step) in R
function makeGrid(start_val, end_val, grid_step) {
  const length = Math.floor((end_val - start_val) / grid_step) + 1; // Adjusted to use Math.floor
  const grid = Array.from({length: length}, (_, i) => parseFloat((start_val + i * grid_step).toFixed(10)));
  return grid;
}



// COOKIE - dont' be annoying

// Configuration
const COOKIE_DURATION_DAYS = 30;

// Cookie helper functions
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let c = cookies[i].trim();
        if (c.indexOf(nameEQ) === 0) {
            return c.substring(nameEQ.length, c.length);
        }
    }
    return null;
}

// Banner functionality
document.addEventListener('DOMContentLoaded', function() {
    const banner = document.querySelector('.mee-banner');
    const closeButton = document.getElementById('mee-banner-close');
    
    // Check if user has previously closed the banner
    if (getCookie('meeBannerClosed') !== 'true') {
        banner.classList.remove('hidden');
    }
    
    // Handle close button click
    closeButton.addEventListener('click', function() {
        banner.classList.add('hidden');
        setCookie('meeBannerClosed', 'true', COOKIE_DURATION_DAYS);
    });
});



// --- State persistence (shared localStorage layer, rw-storage.js) ---
// Every recompute writes the current inputs to localStorage under
// rw.wind-calculator.v1; on load the record is validated and replayed through
// the normal setter functions, so the DOM and the globals stay in sync.
// Restore defaults drops the record and replays DEFAULT_STATE.

const APP_ID = 'wind-calculator';   // localStorage key rw.wind-calculator.v1
let remember_settings = true;

const DEFAULT_STATE = {
    version: 1,
    pace_input: { min: 7, sec_2: 0, sec_1: 0 },
    speed_input: { whole: 6, decimal: 0 },
    pace_button: '/mi',
    effort_mode: false,
    wind_val: 5,
    wind_units: 'mph',
    wind_angle: 0,
    alpha_profile: 'profile-suburbs',
    weight: { lbs: 150, kg: 68, st: 10, st_lb: 10 },
    weight_units: 'usa'
};

function getStateObject() {
    const active_pace = document.querySelector('.pace-toggle.active');
    const active_wind = document.querySelector('.wind-toggle.active');
    const active_profile = document.querySelector('.profile-toggle.active');
    const active_weight_units = document.querySelector('.metric-toggle.active');
    return {
        version: 1,
        pace_input: {
            min: parseInt(d1.textContent),
            sec_2: parseInt(d2.textContent),
            sec_1: parseInt(d3.textContent)
        },
        speed_input: {
            whole: parseInt(s1.textContent),
            decimal: parseInt(s2.textContent)
        },
        pace_button: active_pace ? active_pace.textContent.trim() : DEFAULT_STATE.pace_button,
        effort_mode: effort_mode,
        wind_val: wind_val,
        wind_units: active_wind ? active_wind.textContent.trim() : wind_units.textContent,
        wind_angle: angle,
        alpha_profile: active_profile ? active_profile.id : DEFAULT_STATE.alpha_profile,
        weight: {
            lbs: clampNum(weightLbsInput.value, 30, 999, DEFAULT_STATE.weight.lbs),
            kg: clampNum(weightKgInput.value, 15, 500, DEFAULT_STATE.weight.kg),
            st: clampNum(weightStInput.value, 3, 80, DEFAULT_STATE.weight.st),
            st_lb: clampNum(weightStLbInput.value, 0, 13, DEFAULT_STATE.weight.st_lb)
        },
        weight_units: active_weight_units ? active_weight_units.textContent.trim() : DEFAULT_STATE.weight_units
    };
}

function saveState() {
    try {
        RWStorage.save(APP_ID, getStateObject(), remember_settings);
    } catch (e) {
        // silently fail
    }
}

function loadSavedState() {
    // Shared localStorage layer (rw-storage.js). This app never used a cookie
    // for its inputs, so there is nothing to migrate.
    const saved = RWStorage.load(APP_ID);
    remember_settings = saved.remember;
    const remember_toggle_el = document.getElementById('remember-toggle');
    if (remember_toggle_el) remember_toggle_el.checked = remember_settings;
    if (!saved.state) return null;
    try {
        const state = saved.state;
        // Version check for future migrations
        if (!state || state.version !== 1) return null;
        // localStorage is user-editable, so check the shape before applyState() trusts it
        if (!state.pace_input || typeof state.pace_input !== 'object') return null;
        if (!state.speed_input || typeof state.speed_input !== 'object') return null;
        if (!state.weight || typeof state.weight !== 'object') return null;
        return state;
    } catch (e) {
        return null;
    }
}

const clampInt = (x, lo, hi, fallback) => {
    const v = parseInt(x);
    return Number.isFinite(v) ? Math.min(Math.max(v, lo), hi) : fallback;
}

const clampNum = (x, lo, hi, fallback) => {
    const v = parseFloat(x);
    return Number.isFinite(v) ? Math.min(Math.max(v, lo), hi) : fallback;
}

// Activate the button in a group whose label matches `text`, routing through the
// group's setter so dependent labels stay in sync. Returns false if no match.
function activateButtonByText(buttons, text, setter) {
    let matched = null;
    buttons.forEach(btn => { if (btn.textContent.trim() === text) matched = btn; });
    if (!matched) return false;
    buttons.forEach(btn => btn.classList.remove('active'));
    matched.classList.add('active');
    if (setter) setter(matched);
    return true;
}

// Same, but matched on the button id (the wind-profile buttons have icon markup
// inside them, so their text is not a stable key).
function activateButtonById(buttons, id, setter) {
    let matched = null;
    buttons.forEach(btn => { if (btn.id === id) matched = btn; });
    if (!matched) return false;
    buttons.forEach(btn => btn.classList.remove('active'));
    matched.classList.add('active');
    if (setter) setter(matched);
    return true;
}

function applyState(state) {
    const d = DEFAULT_STATE;
    const pace_in = (state && state.pace_input) || d.pace_input;
    const speed_in = (state && state.speed_input) || d.speed_input;
    const weight_in = (state && state.weight) || d.weight;

    // 1. Pace and speed dials, clamped in case of a stale or hand-edited record
    d1.textContent = clampInt(pace_in.min, 0, 60, d.pace_input.min);
    d2.textContent = clampInt(pace_in.sec_2, 0, 5, d.pace_input.sec_2);
    d3.textContent = clampInt(pace_in.sec_1, 0, 9, d.pace_input.sec_1);
    s1.textContent = clampInt(speed_in.whole, 0, 60, d.speed_input.whole);
    s2.textContent = clampInt(speed_in.decimal, 0, 9, d.speed_input.decimal);

    // 2. Runner weight (advanced panel), then the weight units, which reveals
    //    the matching box and sets units_mode
    weightLbsInput.value = clampNum(weight_in.lbs, 30, 999, d.weight.lbs);
    weightKgInput.value = clampNum(weight_in.kg, 15, 500, d.weight.kg);
    weightStInput.value = clampNum(weight_in.st, 3, 80, d.weight.st);
    weightStLbInput.value = clampNum(weight_in.st_lb, 0, 13, d.weight.st_lb);
    if (!activateButtonByText(imp_metric_buttons, state && state.weight_units, setWeightUnits)) {
        activateButtonByText(imp_metric_buttons, d.weight_units, setWeightUnits);
    }
    // "For a typical runner" vs "Custom runner" caption (reads units_mode + weight)
    updateRunnerLabel();

    // 3. Input units: picks pace-vs-speed dials, the unit labels, and the output units
    if (!activateButtonByText(pace_buttons, state && state.pace_button, setPaceText)) {
        activateButtonByText(pace_buttons, d.pace_button, setPaceText);
    }

    // 4. Pace-vs-effort switch
    effortToggle.checked = !(state && state.effort_mode === true);
    setEffortFromToggle();

    // 5. Wind speed and units. Set directly rather than through setWindUnits(),
    //    which rounds the value as a side effect of switching units.
    if (!activateButtonByText(output_buttons, state && state.wind_units, null)) {
        activateButtonByText(output_buttons, d.wind_units, null);
    }
    wind_units.textContent = document.querySelector('.wind-toggle.active').textContent.trim();
    wind_val = clampNum(state && state.wind_val, 0, 50, d.wind_val);
    if (wind_units.textContent == "m/s") {
        wind_text.textContent = wind_val.toFixed(1);
    } else {
        wind_val = Math.round(wind_val);
        wind_text.textContent = wind_val.toFixed(0);
    }
    updateWindStepTitles();

    // 6. Wind profile (sets alpha_exp)
    if (!activateButtonById(profile_buttons, state && state.alpha_profile, setWindProfile)) {
        activateButtonById(profile_buttons, d.alpha_profile, setWindProfile);
    }

    // 7. Compass angle last: updateDial() redraws the arrow, refreshes the
    //    headwind/tailwind label, and recomputes (which re-saves)
    const saved_angle = parseFloat(state && state.wind_angle);
    angle = Number.isFinite(saved_angle) ? ((saved_angle % 360) + 360) % 360 : d.wind_angle;
    updateDial();
}

// --- Reset button ---
document.getElementById('reset-button').addEventListener('click', () => {
    RWStorage.clear(APP_ID);
    applyState(DEFAULT_STATE);
});

// --- Remember-settings toggle ---
const remember_toggle = document.getElementById('remember-toggle');
remember_toggle.addEventListener('change', () => {
    remember_settings = remember_toggle.checked;
    saveState();  // with the flag off this drops the stored state and keeps only the preference
});

// --- Initialize (must be after all declarations) ---
const savedState = loadSavedState();
try {
    applyState(savedState || DEFAULT_STATE);
} catch (e) {
    // A malformed saved state must not break the page; fall back to the defaults
    RWStorage.clear(APP_ID);
    applyState(DEFAULT_STATE);
}
updateWindStepTitles(); // keep the tooltips in step with the unit even on a fresh load
