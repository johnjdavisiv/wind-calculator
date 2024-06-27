console.log("script loaded")




// Hmmm


// define positive as a headwind, since it will be most common use case
let wind_speed_m_s = 2.0  
let runner_speed_m_s = 5.0 //5:20 per mile
let runner_weight_kg = 70 // default body weight - TODO: CHANGE TO JDX MEAN!

const GRAVITY = 9.80665 // ISA gravity standard
const DRAG_COEFFICIENT = 0.8 //for now, can check against refs in notes in Schickenhofer et al 202x
const AIR_DENSITY = 1.225 // kg/m^2, ISA air density at 15 C at sea level
const AP_RATIO = 0.266 // percent of body surface area that is forward-facing, Ap = AP_RATIO*BSA
// Reference: Pugh 1970, admittedly from only 9 young athletic males



// TODO: RE-export a new Black Gam for elites that also includes a calm air met power column
// currently this is met power on treadmill

// Data from Black et al 2018 (using elites I am pretty sure)
const blackGam = {
    "speed_m_s": [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1, 1.05, 1.1, 1.15, 1.2, 1.25, 1.3, 1.35, 1.4, 1.45, 1.5, 1.55, 1.6, 1.65, 1.7, 1.75, 1.8, 1.85, 1.9, 1.95, 2, 2.05, 2.1, 2.15, 2.2, 2.25, 2.3, 2.35, 2.4, 2.45, 2.5, 2.55, 2.6, 2.65, 2.7, 2.75, 2.8, 2.85, 2.9, 2.95, 3, 3.05, 3.1, 3.15, 3.2, 3.25, 3.3, 3.35, 3.4, 3.45, 3.5, 3.55, 3.6, 3.65, 3.7, 3.75, 3.8, 3.85, 3.9, 3.95, 4, 4.05, 4.1, 4.15, 4.2, 4.25, 4.3, 4.35, 4.4, 4.45, 4.5, 4.55, 4.6, 4.65, 4.7, 4.75, 4.8, 4.85, 4.9, 4.95, 5, 5.05, 5.1, 5.15, 5.2, 5.25, 5.3, 5.35, 5.4, 5.45, 5.5, 5.55, 5.6, 5.65, 5.7, 5.75, 5.8, 5.85, 5.9, 5.95, 6, 6.05, 6.1, 6.15, 6.2, 6.25, 6.3, 6.35, 6.4, 6.45, 6.5, 6.55, 6.6, 6.65, 6.7, 6.75, 6.8, 6.85, 6.9, 6.95, 7, 7.05, 7.1, 7.15, 7.2, 7.25, 7.3, 7.35, 7.4, 7.45, 7.5, 7.55, 7.6, 7.65, 7.7, 7.75, 7.8, 7.85, 7.9, 7.95, 8, 8.05, 8.1, 8.15, 8.2, 8.25, 8.3, 8.35, 8.4, 8.45, 8.5, 8.55, 8.6, 8.65, 8.7, 8.75, 8.8, 8.85, 8.9, 8.95, 9, 9.05, 9.1, 9.15, 9.2, 9.25, 9.3, 9.35, 9.4, 9.45, 9.5, 9.55, 9.6, 9.65, 9.7, 9.75, 9.8, 9.85, 9.9, 9.95, 10],
    "energy_j_kg_m": [6.0976, 6.0592, 6.0208, 5.9824, 5.944, 5.9056, 5.8672, 5.8289, 5.7905, 5.7521, 5.7137, 5.6753, 5.6369, 5.5985, 5.5601, 5.5217, 5.4833, 5.4449, 5.4066, 5.3682, 5.3298, 5.2914, 5.253, 5.2146, 5.1762, 5.1378, 5.0994, 5.061, 5.0227, 4.9843, 4.9459, 4.9075, 4.8691, 4.8307, 4.7923, 4.7539, 4.7155, 4.6771, 4.6387, 4.6004, 4.562, 4.5236, 4.4852, 4.4468, 4.4084, 4.37, 4.3317, 4.2936, 4.2559, 4.2187, 4.1821, 4.1463, 4.1115, 4.0777, 4.0451, 4.0139, 3.9841, 3.956, 3.9297, 3.9053, 3.883, 3.8628, 3.845, 3.8294, 3.816, 3.8046, 3.795, 3.7872, 3.7811, 3.7764, 3.7732, 3.7713, 3.7704, 3.7707, 3.7718, 3.7737, 3.7763, 3.7794, 3.783, 3.7868, 3.791, 3.7955, 3.8002, 3.8051, 3.8103, 3.8157, 3.8213, 3.827, 3.8329, 3.8389, 3.845, 3.8512, 3.8575, 3.8638, 3.8701, 3.8765, 3.8828, 3.8892, 3.8955, 3.9019, 3.9082, 3.9146, 3.9209, 3.9273, 3.9336, 3.94, 3.9463, 3.9527, 3.959, 3.9654, 3.9717, 3.9781, 3.9844, 3.9908, 3.9971, 4.0035, 4.0098, 4.0162, 4.0225, 4.0289, 4.0352, 4.0416, 4.0479, 4.0543, 4.0606, 4.067, 4.0733, 4.0797, 4.086, 4.0924, 4.0987, 4.1051, 4.1114, 4.1178, 4.1241, 4.1305, 4.1368, 4.1432, 4.1495, 4.1559, 4.1622, 4.1686, 4.1749, 4.1813, 4.1876, 4.194, 4.2003, 4.2067, 4.213, 4.2194, 4.2257, 4.2321, 4.2384, 4.2448, 4.2511, 4.2575, 4.2638, 4.2702, 4.2765, 4.2829, 4.2892, 4.2956, 4.3019, 4.3083, 4.3146, 4.321, 4.3273, 4.3337, 4.34, 4.3464, 4.3527, 4.3591, 4.3654, 4.3718, 4.3781, 4.3845, 4.3908, 4.3972, 4.4035, 4.4099, 4.4162, 4.4226, 4.4289, 4.4353, 4.4416, 4.448, 4.4543, 4.4607, 4.467, 4.4734, 4.4797, 4.4861, 4.4924, 4.4988, 4.5051, 4.5115, 4.5178, 4.5242, 4.5305, 4.5369, 4.5432],
    "energy_j_kg_s": [0, 0.303, 0.6021, 0.8974, 1.1888, 1.4764, 1.7602, 2.0401, 2.3162, 2.5884, 2.8568, 3.1214, 3.3821, 3.639, 3.8921, 4.1413, 4.3867, 4.6282, 4.8659, 5.0998, 5.3298, 5.556, 5.7783, 5.9968, 6.2115, 6.4223, 6.6293, 6.8324, 7.0317, 7.2272, 7.4188, 7.6066, 7.7905, 7.9707, 8.1469, 8.3194, 8.488, 8.6527, 8.8136, 8.9707, 9.1239, 9.2733, 9.4189, 9.5606, 9.6985, 9.8325, 9.9629, 10.09, 10.2142, 10.3358, 10.4553, 10.5731, 10.6898, 10.8058, 10.9217, 11.0381, 11.1556, 11.2747, 11.3962, 11.5207, 11.6489, 11.7817, 11.9196, 12.0628, 12.2112, 12.3648, 12.5235, 12.6872, 12.8557, 13.0287, 13.2062, 13.388, 13.5736, 13.763, 13.9557, 14.1515, 14.3499, 14.5508, 14.7536, 14.958, 15.1641, 15.3717, 15.5808, 15.7914, 16.0034, 16.2168, 16.4315, 16.6475, 16.8647, 17.0831, 17.3026, 17.523, 17.7444, 17.9666, 18.1896, 18.4133, 18.6376, 18.8625, 19.0881, 19.3143, 19.5411, 19.7686, 19.9967, 20.2255, 20.4549, 20.6849, 20.9155, 21.1468, 21.3788, 21.6113, 21.8445, 22.0783, 22.3128, 22.5479, 22.7837, 23.02, 23.257, 23.4947, 23.7329, 23.9719, 24.2114, 24.4516, 24.6924, 24.9338, 25.1759, 25.4186, 25.662, 25.906, 26.1506, 26.3959, 26.6418, 26.8883, 27.1355, 27.3833, 27.6317, 27.8808, 28.1305, 28.3808, 28.6318, 28.8834, 29.1357, 29.3885, 29.6421, 29.8962, 30.151, 30.4064, 30.6625, 30.9192, 31.1765, 31.4344, 31.693, 31.9523, 32.2121, 32.4726, 32.7338, 32.9955, 33.2579, 33.521, 33.7847, 34.049, 34.3139, 34.5795, 34.8457, 35.1126, 35.3801, 35.6482, 35.9169, 36.1863, 36.4563, 36.727, 36.9983, 37.2702, 37.5428, 37.816, 38.0898, 38.3643, 38.6394, 38.9152, 39.1915, 39.4685, 39.7462, 40.0245, 40.3034, 40.5829, 40.8631, 41.1439, 41.4254, 41.7075, 41.9902, 42.2736, 42.5576, 42.8422, 43.1275, 43.4134, 43.6999, 43.9871, 44.2749, 44.5633, 44.8524, 45.1421, 45.4325]
  }





// So, workflow:

// Effort mode: Know effort, want to know actual pace

// Given wind speed, runner's effort as calm-air equivalent

// metabolic cost in calm air = blackGam(effort_speed) + deltaCost(effort_speed) 













function getBodySurfaceArea(weight_kg) {
    // get body surface area in m**2 from weight in kg
    // Valid for weight from 10 to 250 kg
    // Reference: Livingston and Lee 2001, validated on N of over 400
    return 0.1173*weight_kg**0.6466
}


function getAp(bsa){
    // get projected frontal area, in m**2, from body surface area and Pugh's A_p ratio
    return AP_RATIO*bsa
}

function calcDragForce(relative_v, runner_Ap){
    // get drag force, in Newtons, using drag equation
    // relative v is runner's speed relative to the air! Not the windspeed necessarily!
    //       (units are m/s)
    // runner_Ap is projected frontal area in m**2
    return 0.5*AIR_DENSITY*(relative_v**2)*DRAG_COEFFICIENT*runner_Ap
}


function calcDeltaMetPower(drag_force, bw_kg){
    //Calculate change in metabolic power of a given drag force
    ERROR WRONG!!! doe snot accoutn for gravity in bw
    let delta_met_power_pct = 6.13*(drag_force/(bw_kg*GRAVITY))
    // This is a percentage as a decimal, e.g. a 1 N force for 100 N 
    // Specifically, percentage chagne in metabolci power in W/kg (I think? - check Da Silva 2022)

    // TODO: Figure out what to do for negatiev drag forces! 
    //Check against Krams earlier work on assistive forces
}


// Later: make calcDeltaMetUncertainty by getting SD of the slopes from Figure 4 in Da Silva 2022
// Thenc an return the 90% Pred Interval for teh delta in met cost






// Lookup table stuff for Black et al 2018 data


// Get f(x_speed) for either J/kg/m or J/kg/s (=W/kg) in Black data
// which is flat running data from ~2.2-4.7 m/s
function lookupSpeed(x, col_name) {
    // col anme is energy_j_kg_m or energy_j_kg_s aka W/kg
    const speed = blackGam.speed_m_s
    const energy = blackGam[col_name]
    let f_x;
    // Check if x is outside the range of speed_m_s
    if (x < speed[0] || x > speed[speed.length - 1]) {
        throw new Error('x is outside of the range of the speed_m_s column');
        f_x = NaN;
    } else {
        // Find the indices that x falls between
        let i = 0;
        for (; i < speed.length - 1; i++) {
            if (x >= speed[i] && x <= speed[i + 1]) {
                break;
            }
        }
        // Linear interpolation
        // y = y0 + (y1 - y0) * ((x - x0) / (x1 - x0))
        f_x = energy[i] + (energy[i + 1] - energy[i]) * ((x - speed[i]) / (speed[i + 1] - speed[i]));
        // f(x) approximation
    }
    return f_x;
 }


  // Use blackGam to find what flat-ground speed has the metabolic power closest to a given metabolic power
function getEquivFlatSpeed(W_kg) {
    // Works!!
    let eq_speed;
    const speed = blackGam.speed_m_s;
    const met_power = blackGam['energy_j_kg_s'];
    // Check if x is outside the range of speed_m_s
    if (W_kg < met_power[0] || W_kg > met_power[met_power.length - 1]) {
        throw new Error('W_kg is outside of the range of the energy_kg_s');
        eq_speed = NaN;
    } else {
        // Luckily, W_kg as fxn of speed is monotonic! So we can start slow and go up
        // Find the met power that input W_kg falls between
        let i = 0;
        for (; i < met_power.length - 1; i++) {
            if (W_kg >= met_power[i] && W_kg <= met_power[i + 1]) {
                break;
            }
        }
        // Linear interpolation
        // y = y0 + (y1 - y0) * ((x - x0) / (x1 - x0))
        eq_speed = speed[i] + (speed[i + 1] - speed[i]) * ((W_kg - met_power[i]) / (met_power[i + 1] - met_power[i]));
        // f(x) approximation
    }
    return eq_speed;
}